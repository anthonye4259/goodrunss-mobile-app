'use client';

import { useEffect, useState } from 'react';

interface ReelContent {
  hookText: string;
  points: { headline: string; painPoint: string; solution: string }[];
  ctaText: string;
  caption: string;
}

interface Post {
  id: string;
  content: ReelContent;
  status: string;
  scheduledAt?: string;
  publishedAt?: string;
  igMediaId?: string;
  error?: string;
  createdAt: string;
}

export default function Dashboard() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState<string | null>(null);
  const [approving, setApproving] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: string; message: string } | null>(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    try {
      const res = await fetch('/api/posts');
      const data = await res.json();
      setPosts(data.posts || []);
    } catch (err) {
      console.error('Failed to fetch posts:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handlePublish(postId: string) {
    setPublishing(postId);
    try {
      const res = await fetch('/api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId }),
      });
      const data = await res.json();
      if (data.status === 'published') {
        showToast('success', '🎉 Reel published to Instagram!');
      } else {
        showToast('error', data.error || 'Publishing failed');
      }
      fetchPosts();
    } catch {
      showToast('error', 'Failed to publish');
    } finally {
      setPublishing(null);
    }
  }

  async function handleApprove(postId: string) {
    setApproving(postId);
    try {
      const res = await fetch('/api/posts/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, action: 'approve' }),
      });
      const data = await res.json();
      if (data.status === 'published') {
        showToast('success', '🎉 Approved & published to Instagram!');
      } else {
        showToast('error', data.error || 'Approval failed');
      }
      fetchPosts();
    } catch {
      showToast('error', 'Failed to approve');
    } finally {
      setApproving(null);
    }
  }

  async function handleReject(postId: string) {
    try {
      await fetch('/api/posts/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, action: 'reject' }),
      });
      showToast('success', '❌ Post rejected');
      fetchPosts();
    } catch {
      showToast('error', 'Failed to reject');
    }
  }

  async function handleDelete(postId: string) {
    try {
      await fetch(`/api/posts?id=${postId}`, { method: 'DELETE' });
      setPosts(posts.filter(p => p.id !== postId));
      showToast('success', 'Post deleted');
    } catch {
      showToast('error', 'Failed to delete');
    }
  }

  function showToast(type: string, message: string) {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  }

  const reviewPosts = posts.filter(p => p.status === 'pending_review');
  const scheduledPosts = posts.filter(p => p.status === 'scheduled');
  const draftPosts = posts.filter(p => p.status === 'draft');
  const publishedPosts = posts.filter(p => p.status === 'published');
  const activePosts = posts.filter(p => ['rendering','uploading','publishing'].includes(p.status));

  return (
    <main className="page">
      {/* Stats */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-card__value" style={{ color: 'var(--warning)' }}>{reviewPosts.length}</div>
          <div className="stat-card__label">Pending Review</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__value" style={{ color: 'var(--success)' }}>{publishedPosts.length}</div>
          <div className="stat-card__label">Published</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__value" style={{ color: 'var(--accent)' }}>{scheduledPosts.length}</div>
          <div className="stat-card__label">Scheduled</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__value">{posts.length}</div>
          <div className="stat-card__label">Total Reels</div>
        </div>
      </div>

      {/* =========== REVIEW QUEUE =========== */}
      {reviewPosts.length > 0 && (
        <div className="section">
          <div className="section__header">
            <h2 className="section__title">👀 Review Queue</h2>
            <span className="section__count">{reviewPosts.length} awaiting approval</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {reviewPosts.map(post => (
              <ReviewCard
                key={post.id}
                post={post}
                isExpanded={expanded === post.id}
                onToggle={() => setExpanded(expanded === post.id ? null : post.id)}
                onApprove={() => handleApprove(post.id)}
                onReject={() => handleReject(post.id)}
                isApproving={approving === post.id}
              />
            ))}
          </div>
        </div>
      )}

      {/* Active / Processing */}
      {activePosts.length > 0 && (
        <div className="section">
          <div className="section__header">
            <h2 className="section__title">⚡ Processing</h2>
          </div>
          <div className="post-grid">
            {activePosts.map(post => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </div>
      )}

      {/* Scheduled */}
      {scheduledPosts.length > 0 && (
        <div className="section">
          <div className="section__header">
            <h2 className="section__title">🗓️ Scheduled</h2>
            <span className="section__count">{scheduledPosts.length} queued</span>
          </div>
          <div className="post-grid">
            {scheduledPosts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                onPublish={() => handlePublish(post.id)}
                onDelete={() => handleDelete(post.id)}
                isPublishing={publishing === post.id}
              />
            ))}
          </div>
        </div>
      )}

      {/* Drafts */}
      {draftPosts.length > 0 && (
        <div className="section">
          <div className="section__header">
            <h2 className="section__title">📝 Drafts</h2>
            <span className="section__count">{draftPosts.length}</span>
          </div>
          <div className="post-grid">
            {draftPosts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                onPublish={() => handlePublish(post.id)}
                onDelete={() => handleDelete(post.id)}
                isPublishing={publishing === post.id}
              />
            ))}
          </div>
        </div>
      )}

      {/* Published */}
      {publishedPosts.length > 0 && (
        <div className="section">
          <div className="section__header">
            <h2 className="section__title">✅ Published</h2>
            <span className="section__count">{publishedPosts.length}</span>
          </div>
          <div className="post-grid">
            {publishedPosts.map(post => (
              <PostCard key={post.id} post={post} onDelete={() => handleDelete(post.id)} />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && posts.length === 0 && (
        <div className="empty">
          <div className="empty__icon">🎬</div>
          <div className="empty__text">No reels yet</div>
          <div className="empty__sub">Create your first AI-generated Reel or activate AutoPilot</div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 20 }}>
            <a href="/automations" className="btn btn--secondary">⚡ Set Up AutoPilot</a>
            <a href="/create" className="btn btn--primary">✨ Create Reel</a>
          </div>
        </div>
      )}

      {loading && (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <div className="spinner" />
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`toast toast--${toast.type}`}>
          {toast.message}
        </div>
      )}
    </main>
  );
}

