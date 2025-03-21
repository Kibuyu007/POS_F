// itemsSlice.js
import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  items: [],
  currentPage: 1,
  totalPages: 0,
  itemsPerPage: 0,
  totalItems: 0, // Default to 0 instead of null to avoid potential issues
  error: null,
  loading: false,
  status: null,
};

const itemSlice = createSlice({
  name: "items",
  initialState,
  reducers: {
    itemsPending: (state) => {
      state.status = "Loading items...";
      state.loading = true;
    },

    itemsFetch: (state, action) => {
      state.status = "Items fetched successfully";
      state.items = action.payload.data;
      state.currentPage = action.payload.currentPage;
      state.totalPages = action.payload.totalPages;
      state.itemsPerPage = action.payload.itemsPerPage;
      state.totalItems = action.payload.totalItems;
      state.error = null;
      state.loading = false;
    },

    itemsError: (state, action) => {
      state.status = "Failed to fetch items";
      state.error = action.payload;
      state.loading = false;
    },

    additem: (state, action) => {
      state.items.push(action.payload);
    },

    edititem: (state, action) => {
      const index = state.items.findIndex(
        (item) => item._id === action.payload._id
      );
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },

    searchItemsPending: (state) => {
      state.status = "Searching items...";
      state.loading = true;
    },

    searchItemsSuccess: (state, action) => {
      state.status = "Item search successful";
      state.items = action.payload.data;
      state.currentPage = action.payload.currentPage;
      state.totalPages = action.payload.totalPages;
      state.itemsPerPage = action.payload.itemsPerPage;
      state.totalItems = action.payload.totalItems;
      state.loading = false;
      state.error = null;
    },

    searchItemsError: (state, action) => {
      state.status = "Item search failed";
      state.loading = false;
      state.error = action.payload;
    },

    clearSearch: (state, action) => {
      state.items = action.payload.data;
      state.currentPage = action.payload.currentPage;
      state.totalPages = action.payload.totalPages;
      state.itemsPerPage = action.payload.itemsPerPage;
      state.totalItems = action.payload.totalItems;
      state.loading = false;
      state.error = null;
    },
  },
});

export const {
  itemsFetch,
  itemsPending,
  itemsError,
  edititem,
  additem,
  searchItemsSuccess,
  searchItemsPending,
  searchItemsError,
  clearSearch,
} = itemSlice.actions;

export default itemSlice.reducer;





// Fetch Products (or Items)
export const fetchProducts = () => async (dispatch) => {
    dispatch(itemsPending());
  
    try {
      const response = await axios.get(
        "http://localhost:4004/api/items/getAllItems"
      );
  
      dispatch(
        itemsFetch({
          data: response.data.data,
          currentPage: response.data.currentPage,
          totalPages: response.data.totalPages,
          itemsPerPage: response.data.itemsPerPage, // Add itemsPerPage to match the payload structure
          totalItems: response.data.totalItems,
        })
      );
    } catch (error) {
      dispatch(itemsError(error));
      console.log(error);
    }
  };
  