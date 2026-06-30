import { PrismaClient, Role, VerificationStatus, PropertyType, FurnishingStatus, ListingStatus, TenantType } from "@prisma/client";

const prisma = new PrismaClient();

const PHOTOS = "balay_property_photos/";

// --- demo people ---------------------------------------------------------
const OWNERS = [
  { key: "carlo", fullName: "Carlo Domingo", email: "carlo@balay.demo" },
  { key: "liza", fullName: "Liza Mercado", email: "liza@balay.demo" },
  { key: "marco", fullName: "Marco Tan", email: "marco@balay.demo" },
  { key: "bianca", fullName: "Bianca Cruz", email: "bianca@balay.demo" },
  { key: "grace", fullName: "Grace Santos", email: "grace@balay.demo" },
];

// --- the 9 demo listings (mirrors index.html) ----------------------------
type Seed = {
  owner: string;
  title: string;
  type: PropertyType;
  city: string;
  brgy: string;
  rent: number;
  lease: number;
  bd: number;
  ba: number;
  area: number;
  vOwner: boolean;
  vUnit: boolean;
  photo: string;
};

const LISTINGS: Seed[] = [
  { owner: "marco", title: "Bright 1BR near Ayala", type: PropertyType.CONDO, city: "Makati", brgy: "Poblacion", rent: 28500, lease: 6, bd: 1, ba: 1, area: 34, vOwner: true, vUnit: true, photo: "photo_07_hermens_living_room.jpg" },
  { owner: "grace", title: "Quiet room near UP & review centers", type: PropertyType.ROOM, city: "Quezon City", brgy: "Diliman", rent: 7800, lease: 3, bd: 1, ba: 1, area: 14, vOwner: true, vUnit: true, photo: "photo_10_bedroom_mitcham.jpg" },
  { owner: "carlo", title: "Furnished studio in BGC", type: PropertyType.CONDO, city: "Taguig", brgy: "Fort Bonifacio", rent: 34000, lease: 12, bd: 1, ba: 1, area: 30, vOwner: true, vUnit: false, photo: "photo_03_studio_apartment.jpg" },
  { owner: "bianca", title: "2BR family apartment", type: PropertyType.APARTMENT, city: "Cebu City", brgy: "Lahug", rent: 19500, lease: 12, bd: 2, ba: 1, area: 48, vOwner: true, vUnit: true, photo: "photo_09_miller_living_area.jpg" },
  { owner: "grace", title: "Cozy house with small yard", type: PropertyType.HOUSE, city: "Davao City", brgy: "Buhangin", rent: 16000, lease: 24, bd: 3, ba: 2, area: 90, vOwner: false, vUnit: false, photo: "photo_20_vila_tugendhat_exterior.jpg" },
  { owner: "liza", title: "Pine-view studio for remote work", type: PropertyType.CONDO, city: "Baguio", brgy: "Camp 7", rent: 15500, lease: 6, bd: 1, ba: 1, area: 26, vOwner: true, vUnit: true, photo: "photo_08_jacobs_living_room.jpg" },
  { owner: "grace", title: "Bedspace for working students", type: PropertyType.ROOM, city: "Quezon City", brgy: "Katipunan", rent: 5500, lease: 3, bd: 1, ba: 1, area: 10, vOwner: true, vUnit: false, photo: "photo_12_lawnfield_bedroom.jpg" },
  { owner: "grace", title: "Modern 3BR townhouse", type: PropertyType.TOWNHOUSE, city: "Taguig", brgy: "Western Bicutan", rent: 42000, lease: 12, bd: 3, ba: 3, area: 110, vOwner: true, vUnit: true, photo: "photo_16_dewitt_apartments.jpg" },
  { owner: "bianca", title: "Affordable studio near IT Park", type: PropertyType.CONDO, city: "Cebu City", brgy: "Apas", rent: 13500, lease: 6, bd: 1, ba: 1, area: 24, vOwner: true, vUnit: true, photo: "photo_05_garnet_kitchen.jpg" },
];

const vStatus = (ok: boolean) => (ok ? VerificationStatus.VERIFIED : VerificationStatus.PENDING);

