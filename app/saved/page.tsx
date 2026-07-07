import { redirect } from "next/navigation";
import ListingCard from "@/app/components/ListingCard";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function SavedPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/saved");

  const savedRows = await prisma.savedListing.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    select: {
      listing: {
        select: {
          id: true, title: true, propertyType: true, city: true, barangay: true,
          monthlyRent: true, minimumLeaseMonths: true, bedrooms: true, bathrooms: true,
          floorArea: true, verificationStatus: true, listingStatus: true,
          owner: { select: { verificationStatus: true } },
          photos: { select: { photoUrl: true }, orderBy: { sortOrder: "asc" }, take: 1 },
          tenancies: { where: { status: "ACTIVE" }, select: { id: true }, take: 1 },
        },
      },
    },
  });

  return (
    <>

      <div className="wrap pagehead">
        <div className="eyebrow">Your shortlist</div>
        <h1>Saved homes</h1>
        <p>{savedRows.length} home{savedRows.length === 1 ? "" : "s"} you&apos;ve hearted. Tap the heart again to remove.</p>
      </div>

      <main className="wrap" style={{ paddingBottom: 64 }}>
        {savedRows.length === 0 ? (
          <div className="empty" style={{ marginTop: 20 }}>
            <b>No saved homes yet</b>Tap the heart on any listing to keep it here for later.
            <div style={{ marginTop: 14 }}><a className="btn btn-primary" href="/rentals">Browse homes</a></div>
          </div>
        ) : (
          <div className="grid" style={{ marginTop: 20 }}>
            {savedRows.map(({ listing: l }) => {
              const unavailable = l.listingStatus !== "PUBLISHED" || l.tenancies.length > 0;
              return (
                <div key={l.id} className={`saved-item${unavailable ? " unavailable" : ""}`}>
                  {unavailable && <span className="saved-ribbon">No longer available</span>}
                  <ListingCard
                    l={{ ...l, ownerVerified: l.owner.verificationStatus === "VERIFIED", monthlyRent: Number(l.monthlyRent), floorArea: l.floorArea ? Number(l.floorArea) : null }}
                    saved
                    savePath="/saved"
                  />
                </div>
              );
            })}
          </div>
        )}
      </main>
    </>
  );
}
