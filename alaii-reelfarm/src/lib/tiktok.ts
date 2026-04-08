// ============================================================================
// Alaii ReelFarm — TikTok API Client
// ============================================================================
// Multi-account TikTok carousel publishing via Content Publishing API.
// Supports connecting unlimited accounts via OAuth and posting photo carousels.

import * as fs from 'fs';
import * as path from 'path';

const TIKTOK_API = 'https://open.tiktokapis.com/v2';
const TIKTOK_AUTH = 'https://www.tiktok.com/v2/auth/authorize';
const TIKTOK_TOKEN = 'https://open.tiktokapis.com/v2/oauth/token/';

const ACCOUNTS_FILE = path.join(process.cwd(), 'data', 'tiktok-accounts.json');

// ============================================================================
// Types
// ============================================================================

export interface TikTokAccount {
  id: string;            // TikTok open_id
  username: string;
  displayName: string;
  avatarUrl?: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;     // Unix timestamp
  connectedAt: string;
  lastPostedAt?: string;
  totalPosted: number;
}

export interface TikTokPublishResult {
  publishId?: string;
  status: 'success' | 'error';
  error?: string;
}

// ============================================================================
// Config
// ============================================================================

function getConfig() {
  const clientKey = process.env.TIKTOK_CLIENT_KEY;
  const clientSecret = process.env.TIKTOK_CLIENT_SECRET;
  const redirectUri = process.env.TIKTOK_REDIRECT_URI || 'http://localhost:3000/api/tiktok/callback';

  if (!clientKey || !clientSecret) {
    throw new Error('Missing TIKTOK_CLIENT_KEY or TIKTOK_CLIENT_SECRET in environment');
  }

  return { clientKey, clientSecret, redirectUri };
}

// ============================================================================
// Account Storage
// ============================================================================

function ensureDataDir() {
  const dir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(ACCOUNTS_FILE)) {
    fs.writeFileSync(ACCOUNTS_FILE, JSON.stringify([], null, 2));
  }
}

export function getAllAccounts(): TikTokAccount[] {
  ensureDataDir();
  return JSON.parse(fs.readFileSync(ACCOUNTS_FILE, 'utf-8'));
}

export function getAccount(id: string): TikTokAccount | undefined {
  return getAllAccounts().find(a => a.id === id);
}

export function saveAccount(account: TikTokAccount): void {
  ensureDataDir();
  const accounts = getAllAccounts();
  const idx = accounts.findIndex(a => a.id === account.id);
  if (idx >= 0) accounts[idx] = account;
  else accounts.push(account);
  fs.writeFileSync(ACCOUNTS_FILE, JSON.stringify(accounts, null, 2));
}

export function removeAccount(id: string): void {
  ensureDataDir();
  const accounts = getAllAccounts().filter(a => a.id !== id);
  fs.writeFileSync(ACCOUNTS_FILE, JSON.stringify(accounts, null, 2));
}

// ============================================================================
// OAuth Flow (with PKCE)
// ============================================================================

const PKCE_FILE = path.join(process.cwd(), 'data', 'pkce-verifiers.json');

/** Generate a cryptographically random code verifier (43-128 chars) */
function generateCodeVerifier(): string {
  const crypto = require('crypto');
  return crypto.randomBytes(32).toString('base64url');
}

/** Generate code challenge from verifier using SHA-256 */
function generateCodeChallenge(verifier: string): string {
  const crypto = require('crypto');
  return crypto.createHash('sha256').update(verifier).digest('base64url');
}

/** Store code verifier for later retrieval during callback */
function storeCodeVerifier(state: string, verifier: string): void {
  ensureDataDir();
  let verifiers: Record<string, string> = {};
  try { verifiers = JSON.parse(fs.readFileSync(PKCE_FILE, 'utf-8')); } catch {}
  verifiers[state] = verifier;
  fs.writeFileSync(PKCE_FILE, JSON.stringify(verifiers, null, 2));
}

/** Retrieve and remove code verifier */
export function getCodeVerifier(state: string): string | undefined {
  try {
    const verifiers = JSON.parse(fs.readFileSync(PKCE_FILE, 'utf-8'));
    const verifier = verifiers[state];
    if (verifier) {
      delete verifiers[state];
      fs.writeFileSync(PKCE_FILE, JSON.stringify(verifiers, null, 2));
    }
    return verifier;
  } catch {
    return undefined;
  }
}

