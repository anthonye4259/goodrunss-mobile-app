'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Campaign {
  id: string;
  name: string;
  enabled: boolean;
  postsPerDay: number;
  postTimes: string[];
  topics: string[];
  pointCount: number;
  createdAt: string;
  totalPosted: number;
  lastPostedAt?: string;
}

export default function AutomationsPage() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [editTimes, setEditTimes] = useState('');
  const [editTopics, setEditTopics] = useState('');
  const [toast, setToast] = useState<{ type: string; message: string } | null>(null);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  async function fetchCampaigns() {
    try {
      const res = await fetch('/api/campaigns');
      const data = await res.json();
      setCampaigns(data.campaigns || []);
    } catch {
      showToast('error', 'Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  }

  async function toggleCampaign(campaign: Campaign) {
    try {
      await fetch('/api/campaigns', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: campaign.id, enabled: !campaign.enabled }),
      });
      showToast('success', campaign.enabled ? '⏸️ Campaign paused' : '🟢 Campaign activated!');
      fetchCampaigns();
    } catch {
      showToast('error', 'Failed to update');
    }
  }

  async function triggerNow(campaignId: string) {
    setTriggering(campaignId);
    try {
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'trigger', campaignId }),
      });
      if (res.ok) {
        showToast('success', '🚀 AutoPilot triggered! Generating & posting...');
        fetchCampaigns();
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

  async function saveEdit(campaign: Campaign) {
    try {
      const times = editTimes.split(',').map(t => t.trim()).filter(Boolean);
      const topics = editTopics.split('\n').map(t => t.trim()).filter(Boolean);

      await fetch('/api/campaigns', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: campaign.id,
          postTimes: times.length > 0 ? times : campaign.postTimes,
          topics: topics.length > 0 ? topics : campaign.topics,
        }),
      });
      setEditing(null);
      showToast('success', '✅ Campaign updated');
      fetchCampaigns();
    } catch {
      showToast('error', 'Failed to save');
    }
  }

  function startEdit(campaign: Campaign) {
    setEditing(campaign.id);
    setEditTimes(campaign.postTimes.join(', '));
    setEditTopics(campaign.topics.join('\n'));
  }

  function showToast(type: string, message: string) {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  }

  return (
    <main className="page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800 }}>⚡ Automations</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>
            Set up once, runs forever. Auto-generates and posts Reels on autopilot.
          </p>
        </div>
        <a href="/" className="btn btn--secondary">← Dashboard</a>
      </div>

      {/* How It Works */}
      <div className="card" style={{ marginBottom: 24, borderColor: 'var(--accent)', borderWidth: 1, background: 'rgba(99, 102, 241, 0.05)' }}>
        <div className="card__title" style={{ marginBottom: 12, color: 'var(--accent)' }}>🤖 How AutoPilot Works</div>
        <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
          <strong style={{ color: 'var(--text-primary)' }}>1.</strong> At each scheduled time, AI picks a topic from your pool<br />
          <strong style={{ color: 'var(--text-primary)' }}>2.</strong> Claude generates a full Reel script (hook + slides + CTA + caption)<br />
          <strong style={{ color: 'var(--text-primary)' }}>3.</strong> Lifestyle images are auto-sourced from Pexels<br />
          <strong style={{ color: 'var(--text-primary)' }}>4.</strong> Video is rendered (1080×1920, H.264) and uploaded<br />
          <strong style={{ color: 'var(--text-primary)' }}>5.</strong> Published directly to Alaii&apos;s Instagram as a Reel
        </div>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <div className="spinner" />
        </div>
      )}

      {/* Campaigns */}
      {campaigns.map(campaign => (
        <div key={campaign.id} className="card" style={{ marginBottom: 16 }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  background: campaign.enabled ? 'var(--success)' : 'var(--text-tertiary)',
                  boxShadow: campaign.enabled ? '0 0 8px rgba(16, 185, 129, 0.5)' : 'none',
                }}
              />
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
              <div className="stat-card__label">Total Posted</div>
            </div>
            <div className="stat-card" style={{ padding: 14 }}>
              <div className="stat-card__value" style={{ fontSize: 24 }}>{campaign.topics.length}</div>
              <div className="stat-card__label">Topics</div>
            </div>
            <div className="stat-card" style={{ padding: 14 }}>
              <div className="stat-card__value" style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
                {campaign.lastPostedAt
                  ? new Date(campaign.lastPostedAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                  : 'Never'
                }
              </div>
              <div className="stat-card__label">Last Post</div>
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
                  padding: '6px 14px',
                  background: 'var(--bg-pill)',
                  borderRadius: 20,
                  fontSize: 14,
                  fontWeight: 600,
                  color: 'var(--accent)',
                  border: '1px solid rgba(99, 102, 241, 0.2)',
                }}>
                  {time}
                </span>
              ))}
            </div>
          </div>

          {/* Edit / View Topics */}
          {editing === campaign.id ? (
            <div style={{ marginTop: 16 }}>
              <div className="form-group">
                <label className="form-label">Posting Times (comma-separated, 24h format)</label>
                <input
                  className="form-input"
                  value={editTimes}
                  onChange={(e) => setEditTimes(e.target.value)}
                  placeholder="09:00, 13:00, 17:00, 20:00"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Topics (one per line)</label>
                <textarea
                  className="form-textarea"
                  rows={10}
                  value={editTopics}
                  onChange={(e) => setEditTopics(e.target.value)}
                />
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn--primary btn--sm" onClick={() => saveEdit(campaign)}>
                  💾 Save
                </button>
                <button className="btn btn--secondary btn--sm" onClick={() => setEditing(null)}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              className="btn btn--secondary btn--sm"
              onClick={() => startEdit(campaign)}
              style={{ marginTop: 8 }}
            >
              ✏️ Edit Schedule & Topics
            </button>
          )}
        </div>
      ))}

      {/* Toast */}
      {toast && (
        <div className={`toast toast--${toast.type}`}>
          {toast.message}
        </div>
      )}
    </main>
  );
}
