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
  const [serviceType, setServiceType] = useState("ID / Passport Application");

  useEffect(() => {
    loadOffices();
    loadMyBookings();
  }, []);

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
    <div className="min-h-screen bg-[#050507] text-white pb-20">
      {/* Hero / Header */}
      <header className="py-16 bg-gradient-to-b from-indigo-900/30 to-transparent border-b border-white/5 px-6 relative overflow-hidden">
        <div className="max-w-6xl mx-auto flex flex-col items-center text-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-16 h-16 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-6 shadow-2xl shadow-indigo-500/20"
          >
            <Clock className="w-8 h-8 text-white" />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-black mb-6 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-200 to-purple-400"
          >
            QueueLess <span className="text-indigo-400">AI Concierge.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-slate-400 text-lg md:text-xl max-w-2xl"
          >
            Avoid the lines. AI-powered government appointment booking and document preparation for South Africans.
          </motion.p>
        </div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-indigo-600/5 blur-[120px] rounded-full" />
      </header>

      {/* Tabs */}
      <div className="max-w-6xl mx-auto px-6 -mt-8">
        <div className="flex bg-slate-900/60 backdrop-blur-2xl border border-white/10 p-1.5 rounded-3xl shadow-2xl">
          {[
            { id: 'book', label: 'Book Appointment', icon: Calendar },
            { id: 'concierge', label: 'AI Concierge', icon: Zap },
            { id: 'my-appointments', label: 'My Visits', icon: CheckCircle },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl transition-all duration-300 ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-900/20' : 'text-slate-500 hover:text-slate-200 hover:bg-white/5'}`}
            >
              <tab.icon className="w-5 h-5" />
              <span className="font-bold hidden md:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <AnimatePresence mode="wait">
          {/* TAB: BOOKING */}
          {activeTab === 'book' && (
            <motion.div 
              key="book"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              {/* Step 1: Office Selection */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 text-indigo-400 mb-2">
                  <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center font-bold">1</div>
                  <h3 className="font-bold uppercase tracking-widest text-xs">Select Office</h3>
                </div>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                  <input placeholder="Search DHA or SASSA..." className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                </div>
                <div className="space-y-3 h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {offices.map(office => (
                    <button
                      key={office.id}
                      onClick={() => handleOfficeSelect(office)}
                      className={`w-full text-left p-6 rounded-2xl border transition-all ${selectedOffice?.id === office.id ? 'bg-indigo-600/10 border-indigo-500 shadow-lg shadow-indigo-500/5' : 'bg-slate-900/30 border-white/5 hover:border-white/20'}`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 bg-indigo-400/10 px-2 py-0.5 rounded-full">{office.office_type}</span>
                        <MapPin className="w-4 h-4 text-slate-600" />
                      </div>
                      <h4 className="font-bold mb-1">{office.name}</h4>
                      <p className="text-xs text-slate-500">{office.address}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2: Slot & Service Selection */}
              <div className="lg:col-span-2 space-y-8">
                {selectedOffice ? (
                  <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8">
                    <div className="bg-slate-900/30 border border-white/10 p-8 rounded-3xl">
                      <div className="flex items-center gap-3 text-indigo-400 mb-6">
                        <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center font-bold">2</div>
                        <h3 className="font-bold uppercase tracking-widest text-xs">Booking Details</h3>
                      </div>
                      
                      <div className="space-y-6">
                        <div>
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 block">Service Required</label>
                          <select 
                            value={serviceType}
                            onChange={(e) => setServiceType(e.target.value)}
                            className="w-full bg-slate-950 border border-white/10 rounded-2xl p-4 focus:ring-2 focus:ring-indigo-500 focus:outline-none appearance-none cursor-pointer"
                          >
                            <option>Passport Application</option>
                            <option>Smart ID Card Renewal</option>
                            <option>Birth Certificate Grant</option>
                            <option>Social Grant Application (SASSA)</option>
                            <option>Vehicle Licensing</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 block">Available Slots</label>
                          {loading ? (
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 animate-pulse">
                              {[1,2,3,4,5,6].map(i => <div key={i} className="h-16 bg-slate-800 rounded-xl" />)}
                            </div>
                          ) : (
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                              {slots.map(slot => (
                                <button
                                  key={slot.id}
                                  onClick={() => setSelectedSlot(slot)}
                                  className={`p-4 rounded-xl border text-center transition-all ${selectedSlot?.id === slot.id ? 'bg-indigo-600 border-indigo-400 font-bold' : 'bg-slate-950 border-white/5 hover:border-indigo-500/50'}`}
                                >
                                  <div className="text-sm">{format(new Date(slot.start_time), 'HH:mm')}</div>
                                  <div className="text-[10px] opacity-60 font-medium">Available</div>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mt-10 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                             <ShieldCheck className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="font-bold text-sm">Verified Appointment</p>
                            <p className="text-xs text-slate-500">Includes AI Document Checkup</p>
                          </div>
                        </div>
                        <button 
                          onClick={handleBook}
                          disabled={!selectedSlot || loading}
                          className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-500 text-white font-black py-4 px-12 rounded-2xl shadow-xl shadow-indigo-500/20 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                        >
                          Confirm & Avoid Line
                        </button>
                      </div>
                    </div>

                    <div className="p-6 bg-amber-500/5 border border-amber-500/20 rounded-2xl flex gap-4">
                      <AlertCircle className="w-6 h-6 text-amber-500 shrink-0" />
                      <div className="text-xs text-slate-400 leading-relaxed">
                        <span className="text-amber-200 font-bold">Important:</span> You must arrive 15 minutes before your time slot. Have your original ID and relevant supporting documents ready. Use the AI Concierge tab to verify your documents before you go.
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center p-12 bg-slate-900/20 border border-dashed border-white/5 rounded-3xl opacity-40">
                    <Building2 className="w-16 h-16 mb-4" />
                    <p>Select a government office to see available slots</p>
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
              <div className="bg-slate-900/50 border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[700px]">
                <div className="p-8 border-b border-white/5 bg-indigo-600/5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center">
                      <Zap className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-xl">QueueLess Concierge AI</h3>
                      <p className="text-xs text-indigo-400 uppercase tracking-widest font-black">Document Assistant</p>
                    </div>
                  </div>
                  <div className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-3 py-1 rounded-full border border-emerald-500/20 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Online - Fast
                  </div>
                </div>

                <div className="flex-1 p-8 overflow-y-auto space-y-6 bg-[rgba(10,10,14,0.3)]">
                  <div className="flex gap-4 max-w-[80%]">
                    <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center shrink-0">
                      <Zap className="w-4 h-4 text-white" />
                    </div>
                    <div className="p-5 bg-slate-900 rounded-3xl rounded-tl-none border border-white/5 text-sm leading-relaxed text-slate-200 shadow-xl">
                      Hello! I'm your QueueLess AI assistant. I help you gather exactly what you need for your government visit so you never get turned away. 🇿🇦
                      <br /><br />
                      What are you applying for today? (e.g. "Smart ID", "Passport", "SASSA Grant")
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-8">
                    {["Smart ID Checklist", "Passport Requirements", "SASSA Grant Documents", "Renewal Process"].map(tip => (
                      <button key={tip} className="px-5 py-2.5 rounded-full bg-slate-800/50 hover:bg-indigo-600/20 border border-white/5 hover:border-indigo-500/30 text-xs transition-all">
                        {tip}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-6 border-t border-white/5 bg-slate-900/50">
                  <div className="flex gap-4">
                    <button className="p-4 bg-slate-800 hover:bg-slate-700 rounded-2xl text-slate-400 transition-colors">
                      <FileText className="w-5 h-5" />
                    </button>
                    <input className="flex-1 bg-slate-950 border border-white/5 rounded-2xl px-6 py-4 outline-none focus:border-indigo-500 transition-all font-medium text-sm" placeholder="Ask about DHA requirements..." />
                    <button className="p-4 bg-indigo-600 hover:bg-indigo-500 rounded-2xl text-white shadow-lg shadow-indigo-600/20 transition-all">
                      <ArrowRight className="w-5 h-5" />
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
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
               <div className="mb-8">
                <h2 className="text-2xl font-bold">My QueueLess Appointments</h2>
                <p className="text-slate-400">View and manage your upcoming government visits.</p>
              </div>

              {bookings.length === 0 ? (
                <div className="text-center py-20 bg-slate-900/20 rounded-3xl border border-dashed border-white/5">
                  <Calendar className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-slate-500 italic">No appointments booked yet</h3>
                  <button onClick={() => setActiveTab("book")} className="mt-6 text-indigo-400 hover:underline font-bold">Book your first visit now</button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {bookings.map(booking => (
                    <div key={booking.id} className="bg-slate-900/40 border border-white/5 p-6 rounded-3xl relative overflow-hidden group">
                      <div className="flex justify-between items-start mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                          <CheckCircle className="w-6 h-6" />
                        </div>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${booking.status === 'confirmed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                          {booking.status}
                        </span>
                      </div>
                      
                      <h4 className="font-bold text-lg mb-1">{booking.service_type}</h4>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mb-6">
                        <Building2 className="w-3 h-3" />
                        <span>{booking.office.name}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/5">
                        <div className="space-y-1">
                          <p className="text-[10px] uppercase font-black text-slate-600 tracking-tighter">Date</p>
                          <p className="text-xs font-bold text-slate-200">{format(new Date(booking.time_slot.start_time), 'PPP')}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] uppercase font-black text-slate-600 tracking-tighter">Time</p>
                          <p className="text-xs font-bold text-slate-200">{format(new Date(booking.time_slot.start_time), 'HH:mm')}</p>
                        </div>
                      </div>
                      
                      <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl" />
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
