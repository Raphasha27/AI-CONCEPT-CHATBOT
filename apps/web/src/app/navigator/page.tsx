"use client";

import React, { useState } from "react";
import Header from "@/components/Header";
import { 
  Compass, 
  Scale, 
  Coins, 
  HelpCircle, 
  ArrowRight, 
  ShieldCheck, 
  FileCheck,
  Zap,
  ChevronRight,
  Info,
  AlertTriangle,
  Calculator,
  Clock,
  ShieldAlert,
  Globe,
  CreditCard,
  Sparkles,
  Activity
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const NAV_TOOLS = [
  {
    id: "civicos-dash",
    title: "City Analytics Dashboard",
    desc: "Executive command cockpit for municipal metrics, service delivery tracking, and incident management.",
    icon: Activity,
    color: "bg-blue-600",
    badge: "Core",
    link: "/civicos"
  },
  {
    id: "hybrid-intel",
    title: "National Fusion Layer",
    desc: "A Common Operating Picture merging real-world streams with predictive intelligence modeling.",
    icon: Sparkles,
    color: "bg-purple-600",
    badge: "Fusion",
    link: "/hybrid"
  },
  {
    id: "billing",
    title: "Tenancy & Billing",
    desc: "Enterprise management for municipal accounts, usage monitoring, and service tier allocation.",
    icon: CreditCard,
    color: "bg-[#1e293b]",
    badge: "Admin",
    link: "/billing"
  },
  {
    id: "national-tower",
    title: "National Control Tower",
    desc: "Centralized oversight for provincial and national governance coordination.",
    icon: Globe,
    color: "bg-blue-900",
    badge: "Government",
    link: "/national-control-tower"
  },
  {
    id: "command-center",
    title: "Operations Control Center",
    desc: "Ward-level operational cockpit with GIS mapping and automated case routing.",
    icon: ShieldAlert,
    color: "bg-indigo-900",
    badge: "Ops",
    link: "/command-center"
  },
  {
    id: "queueless",
    title: "Civic Concierge AI",
    desc: "Public-facing service layer for document preparation and appointment optimization.",
    icon: Clock,
    color: "bg-indigo-500",
    badge: "Public",
    link: "/queueless"
  },
  {
    id: "munifix",
    title: "Incident Engine",
    desc: "Digital service for generating formal municipal verification and reporting records.",
    icon: AlertTriangle,
    color: "bg-red-900",
    badge: "Service",
    link: "/munifix"
  }
,
  {
    id: "taxmate",
    title: "SpazaAI TaxMate",
    desc: "Calculate SARS Turnover Tax, track brackets, and stay compliant automatically.",
    icon: Calculator,
    color: "bg-za-green",
    badge: "Business",
    link: "/taxmate"
  },
  {
    id: "grants",
    title: "Grant & Support Finder",
    desc: "Find out if you qualify for SASSA, NSFAS, or local municipal indigent support.",
    icon: Coins,
    color: "bg-za-green",
    badge: "Most Used"
  },
  {
    id: "rights",
    title: "Citizen Rights Bot",
    desc: "Know your rights during police searches, roadblocks, or evictions.",
    icon: Scale,
    color: "bg-za-blue",
    badge: "Updated"
  },
  {
    id: "claims",
    title: "State/Municipal Claims",
    desc: "How to claim for pothole damage, power surge loss, or medical negligence.",
    icon: FileCheck,
    color: "bg-za-gold",
    badge: "New"
  }
];

export default function NavigatorPage() {
  const [selectedTool, setSelectedTool] = useState<string | null>(null);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  const handleToolClick = (tool: typeof NAV_TOOLS[0]) => {
    if (tool.link) {
      window.location.href = tool.link;
    } else {
      setSelectedTool(tool.id);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0E]">
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <section className="mb-12">
          <div className="flex items-center gap-3 text-blue-400 font-bold text-xs uppercase tracking-widest mb-3">
            <Zap size={14} />
            Unified National Control Plane
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-4 text-white uppercase">
            Sizwe<span className="text-blue-500">OS</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl font-medium">
            Sovereign National Infrastructure Intelligence. National-scale situational awareness, 
            AI-driven crisis prediction, and automated multi-agency coordination.
          </p>
        </section>

        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
        >
          {NAV_TOOLS.map((tool) => (
            <motion.button
              variants={item}
              key={tool.id}
              onClick={() => handleToolClick(tool)}
              className={`card group text-left transition-all relative overflow-hidden ${
                selectedTool === tool.id ? 'ring-2 ring-blue-500/50 border-blue-600' : 'hover:border-blue-500/30'
              }`}
            >
              {tool.badge && (
                <span className="absolute top-3 right-3 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-surface-3 text-blue-500 border border-blue-500/20">
                  {tool.badge}
                </span>
              )}
              <div className={`w-12 h-12 rounded-xl ${tool.color}/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <tool.icon className={`w-6 h-6 ${tool.color.replace('bg-', 'text-')}`} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{tool.title}</h3>
              <p className="text-sm text-slate-400 mb-6 leading-relaxed">
                {tool.desc}
              </p>
              <div className="flex items-center gap-2 text-xs font-bold text-blue-500 mt-auto">
                Access Sovereign Tool <ChevronRight className="w-4 h-4" />
              </div>
            </motion.button>
          ))}
        </motion.div>

        <AnimatePresence mode="wait">
          {selectedTool ? (
            <motion.div
              key={selectedTool}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="card min-h-[400px] border-blue-500/20 bg-gradient-to-br from-[#0a0a0e] to-[#0c111d]"
            >
              <div className="flex flex-col md:flex-row gap-8">
                <div className="md:w-1/3">
                  <h2 className="text-2xl font-bold text-white mb-4">
                    {NAV_TOOLS.find(t => t.id === selectedTool)?.title}
                  </h2>
                  <div className="space-y-4">
                    <div className="flex gap-3 text-sm text-slate-400">
                      <Zap className="w-5 h-5 text-blue-500 shrink-0" />
                      <p>Answer a few questions and our AI will guide you through the official South African process.</p>
                    </div>
                    <div className="flex gap-3 text-sm text-slate-400">
                      <ShieldCheck className="w-5 h-5 text-blue-500 shrink-0" />
                      <p>All data is processed securely and cited from the <strong>National Gazette</strong> and <strong>Sovereign Digital Infrastructure</strong>.</p>
                    </div>
                  </div>
                </div>

                <div className="flex-1 bg-surface-2/50 rounded-2xl p-6 border border-white/5">
                  {/* Mock Interactive Flow */}
                  <div className="space-y-6">
                    <div className="flex gap-3 items-start">
                      <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-500 text-xs font-bold">SZ</div>
                      <div className="p-4 bg-surface-3 rounded-2xl rounded-tl-none border border-white/5 text-sm leading-relaxed text-slate-300">
                        Hello! I am your SizweOS National Intelligence AI. To help you with **{NAV_TOOLS.find(t => t.id === selectedTool)?.title}**, please tell me a bit about your situation or ask a specific question.
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                      {[
                        "Am I eligible for CRR Grant?",
                        "What documents are needed for NSFAS?",
                        "I suffered a power surge, can I claim?",
                        "Rights at a roadblock"
                      ].map((q) => (
                        <button key={q} className="p-3 text-left text-xs bg-surface-3 hover:bg-surface-border rounded-xl transition-colors border border-white/5 text-slate-400 hover:text-white">
                          {q}
                        </button>
                      ))}
                    </div>

                    <div className="pt-6 border-t border-white/5 flex gap-3">
                      <input 
                        className="flex-1 bg-[#07090e] border border-white/5 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 text-white"
                        placeholder="Type your question here..."
                      />
                      <button className="bg-blue-600 hover:bg-blue-500 p-3 rounded-xl text-white shadow-lg shadow-blue-500/20">
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 opacity-50"
            >
              <Info className="w-12 h-12 mx-auto mb-4 text-[var(--color-muted)]" />
              <p className="text-[var(--color-muted)]">Select a tool above to begin your civic journey.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
