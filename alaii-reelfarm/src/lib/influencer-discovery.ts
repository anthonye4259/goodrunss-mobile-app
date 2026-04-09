// ============================================================================
// Alaii ReelFarm — Influencer & UGC Discovery + Engagement Queue Engine
// ============================================================================
// Automated pipeline that discovers beauty influencers via Manus AI,
// stores leads, triggers outreach, and generates daily engagement queues.
// Runs daily on Railway cron.

import * as fs from 'fs';
import * as path from 'path';
import cron from 'node-cron';
import {
  findInfluencers,
  findInfluencersViaSlack,
  waitForTask,
  parseInfluencerResults,
  parseEngagementResults,
  getTodaysEngagementNiches,
  type InfluencerLead,
  type EngagementTarget,
} from './manus';

// ============================================================================
// Data Storage
// ============================================================================

const LEADS_FILE = path.join(process.cwd(), 'data', 'influencer-leads.json');
const ENGAGEMENT_FILE = path.join(process.cwd(), 'data', 'engagement-queue.json');

function ensureLeadsFile() {
  const dir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(LEADS_FILE)) {
    fs.writeFileSync(LEADS_FILE, JSON.stringify([], null, 2));
  }
}

export function getAllLeads(): InfluencerLead[] {
  ensureLeadsFile();
  return JSON.parse(fs.readFileSync(LEADS_FILE, 'utf-8'));
}

export function saveLead(lead: InfluencerLead): void {
  ensureLeadsFile();
  const leads = getAllLeads();
  const existing = leads.findIndex(
    (l) => l.handle === lead.handle && l.platform === lead.platform,
  );
  if (existing >= 0) {
    if (leads[existing].outreachStatus !== 'new') {
      lead.outreachStatus = leads[existing].outreachStatus;
      lead.outreachSentAt = leads[existing].outreachSentAt;
    }
    leads[existing] = { ...leads[existing], ...lead };
  } else {
    leads.push(lead);
  }
  fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2));
}

export function updateLeadStatus(
  handle: string,
  platform: string,
  status: InfluencerLead['outreachStatus'],
): void {
  ensureLeadsFile();
  const leads = getAllLeads();
  const lead = leads.find((l) => l.handle === handle && l.platform === platform);
  if (lead) {
    lead.outreachStatus = status;
    if (status === 'contacted') lead.outreachSentAt = new Date().toISOString();
    fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2));
  }
}

// ============================================================================
// Engagement Queue Storage
// ============================================================================

function ensureEngagementFile() {
  const dir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(ENGAGEMENT_FILE)) {
    fs.writeFileSync(ENGAGEMENT_FILE, JSON.stringify([], null, 2));
  }
}

export function getTodaysEngagementQueue(): EngagementTarget[] {
  ensureEngagementFile();
  const all: EngagementTarget[] = JSON.parse(fs.readFileSync(ENGAGEMENT_FILE, 'utf-8'));
  const today = new Date().toDateString();
  return all.filter(t => new Date(t.discoveredAt).toDateString() === today);
}

export function getAllEngagementTargets(): EngagementTarget[] {
  ensureEngagementFile();
  return JSON.parse(fs.readFileSync(ENGAGEMENT_FILE, 'utf-8'));
}

function saveEngagementTargets(targets: EngagementTarget[]): void {
  ensureEngagementFile();
  const existing = getAllEngagementTargets();
  const existingHandles = new Set(existing.map(t => t.handle.toLowerCase()));
  const newTargets = targets.filter(t => !existingHandles.has(t.handle.toLowerCase()));
  const all = [...existing, ...newTargets];
  // Keep only last 7 days
  const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const trimmed = all.filter(t => new Date(t.discoveredAt).getTime() > cutoff);
  fs.writeFileSync(ENGAGEMENT_FILE, JSON.stringify(trimmed, null, 2));
}

export function markEngaged(handle: string): void {
  ensureEngagementFile();
  const all = getAllEngagementTargets();
  const target = all.find(t => t.handle.toLowerCase() === handle.toLowerCase());
  if (target) {
    target.engaged = true;
    fs.writeFileSync(ENGAGEMENT_FILE, JSON.stringify(all, null, 2));
  }
}

// ============================================================================
// Beauty Niches to Search
// ============================================================================

