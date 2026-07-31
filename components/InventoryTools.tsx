'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function InventoryTools() {
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{
    created: number;
    updated: number;
    errors: string[];
    total: number;
  } | null>(null);
  const [error, setError] = useState('');

  async function handleImportFile(file: File | null) {
    if (!file) return;
    setImporting(true);
    setError('');
    setResult(null);

    const form = new FormData();
    form.append('file', file);

    try {
      const res = await fetch('/api/admin/import', { method: 'POST', body: form });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || 'Import failed');
      setResult(body);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Import failed');
    } finally {
      setImporting(false);
      if (fileInput.current) fileInput.current.value = '';
    }
  }

  return (
    <div className="admin-card" style={{ marginBottom: 24 }}>
      <h3 style={{ marginTop: 0, fontSize: 16 }}>Inventory (Excel)</h3>
      <p style={{ fontSize: 13, color: 'var(--ink-soft)', marginTop: -8 }}>
        Export your full catalog to Excel, edit it there, then import it back — matching by SKU
        updates existing products, new rows become new products.
      </p>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <a href="/api/admin/export" className="btn btn-outline">
          Export to Excel
        </a>
        <button
          type="button"
          className="btn"
          onClick={() => fileInput.current?.click()}
          disabled={importing}
        >
          {importing ? 'Importing…' : 'Import from Excel'}
        </button>
        <input
          ref={fileInput}
          type="file"
          accept=".xlsx,.xls"
          hidden
          onChange={(e) => handleImportFile(e.target.files?.[0] || null)}
        />
      </div>

      {error && <div className="error-text">{error}</div>}

      {result && (
        <div style={{ marginTop: 14, fontSize: 13 }}>
          <div>
            ✅ {result.created} created, {result.updated} updated out of {result.total} rows.
          </div>
          {result.errors.length > 0 && (
            <div style={{ marginTop: 8, color: 'var(--clay)' }}>
              {result.errors.map((e, i) => (
                <div key={i}>{e}</div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
