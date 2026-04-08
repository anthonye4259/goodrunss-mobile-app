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

// ============================================================================
// Instagram Carousel Publishing (for image carousels)
// ============================================================================

/** Create a carousel child item (image) */
async function createCarouselChild(imageUrl: string): Promise<string> {
  const { userId, accessToken } = getConfig();

  const params = new URLSearchParams({
    image_url: imageUrl,
    is_carousel_item: 'true',
    access_token: accessToken,
  });

  const res = await fetch(`${IG_API_BASE}/${userId}/media`, {
    method: 'POST',
    body: params,
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(`IG carousel child failed: ${JSON.stringify(error)}`);
  }

  const data = await res.json();
  return data.id;
}

/** Create carousel container and publish */
export async function publishCarousel(
  imageUrls: string[],
  caption: string,
): Promise<IGPublishResult> {
  try {
    // Check if we have direct Graph API creds
    const hasDirectCreds = process.env.IG_USER_ID && process.env.IG_ACCESS_TOKEN;

    if (hasDirectCreds) {
      return await publishCarouselDirect(imageUrls, caption);
    } else {
      return await publishCarouselViaManus(imageUrls, caption);
    }
  } catch (error) {
    return {
      containerId: '',
      status: 'error',
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/** Direct Graph API carousel publishing */
async function publishCarouselDirect(
  imageUrls: string[],
  caption: string,
): Promise<IGPublishResult> {
  const { userId, accessToken } = getConfig();

  // Step 1: Create child containers for each image
  console.log(`📸 Creating ${imageUrls.length} IG carousel children...`);
  const childIds: string[] = [];
  for (const url of imageUrls) {
    const childId = await createCarouselChild(url);
    childIds.push(childId);
    await sleep(1000); // Rate limit
  }

  // Step 2: Create carousel container
  const params = new URLSearchParams({
    media_type: 'CAROUSEL',
    caption,
    access_token: accessToken,
  });
  childIds.forEach(id => params.append('children', id));

  const res = await fetch(`${IG_API_BASE}/${userId}/media`, {
    method: 'POST',
    body: params,
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(`IG carousel container failed: ${JSON.stringify(error)}`);
  }

  const container = await res.json();
  console.log('📦 IG carousel container:', container.id);

  // Step 3: Poll until ready
  const status = await pollContainerStatus(container.id);
  if (status === 'ERROR') {
    return { containerId: container.id, status: 'error', error: 'Processing failed' };
  }

  // Step 4: Publish
  const mediaId = await publishContainer(container.id);
  console.log('✅ IG carousel published! Media ID:', mediaId);

  return { containerId: container.id, mediaId, status: 'published' };
}

/** Manus-based carousel publishing (via Slack for 50% savings, fallback to API) */
async function publishCarouselViaManus(
  imageUrls: string[],
  caption: string,
): Promise<IGPublishResult> {
  const MANUS_API_KEY = process.env.MANUS_API_KEY;
  if (!MANUS_API_KEY) {
    return { containerId: '', status: 'error', error: 'No IG creds or MANUS_API_KEY' };
  }

  const prompt = `Post a carousel to my Instagram account.

CAROUSEL IMAGES (post these in order as a single carousel post):
${imageUrls.map((url, i) => `${i + 1}. ${url}`).join('\n')}

CAPTION:
${caption}

Post this as an Instagram carousel with all ${imageUrls.length} images. Confirm when posted.`;

  const res = await fetch('https://api.manus.ai/v2/task.create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-manus-api-key': MANUS_API_KEY,
    },
    body: JSON.stringify({
      message: { content: [{ type: 'text', text: prompt }] },
      agent_profile: 'manus-1.6',
      interactive_mode: false,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    return { containerId: '', status: 'error', error: `Manus: ${text}` };
  }

  const result = await res.json();
  const taskId = result.task_id || result.id;
  console.log(`📸 IG carousel submitted via Manus API (task: ${taskId})`);

  return { containerId: taskId, status: 'published' };
}

/** Generate beauty-specific Instagram hashtags (3-tier strategy: base + niche + trending) */
export function generateHashtags(topic: string): string[] {
  // Tier 1: Core brand + general beauty (always included)
  const base = ['alaii', 'beautybusiness', 'beautyentrepreneur', 'salonowner', 'beautypro', 'beautyindustry', 'freebooking'];

  // Tier 2: Niche-specific (matched from topic)
  const nicheMap: Record<string, string[]> = {
    'no-show': ['noshows', 'salonlife', 'clientretention', 'cancellationpolicy', 'salonproblems'],
    'book': ['onlinebooking', 'fullybooked', 'bookingapp', 'appointmentbooking', 'bookingsystem'],
    'lash': ['lashtech', 'lashartist', 'lashextensions', 'lashlove', 'lashboss', 'volumelashes'],
    'hair': ['hairstylist', 'hairsalon', 'behindthechair', 'haircolorist', 'salonlife', 'hairdresser'],
    'inject': ['medspa', 'injector', 'botox', 'aesthetics', 'nurseinjector', 'fillers', 'medspabusiness'],
    'nail': ['nailtech', 'nailartist', 'nailsalon', 'nailboss', 'naillife'],
    'skin': ['esthetician', 'skincare', 'facial', 'skincareroutine', 'aesthetician'],
    'automat': ['automation', 'aitools', 'businessautomation', 'techforbusiness'],
    'cancel': ['cancellations', 'lastminutecancellation', 'emptychairs', 'fillyourschedule'],
    'barber': ['barber', 'barbershop', 'barberlife', 'fade', 'mensgrooming'],
    'wax': ['waxing', 'waxspecialist', 'bodywaxing', 'estheticianlife'],
    'brow': ['microblading', 'browartist', 'browsonfleek', 'permanentmakeup'],
  };

  // Tier 3: Trending / engagement boosters
  const trending = ['smallbusinessowner', 'womeninbusiness', 'bossbabes', 'entrepreneurlife', 'solopreneur', 'sidehustle'];

  const topicLower = topic.toLowerCase();
  const niche: string[] = [];
  for (const [key, tags] of Object.entries(nicheMap)) {
    if (topicLower.includes(key)) niche.push(...tags);
  }

  // Combine all tiers, deduplicate, cap at 28 (IG limit is 30)
  const all = [...new Set([...base, ...niche, ...trending])];
  return all.slice(0, 28);
}
