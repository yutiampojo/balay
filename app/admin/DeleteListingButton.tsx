"use client";

import { adminDeleteListing } from "./actions";

export default function DeleteListingButton({ listingId, title }: { listingId: string; title: string }) {
  return (
    <form
      action={adminDeleteListing}
      onSubmit={(e) => {
        if (!confirm(`Delete "${title}"? This permanently removes the listing, its photos, and any applications or inquiries. This can't be undone.`)) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <button className="btn btn-danger btn-sm" type="submit">Delete</button>
    </form>
  );
}
