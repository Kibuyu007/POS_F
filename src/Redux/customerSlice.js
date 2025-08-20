import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";

// API
import BASE_URL from "../Utils/config";

// Initial state
const initialState = {
  customer: [], // ← previously supplier
  allCustomers: [],
  error: null,
  loading: false,
  status: null,
};

// Customer slice
const customerSlice = createSlice({
  name: "customers",
  initialState,
  reducers: {
    customerPending: (state) => {
      state.status = "pending";
      state.loading = true;
    },
    customerFetch: (state, action) => {
      state.loading = false;
      state.customer = action.payload;
      state.error = null;
      state.status = "success";
    },
    customerAllFetch: (state, action) => {
      state.loading = false;
      state.allCustomers = action.payload;
      state.error = null;
      state.status = "success";
    },
    customerError: (state, action) => {
      state.status = "failed";
      state.error = action.payload;
      state.loading = false;
    },
    addCustomer: (state, action) => {
      state.allCustomers.push(action.payload);
      if (action.payload.status === "Active") {
        state.customer.push(action.payload);
      }
    },
    updateCustomer: (state, action) => {
      const updated = action.payload;
      const updateList = (list) =>
        list.map((item) => (item._id === updated._id ? updated : item));

      state.allCustomers = updateList(state.allCustomers);
      state.customer =
        updated.status === "Active"
          ? [...state.customer.filter((c) => c._id !== updated._id), updated]
          : state.customer.filter((c) => c._id !== updated._id);
    },
    customerStatusUpdate: (state, action) => {
      const { customerId, newStatus } = action.payload;

      state.allCustomers = state.allCustomers.map((customer) =>
        customer._id === customerId
          ? { ...customer, status: newStatus }
          : customer
      );

      const updatedCustomer = state.allCustomers.find((c) => c._id === customerId);
      if (newStatus === "Active") {
        if (!state.customer.some((c) => c._id === customerId)) {
          state.customer.push(updatedCustomer);
        }
      } else {
        state.customer = state.customer.filter((c) => c._id !== customerId);
      }
    },

    searchCustomerPending: (state) => {
      state.status = "searching";
      state.loading = true;
    },
    searchCustomerSuccess: (state, action) => {
      state.status = "search success";
      state.customer = action.payload;
      state.loading = false;
      state.error = null;
    },
    searchCustomerError: (state, action) => {
      state.status = "search failed";
      state.error = action.payload;
      state.loading = false;
    },
    clearSearch: (state) => {
      state.customer = [];
      state.error = null;
    },
  },
});

export const {
  customerPending,
  customerFetch,
  customerAllFetch,
  customerError,
  addCustomer,
  updateCustomer,
  customerStatusUpdate,
  searchCustomerPending,
  searchCustomerSuccess,
  searchCustomerError,
  clearSearch,
} = customerSlice.actions;

// Thunk: fetch only active customers
export const fetchCustomers = () => async (dispatch) => {
  dispatch(customerPending());
  try {
    const response = await axios.get(`${BASE_URL}/api/customers/getCustomers`);
    dispatch(customerFetch(response.data));
  } catch (error) {
    dispatch(customerError(error.message || "Error fetching customers"));
  }
};

// Thunk: fetch all customers
export const fetchAllCustomers = () => async (dispatch) => {
  dispatch(customerPending());
  try {
    const response = await axios.get(`${BASE_URL}/api/customers/getAllCustomers`);
    dispatch(customerAllFetch(response.data));
  } catch (error) {
    dispatch(customerError(error.message || "Error fetching all customers"));
  }
};

export default customerSlice.reducer;
