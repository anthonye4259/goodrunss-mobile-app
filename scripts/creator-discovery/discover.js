/**
 * ============================================================================
 * CREATOR / INFLUENCER DISCOVERY TOOL
 * ============================================================================
 * 
 * Searches YouTube, Instagram, and TikTok for creators in target niches
 * (barbers, salons, trainers, beauty, wellness) and outputs a CSV of leads.
 * 
 * APIS USED:
 *   - YouTube: Google YouTube Data API v3 (FREE — 10,000 units/day)
 *   - Instagram: Apify Instagram Hashtag Scraper (FREE tier: $5/mo credits)
 *   - TikTok: Apify TikTok Scraper (FREE tier: $5/mo credits)
 * 
 * USAGE:
 *   node discover.js                          # Run with defaults
 *   node discover.js --niche barber           # Specific niche
 *   node discover.js --platform instagram     # Specific platform
 *   node discover.js --country US             # Specific country
 *   node discover.js --min-followers 5000     # Custom filter
 *   node discover.js --max-followers 500000   # Custom filter
 * 
 * SETUP:
 *   1. Copy .env.example to .env
 *   2. Add your API keys (instructions in .env.example)
 *   3. node discover.js
 * ============================================================================
 */

const fs = require('fs');
const path = require('path');

// ============================================================================
// CONFIGURATION
// ============================================================================

const NICHES = {
    barber: {
        hashtags: ['barberbusiness', 'barberlife', 'barbershopowner', 'barbermarketing', 'barbershoptalk', 'mobilebarber', 'barbershopconnect'],
        keywords: ['barber business tips', 'barbershop marketing', 'barber entrepreneur', 'how to grow barbershop'],
        youtubeKeywords: ['barber business', 'barbershop owner tips', 'how to run a barbershop', 'barber marketing'],
    },
    salon: {
        hashtags: ['salonowner', 'salonbusiness', 'hairsalonowner', 'salonmarketing', 'beautybusiness', 'salonlife', 'hairstylistbusiness'],
        keywords: ['salon owner tips', 'beauty business', 'salon marketing', 'salon entrepreneur'],
        youtubeKeywords: ['salon business tips', 'salon owner', 'beauty salon marketing', 'how to run a salon'],
    },
    fitness: {
        hashtags: ['fitnesstrainer', 'personaltrainer', 'fitnessbusiness', 'onlinecoach', 'gymowner', 'fitnesscoach', 'trainertips'],
        keywords: ['fitness business tips', 'personal trainer marketing', 'gym owner', 'fitness entrepreneur'],
        youtubeKeywords: ['personal trainer business', 'fitness business tips', 'how to grow fitness business', 'gym owner tips'],
    },
    beauty: {
        hashtags: ['beautyentrepreneur', 'makeupbusiness', 'esthetician', 'nailtech', 'lashtech', 'beautystudio', 'spabusiness'],
        keywords: ['beauty business tips', 'esthetician marketing', 'nail tech business', 'spa owner'],
        youtubeKeywords: ['beauty business', 'esthetician tips', 'how to grow beauty business', 'nail tech marketing'],
    },
    wellness: {
        hashtags: ['wellnessbusiness', 'yogateacher', 'massagetherapist', 'holisticbusiness', 'wellnessentrepreneur', 'pilatesstudio'],
        keywords: ['wellness business tips', 'yoga studio marketing', 'massage therapist business', 'wellness entrepreneur'],
        youtubeKeywords: ['wellness business', 'yoga studio owner', 'massage therapy business', 'wellness entrepreneur'],
    },
};

const COUNTRIES = {
    US: { name: 'United States', regionCode: 'US' },
    GB: { name: 'United Kingdom', regionCode: 'GB' },
    CA: { name: 'Canada', regionCode: 'CA' },
    AU: { name: 'Australia', regionCode: 'AU' },
    IN: { name: 'India', regionCode: 'IN' },
    BR: { name: 'Brazil', regionCode: 'BR' },
    MX: { name: 'Mexico', regionCode: 'MX' },
    NG: { name: 'Nigeria', regionCode: 'NG' },
    ID: { name: 'Indonesia', regionCode: 'ID' },
    ZA: { name: 'South Africa', regionCode: 'ZA' },
};

const DEFAULT_FILTERS = {
    minFollowers: 5000,
    maxFollowers: 500000,
    minEngagementRate: 1.0,
};

