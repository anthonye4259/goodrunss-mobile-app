// ============================================================================
// Alaii ReelFarm — Carousel Image Renderer (v2 — Premium Design)
// ============================================================================
// Renders branded carousel slides with Inter font, Alaii blue accents,
// numbered circles, rounded card overlays, and professional layouts.
// Output: 1080×1350 JPG images (TikTok carousel optimal size).

import { createCanvas, loadImage, registerFont } from 'canvas';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuid } from 'uuid';
import type { CarouselContent, CarouselSlide } from './carousel-ai';
import { downloadImage } from './pexels';

const SLIDE_WIDTH = 1080;
const SLIDE_HEIGHT = 1350;

// Brand colors
const ALAII_BLUE = '#4A9FD4';
const ALAII_DARK = '#1A2B3C';
const ALAII_LIGHT = '#E3F2FD';

// Register Inter font (downloaded to /fonts)
const fontsDir = path.join(process.cwd(), 'fonts');
try {
  if (fs.existsSync(path.join(fontsDir, 'Inter-Variable.ttf'))) {
    registerFont(path.join(fontsDir, 'Inter-Variable.ttf'), {
      family: 'Inter',
      weight: '400',
    });
  }
  if (fs.existsSync(path.join(fontsDir, 'Outfit-Variable.ttf'))) {
    registerFont(path.join(fontsDir, 'Outfit-Variable.ttf'), {
      family: 'Outfit',
      weight: '700',
    });
  }
} catch (e) {
  console.warn('Font registration failed, falling back to system fonts:', e);
}

const HEADING_FONT = 'Outfit, Inter, sans-serif';
const BODY_FONT = 'Inter, sans-serif';

// ============================================================================
// Text Rendering Helpers
// ============================================================================

type Ctx = any;

