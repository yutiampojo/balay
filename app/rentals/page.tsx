import SiteNav from "@/app/components/SiteNav";
import ListingCard from "@/app/components/ListingCard";
import { getPublishedListings } from "@/lib/listings";

const CITIES = ["Quezon City", "Makati", "Taguig", "Cebu City", "Davao City", "Baguio"];

export default async function RentalsPage({
  searchParams,
}: {
  searchParams: Promise<{ city?: string; minLease?: string; maxRent?: string; verifiedOnly?: string }>;
}) {
  const sp = await searchParams;
  const city = sp.city || "";
  const minLease = sp.minLease ? Number(sp.minLease) : 0;
  const maxRent = sp.maxRent ? Number(sp.maxRent) : 0;
  const verifiedOnly = sp.verifiedOnly === "true";

  const listings = await getPublishedListings({ city, minLease, maxRent, verifiedOnly });

  // build hrefs that preserve the other active filters
  const qs = (overrides: Record<string, string>) => {
    const p = new URLSearchParams();
    const merged = { city, minLease: minLease || "", maxRent: maxRent || "", verifiedOnly: verifiedOnly ? "true" : "", ...overrides };
    Object.entries(merged).forEach(([k, v]) => { if (v) p.set(k, String(v)); });
    const s = p.toString();
    return s ? `/rentals?${s}` : "/rentals";
  };

  return (
    <>
      <SiteNav current="rentals" />

      <div className="wrap pagehead">
        <div className="eyebrow">Homes available now</div>
        <h1>Browse verified homes</h1>
        <p>{listings.length} medium &amp; long-term rental{listings.length === 1 ? "" : "s"}{city ? ` in ${city}` : ""}.</p>
      </div>

      <main className="wrap" style={{ paddingBottom: 64 }}>
        {/* filter chips */}
        <div className="filterbar">
          <a className={`chip${city === "" ? " active" : ""}`} href={qs({ city: "" })}>All cities</a>
          {CITIES.map((c) => (
            <a key={c} className={`chip${city === c ? " active" : ""}`} href={qs({ city: c })}>{c}</a>
          ))}
          <span className="spacer" />
          <a className={`chip${verifiedOnly ? " active" : ""}`} href={qs({ verifiedOnly: verifiedOnly ? "" : "true" })}>✓ Verified only</a>
        </div>

        {listings.length === 0 ? (
          <div className="empty"><b>No homes match those filters yet</b>Try widening your budget or lease length — new verified listings are added daily.</div>
        ) : (
          <div className="grid">
            {listings.map((l) => (
              <ListingCard key={l.id} l={{ ...l, monthlyRent: Number(l.monthlyRent), floorArea: l.floorArea ? Number(l.floorArea) : null }} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
