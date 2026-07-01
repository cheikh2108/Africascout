import { SignInButton, SignUpButton, Show, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { Trophy, Users, Video, Search, Star, ArrowRight, CheckCircle } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#0D0D0D] text-white">

      {/* ── Navbar landing ── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0D0D0D]/90 backdrop-blur border-b border-gray-800 h-14 flex items-center px-6 justify-between">
        <span className="text-lg font-bold">
          Africa<span className="text-[#00A651]">Scout</span>
        </span>
        <Show when="signed-out">
          <div className="flex gap-2">
            <SignInButton mode="redirect">
              <button className="px-4 py-1.5 text-sm text-gray-300 hover:text-white transition">
                Connexion
              </button>
            </SignInButton>
            <SignUpButton mode="redirect">
              <button className="px-4 py-1.5 text-sm bg-[#00A651] text-white rounded-lg hover:bg-green-600 transition font-semibold">
                S'inscrire
              </button>
            </SignUpButton>
          </div>
        </Show>
        <Show when="signed-in">
          <div className="flex items-center gap-3">
            <Link href="/feed" className="text-sm text-gray-300 hover:text-white transition">
              Mon espace →
            </Link>
            <UserButton />
          </div>
        </Show>
      </header>

      {/* ── Hero ── */}
      <section className="pt-32 pb-24 px-4 text-center">
        <div className="inline-flex items-center gap-2 bg-[#00A651]/10 border border-[#00A651]/30 text-[#00A651] text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
          <span className="w-2 h-2 bg-[#00A651] rounded-full animate-pulse" />
          Plateforme 100% dédiée au football africain
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold leading-tight mb-6 max-w-3xl mx-auto">
          Le talent africain{" "}
          <span className="text-[#00A651]">mérite d'être vu</span>
        </h1>

        <p className="text-gray-400 text-lg sm:text-xl max-w-xl mx-auto mb-10 leading-relaxed">
          AfricaScout connecte les joueurs amateurs sénégalais aux scouts,
          recruteurs et académies. Crée ton profil, poste tes highlights, fais-toi remarquer.
        </p>

        <Show when="signed-out">
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <SignUpButton mode="redirect">
              <button className="flex items-center justify-center gap-2 px-8 py-4 bg-[#00A651] text-white rounded-xl font-bold text-lg hover:bg-green-600 transition">
                Créer mon profil gratuit <ArrowRight size={20} />
              </button>
            </SignUpButton>
            <SignInButton mode="redirect">
              <button className="px-8 py-4 border border-gray-700 text-gray-300 rounded-xl font-semibold text-lg hover:border-gray-500 hover:text-white transition">
                Se connecter
              </button>
            </SignInButton>
          </div>
        </Show>

        <Show when="signed-in">
          <Link
            href="/feed"
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#00A651] text-white rounded-xl font-bold text-lg hover:bg-green-600 transition"
          >
            Accéder à mon espace <ArrowRight size={20} />
          </Link>
        </Show>
      </section>

      {/* ── Stats ── */}
      <section className="py-12 border-y border-gray-800 px-4">
        <div className="max-w-3xl mx-auto grid grid-cols-3 gap-6 text-center">
          {[
            { value: "14",    label: "Régions du Sénégal" },
            { value: "3",     label: "Vidéos par profil" },
            { value: "100%",  label: "Gratuit pour les joueurs" },
          ].map(({ value, label }) => (
            <div key={label}>
              <div className="text-3xl sm:text-4xl font-extrabold text-[#00A651]">{value}</div>
              <div className="text-gray-500 text-sm mt-1">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Comment ça marche ── */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-12">
            Comment ça marche ?
          </h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                icon: Users,
                step: "1",
                title: "Crée ton profil",
                desc: "Inscris-toi gratuitement, renseigne ton poste, ta région, tes stats de la saison.",
              },
              {
                icon: Video,
                step: "2",
                title: "Poste tes highlights",
                desc: "Upload jusqu'à 3 vidéos de tes meilleurs moments. Les scouts les voient directement.",
              },
              {
                icon: Search,
                step: "3",
                title: "Fais-toi recruter",
                desc: "Les recruteurs te trouvent par poste et région. Ils te contactent directement.",
              },
            ].map(({ icon: Icon, step, title, desc }) => (
              <div key={step} className="bg-[#111] border border-gray-800 rounded-2xl p-6 text-center">
                <div className="w-12 h-12 bg-[#00A651]/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Icon size={24} className="text-[#00A651]" />
                </div>
                <div className="text-xs text-gray-600 font-semibold mb-2">ÉTAPE {step}</div>
                <h3 className="font-bold text-white mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pour les scouts ── */}
      <section className="py-20 px-4 bg-[#111]">
        <div className="max-w-3xl mx-auto grid sm:grid-cols-2 gap-10 items-center">
          <div>
            <div className="text-[#F5A623] text-sm font-semibold mb-3 flex items-center gap-2">
              <Trophy size={16} /> POUR LES SCOUTS & RECRUTEURS
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              Trouve le talent qu'il te faut en quelques clics
            </h2>
            <p className="text-gray-400 leading-relaxed mb-6">
              Filtre par poste, région et tranche d'âge. Regarde les vidéos, consulte les stats,
              et contacte le joueur directement via la messagerie intégrée.
            </p>
            <ul className="space-y-2">
              {[
                "Recherche avancée par poste et région",
                "Accès aux vidéos highlights",
                "Messagerie directe avec les joueurs",
                "Profils vérifiés",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-gray-300">
                  <CheckCircle size={15} className="text-[#00A651] flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-[#0D0D0D] border border-gray-800 rounded-2xl p-5 space-y-3">
            {[
              { name: "Moussa Diallo", pos: "Attaquant", region: "Dakar",    rating: 8.4 },
              { name: "Ibrahima Fall",  pos: "Milieu",    region: "Thiès",    rating: 7.9 },
              { name: "Cheikh Ndiaye", pos: "Gardien",   region: "Saint-Louis", rating: 8.1 },
            ].map(({ name, pos, region, rating }) => (
              <div key={name} className="flex items-center gap-3 bg-[#111] rounded-xl p-3">
                <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center font-bold text-gray-500 text-sm flex-shrink-0">
                  {name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-white text-sm">{name}</div>
                  <div className="text-xs text-gray-500">{pos} · {region}</div>
                </div>
                <div className="flex items-center gap-1 text-[#F5A623] text-sm font-bold">
                  <Star size={13} fill="#F5A623" /> {rating}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA final ── */}
      <section className="py-24 px-4 text-center">
        <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">
          Prêt à te faire remarquer ?
        </h2>
        <p className="text-gray-400 mb-8 max-w-md mx-auto">
          Rejoins AfricaScout gratuitement et montre ton talent aux recruteurs africains et européens.
        </p>
        <Show when="signed-out">
          <SignUpButton mode="redirect">
            <button className="px-10 py-4 bg-[#00A651] text-white rounded-xl font-bold text-lg hover:bg-green-600 transition">
              Commencer gratuitement →
            </button>
          </SignUpButton>
        </Show>
        <Show when="signed-in">
          <Link
            href="/profile"
            className="inline-block px-10 py-4 bg-[#00A651] text-white rounded-xl font-bold text-lg hover:bg-green-600 transition"
          >
            Compléter mon profil →
          </Link>
        </Show>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-800 py-8 px-4 text-center text-gray-600 text-sm">
        © 2026 AfricaScout — Le LinkedIn du football africain
      </footer>
    </main>
  );
}
