// ============================================================================
// Alaii ReelFarm — TikTok Carousel AutoPilot
// ============================================================================
// Campaign engine for automated TikTok carousel posting.
// Generates AI content, renders slides, uploads, and posts to all connected
// TikTok accounts on a schedule.

import cron from 'node-cron';
import { v4 as uuid } from 'uuid';
import { generateCarouselContent, type CarouselContent } from './carousel-ai';
import { getSlideBackgrounds } from './pexels';
import { renderCarousel, cleanupCarousel, type RenderedCarousel } from './carousel-render';
import { publishCarouselToAll, getAllAccounts, type TikTokPublishResult } from './tiktok';
import { publishCarousel as publishToIG, generateHashtags } from './instagram';
import { getNextDemo, postDemoVideo } from './demo-rotation';
import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// Campaign Types
// ============================================================================

export interface CarouselCampaign {
  id: string;
  name: string;
  enabled: boolean;
  requireApproval: boolean;
  postsPerDay: number;
  postTimes: string[];
  topics: string[];
  /** Account IDs to post to (empty = all accounts) */
  accountIds: string[];
  slideCount: number;
  createdAt: string;
  totalPosted: number;
  totalGenerated: number;
  lastPostedAt?: string;
  lastGeneratedAt?: string;
}

export interface CarouselPost {
  id: string;
  campaignId: string;
  content: CarouselContent;
  slideImageUrls: string[];
  status: 'pending_review' | 'approved' | 'posting' | 'posted' | 'failed' | 'rejected';
  results: Record<string, TikTokPublishResult>;
  error?: string;
  createdAt: string;
  postedAt?: string;
}

// ============================================================================
// Default Topics
// ============================================================================

const DEFAULT_CAROUSEL_TOPICS = [
  // ── PROOF / RESULTS ──
  "i filled 6 empty slots this week without touching my phone",
  "got 3 new clients in 24 hours. here's what changed",
  "woke up to $1,200 in bookings i didn't have yesterday",
  "haven't had a no-show in 3 weeks. here's why",
  "one text filled my entire Thursday afternoon",
  "i stopped chasing clients. now my phone fills my book for me",

  // ── MONEY LOST (specific, painful) ──
  "i tracked my no-shows for a month. i lost $3,200",
  "one empty slot per day = $75,000 per year. do the math",
  "3 ghost clients cost me $8,400 this year alone",
  "i was losing $400 every time someone cancelled. not anymore",
  "$62,000. that's what 3 empty Botox slots per week costs per year",
  "every client who doesn't rebook costs you $8,000 per year",

  // ── BEFORE/AFTER ──
  "before: texting clients at 11pm. after: my book fills itself",
  "before: 4 empty slots per week. after: fully booked, no chasing",
  "i used to lose $500/month to cancellations. last month i lost $0",
  "before: spending $48/month on booking. now: $0 and better results",
  "my Tuesdays used to be dead. now they fill by Monday night",
  "i went from 3 no-shows per week to zero. one change",

  // ── INJECTORS / MEDSPA ──
  "one empty Botox slot = $400 gone. i stopped letting that happen",
  "filled a last-minute cancellation in 8 minutes. patient paid $400",
  "my medspa fills cancellations now. zero phone calls",
  "patients used to ghost after consultations. now they rebook automatically",
  "i lost $1,200/week in empty slots. last week i lost $0",

  // ── HAIR STYLISTS ──
  "filled 4 no-show slots in one week without posting on Instagram",
  "clients who ghosted me for 2 months are booking again. i didn't text them",
  "my chair hasn't been empty in 3 weeks. i'm not working harder",
  "i stopped begging clients to rebook. now it happens automatically",
  "solo stylist: stop texting clients. let your book fill itself",

  // ── LASH TECHS ──
  "2 cancellations per week was costing me $15,000/year. fixed it",
  "filled a lash cancellation in 12 minutes. $250 saved",
  "my lash room hasn't had an empty slot in weeks",
  "lash clients who disappeared are coming back. i didn't chase them",

  // ── ESTHETICIANS ──
  "filled my slow season without running a single ad",
  "facial rebooking rate went from 40% to 85%. one change",
  "clients who hadn't booked in 60 days are back. i didn't text them",

  // ── NAIL TECHS ──
  "no-shows were costing me $12,000/year. last month: zero no-shows",
  "my nail book fills itself. i haven't chased a client in weeks",

  // ── REAL TALK ──
  "the real reason you're fully booked and still broke",
  "you're paying $48/month for booking. i pay $0 and get better results",
  "your booking app doesn't fill your cancellations. that's a problem",
  "i stopped losing money and my income went up $2,000/month",
  "if your empty slots aren't filling themselves, you're losing thousands",
];

// ============================================================================
// Data Storage
// ============================================================================

