"use client";

import { useCallback, useEffect, useState } from "react";

export default function PhotoGallery({ photos, title }: { photos: string[]; title: string }) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  const show = (i: number) => { setIndex(i); setOpen(true); };
  const close = useCallback(() => setOpen(false), []);
  const prev = useCallback(() => setIndex((i) => (i - 1 + photos.length) % photos.length), [photos.length]);
  const next = useCallback(() => setIndex((i) => (i + 1) % photos.length), [photos.length]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, close, prev, next]);

  if (photos.length === 0) return null;

  return (
    <>
      {/* hero */}
      <button type="button" className="gallery-hero" style={{ backgroundImage: `url('${photos[0]}')` }} onClick={() => show(0)} aria-label="Open photo 1">
        <span className="gallery-count">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" /></svg>
          {photos.length} photo{photos.length === 1 ? "" : "s"}
        </span>
      </button>

      {/* thumbnails */}
      {photos.length > 1 && (
        <div className="gallery-strip" style={{ marginTop: 10 }}>
          {photos.map((src, i) => (
            <button type="button" key={src} className="gallery-thumb" style={{ backgroundImage: `url('${src}')` }} onClick={() => show(i)} aria-label={`Open photo ${i + 1}`} />
          ))}
        </div>
      )}

      {/* lightbox */}
      {open && (
        <div className="lightbox" onClick={close} role="dialog" aria-modal="true">
          <button type="button" className="lb-close" onClick={close} aria-label="Close">✕</button>
          {photos.length > 1 && (
            <button type="button" className="lb-nav lb-prev" onClick={(e) => { e.stopPropagation(); prev(); }} aria-label="Previous">‹</button>
          )}
          <figure className="lb-figure" onClick={(e) => e.stopPropagation()}>
            <img src={photos[index]} alt={`${title} — photo ${index + 1}`} />
            <figcaption className="lb-counter">{index + 1} / {photos.length}</figcaption>
          </figure>
          {photos.length > 1 && (
            <button type="button" className="lb-nav lb-next" onClick={(e) => { e.stopPropagation(); next(); }} aria-label="Next">›</button>
          )}
        </div>
      )}
    </>
  );
}
