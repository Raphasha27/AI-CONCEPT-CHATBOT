"use client";

import React, { useEffect, useState } from "react";
import Header from "@/components/Header";
import { adminAPI, datasetsAPI } from "@/lib/api";
import { 
  Users, 
  Database, 
  Activity, 
  Upload, 
  Trash2, 
  UserX, 
  CheckCircle,
  AlertCircle,
  ShieldAlert,
  Search
} from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { redirect } from "next/navigation";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

export default function AdminPage() {
  const { isAdmin, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<"stats" | "datasets" | "users" | "logs">("stats");
  const [stats, setStats] = useState<any>(null);
  const [datasets, setDatasets] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      redirect("/dashboard");
    }
  }, [isAdmin, authLoading]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sRes, dRes, uRes, lRes] = await Promise.all([
        adminAPI.stats(),
        datasetsAPI.list(),
        adminAPI.users(),
        adminAPI.auditLogs()
      ]);
      setStats(sRes.data);
      setDatasets(dRes.data);
      setUsers(uRes.data);
      setLogs(lRes.data);
    } catch (err) {
      toast.error("Failed to fetch admin data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) fetchData();
  }, [isAdmin]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    try {
      await datasetsAPI.upload(formData);
      toast.success("Dataset uploaded successfully");
      fetchData();
    } catch (err) {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDataset = async (id: number) => {
    if (!confirm("Are you sure? This will remove all vectors associated with this dataset.")) return;
    try {
      await datasetsAPI.delete(id);
      toast.success("Dataset deleted");
      fetchData();
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 rounded-full border-2 border-surface-border border-t-za-green animate-spin" />
        <span className="text-[var(--color-muted)] text-sm animate-pulse">Entering Restricted Admin Zone...</span>
      </div>
    );
  }

  const tabs = [
    { id: "stats", label: "Overview", icon: Activity },
    { id: "datasets", label: "Datasets", icon: Database },
    { id: "users", label: "Users", icon: Users },
    { id: "logs", label: "Audit Logs", icon: ShieldAlert },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0E]">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ShieldAlert className="w-5 h-5 text-red-500" />
              <h1 className="text-2xl font-bold text-white">System Administration</h1>
            </div>
            <p className="text-[var(--color-muted)] text-sm">Monitor system health, manage datasets, and oversee users.</p>
          </div>
          
          <div className="flex bg-surface-2 p-1 rounded-xl border border-surface-border">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id 
                    ? "bg-surface-3 text-white shadow-lg" 
                    : "text-[var(--color-muted)] hover:text-white"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </header>

        {activeTab === "stats" && stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Total Users", val: stats.total_users, color: "text-blue-400" },
              { label: "Total Queries", val: stats.total_queries, color: "text-za-green" },
              { label: "Datasets", val: stats.total_datasets, color: "text-za-gold" },
              { label: "System Uptime", val: "99.9%", color: "text-purple-400" },
            ].map((s, i) => (
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: i * 0.1 }}
                key={s.label} 
                className="card text-center"
              >
                <p className="text-[10px] text-[var(--color-muted)] uppercase tracking-widest font-bold mb-1">{s.label}</p>
                <p className={`text-3xl font-black ${s.color}`}>{s.val}</p>
              </motion.div>
            ))}
          </div>
        )}

        {activeTab === "datasets" && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Knowledge Datasets</h2>
              <label className={`btn-primary px-4 py-2 cursor-pointer transition-all ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                <Upload className="w-4 h-4 mr-2" />
                {uploading ? 'Processing...' : 'Upload New CSV'}
                <input type="file" className="hidden" accept=".csv" onChange={handleFileUpload} disabled={uploading} />
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {datasets.map((ds) => (
                <div key={ds.id} className="card flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-surface-3 flex items-center justify-center">
                      <Database className="w-5 h-5 text-za-gold" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white line-clamp-1">{ds.filename}</p>
                      <p className="text-xs text-[var(--color-muted)]">{ds.row_count} records • {format(new Date(ds.created_at), 'MMM d, yyyy')}</p>
                    </div>
                  </div>
                  <button onClick={() => handleDeleteDataset(ds.id)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === "users" && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card overflow-hidden !p-0">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-2">
                  <th className="px-6 py-4 text-xs font-bold text-[var(--color-muted)] uppercase">User</th>
                  <th className="px-6 py-4 text-xs font-bold text-[var(--color-muted)] uppercase">Role</th>
                  <th className="px-6 py-4 text-xs font-bold text-[var(--color-muted)] uppercase">Joined</th>
                  <th className="px-6 py-4 text-xs font-bold text-[var(--color-muted)] uppercase">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-[var(--color-muted)] uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-surface-2/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-white">{user.full_name}</span>
                        <span className="text-xs text-[var(--color-muted)]">{user.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        user.role === 'admin' ? 'bg-purple-500/10 text-purple-500' : 'bg-blue-500/10 text-blue-500'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-[var(--color-muted)]">
                      {format(new Date(user.created_at), 'MMM d, yyyy')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-1.5 h-1.5 rounded-full ${user.is_active ? 'bg-za-green' : 'bg-red-500'}`} />
                        <span className="text-xs text-white">{user.is_active ? 'Active' : 'Suspended'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button className="p-2 text-[var(--color-muted)] hover:text-white rounded-lg">
                        <UserX className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}

        {activeTab === "logs" && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            {logs.map((log) => (
              <div key={log.id} className="card !py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg bg-surface-3 ${
                    log.action.includes('UPLOAD') ? 'text-za-gold' : 
                    log.action.includes('DELETE') ? 'text-red-400' : 'text-blue-400'
                  }`}>
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-bold text-white uppercase">{log.action.replace(/_/g, ' ')}</span>
                      <span className="text-[10px] text-[var(--color-muted)]">• {format(new Date(log.created_at), 'HH:mm:ss')}</span>
                    </div>
                    <p className="text-[10px] text-[var(--color-muted)]">User ID: {log.user_id} • IP: {log.ip_address || 'Internal'}</p>
                  </div>
                </div>
                <div className="hidden sm:block">
                  <pre className="text-[10px] text-[var(--color-muted)] bg-surface-3 px-2 py-1 rounded max-w-xs overflow-hidden text-ellipsis">
                    {JSON.stringify(log.metadata)}
                  </pre>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </main>
    </div>
  );
}
