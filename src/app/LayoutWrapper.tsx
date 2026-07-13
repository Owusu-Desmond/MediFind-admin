"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAdmin } from "@/context/AdminContext";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { ShieldCheck } from "lucide-react";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const { admin } = useAdmin();
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  const authRoutes = ["/"];
  const isAuthRoute = authRoutes.includes(pathname);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!admin && !isAuthRoute) router.replace("/");
    else if (admin && isAuthRoute) router.replace("/dashboard");
  }, [admin, pathname, router, mounted, isAuthRoute]);

  if (!mounted) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <ShieldCheck className="h-10 w-10 text-primary animate-pulse" />
          <p className="text-sm font-semibold text-slate-500">Loading Admin Console...</p>
        </div>
      </div>
    );
  }

  if (!admin && !isAuthRoute) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isAuthRoute) return <>{children}</>;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-8">{children}</main>
      </div>
    </div>
  );
}
