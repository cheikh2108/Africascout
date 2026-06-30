import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({ videoId: z.string().uuid() });

// POST /api/videos/like — incrémente le compteur de likes d'une vidéo
export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const body = await req.json();
  const result = schema.safeParse(body);
  if (!result.success) return NextResponse.json({ error: "videoId invalide" }, { status: 400 });

  const video = await prisma.video.update({
    where: { id: result.data.videoId },
    data:  { likes: { increment: 1 } },
    select: { likes: true },
  });

  return NextResponse.json({ likes: video.likes });
}
