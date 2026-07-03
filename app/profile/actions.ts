"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { normalizePHPhone } from "@/lib/phone";

// Save (or update) the user's contact number. Records the time so we can
// prompt to reconfirm it every 3 months.
export async function updatePhone(phoneRaw: string): Promise<{ ok: boolean; error?: string }> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "You're not signed in." };

  const phone = normalizePHPhone(phoneRaw);
  if (!phone) return { ok: false, error: "Enter a valid PH mobile number, e.g. 0917 123 4567." };

  await prisma.user.update({
    where: { id: user.id },
    data: { phoneNumber: phone, phoneVerifiedAt: new Date() },
  });
  revalidatePath("/profile");
  return { ok: true };
}

// Save the user's uploaded profile photo URL.
export async function updateAvatar(url: string): Promise<{ ok: boolean; error?: string }> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "You're not signed in." };
  if (!/^https?:\/\//.test(url)) return { ok: false, error: "Invalid image." };

  await prisma.user.update({ where: { id: user.id }, data: { profilePhotoUrl: url } });
  revalidatePath("/profile");
  return { ok: true };
}

// Remove the profile photo.
export async function removeAvatar(): Promise<{ ok: boolean }> {
  const user = await getCurrentUser();
  if (!user) return { ok: false };
  await prisma.user.update({ where: { id: user.id }, data: { profilePhotoUrl: null } });
  revalidatePath("/profile");
  return { ok: true };
}

// Reconfirm the existing number is still current (refreshes the 3-month clock).
export async function confirmPhoneCurrent(): Promise<{ ok: boolean; error?: string }> {
  const user = await getCurrentUser();
  if (!user || !user.phoneNumber) return { ok: false, error: "No number on file." };

  await prisma.user.update({ where: { id: user.id }, data: { phoneVerifiedAt: new Date() } });
  revalidatePath("/profile");
  return { ok: true };
}
