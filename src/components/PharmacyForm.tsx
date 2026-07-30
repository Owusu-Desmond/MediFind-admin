"use client";

import React from "react";
import {
  X,
  Upload,
  Clock,
  MapPin,
  FileCheck,
  Building2,
  Check,
} from "lucide-react";

export interface PharmacyFormData {
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
  certificateFile?: File | null;
  certificateUrl?: string;
}

export const defaultFormData: PharmacyFormData = {
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
  certificateFile: null,
  certificateUrl: "",
};

export function formatTime12h(time24: string): string {
  if (!time24) return "";
  const [h, m] = time24.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  const hStr = h12 < 10 ? `0${h12}` : `${h12}`;
  const mStr = m < 10 ? `0${m}` : `${m}`;
  return `${hStr}:${mStr} ${period}`;
}

export interface PharmacyFormProps {
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
  submitting?: boolean;
}

export default function PharmacyForm({
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
  submitting = false,
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
        certificateFile: file,
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
              disabled={submitting}
              className="px-4 py-2 border border-slate-200 text-slate-600 font-bold rounded-xl text-xs hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl text-xs shadow-md shadow-teal-700/20 transition-all flex items-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving Changes…
                </>
              ) : (
                <>
                  <Check size={15} className="stroke-[3]" />
                  Save &amp; Submit
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
