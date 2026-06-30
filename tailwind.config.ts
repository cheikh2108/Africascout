import type { Config } from "tailwindcss";

const config: Config = {
  // Tailwind scanne ces fichiers pour générer uniquement les classes CSS utilisées
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      // Palette de couleurs AfricaScout
      colors: {
        brand: {
          green:  "#00A651", // vert africain — couleur principale
          gold:   "#F5A623", // or — accent premium
          dark:   "#0D0D0D", // fond sombre
          muted:  "#6B7280", // texte secondaire
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
