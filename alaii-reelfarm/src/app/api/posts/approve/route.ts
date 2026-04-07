// ============================================================================
// POST /api/posts/approve — Approve or Reject a pending_review post
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { approveAndPublish, rejectPost } from '@/lib/autopilot';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { postId, action } = body;

    if (!postId || !action) {
      return NextResponse.json({ error: 'postId and action are required' }, { status: 400 });
    }

    if (action === 'approve') {
      const result = await approveAndPublish(postId);
      return NextResponse.json(result);
    }

    if (action === 'reject') {
      rejectPost(postId);
      return NextResponse.json({ status: 'rejected' });
    }

    return NextResponse.json({ error: 'action must be "approve" or "reject"' }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed' },
      { status: 500 }
    );
  }
}
