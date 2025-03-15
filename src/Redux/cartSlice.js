import { createSlice } from "@reduxjs/toolkit";

const initialState = [];

const cartSlice = createSlice({
  name: "cartOrder",
  initialState,
  reducers: {


    addItems: (state, action) => {
      const existingItem = state.find((item) => item.id === action.payload.id);

      if (existingItem) {
        existingItem.quantity += action.payload.quantity;
        existingItem.totalPrice += action.payload.totalPrice;
      } else {
        state.push(action.payload);
      }
    },

    removeItems: (state, action) => {
      return state.filter((item) => item.id !== action.payload);
    },
  },
});


export const getTotalPrice = (state) =>
  state.cart.reduce((total, item) => total + item.totalPrice, 0);

export const { addItems, removeItems } = cartSlice.actions;
export default cartSlice.reducer;
