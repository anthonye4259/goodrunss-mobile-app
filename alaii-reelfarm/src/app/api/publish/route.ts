// ============================================================================
// POST /api/publish — Publish Reel to Instagram
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { getPost, savePost } from '@/lib/db';
import { uploadVideo } from '@/lib/storage';
import { publishReel } from '@/lib/instagram';
import { renderSlideshow } from '@/lib/ffmpeg';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { postId } = body;

    if (!postId) {
      return NextResponse.json({ error: 'postId is required' }, { status: 400 });
    }

    const post = getPost(postId);
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Step 1: Render if not already rendered
    if (!post.videoPath) {
      post.status = 'rendering';
      savePost(post);
      post.videoPath = await renderSlideshow(post.slides);
      savePost(post);
    }

    // Step 2: Upload to Firebase Storage
    post.status = 'uploading';
    savePost(post);
    const videoUrl = await uploadVideo(post.videoPath);
    post.videoUrl = videoUrl;
    savePost(post);

    // Step 3: Publish to Instagram
    post.status = 'publishing';
    savePost(post);
    const result = await publishReel(videoUrl, post.content.caption);

    if (result.status === 'published') {
      post.status = 'published';
      post.igMediaId = result.mediaId;
      post.publishedAt = new Date().toISOString();
    } else {
      post.status = 'failed';
      post.error = result.error;
    }
    savePost(post);

    return NextResponse.json({
      status: post.status,
      igMediaId: post.igMediaId,
      error: post.error,
    });
  } catch (error) {
    console.error('Publish error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Publishing failed' },
      { status: 500 }
    );
  }
}
