// orderSlice.js
import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";

// API
import BASE_URL from "../Utils/config.js";

const initialState = {
  orders: [],
  currentOrder: null,
  error: null,
  loading: false,
  status: null,
};

const orderSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    orderPending: (state) => {
      state.status = "Processing order request...";
      state.loading = true;
    },

    orderFetchSuccess: (state, action) => {
      state.status = "Orders fetched successfully";
      state.orders = action.payload;
      state.error = null;
      state.loading = false;
    },

    orderSingleSuccess: (state, action) => {
      state.status = "Order details fetched";
      state.currentOrder = action.payload;
      state.loading = false;
      state.error = null;
    },

    orderCreateSuccess: (state, action) => {
      state.status = "Order created successfully";
      state.orders.unshift(action.payload); // Add new order to top of list
      state.loading = false;
      state.error = null;
    },

    orderUpdateSuccess: (state, action) => {
      state.status = "Order updated";
      const index = state.orders.findIndex((o) => o._id === action.payload._id);
      if (index !== -1) {
        state.orders[index] = action.payload;
      }
      state.loading = false;
    },

    orderDeleteSuccess: (state, action) => {
      state.status = "Order deleted";
      state.orders = state.orders.filter((o) => o._id !== action.payload);
      state.loading = false;
    },

    orderError: (state, action) => {
      state.status = "Request failed";
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const {
  orderPending,
  orderFetchSuccess,
  orderSingleSuccess,
  orderCreateSuccess,
  orderUpdateSuccess,
  orderDeleteSuccess,
  orderError,
} = orderSlice.actions;

export default orderSlice.reducer;

// ==========================================
// THUNKS (Async Actions)
// ==========================================

export const fetchOrders = () => async (dispatch) => {
  dispatch(orderPending());
  try {
    const response = await axios.get(`${BASE_URL}/api/orders/allOrders`);
    dispatch(orderFetchSuccess(response.data.data));
  } catch (error) {
    dispatch(
      orderError(error.response?.data?.message || "Failed to fetch orders"),
    );
  }
};

export const createOrder = (orderData) => async (dispatch) => {
  dispatch(orderPending());
  try {
    const response = await axios.post(
      `${BASE_URL}/api/orders/addOrder`,
      orderData,
      {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
      },
    );
    dispatch(orderCreateSuccess(response.data.data));
    return response.data.data;
  } catch (error) {
    dispatch(
      orderError(error.response?.data?.message || "Failed to create order"),
    );
    throw error;
  }
};

export const updateOrderStatus = (id, status) => async (dispatch) => {
  dispatch(orderPending());
  try {
    const response = await axios.put(
      `${BASE_URL}/api/orders/updateOrder/${id}`,
      { status },
      {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
      },
    );
    dispatch(orderUpdateSuccess(response.data.data));
  } catch (error) {
    dispatch(
      orderError(error.response?.data?.message || "Failed to update status"),
    );
  }
};

export const deleteOrder = (id) => async (dispatch) => {
  dispatch(orderPending());
  try {
    await axios.delete(`${BASE_URL}/api/orders/deleteOrder/${id}`, {
      withCredentials: true,
      headers: { "Content-Type": "application/json" },
    });
    dispatch(orderDeleteSuccess(id));
  } catch (error) {
    dispatch(
      orderError(error.response?.data?.message || "Failed to delete order"),
    );
  }
};

export const getSingleOrder = (id) => async (dispatch) => {
  dispatch(orderPending());
  try {
    const response = await axios.get(`${BASE_URL}/api/orders/order/${id}`, {
      withCredentials: true,
      headers: { "Content-Type": "application/json" },
    });
    dispatch(orderSingleSuccess(response.data.data));
  } catch (error) {
    dispatch(
      orderError(error.response?.data?.message || "Failed to fetch order"),
    );
  }
};

export const searchOrders = (query) => async (dispatch) => {
  dispatch(orderPending());
  try {
    const response = await axios.get(
      `${BASE_URL}/api/orders/search?q=${query}`,
      {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
      },
    );
    dispatch(orderFetchSuccess(response.data.data));
  } catch (error) {
    dispatch(orderError(error.response?.data?.message || "Search failed"));
  }
};
