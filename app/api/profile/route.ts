import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

// Schéma de validation pour la mise à jour du profil joueur
const profileSchema = z.object({
  fullName:  z.string().min(2).max(100).optional(),
  avatarUrl: z.string().url().optional().nullable(),
  age:       z.number().int().min(10).max(50).optional(),
  position:  z.enum(["GK","CB","LB","RB","CM","AM","LW","RW","ST"]).optional(),
  country:   z.string().length(2).optional(),
  region:    z.string().max(50).optional().nullable(),
  club:      z.string().max(100).optional().nullable(),
  bio:       z.string().max(500).optional().nullable(),
  stats: z.object({
    goals:   z.number().int().min(0).optional(),
    assists: z.number().int().min(0).optional(),
    matches: z.number().int().min(0).optional(),
    minutes: z.number().int().min(0).optional(),
  }).optional(),
});

// GET /api/profile — récupère le profil du joueur connecté
export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { playerProfile: { include: { videos: { orderBy: { createdAt: "desc" } } } } },
  });

  if (!user) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });

  return NextResponse.json(user);
}

// PATCH /api/profile — met à jour le profil joueur
export async function PATCH(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const body = await req.json();
  const result = profileSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: "Données invalides", details: result.error.flatten() }, { status: 400 });
  }

  const { fullName, avatarUrl, age, position, country, region, club, bio, stats } = result.data;

  // Récupère le User pour avoir son id interne
  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });

  // Vérification de propriété — un utilisateur ne peut modifier QUE son propre profil
  if (user.clerkId !== userId) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  // Met à jour les infos communes (nom, avatar)
  if (fullName || avatarUrl !== undefined) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(fullName   && { fullName }),
        ...(avatarUrl !== undefined && { avatarUrl }),
      },
    });
  }

  // Met à jour le profil joueur
  if (user.role === "PLAYER") {
    const currentProfile = await prisma.playerProfile.findUnique({ where: { userId: user.id } });
    const currentStats = (currentProfile?.stats as Record<string, number>) ?? {};

    await prisma.playerProfile.update({
      where: { userId: user.id },
      data: {
        ...(age      !== undefined && { age }),
        ...(position !== undefined && { position }),
        ...(country  !== undefined && { country }),
        ...(region   !== undefined && { region }),
        ...(club     !== undefined && { club }),
        ...(bio      !== undefined && { bio }),
        ...(stats    !== undefined && { stats: { ...currentStats, ...stats } }),
      },
    });
  }

  return NextResponse.json({ success: true });
}
