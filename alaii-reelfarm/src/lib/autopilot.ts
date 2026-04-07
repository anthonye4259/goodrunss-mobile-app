// ============================================================================
// Alaii ReelFarm — Automation Campaigns
// ============================================================================
// Set up once, runs forever. Automatically generates AI content, fetches
// images, renders videos, and posts to Instagram on a schedule.
// Like ReelFarm's automation feature — 3-4 posts per day on autopilot.

import cron from 'node-cron';
import { v4 as uuid } from 'uuid';
import { generateReelContent } from './ai';
import { getSlideBackgrounds, downloadImage } from './pexels';
import { buildSlides, renderSlideshow } from './ffmpeg';
import { uploadVideo } from './storage';
import { publishReel } from './instagram';
import { savePost, getAllPosts } from './db';
import * as fs from 'fs';
import * as path from 'path';
import type { Post } from '@/types';

// ============================================================================
// Campaign Configuration
// ============================================================================

export interface AutomationCampaign {
  id: string;
  name: string;
  /** Is this campaign active? */
  enabled: boolean;
  /** Require approval before publishing? If true, posts go to review queue */
  requireApproval: boolean;
  /** How many posts per day */
  postsPerDay: number;
  /** Posting times (24h format, e.g. ["09:00", "13:00", "17:00", "20:00"]) */
  postTimes: string[];
  /** Topic pool — the AI will rotate through these */
  topics: string[];
  /** Number of points per reel (3-7) */
  pointCount: number;
  /** Created timestamp */
  createdAt: string;
  /** Stats */
  totalPosted: number;
  totalGenerated: number;
  lastPostedAt?: string;
  lastGeneratedAt?: string;
}

// Default campaign for Alaii
const DEFAULT_ALAII_TOPICS = [
  // ── NO-SHOWS ──
  "signs your no-show problem is out of control as an injector",
  "things i stopped doing when clients kept ghosting my lash appointments",
  "how i finally fixed no-shows at my hair salon without being awkward",
  "no-show excuses every medspa owner has heard and how to prevent them",
  "ways no-shows are silently killing your lash business revenue",
  "things that changed when i stopped letting clients ghost me",

  // ── EMPTY CALENDAR ──
  "signs your booking calendar has way too many gaps this week",
  "things i did when my chair was empty 3 days a week",
  "ways i went from half-booked to fully booked as a lash tech",
  "how i stopped staring at an empty medspa schedule",
  "reasons your salon chair is empty and what to actually do about it",
  "things that happen when you let AI fill your cancellations automatically",

  // ── MANUAL CONTENT ──
  "hours i wasted making instagram posts instead of doing lashes",
  "things i stopped doing manually as a hair stylist that saved me 10 hours a week",
  "ways i automated my medspa content so i could focus on clients",
  "reasons you're spending more time on canva than on actual clients",
  "things that changed when i stopped creating content from scratch every day",
  "how i post 3 reels a day without touching my phone as a lash tech",

  // ── CHASING CLIENTS ──
  "texts i was sending every single client that i never send anymore",
  "things i stopped doing manually when i got an AI receptionist for my salon",
  "how i stopped chasing clients through DMs and texts as an injector",
  "ways i automated client follow-ups so i could actually rest",
  "reasons you're exhausted and it's not the lash sets it's the admin",
  "things a medspa owner should never do manually in 2025",

  // ── COMPETITOR CALL-OUTS ──
  "reasons i left glossgenius and never looked back",
  "things glossgenius charges $300 a month for that are free on alaii",
  "why i switched from acuity to alaii as a solo lash tech",
  "problems with square appointments that nobody talks about",
  "things vagaro does that made me want to throw my phone",
  "reasons injectors are ditching glossgenius for alaii",

  // ── GENERAL PAIN-FIRST ──
  "mistakes i made in my first year as a solo lash tech",
  "things i wish someone told me before opening my medspa",
  "signs you've outgrown your current booking system",
  "ways to look more professional to clients without spending more money",
  "things clients secretly judge about your booking process",
  "how i doubled my rebooking rate without changing my prices",
];

