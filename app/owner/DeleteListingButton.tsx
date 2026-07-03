"use client";

import { deleteListing } from "./actions";

export default function DeleteListingButton({ listingId, title }: { listingId: string; title: string }) {
  return (
    <form
      action={deleteListing}
      onSubmit={(e) => {
        if (!confirm(`Remove "${title}"? This permanently deletes the listing, its photos, and any applications or inquiries. This can't be undone.`)) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <button className="btn btn-danger btn-sm" type="submit">Remove</button>
    </form>
  );
}
