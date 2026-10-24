'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { instagramDmLink } from '@/lib/instagram';
import { WHATSAPP_NUMBER } from '@/lib/whatsapp';

// Temporary "we're upgrading" notice shown at the top of every public page.
//
// Deliberately hard-coded (not a database setting): the whole reason for this notice is that
// the database may be unavailable, and a banner stored in the database would vanish exactly
// when it's needed. It hides itself after the end of 1 Nov 2026 (India time). After that this
// component and its line in app/layout.tsx can simply be deleted.
const HIDE_AFTER = Date.parse('2026-11-01T18:30:00Z'); // = 2 Nov 2026, 00:00 IST

export default function SiteNotice() {
  const pathname = usePathname();
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    if (Date.now() > HIDE_AFTER) setExpired(true);
  }, []);

  if (expired || pathname?.startsWith('/admin')) return null;

  return (
    <div className="site-notice" role="status">
      <strong>We&apos;re upgrading the Agavai website — back to normal by 1 November.</strong>{' '}
      Our team is working on it. In the meantime, please send your orders and questions to us on{' '}
      <a href={instagramDmLink()} target="_blank" rel="noopener noreferrer">
        Instagram
      </a>
      {WHATSAPP_NUMBER && (
        <>
          {' '}or{' '}
          <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer">
            WhatsApp
          </a>
        </>
      )}
      {' '}— we&apos;ll be happy to help you personally.
    </div>
  );
}
