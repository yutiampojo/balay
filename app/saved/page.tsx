import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { photoSrc } from "@/lib/photo";

export const dynamic = "force-dynamic";

const coverOf = (photoUrl?: string | null) => (photoUrl ? photoSrc(photoUrl) : null);

export default async function SavedPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/saved");

  const [collections, uncategorized] = await Promise.all([
    prisma.collection.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        _count: { select: { savedListings: true } },
        savedListings: { orderBy: { createdAt: "desc" }, take: 1, select: { listing: { select: { photos: { select: { photoUrl: true }, orderBy: { sortOrder: "asc" }, take: 1 } } } } },
      },
    }),
    prisma.savedListing.findMany({
      where: { userId: user.id, collectionId: null },
      orderBy: { createdAt: "desc" },
      select: { listing: { select: { photos: { select: { photoUrl: true }, orderBy: { sortOrder: "asc" }, take: 1 } } } },
    }),
  ]);

  const cards = collections.map((c) => ({
    href: `/saved/${c.id}`,
    name: c.name,
    count: c._count.savedListings,
    cover: coverOf(c.savedListings[0]?.listing.photos[0]?.photoUrl),
  }));
  if (uncategorized.length > 0) {
    cards.push({ href: "/saved/unsorted", name: "Unsorted", count: uncategorized.length, cover: coverOf(uncategorized[0]?.listing.photos[0]?.photoUrl) });
  }

  const total = cards.reduce((n, c) => n + c.count, 0);

  return (
    <>
      <div className="wrap pagehead">
        <div className="eyebrow">Your shortlist</div>
        <h1>Saved homes</h1>
        <p>
          {total === 0
            ? "Tap the heart on any listing to save it into a collection."
            : `${total} home${total === 1 ? "" : "s"} across ${cards.length} collection${cards.length === 1 ? "" : "s"}.`}
        </p>
      </div>

      <main className="wrap" style={{ paddingBottom: 64 }}>
        {cards.length === 0 ? (
          <div className="empty" style={{ marginTop: 20 }}>
            <b>No saved homes yet</b>Tap the heart on any listing to keep it here for later.
            <div style={{ marginTop: 14 }}><a className="btn btn-primary" href="/rentals">Browse homes</a></div>
          </div>
        ) : (
          <div className="wishlist-grid">
            {cards.map((c) => (
              <a key={c.href} className="wishlist-card" href={c.href}>
                <div className="wishlist-cover" style={c.cover ? { backgroundImage: `url('${c.cover}')` } : undefined}>
                  {!c.cover && <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M3 11l9-7 9 7M5 10v10h14V10" /></svg>}
                </div>
                <div className="wishlist-meta"><strong>{c.name}</strong><span className="muted">{c.count} saved</span></div>
              </a>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