const CAMPAIGNS_FILE = path.join(process.cwd(), 'data', 'campaigns.json');

// ============================================================================
// Campaign CRUD
// ============================================================================

function ensureDataDir() {
  const dir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(CAMPAIGNS_FILE)) {
    // Create default campaign
    const defaultCampaign: AutomationCampaign = {
      id: uuid(),
      name: 'Alaii — Medspa, Hair, Lash Reels',
      enabled: false, // User must enable
      requireApproval: true, // Show in review queue before posting
      postsPerDay: 3,
      postTimes: ['09:00', '14:00', '19:00'],
      topics: DEFAULT_ALAII_TOPICS,
      pointCount: 5,
      createdAt: new Date().toISOString(),
      totalPosted: 0,
      totalGenerated: 0,
    };
    fs.writeFileSync(CAMPAIGNS_FILE, JSON.stringify([defaultCampaign], null, 2));
  }
}

export function getAllCampaigns(): AutomationCampaign[] {
  ensureDataDir();
  return JSON.parse(fs.readFileSync(CAMPAIGNS_FILE, 'utf-8'));
}

export function getCampaign(id: string): AutomationCampaign | undefined {
  return getAllCampaigns().find(c => c.id === id);
}

export function saveCampaign(campaign: AutomationCampaign): void {
  ensureDataDir();
  const campaigns = getAllCampaigns();
  const idx = campaigns.findIndex(c => c.id === campaign.id);
  if (idx >= 0) campaigns[idx] = campaign;
  else campaigns.push(campaign);
  fs.writeFileSync(CAMPAIGNS_FILE, JSON.stringify(campaigns, null, 2));
}

export function deleteCampaign(id: string): void {
  ensureDataDir();
  const campaigns = getAllCampaigns().filter(c => c.id !== id);
  fs.writeFileSync(CAMPAIGNS_FILE, JSON.stringify(campaigns, null, 2));
}

// ============================================================================
// Auto-Pilot Engine
// ============================================================================

let isProcessing = false;

/** Pick a random topic from the pool, avoiding recent ones */
function pickTopic(campaign: AutomationCampaign): string {
  const posts = getAllPosts();
  
  // Get hooks from last 10 posts to avoid repeating
  const recentHooks = posts
    .filter(p => p.status === 'published')
    .slice(-10)
    .map(p => p.content.hookText.toLowerCase());

  // Filter out recently used topics
  const availableTopics = campaign.topics.filter(topic => {
    return !recentHooks.some(hook => 
      hook.includes(topic.toLowerCase().split(' ').slice(0, 3).join(' '))
    );
  });

  const pool = availableTopics.length > 0 ? availableTopics : campaign.topics;
  return pool[Math.floor(Math.random() * pool.length)];
}

