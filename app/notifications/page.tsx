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
  if (mins  < 60) return `${mins}min`;
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
    <div className="min-h-screen bg-[var(--surface)] py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-5">

        <div className="flex items-center justify-between">
          <h1 className="font-heading text-xl font-bold text-[var(--ink)] flex items-center gap-2.5">
            <Bell size={20} className="text-[#00A651]" />
            Notifications
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
              className="flex items-center gap-1.5 text-xs text-[var(--muted)] hover:text-[var(--ink)] transition-colors duration-150 disabled:opacity-50 cursor-pointer"
            >
              {marking ? <Loader2 size={12} className="animate-spin" /> : <CheckCheck size={14} />}
              Tout lire
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 size={24} className="text-[#00A651] animate-spin" />
          </div>
        ) : notifs.length === 0 ? (
          <div className="bg-[var(--panel)] border border-[var(--stroke)] rounded-2xl p-14 text-center">
            <div className="w-14 h-14 bg-[var(--stroke)] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Bell size={24} className="text-[var(--muted)]" />
            </div>
            <p className="text-[var(--ink)] font-semibold mb-1">Aucune notification</p>
            <p className="text-[var(--muted)] text-sm">Tu seras alerté quand quelqu'un te contacte</p>
          </div>
        ) : (
          <div className="bg-[var(--panel)] border border-[var(--stroke)] rounded-2xl overflow-hidden divide-y divide-[var(--stroke)]">
            {notifs.map((n) => (
              <Link
                key={n.id}
                href={`/messages?with=${n.from.id}`}
                className="flex items-start gap-3 px-4 py-4 hover:bg-[var(--stroke)]/30 transition-colors duration-150 cursor-pointer"
              >
                <div className="relative w-10 h-10 rounded-full overflow-hidden bg-[var(--stroke)] flex-shrink-0 mt-0.5">
                  {n.from.avatarUrl ? (
                    <Image src={n.from.avatarUrl} alt={n.from.fullName} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-heading font-bold text-[#00A651] text-sm">
                      {n.from.fullName[0]?.toUpperCase()}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <MessageCircle size={12} className="text-[#00A651] flex-shrink-0" />
                    <span className="text-[var(--ink)] text-sm font-semibold truncate">{n.from.fullName}</span>
                    <span className="text-xs text-[var(--muted)] flex-shrink-0 ml-auto">{timeAgo(n.createdAt)}</span>
                  </div>
                  <p className="text-[var(--muted)] text-sm truncate">{n.preview}</p>
                </div>

                <div className="w-2 h-2 bg-[#00A651] rounded-full mt-2 flex-shrink-0" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
