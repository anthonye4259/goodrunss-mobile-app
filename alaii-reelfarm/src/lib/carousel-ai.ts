// ============================================================================
// Alaii ReelFarm — Carousel AI Content Generator
// ============================================================================
// Generates carousel-specific content: hook slide, tip slides, CTA slide,
// plus TikTok caption with hashtags. Uses Claude for AI generation.

import Anthropic from '@anthropic-ai/sdk';
import type { ReelContent } from '@/types';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

const CAROUSEL_BRAND_CONTEXT = `
You are a social media content creator for Alaii (alaii.app). Alaii is an AI business partner that helps beauty and service professionals build wealth passively.

THE CORE MESSAGE:
You are talented at your craft. But talent alone doesn't build wealth. The difference between a busy service provider and a wealthy one is SYSTEMS. Alaii is the system.

THE PROBLEM (every service provider feels this):
- You're fully booked but still broke. Revenue doesn't match how hard you work.
- Empty slots cost you $200-500 every time. Nobody fills them.
- Ghost clients disappear and you lose thousands per year chasing them.
- You spend nights texting clients, posting content, updating your schedule. That's unpaid labor.
- You're trading time for money with no way to scale.
- Your competitors are growing faster because they have tools you don't.

WHAT ALAII ACTUALLY DOES (the wealth angle):
- ALI (your AI) texts clients automatically, fills cancellations in minutes, wins back ghost clients, and finds new leads online. You wake up to money you didn't have to chase.
- Free booking + payments. Competitors charge $30-48/month. That's $360-576/year you keep.
- Automated reminders cut no-shows by 80%. Each no-show costs you $150-400.
- Your AI runs 24/7. It's making you money while you sleep, eat, and live your life.
- Every empty slot, every ghost client, every missed DM is money you're losing RIGHT NOW.

THE PITCH IS NOT "use our software." THE PITCH IS "stop losing money."

TARGET AUDIENCE (tailor language to the topic's industry):

NURSE INJECTORS & MEDSPA OWNERS:
- Wealth angle: one empty Botox slot = $400 gone. 3 per week = $62,000/year lost.
- Pain: patients ghost after consultations, no follow-up system, manual charting burns hours
- Language: patients, treatment rooms, consultations, units, syringes, protocols
- Hashtags: #nurseinjector #medspa #aestheticnurse #botox #fillers #lipfiller #aesthetics #injectorlife #medspabusiness #aestheticmedicine

HAIR STYLISTS & SALON OWNERS:
- Wealth angle: one no-show per day = $75,000/year in lost revenue
- Pain: color corrections eating profits, walk-in chaos, spending nights on Instagram
- Language: clients, chair, behind the chair, bookings, color, balayage
- Hashtags: #hairstylist #salonowner #behindthechair #solohair #stylistlife

LASH TECHS:
- Wealth angle: 2 cancellations per week = $15,000/year gone
- Pain: retention issues, last-minute cancellations, no rebooking system
- Language: clients, lash room, fills, retention, sets, volume
- Hashtags: #lashtech #lashextensions #lashbusiness #lashartist #lashes

ESTHETICIANS:
- Wealth angle: clients who don't rebook = $8,000/year per lost regular
- Pain: seasonal slowdowns, no way to fill gaps, manual follow-ups
- Language: clients, treatment room, facials, peels, skin consultations
- Hashtags: #esthetician #skincare #esthetics #skincareprofessional #facials

NAIL TECHS:
- Wealth angle: 3 empty slots per week = $12,000/year lost
- Pain: no-shows with no deposit, clients booking and ghosting
- Language: clients, nail desk, sets, fills, nail art
- Hashtags: #nailtech #nailartist #nailbusiness #nailtechlife #nails

BARBERS:
- Language: clients, shop, chair, fades, lineups
- Hashtags: #barber #barbershop #barberlife #fade

Brand voice: casual, lowercase, real talk. Think "your successful friend giving you game." Not salesy. Not corporate. Confident, direct, a little bold. You're telling them about money they're leaving on the table.

CRITICAL FORMATTING:
- NEVER use em dashes or semicolons. Use periods and commas only.
- No words like: furthermore, moreover, utilize, streamline, leverage, game-changer, elevate, empower
- Write like you're texting, not writing an article
- Keep slide text SHORT. Carousel slides are images, not blog posts.
- Headlines: 4-7 words max. Body: 1 short punchy sentence.
- Use real dollar amounts. "$400 per empty slot" hits harder than "lost revenue"
- Think instagram carousel vibes, not essay paragraphs.
`;


