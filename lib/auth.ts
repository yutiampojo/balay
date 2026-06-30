import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

// Returns the authenticated user as a synced Prisma User row, or null.
// On first login the row is created from Supabase Auth metadata.
export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) return null;

  // Read-first: the row almost always exists, so avoid a write on every page load.
  const existing = await prisma.user.findUnique({ where: { email: user.email } });
  if (existing) return existing;

  // First login — create the synced profile once.
  const role = (user.user_metadata?.role as Role) || Role.TENANT;
  const fullName = (user.user_metadata?.full_name as string) || user.email;
  return prisma.user.create({
    data: {
      email: user.email,
      fullName,
      role,
      emailVerifiedAt: user.email_confirmed_at ? new Date(user.email_confirmed_at) : null,
      ...(role === Role.OWNER ? { ownerProfile: { create: {} } } : { tenantProfile: { create: {} } }),
    },
  });
}
