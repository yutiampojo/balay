import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { startConversation } from "@/app/messages/actions";
import { photoSrc } from "@/lib/photo";
import PhotoGallery from "@/app/components/PhotoGallery";
import ReportButton from "@/app/components/ReportButton";

export const dynamic = "force-dynamic";

const peso = (n: number) => "₱" + n.toLocaleString("en-PH");

const TYPE_LABEL: Record<string, string> = {
  ROOM: "Room", BEDSPACE: "Bedspace", STUDIO: "Studio", CONDO: "Condo",
  APARTMENT: "Apartment", HOUSE: "House", TOWNHOUSE: "Townhouse", DORMITORY: "Dormitory",
};
const FURNISH_LABEL: Record<string, string> = {
  UNFURNISHED: "Unfurnished", SEMI_FURNISHED: "Semi-furnished", FURNISHED: "Furnished",
};

// Per-listing SEO so each home has its own title/description and social preview.
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const l = await prisma.listing.findFirst({
    where: { id, listingStatus: "PUBLISHED" },
    select: {
      title: true, city: true, barangay: true, propertyType: true, monthlyRent: true,
      photos: { select: { photoUrl: true }, orderBy: { sortOrder: "asc" }, take: 1 },
    },
  });
  if (!l) return { title: "Listing not found — Balaymo" };
  const price = peso(Number(l.monthlyRent));
  const type = TYPE_LABEL[l.propertyType] ?? l.propertyType;
  const title = `${l.title} · ${price}/mo — Balaymo`;
  const description = `${type} in ${l.barangay}, ${l.city} for ${price}/month. Verified medium & long-term rental on Balaymo.`;
  const img = l.photos[0] ? photoSrc(l.photos[0].photoUrl) : undefined;
  return {
    title,
    description,
    openGraph: { title, description, type: "website", images: img ? [{ url: img }] : undefined },
    twitter: { card: img ? "summary_large_image" : "summary", title, description },
  };
}

