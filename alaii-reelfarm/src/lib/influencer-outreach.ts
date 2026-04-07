// ============================================================================
// Alaii ReelFarm — Influencer Auto-Outreach
// ============================================================================
// Sends personalized affiliate/collaboration offers to discovered influencers.
// Uses Claude to generate tailored messages based on influencer niche & profile.

import Anthropic from '@anthropic-ai/sdk';
import * as fs from 'fs';
import * as path from 'path';
import cron from 'node-cron';
import {
  getAllLeads,
  updateLeadStatus,
} from './influencer-discovery';
import type { InfluencerLead } from './manus';

// ============================================================================
// Outreach Config
// ============================================================================

const MAX_OUTREACH_PER_DAY = 20; // Avoid spam
const OUTREACH_LOG_FILE = path.join(process.cwd(), 'data', 'outreach-log.json');

interface OutreachRecord {
  handle: string;
  platform: string;
  message: string;
  sentAt: string;
  method: 'email' | 'dm_draft';
}

function getOutreachLog(): OutreachRecord[] {
  if (!fs.existsSync(OUTREACH_LOG_FILE)) return [];
  return JSON.parse(fs.readFileSync(OUTREACH_LOG_FILE, 'utf-8'));
}

function saveOutreachRecord(record: OutreachRecord): void {
  const dir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const log = getOutreachLog();
  log.push(record);
  fs.writeFileSync(OUTREACH_LOG_FILE, JSON.stringify(log, null, 2));
}

// ============================================================================
// AI Message Generation
// ============================================================================

async function generateOutreachMessage(lead: InfluencerLead): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not set');

  const client = new Anthropic({ apiKey });

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 300,
    messages: [
      {
        role: 'user',
        content: `Write a short, casual DM/email to a beauty industry influencer inviting them to be an Alaii affiliate partner. Keep it under 100 words, warm and personal.

INFLUENCER:
- Name: ${lead.displayName}
- Handle: ${lead.handle}
- Niche: ${lead.niche}
- Followers: ${lead.followers.toLocaleString()}
- Bio: ${lead.bio || 'N/A'}

ABOUT ALAII:
- AI-powered business platform for beauty pros
- Replaces GlossGenius, Acuity, Square — saves $200+/month
- Fills cancellations automatically with AI
- Handles booking, payments, marketing on autopilot

AFFILIATE OFFER:
- 20% recurring commission on every signup
- Their audience gets 60 days free
- Dedicated affiliate dashboard
- Custom promo code with their name

Write ONLY the message, no subject line. Sound like a real person, not a brand. Use their niche language.`,
      },
    ],
  });

  const text = response.content[0];
  return text.type === 'text' ? text.text : '';
}

// ============================================================================
// Outreach Engine
// ============================================================================

let isOutreaching = false;

/**
 * Send outreach to all new (un-contacted) leads.
 */
export async function runInfluencerOutreach(): Promise<{
  sent: number;
  skipped: number;
  errors: number;
}> {
  if (isOutreaching) {
    console.log('⏸️ Outreach already running, skipping...');
    return { sent: 0, skipped: 0, errors: 0 };
  }

  isOutreaching = true;
  let sent = 0;
  let skipped = 0;
  let errors = 0;

  try {
    console.log('\n📨 ══════════════════════════════════════════');
    console.log('   Influencer Outreach Engine Starting...');
    console.log('   ══════════════════════════════════════════\n');

    const leads = getAllLeads().filter((l) => l.outreachStatus === 'new');
    const todaysSent = getOutreachLog().filter((r) => {
      const sentDate = new Date(r.sentAt).toDateString();
      return sentDate === new Date().toDateString();
    }).length;

    const remaining = MAX_OUTREACH_PER_DAY - todaysSent;
    if (remaining <= 0) {
      console.log(`  ⏸️ Daily outreach limit reached (${MAX_OUTREACH_PER_DAY})`);
      isOutreaching = false;
      return { sent: 0, skipped: leads.length, errors: 0 };
    }

    const batch = leads.slice(0, remaining);
    console.log(`  📋 ${leads.length} new leads, sending to ${batch.length} (limit: ${remaining})`);

    for (const lead of batch) {
      try {
        // Generate personalized message
        const message = await generateOutreachMessage(lead);

        if (lead.email && process.env.RESEND_API_KEY) {
          // Send real email via Resend
          const subject = `Hey ${lead.displayName.split(' ')[0] || 'there'} — quick collab idea 💫`;
          const emailRes = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: 'Anthony from Alaii <anthony@alaii.app>',
              to: [lead.email],
              subject,
              text: message,
            }),
          });

          if (emailRes.ok) {
            console.log(`  📧 Email SENT to ${lead.handle} (${lead.email})`);
          } else {
            const err = await emailRes.text();
            console.error(`  ❌ Email failed for ${lead.handle}: ${err}`);
          }
        } else if (lead.email) {
          console.log(`  📧 [DRAFT] Email to ${lead.handle} (${lead.email}) — no RESEND_API_KEY`);
        } else {
          console.log(`  💬 [DRAFT] DM to ${lead.handle} — no email found`);
        }

        // Save outreach record
        saveOutreachRecord({
          handle: lead.handle,
          platform: lead.platform,
          message,
          sentAt: new Date().toISOString(),
          method: lead.email ? 'email' : 'dm_draft',
        });

        // Update lead status
        updateLeadStatus(lead.handle, lead.platform, 'contacted');
        sent++;

        // Rate limit: 5 second gap between outreach
        await new Promise((resolve) => setTimeout(resolve, 5000));
      } catch (error) {
        console.error(`  ❌ Error outreaching ${lead.handle}:`, error);
        errors++;
      }
    }

    console.log('\n📨 ══════════════════════════════════════════');
    console.log(`   Outreach complete: ${sent} sent, ${skipped} skipped, ${errors} errors`);
    console.log('   ══════════════════════════════════════════\n');
  } catch (error) {
    console.error('❌ Outreach engine error:', error);
  } finally {
    isOutreaching = false;
  }

  return { sent, skipped, errors };
}

// ============================================================================
// Scheduler — Daily at 9 AM EST (after discovery at 6 AM)
// ============================================================================

export function startInfluencerOutreach(): void {
  console.log('📨 Influencer Outreach Engine initialized');
  console.log(`   📊 ${getOutreachLog().length} total outreach sent`);

  // Run daily at 9 AM EST (1 PM UTC) — 3 hours after discovery
  cron.schedule('0 13 * * *', async () => {
    console.log('⏰ Daily influencer outreach triggered');
    const result = await runInfluencerOutreach();
    console.log(`📊 Daily outreach: ${result.sent} sent, ${result.errors} errors`);
  });

  console.log('   ⏰ Scheduled: daily at 9 AM EST\n');
}

// ============================================================================
// Stats
// ============================================================================

export function getOutreachStats() {
  const log = getOutreachLog();
  const today = new Date().toDateString();
  return {
    totalSent: log.length,
    sentToday: log.filter((r) => new Date(r.sentAt).toDateString() === today).length,
    dailyLimit: MAX_OUTREACH_PER_DAY,
    byMethod: {
      email: log.filter((r) => r.method === 'email').length,
      dmDraft: log.filter((r) => r.method === 'dm_draft').length,
    },
  };
}
