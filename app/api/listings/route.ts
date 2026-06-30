import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/listings?city=&type=&maxRent=&verifiedOnly=&minLease=
// Public listings only. Never exposes fullAddressPrivate.
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const city = searchParams.get("city") || undefined;
  const type = searchParams.get("type") || undefined;
  const maxRent = searchParams.get("maxRent");
  const minLease = searchParams.get("minLease");
  const verifiedOnly = searchParams.get("verifiedOnly") === "true";

  const listings = await prisma.listing.findMany({
    where: {
      listingStatus: "PUBLISHED",
      ...(city ? { city } : {}),
      ...(type ? { propertyType: type as never } : {}),
      ...(maxRent ? { monthlyRent: { lte: Number(maxRent) } } : {}),
      ...(minLease ? { minimumLeaseMonths: { lte: Number(minLease) } } : {}),
      ...(verifiedOnly ? { verificationStatus: "VERIFIED" } : {}),
    },
    orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      title: true,
      propertyType: true,
      city: true,
      barangay: true,
      monthlyRent: true,
      minimumLeaseMonths: true,
      bedrooms: true,
      bathrooms: true,
      floorArea: true,
      verificationStatus: true,
      isFeatured: true,
      photos: { select: { photoUrl: true }, orderBy: { sortOrder: "asc" }, take: 1 },
      owner: { select: { fullName: true, verificationStatus: true } },
    },
  });

  // Decimal -> number for JSON
  const data = listings.map((l) => ({
    ...l,
    monthlyRent: Number(l.monthlyRent),
    floorArea: l.floorArea ? Number(l.floorArea) : null,
  }));

  return NextResponse.json({ count: data.length, listings: data });
}
