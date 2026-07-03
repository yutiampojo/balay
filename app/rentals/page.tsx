import Link from "next/link";
import ListingCard from "@/app/components/ListingCard";
import FilterControls from "./FilterControls";
import MapView from "./MapView";
import ScrollLock from "./ScrollLock";
import { getPublishedListings, type SortKey } from "@/lib/listings";
import { approxCoords } from "@/lib/geo";
import { getCurrentUser } from "@/lib/auth";
import { getSavedListingIds } from "@/lib/saved";

export const dynamic = "force-dynamic";

type SP = {
  q?: string; city?: string; type?: string; minBeds?: string;
  minRent?: string; maxRent?: string; minLease?: string; amenities?: string; verifiedOnly?: string; sort?: string; view?: string;
};

function withQuery(sp: Record<string, string | undefined>, over: Record<string, string | undefined>) {
  const p = new URLSearchParams();
  const merged = { ...sp, ...over };
  Object.entries(merged).forEach(([k, v]) => { if (v) p.set(k, v); });
  const s = p.toString();
  return s ? `/rentals?${s}` : "/rentals";
}

export default async function RentalsPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const city = sp.city ?? "";
  const type = sp.type ?? "";
  const minBeds = sp.minBeds ? Number(sp.minBeds) : 0;
  const minRent = sp.minRent ? Number(sp.minRent) : 0;
  const maxRent = sp.maxRent ? Number(sp.maxRent) : 0;
  const minLease = sp.minLease ? Number(sp.minLease) : 0;
  const amenities = (sp.amenities ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  const verifiedOnly = sp.verifiedOnly === "true";
  const sort = (sp.sort as SortKey) || "new";
  const isMap = sp.view === "map";

  const [listings, user] = await Promise.all([
    getPublishedListings({ q, city, type, minBeds, minRent, maxRent, minLease, amenities, verifiedOnly, sort }),
    getCurrentUser(),
  ]);
  const savedIds = user ? await getSavedListingIds(user.id) : new Set<string>();
  const savePath = isMap ? "/rentals?view=map" : "/rentals";
  const geoListings = listings.map((l) => {
    const [lat, lng] = l.latitude != null && l.longitude != null ? [l.latitude, l.longitude] : approxCoords(l);
    return { ...l, lat, lng, saved: savedIds.has(l.id) };
  });

  // lightweight suggestion source: all published & available listings
  const suggestSource = await getPublishedListings({});
  const suggestions = suggestSource.map((s) => ({ id: s.id, title: s.title, city: s.city, barangay: s.barangay }));

  const viewToggle = (
    <div className="view-toggle">
      <Link className={`vt${!isMap ? " active" : ""}`} href={withQuery(sp, { view: undefined })}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg>
        Grid
      </Link>
      <Link className={`vt${isMap ? " active" : ""}`} href={withQuery(sp, { view: "map" })}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 3 3 6v15l6-3 6 3 6-3V3l-6 3-6-3z" /><path d="M9 3v15M15 6v15" /></svg>
        Map
      </Link>
    </div>
  );

  const filters = <FilterControls initial={{ q, city, type, minBeds, minRent, maxRent, minLease, amenities, verifiedOnly, sort, view: isMap ? "map" : "" }} suggestions={suggestions} />;

  if (isMap) {
    return (
      <>
        <ScrollLock />
        <main className="rentals-map-main">
          <div className="rentals-toolbar">
            {filters}
            <div className="map-header-row">
              <strong>{listings.length} home{listings.length === 1 ? "" : "s"} within the map area</strong>
              {viewToggle}
            </div>
          </div>
          {listings.length === 0 ? (
            <div className="empty"><b>No homes match those filters yet</b>Try widening your filters — new verified listings are added daily.</div>
          ) : (
            <MapView listings={geoListings.map((l) => ({ ...l, monthlyRent: Number(l.monthlyRent), floorArea: l.floorArea ? Number(l.floorArea) : null }))} />
          )}
        </main>
      </>
    );
  }

  return (
    <>

      <div className="wrap pagehead">
        <div className="eyebrow">Homes available now</div>
        <h1>Browse verified homes</h1>
        <p>{listings.length} medium &amp; long-term rental{listings.length === 1 ? "" : "s"}{q ? ` matching “${q}”` : ""}{city ? ` in ${city}` : ""}.</p>
      </div>

      <main className="wrap" style={{ paddingBottom: 64 }}>
        <div className="rentals-toolbar">
          {filters}
          {viewToggle}
        </div>

        {listings.length === 0 ? (
          <div className="empty" style={{ marginTop: 20 }}><b>No homes match those filters yet</b>Try widening your budget, lease length, or keyword — new verified listings are added daily.</div>
        ) : (
          <div className="grid" style={{ marginTop: 20 }}>
            {listings.map((l) => (
              <ListingCard key={l.id} l={{ ...l, monthlyRent: Number(l.monthlyRent), floorArea: l.floorArea ? Number(l.floorArea) : null }} saved={savedIds.has(l.id)} savePath={savePath} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