const CAMPAIGNS_FILE = path.join(process.cwd(), 'data', 'carousel-campaigns.json');
const POSTS_FILE = path.join(process.cwd(), 'data', 'carousel-posts.json');

function ensureDataDir() {
  const dir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  if (!fs.existsSync(CAMPAIGNS_FILE)) {
    const defaultCampaign: CarouselCampaign = {
      id: uuid(),
      name: 'Alaii Growth Engine',
      enabled: true,
      requireApproval: true,
      postsPerDay: 5,
      postTimes: [
        '07:30',  // morning scroll — beauty pros prepping for first client
        '11:30',  // midday break — high engagement window
        '15:00',  // afternoon lull — checking phones between clients
        '18:30',  // post-work wind-down — peak TikTok/IG usage
        '21:00',  // evening scroll — highest engagement for beauty niche
      ],
      topics: DEFAULT_CAROUSEL_TOPICS,
      accountIds: [], // Empty = all accounts
      slideCount: 5,
      createdAt: new Date().toISOString(),
      totalPosted: 0,
      totalGenerated: 0,
    };
    fs.writeFileSync(CAMPAIGNS_FILE, JSON.stringify([defaultCampaign], null, 2));
  } else {
    // Force-update existing campaigns to new growth engine settings
    const campaigns: CarouselCampaign[] = JSON.parse(fs.readFileSync(CAMPAIGNS_FILE, 'utf-8'));
    let updated = false;
    for (const c of campaigns) {
      if (!c.enabled || c.postsPerDay !== 5) {
        c.enabled = true;
        c.requireApproval = true;
        c.postsPerDay = 5;
        c.postTimes = ['07:30', '11:30', '15:00', '18:30', '21:00'];
        c.name = 'Alaii Growth Engine';
        c.topics = DEFAULT_CAROUSEL_TOPICS;
        updated = true;
        console.log(`🔄 Force-updated campaign "${c.name}" → enabled, 5/day, no approval`);
      }
    }
    if (updated) {
      fs.writeFileSync(CAMPAIGNS_FILE, JSON.stringify(campaigns, null, 2));
    }
  }

  if (!fs.existsSync(POSTS_FILE)) {
    fs.writeFileSync(POSTS_FILE, JSON.stringify([], null, 2));
  }
}

// Campaign CRUD
export function getAllCarouselCampaigns(): CarouselCampaign[] {
  ensureDataDir();
  return JSON.parse(fs.readFileSync(CAMPAIGNS_FILE, 'utf-8'));
}

export function getCarouselCampaign(id: string): CarouselCampaign | undefined {
  return getAllCarouselCampaigns().find(c => c.id === id);
}

export function saveCarouselCampaign(campaign: CarouselCampaign): void {
  ensureDataDir();
  const campaigns = getAllCarouselCampaigns();
  const idx = campaigns.findIndex(c => c.id === campaign.id);
  if (idx >= 0) campaigns[idx] = campaign;
  else campaigns.push(campaign);
  fs.writeFileSync(CAMPAIGNS_FILE, JSON.stringify(campaigns, null, 2));
}

export function deleteCarouselCampaign(id: string): void {
  ensureDataDir();
  const campaigns = getAllCarouselCampaigns().filter(c => c.id !== id);
  fs.writeFileSync(CAMPAIGNS_FILE, JSON.stringify(campaigns, null, 2));
}

// Post CRUD
export function getAllCarouselPosts(): CarouselPost[] {
  ensureDataDir();
  return JSON.parse(fs.readFileSync(POSTS_FILE, 'utf-8'));
}

export function getCarouselPost(id: string): CarouselPost | undefined {
  return getAllCarouselPosts().find(p => p.id === id);
}

export function saveCarouselPost(post: CarouselPost): void {
  ensureDataDir();
  const posts = getAllCarouselPosts();
  const idx = posts.findIndex(p => p.id === post.id);
  if (idx >= 0) posts[idx] = post;
  else posts.push(post);
  fs.writeFileSync(POSTS_FILE, JSON.stringify(posts, null, 2));
}

// ============================================================================
// AutoPilot Engine
// ============================================================================

let isProcessing = false;

function pickTopic(campaign: CarouselCampaign): string {
  const posts = getAllCarouselPosts();
  const recentTopics = posts
    .filter(p => p.status === 'posted')
    .slice(-10)
    .map(p => p.content.hookText.toLowerCase());

  const available = campaign.topics.filter(topic =>
    !recentTopics.some(recent =>
      recent.includes(topic.toLowerCase().split(' ').slice(0, 3).join(' '))
    )
  );

  const pool = available.length > 0 ? available : campaign.topics;
  return pool[Math.floor(Math.random() * pool.length)];
}

