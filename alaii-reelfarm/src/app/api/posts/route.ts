// ============================================================================
// /api/posts — Posts CRUD
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { getAllPosts, getPost, savePost, deletePost } from '@/lib/db';
import { buildSlides } from '@/lib/ffmpeg';
import { v4 as uuid } from 'uuid';
import type { Post, ReelContent } from '@/types';

/** GET /api/posts — List all posts */
export async function GET() {
  const posts = getAllPosts();
  return NextResponse.json({ posts });
}

/** POST /api/posts — Create a new post */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { content, imageUrls = [], scheduledAt } = body as {
      content: ReelContent;
      imageUrls?: string[];
      scheduledAt?: string;
    };

    if (!content || !content.hookText) {
      return NextResponse.json({ error: 'content with hookText is required' }, { status: 400 });
    }

    const slides = buildSlides(content, imageUrls);

    const post: Post = {
      id: uuid(),
      content,
      slides,
      status: scheduledAt ? 'scheduled' : 'draft',
      scheduledAt,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    savePost(post);

    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    console.error('Create post error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create post' },
      { status: 500 }
    );
  }
}

/** PUT /api/posts — Update a post */
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, content, imageUrls, scheduledAt, status } = body;

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const existing = getPost(id);
    if (!existing) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    if (content) {
      existing.content = content;
      existing.slides = buildSlides(content, imageUrls || []);
    }
    if (scheduledAt !== undefined) existing.scheduledAt = scheduledAt;
    if (status) existing.status = status;

    savePost(existing);

    return NextResponse.json({ post: existing });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update post' },
      { status: 500 }
    );
  }
}

/** DELETE /api/posts — Delete a post */
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'id query param is required' }, { status: 400 });
  }

  deletePost(id);
  return NextResponse.json({ message: 'Post deleted' });
}
