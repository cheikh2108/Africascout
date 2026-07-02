import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "next-themes";
import { Inter, Outfit } from "next/font/google";
import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import "./globals.css";

const inter  = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit", weight: ["400","500","600","700","800"] });

export const metadata: Metadata = {
  title: "AfricaScout — Le LinkedIn du football africain",
  description: "Connecte les joueurs amateurs africains aux scouts, recruteurs et académies.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${inter.variable} ${outfit.variable} font-sans`}>
        <ThemeProvider attribute="class" defaultTheme="dark" disableTransitionOnChange>
          <ClerkProvider>
            <Navbar />
            <div className="pt-14 pb-16 sm:pl-56 sm:pb-0 min-h-screen">
              {children}
            </div>
          </ClerkProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
