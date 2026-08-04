'use client';

import { useState } from 'react';

export default function CatalogNoticeToggle({
  initialEnabled,
  initialText,
}: {
  initialEnabled: boolean;
  initialText: string;
}) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [text, setText] = useState(initialText);
  const [savingToggle, setSavingToggle] = useState(false);
  const [savingText, setSavingText] = useState(false);
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
    const res = await saveSetting('catalog_notice_enabled', next ? 'true' : 'false');
    if (res.ok) setEnabled(next);
    setSavingToggle(false);
  }

  async function saveText() {
    setSavingText(true);
    const res = await saveSetting('catalog_notice_text', text);
    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    }
    setSavingText(false);
  }

  return (
    <div
      style={{
        border: '1px solid var(--line)',
        borderRadius: 6,
        padding: '12px 16px',
        marginBottom: 20,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <strong style={{ fontSize: 14 }}>&quot;Under construction&quot; banner</strong>
          <div style={{ fontSize: 13, color: 'var(--ink-soft)' }}>
            Shows above the collection on the homepage.
          </div>
        </div>
        <button onClick={toggle} disabled={savingToggle} className={enabled ? 'btn' : 'btn btn-outline'}>
          {savingToggle ? '…' : enabled ? 'On — tap to hide' : 'Off — tap to show'}
        </button>
      </div>

      <div style={{ marginTop: 12 }}>
        <label style={{ fontSize: 13, color: 'var(--ink-soft)', display: 'block', marginBottom: 4 }}>
          Message text (the WhatsApp/Instagram links are added automatically after this)
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
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
          onClick={saveText}
          disabled={savingText}
          className="btn btn-outline"
          style={{ marginTop: 8, fontSize: 13, padding: '6px 14px' }}
        >
          {savingText ? 'Saving…' : saved ? 'Saved ✓' : 'Save message'}
        </button>
      </div>
    </div>
  );
}
