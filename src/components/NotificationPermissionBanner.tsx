"use client";

import React, { useState, useEffect } from "react";
import { Bell, BellRing } from "lucide-react";
import { adminBrowserNotifications } from "@/utils/browserNotifications";

export default function AdminNotificationPermissionBanner() {
  const [permission, setPermission] = useState<NotificationPermission>("default");

  useEffect(() => {
    setPermission(adminBrowserNotifications.getPermissionStatus());
  }, []);

  if (permission === "granted") {
    return null;
  }

  if (permission === "denied") {
    return null;
  }

  const handleRequest = async () => {
    const res = await adminBrowserNotifications.requestPermission();
    setPermission(res);
    if (res === "granted") {
      adminBrowserNotifications.showNotification("MediFind Admin Alerts Enabled", {
        body: "You will receive instant alerts for pharmacy registrations, flags, and critical system events.",
        sound: true,
        soundType: "info",
      });
    }
  };

  return (
    <div className="mb-6 bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-teal-800 text-white flex items-center justify-center shrink-0 shadow-sm">
          <BellRing size={18} className="animate-pulse" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-teal-950 uppercase tracking-wide">
            Enable Live Admin System Alerts
          </h4>
          <p className="text-xs text-slate-600 mt-0.5">
            Receive desktop notifications when pharmacies register or need approval.
          </p>
        </div>
      </div>
      <button
        onClick={handleRequest}
        className="px-3.5 py-1.5 bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold rounded-xl shadow transition-all shrink-0 flex items-center gap-1.5"
      >
        <Bell size={13} /> Enable Notifications
      </button>
    </div>
  );
}
