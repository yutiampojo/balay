"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteCollection } from "./collection-actions";

type Props = { href: string; name: string; count: number; cover: string | null; collectionId?: string };

export default function CollectionCard({ href, name, count, cover, collectionId }: Props) {
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function doDelete() {
    if (!collectionId) return;
    setBusy(true);
    try {
      await deleteCollection(collectionId);
      setConfirm(false);
      router.refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Couldn't delete the collection.");
      setBusy(false);
    }
  }

  return (
    <div className="wishlist-card">
      <a className="wishlist-cover" href={href} style={cover ? { backgroundImage: `url('${cover}')` } : undefined}>
        {!cover && <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M3 11l9-7 9 7M5 10v10h14V10" /></svg>}
      </a>

      {collectionId && (
        <button
          type="button"
          className="wishlist-del"
          aria-label={`Delete ${name}`}
          title="Delete collection"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setConfirm(true); }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M6 6l12 12M18 6L6 18" /></svg>
        </button>
      )}

      <a className="wishlist-meta" href={href}>
        <strong>{name}</strong>
        <span className="muted">{count} saved</span>
      </a>

      {confirm && (
        <div className="filter-modal-overlay" onClick={() => !busy && setConfirm(false)}>
          <div className="report-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <h3>Delete “{name}”?</h3>
            <p className="muted" style={{ margin: "10px 0 4px", lineHeight: 1.6 }}>
              This removes the collection{count > 0 ? ` and the ${count} home${count === 1 ? "" : "s"} saved in it` : ""}. This can&apos;t be undone.
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20 }}>
              <button type="button" className="btn btn-ghost" onClick={() => setConfirm(false)} disabled={busy}>Cancel</button>
              <button type="button" className="btn btn-danger" onClick={doDelete} disabled={busy}>
                {busy ? <><span className="spinner" aria-hidden="true" />Deleting…</> : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
