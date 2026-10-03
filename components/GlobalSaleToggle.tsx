'use client';

import { useState } from 'react';

export default function GlobalSaleToggle({
  initialEnabled,
  initialPercent,
}: {
  initialEnabled: boolean;
  initialPercent: string;
}) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [percent, setPercent] = useState(initialPercent);
  const [savingToggle, setSavingToggle] = useState(false);
  const [savingPercent, setSavingPercent] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  async function saveSetting(key: string, value: string) {
    return fetch('/api/admin/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, value }),
    });
  }

  async function toggle() {
    const next = !enabled;

    if (next) {
      // Turning on: save the percent AND the on/off flag together, so a
      // single tap always leaves both in sync — no separate "Save percent"
      // step required just to turn the sale on.
      const n = Number(percent);
      if (!(n > 0 && n < 100)) {
        setError('Enter a discount percent between 1 and 99 first.');
        return;
      }
      setError('');
      setSavingToggle(true);
      const results = await Promise.all([
        saveSetting('global_sale_percent', String(n)),
        saveSetting('global_sale_enabled', 'true'),
      ]);
      if (results.every((r) => r.ok)) setEnabled(true);
      else setError('Could not save — please try again.');
      setSavingToggle(false);
      return;
    }

    setError('');
    setSavingToggle(true);
    const res = await saveSetting('global_sale_enabled', 'false');
    if (res.ok) setEnabled(false);
    setSavingToggle(false);
  }

  async function savePercent() {
    const n = Number(percent);
    if (!(n > 0 && n < 100)) {
      setError('Discount percent must be between 1 and 99.');
      return;
    }
    setError('');
    setSavingPercent(true);
    const res = await saveSetting('global_sale_percent', String(n));
    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    }
    setSavingPercent(false);
  }

  const examplePrice = 1000;
  const n = Number(percent);
  const validPercent = n > 0 && n < 100;
  const exampleSale = validPercent ? Math.round(examplePrice * (1 - n / 100)) : null;

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
          <strong style={{ fontSize: 14 }}>Global sale — % off everything</strong>
          <div style={{ fontSize: 13, color: 'var(--ink-soft)' }}>
            {enabled
              ? `Live — ${percent}% off every product that doesn't already have its own offer price.`
              : "Off — prices are normal (products with their own offer price are unaffected either way)."}
          </div>
        </div>
        <button onClick={toggle} disabled={savingToggle} className={enabled ? 'btn' : 'btn btn-outline'}>
          {savingToggle ? '…' : enabled ? 'On — tap to turn off' : 'Off — tap to turn on'}
        </button>
      </div>

      <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div>
          <label style={{ fontSize: 13, color: 'var(--ink-soft)', display: 'block', marginBottom: 4 }}>
            Discount percent (applies storewide)
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              type="number"
              min="1"
              max="99"
              value={percent}
              onChange={(e) => setPercent(e.target.value)}
              style={{
                width: 90,
                padding: '8px 10px',
                border: '1px solid var(--line)',
                borderRadius: 4,
                fontSize: 14,
              }}
            />
            <span style={{ fontSize: 14, color: 'var(--ink-soft)' }}>%</span>
          </div>
        </div>

        {validPercent && (
          <p style={{ margin: 0, fontSize: 13, color: 'var(--ink-soft)' }}>
            Example: a ₹{examplePrice.toLocaleString('en-IN')} product would show as{' '}
            <span style={{ textDecoration: 'line-through' }}>₹{examplePrice.toLocaleString('en-IN')}</span>{' '}
            <strong style={{ color: 'var(--clay)' }}>₹{exampleSale!.toLocaleString('en-IN')}</strong>.
          </p>
        )}

        {error && <div className="error-text">{error}</div>}

        <button
          onClick={savePercent}
          disabled={savingPercent}
          className="btn btn-outline"
          style={{ fontSize: 13, padding: '6px 14px', alignSelf: 'flex-start' }}
        >
          {savingPercent ? 'Saving…' : saved ? 'Saved ✓' : 'Save percent'}
        </button>
      </div>
    </div>
  );
}
