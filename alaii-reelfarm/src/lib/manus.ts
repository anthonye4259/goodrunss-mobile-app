// ============================================================================
// Manus AI API Client
// ============================================================================
// Integrates with Manus AI's task-based API to leverage the Instagram
// Creator Marketplace connector for influencer/UGC discovery.

export interface ManusTask {
  taskId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: string;
}

export interface InfluencerLead {
  handle: string;
  platform: 'instagram' | 'tiktok';
  displayName: string;
  followers: number;
  engagementRate: number;
  niche: string;
  creatorType: 'influencer' | 'ugc' | 'affiliate';
  bio?: string;
  email?: string;
  profileUrl: string;
  discoveredAt: string;
  outreachStatus: 'new' | 'contacted' | 'replied' | 'converted' | 'declined';
  outreachSentAt?: string;
  notes?: string;
}

const MANUS_API_URL = 'https://api.manus.ai/v2';
const MANUS_API_KEY = process.env.MANUS_API_KEY || '';
const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN || '';
const SLACK_MANUS_CHANNEL_ID = process.env.SLACK_MANUS_CHANNEL_ID || '';

const useSlack = !!SLACK_BOT_TOKEN && !!SLACK_MANUS_CHANNEL_ID;

// ── Slack-based Manus Client (50% fewer credits) ──

const MANUS_SLACK_USER_ID = 'U0AR7EFRSET';

async function slackPostMessage(text: string): Promise<string> {
  const res = await fetch('https://slack.com/api/chat.postMessage', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${SLACK_BOT_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      channel: SLACK_MANUS_CHANNEL_ID,
      text: `<@${MANUS_SLACK_USER_ID}> ${text}`,
    }),
  });
  const data = await res.json();
  if (!data.ok) {
    throw new Error(`Slack postMessage failed: ${data.error}`);
  }
  return data.ts; // message timestamp (used to track conversation)
}

async function slackGetLatestBotReply(afterTs: string, maxWaitMs: number = 10 * 60 * 1000): Promise<string | null> {
  const startTime = Date.now();
  const pollInterval = 15000;

  while (Date.now() - startTime < maxWaitMs) {
    await new Promise(resolve => setTimeout(resolve, pollInterval));

    const res = await fetch(`https://slack.com/api/conversations.history?channel=${SLACK_MANUS_CHANNEL_ID}&oldest=${afterTs}&limit=20`, {
      headers: { Authorization: `Bearer ${SLACK_BOT_TOKEN}` },
    });
    const data = await res.json();

    if (data.ok && data.messages) {
      // Find bot messages (from Manus) after our message
      const botMessages = data.messages
        .filter((m: any) => m.ts > afterTs && m.bot_id)
        .sort((a: any, b: any) => parseFloat(b.ts) - parseFloat(a.ts));

      if (botMessages.length > 0) {
        const latest = botMessages[0];
        // Check if it looks like a complete response (has JSON or substantial text)
        const text = latest.text || '';
        if (text.length > 100 || text.includes('[') || text.includes('completed')) {
          return text;
        }
      }
    }
  }
  return null;
}

/** Send a task to Manus via Slack and wait for response */
async function manusViaSlack(prompt: string, waitForResponse: boolean = true): Promise<{ taskId: string; result?: string }> {
  console.log(`💬 Sending Manus task via Slack (50% credits)...`);
  const ts = await slackPostMessage(prompt);

  if (!waitForResponse) {
    return { taskId: `slack_${ts}` };
  }

  const response = await slackGetLatestBotReply(ts);
  if (response) {
    return { taskId: `slack_${ts}`, result: response };
  }
  return { taskId: `slack_${ts}` };
}

// ── Direct Manus API Client (fallback) ──

async function manusRequest(endpoint: string, body?: object, method: 'GET' | 'POST' = 'POST'): Promise<any> {
  if (!MANUS_API_KEY) {
    throw new Error('MANUS_API_KEY not configured');
  }

  const url = method === 'GET' && body
    ? `${MANUS_API_URL}/${endpoint}?${new URLSearchParams(body as Record<string, string>).toString()}`
    : `${MANUS_API_URL}/${endpoint}`;

  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'x-manus-api-key': MANUS_API_KEY,
    },
    ...(method === 'POST' && body ? { body: JSON.stringify(body) } : {}),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Manus API error ${res.status}: ${text}`);
  }

  return res.json();
}

/**
 * Create a Manus task to find influencers in a specific beauty niche.
 */
export async function findInfluencers(
  niche: string,
  minFollowers: number = 5000,
  maxFollowers: number = 100000,
  country: string = 'US',
): Promise<ManusTask> {
  const prompt = `Search Instagram Creator Marketplace for beauty industry creators matching these criteria:

NICHE: ${niche}
FOLLOWERS: ${minFollowers.toLocaleString()} - ${maxFollowers.toLocaleString()}
ENGAGEMENT RATE: minimum 2%
LOCATION: ${country}

Find the top 20 creators. For each, identify their TYPE:
- "influencer" = established beauty pro with large following
- "ugc" = creates product reviews, tutorials, get-ready-with-me content, before/after transformations
- "affiliate" = mentions promo codes, affiliate links, brand ambassador, or "collab" in bio

For each creator, provide:
1. Instagram handle (username)
2. Display name
3. Follower count
4. Engagement rate (%)
5. Bio summary
6. Contact email (if available in bio)
7. Profile URL
8. Creator type: "influencer", "ugc", or "affiliate"

Format the output as a JSON array:
[{"handle":"@example","displayName":"Name","followers":15000,"engagementRate":3.5,"bio":"Bio text","email":"email@example.com","profileUrl":"https://instagram.com/example","creatorType":"ugc"}]

Only return the JSON array, no other text.`;

  const result = await manusRequest('task.create', {
    message: {
      content: [
        {
          type: 'text',
          text: prompt,
        },
      ],
    },
    agent_profile: 'manus-1.6',
    interactive_mode: false,
    hide_in_task_list: false,
  });

  console.log(`🔍 Manus task created for "${niche}" via ${useSlack ? 'Slack' : 'API'}:`, result.task_id || result.id);

  return {
    taskId: result.task_id || result.id,
    status: 'pending',
  };
}

/**
 * Find influencers via Slack (50% credit savings) — fire and wait for response.
 */
export async function findInfluencersViaSlack(
  niche: string,
  minFollowers: number = 5000,
  maxFollowers: number = 100000,
  country: string = 'US',
): Promise<ManusTask> {
  const prompt = `Search Instagram Creator Marketplace for beauty industry creators matching these criteria:

NICHE: ${niche}
FOLLOWERS: ${minFollowers.toLocaleString()} - ${maxFollowers.toLocaleString()}
ENGAGEMENT RATE: minimum 2%
LOCATION: ${country}

Find the top 20 creators. For each, identify their TYPE:
- "influencer" = established beauty pro with large following
- "ugc" = creates product reviews, tutorials, get-ready-with-me content
- "affiliate" = mentions promo codes, affiliate links, brand ambassador

For each creator provide: Instagram handle, display name, follower count, engagement rate, bio summary, contact email, profile URL, creator type.

Format as JSON array:
[{"handle":"@example","displayName":"Name","followers":15000,"engagementRate":3.5,"bio":"Bio text","email":"email@example.com","profileUrl":"https://instagram.com/example","creatorType":"ugc"}]

