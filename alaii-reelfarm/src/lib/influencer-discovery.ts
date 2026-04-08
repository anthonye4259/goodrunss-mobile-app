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
  findEngagementTargets,
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
    console.log('\n🎯 ══════════════════════════════════════════');
    console.log('   Daily Engagement Queue Generator Starting...');
    console.log('   ══════════════════════════════════════════\n');

    const todaysNiches = getTodaysEngagementNiches();
    platform = todaysNiches[0]?.platform || 'instagram';

    console.log(`📱 Today's platform: ${platform}`);
    console.log(`🎯 Today's niches: ${todaysNiches.map(n => n.niche.split(' ')[0]).join(', ')}\n`);

    for (const { niche, platform: plat } of todaysNiches) {
      try {
        console.log(`🔍 Finding engagement targets: "${niche}" on ${plat}...`);
        niches.push(niche);

        const task = await findEngagementTargets(niche, plat);
        const result = await waitForTask(task.taskId);

        if (result.status === 'completed' && result.result) {
          const targets = parseEngagementResults(result.result, niche, plat);
          totalTargets += targets.length;
          saveEngagementTargets(targets);

          console.log(`  ✅ Found ${targets.length} engagement targets`);
          for (const t of targets.slice(0, 3)) {
            console.log(`     ${t.handle} (${t.followers}) — "${t.suggestedComment.slice(0, 50)}..."`);
          }
        } else {
          console.log(`  ⚠️ No engagement targets found for "${niche}"`);
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

  // Engagement queue: 3x daily at 7 AM, 12 PM, 5 PM EST (11, 16, 21 UTC)
  cron.schedule('0 11 * * *', async () => {
    console.log('⏰ Morning engagement queue triggered');
    const result = await runEngagementQueueGeneration();
    console.log(`🎯 Queue: ${result.totalTargets} targets on ${result.platform}`);
  });

  cron.schedule('0 16 * * *', async () => {
    console.log('⏰ Midday engagement queue triggered');
    const result = await runEngagementQueueGeneration();
    console.log(`🎯 Queue: ${result.totalTargets} more targets`);
  });

  cron.schedule('0 21 * * *', async () => {
    console.log('⏰ Evening engagement queue triggered');
    const result = await runEngagementQueueGeneration();
    console.log(`🎯 Queue: ${result.totalTargets} more targets`);
  });

  const todaysQueue = getTodaysEngagementQueue();
  console.log(`   🎯 ${todaysQueue.length} engagement targets for today (goal: 100+)`);
  console.log('   ⏰ Discovery: daily at 6 AM EST');
  console.log('   ⏰ Engagement: 7 AM, 12 PM, 5 PM EST (all platforms)\n');
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
