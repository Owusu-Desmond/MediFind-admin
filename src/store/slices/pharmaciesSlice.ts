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
  error: string | null;
}

const initialState: PharmaciesState = {
  items: [],
  loading: false,
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

const pharmaciesSlice = createSlice({
  name: "pharmacies",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
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
      .addCase(approvePharmacy.fulfilled, (state, action: PayloadAction<Pharmacy>) => {
        const index = state.items.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        } else {
          state.items.push(action.payload);
        }
      })
      .addCase(suspendPharmacy.fulfilled, (state, action: PayloadAction<Pharmacy>) => {
        const index = state.items.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        } else {
          state.items.push(action.payload);
        }
      })
      .addCase(addPharmacy.fulfilled, (state, action: PayloadAction<Pharmacy>) => {
        state.items.unshift(action.payload);
      });
  },
});

export default pharmaciesSlice.reducer;
