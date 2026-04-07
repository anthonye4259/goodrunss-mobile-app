// Carousel Posts API
import { NextRequest, NextResponse } from 'next/server';
import {
  getAllCarouselPosts,
  approveAndPublishCarousel,
  rejectCarouselPost,
} from '@/lib/carousel-autopilot';

export async function GET() {
  const posts = getAllCarouselPosts();
  return NextResponse.json({ posts: posts.reverse() }); // Newest first
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  if (body.action === 'approve') {
    try {
      const result = await approveAndPublishCarousel(body.postId, body.accountIds);
      return NextResponse.json(result);
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Approve failed' },
        { status: 500 }
      );
    }
  }

  if (body.action === 'reject') {
    try {
      rejectCarouselPost(body.postId);
      return NextResponse.json({ success: true });
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Reject failed' },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
