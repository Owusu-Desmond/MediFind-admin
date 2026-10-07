import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { apiClient, apiClientWithMeta } from "../apiClient";

export interface BackendMedicineAlias {
  id: number;
  alias: string;
  alias_type?: string;
}

export interface BackendMedicine {
  id: number;
  name: string;
  generic_name?: string | null;
  strength?: string | null;
  dosage_form?: string | null;
  route_of_administration?: string | null;
  dosage?: string | null;
  dosage_instructions?: string | null;
  category?: string | null;
  description?: string | null;
  manufacturer?: string | null;
  precautions?: string | null;
  side_effects?: string | null;
  tags?: string | null;
  image_url?: string | null;
  requires_prescription: boolean;
  is_active: boolean;
  created_at?: string | null;
  updated_at?: string | null;
  active_pharmacies_count?: number;
  aliases?: BackendMedicineAlias[];
  matched_by?: string | null;
}

export interface MedicineAliasItem {
  id: number;
  alias: string;
  aliasType?: string;
}

export interface Medicine {
  id: string;
  name: string;
  genericName: string;
  strength: string;
  dosageForm: string;
  routeOfAdministration: string;
  dosageInstructions: string;
  category: string;
  description: string;
  manufacturer: string;
  precautions: string;
  sideEffects: string;
  tags: string;
  imageUrl: string;
  requiresPrescription: boolean;
  isActive: boolean;
  createdAt: string;
  activePharmaciesCount: number;
  aliases: MedicineAliasItem[];
  matchedBy?: string;
}

export function transformMedicine(bm: BackendMedicine): Medicine {
  return {
    id: bm.id.toString(),
    name: bm.name,
    genericName: bm.generic_name || "",
    strength: bm.strength || bm.dosage || "500mg",
    dosageForm: bm.dosage_form || "Tablet",
    routeOfAdministration: bm.route_of_administration || "Oral",
    dosageInstructions: bm.dosage_instructions || "",
    category: bm.category || "General",
    description: bm.description || "",
    manufacturer: bm.manufacturer || "Generic Pharma",
    precautions: bm.precautions || "",
    sideEffects: bm.side_effects || "",
    tags: bm.tags || "",
    imageUrl: bm.image_url || "",
    requiresPrescription: bm.requires_prescription ?? false,
    isActive: bm.is_active ?? true,
    createdAt: bm.created_at ? new Date(bm.created_at).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
    activePharmaciesCount: bm.active_pharmacies_count ?? 0,
    aliases: bm.aliases ? bm.aliases.map((a) => ({ id: a.id, alias: a.alias, aliasType: a.alias_type })) : [],
    matchedBy: bm.matched_by || undefined,
  };
}

export interface FetchMedicinesPayload {
  items: Medicine[];
  totalCount: number;
  totalPages: number;
  page: number;
  pageSize: number;
}

interface MedicinesState {
  items: Medicine[];
  loading: boolean;
  pendingIds: string[];
  submittingForm: boolean;
  error: string | null;
  categories: string[];
  dosageForms: string[];
  duplicateGroups: any[];
  pagination: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
}

const initialState: MedicinesState = {
  items: [],
  loading: false,
  pendingIds: [],
  submittingForm: false,
  error: null,
  categories: [],
  dosageForms: [],
  duplicateGroups: [],
  pagination: {
    page: 1,
    pageSize: 25,
    totalCount: 0,
    totalPages: 1,
  },
};

export const fetchMedicines = createAsyncThunk<
  FetchMedicinesPayload,
  { q?: string; category?: string; dosage_form?: string; is_active?: boolean; page?: number; page_size?: number; limit?: number; skip?: number } | void
>(
  "medicines/fetchMedicines",
  async (params, { rejectWithValue, signal }) => {
    try {
      const query = new URLSearchParams();
      if (params?.q) query.append("q", params.q);
      if (params?.category && params.category !== "All") query.append("category", params.category);
      if (params?.dosage_form && params.dosage_form !== "All") query.append("dosage_form", params.dosage_form);
      if (params?.is_active !== undefined) query.append("is_active", String(params.is_active));
      
      const page = params?.page || 1;
      const pageSize = params?.page_size || params?.limit || 25;
      query.append("page", String(page));
      query.append("page_size", String(pageSize));

      const qs = query.toString();
      const meta = await apiClientWithMeta<BackendMedicine[]>(`/api/medicines/${qs ? `?${qs}` : ""}`, { signal });
      return {
        items: meta.data.map(transformMedicine),
        totalCount: meta.totalCount,
        totalPages: meta.totalPages,
        page: meta.page,
        pageSize: meta.pageSize,
      };
    } catch (err: any) {
      if (signal.aborted) {
        return rejectWithValue("Cancelled");
      }
      return rejectWithValue(err.message || "Failed to fetch medicines catalogue");
    }
  }
);

export const fetchMedicineMetadata = createAsyncThunk(
  "medicines/fetchMedicineMetadata",
  async (_, { rejectWithValue }) => {
    try {
      const [cats, forms] = await Promise.all([
        apiClient<string[]>("/api/medicines/categories"),
        apiClient<string[]>("/api/medicines/dosage-forms"),
      ]);
      return { categories: cats, dosageForms: forms };
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to fetch metadata");
    }
  }
);

