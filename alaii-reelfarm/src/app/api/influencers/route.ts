// ============================================================================
// Influencer Discovery API — Claude-powered (no Manus)
// ============================================================================
// On-demand influencer discovery using Claude. No scheduled crons.
// POST /api/influencers { action: "discover", niche: "lash tech" }

import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import * as fs from 'fs';
import * as path from 'path';

const LEADS_FILE = path.join(process.cwd(), 'data', 'influencer-leads.json');

interface InfluencerLead {
  handle: string;
  displayName: string;
  followers: number;
  platform: string;
  niche: string;
  profileUrl: string;
  bio?: string;
  engagementRate?: number;
  discoveredAt: string;
  outreachStatus: 'new' | 'contacted' | 'replied' | 'converted' | 'declined';
}

function ensureDataDir() {
  const dir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(LEADS_FILE)) {
    fs.writeFileSync(LEADS_FILE, JSON.stringify([], null, 2));
  }
}

function getAllLeads(): InfluencerLead[] {
  ensureDataDir();
  return JSON.parse(fs.readFileSync(LEADS_FILE, 'utf-8'));
}

function saveLeads(leads: InfluencerLead[]) {
  ensureDataDir();
  fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2));
}

// GET /api/influencers — list all leads
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const status = url.searchParams.get('status');
  const niche = url.searchParams.get('niche');
  let leads = getAllLeads();

  if (status) leads = leads.filter(l => l.outreachStatus === status);
  if (niche) leads = leads.filter(l => l.niche.toLowerCase().includes(niche.toLowerCase()));

  leads.sort((a, b) => new Date(b.discoveredAt).getTime() - new Date(a.discoveredAt).getTime());

  return NextResponse.json({
    leads,
    total: leads.length,
    byStatus: {
      new: getAllLeads().filter(l => l.outreachStatus === 'new').length,
      contacted: getAllLeads().filter(l => l.outreachStatus === 'contacted').length,
      replied: getAllLeads().filter(l => l.outreachStatus === 'replied').length,
      converted: getAllLeads().filter(l => l.outreachStatus === 'converted').length,
    },
  });
}

// POST /api/influencers — discover or update leads
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { action } = body;

  // ── Discover new influencers via Claude ──
  if (action === 'discover') {
    const niche = body.niche || 'beauty professional';
    const platform = body.platform || 'instagram';
    const count = body.count || 20;

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY || '',
    });

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      messages: [{
        role: 'user',
        content: `Find ${count} real, active ${niche} professionals on ${platform} that would be good targets for a booking app called Alaii.

Look for people who:
- Are real beauty/service professionals (not meme pages or brands)
- Have 1,000 - 100,000 followers
- Post regularly about their work
- Are based in the US
- Would benefit from a free booking + payments tool

For each, provide:
- Their handle (with @)
- Display name
- Approximate follower count
- Their specific niche (e.g. "lash tech", "medspa injector", "hair stylist")
- Profile URL
- A short bio summary

Return ONLY a JSON array, no other text:
[{
  "handle": "@example",
  "displayName": "Jane Smith",
  "followers": 5000,
  "niche": "lash tech",
  "profileUrl": "https://${platform === 'tiktok' ? 'tiktok.com/@' : 'instagram.com/'}example",
  "bio": "Lash artist in Dallas. Volume + Classic. Book online."
}]`,
      }],
    });

    const text = response.content[0];
    const resultText = text.type === 'text' ? text.text : '';
    const jsonStr = resultText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    let newLeads: InfluencerLead[] = [];
    try {
      const parsed = JSON.parse(jsonStr);
      const existingHandles = new Set(getAllLeads().map(l => l.handle.toLowerCase()));

      newLeads = parsed
        .filter((p: any) => !existingHandles.has(p.handle.toLowerCase()))
        .map((p: any) => ({
          handle: p.handle,
          displayName: p.displayName,
          followers: p.followers || 0,
          platform,
          niche: p.niche || niche,
          profileUrl: p.profileUrl || '',
          bio: p.bio || '',
          discoveredAt: new Date().toISOString(),
          outreachStatus: 'new' as const,
        }));

      if (newLeads.length > 0) {
        const allLeads = [...getAllLeads(), ...newLeads];
        saveLeads(allLeads);
      }
    } catch (e) {
      return NextResponse.json({ error: 'Failed to parse Claude response', raw: jsonStr }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      niche,
      platform,
      found: newLeads.length,
      leads: newLeads,
      totalInDb: getAllLeads().length,
    });
  }

  // ── Update lead status ──
  if (action === 'update_status') {
    const { handle, status } = body;
    if (!handle || !status) {
      return NextResponse.json({ error: 'handle and status required' }, { status: 400 });
    }

    const leads = getAllLeads();
    const lead = leads.find(l => l.handle.toLowerCase() === handle.toLowerCase());
    if (!lead) {
      return NextResponse.json({ error: `Lead ${handle} not found` }, { status: 404 });
    }

    lead.outreachStatus = status;
    saveLeads(leads);
    return NextResponse.json({ success: true, lead });
  }

  return NextResponse.json(
    { error: 'Invalid action. Use "discover" or "update_status".' },
    { status: 400 },
  );
}
