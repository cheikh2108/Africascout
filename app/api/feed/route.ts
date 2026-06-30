import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/feed?page=1
// Retourne les dernières vidéos publiées par les joueurs sénégalais, ordre chronologique inverse.
// 10 résultats par page — adapté à la faible connectivité (spec).
export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const take = 10;
  const skip = (page - 1) * take;

  const [videos, total] = await Promise.all([
    prisma.video.findMany({
      orderBy: { createdAt: "desc" },
      take,
      skip,
      include: {
        player: {
          select: {
            id:       true,
            position: true,
            region:   true,
            user: {
              select: { fullName: true, avatarUrl: true, isVerified: true },
            },
          },
        },
      },
    }),
    prisma.video.count(),
  ]);

  return NextResponse.json({
    videos,
    pagination: { page, take, total, totalPages: Math.ceil(total / take) },
  });
}
