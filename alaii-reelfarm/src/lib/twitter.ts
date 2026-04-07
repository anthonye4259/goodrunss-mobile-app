// ============================================================================
// Alaii ReelFarm — Twitter/X Engagement Engine
// ============================================================================
// Automated growth engine that engages with beauty industry pros on Twitter:
// - Searches beauty hashtags for relevant tweets
// - Replies with helpful AI-generated comments
// - DMs high-value accounts with Alaii pitch
// - Follows beauty creators for organic reach
// All rate-limited to avoid bans.

import Anthropic from '@anthropic-ai/sdk';
import crypto from 'crypto';
import cron from 'node-cron';
import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// Twitter API v2 Client (OAuth 1.0a)
// ============================================================================

function getTwitterConfig() {
  const consumerKey = process.env.TWITTER_CONSUMER_KEY;
  const consumerSecret = process.env.TWITTER_CONSUMER_SECRET;
  const accessToken = process.env.TWITTER_ACCESS_TOKEN;
  const accessSecret = process.env.TWITTER_ACCESS_SECRET;
  const bearerToken = process.env.TWITTER_BEARER_TOKEN;

  if (!consumerKey || !consumerSecret) {
    throw new Error('Missing TWITTER_CONSUMER_KEY or TWITTER_CONSUMER_SECRET');
  }

  return { consumerKey, consumerSecret, accessToken, accessSecret, bearerToken };
}

// OAuth 1.0a signature generation
function createOAuthSignature(
  method: string,
  url: string,
  params: Record<string, string>,
  consumerSecret: string,
  tokenSecret: string,
): string {
  const sortedParams = Object.keys(params).sort().map(k => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`).join('&');
  const baseString = `${method.toUpperCase()}&${encodeURIComponent(url)}&${encodeURIComponent(sortedParams)}`;
  const signingKey = `${encodeURIComponent(consumerSecret)}&${encodeURIComponent(tokenSecret)}`;
  return crypto.createHmac('sha1', signingKey).update(baseString).digest('base64');
}

function createOAuthHeader(method: string, url: string, extraParams: Record<string, string> = {}): string {
  const config = getTwitterConfig();
  if (!config.accessToken || !config.accessSecret) {
    throw new Error('Missing TWITTER_ACCESS_TOKEN or TWITTER_ACCESS_SECRET');
  }

  const oauthParams: Record<string, string> = {
    oauth_consumer_key: config.consumerKey,
    oauth_nonce: crypto.randomBytes(16).toString('hex'),
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: config.accessToken,
    oauth_version: '1.0',
    ...extraParams,
  };

  oauthParams.oauth_signature = createOAuthSignature(
    method, url, oauthParams, config.consumerSecret, config.accessSecret,
  );

  const headerParts = Object.keys(oauthParams)
    .filter(k => k.startsWith('oauth_'))
    .sort()
    .map(k => `${encodeURIComponent(k)}="${encodeURIComponent(oauthParams[k])}"`)
    .join(', ');

  return `OAuth ${headerParts}`;
}

// ============================================================================
// Twitter API Functions
// ============================================================================

const TWITTER_API = 'https://api.twitter.com/2';

/** Search recent tweets by query (uses Bearer token) */
async function searchTweets(query: string, maxResults: number = 10): Promise<any[]> {
  const config = getTwitterConfig();
  const token = config.bearerToken;
  if (!token) throw new Error('Missing TWITTER_BEARER_TOKEN');

  const params = new URLSearchParams({
    query,
    max_results: String(maxResults),
    'tweet.fields': 'author_id,created_at,public_metrics,conversation_id',
    'user.fields': 'name,username,public_metrics,description',
    expansions: 'author_id',
  });

  const res = await fetch(`${TWITTER_API}/tweets/search/recent?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const err = await res.text();
    console.error(`❌ Twitter search failed: ${err}`);
    return [];
  }

  const data = await res.json();
  const users = (data.includes?.users || []).reduce((acc: any, u: any) => {
    acc[u.id] = u;
    return acc;
  }, {});

  return (data.data || []).map((tweet: any) => ({
    id: tweet.id,
    text: tweet.text,
    authorId: tweet.author_id,
    author: users[tweet.author_id] || null,
    metrics: tweet.public_metrics,
    conversationId: tweet.conversation_id,
    createdAt: tweet.created_at,
  }));
}

