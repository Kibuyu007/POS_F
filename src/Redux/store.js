import { configureStore } from "@reduxjs/toolkit";
import customerOrderSlice from './customerOrderSlice'
import cartSlice from './cartSlice'
import userSlice from './userSlice'

export const store = configureStore({
    reducer: {
        order: customerOrderSlice,
        cart: cartSlice,
        user: userSlice,
    },

    middleware: (getDefaultMiddleware) => 
        getDefaultMiddleware({serializableCheck: false})
})