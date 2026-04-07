// ============================================================================
// Alaii ReelFarm — Scheduler (Auto-Publisher)
// ============================================================================
// Cron-based scheduler that checks the post queue and auto-publishes
// reels when their scheduled time arrives.

import cron from 'node-cron';
import { getScheduledPosts, savePost } from './db';
import { renderSlideshow } from './ffmpeg';
import { uploadVideo, deleteVideo } from './storage';
import { publishReel } from './instagram';
import type { Post } from '@/types';

let isRunning = false;

/** Process a single post through the full pipeline */
async function processPost(post: Post): Promise<void> {
  try {
    // Step 1: Render video
    console.log(`🎬 Rendering post ${post.id}...`);
    post.status = 'rendering';
    savePost(post);

    const videoPath = await renderSlideshow(post.slides);
    post.videoPath = videoPath;

    // Step 2: Upload to storage
    console.log(`☁️ Uploading post ${post.id}...`);
    post.status = 'uploading';
    savePost(post);

    const videoUrl = await uploadVideo(videoPath);
    post.videoUrl = videoUrl;

    // Step 3: Publish to Instagram
    console.log(`📤 Publishing post ${post.id}...`);
    post.status = 'publishing';
    savePost(post);

    const result = await publishReel(videoUrl, post.content.caption);

    if (result.status === 'published') {
      post.status = 'published';
      post.igMediaId = result.mediaId;
      post.publishedAt = new Date().toISOString();
      console.log(`✅ Post ${post.id} published! IG Media ID: ${result.mediaId}`);
    } else {
      post.status = 'failed';
      post.error = result.error || 'Unknown publishing error';
      console.error(`❌ Post ${post.id} failed:`, result.error);
    }

    savePost(post);

    // Clean up local video file
    try {
      const fs = await import('fs');
      if (post.videoPath) fs.unlinkSync(post.videoPath);
    } catch { /* ignore cleanup errors */ }

  } catch (error) {
    post.status = 'failed';
    post.error = error instanceof Error ? error.message : String(error);
    savePost(post);
    console.error(`❌ Pipeline failed for post ${post.id}:`, error);
  }
}

/** Check for due posts and process them */
async function checkAndPublish(): Promise<void> {
  if (isRunning) {
    console.log('⏸️ Scheduler already running, skipping...');
    return;
  }

  isRunning = true;
  try {
    const scheduledPosts = getScheduledPosts();
    const now = new Date();

    const duePosts = scheduledPosts.filter(
      p => new Date(p.scheduledAt!) <= now
    );

    if (duePosts.length === 0) {
      return;
    }

    console.log(`📋 Found ${duePosts.length} posts due for publishing`);

    for (const post of duePosts) {
      await processPost(post);
      // Small delay between posts to respect rate limits
      await new Promise(r => setTimeout(r, 3000));
    }
  } finally {
    isRunning = false;
  }
}

/** Start the scheduler (check every minute) */
export function startScheduler(): void {
  console.log('🗓️ ReelFarm scheduler started — checking every minute');

  cron.schedule('* * * * *', () => {
    checkAndPublish().catch(err => {
      console.error('Scheduler error:', err);
    });
  });
}

/** Manually trigger publishing for a specific post right now */
export async function publishNow(post: Post): Promise<void> {
  await processPost(post);
}
