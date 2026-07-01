import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { Role } from "@/lib/generated/prisma/enums";

// Schéma de validation Zod — on n'accepte que les rôles valides
const schema = z.object({
  role:     z.enum(["PLAYER", "SCOUT", "ACADEMY", "AGENT"]),
  fullName: z.string().min(2).max(100),
});

export async function POST(req: Request) {
  // Vérification que l'utilisateur est bien connecté via Clerk
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  // Validation des données envoyées par le formulaire
  const body = await req.json();
  const result = schema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: "Données invalides" }, { status: 400 });
  }

  const { role, fullName } = result.data;

  // Upsert : crée le User s'il n'existe pas (cas où le webhook Clerk a raté)
  const user = await prisma.user.upsert({
    where:  { clerkId: userId },
    update: { role: role as Role, fullName },
    create: { clerkId: userId, role: role as Role, fullName, email: `${userId}@clerk.local` },
  });

  // Création du profil spécifique selon le rôle choisi
  if (role === "PLAYER") {
    // Vérifie qu'un profil joueur n'existe pas déjà (idempotent)
    await prisma.playerProfile.upsert({
      where:  { userId: user.id },
      update: {},
      create: {
        userId:   user.id,
        age:      0,         // sera rempli à l'édition du profil
        position: "ST",      // position par défaut
        country:  "SN",      // pays par défaut
      },
    });
  }

  if (role === "SCOUT" || role === "AGENT") {
    await prisma.scoutProfile.upsert({
      where:  { userId: user.id },
      update: {},
      create: { userId: user.id },
    });
  }

  if (role === "ACADEMY") {
    await prisma.academy.upsert({
      where:  { userId: user.id },
      update: {},
      create: {
        userId:  user.id,
        name:    fullName,
        country: "SN",
      },
    });
  }

  return NextResponse.json({ success: true });
}
