'use client';

import { useEffect, useRef, useState } from 'react';
import type { ProductMedia } from '@/lib/types';

const SWIPE_THRESHOLD = 50; // px — a deliberate swipe, not an accidental drag

export default function Lightbox({
  media,
  initialIndex,
  name,
  onClose,
}: {
  media: ProductMedia[];
  initialIndex: number;
  name: string;
  onClose: (lastIndex: number) => void;
}) {
  const [index, setIndex] = useState(initialIndex);
  const touchStartX = useRef<number | null>(null);

  const hasMultiple = media.length > 1;
  const current = media[index];

  function goPrev() {
    setIndex((i) => (i - 1 + media.length) % media.length);
  }

  function goNext() {
    setIndex((i) => (i + 1) % media.length);
  }

  // Lock page scroll behind the overlay, restore on close.
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  // Keyboard: Escape closes, arrows flip between photos (handy on desktop).
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose(index);
      else if (e.key === 'ArrowLeft' && hasMultiple) goPrev();
      else if (e.key === 'ArrowRight' && hasMultiple) goNext();
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, hasMultiple]);

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current == null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (!hasMultiple) return;
    if (delta > SWIPE_THRESHOLD) goPrev();
    else if (delta < -SWIPE_THRESHOLD) goNext();
  }

  if (!current) return null;

  return (
    <div
      className="lightbox-overlay"
      onClick={() => onClose(index)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      role="dialog"
      aria-modal="true"
      aria-label={`${name} — full-size photo`}
    >
      <button
        type="button"
        className="lightbox-close"
        onClick={(e) => {
          e.stopPropagation();
          onClose(index);
        }}
        aria-label="Close"
      >
        ✕
      </button>

      {hasMultiple && (
        <button
          type="button"
          className="lightbox-arrow lightbox-arrow--prev"
          onClick={(e) => {
            e.stopPropagation();
            goPrev();
          }}
          aria-label="Previous photo"
        >
          ‹
        </button>
      )}

      <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
        {current.type === 'video' ? (
          <video src={current.url} controls autoPlay playsInline />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={current.url} alt={name} />
        )}
      </div>

      {hasMultiple && (
        <button
          type="button"
          className="lightbox-arrow lightbox-arrow--next"
          onClick={(e) => {
            e.stopPropagation();
            goNext();
          }}
          aria-label="Next photo"
        >
          ›
        </button>
      )}

      {hasMultiple && (
        <div className="lightbox-counter">
          {index + 1} / {media.length}
        </div>
      )}
    </div>
  );
}
