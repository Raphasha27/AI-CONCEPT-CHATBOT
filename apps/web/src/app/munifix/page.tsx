"use client";

import React, { useState, useEffect } from "react";
import { 
  AlertTriangle, 
  MapPin, 
  Camera, 
  Plus, 
  FileText, 
  MessageSquare, 
  Send, 
  ChevronRight, 
  CheckCircle,
  Clock,
  ExternalLink,
  Users,
  Search,
  ChevronDown,
  Info,
  BarChart3
} from "lucide-react";
import { reportsAPI } from "@/lib/api";
import { toast } from "react-hot-toast";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import MuniFixAnalytics from "@/components/MuniFixAnalytics";

// --- Types ---

interface Complaint {
  id: number;
  tracking_id: string;
  category: string;
  urgency_score: number;
  location: string;
  description: string;
  municipality: string;
  suggested_department: string;
  generated_report: string;
  status: string;
  created_at: string;
  upvotes: number;
  is_anonymous: boolean;
}

// --- Components ---

const IssueTypes = [
  { id: "water_leak", label: "Water Leak / Outage", icon: "💧" },
  { id: "electricity_fault", label: "Electricity Issue", icon: "⚡" },
  { id: "pothole", label: "Pothole / Road", icon: "🛣️" },
  { id: "sewage", label: "Sewage / Drainage", icon: "🤢" },
  { id: "illegal_dumping", label: "Illegal Dumping", icon: "🗑️" },
  { id: "streetlight", label: "Streetlight Out", icon: "💡" },
  { id: "infrastructure", label: "Other Infrastructure", icon: "🏗️" },
];