// ============================================================================
// UTILITY
// ============================================================================

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function extractEmail(text) {
    if (!text) return '';
    const match = text.match(/[\w.-]+@[\w.-]+\.\w{2,}/);
    return match ? match[0] : '';
}

function log(msg) { console.log(msg); }

// ============================================================================
// YOUTUBE — Google YouTube Data API v3 (FREE)
// ============================================================================

async function searchYouTube(keywords, options = {}) {
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) { log('⚠️  YOUTUBE_API_KEY not set — skipping YouTube'); return []; }

    const results = [];
    const regionCode = options.regionCode || 'US';

    for (const keyword of keywords) {
        try {
            const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(keyword)}&type=channel&maxResults=25&regionCode=${regionCode}&key=${apiKey}`;
            const searchRes = await fetch(searchUrl);
            const searchData = await searchRes.json();
            if (!searchData.items?.length) continue;

            const channelIds = searchData.items.map(i => i.snippet.channelId).join(',');
            const statsUrl = `https://www.googleapis.com/youtube/v3/channels?part=statistics,snippet&id=${channelIds}&key=${apiKey}`;
            const statsRes = await fetch(statsUrl);
            const statsData = await statsRes.json();
            if (!statsData.items) continue;

            for (const ch of statsData.items) {
                const subs = parseInt(ch.statistics.subscriberCount) || 0;
                if (subs < (options.minFollowers || DEFAULT_FILTERS.minFollowers)) continue;
                if (subs > (options.maxFollowers || DEFAULT_FILTERS.maxFollowers)) continue;

                const views = parseInt(ch.statistics.viewCount) || 0;
                const videos = parseInt(ch.statistics.videoCount) || 0;
                const avgViews = videos > 0 ? views / videos : 0;
                const engagement = subs > 0 ? (avgViews / subs) * 100 : 0;
                const desc = ch.snippet.description || '';

                results.push({
                    platform: 'YouTube',
                    username: ch.snippet.title,
                    displayName: ch.snippet.title,
                    profileUrl: `https://youtube.com/channel/${ch.id}`,
                    followers: subs,
                    engagementRate: Math.round(engagement * 10) / 10,
                    email: extractEmail(desc),
                    bio: desc.substring(0, 200),
                    country: ch.snippet.country || regionCode,
                    videoCount: videos,
                    totalViews: views,
                    searchKeyword: keyword,
                    discoveredAt: new Date().toISOString(),
                });
            }
            await sleep(200);
        } catch (err) { console.error(`   YT error "${keyword}":`, err.message); }
    }
    return results;
}

// ============================================================================
// INSTAGRAM — Apify Instagram Hashtag Scraper
// Docs: https://apify.com/apify/instagram-hashtag-scraper
// Free tier: $5/month of platform credits (~5000 results)
// ============================================================================

