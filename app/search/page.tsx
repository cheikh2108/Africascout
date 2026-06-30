"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Search, SlidersHorizontal, X, MapPin, Star, Play, ChevronLeft, ChevronRight } from "lucide-react";
import { REGIONS_SENEGAL } from "@/lib/senegal";

const POSITIONS = [
  { value: "", label: "Tous les postes" },
  { value: "GK", label: "Gardien" },
  { value: "CB", label: "Défenseur central" },
  { value: "LB", label: "Latéral gauche" },
  { value: "RB", label: "Latéral droit" },
  { value: "CM", label: "Milieu central" },
  { value: "AM", label: "Milieu offensif" },
  { value: "LW", label: "Ailier gauche" },
  { value: "RW", label: "Ailier droit" },
  { value: "ST", label: "Attaquant" },
];

const AGE_GROUPS = [
  { value: "", label: "Tous les âges" },
  { value: "u18",   label: "≤ 18 ans" },
  { value: "19-21", label: "19 – 21 ans" },
  { value: "22-25", label: "22 – 25 ans" },
  { value: "25+",   label: "25+ ans" },
];

type Player = {
  id: string;
  age: number;
  position: string;
  region: string | null;
  club: string | null;
  rating: number;
  user: { fullName: string; avatarUrl: string | null; isVerified: boolean };
  videos: { id: string }[];
};

type Pagination = { page: number; total: number; totalPages: number };

