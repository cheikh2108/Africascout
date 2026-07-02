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
  { value: "",      label: "Tous les âges" },
  { value: "u18",   label: "≤ 18 ans" },
  { value: "19-21", label: "19 – 21 ans" },
  { value: "22-25", label: "22 – 25 ans" },
  { value: "25+",   label: "25+ ans" },
];

const SELECT_CLS = "w-full bg-[var(--panel-alt)] border border-[var(--stroke)] rounded-xl px-3 py-2.5 text-[var(--ink)] text-sm focus:outline-none focus:border-[#00A651] transition-colors duration-150 cursor-pointer";

type Player = {
  id: string; age: number; position: string; region: string | null;
  club: string | null; rating: number;
  user: { fullName: string; avatarUrl: string | null; isVerified: boolean };
  videos: { id: string }[];
};

type Pagination = { page: number; total: number; totalPages: number };

export default function SearchPage() {
  const [query,      setQuery]      = useState("");
  const [position,   setPosition]   = useState("");
  const [region,     setRegion]     = useState("");
  const [ageGroup,   setAgeGroup]   = useState("");
  const [page,       setPage]       = useState(1);
  const [players,    setPlayers]    = useState<Player[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading,    setLoading]    = useState(false);
  const [showFilters,setShowFilters]= useState(false);
  const [searched,   setSearched]   = useState(false);

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

  useEffect(() => {
    if (position || region || ageGroup) doSearch(1);
  }, [position, region, ageGroup]); // eslint-disable-line

  const activeFilterCount = [position, region, ageGroup].filter(Boolean).length;
  const clearFilters = () => { setPosition(""); setRegion(""); setAgeGroup(""); };

  return (
    <div className="min-h-screen bg-[var(--surface)] py-8 px-4">
      <div className="max-w-3xl mx-auto">

        <div className="mb-7">
          <h1 className="font-heading text-2xl font-bold text-[var(--ink)] mb-1">Recherche</h1>
          <p className="text-[var(--muted)] text-sm">Talents du football sénégalais — 14 régions</p>
        </div>

        {/* Barre de recherche */}
        <div className="flex gap-2 mb-4">
          <div className="flex-1 relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && doSearch(1)}
              placeholder="Nom, club..."
              className="w-full bg-[var(--panel)] border border-[var(--stroke)] rounded-xl pl-10 pr-4 py-3 text-[var(--ink)] placeholder-[var(--muted)] focus:outline-none focus:border-[#00A651] transition-colors duration-150 text-sm"
            />
          </div>
          <button
            onClick={() => doSearch(1)}
            className="px-5 bg-[#00A651] text-white rounded-xl font-semibold hover:bg-green-600 transition-colors duration-150 cursor-pointer text-sm"
          >
            Chercher
          </button>
          <button
            onClick={() => setShowFilters((v) => !v)}
            className={`px-3 border rounded-xl transition-all duration-150 flex items-center gap-1.5 text-sm cursor-pointer ${
              activeFilterCount > 0
                ? "border-[#00A651] text-[#00A651] bg-[#00A651]/10"
                : "border-[var(--stroke)] text-[var(--muted)] hover:border-[var(--muted)] hover:text-[var(--ink)]"
            }`}
          >
            <SlidersHorizontal size={15} />
            {activeFilterCount > 0 && (
              <span className="w-4 h-4 bg-[#00A651] text-white rounded-full text-[10px] flex items-center justify-center font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Filtres */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden mb-4"
            >
              <div className="bg-[var(--panel)] border border-[var(--stroke)] rounded-2xl p-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <label className="block text-xs text-[var(--muted)] mb-1.5 font-medium">Poste</label>
                  <select value={position} onChange={(e) => setPosition(e.target.value)} className={SELECT_CLS}>
                    {POSITIONS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-[var(--muted)] mb-1.5 font-medium">Région</label>
                  <select value={region} onChange={(e) => setRegion(e.target.value)} className={SELECT_CLS}>
                    <option value="">Toutes les régions</option>
                    {REGIONS_SENEGAL.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-[var(--muted)] mb-1.5 font-medium">Âge</label>
                  <select value={ageGroup} onChange={(e) => setAgeGroup(e.target.value)} className={SELECT_CLS}>
                    {AGE_GROUPS.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
                  </select>
                </div>
              </div>
              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="mt-2 flex items-center gap-1 text-xs text-[var(--muted)] hover:text-[var(--ink)] transition-colors duration-150 cursor-pointer"
                >
                  <X size={12} /> Effacer les filtres
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-16">
            <div className="w-7 h-7 border-2 border-[#00A651] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Vide */}
        {!loading && searched && players.length === 0 && (
          <div className="text-center py-16">
            <div className="w-14 h-14 bg-[var(--panel)] border border-[var(--stroke)] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Search size={24} className="text-[var(--muted)]" />
            </div>
            <p className="text-[var(--muted)] font-medium">Aucun joueur trouvé</p>
            <p className="text-sm text-[var(--muted)]/60 mt-1">Essaie d'autres critères</p>
          </div>
        )}

        {!loading && !searched && (
          <div className="text-center py-16">
            <p className="text-[var(--muted)] text-sm">Lance une recherche ou applique des filtres</p>
          </div>
        )}

        {/* Résultats */}
        {!loading && players.length > 0 && (
          <>
            <p className="text-xs text-[var(--muted)] mb-4">
              {pagination?.total} joueur{(pagination?.total ?? 0) > 1 ? "s" : ""} trouvé{(pagination?.total ?? 0) > 1 ? "s" : ""}
            </p>
            <div className="space-y-2.5">
              {players.map((player, i) => (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.2 }}
                >
                  <Link
                    href={`/players/${player.id}`}
                    className="flex items-center gap-4 bg-[var(--panel)] border border-[var(--stroke)] rounded-2xl p-4 hover:border-[#00A651]/40 transition-all duration-150 group cursor-pointer"
                  >
                    <div className="relative w-12 h-12 rounded-full overflow-hidden bg-[var(--stroke)] flex-shrink-0 ring-2 ring-[var(--stroke)] group-hover:ring-[#00A651]/30 transition-all duration-150">
                      {player.user.avatarUrl ? (
                        <Image src={player.user.avatarUrl} alt={player.user.fullName} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-heading text-lg font-bold text-[#00A651]">
                          {player.user.fullName[0]?.toUpperCase()}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[var(--ink)] truncate group-hover:text-[#00A651] transition-colors duration-150">
                          {player.user.fullName}
                        </span>
                        {player.user.isVerified && (
                          <span className="text-[10px] bg-[#00A651]/20 text-[#00A651] px-1.5 py-0.5 rounded-full font-semibold flex-shrink-0">
                            ✓ Vérifié
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-[var(--muted)] flex-wrap">
                        <span className="font-medium text-[var(--ink)]/70">
                          {POSITIONS.find((p) => p.value === player.position)?.label ?? player.position}
                        </span>
                        {player.region && (
                          <span className="flex items-center gap-1"><MapPin size={10} />{player.region}</span>
                        )}
                        <span>{player.age} ans</span>
                        {player.club && <span className="truncate">{player.club}</span>}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      {player.videos.length > 0 && (
                        <span className="flex items-center gap-1 text-xs text-[var(--muted)]">
                          <Play size={11} /> {player.videos.length}
                        </span>
                      )}
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-[#F5A623]">
                          <Star size={13} fill="#F5A623" />
                          <span className="font-heading font-bold text-sm">{player.rating.toFixed(1)}</span>
                        </div>
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
                  className="flex items-center gap-1 px-4 py-2.5 border border-[var(--stroke)] text-[var(--muted)] rounded-xl text-sm disabled:opacity-30 hover:border-[var(--muted)] hover:text-[var(--ink)] transition-all duration-150 cursor-pointer"
                >
                  <ChevronLeft size={15} /> Préc.
                </button>
                <span className="text-[var(--muted)] text-sm">{page} / {pagination?.totalPages}</span>
                <button
                  onClick={() => doSearch(page + 1)}
                  disabled={page >= (pagination?.totalPages ?? 1)}
                  className="flex items-center gap-1 px-4 py-2.5 border border-[var(--stroke)] text-[var(--muted)] rounded-xl text-sm disabled:opacity-30 hover:border-[var(--muted)] hover:text-[var(--ink)] transition-all duration-150 cursor-pointer"
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
