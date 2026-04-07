#!/usr/bin/env node
// ============================================================================
// Alaii ReelFarm — AutoPilot Startup Script
// ============================================================================
// Run this to start the autopilot scheduler that auto-generates and posts
// Reels to Instagram on the configured schedule.
//
// Usage: npx tsx scripts/start-autopilot.ts
//        or: node --loader ts-node/esm scripts/start-autopilot.ts

import { startAutoPilot } from '../src/lib/autopilot';

console.log(`
╔══════════════════════════════════════════════╗
║     🎬 Alaii ReelFarm — AutoPilot           ║
║     Instagram Reels Automation Engine        ║
╚══════════════════════════════════════════════╝
`);

// Start the autopilot
startAutoPilot();

// Keep process alive
process.on('SIGINT', () => {
  console.log('\n\n👋 AutoPilot stopped. Goodbye!');
  process.exit(0);
});
