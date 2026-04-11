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
  // ── THE PAIN (make them feel it) ──
  "just had a cancellation? that's $200 gone. unless you do this",
  "another no-show. another empty hour. another $0",
  "3pm cancelled. 3pm is now empty. 3pm is now lost money",
  "that feeling when your 2pm cancels 30 minutes before",
  "you just lost $400 because someone 'forgot'",
  "client cancelled. you texted 8 people. nobody replied. sound familiar?",
  "cancellations aren't annoying. they're expensive. here's how much",

  // ── THE MATH (make it real) ──
  "2 cancellations per week × 52 weeks = $20,000+ lost per year",
  "one empty Botox slot = $500 gone. one empty lash slot = $150 gone",
  "i tracked my cancellations for 30 days. i lost $3,200",
  "the average beauty pro loses $15,000/year to cancellations",
  "$62,000. that's what 3 empty filler slots per week costs per year",
  "every empty hour in your chair is money you'll never get back",

  // ── THE FIX (tap once) ──
  "client cancelled at 10am. slot was filled by 10:08am",
  "i stopped losing money to cancellations. one tap fixed it",
  "cancelled slot → tap once → waitlist notified → slot filled. that simple",
  "she cancelled at noon. by 12:05 someone else booked. here's how",
  "i used to panic when clients cancelled. now i tap one button",
  "the difference between losing $400 and making $400? one tap",

  // ── INJECTORS / MEDSPA ──
  "Botox cancellation? that's $500 gone. tap once and rescue it",
  "my medspa used to lose 3 filler slots per week. not anymore",
  "patient cancelled their $600 appointment. i filled it in 7 minutes",
  "empty Botox chair at 2pm? your waitlist wants that slot. let them know",
  "one tap. 7 minutes. $500 saved. that's cancellation rescue",

  // ── HAIR STYLISTS ──
  "balayage cancelled. $200 gone. unless you rescue it in 5 minutes",
  "my chair hasn't been empty from a cancellation in 3 weeks",
  "color client ghosted. tapped once. filled in 12 minutes",
  "solo stylist tip: stop losing money to cancellations. rescue them",

  // ── LASH TECHS ──
  "lash fill cancelled. $150 gone. or you tap once and save it",
  "2 lash cancellations per week = $15,000/year you're losing",
  "she cancelled her lash appointment. 8 minutes later someone else had it",
  "lash techs: your cancellations are costing you a vacation every year",

  // ── ESTHETICIANS ──
  "facial cancelled last minute. $120 you'll never see. unless...",
  "empty treatment room = lost money. fill it in minutes, not hours",

  // ── EMOTIONAL / RELATABLE ──
  "stop accepting cancellations as 'part of the job'",
  "you didn't start your business to lose money to no-shows",
  "the hardest part isn't the cancellation. it's scrambling to fill it alone",
  "what if cancellations stopped costing you money?",
  "you're one tap away from never losing money to a cancellation again",
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
