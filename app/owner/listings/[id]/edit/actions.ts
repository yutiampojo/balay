"use server";

import { redirect } from "next/navigation";
import { revalidateTag, revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Owner edits pricing only (monthly rent, security deposit, advance).
export async function updatePricing(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const listingId = String(formData.get("listingId") || "");
  const listing = await prisma.listing.findUnique({ where: { id: listingId }, select: { ownerId: true } });
  if (!listing || listing.ownerId !== user.id) redirect("/owner"); // only the owner

  const num = (k: string) => {
    const v = Number(formData.get(k));
    return Number.isFinite(v) && v > 0 ? Math.min(v, 100_000_000) : null;
  };
  const monthlyRent = num("monthlyRent");
  if (!monthlyRent) redirect(`/owner/listings/${listingId}/edit`); // rent is required

  await prisma.listing.update({
    where: { id: listingId },
    data: {
      monthlyRent,
      securityDeposit: num("securityDeposit"),
      advancePayment: num("advancePayment"),
    },
  });

  revalidateTag("listings"); // refresh cached public listings
  revalidatePath("/owner");
  redirect("/owner");
}
