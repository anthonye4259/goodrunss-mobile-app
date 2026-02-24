import * as functions from "firebase-functions"
import * as admin from "firebase-admin"

// ─────────────────────────────────────────────────
// Meta Business Extension (FBE) Integration
// Lets Alaii appear in Meta Business Suite → Business Apps
// ─────────────────────────────────────────────────

const META_APP_ID = "831315012700955"

// Verify token for webhook validation — set via:
//   firebase functions:config:set meta.fbe_verify_token="YOUR_TOKEN"
// Or use a default for initial testing
function getVerifyToken(): string {
    try {
        const config = functions.config()
        return config?.meta?.fbe_verify_token || "alaii_fbe_verify_2026"
    } catch {
        return "alaii_fbe_verify_2026"
    }
}

/**
 * FBE Webhook Endpoint
 *
 * Handles two request types from Meta:
 * 1. GET  — Webhook verification (hub.challenge handshake)
 * 2. POST — Install/uninstall events from Business Apps surface
 *
 * Deploy URL will be: https://<region>-<project>.cloudfunctions.net/metaFbeWebhook
 */
export const metaFbeWebhook = functions.https.onRequest(async (req, res) => {
    // ── CORS headers ──
    res.set("Access-Control-Allow-Origin", "*")
    res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
    res.set("Access-Control-Allow-Headers", "Content-Type")

    if (req.method === "OPTIONS") {
        res.status(204).send("")
        return
    }

    // ── GET: Webhook Verification ──
    // Meta sends: ?hub.mode=subscribe&hub.verify_token=<TOKEN>&hub.challenge=<CHALLENGE>
    if (req.method === "GET") {
        const mode = req.query["hub.mode"]
        const token = req.query["hub.verify_token"]
        const challenge = req.query["hub.challenge"]

        if (mode === "subscribe" && token === getVerifyToken()) {
            functions.logger.info("✅ FBE Webhook verified successfully")
            res.status(200).send(challenge)
            return
        }

        functions.logger.warn("❌ FBE Webhook verification failed", {
            mode,
            tokenMatch: token === getVerifyToken()
        })
        res.status(403).send("Verification failed")
        return
    }

    // ── POST: Install / Uninstall Events ──
    if (req.method === "POST") {
        try {
            const body = req.body
            functions.logger.info("📥 FBE Webhook event received", {
                object: body?.object,
                entryCount: body?.entry?.length
            })

            const db = admin.firestore()

            // Process each entry (Meta batches events)
            if (body?.entry && Array.isArray(body.entry)) {
                for (const entry of body.entry) {
                    const changes = entry?.changes || []

                    for (const change of changes) {
                        const field = change.field   // "fbe_install" or "fbe_uninstall"
                        const value = change.value || {}

                        if (field === "fbe_install") {
                            // ── Business installed Alaii ──
                            const installData = {
                                // Meta identifiers
                                fbeExternalBusinessId: value.fbe_external_business_id || null,
                                pixelId: value.pixel_id || null,
                                pageId: value.page_id || null,
                                igId: value.instagram_business_id || null,
                                businessId: value.business_id || null,
                                adAccountId: value.ad_account_id || null,
                                catalogId: value.catalog_id || null,
                                commerceAccountId: value.commerce_merchant_settings_id || null,

                                // Access tokens (if provided)
                                accessToken: value.access_token || null,
                                systemUserAccessToken: value.system_user_access_token || null,

                                // Profiles & config
                                profiles: value.profiles || [],
                                pages: value.pages || [],
                                installedFeatures: value.installed_features || [],

                                // Metadata
                                metaAppId: META_APP_ID,
                                status: "active",
                                installedAt: admin.firestore.FieldValue.serverTimestamp(),
                                updatedAt: admin.firestore.FieldValue.serverTimestamp()
                            }

                            const docId = value.fbe_external_business_id || value.business_id || `unknown_${Date.now()}`

                            await db.collection("meta_fbe_installs").doc(docId).set(installData, { merge: true })

                            functions.logger.info("✅ FBE Install recorded", {
                                docId,
                                pageId: installData.pageId,
                                businessId: installData.businessId
                            })

                        } else if (field === "fbe_uninstall") {
                            // ── Business uninstalled Alaii ──
                            const docId = value.fbe_external_business_id || value.business_id || null

                            if (docId) {
                                await db.collection("meta_fbe_installs").doc(docId).update({
                                    status: "uninstalled",
                                    uninstalledAt: admin.firestore.FieldValue.serverTimestamp(),
                                    updatedAt: admin.firestore.FieldValue.serverTimestamp()
                                })

                                functions.logger.info("🗑️ FBE Uninstall recorded", { docId })
                            }
                        } else {
                            functions.logger.info("ℹ️ FBE Unknown event field", { field })
                        }
                    }
                }
            }

            // Meta expects a 200 within 20 seconds
            res.status(200).json({ status: "ok" })
            return
        } catch (error) {
            functions.logger.error("❌ FBE Webhook processing error", error)
            res.status(500).json({ error: "Internal server error" })
            return
        }
    }

    res.status(405).send("Method not allowed")
})

