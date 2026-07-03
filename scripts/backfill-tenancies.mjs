import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();
const accepted = await p.application.findMany({ where: { status: "ACCEPTED", tenancy: null }, include: { listing: { select: { minimumLeaseMonths: true } } } });
let n = 0;
for (const a of accepted) {
  await p.tenancy.create({ data: { applicationId: a.id, listingId: a.listingId, tenantId: a.tenantId, ownerId: a.ownerId, agreedLeaseMonths: a.listing.minimumLeaseMonths, status: "ACTIVE" } });
  n++;
}
console.log(`Backfilled ${n} tenancies`);
await p.$disconnect();
