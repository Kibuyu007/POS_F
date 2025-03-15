import { configureStore } from "@reduxjs/toolkit";
import customerOrderSlice from './customerOrderSlice'
import cartSlice from './cartSlice'

export const store = configureStore({
    reducer: {
        order: customerOrderSlice,
        cart: cartSlice,
    },

    middleware: (getDefaultMiddleware) => 
        getDefaultMiddleware({serializableCheck: false})
})