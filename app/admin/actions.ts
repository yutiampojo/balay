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
  redirect("/admin#moderation");
}

// Admin deletes any listing (active or pending) — cascades photos,
// applications, and inquiries.
export async function adminDeleteListing(formData: FormData) {
  const admin = await requireAdmin();
  const listingId = String(formData.get("listingId") || "");
  if (!listingId) return;

  await prisma.listing.delete({ where: { id: listingId } });
  await prisma.auditLog.create({
    data: { adminUserId: admin.id, action: "deleted_listing", targetType: "Listing", targetId: listingId },
  });
  revalidateTag("listings");
  revalidatePath("/admin");
  redirect("/admin#active");
}

// Promote another user to ADMIN. Only an existing admin can do this
// (requireAdmin gates it), satisfying "only an admin can add another admin".
export async function makeAdmin(formData: FormData) {
  const admin = await requireAdmin();
  const userId = String(formData.get("userId") || "");
  if (!userId || userId === admin.id) return;

  await prisma.user.update({ where: { id: userId }, data: { role: "ADMIN" } });
  await prisma.auditLog.create({
    data: { adminUserId: admin.id, action: "granted_admin", targetType: "User", targetId: userId },
  });
  revalidatePath("/admin");
}

// Revoke another user's ADMIN role. Only an admin can do this, and never on
// themselves (prevents locking yourself out). Demotes to OWNER if they have
// listings, otherwise TENANT.
export async function revokeAdmin(formData: FormData) {
  const admin = await requireAdmin();
  const userId = String(formData.get("userId") || "");
  if (!userId || userId === admin.id) return;

  const target = await prisma.user.findUnique({ where: { id: userId }, select: { role: true, _count: { select: { listings: true } } } });
  if (!target || target.role !== "ADMIN") return;

  const newRole = target._count.listings > 0 ? "OWNER" : "TENANT";
  await prisma.user.update({ where: { id: userId }, data: { role: newRole } });
  await prisma.auditLog.create({
    data: { adminUserId: admin.id, action: "revoked_admin", targetType: "User", targetId: userId },
  });
  revalidatePath("/admin");
}

// Act on a user report: mark it reviewing, resolved, or dismissed.
export async function updateReport(formData: FormData) {
  const admin = await requireAdmin();
  const reportId = String(formData.get("reportId") || "");
  const action = String(formData.get("action") || "");
  const status =
    action === "review" ? "REVIEWING" :
    action === "resolve" ? "RESOLVED" :
    action === "dismiss" ? "DISMISSED" : null;
  if (!reportId || !status) return;

  await prisma.report.update({ where: { id: reportId }, data: { status } });
  await prisma.auditLog.create({
    data: { adminUserId: admin.id, action: `report_${status.toLowerCase()}`, targetType: "Report", targetId: reportId },
  });
  revalidatePath("/admin");
  redirect("/admin#reports");
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
