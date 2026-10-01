'use client';

import { useState } from 'react';
import { instagramDmLink } from '@/lib/instagram';

// Instagram's DM link has no "prefilled text" option the way wa.me does, so
// we copy the message to the clipboard right before opening the DM. The
// small caption below the button is permanent (not a timed toast) so the
// "paste it" instruction is still visible even after switching to Instagram
// and coming back, instead of only showing while the tab is in focus.
export default function InstagramDmButton({
  message,
  label,
  className = 'btn btn-outline',
}: {
  message: string;
  label: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleClick() {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
    } catch {
      // Clipboard API unavailable — Instagram still opens, they'll just need to type it.
    }
    window.open(instagramDmLink(), '_blank', 'noopener,noreferrer');
  }

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-start', gap: 4 }}>
      <button type="button" onClick={handleClick} className={className}>
        {copied ? 'Copied — paste it in Instagram ✓' : label}
      </button>
      <span style={{ fontSize: 11, color: 'var(--ink-soft)' }}>
        Tap, then paste into the chat that opens
      </span>
    </div>
  );
}
