import { configureStore } from "@reduxjs/toolkit";
import customerOrderSlice from './customerOrderSlice'
import cartSlice from './cartSlice'
import userSlice from './userSlice'
import itemSlice from './items'
import categorySlice from './itemsCategories'
import suppliers from './suppliers'

export const store = configureStore({
    reducer: {
        order: customerOrderSlice,
        cart: cartSlice,
        user: userSlice,
        items: itemSlice,
        category: categorySlice,
        suppliers: suppliers,
    },

    middleware: (getDefaultMiddleware) => 
        getDefaultMiddleware({serializableCheck: false})
})