"use client";

import { useRef, useState } from "react";
import { Upload, Loader2 } from "lucide-react";

interface UploadButtonProps {
  uploadType: "avatar" | "video";
  onSuccess: (url: string) => void;
  label?: string;
  accept?: string;
}

// Composant réutilisable pour uploader un fichier vers Cloudinary.
// Étapes : demande une signature au serveur → envoie le fichier à Cloudinary → retourne l'URL.
export function UploadButton({ uploadType, onSuccess, label, accept }: UploadButtonProps) {
  const inputRef  = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setLoading(true);
    setError(null);

    try {
      // Étape 1 : obtenir la signature depuis notre serveur
      const sigRes = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uploadType }),
      });
      const { signature, timestamp, folder, cloudName, apiKey } = await sigRes.json();

      // Étape 2 : envoyer le fichier directement à Cloudinary
      const formData = new FormData();
      formData.append("file", file);
      formData.append("signature", signature);
      formData.append("timestamp", String(timestamp));
      formData.append("folder", folder);
      formData.append("api_key", apiKey);

      const resourceType = uploadType === "video" ? "video" : "image";
      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
        { method: "POST", body: formData }
      );

      if (!uploadRes.ok) throw new Error("Échec de l'upload Cloudinary");

      const data = await uploadRes.json();
      onSuccess(data.secure_url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur lors de l'upload");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept={accept ?? (uploadType === "video" ? "video/*" : "image/*")}
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 bg-gray-800 border border-gray-700 text-gray-300 rounded-lg hover:border-[#00A651] hover:text-white transition text-sm disabled:opacity-50"
      >
        {loading
          ? <><Loader2 size={16} className="animate-spin" /> Upload en cours...</>
          : <><Upload size={16} /> {label ?? "Choisir un fichier"}</>
        }
      </button>
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
}
