// Carousel Campaigns API
import { NextRequest, NextResponse } from 'next/server';
import {
  getAllCarouselCampaigns,
  getCarouselCampaign,
  saveCarouselCampaign,
  triggerCarouselAutoPilot,
} from '@/lib/carousel-autopilot';

export async function GET() {
  const campaigns = getAllCarouselCampaigns();
  return NextResponse.json({ campaigns });
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  if (body.action === 'trigger') {
    try {
      await triggerCarouselAutoPilot(body.campaignId);
      return NextResponse.json({ success: true });
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Trigger failed' },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}

export async function PUT(request: NextRequest) {
  const body = await request.json();
  const campaign = getCarouselCampaign(body.id);
  if (!campaign) {
    return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
  }

  // Update fields
  if (body.enabled !== undefined) campaign.enabled = body.enabled;
  if (body.postTimes) campaign.postTimes = body.postTimes;
  if (body.topics) campaign.topics = body.topics;
  if (body.postsPerDay) campaign.postsPerDay = body.postsPerDay;
  if (body.slideCount) campaign.slideCount = body.slideCount;
  if (body.requireApproval !== undefined) campaign.requireApproval = body.requireApproval;
  if (body.accountIds) campaign.accountIds = body.accountIds;
  if (body.name) campaign.name = body.name;

  saveCarouselCampaign(campaign);
  return NextResponse.json({ campaign });
}
