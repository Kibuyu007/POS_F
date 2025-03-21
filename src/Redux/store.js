import { configureStore } from "@reduxjs/toolkit";
import customerOrderSlice from './customerOrderSlice'
import cartSlice from './cartSlice'
import userSlice from './userSlice'
import itemSlice from './items'
import categorySlice from './itemsCategories'

export const store = configureStore({
    reducer: {
        order: customerOrderSlice,
        cart: cartSlice,
        user: userSlice,
        items: itemSlice,
        category: categorySlice,
    },

    middleware: (getDefaultMiddleware) => 
        getDefaultMiddleware({serializableCheck: false})
})