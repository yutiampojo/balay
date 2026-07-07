"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { rateLimit } from "@/lib/ratelimit";
import { createAdminClient, VERIFICATION_BUCKET } from "@/lib/supabase/admin";

async function requireAdmin() {
  const me = await getCurrentUser();
  if (me?.role !== "ADMIN") throw new Error("Admins only.");
  return me;
}

// USER: record a submitted government ID and move to PENDING review.
// `docPath` is the storage path in the private bucket (already uploaded client-side).
export async function submitVerification(docPath: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("You must be signed in.");
  if (!docPath) throw new Error("No document uploaded.");
  await rateLimit("verify", user.id, 5, "1 h");

  await prisma.$transaction([
    prisma.document.create({
      data: { ownerUserId: user.id, type: "GOVERNMENT_ID", fileUrl: docPath, fileName: "Government ID" },
    }),
    prisma.user.update({ where: { id: user.id }, data: { verificationStatus: "PENDING" } }),
  ]);
  revalidatePath("/profile");
}

// ADMIN: short-lived signed URL to view a pending user's latest government ID.
export async function getVerificationDocUrl(userId: string): Promise<string | null> {
  await requireAdmin();
  const doc = await prisma.document.findFirst({
    where: { ownerUserId: userId, type: "GOVERNMENT_ID" },
    orderBy: { createdAt: "desc" },
    select: { fileUrl: true },
  });
  if (!doc) return null;
  const admin = createAdminClient();
  const { data, error } = await admin.storage.from(VERIFICATION_BUCKET).createSignedUrl(doc.fileUrl, 300);
  if (error) {
    console.error("createSignedUrl failed:", error);
    return null;
  }
  return data.signedUrl;
}

// ADMIN: approve identity verification.
export async function approveVerification(userId: string) {
  const admin = await requireAdmin();
  await prisma.user.update({ where: { id: userId }, data: { verificationStatus: "VERIFIED" } });
  await prisma.auditLog.create({
    data: { adminUserId: admin.id, action: "verification_approved", targetType: "User", targetId: userId },
  });
  revalidatePath("/admin");
}

// ADMIN: reject identity verification (user can re-submit).
export async function rejectVerification(userId: string) {
  const admin = await requireAdmin();
  await prisma.user.update({ where: { id: userId }, data: { verificationStatus: "REJECTED" } });
  await prisma.auditLog.create({
    data: { adminUserId: admin.id, action: "verification_rejected", targetType: "User", targetId: userId },
  });
  revalidatePath("/admin");
}
