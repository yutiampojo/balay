import { prisma } from "@/lib/prisma";

export type Rating = { avg: number; count: number };

// Star rating for one or more listings (tenant→stay reviews only).
export async function listingRatings(listingIds: string[]): Promise<Map<string, Rating>> {
  const map = new Map<string, Rating>();
  if (listingIds.length === 0) return map;
  const groups = await prisma.review.groupBy({
    by: ["listingId"],
    where: { aboutListing: true, listingId: { in: listingIds } },
    _avg: { rating: true },
    _count: { rating: true },
  });
  for (const g of groups) {
    map.set(g.listingId, { avg: g._avg.rating ?? 0, count: g._count.rating });
  }
  return map;
}

export async function listingRating(listingId: string): Promise<Rating> {
  return (await listingRatings([listingId])).get(listingId) ?? { avg: 0, count: 0 };
}

// Star rating for a user as the subject of reviews.
// aboutListing=true  → their standing as a keyholder (from tenants)
// aboutListing=false → their standing as a tenant (from keyholders)
export async function userRating(userId: string, aboutListing: boolean): Promise<Rating> {
  const g = await prisma.review.aggregate({
    where: { subjectId: userId, aboutListing },
    _avg: { rating: true },
    _count: { rating: true },
  });
  return { avg: g._avg.rating ?? 0, count: g._count.rating };
}

// Public reviews of a listing, newest first.
export function getListingReviews(listingId: string) {
  return prisma.review.findMany({
    where: { listingId, aboutListing: true },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true, rating: true, body: true, createdAt: true,
      author: { select: { fullName: true, profilePhotoUrl: true } },
      tenancy: { select: { agreedLeaseMonths: true } },
    },
  });
}

// Tenancies the user may review, with any review they've already left.
// aboutListing is derived from role: tenant reviews the stay, owner reviews the tenant.
export async function getReviewableTenancies(userId: string) {
  const tenancies = await prisma.tenancy.findMany({
    where: {
      status: { in: ["ENDED_EARLY", "COMPLETED"] },
      OR: [{ tenantId: userId }, { ownerId: userId }],
    },
    orderBy: { endedAt: "desc" },
    select: {
      id: true, tenantId: true, ownerId: true, agreedLeaseMonths: true,
      startedAt: true, endedAt: true, status: true,
      listing: { select: { id: true, title: true, city: true, barangay: true } },
      tenant: { select: { fullName: true } },
      owner: { select: { fullName: true } },
      reviews: { where: { authorId: userId }, select: { id: true, rating: true, body: true } },
    },
  });
  return tenancies.map((t) => {
    const asTenant = t.tenantId === userId;
    return {
      id: t.id,
      listing: t.listing,
      status: t.status,
      startedAt: t.startedAt,
      endedAt: t.endedAt,
      agreedLeaseMonths: t.agreedLeaseMonths,
      asTenant, // true → reviewing the stay/keyholder; false → reviewing the tenant
      counterpartyName: asTenant ? t.owner.fullName : t.tenant.fullName,
      existing: t.reviews[0] ?? null,
    };
  });
}
