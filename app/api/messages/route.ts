import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

// GET /api/messages?with=<userId>
// Retourne les messages entre l'utilisateur connecté et un autre utilisateur.
// Appelé toutes les 3 secondes par le client (polling).
export async function GET(req: Request) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const withUserId = searchParams.get("with");

  const me = await prisma.user.findUnique({ where: { clerkId } });
  if (!me) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });

  // Sans paramètre "with" — retourne la liste des conversations (dernier message par interlocuteur)
  if (!withUserId) {
    const messages = await prisma.message.findMany({
      where: {
        OR: [{ fromUserId: me.id }, { toUserId: me.id }],
      },
      orderBy: { createdAt: "desc" },
      include: {
        from: { select: { id: true, fullName: true, avatarUrl: true } },
        to:   { select: { id: true, fullName: true, avatarUrl: true } },
      },
    });

    // Déduplique pour garder seulement le dernier message par conversation
    const seen = new Set<string>();
    const conversations = messages.filter((m) => {
      const key = [m.fromUserId, m.toUserId].sort().join("-");
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    return NextResponse.json({ conversations });
  }

  // Avec paramètre "with" — retourne tous les messages de la conversation
  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { fromUserId: me.id,      toUserId: withUserId },
        { fromUserId: withUserId, toUserId: me.id },
      ],
    },
    orderBy: { createdAt: "asc" },
    include: {
      from: { select: { id: true, fullName: true, avatarUrl: true } },
    },
  });

  // Marque les messages reçus comme lus
  await prisma.message.updateMany({
    where: { fromUserId: withUserId, toUserId: me.id, readAt: null },
    data:  { readAt: new Date() },
  });

  return NextResponse.json({ messages, myId: me.id });
}

// POST /api/messages — envoie un message
const sendSchema = z.object({
  toUserId: z.string().uuid(),
  content:  z.string().min(1).max(2000),
});

export async function POST(req: Request) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const body = await req.json();
  const result = sendSchema.safeParse(body);
  if (!result.success) return NextResponse.json({ error: "Données invalides" }, { status: 400 });

  const me = await prisma.user.findUnique({ where: { clerkId } });
  if (!me) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });

  // Vérification que le destinataire existe
  const recipient = await prisma.user.findUnique({ where: { id: result.data.toUserId } });
  if (!recipient) return NextResponse.json({ error: "Destinataire introuvable" }, { status: 404 });

  const message = await prisma.message.create({
    data: {
      fromUserId: me.id,
      toUserId:   result.data.toUserId,
      content:    result.data.content,
    },
    include: {
      from: { select: { id: true, fullName: true, avatarUrl: true } },
    },
  });

  return NextResponse.json(message, { status: 201 });
}
