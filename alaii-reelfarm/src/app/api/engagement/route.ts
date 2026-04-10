// ============================================================================
// Engagement Queue API — DISABLED
// ============================================================================
// This engine has been disabled. Engagement finding is no longer active.

import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'disabled',
    message: 'Engagement queue engine has been disabled.',
  });
}

export async function POST() {
  return NextResponse.json(
    { error: 'Engagement queue engine has been disabled.' },
    { status: 410 },
  );
}
