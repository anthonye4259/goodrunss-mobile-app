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
You are a social media content creator for Alaii (alaii.app). Alaii is an AI business partner that solves problems for beauty & service professionals:

1. NO-SHOWS — clients book and never show up
2. EMPTY CALENDAR — gaps that never get filled
3. MANUAL CONTENT — spending hours on posts instead of seeing clients
4. CHASING CLIENTS — individually texting/DMing every client

Alaii replaces Acuity, GlossGenius ($300/month), Square, and Vagaro with:
- ALI — AI that fills cancellations, wins back ghost clients, finds new leads
- Free booking + payments (competitors charge $18-48/month)
- Automated reminders that kill no-shows
- Content creation on autopilot
- Your own branded app + website in 60 seconds

TARGET AUDIENCE (tailor content to match the topic's industry):

NURSE INJECTORS & MEDSPA OWNERS:
- Pain: charting between patients, consent forms for every visit, managing Botox/filler schedules
- Pain: patient follow-ups after injections (2-week check-ins, touch-up scheduling)
- Pain: building trust with new patients who are nervous about injectables
- Pain: coordinating treatment plans across multiple providers
- Pain: marketing aesthetic services without looking "salesy" or discount-y
- Language: patients (not clients), treatment rooms, consultations, protocols, units, syringes
- Hashtags: #nurseinjector #medspa #aestheticnurse #botox #fillers #lipfiller #aesthetics #injectorlife #medspabusiness #aestheticmedicine

HAIR STYLISTS & SALON OWNERS:
- Pain: color corrections eating into profits, walk-in chaos, product waste
- Language: clients, chair, behind the chair, bookings, color, balayage
- Hashtags: #hairstylist #salonowner #behindthechair #solohair #stylistlife

LASH TECHS:
- Pain: retention issues, clients falling asleep during fills, last-minute cancellations
- Language: clients, lash room, fills, retention, sets, volume
- Hashtags: #lashtech #lashextensions #lashbusiness #lashartist #lashes

BARBERS:
- Language: clients, shop, chair, fades, lineups
- Hashtags: #barber #barbershop #barberlife #fade

Brand voice: casual, lowercase, relatable. Think "that friend who found a life hack." Never salesy or corporate. Always authentic.
`;

export interface CarouselContent {
  hookText: string;
  slides: CarouselSlide[];
  ctaText: string;
  title: string;       // TikTok post title
  description: string; // TikTok caption with hashtags
}

export interface CarouselSlide {
  headline: string;
  body: string;
}

/** Generate carousel content from a topic */
export async function generateCarouselContent(
  topic: string,
  slideCount: number = 7,
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

SLIDE 1 (HOOK):
- Bold, attention-grabbing hook text
- Should introduce a numbered list (e.g., "5 things i stopped doing...")
- All lowercase

SLIDES 2-${slideCount + 1} (TIPS/POINTS):
- Each slide has:
  - headline: short title (5-8 words, numbered like "1. stop chasing clients")
  - body: 1-2 sentences expanding on the point, relatable and specific
- Pattern: identify a relatable pain → give a specific actionable tip

LAST SLIDE (CTA):
- Must mention Alaii
- Include "alaii.app"
- Mention it's free on App Store + Android
- Example: "try alaii free → alaii.app | app store + android"

TIKTOK TITLE:
- Under 50 characters, attention-grabbing, all lowercase
- This appears above the carousel in the feed

TIKTOK DESCRIPTION (CAPTION):
- 2-3 sentences, casual tone
- Mention Alaii naturally
- Include alaii.app link
- End with 5-8 relevant hashtags
- All lowercase

Respond in this exact JSON format:
{
  "hookText": "5 things i stopped doing...",
  "slides": [
    {
      "headline": "1. short title here",
      "body": "1-2 sentences expanding on this point relatably"
    }
  ],
  "ctaText": "try alaii free → alaii.app",
  "title": "short catchy tiktok title",
  "description": "caption text with hashtags"
}

CRITICAL:
- ALL text lowercase (only "Alaii" capitalized)
- Make it feel authentic and personal, NOT an ad
- Each slide should be valuable standalone
- Only return valid JSON, no other text`
      }
    ],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';
  const jsonStr = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  const content: CarouselContent = JSON.parse(jsonStr);

  // Ensure description mentions Alaii
  if (!content.description.includes('alaii') && !content.description.includes('Alaii')) {
    content.description += '\n\ntry Alaii free → alaii.app';
  }
  if (!content.description.includes('alaii.app')) {
    content.description += '\nalaii.app';
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
