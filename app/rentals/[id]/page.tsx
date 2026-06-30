import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import SiteNav from "@/app/components/SiteNav";
import { startConversation } from "@/app/messages/actions";

export const dynamic = "force-dynamic";

const peso = (n: number) => "₱" + n.toLocaleString("en-PH");

const TYPE_LABEL: Record<string, string> = {
  ROOM: "Room", BEDSPACE: "Bedspace", STUDIO: "Studio", CONDO: "Condo",
  APARTMENT: "Apartment", HOUSE: "House", TOWNHOUSE: "Townhouse", DORMITORY: "Dormitory",
};
const FURNISH_LABEL: Record<string, string> = {
  UNFURNISHED: "Unfurnished", SEMI_FURNISHED: "Semi-furnished", FURNISHED: "Furnished",
};

export default async function ListingDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const l = await prisma.listing.findFirst({
    where: { id, listingStatus: "PUBLISHED" },
    include: {
      photos: { orderBy: { sortOrder: "asc" } },
      owner: { select: { fullName: true, verificationStatus: true } },
    },
  });

  if (!l) notFound();

  const verifiedOwner = l.owner.verificationStatus === "VERIFIED";
  const verifiedUnit = l.verificationStatus === "VERIFIED";
  const hero = l.photos[0]?.photoUrl;

  return (
    <>
      <SiteNav current="rentals" />

      <div className="wrap pagehead">
        <div className="crumbs">
          <a href="/rentals">Browse homes</a> <span>›</span> <span>{l.city}</span>
        </div>
        <h1>{l.title}</h1>
        <p style={{ marginTop: 6 }}>{TYPE_LABEL[l.propertyType]} · {l.city} · {l.barangay}</p>
      </div>

      {/* hero image */}
      <div className="wrap" style={{ marginBottom: 28 }}>
        <div
          style={{
            height: 420, borderRadius: "var(--r-card)", overflow: "hidden",
            background: "linear-gradient(135deg,#2E6B53,#13322A)",
            ...(hero ? { backgroundImage: `url('/${hero}')`, backgroundSize: "cover", backgroundPosition: "center" } : {}),
          }}
        />
      </div>

      <main className="wrap">
        <div className="split">
          {/* left: details */}
          <div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
              {verifiedOwner && <span className="vbadge"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6 9 17l-5-5" /></svg>Verified owner</span>}
              {verifiedUnit && <span className="vbadge"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6 9 17l-5-5" /></svg>Verified unit</span>}
              {!verifiedOwner && !verifiedUnit && <span className="vbadge plain">Documents pending</span>}
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
              <a className="btn btn-primary btn-block" href={`/rentals/${l.id}/apply`} style={{ marginBottom: 10 }}>Apply to rent</a>
              <form action={startConversation}>
                <input type="hidden" name="listingId" value={l.id} />
                <button className="btn btn-ghost btn-block" type="submit">Message {l.owner.fullName.split(" ")[0]}</button>
              </form>
              <p className="muted" style={{ fontSize: ".8rem", marginTop: 14, textAlign: "center" }}>
                Listed by {l.owner.fullName}{verifiedOwner ? " · Verified" : ""}
              </p>
            </div>

            <div className="banner gold" style={{ marginTop: 16 }}>
              <div className="grow" style={{ fontSize: ".86rem" }}>
                Never pay or transfer money off-platform before viewing and verifying the unit.
              </div>
            </div>
          </aside>
        </div>
      </main>

      <footer>
        <div className="wrap"><div className="foot-base"><span>© 2026 Balay</span><a href="/rentals">Browse homes</a></div></div>
      </footer>
    </>
  );
}
