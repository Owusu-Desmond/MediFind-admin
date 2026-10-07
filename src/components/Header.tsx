"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchAdminNotifications,
  markNotificationReadAsync,
  markAllNotificationsReadAsync,
} from "@/store/slices/notificationsSlice";
import { Bell, Check, Search, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function Header() {
  const { data: session } = useSession();
  const dispatch = useAppDispatch();
  const notifications = useAppSelector((state) => state.notifications.items);
  const unreadCount = useAppSelector((state) => state.notifications.unreadCount);
  const [showNotifications, setShowNotifications] = useState(false);

  const adminName = session?.user?.name || "System Admin";

  useEffect(() => {
    dispatch(fetchAdminNotifications());

    const interval = setInterval(() => {
      dispatch(fetchAdminNotifications());
    }, 25000);

    return () => clearInterval(interval);
  }, [dispatch]);

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
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
              <div className="absolute right-0 mt-3 w-96 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 py-3 animate-in fade-in-50 slide-in-from-top-2 duration-150">
                <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-slate-800">Admin Notifications</h3>
                    {unreadCount > 0 && (
                      <span className="text-[10px] bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full font-bold">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={() => dispatch(markAllNotificationsReadAsync())}
                      className="text-xs font-semibold text-primary hover:underline"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto mt-2 divide-y divide-slate-50">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-xs">
                      No admin notifications yet
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`px-4 py-3 flex gap-3 hover:bg-slate-50 transition-colors relative ${
                          !n.read ? "bg-teal-50/20" : ""
                        }`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-bold text-xs text-slate-800">{n.title}</span>
                            <span className="text-[10px] text-slate-400 shrink-0">{n.time}</span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{n.message}</p>
                          {n.actionUrl && (
                            <Link
                              href={n.actionUrl}
                              onClick={() => {
                                dispatch(markNotificationReadAsync(n.id));
                                setShowNotifications(false);
                              }}
                              className="text-[11px] font-bold text-teal-700 hover:underline mt-1.5 inline-flex items-center gap-1"
                            >
                              Take Action <ExternalLink size={10} />
                            </Link>
                          )}
                        </div>
                        {!n.read && (
                          <button
                            onClick={() => dispatch(markNotificationReadAsync(n.id))}
                            title="Mark as read"
                            className="w-6 h-6 rounded-full hover:bg-slate-200 flex items-center justify-center text-primary shrink-0 self-center"
                          >
                            <Check size={14} className="stroke-[2.5]" />
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="w-px h-8 bg-slate-200" />

        {/* Admin Avatar */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-bold text-slate-800">{adminName.split(" ")[0]}</p>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
              {session?.user?.role || "System Admin"}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-teal-400 flex items-center justify-center font-bold text-md border border-slate-800 shadow-inner">
            {adminName.charAt(0)}
          </div>
        </div>
      </div>
    </header>
  );
}
