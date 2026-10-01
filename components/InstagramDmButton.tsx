'use client';

import { useState } from 'react';
import { instagramDmLink } from '@/lib/instagram';

// Instagram's DM link has no "prefilled text" option the way wa.me does, and
// a customer who doesn't realize they need to manually paste the message
// just sees an empty chat and gives up. So instead of one button that copies
// and opens at once, this shows the message as visible, persistent text with
// two explicit steps — copy, then open and paste — so the instruction is
// still there even after they've switched over to the Instagram app.
export default function InstagramDmButton({ message }: { message: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Clipboard API unavailable — the text is already visible below to select and copy manually.
    }
  }

  return (
    <div style={{ border: '1px solid var(--line)', borderRadius: 6, padding: '12px 14px' }}>
      <p style={{ fontSize: 13, color: 'var(--ink-soft)', marginBottom: 8, marginTop: 0 }}>
        Instagram doesn&apos;t let us fill this in for you — copy it below, then paste it into the chat
        once it opens.
      </p>
      <textarea
        readOnly
        value={message}
        rows={3}
        onFocus={(e) => e.target.select()}
        style={{
          width: '100%',
          fontSize: 13,
          padding: '8px 10px',
          border: '1px solid var(--line)',
          borderRadius: 4,
          fontFamily: 'inherit',
          marginBottom: 10,
          resize: 'none',
          background: '#fff',
        }}
      />
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button type="button" className="btn btn-outline" onClick={handleCopy}>
          {copied ? '1. Copied ✓' : '1. Copy message'}
        </button>
        <a href={instagramDmLink()} target="_blank" rel="noopener noreferrer" className="btn">
          2. Open Instagram &amp; paste
        </a>
      </div>
    </div>
  );
}
