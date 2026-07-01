import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import {
  Eye, Heart, Video, MessageCircle, User,
  Search, TrendingUp, ArrowRight, Star, MapPin
} from "lucide-react";

const POSITIONS: Record<string, string> = {
  GK: "Gardien", CB: "Défenseur central", LB: "Latéral gauche",
  RB: "Latéral droit", CM: "Milieu central", AM: "Milieu offensif",
  LW: "Ailier gauche", RW: "Ailier droit", ST: "Attaquant",
};

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: {
      playerProfile: { include: { videos: true } },
      _count: {
        select: {
          receivedMessages: { where: { readAt: null } },
        },
      },
    },
  });

  if (!user) redirect("/onboarding");
  if (user.role === "PLAYER" && !user.playerProfile) redirect("/onboarding");

  const profile = user.playerProfile;
  const videos  = profile?.videos ?? [];

  const totalViews  = videos.reduce((s, v) => s + v.views, 0);
  const totalLikes  = videos.reduce((s, v) => s + v.likes, 0);
  const unreadCount = user._count.receivedMessages;

  return (
    <div className="min-h-screen bg-[#0D0D0D] py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* ── En-tête ── */}
        <div className="flex items-center gap-4">
          <div className="relative w-14 h-14 rounded-full overflow-hidden bg-gray-800 flex-shrink-0">
            {user.avatarUrl ? (
              <Image src={user.avatarUrl} alt={user.fullName} fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xl font-bold text-gray-500">
                {user.fullName[0]?.toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Bonjour, {user.fullName.split(" ")[0]} 👋</h1>
            <p className="text-sm text-gray-500">
              {profile ? POSITIONS[profile.position] ?? profile.position : user.role}
              {profile?.region && <span className="ml-2 inline-flex items-center gap-1"><MapPin size={11} />{profile.region}</span>}
            </p>
          </div>
          {unreadCount > 0 && (
            <Link
              href="/messages"
              className="ml-auto flex items-center gap-2 bg-[#00A651]/10 border border-[#00A651]/30 text-[#00A651] text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-[#00A651]/20 transition"
            >
              <MessageCircle size={13} />
              {unreadCount} nouveau{unreadCount > 1 ? "x" : ""} message{unreadCount > 1 ? "s" : ""}
            </Link>
          )}
        </div>

        {/* ── Statistiques ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: Eye,          label: "Vues totales",  value: totalViews,       color: "text-blue-400" },
            { icon: Heart,        label: "Likes",          value: totalLikes,       color: "text-red-400" },
            { icon: Video,        label: "Vidéos",         value: videos.length,    color: "text-[#00A651]" },
            { icon: Star,         label: "Score",          value: profile?.rating.toFixed(1) ?? "—", color: "text-[#F5A623]" },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="bg-[#111] border border-gray-800 rounded-2xl p-4 text-center">
              <Icon size={18} className={`${color} mx-auto mb-2`} />
              <div className="text-2xl font-bold text-white">{value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {/* ── Vidéos récentes ── */}
        <div className="bg-[#111] border border-gray-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-white flex items-center gap-2">
              <Video size={16} className="text-[#00A651]" /> Mes vidéos
            </h2>
            <Link href="/profile" className="text-xs text-gray-500 hover:text-white transition flex items-center gap-1">
              Gérer <ArrowRight size={12} />
            </Link>
          </div>

          {videos.length === 0 ? (
            <div className="text-center py-6">
              <Video size={32} className="text-gray-700 mx-auto mb-3" />
              <p className="text-gray-600 text-sm mb-3">Aucune vidéo pour l'instant</p>
              <Link
                href="/profile"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#00A651] text-white rounded-lg text-sm font-semibold hover:bg-green-600 transition"
              >
                Ajouter une vidéo
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {videos.map((v) => (
                <div key={v.id} className="flex items-center gap-3 bg-gray-900 rounded-xl p-3">
                  <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Video size={14} className="text-[#00A651]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{v.title}</p>
                  </div>
                  <div className="flex gap-3 text-xs text-gray-500 flex-shrink-0">
                    <span className="flex items-center gap-1"><Eye size={11} />{v.views}</span>
                    <span className="flex items-center gap-1"><Heart size={11} />{v.likes}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Actions rapides ── */}
        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/profile"
            className="bg-[#111] border border-gray-800 rounded-2xl p-5 hover:border-[#00A651]/40 transition group"
          >
            <User size={20} className="text-[#00A651] mb-3" />
            <div className="font-semibold text-white text-sm mb-1">Mon profil</div>
            <div className="text-xs text-gray-500 group-hover:text-gray-400 transition">
              Modifier mes infos et vidéos
            </div>
          </Link>

          <Link
            href="/search"
            className="bg-[#111] border border-gray-800 rounded-2xl p-5 hover:border-[#00A651]/40 transition group"
          >
            <Search size={20} className="text-[#00A651] mb-3" />
            <div className="font-semibold text-white text-sm mb-1">Explorer</div>
            <div className="text-xs text-gray-500 group-hover:text-gray-400 transition">
              Rechercher d'autres joueurs
            </div>
          </Link>

          <Link
            href="/feed"
            className="bg-[#111] border border-gray-800 rounded-2xl p-5 hover:border-[#00A651]/40 transition group"
          >
            <TrendingUp size={20} className="text-[#00A651] mb-3" />
            <div className="font-semibold text-white text-sm mb-1">Feed</div>
            <div className="text-xs text-gray-500 group-hover:text-gray-400 transition">
              Vidéos des autres joueurs
            </div>
          </Link>

          <Link
            href="/messages"
            className="relative bg-[#111] border border-gray-800 rounded-2xl p-5 hover:border-[#00A651]/40 transition group"
          >
            {unreadCount > 0 && (
              <span className="absolute top-3 right-3 w-5 h-5 bg-[#00A651] text-white text-xs rounded-full flex items-center justify-center font-bold">
                {unreadCount}
              </span>
            )}
            <MessageCircle size={20} className="text-[#00A651] mb-3" />
            <div className="font-semibold text-white text-sm mb-1">Messages</div>
            <div className="text-xs text-gray-500 group-hover:text-gray-400 transition">
              Tes conversations
            </div>
          </Link>
        </div>

        {/* ── Complétion du profil ── */}
        {profile && (
          <ProfileCompletion profile={profile} avatarUrl={user.avatarUrl} />
        )}
      </div>
    </div>
  );
}

function ProfileCompletion({
  profile,
  avatarUrl,
}: {
  profile: { bio: string | null; club: string | null; region: string | null; videos: { id: string }[] };
  avatarUrl: string | null;
}) {
  const steps = [
    { label: "Photo de profil",  done: !!avatarUrl },
    { label: "Bio renseignée",   done: !!profile.bio },
    { label: "Club renseigné",   done: !!profile.club },
    { label: "Région renseignée",done: !!profile.region },
    { label: "Vidéo ajoutée",    done: profile.videos.length > 0 },
  ];
  const completed = steps.filter((s) => s.done).length;
  const pct = Math.round((completed / steps.length) * 100);

  if (pct === 100) return null;

  return (
    <div className="bg-[#111] border border-gray-800 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-bold text-white text-sm">Complète ton profil</h2>
        <span className="text-xs text-[#00A651] font-semibold">{pct}%</span>
      </div>
      <div className="w-full bg-gray-800 rounded-full h-1.5 mb-4">
        <div
          className="bg-[#00A651] h-1.5 rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="space-y-2">
        {steps.filter((s) => !s.done).map((s) => (
          <div key={s.label} className="flex items-center gap-2 text-sm text-gray-500">
            <div className="w-4 h-4 rounded-full border border-gray-700 flex-shrink-0" />
            {s.label}
          </div>
        ))}
      </div>
      <Link
        href="/profile"
        className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 bg-[#00A651]/10 border border-[#00A651]/30 text-[#00A651] rounded-xl text-sm font-semibold hover:bg-[#00A651]/20 transition"
      >
        Compléter mon profil <ArrowRight size={14} />
      </Link>
    </div>
  );
}
