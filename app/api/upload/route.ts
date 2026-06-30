import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

// Cloudinary est configuré avec les clés depuis .env
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// POST /api/upload — génère une signature sécurisée pour uploader depuis le navigateur
// Le client envoie ensuite le fichier directement à Cloudinary avec cette signature.
// L'api_secret ne sort jamais du serveur.
export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { uploadType } = await req.json(); // "avatar" ou "video"

  const timestamp = Math.round(Date.now() / 1000);
  const folder = uploadType === "video" ? "africascout/videos" : "africascout/avatars";

  // Paramètres de transformation selon le type
  const params: Record<string, string | number> = {
    timestamp,
    folder,
    ...(uploadType === "avatar" && {
      transformation: "w_400,h_400,c_fill,g_face,f_webp,q_auto",
    }),
    ...(uploadType === "video" && {
      resource_type: "video",
      transformation: "q_auto,f_mp4",
    }),
  };

  const signature = cloudinary.utils.api_sign_request(
    params,
    process.env.CLOUDINARY_API_SECRET!
  );

  return NextResponse.json({
    signature,
    timestamp,
    folder,
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    apiKey:    process.env.CLOUDINARY_API_KEY,
  });
}
