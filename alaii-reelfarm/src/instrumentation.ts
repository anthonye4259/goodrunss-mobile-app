// Next.js instrumentation — runs on server startup
// Active engines: TikTok/IG carousel posting + influencer discovery

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { startCarouselAutoPilot } = await import('./lib/carousel-autopilot');
    const { startInfluencerDiscovery } = await import('./lib/influencer-discovery');

    startCarouselAutoPilot();
    startInfluencerDiscovery();

    // DISABLED — no longer running:
    // startInfluencerOutreach();  // cold outreach
    // startTwitterEngagement();   // Twitter engagement
    // startRedditEngagement();    // Reddit engagement
  }
}
