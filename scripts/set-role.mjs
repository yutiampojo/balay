import { PrismaClient } from "@prisma/client";
const [email, role] = process.argv.slice(2);
const p = new PrismaClient();
const u = await p.user.update({ where: { email }, data: { role } });
console.log(`✓ ${u.email} is now ${u.role}`);
await p.$disconnect();
