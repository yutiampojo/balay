"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// Permanently erase a user and everything tied to them. Callable by the user
// themselves (deleting their own account) or by an admin (any user).
export async function deleteUserAccount(targetUserId: string) {
  const me = await getCurrentUser();
  if (!me) throw new Error("You must be signed in.");

  const isSelf = me.id === targetUserId;
  const isAdmin = me.role === "ADMIN";
  if (!isSelf && !isAdmin) throw new Error("You're not allowed to do that.");

  const target = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: { id: true, email: true },
  });
  if (!target) return;

  const uid = target.id;

  // Erase all application data in one transaction. Records that reference the
  // user without ON DELETE CASCADE are removed first, in dependency order, so
  // the final user delete has nothing pointing at it.
  await prisma.$transaction([
    // the user's own listings + everything hanging off them (cascades)
    prisma.listing.deleteMany({ where: { ownerId: uid } }),
    // messaging (deleting a conversation cascades its messages)
    prisma.conversation.deleteMany({ where: { OR: [{ participantAId: uid }, { participantBId: uid }] } }),
    prisma.message.deleteMany({ where: { senderId: uid } }), // safety net for any stragglers
    // trust & safety, payments, audit
    prisma.report.deleteMany({ where: { OR: [{ reporterUserId: uid }, { reportedUserId: uid }] } }),
    prisma.payment.deleteMany({ where: { OR: [{ payerUserId: uid }, { receiverUserId: uid }] } }),
    prisma.auditLog.deleteMany({ where: { adminUserId: uid } }),
    // tenancies / applications / inquiries where the user is a party on others' listings
    prisma.tenancy.deleteMany({ where: { OR: [{ tenantId: uid }, { ownerId: uid }] } }),
    prisma.application.deleteMany({ where: { OR: [{ tenantId: uid }, { ownerId: uid }] } }),
    prisma.inquiry.deleteMany({ where: { OR: [{ tenantId: uid }, { ownerId: uid }] } }),
    // misc user-owned rows
    prisma.document.deleteMany({ where: { ownerUserId: uid } }),
    prisma.savedListing.deleteMany({ where: { userId: uid } }),
    prisma.ownerProfile.deleteMany({ where: { userId: uid } }),
    prisma.tenantProfile.deleteMany({ where: { userId: uid } }),
    // finally, the user
    prisma.user.delete({ where: { id: uid } }),
  ]);

  // Remove the Supabase Auth record too (matched by email) so the account is
  // fully gone and isn't re-created on next login. Best-effort.
  try {
    await prisma.$executeRaw`DELETE FROM auth.users WHERE email = ${target.email}`;
  } catch (e) {
    console.error("deleteUserAccount: could not remove Supabase auth user:", e);
  }
}
