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
    setEmail("demo@verifyza.co.za");
    setPassword("Demo@1234");
  };

  useEffect(() => {
    if (!loading && user) router.push("/chat");
  }, [user, loading, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (mode === "login") {
        await login(email, password);
        toast.success("Welcome back!");
      } else {
        await register(email, fullName, password);
        toast.success("Account created!");
      }
      router.push("/chat");
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
        <Loader2 className="w-8 h-8 animate-spin text-za-green" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      {/* Logo */}
      <Link href="/" className="flex items-center justify-center gap-2 mb-8">
        <div className="w-10 h-10 rounded-xl bg-gradient-za flex items-center justify-center text-white font-bold">
          VZ
        </div>
        <span className="text-xl font-bold">VerifyZA</span>
      </Link>

      <div className="card">
        {/* Demo login banner */}
        <button
          onClick={fillDemoCredentials}
          className="w-full mb-5 flex items-center gap-3 p-3 rounded-xl bg-za-green/10 border border-za-green/25 hover:bg-za-green/15 transition-colors text-left group"
        >
          <span className="shrink-0 text-lg">🔬</span>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-za-green">Try Demo Account</p>
            <p className="text-[10px] text-[var(--color-muted)] truncate">
              demo@verifyza.co.za · Demo@1234
            </p>
          </div>
          <span className="text-[10px] font-bold text-za-green opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            Fill →
          </span>
        </button>

        <div className="mb-6">
          <h1 className="text-2xl font-bold">
            {mode === "login" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="text-sm text-[var(--color-muted)] mt-1">
            {mode === "login"
              ? "Sign in to access your compliance dashboard"
              : "Join the South African AI verification platform"}
          </p>
        </div>

        {/* Mode tabs */}
        <div className="flex bg-surface-2 rounded-xl p-1 mb-6">
          {(["login", "register"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setMode(tab)}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                mode === tab
                  ? "bg-surface-3 text-white"
                  : "text-[var(--color-muted)] hover:text-white"
              }`}
            >
              {tab === "login" ? "Login" : "Register"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <div>
              <label className="block text-xs font-semibold text-[var(--color-muted)] mb-1.5 uppercase tracking-wide">
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                className="input-field"
                placeholder="Sipho Dlamini"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[var(--color-muted)] mb-1.5 uppercase tracking-wide">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              className="input-field"
              placeholder="sipho@example.co.za"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--color-muted)] mb-1.5 uppercase tracking-wide">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPass ? "text" : "password"}
                className="input-field pr-12"
                placeholder={mode === "register" ? "Min 8 chars, 1 uppercase, 1 number" : "••••••••"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPass((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)] hover:text-white"
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            id="submit-btn"
            type="submit"
            disabled={submitting}
            className="btn-primary w-full py-3 text-base mt-2"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ShieldCheck className="w-4 h-4" />
            )}
            {mode === "login" ? "Sign In" : "Create Account"}
          </button>
        </form>

        <div className="mt-4 text-center text-xs text-[var(--color-muted)]">
          {mode === "login" ? (
            <>
              Don&apos;t have an account?{" "}
              <button
                onClick={() => setMode("register")}
                className="text-za-green hover:underline font-semibold"
              >
                Register free
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                onClick={() => setMode("login")}
                className="text-za-green hover:underline font-semibold"
              >
                Sign in
              </button>
            </>
          )}
        </div>
      </div>

      <p className="text-center text-xs text-[var(--color-muted)] mt-6">
        By continuing, you agree to our Terms of Service.
        <br />
        <Link href="/" className="hover:text-white transition-colors">
          ← Back to home
        </Link>
      </p>
    </div>
  );
}

export default function AuthPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12">
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-za-green" />
        </div>
      }>
        <AuthForm />
      </Suspense>
    </main>
  );
}