export default function MuniFixPage() {
  const [activeTab, setActiveTab] = useState<"report" | "feed" | "track" | "analytics">("report");
  const [loading, setLoading] = useState(false);
  const [feed, setFeed] = useState<Complaint[]>([]);
  const [trackingId, setTrackingId] = useState("");
  const [trackedComplaint, setTrackedComplaint] = useState<Complaint | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    description: "",
    location: "",
    municipality: "City of Johannesburg",
    category: "pothole",
    households: 1,
    is_anonymous: false,
    severity: 2,
  });

  const [generatedResult, setGeneratedResult] = useState<{
    id: number;
    tracking_id: string;
    report: string;
  } | null>(null);

  useEffect(() => {
    if (activeTab === "feed") {
      loadFeed();
    }
  }, [activeTab]);

  const loadFeed = async () => {
    setLoading(true);
    try {
      const res = await reportsAPI.feed();
      setFeed(res.data);
    } catch (err) {
      toast.error("Failed to load community feed");
    } finally {
      setLoading(false);
    }
  };

  const handleTrack = async () => {
    if (!trackingId) return;
    setLoading(true);
    try {
      const res = await reportsAPI.track(trackingId);
      setTrackedComplaint(res.data);
    } catch (err) {
      toast.error("Complaint not found. Check your tracking ID.");
      setTrackedComplaint(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.description.length < 10) {
      toast.error("Please provide a more detailed description (min 10 chars)");
      return;
    }

    setLoading(true);
    try {
      const res = await reportsAPI.generate({
        description: formData.description,
        location: formData.location || "Current GPS Location",
        municipality: formData.municipality,
        households_affected: formData.households,
        is_anonymous: formData.is_anonymous,
      });

      setGeneratedResult({
        id: res.data.report_id,
        tracking_id: res.data.tracking_id,
        report: res.data.generated_report,
      });
      toast.success("Complaint generated successfully!");
      setActiveTab("report"); // Keep on report but show result
    } catch (err) {
      toast.error("Failed to generate report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpvote = async (id: number) => {
    try {
      await reportsAPI.upvote(id);
      setFeed(prev => prev.map(c => c.id === id ? { ...c, upvotes: c.upvotes + 1 } : c));
      toast.success("Upvoted! Community power +1");
    } catch (err) {
      toast.error("Failed to upvote");
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 pb-20">
      {/* Header Section */}
      <header className="py-12 bg-gradient-to-b from-blue-900/40 to-transparent border-b border-white/5 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-6"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Official South African Civic Reporting</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-200 to-blue-400"
          >
            MuniFix Complaint Engine
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto"
          >
            Connect directly with municipalities. Turn service failures into trackable legal cases.
          </motion.p>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-6xl mx-auto px-6 -mt-8">
        <div className="flex bg-slate-900/80 backdrop-blur-xl border border-white/10 p-1 rounded-2xl shadow-2xl">
          <button 
            onClick={() => setActiveTab("report")}
            className={`flex-1 flex items-center justify-center space-x-2 py-4 px-2 rounded-xl transition-all duration-300 ${activeTab === "report" ? "bg-blue-600 text-white shadow-lg" : "hover:bg-white/5 text-slate-400"}`}
          >
            <Plus className="w-5 h-5" />
            <span className="font-semibold">New Complaint</span>
          </button>
          <button 
            onClick={() => setActiveTab("feed")}
            className={`flex-1 flex items-center justify-center space-x-2 py-4 px-2 rounded-xl transition-all duration-300 ${activeTab === "feed" ? "bg-blue-600 text-white shadow-lg" : "hover:bg-white/5 text-slate-400"}`}
          >
            <Users className="w-5 h-5" />
            <span className="font-semibold">Community Feed</span>
          </button>
          <button 
            onClick={() => setActiveTab("track")}
            className={`flex-1 flex items-center justify-center space-x-2 py-4 px-2 rounded-xl transition-all duration-300 ${activeTab === "track" ? "bg-blue-600 text-white shadow-lg" : "hover:bg-white/5 text-slate-400"}`}
          >
            <Clock className="w-5 h-5" />
            <span className="font-semibold">Tracking</span>
          </button>
          <button 
            onClick={() => setActiveTab("analytics")}
            className={`flex-1 flex items-center justify-center space-x-2 py-4 px-2 rounded-xl transition-all duration-300 ${activeTab === "analytics" ? "bg-blue-600 text-white shadow-lg" : "hover:bg-white/5 text-slate-400"}`}
          >
            <BarChart3 className="w-5 h-5" />
            <span className="font-semibold">Analytics</span>
          </button>
</div>
      </div>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <AnimatePresence mode="wait">
          {/* TAB: REPORT */}
          {activeTab === "report" && !generatedResult && (
            <motion.div 
              key="report-form"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              <div className="lg:col-span-2 space-y-8">
                <form onSubmit={handleSubmit} className="bg-slate-900/50 border border-white/10 p-8 rounded-3xl space-y-8">
                  <div className="space-y-4">
                    <label className="text-sm font-semibold text-slate-400 uppercase tracking-wider block">1. What is the issue?</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {IssueTypes.map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, category: t.id })}
                          className={`p-4 rounded-2xl border flex flex-col items-center justify-center space-y-2 transition-all duration-200 ${formData.category === t.id ? "bg-blue-600 border-blue-400 shadow-[0_0_20px_rgba(37,99,235,0.4)]" : "bg-slate-800/50 border-white/10 hover:border-white/30"}`}
                        >
                          <span className="text-2xl">{t.icon}</span>
                          <span className="text-xs text-center font-medium">{t.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-sm font-semibold text-slate-400 uppercase tracking-wider block">2. Describe the problem</label>
                    <textarea 
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="e.g. Major water leak on the corner of Main and 3rd St. Water is gushing into the road since 6am."
                      className="w-full h-40 bg-slate-950/50 border border-white/10 rounded-2xl p-4 focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder:text-slate-600 transition-all"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <label className="text-sm font-semibold text-slate-400 uppercase tracking-wider block">3. Location</label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                        <input 
                          type="text"
                          value={formData.location}
                          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                          placeholder="Address or Landmark"
                          className="w-full bg-slate-950/50 border border-white/10 rounded-2xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <label className="text-sm font-semibold text-slate-400 uppercase tracking-wider block">4. Municipality</label>
                      <select 
                        value={formData.municipality}
                        onChange={(e) => setFormData({ ...formData, municipality: e.target.value })}
                        className="w-full bg-slate-950/50 border border-white/10 rounded-2xl p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none appearance-none"
                      >
                        <option>City of Johannesburg</option>
                        <option>City of Tshwane</option>
                        <option>City of Cape Town</option>
                        <option>eThekwini Municipality</option>
                        <option>Nelson Mandela Bay</option>
                        <option>Mangaung Municipality</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <input 
                        type="checkbox" 
                        id="anon" 
                        checked={formData.is_anonymous}
                        onChange={(e) => setFormData({ ...formData, is_anonymous: e.target.checked })}
                        className="w-5 h-5 rounded border-white/10 bg-slate-950/50 text-blue-600"
                      />
                      <label htmlFor="anon" className="text-sm text-slate-400">Report Anonymously</label>
                    </div>
                    <button 
                      disabled={loading}
                      type="submit" 
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-4 px-10 rounded-2xl shadow-xl shadow-blue-900/20 flex items-center space-x-2 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                    >
                      {loading ? (
                        <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <span>Generate Official Report</span>
                          <ChevronRight className="w-5 h-5" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* Sidebar Info */}
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
                  <div className="relative z-10">
                    <h3 className="text-xl font-bold mb-4">Why use MuniFix?</h3>
                    <ul className="space-y-4">
                      <li className="flex items-start space-x-3 text-sm text-indigo-100">
                        <CheckCircle className="w-5 h-5 shrink-0" />
                        <span>Formatted for constitutional legal requirements.</span>
                      </li>
                      <li className="flex items-start space-x-3 text-sm text-indigo-100">
                        <CheckCircle className="w-5 h-5 shrink-0" />
                        <span>Auto-detects the correct municipal department.</span>
                      </li>
                      <li className="flex items-start space-x-3 text-sm text-indigo-100">
                        <CheckCircle className="w-5 h-5 shrink-0" />
                        <span>Public tracking link for community pressure.</span>
                      </li>
                    </ul>
                  </div>
                  <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
                </div>

                <div className="bg-slate-900/50 border border-white/10 p-6 rounded-3xl">
                  <h4 className="font-bold mb-4 flex items-center space-x-2">
                    <Info className="w-4 h-4 text-blue-400" />
                    <span>Recent Activity</span>
                  </h4>
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="flex items-center space-x-3 p-3 rounded-xl bg-slate-950/40 border border-white/5">
                        <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 text-xs">
                          {i*10}m
                        </div>
                        <div>
                          <p className="text-xs font-medium text-white">Water leak reported</p>
                          <p className="text-[10px] text-slate-500">Braamfontein, JHB</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB: RESULT (Post-generation) */}
          {activeTab === "report" && generatedResult && (
            <motion.div 
              key="result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-4xl mx-auto"
            >
              <div className="bg-slate-900/50 border border-blue-500/20 rounded-3xl overflow-hidden shadow-2xl">
                <div className="bg-blue-600/20 p-8 border-b border-blue-500/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-2">Report Successfully Generated</h2>
                      <p className="text-blue-300">Your complaint has been formatted and logged.</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs uppercase text-blue-400 font-bold tracking-widest mb-1">Tracking ID</p>
                      <code className="bg-blue-900/40 px-3 py-1 rounded-lg text-blue-200 border border-blue-500/20">{generatedResult.tracking_id.slice(0, 8)}</code>
                    </div>
                  </div>
                </div>
                
                <div className="p-8">
                  <div className="bg-slate-950 p-6 rounded-2xl border border-white/5 font-mono text-sm leading-relaxed text-slate-300 max-h-96 overflow-y-auto whitespace-pre-wrap">
                    {generatedResult.report}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                    <button 
                      onClick={() => window.print()}
                      className="flex items-center justify-center space-x-2 bg-slate-800 hover:bg-slate-700 py-3 rounded-xl border border-white/10 transition-colors"
                    >
                      <FileText className="w-4 h-4" />
                      <span>Download PDF</span>
                    </button>
                    <button className="flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-500 py-3 rounded-xl text-white transition-colors">
                      <MessageSquare className="w-4 h-4" />
                      <span>WhatsApp Feed</span>
                    </button>
                    <button className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-500 py-3 rounded-xl text-white transition-colors">
                      <Send className="w-4 h-4" />
                      <span>Email Dept.</span>
                    </button>
                  </div>
                  
                  <div className="mt-8 pt-8 border-t border-white/5 flex justify-between items-center">
                    <button 
                      onClick={() => setGeneratedResult(null)}
                      className="text-slate-400 hover:text-white flex items-center space-x-2 text-sm"
                    >
                      <span>Create Another Report</span>
                    </button>
                    <button 
                      onClick={() => {
                        setGeneratedResult(null);
                        setActiveTab("feed");
                      }}
                      className="text-blue-400 hover:text-blue-300 flex items-center space-x-2 text-sm"
                    >
                      <span>View Community Feed</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB: FEED */}
          {activeTab === "feed" && (
            <motion.div 
              key="feed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                  <h2 className="text-2xl font-bold">Community Visibility Feed</h2>
                  <p className="text-slate-400">Public issues in your municipality. Join forces to demand action.</p>
                </div>
                <div className="flex bg-slate-900 border border-white/10 rounded-xl px-4 py-2">
                  <Search className="w-5 h-5 text-slate-500 mr-2 self-center" />
                  <input 
                    placeholder="Search area or issue..." 
                    className="bg-transparent border-none focus:outline-none text-sm placeholder:text-slate-600"
                  />
                </div>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1,2,3,4,5,6].map(i => (
                    <div key={i} className="bg-slate-900/50 border border-white/5 h-64 rounded-3xl animate-pulse" />
                  ))}
                </div>
              ) : feed.length === 0 ? (
                <div className="text-center py-20 bg-slate-900/30 rounded-3xl border border-dashed border-white/10">
                  <Users className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-slate-500">No public complaints yet in this area</h3>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {feed.map((complaint) => (
                    <motion.div 
                      key={complaint.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-slate-900/50 border border-white/10 rounded-3xl overflow-hidden group hover:border-blue-500/30 transition-all shadow-xl hover:shadow-blue-900/10"
                    >
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                            complaint.status === 'resolved' ? 'bg-green-500/10 text-green-400' :
                            complaint.status === 'in_progress' ? 'bg-yellow-500/10 text-yellow-400' :
                            'bg-blue-500/10 text-blue-400'
                          }`}>
                            {complaint.status}
                          </div>
                          <div className="text-xs text-slate-500">{format(new Date(complaint.created_at), 'MMM d, h:mm a')}</div>
                        </div>
                        
                        <h3 className="text-lg font-bold mb-2 group-hover:text-blue-400 transition-colors capitalize">
                          {complaint.category.replace('_', ' ')}
                        </h3>
                        <p className="text-sm text-slate-400 line-clamp-3 mb-6">
                          {complaint.description}
                        </p>
                        
                        <div className="flex items-center text-xs text-slate-500 mb-6">
                          <MapPin className="w-3 h-3 mr-1" />
                          <span>{complaint.location}</span>
                        </div>
                        
                        <div className="flex items-center justify-between pt-4 border-t border-white/5">
                          <button 
                            onClick={() => handleUpvote(complaint.id)}
                            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 transition-colors"
                          >
                            <span className="text-sm font-bold">{complaint.upvotes}</span>
                            <span className="text-xs font-medium uppercase tracking-tighter">Affected Too</span>
                          </button>
                          
                          <button 
                            onClick={() => {
                              setTrackingId(complaint.tracking_id);
                              setActiveTab("track");
                              handleTrack();
                            }}
                            className="text-slate-500 hover:text-white"
                          >
                            <ExternalLink className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* TAB: TRACK */}
          {activeTab === "track" && (
            <motion.div 
              key="track"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="max-w-2xl mx-auto"
            >
              <div className="bg-slate-900/50 border border-white/10 p-8 rounded-3xl shadow-2xl">
                <h2 className="text-2xl font-bold mb-6">Track Complaint Status</h2>
                
                <div className="flex space-x-3 mb-10">
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                    <input 
                      type="text"
                      value={trackingId}
                      onChange={(e) => setTrackingId(e.target.value)}
                      placeholder="Enter Tracking ID (e.g. 8 characters)"
                      className="w-full bg-slate-950/50 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <button 
                    onClick={handleTrack}
                    disabled={loading || !trackingId}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 rounded-2xl disabled:opacity-50 transition-all"
                  >
                    Track
                  </button>
                </div>

                {loading ? (
                  <div className="flex justify-center py-10">
                    <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                  </div>
                ) : trackedComplaint ? (
                  <div className="space-y-8">
                    <div className="flex items-center justify-between p-6 rounded-2xl bg-blue-600/10 border border-blue-500/20">
                      <div>
                        <p className="text-xs uppercase text-blue-400 font-bold mb-1">Current Status</p>
                        <p className="text-xl font-bold text-white capitalize">{trackedComplaint.status}</p>
                      </div>
                      <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white">
                        {trackedComplaint.status === 'resolved' ? <CheckCircle /> : <Clock />}
                      </div>
                    </div>

                    <div className="relative pl-8 space-y-8 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                      {[
                        { s: 'submitted', l: 'Complaint Logged & Formatted', d: trackedComplaint.created_at, active: true },
                        { s: 'routed', l: 'Sent to Municipal Dept.', d: null, active: ['acknowledged', 'in_progress', 'resolved'].includes(trackedComplaint.status) },
                        { s: 'acknowledged', l: 'Acknowledged by Official', d: null, active: ['acknowledged', 'in_progress', 'resolved'].includes(trackedComplaint.status) },
                        { s: 'in_progress', l: 'Technician Assigned', d: null, active: ['in_progress', 'resolved'].includes(trackedComplaint.status) },
                        { s: 'resolved', l: 'Issue Marked as Resolved', d: null, active: trackedComplaint.status === 'resolved' },
                      ].map((step, idx) => (
                        <div key={idx} className="relative">
                          <div className={`absolute -left-[26px] top-1 w-4 h-4 rounded-full border-4 border-[#0f172a] ${step.active ? 'bg-blue-500' : 'bg-slate-800'}`} />
                          <div>
                            <p className={`font-bold ${step.active ? 'text-white' : 'text-slate-600'}`}>{step.l}</p>
                            {step.d && <p className="text-xs text-slate-500">{format(new Date(step.d), 'PPP')}</p>}
                            {!step.active && idx === 1 && trackedComplaint.status === 'submitted' && (
                              <p className="text-xs text-blue-400 mt-1">Expected within 24-48 hours</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="pt-6 border-t border-white/5">
                      <h4 className="font-bold mb-3 text-sm">Complaint Details</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-slate-950/50 border border-white/5">
                          <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Category</p>
                          <p className="text-sm font-medium capitalize">{trackedComplaint.category.replace('_', ' ')}</p>
                        </div>
                        <div className="p-4 rounded-xl bg-slate-950/50 border border-white/5">
                          <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Ward</p>
                          <p className="text-sm font-medium">Pending Assignment</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : trackingId ? (
                  <div className="text-center py-10 opacity-50">
                    <p>Enter a valid tracking ID to see progress</p>
                  </div>
                ) : null}
              </div>
            </motion.div>
          )}

          {/* TAB: ANALYTICS */}
          {activeTab === "analytics" && (
            <motion.div 
              key="analytics"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              <div className="mb-8">
                <h2 className="text-2xl font-bold">Service Delivery Analytics</h2>
                <p className="text-slate-400">Deep insights into municipal performance based on community reports.</p>
              </div>
              <MuniFixAnalytics />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
