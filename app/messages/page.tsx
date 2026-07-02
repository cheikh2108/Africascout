"use client";

import { useEffect, useState, useRef, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Send, ArrowLeft, MessageCircle, Loader2 } from "lucide-react";

type UserSnippet = { id: string; fullName: string; avatarUrl: string | null };
type Message = {
  id: string; content: string; createdAt: string; readAt: string | null;
  from: UserSnippet;
};
type Conversation = {
  id: string; content: string; createdAt: string;
  from: UserSnippet; to: UserSnippet;
};

function timeAgo(dateStr: string) {
  const diff  = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins  < 1)  return "Maintenant";
  if (mins  < 60) return `${mins}min`;
  if (hours < 24) return `${hours}h`;
  return `${days}j`;
}

function Avatar({ user, size = 10 }: { user: UserSnippet; size?: number }) {
  const px = size * 4;
  return (
    <div
      className="relative rounded-full overflow-hidden bg-[var(--stroke)] flex-shrink-0"
      style={{ width: px, height: px }}
    >
      {user.avatarUrl ? (
        <Image src={user.avatarUrl} alt={user.fullName} fill className="object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center font-heading font-bold text-[#00A651] text-sm">
          {user.fullName[0]?.toUpperCase()}
        </div>
      )}
    </div>
  );
}

