'use client';

import { useState } from 'react';
import type { ProductMedia } from '@/lib/types';

export default function Gallery({ media, name }: { media: ProductMedia[]; name: string }) {
  const [active, setActive] = useState(0);
  const current = media[active];

  return (
    <div>
      <div className="pd-gallery__main">
        {current ? (
          current.type === 'video' ? (
            <video src={current.url} controls playsInline />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={current.url} alt={name} />
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
    </div>
  );
}
