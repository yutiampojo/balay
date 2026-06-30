import { unstable_cache } from "next/cache";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type ListingFilters = {
  city?: string;
  minLease?: number;
  maxRent?: number;
  verifiedOnly?: boolean;
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
  photos: { photoUrl: string }[];
};

// Cached read of published listings. Keyed by filters; invalidated via the
// "listings" tag when a listing is created or moderated.
export function getPublishedListings(filters: ListingFilters = {}): Promise<PublicListing[]> {
  const key = JSON.stringify(filters);
  return unstable_cache(
    async () => {
      const where: Prisma.ListingWhereInput = {
        listingStatus: "PUBLISHED",
        ...(filters.city ? { city: filters.city } : {}),
        ...(filters.minLease ? { minimumLeaseMonths: { gte: filters.minLease } } : {}),
        ...(filters.maxRent ? { monthlyRent: { lte: filters.maxRent } } : {}),
        ...(filters.verifiedOnly ? { verificationStatus: "VERIFIED" } : {}),
      };
      const rows = await prisma.listing.findMany({
        where,
        orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
        take: filters.take,
        select: {
          id: true, title: true, propertyType: true, city: true, barangay: true,
          monthlyRent: true, minimumLeaseMonths: true, bedrooms: true, bathrooms: true,
          floorArea: true, verificationStatus: true,
          photos: { select: { photoUrl: true }, orderBy: { sortOrder: "asc" }, take: 1 },
        },
      });
      // Plain, serializable shape for the cache (Decimal -> number).
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
