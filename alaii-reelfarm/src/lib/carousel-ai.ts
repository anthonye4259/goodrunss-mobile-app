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
You are a social media content creator for Alaii (alaii.app).

WHAT ALAII IS (say this and only this):
Alaii is a cancellation rescue tool.
When a client cancels, you tap once and Alaii instantly reaches out to clients on your waitlist to fill the open slot.
One tap. Slot filled. Money saved.

EVERY piece of content must make someone instantly think:
"i need this for the next time someone cancels on me"

THE PAIN (this is what we're selling against — it must feel personal):
- Client cancels 30 minutes before → you lose $200-$500
- You frantically text 10 people trying to fill the spot → nobody replies
- Empty chair/room for an hour → money you'll never get back
- You just accept it as "part of the business" → but it doesn't have to be

THE FIX (this is what we're selling — keep it dead simple):
- Someone cancels → you tap once → Alaii texts your waitlist → slot gets filled
- No scrambling. No chasing. No lost money.
- That's it. One tap. Done.

PROOF IS EVERYTHING. Content should sound like REAL RESULTS:
- "client cancelled at 10am. slot was filled by 10:08am"
- "she cancelled her $500 Botox. i filled it in 7 minutes"
- "2 cancellations this week. both rescued. $800 saved"
- Use specific times, dollar amounts, and minutes to fill
- Write like you're sharing YOUR result, not giving a tip

NEVER SAY:
- AI business partner / growth engine / automation platform
- streamline / optimize / leverage / elevate / empower
- booking software / scheduling tool / CRM
- Don't mention booking pages, payments, content creation — ONLY cancellation rescue

TARGET AUDIENCE (tailor language per topic):

NURSE INJECTORS & MEDSPA OWNERS:
- One cancelled Botox = $500 gone. One cancelled filler = $600 gone.
- Language: patients, treatment rooms, units, consultations
- Hashtags: #nurseinjector #medspa #aestheticnurse #botox #fillers #injectorlife

HAIR STYLISTS & SALON OWNERS:
- One cancelled balayage = $200 gone. One no-show = lost chair time
- Language: clients, chair, behind the chair, bookings
- Hashtags: #hairstylist #salonowner #behindthechair #stylistlife

LASH TECHS:
- One cancelled fill = $150 gone. 2/week = $15,000/year
- Language: clients, lash room, fills, sets
- Hashtags: #lashtech #lashextensions #lashbusiness #lashartist

ESTHETICIANS:
- One cancelled facial = $120 gone. Empty treatment room = lost money
- Language: clients, treatment room, facials, peels
- Hashtags: #esthetician #skincare #esthetics

Brand voice: casual, lowercase, real talk. You're a beauty pro sharing what saved you from losing money. Not selling software.

FORMATTING:
- NEVER use em dashes or semicolons. Periods and commas only.
- Headlines: 4-7 words max. Body: 1 short punchy sentence.
- Use real dollar amounts. "$500 per cancelled Botox" hits harder than "lost revenue"
- Less text = more impact.
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
- Bold, attention-grabbing hook that makes them feel called out
- Lead with MONEY LOST or a RESULT (not a tip)
- Examples: "i stopped losing $400 per empty slot" or "filled 6 empty slots this week"
- All lowercase

SLIDES 2-${slideCount + 1} (RESULTS/PROOF — not tips):
- Each slide has:
  - headline: SHORT (4-7 words, numbered like "1. filled 3 spots in one day")
  - body: ONE sentence. a specific result or pain point with real numbers.
- Pattern: show a REAL PROBLEM, then the SPECIFIC RESULT of fixing it
- Sound like someone sharing their experience, not giving advice
- These are IMAGE slides. Less text = more impact.

LAST SLIDE (CTA):
- Outcome-first: "fill your empty slots automatically"
- Mention: free booking + payments, no monthly fee
- End with: "link in bio" (NOT a URL, since URLs aren't clickable on TikTok/IG)
- Example: "fill your empty slots automatically. free booking + payments. link in bio"

TIKTOK TITLE:
- Under 50 characters, all lowercase
- Lead with a result or dollar amount
- Example: "filled 6 spots this week without texting anyone"

TIKTOK DESCRIPTION (CAPTION):
- 2-3 sentences, casual tone, sounds like a real person sharing results
- Must include "link in bio" (NOT a URL)
- End with 5-8 relevant hashtags
- All lowercase
- Example: "filled every empty slot this week. if you're tired of losing money to no-shows and ghost clients, try what i did. link in bio. #lashtech #lashbusiness"

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
  "ctaText": "fill your empty slots automatically. free booking + payments. link in bio",
  "title": "short catchy tiktok title",
  "description": "caption text with link in bio and hashtags"
}

CRITICAL:
- ALL text lowercase (only "Alaii" capitalized)
- Make it feel authentic and personal, NOT an ad
- Each slide should be valuable standalone
- NEVER use em dashes, semicolons, or corporate words
- The CTA caption MUST include "link in bio"
- Content should sound like results/proof, NOT tips or advice
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

  // ═══════════════════════════════════════════════════════════
  // BULLETPROOF: Every caption MUST include link in bio + alaii.app
  // ═══════════════════════════════════════════════════════════
  const hasLinkInBio = content.description.toLowerCase().includes('link in bio');
  const hasAlaii = content.description.includes('alaii');

  if (!hasLinkInBio) {
    content.description += '\n\nfill your empty slots automatically. link in bio';
  }

  // Also ensure alaii.app is somewhere in the caption for searchability
  if (!hasAlaii) {
    content.description = content.description.replace('link in bio', 'alaii.app — link in bio');
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
