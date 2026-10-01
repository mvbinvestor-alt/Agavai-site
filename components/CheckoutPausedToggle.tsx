'use client';

import { useState } from 'react';

export default function CheckoutPausedToggle({
  initialPaused,
  initialMessage,
}: {
  initialPaused: boolean;
  initialMessage: string;
}) {
  const [paused, setPaused] = useState(initialPaused);
  const [message, setMessage] = useState(initialMessage);
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
    const next = !paused;
    setSavingToggle(true);
    const res = await saveSetting('checkout_paused', next ? 'true' : 'false');
    if (res.ok) setPaused(next);
    setSavingToggle(false);
  }

  async function saveMessage() {
    setSavingMessage(true);
    const res = await saveSetting('checkout_paused_message', message);
    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    }
    setSavingMessage(false);
  }

  return (
    <div
      style={{
        border: '1px solid var(--line)',
        borderRadius: 6,
        padding: '12px 16px',
        marginBottom: 20,
        background: paused ? 'rgba(200, 80, 60, 0.06)' : undefined,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <strong style={{ fontSize: 14 }}>Online payment (UPI checkout)</strong>
          <div style={{ fontSize: 13, color: 'var(--ink-soft)' }}>
            {paused
              ? "Paused — customers see a message to order via WhatsApp/Instagram instead."
              : 'Live — customers can pay directly at checkout.'}
          </div>
        </div>
        <button
          onClick={toggle}
          disabled={savingToggle}
          className={paused ? 'btn' : 'btn btn-outline'}
        >
          {savingToggle ? '…' : paused ? 'Paused — tap to resume' : 'Live — tap to pause'}
        </button>
      </div>

      {paused && (
        <div style={{ marginTop: 12 }}>
          <label style={{ fontSize: 13, color: 'var(--ink-soft)', display: 'block', marginBottom: 4 }}>
            Message shown to customers at checkout (WhatsApp/Instagram buttons are added automatically
            below this)
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
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
        </div>
      )}
    </div>
  );
}
