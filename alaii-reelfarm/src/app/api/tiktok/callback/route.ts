// TikTok OAuth - Callback handler (with PKCE)
import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForToken, getCodeVerifier } from '@/lib/tiktok';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const state = request.nextUrl.searchParams.get('state');
  const error = request.nextUrl.searchParams.get('error');

  // Use the forwarded host (tunnel URL) or fall back to request URL
  const forwardedHost = request.headers.get('x-forwarded-host');
  const forwardedProto = request.headers.get('x-forwarded-proto') || 'https';
  const baseUrl = forwardedHost
    ? `${forwardedProto}://${forwardedHost}`
    : request.nextUrl.origin;

  if (error) {
    return NextResponse.redirect(new URL('/tiktok?error=auth_denied', baseUrl));
  }

  if (!code || !state) {
    return NextResponse.redirect(new URL('/tiktok?error=no_code', baseUrl));
  }

  // Retrieve PKCE code verifier using state
  const codeVerifier = getCodeVerifier(state);
  if (!codeVerifier) {
    return NextResponse.redirect(new URL('/tiktok?error=pkce_expired', baseUrl));
  }

  try {
    const account = await exchangeCodeForToken(code, codeVerifier);
    return NextResponse.redirect(
      new URL(`/tiktok?connected=${account.username}`, baseUrl)
    );
  } catch (err) {
    console.error('TikTok OAuth error:', err);
    return NextResponse.redirect(
      new URL(`/tiktok?error=auth_failed`, baseUrl)
    );
  }
}
