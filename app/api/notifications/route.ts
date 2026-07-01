import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/notifications — liste les notifications de l'utilisateur connecté
export async function GET() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const me = await prisma.user.findUnique({ where: { clerkId } });
  if (!me) return NextResponse.json({ error: "Introuvable" }, { status: 404 });

  // Notifications = messages non lus reçus
  const unreadMessages = await prisma.message.findMany({
    where: { toUserId: me.id, readAt: null },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      from: { select: { id: true, fullName: true, avatarUrl: true } },
    },
  });

  const notifications = unreadMessages.map((m) => ({
    id:        m.id,
    type:      "message" as const,
    read:      false,
    createdAt: m.createdAt,
    from:      m.from,
    preview:   m.content.length > 60 ? m.content.slice(0, 60) + "…" : m.content,
  }));

  return NextResponse.json({ notifications });
}

// PATCH /api/notifications — marque toutes les notifs comme lues
export async function PATCH() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const me = await prisma.user.findUnique({ where: { clerkId } });
  if (!me) return NextResponse.json({ error: "Introuvable" }, { status: 404 });

  await prisma.message.updateMany({
    where: { toUserId: me.id, readAt: null },
    data:  { readAt: new Date() },
  });

  return NextResponse.json({ success: true });
}