// ============================================================================
// Review Card — Expanded view with full content preview + approve/reject
// ============================================================================

function ReviewCard({
  post,
  isExpanded,
  onToggle,
  onApprove,
  onReject,
  isApproving,
}: {
  post: Post;
  isExpanded: boolean;
  onToggle: () => void;
  onApprove: () => void;
  onReject: () => void;
  isApproving: boolean;
}) {
  return (
    <div className="card" style={{
      borderColor: 'var(--warning)',
      borderWidth: 1,
      background: 'rgba(245, 158, 11, 0.03)',
    }}>
      {/* Collapsed Header */}
      <div
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
        onClick={onToggle}
      >
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <span className="badge badge--pending_review">pending review</span>
            <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
              {new Date(post.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>🪝 {post.content.hookText}</div>
          {!isExpanded && (
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
              {post.content.points.length} slides · CTA: {post.content.ctaText} · Click to preview ▾
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8, marginLeft: 16 }} onClick={e => e.stopPropagation()}>
          <button
            className={`btn btn--primary btn--sm ${isApproving ? 'btn--loading' : ''}`}
            onClick={onApprove}
            disabled={isApproving}
          >
            {isApproving ? <><span className="spinner" /> Approving...</> : '✅ Approve & Post'}
          </button>
          <button className="btn btn--danger btn--sm" onClick={onReject}>
            ✕ Reject
          </button>
        </div>
      </div>

      {/* Expanded Content Preview */}
      {isExpanded && (
        <div style={{ marginTop: 20, borderTop: '1px solid var(--border)', paddingTop: 20 }}>
          {/* Slide Preview Strip */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
              📱 Slide Preview
            </div>
            <div className="slide-preview">
              {/* Hook */}
              <div className="slide-preview__item" style={{ background: 'linear-gradient(135deg, #0a0a0a, #1a1a2e)' }}>
                <span className="slide-preview__type" style={{ color: 'var(--warning)' }}>hook</span>
                <span style={{ color: '#fff', fontWeight: 700, fontSize: 11 }}>{post.content.hookText}</span>
              </div>
              {/* Points */}
              {post.content.points.map((point, i) => (
                <div key={i} className="slide-preview__item" style={{ background: '#2a2a3a' }}>
                  <span className="slide-preview__type">#{i + 1}</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 10, marginBottom: 4, color: '#fff' }}>{point.headline}</div>
                    <div style={{ fontSize: 9 }}>{point.painPoint}</div>
                  </div>
                </div>
              ))}
              {/* CTA */}
              <div className="slide-preview__item" style={{ background: 'linear-gradient(135deg, #16213e, #0f3460)' }}>
                <span className="slide-preview__type" style={{ color: 'var(--success)' }}>cta</span>
                <span style={{ color: '#a8d8ff', fontWeight: 700, fontSize: 11 }}>{post.content.ctaText}</span>
              </div>
            </div>
          </div>

          {/* Full Content */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {/* Slides */}
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
                📝 Slides
              </div>
              {post.content.points.map((point, i) => (
                <div key={i} style={{
                  padding: 12,
                  background: 'var(--bg-secondary)',
                  borderRadius: 8,
                  marginBottom: 8,
                  border: '1px solid var(--border)',
                }}>
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{point.headline}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{point.painPoint}</div>
                  <div style={{ fontSize: 12, color: 'var(--accent)', marginTop: 2 }}>{point.solution}</div>
                </div>
              ))}
            </div>

            {/* Caption */}
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
                📣 Caption
              </div>
              <div style={{
                padding: 12,
                background: 'var(--bg-secondary)',
                borderRadius: 8,
                border: '1px solid var(--border)',
                fontSize: 13,
                lineHeight: 1.6,
                color: 'var(--text-secondary)',
                whiteSpace: 'pre-wrap',
              }}>
                {post.content.caption}
              </div>

              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8, marginTop: 16 }}>
                📣 CTA Slide
              </div>
              <div style={{
                padding: 16,
                background: 'linear-gradient(135deg, #16213e, #0f3460)',
                borderRadius: 8,
                textAlign: 'center',
              }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>{post.content.ctaText}</div>
                <div style={{ fontSize: 14, color: '#a8d8ff', marginTop: 6 }}>alaii.app</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Post Card Component (for other statuses)
// ============================================================================

function PostCard({
  post,
  onPublish,
  onDelete,
  isPublishing,
}: {
  post: Post;
  onPublish?: () => void;
  onDelete?: () => void;
  isPublishing?: boolean;
}) {
  return (
    <div className="post-card">
      <div className="card__header">
        <span className={`badge badge--${post.status}`}>
          {post.status === 'publishing' && <span className="spinner" />}
          {post.status}
        </span>
        {post.scheduledAt && (
          <span className="post-card__date">
            {new Date(post.scheduledAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        )}
      </div>

      <div className="post-card__hook">{post.content.hookText}</div>

      <ul className="post-card__points">
        {post.content.points.map((point, i) => (
          <li key={i}>{point.headline}</li>
        ))}
      </ul>

      {post.content.ctaText && (
        <div style={{ fontSize: 13, color: 'var(--accent)', marginBottom: 12 }}>
          CTA: {post.content.ctaText}
        </div>
      )}

      {post.error && (
        <div style={{ fontSize: 13, color: 'var(--error)', marginBottom: 12 }}>
          ⚠️ {post.error}
        </div>
      )}

      <div className="post-card__footer">
        <span className="post-card__date">
          {new Date(post.createdAt).toLocaleDateString()}
        </span>
        <div className="post-card__actions">
          {onPublish && post.status !== 'published' && (
            <button
              className={`btn btn--primary btn--sm ${isPublishing ? 'btn--loading' : ''}`}
              onClick={onPublish}
              disabled={isPublishing}
            >
              {isPublishing ? (
                <><span className="spinner" /> Publishing...</>
              ) : (
                '🚀 Publish Now'
              )}
            </button>
          )}
          {onDelete && (
            <button className="btn btn--danger btn--sm" onClick={onDelete}>
              🗑️
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
