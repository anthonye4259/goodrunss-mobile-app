// ============================================================================
// Alaii ReelFarm — FFmpeg Video Renderer
// ============================================================================
// Generates slideshow-style Reel videos from slides using Canvas (for frames)
// and FFmpeg (for stitching into MP4 with transitions).
//
// Output: 1080x1920 (9:16) MP4, H.264, 30fps, 5-30s

import { createCanvas, loadImage, registerFont } from 'canvas';
import ffmpeg from 'fluent-ffmpeg';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuid } from 'uuid';
import type { Slide } from '@/types';

const WIDTH = 1080;
const HEIGHT = 1920;
const FPS = 30;
const FRAME_DIR = path.join(process.cwd(), 'tmp', 'frames');
const OUTPUT_DIR = path.join(process.cwd(), 'tmp', 'renders');

// Ensure directories exist
function ensureDirs() {
  [FRAME_DIR, OUTPUT_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  });
}

// ============================================================================
// Canvas Frame Generators
// ============================================================================

/** Draw the hook slide — REELFARM STYLE:
 *  Plain white text, regular weight, centered around 35% from top.
 *  No pill, no bold. Just clean white text on the image. */
async function drawHookFrame(text: string, imageUrl?: string): Promise<Buffer> {
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext('2d');

  // Background: image or dark gradient
  if (imageUrl) {
    try {
      const img = await loadImage(imageUrl);
      const scale = Math.max(WIDTH / img.width, HEIGHT / img.height);
      const sw = img.width * scale;
      const sh = img.height * scale;
      ctx.drawImage(img, (WIDTH - sw) / 2, (HEIGHT - sh) / 2, sw, sh);

      // Light overlay for readability
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
    } catch {
      const gradient = ctx.createLinearGradient(0, 0, 0, HEIGHT);
      gradient.addColorStop(0, '#0a0a0a');
      gradient.addColorStop(0.5, '#1a1a2e');
      gradient.addColorStop(1, '#0a0a0a');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
    }
  } else {
    const gradient = ctx.createLinearGradient(0, 0, 0, HEIGHT);
    gradient.addColorStop(0, '#0a0a0a');
    gradient.addColorStop(0.5, '#1a1a2e');
    gradient.addColorStop(1, '#0a0a0a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
  }

  // Plain white text — regular weight (NOT bold), centered at ~35% from top
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const fontSize = 60;
  ctx.font = `${fontSize}px "Inter", "Helvetica Neue", Arial, sans-serif`; // regular, not bold

  const lines = wrapText(ctx, text.toLowerCase(), WIDTH - 160);
  const lineHeight = fontSize * 1.4;
  const totalHeight = lines.length * lineHeight;
  const startY = (HEIGHT * 0.35) - (totalHeight / 2);

  // Shadow
  lines.forEach((line, i) => {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillText(line, WIDTH / 2 + 2, startY + (i * lineHeight) + lineHeight / 2 + 2);
  });
  // White text
  lines.forEach((line, i) => {
    ctx.fillStyle = '#ffffff';
    ctx.fillText(line, WIDTH / 2, startY + (i * lineHeight) + lineHeight / 2);
  });

  return canvas.toBuffer('image/png');
}

/** Draw a numbered point slide — REELFARM EXACT STYLE:
 *  - Numbered heading: dark text on WHITE background pill
 *  - Pain point + solution: regular weight white text, 70% width
 *  - All text in top 1/3rd of slide */
async function drawPointFrame(
  headline: string,
  bodyLines: string[],
  imageUrl?: string
): Promise<Buffer> {
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext('2d');

  // Background image or dark fallback
  if (imageUrl) {
    try {
      const img = await loadImage(imageUrl);
      const scale = Math.max(WIDTH / img.width, HEIGHT / img.height);
      const sw = img.width * scale;
      const sh = img.height * scale;
      ctx.drawImage(img, (WIDTH - sw) / 2, (HEIGHT - sh) / 2, sw, sh);

      // Light overlay
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
    } catch {
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
    }
  } else {
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
  }

  const centerX = WIDTH / 2;
  const textWidth = WIDTH * 0.7; // 70% width as specified
  const pillStartY = HEIGHT * 0.10; // Raised higher — top of slide

  // === HEADING: dark text on WHITE pill (tight wrap) ===
  const headlineLower = headline.toLowerCase();
  ctx.font = '32px "Inter", "Helvetica Neue", Arial, sans-serif'; // smaller, daintier
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Wrap headline text
  const headlineLines = wrapText(ctx, headlineLower, textWidth - 40);
  const hlLineHeight = 40;
  const hlTotalHeight = headlineLines.length * hlLineHeight;
  const pillPadX = 6; // minimal horizontal padding
  const pillPadY = 4; // minimal vertical padding

  // Measure max line width for pill — tight wrap
  let maxLineWidth = 0;
  headlineLines.forEach(line => {
    const w = ctx.measureText(line).width;
    if (w > maxLineWidth) maxLineWidth = w;
  });

  const pillW = maxLineWidth + pillPadX * 2;
  const pillH = hlTotalHeight + pillPadY * 2;
  const pillX = centerX - pillW / 2;

  // Draw WHITE pill (tight, wraps snugly around text)
  const radius = 6;
  ctx.beginPath();
  ctx.moveTo(pillX + radius, pillStartY);
  ctx.lineTo(pillX + pillW - radius, pillStartY);
  ctx.quadraticCurveTo(pillX + pillW, pillStartY, pillX + pillW, pillStartY + radius);
  ctx.lineTo(pillX + pillW, pillStartY + pillH - radius);
  ctx.quadraticCurveTo(pillX + pillW, pillStartY + pillH, pillX + pillW - radius, pillStartY + pillH);
  ctx.lineTo(pillX + radius, pillStartY + pillH);
  ctx.quadraticCurveTo(pillX, pillStartY + pillH, pillX, pillStartY + pillH - radius);
  ctx.lineTo(pillX, pillStartY + radius);
  ctx.quadraticCurveTo(pillX, pillStartY, pillX + radius, pillStartY);
  ctx.closePath();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
  ctx.fill();

  // Draw heading text (dark on white pill)
  ctx.fillStyle = '#111111';
  headlineLines.forEach((line, i) => {
    const y = pillStartY + pillPadY + (i * hlLineHeight) + hlLineHeight / 2;
    ctx.fillText(line, centerX, y);
  });

  // === BODY TEXT: white, smaller/daintier, 70% width ===
  ctx.font = '28px "Inter", "Helvetica Neue", Arial, sans-serif'; // smaller, daintier
  let bodyY = pillStartY + pillH + 28;

  bodyLines.forEach((line) => {
    const wrappedLines = wrapText(ctx, line.toLowerCase(), textWidth);
    wrappedLines.forEach((wl) => {
      // Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillText(wl, centerX + 1, bodyY + 1);
      // White text
      ctx.fillStyle = '#ffffff';
      ctx.fillText(wl, centerX, bodyY);
      bodyY += 38;
    });
    bodyY += 12;
  });

  return canvas.toBuffer('image/png');
}

/** Draw the CTA slide — same style as other slides with background image */
async function drawCTAFrame(ctaText: string, imageUrl?: string): Promise<Buffer> {
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext('2d');

  // Background image or gradient fallback
  if (imageUrl) {
    try {
      const img = await loadImage(imageUrl);
      const scale = Math.max(WIDTH / img.width, HEIGHT / img.height);
      const sw = img.width * scale;
      const sh = img.height * scale;
      ctx.drawImage(img, (WIDTH - sw) / 2, (HEIGHT - sh) / 2, sw, sh);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
    } catch {
      const gradient = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
      gradient.addColorStop(0, '#1a1a2e');
      gradient.addColorStop(1, '#0f3460');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
    }
  } else {
    const gradient = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(1, '#0f3460');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
  }

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const textWidth = WIDTH * 0.7;

  // CTA text in WHITE pill — same style as numbered slides
  ctx.font = '32px "Inter", "Helvetica Neue", Arial, sans-serif';
  const ctaLines = wrapText(ctx, ctaText.toLowerCase(), textWidth - 40);
  const ctaLineHeight = 40;
  const ctaTotalHeight = ctaLines.length * ctaLineHeight;
  const ctaPadX = 16;
  const ctaPadY = 10;

  let maxW = 0;
  ctaLines.forEach(l => { const w = ctx.measureText(l).width; if (w > maxW) maxW = w; });

  const pillW = maxW + ctaPadX * 2;
  const pillH = ctaTotalHeight + ctaPadY * 2;
  const pillX = WIDTH / 2 - pillW / 2;
  const pillY = HEIGHT * 0.10;

  // White pill
  const r = 6;
  ctx.beginPath();
  ctx.moveTo(pillX + r, pillY);
  ctx.lineTo(pillX + pillW - r, pillY);
  ctx.quadraticCurveTo(pillX + pillW, pillY, pillX + pillW, pillY + r);
  ctx.lineTo(pillX + pillW, pillY + pillH - r);
  ctx.quadraticCurveTo(pillX + pillW, pillY + pillH, pillX + pillW - r, pillY + pillH);
  ctx.lineTo(pillX + r, pillY + pillH);
  ctx.quadraticCurveTo(pillX, pillY + pillH, pillX, pillY + pillH - r);
  ctx.lineTo(pillX, pillY + r);
  ctx.quadraticCurveTo(pillX, pillY, pillX + r, pillY);
  ctx.closePath();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
  ctx.fill();

  ctx.fillStyle = '#111111';
  ctaLines.forEach((line, i) => {
    ctx.fillText(line, WIDTH / 2, pillY + ctaPadY + i * ctaLineHeight + ctaLineHeight / 2);
  });

  // Website URL — white text below pill
  ctx.font = '28px "Inter", "Helvetica Neue", Arial, sans-serif';
  let bodyY = pillY + pillH + 32;

  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.fillText('alaii.app', WIDTH / 2 + 1, bodyY + 1);
  ctx.fillStyle = '#ffffff';
  ctx.fillText('alaii.app', WIDTH / 2, bodyY);

  bodyY += 38;
  ctx.font = '24px "Inter", "Helvetica Neue", Arial, sans-serif';
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.fillText('free on app store + android', WIDTH / 2 + 1, bodyY + 1);
  ctx.fillStyle = '#ffffff';
  ctx.fillText('free on app store + android', WIDTH / 2, bodyY);

  return canvas.toBuffer('image/png');
}

// ============================================================================
// FFmpeg Pipeline
// ============================================================================

/** Render a full slideshow reel from slides → MP4 */
export async function renderSlideshow(slides: Slide[]): Promise<string> {
  ensureDirs();

  const renderIdent = uuid();
  const frameSubDir = path.join(FRAME_DIR, renderIdent);
  fs.mkdirSync(frameSubDir, { recursive: true });

  let frameIndex = 0;

  // Generate frames for each slide
  for (const slide of slides) {
    const framesForSlide = slide.duration * FPS;
    let frameBuffer: Buffer;

    switch (slide.type) {
      case 'hook':
        frameBuffer = await drawHookFrame(slide.headline, slide.imageUrl);
        break;
      case 'point':
        frameBuffer = await drawPointFrame(slide.headline, slide.bodyLines, slide.imageUrl);
        break;
      case 'cta':
        frameBuffer = await drawCTAFrame(slide.headline, slide.imageUrl);        break;
      default:
        frameBuffer = await drawHookFrame(slide.headline);
    }

    // Write the same frame for the whole duration (static slides)
    for (let f = 0; f < framesForSlide; f++) {
      const framePath = path.join(frameSubDir, `frame_${String(frameIndex).padStart(6, '0')}.png`);
      fs.writeFileSync(framePath, frameBuffer);
      frameIndex++;
    }
  }

  // Stitch frames into MP4 with FFmpeg
  const outputPath = path.join(OUTPUT_DIR, `reel_${renderIdent}.mp4`);

  // Generate a silent WAV file (lavfi not available in all FFmpeg builds)
  const totalDuration = slides.reduce((sum, s) => sum + s.duration, 0);
  const silentWavPath = path.join(frameSubDir, 'silence.wav');
  generateSilentWav(silentWavPath, totalDuration);

  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(path.join(frameSubDir, 'frame_%06d.png'))
      .inputFPS(FPS)
      // Silent audio track so the MP4 plays on all devices (QuickTime, iOS, IG)
      .input(silentWavPath)
      .videoCodec('libx264')
      .audioCodec('aac')
      .audioBitrate('128k')
      .outputOption('-pix_fmt', 'yuv420p')
      .outputOption('-preset', 'fast')
      .outputOption('-crf', '23')
      .outputOption('-shortest')
      .size(`${WIDTH}x${HEIGHT}`)
      .fps(FPS)
      .on('start', (cmd) => {
        console.log('🎬 FFmpeg started:', cmd);
      })
      .on('end', () => {
        console.log('✅ Video rendered:', outputPath);
        // Clean up frames + silence file
        fs.rmSync(frameSubDir, { recursive: true, force: true });
        resolve(outputPath);
      })
      .on('error', (err) => {
        console.error('❌ FFmpeg error:', err);
        fs.rmSync(frameSubDir, { recursive: true, force: true });
        reject(err);
      })
      .save(outputPath);
  });
}

