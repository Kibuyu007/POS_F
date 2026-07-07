import { configureStore } from "@reduxjs/toolkit";

// Slices

import cartSlice from "./cartSlice";
import userSlice from "./userSlice";
import itemSlice from "./items";
import categorySlice from "./itemsCategories";
import suppliers from "./suppliers";
import customers from "./customerSlice";
import orderSlice from "./orders";


export const store = configureStore({
  reducer: {
    orders: orderSlice,
    cart: cartSlice,
    user: userSlice,
    items: itemSlice,
    category: categorySlice,
    suppliers: suppliers,
    customers: customers,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false })
});