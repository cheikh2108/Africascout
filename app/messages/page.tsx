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
  if (mins  < 1)  return "À l'instant";
  if (mins  < 60) return `${mins} min`;
  if (hours < 24) return `${hours}h`;
  return `${days}j`;
}

function Avatar({ user, size = 10 }: { user: UserSnippet; size?: number }) {
  const cls = `relative rounded-full overflow-hidden bg-gray-800 flex-shrink-0 w-${size} h-${size}`;
  return (
    <div className={cls}>
      {user.avatarUrl ? (
        <Image src={user.avatarUrl} alt={user.fullName} fill className="object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center font-bold text-gray-500 text-sm">
          {user.fullName[0]?.toUpperCase()}
        </div>
      )}
    </div>
  );
}

// Le composant interne utilise useSearchParams — il doit être dans un Suspense
function MessagesContent() {
  const searchParams = useSearchParams();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeUser,    setActiveUser]    = useState<UserSnippet | null>(null);
  const [messages,      setMessages]      = useState<Message[]>([]);
  const [myId,          setMyId]          = useState<string | null>(null);
  const [input,         setInput]         = useState("");
  const [sending,       setSending]       = useState(false);
  const [loadingConvs,  setLoadingConvs]  = useState(true);
  const bottomRef  = useRef<HTMLDivElement>(null);
  const pollRef    = useRef<ReturnType<typeof setInterval> | null>(null);

  // Charge la liste des conversations
  const loadConversations = useCallback(async () => {
    const res  = await fetch("/api/messages");
    const data = await res.json();
    setConversations(data.conversations ?? []);
    setLoadingConvs(false);
  }, []);

  // Charge les messages d'une conversation (utilisé par le polling aussi)
  const loadMessages = useCallback(async (userId: string) => {
    const res  = await fetch(`/api/messages?with=${userId}`);
    const data = await res.json();
    setMessages(data.messages ?? []);
    setMyId(data.myId ?? null);
  }, []);

  useEffect(() => { loadConversations(); }, [loadConversations]);

  // Ouvre directement une conversation si ?with=userId est dans l'URL
  useEffect(() => {
    const withId = searchParams.get("with");
    if (!withId) return;
    // Charge les infos de l'interlocuteur depuis la liste des conversations,
    // ou crée un objet minimal pour démarrer la conversation
    setActiveUser({ id: withId, fullName: "...", avatarUrl: null });
  }, [searchParams]);

  // Démarre le polling quand une conversation est ouverte
  useEffect(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    if (!activeUser) return;

    loadMessages(activeUser.id);

    // Polling toutes les 3 secondes — quasi temps réel sans WebSocket
    pollRef.current = setInterval(() => loadMessages(activeUser.id), 3000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [activeUser, loadMessages]);

  // Scroll automatique vers le bas à chaque nouveau message
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

    // Ajout optimiste — le message apparaît immédiatement sans attendre la réponse serveur
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

    // Recharge pour avoir l'ID réel du message
    await loadMessages(activeUser.id);
    await loadConversations();
    setSending(false);
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D]">
      <div className="max-w-3xl mx-auto flex h-[calc(100vh-3.5rem)]">

        {/* ── Panneau gauche : liste des conversations ── */}
        <div className={`w-full sm:w-72 flex-shrink-0 border-r border-gray-800 flex flex-col ${activeUser ? "hidden sm:flex" : "flex"}`}>
          <div className="px-4 py-4 border-b border-gray-800">
            <h1 className="text-lg font-bold text-white">Messages</h1>
          </div>

          {loadingConvs ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 size={20} className="text-[#00A651] animate-spin" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-600 px-6 text-center">
              <MessageCircle size={36} className="mb-3 opacity-20" />
              <p className="text-sm">Aucune conversation.</p>
              <p className="text-xs mt-1">Va sur le profil d'un joueur pour lui envoyer un message.</p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto">
              {conversations.map((conv) => {
                const other = conv.from.id === myId ? conv.to : conv.from;
                const isActive = activeUser?.id === other.id;
                return (
                  <button
                    key={conv.id}
                    onClick={() => openConversation(other)}
                    className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-900 transition text-left ${isActive ? "bg-gray-900" : ""}`}
                  >
                    <Avatar user={other} size={10} />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline">
                        <span className="font-medium text-white text-sm truncate">{other.fullName}</span>
                        <span className="text-xs text-gray-600 flex-shrink-0 ml-2">{timeAgo(conv.createdAt)}</span>
                      </div>
                      <p className="text-xs text-gray-500 truncate mt-0.5">{conv.content}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Panneau droit : conversation active ── */}
        <div className={`flex-1 flex flex-col ${activeUser ? "flex" : "hidden sm:flex"}`}>
          {!activeUser ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-700">
              <MessageCircle size={48} className="mb-3 opacity-10" />
              <p className="text-sm">Sélectionne une conversation</p>
            </div>
          ) : (
            <>
              {/* Header de la conversation */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-800">
                <button
                  onClick={() => setActiveUser(null)}
                  className="sm:hidden text-gray-500 hover:text-white"
                >
                  <ArrowLeft size={20} />
                </button>
                <Avatar user={activeUser} size={9} />
                <span className="font-semibold text-white">{activeUser.fullName}</span>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                <AnimatePresence initial={false}>
                  {messages.map((msg) => {
                    const isMine = msg.from.id === myId;
                    return (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex gap-2 ${isMine ? "flex-row-reverse" : "flex-row"}`}
                      >
                        {!isMine && <Avatar user={msg.from} size={7} />}
                        <div
                          className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm leading-relaxed ${
                            isMine
                              ? "bg-[#00A651] text-white rounded-tr-sm"
                              : "bg-gray-800 text-gray-100 rounded-tl-sm"
                          }`}
                        >
                          {msg.content}
                          <div className={`text-xs mt-1 ${isMine ? "text-green-200" : "text-gray-500"}`}>
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

              {/* Zone de saisie */}
              <div className="px-4 py-3 border-t border-gray-800 flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                  placeholder="Ton message..."
                  className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#00A651] transition"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || sending}
                  className="w-10 h-10 flex items-center justify-center bg-[#00A651] rounded-xl text-white hover:bg-green-600 transition disabled:opacity-40 flex-shrink-0"
                >
                  {sending
                    ? <Loader2 size={16} className="animate-spin" />
                    : <Send size={16} />
                  }
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
      <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
        <Loader2 size={24} className="text-[#00A651] animate-spin" />
      </div>
    }>
      <MessagesContent />
    </Suspense>
  );
}
