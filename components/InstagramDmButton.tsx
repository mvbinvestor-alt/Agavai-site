'use client';

import { useState } from 'react';
import { instagramDmLink } from '@/lib/instagram';

// Instagram's DM link has no "prefilled text" option the way wa.me does, so we
// copy the message to the clipboard right before opening the DM — the
// customer just pastes it in instead of typing their order from scratch.
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
      setTimeout(() => setCopied(false), 4000);
    } catch {
      // Clipboard API unavailable — Instagram still opens, they'll just need to type it.
    }
    window.open(instagramDmLink(), '_blank', 'noopener,noreferrer');
  }

  return (
    <button type="button" onClick={handleClick} className={className}>
      {copied ? 'Message copied — paste it in Instagram ✓' : label}
    </button>
  );
}
