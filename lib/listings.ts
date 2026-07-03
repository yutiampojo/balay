import { unstable_cache } from "next/cache";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type SortKey = "new" | "price_asc" | "price_desc";

export type ListingFilters = {
  q?: string;
  city?: string;
  type?: string;
  minBeds?: number;
  minRent?: number;
  maxRent?: number;
  minLease?: number;
  amenities?: string[];
  verifiedOnly?: boolean;
  sort?: SortKey;
  take?: number;
};

export type PublicListing = {
  id: string;
  title: string;
  propertyType: string;
  city: string;
  barangay: string;
  monthlyRent: number;
  minimumLeaseMonths: number;
  bedrooms: number;
  bathrooms: number;
  floorArea: number | null;
  verificationStatus: string;
  latitude: number | null;
  longitude: number | null;
  photos: { photoUrl: string }[];
};

// Shared WHERE for public browse + saved-search matching, so an alert counts
// exactly what the browse page would show for the same criteria.
export function buildListingWhere(filters: ListingFilters = {}): Prisma.ListingWhereInput {
  const q = filters.q?.trim();
  return {
    listingStatus: "PUBLISHED",
    tenancies: { none: { status: "ACTIVE" } }, // hide while occupied
    ...(filters.city ? { city: { contains: filters.city, mode: "insensitive" } } : {}),
    ...(filters.type ? { propertyType: filters.type as never } : {}),
    ...(filters.minBeds ? { bedrooms: { gte: filters.minBeds } } : {}),
    ...(filters.minRent || filters.maxRent
      ? { monthlyRent: { ...(filters.minRent ? { gte: filters.minRent } : {}), ...(filters.maxRent ? { lte: filters.maxRent } : {}) } }
      : {}),
    ...(filters.minLease ? { minimumLeaseMonths: { gte: filters.minLease } } : {}),
    ...(filters.amenities && filters.amenities.length ? { amenities: { hasEvery: filters.amenities } } : {}),
    ...(filters.verifiedOnly ? { verificationStatus: "VERIFIED" } : {}),
    ...(q
      ? {
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
            { city: { contains: q, mode: "insensitive" } },
            { barangay: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
  };
}

// Cached read of published (and available) listings. Keyed by filters and
// invalidated via the "listings" tag on create/moderate/accept/end.
export function getPublishedListings(filters: ListingFilters = {}): Promise<PublicListing[]> {
  const key = JSON.stringify(filters);
  return unstable_cache(
    async () => {
      const where = buildListingWhere(filters);

      const orderBy: Prisma.ListingOrderByWithRelationInput[] =
        filters.sort === "price_asc" ? [{ monthlyRent: "asc" }]
        : filters.sort === "price_desc" ? [{ monthlyRent: "desc" }]
        : [{ isFeatured: "desc" }, { createdAt: "desc" }];

      const rows = await prisma.listing.findMany({
        where,
        orderBy,
        take: filters.take,
        select: {
          id: true, title: true, propertyType: true, city: true, barangay: true,
          monthlyRent: true, minimumLeaseMonths: true, bedrooms: true, bathrooms: true,
          floorArea: true, verificationStatus: true, latitude: true, longitude: true,
          photos: { select: { photoUrl: true }, orderBy: { sortOrder: "asc" }, take: 1 },
        },
      });
      return rows.map((l) => ({
        ...l,
        monthlyRent: Number(l.monthlyRent),
        floorArea: l.floorArea ? Number(l.floorArea) : null,
      }));
    },
    ["published-listings", key],
    { tags: ["listings"], revalidate: 300 }
  )();
}
