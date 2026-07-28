"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useAppDispatch } from "@/store/hooks";
import { fetchPharmacies } from "@/store/slices/pharmaciesSlice";
import { fetchUsers } from "@/store/slices/usersSlice";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { ShieldCheck } from "lucide-react";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  const authRoutes = ["/"];
  const isAuthRoute = authRoutes.includes(pathname);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || status === "loading") return;

    if (status === "unauthenticated" && !isAuthRoute) {
      router.replace("/");
    } else if (status === "authenticated" && isAuthRoute) {
      router.replace("/dashboard");
    }
  }, [status, pathname, router, mounted, isAuthRoute]);

  // Fetch initial data when authenticated
  useEffect(() => {
    if (status === "authenticated") {
      dispatch(fetchPharmacies());
      dispatch(fetchUsers());
    }
  }, [status, dispatch]);

  if (!mounted || status === "loading") {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <ShieldCheck className="h-10 w-10 text-primary animate-pulse" />
          <p className="text-sm font-semibold text-slate-500">Loading Admin Console...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated" && !isAuthRoute) {
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
