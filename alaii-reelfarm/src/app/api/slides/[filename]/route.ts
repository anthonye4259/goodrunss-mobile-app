// Serve carousel slide images — proxied from Firebase Storage
// TikTok requires URL ownership verification, so we serve from our own domain
import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

const STORAGE_BUCKET = process.env.FIREBASE_STORAGE_BUCKET || 'goodrunss-ai.firebasestorage.app';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;

  // TikTok URL prefix verification file
  if (filename.startsWith('tiktok') && filename.endsWith('.txt')) {
    // Content format: tiktok-developers-site-verification={token}
    const token = filename.replace('tiktok', '').replace('.txt', '');
    const content = `tiktok-developers-site-verification=${token}`;
    return new NextResponse(content, {
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  }

  // First try local filesystem (for images not yet uploaded)
  const tmpDir = path.join(process.cwd(), 'tmp', 'carousel');
  if (fs.existsSync(tmpDir)) {
    const subdirs = fs.readdirSync(tmpDir).filter(d =>
      fs.statSync(path.join(tmpDir, d)).isDirectory()
    );
    for (const subdir of subdirs.reverse()) {
      const filePath = path.join(tmpDir, subdir, filename);
      if (fs.existsSync(filePath)) {
        const fileBuffer = fs.readFileSync(filePath);
        const ext = path.extname(filename).toLowerCase();
        const contentType = ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' :
                            ext === '.png' ? 'image/png' :
                            ext === '.webp' ? 'image/webp' : 'application/octet-stream';
        return new NextResponse(fileBuffer, {
          headers: {
            'Content-Type': contentType,
            'Cache-Control': 'public, max-age=86400',
          },
        });
      }
    }
  }

  // Proxy from Firebase Storage
  const storageUrl = `https://storage.googleapis.com/${STORAGE_BUCKET}/reelfarm/reels/${filename}`;
  try {
    const res = await fetch(storageUrl);
    if (!res.ok) {
      return NextResponse.json({ error: 'Slide not found' }, { status: 404 });
    }
    const buffer = await res.arrayBuffer();
    const contentType = res.headers.get('content-type') || 'image/jpeg';
    return new NextResponse(Buffer.from(buffer), {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Slide not found' }, { status: 404 });
  }
}
