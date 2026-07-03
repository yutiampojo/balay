import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { updatePricing } from "./actions";

export const dynamic = "force-dynamic";

const cap = (s: string) => s.charAt(0) + s.slice(1).toLowerCase();

export default async function EditListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=/owner/listings/${id}/edit`);

  const listing = await prisma.listing.findUnique({ where: { id } });
  if (!listing) notFound();
  if (listing.ownerId !== user.id) redirect("/owner"); // only the owner can edit

  return (
    <>
      <div className="wrap pagehead">
        <div className="crumbs"><a href="/owner">Hosting</a> <span>›</span> <span>Edit pricing</span></div>
        <h1>Edit pricing</h1>
      </div>

      <main className="wrap-narrow" style={{ padding: "8px 24px 56px" }}>
        <div className="card card-pad" style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 24 }}>
          <div className="grow">
            <strong>{listing.title}</strong>
            <div className="muted" style={{ fontSize: ".85rem" }}>{listing.city} · {listing.barangay}</div>
          </div>
          <span className={`status ${listing.listingStatus === "PUBLISHED" ? "ok" : "pending"}`}>{cap(listing.listingStatus.replace(/_/g, " "))}</span>
        </div>

        <form action={updatePricing} className="card card-pad">
          <input type="hidden" name="listingId" value={listing.id} />
          <div className="form-section" style={{ marginBottom: 0 }}>
            <h3>Pricing</h3>
            <p className="hint">You can update your pricing anytime. Other details are locked once a listing is live — remove and re-create the listing to change them.</p>
            <div className="grid-3">
              <div className="field-group"><label>Monthly rent (₱)</label><input className="input" type="number" name="monthlyRent" defaultValue={Number(listing.monthlyRent)} required /></div>
              <div className="field-group"><label>Security deposit (₱)</label><input className="input" type="number" name="securityDeposit" defaultValue={listing.securityDeposit ? Number(listing.securityDeposit) : ""} /></div>
              <div className="field-group"><label>Advance (₱)</label><input className="input" type="number" name="advancePayment" defaultValue={listing.advancePayment ? Number(listing.advancePayment) : ""} /></div>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 22 }}>
            <a className="btn btn-ghost" href="/owner">Cancel</a>
            <button className="btn btn-primary btn-lg" type="submit">Save pricing</button>
          </div>
        </form>
      </main>
    </>
  );
}