const BEAUTY_NICHES = [
  'medspa injector botox filler aesthetics',
  'hair stylist hairdresser salon colorist',
  'lash technician lash extensions lash artist',
  'esthetician skincare facial waxing',
  'nail technician nail artist manicurist',
  'permanent makeup microblading brow artist',
  'barber barbershop mens grooming',
  'makeup artist MUA bridal makeup',
  'UGC creator beauty skincare product review tutorial',
  'beauty content creator get ready with me GRWM salon',
  'hair transformation before after stylist content',
  'lash tutorial content creator beauty vlog',
  'beauty affiliate brand ambassador promo code discount',
  'salon owner looking for tools booking software reviews',
  'beauty entrepreneur small business owner collab open',
];

// ============================================================================
// Discovery Engine
// ============================================================================

let isDiscovering = false;

export async function runInfluencerDiscovery(): Promise<{
  totalFound: number;
  newLeads: number;
  niches: string[];
}> {
  if (isDiscovering) {
    console.log('⏸️ Discovery already running, skipping...');
    return { totalFound: 0, newLeads: 0, niches: [] };
  }

  isDiscovering = true;
  let totalFound = 0;
  let newLeads = 0;
  const searchedNiches: string[] = [];

  try {
    console.log('\n🔍 ══════════════════════════════════════════');
    console.log('   Influencer Discovery Engine Starting...');
    console.log('   ══════════════════════════════════════════\n');

    const shuffled = [...BEAUTY_NICHES].sort(() => Math.random() - 0.5);
    const nichesToSearch = shuffled.slice(0, 3);

    for (const niche of nichesToSearch) {
      try {
        console.log(`\n🎯 Searching niche: "${niche}"...`);
        searchedNiches.push(niche);

        const task = await findInfluencers(niche, 5000, 100000, 'US');
        const result = await waitForTask(task.taskId);

        if (result.status === 'completed' && result.result) {
          const leads = parseInfluencerResults(result.result, niche);
          totalFound += leads.length;

          const existingHandles = new Set(
            getAllLeads().map((l) => l.handle.toLowerCase()),
          );

          for (const lead of leads) {
            if (!existingHandles.has(lead.handle.toLowerCase())) {
              saveLead(lead);
              newLeads++;
              existingHandles.add(lead.handle.toLowerCase());
              console.log(
                `  ✅ New: ${lead.handle} (${lead.followers.toLocaleString()} followers)`,
              );
            }
          }
        } else {
          console.log(`  ⚠️ Niche "${niche}" returned no results`);
        }
      } catch (error) {
        console.error(`  ❌ Error searching "${niche}":`, error);
      }

      await new Promise((resolve) => setTimeout(resolve, 5000));
    }

    console.log('\n🔍 ══════════════════════════════════════════');
    console.log(`   Discovery complete: ${totalFound} found, ${newLeads} new leads`);
    console.log(`   Total leads in database: ${getAllLeads().length}`);
    console.log('   ══════════════════════════════════════════\n');
  } catch (error) {
    console.error('❌ Discovery engine error:', error);
  } finally {
    isDiscovering = false;
  }

  return { totalFound, newLeads, niches: searchedNiches };
}

// ============================================================================
// Engagement Queue Generator
// ============================================================================

let isGeneratingQueue = false;

