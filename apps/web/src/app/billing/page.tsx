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
  Clock
} from "lucide-react";
import { motion } from "framer-motion";
import { billingAPI } from "@/lib/api";

const PLANS = [
  {
    name: "Free",
    price: "R0",
    desc: "Basic civic reporting for individuals",
    features: ["Standard Complaint Reporting", "Basic Dashboard", "Email Notifications", "1 AI Formal Report / day"],
    button: "Current Plan",
    current: true,
    color: "bg-slate-800"
  },
  {
    name: "Government Pro",
    price: "R4,999",
    period: "/mo",
    desc: "Advanced operations for ward offices",
    features: ["Unlimited AI Reports", "Crisis Prediction Engine", "Command Center Access", "Escalation Automation", "QueueLess AI Support"],
    button: "Upgrade to Pro",
    current: false,
    color: "bg-indigo-600",
    popular: true
  },
  {
    name: "National Enterprise",
    price: "Custom",
    desc: "Full state-level municipal intelligence",
    features: ["National Control Tower", "City Simulation Engine", "Policy Impact AI", "Multi-City Managed Access", "Dedicated Support"],
    button: "Contact Sales",
    current: false,
    color: "bg-za-green"
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
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-indigo-500/30">
      <div className="max-w-7xl mx-auto px-6 py-12 md:py-24">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-end justify-between gap-8 mb-16">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight">Billing & SaaS Plans</h1>
            <p className="text-slate-400 text-lg max-w-xl">
              Scale your municipal impact with AI-powered crisis prediction and national intelligence.
            </p>
          </div>
          <div className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
            <div className="h-12 w-12 rounded-xl bg-indigo-500 flex items-center justify-center">
              <ShieldCheck size={28} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest leading-none">Status</p>
              <h3 className="text-xl font-bold mt-1 uppercase">{subscription?.plan || "Free"} ACTIVE</h3>
            </div>
          </div>
        </div>

        {/* Pricing Table */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`relative p-8 rounded-[2rem] border ${plan.popular ? "border-indigo-500/50 bg-indigo-500/5 shadow-2xl shadow-indigo-500/10" : "border-white/10 bg-white/5"} overflow-hidden group`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 px-4 py-1.5 bg-indigo-500 text-[10px] font-black uppercase tracking-widest rounded-bl-xl">
                  Most Popular
                </div>
              )}
              
              <h2 className="text-2xl font-bold">{plan.name}</h2>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-5xl font-black">{plan.price}</span>
                {plan.period && <span className="text-slate-500 font-bold">{plan.period}</span>}
              </div>
              <p className="mt-4 text-slate-400 font-medium text-sm leading-relaxed">{plan.desc}</p>

              <button className={`w-full mt-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${
                plan.current ? "bg-white/10 text-slate-400 cursor-default" : "bg-white text-black hover:scale-[1.02] active:scale-95"
              }`}>
                {plan.button}
              </button>

              <div className="mt-10 space-y-4">
                {plan.features.map(feat => (
                  <div key={feat} className="flex items-start gap-3">
                    <div className="mt-1 h-4 w-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <Check className="text-emerald-500" size={10} strokeWidth={4} />
                    </div>
                    <span className="text-sm font-medium text-slate-300">{feat}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </section>

        {/* Usage & Stats */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-[2.5rem] p-8 lg:p-12 overflow-hidden relative">
              <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                 <Activity size={200} />
              </div>
              <h3 className="text-2xl font-bold flex items-center gap-3 mb-10">
                 <Activity className="text-indigo-400" size={24} />
                 Real-time Usage Meter
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                 <div className="space-y-6">
                    <div>
                       <div className="flex justify-between text-xs font-black uppercase tracking-widest text-slate-500 mb-2">
                          <span>AI Intelligence Calls</span>
                          <span>{usage.filter(u => u.event_type === "ai_call").length} / 5,000</span>
                       </div>
                       <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-500 w-[12%]" />
                       </div>
                    </div>
                    <div>
                       <div className="flex justify-between text-xs font-black uppercase tracking-widest text-slate-500 mb-2">
                          <span>Simulation Engine Runs</span>
                          <span>{usage.filter(u => u.event_type === "simulation").length} / 10</span>
                       </div>
                       <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 w-[40%]" />
                       </div>
                    </div>
                    <div>
                       <div className="flex justify-between text-xs font-black uppercase tracking-widest text-slate-500 mb-2">
                          <span>Crisis Prediction Meter</span>
                          <span>{usage.filter(u => u.event_type === "prediction").length} / 100</span>
                       </div>
                       <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-yellow-500 w-[5%]" />
                       </div>
                    </div>
                 </div>

                 <div className="p-8 bg-indigo-500 rounded-3xl shadow-2xl shadow-indigo-500/20 flex flex-col justify-between">
                    <div>
                       <div className="h-12 w-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                          <BarChart3 className="text-white" size={24} />
                       </div>
                       <h4 className="text-lg font-bold">Estimated Cost</h4>
                       <p className="text-indigo-100/60 text-sm font-medium">Accumulated usage this period</p>
                    </div>
                    <div className="mt-8">
                       <span className="text-5xl font-black">R4,999</span>
                       <p className="text-xs font-bold text-indigo-100 uppercase mt-2">Plus R0.02 per AI call</p>
                    </div>
                 </div>
              </div>
           </div>

           <div className="space-y-8">
              <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8">
                 <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                    <Download className="text-slate-400" size={18} />
                    Invoices
                 </h3>
                 <div className="space-y-4">
                    {[
                      { month: "April 2026", amt: "R4,999.00", date: "Apr 1, 2026" },
                      { month: "March 2026", amt: "R4,999.00", date: "Mar 1, 2026" }
                    ].map((inv, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 bg-white/5 rounded-xl group hover:bg-white/10 transition-all cursor-pointer">
                        <div>
                          <p className="text-sm font-bold">{inv.month}</p>
                          <p className="text-[10px] font-bold text-slate-500 uppercase mt-1">{inv.date}</p>
                        </div>
                        <span className="text-sm font-mono font-bold">{inv.amt}</span>
                      </div>
                    ))}
                 </div>
              </div>

              <div className="p-8 bg-white/5 border border-white/10 rounded-[2rem] relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                    <ShieldAlert size={80} />
                 </div>
                 <h3 className="text-lg font-bold mb-2">Enterprise Scaling</h3>
                 <p className="text-sm text-slate-400 mb-6 leading-relaxed">Need custom ward limits or city-wide disaster simulation?</p>
                 <button className="text-xs font-black uppercase text-indigo-400 flex items-center gap-2 group-hover:gap-3 transition-all">
                    Talk to our Government Team
                    <ArrowRight size={14} />
                  </button>
              </div>
           </div>
        </section>
      </div>
    </div>
  );
}