export default function SearchPage() {
  const [query,    setQuery]    = useState("");
  const [position, setPosition] = useState("");
  const [region,   setRegion]   = useState("");
  const [ageGroup, setAgeGroup] = useState("");
  const [page,     setPage]     = useState(1);
  const [players,  setPlayers]  = useState<Player[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading,  setLoading]  = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searched, setSearched] = useState(false);

  const doSearch = useCallback(async (p = 1) => {
    setLoading(true);
    setSearched(true);
    const params = new URLSearchParams();
    if (query)    params.set("q", query);
    if (position) params.set("position", position);
    if (region)   params.set("region", region);
    if (ageGroup) params.set("ageGroup", ageGroup);
    params.set("page", String(p));

    const res  = await fetch(`/api/search?${params.toString()}`);
    const data = await res.json();
    setPlayers(data.players ?? []);
    setPagination(data.pagination ?? null);
    setPage(p);
    setLoading(false);
  }, [query, position, region, ageGroup]);

  // Relance la recherche dès qu'un filtre change
  useEffect(() => {
    if (position || region || ageGroup) doSearch(1);
  }, [position, region, ageGroup]); // eslint-disable-line

  const hasActiveFilters = !!(position || region || ageGroup);
  const activeFilterCount = [position, region, ageGroup].filter(Boolean).length;

  const clearFilters = () => { setPosition(""); setRegion(""); setAgeGroup(""); };

  return (
    <div className="min-h-screen bg-[#0D0D0D] py-8 px-4">
      <div className="max-w-3xl mx-auto">

        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-1">Rechercher des joueurs</h1>
          <p className="text-gray-500 text-sm">
            🇸🇳 Talents du football sénégalais — 14 régions
          </p>
        </div>

        {/* Barre de recherche */}
        <div className="flex gap-2 mb-4">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && doSearch(1)}
              placeholder="Nom du joueur, club..."
              className="w-full bg-[#111] border border-gray-800 rounded-xl pl-9 pr-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#00A651] transition"
            />
          </div>
          <button
            onClick={() => doSearch(1)}
            className="px-5 bg-[#00A651] text-white rounded-xl font-semibold hover:bg-green-600 transition"
          >
            Chercher
          </button>
          <button
            onClick={() => setShowFilters((v) => !v)}
            className={`px-3 border rounded-xl transition flex items-center gap-1.5 text-sm ${
              hasActiveFilters
                ? "border-[#00A651] text-[#00A651] bg-[#00A651]/10"
                : "border-gray-700 text-gray-400 hover:border-gray-500"
            }`}
          >
            <SlidersHorizontal size={15} />
            Filtres
            {hasActiveFilters && (
              <span className="w-4 h-4 bg-[#00A651] text-white rounded-full text-xs flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Panneau de filtres */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-4"
            >
              <div className="bg-[#111] border border-gray-800 rounded-xl p-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Poste</label>
                  <select
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#00A651]"
                  >
                    {POSITIONS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Région</label>
                  <select
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#00A651]"
                  >
                    <option value="">Toutes les régions</option>
                    {REGIONS_SENEGAL.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Tranche d'âge</label>
                  <select
                    value={ageGroup}
                    onChange={(e) => setAgeGroup(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#00A651]"
                  >
                    {AGE_GROUPS.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
                  </select>
                </div>
              </div>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="mt-2 flex items-center gap-1 text-xs text-gray-500 hover:text-white transition"
                >
                  <X size={12} /> Effacer les filtres
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* États */}
        {loading && (
          <div className="flex justify-center py-16">
            <div className="w-7 h-7 border-2 border-[#00A651] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && searched && players.length === 0 && (
          <div className="text-center py-16 text-gray-600">
            <Search size={40} className="mx-auto mb-3 opacity-30" />
            <p>Aucun joueur trouvé pour ces critères.</p>
          </div>
        )}

        {!loading && !searched && (
          <div className="text-center py-16 text-gray-700">
            <p className="text-sm">Lance une recherche ou applique des filtres pour découvrir des joueurs.</p>
          </div>
        )}

        {/* Résultats */}
        {!loading && players.length > 0 && (
          <>
            <p className="text-xs text-gray-600 mb-3">
              {pagination?.total} joueur{(pagination?.total ?? 0) > 1 ? "s" : ""} trouvé{(pagination?.total ?? 0) > 1 ? "s" : ""}
            </p>
            <div className="space-y-3">
              {players.map((player, i) => (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    href={`/players/${player.id}`}
                    className="flex items-center gap-4 bg-[#111] border border-gray-800 rounded-xl p-4 hover:border-gray-600 transition group"
                  >
                    {/* Avatar */}
                    <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-800 flex-shrink-0">
                      {player.user.avatarUrl ? (
                        <Image src={player.user.avatarUrl} alt={player.user.fullName} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-lg font-bold text-gray-500">
                          {player.user.fullName[0]?.toUpperCase()}
                        </div>
                      )}
                    </div>

                    {/* Infos */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white truncate group-hover:text-[#00A651] transition">
                          {player.user.fullName}
                        </span>
                        {player.user.isVerified && (
                          <span className="text-xs bg-[#00A651]/20 text-[#00A651] px-1.5 py-0.5 rounded-full flex-shrink-0">
                            ✓ Vérifié
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-500 flex-wrap">
                        <span className="font-medium text-gray-400">
                          {POSITIONS.find((p) => p.value === player.position)?.label ?? player.position}
                        </span>
                        {player.region && (
                          <span className="flex items-center gap-1">
                            <MapPin size={10} /> {player.region}
                          </span>
                        )}
                        <span>{player.age} ans</span>
                        {player.club && <span className="truncate">{player.club}</span>}
                      </div>
                    </div>

                    {/* Score + vidéo */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {player.videos.length > 0 && (
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <Play size={11} /> Vidéo
                        </span>
                      )}
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-[#F5A623]">
                          <Star size={13} fill="#F5A623" />
                          <span className="font-bold text-sm">{player.rating.toFixed(1)}</span>
                        </div>
                        <div className="text-xs text-gray-600">score</div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {(pagination?.totalPages ?? 0) > 1 && (
              <div className="flex items-center justify-center gap-3 mt-6">
                <button
                  onClick={() => doSearch(page - 1)}
                  disabled={page <= 1}
                  className="flex items-center gap-1 px-3 py-2 border border-gray-700 text-gray-400 rounded-lg text-sm disabled:opacity-30 hover:border-gray-500 transition"
                >
                  <ChevronLeft size={15} /> Préc.
                </button>
                <span className="text-gray-500 text-sm">
                  Page {page} / {pagination?.totalPages}
                </span>
                <button
                  onClick={() => doSearch(page + 1)}
                  disabled={page >= (pagination?.totalPages ?? 1)}
                  className="flex items-center gap-1 px-3 py-2 border border-gray-700 text-gray-400 rounded-lg text-sm disabled:opacity-30 hover:border-gray-500 transition"
                >
                  Suiv. <ChevronRight size={15} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
