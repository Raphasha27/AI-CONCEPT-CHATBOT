"use client";

import React, { useState } from "react";
import Header from "@/components/Header";
import { reportsAPI } from "@/lib/api";
import { 
  FileText, 
  MapPin, 
  Building, 
  AlertCircle, 
  Download, 
  Plus,
  Send,
  Loader2,
  CheckCircle2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

export default function ReportPage() {
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [municipality, setMunicipality] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      toast.error("Please describe the issue");
      return;
    }

    setLoading(true);
    try {
      const res = await reportsAPI.generate({
        description,
        location,
        municipality
      });
      setGeneratedReport(res.data);
      toast.success("Report generated successfully!");
    } catch (err) {
      toast.error("Failed to generate report");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setGeneratedReport(null);
    setDescription("");
    setLocation("");
    setMunicipality("");
  };

  return (
    <div className="min-h-screen bg-[#0A0A0E]">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <header className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 bg-za-gold/10 text-za-gold text-xs font-bold px-3 py-1 rounded-full mb-3">
            <AlertCircle className="w-3 h-3" /> MuniFix AI
          </div>
          <h1 className="text-3xl font-extrabold text-white mb-2">Municipal Report Generator</h1>
          <p className="text-[var(--color-muted)] max-w-xl mx-auto">
            Generate official, legally-formatted service delivery complaint reports for any municipality in South Africa.
          </p>
        </header>

        <AnimatePresence mode="wait">
          {!generatedReport ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <form onSubmit={handleSubmit} className="card space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[var(--color-muted)] uppercase tracking-wider mb-2">
                      Describe the Issue
                    </label>
                    <textarea
                      required
                      rows={5}
                      className="w-full bg-surface-3 border border-surface-border rounded-xl px-4 py-3 text-sm text-white placeholder-surface-border focus:border-za-gold transition-all outline-none"
                      placeholder="e.g. There is a major water leak at the corner of..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[var(--color-muted)] uppercase tracking-wider mb-2">
                        Location / Address
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-border" />
                        <input
                          type="text"
                          className="w-full bg-surface-3 border border-surface-border rounded-xl px-10 py-3 text-sm text-white focus:border-za-gold outline-none"
                          placeholder="Street address or suburb"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[var(--color-muted)] uppercase tracking-wider mb-2">
                        Municipality
                      </label>
                      <div className="relative">
                        <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-border" />
                        <input
                          type="text"
                          className="w-full bg-surface-3 border border-surface-border rounded-xl px-10 py-3 text-sm text-white focus:border-za-gold outline-none"
                          placeholder="e.g. City of Joburg"
                          value={municipality}
                          onChange={(e) => setMunicipality(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    disabled={loading}
                    className="w-full btn-primary bg-za-gold hover:bg-za-gold/90 text-surface font-bold py-4 text-base glow-za"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        Generate Official Report <Send className="w-4 h-4" />
                      </span>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              <div className="card !p-0 overflow-hidden border-t-4 border-t-za-gold">
                <div className="bg-surface-2 p-6 border-b border-surface-border flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-za-gold/10 text-za-gold">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white uppercase tracking-tight">Generated Municipal Report</h2>
                      <p className="text-xs text-[var(--color-muted)]">Reference: AUTO-GEN-{generatedReport.report_id}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="badge-uncertain bg-za-gold/10 text-za-gold border-za-gold/20">
                      Urgency {generatedReport.urgency_score}/5
                    </span>
                  </div>
                </div>
                
                <div className="p-8 bg-white text-zinc-900 font-mono text-sm whitespace-pre-wrap leading-relaxed min-h-[400px]">
                  {generatedReport.generated_report}
                </div>

                <div className="p-6 bg-surface-2 border-t border-surface-border flex flex-wrap gap-4">
                  <button 
                    onClick={() => window.print()}
                    className="btn-primary bg-za-gold text-surface gap-2"
                  >
                    <Download className="w-4 h-4" /> Save as PDF / Print
                  </button>
                  <button 
                    onClick={handleReset}
                    className="btn-secondary gap-2"
                  >
                    <Plus className="w-4 h-4" /> Create Another
                  </button>
                </div>
              </div>

              <div className="card bg-za-green/10 border-za-green/20">
                <div className="flex gap-4">
                  <div className="shrink-0">
                    <CheckCircle2 className="w-6 h-6 text-za-green" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white mb-1">What to do next?</h3>
                    <p className="text-xs text-[var(--color-muted)] leading-relaxed">
                      This report has been saved to your dashboard. You can now download it and:
                      <br/>1. Email it to your ward councillor.
                      <br/>2. Attach it to a formal ticket on your municipality's app/website.
                      <br/>3. Keep it as evidence for potential escalation to the Public Protector.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
