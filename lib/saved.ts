import { prisma } from "@/lib/prisma";

// Set of listing ids the user has saved — used to render heart state on cards.
export async function getSavedListingIds(userId: string): Promise<Set<string>> {
  const rows = await prisma.savedListing.findMany({
    where: { userId },
    select: { listingId: true },
  });
  return new Set(rows.map((r) => r.listingId));
}

export function savedCount(userId: string): Promise<number> {
  return prisma.savedListing.count({ where: { userId } });
}