export default async function ListingDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const l = await prisma.listing.findFirst({
    where: { id, listingStatus: "PUBLISHED" },
    include: {
      photos: { orderBy: { sortOrder: "asc" } },
      owner: { select: { fullName: true, verificationStatus: true, email: true, phoneNumber: true } },
      tenancies: { where: { status: "ACTIVE" }, select: { tenantId: true }, take: 1 },
    },
  });

  if (!l) notFound();

  const viewer = await getCurrentUser();
  const isOwnListing = viewer?.id === l.ownerId;
  const occupied = l.tenancies.length > 0;
  const isAcceptedApplicant = !!viewer && viewer.id === l.tenancies[0]?.tenantId;
  const isAdmin = viewer?.role === "ADMIN";

  // Once occupied, hide from the general public — only the owner, the accepted
  // applicant, or an admin can still view it.
  if (occupied && !(isOwnListing || isAcceptedApplicant || isAdmin)) notFound();

  const verifiedOwner = l.owner.verificationStatus === "VERIFIED";

  return (
    <>

      <div className="wrap pagehead">
        <div className="crumbs">
          <a href="/rentals">Browse homes</a> <span>›</span> <span>{l.city}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <h1>{l.title}</h1>
          {occupied && <span className="status suspended" style={{ fontSize: ".82rem" }}>Occupied</span>}
        </div>
        <p style={{ marginTop: 6 }}>{TYPE_LABEL[l.propertyType]} · {l.city} · {l.barangay}</p>
      </div>

      {/* photos */}
      <div className="wrap" style={{ marginBottom: 28 }}>
        {l.photos.length > 0 ? (
          <PhotoGallery photos={l.photos.map((p) => photoSrc(p.photoUrl))} title={l.title} />
        ) : (
          <div style={{ height: 340, borderRadius: "var(--r-card)", background: "linear-gradient(135deg,#2E6B53,#13322A)" }} />
        )}
      </div>

      <main className="wrap">
        <div className="split">
          {/* left: details */}
          <div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
              {verifiedOwner
                ? <span className="vbadge"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6 9 17l-5-5" /></svg>Verified user</span>
                : <span className="vbadge plain">Unverified user</span>}
            </div>

            <div className="card card-pad" style={{ marginBottom: 20 }}>
              <h3 style={{ marginBottom: 12 }}>About this home</h3>
              <p className="muted">{l.description}</p>
            </div>

            <div className="card card-pad" style={{ marginBottom: 20 }}>
              <h3 style={{ marginBottom: 14 }}>Details</h3>
              <div className="spec-list">
                <div className="it"><span>Property type</span><span>{TYPE_LABEL[l.propertyType]}</span></div>
                <div className="it"><span>Bedrooms</span><span>{l.bedrooms}</span></div>
                <div className="it"><span>Bathrooms</span><span>{l.bathrooms}</span></div>
                {l.floorArea && <div className="it"><span>Floor area</span><span>{Number(l.floorArea)} m²</span></div>}
                <div className="it"><span>Furnishing</span><span>{FURNISH_LABEL[l.furnishingStatus]}</span></div>
                <div className="it"><span>Min. lease</span><span>{l.minimumLeaseMonths} months</span></div>
                {l.petPolicy && <div className="it"><span>Pets</span><span>{l.petPolicy}</span></div>}
                {l.allowedOccupants && <div className="it"><span>Max occupants</span><span>{l.allowedOccupants}</span></div>}
              </div>
            </div>

            {l.amenities.length > 0 && (
              <div className="card card-pad" style={{ marginBottom: 20 }}>
                <h3 style={{ marginBottom: 12 }}>Amenities</h3>
                <div className="amenities">{l.amenities.map((a) => <span key={a}>{a}</span>)}</div>
              </div>
            )}

            {l.houseRules.length > 0 && (
              <div className="card card-pad" style={{ marginBottom: 20 }}>
                <h3 style={{ marginBottom: 12 }}>House rules</h3>
                <div className="amenities">{l.houseRules.map((r) => <span key={r}>{r}</span>)}</div>
              </div>
            )}
          </div>

          {/* right: price + actions */}
          <aside className="aside-sticky">
            <div className="card card-pad">
              <div className="price"><b className="tabular" style={{ fontSize: "1.8rem" }}>{peso(Number(l.monthlyRent))}</b><small className="muted"> /month</small></div>
              <div className="spec-list" style={{ gridTemplateColumns: "1fr", marginTop: 14, marginBottom: 16 }}>
                {l.securityDeposit && <div className="it"><span>Security deposit</span><span>{peso(Number(l.securityDeposit))}</span></div>}
                {l.advancePayment && <div className="it"><span>Advance payment</span><span>{peso(Number(l.advancePayment))}</span></div>}
                <div className="it"><span>Minimum lease</span><span>{l.minimumLeaseMonths} months</span></div>
              </div>
              {isOwnListing ? (
                <>
                  <a className="btn btn-ghost btn-block" href="/owner">Manage your listing</a>
                  <p className="muted" style={{ fontSize: ".82rem", marginTop: 10, textAlign: "center" }}>This is your listing — you can&apos;t apply to your own property.</p>
                </>
              ) : occupied ? (
                <>
                  <div className="banner" style={{ background: "var(--mist)", marginBottom: 12 }}>
                    <div className="grow" style={{ fontSize: ".9rem" }}>
                      {isAcceptedApplicant
                        ? "🎉 You've been accepted for this unit. It's now marked occupied."
                        : "This unit is now occupied and no longer accepting applications."}
                    </div>
                  </div>
                  {isAcceptedApplicant && (
                    <form action={startConversation}>
                      <input type="hidden" name="listingId" value={l.id} />
                      <button className="btn btn-ghost btn-block" type="submit">Message {l.owner.fullName.split(" ")[0]}</button>
                    </form>
                  )}
                </>
              ) : (
                <>
                  <a className="btn btn-primary btn-block" href={`/rentals/${l.id}/apply`} style={{ marginBottom: 10 }}>Apply to rent</a>
                  <form action={startConversation}>
                    <input type="hidden" name="listingId" value={l.id} />
                    <button className="btn btn-ghost btn-block" type="submit">Message {l.owner.fullName.split(" ")[0]}</button>
                  </form>
                </>
              )}
              <p className="muted" style={{ fontSize: ".8rem", marginTop: 14, textAlign: "center" }}>
                Listed by {l.owner.fullName}{verifiedOwner ? " · Verified user" : ""}
              </p>

              <details className="contact-reveal">
                <summary>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                  Contact keyholder
                </summary>
                <div className="contact-info">
                  {viewer ? (
                    <>
                      <a href={`mailto:${l.owner.email}`} className="contact-row">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-10 6L2 7" /></svg>
                        {l.owner.email}
                      </a>
                      {l.owner.phoneNumber ? (
                        <a href={`tel:${l.owner.phoneNumber}`} className="contact-row">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                          {l.owner.phoneNumber}
                        </a>
                      ) : (
                        <div className="contact-row muted" style={{ cursor: "default" }}>No phone number on file</div>
                      )}
                    </>
                  ) : (
                    <p className="muted" style={{ fontSize: ".85rem", padding: "4px 2px" }}>
                      Please <a href={`/login?next=/rentals/${l.id}`} style={{ color: "var(--leaf)", fontWeight: 600 }}>log in</a> to view contact details.
                    </p>
                  )}
                  <p className="muted" style={{ fontSize: ".74rem", marginTop: 8 }}>Keep conversations on Balaymo when you can. Never pay before viewing and verifying the unit.</p>
                </div>
              </details>
            </div>

            <div className="banner gold" style={{ marginTop: 16 }}>
              <div className="grow" style={{ fontSize: ".86rem" }}>
                Never pay or transfer money off-platform before viewing and verifying the unit.
              </div>
            </div>

            {viewer && !isOwnListing && (
              <div className="report-wrap">
                <ReportButton kind="listing" listingId={l.id} targetLabel={l.title} />
              </div>
            )}
          </aside>
        </div>
      </main>

      <footer>
        <div className="wrap"><div className="foot-base"><span>© 2026 Balaymo</span><a href="/rentals">Browse homes</a></div></div>
      </footer>
    </>
  );
}
