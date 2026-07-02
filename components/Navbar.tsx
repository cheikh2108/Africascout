"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Show, UserButton } from "@clerk/nextjs";
import { Home, Search, User, MessageCircle, Bell, Settings } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

const NAV_MOBILE = [
  { href: "/feed",     label: "Feed",      icon: Home },
  { href: "/search",   label: "Recherche", icon: Search },
  { href: "/profile",  label: "Profil",    icon: User },
  { href: "/messages", label: "Messages",  icon: MessageCircle },
];

const NAV_DESKTOP = [
  { href: "/feed",          label: "Feed",          icon: Home },
  { href: "/search",        label: "Recherche",     icon: Search },
  { href: "/profile",       label: "Profil",        icon: User },
  { href: "/messages",      label: "Messages",      icon: MessageCircle },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/settings",      label: "Paramètres",    icon: Settings },
];

export function Navbar() {
  const pathname = usePathname();
  const hidden = ["/sign-in", "/sign-up", "/onboarding"].some((p) => pathname.startsWith(p)) || pathname === "/";
  if (hidden) return null;

  return (
    <>
      {/* ── Header haut ── */}
      <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-[var(--surface)]/95 backdrop-blur-md border-b border-[var(--stroke)] flex items-center px-6 justify-between">
        <Link href="/feed" className="font-heading text-lg font-bold text-[var(--ink)] tracking-tight">
          Africa<span className="text-[#00A651]">Scout</span>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Show when="signed-in">
            <UserButton />
          </Show>
        </div>
      </header>

      {/* ── Nav bas — mobile ── */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[var(--panel)]/98 backdrop-blur-md border-t border-[var(--stroke)] flex sm:hidden">
        {NAV_MOBILE.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center justify-center py-3 gap-1 transition-colors duration-150 cursor-pointer min-h-[56px] ${
                active ? "text-[#00A651]" : "text-[var(--muted)] hover:text-[var(--ink)]"
              }`}
            >
              <Icon size={21} strokeWidth={active ? 2.5 : 1.8} />
              <span className="text-[10px] font-medium tracking-wide">{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* ── Sidebar — desktop ── */}
      <aside className="hidden sm:flex fixed left-0 top-14 bottom-0 w-56 flex-col px-3 py-5 border-r border-[var(--stroke)] bg-[var(--panel)]">
        <div className="flex flex-col gap-0.5 flex-1">
          {NAV_DESKTOP.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 cursor-pointer ${
                  active
                    ? "bg-[#00A651]/12 text-[#00A651] font-semibold"
                    : "text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--stroke)]/40"
                }`}
              >
                <Icon size={18} strokeWidth={active ? 2.5 : 1.8} />
                {label}
              </Link>
            );
          })}
        </div>
        <Link
          href="/dashboard"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 cursor-pointer mt-2 border border-[var(--stroke)] ${
            pathname.startsWith("/dashboard")
              ? "bg-[#00A651]/12 text-[#00A651] border-[#00A651]/30"
              : "text-[var(--muted)] hover:text-[var(--ink)] hover:border-[var(--muted)]/50"
          }`}
        >
          <span className="w-4 h-4 rounded bg-[#00A651]/20 flex items-center justify-center text-[#00A651] text-xs font-bold flex-shrink-0">A</span>
          Dashboard
        </Link>
      </aside>
    </>
  );
}