async function searchInstagram(hashtags, options = {}) {
    const token = process.env.APIFY_TOKEN;
    if (!token) { log('⚠️  APIFY_TOKEN not set — skipping Instagram'); return []; }

    const results = [];

    for (const hashtag of hashtags) {
        try {
            log(`      Scraping #${hashtag}...`);

            // Start the actor run
            const runRes = await fetch(
                `https://api.apify.com/v2/acts/apify~instagram-hashtag-scraper/runs?token=${token}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        hashtags: [hashtag],
                        resultsLimit: 30,
                        searchType: 'hashtag',
                    }),
                }
            );
            const runData = await runRes.json();
            const runId = runData.data?.id;
            if (!runId) { console.error(`      Failed to start IG run for #${hashtag}`); continue; }

            // Poll for completion (max 2 minutes)
            let status = 'RUNNING';
            let attempts = 0;
            while (status === 'RUNNING' || status === 'READY') {
                await sleep(3000);
                const statusRes = await fetch(`https://api.apify.com/v2/actor-runs/${runId}?token=${token}`);
                const statusData = await statusRes.json();
                status = statusData.data?.status || 'FAILED';
                attempts++;
                if (attempts > 40) break; // 2 min timeout
            }

            if (status !== 'SUCCEEDED') {
                console.error(`      IG run for #${hashtag} ended with status: ${status}`);
                continue;
            }

            // Get results from the dataset
            const datasetId = runData.data?.defaultDatasetId;
            if (!datasetId) continue;

            const dataRes = await fetch(`https://api.apify.com/v2/datasets/${datasetId}/items?token=${token}&format=json`);
            const items = await dataRes.json();

            // Extract unique creators from posts
            const seen = new Set();
            for (const post of items) {
                const owner = post.ownerUsername || post.owner?.username;
                const fullName = post.ownerFullName || post.owner?.full_name || owner;
                if (!owner || seen.has(owner)) continue;
                seen.add(owner);

                const followers = post.ownerFollowerCount || post.owner?.follower_count || 0;
                if (followers < (options.minFollowers || DEFAULT_FILTERS.minFollowers)) continue;
                if (followers > (options.maxFollowers || DEFAULT_FILTERS.maxFollowers)) continue;

                const likes = post.likesCount || post.like_count || 0;
                const comments = post.commentsCount || post.comment_count || 0;
                const engagement = followers > 0 ? ((likes + comments) / followers) * 100 : 0;

                const bio = post.ownerBiography || post.owner?.biography || '';

                results.push({
                    platform: 'Instagram',
                    username: `@${owner}`,
                    displayName: fullName,
                    profileUrl: `https://instagram.com/${owner}`,
                    followers,
                    engagementRate: Math.round(engagement * 10) / 10,
                    email: extractEmail(bio),
                    bio: bio.substring(0, 200),
                    country: '',
                    videoCount: 0,
                    totalViews: 0,
                    searchKeyword: `#${hashtag}`,
                    discoveredAt: new Date().toISOString(),
                });
            }
        } catch (err) { console.error(`   IG error #${hashtag}:`, err.message); }
    }
    return results;
}

// ============================================================================
// TIKTOK — Apify TikTok Scraper
// Docs: https://apify.com/clockworks/tiktok-scraper
// Free tier: $5/month of platform credits
// ============================================================================

async function searchTikTok(hashtags, options = {}) {
    const token = process.env.APIFY_TOKEN;
    if (!token) { log('⚠️  APIFY_TOKEN not set — skipping TikTok'); return []; }

    const results = [];

    for (const hashtag of hashtags) {
        try {
            log(`      Scraping #${hashtag}...`);

            // Start the actor run
            const runRes = await fetch(
                `https://api.apify.com/v2/acts/clockworks~tiktok-scraper/runs?token=${token}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        hashtags: [hashtag],
                        resultsPerPage: 30,
                        shouldDownloadVideos: false,
                    }),
                }
            );
            const runData = await runRes.json();
            const runId = runData.data?.id;
            if (!runId) { console.error(`      Failed to start TT run for #${hashtag}`); continue; }

            // Poll for completion (max 2 minutes)
            let status = 'RUNNING';
            let attempts = 0;
            while (status === 'RUNNING' || status === 'READY') {
                await sleep(3000);
                const statusRes = await fetch(`https://api.apify.com/v2/actor-runs/${runId}?token=${token}`);
                const statusData = await statusRes.json();
                status = statusData.data?.status || 'FAILED';
                attempts++;
                if (attempts > 40) break;
            }

            if (status !== 'SUCCEEDED') {
                console.error(`      TT run for #${hashtag} ended with status: ${status}`);
                continue;
            }

            // Get results
            const datasetId = runData.data?.defaultDatasetId;
            if (!datasetId) continue;

            const dataRes = await fetch(`https://api.apify.com/v2/datasets/${datasetId}/items?token=${token}&format=json`);
            const items = await dataRes.json();

            const seen = new Set();
            for (const video of items) {
                const author = video.authorMeta || video.author;
                if (!author) continue;
                const uniqueId = author.name || author.uniqueId;
                if (!uniqueId || seen.has(uniqueId)) continue;
                seen.add(uniqueId);

                const followers = author.fans || author.followerCount || 0;
                if (followers < (options.minFollowers || DEFAULT_FILTERS.minFollowers)) continue;
                if (followers > (options.maxFollowers || DEFAULT_FILTERS.maxFollowers)) continue;

                const likes = video.diggCount || video.stats?.diggCount || 0;
                const views = video.playCount || video.stats?.playCount || 1;
                const engagement = views > 0 ? (likes / views) * 100 : 0;
                const bio = author.signature || '';

                results.push({
                    platform: 'TikTok',
                    username: `@${uniqueId}`,
                    displayName: author.nickName || author.nickname || uniqueId,
                    profileUrl: `https://tiktok.com/@${uniqueId}`,
                    followers,
                    engagementRate: Math.round(engagement * 10) / 10,
                    email: extractEmail(bio),
                    bio: bio.substring(0, 200),
                    country: '',
                    videoCount: author.video || author.videoCount || 0,
                    totalViews: author.heart || author.heartCount || 0,
                    searchKeyword: `#${hashtag}`,
                    discoveredAt: new Date().toISOString(),
                });
            }
        } catch (err) { console.error(`   TT error #${hashtag}:`, err.message); }
    }
    return results;
}

// ============================================================================
// ALSO TRY: RapidAPI as fallback (if RAPIDAPI_KEY is set)
// ============================================================================

async function searchInstagramRapidAPI(hashtags, options = {}) {
    const apiKey = process.env.RAPIDAPI_KEY;
    if (!apiKey) return [];

    const results = [];
    const host = process.env.RAPIDAPI_IG_HOST || 'instagram-scraper-api2.p.rapidapi.com';

    for (const hashtag of hashtags) {
        try {
            const res = await fetch(`https://${host}/v1/hashtag?hashtag=${encodeURIComponent(hashtag)}`, {
                headers: { 'x-rapidapi-key': apiKey, 'x-rapidapi-host': host },
            });
            const data = await res.json();
            if (!data.data?.items) continue;

            const seen = new Set();
            for (const post of data.data.items) {
                const user = post.user;
                if (!user || seen.has(user.username)) continue;
                seen.add(user.username);

                const followers = user.follower_count || 0;
                if (followers < (options.minFollowers || DEFAULT_FILTERS.minFollowers)) continue;
                if (followers > (options.maxFollowers || DEFAULT_FILTERS.maxFollowers)) continue;

                const likes = post.like_count || 0;
                const comments = post.comment_count || 0;
                const engagement = followers > 0 ? ((likes + comments) / followers) * 100 : 0;
                const bio = user.biography || '';

                results.push({
                    platform: 'Instagram',
                    username: `@${user.username}`,
                    displayName: user.full_name || user.username,
                    profileUrl: `https://instagram.com/${user.username}`,
                    followers,
                    engagementRate: Math.round(engagement * 10) / 10,
                    email: extractEmail(bio),
                    bio: bio.substring(0, 200),
                    country: '',
                    videoCount: user.media_count || 0,
                    totalViews: 0,
                    searchKeyword: `#${hashtag}`,
                    discoveredAt: new Date().toISOString(),
                });
            }
            await sleep(500);
        } catch (err) { console.error(`   RapidAPI IG error #${hashtag}:`, err.message); }
    }
    return results;
}

async function searchTikTokRapidAPI(hashtags, options = {}) {
    const apiKey = process.env.RAPIDAPI_KEY;
    if (!apiKey) return [];

    const results = [];
    const host = process.env.RAPIDAPI_TT_HOST || 'tiktok-scraper7.p.rapidapi.com';

    for (const hashtag of hashtags) {
        try {
            const res = await fetch(`https://${host}/challenge/posts?challenge_name=${encodeURIComponent(hashtag)}&count=30`, {
                headers: { 'x-rapidapi-key': apiKey, 'x-rapidapi-host': host },
            });
            const data = await res.json();
            if (!data.data?.videos) continue;

            const seen = new Set();
            for (const video of data.data.videos) {
                const author = video.author;
                if (!author || seen.has(author.uniqueId)) continue;
                seen.add(author.uniqueId);

                const followers = author.followerCount || 0;
                if (followers < (options.minFollowers || DEFAULT_FILTERS.minFollowers)) continue;
                if (followers > (options.maxFollowers || DEFAULT_FILTERS.maxFollowers)) continue;

                const likes = video.stats?.diggCount || 0;
                const views = video.stats?.playCount || 1;
                const engagement = views > 0 ? (likes / views) * 100 : 0;
                const bio = author.signature || '';

                results.push({
                    platform: 'TikTok',
                    username: `@${author.uniqueId}`,
                    displayName: author.nickname || author.uniqueId,
                    profileUrl: `https://tiktok.com/@${author.uniqueId}`,
                    followers,
                    engagementRate: Math.round(engagement * 10) / 10,
                    email: extractEmail(bio),
                    bio: bio.substring(0, 200),
                    country: '',
                    videoCount: author.videoCount || 0,
                    totalViews: author.heartCount || 0,
                    searchKeyword: `#${hashtag}`,
                    discoveredAt: new Date().toISOString(),
                });
            }
            await sleep(500);
        } catch (err) { console.error(`   RapidAPI TT error #${hashtag}:`, err.message); }
    }
    return results;
}

// ============================================================================
// CSV EXPORT
// ============================================================================

function toCSV(creators) {
    const headers = ['Platform', 'Username', 'Display Name', 'Profile URL', 'Followers',
        'Engagement Rate %', 'Email', 'Bio', 'Country', 'Total Views',
        'Video Count', 'Search Keyword', 'Discovered At'];

    const esc = (v) => {
        const s = String(v || '');
        return (s.includes(',') || s.includes('"') || s.includes('\n')) ? `"${s.replace(/"/g, '""')}"` : s;
    };

    const rows = creators.map(c => [
        c.platform, c.username, c.displayName, c.profileUrl, c.followers,
        c.engagementRate, c.email, c.bio, c.country, c.totalViews,
        c.videoCount, c.searchKeyword, c.discoveredAt,
    ].map(esc).join(','));

    return [headers.join(','), ...rows].join('\n');
}

// ============================================================================
// DEDUPLICATION
// ============================================================================

function dedupe(creators) {
    const seen = new Map();
    for (const c of creators) {
        const key = `${c.displayName.toLowerCase()}_${c.platform}`;
        if (!seen.has(key) || c.followers > seen.get(key).followers) {
            seen.set(key, c);
        }
    }
    return Array.from(seen.values());
}

// ============================================================================
// MAIN
// ============================================================================

function parseArgs() {
    const args = process.argv.slice(2);
    const opts = {
        niches: Object.keys(NICHES),
        platforms: ['youtube', 'instagram', 'tiktok'],
        countries: ['US'],
        minFollowers: DEFAULT_FILTERS.minFollowers,
        maxFollowers: DEFAULT_FILTERS.maxFollowers,
    };

    for (let i = 0; i < args.length; i++) {
        switch (args[i]) {
            case '--niche': opts.niches = [args[++i]]; break;
            case '--platform': opts.platforms = [args[++i]]; break;
            case '--country': opts.countries = [args[++i]]; break;
            case '--min-followers': opts.minFollowers = parseInt(args[++i]); break;
            case '--max-followers': opts.maxFollowers = parseInt(args[++i]); break;
            case '--all-countries': opts.countries = Object.keys(COUNTRIES); break;
            case '--help':
                log(`
Creator Discovery Tool — Find influencers for Alaii outreach

Usage:  node discover.js [options]

Options:
  --niche <name>         barber | salon | fitness | beauty | wellness
  --platform <name>      youtube | instagram | tiktok
  --country <code>       US | GB | CA | AU | IN | BR | MX | NG | ID | ZA
  --all-countries        Search all 10 countries
  --min-followers <n>    Min follower count (default: 5000)
  --max-followers <n>    Max follower count (default: 500000)

Examples:
  node discover.js --niche barber --platform instagram
  node discover.js --niche salon --platform tiktok --min-followers 10000
  node discover.js --all-countries
`);
                process.exit(0);
        }
    }
    return opts;
}

async function main() {
    // Load .env
    try {
        const envPath = path.join(__dirname, '.env');
        if (fs.existsSync(envPath)) {
            for (const line of fs.readFileSync(envPath, 'utf-8').split('\n')) {
                const t = line.trim();
                if (!t || t.startsWith('#')) continue;
                const eq = t.indexOf('=');
                if (eq > 0) process.env[t.substring(0, eq).trim()] = t.substring(eq + 1).trim().replace(/^["']|["']$/g, '');
            }
        }
    } catch (e) { }

    const opts = parseArgs();

    log('');
    log('🔍 Creator Discovery Tool for Alaii');
    log('═══════════════════════════════════════════');
    log(`   Niches:        ${opts.niches.join(', ')}`);
    log(`   Platforms:     ${opts.platforms.join(', ')}`);
    log(`   Countries:     ${opts.countries.join(', ')}`);
    log(`   Followers:     ${opts.minFollowers.toLocaleString()} — ${opts.maxFollowers.toLocaleString()}`);
    log('');
    log('   API Status:');
    log(`   📺 YouTube:   ${process.env.YOUTUBE_API_KEY ? '✅ Ready' : '❌ YOUTUBE_API_KEY not set'}`);
    log(`   📸 Instagram: ${process.env.APIFY_TOKEN ? '✅ Apify' : process.env.RAPIDAPI_KEY ? '✅ RapidAPI' : '❌ APIFY_TOKEN or RAPIDAPI_KEY not set'}`);
    log(`   🎵 TikTok:    ${process.env.APIFY_TOKEN ? '✅ Apify' : process.env.RAPIDAPI_KEY ? '✅ RapidAPI' : '❌ APIFY_TOKEN or RAPIDAPI_KEY not set'}`);
    log('═══════════════════════════════════════════');
    log('');

    let allCreators = [];

    for (const nicheName of opts.niches) {
        const niche = NICHES[nicheName];
        if (!niche) { log(`⚠️  Unknown niche: ${nicheName}`); continue; }

        log(`📌 Niche: ${nicheName.toUpperCase()}`);
        log('───────────────────────────────────────');

        for (const countryCode of opts.countries) {
            const country = COUNTRIES[countryCode];
            if (!country) continue;
            log(`\n   🌍 ${country.name}`);

            // ── YouTube ──
            if (opts.platforms.includes('youtube')) {
                log('   📺 YouTube...');
                const res = await searchYouTube(niche.youtubeKeywords, {
                    regionCode: countryCode, ...opts,
                });
                log(`      → ${res.length} creators`);
                allCreators.push(...res);
            }

            // ── Instagram ──
            if (opts.platforms.includes('instagram')) {
                log('   📸 Instagram...');
                let res = [];
                // Try Apify first, fall back to RapidAPI
                if (process.env.APIFY_TOKEN) {
                    res = await searchInstagram(niche.hashtags.slice(0, 3), opts);
                } else if (process.env.RAPIDAPI_KEY) {
                    res = await searchInstagramRapidAPI(niche.hashtags.slice(0, 5), opts);
                } else {
                    log('      ⚠️  No IG API key — set APIFY_TOKEN or RAPIDAPI_KEY');
                }
                log(`      → ${res.length} creators`);
                allCreators.push(...res);
            }

            // ── TikTok ──
            if (opts.platforms.includes('tiktok')) {
                log('   🎵 TikTok...');
                let res = [];
                if (process.env.APIFY_TOKEN) {
                    res = await searchTikTok(niche.hashtags.slice(0, 3), opts);
                } else if (process.env.RAPIDAPI_KEY) {
                    res = await searchTikTokRapidAPI(niche.hashtags.slice(0, 5), opts);
                } else {
                    log('      ⚠️  No TT API key — set APIFY_TOKEN or RAPIDAPI_KEY');
                }
                log(`      → ${res.length} creators`);
                allCreators.push(...res);
            }
        }
        log('');
    }

    // Deduplicate & sort
    allCreators = dedupe(allCreators);
    allCreators.sort((a, b) => b.followers - a.followers);

    // Summary
    log('═══════════════════════════════════════════');
    log('📊 RESULTS');
    log('═══════════════════════════════════════════');
    log(`   Total creators:  ${allCreators.length}`);
    log(`   With email:      ${allCreators.filter(c => c.email).length}`);
    log(`   📺 YouTube:      ${allCreators.filter(c => c.platform === 'YouTube').length}`);
    log(`   📸 Instagram:    ${allCreators.filter(c => c.platform === 'Instagram').length}`);
    log(`   🎵 TikTok:       ${allCreators.filter(c => c.platform === 'TikTok').length}`);

    if (allCreators.length > 0) {
        log('\n   🏆 Top 15 by followers:');
        allCreators.slice(0, 15).forEach((c, i) => {
            const emailIcon = c.email ? ' ✉️' : '';
            log(`   ${String(i + 1).padStart(2)}. ${c.displayName} (${c.platform}) — ${c.followers.toLocaleString()} followers, ${c.engagementRate}% eng${emailIcon}`);
        });
    }

    // Export CSV
    if (allCreators.length > 0) {
        const outputDir = path.join(__dirname, 'output');
        if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

        const date = new Date().toISOString().split('T')[0];
        const filename = `creators_${opts.niches.join('-')}_${date}.csv`;
        const outputPath = path.join(outputDir, filename);

        fs.writeFileSync(outputPath, toCSV(allCreators), 'utf-8');
        log(`\n   ✅ Exported: ${outputPath}`);
        log(`   📋 ${allCreators.length} rows ready for outreach`);
    } else {
        log('\n   ⚠️  No creators found. Check your API keys and try again.');
    }

    log('\n═══════════════════════════════════════════\n');
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
