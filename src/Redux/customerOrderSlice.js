import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  orderID: "",
  customerName: "",
  customerAddress: "",
  customerContact: "",
  guestCustomer: 0,
  tableNo: "",
};

const customerSlice = createSlice({
  name: "customerOrder",
  initialState,
  reducers: {
    setCustomerOrder: (state, action) => {
      const {
        customerName,
        customerAddress,
        customerContact,
        guestCustomer,
        tableNo,
      } = action.payload;
      state.orderID = `${Date.now()}`;
      state.customerName = customerName;
      state.customerAddress = customerAddress;
      state.customerContact = customerContact;
      state.guestCustomer = guestCustomer;
      state.tableNo = tableNo; // ✅ Now stores table number
    },

    cleanOrderDetail: (state) => {
      state.customerName = "";
      state.customerAddress = "";
      state.customerContact = "";
      state.guestCustomer = 0;
      state.tableNo = "";
    },

    updateTableOrder: (state, action) => {
      state.tableNo = action.payload.tableNo;
      state.tableName = action.payload.tableName;
    },
  },
});

export const { setCustomerOrder, cleanOrderDetail, updateTableOrder } =
  customerSlice.actions;
export default customerSlice.reducer;
