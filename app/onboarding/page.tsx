"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Search, Building2, UserCheck, ChevronRight, ChevronLeft } from "lucide-react";

// Les 4 rôles disponibles avec leur description et icône
const ROLES = [
  {
    value: "PLAYER",
    label: "Joueur",
    description: "Je cherche à être découvert par des scouts et académies",
    icon: Shield,
    color: "#00A651",
  },
  {
    value: "SCOUT",
    label: "Scout / Recruteur",
    description: "Je recherche des talents pour mon club ou organisation",
    icon: Search,
    color: "#F5A623",
  },
  {
    value: "ACADEMY",
    label: "Académie",
    description: "Je représente une académie de football officielle",
    icon: Building2,
    color: "#3B82F6",
  },
  {
    value: "AGENT",
    label: "Agent",
    description: "Je gère la carrière de joueurs professionnels",
    icon: UserCheck,
    color: "#8B5CF6",
  },
];

// Animation pour les transitions entre étapes
const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 80 : -80,
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({
    x: direction < 0 ? 80 : -80,
    opacity: 0,
  }),
};

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useUser();

  const [step, setStep] = useState(1); // étape actuelle (1, 2 ou 3)
  const [direction, setDirection] = useState(1); // direction de l'animation
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const goNext = () => {
    setDirection(1);
    setStep((s) => s + 1);
  };

  const goPrev = () => {
    setDirection(-1);
    setStep((s) => s - 1);
  };

  const handleFinish = async () => {
    if (!selectedRole || !fullName.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: selectedRole, fullName: fullName.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Une erreur est survenue");
        return;
      }

      // Redirige vers le dashboard après onboarding réussi
      router.push("/dashboard");
    } catch {
      setError("Erreur réseau, réessaie.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex flex-col items-center justify-center px-4">
      {/* En-tête */}
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-white mb-1">
          Africa<span className="text-[#00A651]">Scout</span>
        </h1>
        <p className="text-gray-400 text-sm">Configuration de ton profil</p>
      </div>

      {/* Indicateur d'étapes */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3].map((n) => (
          <div key={n} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors duration-300 ${
                step >= n
                  ? "bg-[#00A651] text-white"
                  : "bg-gray-800 text-gray-500"
              }`}
            >
              {n}
            </div>
            {n < 3 && (
              <div
                className={`w-12 h-0.5 transition-colors duration-300 ${
                  step > n ? "bg-[#00A651]" : "bg-gray-800"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Carte principale */}
      <div className="w-full max-w-lg bg-[#111] border border-gray-800 rounded-2xl p-8 overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          {/* ── ÉTAPE 1 : Bienvenue ── */}
          {step === 1 && (
            <motion.div
              key="step1"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: "easeInOut" }}
            >
              <h2 className="text-2xl font-bold text-white mb-2">Bienvenue 👋</h2>
              <p className="text-gray-400 mb-6">
                AfricaScout connecte les joueurs africains aux scouts et académies du monde entier.
                Quelques secondes pour configurer ton profil.
              </p>
              <div className="mb-6">
                <label className="block text-sm text-gray-400 mb-2">Ton nom complet</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ex: Sadio Mané"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#00A651] transition"
                />
              </div>
              <button
                onClick={goNext}
                disabled={!fullName.trim()}
                className="w-full flex items-center justify-center gap-2 bg-[#00A651] text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Continuer <ChevronRight size={18} />
              </button>
            </motion.div>
          )}

          {/* ── ÉTAPE 2 : Sélection du rôle ── */}
          {step === 2 && (
            <motion.div
              key="step2"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: "easeInOut" }}
            >
              <h2 className="text-2xl font-bold text-white mb-2">Qui es-tu ?</h2>
              <p className="text-gray-400 mb-6">Sélectionne ton rôle sur la plateforme.</p>
              <div className="grid grid-cols-2 gap-3 mb-6">
                {ROLES.map((role) => {
                  const Icon = role.icon;
                  const isSelected = selectedRole === role.value;
                  return (
                    <button
                      key={role.value}
                      onClick={() => setSelectedRole(role.value)}
                      className={`p-4 rounded-xl border text-left transition-all duration-200 ${
                        isSelected
                          ? "border-[#00A651] bg-[#00A651]/10"
                          : "border-gray-700 bg-gray-900 hover:border-gray-600"
                      }`}
                    >
                      <Icon
                        size={24}
                        style={{ color: isSelected ? role.color : "#6B7280" }}
                        className="mb-2"
                      />
                      <div className="font-semibold text-white text-sm">{role.label}</div>
                      <div className="text-gray-500 text-xs mt-1 leading-tight">
                        {role.description}
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={goPrev}
                  className="flex items-center gap-1 px-4 py-3 border border-gray-700 text-gray-400 rounded-lg hover:border-gray-500 transition"
                >
                  <ChevronLeft size={18} /> Retour
                </button>
                <button
                  onClick={goNext}
                  disabled={!selectedRole}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#00A651] text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Continuer <ChevronRight size={18} />
                </button>
              </div>
            </motion.div>
          )}

          {/* ── ÉTAPE 3 : Confirmation ── */}
          {step === 3 && (
            <motion.div
              key="step3"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: "easeInOut" }}
            >
              <h2 className="text-2xl font-bold text-white mb-2">Tout est prêt !</h2>
              <p className="text-gray-400 mb-6">Voici un résumé de ton profil.</p>

              <div className="bg-gray-900 rounded-xl p-4 mb-6 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500 text-sm">Nom</span>
                  <span className="text-white font-medium text-sm">{fullName}</span>
                </div>
                <div className="w-full h-px bg-gray-800" />
                <div className="flex justify-between">
                  <span className="text-gray-500 text-sm">Rôle</span>
                  <span className="text-[#00A651] font-medium text-sm">
                    {ROLES.find((r) => r.value === selectedRole)?.label}
                  </span>
                </div>
              </div>

              {error && (
                <p className="text-red-400 text-sm mb-4 bg-red-400/10 px-4 py-2 rounded-lg">
                  {error}
                </p>
              )}

              <div className="flex gap-3">
                <button
                  onClick={goPrev}
                  className="flex items-center gap-1 px-4 py-3 border border-gray-700 text-gray-400 rounded-lg hover:border-gray-500 transition"
                >
                  <ChevronLeft size={18} /> Retour
                </button>
                <button
                  onClick={handleFinish}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#00A651] text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition disabled:opacity-40"
                >
                  {loading ? "Enregistrement..." : "Créer mon profil →"}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
