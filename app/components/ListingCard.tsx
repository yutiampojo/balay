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
  photos: { photoUrl: string }[];
};

export default function ListingCard({ l }: { l: CardListing }) {
  const verified = l.verificationStatus === "VERIFIED";
  const photo = l.photos[0]?.photoUrl;
  return (
    <a className="listing" href={`/rentals/${l.id}`}>
      <div
        className="thumb"
        style={{
          background: "linear-gradient(135deg,#2E6B53,#13322A)",
          ...(photo
            ? { backgroundImage: `linear-gradient(180deg,rgba(0,0,0,.04),rgba(0,0,0,.34)),url('/${photo}')`, backgroundSize: "cover", backgroundPosition: "center" }
            : {}),
        }}
      >
        <span className="typepill">{TYPE_LABEL[l.propertyType]}</span>
      </div>
      <div className="info">
        <div className="badges">
          {verified ? (
            <span className="vbadge"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6 9 17l-5-5" /></svg>Verified</span>
          ) : (
            <span className="vbadge plain">Documents pending</span>
          )}
        </div>
        <h3>{l.title}</h3>
        <div className="loc">{l.city} · {l.barangay}</div>
        <div className="specs">
          <span>{l.bedrooms} bd</span>
          <span>{l.bathrooms} ba</span>
          {l.floorArea ? <span>{Number(l.floorArea)} m²</span> : null}
        </div>
        <div className="foot">
          <div className="price"><b className="tabular">{peso(Number(l.monthlyRent))}</b><small>per month</small></div>
          <span className="lease">{l.minimumLeaseMonths} mo min</span>
        </div>
      </div>
    </a>
  );
}
