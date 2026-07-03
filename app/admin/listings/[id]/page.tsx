import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { moderateListing } from "@/app/admin/actions";
import { photoSrc } from "@/lib/photo";
import DeleteListingButton from "@/app/admin/DeleteListingButton";
import PhotoGallery from "@/app/components/PhotoGallery";

export const dynamic = "force-dynamic";

const peso = (n: number) => "₱" + n.toLocaleString("en-PH");
const cap = (s: string) => s.charAt(0) + s.slice(1).toLowerCase();
const TYPE_LABEL: Record<string, string> = {
  ROOM: "Room", BEDSPACE: "Bedspace", STUDIO: "Studio", CONDO: "Condo",
  APARTMENT: "Apartment", HOUSE: "House", TOWNHOUSE: "Townhouse", DORMITORY: "Dormitory",
};

export default async function AdminListingReview({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin");
  if (user.role !== "ADMIN") redirect("/dashboard");

  const l = await prisma.listing.findUnique({
    where: { id },
    include: {
      photos: { orderBy: { sortOrder: "asc" } },
      owner: { select: { fullName: true, email: true, verificationStatus: true } },
    },
  });
  if (!l) notFound();

  const statusClass = l.listingStatus === "PUBLISHED" ? "ok" : l.listingStatus === "REJECTED" ? "rejected" : "pending";

  return (
    <>
      <div className="wrap pagehead">
        <div className="crumbs"><a href="/admin">Admin</a> <span>›</span> <span>Review listing</span></div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 12 }}>
          <h1>{l.title}</h1>
          <span className={`status ${statusClass}`}>{cap(l.listingStatus.replace(/_/g, " "))}</span>
        </div>
      </div>

      <main className="wrap" style={{ paddingBottom: 64 }}>
        <div className="split">
          <div>
            {l.photos.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <PhotoGallery photos={l.photos.map((p) => photoSrc(p.photoUrl))} title={l.title} />
              </div>
            )}

            <div className="card card-pad" style={{ marginBottom: 20 }}>
              <h3 style={{ marginBottom: 12 }}>Description</h3>
              <p className="muted">{l.description || "—"}</p>
            </div>

            <div className="card card-pad" style={{ marginBottom: 20 }}>
              <h3 style={{ marginBottom: 14 }}>Details</h3>
              <div className="spec-list">
                <div className="it"><span>Property type</span><span>{TYPE_LABEL[l.propertyType]}</span></div>
                <div className="it"><span>Bedrooms</span><span>{l.bedrooms}</span></div>
                <div className="it"><span>Bathrooms</span><span>{l.bathrooms}</span></div>
                <div className="it"><span>Floor area</span><span>{l.floorArea ? `${Number(l.floorArea)} m²` : "—"}</span></div>
                <div className="it"><span>Furnishing</span><span>{cap(l.furnishingStatus.replace(/_/g, " "))}</span></div>
                <div className="it"><span>Min. lease</span><span>{l.minimumLeaseMonths} months</span></div>
                <div className="it"><span>Pets</span><span>{l.petPolicy || "—"}</span></div>
                <div className="it"><span>Available from</span><span>{l.availableFrom ? new Date(l.availableFrom).toLocaleDateString("en-PH") : "—"}</span></div>
              </div>
            </div>

            {l.amenities.length > 0 && (
              <div className="card card-pad" style={{ marginBottom: 20 }}>
                <h3 style={{ marginBottom: 12 }}>Amenities</h3>
                <div className="amenities">{l.amenities.map((a) => <span key={a}>{a}</span>)}</div>
              </div>
            )}
            {l.houseRules.length > 0 && (
              <div className="card card-pad">
                <h3 style={{ marginBottom: 12 }}>House rules</h3>
                <div className="amenities">{l.houseRules.map((r) => <span key={r}>{r}</span>)}</div>
              </div>
            )}
          </div>

          <aside className="aside-sticky">
            <div className="card card-pad">
              <div className="price"><b className="tabular" style={{ fontSize: "1.6rem" }}>{peso(Number(l.monthlyRent))}</b><small className="muted"> /month</small></div>
              <div className="spec-list" style={{ gridTemplateColumns: "1fr", marginTop: 14, marginBottom: 16 }}>
                {l.securityDeposit && <div className="it"><span>Deposit</span><span>{peso(Number(l.securityDeposit))}</span></div>}
                {l.advancePayment && <div className="it"><span>Advance</span><span>{peso(Number(l.advancePayment))}</span></div>}
                <div className="it"><span>Location</span><span>{l.city} · {l.barangay}</span></div>
                <div className="it"><span>Full address</span><span style={{ textAlign: "right", maxWidth: 180 }}>{l.fullAddressPrivate || "—"}</span></div>
              </div>
              <div style={{ borderTop: "1px solid var(--line)", paddingTop: 14, marginBottom: 16 }}>
                <div className="eyebrow">Keyholder</div>
                <div style={{ fontWeight: 600, marginTop: 4 }}>{l.owner.fullName}</div>
                <div className="muted" style={{ fontSize: ".84rem" }}>{l.owner.email}</div>
                <span className={`status ${l.owner.verificationStatus === "VERIFIED" ? "ok" : "pending"}`} style={{ marginTop: 6 }}>{cap(l.owner.verificationStatus.replace(/_/g, " "))}</span>
              </div>

              {l.listingStatus === "PENDING_REVIEW" ? (
                <div style={{ display: "grid", gap: 10 }}>
                  <form action={moderateListing}><input type="hidden" name="listingId" value={l.id} /><input type="hidden" name="action" value="publish" /><button className="btn btn-primary btn-block" type="submit">Publish</button></form>
                  <form action={moderateListing}><input type="hidden" name="listingId" value={l.id} /><input type="hidden" name="action" value="reject" /><button className="btn btn-danger btn-block" type="submit">Reject</button></form>
                </div>
              ) : (
                <p className="muted" style={{ fontSize: ".84rem", marginBottom: 14 }}>This listing is {cap(l.listingStatus.replace(/_/g, " ")).toLowerCase()}.</p>
              )}
              <div style={{ borderTop: "1px solid var(--line)", marginTop: 14, paddingTop: 14 }}>
                <DeleteListingButton listingId={l.id} title={l.title} />
              </div>
            </div>
          </aside>
        </div>
      </main>
    </>
  );
}
