'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

interface TikTokAccount {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  totalPosted: number;
  lastPostedAt?: string;
  connectedAt: string;
}

interface Campaign {
  id: string;
  name: string;
  enabled: boolean;
  requireApproval: boolean;
  postsPerDay: number;
  postTimes: string[];
  topics: string[];
  slideCount: number;
  accountIds: string[];
  totalPosted: number;
  totalGenerated: number;
  lastPostedAt?: string;
}

interface CarouselPost {
  id: string;
  campaignId: string;
  content: {
    hookText: string;
    title: string;
    description: string;
    slides: { headline: string; body: string }[];
    ctaText: string;
  };
  slideImageUrls: string[];
  status: string;
  results: Record<string, { status: string; error?: string }>;
  createdAt: string;
  postedAt?: string;
}

function TikTokPageInner() {
  const searchParams = useSearchParams();
  const [accounts, setAccounts] = useState<TikTokAccount[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [posts, setPosts] = useState<CarouselPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState<string | null>(null);
  const [approving, setApproving] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [editTimes, setEditTimes] = useState('');
  const [editTopics, setEditTopics] = useState('');
  const [toast, setToast] = useState<{ type: string; message: string } | null>(null);
  const [tab, setTab] = useState<'campaigns' | 'posts'>('campaigns');

  // Show toast from URL params (after OAuth redirect)
  useEffect(() => {
    const connected = searchParams.get('connected');
    const error = searchParams.get('error');
    if (connected) showToast('success', `✅ Connected @${connected}!`);
    if (error) showToast('error', `❌ Connection failed: ${error}`);
  }, [searchParams]);

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    try {
      const [accRes, campRes, postRes] = await Promise.all([
        fetch('/api/tiktok/accounts'),
        fetch('/api/carousel'),
        fetch('/api/carousel/posts'),
      ]);
      const accData = await accRes.json();
      const campData = await campRes.json();
      const postData = await postRes.json();
      setAccounts(accData.accounts || []);
      setCampaigns(campData.campaigns || []);
      setPosts(postData.posts || []);
    } catch {
      showToast('error', 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }

  async function disconnectAccount(id: string) {
    if (!confirm('Disconnect this TikTok account?')) return;
    await fetch('/api/tiktok/accounts', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    showToast('success', 'Account disconnected');
    loadAll();
  }

  async function toggleCampaign(campaign: Campaign) {
    await fetch('/api/carousel', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: campaign.id, enabled: !campaign.enabled }),
    });
    showToast('success', campaign.enabled ? '⏸️ Paused' : '🟢 Activated!');
    loadAll();
  }

  async function triggerNow(campaignId: string) {
    setTriggering(campaignId);
    try {
      const res = await fetch('/api/carousel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'trigger', campaignId }),
      });
      if (res.ok) {
        showToast('success', '🚀 Generating carousel...');
        setTimeout(loadAll, 3000); // Refresh after generation
      } else {
        const data = await res.json();
        showToast('error', data.error || 'Trigger failed');
      }
    } catch {
      showToast('error', 'Failed to trigger');
    } finally {
      setTriggering(null);
    }
  }

  async function approvePost(postId: string) {
    setApproving(postId);
    try {
      const res = await fetch('/api/carousel/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve', postId }),
      });
      const data = await res.json();
      if (data.status === 'posted') {
        showToast('success', '✅ Carousel posted!');
      } else {
        showToast('error', `Failed: ${data.error || 'Unknown'}`);
      }
      loadAll();
    } catch {
      showToast('error', 'Approve failed');
    } finally {
      setApproving(null);
    }
  }

  async function rejectPost(postId: string) {
    await fetch('/api/carousel/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reject', postId }),
    });
    showToast('success', 'Post rejected');
    loadAll();
  }

  async function saveEdit(campaign: Campaign) {
    const times = editTimes.split(',').map(t => t.trim()).filter(Boolean);
    const topics = editTopics.split('\n').map(t => t.trim()).filter(Boolean);
    await fetch('/api/carousel', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: campaign.id,
        postTimes: times.length > 0 ? times : campaign.postTimes,
        topics: topics.length > 0 ? topics : campaign.topics,
      }),
    });
    setEditing(null);
    showToast('success', '✅ Updated');
    loadAll();
  }

  function showToast(type: string, message: string) {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  }

  const pendingPosts = posts.filter(p => p.status === 'pending_review');

  return (
    <main className="page">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800 }}>🎠 TikTok Carousels</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>
            Auto-generate and post photo carousels to unlimited TikTok accounts.
          </p>
        </div>
        <a href="/" className="btn btn--secondary">← Dashboard</a>
      </div>

      {/* Connected Accounts */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div className="card__title">📱 Connected Accounts ({accounts.length})</div>
          <a href="/api/tiktok/auth" className="btn btn--primary btn--sm">+ Connect TikTok</a>
        </div>

        {accounts.length === 0 ? (
          <p style={{ color: 'var(--text-tertiary)', textAlign: 'center', padding: 20 }}>
            No accounts connected. Click &quot;Connect TikTok&quot; to get started.
          </p>
        ) : (
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {accounts.map(acc => (
              <div key={acc.id} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 16px', background: 'var(--bg-card-alt, rgba(255,255,255,0.05))',
                borderRadius: 12, border: '1px solid var(--border)',
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #25F4EE, #FE2C55)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16, fontWeight: 700, color: '#fff',
                }}>
                  {acc.username?.[0]?.toUpperCase() || '?'}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>@{acc.username}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
                    {acc.totalPosted} posts
                  </div>
                </div>
                <button
                  onClick={() => disconnectAccount(acc.id)}
                  style={{
                    marginLeft: 8, background: 'none', border: 'none',
                    color: 'var(--text-tertiary)', cursor: 'pointer', fontSize: 16,
                  }}
                  title="Disconnect"
                >×</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <button
          className={`btn btn--sm ${tab === 'campaigns' ? 'btn--primary' : 'btn--secondary'}`}
          onClick={() => setTab('campaigns')}
        >
          ⚡ Campaigns
        </button>
        <button
          className={`btn btn--sm ${tab === 'posts' ? 'btn--primary' : 'btn--secondary'}`}
          onClick={() => setTab('posts')}
          style={{ position: 'relative' }}
        >
          📋 Posts
          {pendingPosts.length > 0 && (
            <span style={{
              position: 'absolute', top: -6, right: -6,
              background: '#EF4444', color: '#fff', borderRadius: '50%',
              width: 20, height: 20, fontSize: 11, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>{pendingPosts.length}</span>
          )}
        </button>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <div className="spinner" />
        </div>
      )}

      {/* Campaigns Tab */}
      {tab === 'campaigns' && campaigns.map(campaign => (
        <div key={campaign.id} className="card" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 12, height: 12, borderRadius: '50%',
                background: campaign.enabled ? 'var(--success)' : 'var(--text-tertiary)',
                boxShadow: campaign.enabled ? '0 0 8px rgba(16, 185, 129, 0.5)' : 'none',
              }} />
              <h2 style={{ fontSize: 20, fontWeight: 700 }}>{campaign.name}</h2>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                className={`btn btn--sm ${campaign.enabled ? 'btn--danger' : 'btn--primary'}`}
                onClick={() => toggleCampaign(campaign)}
              >
                {campaign.enabled ? '⏸️ Pause' : '▶️ Activate'}
              </button>
              <button
                className={`btn btn--secondary btn--sm ${triggering === campaign.id ? 'btn--loading' : ''}`}
                onClick={() => triggerNow(campaign.id)}
                disabled={triggering === campaign.id}
              >
                {triggering === campaign.id ? <><span className="spinner" /> Running...</> : '⚡ Run Now'}
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="stats-row" style={{ marginBottom: 20 }}>
            <div className="stat-card" style={{ padding: 14 }}>
              <div className="stat-card__value" style={{ fontSize: 24 }}>{campaign.postsPerDay}</div>
              <div className="stat-card__label">Posts / Day</div>
            </div>
            <div className="stat-card" style={{ padding: 14 }}>
              <div className="stat-card__value" style={{ fontSize: 24 }}>{campaign.totalPosted}</div>
              <div className="stat-card__label">Published</div>
            </div>
            <div className="stat-card" style={{ padding: 14 }}>
              <div className="stat-card__value" style={{ fontSize: 24 }}>{campaign.totalGenerated}</div>
              <div className="stat-card__label">Generated</div>
            </div>
            <div className="stat-card" style={{ padding: 14 }}>
              <div className="stat-card__value" style={{ fontSize: 24 }}>{accounts.length}</div>
              <div className="stat-card__label">Accounts</div>
            </div>
          </div>

          {/* Schedule */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
              📅 Posting Schedule
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {campaign.postTimes.map((time, i) => (
                <span key={i} style={{
                  padding: '6px 14px', background: 'var(--bg-pill)',
                  borderRadius: 20, fontSize: 14, fontWeight: 600,
                  color: 'var(--accent)', border: '1px solid rgba(99, 102, 241, 0.2)',
                }}>{time}</span>
              ))}
            </div>
          </div>

          {/* Info */}
          <div style={{ fontSize: 13, color: 'var(--text-tertiary)', marginBottom: 12 }}>
            {campaign.topics.length} topics in rotation · {campaign.slideCount} slides per carousel ·
            {campaign.requireApproval ? ' 👀 Review mode' : ' 🚀 Auto-post mode'}
          </div>

          {/* Edit */}
          {editing === campaign.id ? (
            <div style={{ marginTop: 16 }}>
              <div className="form-group">
                <label className="form-label">Posting Times (comma-separated, 24h)</label>
                <input className="form-input" value={editTimes} onChange={e => setEditTimes(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Topics (one per line)</label>
                <textarea className="form-textarea" rows={10} value={editTopics} onChange={e => setEditTopics(e.target.value)} />
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn--primary btn--sm" onClick={() => saveEdit(campaign)}>💾 Save</button>
                <button className="btn btn--secondary btn--sm" onClick={() => setEditing(null)}>Cancel</button>
              </div>
            </div>
          ) : (
            <button
              className="btn btn--secondary btn--sm"
              onClick={() => { setEditing(campaign.id); setEditTimes(campaign.postTimes.join(', ')); setEditTopics(campaign.topics.join('\n')); }}
            >
              ✏️ Edit Schedule & Topics
            </button>
          )}
        </div>
      ))}

      {/* Posts Tab */}
      {tab === 'posts' && (
        <div>
          {posts.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: 40 }}>
              <p style={{ color: 'var(--text-tertiary)' }}>No carousel posts yet. Run a campaign to generate some!</p>
            </div>
          ) : (
            posts.map(post => (
              <div key={post.id} className="card" style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 4 }}>{post.content.hookText}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>
                      {new Date(post.createdAt).toLocaleString()} · {post.content.slides.length} slides
                    </div>
                  </div>
                  <span style={{
                    padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                    background: post.status === 'posted' ? 'rgba(16,185,129,0.15)' :
                                post.status === 'pending_review' ? 'rgba(251,191,36,0.15)' :
                                post.status === 'failed' ? 'rgba(239,68,68,0.15)' : 'rgba(99,102,241,0.15)',
                    color: post.status === 'posted' ? '#10B981' :
                           post.status === 'pending_review' ? '#F59E0B' :
                           post.status === 'failed' ? '#EF4444' : '#818CF8',
                  }}>
                    {post.status === 'pending_review' ? '👀 Review' :
                     post.status === 'posted' ? '✅ Posted' :
                     post.status === 'failed' ? '❌ Failed' :
                     post.status}
                  </span>
                </div>

                {/* Slide previews */}
                {post.slideImageUrls.length > 0 && (
                  <div style={{ display: 'flex', gap: 8, overflowX: 'auto', marginBottom: 12, paddingBottom: 8 }}>
                    {post.slideImageUrls.map((url, i) => (
                      <img key={i} src={url} alt={`Slide ${i + 1}`} style={{
                        width: 100, height: 125, objectFit: 'cover',
                        borderRadius: 8, border: '1px solid var(--border)',
                        flexShrink: 0,
                      }} />
                    ))}
                  </div>
                )}

                {/* Caption preview */}
                <div style={{
                  fontSize: 13, color: 'var(--text-secondary)',
                  background: 'var(--bg-pill)', padding: '10px 14px',
                  borderRadius: 8, marginBottom: 12, maxHeight: 80, overflow: 'hidden',
                }}>
                  {post.content.description}
                </div>

                {/* Actions */}
                {post.status === 'pending_review' && (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      className={`btn btn--primary btn--sm ${approving === post.id ? 'btn--loading' : ''}`}
                      onClick={() => approvePost(post.id)}
                      disabled={approving === post.id}
                    >
                      {approving === post.id ? <><span className="spinner" /> Posting...</> : '✅ Approve & Post'}
                    </button>
                    <button className="btn btn--secondary btn--sm" onClick={() => rejectPost(post.id)}>
                      ❌ Reject
                    </button>
                  </div>
                )}

                {/* Results per account */}
                {Object.keys(post.results).length > 0 && (
                  <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 8 }}>
                    {Object.entries(post.results).map(([accId, result]) => (
                      <span key={accId} style={{ marginRight: 12 }}>
                        {result.status === 'success' ? '✅' : '❌'} {accId.slice(0, 8)}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
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

export default function TikTokPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', padding: 60 }}><div className="spinner" /></div>}>
      <TikTokPageInner />
    </Suspense>
  );
}
