"use client";

import React, { useState, useMemo } from "react";
import Header from "@/components/Header";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  TrendingUp,
  DollarSign,
  Users,
  FileText,
  ChevronRight,
  Bot,
  Zap,
  Star,
  BarChart3,
  ShoppingCart,
  Lightbulb,
  Send,
  Loader2,
  PieChart,
  LineChart,
  Target,
  AlertTriangle,
  MessageSquare,
  ThumbsUp,
  Smartphone,
  Apple,
  PlayCircle
} from "lucide-react";

// Types for the accounting engine
type Insight = {
  label: string;
  value: string;
  trend: "up" | "down" | "neutral";
  color: string;
};

const TOOLS = [
  {
    id: "intelligence",
    title: "AI Business Intelligence",
    shortTitle: "Intelligence",
    desc: "Mathematical growth estimation and loss prevention with an professional accounting mind.",
    icon: BarChart3,
    gradient: "from-blue-600 to-indigo-600",
    accent: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    questions: [
      "Show my estimated growth for next quarter",
      "Analysis of waste/loss in my stock",
      "Calculate my break-even point",
    ],
    mockResponse: {
      title: "📊 Strategic Growth Analysis",
      body: "Based on current cash flow patterns, your business is projected to grow **14.2% over the next 3 months** if inventory turnover remains at 1.4x. \n\n**Loss Analysis:** We've identified a **R420 monthly loss leakage** in perishable dairy stock. \n\n**Accounting Advice:** To reach your target R50k monthly turnover, you must increase your 'high-margin' snack category by 20% to offset 'low-margin' staple products (Bread/Milk).",
    },
  },
  {
    id: "inventory",
    title: "Inventory Forecaster",
    shortTitle: "Inventory",
    desc: "Advanced stock analysis using localized consumption data.",
    icon: Package,
    gradient: "from-orange-500 to-amber-500",
    accent: "text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
    questions: [
      "What should I restock for month-end?",
      "Identify dead stock sitting on shelves",
      "Supplier price comparison",
    ],
    mockResponse: {
      title: "📦 Optimized Stock Plan",
      body: "Mathematical forecast: You will sell **84 loaves of bread** between Friday and Sunday. Dead stock identified: **12 boxes of detergent** (No movement in 14 days). Action: Run a 'Bundle Deal' with detergents and staples to clear cash tied in dead stock.",
    },
  },
  {
    id: "tax",
    title: "Compliance & Tax",
    shortTitle: "Tax",
    desc: "SARS Turnover Tax and legal compliance simplified.",
    icon: FileText,
    gradient: "from-za-green to-emerald-600",
    accent: "text-za-green",
    bg: "bg-za-green/10",
    border: "border-za-green/20",
    questions: [
      "Generate SARS Turnover Tax estimate",
      "Am I eligible for SME grants?",
      "Document checklist for audit",
    ],
    mockResponse: {
      title: "📋 SARS Turnover Tax Engine",
      body: "Current estimated annual turnover: **R520,000**. \nExpected Tax Liability: **R5,200**. \n\n**Pro-Tip:** Your transport expenses are currently 15% of your costs. Optimizing pickup routes could reduce tax-deductible expenses but increase net profit by R800/month.",
    },
  },
];

