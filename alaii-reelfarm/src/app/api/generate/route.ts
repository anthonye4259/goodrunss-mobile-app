// ============================================================================
// POST /api/generate — AI Content Generation + Image Sourcing
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { generateReelContent } from '@/lib/ai';
import { getSlideBackgrounds } from '@/lib/pexels';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { topic, pointCount = 5 } = body;

    if (!topic) {
      return NextResponse.json({ error: 'topic is required' }, { status: 400 });
    }

    // Generate content and fetch images in parallel
    // +2 images: 1 for hook, N for points, 1 for CTA
    const [content, imageUrls] = await Promise.all([
      generateReelContent(topic, pointCount),
      getSlideBackgrounds(pointCount + 2, topic),
    ]);

    return NextResponse.json({ content, imageUrls });
  } catch (error) {
    console.error('Generate error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Generation failed' },
      { status: 500 }
    );
  }
}
