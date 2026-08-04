'use client';

import { useState } from 'react';

export default function CatalogNoticeToggle({ initialEnabled }: { initialEnabled: boolean }) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [saving, setSaving] = useState(false);

  async function toggle() {
    const next = !enabled;
    setSaving(true);
    const res = await fetch('/api/admin/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: 'catalog_notice_enabled', value: next ? 'true' : 'false' }),
    });
    if (res.ok) setEnabled(next);
    setSaving(false);
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        padding: '12px 16px',
        border: '1px solid var(--line)',
        borderRadius: 6,
        marginBottom: 20,
      }}
    >
      <div>
        <strong style={{ fontSize: 14 }}>&quot;Under construction&quot; banner</strong>
        <div style={{ fontSize: 13, color: 'var(--ink-soft)' }}>
          Shows above the collection on the homepage, pointing people to Instagram/WhatsApp.
        </div>
      </div>
      <button onClick={toggle} disabled={saving} className={enabled ? 'btn' : 'btn btn-outline'}>
        {saving ? '…' : enabled ? 'On — tap to hide' : 'Off — tap to show'}
      </button>
    </div>
  );
}
