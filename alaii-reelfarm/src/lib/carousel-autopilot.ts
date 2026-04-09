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
  // ── MONEY YOU'RE LOSING ──
  "how much money you lose every time a client no-shows",
  "the real cost of one empty slot per day ($75,000/year)",
  "5 ways you're losing money without realizing it",
  "i calculated how much ghost clients cost me. it was $23,000",
  "empty slots are eating your income alive",
  "you're leaving $400 on the table every week. here's how",

  // ── PASSIVE INCOME / WEALTH ──
  "how i make money while i sleep as a beauty pro",
  "the difference between being busy and being wealthy",
  "5 things wealthy service providers do differently",
  "you're working 12 hour days and still broke. here's why",
  "how to stop trading time for money in the beauty industry",
  "talented and broke is not a flex. build systems",
  "i stopped hustling harder and started building smarter",
  "passive income strategies for beauty professionals",
  "how my AI makes me money while i'm with clients",

  // ── WEALTH SYSTEMS ──
  "the one system that changed my business income overnight",
  "what happened when i let AI handle my client texts",
  "i used to chase clients. now they chase me",
  "how i fill cancellations in 10 minutes without touching my phone",
  "your phone is not a business tool. it's holding you back",
  "1 AI text recovered $2,400 in lost bookings last month",
  "stop posting and start automating. your wallet will thank you",

  // ── INJECTORS / MEDSPA (WEALTH) ──
  "one empty Botox slot costs you $400. 3/week = $62,000/year",
  "how i built a 6-figure medspa with zero admin staff",
  "the biggest money mistake new injectors make",
  "patients ghost after consultations. here's what that costs you",
  "why your medspa needs an AI that works nights and weekends",
  "injector math: the real numbers behind a full vs empty book",

  // ── HAIR STYLISTS (WEALTH) ──
  "how much money you lose when clients don't rebook",
  "the behind-the-chair habit that's costing you thousands",
  "i went from renting a chair to owning my income in 90 days",
  "solo stylists: stop doing $100/hr work for $30/hr pay",
  "5 ways to keep your chair full without begging for clients",

  // ── LASH TECHS (WEALTH) ──
  "2 cancellations per week = $15,000/year in lost lash income",
  "how i built a 6-figure lash business working 4 days a week",
  "the text that gets 90% of lash clients to rebook immediately",
  "lash tech money tips nobody talks about",
  "your lash room is a business. start treating it like one",

  // ── ESTHETICIANS (WEALTH) ──
  "every client who doesn't rebook costs you $8,000/year",
  "how i filled my slow season without running a single ad",
  "esthetician income: why you're underpaid and how to fix it",
  "the follow-up that tripled my facial rebooking rate",

  // ── NAIL TECHS (WEALTH) ──
  "no-shows without deposits cost nail techs thousands per year",
  "how i doubled my nail income in 6 months with one change",
  "3 empty slots per week = $12,000/year you'll never see",

  // ── REAL TALK / TRENDING ──
  "things beauty school never taught you about building wealth",
  "the moment i realized i was running a business not just doing services",
  "your competitors are automating everything. you're still texting clients manually",
  "fully booked and still stressed? you have an income problem not a booking problem",
  "my honest numbers as a solo beauty pro (what i actually keep)",
  "POV: you finally stopped losing money and started building wealth",
  "the $0 tool that replaced my $50/month booking app",
  "red flag: if your booking app doesn't fill your cancellations for you",
  "what $500/month in lost bookings looks like over 5 years",
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
      name: 'Alaii — TikTok Carousels',
      enabled: false,
      requireApproval: true,
      postsPerDay: 20,
      postTimes: [
        '07:00', '07:45', '08:30', '09:15', '10:00', '10:45',
        '11:30', '12:15', '13:00', '13:45', '14:30', '15:15',
        '16:00', '16:45', '17:30', '18:15', '19:00', '19:45',
        '20:30', '21:15',
      ],
      topics: DEFAULT_CAROUSEL_TOPICS,
      accountIds: [], // Empty = all accounts
      slideCount: 5,
      createdAt: new Date().toISOString(),
      totalPosted: 0,
      totalGenerated: 0,
    };
    fs.writeFileSync(CAMPAIGNS_FILE, JSON.stringify([defaultCampaign], null, 2));
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
        console.log(`⏰ Carousel time for "${campaign.name}" (${currentTime})`);
        await runCarouselAutoPilot(campaign);
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
