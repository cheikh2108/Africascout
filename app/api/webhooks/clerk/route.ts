import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { Role } from "@/lib/generated/prisma/enums";

// Ce handler est appelé par Clerk à chaque événement (inscription, suppression, etc.)
// Clerk signe chaque requête avec CLERK_WEBHOOK_SECRET — on vérifie la signature
// pour s'assurer que la requête vient bien de Clerk et non d'un tiers malveillant.

export async function POST(req: Request) {
  const secret = process.env.CLERK_WEBHOOK_SECRET;

  if (!secret) {
    return new Response("CLERK_WEBHOOK_SECRET manquant dans .env", { status: 500 });
  }

  // Récupération des headers de signature envoyés par Clerk
  const headersList = await headers();
  const svixId        = headersList.get("svix-id");
  const svixTimestamp = headersList.get("svix-timestamp");
  const svixSignature = headersList.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response("Headers de signature Clerk manquants", { status: 400 });
  }

  // Vérification cryptographique de la signature
  const payload = await req.text();
  const wh = new Webhook(secret);
  let event: WebhookEvent;

  try {
    event = wh.verify(payload, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as WebhookEvent;
  } catch {
    return new Response("Signature Clerk invalide", { status: 400 });
  }

  // Traitement des événements Clerk
  if (event.type === "user.created") {
    const { id, email_addresses, first_name, last_name, image_url } = event.data;

    const email = email_addresses[0]?.email_address;
    if (!email) {
      return new Response("Email manquant dans l'événement Clerk", { status: 400 });
    }

    const fullName = [first_name, last_name].filter(Boolean).join(" ") || "Utilisateur";

    // Création du User en base — rôle par défaut PLAYER, changeable à l'onboarding
    await prisma.user.create({
      data: {
        clerkId:   id,
        email,
        fullName,
        avatarUrl: image_url || null,
        role:      Role.PLAYER,
      },
    });
  }

  if (event.type === "user.deleted") {
    const { id } = event.data;
    if (id) {
      // Suppression en cascade grâce à onDelete: Cascade dans le schéma Prisma
      await prisma.user.deleteMany({ where: { clerkId: id } });
    }
  }

  if (event.type === "user.updated") {
    const { id, email_addresses, first_name, last_name, image_url } = event.data;
    const email = email_addresses[0]?.email_address;

    await prisma.user.updateMany({
      where: { clerkId: id },
      data: {
        email:     email || undefined,
        fullName:  [first_name, last_name].filter(Boolean).join(" ") || undefined,
        avatarUrl: image_url || undefined,
      },
    });
  }

  return new Response("OK", { status: 200 });
}
