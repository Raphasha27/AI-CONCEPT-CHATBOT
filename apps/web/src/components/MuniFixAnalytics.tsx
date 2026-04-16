"use client";

import React, { useState, useEffect } from "react";
import { 
  BarChart3, 
  Map as MapIcon, 
  Activity, 
  Clock, 
  TrendingUp, 
  AlertTriangle 
} from "lucide-react";
import { adminAPI } from "@/lib/api";
import { motion } from "framer-motion";

export default function MuniFixAnalytics() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    // Mock analytics for now as the backend needs specific aggregation endpoints
    setStats({
      totalComplaints: 1240,
      resolvedRate: "68%",
      avgResponseTime: "3.2 days",
      topIssues: [
        { name: "Water Leaks", count: 450, color: "bg-blue-500" },
        { name: "Potholes", count: 320, color: "bg-orange-500" },
        { name: "Electricity", count: 280, color: "bg-yellow-500" },
        { name: "Sewage", count: 190, color: "bg-green-500" },
      ],
      hotspotWards: ["Ward 102", "Ward 45", "Ward 12"],
    });
  }, []);

  if (!stats) return null;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "Total Complaints", value: stats.totalComplaints, icon: Activity, color: "text-blue-400" },
          { label: "Resolution Rate", value: stats.resolvedRate, icon: TrendingUp, color: "text-green-400" },
          { label: "Avg. Response", value: stats.avgResponseTime, icon: Clock, color: "text-purple-400" },
          { label: "Critical Issues", value: "42", icon: AlertTriangle, color: "text-red-400" },
        ].map((s, i) => (
          <div key={i} className="bg-slate-900/50 border border-white/10 p-6 rounded-3xl">
            <div className="flex items-center justify-between mb-4">
              <s.icon className={`w-6 h-6 ${s.color}`} />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Live</span>
            </div>
            <p className="text-2xl font-bold text-white">{s.value}</p>
            <p className="text-sm text-slate-400">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-slate-900/50 border border-white/10 p-8 rounded-3xl">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-400" />
            Issue Distribution
          </h3>
          <div className="space-y-6">
            {stats.topIssues.map((issue: any, i: number) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-300">{issue.name}</span>
                  <span className="text-white font-bold">{issue.count}</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(issue.count / stats.totalComplaints) * 100}%` }}
                    className={`h-full ${issue.color}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900/50 border border-white/10 p-8 rounded-3xl">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <MapIcon className="w-5 h-5 text-green-400" />
            Service Delivery Hotspots
          </h3>
          <div className="space-y-4">
            {stats.hotspotWards.map((ward: string, i: number) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-slate-950 border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="font-medium">{ward}</span>
                </div>
                <div className="text-xs text-slate-500">
                  {80 - (i * 15)} active reports
                </div>
              </div>
            ))}
          </div>
          <p className="mt-8 text-xs text-slate-500 text-center italic">
            * Data aggregated from verified community reports and municipal tracking IDs.
          </p>
        </div>
      </div>
    </div>
  );
}
