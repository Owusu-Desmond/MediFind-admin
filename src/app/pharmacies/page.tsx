"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  approvePharmacy,
  suspendPharmacy,
  addPharmacy,
  Pharmacy,
} from "@/store/slices/pharmaciesSlice";
import { addNotification } from "@/store/slices/notificationsSlice";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Eye,
  AlertTriangle,
  Check,
  Ban,
  Upload,
  Clock,
  MapPin,
  FileCheck,
  Building2,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* Form state types                                                      */
/* ------------------------------------------------------------------ */
interface PharmacyFormData {
  name: string;
  email: string;
  phone: string;
  location: string;
  openingHours: string;
  gpsCoordinates: string;
  licenseNumber: string;
  pharmacistName: string;
  pharmacistId: string;
  certificateFileName: string;
  certificateUploaded: boolean;
}

/* ------------------------------------------------------------------ */
/* Helper: format 24-h time string to 12-h string                      */
/* ------------------------------------------------------------------ */
function formatTime12h(time24: string): string {
  if (!time24) return "";
  const [h, m] = time24.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  const hStr = h12 < 10 ? `0${h12}` : `${h12}`;
  const mStr = m < 10 ? `0${m}` : `${m}`;
  return `${hStr}:${mStr} ${period}`;
}

/* ------------------------------------------------------------------ */
/* PharmacyForm — lives OUTSIDE the page so its identity is stable     */
/* ------------------------------------------------------------------ */
interface PharmacyFormProps {
  title: string;
  formData: PharmacyFormData;
  setFormData: React.Dispatch<React.SetStateAction<PharmacyFormData>>;
  openingDays: string;
  setOpeningDays: React.Dispatch<React.SetStateAction<string>>;
  openTime: string;
  setOpenTime: React.Dispatch<React.SetStateAction<string>>;
  closeTime: string;
  setCloseTime: React.Dispatch<React.SetStateAction<string>>;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

function PharmacyForm({
  title,
  formData,
  setFormData,
  openingDays,
  setOpeningDays,
  openTime,
  setOpenTime,
  closeTime,
  setCloseTime,
  onSubmit,
  onClose,
}: PharmacyFormProps) {
  const applyStructuredHours = (days: string, oTime: string, cTime: string) => {
    if (!oTime || !cTime) return;
    const formatted = `${days}: ${formatTime12h(oTime)} - ${formatTime12h(cTime)}`;
    setFormData((prev) => ({ ...prev, openingHours: formatted }));
  };

  const setPresetHours = (preset: string) => {
    setFormData((prev) => ({ ...prev, openingHours: preset }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        certificateFileName: file.name,
        certificateUploaded: true,
      }));
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
              <Building2 size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-800 text-base">{title}</h3>
              <p className="text-[11px] text-slate-400 font-semibold">
                Enter complete branch specification &amp; credentials
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:bg-slate-100 p-1.5 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={onSubmit} className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* ── SECTION 1: Store Identity & Contact ── */}
          <div className="space-y-4">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">
              1. Store Identity &amp; Contact Information
            </h4>

            <div className="grid grid-cols-2 gap-4">
              {/* Name */}
              <div className="col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Pharmacy Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Ghana National Pharmacy (Accra Central)"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-slate-50/50"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Official Email <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                  placeholder="central@pharmacy.com"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-slate-50/50"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Phone Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                  placeholder="+233 30 223 4455"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-slate-50/50"
                />
              </div>

              {/* Location */}
              <div className="col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Physical Business Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData((p) => ({ ...p, location: e.target.value }))}
                  placeholder="e.g. Ring Road Central, Near Kwame Nkrumah Interchange, Accra"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-slate-50/50"
                />
              </div>

