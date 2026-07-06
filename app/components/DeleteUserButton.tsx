"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { deleteUserAccount } from "@/app/account/actions";

// Delete-account button + confirmation dialog. Used on the admin users table
// (self=false, deletes another user) and on the profile page (self=true).
export default function DeleteUserButton({
  userId,
  name,
  self = false,
}: {
  userId: string;
  name?: string;
  self?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const router = useRouter();

  // Close on Escape while the dialog is open (unless mid-delete).
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !busy && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, busy]);

  async function confirmDelete() {
    setBusy(true);
    setErr(null);
    try {
      await deleteUserAccount(userId);
      if (self) {
        try { await createClient().auth.signOut(); } catch { /* ignore */ }
        window.location.href = "/";
      } else {
        setOpen(false);
        router.refresh();
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Couldn't delete. Please try again.");
      setBusy(false);
    }
  }

  return (
    <>
      <button
        type="button"
        className={self ? "btn btn-danger" : "btn btn-danger btn-sm"}
        onClick={() => setOpen(true)}
      >
        {self ? "Delete my account" : "Delete"}
      </button>

      {open && (
        <div className="filter-modal-overlay" onClick={() => !busy && setOpen(false)}>
          <div className="report-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <h3>{self ? "Delete your account?" : `Delete ${name ?? "this user"}?`}</h3>
            <p className="muted" style={{ margin: "10px 0 4px", lineHeight: 1.6 }}>
              This permanently erases {self ? "your" : "their"} account and everything tied to it — listings,
              applications, inquiries, messages, saved homes, and tenancy records. <strong>This cannot be undone.</strong>
            </p>

            {err && (
              <div className="banner" style={{ background: "var(--danger-soft)", margin: "14px 0 0", fontSize: ".88rem" }}>{err}</div>
            )}

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20 }}>
              <button type="button" className="btn btn-ghost" onClick={() => setOpen(false)} disabled={busy}>
                Cancel
              </button>
              <button type="button" className="btn btn-danger" onClick={confirmDelete} disabled={busy}>
                {busy ? <><span className="spinner" aria-hidden="true" />Deleting…</> : "Delete permanently"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