export interface CarouselContent {
  hookText: string;
  slides: CarouselSlide[];
  ctaText: string;
  title: string;       // TikTok post title
  description: string; // TikTok caption with hashtags
  industry: string;    // Industry name for slide 1 label
}

export interface CarouselSlide {
  headline: string;
  body: string;
}

/** Generate carousel content from a topic */
export async function generateCarouselContent(
  topic: string,
  slideCount: number = 5,
): Promise<CarouselContent> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    messages: [
      {
        role: 'user',
        content: `${CAROUSEL_BRAND_CONTEXT}

Generate a TikTok photo carousel about: "${topic}"

FORMAT — This is a PHOTO CAROUSEL (swipable images), NOT a video.

IMPORTANT: Determine which SPECIFIC industry this topic targets (e.g., "nurse injectors", "lash techs", "hair stylists", "estheticians", "barbers", "nail techs", "medspa owners"). Return this in the "industry" field.

SLIDE 1 (HOOK):
- Bold, attention-grabbing hook text
- Should introduce a numbered list (e.g., "5 things i stopped doing...")
- All lowercase
- This slide MUST make the reader feel called out. Hit a REAL pain point hard.

SLIDES 2-${slideCount + 1} (TIPS/POINTS — keep it tight, ${slideCount - 2} tips max):
- Each slide has:
  - headline: SHORT title (4-7 words max, numbered like "1. stop chasing clients")
  - body: ONE short sentence only (under 15 words). Think bumper sticker, not paragraph.
- Pattern: identify a SHARP relatable pain, give a specific fix
- Be brutally honest and specific. No generic advice.
- These are IMAGE slides, not blog posts. Less text = more impact.

LAST SLIDE (CTA):
- Must mention Alaii and free booking
- Include "alaii.app"
- Mention it's free on App Store + Android
- Mention "free booking + payments" specifically
- Example: "free booking + payments, no monthly fee. try alaii → alaii.app"

TIKTOK TITLE:
- Under 50 characters, attention-grabbing, all lowercase
- This appears above the carousel in the feed

TIKTOK DESCRIPTION (CAPTION):
- 2-3 sentences, casual tone
- Must include a CTA: mention "free booking" or "alaii.app" or "link in bio"
- End with 5-8 relevant hashtags
- All lowercase

Respond in this exact JSON format:
{
  "hookText": "5 things i stopped doing...",
  "industry": "lash techs",
  "slides": [
    {
      "headline": "1. short title here",
      "body": "1-2 sentences expanding on this point relatably"
    }
  ],
  "ctaText": "free booking + payments. try alaii → alaii.app",
  "title": "short catchy tiktok title",
  "description": "caption text with hashtags"
}

CRITICAL:
- ALL text lowercase (only "Alaii" capitalized)
- Make it feel authentic and personal, NOT an ad
- Each slide should be valuable standalone
- NEVER use em dashes, semicolons, or corporate words
- The CTA caption MUST mention free booking or alaii.app
- Only return valid JSON, no other text`
      }
    ],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';
  const jsonStr = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  const content: CarouselContent = JSON.parse(jsonStr);

  // Ensure industry is set
  if (!content.industry) {
    content.industry = 'beauty pros';
  }

  // Ensure description mentions Alaii and free booking
  if (!content.description.includes('alaii') && !content.description.includes('Alaii')) {
    content.description += '\n\nfree booking + payments at alaii.app';
  }
  if (!content.description.includes('alaii.app')) {
    content.description += '\nalaii.app';
  }
  if (!content.description.includes('free')) {
    content.description = content.description.replace('alaii.app', 'free booking at alaii.app');
  }

  return content;
}

/** Generate a batch of carousel topics for a niche */
export async function generateTopicBatch(
  niche: string,
  count: number = 20,
): Promise<string[]> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1500,
    messages: [
      {
        role: 'user',
        content: `${CAROUSEL_BRAND_CONTEXT}

Generate ${count} TikTok carousel topic ideas for the "${niche}" niche.

Each topic should:
- Lead with a pain point or relatable frustration
- Be specific and actionable (not generic)
- Work as a numbered list (e.g., "5 things that changed when I...")
- Naturally lead to Alaii as a solution

Return ONLY a JSON array of strings, nothing else:
["topic 1", "topic 2", ...]`
      }
    ],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';
  const jsonStr = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  return JSON.parse(jsonStr);
}
