// ============================================================================
// Alaii ReelFarm — Pexels Image Sourcing
// ============================================================================
// Fetches industry-specific aesthetic photos based on the reel topic.
// Combines topic keywords with lifestyle modifiers for high-quality results.

import type { PexelsPhoto } from '@/types';

const PEXELS_API = 'https://api.pexels.com/v1';

/** Search Pexels for portrait photos */
async function searchPexels(
  query: string,
  apiKey: string,
  perPage: number = 15
): Promise<PexelsPhoto[]> {
  const params = new URLSearchParams({
    query,
    orientation: 'portrait',
    per_page: String(perPage),
    size: 'large',
  });

  const res = await fetch(`${PEXELS_API}/search?${params}`, {
    headers: { Authorization: apiKey },
  });

  if (!res.ok) return [];

  const data = await res.json();
  return (data.photos || []).map((photo: Record<string, unknown>) => ({
    id: photo.id,
    src: photo.src,
    photographer: photo.photographer,
    alt: photo.alt,
  }));
}

// ---------------------------------------------------------------------------
// Industry keyword mapping — extracts relevant search terms from the topic
// ---------------------------------------------------------------------------

const INDUSTRY_KEYWORDS: Record<string, string[]> = {
  salon: ['hair salon styling', 'hairstylist client', 'salon interior', 'woman hair blowout', 'hair color salon', 'beauty salon chair'],
  hair: ['hair salon styling', 'hairstylist working', 'woman hair blowout', 'hair color highlights', 'salon mirror chair'],
  barber: ['barber shop', 'barber cutting hair', 'barber chair', 'men haircut', 'barber tools'],
  nail: ['nail salon manicure', 'nail art design', 'nail technician', 'woman nails', 'nail polish'],
  spa: ['woman spa sauna', 'spa massage', 'woman wellness spa', 'spa treatment room', 'facial treatment'],
  medspa: ['medical spa treatment', 'aesthetic clinic', 'skincare treatment room', 'woman beauty clinic', 'cosmetic treatment'],
  injector: ['medical aesthetics', 'skincare professional', 'beauty clinic treatment', 'cosmetic procedure room', 'aesthetic beauty'],
  filler: ['cosmetic treatment', 'beauty aesthetic clinic', 'skincare professional woman', 'medical beauty', 'lip treatment beauty'],
  botox: ['aesthetic medicine', 'beauty treatment clinic', 'skincare clinic interior', 'cosmetic professional', 'beauty injection'],
  esthetician: ['facial treatment spa', 'esthetician working', 'skincare professional', 'woman facial spa', 'beauty treatment room'],
  lash: ['eyelash extension', 'lash artist working', 'woman lashes closeup', 'beauty lash salon', 'eyelash beauty'],
  brow: ['eyebrow microblading', 'brow shaping', 'woman eyebrows', 'beauty brow treatment'],
  wax: ['waxing salon', 'beauty treatment room', 'esthetician working', 'spa treatment'],
  facial: ['facial treatment', 'skincare routine', 'woman facial spa', 'esthetician facial'],
  makeup: ['makeup artist', 'woman makeup mirror', 'beauty makeup', 'cosmetics closeup'],
  fitness: ['woman gym fitness', 'personal trainer', 'gym interior', 'woman workout', 'fitness class'],
  gym: ['gym interior equipment', 'woman gym workout', 'personal training session', 'fitness equipment'],
  yoga: ['woman yoga studio', 'yoga class', 'woman meditation', 'yoga pose'],
  pilates: ['woman pilates', 'pilates studio', 'pilates reformer', 'pilates class'],
  tattoo: ['tattoo artist working', 'tattoo studio', 'tattoo machine closeup', 'tattoo parlor'],
  massage: ['massage therapist', 'massage table spa', 'woman massage', 'therapeutic massage'],
  dental: ['dental office', 'dentist patient', 'dental clinic', 'smile teeth'],
  medical: ['medical office', 'doctor patient', 'clinic interior', 'healthcare professional'],
  restaurant: ['restaurant interior', 'chef cooking', 'food plating', 'restaurant ambiance'],
  cafe: ['coffee shop interior', 'barista coffee', 'cafe aesthetic', 'latte art'],
  bakery: ['bakery pastries', 'baker working', 'bakery display', 'fresh bread'],
  photography: ['photographer camera', 'photo studio', 'photography session', 'camera closeup'],
  coaching: ['woman entrepreneur', 'coaching session', 'business meeting', 'woman laptop'],
  consulting: ['business meeting', 'professional office', 'woman presenting', 'consulting session'],
  realtor: ['luxury home interior', 'real estate showing', 'modern house', 'home staging'],
  cleaning: ['cleaning service', 'clean home interior', 'professional cleaning', 'organized space'],
  pet: ['pet grooming', 'dog grooming salon', 'pet care', 'cute dog'],
  auto: ['auto detailing', 'car wash', 'mechanic working', 'auto shop'],
  beauty: ['beauty professional', 'beauty salon interior', 'woman beauty treatment', 'aesthetic beauty room', 'beauty workspace'],
};

