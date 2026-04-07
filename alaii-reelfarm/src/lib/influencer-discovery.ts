// ============================================================================
// Alaii ReelFarm — Influencer & UGC Discovery Engine
// ============================================================================
// Automated pipeline that discovers beauty influencers via Manus AI,
// stores leads, and triggers outreach. Runs daily on Railway cron.

import * as fs from 'fs';
import * as path from 'path';
import cron from 'node-cron';
import {
  findInfluencers,
  waitForTask,
  parseInfluencerResults,
  type InfluencerLead,
} from './manus';

// ============================================================================
// Data Storage
// ============================================================================

const LEADS_FILE = path.join(process.cwd(), 'data', 'influencer-leads.json');

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
    // Don't overwrite outreach status if already contacted
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
];

// ============================================================================
// Discovery Engine
// ============================================================================

let isDiscovering = false;

/**
 * Run one full discovery cycle across all niches.
 * Searches each niche, deduplicates, and saves new leads.
 */
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

    // Pick 2-3 random niches per run to avoid API overuse
    const shuffled = [...BEAUTY_NICHES].sort(() => Math.random() - 0.5);
    const nichesToSearch = shuffled.slice(0, 3);

    for (const niche of nichesToSearch) {
      try {
        console.log(`\n🎯 Searching niche: "${niche}"...`);
        searchedNiches.push(niche);

        // Create Manus discovery task
        const task = await findInfluencers(niche, 5000, 100000, 'US');

        // Wait for results (up to 10 min per niche)
        const result = await waitForTask(task.taskId);

        if (result.status === 'completed' && result.result) {
          const leads = parseInfluencerResults(result.result, niche);
          totalFound += leads.length;

          // Deduplicate and save
          const existingHandles = new Set(
            getAllLeads().map((l) => l.handle.toLowerCase()),
          );

          for (const lead of leads) {
            if (!existingHandles.has(lead.handle.toLowerCase())) {
              saveLead(lead);
              newLeads++;
              existingHandles.add(lead.handle.toLowerCase());
              console.log(
                `  ✅ New lead: ${lead.handle} (${lead.followers.toLocaleString()} followers, ${lead.engagementRate}% engagement)`,
              );
            }
          }

          console.log(
            `  📊 ${niche}: ${leads.length} found, ${leads.length - (totalFound - newLeads)} new`,
          );
        } else {
          console.log(`  ⚠️ Niche "${niche}" returned no results`);
        }
      } catch (error) {
        console.error(`  ❌ Error searching "${niche}":`, error);
      }

      // Rate limit between niche searches
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
// Scheduler — Daily at 6 AM EST
// ============================================================================

export function startInfluencerDiscovery(): void {
  console.log('\n🔍 Influencer Discovery Engine initialized');
  console.log(`   📊 ${getAllLeads().length} leads in database`);

  // Run daily at 6 AM (EST = UTC-4, so 10 AM UTC)
  cron.schedule('0 10 * * *', async () => {
    console.log('⏰ Daily influencer discovery triggered');
    const result = await runInfluencerDiscovery();
    console.log(`📊 Daily discovery: ${result.newLeads} new leads from ${result.niches.length} niches`);
  });

  console.log('   ⏰ Scheduled: daily at 6 AM EST\n');
}

// ============================================================================
// Stats
// ============================================================================

export function getDiscoveryStats() {
  const leads = getAllLeads();
  return {
    totalLeads: leads.length,
    byStatus: {
      new: leads.filter((l) => l.outreachStatus === 'new').length,
      contacted: leads.filter((l) => l.outreachStatus === 'contacted').length,
      replied: leads.filter((l) => l.outreachStatus === 'replied').length,
      converted: leads.filter((l) => l.outreachStatus === 'converted').length,
      declined: leads.filter((l) => l.outreachStatus === 'declined').length,
    },
    byNiche: BEAUTY_NICHES.reduce(
      (acc, niche) => {
        const nicheKey = niche.split(' ')[0];
        acc[nicheKey] = leads.filter((l) => l.niche.includes(niche.split(' ')[0])).length;
        return acc;
      },
      {} as Record<string, number>,
    ),
    byPlatform: {
      instagram: leads.filter((l) => l.platform === 'instagram').length,
      tiktok: leads.filter((l) => l.platform === 'tiktok').length,
    },
  };
}
