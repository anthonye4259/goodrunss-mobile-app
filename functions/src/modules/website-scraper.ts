import * as functions from "firebase-functions"

// ============================================================================
// WEBSITE SCRAPER — Extract business info from a URL for onboarding
// Runs server-side to bypass CORS restrictions
// ============================================================================

// Simple HTML entity decoder
const decodeEntities = (str: string): string =>
    str.replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'")
        .replace(/&#x27;/g, "'")
        .replace(/&#x2F;/g, "/")
        .replace(/&nbsp;/g, " ")

// Extract text content between tags
const extractTagContent = (html: string, tag: string): string | null => {
    const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i")
    const match = html.match(regex)
    return match ? decodeEntities(match[1].trim()) : null
}

// Extract meta tag content
const extractMeta = (html: string, nameOrProp: string): string | null => {
    let regex = new RegExp(`<meta[^>]+(?:name|property)=["']${nameOrProp}["'][^>]+content=["']([^"']+)["']`, "i")
    let match = html.match(regex)
    if (match) return decodeEntities(match[1].trim())

    // content before name (some sites)
    regex = new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:name|property)=["']${nameOrProp}["']`, "i")
    match = html.match(regex)
    return match ? decodeEntities(match[1].trim()) : null
}

// Extract colors from CSS / meta
const extractColors = (html: string): string[] => {
    const colors: string[] = []

    const themeColor = extractMeta(html, "theme-color")
    if (themeColor && /^#[0-9a-fA-F]{3,8}$/.test(themeColor)) colors.push(themeColor)

    const cssVarRegex = /--(?:primary|brand|main|accent|theme)[^:]*:\s*(#[0-9a-fA-F]{3,8})/gi
    let match
    while ((match = cssVarRegex.exec(html)) !== null) {
        if (!colors.includes(match[1])) colors.push(match[1])
    }

    const headerStyleRegex = /(?:header|nav|hero|banner)[^{]*\{[^}]*(?:background(?:-color)?)\s*:\s*(#[0-9a-fA-F]{3,8})/gi
    while ((match = headerStyleRegex.exec(html)) !== null) {
        if (!colors.includes(match[1])) colors.push(match[1])
    }

    return colors.slice(0, 5)
}

// Extract social links
const extractSocialLinks = (html: string): Record<string, string> => {
    const social: Record<string, string> = {}

    const patterns: Record<string, RegExp> = {
        instagram: /href=["'](https?:\/\/(?:www\.)?instagram\.com\/[^"'\s]+)["']/i,
        facebook: /href=["'](https?:\/\/(?:www\.)?facebook\.com\/[^"'\s]+)["']/i,
        tiktok: /href=["'](https?:\/\/(?:www\.)?tiktok\.com\/@[^"'\s]+)["']/i,
        twitter: /href=["'](https?:\/\/(?:www\.)?(?:twitter|x)\.com\/[^"'\s]+)["']/i,
        youtube: /href=["'](https?:\/\/(?:www\.)?youtube\.com\/[^"'\s]+)["']/i,
    }

    for (const [platform, regex] of Object.entries(patterns)) {
        const match = html.match(regex)
        if (match) social[platform] = match[1]
    }

    return social
}

// Extract logo URL
const extractLogo = (html: string, baseUrl: string): string | null => {
    const ogImage = extractMeta(html, "og:image")
    if (ogImage) return ogImage.startsWith("http") ? ogImage : `${baseUrl}${ogImage.startsWith("/") ? "" : "/"}${ogImage}`

    const touchIconMatch = html.match(/<link[^>]+rel=["']apple-touch-icon["'][^>]+href=["']([^"']+)["']/i)
    if (touchIconMatch) {
        const href = touchIconMatch[1]
        return href.startsWith("http") ? href : `${baseUrl}${href.startsWith("/") ? "" : "/"}${href}`
    }

    return null
}

// Extract phone
const extractPhone = (html: string): string | null => {
    const telMatch = html.match(/href=["']tel:([^"']+)["']/i)
    if (telMatch) return telMatch[1]
    return null
}

// Extract address
const extractAddress = (html: string): string | null => {
    const streetMatch = html.match(/"streetAddress"\s*:\s*"([^"]+)"/)
    if (streetMatch) {
        let address = streetMatch[1]
        const cityMatch = html.match(/"addressLocality"\s*:\s*"([^"]+)"/)
        const stateMatch = html.match(/"addressRegion"\s*:\s*"([^"]+)"/)
        if (cityMatch) address += `, ${cityMatch[1]}`
        if (stateMatch) address += `, ${stateMatch[1]}`
        return address
    }

    const addressTag = extractTagContent(html, "address")
    if (addressTag) {
        return addressTag.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 200)
    }

    return null
}

// Detect business type
const detectBusinessType = (text: string): string => {
    const lower = text.toLowerCase()
    const typeKeywords: Record<string, string[]> = {
        yoga: ["yoga", "vinyasa", "ashtanga", "hot yoga", "bikram"],
        pilates: ["pilates", "reformer"],
        crossfit: ["crossfit", "wod", "functional fitness"],
        boxing: ["boxing", "kickboxing", "mma", "muay thai", "martial arts"],
        cycling: ["cycling", "spin", "indoor cycling"],
        dance: ["dance", "barre", "zumba", "ballet"],
        wellness: ["wellness", "spa", "holistic", "acupuncture"],
        meditation: ["meditation", "breathwork", "mindfulness"],
        personal: ["personal training", "personal trainer", "1:1 training"],
        fitness: ["gym", "fitness", "workout", "training", "strength"],
        salon: ["salon", "hair", "beauty", "nail", "barber"],
        music: ["music", "lessons", "guitar", "piano"],
        tutoring: ["tutor", "tutoring", "academic", "education"],
    }

    for (const [type, keywords] of Object.entries(typeKeywords)) {
        if (keywords.some(kw => lower.includes(kw))) return type
    }
    return "other"
}

/**
 * scrapeWebsite — HTTP Cloud Function
 * POST with { url: "https://example.com" }
 */
export const scrapeWebsite = functions
    .runWith({ timeoutSeconds: 15, memory: "256MB" })
    .https.onRequest(async (req, res) => {
        // CORS
        res.set("Access-Control-Allow-Origin", "*")
        res.set("Access-Control-Allow-Methods", "POST, OPTIONS")
        res.set("Access-Control-Allow-Headers", "Content-Type")
        if (req.method === "OPTIONS") { res.status(204).send(""); return }
        if (req.method !== "POST") { res.status(405).json({ error: "Method not allowed" }); return }

        try {
            const { url } = req.body
            if (!url || typeof url !== "string") {
                res.status(400).json({ error: "URL is required" })
                return
            }

            let normalizedUrl = url.trim()
            if (!normalizedUrl.startsWith("http")) normalizedUrl = `https://${normalizedUrl}`

            try { new URL(normalizedUrl) } catch {
                res.status(400).json({ error: "Invalid URL format" })
                return
            }

            // Fetch with timeout
            const controller = new AbortController()
            const timeout = setTimeout(() => controller.abort(), 8000)

            let html: string
            try {
                const response = await fetch(normalizedUrl, {
                    signal: controller.signal,
                    headers: {
                        "User-Agent": "Mozilla/5.0 (compatible; DalAI/1.0; +https://alaii.app)",
                        "Accept": "text/html,application/xhtml+xml",
                        "Accept-Language": "en-US,en;q=0.9",
                    },
                    redirect: "follow",
                })
                clearTimeout(timeout)

                if (!response.ok) {
                    res.status(422).json({ error: `Could not fetch website (HTTP ${response.status})` })
                    return
                }

                html = await response.text()
            } catch (fetchError: any) {
                clearTimeout(timeout)
                if (fetchError.name === "AbortError") {
                    res.status(408).json({ error: "Website took too long to respond" })
                    return
                }
                res.status(422).json({ error: "Could not connect to website" })
                return
            }

            const truncatedHtml = html.slice(0, 500_000)
            const parsedUrl = new URL(normalizedUrl)
            const baseUrl = `${parsedUrl.protocol}//${parsedUrl.host}`

            // Extract
            const title = extractTagContent(truncatedHtml, "title")
            const ogTitle = extractMeta(truncatedHtml, "og:title")
            const description = extractMeta(truncatedHtml, "description")
                || extractMeta(truncatedHtml, "og:description")
                || null
            const h1 = extractTagContent(truncatedHtml, "h1")

            let businessName = ogTitle || title || h1 || parsedUrl.hostname.split(".")[0]
            businessName = businessName
                .replace(/\s*[-|–—]\s*.+$/, "")
                .replace(/\s*Home$/i, "")
                .trim()

            const colors = extractColors(truncatedHtml)
            const socialLinks = extractSocialLinks(truncatedHtml)
            const logo = extractLogo(truncatedHtml, baseUrl)
            const phone = extractPhone(truncatedHtml)
            const address = extractAddress(truncatedHtml)

            const combinedText = [title, ogTitle, description, h1].filter(Boolean).join(" ")
            const businessType = detectBusinessType(combinedText + " " + truncatedHtml.slice(0, 10000))

            res.json({
                businessName,
                description: description?.slice(0, 300) || null,
                businessType,
                colors,
                primaryColor: colors[0] || null,
                logo,
                socialLinks: Object.keys(socialLinks).length > 0 ? socialLinks : null,
                phone,
                address,
                sourceUrl: normalizedUrl,
            })

        } catch (error: any) {
            functions.logger.error("Scrape error:", error)
            res.status(500).json({ error: "Failed to analyze website" })
        }
    })
