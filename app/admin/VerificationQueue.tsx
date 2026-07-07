"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getVerificationDocUrl, approveVerification, rejectVerification } from "@/app/verification/actions";

type Pending = { id: string; fullName: string; email: string; role: string; hasDoc: boolean; submittedAt: string | null };

export default function VerificationQueue({ pending }: { pending: Pending[] }) {
  const [busy, setBusy] = useState<string | null>(null);
  const router = useRouter();

  async function viewId(userId: string) {
    setBusy(`${userId}:view`);
    try {
      const url = await getVerificationDocUrl(userId);
      if (url) window.open(url, "_blank", "noopener,noreferrer");
      else alert("Couldn't load the ID. Check that the storage bucket and service-role key are set up.");
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to load ID.");
    } finally {
      setBusy(null);
    }
  }

  async function decide(userId: string, action: "approve" | "reject") {
    setBusy(`${userId}:${action}`);
    try {
      if (action === "approve") await approveVerification(userId);
      else await rejectVerification(userId);
      router.refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Action failed.");
      setBusy(null);
    }
  }

  if (pending.length === 0) return <p className="muted">No identity verifications awaiting review. 🎉</p>;

  return (
    <div className="table-scroll"><table className="table">
      <thead><tr><th>User</th><th>Submitted</th><th>ID</th><th>Decision</th></tr></thead>
      <tbody>
        {pending.map((u) => (
          <tr key={u.id}>
            <td><strong>{u.fullName}</strong><div className="muted" style={{ fontSize: ".8rem" }}>{u.email}</div></td>
            <td className="muted" style={{ fontSize: ".85rem" }}>{u.submittedAt ?? "—"}</td>
            <td>
              {u.hasDoc ? (
                <button className="btn btn-ghost btn-sm" disabled={busy === `${u.id}:view`} onClick={() => viewId(u.id)}>
                  {busy === `${u.id}:view` ? "Opening…" : "View ID"}
                </button>
              ) : (
                <span className="muted" style={{ fontSize: ".8rem" }}>No ID on file</span>
              )}
            </td>
            <td>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button className="btn btn-primary btn-sm" disabled={!!busy} onClick={() => decide(u.id, "approve")}>
                  {busy === `${u.id}:approve` ? "…" : "Approve"}
                </button>
                <button className="btn btn-danger btn-sm" disabled={!!busy} onClick={() => decide(u.id, "reject")}>
                  {busy === `${u.id}:reject` ? "…" : "Reject"}
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table></div>
  );
}
