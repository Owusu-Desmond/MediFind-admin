import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { apiClient } from "../apiClient";

export interface BackendPharmacy {
  id: number;
  name: string;
  location: string;
  license_number: string;
  pharmacist_name?: string | null;
  pharmacist_id?: string | null;
  phone?: string | null;
  email?: string | null;
  status: "Approved" | "Pending Approval" | "Suspended";
  date_submitted?: string;
  delivery_offered?: boolean;
  opening_hours?: string | null;
  lat?: number | null;
  lng?: number | null;
  verified?: boolean;
  certificate_url?: string | null;
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
  deliveryOffered: boolean;
  openingHours: string;
  lat: number | null;
  lng: number | null;
  certificateUrl?: string | null;
}

export function transformPharmacy(bp: BackendPharmacy): Pharmacy {
  return {
    id: bp.id.toString(),
    name: bp.name,
    location: bp.location,
    licenseNumber: bp.license_number || "",
    pharmacistName: bp.pharmacist_name || "N/A",
    pharmacistId: bp.pharmacist_id || "N/A",
    status: bp.status,
    phone: bp.phone || "",
    email: bp.email || "",
    dateSubmitted: bp.date_submitted ? new Date(bp.date_submitted).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
    deliveryOffered: bp.delivery_offered ?? false,
    openingHours: bp.opening_hours || "",
    lat: bp.lat ?? null,
    lng: bp.lng ?? null,
    certificateUrl: bp.certificate_url || null,
  };
}

interface PharmaciesState {
  items: Pharmacy[];
  loading: boolean;
  pendingIds: string[];
  submittingForm: boolean;
  error: string | null;
}

const initialState: PharmaciesState = {
  items: [],
  loading: false,
  pendingIds: [],
  submittingForm: false,
  error: null,
};

export const fetchPharmacies = createAsyncThunk(
  "pharmacies/fetchPharmacies",
  async (_, { rejectWithValue }) => {
    try {
      const data = await apiClient<BackendPharmacy[]>("/api/pharmacies/");
      return data.map(transformPharmacy);
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to fetch pharmacies");
    }
  }
);

export const approvePharmacy = createAsyncThunk(
  "pharmacies/approvePharmacy",
  async (id: string, { rejectWithValue }) => {
    try {
      const updated = await apiClient<BackendPharmacy>(`/api/pharmacies/${id}/status?status=Approved`, {
        method: "PATCH",
      });
      return transformPharmacy(updated);
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to approve pharmacy");
    }
  }
);

export const suspendPharmacy = createAsyncThunk(
  "pharmacies/suspendPharmacy",
  async (id: string, { rejectWithValue }) => {
    try {
      const updated = await apiClient<BackendPharmacy>(`/api/pharmacies/${id}/status?status=Suspended`, {
        method: "PATCH",
      });
      return transformPharmacy(updated);
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to suspend pharmacy");
    }
  }
);

interface AddPharmacyInput extends Omit<Pharmacy, "id" | "status" | "dateSubmitted"> {
  certificateFile?: File | null;
}