Only return the JSON array.`;

  const slackResult = await manusViaSlack(prompt, true);
  console.log(`🔍 Manus discovery via Slack for "${niche}"`);

  return {
    taskId: slackResult.taskId,
    status: slackResult.result ? 'completed' : 'pending',
    result: slackResult.result,
  };
}

/**
 * Check the status of a Manus task via task.detail (GET).
 */
export async function getTaskStatus(taskId: string): Promise<ManusTask> {
  const detail = await manusRequest('task.detail', { task_id: taskId }, 'GET');

  const agentStatus = detail.agent_status || detail.status || 'pending';
  let status: ManusTask['status'] = 'pending';
  if (agentStatus === 'completed' || agentStatus === 'done') status = 'completed';
  else if (agentStatus === 'error' || agentStatus === 'failed') status = 'failed';
  else if (agentStatus === 'running') status = 'running';

  // If completed, fetch messages to get the result
  let result: string | undefined;
  if (status === 'completed') {
    try {
      const messages = await manusRequest('task.listMessages', {
        task_id: taskId,
        order: 'desc',
        limit: '10',
      }, 'GET');

      // Find assistant messages with the actual content
      const assistantMsgs = (messages.data || messages.messages || [])
        .filter((m: any) => m.role === 'assistant' || m.type === 'assistant_message');

      if (assistantMsgs.length > 0) {
        const lastMsg = assistantMsgs[0];
        result = typeof lastMsg.content === 'string'
          ? lastMsg.content
          : lastMsg.content?.map((c: any) => c.text || '').join('\n') || JSON.stringify(lastMsg);
      }
    } catch (msgErr) {
      console.warn('⚠️ Could not fetch task messages:', msgErr);
    }
  }

  return { taskId, status, result };
}

/**
 * Parse Manus task result into structured influencer leads.
 */
export function parseInfluencerResults(
  result: string,
  niche: string,
): InfluencerLead[] {
  try {
    // Extract JSON array from the result text
    const jsonMatch = result.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.warn('⚠️ No JSON array found in Manus result');
      return [];
    }

    const raw = JSON.parse(jsonMatch[0]) as any[];

    return raw.map((item: any) => ({
      handle: item.handle || item.username || '',
      platform: 'instagram' as const,
      displayName: item.displayName || item.display_name || item.name || '',
      followers: Number(item.followers) || 0,
      engagementRate: Number(item.engagementRate || item.engagement_rate) || 0,
      niche,
      creatorType: (['influencer', 'ugc', 'affiliate'].includes(item.creatorType || item.creator_type)
        ? item.creatorType || item.creator_type
        : 'influencer') as 'influencer' | 'ugc' | 'affiliate',
      bio: item.bio || '',
      email: item.email || undefined,
      profileUrl: item.profileUrl || item.profile_url || `https://instagram.com/${(item.handle || '').replace('@', '')}`,
      discoveredAt: new Date().toISOString(),
      outreachStatus: 'new' as const,
    }));
  } catch (error) {
    console.error('❌ Failed to parse Manus results:', error);
    return [];
  }
}

/**
 * Poll a Manus task until completion (with timeout).
 */
export async function waitForTask(
  taskId: string,
  maxWaitMs: number = 10 * 60 * 1000, // 10 minutes
  pollIntervalMs: number = 15000, // 15 seconds
): Promise<ManusTask> {
  const startTime = Date.now();

  while (Date.now() - startTime < maxWaitMs) {
    const task = await getTaskStatus(taskId);

    if (task.status === 'completed' || task.status === 'failed') {
      return task;
    }

    console.log(`⏳ Manus task ${taskId}: ${task.status}...`);
    await new Promise(resolve => setTimeout(resolve, pollIntervalMs));
  }

  return { taskId, status: 'failed', result: 'Timeout waiting for Manus task' };
}

// ============================================================================
// Engagement Target Discovery
// ============================================================================

export interface EngagementTarget {
  handle: string;
  platform: 'instagram' | 'tiktok' | 'facebook';
  displayName: string;
  followers: number;
  niche: string;
  profileUrl: string;
  latestPostUrl?: string;
  suggestedComment: string;
  suggestedAction: 'follow_like_comment' | 'follow_like' | 'like_comment';
  discoveredAt: string;
  engaged: boolean;
}

const ENGAGEMENT_NICHES = [
  // Beauty pros to warm up
  'lash technician lash extensions lash artist',
  'medspa injector botox filler nurse injector',
  'hair stylist hairdresser salon owner colorist',
  'esthetician skincare facial treatment',
  'nail technician nail artist',
  'permanent makeup microblading brow artist',
  'barber barbershop owner',
  // Beauty schools
  'beauty school cosmetology school aesthetician school',
  'cosmetology student beauty student graduating',
];

/**
 * Ask Manus to find beauty pros to engage with on IG, TikTok, and Facebook.
 * Returns profiles + suggested comments for daily warmup.
 */
