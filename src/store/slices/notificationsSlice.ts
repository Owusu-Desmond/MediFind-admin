import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  getAdminNotifications,
  markAdminNotificationRead,
  markAllAdminNotificationsRead,
  BackendAdminNotification,
} from "../apiClient";

export interface AdminNotification {
  id: string;
  numericId?: number;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: "info" | "success" | "warning";
  notificationType?: string;
  actionUrl?: string;
  referenceType?: string;
  referenceId?: string;
}

function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diffSec < 60) return "Just now";
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    return date.toLocaleDateString("en-GB", { month: "short", day: "numeric" });
  } catch {
    return "Recently";
  }
}

function mapBackendToAdminNotification(n: BackendAdminNotification): AdminNotification {
  let type: "info" | "success" | "warning" = "info";
  if (n.notification_type.includes("APPROVED") || n.notification_type.includes("SUCCESS")) {
    type = "success";
  } else if (
    n.notification_type.includes("ALERT") ||
    n.notification_type.includes("FAILURE") ||
    n.notification_type.includes("ISSUE") ||
    n.notification_type.includes("REJECT") ||
    n.notification_type.includes("SUSPICIOUS")
  ) {
    type = "warning";
  }

  return {
    id: String(n.id),
    numericId: n.id,
    title: n.title,
    message: n.message,
    time: formatRelativeTime(n.created_at),
    read: n.is_read,
    type,
    notificationType: n.notification_type,
    actionUrl: n.action_url,
    referenceType: n.reference_type,
    referenceId: n.reference_id,
  };
}

export const fetchAdminNotifications = createAsyncThunk(
  "notifications/fetchAdminNotifications",
  async (_, { rejectWithValue }) => {
    try {
      const res = await getAdminNotifications();
      return res;
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to fetch notifications");
    }
  }
);

export const markNotificationReadAsync = createAsyncThunk(
  "notifications/markNotificationReadAsync",
  async (id: string, { rejectWithValue }) => {
    const numericId = Number(id);
    if (!isNaN(numericId)) {
      try {
        await markAdminNotificationRead(numericId);
      } catch (err: any) {
        console.warn("Failed to mark admin notification read on backend:", err);
      }
    }
    return id;
  }
);

export const markAllNotificationsReadAsync = createAsyncThunk(
  "notifications/markAllNotificationsReadAsync",
  async (_, { rejectWithValue }) => {
    try {
      await markAllAdminNotificationsRead();
    } catch (err: any) {
      console.warn("Failed to mark all admin notifications read on backend:", err);
    }
  }
);

interface NotificationsState {
  items: AdminNotification[];
  unreadCount: number;
  loading: boolean;
}

const initialState: NotificationsState = {
  items: [],
  unreadCount: 0,
  loading: false,
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
      state.unreadCount += 1;
    },
    markNotificationRead: (state, action: PayloadAction<string>) => {
      const notif = state.items.find((n) => n.id === action.payload);
      if (notif && !notif.read) {
        notif.read = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminNotifications.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAdminNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.items = (action.payload.items || []).map(mapBackendToAdminNotification);
        state.unreadCount = action.payload.unread_count || 0;
      })
      .addCase(fetchAdminNotifications.rejected, (state) => {
        state.loading = false;
      })
      .addCase(markNotificationReadAsync.fulfilled, (state, action) => {
        const notif = state.items.find((n) => n.id === action.payload);
        if (notif && !notif.read) {
          notif.read = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      .addCase(markAllNotificationsReadAsync.fulfilled, (state) => {
        state.items.forEach((n) => {
          n.read = true;
        });
        state.unreadCount = 0;
      });
  },
});

export const { addNotification, markNotificationRead } = notificationsSlice.actions;
export default notificationsSlice.reducer;
