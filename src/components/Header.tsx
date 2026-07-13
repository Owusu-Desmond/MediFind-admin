"use client";

import React, { useState } from "react";
import { useAdmin } from "@/context/AdminContext";
import { Bell, Check, Search } from "lucide-react";

export default function Header() {
  const { admin, notifications, markNotificationRead } = useAdmin();
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="h-20 bg-white border-b border-slate-200/80 px-8 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      {/* Search */}
      <div className="relative w-80">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search size={17} className="text-slate-400" />
        </span>
        <input
          type="text"
          placeholder="Search users, pharmacies, licenses..."
          className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm transition-all"
        />
      </div>

      {/* Right side */}
      <div className="flex items-center gap-5">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-10 h-10 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors relative"
          >
            <Bell size={19} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
              <div className="absolute right-0 mt-3 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 py-3">
                <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="font-bold text-sm text-slate-800">Admin Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="text-xs font-semibold text-primary">{unreadCount} new</span>
                  )}
                </div>
                <div className="max-h-72 overflow-y-auto mt-1">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`px-4 py-3 flex gap-3 hover:bg-slate-50 transition-colors ${!n.read ? "bg-teal-50/20" : ""}`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-bold text-xs text-slate-800">{n.title}</span>
                          <span className="text-[10px] text-slate-400 shrink-0">{n.time}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{n.message}</p>
                      </div>
                      {!n.read && (
                        <button
                          onClick={() => markNotificationRead(n.id)}
                          className="w-5 h-5 rounded-full hover:bg-slate-200 flex items-center justify-center text-primary shrink-0 self-center"
                        >
                          <Check size={13} className="stroke-[2.5]" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="w-px h-8 bg-slate-200" />

        {/* Admin Avatar */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-bold text-slate-800">{admin?.name?.split(" ")[0]}</p>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">System Admin</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-teal-400 flex items-center justify-center font-bold text-md border border-slate-800 shadow-inner">
            {admin?.name?.charAt(0) ?? "A"}
          </div>
        </div>
      </div>
    </header>
  );
}
