"use client";

import React from "react";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { approvePharmacy, suspendPharmacy } from "@/store/slices/pharmaciesSlice";
import { addNotification } from "@/store/slices/notificationsSlice";
import {
  Building2,
  Users,
  Clock,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Check,
  X,
} from "lucide-react";

export default function AdminDashboardPage() {
  const dispatch = useAppDispatch();
  const pharmacies = useAppSelector((state) => state.pharmacies.items);
  const users = useAppSelector((state) => state.users.items);
  const pharmaciesLoading = useAppSelector((state) => state.pharmacies.loading);

  const approvedCount = pharmacies.filter((p) => p.status === "Approved").length;
  const pendingCount = pharmacies.filter((p) => p.status === "Pending Approval").length;
  const suspendedCount = pharmacies.filter((p) => p.status === "Suspended").length;
  const activeUsers = users.filter((u) => u.status === "Active").length;

  const pendingPharmacies = pharmacies.filter((p) => p.status === "Pending Approval");

  const handleApprove = (id: string, name: string) => {
    dispatch(approvePharmacy(id));
    dispatch(
      addNotification({
        title: "Pharmacy Approved",
        message: `${name} has been verified and registered on the network.`,
        type: "success",
      })
    );
  };

  const handleSuspend = (id: string, name: string) => {
    dispatch(suspendPharmacy(id));
    dispatch(
      addNotification({
        title: "Pharmacy Suspended",
        message: `${name} status was updated to Suspended.`,
        type: "warning",
      })
    );
  };

  // Weekly chart mock data
  const chartData = [
    { day: "Mon", approved: 2, pending: 4 },
    { day: "Tue", approved: 5, pending: 2 },
    { day: "Wed", approved: 3, pending: 6 },
    { day: "Thu", approved: 7, pending: 1 },
    { day: "Fri", approved: 4, pending: 3 },
    { day: "Sat", approved: 6, pending: 2 },
    { day: "Sun", approved: 2, pending: 1 },
  ];
  const maxVal = Math.max(...chartData.flatMap((d) => [d.approved, d.pending]));
  const chartH = 160;
  const chartW = 500;
  const pad = 30;
  const barW = 18;
  const spacing = (chartW - pad * 2) / chartData.length;

  const totalPh = pharmacies.length || 1;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Platform Overview</h2>
          <p className="text-xs text-slate-400 mt-0.5">Real-time metrics for the MediFind Ghana Health Network</p>
        </div>
        {pendingCount > 0 && (
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 px-4 py-2.5 rounded-xl text-xs font-bold">
            <AlertTriangle size={14} />
            {pendingCount} pharmacies awaiting approval
          </div>
        )}
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-primary flex items-center justify-center">
            <Building2 size={22} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Approved Pharmacies</p>
            <p className="text-2xl font-black text-slate-800 mt-1">{approvedCount}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock size={22} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Reviews</p>
            <p className="text-2xl font-black text-slate-800 mt-1">{pendingCount}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Users size={22} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Users</p>
            <p className="text-2xl font-black text-slate-800 mt-1">{activeUsers}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertTriangle size={22} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Suspended</p>
            <p className="text-2xl font-black text-slate-800 mt-1">{suspendedCount}</p>
          </div>
        </div>
      </div>

      {/* Chart + pending approvals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Bar Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-slate-800">Pharmacy Approval Activity</h3>
              <p className="text-xs text-slate-400 mt-0.5">Weekly breakdown — approvals vs. pending applications</p>
            </div>
            <div className="flex items-center gap-4 text-[11px] font-bold">
              <span className="flex items-center gap-1.5 text-teal-700"><span className="w-2.5 h-2.5 rounded-sm bg-teal-500 inline-block" /> Approved</span>
              <span className="flex items-center gap-1.5 text-amber-700"><span className="w-2.5 h-2.5 rounded-sm bg-amber-400 inline-block" /> Pending</span>
            </div>
          </div>

          <div className="w-full overflow-x-auto pt-2">
            <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full h-auto overflow-visible">
              {/* Grid lines */}
              <line x1={pad} y1={pad} x2={chartW - pad} y2={pad} stroke="#f1f5f9" strokeWidth={1} />
              <line x1={pad} y1={chartH / 2} x2={chartW - pad} y2={chartH / 2} stroke="#f1f5f9" strokeWidth={1} />
              <line x1={pad} y1={chartH - pad} x2={chartW - pad} y2={chartH - pad} stroke="#e2e8f0" strokeWidth={1.5} />

              {chartData.map((d, i) => {
                const x = pad + i * spacing + spacing / 2;
                const approvedH = (d.approved / maxVal) * (chartH - pad * 2);
                const pendingH = (d.pending / maxVal) * (chartH - pad * 2);
                const approvedY = chartH - pad - approvedH;
                const pendingY = chartH - pad - pendingH;

                return (
                  <g key={d.day}>
                    {/* Approved bar */}
                    <rect
                      x={x - barW - 2}
                      y={approvedY}
                      width={barW}
                      height={approvedH}
                      rx="4"
                      className="fill-teal-500 opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
                    />
                    {/* Pending bar */}
                    <rect
                      x={x + 2}
                      y={pendingY}
                      width={barW}
                      height={pendingH}
                      rx="4"
                      className="fill-amber-400 opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
                    />
                    {/* Day label */}
                    <text x={x} y={chartH - 10} textAnchor="middle" className="text-[10px] fill-slate-400 font-semibold">
                      {d.day}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Pharmacy Status Summary */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-slate-800">Registry Summary</h3>
            <Link href="/pharmacies" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
              View All <ArrowRight size={12} />
            </Link>
          </div>

          <div className="space-y-3">
            {[
              { label: "Approved", count: approvedCount, color: "bg-teal-500" },
              { label: "Pending", count: pendingCount, color: "bg-amber-400" },
              { label: "Suspended", count: suspendedCount, color: "bg-rose-500" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                  <span className="text-sm font-semibold text-slate-700">{item.label}</span>
                </div>
                <span className="text-sm font-black text-slate-800">{item.count}</span>
              </div>
            ))}

            {/* Progress bar */}
            <div className="mt-3 w-full h-2 bg-slate-100 rounded-full overflow-hidden flex">
              <div className="bg-teal-500 h-full" style={{ width: `${(approvedCount / totalPh) * 100}%` }} />
              <div className="bg-amber-400 h-full" style={{ width: `${(pendingCount / totalPh) * 100}%` }} />
              <div className="bg-rose-500 h-full" style={{ width: `${(suspendedCount / totalPh) * 100}%` }} />
            </div>
            <p className="text-[10px] text-slate-400 font-semibold text-center">
              {pharmacies.length} total registered branches
            </p>
          </div>
        </div>
      </div>

      {/* Pending Approvals Quick Action Table */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-extrabold text-slate-800">Pending Pharmacy Applications</h3>
            <p className="text-xs text-slate-400 mt-0.5">Review and approve or reject new pharmacy registrations</p>
          </div>
          <Link href="/pharmacies" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
            Full Registry <ArrowRight size={12} />
          </Link>
        </div>

        {pharmaciesLoading ? (
          <div className="text-center py-12 flex flex-col items-center gap-2 text-slate-400">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-semibold">Loading data from backend...</p>
          </div>
        ) : pendingPharmacies.length === 0 ? (
          <div className="text-center py-12 flex flex-col items-center gap-2 text-slate-400">
            <CheckCircle size={32} className="text-emerald-400 stroke-[1.5]" />
            <p className="text-sm font-semibold">All applications are resolved!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                  <th className="py-3 px-4">Pharmacy Branch</th>
                  <th className="py-3 px-4">License No.</th>
                  <th className="py-3 px-4">Pharmacist-in-Charge</th>
                  <th className="py-3 px-4">Date Submitted</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingPharmacies.map((phr) => (
                  <tr key={phr.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors text-sm">
                    <td className="py-4 px-4">
                      <p className="font-bold text-slate-800">{phr.name}</p>
                      <p className="text-[11px] text-slate-400">{phr.location.split(",")[0]}</p>
                    </td>
                    <td className="py-4 px-4 font-mono text-xs text-slate-600">{phr.licenseNumber}</td>
                    <td className="py-4 px-4 text-slate-600 font-semibold">{phr.pharmacistName}</td>
                    <td className="py-4 px-4 text-slate-500 text-xs">{phr.dateSubmitted}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleApprove(phr.id, phr.name)}
                          title="Approve"
                          className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white flex items-center justify-center transition-all border border-emerald-100"
                        >
                          <Check size={15} className="stroke-[2.5]" />
                        </button>
                        <Link
                          href={`/pharmacies/${phr.id}`}
                          title="Review Details"
                          className="w-8 h-8 rounded-lg bg-slate-50 text-slate-600 hover:bg-slate-200 flex items-center justify-center transition-all border border-slate-200 text-xs font-bold"
                        >
                          →
                        </Link>
                        <button
                          onClick={() => handleSuspend(phr.id, phr.name)}
                          title="Reject / Suspend"
                          className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white flex items-center justify-center transition-all border border-rose-100"
                        >
                          <X size={15} className="stroke-[2.5]" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
