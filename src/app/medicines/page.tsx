"use client";

import React, { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchMedicines,
  fetchMedicineMetadata,
  fetchCatalogueDuplicates,
  createCatalogueMedicine,
  updateCatalogueMedicine,
  toggleMedicineActive,
  addMedicineAlias,
  deleteMedicineAlias,
  Medicine,
} from "@/store/slices/medicinesSlice";
import { addNotification } from "@/store/slices/notificationsSlice";
import {
  Pill,
  Search,
  Plus,
  Filter,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Edit2,
  Power,
  ShieldCheck,
  Building2,
  FileText,
  Boxes,
  Loader2,
  X,
  Sparkles,
  Info,
  Tag,
  Trash2,
} from "lucide-react";

export default function AdminMedicinesPage() {
  const dispatch = useAppDispatch();
  const { items: medicines, loading, categories, dosageForms, duplicateGroups, submittingForm } = useAppSelector(
    (state) => state.medicines
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedDosageForm, setSelectedDosageForm] = useState("All");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDuplicatesModal, setShowDuplicatesModal] = useState(false);
  const [showAliasesModal, setShowAliasesModal] = useState(false);
  const [currentMed, setCurrentMed] = useState<Medicine | null>(null);
  const [aliasMed, setAliasMed] = useState<Medicine | null>(null);

  // Alias Form State
  const [newAliasName, setNewAliasName] = useState("");
  const [newAliasType, setNewAliasType] = useState("Brand");
  const [aliasSubmitting, setAliasSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    generic_name: "",
    strength: "500mg",
    dosage_form: "Tablet",
    route_of_administration: "Oral",
    category: "Analgesic",
    manufacturer: "Ghana National Pharma",
    requires_prescription: false,
    dosage_instructions: "Adults: 1-2 tablets every 4-6 hours as required. Do not exceed 8 tablets in 24 hours.",
    description: "Effective for relief of mild to moderate pain and fever.",
    precautions: "Do not exceed recommended daily dose.",
    side_effects: "Rare mild gastrointestinal disturbances.",
    tags: "Oral, Fast Acting, FDA Approved",
    is_active: true,
  });

  useEffect(() => {
    dispatch(fetchMedicineMetadata());
    dispatch(fetchCatalogueDuplicates());
  }, [dispatch]);

  // Debounced live backend search on query or filter changes
  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(
        fetchMedicines({
          q: searchTerm.trim() || undefined,
          category: selectedCategory !== "All" ? selectedCategory : undefined,
          dosage_form: selectedDosageForm !== "All" ? selectedDosageForm : undefined,
          is_active: statusFilter === "active" ? true : statusFilter === "inactive" ? false : undefined,
        })
      );
    }, 250);

    return () => clearTimeout(timer);
  }, [dispatch, searchTerm, selectedCategory, selectedDosageForm, statusFilter]);

  const handleOpenAddModal = () => {
    setFormData({
      name: "",
      generic_name: "",
      strength: "500mg",
      dosage_form: "Tablet",
      route_of_administration: "Oral",
      category: "Analgesic",
      manufacturer: "Ghana National Pharma",
      requires_prescription: false,
      dosage_instructions: "Adults: 1-2 tablets every 4-6 hours as required.",
      description: "",
      precautions: "",
      side_effects: "",
      tags: "FDA Approved",
      is_active: true,
    });
    setShowAddModal(true);
  };

  const handleOpenEditModal = (med: Medicine) => {
    setCurrentMed(med);
    setFormData({
      name: med.name,
      generic_name: med.genericName,
      strength: med.strength,
      dosage_form: med.dosageForm,
      route_of_administration: med.routeOfAdministration,
      category: med.category,
      manufacturer: med.manufacturer,
      requires_prescription: med.requiresPrescription,
      dosage_instructions: med.dosageInstructions,
      description: med.description,
      precautions: med.precautions,
      side_effects: med.sideEffects,
      tags: med.tags,
      is_active: med.isActive,
    });
    setShowEditModal(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dispatch(createCatalogueMedicine(formData)).unwrap();
      dispatch(
        addNotification({
          title: "Medicine Created",
          message: `${formData.name} (${formData.strength}) added to Central Catalogue.`,
          type: "success",
        })
      );
      setShowAddModal(false);
    } catch (err: any) {
      alert(err || "Failed to create catalogue medicine.");
    }
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentMed) return;
    try {
      await dispatch(
        updateCatalogueMedicine({
          id: currentMed.id,
          data: formData,
        })
      ).unwrap();
      dispatch(
        addNotification({
          title: "Medicine Updated",
          message: `${formData.name} details updated in Central Catalogue.`,
          type: "success",
        })
      );
      setShowEditModal(false);
    } catch (err: any) {
      alert(err || "Failed to update catalogue medicine.");
    }
  };

  const handleToggleActive = async (med: Medicine) => {
    try {
      await dispatch(toggleMedicineActive(med.id)).unwrap();
      dispatch(
        addNotification({
          title: med.isActive ? "Medicine Deactivated" : "Medicine Activated",
          message: `${med.name} status changed to ${med.isActive ? "Inactive" : "Active"}.`,
          type: "info",
        })
      );
    } catch (err: any) {
      alert(err || "Failed to toggle medicine status.");
    }
  };

  const handleOpenAliasesModal = (med: Medicine) => {
    setAliasMed(med);
    setNewAliasName("");
    setNewAliasType("Brand");
    setShowAliasesModal(true);
  };

  const handleAddAliasSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aliasMed || !newAliasName.trim()) return;

    try {
      setAliasSubmitting(true);
      const res = await dispatch(
        addMedicineAlias({
          medicineId: aliasMed.id,
          alias: newAliasName.trim(),
          aliasType: newAliasType,
        })
      ).unwrap();

      // Update local aliasMed state for immediate modal reflection
      setAliasMed((prev) =>
        prev
          ? {
              ...prev,
              aliases: [...prev.aliases, res.alias],
            }
          : null
      );

      dispatch(
        addNotification({
          title: "Alias Added",
          message: `Added alias "${newAliasName.trim()}" (${newAliasType}) to ${aliasMed.name}.`,
          type: "success",
        })
      );
      setNewAliasName("");
    } catch (err: any) {
      alert(err || "Failed to add alias.");
    } finally {
      setAliasSubmitting(false);
    }
  };

  const handleDeleteAlias = async (aliasId: number) => {
    if (!aliasMed) return;
    if (!confirm("Are you sure you want to remove this alias?")) return;

    try {
      await dispatch(
        deleteMedicineAlias({
          medicineId: aliasMed.id,
          aliasId,
        })
      ).unwrap();

      setAliasMed((prev) =>
        prev
          ? {
              ...prev,
              aliases: prev.aliases.filter((a) => a.id !== aliasId),
            }
          : null
      );

      dispatch(
        addNotification({
          title: "Alias Removed",
          message: "The medicine alias was successfully deleted.",
          type: "info",
        })
      );
    } catch (err: any) {
      alert(err || "Failed to remove alias.");
    }
  };

  // The backend already handles multi-tier intelligent search, aliases, and filtering.
  const filteredMedicines = medicines;

  const totalCount = medicines.length;
  const activeCount = medicines.filter((m) => m.isActive).length;
  const inactiveCount = medicines.filter((m) => !m.isActive).length;
  const rxCount = medicines.filter((m) => m.requiresPrescription).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Central Medicine Catalogue</h1>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            Global database of verified pharmaceuticals and medicines shared across all registered pharmacies.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {duplicateGroups.length > 0 && (
            <button
              onClick={() => setShowDuplicatesModal(true)}
              className="flex items-center gap-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors"
            >
              <AlertTriangle size={15} className="text-amber-600" />
              {duplicateGroups.length} Duplicate Groups
            </button>
          )}
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-teal-700/20 transition-all duration-200"
          >
            <Plus size={16} /> Add Catalogue Medicine
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Catalogue Items</p>
            <h3 className="text-2xl font-black text-slate-800 mt-0.5">{totalCount}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700">
            <Pill size={20} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active & Available</p>
            <h3 className="text-2xl font-black text-emerald-600 mt-0.5">{activeCount}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <CheckCircle size={20} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Deactivated</p>
            <h3 className="text-2xl font-black text-slate-500 mt-0.5">{inactiveCount}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500">
            <XCircle size={20} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Prescription (Rx)</p>
            <h3 className="text-2xl font-black text-amber-600 mt-0.5">{rxCount}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
            <FileText size={20} />
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Search and Filters */}
        <div className="p-5 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search catalogue by name, generic, strength, manufacturer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white transition-all"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-600"
            >
              <option value="All">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <select
              value={selectedDosageForm}
              onChange={(e) => setSelectedDosageForm(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-600"
            >
              <option value="All">All Dosage Forms</option>
              {dosageForms.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>

            <div className="flex items-center bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setStatusFilter("all")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  statusFilter === "all" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter("active")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  statusFilter === "active" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Active
              </button>
              <button
                onClick={() => setStatusFilter("inactive")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  statusFilter === "inactive" ? "bg-white text-rose-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Inactive
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="py-16 text-center text-slate-400 text-xs font-semibold flex items-center justify-center gap-2">
            <Loader2 size={18} className="animate-spin text-teal-600" /> Loading Catalogue...
          </div>
        ) : filteredMedicines.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-14 h-14 bg-teal-50 text-teal-700 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Pill size={28} />
            </div>
            <h3 className="text-base font-bold text-slate-800">No Catalogue Entries Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-5">
              Try adjusting your search criteria or add a new medicine to the central registry.
            </p>
            <button
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md"
            >
              <Plus size={14} /> Add Medicine
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-5">Medicine & Generic Name</th>
                  <th className="py-3 px-4">Strength & Form</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Manufacturer</th>
                  <th className="py-3 px-4">Stocking Branches</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                {filteredMedicines.map((med) => (
                  <tr key={med.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-black shrink-0">
                          {med.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-800 flex items-center gap-1.5">
                            {med.name}
                            {med.requiresPrescription && (
                              <span className="text-[9px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.2 rounded">
                                Rx
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {med.genericName ? `Generic: ${med.genericName}` : "Generic name unlisted"}
                          </div>

                          {/* Aliases Tags */}
                          {med.aliases && med.aliases.length > 0 && (
                            <div className="flex flex-wrap items-center gap-1 mt-1.5">
                              {med.aliases.map((al) => (
                                <span
                                  key={al.id}
                                  className="inline-flex items-center gap-1 text-[9px] font-bold bg-amber-50 text-amber-800 border border-amber-200 px-1.5 py-0.5 rounded"
                                >
                                  <Tag size={9} className="text-amber-600" />
                                  {al.alias}
                                  <span className="text-[8px] text-amber-600/70 font-semibold">({al.aliasType || "Brand"})</span>
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-mono text-slate-700 font-bold block">{med.strength}</span>
                      <span className="text-[10px] text-slate-400 block">{med.dosageForm} ({med.routeOfAdministration})</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-[11px] font-bold">
                        {med.category || "General"}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 text-[11px]">
                      {med.manufacturer || "Generic"}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                        <Building2 size={11} /> {med.activePharmaciesCount} Pharmacies
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          med.isActive
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-slate-100 text-slate-500 border border-slate-200"
                        }`}
                      >
                        {med.isActive ? "Active" : "Deactivated"}
                      </span>
                    </td>

                    <td className="py-3.5 px-5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenAliasesModal(med)}
                          className="p-1.5 hover:bg-amber-50 text-slate-400 hover:text-amber-700 rounded-lg transition-colors"
                          title="Manage Aliases & Brand Names"
                        >
                          <Tag size={15} />
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(med)}
                          className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-teal-700 rounded-lg transition-colors"
                          title="Edit Catalogue Entry"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => handleToggleActive(med)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            med.isActive
                              ? "hover:bg-rose-50 text-slate-400 hover:text-rose-600"
                              : "hover:bg-emerald-50 text-slate-400 hover:text-emerald-600"
                          }`}
                          title={med.isActive ? "Deactivate Entry" : "Reactivate Entry"}
                        >
                          <Power size={15} />
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

      {/* CREATE CATALOGUE MEDICINE MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-100 bg-teal-50/50 flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-800">Add Central Catalogue Medicine</h3>
                <p className="text-[11px] text-slate-500 font-semibold">
                  New entries will immediately become available for pharmacies to stock and patients to search.
                </p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700 p-1">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 overflow-y-auto space-y-6 text-xs font-semibold">
              {/* SECTION 1: PRODUCT IDENTIFICATION */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <span className="w-5 h-5 rounded-md bg-teal-50 text-teal-700 font-bold flex items-center justify-center text-[10px]">1</span>
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Product Identification</h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-700 block mb-1 font-bold">Brand / Product Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Paracetamol Extra, Amoxil"
                      value={formData.name}
                      onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-600 font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-slate-700 block mb-1 font-bold">Generic (INN) Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Acetaminophen, Amoxicillin"
                      value={formData.generic_name}
                      onChange={(e) => setFormData((prev) => ({ ...prev, generic_name: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-slate-700 block mb-1 font-bold">Strength / Potency *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 500mg, 100mg/5ml"
                      value={formData.strength}
                      onChange={(e) => setFormData((prev) => ({ ...prev, strength: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-600 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-700 block mb-1 font-bold">Dosage Form</label>
                    <select
                      value={formData.dosage_form}
                      onChange={(e) => setFormData((prev) => ({ ...prev, dosage_form: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-600"
                    >
                      <option value="Tablet">Tablet</option>
                      <option value="Capsule">Capsule</option>
                      <option value="Syrup">Syrup</option>
                      <option value="Suspension">Suspension</option>
                      <option value="Injection">Injection</option>
                      <option value="Inhaler">Inhaler</option>
                      <option value="Ointment">Ointment</option>
                      <option value="Cream">Cream</option>
                      <option value="Eye Drops">Eye Drops</option>
                      <option value="Ear Drops">Ear Drops</option>
                      <option value="Suppository">Suppository</option>
                      <option value="Powder">Powder</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-700 block mb-1 font-bold">Route of Administration</label>
                    <select
                      value={formData.route_of_administration}
                      onChange={(e) => setFormData((prev) => ({ ...prev, route_of_administration: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-600"
                    >
                      <option value="Oral">Oral</option>
                      <option value="Topical">Topical</option>
                      <option value="Intravenous">Intravenous (IV)</option>
                      <option value="Intramuscular">Intramuscular (IM)</option>
                      <option value="Inhalation">Inhalation</option>
                      <option value="Ophthalmic">Ophthalmic (Eyes)</option>
                      <option value="Otic">Otic (Ears)</option>
                      <option value="Sublingual">Sublingual</option>
                      <option value="Rectal">Rectal</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-700 block mb-1 font-bold">Therapeutic Category</label>
                    <input
                      type="text"
                      placeholder="e.g. Analgesic, Antibiotic, Antimalarial"
                      value={formData.category}
                      onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-600"
                    />
                  </div>
                  <div>
                    <label className="text-slate-700 block mb-1 font-bold">Manufacturer / Brand</label>
                    <input
                      type="text"
                      placeholder="e.g. Ernest Chemists, Kinapharma, Pfizer"
                      value={formData.manufacturer}
                      onChange={(e) => setFormData((prev) => ({ ...prev, manufacturer: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-600"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="adminRxCheck"
                    checked={formData.requires_prescription}
                    onChange={(e) => setFormData((prev) => ({ ...prev, requires_prescription: e.target.checked }))}
                    className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                  />
                  <label htmlFor="adminRxCheck" className="text-xs text-slate-700 font-bold cursor-pointer">
                    Requires Doctor's Prescription (Rx Only)
                  </label>
                </div>
              </div>

              {/* SECTION 2: CLINICAL & PATIENT INFORMATION */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <span className="w-5 h-5 rounded-md bg-teal-50 text-teal-700 font-bold flex items-center justify-center text-[10px]">2</span>
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Clinical & Patient Information</h4>
                </div>

                <div>
                  <label className="text-slate-700 block mb-1 font-bold">Clinical Description / Indications</label>
                  <textarea
                    rows={2}
                    placeholder="Describe indications, what the medicine treats, and clinical notes..."
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-600 text-xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-700 block mb-1 font-bold">Dosage & Directions for Use</label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Adults: 1-2 tablets every 4-6 hours with water after meals."
                      value={formData.dosage_instructions}
                      onChange={(e) => setFormData((prev) => ({ ...prev, dosage_instructions: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-600 text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-slate-700 block mb-1 font-bold">Precautions & Warnings</label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Avoid alcohol, keep out of reach of children, consult doctor if pregnant."
                      value={formData.precautions}
                      onChange={(e) => setFormData((prev) => ({ ...prev, precautions: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-600 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-700 block mb-1 font-bold">Possible Side Effects</label>
                    <input
                      type="text"
                      placeholder="e.g. May cause drowsiness, mild nausea, dizziness"
                      value={formData.side_effects}
                      onChange={(e) => setFormData((prev) => ({ ...prev, side_effects: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-600"
                    />
                  </div>

                  <div>
                    <label className="text-slate-700 block mb-1 font-bold">Search Tags / Keywords</label>
                    <input
                      type="text"
                      placeholder="e.g. Pain Relief, Fever, Rapid Action, FDA Approved"
                      value={formData.tags}
                      onChange={(e) => setFormData((prev) => ({ ...prev, tags: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-600"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3: CATALOGUE STATUS */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <span className="w-5 h-5 rounded-md bg-teal-50 text-teal-700 font-bold flex items-center justify-center text-[10px]">3</span>
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Catalogue Status</h4>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="adminActiveCheck"
                    checked={formData.is_active}
                    onChange={(e) => setFormData((prev) => ({ ...prev, is_active: e.target.checked }))}
                    className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                  />
                  <label htmlFor="adminActiveCheck" className="text-xs text-slate-700 font-bold cursor-pointer">
                    Active & Available for Pharmacy Stocking and Search
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingForm}
                  className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs shadow-md disabled:opacity-50"
                >
                  {submittingForm ? "Publishing..." : "Add to Catalogue"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT CATALOGUE MEDICINE MODAL */}
      {showEditModal && currentMed && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-800">Edit Catalogue Medicine</h3>
                <p className="text-[11px] text-slate-500 font-semibold">{currentMed.name} (ID: {currentMed.id})</p>
              </div>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-700 p-1">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdateSubmit} className="p-6 overflow-y-auto space-y-6 text-xs font-semibold">
              {/* SECTION 1: PRODUCT IDENTIFICATION */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <span className="w-5 h-5 rounded-md bg-teal-50 text-teal-700 font-bold flex items-center justify-center text-[10px]">1</span>
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Product Identification</h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-700 block mb-1 font-bold">Brand / Product Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-600 font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-slate-700 block mb-1 font-bold">Generic (INN) Name</label>
                    <input
                      type="text"
                      value={formData.generic_name}
                      onChange={(e) => setFormData((prev) => ({ ...prev, generic_name: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-slate-700 block mb-1 font-bold">Strength *</label>
                    <input
                      type="text"
                      required
                      value={formData.strength}
                      onChange={(e) => setFormData((prev) => ({ ...prev, strength: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-600 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-700 block mb-1 font-bold">Dosage Form</label>
                    <select
                      value={formData.dosage_form}
                      onChange={(e) => setFormData((prev) => ({ ...prev, dosage_form: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-600"
                    >
                      <option value="Tablet">Tablet</option>
                      <option value="Capsule">Capsule</option>
                      <option value="Syrup">Syrup</option>
                      <option value="Suspension">Suspension</option>
                      <option value="Injection">Injection</option>
                      <option value="Inhaler">Inhaler</option>
                      <option value="Ointment">Ointment</option>
                      <option value="Cream">Cream</option>
                      <option value="Eye Drops">Eye Drops</option>
                      <option value="Ear Drops">Ear Drops</option>
                      <option value="Suppository">Suppository</option>
                      <option value="Powder">Powder</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-700 block mb-1 font-bold">Route</label>
                    <select
                      value={formData.route_of_administration}
                      onChange={(e) => setFormData((prev) => ({ ...prev, route_of_administration: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-600"
                    >
                      <option value="Oral">Oral</option>
                      <option value="Topical">Topical</option>
                      <option value="Intravenous">Intravenous (IV)</option>
                      <option value="Intramuscular">Intramuscular (IM)</option>
                      <option value="Inhalation">Inhalation</option>
                      <option value="Ophthalmic">Ophthalmic</option>
                      <option value="Otic">Otic</option>
                      <option value="Sublingual">Sublingual</option>
                      <option value="Rectal">Rectal</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-700 block mb-1 font-bold">Category</label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-600"
                    />
                  </div>
                  <div>
                    <label className="text-slate-700 block mb-1 font-bold">Manufacturer</label>
                    <input
                      type="text"
                      value={formData.manufacturer}
                      onChange={(e) => setFormData((prev) => ({ ...prev, manufacturer: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-600"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="adminEditRxCheck"
                    checked={formData.requires_prescription}
                    onChange={(e) => setFormData((prev) => ({ ...prev, requires_prescription: e.target.checked }))}
                    className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                  />
                  <label htmlFor="adminEditRxCheck" className="text-xs text-slate-700 font-bold cursor-pointer">
                    Requires Doctor's Prescription (Rx Only)
                  </label>
                </div>
              </div>

              {/* SECTION 2: CLINICAL & PATIENT INFORMATION */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <span className="w-5 h-5 rounded-md bg-teal-50 text-teal-700 font-bold flex items-center justify-center text-[10px]">2</span>
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Clinical & Patient Information</h4>
                </div>

                <div>
                  <label className="text-slate-700 block mb-1 font-bold">Description / Indications</label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-600 text-xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-700 block mb-1 font-bold">Dosage & Directions for Use</label>
                    <textarea
                      rows={2}
                      value={formData.dosage_instructions}
                      onChange={(e) => setFormData((prev) => ({ ...prev, dosage_instructions: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-600 text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-slate-700 block mb-1 font-bold">Precautions & Warnings</label>
                    <textarea
                      rows={2}
                      value={formData.precautions}
                      onChange={(e) => setFormData((prev) => ({ ...prev, precautions: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-600 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-700 block mb-1 font-bold">Possible Side Effects</label>
                    <input
                      type="text"
                      value={formData.side_effects}
                      onChange={(e) => setFormData((prev) => ({ ...prev, side_effects: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-600"
                    />
                  </div>

                  <div>
                    <label className="text-slate-700 block mb-1 font-bold">Search Tags / Keywords</label>
                    <input
                      type="text"
                      value={formData.tags}
                      onChange={(e) => setFormData((prev) => ({ ...prev, tags: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-600"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3: CATALOGUE STATUS */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <span className="w-5 h-5 rounded-md bg-teal-50 text-teal-700 font-bold flex items-center justify-center text-[10px]">3</span>
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Catalogue Status</h4>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="adminEditActiveCheck"
                    checked={formData.is_active}
                    onChange={(e) => setFormData((prev) => ({ ...prev, is_active: e.target.checked }))}
                    className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                  />
                  <label htmlFor="adminEditActiveCheck" className="text-xs text-slate-700 font-bold cursor-pointer">
                    Active & Available for Pharmacy Stocking and Search
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingForm}
                  className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs shadow-md disabled:opacity-50"
                >
                  {submittingForm ? "Updating..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DUPLICATES INSPECTOR MODAL */}
      {showDuplicatesModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-100 bg-amber-50/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-800">Potential Catalogue Duplicates</h3>
                  <p className="text-[11px] text-slate-500 font-semibold">
                    Review and clean up entries with identical normalized name, strength, and formulation.
                  </p>
                </div>
              </div>
              <button onClick={() => setShowDuplicatesModal(false)} className="text-slate-400 hover:text-slate-700 p-1">
                <X size={18} />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4">
              {duplicateGroups.map((group: any[], gIdx: number) => (
                <div key={gIdx} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700">
                    Group #{gIdx + 1} ({group.length} items)
                  </span>
                  <div className="space-y-1.5">
                    {group.map((item: any) => (
                      <div key={item.id} className="p-2.5 bg-white rounded-lg border border-slate-200 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-bold text-slate-800">{item.name}</span>{" "}
                          <span className="font-mono text-[10px] text-slate-500">({item.strength} • {item.dosage_form})</span>
                          <span className="text-[10px] text-slate-400 block">ID: {item.id} • Added: {item.created_at?.split("T")[0] || "—"}</span>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${item.is_active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                          {item.is_active ? "Active" : "Inactive"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50/50 text-right">
              <button
                onClick={() => setShowDuplicatesModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ALIASES & BRAND NAMES MANAGER MODAL */}
      {showAliasesModal && aliasMed && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 bg-teal-50/40 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold shadow-md shadow-teal-600/20">
                  <Tag size={20} />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-800">
                    Manage Aliases & Brand Names
                  </h3>
                  <p className="text-[11px] text-slate-500 font-semibold">
                    {aliasMed.name} • {aliasMed.strength} {aliasMed.dosageForm} {aliasMed.genericName ? `(${aliasMed.genericName})` : ""}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAliasesModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-5">
              {/* Context Description */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-start gap-2.5">
                <Info size={16} className="text-teal-700 shrink-0 mt-0.5" />
                <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                  Aliases map trade brands (e.g. <em>Panadol</em>, <em>Emzor</em>), medical abbreviations (e.g. <em>PCM</em>, <em>APAP</em>), or local synonyms directly to this central canonical medicine. When patients search for any of these aliases, MediFind matches them here.
                </p>
              </div>

              {/* Existing Registered Aliases */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5 flex items-center justify-between">
                  <span>Registered Aliases ({aliasMed.aliases?.length || 0})</span>
                </h4>

                {(!aliasMed.aliases || aliasMed.aliases.length === 0) ? (
                  <div className="p-6 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <Tag size={28} className="mx-auto text-slate-300 mb-2" />
                    <p className="text-xs font-bold text-slate-600">No alternate brand names registered yet</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Add common trade names, manufacturer brandings, or abbreviations below.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {aliasMed.aliases.map((al) => (
                      <div
                        key={al.id}
                        className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center justify-between gap-2 hover:border-teal-200 transition-colors"
                      >
                        <div className="flex items-center gap-2 overflow-hidden">
                          <Tag size={13} className="text-amber-600 shrink-0" />
                          <div className="overflow-hidden">
                            <span className="text-xs font-bold text-slate-800 block truncate">
                              {al.alias}
                            </span>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                              {al.aliasType || "Brand"}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleDeleteAlias(al.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors shrink-0"
                          title="Delete Alias"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Add New Alias Form */}
              <form onSubmit={handleAddAliasSubmit} className="pt-4 border-t border-slate-100 space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Add New Brand / Alias
                </h4>

                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="e.g. Panadol Extra, PCM, Glucophage..."
                      value={newAliasName}
                      onChange={(e) => setNewAliasName(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white"
                      required
                    />
                  </div>

                  <div className="w-full sm:w-36">
                    <select
                      value={newAliasType}
                      onChange={(e) => setNewAliasType(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-600"
                    >
                      <option value="Brand">Brand Name</option>
                      <option value="Abbreviation">Abbreviation / Acronym</option>
                      <option value="CommonName">Common Name</option>
                      <option value="LocalName">Local / Colloquial</option>
                      <option value="Misspelling">Common Misspelling</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={aliasSubmitting || !newAliasName.trim()}
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-teal-600/20 transition-all shrink-0"
                  >
                    {aliasSubmitting ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Plus size={14} />
                    )}
                    Add Alias
                  </button>
                </div>
              </form>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
              <button
                onClick={() => setShowAliasesModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs shadow-sm transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
