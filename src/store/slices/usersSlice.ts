import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { apiClient } from "../apiClient";

export interface BackendUser {
  id: number;
  email: string;
  name: string;
  role: "Admin" | "Pharmacist" | "Patient";
  phone?: string | null;
  location?: string | null;
  age?: number | null;
  status: "Active" | "Suspended";
  date_created?: string;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "Pharmacist" | "Patient";
  phone?: string | null;
  location?: string | null;
  age?: number | null;
  status: "Active" | "Suspended";
  dateCreated: string;
}

export function transformUser(bu: BackendUser): UserAccount {
  return {
    id: bu.id.toString(),
    name: bu.name,
    email: bu.email,
    role: bu.role,
    phone: bu.phone,
    location: bu.location,
    age: bu.age,
    status: bu.status,
    dateCreated: bu.date_created ? new Date(bu.date_created).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
  };
}

interface UsersState {
  items: UserAccount[];
  loading: boolean;
  actionLoading: boolean;
  error: string | null;
}

const initialState: UsersState = {
  items: [],
  loading: false,
  actionLoading: false,
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

export interface UpdateUserInput {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  age?: number | null;
  role?: "Admin" | "Patient";
  status?: "Active" | "Suspended";
}

export const updateUser = createAsyncThunk(
  "users/updateUser",
  async (input: UpdateUserInput, { rejectWithValue }) => {
    try {
      const { id, ...body } = input;
      const updated = await apiClient<BackendUser>(`/api/users/${id}`, {
        method: "PUT",
        body: JSON.stringify(body),
      });
      return transformUser(updated);
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to update user account");
    }
  }
);

export interface AddUserInput {
  name: string;
  email: string;
  phone?: string;
  location?: string;
  age?: number | null;
  password?: string;
  role: "Admin" | "Patient";
}

export const addUser = createAsyncThunk(
  "users/addUser",
  async (userData: AddUserInput, { rejectWithValue }) => {
    try {
      const payload = {
        name: userData.name,
        email: userData.email,
        phone: userData.phone || null,
        location: userData.location || null,
        age: userData.age ?? null,
        password: userData.password,
        role: userData.role,
      };
      const created = await apiClient<BackendUser>("/api/users/", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      return transformUser(created);
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to create user account");
    }
  }
);

export const deleteUser = createAsyncThunk(
  "users/deleteUser",
  async (id: string, { rejectWithValue }) => {
    try {
      await apiClient<{ message: string }>(`/api/users/${id}`, {
        method: "DELETE",
      });
      return id;
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to delete user");
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
      })
      .addCase(updateUser.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action: PayloadAction<UserAccount>) => {
        state.actionLoading = false;
        const index = state.items.findIndex((u) => u.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload as string;
      })
      .addCase(addUser.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(addUser.fulfilled, (state, action: PayloadAction<UserAccount>) => {
        state.actionLoading = false;
        state.items.unshift(action.payload);
      })
      .addCase(addUser.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteUser.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action: PayloadAction<string>) => {
        state.actionLoading = false;
        state.items = state.items.filter((u) => u.id !== action.payload);
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload as string;
      });
  },
});

export default usersSlice.reducer;
