"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { Save, Pencil, X, Video, Play, Eye, Heart } from "lucide-react";
import { UploadButton } from "@/components/UploadButton";
import { REGIONS_SENEGAL } from "@/lib/senegal";

// Postes de football avec leur libellé complet
const POSITIONS = [
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

// Quelques pays africains principaux
const COUNTRIES = [
  { code: "SN", name: "Sénégal" }, { code: "GH", name: "Ghana" },
  { code: "NG", name: "Nigeria" }, { code: "CI", name: "Côte d'Ivoire" },
  { code: "MA", name: "Maroc" },   { code: "EG", name: "Égypte" },
  { code: "CM", name: "Cameroun" },{ code: "ML", name: "Mali" },
  { code: "GN", name: "Guinée" },  { code: "ZA", name: "Afrique du Sud" },
  { code: "TN", name: "Tunisie" }, { code: "DZ", name: "Algérie" },
  { code: "ET", name: "Éthiopie" },{ code: "KE", name: "Kenya" },
  { code: "TZ", name: "Tanzanie" },{ code: "UG", name: "Ouganda" },
  { code: "FR", name: "France (diaspora)" }, { code: "GB", name: "Angleterre (diaspora)" },
];

type Stats = { goals?: number; assists?: number; matches?: number; minutes?: number };
type Video = { id: string; cloudinaryUrl: string; title: string; views: number; likes: number };
type Profile = {
  fullName: string; avatarUrl?: string | null; role: string;
  playerProfile?: {
    age: number; position: string; country: string; region?: string | null;
    club?: string | null; bio?: string | null; stats: Stats; videos: Video[];
  };
};

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile]   = useState<Profile | null>(null);
  const [editing, setEditing]   = useState(false);
  const [saving,  setSaving]    = useState(false);
  const [loading, setLoading]   = useState(true);
  const [showVideoForm, setShowVideoForm] = useState(false);
  const [videoTitle, setVideoTitle]       = useState("");
  const [pendingVideoUrl, setPendingVideoUrl] = useState<string | null>(null);

  // Formulaire d'édition — copie des données actuelles
  const [form, setForm] = useState({
    fullName: "", avatarUrl: "", age: 0,
    position: "ST", country: "SN", region: "", club: "", bio: "",
    goals: 0, assists: 0, matches: 0, minutes: 0,
  });

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((data) => {
        setProfile(data);
        const p = data.playerProfile;
        setForm({
          fullName: data.fullName ?? "",
          avatarUrl: data.avatarUrl ?? "",
          age:      p?.age ?? 0,
          position: p?.position ?? "ST",
          country:  p?.country ?? "SN",
          region:   p?.region ?? "",
          club:     p?.club ?? "",
          bio:      p?.bio ?? "",
          goals:    p?.stats?.goals ?? 0,
          assists:  p?.stats?.assists ?? 0,
          matches:  p?.stats?.matches ?? 0,
          minutes:  p?.stats?.minutes ?? 0,
        });
        setLoading(false);
      })
      .catch(() => router.push("/sign-in"));
  }, [router]);

  const handleSave = async () => {
    setSaving(true);
    await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName:  form.fullName,
        avatarUrl: form.avatarUrl || null,
        age:       Number(form.age),
        position:  form.position,
        country:   form.country,
        region:    form.region || null,
        club:      form.club || null,
        bio:       form.bio || null,
        stats: {
          goals:   Number(form.goals),
          assists: Number(form.assists),
          matches: Number(form.matches),
          minutes: Number(form.minutes),
        },
      }),
    });
    // Recharge le profil mis à jour
    const updated = await fetch("/api/profile").then((r) => r.json());
    setProfile(updated);
    setSaving(false);
    setEditing(false);
  };

  const handleAddVideo = async () => {
    if (!pendingVideoUrl || !videoTitle.trim()) return;
    await fetch("/api/videos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cloudinaryUrl: pendingVideoUrl, title: videoTitle }),
    });
    const updated = await fetch("/api/profile").then((r) => r.json());
    setProfile(updated);
    setShowVideoForm(false);
    setVideoTitle("");
    setPendingVideoUrl(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#00A651] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const p = profile?.playerProfile;
  const stats = p?.stats ?? {};
  const videos = p?.videos ?? [];
  const isPlayer = profile?.role === "PLAYER";

  return (
    <div className="min-h-screen bg-[#0D0D0D] py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* ── Carte profil principale ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#111] border border-gray-800 rounded-2xl p-6"
        >
          <div className="flex items-start justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Mon profil</h2>
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-white border border-gray-700 px-3 py-1.5 rounded-lg hover:border-gray-500 transition"
              >
                <Pencil size={14} /> Modifier
              </button>
            ) : (
              <button onClick={() => setEditing(false)} className="text-gray-500 hover:text-white">
                <X size={20} />
              </button>
            )}
          </div>

          {/* Avatar */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative w-20 h-20 rounded-full overflow-hidden bg-gray-800 flex-shrink-0">
              {(editing ? form.avatarUrl : profile?.avatarUrl) ? (
                <Image
                  src={(editing ? form.avatarUrl : profile?.avatarUrl) as string}
                  alt="Avatar"
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl text-gray-600">
                  {profile?.fullName?.[0]?.toUpperCase()}
                </div>
              )}
            </div>
            {editing && (
              <UploadButton
                uploadType="avatar"
                label="Changer la photo"
                onSuccess={(url) => setForm((f) => ({ ...f, avatarUrl: url }))}
              />
            )}
          </div>

          {/* Champs du formulaire / affichage */}
          <div className="grid grid-cols-1 gap-4">
            <Field label="Nom complet" editing={editing}>
              {editing
                ? <input value={form.fullName} onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))} className={inputCls} />
                : <span className="text-white font-semibold">{profile?.fullName}</span>
              }
            </Field>

            {isPlayer && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Âge" editing={editing}>
                    {editing
                      ? <input type="number" value={form.age} onChange={(e) => setForm((f) => ({ ...f, age: +e.target.value }))} className={inputCls} />
                      : <span className="text-white">{p?.age} ans</span>
                    }
                  </Field>
                  <Field label="Poste" editing={editing}>
                    {editing
                      ? (
                        <select value={form.position} onChange={(e) => setForm((f) => ({ ...f, position: e.target.value }))} className={inputCls}>
                          {POSITIONS.map((pos) => <option key={pos.value} value={pos.value}>{pos.label}</option>)}
                        </select>
                      )
                      : <span className="text-white">{POSITIONS.find((pos) => pos.value === p?.position)?.label}</span>
                    }
                  </Field>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Pays" editing={editing}>
                    {editing
                      ? (
                        <select value={form.country} onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))} className={inputCls}>
                          {COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
                        </select>
                      )
                      : <span className="text-white">{COUNTRIES.find((c) => c.code === p?.country)?.name ?? p?.country}</span>
                    }
                  </Field>
                  <Field label="Région" editing={editing}>
                    {editing
                      ? (
                        <select value={form.region} onChange={(e) => setForm((f) => ({ ...f, region: e.target.value }))} className={inputCls}>
                          <option value="">— Sélectionner</option>
                          {REGIONS_SENEGAL.map((r) => <option key={r} value={r}>{r}</option>)}
                        </select>
                      )
                      : <span className="text-white">{p?.region ?? <span className="text-gray-600">—</span>}</span>
                    }
                  </Field>
                </div>

                <Field label="Club actuel" editing={editing}>
                  {editing
                    ? <input value={form.club} placeholder="Facultatif" onChange={(e) => setForm((f) => ({ ...f, club: e.target.value }))} className={inputCls} />
                    : <span className="text-white">{p?.club ?? <span className="text-gray-600">—</span>}</span>
                  }
                </Field>

                <Field label="Bio" editing={editing}>
                  {editing
                    ? <textarea rows={3} value={form.bio} placeholder="Décris-toi en quelques mots..." onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))} className={inputCls + " resize-none"} />
                    : <span className="text-gray-300 text-sm">{p?.bio ?? <span className="text-gray-600">Aucune bio renseignée</span>}</span>
                  }
                </Field>
              </>
            )}
          </div>

          {editing && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="mt-6 w-full flex items-center justify-center gap-2 bg-[#00A651] text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition disabled:opacity-50"
            >
              {saving ? "Enregistrement..." : <><Save size={16} /> Sauvegarder</>}
            </button>
          )}
        </motion.div>

        {/* ── Statistiques saison ── */}
        {isPlayer && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[#111] border border-gray-800 rounded-2xl p-6"
          >
            <h3 className="text-lg font-bold text-white mb-4">Statistiques saison</h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { key: "goals",   label: "Buts",   emoji: "⚽" },
                { key: "assists", label: "Passes",  emoji: "🎯" },
                { key: "matches", label: "Matchs",  emoji: "🏟️" },
                { key: "minutes", label: "Minutes", emoji: "⏱️" },
              ].map(({ key, label, emoji }) => (
                <div key={key} className="bg-gray-900 rounded-xl p-4 text-center">
                  <div className="text-2xl mb-1">{emoji}</div>
                  {editing ? (
                    <input
                      type="number"
                      min={0}
                      value={form[key as keyof typeof form]}
                      onChange={(e) => setForm((f) => ({ ...f, [key]: +e.target.value }))}
                      className="w-full bg-gray-800 text-white text-center rounded-lg px-2 py-1 text-sm border border-gray-700 focus:outline-none focus:border-[#00A651]"
                    />
                  ) : (
                    <div className="text-2xl font-bold text-white">
                      {(stats as Record<string, number>)[key] ?? 0}
                    </div>
                  )}
                  <div className="text-xs text-gray-500 mt-1">{label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── Vidéos highlights ── */}
        {isPlayer && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[#111] border border-gray-800 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">
                Vidéos highlights
                <span className="ml-2 text-sm text-gray-500 font-normal">
                  {videos.length}/3 (plan Free)
                </span>
              </h3>
              {videos.length < 3 && !showVideoForm && (
                <button
                  onClick={() => setShowVideoForm(true)}
                  className="flex items-center gap-2 text-sm text-[#00A651] border border-[#00A651]/40 px-3 py-1.5 rounded-lg hover:bg-[#00A651]/10 transition"
                >
                  <Video size={14} /> Ajouter
                </button>
              )}
            </div>

            {/* Formulaire d'ajout de vidéo */}
            {showVideoForm && (
              <div className="bg-gray-900 rounded-xl p-4 mb-4 space-y-3">
                <input
                  value={videoTitle}
                  onChange={(e) => setVideoTitle(e.target.value)}
                  placeholder="Titre de la vidéo (ex: Match vs Dakar FC)"
                  className={inputCls}
                />
                {pendingVideoUrl ? (
                  <p className="text-[#00A651] text-sm">✓ Vidéo prête : {pendingVideoUrl.split("/").pop()}</p>
                ) : (
                  <UploadButton
                    uploadType="video"
                    label="Uploader la vidéo"
                    onSuccess={(url) => setPendingVideoUrl(url)}
                  />
                )}
                <div className="flex gap-2">
                  <button
                    onClick={() => { setShowVideoForm(false); setVideoTitle(""); setPendingVideoUrl(null); }}
                    className="px-4 py-2 text-gray-400 border border-gray-700 rounded-lg text-sm hover:border-gray-500 transition"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleAddVideo}
                    disabled={!pendingVideoUrl || !videoTitle.trim()}
                    className="flex-1 py-2 bg-[#00A651] text-white rounded-lg text-sm font-semibold hover:bg-green-600 transition disabled:opacity-40"
                  >
                    Publier
                  </button>
                </div>
              </div>
            )}

            {videos.length === 0 && !showVideoForm ? (
              <p className="text-gray-600 text-sm text-center py-8">
                Aucune vidéo pour l'instant. Ajoute tes highlights !
              </p>
            ) : (
              <div className="space-y-3">
                {videos.map((v) => (
                  <div key={v.id} className="flex items-center gap-3 bg-gray-900 rounded-xl p-3">
                    <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Play size={16} className="text-[#00A651]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{v.title}</p>
                      <div className="flex gap-3 text-xs text-gray-500 mt-0.5">
                        <span className="flex items-center gap-1"><Eye size={11} /> {v.views}</span>
                        <span className="flex items-center gap-1"><Heart size={11} /> {v.likes}</span>
                      </div>
                    </div>
                    <a
                      href={v.cloudinaryUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[#00A651] hover:underline flex-shrink-0"
                    >
                      Voir
                    </a>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}

// Composant utilitaire pour les champs du formulaire
function Field({ label, editing, children }: { label: string; editing: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs text-gray-500 mb-1">{label}</label>
      {children}
    </div>
  );
}

// Classes CSS communes pour les inputs en mode édition
const inputCls = "w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#00A651] transition";
