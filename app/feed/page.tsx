"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Eye, Play, MapPin, Loader2 } from "lucide-react";

const POSITIONS: Record<string, string> = {
  GK: "Gardien", CB: "Défenseur central", LB: "Latéral gauche",
  RB: "Latéral droit", CM: "Milieu central", AM: "Milieu offensif",
  LW: "Ailier gauche", RW: "Ailier droit", ST: "Attaquant",
};

type FeedVideo = {
  id: string;
  cloudinaryUrl: string;
  title: string;
  views: number;
  likes: number;
  createdAt: string;
  player: {
    id: string;
    position: string;
    region: string | null;
    user: { fullName: string; avatarUrl: string | null; isVerified: boolean };
  };
};

function timeAgo(dateStr: string): string {
  const diff  = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins  < 60) return `${mins}min`;
  if (hours < 24) return `${hours}h`;
  if (days  < 7)  return `${days}j`;
  return new Date(dateStr).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

export default function FeedPage() {
  const [videos,     setVideos]     = useState<FeedVideo[]>([]);
  const [page,       setPage]       = useState(1);
  const [hasMore,    setHasMore]    = useState(true);
  const [loading,    setLoading]    = useState(false);
  const [likedIds,   setLikedIds]   = useState<Set<string>>(new Set());
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});
  const loaderRef = useRef<HTMLDivElement>(null);

  const loadPage = useCallback(async (p: number) => {
    if (loading) return;
    setLoading(true);
    const res  = await fetch(`/api/feed?page=${p}`);
    const data = await res.json();
    const newVideos: FeedVideo[] = data.videos ?? [];
    setVideos((prev) => p === 1 ? newVideos : [...prev, ...newVideos]);
    setHasMore(p < (data.pagination?.totalPages ?? 1));
    setPage(p);
    setLikeCounts((prev) => {
      const next = { ...prev };
      newVideos.forEach((v) => { if (!(v.id in next)) next[v.id] = v.likes; });
      return next;
    });
    setLoading(false);
  }, [loading]);

  useEffect(() => { loadPage(1); }, []); // eslint-disable-line

  useEffect(() => {
    const el = loaderRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting && hasMore && !loading) loadPage(page + 1); },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loading, page, loadPage]);

  const handleLike = async (videoId: string) => {
    if (likedIds.has(videoId)) return;
    setLikedIds((prev) => new Set(prev).add(videoId));
    setLikeCounts((prev) => ({ ...prev, [videoId]: (prev[videoId] ?? 0) + 1 }));
    fetch("/api/videos/like", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ videoId }),
    });
  };

  return (
    <div className="min-h-screen bg-[var(--surface)] py-8 px-4">
      <div className="max-w-xl mx-auto">

        <div className="mb-7">
          <h1 className="font-heading text-2xl font-bold text-[var(--ink)] mb-1">Feed</h1>
          <p className="text-[var(--muted)] text-sm">Derniers highlights du football sénégalais</p>
        </div>

        <div className="space-y-4">
          <AnimatePresence>
            {videos.map((video, i) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.04, 0.3), duration: 0.25 }}
                className="bg-[var(--panel)] border border-[var(--stroke)] rounded-2xl overflow-hidden"
              >
                {/* Header joueur */}
                <div className="flex items-center gap-3 p-4 pb-3">
                  <Link href={`/players/${video.player.id}`} className="flex-shrink-0 cursor-pointer">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden bg-[var(--stroke)] ring-1 ring-[var(--stroke)]">
                      {video.player.user.avatarUrl ? (
                        <Image src={video.player.user.avatarUrl} alt={video.player.user.fullName} fill className="object-cover" loading="lazy" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-heading font-bold text-[#00A651] text-sm">
                          {video.player.user.fullName[0]?.toUpperCase()}
                        </div>
                      )}
                    </div>
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link href={`/players/${video.player.id}`} className="cursor-pointer hover:text-[#00A651] transition-colors duration-150">
                      <span className="font-semibold text-[var(--ink)] text-sm">
                        {video.player.user.fullName}
                      </span>
                      {video.player.user.isVerified && (
                        <span className="ml-1.5 text-xs text-[#00A651] font-bold">✓</span>
                      )}
                    </Link>
                    <div className="flex items-center gap-2 text-xs text-[var(--muted)] mt-0.5">
                      <span>{POSITIONS[video.player.position] ?? video.player.position}</span>
                      {video.player.region && (
                        <span className="flex items-center gap-0.5"><MapPin size={9} />{video.player.region}</span>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-[var(--muted)] flex-shrink-0">{timeAgo(video.createdAt)}</span>
                </div>

                {/* Titre */}
                <div className="px-4 pb-3">
                  <p className="text-[var(--ink)] text-sm font-medium">{video.title}</p>
                </div>

                {/* Thumbnail */}
                <a
                  href={video.cloudinaryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block relative bg-[var(--panel-alt)] mx-4 rounded-xl overflow-hidden group cursor-pointer"
                  style={{ aspectRatio: "16/9" }}
                  onClick={() => {
                    fetch("/api/videos/view", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ videoId: video.id }),
                    });
                  }}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-14 h-14 bg-black/60 rounded-full flex items-center justify-center group-hover:bg-[#00A651]/80 transition-colors duration-150">
                      <Play size={22} fill="white" className="text-white ml-1" />
                    </div>
                  </div>
                  <div className="absolute bottom-2 right-2 text-xs text-white bg-black/70 px-2 py-0.5 rounded-md">
                    Voir ↗
                  </div>
                </a>

                {/* Actions */}
                <div className="flex items-center gap-5 px-4 py-3">
                  <button
                    onClick={() => handleLike(video.id)}
                    aria-label="Liker cette vidéo"
                    className={`flex items-center gap-1.5 text-sm transition-colors duration-150 cursor-pointer ${
                      likedIds.has(video.id) ? "text-red-400" : "text-[var(--muted)] hover:text-red-400"
                    }`}
                  >
                    <Heart size={16} fill={likedIds.has(video.id) ? "currentColor" : "none"} />
                    <span>{likeCounts[video.id] ?? video.likes}</span>
                  </button>
                  <span className="flex items-center gap-1.5 text-sm text-[var(--muted)]">
                    <Eye size={16} />
                    <span>{video.views}</span>
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          <div ref={loaderRef} className="flex justify-center py-6">
            {loading && <Loader2 size={20} className="text-[#00A651] animate-spin" />}
            {!loading && !hasMore && videos.length > 0 && (
              <p className="text-[var(--muted)] text-sm">Tu as tout vu</p>
            )}
          </div>

          {!loading && videos.length === 0 && (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-[var(--panel)] border border-[var(--stroke)] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Play size={28} className="text-[var(--muted)]" />
              </div>
              <p className="text-[var(--muted)] font-medium">Aucune vidéo pour l'instant</p>
              <p className="text-sm text-[var(--muted)]/60 mt-1">Les joueurs publient leurs highlights ici</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