/**
 * FBE Authentication URL
 *
 * When a business clicks "Install" in Meta Business Suite → Business Apps,
 * Meta redirects them to this URL. We serve a branded landing page that
 * deep-links into the Alaii app or redirects to web signup.
 *
 * Deploy URL will be: https://<region>-<project>.cloudfunctions.net/metaFbeAuth
 */
export const metaFbeAuth = functions.https.onRequest(async (req, res) => {
    res.set("Access-Control-Allow-Origin", "*")

    // Extract any business context Meta passes as query params
    const businessId = req.query.business_id as string || ""
    const pageId = req.query.page_id as string || ""
    // fbe_external_business_id also available via req.query if needed

    // Deep link into the Alaii mobile app
    const appDeepLink = `dalai://signup?source=meta_fbe&business_id=${businessId}&page_id=${pageId}`
    // Fallback: App Store / Play Store
    const appStoreUrl = "https://apps.apple.com/app/dal-ai/id6741868498"
    const playStoreUrl = "https://play.google.com/store/apps/details?id=com.dalai.app"

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Install Alaii — Your Branded Mobile App</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%);
            color: #fff;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .container {
            max-width: 480px;
            padding: 40px 24px;
            text-align: center;
        }
        .logo {
            width: 80px;
            height: 80px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 20px;
            margin: 0 auto 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 36px;
            font-weight: 700;
        }
        h1 {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 12px;
            background: linear-gradient(90deg, #667eea, #764ba2);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        .subtitle {
            font-size: 16px;
            color: #999;
            margin-bottom: 40px;
            line-height: 1.5;
        }
        .features {
            text-align: left;
            margin-bottom: 40px;
        }
        .feature {
            display: flex;
            align-items: flex-start;
            gap: 12px;
            margin-bottom: 16px;
            padding: 16px;
            background: rgba(255,255,255,0.05);
            border-radius: 12px;
            border: 1px solid rgba(255,255,255,0.08);
        }
        .feature-icon { font-size: 24px; }
        .feature-text h3 { font-size: 15px; font-weight: 600; margin-bottom: 4px; }
        .feature-text p { font-size: 13px; color: #888; line-height: 1.4; }
        .cta-btn {
            display: block;
            width: 100%;
            padding: 16px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #fff;
            border: none;
            border-radius: 12px;
            font-size: 17px;
            font-weight: 600;
            cursor: pointer;
            text-decoration: none;
            margin-bottom: 12px;
            transition: transform 0.2s;
        }
        .cta-btn:hover { transform: scale(1.02); }
        .store-links {
            display: flex;
            gap: 12px;
            justify-content: center;
            margin-top: 16px;
        }
        .store-link {
            padding: 10px 20px;
            background: rgba(255,255,255,0.08);
            border-radius: 8px;
            color: #ccc;
            text-decoration: none;
            font-size: 13px;
            border: 1px solid rgba(255,255,255,0.1);
        }
        .store-link:hover { background: rgba(255,255,255,0.12); }
        .powered {
            margin-top: 32px;
            font-size: 12px;
            color: #555;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">A</div>
        <h1>Alaii</h1>
        <p class="subtitle">
            Turn your Facebook Business Page into a branded mobile app — in 60 seconds.
            No coding. No developers. No App Store fees.
        </p>

        <div class="features">
            <div class="feature">
                <span class="feature-icon">📱</span>
                <div class="feature-text">
                    <h3>Your Own Branded App</h3>
                    <p>Custom colors, logo, and features that match your brand identity.</p>
                </div>
            </div>
            <div class="feature">
                <span class="feature-icon">📅</span>
                <div class="feature-text">
                    <h3>Built-in Booking</h3>
                    <p>Let customers book appointments, classes, and services right from the app.</p>
                </div>
            </div>
            <div class="feature">
                <span class="feature-icon">🤖</span>
                <div class="feature-text">
                    <h3>AI Assistant</h3>
                    <p>Built-in AI that handles customer questions, scheduling, and follow-ups.</p>
                </div>
            </div>
            <div class="feature">
                <span class="feature-icon">💳</span>
                <div class="feature-text">
                    <h3>Payments & Subscriptions</h3>
                    <p>Accept payments, sell memberships, and manage recurring billing.</p>
                </div>
            </div>
        </div>

        <a href="${appDeepLink}" class="cta-btn" id="openApp">
            Get Started with Alaii
        </a>

        <div class="store-links">
            <a href="${appStoreUrl}" class="store-link">🍎 App Store</a>
            <a href="${playStoreUrl}" class="store-link">▶️ Google Play</a>
        </div>

        <p class="powered">Powered by DALai · Meta Business Partner</p>
    </div>

    <script>
        // Try to open the app first, fall back to App Store after delay
        document.getElementById('openApp').addEventListener('click', function(e) {
            e.preventDefault();
            const deepLink = '${appDeepLink}';
            window.location.href = deepLink;

            // If app isn't installed, redirect to App Store after 2 seconds
            setTimeout(function() {
                const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
                if (isIOS) {
                    window.location.href = '${appStoreUrl}';
                } else {
                    window.location.href = '${playStoreUrl}';
                }
            }, 2000);
        });
    </script>
</body>
</html>`

    res.status(200).send(html)
})
