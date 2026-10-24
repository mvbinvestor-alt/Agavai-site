'use client';

import { useState } from 'react';
import type { ProductMedia } from '@/lib/types';
import Lightbox from './Lightbox';
import SmartImg from './SmartImg';
import { IMG_WIDTHS } from '@/lib/imageUrl';

export default function Gallery({ media, name }: { media: ProductMedia[]; name: string }) {
  const [active, setActive] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const current = media[active];

  return (
    <div>
      <div className="pd-gallery__main">
        {current ? (
          current.type === 'video' ? (
            <video key={current.id} src={current.url} controls playsInline preload="metadata" />
          ) : (
            <button
              type="button"
              className="pd-gallery__zoom"
              onClick={() => setLightboxOpen(true)}
              aria-label="View full-size photo"
            >
              <SmartImg
                key={current.id}
                src={current.url}
                alt={name}
                widths={[IMG_WIDTHS.cardLarge, IMG_WIDTHS.detail, IMG_WIDTHS.detailLarge]}
                sizes="(max-width: 860px) 100vw, 600px"
                priority={active === 0}
              />
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
                <span className="pd-gallery__videothumb" aria-label="Video">▶</span>
              ) : (
                <SmartImg src={m.url} alt="" widths={[IMG_WIDTHS.tiny]} sizes="62px" loading="lazy" />
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
