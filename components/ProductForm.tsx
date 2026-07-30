'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Product, ProductMedia } from '@/lib/types';

type MediaItem = {
  url: string;
  type: 'image' | 'video';
  uploading?: boolean;
  tempId: string;
  aiEnhanced?: boolean;
};

export default function ProductForm({ product }: { product?: Product }) {
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(product?.name || '');
  const [category, setCategory] = useState(product?.category || '');
  const [material, setMaterial] = useState(product?.material || '');
  const [price, setPrice] = useState(product?.price != null ? String(product.price) : '');
  const [description, setDescription] = useState(product?.description || '');
  const [isAvailable, setIsAvailable] = useState(product?.is_available ?? true);
  const [aiEnhance, setAiEnhance] = useState(true);
  const [media, setMedia] = useState<MediaItem[]>(
    (product?.media || []).map((m: ProductMedia) => ({ url: m.url, type: m.type, tempId: m.id }))
  );
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const list = Array.from(files);

    for (const file of list) {
      const tempId = `${Date.now()}-${Math.random()}`;
      const isVideo = file.type.startsWith('video/');
      setMedia((prev) => [
        ...prev,
        { url: URL.createObjectURL(file), type: isVideo ? 'video' : 'image', uploading: true, tempId },
      ]);

      const form = new FormData();
      form.append('file', file);
      form.append('enhance', String(aiEnhance && !isVideo));

      try {
        const res = await fetch('/api/upload', { method: 'POST', body: form });
        const body = await res.json();
        if (!res.ok) throw new Error(body.error || 'Upload failed');

        setMedia((prev) =>
          prev.map((m) =>
            m.tempId === tempId
              ? { url: body.url, type: body.type, tempId, aiEnhanced: !!body.suggestions }
              : m
          )
        );

        // Prefill empty fields from the first image's AI suggestions only.
        if (body.suggestions) {
          const s = body.suggestions;
          if (!name.trim() && s.suggestedName) setName(s.suggestedName);
          if (!category.trim() && s.suggestedCategory) setCategory(s.suggestedCategory);
          if (!material.trim() && s.suggestedMaterial) setMaterial(s.suggestedMaterial);
        }
      } catch (err: any) {
        setError(err.message || 'Upload failed');
        setMedia((prev) => prev.filter((m) => m.tempId !== tempId));
      }
    }
  }

  function removeMedia(tempId: string) {
    setMedia((prev) => prev.filter((m) => m.tempId !== tempId));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!name.trim() || !category.trim()) {
      setError('Name and category are required.');
      return;
    }
    if (media.some((m) => m.uploading)) {
      setError('Please wait for uploads to finish.');
      return;
    }

    setSaving(true);
    const payload = {
      name: name.trim(),
      category: category.trim(),
      material: material.trim(),
      price: price === '' ? null : Number(price),
      description: description.trim(),
      is_available: isAvailable,
      media: media.map((m) => ({ url: m.url, type: m.type })),
    };

    const res = await fetch(product ? `/api/products/${product.id}` : '/api/products', {
      method: product ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    setSaving(false);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error || 'Something went wrong.');
      return;
    }

    router.push('/admin');
    router.refresh();
  }

  return (
    <form onSubmit={submit}>
      <div className="field">
        <label htmlFor="name">Product name</label>
        <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} />
      </div>

      <div className="field">
        <label htmlFor="category">Category</label>
        <input
          id="category"
          type="text"
          placeholder="e.g. Brass Decor, Vintage Furniture, Wall Art"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />
      </div>

      <div className="field">
        <label htmlFor="material">Material</label>
        <input
          id="material"
          type="text"
          placeholder="e.g. Solid teak wood, hand-finished"
          value={material}
          onChange={(e) => setMaterial(e.target.value)}
        />
      </div>

      <div className="field">
        <label htmlFor="price">Price (₹)</label>
        <input
          id="price"
          type="number"
          min="0"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
      </div>

      <div className="field">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="field">
        <label>
          <input
            type="checkbox"
            checked={isAvailable}
            onChange={(e) => setIsAvailable(e.target.checked)}
            style={{ marginRight: 8 }}
          />
          In stock / available
        </label>
      </div>

      <div className="field">
        <label>Photos &amp; videos</label>
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 13,
            color: 'var(--ink-soft)',
            marginBottom: 10,
          }}
        >
          <input
            type="checkbox"
            checked={aiEnhance}
            onChange={(e) => setAiEnhance(e.target.checked)}
          />
          ✨ Enhance photos with AI (auto crop &amp; light color fix, plus suggests
          name/category/material)
        </label>
        <div className="upload-drop" onClick={() => fileInput.current?.click()}>
          Tap to upload photos or a video from your phone
          <input
            ref={fileInput}
            type="file"
            accept="image/*,video/*"
            multiple
            hidden
            onChange={(e) => handleFiles(e.target.files)}
          />
        </div>

        {media.length > 0 && (
          <div className="upload-grid">
            {media.map((m) => (
              <div className="upload-thumb" key={m.tempId}>
                {m.type === 'video' ? (
                  <video src={m.url} muted />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={m.url} alt="" />
                )}
                <button type="button" onClick={() => removeMedia(m.tempId)} aria-label="Remove">
                  ×
                </button>
                {m.aiEnhanced && !m.uploading && (
                  <span
                    style={{
                      position: 'absolute',
                      bottom: 4,
                      left: 4,
                      background: 'rgba(74,46,20,0.75)',
                      color: '#fff',
                      fontSize: 9,
                      padding: '2px 5px',
                      borderRadius: 2,
                      letterSpacing: 0.02,
                    }}
                  >
                    ✨ AI
                  </span>
                )}
                {m.uploading && (
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'rgba(0,0,0,0.4)',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 11,
                    }}
                  >
                    Uploading…
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {error && <div className="error-text">{error}</div>}

      <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
        <button className="btn" type="submit" disabled={saving}>
          {saving ? 'Saving…' : product ? 'Save changes' : 'Add product'}
        </button>
        <button
          className="btn btn-outline"
          type="button"
          onClick={() => router.push('/admin')}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
