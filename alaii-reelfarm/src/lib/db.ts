// ============================================================================
// Alaii ReelFarm — JSON File Database
// ============================================================================
// Simple file-based storage for an internal tool. No need for a real DB.

import * as fs from 'fs';
import * as path from 'path';
import type { Post } from '@/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const POSTS_FILE = path.join(DATA_DIR, 'posts.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(POSTS_FILE)) {
    fs.writeFileSync(POSTS_FILE, JSON.stringify([], null, 2));
  }
}

export function getAllPosts(): Post[] {
  ensureDataDir();
  const data = fs.readFileSync(POSTS_FILE, 'utf-8');
  return JSON.parse(data);
}

export function getPost(id: string): Post | undefined {
  return getAllPosts().find(p => p.id === id);
}

export function savePost(post: Post): void {
  ensureDataDir();
  const posts = getAllPosts();
  const index = posts.findIndex(p => p.id === post.id);
  post.updatedAt = new Date().toISOString();
  if (index >= 0) {
    posts[index] = post;
  } else {
    posts.push(post);
  }
  fs.writeFileSync(POSTS_FILE, JSON.stringify(posts, null, 2));
}

export function deletePost(id: string): void {
  ensureDataDir();
  const posts = getAllPosts().filter(p => p.id !== id);
  fs.writeFileSync(POSTS_FILE, JSON.stringify(posts, null, 2));
}

export function getPostsByStatus(status: Post['status']): Post[] {
  return getAllPosts().filter(p => p.status === status);
}

export function getScheduledPosts(): Post[] {
  return getAllPosts()
    .filter(p => p.status === 'scheduled' && p.scheduledAt)
    .sort((a, b) => new Date(a.scheduledAt!).getTime() - new Date(b.scheduledAt!).getTime());
}
