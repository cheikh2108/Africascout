import { ClerkProvider } from "@clerk/nextjs";
import { Inter } from "next/font/google";
import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AfricaScout — Le LinkedIn du football africain",
  description: "Connecte les joueurs amateurs africains aux scouts, recruteurs et académies.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <ClerkProvider>
          <Navbar />
          {/* padding-top pour la navbar fixe du haut, padding-bottom pour la nav mobile */}
          <div className="pt-14 pb-16 sm:pl-56 sm:pb-0">
            {children}
          </div>
        </ClerkProvider>
      </body>
    </html>
  );
}
