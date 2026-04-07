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

  console.log(`🔍 Manus task created for "${niche}":`, result.task_id || result.id);

  return {
    taskId: result.task_id || result.id,
    status: 'pending',
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
