// Next.js instrumentation — runs on server startup
// Starts the TikTok Carousel AutoPilot cron scheduler

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { startCarouselAutoPilot } = await import('./lib/carousel-autopilot');
    startCarouselAutoPilot();
  }
}
