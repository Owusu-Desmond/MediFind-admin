"use client";

import React, { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { updateUserStatus, UserAccount } from "@/store/slices/usersSlice";
import { Plus, Search, Edit2, Trash2, X, AlertTriangle } from "lucide-react";

export default function UsersPage() {
  const dispatch = useAppDispatch();
  const users = useAppSelector((state) => state.users.items);
  const loading = useAppSelector((state) => state.users.loading);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "Patient" as UserAccount["role"],
    status: "Active" as UserAccount["status"],
  });

  const roles = ["All", "Admin", "Pharmacist", "Patient"];

  const filtered = users.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "All" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const openAdd = () => {
    setFormData({ name: "", email: "", role: "Patient", status: "Active" });
    setShowAddModal(true);
  };
  const openEdit = (u: UserAccount) => {
    setCurrentUser(u);
    setFormData({ name: u.name, email: u.email, role: u.role, status: u.status });
    setShowEditModal(true);
  };
  const openDelete = (u: UserAccount) => {
    setCurrentUser(u);
    setShowDeleteModal(true);
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setShowAddModal(false);
  };
  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser && currentUser.status !== formData.status) {
      dispatch(updateUserStatus({ id: currentUser.id, status: formData.status }));
    }
    setShowEditModal(false);
  };
  const handleDelete = () => {
    setShowDeleteModal(false);
  };

  const roleBadge = (role: string) => {
    if (role === "Admin") return "bg-violet-50 text-violet-700 border-violet-100";
    if (role === "Pharmacist") return "bg-teal-50 text-primary border-teal-100";
    return "bg-slate-50 text-slate-600 border-slate-200";
  };

  const ModalForm = ({ onSubmit, title, onClose }: { onSubmit: (e: React.FormEvent) => void; title: string; onClose: () => void }) => (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-extrabold text-slate-800">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:bg-slate-100 p-1.5 rounded-lg"><X size={18} /></button>
        </div>
        <form onSubmit={onSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Full Name</label>
            <input type="text" required value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Email Address</label>
            <input type="email" required value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Role</label>
              <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value as UserAccount["role"] })}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white">
                {["Admin", "Pharmacist", "Patient"].map((r) => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Status</label>
              <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as UserAccount["status"] })}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white">
                {["Active", "Suspended"].map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-slate-200 text-slate-600 font-bold rounded-xl text-xs hover:bg-slate-50">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-primary hover:bg-teal-800 text-white font-bold rounded-xl text-xs shadow-md shadow-teal-700/20">Save User</button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">User Management</h2>
          <p className="text-xs text-slate-400 mt-0.5">Manage all registered patients, pharmacists, and admin accounts</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-primary hover:bg-teal-800 text-white font-bold py-2.5 px-5 rounded-xl shadow-lg shadow-teal-700/20 text-sm transition-all">
          <Plus size={15} className="stroke-[3]" /> Add User
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {roles.map((r) => (
            <button key={r} onClick={() => setRoleFilter(r)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${roleFilter === r ? "bg-teal-50 border-teal-200 text-primary" : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"}`}>
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-100 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              <th className="py-4 px-6">User</th>
              <th className="py-4 px-6">Role</th>
              <th className="py-4 px-6">Status</th>
              <th className="py-4 px-6">Date Created</th>
              <th className="py-4 px-6 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="py-16 text-center text-sm text-slate-400 font-semibold">Loading users from backend...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5} className="py-16 text-center text-sm text-slate-400 font-semibold">No users found matching your criteria.</td></tr>
            ) : (
              filtered.map((u) => (
                <tr key={u.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors text-sm">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-sm shrink-0">
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{u.name}</p>
                        <p className="text-[11px] text-slate-400">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${roleBadge(u.role)}`}>{u.role}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${u.status === "Active" ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-rose-50 text-rose-700 border-rose-100"}`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-xs text-slate-500">{u.dateCreated}</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => openEdit(u)} className="w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-600 flex items-center justify-center border border-transparent hover:border-slate-200 transition-all"><Edit2 size={14} /></button>
                      <button onClick={() => openDelete(u)} className="w-8 h-8 rounded-lg hover:bg-rose-50 text-rose-500 flex items-center justify-center border border-transparent hover:border-rose-100 transition-all"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showAddModal && <ModalForm title="Add New User Account" onSubmit={handleAdd} onClose={() => setShowAddModal(false)} />}
      {showEditModal && <ModalForm title="Edit User Details" onSubmit={handleEdit} onClose={() => setShowEditModal(false)} />}

      {/* Delete confirmation */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl border border-slate-200 p-6 text-center space-y-4 animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto"><AlertTriangle size={22} className="stroke-[2.5]" /></div>
            <div>
              <h3 className="font-extrabold text-slate-800 text-lg">Delete User Account?</h3>
              <p className="text-slate-500 text-xs mt-1.5">Remove <span className="font-bold text-slate-700">{currentUser?.name}</span> permanently? This cannot be undone.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-2.5 border border-slate-200 text-slate-600 font-bold rounded-xl text-xs hover:bg-slate-50">Cancel</button>
              <button onClick={handleDelete} className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shadow-md shadow-rose-600/25">Delete User</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
