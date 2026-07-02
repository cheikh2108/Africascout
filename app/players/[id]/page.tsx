import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { MapPin, Star, Play, ArrowLeft, Eye, Heart, MessageCircle, CheckCircle2 } from "lucide-react";

const POSITIONS: Record<string, string> = {
  GK: "Gardien", CB: "Défenseur central", LB: "Latéral gauche",
  RB: "Latéral droit", CM: "Milieu central", AM: "Milieu offensif",
  LW: "Ailier gauche", RW: "Ailier droit", ST: "Attaquant",
};

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

  const isOwnProfile = me?.id === player.userId;
  const stats = (player.stats as Record<string, number>) ?? {};

  return (
    <div className="min-h-screen bg-[var(--surface)] py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-4">

        <Link
          href="/search"
          className="inline-flex items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--ink)] transition-colors duration-150 cursor-pointer"
        >
          <ArrowLeft size={15} /> Retour
        </Link>

        {/* Carte profil */}
        <div className="bg-[var(--panel)] border border-[var(--stroke)] rounded-2xl p-6">
          <div className="flex items-start gap-4 mb-5">
            <div className="relative w-16 h-16 rounded-full overflow-hidden bg-[var(--stroke)] flex-shrink-0 ring-2 ring-[#00A651]/30">
              {player.user.avatarUrl ? (
                <Image src={player.user.avatarUrl} alt={player.user.fullName} fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-heading text-2xl font-bold text-[#00A651]">
                  {player.user.fullName[0]?.toUpperCase()}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-heading text-xl font-bold text-[var(--ink)]">{player.user.fullName}</h1>
                {player.user.isVerified && (
                  <span className="flex items-center gap-1 text-xs bg-[#00A651]/15 text-[#00A651] px-2 py-0.5 rounded-full font-semibold">
                    <CheckCircle2 size={11} /> Vérifié
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 text-sm text-[var(--muted)] mt-1 flex-wrap">
                <span className="text-[var(--ink)] font-medium">{POSITIONS[player.position] ?? player.position}</span>
                <span className="flex items-center gap-1"><MapPin size={12} />Sénégal</span>
                <span>{player.age} ans</span>
              </div>
              {player.club && <p className="text-xs text-[var(--muted)] mt-1">{player.club}</p>}
            </div>
            <div className="flex-shrink-0 text-right">
              <div className="flex items-center gap-1 text-[#F5A623] justify-end">
                <Star size={16} fill="#F5A623" />
                <span className="font-heading text-2xl font-bold text-[var(--ink)]">{player.rating.toFixed(1)}</span>
              </div>
              <div className="text-xs text-[var(--muted)]">score</div>
            </div>
          </div>

          {!isOwnProfile && (
            <Link
              href={`/messages?with=${player.userId}`}
              className="flex items-center justify-center gap-2 w-full py-3 bg-[#00A651] text-white rounded-xl text-sm font-semibold hover:bg-green-600 transition-colors duration-150 cursor-pointer"
            >
              <MessageCircle size={16} /> Contacter
            </Link>
          )}

          {player.bio && (
            <p className="text-[var(--muted)] text-sm leading-relaxed border-t border-[var(--stroke)] pt-4 mt-4">
              {player.bio}
            </p>
          )}
        </div>

        {/* Stats */}
        <div className="bg-[var(--panel)] border border-[var(--stroke)] rounded-2xl p-6">
          <h2 className="font-heading font-semibold text-[var(--ink)] mb-4">Statistiques saison</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { key: "goals",   label: "Buts",    icon: "⚽" },
              { key: "assists", label: "Passes",  icon: "🎯" },
              { key: "matches", label: "Matchs",  icon: "🏟" },
              { key: "minutes", label: "Minutes", icon: "⏱" },
            ].map(({ key, label, icon }) => (
              <div key={key} className="bg-[var(--panel-alt)] border border-[var(--stroke)] rounded-xl p-4 text-center">
                <div className="text-xl mb-1">{icon}</div>
                <div className="font-heading text-2xl font-bold text-[var(--ink)]">{stats[key] ?? 0}</div>
                <div className="text-xs text-[var(--muted)] mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Vidéos */}
        {player.videos.length > 0 && (
          <div className="bg-[var(--panel)] border border-[var(--stroke)] rounded-2xl p-6">
            <h2 className="font-heading font-semibold text-[var(--ink)] mb-4">Vidéos highlights</h2>
            <div className="space-y-2.5">
              {player.videos.map((v) => (
                <a
                  key={v.id}
                  href={v.cloudinaryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 bg-[var(--panel-alt)] border border-[var(--stroke)] rounded-xl p-3 hover:border-[#00A651]/40 transition-all duration-150 group cursor-pointer"
                >
                  <div className="w-10 h-10 bg-[#00A651]/10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-[#00A651]/20 transition-colors duration-150">
                    <Play size={16} className="text-[#00A651]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[var(--ink)] text-sm font-medium truncate">{v.title}</p>
                    <div className="flex gap-3 text-xs text-[var(--muted)] mt-0.5">
                      <span className="flex items-center gap-1"><Eye size={10} />{v.views}</span>
                      <span className="flex items-center gap-1"><Heart size={10} />{v.likes}</span>
                    </div>
                  </div>
                  <span className="text-xs text-[#00A651] group-hover:underline flex-shrink-0">Voir →</span>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
