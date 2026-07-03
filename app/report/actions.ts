"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ReportReason } from "@prisma/client";

export type ReportState = { status: "idle" | "ok" | "error"; message?: string };

const VALID_REASONS = new Set<string>(Object.values(ReportReason));

// File a report against a listing and/or a user. Called from the ReportButton
// dialog via useActionState, so it returns inline state instead of redirecting.
export async function submitReport(_prev: ReportState, formData: FormData): Promise<ReportState> {
  const user = await getCurrentUser();
  if (!user) return { status: "error", message: "Please log in to submit a report." };

  const reason = String(formData.get("reason") || "");
  if (!VALID_REASONS.has(reason)) return { status: "error", message: "Please choose a reason." };

  const listingId = String(formData.get("listingId") || "") || null;
  let reportedUserId = String(formData.get("reportedUserId") || "") || null;
  const description = String(formData.get("description") || "").trim().slice(0, 1000) || null;

  // Resolve the listing owner for context + guard against self-reports.
  if (listingId) {
    const listing = await prisma.listing.findUnique({ where: { id: listingId }, select: { ownerId: true } });
    if (!listing) return { status: "error", message: "That listing no longer exists." };
    if (listing.ownerId === user.id) return { status: "error", message: "You can’t report your own listing." };
    reportedUserId = reportedUserId ?? listing.ownerId; // attach owner for the admin
  }
  if (reportedUserId === user.id) return { status: "error", message: "You can’t report yourself." };
  if (!listingId && !reportedUserId) return { status: "error", message: "Nothing to report." };

  // Soft de-dupe: don't stack multiple open reports from the same person on the
  // same target — reassure them it's already in the queue instead.
  const existing = await prisma.report.findFirst({
    where: listingId
      ? { reporterUserId: user.id, listingId, status: { in: ["OPEN", "REVIEWING"] } }
      : { reporterUserId: user.id, reportedUserId, listingId: null, status: { in: ["OPEN", "REVIEWING"] } },
    select: { id: true },
  });
  if (existing) {
    return { status: "ok", message: "You’ve already reported this — our team is already on it." };
  }

  await prisma.report.create({
    data: { reporterUserId: user.id, listingId, reportedUserId, reason: reason as ReportReason, description },
  });

  revalidatePath("/admin");
  return { status: "ok", message: "Thanks for flagging this. Our trust & safety team will review it." };
}
