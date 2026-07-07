"use server";

import { revalidateTag, revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/ratelimit";

// Leave (or update) a review for a completed/ended tenancy the caller was part of.
export async function submitReview(tenancyId: string, ratingRaw: number, bodyRaw: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Please sign in.");
  await rateLimit("review", user.id, 20, "1 h");

  const rating = Math.min(5, Math.max(1, Math.round(Number(ratingRaw))));
  if (!Number.isFinite(rating)) throw new Error("Please choose a star rating.");
  const body = String(bodyRaw || "").trim().slice(0, 2000);

  const tenancy = await prisma.tenancy.findUnique({
    where: { id: tenancyId },
    select: { id: true, tenantId: true, ownerId: true, listingId: true, status: true },
  });
  if (!tenancy) throw new Error("Tenancy not found.");
  if (tenancy.status === "ACTIVE") throw new Error("You can review a stay once it has ended.");

  const isTenant = tenancy.tenantId === user.id;
  const isOwner = tenancy.ownerId === user.id;
  if (!isTenant && !isOwner) throw new Error("You weren't part of this tenancy.");

  // Tenant reviews the stay/keyholder; keyholder reviews the tenant.
  const aboutListing = isTenant;
  const subjectId = isTenant ? tenancy.ownerId : tenancy.tenantId;

  await prisma.review.upsert({
    where: { tenancyId_authorId: { tenancyId, authorId: user.id } },
    create: { tenancyId, listingId: tenancy.listingId, authorId: user.id, subjectId, aboutListing, rating, body },
    update: { rating, body },
  });

  revalidateTag("listings"); // card ratings
  revalidatePath(`/rentals/${tenancy.listingId}`);
  revalidatePath("/dashboard");
  revalidatePath("/owner/tenancies");
}
