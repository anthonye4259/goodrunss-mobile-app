// ============================================================================
// Alaii ReelFarm — Instagram Graph API Client
// ============================================================================
// Handles the full Reels publishing flow:
// 1. Create media container (media_type=REELS)
// 2. Poll for processing completion
// 3. Publish the container
// 4. Fetch insights

import type { IGPublishResult } from '@/types';

const IG_API_BASE = 'https://graph.facebook.com/v21.0';

function getConfig() {
  const userId = process.env.IG_USER_ID;
  const accessToken = process.env.IG_ACCESS_TOKEN;
  if (!userId || !accessToken) {
    throw new Error('Missing IG_USER_ID or IG_ACCESS_TOKEN in environment');
  }
  return { userId, accessToken };
}

/** Step 1: Create a media container for a Reel */
export async function createReelContainer(
  videoUrl: string,
  caption: string,
  shareToFeed: boolean = true
): Promise<string> {
  const { userId, accessToken } = getConfig();

  const params = new URLSearchParams({
    media_type: 'REELS',
    video_url: videoUrl,
    caption,
    share_to_feed: String(shareToFeed),
    access_token: accessToken,
  });

  const res = await fetch(`${IG_API_BASE}/${userId}/media`, {
    method: 'POST',
    body: params,
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(`IG container creation failed: ${JSON.stringify(error)}`);
  }

  const data = await res.json();
  console.log('📦 IG container created:', data.id);
  return data.id;
}

/** Step 2: Poll container status until processing is complete */
export async function pollContainerStatus(
  containerId: string,
  maxAttempts: number = 30,
  intervalMs: number = 5000
): Promise<'FINISHED' | 'ERROR'> {
  const { accessToken } = getConfig();

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const res = await fetch(
      `${IG_API_BASE}/${containerId}?fields=status_code,status&access_token=${accessToken}`
    );

    if (!res.ok) {
      console.error('❌ Poll failed:', await res.text());
      await sleep(intervalMs);
      continue;
    }

    const data = await res.json();
    console.log(`⏳ Container status (attempt ${attempt + 1}):`, data.status_code);

    if (data.status_code === 'FINISHED') {
      return 'FINISHED';
    }

    if (data.status_code === 'ERROR') {
      console.error('❌ Container processing error:', data.status);
      return 'ERROR';
    }

    // Still processing (IN_PROGRESS)
    await sleep(intervalMs);
  }

  throw new Error(`Container ${containerId} did not finish processing after ${maxAttempts} attempts`);
}

/** Step 3: Publish the processed container */
export async function publishContainer(containerId: string): Promise<string> {
  const { userId, accessToken } = getConfig();

  const params = new URLSearchParams({
    creation_id: containerId,
    access_token: accessToken,
  });

  const res = await fetch(`${IG_API_BASE}/${userId}/media_publish`, {
    method: 'POST',
    body: params,
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(`IG publish failed: ${JSON.stringify(error)}`);
  }

  const data = await res.json();
  console.log('✅ Reel published! Media ID:', data.id);
  return data.id;
}

/** Full publish flow: create → poll → publish */
export async function publishReel(videoUrl: string, caption: string): Promise<IGPublishResult> {
  try {
    // Step 1: Create container
    const containerId = await createReelContainer(videoUrl, caption);

    // Step 2: Poll until ready
    const status = await pollContainerStatus(containerId);
    if (status === 'ERROR') {
      return { containerId, status: 'error', error: 'Container processing failed' };
    }

    // Step 3: Publish
    const mediaId = await publishContainer(containerId);

    return {
      containerId,
      mediaId,
      status: 'published',
    };
  } catch (error) {
    return {
      containerId: '',
      status: 'error',
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/** Fetch insights for a published Reel */
export async function getReelInsights(mediaId: string) {
  const { accessToken } = getConfig();

  const metrics = 'plays,likes,comments,shares,saved,reach';
  const res = await fetch(
    `${IG_API_BASE}/${mediaId}/insights?metric=${metrics}&access_token=${accessToken}`
  );

  if (!res.ok) {
    console.error('Failed to fetch insights:', await res.text());
    return null;
  }

  const data = await res.json();
  return data.data;
}

/** Get account info */
export async function getAccountInfo() {
  const { userId, accessToken } = getConfig();

  const res = await fetch(
    `${IG_API_BASE}/${userId}?fields=username,followers_count,media_count&access_token=${accessToken}`
  );

  if (!res.ok) return null;
  return res.json();
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
