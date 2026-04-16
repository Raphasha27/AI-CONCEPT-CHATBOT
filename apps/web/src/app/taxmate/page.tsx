"use client";

import React, { useState, useEffect } from "react";
import { 
  Calculator, 
  TrendingUp, 
  History, 
  Download, 
  Plus, 
  Calendar, 
  AlertCircle,
  CheckCircle2,
  BarChart3,
  ArrowUpRight,
  ShieldCheck,
  Briefcase,
  Info
} from "lucide-react";
import { taxMateAPI, spazaAPI } from "@/lib/api";
import { toast } from "react-hot-toast";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { generateTaxPDF } from "@/lib/taxReport";

// --- Types ---

interface Bracket {
  id: number;
  min_turnover: number;
  max_turnover: number;
  base_tax: number;
  rate_percentage: number;
}

interface Summary {
  total_turnover: number;
  estimated_tax: number;
  projected_turnover: number;
  progress_percentage: number;
  current_bracket: Bracket | null;
}

interface Entry {
  id: number;
  amount: number;
  category: string;
  entry_date: string;
  notes: string;
}

export default function TaxMatePage() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "income" | "brackets">("dashboard");
  const [loading, setLoading] = useState(true);
  const [shops, setShops] = useState<any[]>([]);
  const [selectedShopId, setSelectedShopId] = useState<string>("");
  const [summary, setSummary] = useState<Summary | null>(null);
  const [history, setHistory] = useState<Entry[]>([]);
  const [brackets, setBrackets] = useState<Bracket[]>([]);

  // Form State
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    loadShops();
  }, []);

  useEffect(() => {
    if (selectedShopId) {
      loadShopData();
    }
  }, [selectedShopId]);

  const loadShops = async () => {
    try {
      const res = await spazaAPI.list();
      setShops(res.data);
      if (res.data.length > 0) setSelectedShopId(res.data[0].id);
    } catch (err) {
      // For demo purposes, if no shops found, we might need to create one or mock
      setLoading(false);
    }
  };

  const loadShopData = async () => {
    setLoading(true);
    try {
      const [sumRes, histRes, brackRes] = await Promise.all([
        taxMateAPI.summary(),
        taxMateAPI.history(),
        taxMateAPI.brackets()
      ]);
      setSummary(sumRes.data);
      setHistory(histRes.data);
      setBrackets(brackRes.data);
    } catch (err) {
      toast.error("Failed to load tax data");
    } finally {
      setLoading(false);
    }
  };

  const handleAddEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount))) return;
    
    try {
      await taxMateAPI.addEntry({
        shop_id: selectedShopId,
        amount: Number(amount),
        notes
      });
      toast.success("Income recorded!");
      setAmount("");
      setNotes("");
      loadShopData();
    } catch (err) {
      toast.error("Failed to record income");
    }
  };

  if (loading && !summary) {
    return (
      <div className="min-h-screen bg-[#0A0A0E] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-za-green/20 border-t-za-green rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0E] text-white pb-20">
      {/* Header */}
      <header className="py-12 bg-gradient-to-b from-za-green/10 to-transparent border-b border-white/5 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-end gap-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-za-green/20 rounded-2xl">
                <Calculator className="w-6 h-6 text-za-green" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight">SpazaAI <span className="text-za-green">TaxMate.</span></h1>
            </div>
            <p className="text-slate-400">SARS Turnover Tax compliance engine for South African micro-businesses.</p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => {
                if (summary) generateTaxPDF(summary, history, "Spaza AI User");
              }}
              className="bg-slate-900 hover:bg-slate-800 border border-white/10 px-6 py-3 rounded-2xl flex items-center gap-2 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>SARS Export</span>
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-6xl mx-auto px-6 -mt-8">
        <div className="flex bg-slate-900/80 backdrop-blur-xl border border-white/10 p-1.5 rounded-2xl">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
            { id: 'income', label: 'Income Capture', icon: Plus },
            { id: 'brackets', label: 'Tax Brackets', icon: TrendingUp },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all ${activeTab === tab.id ? 'bg-za-green text-black font-bold' : 'text-slate-400 hover:bg-white/5'}`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && summary && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-900/50 border border-white/10 p-8 rounded-3xl relative overflow-hidden group">
                  <div className="relative z-10">
                    <p className="text-sm font-medium text-slate-400 mb-2">Total Turnover (YTD)</p>
                    <h3 className="text-4xl font-bold mb-4">R {summary.total_turnover.toLocaleString()}</h3>
                    <div className="flex items-center gap-1 text-za-green text-sm font-bold">
                      <TrendingUp className="w-4 h-4" />
                      <span>{summary.progress_percentage.toFixed(1)}% of 1M Cap</span>
                    </div>
                  </div>
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <ArrowUpRight className="w-12 h-12" />
                  </div>
                </div>

                <div className="bg-slate-900/50 border border-white/10 p-8 rounded-3xl relative overflow-hidden group">
                  <div className="relative z-10">
                    <p className="text-sm font-medium text-slate-400 mb-2">Estimated Tax Payable</p>
                    <h3 className="text-4xl font-bold text-za-gold mb-4">R {summary.estimated_tax.toLocaleString()}</h3>
                    <p className="text-xs text-slate-500">Based on {summary.current_bracket?.rate_percentage}% tax bracket</p>
                  </div>
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <ShieldCheck className="w-12 h-12" />
                  </div>
                </div>

                <div className="bg-slate-900/50 border border-white/10 p-8 rounded-3xl relative overflow-hidden group">
                  <div className="relative z-10">
                    <p className="text-sm font-medium text-slate-400 mb-2">Projected Year End</p>
                    <h3 className="text-4xl font-bold text-slate-200 mb-4">R {summary.projected_turnover.toLocaleString()}</h3>
                    <p className="text-xs text-slate-500">Forecast based on last 30 days</p>
                  </div>
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Calendar className="w-12 h-12" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Progress Card */}
                <div className="lg:col-span-2 bg-slate-900/50 border border-white/10 p-8 rounded-3xl">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-bold">Tax Year Progress (2025)</h3>
                    <div className="text-xs text-slate-500 uppercase tracking-widest font-bold">Ends Feb 28</div>
                  </div>
                  
                  <div className="space-y-12">
                    <div className="relative h-4 bg-slate-800 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${summary.progress_percentage}%` }}
                        className="absolute h-full bg-gradient-to-r from-za-green to-emerald-400"
                      />
                    </div>
                    
                    <div className="grid grid-cols-5 gap-2 relative">
                      {[0, 250000, 500000, 750000, 1000000].map((v, idx) => (
                        <div key={idx} className="flex flex-col items-center text-center">
                          <div className={`w-1 h-2 mb-2 ${summary.total_turnover >= v ? 'bg-za-green' : 'bg-slate-800'}`} />
                          <span className="text-[10px] text-slate-500 font-bold">R{v/1000}k</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-12 p-6 rounded-2xl bg-blue-500/5 border border-blue-500/10 flex gap-4">
                    <div className="p-3 bg-blue-500/10 rounded-xl self-start">
                      <Info className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <h4 className="font-bold text-blue-100 mb-1 font-sm">Tax Saving Tip</h4>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Stay below R1,000,000 turnover to remain eligible for the Micro Business Turnover Tax. If you exceed this, you may transition to Standard Income Tax.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Deadlines Card */}
                <div className="bg-slate-900/50 border border-white/10 p-8 rounded-3xl">
                  <h3 className="text-xl font-bold mb-6">Upcoming Deadlines</h3>
                  <div className="space-y-4">
                    {[
                      { title: "TT01 Interim Payment", date: "Aug 29, 2025", urgent: true },
                      { title: "Final TT02 Payment", date: "Feb 27, 2026", urgent: false },
                      { title: "Annual Tax Return", date: "Oct 20, 2025", urgent: false },
                    ].map((d, i) => (
                      <div key={i} className="flex flex-col p-4 rounded-2xl bg-slate-950 border border-white/5">
                        <span className="text-xs font-bold text-slate-500 mb-1">{d.title}</span>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">{d.date}</span>
                          {d.urgent && <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'income' && (
            <motion.div 
              key="income"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8"
            >
              <form onSubmit={handleAddEntry} className="bg-slate-900/50 border border-white/10 p-8 rounded-3xl space-y-8">
                <h3 className="text-2xl font-bold">Capture Daily Income</h3>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Amount (ZAR)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">R</span>
                      <input 
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full bg-slate-950 border border-white/10 rounded-2xl p-4 pl-10 focus:ring-2 focus:ring-za-green focus:outline-none text-xl font-bold"
                        placeholder="0.00"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Notes (Optional)</label>
                    <textarea 
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full bg-slate-950 border border-white/10 rounded-2xl p-4 focus:ring-2 focus:ring-za-green focus:outline-none min-h-[100px]"
                      placeholder="e.g. Cash sales for Monday"
                    />
                  </div>
                  <button 
                    type="submit"
                    className="w-full bg-za-green hover:bg-emerald-500 text-black font-black py-4 rounded-2xl shadow-xl shadow-za-green/10 transition-all transform hover:scale-[1.01] active:scale-[0.99]"
                  >
                    Save Entry
                  </button>
                </div>
              </form>

              <div className="bg-slate-900/50 border border-white/10 p-8 rounded-3xl flex flex-col">
                <h3 className="text-xl font-bold mb-6">Recent History</h3>
                <div className="flex-1 space-y-4 overflow-y-auto max-h-[500px] pr-2 custom-scrollbar">
                  {history.map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between p-4 bg-slate-950/50 rounded-2xl border border-white/5">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-za-green/10 rounded-lg">
                          <CheckCircle2 className="w-4 h-4 text-za-green" />
                        </div>
                        <div>
                          <p className="text-sm font-bold">R {entry.amount.toLocaleString()}</p>
                          <p className="text-[10px] text-slate-500">{format(new Date(entry.entry_date), 'PPP')}</p>
                        </div>
                      </div>
                      <span className="text-[10px] bg-slate-800 px-2 py-1 rounded text-slate-400 capitalize">{entry.category}</span>
                    </div>
                  ))}
                  {history.length === 0 && (
                    <div className="text-center py-20 opacity-30 italic">No income entries yet.</div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'brackets' && (
            <motion.div 
              key="brackets"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-8"
            >
              <div className="bg-slate-900/50 border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-800/50">
                      <th className="p-6 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-white/5">Turnover Range</th>
                      <th className="p-6 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-white/5">Base Tax</th>
                      <th className="p-6 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-white/5">Rate (%)</th>
                      <th className="p-6 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-white/5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {brackets.map((b) => {
                      const isCurrent = summary && summary.total_turnover >= b.min_turnover && summary.total_turnover <= b.max_turnover;
                      return (
                        <tr key={b.id} className={`${isCurrent ? 'bg-za-green/5' : ''}`}>
                          <td className="p-6">
                            <p className="text-sm font-bold">R {b.min_turnover.toLocaleString()} - R {b.max_turnover.toLocaleString()}</p>
                          </td>
                          <td className="p-6">
                            <p className="text-sm">R {b.base_tax.toLocaleString()}</p>
                          </td>
                          <td className="p-6">
                            <p className="text-sm font-bold text-za-green">{b.rate_percentage}%</p>
                          </td>
                          <td className="p-6">
                            {isCurrent && (
                              <div className="flex items-center gap-2 text-[10px] font-bold text-za-green uppercase tracking-widest bg-za-green/10 w-fit px-3 py-1 rounded-full border border-za-green/20">
                                <div className="w-1.5 h-1.5 rounded-full bg-za-green animate-pulse" />
                                Current
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              
              <div className="bg-slate-900 border border-white/10 p-8 rounded-3xl">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-za-green" />
                  How is this calculated?
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed mb-4">
                  SARS Turnover Tax is a simplified tax system for small businesses with an annual turnover of R1 million or less. It replaces income tax, VAT, and capital gains tax.
                </p>
                <div className="p-4 bg-slate-950 border border-white/5 rounded-2xl font-mono text-xs text-za-green flex items-center gap-3">
                  <span className="text-slate-600">FORMULA:</span>
                  <span>Tax = Base Tax + (Current Turnover - Min Bracket Turnover) × Rate %</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

}