/** Generate TikTok OAuth authorization URL with PKCE */
export function getAuthUrl(): string {
  const { clientKey, redirectUri } = getConfig();

  const codeVerifier = generateCodeVerifier();
  const codeChallenge = generateCodeChallenge(codeVerifier);
  const state = `alaii-${Date.now()}`;

  // Store verifier for callback
  storeCodeVerifier(state, codeVerifier);

  const params = new URLSearchParams({
    client_key: clientKey,
    response_type: 'code',
    scope: 'user.info.basic,video.publish,video.upload',
    redirect_uri: redirectUri,
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  });

  return `${TIKTOK_AUTH}?${params}`;
}

/** Exchange authorization code for access token (with PKCE code_verifier) */
export async function exchangeCodeForToken(code: string, codeVerifier: string): Promise<TikTokAccount> {
  const { clientKey, clientSecret, redirectUri } = getConfig();

  const res = await fetch(TIKTOK_TOKEN, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_key: clientKey,
      client_secret: clientSecret,
      code,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
      code_verifier: codeVerifier,
    }),
  });

  const data = await res.json();

  if (data.error || !data.access_token) {
    throw new Error(`TikTok OAuth failed: ${data.error_description || data.error || 'Unknown error'}`);
  }

  // Fetch user info
  const userInfo = await fetchUserInfo(data.access_token, data.open_id);

  const account: TikTokAccount = {
    id: data.open_id,
    username: userInfo?.username || data.open_id,
    displayName: userInfo?.display_name || 'TikTok User',
    avatarUrl: userInfo?.avatar_url,
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: Date.now() + (data.expires_in * 1000),
    connectedAt: new Date().toISOString(),
    totalPosted: 0,
  };

  saveAccount(account);
  console.log(`✅ TikTok account connected: @${account.username}`);
  return account;
}

/** Refresh an expired access token */
export async function refreshAccessToken(account: TikTokAccount): Promise<TikTokAccount> {
  const { clientKey, clientSecret } = getConfig();

  const res = await fetch(TIKTOK_TOKEN, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_key: clientKey,
      client_secret: clientSecret,
      grant_type: 'refresh_token',
      refresh_token: account.refreshToken,
    }),
  });

  const data = await res.json();

  if (data.error || !data.access_token) {
    throw new Error(`Token refresh failed for @${account.username}: ${data.error_description || data.error}`);
  }

  account.accessToken = data.access_token;
  account.refreshToken = data.refresh_token;
  account.expiresAt = Date.now() + (data.expires_in * 1000);

  saveAccount(account);
  console.log(`🔄 Token refreshed for @${account.username}`);
  return account;
}

/** Ensure token is valid, refresh if needed */
async function ensureValidToken(account: TikTokAccount): Promise<TikTokAccount> {
  if (Date.now() >= account.expiresAt - 60000) { // Refresh 1 min before expiry
    return refreshAccessToken(account);
  }
  return account;
}

// ============================================================================
// User Info
// ============================================================================

async function fetchUserInfo(accessToken: string, openId: string) {
  try {
    const res = await fetch(`${TIKTOK_API}/user/info/?fields=open_id,union_id,avatar_url,display_name,username`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) return null;

    const data = await res.json();
    return data.data?.user;
  } catch {
    return null;
  }
}

// ============================================================================
// Carousel Publishing
// ============================================================================

