"use client";

import { useOptimistic, useTransition } from "react";
import { toggleSaved } from "@/app/saved/actions";

// Heart toggle rendered over a listing card. Optimistic so the fill flips
// instantly; the server action persists + revalidates counts.
export default function SaveButton({
  listingId,
  saved,
  next = "/rentals",
}: {
  listingId: string;
  saved: boolean;
  next?: string;
}) {
  const [optimistic, setOptimistic] = useOptimistic(saved);
  const [, startTransition] = useTransition();

  return (
    <form
      className="save-form"
      action={(fd) =>
        startTransition(async () => {
          setOptimistic(!optimistic);
          await toggleSaved(fd);
        })
      }
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="next" value={next} />
      <button
        type="submit"
        className={`save-btn${optimistic ? " saved" : ""}`}
        aria-pressed={optimistic}
        aria-label={optimistic ? "Remove from saved" : "Save this home"}
        title={optimistic ? "Saved — click to remove" : "Save this home"}
        onClick={(e) => e.stopPropagation()}
      >
        <svg viewBox="0 0 24 24" fill={optimistic ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
          <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
        </svg>
      </button>
    </form>
  );
}
