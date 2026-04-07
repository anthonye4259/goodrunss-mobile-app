// ============================================================================
// Alaii ReelFarm — Batch Carousel Publisher API
// ============================================================================
// POST /api/carousel/batch
// Generates and publishes multiple carousels across all connected TikTok
// accounts. Distributes posts evenly with rate limiting.
//
// Body: { "count": 10, "delaySeconds": 30 }

import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuid } from 'uuid';
import { generateCarouselContent } from '@/lib/carousel-ai';
import { getSlideBackgrounds } from '@/lib/pexels';
import { renderCarousel } from '@/lib/carousel-render';
import { publishCarousel, getAllAccounts } from '@/lib/tiktok';
import { uploadCarouselImage } from '@/lib/storage';
import {
  getAllCarouselCampaigns,
  saveCarouselPost,
  type CarouselPost,
} from '@/lib/carousel-autopilot';
import * as fs from 'fs';
import * as path from 'path';

// Track batch progress
let batchRunning = false;
let batchProgress = { total: 0, completed: 0, succeeded: 0, failed: 0, current: '' };

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { count = 10, delaySeconds = 45, action } = body;

  // Check batch status
  if (action === 'status') {
    return NextResponse.json({ running: batchRunning, progress: batchProgress });
  }

  // Stop batch
  if (action === 'stop') {
    batchRunning = false;
    return NextResponse.json({ stopped: true, progress: batchProgress });
  }

  if (batchRunning) {
    return NextResponse.json({ error: 'Batch already running', progress: batchProgress }, { status: 409 });
  }

  const accounts = getAllAccounts();
  if (accounts.length === 0) {
    return NextResponse.json({ error: 'No TikTok accounts connected' }, { status: 400 });
  }

  const campaigns = getAllCarouselCampaigns();
  if (campaigns.length === 0) {
    return NextResponse.json({ error: 'No campaigns found' }, { status: 400 });
  }

  const campaign = campaigns[0];

  // Start batch in background
  batchRunning = true;
  batchProgress = { total: count, completed: 0, succeeded: 0, failed: 0, current: 'Starting...' };

  // Fire and forget — don't await
  runBatch(count, delaySeconds, accounts, campaign).catch(err => {
    console.error('❌ Batch error:', err);
    batchRunning = false;
  });

  return NextResponse.json({
    started: true,
    count,
    accounts: accounts.length,
    delaySeconds,
    estimatedMinutes: Math.ceil((count * delaySeconds) / 60),
  });
}

export async function GET() {
  return NextResponse.json({ running: batchRunning, progress: batchProgress });
}

async function runBatch(
  count: number,
  delaySeconds: number,
  accounts: any[],
  campaign: any,
) {
  console.log(`\n🚀 ══════════════════════════════════════════`);
  console.log(`   BATCH PUBLISHER: ${count} carousels`);
  console.log(`   Accounts: ${accounts.length}`);
  console.log(`   Delay: ${delaySeconds}s between posts`);
  console.log(`   Est. time: ${Math.ceil((count * delaySeconds) / 60)} minutes`);
  console.log(`   ══════════════════════════════════════════\n`);

  let accountIndex = 0;

  for (let i = 0; i < count; i++) {
    if (!batchRunning) {
      console.log('⛔ Batch stopped by user');
      break;
    }

    // Round-robin account selection
    const account = accounts[accountIndex % accounts.length];
    accountIndex++;

    const postId = uuid();
    const topicIdx = (campaign.topicIndex || 0 + i) % campaign.topics.length;
    const topic = campaign.topics[topicIdx];

    batchProgress.current = `[${i + 1}/${count}] Generating: "${topic.slice(0, 40)}..."`;
    console.log(`\n📝 [${i + 1}/${count}] Topic: "${topic}"`);
    console.log(`   👤 Account: ${accountIndex % accounts.length + 1}/${accounts.length}`);

    try {
      // Step 1: Generate AI content
      const content = await generateCarouselContent(topic, campaign.slideCount || 7);
      console.log(`   ✅ Content: "${content.hookText}"`);

      // Step 2: Fetch backgrounds
      const totalSlides = content.slides.length + 2;
      const imageUrls = await getSlideBackgrounds(totalSlides, topic);

      // Step 3: Render slides
      const rendered = await renderCarousel(content, imageUrls);

      // Step 4: Rename and upload to Firebase Storage / CDN
      const slideUrls: string[] = [];
      for (let s = 0; s < rendered.slidePaths.length; s++) {
        const originalPath = rendered.slidePaths[s];
        const ext = path.extname(originalPath);
        const uniqueName = `${postId}_slide_${s}${ext}`;
        const newPath = path.join(rendered.tmpDir, uniqueName);
        fs.renameSync(originalPath, newPath);
        const cdnUrl = await uploadCarouselImage(newPath);
        slideUrls.push(cdnUrl);
      }

      // Step 5: Publish to TikTok (single account per post, round-robin)
      batchProgress.current = `[${i + 1}/${count}] Publishing to account ${accountIndex % accounts.length + 1}...`;

      const result = await publishCarousel(
        account.openId || account.id || 'default',
        slideUrls,
        content.title,
        content.description,
      );

      if (result.status === 'success') {
        batchProgress.succeeded++;
        console.log(`   🎉 Published! (publish_id: ${result.publishId})`);
      } else {
        batchProgress.failed++;
        console.log(`   ❌ Failed: ${result.error}`);
      }

      // Save post record
      const post: CarouselPost = {
        id: postId,
        campaignId: campaign.id,
        content,
        slideImageUrls: slideUrls,
        status: result.status === 'success' ? 'posted' : 'failed',
        results: { [account.openId || 'default']: result },
        createdAt: new Date().toISOString(),
        postedAt: result.status === 'success' ? new Date().toISOString() : undefined,
      };
      saveCarouselPost(post);

    } catch (error) {
      batchProgress.failed++;
      console.error(`   ❌ Error: ${error instanceof Error ? error.message : error}`);
    }

    batchProgress.completed++;

    // Rate limit delay between posts
    if (i < count - 1 && batchRunning) {
      console.log(`   ⏳ Waiting ${delaySeconds}s before next post...`);
      await sleep(delaySeconds * 1000);
    }
  }

  batchRunning = false;
  console.log(`\n🏁 ══════════════════════════════════════════`);
  console.log(`   BATCH COMPLETE`);
  console.log(`   ✅ ${batchProgress.succeeded} succeeded`);
  console.log(`   ❌ ${batchProgress.failed} failed`);
  console.log(`   ══════════════════════════════════════════\n`);
}
