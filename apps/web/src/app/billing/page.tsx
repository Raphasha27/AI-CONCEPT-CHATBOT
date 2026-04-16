"use client";

import React, { useState, useEffect } from "react";
import { 
  CreditCard, 
  Check, 
  Zap, 
  ShieldCheck, 
  Activity, 
  BarChart3, 
  ArrowRight,
  ShieldAlert,
  Download,
  Clock,
  Sparkles,
  Crown
} from "lucide-react";
import { motion } from "framer-motion";
import { billingAPI } from "@/lib/api";

const PLANS = [
  {
    name: "Citizen Basic",
    price: "R0",
    desc: "Essential civic tools for every South African",
    features: ["Standard Office Booking", "1 AI Document / Day", "MuniFix Incident Reporting", "Civic Dashboard"],
    button: "Current Plan",
    current: true,
    color: "bg-slate-800"
  },
  {
    name: "Citizen Elite",
    price: "R149",
    period: "/mo",
    desc: "Premium concierge services for a faster life",
    features: [
      "AI-Optimized Priority Booking", 
      "Unlimited Document Concierge", 
      "SMS & WhatsApp Queue Alerts", 
      "Advanced Legal Advocacy Reports", 
      "Premium 24/7 AI Concierge"
    ],
    button: "Upgrade to Elite",
    current: false,
    color: "bg-indigo-600",
    popular: true
  },
  {
    name: "Institutional Command",
    price: "R4,999",
    period: "/mo",
    desc: "National intelligence for ward offices & entities",
    features: [
      "Ward-Level Command Center", 
      "National Control Tower Access", 
      "Regional Crisis Prediction", 
      "Citizen Density Analysis", 
      "Dedicated Advocacy Manager"
    ],
    button: "Request Onboarding",
    current: false,
    color: "bg-purple-600"
  }
];

