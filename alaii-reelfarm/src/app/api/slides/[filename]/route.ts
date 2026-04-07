// Serve carousel slide images from local filesystem
import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;

  // Look for the file in the most recent carousel render directory
  const tmpDir = path.join(process.cwd(), 'tmp', 'carousel');

  if (!fs.existsSync(tmpDir)) {
    return NextResponse.json({ error: 'No slides found' }, { status: 404 });
  }

  // Search all carousel subdirectories for the file
  const subdirs = fs.readdirSync(tmpDir).filter(d =>
    fs.statSync(path.join(tmpDir, d)).isDirectory()
  );

  for (const subdir of subdirs.reverse()) { // Most recent first
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
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }
  }

  return NextResponse.json({ error: 'Slide not found' }, { status: 404 });
}
