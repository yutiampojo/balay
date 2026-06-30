"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ApplicationStatus } from "@prisma/client";

// Owner decides on an application (shortlist / accept / decline).
export async function decideApplication(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const applicationId = String(formData.get("applicationId") || "");
  const status = String(formData.get("status") || "") as ApplicationStatus;
  if (!["SHORTLISTED", "ACCEPTED", "REJECTED"].includes(status)) return;

  const app = await prisma.application.findUnique({ where: { id: applicationId }, select: { ownerId: true } });
  if (!app || app.ownerId !== user.id) return; // only the owner can decide

  await prisma.application.update({ where: { id: applicationId }, data: { status } });
  revalidatePath("/owner");
}
