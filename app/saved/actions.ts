"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Toggle a listing in the current user's saved list. Returns nothing; the
// SaveButton updates optimistically and revalidation keeps counts fresh.
export async function toggleSaved(formData: FormData) {
  const listingId = String(formData.get("listingId") || "");
  const next = String(formData.get("next") || "/rentals");
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(next)}`);
  if (!listingId) return;

  const existing = await prisma.savedListing.findUnique({
    where: { userId_listingId: { userId: user.id, listingId } },
  });

  if (existing) {
    await prisma.savedListing.delete({ where: { id: existing.id } });
  } else {
    // Only allow saving a real listing (guards against stale/forged ids).
    const listing = await prisma.listing.findUnique({ where: { id: listingId }, select: { id: true } });
    if (listing) {
      await prisma.savedListing.create({ data: { userId: user.id, listingId } });
    }
  }

  revalidatePath("/saved");
  revalidatePath(next);
}
