"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Send a message in a conversation the current user is part of.
export async function sendMessage(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const conversationId = String(formData.get("conversationId") || "");
  const body = String(formData.get("body") || "").trim();
  if (!conversationId || !body) return;

  const convo = await prisma.conversation.findUnique({ where: { id: conversationId } });
  if (!convo || (convo.participantAId !== user.id && convo.participantBId !== user.id)) {
    return; // not a participant
  }

  await prisma.message.create({ data: { conversationId, senderId: user.id, body } });
  await prisma.conversation.update({ where: { id: conversationId }, data: { lastMessageAt: new Date() } });

  revalidatePath("/messages");
}

// Start (or reuse) a conversation with a listing's owner, then open it.
export async function startConversation(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const listingId = String(formData.get("listingId") || "");
  const listing = await prisma.listing.findUnique({ where: { id: listingId }, select: { ownerId: true } });
  if (!listing || listing.ownerId === user.id) redirect("/messages");

  const existing = await prisma.conversation.findFirst({
    where: {
      listingId,
      OR: [
        { participantAId: user.id, participantBId: listing.ownerId },
        { participantAId: listing.ownerId, participantBId: user.id },
      ],
    },
  });

  const convo =
    existing ??
    (await prisma.conversation.create({
      data: { listingId, participantAId: user.id, participantBId: listing.ownerId },
    }));

  redirect(`/messages?c=${convo.id}`);
}
