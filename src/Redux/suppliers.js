import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";


//API
import BASE_URL from "../Utils/config"


// Initial state
const initialState = {
  supplier: [], // ← previously activeSuppliers
  allSuppliers: [],
  error: null,
  loading: false,
  status: null,
};

// Supplier slice
const supplierSlice = createSlice({
  name: "suppliers",
  initialState,
  reducers: {
    supplierPending: (state) => {
      state.status = "pending";
      state.loading = true;
    },
    supplierFetch: (state, action) => {
      state.loading = false;
      state.supplier = action.payload;
      state.error = null;
      state.status = "success";
    },
    supplierAllFetch: (state, action) => {
      state.loading = false;
      state.allSuppliers = action.payload;
      state.error = null;
      state.status = "success";
    },
    supplierError: (state, action) => {
      state.status = "failed";
      state.error = action.payload;
      state.loading = false;
    },
    addSupplier: (state, action) => {
      state.allSuppliers.push(action.payload);
      if (action.payload.status === "active") {
        state.supplier.push(action.payload);
      }
    },
    updateSupplier: (state, action) => {
      const updated = action.payload;
      const updateList = (list) =>
        list.map((item) => (item._id === updated._id ? updated : item));

      state.allSuppliers = updateList(state.allSuppliers);
      state.supplier = updated.status === "active"
        ? [...state.supplier.filter((s) => s._id !== updated._id), updated]
        : state.supplier.filter((s) => s._id !== updated._id);
    },
    supplierStatusUpdate: (state, action) => {
      const { supplierId, newStatus } = action.payload;

      state.allSuppliers = state.allSuppliers.map((supplier) =>
        supplier._id === supplierId
          ? { ...supplier, status: newStatus }
          : supplier
      );

      const updatedSupplier = state.allSuppliers.find(s => s._id === supplierId);
      if (newStatus === "Active") {
        if (!state.supplier.some(s => s._id === supplierId)) {
          state.supplier.push(updatedSupplier);
        }
      } else {
        state.supplier = state.supplier.filter(s => s._id !== supplierId);
      }
    },

    searchSupplierPending: (state) => {
      state.status = "searching";
      state.loading = true;
    },
    searchSupplierSuccess: (state, action) => {
      state.status = "search success";
      state.supplier = action.payload;
      state.loading = false;
      state.error = null;
    },
    searchSupplierError: (state, action) => {
      state.status = "search failed";
      state.error = action.payload;
      state.loading = false;
    },
    clearSearch: (state) => {
      state.supplier = [];
      state.error = null;
    },
  },
});

export const {
  supplierPending,
  supplierFetch,
  supplierAllFetch,
  supplierError,
  addSupplier,
  updateSupplier,
  supplierStatusUpdate,
  searchSupplierPending,
  searchSupplierSuccess,
  searchSupplierError,
  clearSearch,
} = supplierSlice.actions;

// Thunk: fetch only active suppliers
export const fetchSuppliers = () => async (dispatch) => {
  dispatch(supplierPending());
  try {
    const response = await axios.get(`${BASE_URL}/api/suppliers/getSuppliers`);
    dispatch(supplierFetch(response.data));
  } catch (error) {
    dispatch(supplierError(error.message || "Error fetching suppliers"));
  }
};

// Thunk: fetch all suppliers
export const fetchAllSuppliers = () => async (dispatch) => {
  dispatch(supplierPending());
  try {
    const response = await axios.get(`${BASE_URL}/api/suppliers/getAllSuppliers`);
    dispatch(supplierAllFetch(response.data));
  } catch (error) {
    dispatch(supplierError(error.message || "Error fetching all suppliers"));
  }
};

export default supplierSlice.reducer;