export async function findEngagementTargets(
  niche: string,
  platform: 'instagram' | 'tiktok' | 'facebook' = 'instagram',
): Promise<ManusTask> {
  const platformInstructions: Record<string, string> = {
    instagram: `Search Instagram for active beauty professionals in this niche. Look for accounts that:
- Post regularly (at least 1x/week)
- Have 1,000 - 50,000 followers (not too big, not too small)
- Are real professionals (not meme pages or repost accounts)
- Have a business or professional account
- Are based in the US

Search using hashtags like #${niche.split(' ')[0]}, #${niche.split(' ')[1] || 'beauty'}life, and search the Instagram search/explore page.`,

    tiktok: `Search TikTok for active beauty professionals in this niche. Look for accounts that:
- Post beauty content regularly
- Have 1,000 - 100,000 followers
- Are real professionals showing their work
- Are based in the US

Search using TikTok's creator search and hashtags.`,

    facebook: `Search Facebook for beauty professionals and beauty business pages in this niche. Look for:
- Active business pages with regular posts
- Beauty schools with active student communities
- Local medspa/salon pages
- Have 500 - 20,000 followers
- Are based in the US`,
  };

  const prompt = `Find 25 active ${niche} professionals on ${platform} that I should engage with (follow, like their posts, and comment).

${platformInstructions[platform]}

For each account, provide:
1. Their handle/username
2. Display name
3. Approximate follower count
4. Their niche (be specific: "lash tech", "medspa owner", etc.)
5. Profile URL
6. URL of their latest/most recent post (if possible)
7. A suggested comment to leave on their latest post. The comment should:
   - Be genuinely helpful or complimentary about their specific work
   - Sound natural, not promotional
   - Be 1-2 sentences max
   - NO em dashes, NO semicolons
   - Example: "the volume on that set is crazy good. how long did the fill take?"
   - Example: "that before/after is unreal, your clients must love you"

Format as JSON array:
[{"handle":"@example","displayName":"Jane Smith","followers":5000,"niche":"lash tech","profileUrl":"https://instagram.com/example","latestPostUrl":"https://instagram.com/p/abc123","suggestedComment":"wow that lash map is perfect. what brand of fans do you use?","suggestedAction":"follow_like_comment"}]

Only return the JSON array.`;

  const result = await manusRequest('task.create', {
    message: {
      content: [{ type: 'text', text: prompt }],
    },
    agent_profile: 'manus-1.6',
    interactive_mode: false,
    hide_in_task_list: false,
  });

  console.log(`🎯 Manus engagement task created for "${niche}" on ${platform}:`, result.task_id || result.id);

  return {
    taskId: result.task_id || result.id,
    status: 'pending',
  };
}

/**
 * Parse engagement target results from Manus.
 */
export function parseEngagementResults(
  result: string,
  niche: string,
  platform: 'instagram' | 'tiktok' | 'facebook',
): EngagementTarget[] {
  try {
    const jsonMatch = result.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.warn('⚠️ No JSON array found in engagement results');
      return [];
    }

    const raw = JSON.parse(jsonMatch[0]) as any[];

    return raw.map((item: any) => ({
      handle: item.handle || item.username || '',
      platform,
      displayName: item.displayName || item.display_name || item.name || '',
      followers: Number(item.followers) || 0,
      niche: item.niche || niche.split(' ')[0],
      profileUrl: item.profileUrl || item.profile_url || '',
      latestPostUrl: item.latestPostUrl || item.latest_post_url || undefined,
      suggestedComment: item.suggestedComment || item.suggested_comment || '',
      suggestedAction: item.suggestedAction || 'follow_like_comment',
      discoveredAt: new Date().toISOString(),
      engaged: false,
    }));
  } catch (error) {
    console.error('❌ Failed to parse engagement results:', error);
    return [];
  }
}

/** Get today's engagement niches — all 3 platforms, 6 niches total */
export function getTodaysEngagementNiches(): { niche: string; platform: 'instagram' | 'tiktok' | 'facebook' }[] {
  const dayOfWeek = new Date().getDay();
  const platforms: ('instagram' | 'tiktok' | 'facebook')[] = ['instagram', 'tiktok', 'facebook'];

  // Pick 2 niches per platform = 6 total searches = ~150 targets
  const results: { niche: string; platform: 'instagram' | 'tiktok' | 'facebook' }[] = [];
  for (const platform of platforms) {
    const startIdx = (dayOfWeek * 2 + platforms.indexOf(platform) * 3) % ENGAGEMENT_NICHES.length;
    results.push(
      { niche: ENGAGEMENT_NICHES[startIdx], platform },
      { niche: ENGAGEMENT_NICHES[(startIdx + 1) % ENGAGEMENT_NICHES.length], platform },
    );
  }
  return results;
}
