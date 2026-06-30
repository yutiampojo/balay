"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "ADMIN") redirect("/dashboard");
  return user;
}

// Approve / reject a pending listing.
export async function moderateListing(formData: FormData) {
  const admin = await requireAdmin();
  const listingId = String(formData.get("listingId") || "");
  const action = String(formData.get("action") || "");
  const status = action === "publish" ? "PUBLISHED" : action === "reject" ? "REJECTED" : null;
  if (!status) return;

  await prisma.listing.update({ where: { id: listingId }, data: { listingStatus: status } });
  await prisma.auditLog.create({
    data: { adminUserId: admin.id, action: `listing_${status.toLowerCase()}`, targetType: "Listing", targetId: listingId },
  });
  revalidateTag("listings"); // refresh cached public listings
  revalidatePath("/admin");
}

// Grant Keyholder (owner) verification.
export async function verifyOwner(formData: FormData) {
  const admin = await requireAdmin();
  const userId = String(formData.get("userId") || "");
  await prisma.user.update({
    where: { id: userId },
    data: { verificationStatus: "VERIFIED", ownerProfile: { update: { verificationStatus: "VERIFIED" } } },
  });
  await prisma.auditLog.create({ data: { adminUserId: admin.id, action: "owner_verified", targetType: "User", targetId: userId } });
  revalidatePath("/admin");
}