export default function SpazaPage() {
  const [activeTool, setActiveTool] = useState(TOOLS[0]);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ role: "user" | "ai"; text: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setInput("");
    setMessages((m) => [...m, { role: "user", text: userMsg }]);
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setMessages((m) => [
      ...m,
      { role: "ai", text: `**${activeTool.mockResponse.title}**\n\n${activeTool.mockResponse.body}` },
    ]);
    setLoading(false);
  };

  const handleFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Thank you for your feedback! Our community team will review it.");
    setFeedback("");
  };

  return (
    <div className="min-h-screen bg-[#080809] text-white">
      <Header />

      {/* Hero / Mobile Promo */}
      <section className="relative overflow-hidden border-b border-surface-border">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-transparent to-orange-500/10" />
        <div className="max-w-7xl mx-auto px-6 py-20 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-400 text-xs font-black px-4 py-2 rounded-full mb-6 border border-blue-500/20 uppercase tracking-widest">
              💼 Professional Business Intelligence
            </div>
            <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
              Scale Your Spaza <br />
              <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-indigo-600 bg-clip-text text-transparent">
                With Data.
              </span>
            </h1>
            <p className="text-[var(--color-muted)] text-xl mb-10 max-w-xl">
              SpazaAI brings enterprise-grade accounting and growth analysis to SA's local vendors.
              Estimate losses, predict profits, and stay SARS compliant.
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              <div className="flex items-center gap-3 bg-surface-2 px-6 py-3 rounded-2xl border border-surface-border">
                <Smartphone className="w-6 h-6 text-blue-400" />
                <div>
                  <p className="text-[10px] text-[var(--color-muted)] font-bold uppercase">Coming Soon to</p>
                  <p className="text-sm font-bold">iOS Store</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-surface-2 px-6 py-3 rounded-2xl border border-surface-border">
                <PlayCircle className="w-6 h-6 text-orange-400" />
                <div>
                  <p className="text-[10px] text-[var(--color-muted)] font-bold uppercase">Coming Soon to</p>
                  <p className="text-sm font-bold">Play Store</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats Grid with Mini Graphs */}
          <div className="flex-1 grid grid-cols-2 gap-4">
            <div className="card bg-blue-500/5 border-blue-500/20 p-6 relative overflow-hidden group">
              <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <LineChart className="w-8 h-8 text-blue-400 mb-4" />
              <p className="text-3xl font-black">+14.2%</p>
              <p className="text-xs text-[var(--color-muted)] font-bold uppercase tracking-widest">Est. Growth</p>
              {/* Mini SVG Graph */}
              <svg className="absolute bottom-4 right-4 w-16 h-8 overflow-visible opacity-50">
                <path d="M0 30 Q 10 10, 20 25 T 40 5 T 60 15" fill="none" stroke="currentColor" strokeWidth="3" className="text-blue-400" />
              </svg>
            </div>
            
            <div className="card bg-orange-500/5 border-orange-500/20 p-6 relative overflow-hidden group">
              <AlertTriangle className="w-8 h-8 text-orange-400 mb-4" />
              <p className="text-3xl font-black">R420</p>
              <p className="text-xs text-[var(--color-muted)] font-bold uppercase tracking-widest">Stock Loss</p>
              <svg className="absolute bottom-4 right-4 w-16 h-8 overflow-visible opacity-50 rotate-180">
                <path d="M0 30 Q 10 10, 20 25 T 40 5 T 60 15" fill="none" stroke="currentColor" strokeWidth="3" className="text-orange-400" />
              </svg>
            </div>

            <div className="card bg-za-green/5 border-za-green/20 p-6 relative overflow-hidden group">
              <Target className="w-8 h-8 text-za-green mb-4" />
              <p className="text-3xl font-black">92%</p>
              <p className="text-xs text-[var(--color-muted)] font-bold uppercase tracking-widest">Accuracy</p>
              {/* Radial Progress Mock */}
              <div className="absolute bottom-4 right-4 w-10 h-10 rounded-full border-4 border-za-green/20 border-t-za-green animate-spin-slow" />
            </div>

            <div className="card bg-purple-500/5 border-purple-500/20 p-6 relative overflow-hidden group">
              <PieChart className="w-8 h-8 text-purple-400 mb-4" />
              <p className="text-3xl font-black">R12.5k</p>
              <p className="text-xs text-[var(--color-muted)] font-bold uppercase tracking-widest">Est. Profit</p>
              <svg className="absolute bottom-4 right-4 w-8 h-8 text-purple-400/30">
                <circle cx="16" cy="16" r="14" fill="none" stroke="currentColor" strokeWidth="4" />
                <path d="M16 2 A 14 14 0 0 1 30 16" fill="none" stroke="currentColor" strokeWidth="4" className="text-purple-400" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Main Workspace */}
      <section className="max-w-7xl mx-auto px-6 py-16 grid lg:grid-cols-4 gap-8">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1 space-y-2">
          <p className="text-xs font-black uppercase tracking-widest text-[var(--color-muted)] mb-4 px-2">
            Professional Suite
          </p>
          {TOOLS.map((tool) => (
            <button
              key={tool.id}
              onClick={() => {
                setActiveTool(tool);
                setMessages([]);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-sm font-medium transition-all ${
                activeTool.id === tool.id
                  ? `${tool.bg} ${tool.border} border text-white shadow-lg`
                  : "text-[var(--color-muted)] hover:bg-surface-2 hover:text-white"
              }`}
            >
              <tool.icon className={`w-4 h-4 shrink-0 ${activeTool.id === tool.id ? tool.accent : ""}`} />
              {tool.shortTitle}
            </button>
          ))}
          
          <div className="mt-8 pt-8 border-t border-surface-border">
            <p className="text-xs font-black uppercase tracking-widest text-[var(--color-muted)] mb-4 px-2">
              Community Reporting
            </p>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 hover:bg-orange-500/20 transition-all font-bold text-sm">
              <AlertTriangle className="w-4 h-4" /> Report Service Issue
            </button>
          </div>
        </div>

        {/* AI Analysis Interface */}
        <div className="lg:col-span-3 card h-[700px] flex flex-col p-0 overflow-hidden relative border-blue-500/10 shadow-2xl">
          {/* Chat Header */}
          <div className={`p-6 border-b border-surface-border bg-gradient-to-r ${activeTool.gradient} opacity-90`}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-white backdrop-blur-md">
                <activeTool.icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold">{activeTool.title}</h3>
                <p className="text-sm text-white/70">{activeTool.desc}</p>
              </div>
            </div>
          </div>

          {/* Chat Logs */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]">
            <AnimatePresence>
              {messages.length === 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-20 h-20 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-6">
                    <Bot className="w-10 h-10 text-blue-400" />
                  </div>
                  <h4 className="text-2xl font-bold mb-2">Accounting Mind Online</h4>
                  <p className="text-[var(--color-muted)] max-w-sm">
                    Enter your query to generate a professional growth analysis or loss estimation.
                  </p>
                  <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-2 w-full max-w-2xl">
                    {activeTool.questions.map((q) => (
                      <button 
                        key={q} 
                        onClick={() => { setInput(q); }}
                        className="text-xs p-3 rounded-xl bg-surface-2 border border-surface-border hover:border-blue-500/40 transition-all text-left"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {messages.map((m, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex gap-4 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${m.role === "ai" ? "bg-blue-500/20 text-blue-400" : "bg-surface-3 text-white"}`}>
                    {m.role === "ai" ? <Bot className="w-5 h-5" /> : <Users className="w-5 h-5" />}
                  </div>
                  <div className={`max-w-[80%] p-4 rounded-2xl ${m.role === "ai" ? "bg-surface-2 border border-surface-border" : "bg-blue-600 text-white"}`}>
                    {m.text.split("\n").map((line, idx) => (
                      <p key={idx} className={idx > 0 ? "mt-2" : ""}>
                         {line.split(/\*\*(.*?)\*\*/).map((part, k) => k % 2 === 1 ? <strong key={k}>{part}</strong> : part)}
                      </p>
                    ))}
                  </div>
                </motion.div>
              ))}

              {loading && (
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center animate-pulse">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div className="p-4 rounded-xl bg-surface-2 border border-surface-border italic text-xs text-[var(--color-muted)]">
                    Analyzing business data and local market trends...
                  </div>
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* Input Area */}
          <div className="p-6 border-t border-surface-border bg-surface-1">
             <div className="relative">
                <input 
                  className="w-full bg-surface-2 border border-surface-border rounded-2xl px-6 py-4 pr-16 text-sm focus:outline-none focus:border-blue-500/50"
                  placeholder="Ask for growth estimation, loss analysis, or tax advice..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                />
                <button 
                  onClick={handleSend}
                  disabled={!input.trim() || loading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-3 rounded-xl bg-blue-600 text-white hover:bg-blue-500 transition-all disabled:opacity-50"
                >
                  <Send className="w-5 h-5" />
                </button>
             </div>
          </div>
        </div>
      </section>

      {/* Community Section: Mobile App & Feedback */}
      <section className="bg-surface-1 border-y border-surface-border py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-20">
          {/* Mobile App Marketing */}
          <div>
            <h2 className="text-4xl font-black mb-6">SpazaAI in Your Pocket</h2>
            <p className="text-[var(--color-muted)] text-lg mb-8">
              We are scaling beyond the web. The SpazaAI mobile app is designed for low-data environments, 
              supporting local languages and Bluetooth receipt printing.
            </p>
            <div className="relative w-full max-w-sm mx-auto md:mx-0">
               {/* Mock Phone Frame */}
               <div className="card border-surface-border p-2 rounded-[3rem] bg-black shadow-2xl relative z-10">
                  <div className="bg-[#080809] rounded-[2.5rem] h-[500px] overflow-hidden relative">
                    {/* Phone Screen Mock */}
                    <div className="p-4 pt-10">
                      <div className="flex justify-between items-center mb-6 px-2">
                        <p className="font-bold text-lg">My Sales</p>
                        <PieChart className="w-5 h-5 text-blue-400" />
                      </div>
                      <div className="space-y-3">
                         {[1,2,3].map(i => (
                           <div key={i} className="bg-surface-2 p-3 rounded-xl border border-surface-border flex justify-between items-center">
                              <div className="flex gap-3 items-center">
                                <div className="w-8 h-8 rounded-lg bg-blue-500/20" />
                                <div>
                                  <div className="w-16 h-2 bg-surface-border rounded mb-1" />
                                  <div className="w-10 h-1.5 bg-surface-border/50 rounded" />
                                </div>
                              </div>
                              <div className="w-12 h-3 bg-za-green/20 rounded" />
                           </div>
                         ))}
                      </div>
                      <div className="absolute bottom-10 left-0 right-0 px-6">
                        <div className="w-full h-12 bg-blue-600 rounded-xl flex items-center justify-center font-bold">
                          Quick Inventory Scan
                        </div>
                      </div>
                    </div>
                  </div>
               </div>
               {/* Decorative background for phone */}
               <div className="absolute -top-10 -right-10 w-full h-full bg-blue-600/5 rounded-full blur-3xl" />
            </div>
          </div>

          {/* Feedback Section */}
          <div className="flex flex-col justify-center">
            <div className="card border-zac-green/20 bg-za-green/5 p-8">
              <h3 className="text-3xl font-black mb-4">Community Feedback</h3>
              <p className="text-[var(--color-muted)] mb-8">
                Your feedback helps us scale. Tell us what features your local shop or vendor community needs most.
              </p>
              <form onSubmit={handleFeedback} className="space-y-4">
                <textarea 
                  className="w-full bg-surface-1 border border-surface-border rounded-xl p-4 text-sm focus:outline-none focus:border-za-green/50 min-h-[150px]"
                  placeholder="Tell us what you need... (e.g. More language support, stock tracking for street vendors, etc.)"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  required
                />
                <button 
                  type="submit"
                  className="w-full bg-za-green text-white font-bold py-4 rounded-xl hover:bg-za-green/90 transition-all flex items-center justify-center gap-2"
                >
                  <ThumbsUp className="w-5 h-5" /> Submit Feedback
                </button>
              </form>
            </div>
            
            <div className="mt-10 flex items-center gap-6">
              <div className="flex -space-x-3">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full bg-surface-3 border-2 border-[#080809] flex items-center justify-center text-[10px] font-bold">
                    V{i}
                  </div>
                ))}
              </div>
              <p className="text-sm text-[var(--color-muted)]">
                Joined by <strong className="text-white">1,200+</strong> local South African vendors.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer / App Store Links */}
      <footer className="py-20 text-center px-6">
        <h2 className="text-3xl font-black mb-8">Download SpazaAI Beta</h2>
        <div className="flex flex-wrap justify-center gap-6 mb-12">
           <button className="flex items-center gap-4 bg-white text-black px-8 py-4 rounded-2xl transform hover:scale-105 transition-all">
             <Smartphone className="w-8 h-8" />
             <div className="text-left">
               <p className="text-[10px] uppercase font-bold">Download on the</p>
               <p className="text-xl font-bold">App Store</p>
             </div>
           </button>
           <button className="flex items-center gap-4 bg-white text-black px-8 py-4 rounded-2xl transform hover:scale-105 transition-all">
             <PlayCircle className="w-8 h-8" />
             <div className="text-left">
               <p className="text-[10px] uppercase font-bold">Get it on</p>
               <p className="text-xl font-bold">Google Play</p>
             </div>
           </button>
        </div>
        <p className="text-[var(--color-muted)] text-sm">
          &copy; 2026 SizweOS — National Infrastructure Intelligence Platform.
        </p>
      </footer>
    </div>
  );
}
