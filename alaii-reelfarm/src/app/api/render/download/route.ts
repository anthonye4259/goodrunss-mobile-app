// ============================================================================
// GET /api/render/download?path=... — Serve rendered video for download
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

export async function GET(req: NextRequest) {
  const videoPath = req.nextUrl.searchParams.get('path');

  if (!videoPath) {
    return NextResponse.json({ error: 'path is required' }, { status: 400 });
  }

  // Security: only allow files from the renders directory
  const rendersDir = path.join(process.cwd(), 'tmp', 'renders');
  const resolvedPath = path.resolve(videoPath);

  if (!resolvedPath.startsWith(rendersDir)) {
    return NextResponse.json({ error: 'Invalid path' }, { status: 403 });
  }

  if (!fs.existsSync(resolvedPath)) {
    return NextResponse.json({ error: 'Video not found' }, { status: 404 });
  }

  const fileBuffer = fs.readFileSync(resolvedPath);
  const filename = path.basename(resolvedPath);

  return new NextResponse(fileBuffer, {
    headers: {
      'Content-Type': 'video/mp4',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': String(fileBuffer.length),
    },
  });
}
