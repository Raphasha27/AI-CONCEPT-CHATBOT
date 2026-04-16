"use client";

import React, { useState, useEffect } from "react";
import { 
  Clock, 
  MapPin, 
  Search, 
  Calendar, 
  ShieldCheck, 
  HelpCircle, 
  Zap, 
  CheckCircle, 
  Building2, 
  UserCircle,
  ChevronRight,
  ArrowRight,
  MessageSquare,
  FileText,
  AlertCircle
} from "lucide-react";
import { queuelessAPI, chatAPI } from "@/lib/api";
import { toast } from "react-hot-toast";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

// --- Types ---

interface Office {
  id: number;
  name: string;
  address: string;
  office_type: string;
}

interface Slot {
  id: number;
  start_time: string;
  end_time: string;
  capacity: number;
  booked_count: number;
}

interface Booking {
  id: number;
  service_type: string;
  status: string;
  created_at: string;
  office: Office;
  time_slot: Slot;
}

export default function QueueLessPage() {
  const [activeTab, setActiveTab] = useState<"book" | "my-appointments" | "concierge">("book");
  const [loading, setLoading] = useState(false);
  const [offices, setOffices] = useState<Office[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);

  // Selection state
  const [selectedOffice, setSelectedOffice] = useState<Office | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [serviceType, setServiceType] = useState("Passport Application");
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);

  const PREMIUM_SERVICES = [
    "Passport Application",
    "Smart ID Card Renewal",
    "Vehicle Licensing"
  ];

  useEffect(() => {
    loadOffices();
    loadMyBookings();
  }, []);

  const handleServiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setServiceType(val);
    if (PREMIUM_SERVICES.includes(val)) {
      setShowUpgradePrompt(true);
    } else {
      setShowUpgradePrompt(false);
    }
  };

  const loadOffices = async () => {
    try {
      const res = await queuelessAPI.offices();
      setOffices(res.data);
    } catch (err) {
      toast.error("Failed to load gov offices");
    }
  };

  const loadMyBookings = async () => {
    try {
      const res = await queuelessAPI.myBookings();
      setBookings(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleOfficeSelect = async (office: Office) => {
    setSelectedOffice(office);
    setSelectedSlot(null);
    setLoading(true);
    try {
      const res = await queuelessAPI.slots(office.id);
      setSlots(res.data);
    } catch (err) {
      toast.error("Failed to load appointment slots");
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async () => {
    if (!selectedOffice || !selectedSlot) return;
    if (PREMIUM_SERVICES.includes(serviceType)) {
      toast.error("Selected service requires Citizen Elite tier");
      setShowUpgradePrompt(true);
      return;
    }
    setLoading(true);
    try {
      await queuelessAPI.book({
        office_id: selectedOffice.id,
        slot_id: selectedSlot.id,
        service_type: serviceType
      });
      toast.success("Appointment Confirmed!");
      setActiveTab("my-appointments");
      loadMyBookings();
    } catch (err) {
      toast.error("Failed to confirm booking");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050507] text-white pb-20 overflow-x-hidden">
      {/* Hero / Header */}
      <header className="py-24 bg-gradient-to-b from-indigo-950/20 to-transparent border-b border-white/5 px-6 relative overflow-hidden">
        <div className="max-w-6xl mx-auto flex flex-col items-center text-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-10 shadow-3xl shadow-indigo-500/20"
          >
            <Clock className="w-10 h-10 text-white" />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-black mb-8 tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-100 to-slate-400"
          >
            QueueLess <span className="text-indigo-400">Concierge.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-slate-400 text-lg md:text-xl max-w-2xl leading-relaxed"
          >
            Reclaim your time with AI-powered government appointment booking and document prep. 🇿🇦
          </motion.p>
        </div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] bg-indigo-600/5 blur-[150px] rounded-full pointer-events-none" />
      </header>

      {/* Tabs */}
      <div className="max-w-6xl mx-auto px-6 -mt-10 relative z-20">
        <div className="flex bg-slate-900/40 backdrop-blur-3xl border border-white/10 p-2 rounded-[2.5rem] shadow-3xl">
          {[
            { id: 'book', label: 'Schedule Visit', icon: Calendar },
            { id: 'concierge', label: 'AI Support', icon: Zap },
            { id: 'my-appointments', label: 'My Vault', icon: CheckCircle },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center gap-3 py-5 rounded-[2rem] transition-all duration-500 ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-600/30 font-black' : 'text-slate-500 hover:text-slate-200 hover:bg-white/5'}`}
            >
              <tab.icon className="w-5 h-5" />
              <span className="text-xs uppercase tracking-[0.2em] hidden md:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-6 py-16">
        <AnimatePresence mode="wait">
          {/* TAB: BOOKING */}
          {activeTab === 'book' && (
            <motion.div 
              key="book"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-12"
            >
              {/* Step 1: Office Selection */}
              <div className="space-y-8">
                <div className="flex items-center gap-4 text-indigo-400 mb-2">
                  <div className="w-10 h-10 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center font-black">1</div>
                  <h3 className="font-black uppercase tracking-[0.2em] text-[10px]">Step: Select Office</h3>
                </div>
                <div className="relative group">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5 group-focus-within:text-indigo-400 transition-colors" />
                  <input placeholder="Search DHA, SASSA..." className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-5 pl-14 pr-4 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all placeholder-slate-700" />
                </div>
                <div className="space-y-4 h-[500px] overflow-y-auto pr-3 custom-scrollbar">
                  {offices.map(office => (
                    <button
                      key={office.id}
                      onClick={() => handleOfficeSelect(office)}
                      className={`w-full text-left p-8 rounded-3xl border transition-all duration-300 ${selectedOffice?.id === office.id ? 'bg-indigo-600/10 border-indigo-500 shadow-2xl shadow-indigo-500/10' : 'bg-slate-900/20 border-white/5 hover:border-white/20'}`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 bg-indigo-400/10 px-3 py-1 rounded-full">{office.office_type}</span>
                        <MapPin className="w-4 h-4 text-slate-700" />
                      </div>
                      <h4 className="font-black text-lg mb-1">{office.name}</h4>
                      <p className="text-xs text-slate-500 font-medium">{office.address}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2: Slot & Service Selection */}
              <div className="lg:col-span-2 space-y-10">
                {selectedOffice ? (
                  <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-10">
                    <div className="bg-slate-900/30 border border-white/5 p-10 rounded-[2.5rem] shadow-2xl backdrop-blur-sm relative overflow-hidden">
                      <div className="flex items-center gap-4 text-indigo-400 mb-10">
                        <div className="w-10 h-10 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center font-black">2</div>
                        <h3 className="font-black uppercase tracking-[0.2em] text-[10px]">Step: Concierge Details</h3>
                      </div>
                      
                      <div className="space-y-8">
                        <div>
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 block">Select Required Service</label>
                          <select 
                            value={serviceType}
                            onChange={handleServiceChange}
                            className={`w-full bg-slate-950 border rounded-2xl p-5 focus:ring-2 focus:ring-indigo-500 focus:outline-none appearance-none cursor-pointer font-bold text-sm transition-all ${PREMIUM_SERVICES.includes(serviceType) ? 'border-indigo-500/50' : 'border-white/10'}`}
                          >
                            <option value="Passport Application">Passport Application ✦ ELITE</option>
                            <option value="Smart ID Card Renewal">Smart ID Card Renewal ✦ ELITE</option>
                            <option value="Vehicle Licensing">Vehicle Licensing ✦ ELITE</option>
                            <option value="Social Grant Application (SASSA)">Social Grant Application (SASSA)</option>
                            <option value="Birth Certificate Grant">Birth Certificate Grant</option>
                          </select>
                        </div>

                        <AnimatePresence>
                          {showUpgradePrompt && (
                            <motion.div 
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="bg-indigo-600/10 border border-indigo-500/30 p-6 rounded-2xl flex items-center justify-between gap-6"
                            >
                              <div className="flex items-center gap-4">
                                <Crown className="text-indigo-400 w-8 h-8 shrink-0" />
                                <div>
                                  <p className="text-sm font-black uppercase tracking-tight text-white">Citizen Elite Perk</p>
                                  <p className="text-xs text-indigo-200">This priority service requires a premium subscription.</p>
                                </div>
                              </div>
                              <button 
                                onClick={() => window.location.href = '/billing'}
                                className="bg-indigo-600 hover:bg-indigo-500 text-white font-black text-[10px] px-6 py-3 rounded-xl uppercase tracking-widest transition-all"
                              >
                                Upgrade Now
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        <div>
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 block">Optimal Time Slots</label>
                          {loading ? (
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
                              {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="h-20 bg-slate-800/50 rounded-2xl" />)}
                            </div>
                          ) : (
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                              {slots.map(slot => (
                                <button
                                  key={slot.id}
                                  onClick={() => setSelectedSlot(slot)}
                                  className={`p-6 rounded-2xl border text-center transition-all duration-300 ${selectedSlot?.id === slot.id ? 'bg-indigo-600 border-indigo-400 font-black shadow-2xl shadow-indigo-600/20' : 'bg-slate-950 border-white/5 hover:border-indigo-500/50'}`}
                                >
                                  <div className="text-base mb-1">{format(new Date(slot.start_time), 'HH:mm')}</div>
                                  <div className="text-[9px] opacity-40 font-black uppercase tracking-widest">Available</div>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mt-12 pt-10 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="flex items-center gap-5">
                          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                             <ShieldCheck className="w-7 h-7" />
                          </div>
                          <div>
                            <p className="font-black text-sm uppercase tracking-tight">Verified Slot</p>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Includes Document Check</p>
                          </div>
                        </div>
                        <button 
                          onClick={handleBook}
                          disabled={!selectedSlot || loading}
                          className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-500 text-white font-black py-5 px-16 rounded-[1.5rem] shadow-2xl shadow-indigo-600/30 transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50"
                        >
                          Confirm & Skip Line
                        </button>
                      </div>
                    </div>

                    <div className="p-8 bg-amber-500/5 border border-amber-500/10 rounded-[2rem] flex gap-6">
                      <AlertCircle className="w-8 h-8 text-amber-500 shrink-0" />
                      <div className="text-xs text-slate-500 leading-relaxed font-bold">
                        <span className="text-amber-200 uppercase tracking-widest mr-2">National Alert:</span> 
                        Always arrive 20 minutes before your slot. Failure to bring physical documents identified in the 
                        <span className="text-white ml-1 underline cursor-pointer" onClick={() => setActiveTab('concierge')}>AI Concierge</span> tab may result in rescheduling.
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center p-20 bg-slate-900/10 border border-dashed border-white/10 rounded-[3rem] opacity-30 grayscale">
                    <Building2 className="w-20 h-20 mb-6 text-slate-700" />
                    <p className="font-black uppercase tracking-[0.3em] text-[10px] text-slate-500">Awaiting Office Selection</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* TAB: CONCIERGE */}
          {activeTab === 'concierge' && (
            <motion.div 
              key="concierge"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-4xl mx-auto"
            >
              <div className="bg-slate-900/40 border border-white/5 rounded-[3rem] overflow-hidden shadow-3xl flex flex-col h-[750px] backdrop-blur-xl">
                <div className="p-10 border-b border-white/5 bg-indigo-600/5 flex items-center justify-between">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-2xl shadow-indigo-600/30">
                      <Zap className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="font-black text-2xl tracking-tight">Concierge AI</h3>
                      <p className="text-[10px] text-indigo-400 uppercase tracking-[0.3em] font-black mt-1">Intelligence Layer 4.0</p>
                    </div>
                  </div>
                  <div className="bg-emerald-500/10 text-emerald-400 text-[10px] font-black px-4 py-2 rounded-full border border-emerald-500/20 flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse outline outline-4 outline-emerald-500/20" />
                    SYSTEM ONLINE
                  </div>
                </div>

                <div className="flex-1 p-10 overflow-y-auto space-y-8 bg-[rgba(5,5,7,0.4)] custom-scrollbar">
                  <div className="flex gap-5 max-w-[85%]">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 flex items-center justify-center shrink-0 border border-indigo-500/20">
                      <Zap className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div className="p-6 bg-slate-900/80 rounded-[2rem] rounded-tl-none border border-white/5 text-sm leading-relaxed text-slate-300 shadow-xl font-medium">
                      Welcome to QueueLess. I'm your sovereign document assistant. I'll help you compile everything needed for your government visit so you're never turned away. 🇿🇦
                      <br /><br />
                      What's on your agenda today? (e.g. "Smart ID Renewal", "New Passport")
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 mt-10">
                    {["Smart ID Checklist", "Passport Requirements", "SASSA Grant Docs", "Drivers License Renewal"].map(tip => (
                      <button key={tip} className="px-6 py-3 rounded-full bg-slate-900/60 hover:bg-indigo-600 hover:text-white border border-white/5 hover:border-indigo-500/50 text-[10px] font-black uppercase tracking-widest transition-all">
                        {tip}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-8 border-t border-white/5 bg-slate-950/20">
                  <div className="flex gap-4">
                    <button className="p-5 bg-slate-900 hover:bg-slate-800 rounded-2xl text-slate-500 transition-all border border-white/5">
                      <FileText className="w-6 h-6" />
                    </button>
                    <input className="flex-1 bg-slate-950 border border-white/5 rounded-2xl px-8 py-5 outline-none focus:border-indigo-500 transition-all font-bold text-sm tracking-tight placeholder-slate-800" placeholder="Ask about DHA requirements..." />
                    <button className="p-5 bg-indigo-600 hover:bg-indigo-500 rounded-2xl text-white shadow-2xl shadow-indigo-600/30 transition-all">
                      <ArrowRight className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB: MY VISITS */}
          {activeTab === 'my-appointments' && (
            <motion.div 
              key="visits"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-10"
            >
               <div className="mb-12">
                <h2 className="text-3xl font-black tracking-tight mb-2">Your Civic Vault</h2>
                <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px]">Upcoming & Historical Visits</p>
              </div>

              {bookings.length === 0 ? (
                <div className="text-center py-32 bg-slate-900/10 rounded-[3rem] border border-dashed border-white/10 flex flex-col items-center">
                  <Calendar className="w-20 h-20 text-slate-800 mb-8" />
                  <h3 className="text-xl font-black text-slate-600 italic tracking-tight mb-8">No scheduled visits in your vault</h3>
                  <button onClick={() => setActiveTab("book")} className="bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 font-black px-10 py-4 rounded-2xl border border-indigo-500/20 transition-all uppercase tracking-widest text-[10px]">Schedule your first visit</button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {bookings.map(booking => (
                    <div key={booking.id} className="bg-slate-900/30 border border-white/5 p-8 rounded-[2.5rem] relative overflow-hidden group hover:border-indigo-500/30 transition-all">
                      <div className="flex justify-between items-start mb-10">
                        <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform shadow-2xl">
                          <CheckCircle className="w-7 h-7" />
                        </div>
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${booking.status === 'confirmed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-500 border border-white/5'}`}>
                          {booking.status}
                        </span>
                      </div>
                      
                      <h4 className="font-black text-xl mb-2 tracking-tight">{booking.service_type}</h4>
                      <div className="flex items-center gap-3 text-xs text-slate-500 font-bold mb-10">
                        <Building2 className="w-4 h-4" />
                        <span>{booking.office.name}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-6 pt-10 border-t border-white/5">
                        <div className="space-y-2">
                          <p className="text-[10px] uppercase font-black text-slate-600 tracking-widest">Appointment Date</p>
                          <p className="text-sm font-black text-white">{format(new Date(booking.time_slot.start_time), 'PPP')}</p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-[10px] uppercase font-black text-slate-600 tracking-widest">Arrival Time</p>
                          <p className="text-sm font-black text-white">{format(new Date(booking.time_slot.start_time), 'HH:mm')}</p>
                        </div>
                      </div>
                      
                      <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
