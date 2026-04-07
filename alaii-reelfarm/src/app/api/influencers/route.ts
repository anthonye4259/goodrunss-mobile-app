// API endpoints for influencer discovery & outreach
import { NextRequest, NextResponse } from 'next/server';
import {
  runInfluencerDiscovery,
  getAllLeads,
  getDiscoveryStats,
} from '@/lib/influencer-discovery';
import { runInfluencerOutreach, getOutreachStats } from '@/lib/influencer-outreach';

// GET /api/influencers — list leads + stats
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const view = url.searchParams.get('view');

  if (view === 'stats') {
    return NextResponse.json({
      discovery: getDiscoveryStats(),
      outreach: getOutreachStats(),
    });
  }

  const status = url.searchParams.get('status');
  const niche = url.searchParams.get('niche');
  let leads = getAllLeads();

  if (status) leads = leads.filter((l) => l.outreachStatus === status);
  if (niche) leads = leads.filter((l) => l.niche.toLowerCase().includes(niche.toLowerCase()));

  // Sort by most recent first
  leads.sort((a, b) => new Date(b.discoveredAt).getTime() - new Date(a.discoveredAt).getTime());

  return NextResponse.json({
    leads,
    total: leads.length,
    stats: getDiscoveryStats(),
  });
}

// POST /api/influencers — trigger manual discovery or outreach
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { action } = body;

  if (action === 'discover') {
    // Don't await — run in background
    runInfluencerDiscovery()
      .then((result) => console.log('📊 Manual discovery done:', result))
      .catch((err) => console.error('❌ Manual discovery error:', err));

    return NextResponse.json({
      success: true,
      message: 'Discovery started in background. Check /api/influencers?view=stats for progress.',
    });
  }

  if (action === 'outreach') {
    runInfluencerOutreach()
      .then((result) => console.log('📊 Manual outreach done:', result))
      .catch((err) => console.error('❌ Manual outreach error:', err));

    return NextResponse.json({
      success: true,
      message: 'Outreach started in background.',
    });
  }

  return NextResponse.json({ error: 'Invalid action. Use "discover" or "outreach".' }, { status: 400 });
}
