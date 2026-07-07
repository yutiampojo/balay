import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ListingCard from "@/app/components/ListingCard";
import DeleteCollectionButton from "../DeleteCollectionButton";

export const dynamic = "force-dynamic";

export default async function CollectionPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/saved");
  const { id } = await params;

  const isUnsorted = id === "unsorted";
  let name = "Unsorted";
  if (!isUnsorted) {
    const col = await prisma.collection.findFirst({ where: { id, userId: user.id }, select: { name: true } });
    if (!col) notFound();
    name = col.name;
  }

  const saved = await prisma.savedListing.findMany({
    where: { userId: user.id, collectionId: isUnsorted ? null : id },
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
        <div className="crumbs"><a href="/saved">Saved</a> <span>›</span> <span>{name}</span></div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <h1>{name}</h1>
          {!isUnsorted && <DeleteCollectionButton collectionId={id} name={name} count={saved.length} />}
        </div>
        <p>{saved.length} home{saved.length === 1 ? "" : "s"} in this collection.</p>
      </div>

      <main className="wrap" style={{ paddingBottom: 64 }}>
        {saved.length === 0 ? (
          <div className="empty" style={{ marginTop: 20 }}>
            <b>Nothing here yet</b>Save listings into this collection from the heart button on any home.
            <div style={{ marginTop: 14 }}><a className="btn btn-primary" href="/rentals">Browse homes</a></div>
          </div>
        ) : (
          <div className="grid" style={{ marginTop: 20 }}>
            {saved.map(({ listing: l }) => {
              const unavailable = l.listingStatus !== "PUBLISHED" || l.tenancies.length > 0;
              return (
                <div key={l.id} className={`saved-item${unavailable ? " unavailable" : ""}`}>
                  {unavailable && <span className="saved-ribbon">No longer available</span>}
                  <ListingCard
                    l={{ ...l, ownerVerified: l.owner.verificationStatus === "VERIFIED", monthlyRent: Number(l.monthlyRent), floorArea: l.floorArea ? Number(l.floorArea) : null }}
                    saved
                    savePath={`/saved/${id}`}
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
