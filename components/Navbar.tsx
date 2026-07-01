"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Show, UserButton } from "@clerk/nextjs";
import { Home, Search, User, MessageCircle } from "lucide-react";

const NAV = [
  { href: "/feed",      label: "Feed",      icon: Home },
  { href: "/search",    label: "Recherche",  icon: Search },
  { href: "/profile",   label: "Profil",     icon: User },
  { href: "/messages",  label: "Messages",   icon: MessageCircle },
];

export function Navbar() {
  const pathname = usePathname();

  // Pas de navbar sur les pages d'auth et d'onboarding
  const hidden = ["/sign-in", "/sign-up", "/onboarding", "/"].some((p) => pathname.startsWith(p));
  if (hidden) return null;

  return (
    <>
      {/* Barre du haut — desktop */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0D0D0D]/90 backdrop-blur border-b border-gray-800 h-14 flex items-center px-6 justify-between">
        <Link href="/feed" className="text-lg font-bold text-white">
          Africa<span className="text-[#00A651]">Scout</span>
        </Link>
        <Show when="signed-in">
          <UserButton />
        </Show>
      </header>

      {/* Navigation du bas — mobile */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#0D0D0D]/95 backdrop-blur border-t border-gray-800 flex sm:hidden">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center justify-center py-3 gap-0.5 transition-colors ${
                active ? "text-[#00A651]" : "text-gray-600 hover:text-gray-400"
              }`}
            >
              <Icon size={20} />
              <span className="text-xs">{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Navigation latérale — desktop */}
      <aside className="hidden sm:flex fixed left-0 top-14 bottom-0 w-56 flex-col gap-1 px-3 py-4 border-r border-gray-800 bg-[#0D0D0D]">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                active
                  ? "bg-[#00A651]/15 text-[#00A651]"
                  : "text-gray-500 hover:text-white hover:bg-gray-800/50"
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </aside>
    </>
  );
}
