"use server";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TenantType } from "@prisma/client";

export async function submitApplication(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const listingId = String(formData.get("listingId") || "");
  const listing = await prisma.listing.findUnique({ where: { id: listingId }, select: { ownerId: true } });
  if (!listing) redirect("/rentals");
  if (listing.ownerId === user.id) redirect(`/rentals/${listingId}`); // can't apply to your own listing

  const taken = await prisma.tenancy.findFirst({ where: { listingId, status: "ACTIVE" }, select: { id: true } });
  if (taken) redirect(`/rentals/${listingId}`); // unit is occupied

  const tenantType = (String(formData.get("tenantType") || "OTHER") as TenantType) || TenantType.OTHER;
  const employmentStatus = String(formData.get("employmentStatus") || "");
  const incomeRange = String(formData.get("incomeRange") || "");
  const message = String(formData.get("message") || "");
  const moveIn = String(formData.get("moveIn") || "");
  const leaseMonths = Number(formData.get("leaseMonths") || 0);
  const occupants = Number(formData.get("occupants") || 1);

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
