"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAdmin } from "@/context/AdminContext";
import { ShieldCheck, Mail, Lock, ArrowRight } from "lucide-react";

export default function AdminLoginPage() {
  const { login } = useAdmin();
  const router = useRouter();
  const [email, setEmail] = useState("justice.admin@medifind.com");
  const [password, setPassword] = useState("admin123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) { setError("All fields are required."); return; }
    setLoading(true);
    setTimeout(() => {
      login(email);
      setLoading(false);
      router.push("/dashboard");
    }, 1000);
  };

  return (
    <div className="min-h-screen w-screen bg-slate-950 flex items-stretch overflow-hidden">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-[42%] relative flex-col items-center justify-center px-12 py-16 select-none overflow-hidden">
        {/* Radial glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(20,184,166,0.15)_0%,_transparent_70%)]" />
        {/* Dot grid */}
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:28px_28px]" />

        <div className="relative z-10 space-y-8 max-w-sm w-full">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-500 flex items-center justify-center text-slate-900 shadow-xl shadow-teal-500/25">
              <ShieldCheck size={26} className="stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">MediFind</h1>
              <p className="text-xs font-bold text-teal-500 uppercase tracking-widest">Admin Console</p>
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-3xl font-black text-white leading-tight tracking-tight">
              National Health Platform Control Center
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Verify pharmacy registrations, manage platform users, and monitor prescription reservation activity across Ghana.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Registered Pharmacies", value: "450+" },
              { label: "Active Users", value: "32k+" },
              { label: "Daily Reservations", value: "1.2k+" },
              { label: "Pending Reviews", value: "12" },
            ].map((s) => (
              <div key={s.label} className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <p className="text-xl font-black text-teal-400">{s.value}</p>
                <p className="text-[11px] font-semibold text-slate-400 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Login Form */}
      <div className="flex-1 bg-white flex flex-col justify-center px-8 sm:px-16 lg:px-20 py-12">
        <div className="w-full max-w-md mx-auto">
          {/* Mobile Logo */}
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-teal-400">
              <ShieldCheck size={22} className="stroke-[2.5]" />
            </div>
            <span className="font-black text-xl text-slate-900 tracking-tight">MediFind Admin</span>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Administrator Sign In</h2>
            <p className="text-slate-400 text-sm mt-1.5 font-semibold">
              Restricted access — authorized Ministry of Health personnel only.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-700">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Admin Email Address
              </label>
              <div className="relative">
                <Mail size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@medifind.com"
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-slate-50/50 transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-slate-50/50 transition-all"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-slate-900/20 transition-all duration-200 flex items-center justify-center gap-2 text-sm disabled:opacity-70 mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Access Admin Console
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-slate-400 font-semibold leading-relaxed">
            This portal is reserved for authorized users of the<br />
            <span className="text-slate-700">Ghana Ministry of Health & MediFind Operations Team.</span>
          </p>
        </div>
      </div>
    </div>
  );
}