/** Main autopilot run: generate → render → upload → post */
async function runCarouselAutoPilot(campaign: CarouselCampaign): Promise<void> {
  if (isProcessing) {
    console.log('⏸️ Carousel AutoPilot already processing, skipping...');
    return;
  }

  isProcessing = true;
  const postId = uuid();

  try {
    console.log(`\n🎠 ══════════════════════════════════════════`);
    console.log(`   TikTok Carousel AutoPilot: ${campaign.name}`);
    console.log(`   Mode: ${campaign.requireApproval ? '👀 Review' : '🚀 Auto-Post'}`);
    console.log(`   Accounts: ${campaign.accountIds.length || getAllAccounts().length}`);
    console.log(`   ══════════════════════════════════════════\n`);

    // Step 1: Pick topic + generate content
    const topic = pickTopic(campaign);
    console.log(`📝 Topic: "${topic}"`);
    console.log(`🤖 Generating carousel content...`);

    const content = await generateCarouselContent(topic, campaign.slideCount);
    console.log(`✅ Content: "${content.hookText}" (${content.slides.length} slides)`);

    // Step 2: Fetch Pexels images using industry + topic for relevant backgrounds
    const totalSlides = content.slides.length + 2; // hook + tips + cta
    const imageSearchTerm = content.industry
      ? `${content.industry} ${topic}`
      : topic;
    console.log(`📸 Fetching ${totalSlides} background images for "${content.industry || 'general'}"...`);
    const imageUrls = await getSlideBackgrounds(totalSlides, imageSearchTerm);
    console.log(`✅ ${imageUrls.length} images fetched`);

    // Step 3: Render slides
    console.log(`🎨 Rendering ${totalSlides} carousel slides...`);
    const rendered = await renderCarousel(content, imageUrls);
    console.log(`✅ Slides rendered to ${rendered.tmpDir}`);

    // Step 4: Generate public URLs for slides via our API endpoint
    // TikTok requires URL ownership verification — serve from our own domain
    const baseUrl = process.env.TIKTOK_REDIRECT_URI?.replace('/api/tiktok/callback', '') || 'http://localhost:3000';
    console.log(`🔗 Generating slide URLs (base: ${baseUrl})...`);

    // Rename slides with unique post-specific names so they don't collide
    const slideUrls: string[] = [];
    for (let i = 0; i < rendered.slidePaths.length; i++) {
      const originalPath = rendered.slidePaths[i];
      const ext = path.extname(originalPath);
      const uniqueName = `${postId}_slide_${i}${ext}`;
      const newPath = path.join(rendered.tmpDir, uniqueName);
      fs.renameSync(originalPath, newPath);
      slideUrls.push(`${baseUrl}/api/slides/${uniqueName}`);
    }
    console.log(`✅ ${slideUrls.length} slide URLs ready`);

    // === REVIEW MODE ===
    if (campaign.requireApproval) {
      const post: CarouselPost = {
        id: postId,
        campaignId: campaign.id,
        content,
        slideImageUrls: slideUrls,
        status: 'pending_review',
        results: {},
        createdAt: new Date().toISOString(),
      };
      saveCarouselPost(post);

      campaign.totalGenerated += 1;
      campaign.lastGeneratedAt = new Date().toISOString();
      saveCarouselCampaign(campaign);

      console.log(`\n👀 READY FOR REVIEW: "${content.hookText}"`);
      // NOTE: Don't cleanup slides — they need to stay on disk for serving
      return;
    }

    // === AUTO-POST MODE ===
    console.log(`📤 Posting to ${campaign.accountIds.length || 'all'} TikTok accounts...`);
    const results = await publishCarouselToAll(
      slideUrls,
      content.title,
      content.description,
      campaign.accountIds.length > 0 ? campaign.accountIds : undefined,
    );

    const successCount = Object.values(results).filter(r => r.status === 'success').length;

    const post: CarouselPost = {
      id: postId,
      campaignId: campaign.id,
      content,
      slideImageUrls: slideUrls,
      status: successCount > 0 ? 'posted' : 'failed',
      results,
      createdAt: new Date().toISOString(),
      postedAt: successCount > 0 ? new Date().toISOString() : undefined,
    };
    saveCarouselPost(post);

    campaign.totalPosted += successCount;
    campaign.lastPostedAt = new Date().toISOString();
    saveCarouselCampaign(campaign);

    console.log(`\n🎉 Posted to ${successCount}/${Object.keys(results).length} TikTok accounts`);

    // === INSTAGRAM POST (always post, regardless of TikTok result) ===
    try {
      const hashtags = generateHashtags(content.hookText);
      const igCaption = `${content.description}\n\n${hashtags.map(h => `#${h}`).join(' ')}`;
      console.log(`\n📸 Posting to Instagram via ${process.env.IG_USER_ID ? 'Graph API' : 'Manus'}...`);
      console.log(`📸 IG caption (${igCaption.length} chars): "${igCaption.slice(0, 100)}..."`);
      console.log(`📸 IG slide URLs: ${slideUrls.length} images`);
      const igResult = await publishToIG(slideUrls, igCaption);
      console.log(`📸 IG result: ${JSON.stringify(igResult)}`);
      if (igResult.status === 'published') {
        console.log(`✅ Instagram carousel posted!`);
      } else {
        console.log(`⚠️ Instagram post: ${igResult.status} — ${igResult.error || 'unknown'}`);
      }
    } catch (igError) {
      console.error(`❌ Instagram post failed:`, igError);
    }

    cleanupCarousel(rendered);

  } catch (error) {
    console.error(`❌ Carousel AutoPilot error:`, error);
    const post: CarouselPost = {
      id: postId,
      campaignId: campaign.id,
      content: { hookText: 'Error', slides: [], ctaText: '', title: '', description: '', industry: '' },
      slideImageUrls: [],
      status: 'failed',
      results: {},
      error: error instanceof Error ? error.message : String(error),
      createdAt: new Date().toISOString(),
    };
    saveCarouselPost(post);
  } finally {
    isProcessing = false;
  }
}

