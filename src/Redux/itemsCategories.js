import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import BASE_URL from "../Utils/config";

const initialState = {
  category: [],
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
      state.category = action.payload.data;
      state.error = null;
      state.loading = false;
    },

    categoriesError: (state, action) => {
      state.status = "Failed to fetch categories";
      state.error = action.payload;
      state.loading = false;
    },

    addCategory: (state, action) => {
      state.category.push(action.payload);
    },

    editCategory: (state, action) => {
      const index = state.category.findIndex(
        (item) => item._id === action.payload._id
      );
      if (index !== -1) {
        state.category[index] = action.payload;
      }
    },

    deleteCategory: (state, action) => {
      state.category = state.category.filter(
        (item) => item._id !== action.payload._id
      );
    },

    searchCategoriesPending: (state) => {
      state.status = "Searching categories...";
      state.loading = true;
    },

    searchCategoriesSuccess: (state, action) => {
      state.status = "Categories search successful";
      state.category = action.payload.data;
      state.loading = false;
      state.error = null;
    },

    searchCategoriesError: (state, action) => {
      state.status = "Category search failed";
      state.loading = false;
      state.error = action.payload;
    },

    clearSearchCategories: (state, action) => {
      state.category = action.payload.data;
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
      `${BASE_URL}/api/itemsCategories/getItemCategories`
    );

    dispatch(
      categoriesFetch({
        data: response.data.data,
      })
    );
  } catch (error) {
    dispatch(categoriesError(error));
    console.log(error);
  }
};