/** AutoPilot: generate content → save for review OR auto-publish */
async function runAutoPilot(campaign: AutomationCampaign): Promise<void> {
  if (isProcessing) {
    console.log('⏸️ AutoPilot already processing, skipping...');
    return;
  }

  isProcessing = true;
  const postId = uuid();

  try {
    console.log(`\n🤖 ══════════════════════════════════════════`);
    console.log(`   AutoPilot: ${campaign.name}`);
    console.log(`   Mode: ${campaign.requireApproval ? '👀 Review Before Posting' : '🚀 Auto-Post'}`);
    console.log(`   ══════════════════════════════════════════\n`);

    // Step 1: Pick topic & generate AI content
    const topic = pickTopic(campaign);
    console.log(`📝 Topic: "${topic}"`);
    console.log(`🤖 Generating AI content...`);
    
    const content = await generateReelContent(topic, campaign.pointCount);
    console.log(`✅ Content generated: "${content.hookText}"`);

    // Step 2: Fetch lifestyle images from Pexels
    console.log(`📸 Fetching background images...`);
    const imageUrls = await getSlideBackgrounds(content.points.length);
    console.log(`✅ ${imageUrls.length} images fetched`);

    // Step 3: Download images locally
    const tmpDir = path.join(process.cwd(), 'tmp', 'images');
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

    const localImagePaths: string[] = [];
    for (let i = 0; i < imageUrls.length; i++) {
      const localPath = path.join(tmpDir, `auto_${postId}_${i}.jpg`);
      await downloadImage(imageUrls[i], localPath);
      localImagePaths.push(localPath);
    }

    // Step 4: Build slides
    const slides = buildSlides(content, localImagePaths);

    // === REVIEW MODE: Save for approval ===
    if (campaign.requireApproval) {
      const post: Post = {
        id: postId,
        content,
        slides,
        status: 'pending_review',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      savePost(post);

      campaign.totalGenerated = (campaign.totalGenerated || 0) + 1;
      campaign.lastGeneratedAt = new Date().toISOString();
      saveCampaign(campaign);

      console.log(`\n👀 ══════════════════════════════════════════`);
      console.log(`   READY FOR REVIEW`);
      console.log(`   Hook: "${content.hookText}"`);
      console.log(`   → Go to dashboard to approve or edit`);
      console.log(`   ══════════════════════════════════════════\n`);
      return;
    }

    // === AUTO-POST MODE: Render + Upload + Publish ===
    console.log(`🎬 Rendering video...`);
    const videoPath = await renderSlideshow(slides);
    console.log(`✅ Video rendered: ${videoPath}`);

    console.log(`☁️ Uploading to storage...`);
    const videoUrl = await uploadVideo(videoPath);
    console.log(`✅ Uploaded: ${videoUrl}`);

    console.log(`📤 Publishing to Instagram...`);
    const result = await publishReel(videoUrl, content.caption);

    const post: Post = {
      id: postId,
      content,
      slides,
      status: result.status === 'published' ? 'published' : 'failed',
      videoPath,
      videoUrl,
      igMediaId: result.mediaId,
      publishedAt: result.status === 'published' ? new Date().toISOString() : undefined,
      error: result.error,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    savePost(post);

    if (result.status === 'published') {
      console.log(`\n🎉 ══════════════════════════════════════════`);
      console.log(`   PUBLISHED! IG Media ID: ${result.mediaId}`);
      console.log(`   Hook: "${content.hookText}"`);
      console.log(`   ══════════════════════════════════════════\n`);
      campaign.totalPosted += 1;
      campaign.lastPostedAt = new Date().toISOString();
      saveCampaign(campaign);
    } else {
      console.error(`❌ Publish failed: ${result.error}`);
    }

    localImagePaths.forEach(p => { try { fs.unlinkSync(p); } catch {} });
    try { fs.unlinkSync(videoPath); } catch {}

  } catch (error) {
    console.error(`❌ AutoPilot error:`, error);
    const post: Post = {
      id: postId,
      content: { hookText: 'AutoPilot Error', points: [], ctaText: '', caption: '' },
      slides: [],
      status: 'failed',
      error: error instanceof Error ? error.message : String(error),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    savePost(post);
  } finally {
    isProcessing = false;
  }
}

/** Approve a pending_review post → render → upload → publish */
export async function approveAndPublish(postId: string): Promise<{ status: string; error?: string }> {
  const { getPost } = await import('./db');
  const post = getPost(postId);
  if (!post) throw new Error('Post not found');
  if (post.status !== 'pending_review' && post.status !== 'approved') {
    throw new Error(`Post status is ${post.status}, expected pending_review or approved`);
  }

  try {
    // Render
    post.status = 'rendering';
    savePost(post);
    console.log(`🎬 Rendering approved post ${postId}...`);
    const videoPath = await renderSlideshow(post.slides);
    post.videoPath = videoPath;

    // Upload
    post.status = 'uploading';
    savePost(post);
    console.log(`☁️ Uploading...`);
    const videoUrl = await uploadVideo(videoPath);
    post.videoUrl = videoUrl;

    // Publish
    post.status = 'publishing';
    savePost(post);
    console.log(`📤 Publishing to Instagram...`);
    const result = await publishReel(videoUrl, post.content.caption);

    if (result.status === 'published') {
      post.status = 'published';
      post.igMediaId = result.mediaId;
      post.publishedAt = new Date().toISOString();
      savePost(post);
      console.log(`✅ Approved post published! IG ID: ${result.mediaId}`);
      return { status: 'published' };
    } else {
      post.status = 'failed';
      post.error = result.error;
      savePost(post);
      return { status: 'failed', error: result.error };
    }
  } catch (error) {
    post.status = 'failed';
    post.error = error instanceof Error ? error.message : String(error);
    savePost(post);
    return { status: 'failed', error: post.error };
  }
}

/** Reject a pending_review post */
export function rejectPost(postId: string): void {
  const { getPost } = require('./db');
  const post = getPost(postId);
  if (!post) throw new Error('Post not found');
  post.status = 'rejected';
  savePost(post);
  console.log(`❌ Post ${postId} rejected`);
}

// ============================================================================
// Scheduler
// ============================================================================

/** Start the automation scheduler */
export function startAutoPilot(): void {
  console.log('\n🚀 ══════════════════════════════════════════');
  console.log('   Alaii ReelFarm AutoPilot Starting...');
  console.log('   ══════════════════════════════════════════\n');

  // Check every minute for due automations
  cron.schedule('* * * * *', async () => {
    const campaigns = getAllCampaigns().filter(c => c.enabled);
    
    if (campaigns.length === 0) return;

    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    for (const campaign of campaigns) {
      // Check if current time matches any posting time
      if (campaign.postTimes.includes(currentTime)) {
        console.log(`⏰ Time to post for "${campaign.name}" (${currentTime})`);
        
        // Check if we already posted at this time today
        if (campaign.lastPostedAt) {
          const lastPost = new Date(campaign.lastPostedAt);
          const diffMs = now.getTime() - lastPost.getTime();
          // Don't post if last post was less than 30 minutes ago
          if (diffMs < 30 * 60 * 1000) {
            console.log(`⏸️ Skipping — last post was ${Math.round(diffMs / 60000)}min ago`);
            continue;
          }
        }

        await runAutoPilot(campaign);
      }
    }
  });

  // Also process any manually scheduled posts
  cron.schedule('* * * * *', async () => {
    const { getScheduledPosts } = await import('./db');
    const scheduled = getScheduledPosts();
    const now = new Date();
    
    const duePosts = scheduled.filter(p => new Date(p.scheduledAt!) <= now);
    
    for (const post of duePosts) {
      const { publishNow } = await import('./scheduler');
      await publishNow(post);
    }
  });

  // Log active campaigns
  const campaigns = getAllCampaigns();
  campaigns.forEach(c => {
    console.log(`📋 Campaign: "${c.name}"`);
    console.log(`   Status: ${c.enabled ? '🟢 ACTIVE' : '🔴 DISABLED'}`);
    console.log(`   Posts/day: ${c.postsPerDay}`);
    console.log(`   Times: ${c.postTimes.join(', ')}`);
    console.log(`   Topics: ${c.topics.length} in rotation`);
    console.log(`   Total posted: ${c.totalPosted}\n`);
  });
}

/** Manually trigger one autopilot run for a campaign */
export async function triggerAutoPilot(campaignId: string): Promise<void> {
  const campaign = getCampaign(campaignId);
  if (!campaign) throw new Error(`Campaign ${campaignId} not found`);
  await runAutoPilot(campaign);
}
