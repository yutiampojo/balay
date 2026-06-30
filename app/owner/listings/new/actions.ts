"use server";

import { redirect } from "next/navigation";
import { revalidateTag } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PropertyType, FurnishingStatus } from "@prisma/client";

export async function createListing(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/owner/listings/new");
  if (user.role !== "OWNER") redirect("/keyholder");

  const num = (k: string, d = 0) => {
    const v = Number(formData.get(k));
    return Number.isFinite(v) && v > 0 ? v : d;
  };

  const minLease = Math.max(3, num("minimumLeaseMonths", 3)); // business rule: >= 3
  const availableFrom = String(formData.get("availableFrom") || "");

  await prisma.listing.create({
    data: {
      ownerId: user.id,
      title: String(formData.get("title") || "Untitled listing"),
      description: String(formData.get("description") || ""),
      propertyType: (String(formData.get("propertyType")) as PropertyType) || PropertyType.CONDO,
      city: String(formData.get("city") || ""),
      barangay: String(formData.get("barangay") || ""),
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
      houseRules: String(formData.get("houseRules") || "")
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      verificationStatus: user.verificationStatus === "VERIFIED" ? "VERIFIED" : "PENDING",
      listingStatus: "PENDING_REVIEW", // admin must approve before public
    },
  });

  revalidateTag("listings");
  redirect("/dashboard");
}
