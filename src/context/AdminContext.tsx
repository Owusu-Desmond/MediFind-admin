"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "Pharmacist" | "Patient";
  status: "Active" | "Suspended";
  dateCreated: string;
}

export interface Pharmacy {
  id: string;
  name: string;
  location: string;
  licenseNumber: string;
  pharmacistName: string;
  pharmacistId: string;
  status: "Approved" | "Pending Approval" | "Suspended";
  phone: string;
  email: string;
  dateSubmitted: string;
}

interface AdminNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: "info" | "success" | "warning";
}

interface AdminContextType {
  admin: { email: string; name: string } | null;
  users: UserAccount[];
  pharmacies: Pharmacy[];
  notifications: AdminNotification[];
  login: (email: string) => boolean;
  logout: () => void;
  addUser: (user: Omit<UserAccount, "id" | "dateCreated">) => void;
  updateUser: (id: string, user: Partial<UserAccount>) => void;
  deleteUser: (id: string) => void;
  addPharmacy: (pharmacy: Omit<Pharmacy, "id" | "status" | "dateSubmitted">) => void;
  updatePharmacy: (id: string, pharmacy: Partial<Pharmacy>) => void;
  deletePharmacy: (id: string) => void;
  approvePharmacy: (id: string) => void;
  suspendPharmacy: (id: string) => void;
  markNotificationRead: (id: string) => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

const initialUsers: UserAccount[] = [
  {
    id: "usr-1",
    name: "Dr. Emmanuel Mensah",
    email: "central@ghanapharmacy.gov.gh",
    role: "Pharmacist",
    status: "Active",
    dateCreated: "2026-06-24",
  },
  {
    id: "usr-2",
    name: "Kwame Mensah",
    email: "kwame.mensah@gmail.com",
    role: "Patient",
    status: "Active",
    dateCreated: "2026-07-01",
  },
  {
    id: "usr-3",
    name: "Abena Osei",
    email: "abena.osei@yahoo.com",
    role: "Patient",
    status: "Active",
    dateCreated: "2026-07-02",
  },
  {
    id: "usr-4",
    name: "Justice Boateng",
    email: "justice.admin@medifind.com",
    role: "Admin",
    status: "Active",
    dateCreated: "2026-06-20",
  },
  {
    id: "usr-5",
    name: "Dr. Jane Osei",
    email: "jane@eastlegonpharmacy.com",
    role: "Pharmacist",
    status: "Active",
    dateCreated: "2026-07-10",
  },
  {
    id: "usr-6",
    name: "Kofi Boateng",
    email: "kofi.boateng@gmail.com",
    role: "Patient",
    status: "Suspended",
    dateCreated: "2026-07-05",
  },
];

const initialPharmacies: Pharmacy[] = [
  {
    id: "phr-1",
    name: "Ghana National Pharmacy (Accra Central)",
    location: "Ring Road Central, Near Kwame Nkrumah Interchange, Accra",
    licenseNumber: "PHA-GH-2026-8830",
    pharmacistName: "Dr. Emmanuel Mensah",
    pharmacistId: "RPH-GH-8830",
    status: "Approved",
    phone: "+233 30 223 4455",
    email: "central@ghanapharmacy.gov.gh",
    dateSubmitted: "2026-06-24",
  },
  {
    id: "phr-2",
    name: "East Legon Pharmacy Ltd",
    location: "14 Boundary Road, East Legon, Accra",
    licenseNumber: "PHA-GH-2026-9040",
    pharmacistName: "Dr. Jane Osei",
    pharmacistId: "RPH-GH-9022",
    status: "Pending Approval",
    phone: "+233 24 123 4567",
    email: "eastlegon@ghanapharmacy.com",
    dateSubmitted: "2026-07-12",
  },
  {
    id: "phr-3",
    name: "Accra Mall Pharmacy Center",
    location: "Tetteh Quarshie Interchange, Spintex, Accra",
    licenseNumber: "PHA-GH-2026-1022",
    pharmacistName: "Dr. Alfred Kojo",
    pharmacistId: "RPH-GH-1021",
    status: "Approved",
    phone: "+233 20 882 1200",
    email: "accramall@pharmacy.com",
    dateSubmitted: "2026-06-28",
  },
  {
    id: "phr-4",
    name: "Tema Community 1 Dispensary",
    location: "Community 1 Market Area, Tema",
    licenseNumber: "PHA-GH-2026-3022",
    pharmacistName: "Dr. Faustina Amma",
    pharmacistId: "RPH-GH-3029",
    status: "Suspended",
    phone: "+233 30 320 4481",
    email: "temac1@dispensary.com",
    dateSubmitted: "2026-07-03",
  },
];

const initialNotifications: AdminNotification[] = [
  {
    id: "notif-1",
    title: "New Registration Request",
    message: "East Legon Pharmacy Ltd has submitted a branch registration. Verification required.",
    time: "1 hour ago",
    read: false,
    type: "info",
  },
  {
    id: "notif-2",
    title: "License Warning Alert",
    message: "Tema Community 1 Dispensary's license is flag-suspended by the Pharmacy Council.",
    time: "2 days ago",
    read: false,
    type: "warning",
  },
  {
    id: "notif-3",
    title: "Verification Approved",
    message: "Accra Mall Pharmacy Center was successfully approved.",
    time: "3 days ago",
    read: true,
    type: "success",
  },
];

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [admin, setAdmin] = useState<{ email: string; name: string } | null>(null);
  const [users, setUsers] = useState<UserAccount[]>(initialUsers);
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>(initialPharmacies);
  const [notifications, setNotifications] = useState<AdminNotification[]>(initialNotifications);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from local storage
  useEffect(() => {
    const storedAdmin = localStorage.getItem("admin_user");
    const storedUsers = localStorage.getItem("admin_users");
    const storedPharms = localStorage.getItem("admin_pharmacies");
    const storedNotifs = localStorage.getItem("admin_notifications");

    if (storedAdmin) setAdmin(JSON.parse(storedAdmin));
    if (storedUsers) setUsers(JSON.parse(storedUsers));
    if (storedPharms) setPharmacies(JSON.parse(storedPharms));
    if (storedNotifs) setNotifications(JSON.parse(storedNotifs));

    setIsLoaded(true);
  }, []);

