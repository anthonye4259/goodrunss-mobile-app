// ============================================================================
// Alaii ReelFarm — Type Definitions
// ============================================================================

export type SlideType = 'hook' | 'point' | 'cta';

export interface Slide {
  type: SlideType;
  /** Headline text (e.g. "1. stopped answering the same questions") */
  headline: string;
  /** Body text lines (pain point + solution) */
  bodyLines: string[];
  /** Background image URL or local path */
  imageUrl?: string;
  /** Duration in seconds for this slide */
  duration: number;
}

export interface ReelContent {
  /** Hook text for the opening slide */
  hookText: string;
  /** Numbered points: each with headline + body lines */
  points: {
    headline: string;
    painPoint: string;
    solution: string;
  }[];
  /** CTA text for the closing slide */
  ctaText: string;
  /** Instagram caption with hashtags */
  caption: string;
}

export type PostStatus = 'draft' | 'pending_review' | 'approved' | 'rendering' | 'uploading' | 'scheduled' | 'publishing' | 'published' | 'failed' | 'rejected';

export interface Post {
  id: string;
  /** The content/script for this reel */
  content: ReelContent;
  /** Compiled slide sequence */
  slides: Slide[];
  /** Status of the post */
  status: PostStatus;
  /** Path to rendered video */
  videoPath?: string;
  /** Public URL of uploaded video */
  videoUrl?: string;
  /** IG media ID after publishing */
  igMediaId?: string;
  /** Scheduled publish time (ISO string) */
  scheduledAt?: string;
  /** Actual publish time */
  publishedAt?: string;
  /** Error message if failed */
  error?: string;
  /** Created timestamp */
  createdAt: string;
  /** Last updated timestamp */
  updatedAt: string;
}

export interface PexelsPhoto {
  id: number;
  src: {
    original: string;
    large2x: string;
    large: string;
    portrait: string;
  };
  photographer: string;
  alt: string;
}

export interface IGPublishResult {
  containerId: string;
  mediaId?: string;
  status: 'processing' | 'published' | 'error';
  error?: string;
}