/** Publish a photo carousel to TikTok via PULL_FROM_URL */
export async function publishCarousel(
  accountId: string,
  imageUrls: string[],
  title: string,
  description: string,
): Promise<TikTokPublishResult> {
  let account = getAccount(accountId);
  if (!account) {
    return { status: 'error', error: `Account ${accountId} not found` };
  }

  try {
    account = await ensureValidToken(account);

    // Resolve local slide files → upload to Firebase Storage for public URLs
    const finalUrls: string[] = [];
    for (const url of imageUrls) {
      if (url.includes('/api/slides/')) {
        const filename = url.split('/api/slides/').pop() || '';
        const tmpDir = path.join(process.cwd(), 'tmp', 'carousel');
        let filePath = '';
        if (fs.existsSync(tmpDir)) {
          const subdirs = fs.readdirSync(tmpDir).filter(d =>
            fs.statSync(path.join(tmpDir, d)).isDirectory()
          );
          for (const subdir of subdirs.reverse()) {
            const candidate = path.join(tmpDir, subdir, filename);
            if (fs.existsSync(candidate)) { filePath = candidate; break; }
          }
        }
        if (filePath) {
          const { uploadCarouselImage } = await import('./storage');
          const cdnUrl = await uploadCarouselImage(filePath);
          finalUrls.push(cdnUrl);
          console.log(`  ☁️ ${filename} → cdn.alaii.app`);
        } else {
          finalUrls.push(url);
        }
      } else {
        finalUrls.push(url);
      }
    }

    console.log(`  📡 Publishing ${finalUrls.length} photos via PULL_FROM_URL...`);

    // TikTok MEDIA_UPLOAD has ~90 char title limit (use 88 for safety)
    // Build caption: title + description snippet + hashtags (truncated to fit)
    const cleanTitle = title.replace(/[^\x20-\x7E]/g, '').trim();
    const cleanDesc = description.replace(/[^\x20-\x7E]/g, '').trim();
    
    // Extract hashtags from description (if any)
    const hashtagMatch = cleanDesc.match(/(#\w+[\s]*)+$/);
    const hashtags = hashtagMatch ? hashtagMatch[0].trim() : '';
    const descBody = cleanDesc.replace(/(#\w+[\s]*)+$/, '').trim();
    
    // Build caption: title first, then as much description as fits, then hashtags
    let caption = cleanTitle;
    if (descBody && (caption + ' - ' + descBody).length <= 88) {
      caption += ' - ' + descBody;
    }
    if (hashtags && (caption + ' ' + hashtags).length <= 88) {
      caption += ' ' + hashtags;
    }
    caption = caption.slice(0, 88);
    console.log(`  📝 Caption (${caption.length} chars): "${caption}"`);

    const requestBody = {
      post_info: {
        title: caption,
        privacy_level: 'PUBLIC_TO_EVERYONE',
      },
      source_info: {
        source: 'PULL_FROM_URL',
        photo_cover_index: 0,
        photo_images: finalUrls,
      },
      post_mode: 'DIRECT_POST',
      media_type: 'PHOTO',
    };
    console.log(`  📡 Request body:`, JSON.stringify(requestBody).slice(0, 500));

    const res = await fetch(`${TIKTOK_API}/post/publish/content/init/`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${account.accessToken}`,
        'Content-Type': 'application/json; charset=UTF-8',
      },
      body: JSON.stringify(requestBody),
    });

    const data = await res.json();
    console.log(`  📡 Response:`, JSON.stringify(data));

    if (data.error?.code && data.error.code !== 'ok') {
      return { status: 'error', error: data.error.message || data.error.code };
    }

    account.totalPosted += 1;
    account.lastPostedAt = new Date().toISOString();
    saveAccount(account);

    console.log(`✅ Carousel sent to @${account.username}'s TikTok (publish_id: ${data.data?.publish_id})`);
    return { publishId: data.data?.publish_id, status: 'success' };

  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error(`❌ TikTok publish error for @${account.username}:`, msg);
    return { status: 'error', error: msg };
  }
}

/** Post carousel to multiple accounts with rate limiting */
export async function publishCarouselToAll(
  imageUrls: string[],
  title: string,
  description: string,
  accountIds?: string[],
): Promise<Record<string, TikTokPublishResult>> {
  const accounts = getAllAccounts();
  const targets = accountIds
    ? accounts.filter(a => accountIds.includes(a.id))
    : accounts;

  const results: Record<string, TikTokPublishResult> = {};

  for (const account of targets) {
    console.log(`📤 Posting to @${account.username}...`);
    results[account.id] = await publishCarousel(account.id, imageUrls, title, description);

    // Rate limit: wait 10s between accounts
    if (targets.indexOf(account) < targets.length - 1) {
      console.log(`⏳ Waiting 10s (rate limit)...`);
      await new Promise(r => setTimeout(r, 10000));
    }
  }

  return results;
}
