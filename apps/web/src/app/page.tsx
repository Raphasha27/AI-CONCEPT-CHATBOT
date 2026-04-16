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
  LineChart
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

const USE_CASES = [
  { icon: Stethoscope, label: "HPCSA", desc: "Medical professionals" },
  { icon: GraduationCap, label: "SAQA", desc: "Training providers & qualifications" },
  { icon: Building2, label: "CIPC", desc: "Business registration" },
  { icon: HardHat, label: "CIDB", desc: "Construction contractors" },
  { icon: ShieldCheck, label: "DBE", desc: "Schools & educators" },
  { icon: Globe, label: "MuniFix", desc: "Municipal service complaints" },
];

const FEATURES = [
  "Real-time professional accreditation verification",
  "Official municipal service complaint automation",
  "SpazaAI business intelligence for local vendors",
  "Citizen's Rights navigator in 11 official languages",
  "Downloadable reports and history tracking",
  "Mobile-optimised for low-data environments",
];

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  return (
    <main className="min-h-screen flex flex-col bg-[#080809] text-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-6 border-b border-surface-border max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-za flex items-center justify-center text-white font-black text-xs shadow-lg shadow-za-green/10">
            QL
          </div>
          <div className="flex flex-col">
            <span className="font-black text-xl tracking-tight leading-none uppercase">QueueLess AI™</span>
            <span className="text-[10px] text-za-green font-bold uppercase tracking-widest mt-0.5">National Civic Concierge</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/queueless" className="hidden lg:block text-sm font-bold text-white transition-colors border-b-2 border-za-green pb-1">QueueLess AI</Link>
          <Link href="/navigator" className="hidden md:block text-sm font-bold text-[var(--color-muted)] hover:text-white transition-colors">Navigator</Link>
          <Link href="/spaza" className="hidden md:block text-sm font-bold text-[var(--color-muted)] hover:text-white transition-colors">SpazaAI</Link>
          <div className="w-px h-4 bg-surface-border hidden md:block" />
          {loading ? (
            <div className="w-20 h-8 bg-surface-2 animate-pulse rounded-lg" />
          ) : user ? (
            <Link href="/dashboard" className="btn-primary text-sm px-6 py-2.5">
              My Dashboard
            </Link>
          ) : (
            <>
              <Link href="/auth" className="text-sm font-bold hover:text-za-green transition-colors">Login</Link>
              <Link href="/auth?mode=register" className="btn-primary text-sm px-6 py-2.5 shadow-xl shadow-za-green/20">
                Join Community
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="relative px-6 py-24 text-center max-w-6xl mx-auto w-full overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-za-green/5 rounded-full blur-[120px] -z-10" />
        
        <div className="inline-flex items-center gap-2 bg-za-green/10 border border-za-green/20 text-za-green text-[11px] font-black px-4 py-2 rounded-full mb-8 uppercase tracking-[0.1em]">
          🇿🇦 Your 24/7 Government Process Assistant
        </div>

        <h1 className="text-5xl sm:text-7xl font-black tracking-tighter leading-[0.95] mb-8">
          Skip the Stress, <br />
          <span className="bg-gradient-to-r from-za-green via-za-gold to-white bg-clip-text text-transparent italic">
            Not the Process.
          </span>
        </h1>

        <p className="text-[var(--color-muted)] text-xl max-w-2xl mx-auto mb-12 leading-relaxed">
          QueueLess AI helps you prepare documents, book appointments, and 
          <span className="text-white font-bold ml-1">avoid the long queues</span> at Home Affairs and the Traffic Dept. 
          Verify credentials, report service delivery issues, and scale your local business.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
          <Link href="/auth?mode=register" className="w-full sm:w-auto btn-primary text-lg px-10 py-4 shadow-2xl shadow-za-green/20 scale-105 hover:scale-110 transition-transform">
            Start Your Journey <ArrowRight className="w-5 h-5" />
          </Link>
          <Link href="/report" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/5 border border-white/10 text-white font-bold px-10 py-4 rounded-2xl hover:bg-white/10 transition-all">
            Report a Service Issue
          </Link>
        </div>

        {/* Dynamic Trust Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-10 border-y border-surface-border">
          {[
            { val: "1.2M+", label: "Identities Verified" },
            { val: "45k+", label: "MuniFix Reports" },
            { val: "12k+", label: "Active Vendors" },
            { val: "11", label: "Languages Supported" },
          ].map(s => (
            <div key={s.label}>
              <p className="text-3xl font-black text-white">{s.val}</p>
              <p className="text-xs text-[var(--color-muted)] font-bold uppercase tracking-widest mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Services Grid */}
      <section className="px-6 py-24 bg-surface-1">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-8">
          <div className="card border-blue-500/10 hover:border-blue-500/30 transition-all flex flex-col items-center text-center p-10 group">
             <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 mb-6 group-hover:scale-110 transition-transform shadow-xl">
               <ShieldCheck className="w-8 h-8" />
             </div>
             <h3 className="text-2xl font-black mb-3">Professional Verification</h3>
             <p className="text-[var(--color-muted)] text-sm leading-relaxed mb-6">Instantly verify doctor registrations (HPCSA), teacher accreditations (SACE), and school statuses.</p>
             <Link href="/chat" className="mt-auto text-blue-400 font-bold text-sm hover:underline">Verify Identity →</Link>
          </div>
          <div className="card border-za-green/10 hover:border-za-green/30 transition-all flex flex-col items-center text-center p-10 group">
             <div className="w-16 h-16 rounded-2xl bg-za-green/10 flex items-center justify-center text-za-green mb-6 group-hover:scale-110 transition-transform shadow-xl">
               <Globe className="w-8 h-8" />
             </div>
             <h3 className="text-2xl font-black mb-3">MuniFix Reporting</h3>
             <p className="text-[var(--color-muted)] text-sm leading-relaxed mb-6">Generated formal, legally compliant service delivery reports for water, power, and road issues.</p>
             <Link href="/report" className="mt-auto text-za-green font-bold text-sm hover:underline">Generate Report →</Link>
          </div>
          <div className="card border-orange-500/10 hover:border-orange-500/30 transition-all flex flex-col items-center text-center p-10 group">
             <div className="w-16 h-16 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-400 mb-6 group-hover:scale-110 transition-transform shadow-xl">
               <Store className="w-8 h-8" />
             </div>
             <h3 className="text-2xl font-black mb-3">SpazaAI Business</h3>
             <p className="text-[var(--color-muted)] text-sm leading-relaxed mb-6">Scale your small business with professional accounting insights and growth estimation.</p>
             <Link href="/spaza" className="mt-auto text-orange-400 font-bold text-sm hover:underline">Open SpazaAI →</Link>
          </div>
        </div>
      </section>

      {/* Community Reporting Callout */}
      <section className="px-6 py-24 border-y border-surface-border">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block p-4 rounded-3xl bg-red-500/10 border border-red-500/20 text-red-500 mb-8">
            <AlertTriangle className="w-12 h-12" />
          </div>
          <h2 className="text-4xl font-black mb-6">Is service delivery failing you?</h2>
          <p className="text-[var(--color-muted)] text-lg mb-10 leading-relaxed">
            Community members have the right to report bad services. No more waiting on hold. 
            Our report generator builds professional claims that get results.
          </p>
          <Link href="/report" className="btn-primary bg-red-600 hover:bg-red-500 border-none px-12 py-4 shadow-xl shadow-red-500/30">
            Submit a Community Report
          </Link>
        </div>
      </section>

      {/* Mobile App Marketing Section */}
      <section className="px-6 py-32 overflow-hidden bg-gradient-to-b from-[#080809] to-surface-1">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
          <div className="relative">
             <div className="absolute -inset-20 bg-za-green/5 rounded-full blur-[100px] pointer-events-none" />
             {/* Mock App Screens */}
             <div className="flex gap-6 justify-center">
                <div className="w-[280px] h-[580px] rounded-[3rem] bg-black p-2 border border-white/10 shadow-2xl rotate-[-5deg] transform translate-y-10 hidden sm:block">
                   <div className="w-full h-full bg-surface-1 rounded-[2.5rem] overflow-hidden p-6 pt-12 relative">
                      <div className="flex justify-between items-center mb-10">
                         <div className="w-10 h-10 rounded-xl bg-gradient-za flex items-center justify-center text-[10px] font-black">VZ</div>
                         <div className="w-2 h-2 rounded-full bg-za-green" />
                      </div>
                      <div className="h-[2px] w-1/2 bg-white/20 rounded mb-4" />
                      <div className="h-[2px] w-1/3 bg-white/10 rounded mb-10" />
                      {[1,2,3,4].map(i => (
                        <div key={i} className="h-16 w-full bg-white/5 border border-white/10 rounded-2xl mb-3 p-4">
                           <div className="h-2 w-2/3 bg-white/20 rounded mb-2" />
                           <div className="h-1.5 w-1/2 bg-white/10 rounded" />
                        </div>
                      ))}
                      <div className="absolute bottom-8 left-0 right-0 px-6">
                        <div className="w-full h-14 bg-za-green rounded-2xl flex items-center justify-center font-black shadow-xl shadow-za-green/20">Verify Document</div>
                      </div>
                   </div>
                </div>
                <div className="w-[280px] h-[580px] rounded-[3rem] bg-black p-2 border border-white/10 shadow-2xl rotate-[5deg] z-10">
                   <div className="w-full h-full bg-[#0D0A04] rounded-[2.5rem] overflow-hidden p-6 pt-12 relative border border-orange-500/10">
                      <div className="flex items-center gap-3 mb-10">
                        <Store className="w-5 h-5 text-orange-400" />
                        <p className="text-xs font-black text-orange-400">SPAZAAI ENGINE</p>
                      </div>
                      <div className="h-[2px] w-3/4 bg-orange-400/20 rounded mb-4" />
                      <div className="h-24 w-full bg-orange-400/5 border border-orange-400/20 rounded-2xl mb-8 p-4">
                         <div className="h-2 w-1/2 bg-orange-400/40 rounded mb-2" />
                         <div className="h-1.5 w-full bg-orange-400/20 rounded mb-1.5" />
                         <div className="h-1.5 w-full bg-orange-400/20 rounded" />
                      </div>
                      <div className="flex gap-2 mb-8">
                         <div className="flex-1 h-20 bg-white/5 rounded-2xl border border-white/10" />
                         <div className="flex-1 h-20 bg-za-green/10 rounded-2xl border border-za-green/20" />
                      </div>
                      <div className="absolute bottom-8 left-0 right-0 px-6">
                        <div className="w-full h-14 bg-orange-500 rounded-2xl flex items-center justify-center font-black shadow-xl shadow-orange-500/20">Restock Scan</div>
                      </div>
                   </div>
                </div>
             </div>
          </div>
          <div className="text-center lg:text-left">
            <h2 className="text-4xl sm:text-5xl font-black mb-8 leading-tight">The VerifyZA App. <br /><span className="text-za-green italic">Coming Soon to Stores.</span></h2>
            <p className="text-[var(--color-muted)] text-xl leading-relaxed mb-12 max-w-xl mx-auto lg:mx-0">
               We’re building a native mobile experience for South African vendors and citizens. No data? Low signal? No problem. Play Store and iOS versions are reaching community beta.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
               <button className="flex items-center gap-4 bg-white text-black px-8 py-4 rounded-2xl transform hover:scale-105 transition-all shadow-xl shadow-white/5">
                 <Smartphone className="w-8 h-8" />
                 <div className="text-left">
                   <p className="text-[10px] uppercase font-bold text-black/50">Coming to</p>
                   <p className="text-xl font-bold font-black">App Store</p>
                 </div>
               </button>
               <button className="flex items-center gap-4 bg-white text-black px-8 py-4 rounded-2xl transform hover:scale-105 transition-all shadow-xl shadow-white/5">
                 <Smartphone className="w-8 h-8" />
                 <div className="text-left">
                   <p className="text-[10px] uppercase font-bold text-black/50">Coming to</p>
                   <p className="text-xl font-bold font-black">Google Play</p>
                 </div>
               </button>
            </div>
          </div>
        </div>
      </section>

      {/* Community Feedback / Testimonials */}
      <section className="px-6 py-32 border-t border-surface-border bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row gap-20">
            <div className="flex-1">
              <h2 className="text-4xl font-black mb-8">What our Community says.</h2>
              <div className="space-y-6">
                <div className="card p-8 border-za-green/20 bg-za-green/5 relative overflow-hidden">
                   <div className="p-4 rounded-xl bg-za-green text-white absolute -top-4 -right-4 font-black rotate-12">"Real Impact"</div>
                   <p className="text-lg text-white font-medium italic mb-6 leading-relaxed">"VerifyZA saved my business. Checking a doctor's credentials before school registration and using SpazaAI to manage my shop's cash flow in Khayelitsha has been a game-changer."</p>
                   <div className="flex items-center gap-4">
                     <div className="w-12 h-12 rounded-full bg-surface-3 flex items-center justify-center font-black">SD</div>
                     <div>
                       <p className="font-bold">Sipho Dlamini</p>
                       <p className="text-xs text-[var(--color-muted)] font-black uppercase tracking-widest">SME Owner · Cape Town</p>
                     </div>
                   </div>
                </div>
              </div>
            </div>
            <div className="flex-1">
              <div className="card p-10 bg-surface-2 h-full border-surface-border flex flex-col justify-center">
                 <h3 className="text-3xl font-black mb-6">Support the Scaling.</h3>
                 <p className="text-[var(--color-muted)] mb-8">Are you an NGO, community leader, or government official? Help us bring VerifyZA to more communities.</p>
                 <div className="space-y-4">
                    <input className="w-full bg-surface-1 border border-surface-border rounded-xl px-5 py-4 text-sm focus:outline-none focus:border-za-green" placeholder="Community Name" />
                    <input className="w-full bg-surface-1 border border-surface-border rounded-xl px-5 py-4 text-sm focus:outline-none focus:border-za-green" placeholder="Contact Details" />
                    <button className="w-full btn-primary py-4">Request Local Rollout</button>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-surface-border px-6 py-20 bg-surface-1">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
           <div className="max-w-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-xl bg-gradient-za flex items-center justify-center text-white font-black text-[10px]">VZ</div>
                <span className="font-black text-xl tracking-tight uppercase">VerifyZA</span>
              </div>
              <p className="text-sm text-[var(--color-muted)] leading-relaxed underline decoration-za-green/40">
                A national civic platform empowering South African citizens through identity verification, municipal accountability, and informal economy business intelligence.
              </p>
           </div>
           <div className="grid grid-cols-2 sm:grid-cols-3 gap-12">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-[#555] mb-6">Solutions</p>
                <ul className="space-y-4 text-sm font-bold text-[var(--color-muted)]">
                  <li><Link href="/chat" className="hover:text-za-green">Professional Check</Link></li>
                  <li><Link href="/report" className="hover:text-za-green">MuniFix Action</Link></li>
                  <li><Link href="/navigator" className="hover:text-za-green">Grant Navigator</Link></li>
                  <li><Link href="/spaza" className="hover:text-za-green">SpazaAI Intelligence</Link></li>
                </ul>
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-[#555] mb-6">Account</p>
                <ul className="space-y-4 text-sm font-bold text-[var(--color-muted)]">
                   <li><Link href="/dashboard" className="hover:text-za-green">Dashboard</Link></li>
                   <li><Link href="/auth" className="hover:text-za-green">Login</Link></li>
                   <li><Link href="/auth?mode=register" className="hover:text-za-green">Register</Link></li>
                </ul>
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-[#555] mb-6">Legal</p>
                <ul className="space-y-4 text-sm font-bold text-[var(--color-muted)]">
                   <li>Privacy Policy</li>
                   <li>Terms of Use</li>
                   <li>Community Guidelines</li>
                </ul>
              </div>
           </div>
        </div>
        <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-surface-border flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-black uppercase tracking-widest text-[#444]">
           <p>© 2026 VerifyZA — Scaling SA Civic Infrastructure</p>
           <p>🇿🇦 Made for South Africa</p>
        </div>
      </footer>
    </main>
  );
}
