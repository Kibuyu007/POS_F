import { createSlice } from "@reduxjs/toolkit";

const MAX_DISCOUNT_PERCENT = 0.6; // 60%

const initialState = {
  cart: [],
  subtotal: 0,
  taxes: 0,
  totalPrice: 0,
  receiptPrinted: true,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,

  reducers: {
    addItems: (state, action) => {
      if (!state.receiptPrinted) return;

      const existingItem = state.cart.find(
        (item) => item.id === action.payload.id,
      );

      if (existingItem) {
        existingItem.quantity += action.payload.quantity;

        existingItem.totalPrice =
          existingItem.pricePerQuantity * existingItem.quantity;

        const maxDiscount = existingItem.totalPrice * MAX_DISCOUNT_PERCENT;

        existingItem.discount = Math.min(
          existingItem.discount || 0,
          maxDiscount,
        );
      } else {
        state.cart.push({
          ...action.payload,

          quantity: action.payload.quantity || 1,

          totalPrice:
            action.payload.pricePerQuantity * (action.payload.quantity || 1),

          discount: action.payload.discount || 0,
        });
      }
    },

    removeItems: (state, action) => {
      state.cart = state.cart.filter((item) => item.id !== action.payload);
    },

    increaseQuantity: (state, action) => {
      const item = state.cart.find((item) => item.id === action.payload);

      if (!item) return;

      if (item.quantity >= item.itemQuantity) {
        return;
      }

      item.quantity += 1;

      item.totalPrice = item.pricePerQuantity * item.quantity;

      const maxDiscount = item.totalPrice * MAX_DISCOUNT_PERCENT;

      item.discount = Math.min(item.discount || 0, maxDiscount);
    },

    decreaseQuantity: (state, action) => {
      const item = state.cart.find((item) => item.id === action.payload);

      if (!item) return;

      if (item.quantity <= 1) return;

      item.quantity -= 1;

      item.totalPrice = item.pricePerQuantity * item.quantity;

      const maxDiscount = item.totalPrice * MAX_DISCOUNT_PERCENT;

      item.discount = Math.min(item.discount || 0, maxDiscount);
    },

    updateItemDiscount: (state, action) => {
      const { id, discount } = action.payload;

      const item = state.cart.find((item) => item.id === id);

      if (!item) return;

      const maxDiscount = item.totalPrice * MAX_DISCOUNT_PERCENT;

      item.discount = Math.min(Math.max(Number(discount) || 0, 0), maxDiscount);
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

/* ==================================================
   SELECTORS
================================================== */

// Total before discounts
export const getSubTotal = (state) =>
  state.cart.cart.reduce((total, item) => total + item.totalPrice, 0);

// Sum of all item discounts
export const getTotalItemDiscount = (state) =>
  state.cart.cart.reduce((total, item) => total + (item.discount || 0), 0);

// Final payable amount
export const getGrandTotal = (state) => {
  const subtotal = state.cart.cart.reduce(
    (total, item) => total + item.totalPrice,
    0,
  );

  const discount = state.cart.cart.reduce(
    (total, item) => total + (item.discount || 0),
    0,
  );

  return Math.max(0, subtotal - discount);
};

// Total quantity in cart
export const getCartQuantity = (state) =>
  state.cart.cart.reduce((total, item) => total + item.quantity, 0);

// Single item net amount after discount
export const getItemNetTotal = (item) =>
  Math.max(0, item.totalPrice - (item.discount || 0));

/* ==================================================
   ACTIONS
================================================== */

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