/** Approve and publish a pending carousel post */
export async function approveAndPublishCarousel(
  postId: string,
  accountIds?: string[],
): Promise<{ status: string; error?: string }> {
  const post = getCarouselPost(postId);
  if (!post) throw new Error('Post not found');
  if (post.status !== 'pending_review' && post.status !== 'approved') {
    throw new Error(`Post status is ${post.status}, expected pending_review`);
  }

  try {
    post.status = 'posting';
    saveCarouselPost(post);

    const results = await publishCarouselToAll(
      post.slideImageUrls,
      post.content.title,
      post.content.description,
      accountIds,
    );

    const successCount = Object.values(results).filter(r => r.status === 'success').length;
    post.status = successCount > 0 ? 'posted' : 'failed';
    post.results = results;
    post.postedAt = new Date().toISOString();
    saveCarouselPost(post);

    return { status: successCount > 0 ? 'posted' : 'failed' };
  } catch (error) {
    post.status = 'failed';
    post.error = error instanceof Error ? error.message : String(error);
    saveCarouselPost(post);
    return { status: 'failed', error: post.error };
  }
}

/** Reject a pending post */
export function rejectCarouselPost(postId: string): void {
  const post = getCarouselPost(postId);
  if (!post) throw new Error('Post not found');
  post.status = 'rejected';
  saveCarouselPost(post);
}

// ============================================================================
// Scheduler
// ============================================================================

export function startCarouselAutoPilot(): void {
  console.log('\n🎠 ══════════════════════════════════════════');
  console.log('   TikTok Carousel AutoPilot Starting...');
  console.log('   ══════════════════════════════════════════\n');

  cron.schedule('* * * * *', async () => {
    const campaigns = getAllCarouselCampaigns().filter(c => c.enabled);
    if (campaigns.length === 0) return;

    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    for (const campaign of campaigns) {
      if (campaign.postTimes.includes(currentTime)) {
        if (campaign.lastGeneratedAt) {
          const last = new Date(campaign.lastGeneratedAt);
          if (now.getTime() - last.getTime() < 30 * 60 * 1000) continue;
        }

        // Every 3rd post is a demo video (if available)
        const shouldPostDemo = campaign.totalGenerated > 0 && campaign.totalGenerated % 3 === 0;
        const nextDemo = shouldPostDemo ? getNextDemo() : null;

        if (nextDemo) {
          console.log(`📹 Demo time for "${campaign.name}" — posting ${nextDemo.id}`);
          await postDemoVideo(nextDemo);
          // Still count it for the campaign
          campaign.totalGenerated += 1;
          campaign.lastGeneratedAt = new Date().toISOString();
          saveCarouselCampaign(campaign);
        } else {
          console.log(`⏰ Carousel time for "${campaign.name}" (${currentTime})`);
          await runCarouselAutoPilot(campaign);
        }
      }
    }
  });

  const campaigns = getAllCarouselCampaigns();
  const accounts = getAllAccounts();
  console.log(`📋 ${campaigns.length} campaign(s), ${accounts.length} account(s) connected`);
  campaigns.forEach(c => {
    console.log(`  ${c.enabled ? '🟢' : '🔴'} "${c.name}" — ${c.postsPerDay}/day at ${c.postTimes.join(', ')}`);
  });
}

/** Manually trigger one run */
export async function triggerCarouselAutoPilot(campaignId: string): Promise<void> {
  const campaign = getCarouselCampaign(campaignId);
  if (!campaign) throw new Error(`Campaign ${campaignId} not found`);
  await runCarouselAutoPilot(campaign);
}