export const addPharmacy = createAsyncThunk(
  "pharmacies/addPharmacy",
  async (pharmacyData: AddPharmacyInput, { rejectWithValue }) => {
    try {
      let certificateUrl = pharmacyData.certificateUrl || null;

      // If a raw certificate file is attached, upload it first to the server endpoint
      if (pharmacyData.certificateFile) {
        const fileFormData = new FormData();
        fileFormData.append("file", pharmacyData.certificateFile);
        const uploadRes = await apiClient<{ url: string }>("/api/pharmacies/upload-certificate", {
          method: "POST",
          body: fileFormData,
        });
        certificateUrl = uploadRes.url;
      }

      const payload = {
        name: pharmacyData.name,
        location: pharmacyData.location,
        license_number: pharmacyData.licenseNumber,
        pharmacist_name: pharmacyData.pharmacistName,
        pharmacist_id: pharmacyData.pharmacistId,
        phone: pharmacyData.phone,
        email: pharmacyData.email,
        delivery_offered: pharmacyData.deliveryOffered,
        opening_hours: pharmacyData.openingHours,
        lat: pharmacyData.lat,
        lng: pharmacyData.lng,
        certificate_url: certificateUrl,
      };
      const newPh = await apiClient<BackendPharmacy>("/api/pharmacies/", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      return transformPharmacy(newPh);
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to add pharmacy");
    }
  }
);

export interface UpdatePharmacyInput extends Partial<Omit<Pharmacy, "dateSubmitted">> {
  id: string;
  certificateFile?: File | null;
}

export const updatePharmacy = createAsyncThunk(
  "pharmacies/updatePharmacy",
  async (pharmacyData: UpdatePharmacyInput, { rejectWithValue }) => {
    try {
      let certificateUrl = pharmacyData.certificateUrl;

      if (pharmacyData.certificateFile) {
        const fileFormData = new FormData();
        fileFormData.append("file", pharmacyData.certificateFile);
        const uploadRes = await apiClient<{ url: string }>("/api/pharmacies/upload-certificate", {
          method: "POST",
          body: fileFormData,
        });
        certificateUrl = uploadRes.url;
      }

      const payload: Record<string, any> = {};
      if (pharmacyData.name !== undefined) payload.name = pharmacyData.name;
      if (pharmacyData.location !== undefined) payload.location = pharmacyData.location;
      if (pharmacyData.licenseNumber !== undefined) payload.license_number = pharmacyData.licenseNumber;
      if (pharmacyData.pharmacistName !== undefined) payload.pharmacist_name = pharmacyData.pharmacistName;
      if (pharmacyData.pharmacistId !== undefined) payload.pharmacist_id = pharmacyData.pharmacistId;
      if (pharmacyData.phone !== undefined) payload.phone = pharmacyData.phone;
      if (pharmacyData.email !== undefined) payload.email = pharmacyData.email;
      if (pharmacyData.deliveryOffered !== undefined) payload.delivery_offered = pharmacyData.deliveryOffered;
      if (pharmacyData.openingHours !== undefined) payload.opening_hours = pharmacyData.openingHours;
      if (pharmacyData.lat !== undefined) payload.lat = pharmacyData.lat;
      if (pharmacyData.lng !== undefined) payload.lng = pharmacyData.lng;
      if (certificateUrl !== undefined) payload.certificate_url = certificateUrl;
      if (pharmacyData.status !== undefined) payload.status = pharmacyData.status;

      const updated = await apiClient<BackendPharmacy>(`/api/pharmacies/${pharmacyData.id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      return transformPharmacy(updated);
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to update pharmacy");
    }
  }
);

export const deletePharmacy = createAsyncThunk(
  "pharmacies/deletePharmacy",
  async (id: string, { rejectWithValue }) => {
    try {
      await apiClient<{ message: string }>(`/api/pharmacies/${id}`, {
        method: "DELETE",
      });
      return id;
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to delete pharmacy");
    }
  }
);

const pharmaciesSlice = createSlice({
  name: "pharmacies",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetchPharmacies
      .addCase(fetchPharmacies.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPharmacies.fulfilled, (state, action: PayloadAction<Pharmacy[]>) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchPharmacies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // approvePharmacy
      .addCase(approvePharmacy.fulfilled, (state, action: PayloadAction<Pharmacy>) => {
        state.pendingIds = state.pendingIds.filter((id) => id !== action.payload.id);
        const index = state.items.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        } else {
          state.items.push(action.payload);
        }
      })

      // suspendPharmacy
      .addCase(suspendPharmacy.fulfilled, (state, action: PayloadAction<Pharmacy>) => {
        state.pendingIds = state.pendingIds.filter((id) => id !== action.payload.id);
        const index = state.items.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        } else {
          state.items.push(action.payload);
        }
      })

      // addPharmacy
      .addCase(addPharmacy.fulfilled, (state, action: PayloadAction<Pharmacy>) => {
        state.submittingForm = false;
        state.items.unshift(action.payload);
      })

      // updatePharmacy
      .addCase(updatePharmacy.fulfilled, (state, action: PayloadAction<Pharmacy>) => {
        state.pendingIds = state.pendingIds.filter((id) => id !== action.payload.id);
        state.submittingForm = false;
        const index = state.items.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })

      // deletePharmacy
      .addCase(deletePharmacy.fulfilled, (state, action: PayloadAction<string>) => {
        state.pendingIds = state.pendingIds.filter((id) => id !== action.payload);
        state.items = state.items.filter((p) => p.id !== action.payload);
      })

      // Action Pending Handlers (adds ID to pendingIds)
      .addMatcher(
        (action) =>
          action.type.startsWith("pharmacies/") &&
          action.type.endsWith("/pending") &&
          !action.type.includes("fetchPharmacies"),
        (state, action: any) => {
          state.error = null;
          const arg = action.meta?.arg;
          let id: string | null = null;
          if (typeof arg === "string") {
            id = arg;
          } else if (arg && typeof arg === "object" && arg.id) {
            id = String(arg.id);
          } else {
            state.submittingForm = true;
          }
          if (id && !state.pendingIds.includes(id)) {
            state.pendingIds.push(id);
          }
        }
      )
      // Action Rejected Handlers (removes ID from pendingIds)
      .addMatcher(
        (action) =>
          action.type.startsWith("pharmacies/") &&
          action.type.endsWith("/rejected") &&
          !action.type.includes("fetchPharmacies"),
        (state, action: any) => {
          state.submittingForm = false;
          state.error = action.payload as string;
          const arg = action.meta?.arg;
          let id: string | null = null;
          if (typeof arg === "string") {
            id = arg;
          } else if (arg && typeof arg === "object" && arg.id) {
            id = String(arg.id);
          }
          if (id) {
            state.pendingIds = state.pendingIds.filter((pId) => pId !== id);
          }
        }
      );
  },
});

export default pharmaciesSlice.reducer;