              {/* GPS Coordinates */}
              <div className="col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center justify-between">
                  <span>GPS Address / Coordinates</span>
                  <span className="text-[10px] text-slate-400 font-semibold normal-case">
                    e.g. GA-183-9932 or 5.5601, -0.2057
                  </span>
                </label>
                <div className="relative">
                  <MapPin
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    value={formData.gpsCoordinates}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, gpsCoordinates: e.target.value }))
                    }
                    placeholder="5.5601, -0.2057"
                    className="w-full pl-10 pr-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-mono bg-slate-50/50"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ── SECTION 2: Opening Hours ── */}
          <div className="space-y-4">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <Clock size={14} />
              2. Opening Hours Configuration
            </h4>

            <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/80 space-y-3">
              {/* Quick Presets */}
              <div>
                <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Quick Schedule Presets:
                </span>
                <div className="flex flex-wrap gap-2">
                  {[
                    "24 Hours / 7 Days",
                    "Mon - Sun: 08:00 AM - 10:00 PM",
                    "Mon - Sat: 08:00 AM - 09:00 PM",
                    "Mon - Fri: 08:00 AM - 06:00 PM",
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setPresetHours(preset)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                        formData.openingHours === preset
                          ? "bg-teal-50 border-teal-300 text-teal-800 shadow-sm"
                          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Builder */}
              <div className="pt-2 border-t border-slate-200/60">
                <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Custom Time Builder:
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1">
                      Days Range
                    </label>
                    <select
                      value={openingDays}
                      onChange={(e) => {
                        setOpeningDays(e.target.value);
                        applyStructuredHours(e.target.value, openTime, closeTime);
                      }}
                      className="w-full px-2.5 py-2 border border-slate-200 rounded-lg text-xs bg-white font-semibold focus:outline-none"
                    >
                      <option>Mon - Sun</option>
                      <option>Mon - Sat</option>
                      <option>Mon - Fri</option>
                      <option>Daily</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1">
                      Opening Time
                    </label>
                    <input
                      type="time"
                      value={openTime}
                      onChange={(e) => {
                        setOpenTime(e.target.value);
                        applyStructuredHours(openingDays, e.target.value, closeTime);
                      }}
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white font-mono focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1">
                      Closing Time
                    </label>
                    <input
                      type="time"
                      value={closeTime}
                      onChange={(e) => {
                        setCloseTime(e.target.value);
                        applyStructuredHours(openingDays, openTime, e.target.value);
                      }}
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white font-mono focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Formatted Preview / Manual Override */}
              <div className="pt-1">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Formatted Schedule Text
                </label>
                <input
                  type="text"
                  required
                  value={formData.openingHours}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, openingHours: e.target.value }))
                  }
                  placeholder="e.g. Mon - Sun: 08:00 AM - 10:00 PM"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20 bg-white"
                />
              </div>
            </div>
          </div>

          {/* ── SECTION 3: Licensing & Staff ── */}
          <div className="space-y-4">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">
              3. Pharmacy Council Licensing &amp; Staff
            </h4>

            <div className="grid grid-cols-2 gap-4">
              {/* License Number */}
              <div className="col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  License Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.licenseNumber}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, licenseNumber: e.target.value }))
                  }
                  placeholder="e.g. PHA-GH-2026-8830"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-mono bg-slate-50/50"
                />
              </div>

              {/* Pharmacist Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Pharmacist Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.pharmacistName}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, pharmacistName: e.target.value }))
                  }
                  placeholder="e.g. Dr. Emmanuel Mensah"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-slate-50/50"
                />
              </div>

              {/* Pharmacist ID */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Pharmacist Reg. ID <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.pharmacistId}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, pharmacistId: e.target.value }))
                  }
                  placeholder="e.g. RPH-GH-8830"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-mono bg-slate-50/50"
                />
              </div>

              {/* Certificate Upload */}
              <div className="col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Council Registration Certificate (PDF / Image)
                </label>
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={handleFileChange}
                  id="certUploadInput"
                  className="hidden"
                />
                <label
                  htmlFor="certUploadInput"
                  className={`border-2 border-dashed rounded-xl p-4 flex items-center justify-between cursor-pointer transition-colors ${
                    formData.certificateUploaded
                      ? "border-emerald-300 bg-emerald-50/30"
                      : "border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {formData.certificateUploaded ? (
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
                        <FileCheck size={20} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">
                          {formData.certificateFileName || "pharmacy_certificate.pdf"}
                        </p>
                        <p className="text-[10px] text-emerald-700 font-semibold">
                          Document Attached
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                        <Upload size={18} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-700">
                          Click to upload Council Certificate
                        </p>
                        <p className="text-[10px] text-slate-400 font-semibold">
                          Supports PDF, PNG, JPG (Max 5 MB)
                        </p>
                      </div>
                    </div>
                  )}
                  <span className="text-xs font-bold text-teal-700 underline">
                    {formData.certificateUploaded ? "Change File" : "Browse"}
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="pt-4 border-t border-slate-100 flex justify-end gap-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 text-slate-600 font-bold rounded-xl text-xs hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl text-xs shadow-md shadow-teal-700/20 transition-all flex items-center gap-1.5"
            >
              <Check size={15} className="stroke-[3]" />
              Save &amp; Register Pharmacy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Default blank form data                                              */
/* ------------------------------------------------------------------ */
const defaultFormData: PharmacyFormData = {
  name: "",
  email: "",
  phone: "",
  location: "",
  openingHours: "Mon - Sun: 08:00 AM - 10:00 PM",
  gpsCoordinates: "",
  licenseNumber: "",
  pharmacistName: "",
  pharmacistId: "",
  certificateFileName: "",
  certificateUploaded: false,
};

/* ------------------------------------------------------------------ */
/* Helper: parse "5.5601, -0.2057" → { lat, lng }                     */
/* ------------------------------------------------------------------ */
function parseCoordinates(str: string): { lat: number | null; lng: number | null } {
  if (!str) return { lat: null, lng: null };
  const parts = str.split(/[\s,]+/);
  if (parts.length >= 2) {
    const lat = parseFloat(parts[0]);
    const lng = parseFloat(parts[1]);
    if (!isNaN(lat) && !isNaN(lng)) return { lat, lng };
  }
  return { lat: null, lng: null };
}

/* ------------------------------------------------------------------ */
/* Main Page Component                                                  */
/* ------------------------------------------------------------------ */
export default function PharmaciesPage() {
  const dispatch = useAppDispatch();
  const pharmacies = useAppSelector((s) => s.pharmacies.items);
  const loading = useAppSelector((s) => s.pharmacies.loading);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [current, setCurrent] = useState<Pharmacy | null>(null);

  /* Shared form state passed as props — does NOT live inside PharmacyForm */
  const [formData, setFormData] = useState<PharmacyFormData>(defaultFormData);
  const [openingDays, setOpeningDays] = useState("Mon - Sun");
  const [openTime, setOpenTime] = useState("08:00");
  const [closeTime, setCloseTime] = useState("22:00");

  const statuses = ["All", "Approved", "Pending Approval", "Suspended"];

  const filtered = pharmacies.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.licenseNumber.toLowerCase().includes(search.toLowerCase()) ||
      p.pharmacistName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const resetForm = () => {
    setFormData(defaultFormData);
    setOpeningDays("Mon - Sun");
    setOpenTime("08:00");
    setCloseTime("22:00");
  };

  const openAdd = () => {
    resetForm();
    setShowAddModal(true);
  };

  const openEdit = (p: Pharmacy) => {
    setCurrent(p);
    setFormData({
      name: p.name,
      email: p.email,
      phone: p.phone,
      location: p.location,
      openingHours: p.openingHours || defaultFormData.openingHours,
      gpsCoordinates: p.lat && p.lng ? `${p.lat}, ${p.lng}` : "",
      licenseNumber: p.licenseNumber,
      pharmacistName: p.pharmacistName,
      pharmacistId: p.pharmacistId,
      certificateFileName: "pharmacy_council_certificate.pdf",
      certificateUploaded: true,
    });
    setShowEditModal(true);
  };

  const openDelete = (p: Pharmacy) => {
    setCurrent(p);
    setShowDeleteModal(true);
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const { lat, lng } = parseCoordinates(formData.gpsCoordinates);
    dispatch(
      addPharmacy({
        name: formData.name,
        location: formData.location,
        licenseNumber: formData.licenseNumber,
        pharmacistName: formData.pharmacistName,
        pharmacistId: formData.pharmacistId,
        phone: formData.phone,
        email: formData.email,
        openingHours: formData.openingHours,
        deliveryOffered: true,
        lat,
        lng,
      })
    );
    dispatch(
      addNotification({
        title: "New Registration Request",
        message: `${formData.name} application submitted for verification.`,
        type: "info",
      })
    );
    setShowAddModal(false);
  };

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowEditModal(false);
  };

  const handleDelete = () => {
    setShowDeleteModal(false);
  };

  const handleApprove = (p: Pharmacy) => {
    dispatch(approvePharmacy(p.id));
    dispatch(
      addNotification({
        title: "Pharmacy Approved",
        message: `${p.name} verified and granted platform access.`,
        type: "success",
      })
    );
  };

  const handleSuspend = (p: Pharmacy) => {
    dispatch(suspendPharmacy(p.id));
    dispatch(
      addNotification({
        title: "Pharmacy Suspended",
        message: `${p.name} has been suspended from the network.`,
        type: "warning",
      })
    );
  };

  const statusBadge = (status: Pharmacy["status"]) => {
    if (status === "Approved") return "bg-emerald-50 text-emerald-700 border-emerald-100";
    if (status === "Pending Approval") return "bg-amber-50 text-amber-700 border-amber-100";
    return "bg-rose-50 text-rose-700 border-rose-100";
  };

  const sharedFormProps = {
    formData,
    setFormData,
    openingDays,
    setOpeningDays,
    openTime,
    setOpenTime,
    closeTime,
    setCloseTime,
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Pharmacy Registry</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage pharmacy branch registrations, licenses, and approval status
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-teal-700 hover:bg-teal-800 text-white font-bold py-2.5 px-5 rounded-xl shadow-lg shadow-teal-700/20 text-sm transition-all"
        >
          <Plus size={15} className="stroke-[3]" /> Add Pharmacy
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search pharmacy, license, pharmacist..."
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                statusFilter === s
                  ? "bg-teal-50 border-teal-200 text-teal-800"
                  : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                <th className="py-4 px-6">Pharmacy Branch</th>
                <th className="py-4 px-6">License No.</th>
                <th className="py-4 px-6">Pharmacist</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6">Submitted</th>
                <th className="py-4 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-sm text-slate-400 font-semibold">
                    Loading backend data...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-sm text-slate-400 font-semibold">
                    No pharmacies found.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors text-sm"
                  >
                    <td className="py-4 px-6">
                      <p className="font-bold text-slate-800">{p.name}</p>
                      <p className="text-[11px] text-slate-400 truncate max-w-48">{p.location}</p>
                    </td>
                    <td className="py-4 px-6 font-mono text-xs text-slate-600">{p.licenseNumber}</td>
                    <td className="py-4 px-6 font-semibold text-slate-600">{p.pharmacistName}</td>
                    <td className="py-4 px-6">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusBadge(p.status)}`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-500">{p.dateSubmitted}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center gap-1.5">
                        <Link
                          href={`/pharmacies/${p.id}`}
                          title="View Details"
                          className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 flex items-center justify-center border border-slate-200 transition-all"
                        >
                          <Eye size={14} />
                        </Link>
                        {p.status === "Pending Approval" && (
                          <button
                            onClick={() => handleApprove(p)}
                            title="Approve"
                            className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white flex items-center justify-center border border-emerald-100 transition-all"
                          >
                            <Check size={14} className="stroke-[2.5]" />
                          </button>
                        )}
                        {p.status === "Approved" && (
                          <button
                            onClick={() => handleSuspend(p)}
                            title="Suspend"
                            className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white flex items-center justify-center border border-amber-100 transition-all"
                          >
                            <Ban size={14} />
                          </button>
                        )}
                        <button
                          onClick={() => openEdit(p)}
                          title="Edit"
                          className="w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-600 flex items-center justify-center border border-transparent hover:border-slate-200 transition-all"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => openDelete(p)}
                          title="Delete"
                          className="w-8 h-8 rounded-lg hover:bg-rose-50 text-rose-500 flex items-center justify-center border border-transparent hover:border-rose-100 transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <PharmacyForm
          title="Register New Pharmacy Branch"
          onSubmit={handleAdd}
          onClose={() => setShowAddModal(false)}
          {...sharedFormProps}
        />
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <PharmacyForm
          title="Edit Pharmacy Details"
          onSubmit={handleEdit}
          onClose={() => setShowEditModal(false)}
          {...sharedFormProps}
        />
      )}

      {/* Delete Confirm Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl border border-slate-200 p-6 text-center space-y-4 animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle size={22} className="stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-800 text-lg">Delete Pharmacy?</h3>
              <p className="text-slate-500 text-xs mt-1.5">
                Permanently remove{" "}
                <span className="font-bold text-slate-700">{current?.name}</span> from the
                registry?
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-2.5 border border-slate-200 text-slate-600 font-bold rounded-xl text-xs hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shadow-md shadow-rose-600/25"
              >
                Delete Pharmacy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
