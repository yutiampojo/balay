"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getMyCollections,
  saveToCollection,
  createCollectionAndSave,
  removeSaved,
  type CollectionCard,
} from "@/app/saved/collection-actions";

const MAX = 50;

// Heart over a listing card. Clicking opens a popup to save the listing into a
// collection (or create a new one), then shows a bottom-left "Saved to …" toast.
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
  const [toast, setToast] = useState<string | null>(null);
  const router = useRouter();

  // Auto-dismiss the toast.
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3800);
    return () => clearTimeout(t);
  }, [toast]);

  async function load() {
    setOpen(true);
    setCreating(false);
    setNewName("");
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

  function openFromHeart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setToast(null);
    load();
  }

  function close() {
    setOpen(false);
    setCreating(false);
    setNewName("");
  }

  async function pick(colId: string | null) {
    const name = colId ? cols.find((c) => c.id === colId)?.name ?? "collection" : "Unsorted";
    setBusy(true);
    try {
      await saveToCollection(listingId, colId);
      setIsSaved(true);
      close();
      setToast(name);
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Couldn't save.");
    } finally {
      setBusy(false);
    }
  }

  async function create() {
    const name = newName.trim();
    if (!name) return;
    setBusy(true);
    try {
      await createCollectionAndSave(name, listingId);
      setIsSaved(true);
      close();
      setToast(name);
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
    <div className="save-form" style={open || toast ? { zIndex: 300 } : undefined}>
      <button
        type="button"
        className={`save-btn${isSaved ? " saved" : ""}`}
        aria-pressed={isSaved}
        aria-label={isSaved ? "Saved — edit collection" : "Save this home"}
        title={isSaved ? "Saved — click to change collection" : "Save this home"}
        onClick={openFromHeart}
      >
        <svg viewBox="0 0 24 24" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
          <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
        </svg>
      </button>

      {open && (
        <div className="filter-modal-overlay" onClick={() => !busy && close()}>
          <div className="save-modal" onClick={(e) => { e.stopPropagation(); e.preventDefault(); }}>
            {creating ? (
              <>
                <div className="save-modal-head">
                  <button type="button" className="save-modal-back" onClick={() => { setCreating(false); setNewName(""); }} aria-label="Back">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
                  </button>
                  <h3>New collection</h3>
                  <button type="button" className="save-modal-x" onClick={close} aria-label="Close">✕</button>
                </div>

                <div className="create-coll">
                  <label className="field-group">
                    <span>Name</span>
                    <input
                      autoFocus
                      className="input"
                      placeholder="e.g. Cebu favorites"
                      value={newName}
                      maxLength={MAX}
                      onChange={(e) => setNewName(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") create(); }}
                    />
                  </label>
                  <div className="muted" style={{ fontSize: ".8rem", marginTop: 6 }}>{newName.length}/{MAX} characters</div>
                </div>

                <div className="create-coll-foot">
                  <button type="button" className="btn btn-ghost" onClick={() => { setCreating(false); setNewName(""); }}>Cancel</button>
                  <button type="button" className="btn btn-primary" disabled={busy || !newName.trim()} onClick={create}>
                    {busy ? <><span className="spinner" aria-hidden="true" />Creating…</> : "Create"}
                  </button>
                </div>
              </>
            ) : (
              <>
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
                          {!c.cover && <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M3 11l9-7 9 7M5 10v10h14V10" /></svg>}
                          {savedIn === c.id && <span className="coll-check">✓</span>}
                        </span>
                        <span className="coll-name">{c.name}</span>
                        <span className="coll-count">{c.count} saved</span>
                      </button>
                    ))}

                    <button type="button" className="coll-sq coll-add" disabled={busy} onClick={() => setCreating(true)}>
                      <span className="coll-thumb coll-plus">
                        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>
                      </span>
                      <span className="coll-name">New collection</span>
                    </button>
                  </div>
                )}

                {isSaved && !loading && (
                  <button type="button" className="save-remove" disabled={busy} onClick={remove}>Remove from saved</button>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {toast && (
        <div className="save-toast" role="status">
          <span className="st-check"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6 9 17l-5-5" /></svg></span>
          <span className="st-text">Saved to <strong>{toast}</strong></span>
          <button type="button" className="st-change" onClick={() => { setToast(null); load(); }}>Change</button>
        </div>
      )}
    </div>
  );
}