/** Reply to a tweet */
async function replyToTweet(tweetId: string, text: string): Promise<boolean> {
  const url = `${TWITTER_API}/tweets`;
  const auth = createOAuthHeader('POST', url);

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: auth,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text,
      reply: { in_reply_to_tweet_id: tweetId },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error(`❌ Reply failed:`, err);
    return false;
  }

  console.log(`💬 Replied to tweet ${tweetId}`);
  return true;
}

/** Follow a user */
async function followUser(userId: string): Promise<boolean> {
  const config = getTwitterConfig();
  // Need our own user ID — get from access token
  const myUrl = `${TWITTER_API}/users/me`;
  const myAuth = createOAuthHeader('GET', myUrl);
  const meRes = await fetch(myUrl, { headers: { Authorization: myAuth } });

  if (!meRes.ok) return false;
  const me = await meRes.json();
  const myId = me.data.id;

  const url = `${TWITTER_API}/users/${myId}/following`;
  const auth = createOAuthHeader('POST', url);

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: auth,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ target_user_id: userId }),
  });

  if (!res.ok) {
    console.error(`❌ Follow failed:`, await res.text());
    return false;
  }

  console.log(`👤 Followed user ${userId}`);
  return true;
}

/** Send a DM */
async function sendDM(userId: string, text: string): Promise<boolean> {
  const url = `${TWITTER_API}/dm_conversations/with/${userId}/messages`;
  const auth = createOAuthHeader('POST', url);

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: auth,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text,
    }),
  });

  if (!res.ok) {
    console.error(`❌ DM failed:`, await res.text());
    return false;
  }

  console.log(`📩 DM sent to user ${userId}`);
  return true;
}

// ============================================================================
// AI Comment Generation
// ============================================================================

async function generateReply(tweet: any): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not set');

  const client = new Anthropic({ apiKey });

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 150,
    messages: [{
      role: 'user',
      content: `Write a short, helpful Twitter reply to this tweet from a beauty industry professional. Be genuinely helpful, not salesy. Only mention Alaii if the tweet is about booking software, no-shows, or scheduling problems. Keep it under 200 characters. Sound like a real person, not a brand.

TWEET: "${tweet.text}"
AUTHOR: @${tweet.author?.username || 'unknown'} (${tweet.author?.description?.slice(0, 100) || 'beauty pro'})

Write ONLY the reply text, nothing else.`,
    }],
  });

  const text = response.content[0];
  return text.type === 'text' ? text.text : '';
}

async function generateDM(user: any): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not set');

  const client = new Anthropic({ apiKey });

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 200,
    messages: [{
      role: 'user',
      content: `Write a short Twitter DM to a beauty pro inviting them to try Alaii. Under 200 characters. Warm and casual, not corporate.

USER: @${user.username}
BIO: ${user.description?.slice(0, 150) || 'beauty professional'}
FOLLOWERS: ${user.public_metrics?.followers_count || '?'}

Alaii is an AI-powered platform for beauty pros — replaces GlossGenius/Square, fills cancellations automatically, handles everything from booking to marketing. Free 60-day trial.

Write ONLY the DM text.`,
    }],
  });

  const text = response.content[0];
  return text.type === 'text' ? text.text : '';
}

// ============================================================================
// Engagement Data
// ============================================================================

const ENGAGEMENT_LOG = path.join(process.cwd(), 'data', 'twitter-engagement.json');

interface EngagementRecord {
  tweetId?: string;
  userId?: string;
  action: 'reply' | 'follow' | 'dm';
  timestamp: string;
}

function getEngagementLog(): EngagementRecord[] {
  if (!fs.existsSync(ENGAGEMENT_LOG)) return [];
  return JSON.parse(fs.readFileSync(ENGAGEMENT_LOG, 'utf-8'));
}

function logEngagement(record: EngagementRecord): void {
  const dir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const log = getEngagementLog();
  log.push(record);
  fs.writeFileSync(ENGAGEMENT_LOG, JSON.stringify(log, null, 2));
}

function hasEngaged(tweetId?: string, userId?: string): boolean {
  const log = getEngagementLog();
  if (tweetId) return log.some(r => r.tweetId === tweetId);
  if (userId) return log.some(r => r.userId === userId);
  return false;
}

// ============================================================================
// Beauty Hashtag Searches
// ============================================================================

