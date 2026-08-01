'use client';

import { useState } from 'react';

export default function CopyUpiId({ upiId }: { upiId: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(upiId);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard API unavailable — the ID is already visible as plain text to copy manually
    }
  }

  return (
    <button type="button" className="btn btn-outline" onClick={handleCopy} style={{ display: 'inline-block' }}>
      {copied ? 'Copied ✓' : `Copy UPI ID (${upiId})`}
    </button>
  );
}
