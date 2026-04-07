// ============================================================================
// Alaii ReelFarm — Carousel Image Renderer
// ============================================================================
// Renders text onto Pexels background images to create carousel slides.
// Uses node-canvas for server-side image generation. No video/ffmpeg needed.
// Output: 1080×1350 JPG images (TikTok carousel optimal size).

import { createCanvas, loadImage, registerFont } from 'canvas';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuid } from 'uuid';
import type { CarouselContent, CarouselSlide } from './carousel-ai';
import { downloadImage } from './pexels';

const SLIDE_WIDTH = 1080;
const SLIDE_HEIGHT = 1350;

// ============================================================================
// Text Rendering Helpers
// ============================================================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Ctx = any; // node-canvas context differs from DOM CanvasRenderingContext2D

function wrapText(
  ctx: Ctx,
  text: string,
  maxWidth: number,
): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = words[0] || '';

  for (let i = 1; i < words.length; i++) {
    const testLine = currentLine + ' ' + words[i];
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth) {
      lines.push(currentLine);
      currentLine = words[i];
    } else {
      currentLine = testLine;
    }
  }
  lines.push(currentLine);
  return lines;
}

function drawTextWithShadow(
  ctx: Ctx,
  text: string,
  x: number,
  y: number,
) {
  // Shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.fillText(text, x + 2, y + 2);
  // Main text
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(text, x, y);
}

// ============================================================================
// Slide Renderers
// ============================================================================

