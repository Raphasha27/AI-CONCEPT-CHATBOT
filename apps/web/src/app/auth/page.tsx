"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import toast from "react-hot-toast";

function AuthForm() {
  const { login, register, user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [mode, setMode] = useState<"login" | "register">(
    searchParams.get("mode") === "register" ? "register" : "login"
  );
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fillDemoCredentials = () => {
    setMode("login");
    setEmail("demo@sizweos.co.za");
    setPassword("Demo@1234");
  };

  useEffect(() => {
    if (!loading && user) router.push("/navigator");
  }, [user, loading, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (mode === "login") {
        await login(email, password);
        toast.success("Welcome back to SizweOS!");
      } else {
        await register(email, fullName, password);
        toast.success("Welcome to the SizweOS Network!");
      }
      router.push("/navigator");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        "Something went wrong";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      {/* Logo */}
      <Link href="/" className="flex items-center justify-center gap-2 mb-8 group">
        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold group-hover:scale-105 transition-transform">
          SZ
        </div>
        <span className="text-xl font-bold tracking-tight text-white uppercase">Sizwe<span className="text-blue-500">OS</span></span>
      </Link>

      <div className="card border-white/5 bg-[#111827]/50 backdrop-blur-xl">
        {/* Demo login banner */}
        <button
          onClick={fillDemoCredentials}
          className="w-full mb-5 flex items-center gap-3 p-3 rounded-xl bg-blue-500/10 border border-blue-500/25 hover:bg-blue-500/15 transition-colors text-left group"
        >
          <span className="shrink-0 text-lg">🔬</span>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-blue-500 uppercase tracking-widest">Sovereign Demo Account</p>
            <p className="text-[10px] text-slate-500 truncate mt-0.5">
              demo@sizweos.co.za · Demo@1234
            </p>
          </div>
          <span className="text-[10px] font-bold text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            Fill →
          </span>
        </button>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white tracking-tight">
            {mode === "login" ? "Identity Login" : "Initialize Access"}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {mode === "login"
              ? "Access the SizweOS National Intelligence Cockpit"
              : "Register your identity on the national intelligence network"}
          </p>
        </div>

        {/* Mode tabs */}
        <div className="flex bg-[#07090e] rounded-xl p-1 mb-6 border border-white/5">
          {(["login", "register"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setMode(tab)}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                mode === tab
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/10"
                  : "text-slate-500 hover:text-white"
              }`}
            >
              {tab === "login" ? "Login" : "Register"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-widest">
                Full Identity Name
              </label>
              <input
                id="fullName"
                type="text"
                className="w-full bg-[#07090e] border border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="Sipho Dlamini"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
          )}

          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-widest">
              Secure Email Address
            </label>
            <input
              id="email"
              type="email"
              className="w-full bg-[#07090e] border border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="sipho@sizweos.co.za"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide">
              Security Credential
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPass ? "text" : "password"}
                className="w-full bg-[#07090e] border border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors pr-12"
                placeholder={mode === "register" ? "Min 8 chars, 1 uppercase, 1 number" : "••••••••"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPass((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            id="submit-btn"
            type="submit"
            disabled={submitting}
            className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 mt-2"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ShieldCheck className="w-4 h-4" />
            )}
            {mode === "login" ? "Enter SizweOS" : "Authorize Access"}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-500 font-medium">
          {mode === "login" ? (
            <>
              New to the intelligence network?{" "}
              <button
                onClick={() => setMode("register")}
                className="text-blue-500 hover:underline font-bold"
              >
                Authorise identity
              </button>
            </>
          ) : (
            <>
              Already authorized?{" "}
              <button
                onClick={() => setMode("login")}
                className="text-blue-500 hover:underline font-bold"
              >
                Enter Cockpit
              </button>
            </>
          )}
        </div>
      </div>

      <p className="text-center text-xs text-slate-600 mt-8 font-medium">
        By continuing, you agree to National Sovereign Guidelines.
        <br />
        <Link href="/" className="hover:text-white transition-colors mt-2 inline-block">
          ← Back to Network Root
        </Link>
      </p>
    </div>
  );
}

export default function AuthPage() {
  return (
    <main className="min-h-screen bg-[#07090e] flex items-center justify-center px-4 py-12">
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      }>
        <AuthForm />
      </Suspense>
    </main>
  );
}
