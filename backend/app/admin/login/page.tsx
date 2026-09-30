"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, ArrowRight, ShieldCheck, AlertCircle } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || "Invalid administrator credentials");
        setLoading(false);
        return;
      }

      // Successful login - redirect to admin dashboard
      router.push("/admin");
    } catch {
      setError("Network error. Please check your backend connection.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07070e] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#e50914]/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#e50914]/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md bg-[#0f101c] border border-white/10 rounded-3xl p-8 shadow-2xl relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <img
              src="/logo.jpg"
              alt="Movies.snishad"
              className="w-16 h-16 rounded-2xl object-cover ring-2 ring-white/10 shadow-xl shadow-red-950/40"
            />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white uppercase">
            Movies.<span className="text-[#e50914]">snishad</span>
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            System &amp; Media Administrative Console
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-rose-300 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
          <div>
            <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
              Administrator Email
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="off"
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:border-[#e50914] focus:ring-1 focus:ring-[#e50914] transition-all text-sm"
                placeholder="Enter admin email address"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
              Secret Password
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:border-[#e50914] focus:ring-1 focus:ring-[#e50914] transition-all text-sm"
                placeholder="Enter admin password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-3 py-3.5 px-4 rounded-xl bg-[#e50914] hover:bg-[#ff1f2d] text-white font-bold text-sm transition-all shadow-lg shadow-[#e50914]/25 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Sign In Securely</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/10 text-center text-xs text-neutral-500">
          Protected with SHA-256 JWT, Rate-Limiting &amp; IP Lockout
        </div>
      </div>
    </div>
  );
}
