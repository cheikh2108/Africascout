import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Autorise les images venant de Cloudinary
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
};

export default nextConfig;
