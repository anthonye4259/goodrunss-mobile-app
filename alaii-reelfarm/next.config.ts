import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['canvas', 'fluent-ffmpeg', 'firebase-admin', 'node-cron'],
  turbopack: {
    root: './',
  },
};

export default nextConfig;
