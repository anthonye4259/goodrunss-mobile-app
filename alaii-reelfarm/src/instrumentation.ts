// Next.js instrumentation — runs on server startup
// ALL AUTOMATION DISABLED — everything is manual for now

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // DISABLED — all automation off per owner request (2026-04-12)
    // const { startCarouselAutoPilot } = await import('./lib/carousel-autopilot');
    // startCarouselAutoPilot();

    // startInfluencerDiscovery();  // was using Manus credits
    // startInfluencerOutreach();   // cold outreach
    // startTwitterEngagement();    // Twitter engagement
    // startRedditEngagement();     // Reddit engagement

    console.log('⏸️ All automation disabled — manual mode only');
  }
}
