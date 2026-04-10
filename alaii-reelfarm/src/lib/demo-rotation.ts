// ============================================================================
// Alaii ReelFarm — Demo Video Rotation
// ============================================================================
// Pre-recorded demo videos posted on rotation alongside carousel content.
// These are the high-impact product demos that show Alaii in action.
// Drop MP4 files in /data/demos/ and they'll auto-rotate into the feed.

import * as fs from 'fs';
import * as path from 'path';
import { publishReel } from './instagram';
import { uploadVideo } from './storage';

// ============================================================================
// Demo Definitions
// ============================================================================

interface DemoVideo {
  id: string;
  filename: string;         // e.g. "demo-wealth.mp4"
  caption: string;          // TikTok/IG caption with link in bio
  title: string;            // TikTok title
  lastPostedAt?: string;
}

// Each demo gets a unique, proof-style caption
const DEMO_VIDEOS: DemoVideo[] = [
  {
    id: 'wealth',
    filename: 'demo-wealth.mp4',
    caption: `$96,000. that's how much the average beauty pro loses per year to no-shows, empty slots, and ghost clients.\n\ni stopped letting that happen. now my slots fill themselves.\n\nlink in bio.\n\n#beautybusiness #medspa #hairstylist #lashtech #nailtech #esthetician #salonowner #beautypro #alaii`,
    title: 'how much money you lose per year (the math)',
  },
  {
    id: '214am',
    filename: 'demo-214am.mp4',
    caption: `it's 2:14am. i'm sleeping. but my book is filling itself.\n\nwoke up to $1,240 in new bookings. 3 slots filled. 1 ghost client won back. all while i slept.\n\nlink in bio.\n\n#beautybusiness #passiveincome #medspa #hairstylist #lashtech #salonowner #beautypro #alaii`,
    title: 'what happened to my bookings at 2:14am',
  },
  {
    id: 'injector',
    filename: 'demo-injector.mp4',
    caption: `one empty Botox slot = $400 gone. 3 per week = $123,200 per year.\n\ni stopped losing money to empty slots, no-shows, and ghost patients. now they fill automatically.\n\nlink in bio.\n\n#nurseinjector #medspa #botox #fillers #aestheticnurse #injectorlife #medspabusiness #alaii`,
    title: '$400 per empty Botox slot. do the math',
  },
];

const DEMOS_DIR = path.join(process.cwd(), 'data', 'demos');
const ROTATION_FILE = path.join(process.cwd(), 'data', 'demo-rotation.json');

function ensureDemosDir() {
  if (!fs.existsSync(DEMOS_DIR)) fs.mkdirSync(DEMOS_DIR, { recursive: true });
}

// ============================================================================
// Rotation State
// ============================================================================

interface RotationState {
  lastPostedIndex: number;
  lastPostedAt: string | null;
  totalPosted: number;
}

function getRotationState(): RotationState {
  if (fs.existsSync(ROTATION_FILE)) {
    return JSON.parse(fs.readFileSync(ROTATION_FILE, 'utf-8'));
  }
  return { lastPostedIndex: -1, lastPostedAt: null, totalPosted: 0 };
}

function saveRotationState(state: RotationState) {
  fs.writeFileSync(ROTATION_FILE, JSON.stringify(state, null, 2));
}

// ============================================================================
// Core: Get Next Demo + Post
// ============================================================================

/** Get the next demo video that's ready to post (file exists on disk) */
export function getNextDemo(): DemoVideo | null {
  ensureDemosDir();

  // Find which demos have actual MP4 files
  const available = DEMO_VIDEOS.filter(d =>
    fs.existsSync(path.join(DEMOS_DIR, d.filename))
  );

  if (available.length === 0) {
    console.log('📹 No demo MP4s found in /data/demos/. Screen record the HTML demos and drop them in.');
    return null;
  }

  // Round-robin through available demos
  const state = getRotationState();
  const nextIndex = (state.lastPostedIndex + 1) % available.length;
  return available[nextIndex];
}

/** Post a demo video to IG (and optionally TikTok) */
export async function postDemoVideo(demo: DemoVideo): Promise<{ status: string; error?: string }> {
  const filePath = path.join(DEMOS_DIR, demo.filename);

  if (!fs.existsSync(filePath)) {
    return { status: 'error', error: `File not found: ${filePath}` };
  }

  try {
    console.log(`\n📹 ══════════════════════════════════════════`);
    console.log(`   Posting Demo: ${demo.id}`);
    console.log(`   File: ${demo.filename}`);
    console.log(`   ══════════════════════════════════════════\n`);

    // Upload to storage
    console.log('☁️ Uploading demo video...');
    const videoUrl = await uploadVideo(filePath);
    console.log(`✅ Uploaded: ${videoUrl}`);

    // Publish to Instagram as Reel
    console.log('📤 Publishing to Instagram...');
    const result = await publishReel(videoUrl, demo.caption);

    if (result.status === 'published') {
      console.log(`✅ Demo "${demo.id}" published! IG Media ID: ${result.mediaId}`);

      // Update rotation state
      const state = getRotationState();
      const available = DEMO_VIDEOS.filter(d =>
        fs.existsSync(path.join(DEMOS_DIR, d.filename))
      );
      const idx = available.findIndex(d => d.id === demo.id);
      state.lastPostedIndex = idx;
      state.lastPostedAt = new Date().toISOString();
      state.totalPosted += 1;
      saveRotationState(state);

      return { status: 'published' };
    } else {
      console.error(`❌ Demo publish failed: ${result.error}`);
      return { status: 'error', error: result.error };
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error(`❌ Demo post error: ${msg}`);
    return { status: 'error', error: msg };
  }
}

/** Get list of all demos and their status (file exists or not) */
export function getDemoStatus(): { id: string; filename: string; ready: boolean; title: string }[] {
  ensureDemosDir();
  return DEMO_VIDEOS.map(d => ({
    id: d.id,
    filename: d.filename,
    ready: fs.existsSync(path.join(DEMOS_DIR, d.filename)),
    title: d.title,
  }));
}
