import { photoSrc } from "@/lib/photo";
import SaveButton from "@/app/components/SaveButton";

const peso = (n: number) => "₱" + n.toLocaleString("en-PH");

const TYPE_LABEL: Record<string, string> = {
  ROOM: "Room", BEDSPACE: "Bedspace", STUDIO: "Studio", CONDO: "Condo",
  APARTMENT: "Apartment", HOUSE: "House", TOWNHOUSE: "Townhouse", DORMITORY: "Dormitory",
};

export type CardListing = {
  id: string;
  title: string;
  propertyType: string;
  city: string;
  barangay: string;
  monthlyRent: number | string;
  minimumLeaseMonths: number;
  bedrooms: number;
  bathrooms: number;
  floorArea: number | string | null;
  verificationStatus: string;
  ownerVerified?: boolean;
  photos: { photoUrl: string }[];
};

export default function ListingCard({
  l,
  saved,
  savePath = "/rentals",
}: {
  l: CardListing;
  saved?: boolean; // when defined, render the save heart (with this state)
  savePath?: string; // path to revalidate after toggling
}) {
  const verified = l.ownerVerified === true;
  const photo = l.photos[0]?.photoUrl;
  const card = (
    <a className="listing" href={`/rentals/${l.id}`} target="_blank" rel="noopener noreferrer">
      <div
        className="thumb"
        style={{
          background: "linear-gradient(135deg,#2E6B53,#13322A)",
          ...(photo
            ? { backgroundImage: `linear-gradient(180deg,rgba(0,0,0,.04),rgba(0,0,0,.34)),url('${photoSrc(photo)}')`, backgroundSize: "cover", backgroundPosition: "center" }
            : {}),
        }}
      >
        <span className="typepill">{TYPE_LABEL[l.propertyType]}</span>
      </div>
      <div className="info">
        <h3>{l.title}</h3>
        <div className="loc-row">
          <span className="loc">{l.city} · {l.barangay}</span>
          {verified && <span className="vbadge"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6 9 17l-5-5" /></svg>Verified user</span>}
        </div>
        <div className="specs">
          <span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h18M5 12V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v5M3 12v6M21 12v6" /></svg>{l.bedrooms} br</span>
          <span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12V6a2 2 0 0 1 4 0M3 12h18v3a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4z" /></svg>{l.bathrooms} ba</span>
          {l.floorArea ? <span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3h18v18H3zM3 9h18M9 21V9" /></svg>{Number(l.floorArea)} m²</span> : null}
        </div>
        <div className="foot">
          <div className="price"><b className="tabular">{peso(Number(l.monthlyRent))}</b><small>per month</small></div>
          <span className="lease">{l.minimumLeaseMonths} mo min</span>
        </div>
      </div>
    </a>
  );

  if (saved === undefined) return card;
  return (
    <div className="listing-card">
      <SaveButton listingId={l.id} saved={saved} next={savePath} />
      {card}
    </div>
  );
}
