"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  getMyCollections,
  saveToCollection,
  createCollectionAndSave,
  removeSaved,
  type CollectionCard,
} from "@/app/saved/collection-actions";

// Heart over a listing card. Clicking opens a popup to save the listing into a
// collection (or create a new one).
export default function SaveButton({ listingId, saved, next = "/rentals" }: { listingId: string; saved: boolean; next?: string }) {
  void next;
  const [isSaved, setIsSaved] = useState(saved);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cols, setCols] = useState<CollectionCard[]>([]);
  const [savedIn, setSavedIn] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function openModal(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setOpen(true);
    setLoading(true);
    try {
      const res = await getMyCollections(listingId);
      setCols(res.collections);
      setSavedIn(res.savedIn);
      setIsSaved(res.isSaved);
    } finally {
      setLoading(false);
    }
  }

  function close() {
    setOpen(false);
    setCreating(false);
    setNewName("");
  }

  async function pick(colId: string | null) {
    setBusy(true);
    try {
      await saveToCollection(listingId, colId);
      setIsSaved(true);
      close();
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Couldn't save.");
    } finally {
      setBusy(false);
    }
  }

  async function create() {
    if (!newName.trim()) return;
    setBusy(true);
    try {
      await createCollectionAndSave(newName, listingId);
      setIsSaved(true);
      close();
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Couldn't create collection.");
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    setBusy(true);
    try {
      await removeSaved(listingId);
      setIsSaved(false);
      close();
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="save-form" style={open ? { zIndex: 250 } : undefined}>
      <button
        type="button"
        className={`save-btn${isSaved ? " saved" : ""}`}
        aria-pressed={isSaved}
        aria-label={isSaved ? "Saved — edit collection" : "Save this home"}
        title={isSaved ? "Saved — click to change collection" : "Save this home"}
        onClick={openModal}
      >
        <svg viewBox="0 0 24 24" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
          <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
        </svg>
      </button>

      {open && (
        <div className="filter-modal-overlay" onClick={() => !busy && close()}>
          <div className="save-modal" onClick={(e) => { e.stopPropagation(); e.preventDefault(); }}>
            <div className="save-modal-head">
              <h3>Save to collection</h3>
              <button type="button" className="save-modal-x" onClick={close} aria-label="Close">✕</button>
            </div>

            {loading ? (
              <p className="muted" style={{ padding: "24px 0", textAlign: "center" }}>Loading your collections…</p>
            ) : (
              <div className="coll-grid">
                {cols.map((c) => (
                  <button key={c.id} type="button" className={`coll-sq${savedIn === c.id ? " active" : ""}`} disabled={busy} onClick={() => pick(c.id)}>
                    <span className="coll-thumb" style={c.cover ? { backgroundImage: `url('${c.cover}')` } : undefined}>
                      {!c.cover && (
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M3 11l9-7 9 7M5 10v10h14V10" /></svg>
                      )}
                      {savedIn === c.id && <span className="coll-check">✓</span>}
                    </span>
                    <span className="coll-name">{c.name}</span>
                    <span className="coll-count">{c.count} saved</span>
                  </button>
                ))}

                {creating ? (
                  <div className="coll-sq coll-form">
                    <input
                      autoFocus
                      className="input"
                      placeholder="Collection name"
                      value={newName}
                      maxLength={60}
                      onChange={(e) => setNewName(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") create(); if (e.key === "Escape") { setCreating(false); setNewName(""); } }}
                    />
                    <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                      <button type="button" className="btn btn-primary btn-sm" disabled={busy || !newName.trim()} onClick={create}>Create</button>
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setCreating(false); setNewName(""); }}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <button type="button" className="coll-sq coll-add" disabled={busy} onClick={() => setCreating(true)}>
                    <span className="coll-thumb coll-plus">
                      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>
                    </span>
                    <span className="coll-name">New collection</span>
                  </button>
                )}
              </div>
            )}

            {isSaved && !loading && (
              <button type="button" className="save-remove" disabled={busy} onClick={remove}>Remove from saved</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
