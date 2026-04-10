// Next.js instrumentation — runs on server startup
// Only the carousel autopilot (TikTok + IG) is active

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { startCarouselAutoPilot } = await import('./lib/carousel-autopilot');

    startCarouselAutoPilot();

    // DISABLED — all of these are off:
    // startInfluencerDiscovery();  // was using Manus credits
    // startInfluencerOutreach();   // cold outreach
    // startTwitterEngagement();    // Twitter engagement
    // startRedditEngagement();     // Reddit engagement
  }
}
