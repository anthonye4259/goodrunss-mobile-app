// ============================================================================
// Alaii ReelFarm — Firebase Storage (Video Hosting)
// ============================================================================
// Uploads rendered MP4 videos to Firebase Storage and returns a public URL
// that the Instagram Graph API can cURL.
// Uses lazy initialization to avoid errors during build.

import * as fs from 'fs';
import * as path from 'path';

let _bucket: import('firebase-admin').storage.Storage | null = null;
let _bucketName: string = '';

function getBucket() {
  if (_bucket) return _bucket.bucket(_bucketName);

  const admin = require('firebase-admin') as typeof import('firebase-admin');

  _bucketName = process.env.FIREBASE_STORAGE_BUCKET || '';

  if (!admin.apps.length) {
    const serviceAccountEnv = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (serviceAccountEnv) {
      // Support both file path (local dev) and inline JSON (cloud deploy)
      let serviceAccount;
      if (serviceAccountEnv.startsWith('{')) {
        serviceAccount = JSON.parse(serviceAccountEnv);
      } else if (fs.existsSync(serviceAccountEnv)) {
        serviceAccount = JSON.parse(fs.readFileSync(serviceAccountEnv, 'utf-8'));
      }
      if (serviceAccount) {
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          storageBucket: _bucketName,
        });
      } else {
        admin.initializeApp({ storageBucket: _bucketName });
      }
    } else {
      admin.initializeApp({ storageBucket: _bucketName });
    }
  }

  _bucket = admin.storage();
  return _bucket.bucket(_bucketName);
}

/** Upload a video file to Firebase Storage and return a public URL */
export async function uploadVideo(localPath: string): Promise<string> {
  const bucket = getBucket();
  const filename = `reelfarm/reels/${path.basename(localPath)}`;

  await bucket.upload(localPath, {
    destination: filename,
    metadata: {
      contentType: 'video/mp4',
      metadata: {
        source: 'alaii-reelfarm',
        uploadedAt: new Date().toISOString(),
      },
    },
  });

  // Make the file publicly accessible
  const file = bucket.file(filename);
  await file.makePublic();

  const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;
  console.log('☁️ Video uploaded:', publicUrl);

  return publicUrl;
}

/** Delete a video from Firebase Storage */
export async function deleteVideo(publicUrl: string): Promise<void> {
  try {
    const bucket = getBucket();
    const filename = publicUrl.replace(`https://storage.googleapis.com/${bucket.name}/`, '');
    await bucket.file(filename).delete();
    console.log('🗑️ Video deleted from storage:', filename);
  } catch (error) {
    console.error('Failed to delete video:', error);
  }
}

/** Upload a carousel image to Firebase Storage and return a cdn.alaii.app URL */
export async function uploadCarouselImage(localPath: string): Promise<string> {
  const bucket = getBucket();
  const ext = path.extname(localPath).toLowerCase();
  const contentType = ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' :
                      ext === '.webp' ? 'image/webp' : 'image/jpeg';
  const storagePath = `reelfarm/reels/${path.basename(localPath)}`;

  await bucket.upload(localPath, {
    destination: storagePath,
    metadata: {
      contentType,
      metadata: {
        source: 'alaii-reelfarm-carousel',
        uploadedAt: new Date().toISOString(),
      },
    },
  });

  // Make the file publicly accessible
  const file = bucket.file(storagePath);
  await file.makePublic();

  // Return URL via cdn.alaii.app (Firebase Hosting → carouselImage Cloud Function)
  // Falls back to goodrunss-ai.web.app if custom domain not yet configured
  const cdnDomain = process.env.CAROUSEL_CDN_DOMAIN || 'goodrunss-ai.web.app';
  const cdnUrl = `https://${cdnDomain}/carousel/${storagePath}`;
  console.log('☁️ Carousel image uploaded:', cdnUrl);

  return cdnUrl;
}
