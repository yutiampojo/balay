"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ApplicationStatus, TenancyStatus } from "@prisma/client";

// Owner removes their own listing (cascades photos, applications, inquiries).
export async function deleteListing(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const listingId = String(formData.get("listingId") || "");
  const listing = await prisma.listing.findUnique({ where: { id: listingId }, select: { ownerId: true } });
  if (!listing || listing.ownerId !== user.id) return; // only the owner can remove

  await prisma.listing.delete({ where: { id: listingId } });
  revalidateTag("listings"); // drop it from cached public listings
  revalidatePath("/owner");
}

// Owner decides on an application (shortlist / accept / decline).
export async function decideApplication(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const applicationId = String(formData.get("applicationId") || "");
  const status = String(formData.get("status") || "") as ApplicationStatus;
  if (!["SHORTLISTED", "ACCEPTED", "REJECTED"].includes(status)) return;

  const app = await prisma.application.findUnique({
    where: { id: applicationId },
    select: { ownerId: true, listingId: true, tenantId: true, listing: { select: { minimumLeaseMonths: true } } },
  });
  if (!app || app.ownerId !== user.id) return; // only the owner can decide

  await prisma.application.update({ where: { id: applicationId }, data: { status } });

  // Accepting starts a tenancy (the listing becomes occupied).
  if (status === "ACCEPTED") {
    await prisma.tenancy.upsert({
      where: { applicationId },
      update: { status: TenancyStatus.ACTIVE, endedAt: null, endReason: null },
      create: {
        applicationId,
        listingId: app.listingId,
        tenantId: app.tenantId,
        ownerId: app.ownerId,
        agreedLeaseMonths: app.listing.minimumLeaseMonths,
        status: TenancyStatus.ACTIVE,
      },
    });
  }

  revalidateTag("listings"); // accepting removes the unit from public browse
  revalidatePath("/owner");
}

// Owner ends a tenancy → the listing re-opens to the marketplace. The status
// is set automatically based on whether the agreed term was reached.
export async function endTenancy(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const tenancyId = String(formData.get("tenancyId") || "");
  const reason = (String(formData.get("reason") || "").trim() || null)?.slice(0, 200) ?? null;

  const t = await prisma.tenancy.findUnique({
    where: { id: tenancyId },
    select: { ownerId: true, startedAt: true, agreedLeaseMonths: true, status: true },
  });
  if (!t || t.ownerId !== user.id || t.status !== "ACTIVE") return;

  const termEnd = new Date(t.startedAt);
  termEnd.setMonth(termEnd.getMonth() + t.agreedLeaseMonths);
  const status = new Date() < termEnd ? TenancyStatus.ENDED_EARLY : TenancyStatus.COMPLETED;

  await prisma.tenancy.update({
    where: { id: tenancyId },
    data: { status, endedAt: new Date(), endReason: reason },
  });

  revalidateTag("listings"); // unit re-appears in public browse
  revalidatePath("/owner");
}
