"use client";

import { UserProfile } from "@clerk/nextjs";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function SettingsPage() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isDark = !mounted || resolvedTheme === "dark";
  const bg     = isDark ? "#0D0D0D" : "#F7F8FA";

  return (
    <div className="min-h-screen bg-[var(--surface)] py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-heading text-xl font-bold text-[var(--ink)] mb-6">Paramètres du compte</h1>
        <UserProfile
          appearance={{
            variables: {
              colorBackground: bg,
              colorPrimary:    "#00A651",
              colorDanger:     "#ef4444",
              borderRadius:    "0.75rem",
            },
            elements: {
              rootBox:           "w-full",
              formButtonPrimary: "bg-[#00A651] hover:bg-green-600",
            },
          }}
        />
      </div>
    </div>
  );
}
