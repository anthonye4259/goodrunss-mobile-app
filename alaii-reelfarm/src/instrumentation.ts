// Next.js instrumentation — runs on server startup
// Starts all autopilot engines: TikTok carousels, IG, influencer discovery, outreach, Twitter, Reddit

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { startCarouselAutoPilot } = await import('./lib/carousel-autopilot');
    const { startInfluencerDiscovery } = await import('./lib/influencer-discovery');
    const { startInfluencerOutreach } = await import('./lib/influencer-outreach');
    const { startTwitterEngagement } = await import('./lib/twitter');
    const { startRedditEngagement } = await import('./lib/reddit');
    const { importUgcCsvFiles } = await import('./lib/ugc-importer');

    // Import any UGC CSVs first (before outreach starts)
    const ugcResult = importUgcCsvFiles();
    if (ugcResult.imported > 0) {
      console.log(`📥 UGC Import: ${ugcResult.imported} leads from ${ugcResult.files.join(', ')}`);
    }

    startCarouselAutoPilot();
    startInfluencerDiscovery();
    startInfluencerOutreach();
    startTwitterEngagement();
    startRedditEngagement();
  }
}
