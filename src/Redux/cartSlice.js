import { createSlice } from "@reduxjs/toolkit";

const initialState = [];

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addItems: (state, action) => {
      const existingItem = state.find((item) => item.id === action.payload.id);

      if (existingItem) {
        existingItem.quantity += action.payload.quantity;
        existingItem.totalPrice = existingItem.pricePerQuantity * existingItem.quantity; // Corrected calculation
      } else {
        state.push(action.payload);
      }
    },

    removeItems: (state, action) => {
      return state.filter((item) => item.id !== action.payload);
    },

    increaseQuantity: (state, action) => {
      const item = state.find((item) => item.id === action.payload);
      if (item) {
        item.quantity += 1;
        item.totalPrice = item.pricePerQuantity * item.quantity; // Corrected totalPrice calculation
      }
    },

    decreaseQuantity: (state, action) => {
      const item = state.find((item) => item.id === action.payload);
      if (item && item.quantity > 1) {
        item.quantity -= 1;
        item.totalPrice = item.pricePerQuantity * item.quantity; // Recalculate total price
      }
    },

    clearCart: (state) => {
      state.cart = [];
      state.subtotal = 0;
      state.taxes = 0;
      state.totalPrice = 0;
    },
  },
});

export const getTotalPrice = (state) =>
  state.cart.reduce((total, item) => total + item.totalPrice, 0);

export const { addItems, removeItems, increaseQuantity,decreaseQuantity } = cartSlice.actions;
export default cartSlice.reducer;
