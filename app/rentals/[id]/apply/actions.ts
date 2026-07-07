"use server";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/ratelimit";
import { TenantType } from "@prisma/client";

export async function submitApplication(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  await rateLimit("apply", user.id, 8, "1 m");

  const listingId = String(formData.get("listingId") || "");
  const listing = await prisma.listing.findUnique({ where: { id: listingId }, select: { ownerId: true } });
  if (!listing) redirect("/rentals");
  if (listing.ownerId === user.id) redirect(`/rentals/${listingId}`); // can't apply to your own listing

  const taken = await prisma.tenancy.findFirst({ where: { listingId, status: "ACTIVE" }, select: { id: true } });
  if (taken) redirect(`/rentals/${listingId}`); // unit is occupied

  const ttRaw = String(formData.get("tenantType") || "");
  const tenantType: TenantType = (Object.values(TenantType) as string[]).includes(ttRaw) ? (ttRaw as TenantType) : TenantType.OTHER;
  const employmentStatus = String(formData.get("employmentStatus") || "").slice(0, 100);
  const incomeRange = String(formData.get("incomeRange") || "").slice(0, 100);
  const message = String(formData.get("message") || "").slice(0, 3000);
  const moveIn = String(formData.get("moveIn") || "");
  const clampInt = (v: FormDataEntryValue | null, min: number, max: number) => {
    const n = Math.floor(Number(v));
    return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : min;
  };
  const leaseMonths = clampInt(formData.get("leaseMonths"), 0, 120);
  const occupants = clampInt(formData.get("occupants"), 1, 50);

  // Application (one per tenant per listing)
  await prisma.application.upsert({
    where: { listingId_tenantId: { listingId, tenantId: user.id } },
    update: { status: "PENDING", tenantType, employmentStatus, incomeRange, message, consentGiven: true },
    create: {
      listingId,
      tenantId: user.id,
      ownerId: listing.ownerId,
      status: "PENDING",
      tenantType,
      employmentStatus,
      incomeRange,
      message,
      consentGiven: true,
    },
  });

  // Companion inquiry capturing the stay details
  await prisma.inquiry.create({
    data: {
      listingId,
      tenantId: user.id,
      ownerId: listing.ownerId,
      message: message || "Application submitted.",
      preferredMoveInDate: moveIn ? new Date(moveIn) : null,
      intendedLeaseMonths: leaseMonths || null,
      numberOfOccupants: occupants || null,
      status: "OPEN",
    },
  });

  redirect("/dashboard");
}
