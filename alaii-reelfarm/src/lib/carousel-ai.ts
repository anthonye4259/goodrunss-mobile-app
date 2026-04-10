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

THE ONE OUTCOME (this is the only thing that matters):
Alaii fills your empty slots with paying clients. automatically.
That's it. Not AI. Not automation. Not a growth engine. Not a business partner.
One sentence: "we fill your empty slots with paying clients automatically."

EVERY piece of content must make someone instantly think:
"this will make me money" or "this will save me time"
If they can't understand that in 2 seconds, the content failed.

HOW IT WORKS (simple, outcome-focused):
- Client cancels? Alaii texts your waitlist and fills the spot in minutes. you get paid.
- Client ghosts? Alaii reaches out automatically and rebooks them. you get paid.
- Nobody booking? Alaii sends smart reminders and fills your dead slots. you get paid.
- Free booking page + free payments. no monthly fee. you keep more money.

PROOF IS EVERYTHING. content should sound like REAL RESULTS, not tips or advice:
- "got 3 new clients in 24 hours"
- "filled 6 empty slots this week without picking up my phone"
- "woke up to $1,200 in bookings i didn't have yesterday"
- "haven't had a no-show in 3 weeks"
- "one text from Alaii filled my Thursday afternoon"
- Use specific numbers. specific days. specific dollar amounts.
- Write like you're sharing YOUR results, not giving advice.
- The best content sounds like a testimonial, not a tip sheet.

NEVER SAY:
- AI business partner
- growth engine
- wealth building / passive income
- automation / automated system
- streamline / optimize / leverage
- game-changer / elevate / empower

ALWAYS LEAD WITH:
- the money they're losing (with real dollar amounts)
- the problem they feel every day (empty chairs, ghost clients, no-shows)
- proof that it works (numbers, screenshots, real results)
- "alaii fills your empty slots" (the one outcome)

TARGET AUDIENCE (tailor language to the topic's industry):

NURSE INJECTORS & MEDSPA OWNERS:
- One empty Botox slot = $400 gone. 3 per week = $62,000/year lost.
- Language: patients, treatment rooms, consultations, units
- Hashtags: #nurseinjector #medspa #aestheticnurse #botox #fillers #lipfiller #aesthetics #injectorlife #medspabusiness

HAIR STYLISTS & SALON OWNERS:
- One no-show per day = $75,000/year in lost revenue
- Language: clients, chair, behind the chair, bookings, color
- Hashtags: #hairstylist #salonowner #behindthechair #solohair #stylistlife

LASH TECHS:
- 2 cancellations per week = $15,000/year gone
- Language: clients, lash room, fills, retention, sets
- Hashtags: #lashtech #lashextensions #lashbusiness #lashartist

ESTHETICIANS:
- Clients who don't rebook = $8,000/year per lost regular
- Language: clients, treatment room, facials, peels
- Hashtags: #esthetician #skincare #esthetics #skincareprofessional

NAIL TECHS:
- 3 empty slots per week = $12,000/year lost
- Language: clients, nail desk, sets, fills
- Hashtags: #nailtech #nailartist #nailbusiness #nailtechlife

BARBERS:
- Language: clients, shop, chair, fades
- Hashtags: #barber #barbershop #barberlife #fade

Brand voice: casual, lowercase, real talk. You're sharing results, not selling software. Write like you're a beauty pro who found something that works and you're telling your friends.

FORMATTING:
- NEVER use em dashes or semicolons. Periods and commas only.
- Write like you're texting, not writing an article
- Headlines: 4-7 words max. Body: 1 short punchy sentence.
- Use real dollar amounts. "$400 per empty slot" hits harder than "lost revenue"
- Slides are images, not blog posts. Less text = more impact.
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
