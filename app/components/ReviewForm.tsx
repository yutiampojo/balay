"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { submitReview } from "@/app/reviews/actions";

export default function ReviewForm({
  tenancyId,
  asTenant,
  counterpartyName,
  existing,
}: {
  tenancyId: string;
  asTenant: boolean; // true → reviewing the stay/keyholder; false → reviewing the tenant
  counterpartyName: string;
  existing: { rating: number; body: string } | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(existing?.rating ?? 0);
  const [hover, setHover] = useState(0);
  const [body, setBody] = useState(existing?.body ?? "");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const prompt = asTenant
    ? `How was your stay? Your review helps other renters.`
    : `How was ${counterpartyName} as a tenant? Your review helps other keyholders.`;

  if (!open && existing) {
    return (
      <div style={{ fontSize: ".85rem" }}>
        <StarRow value={existing.rating} />
        <button type="button" className="btn btn-ghost" style={{ marginTop: 8, padding: ".3rem .7rem", fontSize: ".8rem" }} onClick={() => setOpen(true)}>
          Edit your review
        </button>
      </div>
    );
  }

  if (!open) {
    return (
      <button type="button" className="btn btn-primary" style={{ padding: ".4rem .9rem", fontSize: ".85rem" }} onClick={() => setOpen(true)}>
        {asTenant ? "Review your stay" : "Review tenant"}
      </button>
    );
  }

  async function save() {
    if (rating < 1) { setErr("Please choose a star rating."); return; }
    setBusy(true);
    setErr(null);
    try {
      await submitReview(tenancyId, rating, body);
      setOpen(false);
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Couldn't save your review.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card card-pad" style={{ background: "var(--paper)", marginTop: 6 }}>
      <p className="muted" style={{ fontSize: ".85rem", marginBottom: 10 }}>{prompt}</p>
      <div style={{ display: "flex", gap: 4, marginBottom: 12 }} onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            aria-label={`${n} star${n === 1 ? "" : "s"}`}
            onMouseEnter={() => setHover(n)}
            onClick={() => setRating(n)}
            style={{ background: "none", border: "none", cursor: "pointer", padding: 0, lineHeight: 0 }}
          >
            <svg width="30" height="30" viewBox="0 0 24 24" fill={(hover || rating) >= n ? "#f5a623" : "var(--line, #d8dcd9)"}>
              <path d="M12 2.5l2.9 5.9 6.5.95-4.7 4.58 1.11 6.47L12 17.9l-5.81 3.06 1.11-6.47-4.7-4.58 6.5-.95L12 2.5z" />
            </svg>
          </button>
        ))}
      </div>
      <textarea
        className="textarea"
        aria-label="Review"
        rows={3}
        maxLength={2000}
        placeholder={asTenant ? "Share what the place and keyholder were like…" : "Share what this tenant was like to host…"}
        value={body}
        onChange={(e) => setBody(e.target.value)}
      />
      {err && <div className="banner" style={{ background: "var(--danger-soft)", margin: "10px 0", fontSize: ".85rem" }}>{err}</div>}
      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <button type="button" className="btn btn-primary" disabled={busy} onClick={save}>
          {busy ? "Saving…" : existing ? "Update review" : "Post review"}
        </button>
        <button type="button" className="btn btn-ghost" disabled={busy} onClick={() => setOpen(false)}>Cancel</button>
      </div>
    </div>
  );
}

function StarRow({ value }: { value: number }) {
  return (
    <span style={{ display: "inline-flex", gap: 1 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <svg key={n} width="15" height="15" viewBox="0 0 24 24" fill={value >= n ? "#f5a623" : "var(--line, #d8dcd9)"}>
          <path d="M12 2.5l2.9 5.9 6.5.95-4.7 4.58 1.11 6.47L12 17.9l-5.81 3.06 1.11-6.47-4.7-4.58 6.5-.95L12 2.5z" />
        </svg>
      ))}
    </span>
  );
}
