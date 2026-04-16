"use client";

import React, { useEffect, useState } from "react";
import Header from "@/components/Header";
import { usersAPI, reportsAPI, adminAPI } from "@/lib/api";
import { 
  History, 
  FileText, 
  TrendingUp, 
  Search, 
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  FileCheck
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { motion } from "framer-motion";

export default function DashboardPage() {
  const [verifications, setVerifications] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [vRes, rRes] = await Promise.all([
          usersAPI.myVerifications(),
          reportsAPI.list()
        ]);
        setVerifications(vRes.data);
        setReports(rRes.data);
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const stats = [
    { label: "Verifications", val: verifications.length, icon: ShieldCheck, color: "text-za-green" },
    { label: "Active Reports", val: reports.filter(r => r.status !== 'resolved').length, icon: AlertTriangle, color: "text-za-gold" },
    { label: "Resolution Rate", val: "0%", icon: TrendingUp, color: "text-blue-400" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 rounded-full border-2 border-surface-border border-t-za-green animate-spin" />
        <span className="text-[var(--color-muted)] text-sm animate-pulse">Loading your dashboard...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0E]">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">User Dashboard</h1>
          <p className="text-[var(--color-muted)] text-sm">Welcome back. Manage your compliance checks and municipal reports here.</p>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {stats.map((stat, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              key={stat.label} 
              className="card relative overflow-hidden group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-[var(--color-muted)] uppercase tracking-wider font-semibold mb-1">{stat.label}</p>
                  <p className="text-3xl font-extrabold text-white">{stat.val}</p>
                </div>
                <div className={`p-3 rounded-xl bg-surface-3 transition-transform group-hover:scale-110`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Verifications */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-za-green" />
                <h2 className="text-lg font-bold text-white">Verification History</h2>
              </div>
              <Link href="/chat" className="text-xs text-za-green font-bold hover:underline">New Check +</Link>
            </div>

            <div className="space-y-3">
              {verifications.length > 0 ? verifications.map((v, i) => (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  key={v.id} 
                  className="card group cursor-pointer hover:border-surface-border-hover transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          v.status === 'verified' ? 'bg-za-green/10 text-za-green' : 
                          v.status === 'unverified' ? 'bg-red-500/10 text-red-500' : 
                          'bg-za-gold/10 text-za-gold'
                        }`}>
                          {v.status}
                        </span>
                        <span className="text-[10px] text-[var(--color-muted)] font-medium">
                          {format(new Date(v.created_at), 'MMM d, HH:mm')}
                        </span>
                      </div>
                      <p className="text-sm text-white font-medium line-clamp-1 mb-1">{v.query}</p>
                      <p className="text-xs text-[var(--color-muted)] line-clamp-2 leading-relaxed">{v.summary}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-surface-3 group-hover:bg-za-green group-hover:text-white transition-colors">
                      <Search className="w-4 h-4" />
                    </div>
                  </div>
                </motion.div>
              )) : (
                <div className="card text-center py-12 border-dashed">
                  <ShieldCheck className="w-10 h-10 text-surface-3 mx-auto mb-4" />
                  <p className="text-[var(--color-muted)] text-sm mb-4">No verifications found.</p>
                  <Link href="/chat" className="btn-primary py-2 px-6 inline-flex">Start Your First Check</Link>
                </div>
              )}
            </div>
          </section>

          {/* Municipal Reports */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-za-gold" />
                <h2 className="text-lg font-bold text-white">Municipal Reports</h2>
              </div>
              <Link href="/chat" className="text-xs text-za-gold font-bold hover:underline">New Report +</Link>
            </div>

            <div className="space-y-3">
              {reports.length > 0 ? reports.map((r, i) => (
                <motion.div 
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  key={r.id} 
                  className="card group cursor-pointer hover:border-surface-border-hover transition-all border-l-4 border-l-za-gold/30"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[10px] bg-za-gold/10 text-za-gold font-bold uppercase px-2 py-0.5 rounded-full">
                          Urgency {r.urgency_score}/5
                        </span>
                        <span className="text-[10px] bg-surface-3 text-[var(--color-muted)] font-bold uppercase px-2 py-0.5 rounded-full">
                          {r.status}
                        </span>
                        <span className="text-[10px] text-[var(--color-muted)] font-medium">
                          {format(new Date(r.created_at || Date.now()), 'MMM d, HH:mm')}
                        </span>
                      </div>
                      <p className="text-sm text-white font-medium mb-1">{r.category || 'General Issue'}</p>
                      <div className="flex items-center gap-2 text-[10px] text-[var(--color-muted)] mb-2">
                        <span className="font-bold text-za-gold">{r.municipality}</span>
                        <span>•</span>
                        <span>{r.location}</span>
                      </div>
                      <p className="text-xs text-[var(--color-muted)] line-clamp-1">{r.description}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-surface-3 group-hover:bg-za-gold group-hover:text-white transition-colors">
                      <FileCheck className="w-4 h-4" />
                    </div>
                  </div>
                </motion.div>
              )) : (
                <div className="card text-center py-12 border-dashed">
                  <AlertTriangle className="w-10 h-10 text-surface-3 mx-auto mb-4" />
                  <p className="text-[var(--color-muted)] text-sm mb-4">No municipal reports logged yet.</p>
                  <Link href="/chat" className="btn-secondary py-2 px-6 inline-flex border border-za-gold/30 text-za-gold">Report an Issue</Link>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
