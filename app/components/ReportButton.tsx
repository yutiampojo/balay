"use client";

import { useActionState, useEffect, useState } from "react";
import { submitReport, type ReportState } from "@/app/report/actions";

// Reason options per target. Values match the Prisma ReportReason enum.
const LISTING_REASONS: [string, string][] = [
  ["FAKE_LISTING", "Fake or fraudulent listing"],
  ["MISLEADING_PHOTOS", "Misleading photos"],
  ["WRONG_PRICE", "Wrong or misleading price"],
  ["PROPERTY_UNAVAILABLE", "Property isn’t actually available"],
  ["ILLEGAL_LISTING", "Illegal or prohibited listing"],
  ["SCAM", "Scam / asked to pay off-platform"],
];
const USER_REASONS: [string, string][] = [
  ["HARASSMENT", "Harassment or abusive messages"],
  ["SCAM", "Scam / fraud attempt"],
  ["OWNER_UNREACHABLE", "Unresponsive / won’t follow through"],
];

const initial: ReportState = { status: "idle" };

export default function ReportButton({
  kind,
  listingId,
  reportedUserId,
  targetLabel,
  className = "report-link",
}: {
  kind: "listing" | "user";
  listingId?: string;
  reportedUserId?: string;
  targetLabel: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(submitReport, initial);
  const reasons = kind === "listing" ? LISTING_REASONS : USER_REASONS;

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      <button type="button" className={className} onClick={() => setOpen(true)}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V4s-1 1-4 1-5-2-8-2-4 1-4 1z" /><line x1="4" y1="22" x2="4" y2="4" /></svg>
        Report {kind === "listing" ? "this listing" : targetLabel}
      </button>

      {open && (
        <div className="report-overlay" onClick={() => setOpen(false)}>
          <div className="report-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <button className="report-x" aria-label="Close" onClick={() => setOpen(false)}>✕</button>

            {state.status === "ok" ? (
              <div className="report-done">
                <div className="report-check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6 9 17l-5-5" /></svg></div>
                <h3>Report received</h3>
                <p className="muted">{state.message}</p>
                <button className="btn btn-primary" onClick={() => setOpen(false)}>Done</button>
              </div>
            ) : (
              <form action={formAction}>
                <h3>Report {kind === "listing" ? "listing" : targetLabel}</h3>
                <p className="muted report-sub">
                  {kind === "listing" ? "Tell us what’s wrong with this listing." : "Tell us what happened."} Reports are confidential.
                </p>

                {listingId && <input type="hidden" name="listingId" value={listingId} />}
                {reportedUserId && <input type="hidden" name="reportedUserId" value={reportedUserId} />}

                <fieldset className="report-reasons">
                  {reasons.map(([value, label], i) => (
                    <label key={value} className="report-reason">
                      <input type="radio" name="reason" value={value} defaultChecked={i === 0} />
                      <span>{label}</span>
                    </label>
                  ))}
                </fieldset>

                <label className="report-field">
                  <span>Add details (optional)</span>
                  <textarea name="description" rows={3} maxLength={1000} placeholder="What should our team know?" />
                </label>

                {state.status === "error" && <p className="report-err">{state.message}</p>}

                <div className="report-actions">
                  <button type="button" className="btn btn-ghost" onClick={() => setOpen(false)}>Cancel</button>
                  <button type="submit" className="btn btn-danger" disabled={pending}>{pending ? "Submitting…" : "Submit report"}</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
