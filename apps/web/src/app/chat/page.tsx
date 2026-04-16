"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Send, Plus, Trash2, MessageSquare, LogOut, LayoutDashboard,
  FileText, ShieldCheck, Loader2, ChevronRight, Download, Settings,
} from "lucide-react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { chatAPI } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import VerificationCard from "@/components/VerificationCard";
import { exportChatToPDF } from "@/lib/pdfExport";

interface Message {
  id?: number;
  role: "user" | "assistant";
  content: string;
  verification_result?: Record<string, unknown> | null;
  created_at?: string;
}

interface Session {
  id: number;
  title: string;
  updated_at: string;
}

export default function ChatPage() {
  const { user, loading, logout, isAdmin } = useAuth();
  const router = useRouter();

  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!loading && !user) router.push("/auth");
  }, [user, loading, router]);

  const fetchSessions = useCallback(async () => {
    try {
      const res = await chatAPI.getSessions();
      setSessions(res.data);
    } catch {
      toast.error("Failed to load sessions");
    }
  }, []);

  useEffect(() => { if (user) fetchSessions(); }, [user, fetchSessions]);

  const loadSession = async (session: Session) => {
    setActiveSession(session);
    setLoadingMsgs(true);
    try {
      const res = await chatAPI.getMessages(session.id);
      setMessages(res.data);
    } catch {
      toast.error("Failed to load messages");
    } finally {
      setLoadingMsgs(false);
    }
  };

  const newSession = async () => {
    setActiveSession(null);
    setMessages([]);
  };

  const deleteSession = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await chatAPI.deleteSession(id);
      setSessions((prev) => prev.filter((s) => s.id !== id));
      if (activeSession?.id === id) {
        setActiveSession(null);
        setMessages([]);
      }
      toast.success("Session deleted");
    } catch {
      toast.error("Failed to delete session");
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || sending) return;
    const userMsg: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setSending(true);

    try {
      const res = await chatAPI.sendMessage(input, activeSession?.id);
      const data = res.data;

      if (!activeSession) {
        await fetchSessions();
        const newSess = { id: data.session_id, title: input.slice(0, 50), updated_at: new Date().toISOString() };
        setActiveSession(newSess);
      }

      const assistantMsg: Message = {
        role: "assistant",
        content: data.reply,
        verification_result: data.verification_result,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      toast.error("Failed to get response");
      setMessages((prev) => prev.filter((m) => m !== userMsg));
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const handleExport = () => {
    if (!messages.length) { toast.error("No messages to export"); return; }
    exportChatToPDF(messages, activeSession?.title || "Chat");
    toast.success("PDF exported!");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-za-green" />
      </div>
    );
  }

  const SUGGESTIONS = [
    "Is a construction company registered with CIDB?",
    "How do I verify a doctor with HPCSA?",
    "Report a burst pipe in my municipality",
    "Is this training provider accredited with SAQA?",
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-[#0F0F13]">
      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
            transition={{ type: "spring", damping: 20 }}
            className="w-72 shrink-0 flex flex-col border-r border-surface-border bg-surface-1 h-full"
          >
            {/* Sidebar header */}
            <div className="p-4 border-b border-surface-border">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-gradient-za flex items-center justify-center text-white font-bold text-xs">VZ</div>
                <span className="font-bold text-sm">VerifyZA</span>
              </div>
              <button onClick={newSession} className="btn-primary w-full text-sm">
                <Plus className="w-4 h-4" /> New Chat
              </button>
            </div>

            {/* Sessions */}
            <div className="flex-1 overflow-y-auto p-3 space-y-1">
              <p className="text-xs text-[var(--color-muted)] px-2 py-1 uppercase tracking-wider font-semibold">
                Recent
              </p>
              {sessions.map((session) => (
                <button
                  key={session.id}
                  onClick={() => loadSession(session)}
                  className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-left text-sm transition-all group ${
                    activeSession?.id === session.id
                      ? "bg-surface-2 text-white"
                      : "text-[var(--color-muted)] hover:bg-surface-2 hover:text-white"
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                  <span className="flex-1 truncate">{session.title}</span>
                  <button
                    onClick={(e) => deleteSession(session.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-all"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </button>
              ))}
              {sessions.length === 0 && (
                <p className="text-xs text-[var(--color-muted)] px-2 py-4 text-center">
                  No chats yet. Start a new conversation!
                </p>
              )}
            </div>

            {/* Sidebar footer nav */}
            <div className="p-3 border-t border-surface-border space-y-1">
              <Link href="/dashboard" className="btn-ghost w-full justify-start text-sm">
                <LayoutDashboard className="w-4 h-4" /> Dashboard
              </Link>
              <Link href="/report" className="btn-ghost w-full justify-start text-sm">
                <FileText className="w-4 h-4" /> Report Generator
              </Link>
              {isAdmin && (
                <Link href="/admin" className="btn-ghost w-full justify-start text-sm">
                  <Settings className="w-4 h-4" /> Admin Panel
                </Link>
              )}
              <div className="flex items-center gap-2 px-3 py-2 mt-2 border-t border-surface-border">
                <div className="w-7 h-7 rounded-full bg-za-green/20 flex items-center justify-center text-za-green text-xs font-bold">
                  {user?.full_name?.[0]?.toUpperCase() || "U"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold truncate">{user?.full_name}</p>
                  <p className="text-[10px] text-[var(--color-muted)] truncate">{user?.email}</p>
                </div>
                <button
                  onClick={() => { logout(); router.push("/"); }}
                  className="p-1.5 hover:text-red-400 text-[var(--color-muted)] transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main chat area */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-3 border-b border-surface-border bg-surface-1/50 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen((p) => !p)}
              className="btn-ghost p-2"
            >
              <ChevronRight className={`w-4 h-4 transition-transform ${sidebarOpen ? "rotate-180" : ""}`} />
            </button>
            <div>
              <h1 className="text-sm font-semibold">
                {activeSession?.title || "New Conversation"}
              </h1>
              <p className="text-xs text-[var(--color-muted)]">
                Powered by GPT-4o + pgvector RAG
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {messages.length > 0 && (
              <button onClick={handleExport} className="btn-ghost text-xs gap-1.5">
                <Download className="w-3.5 h-3.5" /> Export PDF
              </button>
            )}
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Empty state */}
          {!messages.length && !loadingMsgs && (
            <div className="flex flex-col items-center justify-center h-full gap-6 py-12">
              <div className="w-16 h-16 rounded-2xl bg-gradient-za flex items-center justify-center">
                <ShieldCheck className="w-8 h-8 text-white" />
              </div>
              <div className="text-center">
                <h2 className="text-xl font-bold mb-2">How can I help you verify?</h2>
                <p className="text-[var(--color-muted)] text-sm max-w-md">
                  Ask me about HPCSA doctors, SAQA qualifications, CIPC businesses,
                  CIDB contractors, or report a municipal issue.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => { setInput(s); textareaRef.current?.focus(); }}
                    className="card text-left text-sm hover:border-za-green/30 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Loading skeleton */}
          {loadingMsgs && (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className={`flex ${i % 2 === 0 ? "justify-end" : ""}`}>
                  <div className={`h-14 rounded-2xl shimmer ${i % 2 === 0 ? "w-48" : "w-72"}`} />
                </div>
              ))}
            </div>
          )}

          {/* Actual messages */}
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 rounded-lg bg-gradient-za flex items-center justify-center text-white text-xs font-bold shrink-0 mt-1">
                    VZ
                  </div>
                )}
                <div className={`max-w-[80%] space-y-2 ${msg.role === "user" ? "items-end" : "items-start"} flex flex-col`}>
                  <div
                    className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-za-green/20 border border-za-green/20 rounded-tr-sm"
                        : "bg-surface-2 border border-surface-border rounded-tl-sm"
                    }`}
                  >
                    <ReactMarkdown className="prose prose-invert prose-sm max-w-none">
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                  {msg.role === "assistant" && msg.verification_result && (
                    <VerificationCard result={msg.verification_result as Record<string, unknown>} />
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Sending indicator */}
          {sending && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex gap-3 items-center"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-za flex items-center justify-center text-white text-xs font-bold shrink-0">
                VZ
              </div>
              <div className="bg-surface-2 border border-surface-border rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex gap-1.5 items-center py-1">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-2 h-2 rounded-full bg-[var(--color-muted)] animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input area */}
        <div className="p-4 border-t border-surface-border bg-surface-1/30 backdrop-blur-sm">
          <div className="flex gap-3 items-end max-w-4xl mx-auto">
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                id="chat-input"
                rows={1}
                className="w-full resize-none bg-surface-2 border border-surface-border rounded-2xl px-4 py-3.5 pr-12 text-sm text-white placeholder-[var(--color-muted)] focus:outline-none focus:ring-2 focus:ring-za-green/40 focus:border-za-green transition-all"
                placeholder="Ask about HPCSA, SAQA, CIPC, CIDB, or report a municipal issue..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                style={{ maxHeight: "160px" }}
              />
            </div>
            <button
              id="send-btn"
              onClick={sendMessage}
              disabled={!input.trim() || sending}
              className="btn-primary p-3.5 shrink-0"
            >
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-center text-[10px] text-[var(--color-muted)] mt-2">
            VerifyZA may not reflect real-time registration status. Always verify via official body websites.
          </p>
        </div>
      </div>
    </div>
  );
}
