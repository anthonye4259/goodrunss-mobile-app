// ============================================================================
// /api/campaigns — Automation Campaigns CRUD + Trigger
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import {
  getAllCampaigns,
  getCampaign,
  saveCampaign,
  deleteCampaign,
  triggerAutoPilot,
} from '@/lib/autopilot';
import type { AutomationCampaign } from '@/lib/autopilot';
import { v4 as uuid } from 'uuid';

/** GET /api/campaigns — List all campaigns */
export async function GET() {
  const campaigns = getAllCampaigns();
  return NextResponse.json({ campaigns });
}

/** POST /api/campaigns — Create or trigger */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Trigger a manual run
    if (body.action === 'trigger' && body.campaignId) {
      await triggerAutoPilot(body.campaignId);
      return NextResponse.json({ message: 'AutoPilot triggered' });
    }

    // Create new campaign
    const campaign: AutomationCampaign = {
      id: uuid(),
      name: body.name || 'New Campaign',
      enabled: body.enabled ?? false,
      requireApproval: body.requireApproval ?? true,
      postsPerDay: body.postsPerDay || 3,
      postTimes: body.postTimes || ['09:00', '14:00', '19:00'],
      topics: body.topics || [],
      pointCount: body.pointCount || 5,
      createdAt: new Date().toISOString(),
      totalPosted: 0,
      totalGenerated: 0,
    };

    saveCampaign(campaign);
    return NextResponse.json({ campaign }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed' },
      { status: 500 }
    );
  }
}

/** PUT /api/campaigns — Update a campaign */
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const existing = getCampaign(id);
    if (!existing) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    // Update fields
    if (body.name !== undefined) existing.name = body.name;
    if (body.enabled !== undefined) existing.enabled = body.enabled;
    if (body.requireApproval !== undefined) existing.requireApproval = body.requireApproval;
    if (body.postsPerDay !== undefined) existing.postsPerDay = body.postsPerDay;
    if (body.postTimes !== undefined) existing.postTimes = body.postTimes;
    if (body.topics !== undefined) existing.topics = body.topics;
    if (body.pointCount !== undefined) existing.pointCount = body.pointCount;

    saveCampaign(existing);
    return NextResponse.json({ campaign: existing });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed' },
      { status: 500 }
    );
  }
}

/** DELETE /api/campaigns */
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  deleteCampaign(id);
  return NextResponse.json({ message: 'Deleted' });
}
