"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Users,
  Building2,
  LogOut,
  ShieldCheck,
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const navItems = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "User Management", href: "/users", icon: Users },
    { name: "Pharmacy Registry", href: "/pharmacies", icon: Building2 },
  ];

  const adminName = session?.user?.name || "MediFind Admin";
  const adminEmail = session?.user?.email || "admin@medifind.com";

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col min-h-screen border-r border-slate-800 shadow-xl select-none">
      {/* Brand Header */}
      <div className="h-20 flex items-center px-6 gap-3 border-b border-slate-800">
        <div className="w-10 h-10 rounded-xl bg-teal-500 flex items-center justify-center text-slate-900 shadow-md shadow-teal-500/20">
          <ShieldCheck size={22} className="stroke-[2.5]" />
        </div>
        <div>
          <h1 className="font-extrabold text-lg tracking-tight">MediFind</h1>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Admin Console</span>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-4 py-6 space-y-1.5">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative ${
                isActive
                  ? "bg-teal-500/15 text-teal-400 border border-teal-500/20"
                  : "text-slate-400 hover:bg-slate-800/60 hover:text-white border border-transparent"
              }`}
            >
              <item.icon
                size={18}
                className={`transition-transform duration-200 group-hover:scale-110 ${isActive ? "text-teal-400" : "text-slate-500"}`}
              />
              <span className="font-semibold text-[15px]">{item.name}</span>
              {isActive && (
                <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-teal-400" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer: Admin Info & Logout */}
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="w-8 h-8 rounded-full bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400 font-bold text-sm">
            {adminName.charAt(0)}
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-slate-300 truncate">{adminName}</p>
            <p className="text-[11px] text-slate-500 truncate">{adminEmail}</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-400 hover:bg-red-950/30 hover:text-red-400 border border-transparent hover:border-red-900/30 transition-all duration-200"
        >
          <LogOut size={16} />
          <span className="font-semibold text-[14px]">Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
