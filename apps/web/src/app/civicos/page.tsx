"use client";

import React, { useState, useEffect } from "react";
import { 
  BarChart3, 
  ShieldAlert, 
  Activity, 
  AlertCircle,
  Clock,
  ChevronRight,
  TrendingUp,
  Search,
  Filter,
  LayoutDashboard,
  BrainCircuit,
  Settings,
  Bell,
  ArrowUpRight
} from "lucide-react";
import { motion } from "framer-motion";
import { incidentsAPI } from "@/lib/api";

export default function CivicOSDashboard() {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIncidents();
  }, []);

  const fetchIncidents = async () => {
    try {
      const res = await incidentsAPI.list();
      setIncidents(res.data);
    } catch (error) {
      console.error("Failed to load incidents", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-200 font-sans selection:bg-blue-500/30">
      {/* Subtle Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-16 border-r border-white/5 bg-[#0b0f17] flex flex-col items-center py-8 gap-10 z-20">
         <div className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <LayoutDashboard size={20} className="text-white" />
         </div>
         <nav className="flex flex-col gap-6 text-slate-500">
            <button className="p-2 hover:text-white transition-colors"><Activity size={20} /></button>
            <button className="p-2 hover:text-white transition-colors"><ShieldAlert size={20} /></button>
            <button className="p-2 hover:text-white transition-colors"><BrainCircuit size={20} /></button>
            <button className="p-2 hover:text-white transition-colors"><Bell size={20} /></button>
         </nav>
         <button className="mt-auto p-2 text-slate-600 hover:text-white"><Settings size={20} /></button>
      </aside>

      <main className="pl-16">
        {/* Header */}
        <header className="h-20 px-8 border-b border-white/5 flex items-center justify-between bg-[#0b0f17]/50 backdrop-blur-xl sticky top-0 z-10">
           <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                 Civic<span className="text-blue-500">OS</span>
                 <span className="mx-2 h-4 w-px bg-white/10" />
                 <span className="text-sm text-slate-500 font-medium">Municipal Intelligence</span>
              </h1>
           </div>
           <div className="flex items-center gap-4">
              <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
                 System: Stable
              </div>
              <div className="h-8 w-8 rounded-full bg-slate-800 border border-white/10" />
           </div>
        </header>

        <div className="p-8 max-w-[1600px] mx-auto space-y-8">
           {/* KPI Grid */}
           <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: "Active Incidents", val: incidents.length, icon: ShieldAlert, color: "text-blue-400" },
                { label: "High Risk Clusters", val: "12", icon: AlertCircle, color: "text-orange-400" },
                { label: "Avg TAT", val: "4.2h", icon: Clock, color: "text-slate-400" },
                { label: "Predictive Health", val: "94%", icon: TrendingUp, color: "text-emerald-400" }
              ].map((kpi, i) => (
                <div key={i} className="bg-[#111827] border border-white/5 p-6 rounded-2xl shadow-sm hover:border-white/10 transition-colors">
                   <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">{kpi.label}</p>
                   <div className="flex items-end justify-between">
                      <h3 className="text-2xl font-black text-white">{kpi.val}</h3>
                      <kpi.icon className={kpi.color} size={20} />
                   </div>
                </div>
              ))}
           </section>

           {/* Main Content Grid */}
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Incident Table */}
              <div className="lg:col-span-2 bg-[#111827] border border-white/5 rounded-2xl overflow-hidden shadow-sm">
                 <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                       Active Incident Management
                    </h3>
                    <div className="flex items-center gap-2">
                       <button className="p-1.5 hover:bg-white/5 rounded-md text-slate-500 transition-colors"><Search size={16} /></button>
                       <button className="p-1.5 hover:bg-white/5 rounded-md text-slate-500 transition-colors"><Filter size={16} /></button>
                    </div>
                 </div>
                 
                 <div className="overflow-x-auto">
                    <table className="w-full text-left">
                       <thead>
                          <tr className="text-[10px] font-bold uppercase tracking-widest text-slate-500 border-b border-white/5">
                             <th className="px-6 py-4">Incident Type</th>
                             <th className="px-6 py-4">Risk Velocity</th>
                             <th className="px-6 py-4">Status</th>
                             <th className="px-6 py-4 text-right">Reference</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-white/5">
                          {incidents.slice(0, 8).map((inc) => (
                            <tr key={inc.id} className="hover:bg-white/[0.02] transition-colors group cursor-pointer">
                               <td className="px-6 py-5">
                                  <div>
                                     <p className="text-sm font-bold text-slate-200 capitalize">{inc.type.replace(/_/g, " ")}</p>
                                     <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{inc.description}</p>
                                  </div>
                               </td>
                               <td className="px-6 py-5">
                                  <div className="flex items-center gap-2">
                                     <span className={`text-xs font-bold ${inc.risk_score > 70 ? "text-orange-500" : "text-slate-400"}`}>
                                        {inc.risk_score}%
                                     </span>
                                     <div className="w-16 h-1 bg-white/5 rounded-full overflow-hidden">
                                        <div className={`h-full ${inc.risk_score > 70 ? "bg-orange-500" : "bg-blue-500"}`} style={{width: `${inc.risk_score}%`}} />
                                     </div>
                                  </div>
                               </td>
                               <td className="px-6 py-5">
                                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                                     inc.status === "pending" ? "bg-orange-500/10 text-orange-400" : "bg-slate-500/10 text-slate-400"
                                  }`}>
                                     {inc.status}
                                  </span>
                               </td>
                               <td className="px-6 py-5 text-right font-mono text-[10px] text-slate-600">
                                  #{inc.id.toString().slice(0,8)}
                               </td>
                            </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
                 <div className="p-4 border-t border-white/5 text-center">
                    <button className="text-xs font-bold text-blue-500 hover:text-blue-400 transition-colors uppercase tracking-widest">
                       View All Incidents
                    </button>
                 </div>
              </div>

              {/* Sidebar: Insights & Map */}
              <div className="space-y-8">
                 <div className="bg-[#111827] border border-white/5 rounded-2xl p-6 shadow-sm">
                    <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2">
                       <BrainCircuit size={16} className="text-blue-500" />
                       Intelligence Insights
                    </h3>
                    <div className="space-y-4">
                       {[
                         { msg: "Infrastructure stress detected in Region 4.", type: "warning" },
                         { msg: "Water pressure trending downward (-12% YoY).", type: "critical" },
                         { msg: "Optimal maintenance window for Sandton Sector.", type: "neutral" }
                       ].map((hint, i) => (
                         <div key={i} className="p-4 bg-white/5 border border-white/5 rounded-xl flex items-start gap-3">
                            <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${
                               hint.type === "critical" ? "bg-red-500" : hint.type === "warning" ? "bg-orange-500" : "bg-blue-500"
                            }`} />
                            <p className="text-xs font-medium text-slate-400 leading-relaxed">{hint.msg}</p>
                         </div>
                       ))}
                    </div>
                    <button className="w-full mt-6 py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2">
                       Generate Full Analysis
                    </button>
                 </div>

                 <div className="bg-[#111827] border border-white/5 rounded-2xl p-6 shadow-sm overflow-hidden relative">
                    <div className="flex items-center justify-between mb-4">
                       <h3 className="text-sm font-bold text-white">Infrastructure Map</h3>
                       <ArrowUpRight size={16} className="text-slate-500" />
                    </div>
                    <div className="h-48 bg-[#0b0f17] rounded-xl border border-white/5 flex items-center justify-center relative overflow-hidden">
                       <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
                       <div className="h-2 w-2 bg-red-500 rounded-full animate-ping" />
                       <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mt-4">Geospatial Layer Active</p>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-4">
                       <div>
                          <p className="text-[10px] font-bold text-slate-500 uppercase">Coverage</p>
                          <p className="text-sm font-black text-white">98.4%</p>
                       </div>
                       <div>
                          <p className="text-[10px] font-bold text-slate-500 uppercase">Latency</p>
                          <p className="text-sm font-black text-white">42ms</p>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </main>
    </div>
  );
}
