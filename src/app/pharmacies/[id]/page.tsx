"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { approvePharmacy, suspendPharmacy } from "@/store/slices/pharmaciesSlice";
import { addNotification } from "@/store/slices/notificationsSlice";
import {
  ArrowLeft,
  Building2,
  MapPin,
  Phone,
  Mail,
  FileText,
  UserCheck,
  ShieldCheck,
  ShieldX,
  Clock,
  CheckCircle,
  Ban,
} from "lucide-react";

export default function PharmacyApprovalPage() {
  const params = useParams();
  const dispatch = useAppDispatch();
  const pharmacies = useAppSelector((state) => state.pharmacies.items);
  const id = params.id as string;
  const pharmacy = pharmacies.find((p) => p.id === id);

  if (!pharmacy) {
    return (
      <div className="text-center py-16">
        <h3 className="font-extrabold text-slate-800 text-lg">Pharmacy Not Found</h3>
        <Link href="/pharmacies" className="text-xs font-bold text-primary hover:underline mt-4 inline-block">
          Return to Registry
        </Link>
      </div>
    );
  }

  const handleApprove = () => {
    dispatch(approvePharmacy(pharmacy.id));
    dispatch(
      addNotification({
        title: "Pharmacy Approved",
        message: `${pharmacy.name} has been verified and approved.`,
        type: "success",
      })
    );
  };

  const handleSuspend = () => {
    dispatch(suspendPharmacy(pharmacy.id));
    dispatch(
      addNotification({
        title: "Pharmacy Suspended",
        message: `${pharmacy.name} status updated to Suspended.`,
        type: "warning",
      })
    );
  };

  const statusConfig = {
    "Approved": {
      bg: "bg-emerald-50",
      border: "border-emerald-200",
      text: "text-emerald-700",
      icon: <CheckCircle size={18} className="text-emerald-600" />,
    },
    "Pending Approval": {
      bg: "bg-amber-50",
      border: "border-amber-200",
      text: "text-amber-700",
      icon: <Clock size={18} className="text-amber-600" />,
    },
    "Suspended": {
      bg: "bg-rose-50",
      border: "border-rose-200",
      text: "text-rose-700",
      icon: <Ban size={18} className="text-rose-600" />,
    },
  };
  const s = statusConfig[pharmacy.status];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Back nav */}
      <Link href="/pharmacies" className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors w-fit">
        <ArrowLeft size={16} /> Back to Pharmacy Registry
      </Link>

      {/* Status Banner */}
      <div className={`flex items-center gap-3 px-5 py-4 rounded-2xl border ${s.bg} ${s.border}`}>
        {s.icon}
        <div>
          <p className={`text-sm font-extrabold ${s.text}`}>Application Status: {pharmacy.status}</p>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">
            Submitted on {pharmacy.dateSubmitted} — License: <span className="font-mono font-bold">{pharmacy.licenseNumber}</span>
          </p>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Full Spec sheet */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600 shrink-0 border border-slate-200">
              <Building2 size={32} />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-800 tracking-tight leading-tight">{pharmacy.name}</h1>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold mt-1.5">
                <MapPin size={13} className="text-primary" /> {pharmacy.location}
              </div>
            </div>
          </div>

          {/* Contact & Licensing Info */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-5">
            <h3 className="font-extrabold text-slate-800 text-sm border-b border-slate-100 pb-3">Branch Details & Contact</h3>
            <div className="grid grid-cols-2 gap-5">
              {[
                { icon: <Phone size={16} />, label: "Phone Number", value: pharmacy.phone },
                { icon: <Mail size={16} />, label: "Email Address", value: pharmacy.email },
                { icon: <FileText size={16} />, label: "Council License", value: pharmacy.licenseNumber },
                { icon: <UserCheck size={16} />, label: "Pharmacist Reg. ID", value: pharmacy.pharmacistId },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 shrink-0 mt-0.5">
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{item.label}</p>
                    <p className="text-sm font-bold text-slate-700 mt-0.5 font-mono">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Documentation Display */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-800 text-sm border-b border-slate-100 pb-3">Submitted Documentation</h3>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-4">
              <div className="w-10 h-12 bg-red-500 rounded-lg flex items-center justify-center text-white text-[10px] font-black tracking-wider shrink-0">
                PDF
              </div>
              <div>
                <p className="text-sm font-bold text-slate-700">pharmacy_council_certificate.pdf</p>
                <p className="text-xs text-slate-400 font-semibold">Uploaded {pharmacy.dateSubmitted} • 2.4 MB</p>
              </div>
              <span className="ml-auto flex items-center gap-1 text-emerald-600 text-xs font-bold">
                <CheckCircle size={14} className="stroke-[2.5]" /> Verified
              </span>
            </div>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-4">
              <div className="w-10 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-white text-[10px] font-black shrink-0">
                IMG
              </div>
              <div>
                <p className="text-sm font-bold text-slate-700">pharmacist_license_card.jpg</p>
                <p className="text-xs text-slate-400 font-semibold">Uploaded {pharmacy.dateSubmitted} • 0.8 MB</p>
              </div>
              <span className="ml-auto flex items-center gap-1 text-emerald-600 text-xs font-bold">
                <CheckCircle size={14} className="stroke-[2.5]" /> Verified
              </span>
            </div>
          </div>
        </div>

        {/* Right: Pharmacist & Actions */}
        <div className="space-y-6">
          {/* Pharmacist Info */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-800 text-sm border-b border-slate-100 pb-3">Pharmacist in Charge</h3>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-primary font-black text-lg">
                {pharmacy.pharmacistName.split(" ").pop()?.charAt(0)}
              </div>
              <div>
                <p className="font-bold text-slate-800 text-sm">{pharmacy.pharmacistName}</p>
                <p className="text-[11px] text-slate-400 font-mono font-semibold">{pharmacy.pharmacistId}</p>
                <span className="text-[10px] font-bold text-teal-700 bg-teal-50 border border-teal-100 px-2 py-0.5 rounded-full mt-1 inline-block">
                  Registered Pharmacist
                </span>
              </div>
            </div>
          </div>

          {/* Verification Actions */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-800 text-sm border-b border-slate-100 pb-3">Admin Verification Actions</h3>

            {pharmacy.status === "Pending Approval" && (
              <div className="space-y-3">
                <button
                  onClick={handleApprove}
                  className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-sm shadow-md shadow-emerald-700/20 transition-all"
                >
                  <ShieldCheck size={16} /> Approve & Activate Branch
                </button>
                <button
                  onClick={handleSuspend}
                  className="w-full flex items-center justify-center gap-2 border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold py-3 rounded-xl text-sm transition-all"
                >
                  <ShieldX size={16} /> Reject Application
                </button>
              </div>
            )}

            {pharmacy.status === "Approved" && (
              <div className="space-y-3">
                <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-2 text-xs font-bold text-emerald-700">
                  <CheckCircle size={16} className="shrink-0" /> This pharmacy is active on the MediFind network.
                </div>
                <button
                  onClick={handleSuspend}
                  className="w-full flex items-center justify-center gap-2 border border-amber-200 text-amber-700 hover:bg-amber-50 font-bold py-3 rounded-xl text-sm transition-all"
                >
                  <Ban size={16} /> Suspend This Branch
                </button>
              </div>
            )}

            {pharmacy.status === "Suspended" && (
              <div className="space-y-3">
                <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-2 text-xs font-bold text-rose-700">
                  <Ban size={16} className="shrink-0" /> This pharmacy is currently suspended.
                </div>
                <button
                  onClick={handleApprove}
                  className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-teal-800 text-white font-bold py-3 rounded-xl text-sm shadow-md shadow-teal-700/20 transition-all"
                >
                  <ShieldCheck size={16} /> Reinstate Branch
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
