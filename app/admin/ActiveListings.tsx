"use client";

import { useState } from "react";
import DeleteListingButton from "./DeleteListingButton";

type Row = {
  id: string;
  title: string;
  city: string;
  barangay: string;
  ownerName: string;
  rent: number;
  lease: number;
};

const peso = (n: number) => "₱" + n.toLocaleString("en-PH");

export default function ActiveListings({ listings }: { listings: Row[] }) {
  const [q, setQ] = useState("");
  const f = q.trim().toLowerCase();
  const rows = f
    ? listings.filter(
        (l) =>
          l.title.toLowerCase().includes(f) ||
          l.ownerName.toLowerCase().includes(f) ||
          l.city.toLowerCase().includes(f) ||
          l.barangay.toLowerCase().includes(f)
      )
    : listings;

  return (
    <div className="card card-pad" style={{ marginBottom: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 14 }}>
        <h3>Active listings <span className="muted" style={{ fontWeight: 400, fontSize: ".9rem" }}>({rows.length})</span></h3>
        <div className="chat-search" style={{ margin: 0, maxWidth: 320, flex: "1 1 240px" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
          <input type="search" aria-label="Search listings" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by property or owner…" />
        </div>
      </div>

      {listings.length === 0 ? (
        <p className="muted">No published listings yet.</p>
      ) : rows.length === 0 ? (
        <p className="muted">No listings match “{q}”.</p>
      ) : (
        <div className="table-scroll"><table className="table">
          <thead><tr><th>Listing</th><th>Keyholder</th><th>Rent</th><th>Lease</th><th>Action</th></tr></thead>
          <tbody>
            {rows.map((l) => (
              <tr key={l.id}>
                <td><a href={`/rentals/${l.id}`}><strong style={{ color: "var(--leaf)" }}>{l.title}</strong></a><div className="muted" style={{ fontSize: ".8rem" }}>{l.city} · {l.barangay}</div></td>
                <td>{l.ownerName}</td>
                <td className="tabular">{peso(l.rent)}</td>
                <td>{l.lease} mo</td>
                <td className="actions">
                  <a className="btn btn-ghost btn-sm" href={`/rentals/${l.id}`}>View</a>
                  <DeleteListingButton listingId={l.id} title={l.title} />
                </td>
              </tr>
            ))}
          </tbody>
        </table></div>
      )}
    </div>
  );
}
