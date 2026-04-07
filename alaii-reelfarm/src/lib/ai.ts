// ============================================================================
// Alaii ReelFarm — AI Content Generator (Claude)
// ============================================================================
// Generates viral hooks, slide captions, hashtags, and full Reel scripts
// using Anthropic's Claude API, tuned for Alaii's brand voice.

import Anthropic from '@anthropic-ai/sdk';
import type { ReelContent } from '@/types';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

const BRAND_CONTEXT = `
You are a social media content creator for Alaii (alaii.app). Alaii is an AI business partner that solves 4 specific problems for beauty professionals:

1. NO-SHOWS — clients book and never show up, wasting your time and money
2. EMPTY CALENDAR — gaps in your week that never get filled, revenue you'll never get back
3. MANUAL CONTENT — spending hours creating posts, stories, and reels instead of seeing clients
4. CHASING CLIENTS — having to individually text, DM, and follow up with every single client

Alaii replaces Acuity, GlossGenius ($300/month), Square, and Vagaro with:
- ALI — an AI that automatically fills your cancellations, wins back ghost clients, and finds new leads
- Free booking + payments
- Automated reminders that kill no-shows
- Content creation on autopilot
- Client management without the manual work

TARGET AUDIENCE (ONLY these 3 industries):
- Medspa owners & injectors (Botox, fillers, laser, facials)
- Hair stylists & salon owners (cuts, color, balayage, extensions)
- Lash techs (lash extensions, lash lifts, brow lamination)

Brand voice: casual, lowercase, relatable, gen-z/millennial tone. Think "that friend who found a life hack and is sharing it." Never salesy or corporate. Use emojis sparingly. Always feel authentic.

CRITICAL: Every piece of content must lead with a PAIN POINT the audience feels deeply — then position Alaii as the solution. Never lead with features. Lead with frustration.
`;

/** Generate a complete Reel script from a topic */
export async function generateReelContent(topic: string, pointCount: number = 5): Promise<ReelContent> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1500,
    messages: [
      {
        role: 'user',
        content: `${BRAND_CONTEXT}

Generate a TikTok/Instagram Reel slideshow script about: "${topic}"

SLIDE FORMAT:

FIRST SLIDE (HOOK):
- ONLY 1 text item in EXTRA LARGE font
- All lowercase
- Should introduce a numbered list concept (e.g., "5 ways that _____" or "5 shifts i made to _____")

ALL OTHER SLIDES (${pointCount} total):
- Each slide has 3 text items in SMALL font at 70% width
- TEXT 1: numbered heading with white background color like "1. [title]" — 5-7 words on the general issue
- TEXT 2: describe the problem in plain, relatable terms in under 12 words, like you're complaining to a friend (e.g. "i kept reaching for my phone before i even got out of bed")
- TEXT 3: a simple, specific action in under 14 words — NOT a vague solution (e.g. "i just write 3 pages first, nothing fancy" NOT "stream-of-consciousness writing cleared the mental clutter")
- Pattern: 1. title → 2. relatable complaint → 3. specific simple action

LAST SLIDE (CTA):
- It is CRUCIAL you mention Alaii — this is the #1 priority
- Include "alaii.app" as the website
- Mention Alaii is available on the App Store and Android, free to download
- Example: "try alaii free → alaii.app" or "download alaii free on app store + android"

ALL TEXT MUST BE LOWERCASE AND WHITE. ALL TEXT SHOULD BE ON THE TOP 1/3RD OF THE SLIDE.

CAPTION RULES:
- Mention Alaii naturally in the caption
- Include alaii.app
- End with ONLY 3-5 broad hashtags related to the topic/niche
- All lowercase

Respond in this exact JSON format:
{
  "hookText": "5 ways i _____:",
  "points": [
    {
      "headline": "1. short title here",
      "painPoint": "relatable complaint under 12 words",
      "solution": "specific simple action under 14 words"
    }
  ],
  "ctaText": "try alaii free → alaii.app",
  "caption": "caption text with 3-5 hashtags"
}

CRITICAL RULES:
- ALL text must be lowercase (only "Alaii" stays capitalized when mentioned)
- headline: 5-7 words max
- painPoint: under 12 words, sounds like complaining to a friend
- solution: under 14 words, specific action not vague advice
- Make it feel authentic and personal — NOT an ad
- Only return valid JSON, no other text`
      }
    ],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';

  // Parse JSON from response (handle potential markdown code blocks)
  const jsonStr = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  const content: ReelContent = JSON.parse(jsonStr);

  // Ensure caption always mentions alaii and has the app link
  if (!content.caption.includes('alaii') && !content.caption.includes('Alaii')) {
    content.caption += '\n\ntry Alaii → https://apps.apple.com/app/id6757349122';
  }
  if (!content.caption.includes('apps.apple.com') && !content.caption.includes('alaii.app')) {
    content.caption += '\nhttps://apps.apple.com/app/id6757349122';
  }

  return content;
}

/** Generate just a viral hook for a topic */
export async function generateHook(topic: string): Promise<string> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 100,
    messages: [
      {
        role: 'user',
        content: `${BRAND_CONTEXT}

Generate ONE viral hook for an Instagram Reel about: "${topic}"

Rules:
- All lowercase
- Under 50 characters
- Attention-grabbing, makes people stop scrolling
- Feels authentic, not clickbaity

Return ONLY the hook text, nothing else.`
      }
    ],
  });

  return response.content[0].type === 'text' ? response.content[0].text.trim() : '';
}

/** Generate Instagram caption with hashtags */
export async function generateCaption(topic: string, hookText: string): Promise<string> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 300,
    messages: [
      {
        role: 'user',
        content: `${BRAND_CONTEXT}

Generate an Instagram caption for a Reel about: "${topic}"
The hook/title of the reel is: "${hookText}"

Rules:
- Casual, relatable tone
- Include "try it free → alaii.app" somewhere
- End with 10-15 relevant hashtags
- Keep the caption part under 150 characters (before hashtags)

Return ONLY the caption text, nothing else.`
      }
    ],
  });

  return response.content[0].type === 'text' ? response.content[0].text.trim() : '';
}