export async function runEngagementQueueGeneration(): Promise<{
  totalTargets: number;
  platform: string;
  niches: string[];
}> {
  if (isGeneratingQueue) {
    console.log('⏸️ Engagement queue already generating, skipping...');
    return { totalTargets: 0, platform: '', niches: [] };
  }

  isGeneratingQueue = true;
  let totalTargets = 0;
  const niches: string[] = [];
  let platform = '';

  try {
    const Anthropic = (await import('@anthropic-ai/sdk')).default;
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    console.log('\n🎯 ══════════════════════════════════════════');
    console.log('   Engagement Queue Generator (Claude)...');
    console.log('   ══════════════════════════════════════════\n');

    const todaysNiches = getTodaysEngagementNiches();
    platform = todaysNiches[0]?.platform || 'instagram';

    console.log(`📱 Today's platforms: ${[...new Set(todaysNiches.map(n => n.platform))].join(', ')}`);
    console.log(`🎯 Today's niches: ${todaysNiches.map(n => n.niche.split(' ')[0]).join(', ')}\n`);

    for (const { niche, platform: plat } of todaysNiches) {
      try {
        console.log(`🔍 Finding engagement targets: "${niche}" on ${plat}...`);
        niches.push(niche);

        const response = await client.messages.create({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 4000,
          messages: [{
            role: 'user',
            content: `Generate a list of 25 real, active ${niche} professionals on ${plat} that a booking app for beauty pros should engage with (follow, like, comment).

These should be real-sounding profiles of actual beauty professionals who:
- Post regularly about their work
- Have 1,000 - 50,000 followers
- Are real professionals (not meme pages)
- Are based in the US

For each, provide a suggested comment to leave on their latest post:
- Be genuinely complimentary about their specific work
- Sound natural, not promotional. No em dashes or semicolons.
- 1-2 sentences max
- Example: "the volume on that set is crazy good. how long did the fill take?"

Return ONLY a JSON array:
[{"handle":"@example","displayName":"Jane Smith","followers":5000,"niche":"lash tech","profileUrl":"https://${plat === 'facebook' ? 'facebook.com' : plat === 'tiktok' ? 'tiktok.com/@' : 'instagram.com/'}example","suggestedComment":"wow that lash map is perfect. what brand do you use?","suggestedAction":"follow_like_comment"}]`,
          }],
        });

        const text = response.content[0];
        const resultText = text.type === 'text' ? text.text : '';
        const targets = parseEngagementResults(resultText, niche, plat);
        totalTargets += targets.length;
        saveEngagementTargets(targets);

        console.log(`  ✅ Found ${targets.length} engagement targets`);
        for (const t of targets.slice(0, 3)) {
          console.log(`     ${t.handle} (${t.followers}) — "${t.suggestedComment.slice(0, 50)}..."`);
        }
      } catch (error) {
        console.error(`  ❌ Error finding targets for "${niche}":`, error);
      }

      await new Promise(resolve => setTimeout(resolve, 5000));
    }

    const todaysQueue = getTodaysEngagementQueue();
    console.log('\n🎯 ══════════════════════════════════════════');
    console.log(`   Queue ready: ${todaysQueue.length} targets for today`);
    console.log(`   Platform: ${platform}`);
    console.log('   ══════════════════════════════════════════\n');

    // Send engagement queue to Slack
    const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN;
    const SLACK_CHANNEL = process.env.SLACK_MANUS_CHANNEL_ID;
    if (SLACK_BOT_TOKEN && SLACK_CHANNEL && todaysQueue.length > 0) {
      try {
        const notEngaged = todaysQueue.filter(t => !t.engaged);
        const grouped: Record<string, typeof notEngaged> = {};
        for (const t of notEngaged) {
          const key = t.platform;
          if (!grouped[key]) grouped[key] = [];
          grouped[key].push(t);
        }

        let msg = `🎯 *Daily Engagement Queue* (${new Date().toLocaleDateString()})\n`;
        msg += `${notEngaged.length} accounts to engage with today\n\n`;

        for (const [plat, targets] of Object.entries(grouped)) {
          msg += `*📱 ${plat.toUpperCase()}*\n`;
          for (const t of targets) {
            msg += `• *${t.handle}* (${t.followers.toLocaleString()} followers, ${t.niche})\n`;
            msg += `  ${t.profileUrl}\n`;
            msg += `  💬 _"${t.suggestedComment}"_\n`;
            msg += `  Action: ${t.suggestedAction.replace(/_/g, ' + ')}\n\n`;
          }
        }

        msg += `_Follow → Like 3 posts → Drop the comment. ~15 min total._`;

        await fetch('https://slack.com/api/chat.postMessage', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${SLACK_BOT_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ channel: SLACK_CHANNEL, text: msg }),
        });
        console.log(`📬 Engagement queue sent to Slack (${notEngaged.length} targets)`);
      } catch (slackErr) {
        console.warn('⚠️ Failed to send queue to Slack:', slackErr);
      }
    }
  } catch (error) {
    console.error('❌ Engagement queue error:', error);
  } finally {
    isGeneratingQueue = false;
  }

  return { totalTargets, platform, niches };
}

// ============================================================================
// Scheduler
// ============================================================================

