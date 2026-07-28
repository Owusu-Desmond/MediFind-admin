import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface AdminNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: "info" | "success" | "warning";
}

interface NotificationsState {
  items: AdminNotification[];
}

const initialNotifications: AdminNotification[] = [
  {
    id: "notif-1",
    title: "System Synchronization Active",
    message: "MediFind Admin connected directly to national backend database.",
    time: "Just now",
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
];

const initialState: NotificationsState = {
  items: initialNotifications,
};

const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<Omit<AdminNotification, "id" | "time" | "read">>) => {
      state.items.unshift({
        ...action.payload,
        id: `notif-${Date.now()}`,
        time: "Just now",
        read: false,
      });
    },
    markNotificationRead: (state, action: PayloadAction<string>) => {
      const notif = state.items.find((n) => n.id === action.payload);
      if (notif) {
        notif.read = true;
      }
    },
  },
});

export const { addNotification, markNotificationRead } = notificationsSlice.actions;
export default notificationsSlice.reducer;
