import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();
const users = await p.user.findMany({ orderBy: { createdAt: "asc" }, select: { email: true, role: true, fullName: true } });
for (const u of users) console.log(`${u.role.padEnd(7)} ${u.email}  (${u.fullName})`);
await p.$disconnect();