function wrapText(ctx: Ctx, text: string, maxWidth: number): string[] {
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

function drawTextGlow(ctx: Ctx, text: string, x: number, y: number, color: string = '#000') {
  // Soft glow behind text for readability
  ctx.save();
  ctx.shadowColor = color;
  ctx.shadowBlur = 20;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  ctx.fillStyle = 'rgba(0,0,0,0)';
  ctx.fillText(text, x, y);
  ctx.restore();
}

function drawRoundedRect(ctx: Ctx, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// ============================================================================
// Slide Renderers
// ============================================================================

async function renderHookSlide(
  hookText: string,
  bgImagePath: string,
  outputPath: string,
  industry?: string,
): Promise<void> {
  const canvas = createCanvas(SLIDE_WIDTH, SLIDE_HEIGHT);
  const ctx = canvas.getContext('2d');

  // Background image
  const img = await loadImage(bgImagePath);
  ctx.drawImage(img, 0, 0, SLIDE_WIDTH, SLIDE_HEIGHT);

  // Strong dark gradient overlay
  const gradient = ctx.createLinearGradient(0, 0, 0, SLIDE_HEIGHT);
  gradient.addColorStop(0, 'rgba(10, 15, 25, 0.85)');
  gradient.addColorStop(0.4, 'rgba(10, 15, 25, 0.55)');
  gradient.addColorStop(0.7, 'rgba(10, 15, 25, 0.45)');
  gradient.addColorStop(1, 'rgba(10, 15, 25, 0.80)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, SLIDE_WIDTH, SLIDE_HEIGHT);

  // Accent bar at top
  ctx.fillStyle = ALAII_BLUE;
  ctx.fillRect(0, 0, SLIDE_WIDTH, 6);

  // Industry pill at top
  if (industry) {
    const pillText = `for ${industry}`;
    ctx.font = `bold 24px ${BODY_FONT}`;
    ctx.textAlign = 'center';
    const pillW = ctx.measureText(pillText).width + 40;
    const pillX = (SLIDE_WIDTH - pillW) / 2;
    const pillY = SLIDE_HEIGHT * 0.10;

    drawRoundedRect(ctx, pillX, pillY, pillW, 42, 21);
    ctx.fillStyle = ALAII_BLUE;
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.textBaseline = 'middle';
    ctx.fillText(pillText, SLIDE_WIDTH / 2, pillY + 21);
  }

  // Hook text — large, centered
  ctx.font = `bold 62px ${HEADING_FONT}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';

  const maxWidth = SLIDE_WIDTH * 0.78;
  const lines = wrapText(ctx, hookText, maxWidth);
  const lineHeight = 78;
  const startY = industry
    ? SLIDE_HEIGHT * 0.22
    : SLIDE_HEIGHT * 0.28 - (lines.length * lineHeight) / 2;

  for (let i = 0; i < lines.length; i++) {
    const ly = startY + i * lineHeight;
    // Glow for readability
    drawTextGlow(ctx, lines[i], SLIDE_WIDTH / 2, ly, 'rgba(0,0,0,0.8)');
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(lines[i], SLIDE_WIDTH / 2, ly);
  }

  // "Swipe" indicator at bottom
  ctx.font = `600 22px ${BODY_FONT}`;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.textAlign = 'center';
  ctx.fillText('swipe →', SLIDE_WIDTH / 2, SLIDE_HEIGHT - 100);

  // Alaii watermark
  ctx.font = `bold 20px ${BODY_FONT}`;
  ctx.fillStyle = ALAII_BLUE;
  ctx.globalAlpha = 0.6;
  ctx.fillText('alaii.app', SLIDE_WIDTH / 2, SLIDE_HEIGHT - 50);
  ctx.globalAlpha = 1;

  const buffer = canvas.toBuffer('image/jpeg', { quality: 0.93 });
  fs.writeFileSync(outputPath, buffer);
}

async function renderTipSlide(
  slide: CarouselSlide,
  bgImagePath: string,
  outputPath: string,
  slideIndex?: number,
): Promise<void> {
  const canvas = createCanvas(SLIDE_WIDTH, SLIDE_HEIGHT);
  const ctx = canvas.getContext('2d');

  // Background
  const img = await loadImage(bgImagePath);
  ctx.drawImage(img, 0, 0, SLIDE_WIDTH, SLIDE_HEIGHT);

  // Dark overlay
  const gradient = ctx.createLinearGradient(0, 0, 0, SLIDE_HEIGHT);
  gradient.addColorStop(0, 'rgba(10, 15, 25, 0.82)');
  gradient.addColorStop(0.3, 'rgba(10, 15, 25, 0.50)');
  gradient.addColorStop(0.7, 'rgba(10, 15, 25, 0.45)');
  gradient.addColorStop(1, 'rgba(10, 15, 25, 0.75)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, SLIDE_WIDTH, SLIDE_HEIGHT);

  // Content card (frosted glass effect)
  const cardMargin = 60;
  const cardY = SLIDE_HEIGHT * 0.12;
  const cardH = SLIDE_HEIGHT * 0.65;

  drawRoundedRect(ctx, cardMargin, cardY, SLIDE_WIDTH - cardMargin * 2, cardH, 28);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.fill();

  // Card border
  drawRoundedRect(ctx, cardMargin, cardY, SLIDE_WIDTH - cardMargin * 2, cardH, 28);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Number circle
  if (slideIndex !== undefined) {
    const circleX = cardMargin + 50;
    const circleY = cardY + 50;
    const circleR = 28;

    ctx.beginPath();
    ctx.arc(circleX, circleY, circleR, 0, Math.PI * 2);
    ctx.fillStyle = ALAII_BLUE;
    ctx.fill();

    ctx.font = `bold 28px ${HEADING_FONT}`;
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(slideIndex), circleX, circleY + 1);
  }

  // Headline
  ctx.font = `bold 44px ${HEADING_FONT}`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';

  const textX = cardMargin + 40;
  const textMaxWidth = SLIDE_WIDTH - cardMargin * 2 - 80;
  const headlineY = slideIndex !== undefined ? cardY + 100 : cardY + 50;
  const headlineLines = wrapText(ctx, slide.headline, textMaxWidth);
  let y = headlineY;

  for (const line of headlineLines) {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(line, textX, y);
    y += 56;
  }

  // Accent bar under headline
  y += 10;
  ctx.fillStyle = ALAII_BLUE;
  ctx.fillRect(textX, y, 60, 4);
  y += 30;

  // Body text
  ctx.font = `400 34px ${BODY_FONT}`;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  const bodyLines = wrapText(ctx, slide.body, textMaxWidth);
  for (const line of bodyLines) {
    ctx.fillText(line, textX, y);
    y += 46;
  }

  // Watermark
  ctx.font = `bold 18px ${BODY_FONT}`;
  ctx.textAlign = 'center';
  ctx.fillStyle = ALAII_BLUE;
  ctx.globalAlpha = 0.5;
  ctx.fillText('alaii.app', SLIDE_WIDTH / 2, SLIDE_HEIGHT - 50);
  ctx.globalAlpha = 1;

  const buffer = canvas.toBuffer('image/jpeg', { quality: 0.93 });
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

  // Very strong overlay
  ctx.fillStyle = 'rgba(10, 15, 25, 0.82)';
  ctx.fillRect(0, 0, SLIDE_WIDTH, SLIDE_HEIGHT);

  // Radial glow behind CTA
  const grd = ctx.createRadialGradient(
    SLIDE_WIDTH / 2, SLIDE_HEIGHT * 0.38, 0,
    SLIDE_WIDTH / 2, SLIDE_HEIGHT * 0.38, 350,
  );
  grd.addColorStop(0, 'rgba(74, 159, 212, 0.2)');
  grd.addColorStop(1, 'rgba(74, 159, 212, 0)');
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, SLIDE_WIDTH, SLIDE_HEIGHT);

  // CTA card
  const cardW = SLIDE_WIDTH * 0.82;
  const cardH = 380;
  const cardX = (SLIDE_WIDTH - cardW) / 2;
  const cardY = SLIDE_HEIGHT * 0.22;

  drawRoundedRect(ctx, cardX, cardY, cardW, cardH, 28);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
  ctx.fill();
  drawRoundedRect(ctx, cardX, cardY, cardW, cardH, 28);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // CTA Text inside card
  ctx.font = `bold 48px ${HEADING_FONT}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';

  const maxWidth = cardW - 80;
  const lines = wrapText(ctx, ctaText, maxWidth);
  const lineHeight = 62;
  const textStartY = cardY + 50;

  for (let i = 0; i < lines.length; i++) {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(lines[i], SLIDE_WIDTH / 2, textStartY + i * lineHeight);
  }

  // "Try Alaii" button
  const btnY = cardY + cardH - 80;
  const btnW = 300;
  const btnH = 56;
  const btnX = (SLIDE_WIDTH - btnW) / 2;

  drawRoundedRect(ctx, btnX, btnY, btnW, btnH, 28);
  ctx.fillStyle = ALAII_BLUE;
  ctx.fill();

  ctx.font = `bold 24px ${HEADING_FONT}`;
  ctx.fillStyle = '#FFFFFF';
  ctx.textBaseline = 'middle';
  ctx.fillText('try alaii free →', SLIDE_WIDTH / 2, btnY + btnH / 2);

  // "alaii.app" below card
  ctx.font = `bold 40px ${HEADING_FONT}`;
  ctx.fillStyle = ALAII_BLUE;
  ctx.textBaseline = 'top';
  ctx.fillText('alaii.app', SLIDE_WIDTH / 2, cardY + cardH + 40);

  // App store line
  ctx.font = `400 24px ${BODY_FONT}`;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.fillText('free on app store + google play', SLIDE_WIDTH / 2, cardY + cardH + 100);

  const buffer = canvas.toBuffer('image/jpeg', { quality: 0.93 });
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
  await renderHookSlide(content.hookText, bgPaths[0], hookPath, content.industry);
  slidePaths.push(hookPath);
  console.log(`  ✅ Hook slide rendered (industry: ${content.industry || 'general'})`);

  // Render tip slides with numbered circles
  for (let i = 0; i < content.slides.length; i++) {
    const tipPath = path.join(tmpDir, `slide_${i + 1}_tip.jpg`);
    await renderTipSlide(content.slides[i], bgPaths[i + 1], tipPath, i + 1);
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