  // Save changes
  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem("admin_user", admin ? JSON.stringify(admin) : "");
    localStorage.setItem("admin_users", JSON.stringify(users));
    localStorage.setItem("admin_pharmacies", JSON.stringify(pharmacies));
    localStorage.setItem("admin_notifications", JSON.stringify(notifications));
  }, [admin, users, pharmacies, notifications, isLoaded]);

  const login = (email: string): boolean => {
    const name = email.split("@")[0].charAt(0).toUpperCase() + email.split("@")[0].slice(1);
    setAdmin({ email, name: name + " (MediFind Auditor)" });
    return true;
  };

  const logout = () => {
    setAdmin(null);
    localStorage.removeItem("admin_user");
  };

  const addUser = (userData: Omit<UserAccount, "id" | "dateCreated">) => {
    const newUser: UserAccount = {
      ...userData,
      id: `usr-${Date.now()}`,
      dateCreated: new Date().toISOString().split("T")[0],
    };
    setUsers((prev) => [newUser, ...prev]);
  };

  const updateUser = (id: string, updatedFields: Partial<UserAccount>) => {
    setUsers((prev) =>
      prev.map((usr) => (usr.id === id ? { ...usr, ...updatedFields } : usr))
    );
  };

  const deleteUser = (id: string) => {
    setUsers((prev) => prev.filter((usr) => usr.id !== id));
  };

  const addPharmacy = (pharmacyData: Omit<Pharmacy, "id" | "status" | "dateSubmitted">) => {
    const newPharmacy: Pharmacy = {
      ...pharmacyData,
      id: `phr-${Date.now()}`,
      status: "Pending Approval",
      dateSubmitted: new Date().toISOString().split("T")[0],
    };
    setPharmacies((prev) => [newPharmacy, ...prev]);

    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: "New Registration",
        message: `${newPharmacy.name} has submitted a registration request.`,
        time: "Just now",
        read: false,
        type: "info",
      },
      ...prev,
    ]);
  };

  const updatePharmacy = (id: string, updatedFields: Partial<Pharmacy>) => {
    setPharmacies((prev) =>
      prev.map((phr) => (phr.id === id ? { ...phr, ...updatedFields } : phr))
    );
  };

  const deletePharmacy = (id: string) => {
    setPharmacies((prev) => prev.filter((phr) => phr.id !== id));
  };

  const approvePharmacy = (id: string) => {
    setPharmacies((prev) =>
      prev.map((phr) => (phr.id === id ? { ...phr, status: "Approved" } : phr))
    );

    // Add a corresponding pharmacist user account automatically!
    const phrm = pharmacies.find((p) => p.id === id);
    if (phrm) {
      // Check if user already exists
      const userExists = users.some((u) => u.email === phrm.email);
      if (!userExists) {
        addUser({
          name: phrm.pharmacistName,
          email: phrm.email,
          role: "Pharmacist",
          status: "Active",
        });
      }
      
      setNotifications((prev) => [
        {
          id: `notif-${Date.now()}`,
          title: "Pharmacy Approved",
          message: `${phrm.name} has been verified and registered on the network.`,
          time: "Just now",
          read: false,
          type: "success",
        },
        ...prev,
      ]);
    }
  };

  const suspendPharmacy = (id: string) => {
    setPharmacies((prev) =>
      prev.map((phr) => (phr.id === id ? { ...phr, status: "Suspended" } : phr))
    );

    const phrm = pharmacies.find((p) => p.id === id);
    if (phrm) {
      setNotifications((prev) => [
        {
          id: `notif-${Date.now()}`,
          title: "Pharmacy Suspended",
          message: `${phrm.name} has been suspended from the network.`,
          time: "Just now",
          read: false,
          type: "warning",
        },
        ...prev,
      ]);
    }
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  return (
    <AdminContext.Provider
      value={{
        admin,
        users,
        pharmacies,
        notifications,
        login,
        logout,
        addUser,
        updateUser,
        deleteUser,
        addPharmacy,
        updatePharmacy,
        deletePharmacy,
        approvePharmacy,
        suspendPharmacy,
        markNotificationRead,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
};
