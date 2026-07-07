"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { photoSrc } from "@/lib/photo";
import { rateLimit } from "@/lib/ratelimit";

export type CollectionCard = { id: string; name: string; count: number; cover: string | null };

// The user's collections, each with a cover (its latest saved listing's photo)
// and a count. If `listingId` is passed, also report where that listing is saved.
export async function getMyCollections(
  listingId?: string
): Promise<{ collections: CollectionCard[]; savedIn: string | null; isSaved: boolean }> {
  const user = await getCurrentUser();
  if (!user) return { collections: [], savedIn: null, isSaved: false };

  const cols = await prisma.collection.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      _count: { select: { savedListings: true } },
      savedListings: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { listing: { select: { photos: { select: { photoUrl: true }, orderBy: { sortOrder: "asc" }, take: 1 } } } },
      },
    },
  });

  const collections: CollectionCard[] = cols.map((c) => {
    const photo = c.savedListings[0]?.listing.photos[0]?.photoUrl;
    return { id: c.id, name: c.name, count: c._count.savedListings, cover: photo ? photoSrc(photo) : null };
  });

  let savedIn: string | null = null;
  let isSaved = false;
  if (listingId) {
    const s = await prisma.savedListing.findUnique({
      where: { userId_listingId: { userId: user.id, listingId } },
      select: { collectionId: true },
    });
    if (s) { isSaved = true; savedIn = s.collectionId; }
  }
  return { collections, savedIn, isSaved };
}

// Save (or move) a listing into a collection. `collectionId` null = unsorted.
export async function saveToCollection(listingId: string, collectionId: string | null) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Please sign in to save.");
  const listing = await prisma.listing.findUnique({ where: { id: listingId }, select: { id: true } });
  if (!listing) throw new Error("Listing not found.");
  if (collectionId) {
    const col = await prisma.collection.findFirst({ where: { id: collectionId, userId: user.id }, select: { id: true } });
    if (!col) throw new Error("Collection not found.");
  }
  await prisma.savedListing.upsert({
    where: { userId_listingId: { userId: user.id, listingId } },
    create: { userId: user.id, listingId, collectionId },
    update: { collectionId },
  });
  revalidatePath("/saved");
  revalidatePath("/rentals");
}

// Create a new collection and save the listing into it.
export async function createCollectionAndSave(name: string, listingId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Please sign in to save.");
  await rateLimit("collection", user.id, 30, "1 m");
  const trimmed = name.trim().slice(0, 60);
  if (!trimmed) throw new Error("Please name your collection.");
  const listing = await prisma.listing.findUnique({ where: { id: listingId }, select: { id: true } });
  if (!listing) throw new Error("Listing not found.");
  const col = await prisma.collection.create({ data: { userId: user.id, name: trimmed } });
  await prisma.savedListing.upsert({
    where: { userId_listingId: { userId: user.id, listingId } },
    create: { userId: user.id, listingId, collectionId: col.id },
    update: { collectionId: col.id },
  });
  revalidatePath("/saved");
  revalidatePath("/rentals");
  return col.id;
}

// Delete a collection and the listings saved in it.
export async function deleteCollection(collectionId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Please sign in.");
  const col = await prisma.collection.findFirst({ where: { id: collectionId, userId: user.id }, select: { id: true } });
  if (!col) throw new Error("Collection not found.");
  await prisma.$transaction([
    prisma.savedListing.deleteMany({ where: { userId: user.id, collectionId } }),
    prisma.collection.delete({ where: { id: collectionId } }),
  ]);
  revalidatePath("/saved");
  revalidatePath("/rentals");
}

// Un-save a listing entirely.
export async function removeSaved(listingId: string) {
  const user = await getCurrentUser();
  if (!user) return;
  await prisma.savedListing.deleteMany({ where: { userId: user.id, listingId } });
  revalidatePath("/saved");
  revalidatePath("/rentals");
}
