import { NextResponse } from 'next/server';
import { getAllCarouselCampaigns, getAllCarouselPosts } from '@/lib/carousel-autopilot';
import { getAllAccounts } from '@/lib/tiktok';
import { getDiscoveryStats } from '@/lib/influencer-discovery';
import { getOutreachStats } from '@/lib/influencer-outreach';
import { getTwitterStats } from '@/lib/twitter';

export async function GET() {
  const campaigns = getAllCarouselCampaigns();
  const posts = getAllCarouselPosts();
  const accounts = getAllAccounts();

  const enabledCampaigns = campaigns.filter(c => c.enabled);
  const recentPosts = posts.slice(-5).map(p => ({
    hook: p.content.hookText?.slice(0, 60),
    status: p.status,
    created: p.createdAt,
  }));

  return NextResponse.json({
    status: 'healthy',
    uptime: process.uptime(),
    autopilot: {
      campaigns: campaigns.length,
      enabled: enabledCampaigns.length,
      accounts: accounts.length,
      totalPosts: posts.length,
      posted: posts.filter(p => p.status === 'posted').length,
      failed: posts.filter(p => p.status === 'failed').length,
    },
    recentPosts,
    influencers: getDiscoveryStats(),
    outreach: getOutreachStats(),
    twitter: getTwitterStats(),
    timestamp: new Date().toISOString(),
  });
}
