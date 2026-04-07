// Next.js instrumentation — runs on server startup
// Starts all autopilot engines: TikTok carousels, IG, influencer discovery, outreach, Twitter

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { startCarouselAutoPilot } = await import('./lib/carousel-autopilot');
    const { startInfluencerDiscovery } = await import('./lib/influencer-discovery');
    const { startInfluencerOutreach } = await import('./lib/influencer-outreach');
    const { startTwitterEngagement } = await import('./lib/twitter');

    startCarouselAutoPilot();
    startInfluencerDiscovery();
    startInfluencerOutreach();
    startTwitterEngagement();
  }
}
