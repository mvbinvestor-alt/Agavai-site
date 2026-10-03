'use client';

import { useState } from 'react';

export default function SaleBannerToggle({
  initialEnabled,
  initialMessage,
  initialStart,
  initialEnd,
}: {
  initialEnabled: boolean;
  initialMessage: string;
  initialStart: string;
  initialEnd: string;
}) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [message, setMessage] = useState(initialMessage);
  const [start, setStart] = useState(initialStart);
  const [end, setEnd] = useState(initialEnd);
  const [savingToggle, setSavingToggle] = useState(false);
  const [savingDetails, setSavingDetails] = useState(false);
  const [saved, setSaved] = useState(false);

  async function saveSetting(key: string, value: string) {
    return fetch('/api/admin/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, value }),
    });
  }

  async function toggle() {
    const next = !enabled;
    setSavingToggle(true);
    const res = await saveSetting('sale_banner_enabled', next ? 'true' : 'false');
    if (res.ok) setEnabled(next);
    setSavingToggle(false);
  }

  async function saveDetails() {
    setSavingDetails(true);
    const results = await Promise.all([
      saveSetting('sale_banner_message', message),
      saveSetting('sale_banner_start', start),
      saveSetting('sale_banner_end', end),
    ]);
    if (results.every((r) => r.ok)) {
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    }
    setSavingDetails(false);
  }

  const today = new Date().toISOString().slice(0, 10);
  const withinWindow = (!start || today >= start) && (!end || today <= end);

  return (
    <div
      style={{
        border: '1px solid var(--line)',
        borderRadius: 6,
        padding: '12px 16px',
        marginBottom: 20,
        background: enabled ? 'rgba(180, 75, 51, 0.06)' : undefined,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <strong style={{ fontSize: 14 }}>Sitewide sale banner</strong>
          <div style={{ fontSize: 13, color: 'var(--ink-soft)' }}>
            {enabled
              ? withinWindow
                ? 'Live — showing on every page.'
                : 'On, but outside its start/end dates — not showing right now.'
              : 'Off — no banner shown.'}
          </div>
        </div>
        <button onClick={toggle} disabled={savingToggle} className={enabled ? 'btn' : 'btn btn-outline'}>
          {savingToggle ? '…' : enabled ? 'On — tap to turn off' : 'Off — tap to turn on'}
        </button>
      </div>

      {enabled && (
        <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div>
            <label style={{ fontSize: 13, color: 'var(--ink-soft)', display: 'block', marginBottom: 4 }}>
              Banner message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={2}
              style={{
                width: '100%',
                padding: '8px 10px',
                border: '1px solid var(--line)',
                borderRadius: 4,
                fontFamily: 'inherit',
                fontSize: 14,
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <div>
              <label style={{ fontSize: 13, color: 'var(--ink-soft)', display: 'block', marginBottom: 4 }}>
                Starts (optional)
              </label>
              <input
                type="date"
                value={start}
                onChange={(e) => setStart(e.target.value)}
                style={{ padding: '8px 10px', border: '1px solid var(--line)', borderRadius: 4, fontSize: 14 }}
              />
            </div>
            <div>
              <label style={{ fontSize: 13, color: 'var(--ink-soft)', display: 'block', marginBottom: 4 }}>
                Ends (optional)
              </label>
              <input
                type="date"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                style={{ padding: '8px 10px', border: '1px solid var(--line)', borderRadius: 4, fontSize: 14 }}
              />
            </div>
          </div>
          <p style={{ margin: 0, fontSize: 12, color: 'var(--ink-soft)' }}>
            Leave dates blank to show the banner for as long as it&apos;s turned on. Dates compare to the
            server&apos;s date (UTC), so the banner may switch on/off a few hours off from midnight IST.
          </p>

          <div>
            <label style={{ fontSize: 13, color: 'var(--ink-soft)', display: 'block', marginBottom: 4 }}>
              Preview
            </label>
            <div className="sale-banner" style={{ borderRadius: 4 }}>
              {message || 'Your sale message will appear here'}
            </div>
          </div>

          <button
            onClick={saveDetails}
            disabled={savingDetails}
            className="btn btn-outline"
            style={{ fontSize: 13, padding: '6px 14px', alignSelf: 'flex-start' }}
          >
            {savingDetails ? 'Saving…' : saved ? 'Saved ✓' : 'Save banner details'}
          </button>
        </div>
      )}
    </div>
  );
}
