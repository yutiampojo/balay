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

  const num = (k: string, d = 0, max = 1e12) => {
    const v = Number(formData.get(k));
    return Number.isFinite(v) && v > 0 ? Math.min(v, max) : d;
  };
  const str = (k: string, max: number) => String(formData.get(k) || "").slice(0, max).trim();
  const oneOf = <T extends string>(k: string, values: readonly string[], fallback: T): T => {
    const v = String(formData.get(k) || "");
    return values.includes(v) ? (v as T) : fallback;
  };

  const minLease = Math.min(120, Math.max(3, num("minimumLeaseMonths", 3))); // 3–120 months
  const availableFrom = String(formData.get("availableFrom") || "");
  const photoUrls = formData.getAll("photoUrls").map(String).filter(Boolean).slice(0, 30);
  const city = str("city", 100);
  const barangay = str("barangay", 100);
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
      title: str("title", 120) || "Untitled listing",
      description: str("description", 5000),
      propertyType: oneOf("propertyType", Object.values(PropertyType), PropertyType.CONDO),
      city,
      barangay,
      latitude,
      longitude,
      fullAddressPrivate: str("fullAddress", 300),
      monthlyRent: num("monthlyRent", 0, 100_000_000),
      securityDeposit: num("securityDeposit", 0, 100_000_000) || null,
      advancePayment: num("advancePayment", 0, 100_000_000) || null,
      minimumLeaseMonths: minLease,
      availableFrom: availableFrom ? new Date(availableFrom) : null,
      bedrooms: num("bedrooms", 0, 50),
      bathrooms: num("bathrooms", 0, 50),
      floorArea: num("floorArea", 0, 100_000) || null,
      furnishingStatus: oneOf("furnishingStatus", Object.values(FurnishingStatus), FurnishingStatus.UNFURNISHED),
      petPolicy: str("petPolicy", 300),
      amenities: formData.getAll("amenities").map(String).slice(0, 40).map((s) => s.slice(0, 100)),
      houseRules: String(formData.get("houseRules") || "").split("\n").map((s) => s.trim()).filter(Boolean).slice(0, 40).map((s) => s.slice(0, 200)),
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
