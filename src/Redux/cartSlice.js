import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  cart: [],
  subtotal: 0,
  taxes: 0,
  totalPrice: 0,
  receiptPrinted: true, // <-- new state
};

const MAX_DISCOUNT_PERCENT = 0.6; // 60%

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addItems: (state, action) => {
      if (!state.receiptPrinted) {
        alert("Please print the receipt before adding new items.");
        return;
      }

      const existingItem = state.cart.find(
        (item) => item.id === action.payload.id,
      );
      if (existingItem) {
        existingItem.quantity += action.payload.quantity;
        existingItem.totalPrice =
          existingItem.pricePerQuantity * existingItem.quantity;

        // Clamp discount to 60% of new totalPrice
        existingItem.discount = Math.min(
          existingItem.discount || 0,
          existingItem.totalPrice * MAX_DISCOUNT_PERCENT,
        );
      } else {
        state.cart.push({ ...action.payload, discount: 0 });
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
        // Clamp discount to 60% of new totalPrice
        item.discount = Math.min(
          item.discount || 0,
          item.totalPrice * MAX_DISCOUNT_PERCENT,
        );
      } else {
        alert("Cannot exceed available stock!");
      }
    },

    decreaseQuantity: (state, action) => {
      const item = state.cart.find((item) => item.id === action.payload);
      if (item && item.quantity > 1) {
        item.quantity -= 1;
        item.totalPrice = item.pricePerQuantity * item.quantity;
        // Clamp discount to 60% of new totalPrice
        item.discount = Math.min(
          item.discount || 0,
          item.totalPrice * MAX_DISCOUNT_PERCENT,
        );
      }
    },

    updateItemDiscount: (state, action) => {
      const { id, discount } = action.payload;
      const item = state.cart.find((item) => item.id === id);
      if (item) {
        const maxDiscount = item.totalPrice * MAX_DISCOUNT_PERCENT;
        // Clamp discount between 0 and maxDiscount
        item.discount = Math.min(Math.max(discount, 0), maxDiscount);
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

export const getTotalItemDiscount = (state) =>
  state.cart.cart.reduce((total, item) => total + (item.discount || 0), 0);

export const {
  addItems,
  removeItems,
  increaseQuantity,
  decreaseQuantity,
  updateItemDiscount,
  clearCart,
  setReceiptPrinted,
} = cartSlice.actions;

export default cartSlice.reducer;
