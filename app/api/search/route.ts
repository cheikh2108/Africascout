import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/search?q=...&position=...&region=...&ageGroup=...&page=...
// MVP limité au Sénégal — filtre par région parmi les 14 régions officielles
export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const q        = searchParams.get("q")?.trim() ?? "";
  const position = searchParams.get("position") ?? "";
  const region   = searchParams.get("region") ?? "";
  const ageGroup = searchParams.get("ageGroup") ?? "";
  const page     = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const take     = 10;
  const skip     = (page - 1) * take;

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });

  const ageFilter: { gte?: number; lte?: number } = {};
  if (ageGroup === "u18")  { ageFilter.lte = 18; }
  if (ageGroup === "19-21"){ ageFilter.gte = 19; ageFilter.lte = 21; }
  if (ageGroup === "22-25"){ ageFilter.gte = 22; ageFilter.lte = 25; }
  if (ageGroup === "25+")  { ageFilter.gte = 26; }

  // Tous les joueurs sont sénégalais dans le MVP
  const baseWhere = {
    country: "SN",
    ...(q        && { user: { fullName: { contains: q, mode: "insensitive" as const } } }),
    ...(position && { position: position as never }),
    ...(region   && { region }),
    ...(Object.keys(ageFilter).length > 0 && { age: ageFilter }),
  };

  const [players, total] = await Promise.all([
    prisma.playerProfile.findMany({
      where: baseWhere,
      include: {
        user:   { select: { fullName: true, avatarUrl: true, isVerified: true } },
        videos: { take: 1, orderBy: { createdAt: "desc" } },
      },
      orderBy: { rating: "desc" },
      take,
      skip,
    }),
    prisma.playerProfile.count({ where: baseWhere }),
  ]);

  return NextResponse.json({
    players,
    pagination: { page, take, total, totalPages: Math.ceil(total / take) },
  });
}
