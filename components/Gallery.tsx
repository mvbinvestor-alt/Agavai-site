'use client';

import { useState } from 'react';
import type { ProductMedia } from '@/lib/types';
import Lightbox from './Lightbox';

export default function Gallery({ media, name }: { media: ProductMedia[]; name: string }) {
  const [active, setActive] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const current = media[active];

  return (
    <div>
      <div className="pd-gallery__main">
        {current ? (
          current.type === 'video' ? (
            <video src={current.url} controls playsInline />
          ) : (
            <button
              type="button"
              className="pd-gallery__zoom"
              onClick={() => setLightboxOpen(true)}
              aria-label="View full-size photo"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={current.url} alt={name} />
            </button>
          )
        ) : (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: 'var(--ink-soft)',
            }}
          >
            No photo yet
          </div>
        )}
      </div>

      {media.length > 1 && (
        <div className="pd-gallery__thumbs">
          {media.map((m, i) => (
            <button key={m.id} data-active={i === active} onClick={() => setActive(i)}>
              {m.type === 'video' ? (
                <video src={m.url} muted />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={m.url} alt="" />
              )}
            </button>
          ))}
        </div>
      )}

      {lightboxOpen && (
        <Lightbox
          media={media}
          initialIndex={active}
          name={name}
          onClose={(lastIndex) => {
            setActive(lastIndex);
            setLightboxOpen(false);
          }}
        />
      )}
    </div>
  );
}