function MessagesContent() {
  const searchParams = useSearchParams();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeUser,    setActiveUser]    = useState<UserSnippet | null>(null);
  const [messages,      setMessages]      = useState<Message[]>([]);
  const [myId,          setMyId]          = useState<string | null>(null);
  const [input,         setInput]         = useState("");
  const [sending,       setSending]       = useState(false);
  const [loadingConvs,  setLoadingConvs]  = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const pollRef   = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadConversations = useCallback(async () => {
    const res  = await fetch("/api/messages");
    const data = await res.json();
    setConversations(data.conversations ?? []);
    setLoadingConvs(false);
  }, []);

  const loadMessages = useCallback(async (userId: string) => {
    const res  = await fetch(`/api/messages?with=${userId}`);
    const data = await res.json();
    setMessages(data.messages ?? []);
    setMyId(data.myId ?? null);
  }, []);

  useEffect(() => { loadConversations(); }, [loadConversations]);

  useEffect(() => {
    const withId = searchParams.get("with");
    if (!withId) return;
    setActiveUser({ id: withId, fullName: "...", avatarUrl: null });
  }, [searchParams]);

  useEffect(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    if (!activeUser) return;
    loadMessages(activeUser.id);
    pollRef.current = setInterval(() => loadMessages(activeUser.id), 3000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [activeUser, loadMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const openConversation = (user: UserSnippet) => {
    setActiveUser(user);
    setMessages([]);
  };

  const handleSend = async () => {
    if (!input.trim() || !activeUser || sending) return;
    const text = input.trim();
    setSending(true);
    setInput("");
    const tempMsg: Message = {
      id: `temp-${Date.now()}`, content: text,
      createdAt: new Date().toISOString(), readAt: null,
      from: { id: myId!, fullName: "Moi", avatarUrl: null },
    };
    setMessages((prev) => [...prev, tempMsg]);
    await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ toUserId: activeUser.id, content: text }),
    });
    await loadMessages(activeUser.id);
    await loadConversations();
    setSending(false);
  };

  return (
    <div className="min-h-screen bg-[var(--surface)]">
      <div className="max-w-3xl mx-auto flex h-[calc(100vh-3.5rem)]">

        {/* ── Liste conversations ── */}
        <div className={`w-full sm:w-72 flex-shrink-0 border-r border-[var(--stroke)] flex flex-col ${activeUser ? "hidden sm:flex" : "flex"}`}>
          <div className="px-4 py-4 border-b border-[var(--stroke)]">
            <h1 className="font-heading text-base font-bold text-[var(--ink)]">Messages</h1>
          </div>

          {loadingConvs ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 size={20} className="text-[#00A651] animate-spin" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
              <div className="w-12 h-12 bg-[var(--stroke)] rounded-2xl flex items-center justify-center mb-3">
                <MessageCircle size={20} className="text-[var(--muted)]" />
              </div>
              <p className="text-sm text-[var(--muted)] font-medium">Aucune conversation</p>
              <p className="text-xs text-[var(--muted)]/60 mt-1">Va sur le profil d'un joueur pour contacter</p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto">
              {conversations.map((conv) => {
                const other    = conv.from.id === myId ? conv.to : conv.from;
                const isActive = activeUser?.id === other.id;
                return (
                  <button
                    key={conv.id}
                    onClick={() => openConversation(other)}
                    className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-[var(--stroke)]/30 transition-colors duration-150 text-left cursor-pointer ${isActive ? "bg-[var(--stroke)]/40" : ""}`}
                  >
                    <Avatar user={other} size={10} />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline">
                        <span className="font-medium text-[var(--ink)] text-sm truncate">{other.fullName}</span>
                        <span className="text-xs text-[var(--muted)] flex-shrink-0 ml-2">{timeAgo(conv.createdAt)}</span>
                      </div>
                      <p className="text-xs text-[var(--muted)] truncate mt-0.5">{conv.content}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Conversation active ── */}
        <div className={`flex-1 flex flex-col ${activeUser ? "flex" : "hidden sm:flex"}`}>
          {!activeUser ? (
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-[var(--panel)] border border-[var(--stroke)] rounded-2xl flex items-center justify-center mb-4">
                <MessageCircle size={28} className="text-[var(--muted)]" />
              </div>
              <p className="text-sm text-[var(--muted)]">Sélectionne une conversation</p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--stroke)]">
                <button
                  onClick={() => setActiveUser(null)}
                  aria-label="Retour"
                  className="sm:hidden text-[var(--muted)] hover:text-[var(--ink)] transition-colors duration-150 cursor-pointer p-1"
                >
                  <ArrowLeft size={20} />
                </button>
                <Avatar user={activeUser} size={9} />
                <span className="font-semibold text-[var(--ink)]">{activeUser.fullName}</span>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                <AnimatePresence initial={false}>
                  {messages.map((msg) => {
                    const isMine = msg.from.id === myId;
                    return (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.15 }}
                        className={`flex gap-2 ${isMine ? "flex-row-reverse" : "flex-row"}`}
                      >
                        {!isMine && <Avatar user={msg.from} size={7} />}
                        <div
                          className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                            isMine
                              ? "bg-[#00A651] text-white rounded-tr-sm"
                              : "bg-[var(--stroke)] text-[var(--ink)] rounded-tl-sm"
                          }`}
                        >
                          {msg.content}
                          <div className={`text-[10px] mt-1 ${isMine ? "text-green-200/80" : "text-[var(--muted)]"}`}>
                            {timeAgo(msg.createdAt)}
                            {isMine && msg.readAt && <span className="ml-1">· Lu</span>}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
                <div ref={bottomRef} />
              </div>

              <div className="px-4 py-3 border-t border-[var(--stroke)] flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                  placeholder="Ton message..."
                  className="flex-1 bg-[var(--panel)] border border-[var(--stroke)] rounded-xl px-4 py-2.5 text-[var(--ink)] text-sm placeholder-[var(--muted)] focus:outline-none focus:border-[#00A651] transition-colors duration-150"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || sending}
                  aria-label="Envoyer"
                  className="w-10 h-10 flex items-center justify-center bg-[#00A651] rounded-xl text-white hover:bg-green-600 transition-colors duration-150 disabled:opacity-40 flex-shrink-0 cursor-pointer"
                >
                  {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[var(--surface)] flex items-center justify-center">
        <Loader2 size={24} className="text-[#00A651] animate-spin" />
      </div>
    }>
      <MessagesContent />
    </Suspense>
  );
}
