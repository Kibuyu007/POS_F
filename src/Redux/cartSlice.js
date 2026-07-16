// Redux/cartSlice.js
import { createSlice } from "@reduxjs/toolkit";

const MAX_DISCOUNT_PERCENT = 0.15; // 15%

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

      const { payload } = action;

      // Generate a unique key for the item
      const itemKey = `${payload.id}_${payload.priceType || "Retail"}_${payload.orderId || "regular"}`;

      const existingItem = state.cart.find((item) => {
        const existingKey = `${item.id}_${item.priceType || "Retail"}_${item.orderId || "regular"}`;
        return existingKey === itemKey;
      });

      if (existingItem) {
        const newQuantity = existingItem.quantity + (payload.quantity || 1);
        if (
          newQuantity > payload.itemQuantity &&
          payload.itemQuantity !== undefined
        ) {
          return;
        }

        existingItem.quantity = newQuantity;
        existingItem.totalPrice =
          existingItem.pricePerQuantity * existingItem.quantity;

        const maxDiscount = existingItem.totalPrice * MAX_DISCOUNT_PERCENT;
        existingItem.discount = Math.min(
          existingItem.discount || 0,
          maxDiscount,
        );

        if (payload.orderId) {
          existingItem.orderId = payload.orderId;
          existingItem.orderNumber = payload.orderNumber;
          existingItem.orderItemId = payload.orderItemId;
          existingItem.fulfillmentStatus = payload.fulfillmentStatus;
          existingItem.isFromOrder = true;
        }
      } else {
        const newItem = {
          ...payload,
          quantity: payload.quantity || 1,
          totalPrice: payload.pricePerQuantity * (payload.quantity || 1),
          discount: payload.discount || 0,
          orderId: payload.orderId || null,
          orderNumber: payload.orderNumber || null,
          orderItemId: payload.orderItemId || null,
          fulfillmentStatus: payload.fulfillmentStatus || null,
          isFromOrder: !!payload.orderId,
        };

        state.cart.push(newItem);
      }
    },

    removeItems: (state, action) => {
      const { id, priceType, orderId } = action.payload;

      if (typeof action.payload === "string") {
        state.cart = state.cart.filter((item) => item.id !== action.payload);
      } else {
        state.cart = state.cart.filter((item) => {
          if (item.id !== id) return true;
          if (priceType && item.priceType !== priceType) return true;
          if (orderId && item.orderId !== orderId) return true;
          return false;
        });
      }
    },

    increaseQuantity: (state, action) => {
      const { id, priceType, orderId } = action.payload;

      const item = state.cart.find((item) => {
        if (item.id !== id) return false;
        if (priceType && item.priceType !== priceType) return false;
        if (orderId && item.orderId !== orderId) return false;
        return true;
      });

      if (!item) return;
      if (item.quantity >= item.itemQuantity) return;

      item.quantity += 1;
      item.totalPrice = item.pricePerQuantity * item.quantity;
      const maxDiscount = item.totalPrice * MAX_DISCOUNT_PERCENT;
      item.discount = Math.min(item.discount || 0, maxDiscount);
    },

    decreaseQuantity: (state, action) => {
      const { id, priceType, orderId } = action.payload;

      const item = state.cart.find((item) => {
        if (item.id !== id) return false;
        if (priceType && item.priceType !== priceType) return false;
        if (orderId && item.orderId !== orderId) return false;
        return true;
      });

      if (!item) return;
      if (item.quantity <= 1) return;

      item.quantity -= 1;
      item.totalPrice = item.pricePerQuantity * item.quantity;
      const maxDiscount = item.totalPrice * MAX_DISCOUNT_PERCENT;
      item.discount = Math.min(item.discount || 0, maxDiscount);
    },

    updateItemDiscount: (state, action) => {
      const { id, discount, priceType, orderId } = action.payload;

      const item = state.cart.find((item) => {
        if (item.id !== id) return false;
        if (priceType && item.priceType !== priceType) return false;
        if (orderId && item.orderId !== orderId) return false;
        return true;
      });

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

export const getSubTotal = (state) =>
  state.cart.cart.reduce((total, item) => total + item.totalPrice, 0);

export const getTotalItemDiscount = (state) =>
  state.cart.cart.reduce((total, item) => total + (item.discount || 0), 0);

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

export const getCartQuantity = (state) =>
  state.cart.cart.reduce((total, item) => total + item.quantity, 0);

export const getItemNetTotal = (item) =>
  Math.max(0, item.totalPrice - (item.discount || 0));

export const getOrderItemsInCart = (state) =>
  state.cart.cart.filter((item) => item.isFromOrder);

export const getRegularItemsInCart = (state) =>
  state.cart.cart.filter((item) => !item.isFromOrder);

export const hasOrderItemsInCart = (state, orderId) =>
  state.cart.cart.some((item) => item.orderId === orderId);

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
