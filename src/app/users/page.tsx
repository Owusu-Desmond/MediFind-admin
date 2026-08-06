"use client";

import React, { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchUsers, updateUserStatus, addUser, updateUser, deleteUser, UserAccount } from "@/store/slices/usersSlice";
import { addNotification } from "@/store/slices/notificationsSlice";
import { Plus, Search, Edit2, Trash2, X, AlertTriangle, Shield, User as UserIcon } from "lucide-react";

export default function UsersPage() {
  const dispatch = useAppDispatch();
  const { items: users, loading, actionLoading } = useAppSelector((state) => state.users);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);

  const [addFormData, setAddFormData] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    age: "",
    password: "",
    role: "Patient" as "Patient" | "Admin",
  });

  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    age: "",
    role: "Patient" as "Patient" | "Admin",
    status: "Active" as UserAccount["status"],
  });

  const roles = ["All", "Admin", "Patient"];

  // Filter out Pharmacists: User Management is strictly for Patients and Admins
  const filtered = users.filter((u) => {
    if (u.role === "Pharmacist") return false;
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "All" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const openAdd = () => {
    setAddFormData({
      name: "",
      email: "",
      phone: "",
      location: "",
      age: "",
      password: "",
      role: "Patient",
    });
    setShowAddModal(true);
  };

  const openEdit = (u: UserAccount) => {
    setCurrentUser(u);
    setEditFormData({
      name: u.name,
      email: u.email,
      phone: u.phone || "",
      location: u.location || "",
      age: u.age ? String(u.age) : "",
      role: (u.role === "Admin" ? "Admin" : "Patient") as "Patient" | "Admin",
      status: u.status,
    });
    setShowEditModal(true);
  };

  const openDelete = (u: UserAccount) => {
    setCurrentUser(u);
    setShowDeleteModal(true);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (actionLoading) return;
    try {
      await dispatch(
        addUser({
          name: addFormData.name,
          email: addFormData.email,
          phone: addFormData.phone,
          location: addFormData.location,
          age: addFormData.role === "Patient" && addFormData.age ? Number(addFormData.age) : null,
          password: addFormData.password,
          role: addFormData.role,
        })
      ).unwrap();

      dispatch(
        addNotification({
          title: `${addFormData.role} Account Created`,
          message: `${addFormData.name} has been registered as a ${addFormData.role}.`,
          type: "success",
        })
      );
      setShowAddModal(false);
    } catch (err: any) {
      alert(`Failed to add user: ${err}`);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || actionLoading) return;
    try {
      await dispatch(
        updateUser({
          id: currentUser.id,
          name: editFormData.name,
          email: editFormData.email,
          phone: editFormData.phone,
          location: editFormData.location,
          age: editFormData.role === "Patient" && editFormData.age ? Number(editFormData.age) : null,
          role: editFormData.role,
          status: editFormData.status,
        })
      ).unwrap();

      dispatch(
        addNotification({
          title: "User Account Updated",
          message: `${editFormData.name}'s profile details have been saved.`,
          type: "success",
        })
      );
      setShowEditModal(false);
    } catch (err: any) {
      alert(`Failed to update user account: ${err}`);
    }
  };

  const handleDelete = async () => {
    if (!currentUser || actionLoading) return;
    try {
      await dispatch(deleteUser(currentUser.id)).unwrap();
      dispatch(
        addNotification({
          title: "User Account Removed",
          message: `${currentUser.name} account deleted permanently.`,
          type: "warning",
        })
      );
      setShowDeleteModal(false);
    } catch (err: any) {
      alert(`Failed to delete user: ${err}`);
    }
  };

  const roleBadge = (role: string) => {
    if (role === "Admin") return "bg-violet-50 text-violet-700 border-violet-100";
    return "bg-teal-50 text-teal-800 border-teal-100";
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">User Management</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage registered platform users (Patients) and system Administrator accounts
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-teal-700 hover:bg-teal-800 text-white font-bold py-2.5 px-5 rounded-xl shadow-lg shadow-teal-700/20 text-sm transition-all"
        >
          <Plus size={15} className="stroke-[3]" /> Add Account
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {roles.map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                roleFilter === r
                  ? "bg-teal-50 border-teal-200 text-teal-800"
                  : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* User Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-100 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              <th className="py-4 px-6">User / Account</th>
              <th className="py-4 px-6">Role</th>
              <th className="py-4 px-6">Location</th>
              <th className="py-4 px-6">Status</th>
              <th className="py-4 px-6">Date Created</th>
              <th className="py-4 px-6 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="py-16 text-center text-sm text-slate-400 font-semibold">
                  Loading accounts...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-16 text-center text-sm text-slate-400 font-semibold">
                  No accounts found matching your filter criteria.
                </td>
              </tr>
            ) : (
              filtered.map((u) => (
                <tr key={u.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors text-sm">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                          u.role === "Admin"
                            ? "bg-violet-100 text-violet-700"
                            : "bg-teal-100 text-teal-800"
                        }`}
                      >
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{u.name}</p>
                        <p className="text-[11px] text-slate-400">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${roleBadge(u.role)}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-xs text-slate-600 font-medium">
                    {u.location || "N/A"}
                  </td>
                  <td className="py-4 px-6">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        u.status === "Active"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                          : "bg-rose-50 text-rose-700 border-rose-100"
                      }`}
                    >
                      {u.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-xs text-slate-500">{u.dateCreated}</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => openEdit(u)}
                        disabled={actionLoading}
                        title="Edit Status"
                        className="w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-600 flex items-center justify-center border border-transparent hover:border-slate-200 transition-all disabled:opacity-40"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => openDelete(u)}
                        disabled={actionLoading}
                        title="Delete Account"
                        className="w-8 h-8 rounded-lg hover:bg-rose-50 text-rose-500 flex items-center justify-center border border-transparent hover:border-rose-100 transition-all disabled:opacity-40"
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

      {/* Add Account Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-extrabold text-slate-800 text-base">Add New Account</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:bg-slate-100 p-1.5 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAdd} className="p-6 space-y-4">
              {/* Account Type Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Account Type / Role <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAddFormData((p) => ({ ...p, role: "Patient" }))}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      addFormData.role === "Patient"
                        ? "bg-teal-50 border-teal-300 text-teal-800 shadow-sm"
                        : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                    }`}
                  >
                    <UserIcon size={15} /> Patient (User)
                  </button>
                  <button
                    type="button"
                    onClick={() => setAddFormData((p) => ({ ...p, role: "Admin" }))}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      addFormData.role === "Admin"
                        ? "bg-violet-50 border-violet-300 text-violet-800 shadow-sm"
                        : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                    }`}
                  >
                    <Shield size={15} /> Admin Account
                  </button>
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={addFormData.name}
                  onChange={(e) => setAddFormData((p) => ({ ...p, name: e.target.value }))}
                  placeholder={addFormData.role === "Admin" ? "e.g. Kwame Mensah (Admin)" : "e.g. Ama Serwaa"}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={addFormData.email}
                  onChange={(e) => setAddFormData((p) => ({ ...p, email: e.target.value }))}
                  placeholder="name@example.com"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>

              {/* Telephone / Phone */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Telephone / Phone <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={addFormData.phone}
                  onChange={(e) => setAddFormData((p) => ({ ...p, phone: e.target.value }))}
                  placeholder="+233 24 123 4567"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-mono"
                />
              </div>

              {/* Location / Address */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Location / Residential Address {addFormData.role === "Patient" && <span className="text-rose-500">*</span>}
                </label>
                <input
                  type="text"
                  required={addFormData.role === "Patient"}
                  value={addFormData.location}
                  onChange={(e) => setAddFormData((p) => ({ ...p, location: e.target.value }))}
                  placeholder="e.g. East Legon, Accra"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>

              {/* Age (shown for Patient) */}
              {addFormData.role === "Patient" && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Age <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={120}
                    value={addFormData.age}
                    onChange={(e) => setAddFormData((p) => ({ ...p, age: e.target.value }))}
                    placeholder="e.g. 28"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-mono"
                  />
                </div>
              )}

              {/* Password */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Password <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={addFormData.password}
                  onChange={(e) => setAddFormData((p) => ({ ...p, password: e.target.value }))}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>

              {/* Buttons */}
              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  disabled={actionLoading}
                  className="px-4 py-2 border border-slate-200 text-slate-600 font-bold rounded-xl text-xs hover:bg-slate-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl text-xs shadow-md shadow-teal-700/20 transition-all flex items-center gap-1.5 disabled:opacity-60"
                >
                  {actionLoading ? "Creating…" : `Create ${addFormData.role}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Account Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-extrabold text-slate-800 text-base">Edit User Account</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-slate-400 hover:bg-slate-100 p-1.5 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleEdit} className="p-6 space-y-4">
              {/* Account Type Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Account Type / Role
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditFormData((p) => ({ ...p, role: "Patient" }))}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      editFormData.role === "Patient"
                        ? "bg-teal-50 border-teal-300 text-teal-800 shadow-sm"
                        : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                    }`}
                  >
                    <UserIcon size={14} /> Patient (User)
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditFormData((p) => ({ ...p, role: "Admin" }))}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      editFormData.role === "Admin"
                        ? "bg-violet-50 border-violet-300 text-violet-800 shadow-sm"
                        : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                    }`}
                  >
                    <Shield size={14} /> Admin Account
                  </button>
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.name}
                  onChange={(e) => setEditFormData((p) => ({ ...p, name: e.target.value }))}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-semibold"
                />
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={editFormData.email}
                  onChange={(e) => setEditFormData((p) => ({ ...p, email: e.target.value }))}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>

              {/* Telephone / Phone */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Telephone / Phone
                </label>
                <input
                  type="text"
                  value={editFormData.phone}
                  onChange={(e) => setEditFormData((p) => ({ ...p, phone: e.target.value }))}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-mono"
                />
              </div>

              {/* Location / Address */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Location / Address
                </label>
                <input
                  type="text"
                  value={editFormData.location}
                  onChange={(e) => setEditFormData((p) => ({ ...p, location: e.target.value }))}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>

              {/* Status and Age grid */}
              <div className="grid grid-cols-2 gap-3">
                {editFormData.role === "Patient" && (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      Age
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={120}
                      value={editFormData.age}
                      onChange={(e) => setEditFormData((p) => ({ ...p, age: e.target.value }))}
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-mono"
                    />
                  </div>
                )}
                <div className={editFormData.role === "Patient" ? "" : "col-span-2"}>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Account Status
                  </label>
                  <select
                    value={editFormData.status}
                    onChange={(e) => setEditFormData((p) => ({ ...p, status: e.target.value as UserAccount["status"] }))}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 bg-white font-bold"
                  >
                    <option value="Active">Active</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
              </div>

              {/* Submit buttons */}
              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  disabled={actionLoading}
                  className="px-4 py-2 border border-slate-200 text-slate-600 font-bold rounded-xl text-xs hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl text-xs shadow-md shadow-teal-700/20 transition-all disabled:opacity-60"
                >
                  {actionLoading ? "Saving…" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl border border-slate-200 p-6 text-center space-y-4 animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle size={22} className="stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-800 text-lg">Delete Account?</h3>
              <p className="text-slate-500 text-xs mt-1.5">
                Permanently remove <span className="font-bold text-slate-700">{currentUser?.name}</span>? This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={actionLoading}
                className="flex-1 py-2.5 border border-slate-200 text-slate-600 font-bold rounded-xl text-xs hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={actionLoading}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shadow-md shadow-rose-600/25 disabled:opacity-60 flex items-center justify-center gap-1.5"
              >
                {actionLoading ? "Deleting…" : "Delete Account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

