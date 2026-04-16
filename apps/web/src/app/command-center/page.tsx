"use client";

import React, { useState, useEffect } from "react";
import { 
  BarChart3, 
  Map as MapIcon, 
  Activity, 
  Clock, 
  TrendingUp, 
  AlertTriangle,
  Users,
  CheckCircle2,
  ChevronRight,
  ShieldAlert,
  Search,
  Filter,
  ArrowUpRight,
  MoreVertical,
  Bell
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { commandCenterAPI } from "@/lib/api";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from "recharts";

// Mock data for initial visual pop
const CATEGORY_COLORS: { [key: string]: string } = {
  water: "#3b82f6",
  electricity: "#eab308",
  roads: "#ef4444",
  waste: "#22c55e",
  sanitation: "#a855f7",
  other: "#94a3b8"
};

export default function CommandCenterPage() {
  const [metrics, setMetrics] = useState<any>(null);
  const [liveCases, setLiveCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // 30s auto-refresh
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [mRes, lRes] = await Promise.all([
        commandCenterAPI.metrics(),
        commandCenterAPI.liveCases(10)
      ]);
      setMetrics(mRes.data);
      setLiveCases(lRes.data);
    } catch (error) {
      console.error("Failed to fetch command center data", error);
    } finally {
      setLoading(false);
    }
  };

  const dashboardMetrics = [
    { title: "Active Cases", value: metrics?.summary.active_cases || "0", icon: Activity, color: "text-blue-500", trend: "+12%" },
    { title: "Escalated", value: metrics?.summary.escalations || "0", icon: ShieldAlert, color: "text-red-500", trend: "+5%" },
    { title: "Resolved Today", value: metrics?.summary.resolved_today || "0", icon: CheckCircle2, color: "text-green-500", trend: "+18%" },
    { title: "Avg. Response", value: metrics?.summary.avg_response_time || "N/A", icon: Clock, color: "text-yellow-500", trend: "-0.5d" },
  ];

  const chartData = Object.entries(metrics?.categories || {}).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value
  }));

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-indigo-500/30">
      {/* Top Navigation / Glassmorphic Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-[1600px] mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
              <ShieldAlert className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">National Operations Cockpit</h1>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-widest leading-none">QueueLess AI Sovereign Intelligence</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-1 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full">
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-semibold text-green-500">SYSTEM LIVE</span>
            </div>
            <button className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
              <Bell size={20} className="text-slate-400" />
            </button>
            <div className="flex items-center gap-3 pl-6 border-l border-white/10">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold leading-none">Admin Controller</p>
                <p className="text-xs text-slate-400 mt-1">Gauteng Sector</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500" />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto p-6 space-y-8">
        {/* KPI Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {dashboardMetrics.map((kpi, idx) => (
            <motion.div
              key={kpi.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/[0.07] transition-all group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <kpi.icon size={80} />
              </div>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-400">{kpi.title}</p>
                  <h3 className="text-3xl font-bold mt-2">{kpi.value}</h3>
                </div>
                <div className={`p-2 rounded-lg bg-white/5 ${kpi.color}`}>
                  <kpi.icon size={20} />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <span className={`text-xs font-bold px-2 py-0.5 rounded ${idx === 3 ? "bg-blue-500/20 text-blue-400" : "bg-green-500/20 text-green-400"}`}>
                  {kpi.trend}
                </span>
                <span className="text-xs text-slate-500 font-medium">vs last 30d</span>
              </div>
            </motion.div>
          ))}
        </section>

        {/* Central Dashboard Layout */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Visuals: Map + Charts */}
          <div className="lg:col-span-2 space-y-8">
            {/* Live Map Placeholder / Visualization */}
            <div className="h-[500px] bg-slate-900 border border-white/10 rounded-3xl overflow-hidden relative group">
              <div className="absolute inset-0 bg-[#0c111d] flex items-center justify-center">
                {/* Simulated Map SVG Background */}
                <svg className="w-full h-full opacity-20" viewBox="0 0 800 600">
                  <path d="M100 100 L200 150 L300 100 L400 200 L500 150" fill="none" stroke="currentColor" strokeWidth="2" />
                  <circle cx="200" cy="150" r="4" fill="red" className="animate-pulse" />
                  <circle cx="350" cy="180" r="4" fill="orange" className="animate-pulse" />
                  <circle cx="450" cy="300" r="4" fill="red" className="animate-pulse" />
                </svg>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                <div className="text-center z-10 px-6">
                  <MapIcon className="mx-auto text-indigo-500/40 mb-4" size={48} />
                  <h3 className="text-xl font-bold">Interactive Geographic Intelligence</h3>
                  <p className="text-slate-400 max-w-sm mt-2 font-medium">Real-time localized failures and ward-level health monitoring.</p>
                  <button className="mt-6 px-6 py-2.5 bg-indigo-500 rounded-xl font-bold hover:bg-indigo-400 transition-colors shadow-lg shadow-indigo-500/20">
                    Initialize Full GIS Layer
                  </button>
                </div>
              </div>

              {/* Map Floating Controls */}
              <div className="absolute top-6 left-6 space-y-2">
                <div className="px-4 py-2 bg-slate-950/80 backdrop-blur-md border border-white/10 rounded-xl flex items-center gap-3">
                  <span className="h-2 w-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                  <span className="text-xs font-bold uppercase tracking-wider">Critical Failure Detected (Ward 12)</span>
                </div>
              </div>
            </div>

            {/* AI Insights & Patterns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold flex items-center gap-2">
                    <TrendingUp className="text-indigo-400" size={18} />
                    Issue Distribution
                  </h3>
                  <button className="text-xs text-slate-400 hover:text-white transition-colors">View All</button>
                </div>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                      <YAxis stroke="#94a3b8" fontSize={12} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #ffffff10", borderRadius: "8px" }}
                        itemStyle={{ color: "#fff" }}
                      />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.name.toLowerCase()] || "#6366f1"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="p-6 bg-white/5 border border-white/10 rounded-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6">
                  <div className="h-12 w-12 bg-indigo-500/10 rounded-full flex items-center justify-center">
                    <ShieldAlert className="text-indigo-400" size={24} />
                  </div>
                </div>
                <h3 className="font-bold mb-2">AI Behavioral Insight</h3>
                <p className="text-sm text-slate-400 font-medium leading-relaxed max-w-[80%]">
                  "Pattern detected in Ward 7: 3 repeated water outages within 48 hours indicates likely main supply deterioration. Recommend pre-emptive infrastructure audit."
                </p>
                <div className="mt-8 pt-6 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">Confidence Level</p>
                      <p className="text-lg font-bold text-indigo-400">92% Match</p>
                    </div>
                    <button className="text-xs font-bold text-indigo-400 hover:underline">Deploy Alert</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Live Feed & Escalations */}
          <div className="space-y-8">
            <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden flex flex-col h-[850px]">
              <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
                <h3 className="font-bold flex items-center gap-2 text-indigo-400">
                  <Activity size={18} />
                  Live Operational Feed
                </h3>
                <span className="text-xs px-2 py-0.5 bg-indigo-500/20 text-indigo-400 rounded-full font-bold">10 NEW</span>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
                {liveCases.map((report, idx) => (
                  <motion.div
                    key={report.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/[0.08] transition-all cursor-pointer group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${
                        report.urgency_score > 70 ? "bg-red-500/20 text-red-400" : "bg-yellow-500/20 text-yellow-400"
                      }`}>
                        {report.category}
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">#{report.tracking_id.slice(0, 8)}</span>
                    </div>
                    <p className="text-sm font-semibold line-clamp-2 leading-tight">
                      {report.description}
                    </p>
                    <div className="mt-4 flex items-center justify-between text-[11px] text-slate-400">
                      <span className="flex items-center gap-1 font-medium">
                        <MapIcon size={12} />
                        {report.ward || "Ward Unknown"}
                      </span>
                      <span className="font-mono">{new Date(report.created_at).toLocaleTimeString()}</span>
                    </div>
                    
                    <div className="mt-4 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                       <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${report.urgency_score}%` }}
                        className={`h-full ${report.urgency_score > 70 ? "bg-red-500" : "bg-yellow-500"}`} 
                       />
                    </div>
                  </motion.div>
                ))}

                {liveCases.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-white/[0.01] rounded-3xl border border-dashed border-white/10">
                    <Search className="text-slate-800 mb-4" size={48} />
                    <p className="text-slate-500 font-medium">Awaiting incoming sensor & civic data stream...</p>
                  </div>
                )}
              </div>

              <div className="p-4 bg-slate-950/50 border-t border-white/10">
                <button className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-sm font-bold hover:bg-white/10 transition-colors flex items-center justify-center gap-2">
                  View Full Resolution Queue
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
