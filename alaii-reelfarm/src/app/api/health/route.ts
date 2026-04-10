import { NextResponse } from 'next/server';
import { getAllCarouselCampaigns, getAllCarouselPosts } from '@/lib/carousel-autopilot';
import { getAllAccounts } from '@/lib/tiktok';
import { getDemoStatus } from '@/lib/demo-rotation';

export async function GET() {
  const campaigns = getAllCarouselCampaigns();
  const posts = getAllCarouselPosts();
  const accounts = getAllAccounts();
  const demos = getDemoStatus();

  const enabledCampaigns = campaigns.filter(c => c.enabled);
  const recentPosts = posts.slice(-5).map(p => ({
    hook: p.content.hookText?.slice(0, 60),
    status: p.status,
    created: p.createdAt,
  }));

  return NextResponse.json({
    status: 'healthy',
    uptime: process.uptime(),
    engines: {
      carouselAutoPilot: enabledCampaigns.length > 0 ? 'active' : 'disabled',
      influencerDiscovery: 'disabled (moved to on-demand Claude)',
      engagementQueue: 'disabled',
      influencerOutreach: 'disabled',
      twitter: 'disabled',
      reddit: 'disabled',
    },
    autopilot: {
      campaigns: campaigns.length,
      enabled: enabledCampaigns.length,
      accounts: accounts.length,
      totalPosts: posts.length,
      posted: posts.filter(p => p.status === 'posted').length,
      failed: posts.filter(p => p.status === 'failed').length,
    },
    demos,
    recentPosts,
    timestamp: new Date().toISOString(),
  });
}
