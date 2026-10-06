'use client';

import { useState } from 'react';

const DEFAULT_MESSAGE =
  "We're making a quick update and will be back online shortly. Thanks for your patience!";

export default function MaintenanceModeToggle({
  initialEnabled,
  initialMessage,
}: {
  initialEnabled: boolean;
  initialMessage: string;
}) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [message, setMessage] = useState(initialMessage || DEFAULT_MESSAGE);
  const [savingToggle, setSavingToggle] = useState(false);
  const [savingMessage, setSavingMessage] = useState(false);
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
    const res = await saveSetting('maintenance_mode', next ? 'true' : 'false');
    if (res.ok) setEnabled(next);
    setSavingToggle(false);
  }

  async function saveMessage() {
    setSavingMessage(true);
    const res = await saveSetting('maintenance_message', message);
    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    }
    setSavingMessage(false);
  }

  return (
    <div
      style={{
        border: enabled ? '1px solid var(--clay)' : '1px solid var(--line)',
        borderRadius: 6,
        padding: '12px 16px',
        marginBottom: 20,
        background: enabled ? 'rgba(180, 75, 51, 0.08)' : undefined,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <strong style={{ fontSize: 14 }}>Site-wide maintenance mode</strong>
          <div style={{ fontSize: 13, color: 'var(--ink-soft)' }}>
            {enabled
              ? 'ON — every visitor sees the "back soon" page below instead of the site. Turn it off once you’ve checked everything works.'
              : 'Off — site is live as normal. Turn this on right before you push a risky change, so visitors never see a half-updated page.'}
          </div>
        </div>
        <button
          onClick={toggle}
          disabled={savingToggle}
          className={enabled ? 'btn' : 'btn btn-outline'}
        >
          {savingToggle ? '…' : enabled ? 'ON — tap to go live' : 'Off — tap to enable'}
        </button>
      </div>

      {enabled && (
        <div style={{ marginTop: 12 }}>
          <label style={{ fontSize: 13, color: 'var(--ink-soft)', display: 'block', marginBottom: 4 }}>
            Message shown to visitors
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
          <button
            onClick={saveMessage}
            disabled={savingMessage}
            className="btn btn-outline"
            style={{ marginTop: 8, fontSize: 13, padding: '6px 14px' }}
          >
            {savingMessage ? 'Saving…' : saved ? 'Saved ✓' : 'Save message'}
          </button>
          <p style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 10 }}>
            This page (/admin) always stays reachable even while maintenance mode is on, so you can
            come back here and turn it off.
          </p>
        </div>
      )}
    </div>
  );
}
