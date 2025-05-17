import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";

// Initial state
const initialState = {
  supplier: [],
  error: null,
  loading: false,
  status: "All",
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
      state.supplier = action.payload.data;
      state.error = null;
    },
    supplierError: (state, action) => {
      state.status = "failed";
      state.error = action.payload;
      state.loading = false;
    },
    addSupplier: (state, action) => {
      state.supplier.push(action.payload);
    },
    editSupplier: (state, action) => {
      const index = state.supplier.findIndex(
        (item) => item._id === action.payload._id
      );
      if (index !== -1) {
        state.supplier[index] = action.payload;
      }
    },
    searchSupplierPending: (state) => {
      state.status = "searching";
      state.loading = true;
    },
    searchSupplierSuccess: (state, action) => {
      state.status = "search success";
      state.supplier = action.payload.data;
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
    supplierStatusUpdate: (state, action) => {
      const { supplierId, newStatus } = action.payload;
      state.supplier = state.supplier.map((supplier) =>
        supplier._id === supplierId
          ? { ...supplier, status: newStatus }
          : supplier
      );
    },
  },
});

export const {
  supplierPending,
  supplierFetch,
  supplierError,
  addSupplier,
  editSupplier,
  searchSupplierPending,
  searchSupplierSuccess,
  searchSupplierError,
  clearSearch,
  supplierStatusUpdate,
} = supplierSlice.actions;

export const fetchSuppliers = () => async (dispatch) => {
  dispatch(supplierPending());
  try {
    const response = await axios.get("http://localhost:4004/api/suppliers/getSuppliers");

    dispatch(
      supplierFetch({
        data: response.data, // or response.data.data if wrapped
      })
    );
  } catch (error) {
    dispatch(supplierError(error.message || "Error fetching suppliers"));
    console.error(error);
  }
};

export default supplierSlice.reducer;