// Fallback lifestyle terms when no industry match
const FALLBACK_TERMS = [
  'woman entrepreneur',
  'woman working laptop',
  'business woman',
  'woman phone lifestyle',
  'aesthetic workspace',
  'woman portrait natural',
];

/** Extract industry-relevant search terms from the topic */
function getSearchTermsForTopic(topic: string): string[] {
  const topicLower = topic.toLowerCase();
  const matched: string[] = [];

  // Check each industry keyword against the topic
  for (const [keyword, terms] of Object.entries(INDUSTRY_KEYWORDS)) {
    if (topicLower.includes(keyword)) {
      matched.push(...terms);
    }
  }

  // If no industry match, use the topic words directly + fallbacks
  if (matched.length === 0) {
    // Try using the topic words as search terms
    const words = topicLower.split(/\s+/).filter(w => w.length > 3);
    const topicTerms = words.slice(0, 3).map(w => `${w} aesthetic`);
    matched.push(...topicTerms, ...FALLBACK_TERMS);
  }

  return shuffleArray(matched);
}

/** Get slide backgrounds — industry-specific imagery based on topic */
export async function getSlideBackgrounds(
  count: number = 7,
  topic?: string
): Promise<string[]> {
  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) {
    console.warn('⚠️ PEXELS_API_KEY not set');
    return [];
  }

  const searchTerms = topic ? getSearchTermsForTopic(topic) : shuffleArray([...FALLBACK_TERMS]);
  const urls: string[] = [];
  const usedIds = new Set<number>();

  // First pass: pick up to 3 photos per search term
  for (const term of searchTerms) {
    if (urls.length >= count) break;

    try {
      const photos = await searchPexels(term, apiKey, 15);
      if (photos.length === 0) continue;

      const available = photos.filter(p => !usedIds.has(p.id as number));
      if (available.length === 0) continue;

      // Pick up to 3 unique photos per term to fill slides faster
      const pickCount = Math.min(3, count - urls.length, available.length);
      const shuffled = shuffleArray(available.slice(0, 8));
      for (let i = 0; i < pickCount; i++) {
        const pick = shuffled[i];
        if (!pick) break;
        usedIds.add(pick.id as number);
        const url = pick.src?.portrait || pick.src?.large;
        if (url) urls.push(url);
      }
    } catch (err) {
      console.error(`Pexels search failed for "${term}":`, err);
    }
  }

  // Fallback pass: if we still don't have enough, search with general terms
  if (urls.length < count) {
    const fallbackTerms = ['woman lifestyle portrait', 'aesthetic interior', 'woman entrepreneur', 'beautiful workspace', 'woman selfcare'];
    for (const term of fallbackTerms) {
      if (urls.length >= count) break;
      try {
        const photos = await searchPexels(term, apiKey, 15);
        const available = photos.filter(p => !usedIds.has(p.id as number));
        for (const photo of available.slice(0, count - urls.length)) {
          usedIds.add(photo.id as number);
          const url = photo.src?.portrait || photo.src?.large;
          if (url) urls.push(url);
        }
      } catch { /* skip */ }
    }
  }

  return urls.slice(0, count);
}

/** Search for specific images */
export async function searchImages(
  query: string,
  count: number = 10
): Promise<PexelsPhoto[]> {
  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) return [];
  return searchPexels(query, apiKey, count);
}

/** Download an image to a local temp file */
export async function downloadImage(url: string, destPath: string): Promise<void> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to download image: ${url}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  const fs = await import('fs');
  fs.writeFileSync(destPath, buffer);
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
