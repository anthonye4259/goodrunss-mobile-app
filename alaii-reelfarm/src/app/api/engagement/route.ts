// ============================================================================
// Engagement Queue API — View daily engagement targets
// ============================================================================

import { NextResponse } from 'next/server';
import {
  getTodaysEngagementQueue,
  getAllEngagementTargets,
  markEngaged,
  runEngagementQueueGeneration,
} from '@/lib/influencer-discovery';

export async function GET() {
  const todaysQueue = getTodaysEngagementQueue();
  const allTargets = getAllEngagementTargets();

  return NextResponse.json({
    date: new Date().toDateString(),
    today: {
      total: todaysQueue.length,
      engaged: todaysQueue.filter(t => t.engaged).length,
      remaining: todaysQueue.filter(t => !t.engaged).length,
      targets: todaysQueue.map(t => ({
        handle: t.handle,
        platform: t.platform,
        displayName: t.displayName,
        followers: t.followers,
        niche: t.niche,
        profileUrl: t.profileUrl,
        latestPostUrl: t.latestPostUrl,
        suggestedComment: t.suggestedComment,
        action: t.suggestedAction,
        engaged: t.engaged,
      })),
    },
    stats: {
      totalTargets7d: allTargets.length,
      totalEngaged7d: allTargets.filter(t => t.engaged).length,
    },
  });
}

/** POST to mark a target as engaged or trigger queue generation */
export async function POST(request: Request) {
  const body = await request.json();

  if (body.action === 'mark_engaged' && body.handle) {
    markEngaged(body.handle);
    return NextResponse.json({ success: true, message: `Marked ${body.handle} as engaged` });
  }

  if (body.action === 'generate') {
    const result = await runEngagementQueueGeneration();
    return NextResponse.json({
      success: true,
      message: `Generated ${result.totalTargets} targets on ${result.platform}`,
      result,
    });
  }

  return NextResponse.json({ error: 'Invalid action. Use "mark_engaged" or "generate"' }, { status: 400 });
}
