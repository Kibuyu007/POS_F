import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  cart: [],
  subtotal: 0,
  taxes: 0,
  totalPrice: 0,
};


const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {

    addItems: (state, action) => {
      const existingItem = state.cart.find((item) => item.id === action.payload.id);
      if (existingItem) {
        existingItem.quantity += action.payload.quantity;
        existingItem.totalPrice = existingItem.pricePerQuantity * existingItem.quantity;
      } else {
        state.cart.push(action.payload);
      }
    },
    removeItems: (state, action) => {
      state.cart = state.cart.filter((item) => item.id !== action.payload);
    },
    increaseQuantity: (state, action) => {
      const item = state.cart.find((item) => item.id === action.payload);
      if (item) {
        item.quantity += 1;
        item.totalPrice = item.pricePerQuantity * item.quantity;
      }
    },
    decreaseQuantity: (state, action) => {
      const item = state.cart.find((item) => item.id === action.payload);
      if (item && item.quantity > 1) {
        item.quantity -= 1;
        item.totalPrice = item.pricePerQuantity * item.quantity;
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
  state.cart.cart.reduce((total, item) => total + item.totalPrice, 0);


export const { addItems, removeItems, increaseQuantity,decreaseQuantity ,clearCart} = cartSlice.actions;
export default cartSlice.reducer;