export default function BillingPage() {
  const [subscription, setSubscription] = useState<any>(null);
  const [usage, setUsage] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBillingData();
  }, []);

  const fetchBillingData = async () => {
    try {
      const [sRes, uRes] = await Promise.all([
        billingAPI.mySubscription(),
        billingAPI.usage()
      ]);
      setSubscription(sRes.data);
      setUsage(uRes.data);
    } catch (error) {
      console.error("Billing data load failed", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050507] text-white selection:bg-indigo-500/30 overflow-x-hidden">
      {/* Background Glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/5 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/5 blur-[150px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12 md:py-24">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-end justify-between gap-8 mb-20">
          <div className="space-y-4">
            <motion.div 
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-[0.2em]"
            >
              <Sparkles className="w-3 h-3" /> Monetization & Growth
            </motion.div>
            <h1 className="text-5xl md:text-6xl font-black tracking-tight leading-none">Choose Your <span className="italic font-serif text-indigo-400">Pace.</span></h1>
            <p className="text-slate-400 text-lg max-w-xl">
              From individual civic freedom to national enterprise intelligence. Select the QueueLess plan that fits your ambition.
            </p>
          </div>
          <div className="flex items-center gap-6 p-6 bg-slate-900/40 border border-white/5 rounded-3xl backdrop-blur-xl shadow-2xl">
            <div className="h-14 w-14 rounded-[1.25rem] bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-xl shadow-indigo-500/20">
              <Crown className="text-white w-8 h-8" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] leading-none mb-2">Current Tier</p>
              <h3 className="text-2xl font-black uppercase text-white tracking-tight">{subscription?.plan || "Basic"} Tier</h3>
            </div>
          </div>
        </div>

        {/* Pricing Table */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32">
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`relative p-10 rounded-[2.5rem] border ${plan.popular ? "border-indigo-500/30 bg-indigo-500/5 shadow-3xl shadow-indigo-500/20" : "border-white/5 bg-slate-900/40"} overflow-hidden group hover:scale-[1.02] transition-transform duration-500`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 px-6 py-2 bg-indigo-600 text-[10px] font-black uppercase tracking-[0.2em] rounded-bl-3xl">
                  Popular Choice
                </div>
              )}
              
              <h2 className="text-2xl font-black mb-1">{plan.name}</h2>
              <div className="mt-6 flex items-baseline gap-2">
                <span className="text-6xl font-black tracking-tighter">{plan.price}</span>
                {plan.period && <span className="text-slate-500 font-bold text-lg">{plan.period}</span>}
              </div>
              <p className="mt-6 text-slate-400 font-medium text-base leading-relaxed h-12">{plan.desc}</p>

              <button className={`w-full mt-10 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] transition-all shadow-xl ${
                plan.current ? "bg-white/5 text-slate-500 cursor-default border border-white/5" : "bg-white text-black hover:bg-indigo-100 hover:shadow-indigo-500/20 active:scale-95"
              }`}>
                {plan.button}
              </button>

              <div className="mt-12 space-y-5">
                {plan.features.map(feat => (
                  <div key={feat} className="flex items-start gap-4">
                    <div className="mt-1.5 h-5 w-5 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                      <Check className="text-indigo-400" size={12} strokeWidth={4} />
                    </div>
                    <span className="text-sm font-bold text-slate-300">{feat}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </section>

        {/* Usage & Stats */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className="lg:col-span-2 bg-slate-900/40 border border-white/5 rounded-[3rem] p-10 lg:p-16 overflow-hidden relative shadow-2xl backdrop-blur-sm">
              <div className="absolute bottom-[-10%] right-[-10%] p-12 opacity-[0.02] pointer-events-none rotate-[-12deg]">
                 <Activity size={400} />
              </div>
              <h3 className="text-3xl font-black flex items-center gap-4 mb-12">
                 <Activity className="text-indigo-500" size={32} />
                 Resource Consumption
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                 <div className="space-y-8">
                    <div>
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-3">
                           <span>Document Intelligence</span>
                           <span className="text-indigo-400">{usage.filter(u => u.event_type === "ai_call").length} / UNLIMITED</span>
                        </div>
                        <div className="h-3 w-full bg-slate-950 rounded-full overflow-hidden border border-white/5">
                           <motion.div initial={{ width: 0 }} animate={{ width: "15%" }} className="h-full bg-gradient-to-r from-indigo-600 to-purple-500" />
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-3">
                           <span>Verified Bookings</span>
                           <span className="text-emerald-400">{usage.filter(u => u.event_type === "booking").length} / 5</span>
                        </div>
                        <div className="h-3 w-full bg-slate-950 rounded-full overflow-hidden border border-white/5">
                           <motion.div initial={{ width: 0 }} animate={{ width: "40%" }} className="h-full bg-emerald-500" />
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-3">
                           <span>Priority Queue Signal</span>
                           <span className="text-amber-400">INACTIVE</span>
                        </div>
                        <div className="h-3 w-full bg-slate-950 rounded-full overflow-hidden border border-white/5">
                           <div className="h-full bg-slate-800 w-[5%]" />
                        </div>
                    </div>
                 </div>

                 <div className="p-10 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[2rem] shadow-3xl shadow-indigo-600/20 flex flex-col justify-between relative overflow-hidden group">
                    <div className="absolute top-[-20%] right-[-20%] w-[150px] h-[150px] bg-white/10 blur-3xl rounded-full" />
                    <div>
                       <div className="h-14 w-14 bg-white/20 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md">
                          <BarChart3 className="text-white" size={28} />
                       </div>
                       <h4 className="text-2xl font-black text-white mb-2">Billing Estimate</h4>
                       <p className="text-indigo-100/60 text-sm font-bold uppercase tracking-widest">Current Period</p>
                    </div>
                    <div className="mt-12">
                       <span className="text-6xl font-black text-white tracking-tighter">R149</span>
                       <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest mt-3">Next billing: May 1, 2026</p>
                    </div>
                 </div>
              </div>
           </div>

           <div className="flex flex-col gap-8">
              <div className="bg-slate-900/40 border border-white/5 rounded-[2.5rem] p-10 h-full shadow-xl">
                 <h3 className="text-xl font-black mb-8 flex items-center gap-3">
                    <Download className="text-slate-500" size={20} />
                    Documents
                 </h3>
                 <div className="space-y-4">
                    {[
                      { month: "Apr 2026 Invoice", amt: "R149.00", status: "Paid" },
                      { month: "Mar 2026 Invoice", amt: "R149.00", status: "Paid" }
                    ].map((inv, idx) => (
                      <div key={idx} className="flex items-center justify-between p-5 bg-slate-950/50 border border-white/5 rounded-2xl group hover:border-indigo-500/30 transition-all cursor-pointer shadow-lg">
                        <div>
                          <p className="text-sm font-black">{inv.month}</p>
                          <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mt-1">{inv.status}</p>
                        </div>
                        <span className="text-sm font-mono font-black text-slate-300">{inv.amt}</span>
                      </div>
                    ))}
                 </div>
              </div>

              <div className="p-10 bg-indigo-600/10 border border-indigo-500/20 rounded-[2.5rem] relative overflow-hidden group cursor-pointer hover:bg-indigo-600/20 transition-all">
                 <div className="absolute top-[-20%] right-[-10%] p-8 opacity-5 group-hover:opacity-20 transition-all duration-700">
                    <ShieldAlert size={120} />
                 </div>
                 <h3 className="text-xl font-black mb-3">Enterprise Elite</h3>
                 <p className="text-sm text-slate-400 mb-8 leading-relaxed font-bold">Scaling for a community or business?</p>
                 <button className="text-[10px] font-black uppercase text-indigo-400 flex items-center gap-3 group-hover:gap-5 transition-all tracking-[0.2em]">
                    Institutional Support
                    <ArrowRight size={16} />
                  </button>
              </div>
           </div>
        </section>
      </div>
    </div>
  );
}