export function startInfluencerDiscovery(): void {
  console.log('\n🔍 Influencer Discovery Engine initialized');
  console.log(`   📊 ${getAllLeads().length} leads in database`);

  // Discovery: daily at 6 AM EST (10 AM UTC)
  cron.schedule('0 10 * * *', async () => {
    console.log('⏰ Daily influencer discovery triggered');
    const result = await runInfluencerDiscovery();
    console.log(`📊 Discovery: ${result.newLeads} new leads`);
  });

  // DISABLED — engagement queue was a time waster
  // cron.schedule('0 11 * * *', ...);  // morning
  // cron.schedule('0 16 * * *', ...);  // midday
  // cron.schedule('0 21 * * *', ...);  // evening

  console.log(`   ⏰ Discovery: daily at 6 AM EST`);
  console.log('   📬 Status summary: every 6 hours to Slack\n');

  // Status summary: every 6 hours (6AM, 12PM, 6PM, 12AM EST = 10, 16, 22, 4 UTC)
  cron.schedule('0 4,10,16,22 * * *', async () => {
    await sendSlackStatusSummary();
  });
}

/** Send a full status summary to Slack */
async function sendSlackStatusSummary(): Promise<void> {
  const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN;
  const SLACK_CHANNEL = process.env.SLACK_MANUS_CHANNEL_ID;
  if (!SLACK_BOT_TOKEN || !SLACK_CHANNEL) return;

  try {
    // Gather all stats
    const { getAllCarouselPosts } = await import('./carousel-autopilot');
    const posts = getAllCarouselPosts();
    const todayPosts = posts.filter(p => {
      const d = new Date(p.createdAt);
      return d.toDateString() === new Date().toDateString();
    });
    const discoveryStats = getDiscoveryStats();

    const posted = todayPosts.filter(p => p.status === 'posted').length;
    const failed = todayPosts.filter(p => p.status === 'failed').length;

    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZone: 'America/New_York' });

    let msg = `📊 *Alaii Growth Engine Status* (${now.toLocaleDateString()} ${timeStr} EST)\n\n`;

    // TikTok + IG
    msg += `*🎵 TikTok + 📸 Instagram Carousels*\n`;
    msg += `  Posted today: ${posted} | Failed: ${failed} | Total in queue: ${posts.length}\n\n`;

    // Influencer Discovery
    msg += `*🔍 Influencer Discovery*\n`;
    msg += `  Total leads: ${discoveryStats.totalLeads}\n`;
    msg += `  New: ${discoveryStats.byStatus.new} | Contacted: ${discoveryStats.byStatus.contacted} | Replied: ${discoveryStats.byStatus.replied} | Converted: ${discoveryStats.byStatus.converted}\n\n`;

    // Engagement Queue
    msg += `*🎯 Engagement Queue*\n`;
    msg += `  Today: ${discoveryStats.engagementQueue.todayTargets} targets (${discoveryStats.engagementQueue.todayEngaged} engaged)\n`;
    msg += `  7-day total: ${discoveryStats.engagementQueue.totalTargets7d}\n\n`;

    msg += `_Next summary in 6 hours. Full stats: /api/health_`;

    await fetch('https://slack.com/api/chat.postMessage', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${SLACK_BOT_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ channel: SLACK_CHANNEL, text: msg }),
    });

    console.log(`📬 Status summary sent to Slack at ${timeStr} EST`);
  } catch (err) {
    console.error('❌ Failed to send Slack summary:', err);
  }
}

// ============================================================================
// Stats
// ============================================================================

export function getDiscoveryStats() {
  const leads = getAllLeads();
  const engagementQueue = getTodaysEngagementQueue();
  const allEngagement = getAllEngagementTargets();
  return {
    totalLeads: leads.length,
    byStatus: {
      new: leads.filter((l) => l.outreachStatus === 'new').length,
      contacted: leads.filter((l) => l.outreachStatus === 'contacted').length,
      replied: leads.filter((l) => l.outreachStatus === 'replied').length,
      converted: leads.filter((l) => l.outreachStatus === 'converted').length,
      declined: leads.filter((l) => l.outreachStatus === 'declined').length,
    },
    byPlatform: {
      instagram: leads.filter((l) => l.platform === 'instagram').length,
      tiktok: leads.filter((l) => l.platform === 'tiktok').length,
    },
    engagementQueue: {
      todayTargets: engagementQueue.length,
      todayEngaged: engagementQueue.filter(t => t.engaged).length,
      totalTargets7d: allEngagement.length,
    },
  };
}
