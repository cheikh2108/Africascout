import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { MapPin, Star, Play, ArrowLeft, Eye, Heart, MessageCircle } from "lucide-react";

const POSITIONS: Record<string, string> = {
  GK: "Gardien", CB: "Défenseur central", LB: "Latéral gauche",
  RB: "Latéral droit", CM: "Milieu central", AM: "Milieu offensif",
  LW: "Ailier gauche", RW: "Ailier droit", ST: "Attaquant",
};

const COUNTRIES: Record<string, string> = {
  SN: "Sénégal", GH: "Ghana", NG: "Nigeria", CI: "Côte d'Ivoire",
  MA: "Maroc", EG: "Égypte", CM: "Cameroun", ML: "Mali",
  GN: "Guinée", ZA: "Afrique du Sud", TN: "Tunisie", DZ: "Algérie",
  FR: "France", GB: "Angleterre",
};

// Page serveur — meilleure performance, pas besoin de "use client"
export default async function PlayerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { userId: clerkId } = await auth();

  const [player, me] = await Promise.all([
    prisma.playerProfile.findUnique({
    where: { id },
      include: {
        user:   { select: { fullName: true, avatarUrl: true, isVerified: true } },
        videos: { orderBy: { createdAt: "desc" } },
      },
    }),
    clerkId ? prisma.user.findUnique({ where: { clerkId } }) : null,
  ]);

  if (!player) notFound();

  // On ne montre pas le bouton "Contacter" sur son propre profil
  const isOwnProfile = me?.id === player.userId;

  const stats = (player.stats as Record<string, number>) ?? {};

  return (
    <div className="min-h-screen bg-[#0D0D0D] py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-5">

        {/* Bouton retour */}
        <Link
          href="/search"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-white transition"
        >
          <ArrowLeft size={15} /> Retour aux résultats
        </Link>

        {/* Carte profil */}
        <div className="bg-[#111] border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center gap-4 mb-5">
            <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-800 flex-shrink-0">
              {player.user.avatarUrl ? (
                <Image src={player.user.avatarUrl} alt={player.user.fullName} fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-gray-500">
                  {player.user.fullName[0]?.toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white">{player.user.fullName}</h1>
                {player.user.isVerified && (
                  <span className="text-xs bg-[#00A651]/20 text-[#00A651] px-2 py-0.5 rounded-full">✓ Vérifié</span>
                )}
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                <span className="text-gray-300 font-medium">{POSITIONS[player.position] ?? player.position}</span>
                <span className="flex items-center gap-1"><MapPin size={12} />{COUNTRIES[player.country] ?? player.country}</span>
                <span>{player.age} ans</span>
              </div>
              {player.club && <p className="text-xs text-gray-600 mt-0.5">{player.club}</p>}
            </div>
            {/* Score composite */}
            <div className="ml-auto text-right">
              <div className="flex items-center gap-1 text-[#F5A623] justify-end">
                <Star size={16} fill="#F5A623" />
                <span className="text-2xl font-bold">{player.rating.toFixed(1)}</span>
              </div>
              <div className="text-xs text-gray-600">score global</div>
            </div>
          </div>

          {/* Bouton contacter — visible uniquement si ce n'est pas son propre profil */}
          {!isOwnProfile && (
            <Link
              href={`/messages?with=${player.userId}`}
              className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 border border-[#00A651] text-[#00A651] rounded-xl text-sm font-semibold hover:bg-[#00A651] hover:text-white transition"
            >
              <MessageCircle size={16} /> Contacter
            </Link>
          )}

          {player.bio && (
            <p className="text-gray-400 text-sm leading-relaxed border-t border-gray-800 pt-4 mt-4">{player.bio}</p>
          )}
        </div>

        {/* Statistiques */}
        <div className="bg-[#111] border border-gray-800 rounded-2xl p-6">
          <h2 className="text-base font-bold text-white mb-4">Statistiques saison</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { key: "goals",   label: "Buts",    emoji: "⚽" },
              { key: "assists", label: "Passes",   emoji: "🎯" },
              { key: "matches", label: "Matchs",   emoji: "🏟️" },
              { key: "minutes", label: "Minutes",  emoji: "⏱️" },
            ].map(({ key, label, emoji }) => (
              <div key={key} className="bg-gray-900 rounded-xl p-4 text-center">
                <div className="text-xl mb-1">{emoji}</div>
                <div className="text-2xl font-bold text-white">{stats[key] ?? 0}</div>
                <div className="text-xs text-gray-500 mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Vidéos */}
        {player.videos.length > 0 && (
          <div className="bg-[#111] border border-gray-800 rounded-2xl p-6">
            <h2 className="text-base font-bold text-white mb-4">Vidéos highlights</h2>
            <div className="space-y-3">
              {player.videos.map((v) => (
                <a
                  key={v.id}
                  href={v.cloudinaryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 bg-gray-900 rounded-xl p-3 hover:bg-gray-800 transition group"
                >
                  <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-[#00A651]/20 transition">
                    <Play size={16} className="text-[#00A651]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{v.title}</p>
                    <div className="flex gap-3 text-xs text-gray-500 mt-0.5">
                      <span className="flex items-center gap-1"><Eye size={11} />{v.views}</span>
                      <span className="flex items-center gap-1"><Heart size={11} />{v.likes}</span>
                    </div>
                  </div>
                  <span className="text-xs text-[#00A651] group-hover:underline">Voir →</span>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
