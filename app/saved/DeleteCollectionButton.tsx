"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteCollection } from "./collection-actions";

export default function DeleteCollectionButton({ collectionId, name, count }: { collectionId: string; name: string; count: number }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function confirm() {
    setBusy(true);
    try {
      await deleteCollection(collectionId);
      router.push("/saved");
      router.refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Couldn't delete the collection.");
      setBusy(false);
    }
  }

  return (
    <>
      <button type="button" className="btn btn-danger btn-sm" onClick={() => setOpen(true)}>Delete collection</button>

      {open && (
        <div className="filter-modal-overlay" onClick={() => !busy && setOpen(false)}>
          <div className="report-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <h3>Delete “{name}”?</h3>
            <p className="muted" style={{ margin: "10px 0 4px", lineHeight: 1.6 }}>
              This removes the collection{count > 0 ? ` and the ${count} home${count === 1 ? "" : "s"} saved in it` : ""}. This can&apos;t be undone.
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20 }}>
              <button type="button" className="btn btn-ghost" onClick={() => setOpen(false)} disabled={busy}>Cancel</button>
              <button type="button" className="btn btn-danger" onClick={confirm} disabled={busy}>
                {busy ? <><span className="spinner" aria-hidden="true" />Deleting…</> : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
