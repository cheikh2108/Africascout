import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  cloudinaryUrl: z.string().url(),
  title:         z.string().min(1).max(150),
});

// POST /api/videos — ajoute une vidéo highlight au profil joueur
export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const body = await req.json();
  const result = schema.safeParse(body);
  if (!result.success) return NextResponse.json({ error: "Données invalides" }, { status: 400 });

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { playerProfile: { include: { _count: { select: { videos: true } } } } },
  });

  if (!user?.playerProfile) {
    return NextResponse.json({ error: "Profil joueur introuvable" }, { status: 404 });
  }

  // Limite à 3 vidéos pour le plan Free
  const videoCount = user.playerProfile._count.videos;
  if (user.subscriptionTier === "FREE" && videoCount >= 3) {
    return NextResponse.json(
      { error: "Limite de 3 vidéos atteinte sur le plan Free. Passe en Pro pour en ajouter plus." },
      { status: 403 }
    );
  }

  const video = await prisma.video.create({
    data: {
      playerId:     user.playerProfile.id,
      cloudinaryUrl: result.data.cloudinaryUrl,
      title:         result.data.title,
    },
  });

  return NextResponse.json(video, { status: 201 });
}
