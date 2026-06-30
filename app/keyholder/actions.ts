"use server";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Upgrades the current user to a Keyholder (OWNER role) and opens a pending
// owner verification. (Demo: marks verified so listing tools unlock.)
export async function becomeKeyholder(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/keyholder");

  const address = String(formData.get("address") || "");

  await prisma.user.update({
    where: { id: user.id },
    data: {
      role: "OWNER",
      verificationStatus: "VERIFIED",
      ownerProfile: {
        upsert: {
          create: { verificationStatus: "VERIFIED", adminNotes: address ? `Property: ${address}` : null },
          update: { verificationStatus: "VERIFIED" },
        },
      },
    },
  });

  redirect("/owner");
}
