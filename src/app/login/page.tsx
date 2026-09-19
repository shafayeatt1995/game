"use client";

import React, { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Gamepad2, Lock, Mail, ArrowRight, AlertCircle, CheckCircle2, Shield } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/admin/arcad";


  const [email, setEmail] = useState("shafayetalanik@gmail.com");
  const [password, setPassword] = useState("123456");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
        callbackUrl,
      });

      if (res?.error) {
        setError("Invalid email or password. Please check your credentials.");
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-4 sm:px-6 relative overflow-hidden font-sans select-none">
      {/* Background ambient lighting */}
      <div className="absolute w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none -top-24 -left-24" />
      <div className="absolute w-96 h-96 bg-violet-600/15 rounded-full blur-3xl pointer-events-none -bottom-24 -right-24" />

      {/* Top Brand */}
      <Link href="/" className="flex items-center gap-3 mb-8 group z-10">
        <div className="h-11 w-11 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center shadow-lg shadow-indigo-500/10 group-hover:scale-105 transition-transform">
          <Gamepad2 className="h-6 w-6 text-indigo-400" />
        </div>
        <div>
          <span className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            PlaySphere <span className="text-indigo-400">Auth</span>
          </span>
          <p className="text-[11px] text-zinc-400">Secure Retro Gaming Portal</p>
        </div>
      </Link>

      {/* Login Card */}
      <div className="w-full max-w-md bg-zinc-900/80 border border-zinc-800 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/50 z-10 relative">
        <div className="mb-6 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-3">
            <Shield className="h-3.5 w-3.5 text-indigo-400" />
            NextAuth Credentials
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Sign In to Dashboard</h2>
          <p className="text-xs text-zinc-400 mt-1">
            Access game management, admin controls, and custom ROMs
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-start gap-2.5">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-950/80 border border-zinc-800 rounded-xl text-white text-xs placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-950/80 border border-zinc-800 rounded-xl text-white text-xs placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
              />
            </div>
          </div>

          {/* Quick preset hint */}
          <div className="p-3 bg-zinc-950/50 rounded-2xl border border-zinc-800/80 text-[11px] text-zinc-400 space-y-1">
            <div className="font-semibold text-zinc-300 flex items-center gap-1.5">
              <CheckCircle2 className="h-3 w-3 text-indigo-400" />
              Database Configured User:
            </div>
            <div>Email: <span className="text-indigo-300 font-mono">shafayetalanik@gmail.com</span></div>
            <div>Password: <span className="text-indigo-300 font-mono">123456</span></div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs tracking-wide shadow-md shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer mt-2"
          >
            {loading ? (
              <span>Signing In...</span>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-zinc-800/80 text-center">
          <Link
            href="/"
            className="text-xs text-zinc-400 hover:text-indigo-400 transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}

