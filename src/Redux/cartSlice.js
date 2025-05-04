import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  cart: [],
  subtotal: 0,
  taxes: 0,
  totalPrice: 0,
  receiptPrinted: true, // <-- new state
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {

    addItems: (state, action) => {
      if (!state.receiptPrinted) {
        alert("Please print the receipt before adding new items.");
        return;
      }

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
      if (item && item.quantity < item.itemQuantity) {
        item.quantity += 1;
        item.totalPrice = item.pricePerQuantity * item.quantity;
      } else {
        alert("Cannot exceed available stock!");
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

    setReceiptPrinted: (state, action) => {
      state.receiptPrinted = action.payload;
    },
  },
});

export const getTotalPrice = (state) =>
  state.cart.cart.reduce((total, item) => total + item.totalPrice, 0);

export const {
  addItems,
  removeItems,
  increaseQuantity,
  decreaseQuantity,
  clearCart,
  setReceiptPrinted,
} = cartSlice.actions;

export default cartSlice.reducer;
