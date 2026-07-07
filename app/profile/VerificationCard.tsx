"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { submitVerification } from "@/app/verification/actions";

const BUCKET = "verification-docs";

export default function VerificationCard({ status, userId }: { status: string; userId: string }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const router = useRouter();

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) { setErr("That file is over 8MB — please pick a smaller one."); return; }
    setBusy(true);
    setErr(null);
    try {
      const supabase = createClient();
      const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
      const path = `${userId}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from(BUCKET).upload(path, file, { upsert: false });
      if (error) throw new Error(error.message);
      await submitVerification(path);
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Upload failed — please try again.");
      setBusy(false);
    }
  }

  const badge =
    status === "VERIFIED" ? { cls: "ok", label: "Verified" }
    : status === "PENDING" ? { cls: "pending", label: "Under review" }
    : status === "REJECTED" ? { cls: "rejected", label: "Not approved" }
    : { cls: "draft", label: "Not verified" };

  return (
    <div className="card card-pad" style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 8 }}>
        <h3>Identity verification</h3>
        <span className={`status ${badge.cls}`}>{badge.label}</span>
      </div>

      {status === "VERIFIED" ? (
        <p className="muted">Your identity is verified. The verified badge now shows on your profile and listings.</p>
      ) : status === "PENDING" ? (
        <p className="muted" style={{ lineHeight: 1.6 }}>
          We&apos;re reviewing your government ID. An admin will approve it shortly — your status updates automatically once they do.
        </p>
      ) : (
        <>
          <p className="muted" style={{ marginBottom: 6, lineHeight: 1.6 }}>
            {status === "REJECTED"
              ? "Your previous submission wasn't approved. Please upload a clear, full photo of a valid government-issued ID and we'll review it again."
              : "Upload a clear photo of a valid government-issued ID (passport, driver's license, UMID, PhilID, etc.). An admin reviews it before you're verified."}
          </p>
          <p className="hint" style={{ marginBottom: 14 }}>
            Your ID is stored privately and is only visible to Balaymo admins for review. JPG or PNG, up to 8MB.
          </p>
          {err && <div className="banner" style={{ background: "var(--danger-soft)", marginBottom: 12, fontSize: ".88rem" }}>{err}</div>}
          <label className="btn btn-primary" style={{ cursor: busy ? "default" : "pointer" }}>
            {busy ? <><span className="spinner" aria-hidden="true" />Uploading…</> : "Upload government ID"}
            <input type="file" accept="image/*" hidden disabled={busy} onChange={onFile} />
          </label>
        </>
      )}
    </div>
  );
}