const BEAUTY_SEARCHES = [
  '#lashtech OR #lashartist OR "lash extensions"',
  '#hairstylist OR #hairdresser OR "behind the chair"',
  '#medspa OR #injector OR #botox OR "aesthetic nurse"',
  '#esthetician OR #skincare OR "facial treatment"',
  '#nailtech OR #nailartist',
  '"no shows" salon OR "cancellations" booking',
  '"glossgenius" OR "acuity scheduling" OR "square appointments"',
  '"booking software" salon OR "scheduling app" beauty',
];

// ============================================================================
// Main Engagement Engine
// ============================================================================

const MAX_ACTIONS_PER_HOUR = 15;
let isEngaging = false;

export async function runTwitterEngagement(): Promise<{
  replies: number;
  follows: number;
  dms: number;
}> {
  if (isEngaging) {
    console.log('⏸️ Twitter engagement already running');
    return { replies: 0, follows: 0, dms: 0 };
  }

  isEngaging = true;
  let replies = 0, follows = 0, dms = 0;
  let actionsThisRun = 0;

  try {
    console.log('\n🐦 ══════════════════════════════════════════');
    console.log('   Twitter Engagement Engine Starting...');
    console.log('   ══════════════════════════════════════════\n');

    // Pick 2 random search queries
    const shuffled = [...BEAUTY_SEARCHES].sort(() => Math.random() - 0.5);
    const queries = shuffled.slice(0, 2);

    for (const query of queries) {
      if (actionsThisRun >= MAX_ACTIONS_PER_HOUR) break;

      console.log(`🔍 Searching: "${query}"`);
      const tweets = await searchTweets(query, 10);
      console.log(`   Found ${tweets.length} tweets`);

      for (const tweet of tweets) {
        if (actionsThisRun >= MAX_ACTIONS_PER_HOUR) break;
        if (hasEngaged(tweet.id)) continue;

        // Reply to tweet
        try {
          const reply = await generateReply(tweet);
          if (reply && reply.length > 0 && reply.length <= 280) {
            const success = await replyToTweet(tweet.id, reply);
            if (success) {
              replies++;
              actionsThisRun++;
              logEngagement({ tweetId: tweet.id, action: 'reply', timestamp: new Date().toISOString() });
            }
          }
        } catch (err) {
          console.error(`   ❌ Reply error:`, err);
        }

        // Follow the author (if >1k followers = real account)
        if (tweet.author && !hasEngaged(undefined, tweet.authorId)) {
          const followerCount = tweet.author?.public_metrics?.followers_count || 0;
          if (followerCount > 1000 && followerCount < 100000) {
            try {
              const success = await followUser(tweet.authorId);
              if (success) {
                follows++;
                actionsThisRun++;
                logEngagement({ userId: tweet.authorId, action: 'follow', timestamp: new Date().toISOString() });
              }
            } catch (err) {
              console.error(`   ❌ Follow error:`, err);
            }
          }
        }

        // Rate limit: 3 second gap between actions
        await new Promise(r => setTimeout(r, 3000));
      }
    }

    console.log('\n🐦 ══════════════════════════════════════════');
    console.log(`   Engagement done: ${replies} replies, ${follows} follows, ${dms} DMs`);
    console.log(`   Total logged: ${getEngagementLog().length} actions`);
    console.log('   ══════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Twitter engagement error:', error);
  } finally {
    isEngaging = false;
  }

  return { replies, follows, dms };
}

// ============================================================================
// Scheduler — Every 2 hours
// ============================================================================

export function startTwitterEngagement(): void {
  console.log('🐦 Twitter Engagement Engine initialized');
  console.log(`   📊 ${getEngagementLog().length} total actions logged`);

  // Run every 2 hours (spread throughout the day)
  cron.schedule('0 */2 * * *', async () => {
    console.log('⏰ Twitter engagement cycle triggered');
    const result = await runTwitterEngagement();
    console.log(`📊 Twitter: ${result.replies} replies, ${result.follows} follows`);
  });

  console.log('   ⏰ Scheduled: every 2 hours\n');
}

// ============================================================================
// Stats
// ============================================================================

export function getTwitterStats() {
  const log = getEngagementLog();
  const today = new Date().toDateString();
  return {
    totalActions: log.length,
    today: log.filter(r => new Date(r.timestamp).toDateString() === today).length,
    byAction: {
      replies: log.filter(r => r.action === 'reply').length,
      follows: log.filter(r => r.action === 'follow').length,
      dms: log.filter(r => r.action === 'dm').length,
    },
  };
}
