import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  categories: [],
  currentPage: 1,
  totalPages: 0,
  itemsPerPage: 0,
  totalItems: 0,
  error: null,
  loading: false,
  status: null,
};

const categorySlice = createSlice({
  name: "category",
  initialState,
  reducers: {
    categoriesPending: (state) => {
      state.status = "Loading categories...";
      state.loading = true;
    },

    categoriesFetch: (state, action) => {
      state.status = "Categories fetched successfully";
      state.categories = action.payload.data;
      state.currentPage = action.payload.currentPage;
      state.totalPages = action.payload.totalPages;
      state.itemsPerPage = action.payload.itemsPerPage;
      state.totalItems = action.payload.totalItems;
      state.error = null;
      state.loading = false;
    },

    categoriesError: (state, action) => {
      state.status = "Failed to fetch categories";
      state.error = action.payload;
      state.loading = false;
    },

    addCategory: (state, action) => {
      state.categories.push(action.payload);
    },

    editCategory: (state, action) => {
      const index = state.categories.findIndex(
        (item) => item._id === action.payload._id
      );
      if (index !== -1) {
        state.categories[index] = action.payload;
      }
    },

    deleteCategory: (state, action) => {
      state.categories = state.categories.filter(
        (item) => item._id !== action.payload._id
      );
    },

    searchCategoriesPending: (state) => {
      state.status = "Searching categories...";
      state.loading = true;
    },

    searchCategoriesSuccess: (state, action) => {
      state.status = "Categories search successful";
      state.categories = action.payload.data;
      state.currentPage = action.payload.currentPage;
      state.totalPages = action.payload.totalPages;
      state.itemsPerPage = action.payload.itemsPerPage;
      state.totalItems = action.payload.totalItems;
      state.loading = false;
      state.error = null;
    },

    searchCategoriesError: (state, action) => {
      state.status = "Category search failed";
      state.loading = false;
      state.error = action.payload;
    },

    clearSearchCategories: (state, action) => {
      state.categories = action.payload.data;
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
  categoriesFetch,
  categoriesPending,
  categoriesError,
  editCategory,
  deleteCategory,
  addCategory,
  searchCategoriesSuccess,
  searchCategoriesPending,
  searchCategoriesError,
  clearSearchCategories,
} = categorySlice.actions;

export default categorySlice.reducer;



// Fetch Categories
export const fetchCategories = () => async (dispatch) => {
  dispatch(categoriesPending());

  try {
    const response = await axios.get(
      "http://localhost:4004/api/itemsCategories/getItemCategories"
    );

    dispatch(
      categoriesFetch({
        data: response.data.data,
        currentPage: response.data.currentPage,
        totalPages: response.data.totalPages,
        itemsPerPage: response.data.itemsPerPage,
        totalItems: response.data.totalItems,
      })
    );
  } catch (error) {
    dispatch(categoriesError(error));
    console.log(error);
  }
};
