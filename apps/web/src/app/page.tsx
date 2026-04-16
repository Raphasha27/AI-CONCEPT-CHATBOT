"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Building2,
  GraduationCap,
  Stethoscope,
  HardHat,
  Zap,
  ArrowRight,
  CheckCircle2,
  Globe,
  Compass,
  Coins,
  Scale,
  FileCheck,
  Store,
  AlertTriangle,
  Smartphone,
  PieChart,
  LineChart,
  Clock,
  Sparkles,
  FileText
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

const USE_CASES = [
  { icon: Clock, label: "DHA", desc: "Passports & IDs" },
  { icon: GraduationCap, label: "SASSA", desc: "Grants & Support" },
  { icon: Building2, label: "CIPC", desc: "Business Registration" },
  { icon: Stethoscope, label: "Health", desc: "Medical Appointments" },
  { icon: HardHat, label: "Licensing", desc: "Vehicle & Drivers" },
  { icon: Globe, label: "MuniFix", desc: "Civic Complaints" },
];

const FEATURES = [
  "AI-Powered government appointment scheduling",
  "Automated document preparation & verification",
  "Real-time queue tracking & predictive wait times",
  "Concierge assist for 11 official languages",
  "Premium citizen advocacy and legal reporting",
  "Mobile-first, low-data interface for all South Africans",
];

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  return (
    <main className="min-h-screen flex flex-col bg-[#050507] text-white overflow-x-hidden">
      {/* Premium Glow Background */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/5 blur-[150px] rounded-full" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-6 border-b border-white/5 max-w-7xl mx-auto w-full backdrop-blur-md bg-black/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-indigo-500/20">
            Q
          </div>
          <div className="flex flex-col">
            <span className="font-black text-xl tracking-tighter leading-none uppercase">QueueLess<span className="text-indigo-400">AI</span></span>
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-0.5">Premium Civic Concierge</span>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/queueless" className="hidden lg:block text-sm font-bold text-indigo-400 hover:text-indigo-300 transition-colors">Book Appointment</Link>
          <Link href="/navigator" className="hidden md:block text-sm font-bold text-slate-400 hover:text-white transition-colors">Navigator</Link>
          <Link href="/spaza" className="hidden md:block text-sm font-bold text-slate-400 hover:text-white transition-colors">SpazaAI</Link>
          <div className="w-px h-4 bg-white/10 hidden md:block" />
          {loading ? (
            <div className="w-20 h-8 bg-white/5 animate-pulse rounded-full" />
          ) : user ? (
            <Link href="/dashboard" className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold px-6 py-2.5 rounded-full shadow-lg shadow-indigo-600/20 transition-all">
              Dashboard
            </Link>
          ) : (
            <div className="flex items-center gap-4">
              <Link href="/auth" className="text-sm font-bold text-slate-400 hover:text-white transition-colors">Login</Link>
              <Link href="/auth?mode=register" className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold px-6 py-2.5 rounded-full shadow-lg shadow-indigo-600/20 transition-all">
                Join Network
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 px-6 pt-32 pb-24 text-center max-w-6xl mx-auto w-full">
        <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[10px] font-black px-4 py-2 rounded-full mb-8 uppercase tracking-[0.2em] animate-fade-in">
          <Sparkles className="w-3 h-3" /> Reclaiming Your Time — 🇿🇦
        </div>

        <h1 className="text-6xl sm:text-8xl font-black tracking-tighter leading-[0.9] mb-8 bg-gradient-to-b from-white via-white to-slate-500 bg-clip-text text-transparent">
          Skip the Line. <br />
          <span className="italic font-serif text-indigo-400">Own Your Day.</span>
        </h1>

        <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed">
          QueueLess AI is South Africa's premier civic assistant. We handle the complexity of government bureaucracies, from <span className="text-white font-bold">DHA appointments</span> to <span className="text-white font-bold">verified document preparation</span>, so you don't have to wait.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-24">
          <Link href="/queueless" className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white font-black text-lg px-12 py-5 rounded-2xl shadow-2xl shadow-indigo-600/30 transition-all transform hover:scale-105 flex items-center justify-center gap-3">
            Book My Visit <ArrowRight className="w-5 h-5" />
          </Link>
          <Link href="/navigator" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/5 border border-white/10 text-white font-bold px-12 py-5 rounded-2xl hover:bg-white/10 transition-all">
            Explore Services
          </Link>
        </div>

        {/* Dynamic Trust Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 py-12 border-y border-white/5">
          {[
            { val: "125k+", label: "Hours Saved" },
            { val: "22k+", label: "Appointments Booked" },
            { val: "99.8%", label: "Success Rate" },
            { val: "11", label: "Languages" },
          ].map(s => (
            <div key={s.label}>
              <p className="text-4xl font-black text-white mb-1">{s.val}</p>
              <p className="text-[10px] text-indigo-400 font-black uppercase tracking-widest">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Services Grid */}
      <section className="relative z-10 px-6 py-32 bg-gradient-to-b from-transparent to-[#08080A]">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
          <div className="group bg-slate-900/30 border border-white/5 hover:border-indigo-500/30 transition-all rounded-[2rem] p-10 flex flex-col items-center text-center">
             <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-8 group-hover:scale-110 transition-transform shadow-2xl shadow-indigo-500/10">
               <Clock className="w-8 h-8" />
             </div>
             <h3 className="text-2xl font-black mb-4">Elite Appointment Booking</h3>
             <p className="text-slate-400 text-sm leading-relaxed mb-8">Secure your spot at DHA or SASSA offices instantly. Our AI optimizes for the fastest available slots in your region.</p>
             <Link href="/queueless" className="mt-auto text-indigo-400 font-bold text-sm flex items-center gap-2 group-hover:gap-3 transition-all">
               Skip the Queue <ArrowRight className="w-4 h-4" />
             </Link>
          </div>
          <div className="group bg-slate-900/30 border border-white/5 hover:border-emerald-500/30 transition-all rounded-[2rem] p-10 flex flex-col items-center text-center">
             <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-8 group-hover:scale-110 transition-transform shadow-2xl shadow-emerald-500/10">
               <ShieldCheck className="w-8 h-8" />
             </div>
             <h3 className="text-2xl font-black mb-4">Document Concierge</h3>
             <p className="text-slate-400 text-sm leading-relaxed mb-8">Never get turned away again. Our AI verifies your documents against national requirements before you even leave home.</p>
             <Link href="/queueless" className="mt-auto text-emerald-400 font-bold text-sm flex items-center gap-2 group-hover:gap-3 transition-all">
               Verify My Papers <ArrowRight className="w-4 h-4" />
             </Link>
          </div>
          <div className="group bg-slate-900/30 border border-white/5 hover:border-orange-500/30 transition-all rounded-[2rem] p-10 flex flex-col items-center text-center">
             <div className="w-16 h-16 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-400 mb-8 group-hover:scale-110 transition-transform shadow-2xl shadow-orange-500/10">
               <FileText className="w-8 h-8" />
             </div>
             <h3 className="text-2xl font-black mb-4">MuniFix Core</h3>
             <p className="text-slate-400 text-sm leading-relaxed mb-8">Generate professional, legally-sound reports for infrastructure failure that actually get the attention of officials.</p>
             <Link href="/report" className="mt-auto text-orange-400 font-bold text-sm flex items-center gap-2 group-hover:gap-3 transition-all">
               Report Issue <ArrowRight className="w-4 h-4" />
             </Link>
          </div>
        </div>
      </section>

      {/* Community / Advocacy */}
      <section className="relative z-10 px-6 py-32 border-y border-white/5 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/5 blur-[150px] rounded-full" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-block p-6 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 mb-10">
            <Scale className="w-12 h-12" />
          </div>
          <h2 className="text-4xl md:text-5xl font-black mb-8 tracking-tighter italic">Reclaiming Citizen Power.</h2>
          <p className="text-slate-400 text-lg mb-12 leading-relaxed">
            QueueLess AI isn't just an app; it's a movement towards a more efficient South Africa. 
            We provide the tools to navigate state systems with dignity, transparency, and expert guidance.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
             {["BEE Compliance", "SARS Readiness", "Legal Advocacy", "Civic Rights"].map(tag => (
               <span key={tag} className="px-6 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-slate-300">{tag}</span>
             ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 px-6 py-24 bg-[#050507]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">
           <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-[10px]">Q</div>
                <span className="font-black text-xl tracking-tighter uppercase">QueueLess<span className="text-indigo-400">AI</span></span>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed">
                South Africa's first premium civic concierge. AI-driven efficiency for a sovereign nation.
              </p>
           </div>
           
           <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-400/60 mb-8">Services</p>
              <ul className="space-y-4 text-sm font-bold text-slate-400">
                <li><Link href="/queueless" className="hover:text-indigo-400 transition-colors">Appointment Booking</Link></li>
                <li><Link href="/navigator" className="hover:text-indigo-400 transition-colors">Civic Navigator</Link></li>
                <li><Link href="/report" className="hover:text-indigo-400 transition-colors">MuniFix Reports</Link></li>
                <li><Link href="/spaza" className="hover:text-indigo-400 transition-colors">SpazaAI Engine</Link></li>
              </ul>
           </div>

           <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-400/60 mb-8">Company</p>
              <ul className="space-y-4 text-sm font-bold text-slate-400">
                <li><Link href="/auth" className="hover:text-indigo-400 transition-colors">Partner Access</Link></li>
                <li><Link href="/billing" className="hover:text-indigo-400 transition-colors">Enterprise Pricing</Link></li>
                <li><Link href="#" className="hover:text-indigo-400 transition-colors">Government API</Link></li>
                <li><Link href="#" className="hover:text-indigo-400 transition-colors">Privacy Policy</Link></li>
              </ul>
           </div>

           <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-400/60 mb-8">Status</p>
              <div className="flex items-center gap-3 text-emerald-400 text-sm font-bold mb-4">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                 All Systems Operational
              </div>
              <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest leading-loose">
                National Network: Active <br />
                Concierge AI: 2.1ms Latency <br />
                Sovereign Cloud: Verified
              </p>
           </div>
        </div>
        
        <div className="max-w-7xl mx-auto pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-600">
           <p>© 2026 QueueLess AI — National Civic Operating System</p>
           <div className="flex items-center gap-6">
              <span>Johannesburg</span>
              <span>Cape Town</span>
              <span>Durban</span>
              <span className="text-indigo-400/40 font-serif lowercase italic tracking-normal text-xs ml-4">Empowering the South African Spirit.</span>
           </div>
        </div>
      </footer>
    </main>
  );
}
