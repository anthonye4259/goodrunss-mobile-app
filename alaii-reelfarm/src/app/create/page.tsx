'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Point {
  headline: string;
  painPoint: string;
  solution: string;
}

interface ReelContent {
  hookText: string;
  points: Point[];
  ctaText: string;
  caption: string;
}

export default function CreatePage() {
  const router = useRouter();
  const [topic, setTopic] = useState('');
  const [pointCount, setPointCount] = useState(5);
  const [content, setContent] = useState<ReelContent | null>(null);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [publishingNow, setPublishingNow] = useState(false);
  const [rendering, setRendering] = useState(false);
  const [videoPath, setVideoPath] = useState<string | null>(null);
  const [scheduledAt, setScheduledAt] = useState('');
  const [toast, setToast] = useState<{ type: string; message: string } | null>(null);

  // === AI Generate ===
  async function handleGenerate() {
    if (!topic.trim()) return;
    setGenerating(true);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, pointCount }),
      });
      const data = await res.json();
      if (data.content) {
        setContent(data.content);
        setImageUrls(data.imageUrls || []);
        showToast('success', '✨ Content generated!');
      } else {
        showToast('error', data.error || 'Generation failed');
      }
    } catch {
      showToast('error', 'Failed to generate content');
    } finally {
      setGenerating(false);
    }
  }

  // === Save as Draft ===
  async function handleSave(status: 'draft' | 'scheduled') {
    if (!content) return;
    setSaving(true);
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          imageUrls,
          scheduledAt: status === 'scheduled' ? scheduledAt || undefined : undefined,
        }),
      });
      const data = await res.json();
      if (data.post) {
        showToast('success', status === 'scheduled' ? '🗓️ Reel scheduled!' : '📝 Draft saved!');
        setTimeout(() => router.push('/'), 1500);
      } else {
        showToast('error', data.error || 'Failed to save');
      }
    } catch {
      showToast('error', 'Failed to save post');
    } finally {
      setSaving(false);
    }
  }

  // === Publish Now ===
  async function handlePublishNow() {
    if (!content) return;
    setPublishingNow(true);
    try {
      // First save as draft
      const createRes = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, imageUrls }),
      });
      const createData = await createRes.json();
      if (!createData.post) throw new Error('Failed to create post');

      // Then publish
      const pubRes = await fetch('/api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId: createData.post.id }),
      });
      const pubData = await pubRes.json();

      if (pubData.status === 'published') {
        showToast('success', '🎉 Reel published to Instagram!');
        setTimeout(() => router.push('/'), 2000);
      } else {
        showToast('error', pubData.error || 'Publishing failed');
      }
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to publish');
    } finally {
      setPublishingNow(false);
    }
  }

  // === Render & Download ===
  async function handleRenderAndDownload() {
    if (!content) return;
    setRendering(true);
    try {
      const res = await fetch('/api/render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, imageUrls }),
      });
      const data = await res.json();
      if (data.videoPath) {
        setVideoPath(data.videoPath);
        // Trigger download
        const downloadUrl = `/api/render/download?path=${encodeURIComponent(data.videoPath)}`;
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `alaii-reel-${Date.now()}.mp4`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        showToast('success', '🎬 Video downloaded! Now copy the caption and post to IG.');
      } else {
        showToast('error', data.error || 'Rendering failed');
      }
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to render');
    } finally {
      setRendering(false);
    }
  }

  // === Copy Caption ===
  async function handleCopyCaption() {
    if (!content) return;
    try {
      await navigator.clipboard.writeText(content.caption);
      showToast('success', '📋 Caption copied to clipboard!');
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = content.caption;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      showToast('success', '📋 Caption copied to clipboard!');
    }
  }

  // === Inline editing ===
  function updateHook(value: string) {
    if (!content) return;
    setContent({ ...content, hookText: value });
  }

  function updatePoint(index: number, field: keyof Point, value: string) {
    if (!content) return;
    const newPoints = [...content.points];
    newPoints[index] = { ...newPoints[index], [field]: value };
    setContent({ ...content, points: newPoints });
  }

  function updateCTA(value: string) {
    if (!content) return;
    setContent({ ...content, ctaText: value });
  }

  function updateCaption(value: string) {
    if (!content) return;
    setContent({ ...content, caption: value });
  }

  function addPoint() {
    if (!content) return;
    setContent({
      ...content,
      points: [
        ...content.points,
        {
          headline: `${content.points.length + 1}. new point`,
          painPoint: 'describe the problem',
          solution: 'describe the solution',
        },
      ],
    });
  }

  function removePoint(index: number) {
    if (!content) return;
    const newPoints = content.points.filter((_, i) => i !== index);
    // Re-number
    const renumbered = newPoints.map((p, i) => ({
      ...p,
      headline: p.headline.replace(/^\d+\./, `${i + 1}.`),
    }));
    setContent({ ...content, points: renumbered });
  }

  function showToast(type: string, message: string) {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  }

  return (
    <main className="page">
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Create Reel</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 32 }}>
          Generate AI-powered slideshow Reels for Alaii&apos;s Instagram
        </p>

        {/* === AI Generate Section === */}
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card__title" style={{ marginBottom: 16 }}>🤖 AI Generate</div>
          <div className="form-group">
            <label className="form-label">Topic / Angle</label>
            <input
              className="form-input"
              type="text"
              placeholder='e.g. "5 ways i regained my time during business growth"'
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
            />
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div className="form-group" style={{ marginBottom: 0, width: 120 }}>
              <label className="form-label">Points</label>
              <select
                className="form-select"
                value={pointCount}
                onChange={(e) => setPointCount(Number(e.target.value))}
              >
                {[3, 4, 5, 6, 7].map(n => (
                  <option key={n} value={n}>{n} points</option>
                ))}
              </select>
            </div>
            <button
              className={`btn btn--primary ${generating ? 'btn--loading' : ''}`}
              onClick={handleGenerate}
              disabled={generating || !topic.trim()}
              style={{ marginTop: 18 }}
            >
              {generating ? <><span className="spinner" /> Generating...</> : '✨ Generate'}
            </button>
          </div>
        </div>

        {/* === Content Editor === */}
        {content && (
          <>
            {/* Slide Preview Strip */}
            <div className="card" style={{ marginBottom: 24 }}>
              <div className="card__title" style={{ marginBottom: 12 }}>📱 Slide Preview</div>
              <div className="slide-preview">
                {/* Hook — plain white text, no pill */}
                <div className="slide-preview__item" style={{
                  backgroundImage: imageUrls[0]
                    ? `linear-gradient(rgba(0,0,0,0.15), rgba(0,0,0,0.25)), url(${imageUrls[0]})`
                    : 'linear-gradient(135deg, #0a0a0a, #1a1a2e)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                }}>
                  <span className="slide-preview__type" style={{ color: 'var(--warning)' }}>hook</span>
                  <span className="slide-preview__hook-text">{content.hookText.toLowerCase()}</span>
                </div>
                {/* Numbered slides — pill headline + regular body */}
                {content.points.map((point, i) => (
                  <div key={i} className="slide-preview__item" style={{
                    backgroundImage: imageUrls[i + 1]
                      ? `linear-gradient(rgba(0,0,0,0.15), rgba(0,0,0,0.25)), url(${imageUrls[i + 1]})`
                      : 'none',
                    backgroundColor: imageUrls[i + 1] ? undefined : '#2a2a3a',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                  }}>
                    <span className="slide-preview__type">#{i + 1}</span>
                    <div className="slide-preview__pill-wrap"><span className="slide-preview__pill-text">{point.headline.toLowerCase()}</span></div>
                    <span className="slide-preview__body">{point.painPoint.toLowerCase()}</span>
                    <span className="slide-preview__body">{point.solution?.toLowerCase()}</span>
                  </div>
                ))}
                {/* CTA — same style as numbered slides, with background image */}
                <div className="slide-preview__item" style={{
                  backgroundImage: imageUrls[content.points.length + 1]
                    ? `linear-gradient(rgba(0,0,0,0.15), rgba(0,0,0,0.25)), url(${imageUrls[content.points.length + 1]})`
                    : 'linear-gradient(135deg, #16213e, #0f3460)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                }}>
                  <span className="slide-preview__type" style={{ color: 'var(--success)' }}>cta</span>
                  <div className="slide-preview__pill-wrap"><span className="slide-preview__pill-text">{content.ctaText.toLowerCase()}</span></div>
                  <span className="slide-preview__body">alaii.app</span>
                  <span className="slide-preview__body">free on app store + android</span>
                </div>
              </div>
            </div>

            {/* Hook */}
            <div className="card" style={{ marginBottom: 16 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">🪝 Hook (Opening Slide)</label>
                <input
                  className="form-input"
                  value={content.hookText}
                  onChange={(e) => updateHook(e.target.value)}
                />
              </div>
            </div>

            {/* Points */}
            {content.points.map((point, i) => (
              <div key={i} className="card" style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)' }}>Slide {i + 1}</span>
                  <button className="btn btn--danger btn--sm" onClick={() => removePoint(i)}>✕</button>
                </div>
                <div className="form-group">
                  <label className="form-label">Headline (pill text)</label>
                  <input
                    className="form-input"
                    value={point.headline}
                    onChange={(e) => updatePoint(i, 'headline', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Pain point</label>
                  <input
                    className="form-input"
                    value={point.painPoint}
                    onChange={(e) => updatePoint(i, 'painPoint', e.target.value)}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Solution</label>
                  <input
                    className="form-input"
                    value={point.solution}
                    onChange={(e) => updatePoint(i, 'solution', e.target.value)}
                  />
                </div>
              </div>
            ))}

            <button className="btn btn--secondary" onClick={addPoint} style={{ marginBottom: 16, width: '100%', justifyContent: 'center' }}>
              + Add Point
            </button>

            {/* CTA */}
            <div className="card" style={{ marginBottom: 16 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">📣 CTA (Closing Slide)</label>
                <input
                  className="form-input"
                  value={content.ctaText}
                  onChange={(e) => updateCTA(e.target.value)}
                />
              </div>
            </div>

            {/* Caption */}
            <div className="card" style={{ marginBottom: 24 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">📝 Instagram Caption</label>
                <textarea
                  className="form-textarea"
                  rows={6}
                  value={content.caption}
                  onChange={(e) => updateCaption(e.target.value)}
                />
              </div>
            </div>

            {/* Schedule */}
            <div className="card" style={{ marginBottom: 24 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">🗓️ Schedule (optional)</label>
                <input
                  className="form-input"
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                />
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', flexWrap: 'wrap', marginBottom: 40 }}>
              <button
                className={`btn btn--secondary ${saving ? 'btn--loading' : ''}`}
                onClick={() => handleSave('draft')}
                disabled={saving}
              >
                📝 Save Draft
              </button>
              {scheduledAt && (
                <button
                  className={`btn btn--secondary ${saving ? 'btn--loading' : ''}`}
                  onClick={() => handleSave('scheduled')}
                  disabled={saving}
                  style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}
                >
                  🗓️ Schedule
                </button>
              )}
              <button
                className="btn btn--secondary"
                onClick={handleCopyCaption}
                style={{ borderColor: '#8b5cf6', color: '#8b5cf6' }}
              >
                📋 Copy Caption
              </button>
              <button
                className={`btn btn--primary ${rendering ? 'btn--loading' : ''}`}
                onClick={handleRenderAndDownload}
                disabled={rendering}
                style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
              >
                {rendering ? (
                  <><span className="spinner" /> Rendering Video...</>
                ) : (
                  '🎬 Render & Download MP4'
                )}
              </button>
              {videoPath && (
                <button
                  className={`btn btn--primary ${publishingNow ? 'btn--loading' : ''}`}
                  onClick={handlePublishNow}
                  disabled={publishingNow}
                >
                  {publishingNow ? (
                    <><span className="spinner" /> Publishing...</>
                  ) : (
                    '🚀 Publish to Instagram'
                  )}
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div className={`toast toast--${toast.type}`}>
          {toast.message}
        </div>
      )}
    </main>
  );
}
