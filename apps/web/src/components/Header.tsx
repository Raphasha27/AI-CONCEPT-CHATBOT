"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { 
  LayoutDashboard, 
  MessageSquare, 
  ShieldCheck, 
  LogOut, 
  User as UserIcon,
  ChevronDown,
  Compass,
  Store,
  Clock
} from "lucide-react";
import { useState } from "react";

export default function Header() {
  const { user, logout, isAdmin } = useAuth();
  const pathname = usePathname();
  const [profileOpen, setProfileOpen] = useState(false);

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "QueueLess AI", href: "/queueless", icon: Clock },
    { label: "Civic Navigator", href: "/navigator", icon: Compass },
    { label: "SpazaAI", href: "/spaza", icon: Store },
    { label: "Chat & Verify", href: "/chat", icon: MessageSquare },
    { label: "Report Generator", href: "/report", icon: ShieldCheck },
  ];

  if (isAdmin) {
    navItems.push({ label: "Admin Panel", href: "/admin", icon: ShieldCheck });
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/60 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500 shadow-lg shadow-indigo-500/20 transition-transform group-hover:scale-105">
              <ShieldAlert className="text-white" size={24} />
            </div>
            <span className="text-xl font-black tracking-tight text-white uppercase">Civic<span className="text-indigo-500">OS</span></span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive 
                      ? "bg-surface-2 text-white" 
                      : "text-[var(--color-muted)] hover:text-white hover:bg-surface-2/50"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="relative">
          <button 
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 p-1.5 pl-3 rounded-full bg-surface-2 border border-surface-border hover:border-za-green/30 transition-all"
          >
            <div className="flex flex-col items-end mr-1 hidden sm:flex">
              <span className="text-xs font-bold text-white leading-none mb-0.5">{user?.full_name}</span>
              <span className="text-[10px] text-[var(--color-muted)] leading-none uppercase tracking-wider">{user?.role}</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-za-green/20 text-za-green flex items-center justify-center border border-za-green/20">
              <UserIcon className="w-4 h-4" />
            </div>
            <ChevronDown className="w-3 h-3 text-[var(--color-muted)] mr-1" />
          </button>

          {profileOpen && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setProfileOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-48 rounded-xl bg-surface-2 border border-surface-border p-1 shadow-2xl z-20 animate-fade-in">
                <div className="px-3 py-2 mb-1 border-b border-surface-border sm:hidden">
                  <p className="text-xs font-bold text-white">{user?.full_name}</p>
                  <p className="text-[10px] text-[var(--color-muted)] uppercase">{user?.role}</p>
                </div>
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex md:hidden items-center gap-2 px-3 py-2 rounded-lg text-sm text-[var(--color-muted)] hover:text-white hover:bg-surface-3 transition-colors"
                    onClick={() => setProfileOpen(false)}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                ))}
                <button
                  onClick={() => {
                    logout();
                    setProfileOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