export const createCatalogueMedicine = createAsyncThunk(
  "medicines/createCatalogueMedicine",
  async (
    medData: {
      name: string;
      generic_name?: string;
      strength?: string;
      dosage_form?: string;
      route_of_administration?: string;
      dosage_instructions?: string;
      category?: string;
      description?: string;
      manufacturer?: string;
      precautions?: string;
      side_effects?: string;
      tags?: string;
      image_url?: string;
      requires_prescription?: boolean;
      is_active?: boolean;
    },
    { rejectWithValue }
  ) => {
    try {
      const created = await apiClient<BackendMedicine>("/api/medicines/", {
        method: "POST",
        body: JSON.stringify(medData),
      });
      return transformMedicine(created);
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to create catalogue medicine");
    }
  }
);

export const updateCatalogueMedicine = createAsyncThunk(
  "medicines/updateCatalogueMedicine",
  async (
    {
      id,
      data,
    }: {
      id: string;
      data: Partial<BackendMedicine>;
    },
    { rejectWithValue }
  ) => {
    try {
      const updated = await apiClient<BackendMedicine>(`/api/medicines/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
      return transformMedicine(updated);
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to update catalogue medicine");
    }
  }
);

export const toggleMedicineActive = createAsyncThunk(
  "medicines/toggleMedicineActive",
  async (id: string, { rejectWithValue }) => {
    try {
      const updated = await apiClient<BackendMedicine>(`/api/medicines/${id}/toggle-active`, {
        method: "PATCH",
      });
      return transformMedicine(updated);
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to toggle medicine status");
    }
  }
);

export const fetchCatalogueDuplicates = createAsyncThunk(
  "medicines/fetchCatalogueDuplicates",
  async (_, { rejectWithValue }) => {
    try {
      const data = await apiClient<{ suspect_groups_count: number; suspect_groups: any[] }>("/api/medicines/admin/duplicates");
      return data.suspect_groups;
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to scan catalogue duplicates");
    }
  }
);

export const addMedicineAlias = createAsyncThunk(
  "medicines/addMedicineAlias",
  async (
    {
      medicineId,
      alias,
      aliasType,
    }: {
      medicineId: string;
      alias: string;
      aliasType?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const created = await apiClient<{ id: number; alias: string; alias_type?: string; medicine_id: number }>(
        `/api/medicines/${medicineId}/aliases`,
        {
          method: "POST",
          body: JSON.stringify({ alias, alias_type: aliasType || "Brand" }),
        }
      );
      return {
        medicineId,
        alias: {
          id: created.id,
          alias: created.alias,
          aliasType: created.alias_type,
        },
      };
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to add alias");
    }
  }
);

export const deleteMedicineAlias = createAsyncThunk(
  "medicines/deleteMedicineAlias",
  async (
    {
      medicineId,
      aliasId,
    }: {
      medicineId: string;
      aliasId: number;
    },
    { rejectWithValue }
  ) => {
    try {
      await apiClient<{ message: string }>(`/api/medicines/aliases/${aliasId}`, {
        method: "DELETE",
      });
      return { medicineId, aliasId };
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to delete alias");
    }
  }
);

const medicinesSlice = createSlice({
  name: "medicines",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetchMedicines
      .addCase(fetchMedicines.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMedicines.fulfilled, (state, action: PayloadAction<FetchMedicinesPayload>) => {
        state.loading = false;
        state.items = action.payload.items;
        state.pagination = {
          page: action.payload.page,
          pageSize: action.payload.pageSize,
          totalCount: action.payload.totalCount,
          totalPages: action.payload.totalPages,
        };
      })
      .addCase(fetchMedicines.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // fetchMedicineMetadata
      .addCase(fetchMedicineMetadata.fulfilled, (state, action) => {
        state.categories = action.payload.categories;
        state.dosageForms = action.payload.dosageForms;
      })

      // fetchCatalogueDuplicates
      .addCase(fetchCatalogueDuplicates.fulfilled, (state, action) => {
        state.duplicateGroups = action.payload;
      })

      // createCatalogueMedicine
      .addCase(createCatalogueMedicine.pending, (state) => {
        state.submittingForm = true;
        state.error = null;
      })
      .addCase(createCatalogueMedicine.fulfilled, (state, action: PayloadAction<Medicine>) => {
        state.submittingForm = false;
        state.items.unshift(action.payload);
      })
      .addCase(createCatalogueMedicine.rejected, (state, action) => {
        state.submittingForm = false;
        state.error = action.payload as string;
      })

      // updateCatalogueMedicine
      .addCase(updateCatalogueMedicine.fulfilled, (state, action: PayloadAction<Medicine>) => {
        state.submittingForm = false;
        const index = state.items.findIndex((m) => m.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })

      // toggleMedicineActive
      .addCase(toggleMedicineActive.fulfilled, (state, action: PayloadAction<Medicine>) => {
        const index = state.items.findIndex((m) => m.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })

      // addMedicineAlias
      .addCase(addMedicineAlias.fulfilled, (state, action) => {
        const med = state.items.find((m) => m.id === action.payload.medicineId);
        if (med) {
          med.aliases.push(action.payload.alias);
        }
      })

      // deleteMedicineAlias
      .addCase(deleteMedicineAlias.fulfilled, (state, action) => {
        const med = state.items.find((m) => m.id === action.payload.medicineId);
        if (med) {
          med.aliases = med.aliases.filter((a) => a.id !== action.payload.aliasId);
        }
      });
  },
});

export default medicinesSlice.reducer;