/** Build slides array from ReelContent */
export function buildSlides(content: import('@/types').ReelContent, imageUrls: string[]): Slide[] {
  const slides: Slide[] = [];

  // Hook slide (3 seconds) — use first image as background like ReelFarm
  slides.push({
    type: 'hook',
    headline: content.hookText,
    bodyLines: [],
    imageUrl: imageUrls[0] || undefined,
    duration: 3,
  });

  // Numbered point slides (4 seconds each) — use remaining images
  content.points.forEach((point, i) => {
    slides.push({
      type: 'point',
      headline: point.headline,
      bodyLines: [point.painPoint, point.solution],
      imageUrl: imageUrls[i + 1] || imageUrls[i] || undefined,
      duration: 4,
    });
  });

  // CTA slide (3 seconds) — use last image for background
  slides.push({
    type: 'cta',
    headline: content.ctaText,
    bodyLines: [],
    imageUrl: imageUrls[content.points.length + 1] || imageUrls[imageUrls.length - 1] || undefined,
    duration: 3,
  });

  return slides;
}

// ============================================================================
// Utilities
// ============================================================================

function wrapText(ctx: ReturnType<ReturnType<typeof createCanvas>['getContext']>, text: string, maxWidth: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  words.forEach(word => {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  });
  if (currentLine) lines.push(currentLine);
  return lines;
}

/** Generate a silent WAV file (no lavfi dependency) */
function generateSilentWav(filePath: string, durationSeconds: number): void {
  const sampleRate = 44100;
  const numChannels = 2;
  const bitsPerSample = 16;
  const bytesPerSample = bitsPerSample / 8;
  const totalSamples = sampleRate * durationSeconds * numChannels;
  const dataSize = totalSamples * bytesPerSample;

  // WAV header is 44 bytes
  const buffer = Buffer.alloc(44 + dataSize, 0);

  // RIFF header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);

  // fmt chunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);           // chunk size
  buffer.writeUInt16LE(1, 20);            // PCM format
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * numChannels * bytesPerSample, 28); // byte rate
  buffer.writeUInt16LE(numChannels * bytesPerSample, 32);              // block align
  buffer.writeUInt16LE(bitsPerSample, 34);

  // data chunk (all zeros = silence)
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  fs.writeFileSync(filePath, buffer);
}
