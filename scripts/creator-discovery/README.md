# Creator Discovery Tool

Automated influencer/creator discovery for Alaii outreach. Searches YouTube, Instagram, and TikTok for service business creators.

## Quick Start

```bash
cd scripts/creator-discovery
cp .env.example .env
# Add your API keys to .env
node discover.js
```

## API Keys Needed

| API | Cost | Get it at |
|-----|------|-----------|
| YouTube Data API v3 | **Free** (10K units/day) | [Google Cloud Console](https://console.cloud.google.com/apis/credentials) |
| RapidAPI (IG + TikTok) | Free tier available | [RapidAPI](https://rapidapi.com) |

> **YouTube alone works great** — you can run the script with just a YouTube API key and skip Instagram/TikTok.

## Usage

```bash
# Search all niches (barber, salon, fitness, beauty, wellness)
node discover.js

# Specific niche
node discover.js --niche barber

# Specific platform (if you only have YouTube API key)
node discover.js --platform youtube

# Multiple countries
node discover.js --country US
node discover.js --all-countries

# Custom follower range
node discover.js --min-followers 10000 --max-followers 200000

# Combine flags
node discover.js --niche barber --platform youtube --country US --min-followers 5000
```

## Output

Creates a CSV in `./output/` with columns:
- Platform, Username, Display Name, Profile URL
- Followers, Engagement Rate %, Email (extracted from bio)
- Bio, Country, Video Count, Search Keyword

## Supported Niches

| Niche | Example Hashtags |
|-------|-----------------|
| `barber` | #barberbusiness, #barberlife, #barbershopowner |
| `salon` | #salonowner, #salonbusiness, #beautybusiness |
| `fitness` | #fitnesstrainer, #personaltrainer, #gymowner |
| `beauty` | #beautyentrepreneur, #nailtech, #lashtech |
| `wellness` | #wellnessbusiness, #yogateacher, #pilatesstudio |

## Supported Countries

US, GB, CA, AU, IN, BR, MX, NG, ID, ZA
