import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const BASE = "https://balaymo.com";

// Regenerate hourly so newly published listings get indexed.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE, changeFrequency: "daily", priority: 1 },
    { url: `${BASE}/rentals`, changeFrequency: "hourly", priority: 0.9 },
    { url: `${BASE}/keyholder`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${BASE}/signup`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE}/login`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE}/terms`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${BASE}/privacy`, changeFrequency: "yearly", priority: 0.2 },
  ];

  let listings: { id: string; updatedAt: Date }[] = [];
  try {
    listings = await prisma.listing.findMany({
      where: { listingStatus: "PUBLISHED" },
      select: { id: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
      take: 5000,
    });
  } catch {
    // DB unavailable at build/render — still serve the static sitemap.
  }

  const listingPages: MetadataRoute.Sitemap = listings.map((l) => ({
    url: `${BASE}/rentals/${l.id}`,
    lastModified: l.updatedAt,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticPages, ...listingPages];
}
