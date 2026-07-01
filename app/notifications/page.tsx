"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MessageCircle, Bell, CheckCheck, Loader2 } from "lucide-react";

type Notif = {
  id: string;
  type: "message";
  read: boolean;
  createdAt: string;
  from: { id: string; fullName: string; avatarUrl: string | null };
  preview: string;
};

function timeAgo(dateStr: string) {
  const diff  = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins  < 1)  return "À l'instant";
  if (mins  < 60) return `${mins} min`;
  if (hours < 24) return `${hours}h`;
  return `${days}j`;
}

export default function NotificationsPage() {
  const [notifs,  setNotifs]  = useState<Notif[]>([]);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((d) => { setNotifs(d.notifications ?? []); setLoading(false); });
  }, []);

  const markAllRead = async () => {
    setMarking(true);
    await fetch("/api/notifications", { method: "PATCH" });
    setNotifs([]);
    setMarking(false);
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-4">

        {/* En-tête */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Bell size={20} className="text-[#00A651]" /> Notifications
            {notifs.length > 0 && (
              <span className="bg-[#00A651] text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {notifs.length}
              </span>
            )}
          </h1>
          {notifs.length > 0 && (
            <button
              onClick={markAllRead}
              disabled={marking}
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-white transition disabled:opacity-50"
            >
              {marking ? <Loader2 size={12} className="animate-spin" /> : <CheckCheck size={14} />}
              Tout marquer comme lu
            </button>
          )}
        </div>

        {/* Contenu */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="text-[#00A651] animate-spin" />
          </div>
        ) : notifs.length === 0 ? (
          <div className="bg-[#111] border border-gray-800 rounded-2xl p-12 text-center">
            <Bell size={40} className="text-gray-700 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">Aucune notification</p>
            <p className="text-gray-700 text-sm mt-1">Tu seras alerté quand quelqu'un te contacte</p>
          </div>
        ) : (
          <div className="bg-[#111] border border-gray-800 rounded-2xl overflow-hidden divide-y divide-gray-800">
            {notifs.map((n) => (
              <Link
                key={n.id}
                href={`/messages?with=${n.from.id}`}
                className="flex items-start gap-3 px-4 py-4 hover:bg-gray-900 transition"
              >
                {/* Avatar */}
                <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-800 flex-shrink-0 mt-0.5">
                  {n.from.avatarUrl ? (
                    <Image src={n.from.avatarUrl} alt={n.from.fullName} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-gray-500 text-sm">
                      {n.from.fullName[0]?.toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Texte */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <MessageCircle size={13} className="text-[#00A651] flex-shrink-0" />
                    <span className="text-white text-sm font-semibold truncate">{n.from.fullName}</span>
                    <span className="text-xs text-gray-600 flex-shrink-0 ml-auto">{timeAgo(n.createdAt)}</span>
                  </div>
                  <p className="text-gray-400 text-sm truncate">{n.preview}</p>
                </div>

                {/* Point non lu */}
                <div className="w-2 h-2 bg-[#00A651] rounded-full mt-2 flex-shrink-0" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