async function renderHookSlide(
  hookText: string,
  bgImagePath: string,
  outputPath: string,
): Promise<void> {
  const canvas = createCanvas(SLIDE_WIDTH, SLIDE_HEIGHT);
  const ctx = canvas.getContext('2d');

  // Background image
  const img = await loadImage(bgImagePath);
  ctx.drawImage(img, 0, 0, SLIDE_WIDTH, SLIDE_HEIGHT);

  // Dark gradient overlay (stronger for readability)
  const gradient = ctx.createLinearGradient(0, 0, 0, SLIDE_HEIGHT);
  gradient.addColorStop(0, 'rgba(0, 0, 0, 0.75)');
  gradient.addColorStop(0.5, 'rgba(0, 0, 0, 0.4)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0.6)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, SLIDE_WIDTH, SLIDE_HEIGHT);

  // Hook text — large, centered in upper portion
  ctx.font = 'bold 64px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';

  const maxWidth = SLIDE_WIDTH * 0.8;
  const lines = wrapText(ctx, hookText, maxWidth);
  const lineHeight = 80;
  const startY = SLIDE_HEIGHT * 0.25 - (lines.length * lineHeight) / 2;

  for (let i = 0; i < lines.length; i++) {
    drawTextWithShadow(ctx, lines[i], SLIDE_WIDTH / 2, startY + i * lineHeight);
  }

  // Alaii watermark
  ctx.font = '24px sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.fillText('alaii.app', SLIDE_WIDTH / 2, SLIDE_HEIGHT - 60);

  // Save
  const buffer = canvas.toBuffer('image/jpeg', { quality: 0.92 });
  fs.writeFileSync(outputPath, buffer);
}

async function renderTipSlide(
  slide: CarouselSlide,
  bgImagePath: string,
  outputPath: string,
): Promise<void> {
  const canvas = createCanvas(SLIDE_WIDTH, SLIDE_HEIGHT);
  const ctx = canvas.getContext('2d');

  // Background
  const img = await loadImage(bgImagePath);
  ctx.drawImage(img, 0, 0, SLIDE_WIDTH, SLIDE_HEIGHT);

  // Dark overlay
  const gradient = ctx.createLinearGradient(0, 0, 0, SLIDE_HEIGHT);
  gradient.addColorStop(0, 'rgba(0, 0, 0, 0.7)');
  gradient.addColorStop(0.4, 'rgba(0, 0, 0, 0.35)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0.5)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, SLIDE_WIDTH, SLIDE_HEIGHT);

  // Headline
  ctx.font = 'bold 48px sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';

  const margin = SLIDE_WIDTH * 0.1;
  const textMaxWidth = SLIDE_WIDTH * 0.8;
  const headlineLines = wrapText(ctx, slide.headline, textMaxWidth);
  let y = SLIDE_HEIGHT * 0.15;

  for (const line of headlineLines) {
    drawTextWithShadow(ctx, line, margin, y);
    y += 60;
  }

  // Divider line
  y += 20;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(margin, y);
  ctx.lineTo(margin + textMaxWidth * 0.3, y);
  ctx.stroke();
  y += 30;

  // Body text
  ctx.font = '36px sans-serif';
  const bodyLines = wrapText(ctx, slide.body, textMaxWidth);
  for (const line of bodyLines) {
    drawTextWithShadow(ctx, line, margin, y);
    y += 48;
  }

  // Watermark
  ctx.font = '22px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.fillText('alaii.app', SLIDE_WIDTH / 2, SLIDE_HEIGHT - 50);

  const buffer = canvas.toBuffer('image/jpeg', { quality: 0.92 });
  fs.writeFileSync(outputPath, buffer);
}

async function renderCtaSlide(
  ctaText: string,
  bgImagePath: string,
  outputPath: string,
): Promise<void> {
  const canvas = createCanvas(SLIDE_WIDTH, SLIDE_HEIGHT);
  const ctx = canvas.getContext('2d');

  // Background
  const img = await loadImage(bgImagePath);
  ctx.drawImage(img, 0, 0, SLIDE_WIDTH, SLIDE_HEIGHT);

  // Stronger overlay for CTA
  ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
  ctx.fillRect(0, 0, SLIDE_WIDTH, SLIDE_HEIGHT);

  // Accent color circle/glow
  const grd = ctx.createRadialGradient(
    SLIDE_WIDTH / 2, SLIDE_HEIGHT * 0.35, 0,
    SLIDE_WIDTH / 2, SLIDE_HEIGHT * 0.35, 300,
  );
  grd.addColorStop(0, 'rgba(99, 102, 241, 0.25)');
  grd.addColorStop(1, 'rgba(99, 102, 241, 0)');
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, SLIDE_WIDTH, SLIDE_HEIGHT);

  // CTA Text
  ctx.font = 'bold 56px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';

  const maxWidth = SLIDE_WIDTH * 0.75;
  const lines = wrapText(ctx, ctaText, maxWidth);
  const lineHeight = 72;
  const startY = SLIDE_HEIGHT * 0.28;

  for (let i = 0; i < lines.length; i++) {
    drawTextWithShadow(ctx, lines[i], SLIDE_WIDTH / 2, startY + i * lineHeight);
  }

  // "alaii.app" big
  ctx.font = 'bold 42px sans-serif';
  ctx.fillStyle = '#818CF8'; // Indigo accent
  ctx.fillText('alaii.app', SLIDE_WIDTH / 2, startY + lines.length * lineHeight + 40);

  // App store text
  ctx.font = '28px sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.fillText('free on app store + android', SLIDE_WIDTH / 2, startY + lines.length * lineHeight + 100);

  const buffer = canvas.toBuffer('image/jpeg', { quality: 0.92 });
  fs.writeFileSync(outputPath, buffer);
}

// ============================================================================
// Main Render Pipeline
// ============================================================================

export interface RenderedCarousel {
  id: string;
  slidePaths: string[];
  tmpDir: string;
}

/** Render a full carousel from content + background images */
export async function renderCarousel(
  content: CarouselContent,
  backgroundImageUrls: string[],
): Promise<RenderedCarousel> {
  const id = uuid();
  const tmpDir = path.join(process.cwd(), 'tmp', 'carousel', id);
  fs.mkdirSync(tmpDir, { recursive: true });

  const totalSlides = content.slides.length + 2; // hook + tips + cta
  const slidePaths: string[] = [];

  // Download background images
  const bgPaths: string[] = [];
  for (let i = 0; i < totalSlides; i++) {
    const bgUrl = backgroundImageUrls[i % backgroundImageUrls.length];
    const bgPath = path.join(tmpDir, `bg_${i}.jpg`);
    await downloadImage(bgUrl, bgPath);
    bgPaths.push(bgPath);
  }

  // Render hook slide
  const hookPath = path.join(tmpDir, `slide_0_hook.jpg`);
  await renderHookSlide(content.hookText, bgPaths[0], hookPath);
  slidePaths.push(hookPath);
  console.log(`  ✅ Hook slide rendered`);

  // Render tip slides
  for (let i = 0; i < content.slides.length; i++) {
    const tipPath = path.join(tmpDir, `slide_${i + 1}_tip.jpg`);
    await renderTipSlide(content.slides[i], bgPaths[i + 1], tipPath);
    slidePaths.push(tipPath);
    console.log(`  ✅ Tip slide ${i + 1} rendered`);
  }

  // Render CTA slide
  const ctaPath = path.join(tmpDir, `slide_${totalSlides - 1}_cta.jpg`);
  await renderCtaSlide(content.ctaText, bgPaths[totalSlides - 1], ctaPath);
  slidePaths.push(ctaPath);
  console.log(`  ✅ CTA slide rendered`);

  return { id, slidePaths, tmpDir };
}

/** Clean up temp carousel files */
export function cleanupCarousel(carousel: RenderedCarousel): void {
  try {
    fs.rmSync(carousel.tmpDir, { recursive: true, force: true });
  } catch {
    console.warn(`⚠️ Failed to cleanup carousel temp dir: ${carousel.tmpDir}`);
  }
}