async function main() {
  console.log("Seeding Balay…");

  // Idempotent: clear transactional/listing data (users are upserted).
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.listingPhoto.deleteMany();
  await prisma.application.deleteMany();
  await prisma.inquiry.deleteMany();
  await prisma.listing.deleteMany();

  // --- users -----------------------------------------------------------
  const admin = await prisma.user.upsert({
    where: { email: "admin@balay.demo" },
    update: {},
    create: { role: Role.ADMIN, fullName: "Balay Admin", email: "admin@balay.demo", verificationStatus: VerificationStatus.VERIFIED, emailVerifiedAt: new Date() },
  });

  const tenant = await prisma.user.upsert({
    where: { email: "andrea@balay.demo" },
    update: {},
    create: {
      role: Role.TENANT,
      fullName: "Andrea Reyes",
      email: "andrea@balay.demo",
      verificationStatus: VerificationStatus.VERIFIED,
      emailVerifiedAt: new Date(),
      tenantProfile: {
        create: { tenantType: TenantType.REMOTE_WORKER, employmentStatus: "Employed", incomeRange: "₱40k–60k", verificationStatus: VerificationStatus.VERIFIED, prefCities: ["Makati", "Taguig"], prefMinLeaseMonths: 6, prefBudgetMax: 35000 },
      },
    },
  });

  const ownerByKey: Record<string, { id: string }> = {};
  for (const o of OWNERS) {
    const u = await prisma.user.upsert({
      where: { email: o.email },
      update: {},
      create: {
        role: Role.OWNER,
        fullName: o.fullName,
        email: o.email,
        verificationStatus: VerificationStatus.VERIFIED,
        emailVerifiedAt: new Date(),
        ownerProfile: { create: { verificationStatus: VerificationStatus.VERIFIED } },
      },
    });
    ownerByKey[o.key] = u;
  }

  // --- listings + photos ----------------------------------------------
  const created: Record<string, { id: string; title: string; ownerId: string }> = {};
  for (const l of LISTINGS) {
    const owner = ownerByKey[l.owner];
    const listing = await prisma.listing.create({
      data: {
        ownerId: owner.id,
        title: l.title,
        description: `${l.title} — a verified ${l.type.toLowerCase()} in ${l.city}. Minimum ${l.lease}-month lease. Monthly rent only; medium/long-term residential rental.`,
        propertyType: l.type,
        city: l.city,
        barangay: l.brgy,
        fullAddressPrivate: `${l.brgy}, ${l.city} (exact address shared after inquiry)`,
        monthlyRent: l.rent,
        securityDeposit: l.rent,
        advancePayment: l.rent,
        minimumLeaseMonths: l.lease,
        bedrooms: l.bd,
        bathrooms: l.ba,
        floorArea: l.area,
        furnishingStatus: l.type === PropertyType.ROOM ? FurnishingStatus.SEMI_FURNISHED : FurnishingStatus.FURNISHED,
        allowedOccupants: l.bd * 2,
        petPolicy: "Case by case",
        utilitiesIncluded: l.type === PropertyType.ROOM ? ["Water", "Electricity", "Wifi"] : ["Association dues"],
        amenities: ["24/7 security", "Near transport"],
        houseRules: ["No smoking indoors", "Minimum 3-month lease"],
        verificationStatus: vStatus(l.vOwner && l.vUnit),
        listingStatus: ListingStatus.PUBLISHED,
        photos: { create: { photoUrl: PHOTOS + l.photo, sortOrder: 0 } },
      },
    });
    created[l.title] = { id: listing.id, title: l.title, ownerId: owner.id };
  }

  // --- a sample conversation (mirrors messages.html: Andrea ↔ Carlo) ---
  const bgc = created["Furnished studio in BGC"];
  const convo = await prisma.conversation.create({
    data: {
      listingId: bgc.id,
      participantAId: tenant.id,
      participantBId: bgc.ownerId,
      lastMessageAt: new Date(),
      messages: {
        create: [
          { senderId: bgc.ownerId, body: "Hi Andrea! Thanks for your interest in the BGC studio. It's still available for a 12-month lease.", createdAt: new Date(Date.now() - 3 * 864e5) },
          { senderId: tenant.id, body: "Great! Is it fully furnished? And is the rent negotiable for a longer term?", createdAt: new Date(Date.now() - 3 * 864e5 + 6e5) },
          { senderId: bgc.ownerId, body: "Yes — bed, fridge, washer, and a study desk are included. For 12 months I can do ₱33,000.", createdAt: new Date(Date.now() - 3 * 864e5 + 12e5) },
          { senderId: tenant.id, body: "That works for me. Could I schedule a viewing this weekend?", createdAt: new Date(Date.now() - 2e5) },
        ],
      },
    },
  });

  // --- a sample inquiry + application ----------------------------------
  await prisma.inquiry.create({
    data: { listingId: bgc.id, tenantId: tenant.id, ownerId: bgc.ownerId, message: "Is the unit available for a Saturday viewing?", intendedLeaseMonths: 12, numberOfOccupants: 1, status: "REPLIED" },
  });
  await prisma.application.create({
    data: { listingId: bgc.id, tenantId: tenant.id, ownerId: bgc.ownerId, status: "SHORTLISTED", tenantType: TenantType.REMOTE_WORKER, employmentStatus: "Employed", incomeRange: "₱40k–60k", message: "Excited to apply!", consentGiven: true },
  });

  const counts = {
    users: await prisma.user.count(),
    listings: await prisma.listing.count(),
    photos: await prisma.listingPhoto.count(),
    conversations: await prisma.conversation.count(),
    messages: await prisma.message.count(),
    inquiries: await prisma.inquiry.count(),
    applications: await prisma.application.count(),
  };
  console.log("Seed complete:", counts);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
