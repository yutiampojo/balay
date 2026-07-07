"use server";

import { redirect } from "next/navigation";
import { revalidateTag } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PropertyType, FurnishingStatus } from "@prisma/client";
import { geocodeArea } from "@/lib/geo";

// Become a host (Keyholder) AND create the first listing from the wizard.
// The user keeps tenant abilities — role OWNER just unlocks hosting.
export async function becomeHost(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/keyholder");

  const num = (k: string, d = 0) => {
    const v = Number(formData.get(k));
    return Number.isFinite(v) && v > 0 ? v : d;
  };

  const minLease = Math.max(3, num("minimumLeaseMonths", 3)); // business rule: >= 3
  const availableFrom = String(formData.get("availableFrom") || "");
  const photoUrls = formData.getAll("photoUrls").map(String).filter(Boolean);
  const city = String(formData.get("city") || "");
  const barangay = String(formData.get("barangay") || "");
  const [latitude, longitude] = await geocodeArea(city, barangay);

  // 1. Upgrade to Keyholder (verified owner) — tenant features remain available.
  await prisma.user.update({
    where: { id: user.id },
    data: {
      role: user.role === "ADMIN" ? "ADMIN" : "OWNER", // don't downgrade admins
      // Identity is NOT auto-verified — the user must submit a government ID
      // from their profile, which an admin reviews. (Verify via /profile.)
      ownerProfile: { upsert: { create: {}, update: {} } },
    },
  });

  // 2. Create the listing described in the wizard (pending admin review).
  await prisma.listing.create({
    data: {
      ownerId: user.id,
      title: String(formData.get("title") || "Untitled listing"),
      description: String(formData.get("description") || ""),
      propertyType: (String(formData.get("propertyType")) as PropertyType) || PropertyType.CONDO,
      city,
      barangay,
      latitude,
      longitude,
      fullAddressPrivate: String(formData.get("fullAddress") || ""),
      monthlyRent: num("monthlyRent", 0),
      securityDeposit: num("securityDeposit", 0) || null,
      advancePayment: num("advancePayment", 0) || null,
      minimumLeaseMonths: minLease,
      availableFrom: availableFrom ? new Date(availableFrom) : null,
      bedrooms: num("bedrooms", 0),
      bathrooms: num("bathrooms", 0),
      floorArea: num("floorArea", 0) || null,
      furnishingStatus: (String(formData.get("furnishingStatus")) as FurnishingStatus) || FurnishingStatus.UNFURNISHED,
      petPolicy: String(formData.get("petPolicy") || ""),
      amenities: formData.getAll("amenities").map(String),
      houseRules: String(formData.get("houseRules") || "").split("\n").map((s) => s.trim()).filter(Boolean),
      verificationStatus: "VERIFIED",
      listingStatus: "PENDING_REVIEW",
      photos: {
        create: photoUrls.map((url, i) => ({ photoUrl: url, sortOrder: i })),
      },
    },
  });

  revalidateTag("listings");
  redirect("/owner");
}
