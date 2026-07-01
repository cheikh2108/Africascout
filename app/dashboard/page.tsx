import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import {
  Eye, Heart, Video, MessageCircle, User,
  Search, TrendingUp, ArrowRight, Star, MapPin, CheckCircle2
} from "lucide-react";

const POSITIONS: Record<string, string> = {
  GK: "Gardien", CB: "Défenseur central", LB: "Latéral gauche",
  RB: "Latéral droit", CM: "Milieu central", AM: "Milieu offensif",
  LW: "Ailier gauche", RW: "Ailier droit", ST: "Attaquant",
};

const CARD = "bg-[#111] border border-[#1F2937] rounded-2xl";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { playerProfile: { include: { videos: true } } },
  });

  if (!user) redirect("/onboarding");
  if (user.role === "PLAYER" && !user.playerProfile) redirect("/onboarding");

  const profile      = user.playerProfile;
  const videos       = profile?.videos ?? [];
  const totalViews   = videos.reduce((s, v) => s + v.views, 0);
  const totalLikes   = videos.reduce((s, v) => s + v.likes, 0);
  const unreadCount  = await prisma.message.count({ where: { toUserId: user.id, readAt: null } });

  return (
    <div className="min-h-screen bg-[#0D0D0D] py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-5">

        {/* ── En-tête ── */}
        <div className={`${CARD} p-5 flex items-center gap-4`}>
          <div className="relative w-14 h-14 rounded-full overflow-hidden bg-[#1F2937] flex-shrink-0 ring-2 ring-[#00A651]/30">
            {user.avatarUrl ? (
              <Image src={user.avatarUrl} alt={user.fullName} fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-heading text-xl font-bold text-[#00A651]">
                {user.fullName[0]?.toUpperCase()}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-heading text-lg font-bold text-white truncate">
              Bonjour, {user.fullName.split(" ")[0]}
            </h1>
            <p className="text-sm text-[#6B7280] flex items-center gap-1.5 mt-0.5">
              {profile ? POSITIONS[profile.position] ?? profile.position : user.role}
              {profile?.region && (
                <span className="flex items-center gap-1"><MapPin size={11} />{profile.region}</span>
              )}
            </p>
          </div>
          {unreadCount > 0 && (
            <Link
              href="/messages"
              className="flex-shrink-0 flex items-center gap-1.5 bg-[#00A651]/10 border border-[#00A651]/30 text-[#00A651] text-xs font-semibold px-3 py-2 rounded-full hover:bg-[#00A651]/20 transition-colors duration-150 cursor-pointer"
            >
              <MessageCircle size={13} />
              {unreadCount}
            </Link>
          )}
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-4 gap-2.5">
          {[
            { icon: Eye,   label: "Vues",   value: totalViews,                       color: "text-blue-400",   bg: "bg-blue-400/10" },
            { icon: Heart, label: "Likes",  value: totalLikes,                       color: "text-red-400",    bg: "bg-red-400/10" },
            { icon: Video, label: "Vidéos", value: videos.length,                    color: "text-[#00A651]",  bg: "bg-[#00A651]/10" },
            { icon: Star,  label: "Score",  value: profile?.rating.toFixed(1) ?? "—", color: "text-[#F5A623]", bg: "bg-[#F5A623]/10" },
          ].map(({ icon: Icon, label, value, color, bg }) => (
            <div key={label} className={`${CARD} p-3 sm:p-4 flex flex-col items-center gap-1.5`}>
              <div className={`w-8 h-8 rounded-xl ${bg} flex items-center justify-center`}>
                <Icon size={15} className={color} />
              </div>
              <span className="font-heading text-xl font-bold text-white leading-none">{value}</span>
              <span className="text-[10px] text-[#6B7280] font-medium">{label}</span>
            </div>
          ))}
        </div>

        {/* ── Vidéos ── */}
        <div className={`${CARD} p-5`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading font-semibold text-white flex items-center gap-2">
              <Video size={16} className="text-[#00A651]" /> Mes vidéos
            </h2>
            <Link href="/profile" className="text-xs text-[#6B7280] hover:text-white transition-colors duration-150 flex items-center gap-1 cursor-pointer">
              Gérer <ArrowRight size={12} />
            </Link>
          </div>

          {videos.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-[#1F2937] rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Video size={20} className="text-[#6B7280]" />
              </div>
              <p className="text-[#6B7280] text-sm mb-4">Aucune vidéo pour l'instant</p>
              <Link
                href="/profile"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#00A651] text-white rounded-xl text-sm font-semibold hover:bg-green-600 transition-colors duration-150 cursor-pointer"
              >
                Ajouter une vidéo
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {videos.map((v) => (
                <div key={v.id} className="flex items-center gap-3 bg-[#0D0D0D] border border-[#1F2937] rounded-xl p-3">
                  <div className="w-9 h-9 bg-[#00A651]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Video size={14} className="text-[#00A651]" />
                  </div>
                  <p className="flex-1 text-white text-sm font-medium truncate">{v.title}</p>
                  <div className="flex gap-3 text-xs text-[#6B7280] flex-shrink-0">
                    <span className="flex items-center gap-1"><Eye size={11} />{v.views}</span>
                    <span className="flex items-center gap-1"><Heart size={11} />{v.likes}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Actions rapides ── */}
        <div className="grid grid-cols-2 gap-2.5">
          {[
            { href: "/profile",  icon: User,          label: "Mon profil",  desc: "Modifier mes infos et vidéos" },
            { href: "/search",   icon: Search,        label: "Explorer",    desc: "Rechercher des joueurs" },
            { href: "/feed",     icon: TrendingUp,    label: "Feed",        desc: "Derniers highlights" },
            { href: "/messages", icon: MessageCircle, label: "Messages",    desc: "Tes conversations", badge: unreadCount },
          ].map(({ href, icon: Icon, label, desc, badge }) => (
            <Link
              key={href}
              href={href}
              className={`${CARD} p-5 hover:border-[#00A651]/40 hover:bg-[#111]/80 transition-all duration-150 cursor-pointer group relative`}
            >
              {badge && badge > 0 && (
                <span className="absolute top-3 right-3 w-5 h-5 bg-[#00A651] text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                  {badge}
                </span>
              )}
              <div className="w-9 h-9 bg-[#00A651]/10 rounded-xl flex items-center justify-center mb-3">
                <Icon size={17} className="text-[#00A651]" />
              </div>
              <div className="font-heading font-semibold text-white text-sm mb-1">{label}</div>
              <div className="text-xs text-[#6B7280] group-hover:text-gray-400 transition-colors duration-150">{desc}</div>
            </Link>
          ))}
        </div>

        {/* ── Complétion ── */}
        {profile && <ProfileCompletion profile={profile} avatarUrl={user.avatarUrl} />}
      </div>
    </div>
  );
}

function ProfileCompletion({
  profile, avatarUrl,
}: {
  profile: { bio: string | null; club: string | null; region: string | null; videos: { id: string }[] };
  avatarUrl: string | null;
}) {
  const steps = [
    { label: "Photo de profil",   done: !!avatarUrl },
    { label: "Bio renseignée",    done: !!profile.bio },
    { label: "Club renseigné",    done: !!profile.club },
    { label: "Région renseignée", done: !!profile.region },
    { label: "Vidéo ajoutée",     done: profile.videos.length > 0 },
  ];
  const completed = steps.filter((s) => s.done).length;
  const pct = Math.round((completed / steps.length) * 100);
  if (pct === 100) return null;

  return (
    <div className="bg-[#111] border border-[#1F2937] rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-heading font-semibold text-white text-sm">Complète ton profil</h2>
        <span className="text-xs text-[#00A651] font-bold">{pct}%</span>
      </div>
      <div className="w-full bg-[#1F2937] rounded-full h-1.5 mb-4 overflow-hidden">
        <div className="bg-[#00A651] h-1.5 rounded-full transition-all duration-300" style={{ width: `${pct}%` }} />
      </div>
      <div className="space-y-2 mb-4">
        {steps.map((s) => (
          <div key={s.label} className={`flex items-center gap-2 text-sm ${s.done ? "text-[#6B7280] line-through" : "text-gray-300"}`}>
            <CheckCircle2 size={14} className={s.done ? "text-[#00A651]" : "text-[#1F2937]"} />
            {s.label}
          </div>
        ))}
      </div>
      <Link
        href="/profile"
        className="flex items-center justify-center gap-2 w-full py-2.5 bg-[#00A651]/10 border border-[#00A651]/30 text-[#00A651] rounded-xl text-sm font-semibold hover:bg-[#00A651]/20 transition-colors duration-150 cursor-pointer"
      >
        Compléter mon profil <ArrowRight size={14} />
      </Link>
    </div>
  );
}
