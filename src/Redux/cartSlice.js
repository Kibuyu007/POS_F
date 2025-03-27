import { createSlice } from "@reduxjs/toolkit";

const initialState = [];

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    
    addItems: (state, action) => {
      const existingItem = state.find((item) => item.id === action.payload.id);
    
      if (existingItem) {
        // Increment the item quantity and total price
        existingItem.itemQuantity += action.payload.itemQuantity;
        existingItem.totalPrice += action.payload.totalPrice;
      } else {
        // If the item doesn't exist, add it to the cart
        state.push(action.payload);
      }
    },

    removeItems: (state, action) => {
      return state.filter((item) => item.id !== action.payload);
    },

    // New action to increase the quantity of a specific item
    increaseQuantity: (state, action) => {
      const item = state.find((item) => item.id === action.payload);
      if (item) {
        item.itemQuantity += 1;
        item.totalPrice = item.pricePerQuantity * item.itemQuantity; // Recalculate totalPrice
      }
    },
  },
});

export const getTotalPrice = (state) =>
  state.cart.reduce((total, item) => total + item.totalPrice, 0);

export const { addItems, removeItems, increaseQuantity } = cartSlice.actions;
export default cartSlice.reducer;
