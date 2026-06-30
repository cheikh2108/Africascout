import { SignInButton, SignUpButton, Show, UserButton } from "@clerk/nextjs";

// Page d'accueil temporaire — sera remplacée par la landing page finale
export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center text-center px-4">
      <h1 className="text-4xl font-bold text-white mb-4">
        Africa<span className="text-[#00A651]">Scout</span>
      </h1>
      <p className="text-gray-400 text-lg mb-8">
        Le LinkedIn du football africain — bientôt disponible
      </p>

      {/* Affiché si NON connecté */}
      <Show when="signed-out">
        <div className="flex gap-3">
          <SignInButton mode="redirect">
            <button className="px-6 py-3 bg-[#00A651] text-white rounded-lg font-semibold hover:bg-green-600 transition">
              Connexion
            </button>
          </SignInButton>
          <SignUpButton mode="redirect">
            <button className="px-6 py-3 border border-[#00A651] text-[#00A651] rounded-lg font-semibold hover:bg-[#00A651] hover:text-white transition">
              Inscription
            </button>
          </SignUpButton>
        </div>
      </Show>

      {/* Affiché si connecté */}
      <Show when="signed-in">
        <div className="flex flex-col items-center gap-4">
          <UserButton />
          <a
            href="/dashboard"
            className="px-6 py-3 bg-[#00A651] text-white rounded-lg font-semibold hover:bg-green-600 transition"
          >
            Accéder au tableau de bord →
          </a>
        </div>
      </Show>
    </main>
  );
}
