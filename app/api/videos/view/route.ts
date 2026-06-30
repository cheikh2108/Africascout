import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({ videoId: z.string().uuid() });

// POST /api/videos/view — incrémente le compteur de vues d'une vidéo
export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const body = await req.json();
  const result = schema.safeParse(body);
  if (!result.success) return NextResponse.json({ error: "videoId invalide" }, { status: 400 });

  await prisma.video.update({
    where: { id: result.data.videoId },
    data:  { views: { increment: 1 } },
  });

  return NextResponse.json({ ok: true });
}
