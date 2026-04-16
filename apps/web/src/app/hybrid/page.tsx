"use client";

import React, { useState, useEffect } from "react";
import { 
  Globe, 
  Zap, 
  Activity, 
  ShieldAlert, 
  Settings, 
  RefreshCw,
  Layers,
  Cpu,
  TrendingUp,
  AlertCircle,
  Play,
  Database
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { hybridAPI } from "@/lib/api";

export default function HybridIntelligencePage() {
  const [hybridData, setHybridData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeLayer, setActiveLayer] = useState("all");

  const runCycle = async () => {
    setLoading(true);
    try {
      // Inputting mock hybrid data for demonstration of the fusion
      const payload = {
        real: [
          { id: 101, type: "water_outage", severity: 85, location: "Johannesburg CBD", timestamp: "2026-04-16T14:30:00" },
          { id: 102, type: "power_grid_surge", severity: 92, location: "Sandton Sector 4", timestamp: "2026-04-16T15:15:00" }
        ],
        simulated: [
          { id: "S-501", type: "pipe_burst_sim", severity: 45, location: "Pretoria East", timestamp: "2026-04-16T16:00:00" },
          { id: "S-502", type: "grid_stress_test", severity: 78, location: "Soweto West", timestamp: "2026-04-16T16:10:00" }
        ]
      };
      
      const res = await hybridAPI.run(payload);
      setHybridData(res.data.result);
    } catch (error) {
      console.error("Hybrid cycle execution failed", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runCycle();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-indigo-500/30 font-sans">
      {/* Cinematic Header Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_rgba(99,102,241,0.1)_0%,_transparent_50%)] pointer-events-none" />

      <main className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        <header className="flex flex-col md:flex-row items-end justify-between gap-8 mb-16">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-indigo-400 font-black text-xs uppercase tracking-[0.3em]">
               <Globe size={14} className="animate-spin-slow" />
               National Intelligence Layer
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-none bg-gradient-to-r from-white via-white to-white/40 bg-clip-text text-transparent">
              Hybrid Fusion Dashboard
            </h1>
            <p className="text-slate-400 text-lg max-w-2xl font-medium">
              Merging real-world sensor streams with high-fidelity simulations for predictive national situational awareness.
            </p>
          </div>

          <button 
            onClick={runCycle}
            disabled={loading}
            className="group flex items-center gap-3 px-8 py-4 bg-indigo-500 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-400 transition-all hover:scale-[1.02] shadow-2xl shadow-indigo-500/20 disabled:opacity-50"
          >
            {loading ? <RefreshCw className="animate-spin" size={18} /> : <Play size={18} fill="currentColor" />}
            Run Fusion Cycle
          </button>
        </header>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Forecasting Card */}
          <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-[2.5rem] p-10 flex flex-col md:flex-row gap-12 relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-opacity">
                <TrendingUp size={200} />
             </div>
             
             <div className="flex-1 space-y-8">
                <div>
                   <h3 className="text-sm font-black uppercase tracking-widest text-indigo-400 mb-2">Predictive Risk Forecast</h3>
                   <div className="flex items-baseline gap-4">
                      <span className="text-7xl font-black">{hybridData?.forecast.predicted_risk_6h || 0}%</span>
                      <span className="text-slate-500 font-bold text-lg uppercase">Failure Risk (6h)</span>
                   </div>
                </div>

                <div className="flex items-center gap-6">
                   <div className="px-5 py-2.5 bg-red-500/20 border border-red-500/30 rounded-xl">
                      <span className="text-xs font-black text-red-400 uppercase tracking-widest">{hybridData?.forecast.status}</span>
                   </div>
                   <div className="flex items-center gap-2">
                       <ShieldAlert className="text-white/20" size={20} />
                       <span className="text-sm font-bold text-slate-400">Confidence: {Math.round(hybridData?.forecast.confidence_score * 100)}%</span>
                   </div>
                </div>

                <div className="pt-8 border-t border-white/10 grid grid-cols-2 gap-8">
                   <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Current State Index</p>
                      <p className="text-xl font-bold">{hybridData?.forecast.current_risk_index}%</p>
                   </div>
                   <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Reality Drift Factor</p>
                      <p className="text-xl font-bold text-emerald-400">Minimal</p>
                   </div>
                </div>
             </div>

             <div className="w-full md:w-64 space-y-4">
                <div className="p-6 bg-white/5 rounded-3xl border border-white/5 flex flex-col items-center justify-center text-center">
                   <Layers className="text-indigo-400 mb-3" size={32} />
                   <p className="text-xs font-bold text-slate-400 mb-1 uppercase tracking-widest">Active Layers</p>
                   <p className="text-2xl font-black">{hybridData?.fused_layer_count || 0}</p>
                </div>
                <div className="p-6 bg-white/5 rounded-3xl border border-white/10 flex flex-col items-center justify-center text-center">
                   <Cpu className="text-emerald-400 mb-3" size={32} />
                   <p className="text-xs font-bold text-slate-400 mb-1 uppercase tracking-widest">Master Brain Ops</p>
                   <p className="text-2xl font-black tracking-tighter">8.4 TFLOPS</p>
                </div>
             </div>
          </div>

          {/* Controls / Filter */}
          <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 flex flex-col justify-between">
             <div>
                <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                   <Settings className="text-slate-400" size={20} />
                   Layer Controls
                </h3>
                <div className="space-y-3">
                   {["all", "real_world", "simulation"].map(l => (
                     <button 
                       key={l}
                       onClick={() => setActiveLayer(l)}
                       className={`w-full py-4 px-6 rounded-2xl flex items-center justify-between text-xs font-black uppercase tracking-widest transition-all border ${
                         activeLayer === l ? "bg-indigo-500 border-indigo-400" : "bg-white/5 border-white/5 hover:border-white/20"
                       }`}
                     >
                       {l.replace("_", " ")}
                       {activeLayer === l && <RefreshCw size={14} className="animate-spin-slow" />}
                     </button>
                   ))}
                </div>
             </div>

             <div className="p-6 bg-indigo-500/10 border border-indigo-500/20 rounded-[2rem] mt-8">
                <p className="text-sm font-bold text-indigo-200 leading-tight">
                  System fuses 2 real-world signals and 2 simulated stressors into a single reality state.
                </p>
             </div>
          </div>
        </section>

        {/* Fused Event Stream */}
        <section className="space-y-6">
           <div className="flex items-center justify-between px-4">
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                 <Database size={16} /> Fused Operational Reality
              </h3>
              <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Synchronized Lifecycle: T+{Math.round(Date.now()/1000) % 1000}s</div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <AnimatePresence mode="popLayout">
                 {hybridData?.events.filter((e: any) => activeLayer === "all" || e.reality_layer.toLowerCase() === activeLayer).map((event: any, i: number) => (
                   <motion.div
                     key={event.id}
                     layout
                     initial={{ opacity: 0, scale: 0.9 }}
                     animate={{ opacity: 1, scale: 1 }}
                     exit={{ opacity: 0, scale: 0.9 }}
                     className="p-6 bg-white/5 border border-white/10 rounded-3xl hover:bg-white/[0.08] transition-all group cursor-pointer overflow-hidden relative"
                   >
                     <div className={`absolute top-0 right-0 w-1 h-full ${event.reality_layer === "REAL_WORLD" ? "bg-emerald-500" : "bg-indigo-500"}`} />
                     
                     <div className="flex items-center justify-between mb-4">
                        <div className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${
                           event.reality_layer === "REAL_WORLD" ? "bg-emerald-500/20 text-emerald-400" : "bg-indigo-500/20 text-indigo-400"
                        }`}>
                           {event.reality_layer.replace("_", " ")}
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">#{event.id}</span>
                     </div>
                     
                     <h4 className="text-lg font-bold mb-1 group-hover:text-white transition-colors capitalize">{event.type.replace(/_/g, " ")}</h4>
                     <p className="text-sm text-slate-400 font-medium">{event.location}</p>

                     <div className="mt-6 flex items-end justify-between">
                        <div>
                           <p className="text-[10px] font-black text-slate-600 uppercase mb-1">Severity</p>
                           <p className={`text-xl font-black ${event.severity > 70 ? "text-red-500" : "text-white"}`}>{event.severity}%</p>
                        </div>
                        {event.severity > 80 && <AlertCircle className="text-red-500 animate-pulse" size={24} />}
                     </div>
                   </motion.div>
                 ))}
              </AnimatePresence>
           </div>
        </section>
      </main>
    </div>
  );
}
