// TikTok OAuth - Auth redirect
import { NextResponse } from 'next/server';
import { getAuthUrl } from '@/lib/tiktok';

export async function GET() {
  try {
    const authUrl = getAuthUrl();
    return NextResponse.redirect(authUrl);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate auth URL' },
      { status: 500 }
    );
  }
}
