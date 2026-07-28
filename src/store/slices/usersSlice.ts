import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { apiClient } from "../apiClient";

export interface BackendUser {
  id: number;
  email: string;
  name: string;
  role: "Admin" | "Pharmacist" | "Patient";
  phone?: string | null;
  location?: string | null;
  status: "Active" | "Suspended";
  date_created?: string;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "Pharmacist" | "Patient";
  status: "Active" | "Suspended";
  dateCreated: string;
}

export function transformUser(bu: BackendUser): UserAccount {
  return {
    id: bu.id.toString(),
    name: bu.name,
    email: bu.email,
    role: bu.role,
    status: bu.status,
    dateCreated: bu.date_created ? new Date(bu.date_created).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
  };
}

interface UsersState {
  items: UserAccount[];
  loading: boolean;
  error: string | null;
}

const initialState: UsersState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchUsers = createAsyncThunk(
  "users/fetchUsers",
  async (_, { rejectWithValue }) => {
    try {
      const data = await apiClient<BackendUser[]>("/api/users/");
      return data.map(transformUser);
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to fetch users");
    }
  }
);

export const updateUserStatus = createAsyncThunk(
  "users/updateUserStatus",
  async ({ id, status }: { id: string; status: "Active" | "Suspended" }, { rejectWithValue }) => {
    try {
      const updated = await apiClient<BackendUser>(`/api/users/${id}/status?status=${status}`, {
        method: "PATCH",
      });
      return transformUser(updated);
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to update user status");
    }
  }
);

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action: PayloadAction<UserAccount[]>) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateUserStatus.fulfilled, (state, action: PayloadAction<UserAccount>) => {
        const index = state.items.findIndex((u) => u.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      });
  },
});

export default usersSlice.reducer;
