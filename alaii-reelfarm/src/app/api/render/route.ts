// ============================================================================
// POST /api/render — Video Rendering
// ============================================================================
// Render slides into an MP4 video using FFmpeg + Canvas.

import { NextRequest, NextResponse } from 'next/server';
import { renderSlideshow, buildSlides } from '@/lib/ffmpeg';
import { getSlideBackgrounds, downloadImage } from '@/lib/pexels';
import { getPost, savePost } from '@/lib/db';
import * as path from 'path';
import * as fs from 'fs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { postId, slides, content, imageUrls } = body;

    let slidesToRender = slides;

    // If postId provided, get from DB
    if (postId) {
      const post = getPost(postId);
      if (!post) {
        return NextResponse.json({ error: 'Post not found' }, { status: 404 });
      }
      slidesToRender = post.slides;
    }

    // If content provided but no slides, build slides with images
    if (content && !slidesToRender) {
      let bgUrls = imageUrls || [];

      // Fetch images from Pexels if none provided
      if (bgUrls.length === 0) {
        bgUrls = await getSlideBackgrounds(content.points.length);
      }

      // Download images locally for Canvas to use
      const tmpDir = path.join(process.cwd(), 'tmp', 'images');
      if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

      const localImagePaths: string[] = [];
      for (let i = 0; i < bgUrls.length; i++) {
        const localPath = path.join(tmpDir, `bg_${Date.now()}_${i}.jpg`);
        await downloadImage(bgUrls[i], localPath);
        localImagePaths.push(localPath);
      }

      slidesToRender = buildSlides(content, localImagePaths);
    }

    if (!slidesToRender || slidesToRender.length === 0) {
      return NextResponse.json({ error: 'No slides to render' }, { status: 400 });
    }

    // Update post status if applicable
    if (postId) {
      const post = getPost(postId)!;
      post.status = 'rendering';
      savePost(post);
    }

    const videoPath = await renderSlideshow(slidesToRender);

    // Update post with video path
    if (postId) {
      const post = getPost(postId)!;
      post.videoPath = videoPath;
      post.slides = slidesToRender;
      savePost(post);
    }

    return NextResponse.json({
      videoPath,
      message: 'Video rendered successfully',
    });
  } catch (error) {
    console.error('Render error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Rendering failed' },
      { status: 500 }
    );
  }
}
