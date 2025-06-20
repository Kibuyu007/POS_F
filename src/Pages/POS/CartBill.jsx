import { useDispatch, useSelector } from "react-redux";
import {
  clearCart,
  getTotalPrice,
  setReceiptPrinted,
} from "../../Redux/cartSlice";
import { useState } from "react";
import axios from "axios";

const Cart = ({ triggerRefreshMenu }) => {
  const dispatch = useDispatch();

  const [errorMsg, setErrorMsg] = useState("");
  const [lastTransactionDetails, setLastTransactionDetails] = useState(null);

  const [customerDetails, setCustomerDetails] = useState({
    name: "Mteja",
    phone: "0777777777",
  });

  const [validation, setValidation] = useState({
    name: true,
    phone: true,
  });

  const handleInput = async (e) => {
    const { name, value } = e.target;
    setCustomerDetails({ ...customerDetails, [name]: value });

    if (name == "phone") {
      const phoneVali = /^[0-9]{10}$/;
      setValidation((prev) => ({ ...prev, phone: phoneVali.test(value) }));
    }
  };

  const cartData = useSelector((state) => state.cart.cart);
  const total = useSelector(getTotalPrice);
  const taxRate = 2.5;
  const tax = (total * taxRate) / 100;
  const finalTotal = total + tax;

  const handleTransaction = async (status) => {
    try {
      const payload = {
        items: cartData.map((item) => ({
          item: item.id,
          quantity: item.quantity,
          price: item.pricePerQuantity,
        })),
        totalAmount: finalTotal,
        customerDetails,
        status,
      };

      const response = await axios.post(
        "http://localhost:4004/api/transactions/sales",
        payload
      );

      if (response.status === 201) {
        alert(
          `Transaction ${
            status === "Paid" ? "completed" : "saved as bill"
          } successfully!`
        );
        dispatch(clearCart());
        triggerRefreshMenu();

        // Save for receipt generation
        setLastTransactionDetails({
          items: payload.items,
          totalAmount: payload.totalAmount,
          customerDetails: payload.customerDetails,
        });

        dispatch(setReceiptPrinted(false));
        setShowPrintButton(true); // Show button
      } else {
        alert("Transaction failed");
      }
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        setErrorMsg(error.response.data.message);
      } else {
        setErrorMsg("Something went wrong.");
      }
    }
  };

  const [pdfUrl, setPdfUrl] = useState("");
  const [showPrintButton, setShowPrintButton] = useState(false);

  const handlePrintReceipt = async () => {
    try {
      const response = await axios.get(
        "http://localhost:4004/api/receipt/receipt",
        lastTransactionDetails,
        {
          responseType: "blob", // PDF blob
        }
      );

      const blob = new Blob([response.data], { type: "application/pdf" });
      const pdfUrl = URL.createObjectURL(blob);
      setPdfUrl(pdfUrl);
      window.open(pdfUrl, "_blank");
      dispatch(setReceiptPrinted(true));
    } catch (err) {
      alert("Failed to generate receipt");
      console.error("Receipt error:", err);
    } finally {
      window.location.reload();
    }
  };

  return (
    <>
      {/* Customer Details, Name and Phone Number */}
      <div className="mt-6 space-y-6">
        {/* Customer Input Section */}
        <div className="bg-gradient-to-r from-blue-100 to-green-200 rounded-xl shadow-lg px-6 py-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Customer Info
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 font-semibold mb-1">
                Customer Name
              </label>
              <input
                type="text"
                name="name"
                value={customerDetails.name}
                onChange={handleInput}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400 shadow-sm"
                placeholder="Enter name"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-1">
                Phone Number
              </label>
              <input
                type="number"
                name="phone"
                value={customerDetails.phone}
                onChange={handleInput}
                className={`w-full px-4 py-2 rounded-lg border shadow-sm ${
                  validation.phone
                    ? "border-gray-300"
                    : "border-red-500 border-2"
                } focus:outline-none focus:ring-2 focus:ring-green-400`}
                placeholder="Enter phone number"
              />
            </div>
          </div>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="text-red-600 font-semibold text-center">
            {errorMsg}
          </div>
        )}

        {/* Totals Section */}
        <div className="bg-white rounded-xl shadow-[0px_10px_1px_rgba(221,_221,_221,_1),_0_10px_20px_rgba(204,_204,_204,_1)] px-6 py-4 space-y-2">
          <div className="flex justify-between text-gray-800 font-medium">
            <span>Items</span>
            <span>{cartData.length}</span>
          </div>
          <div className="flex justify-between text-gray-800 font-medium">
            <span>Tax (2.5%)</span>
            <span>{tax}/=</span>
          </div>
          <div className="flex justify-between text-lg font-bold text-black pt-2 border-t">
            <span>Total (Tsh)</span>
            <span>{finalTotal}/=</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-4">
          <button
            onClick={() => handleTransaction("Paid")}
            className="w-full py-3 rounded-lg bg-green-500 text-white font-semibold hover:bg-green-600 transition"
          >
            Cash
          </button>
          <button
            onClick={() => handleTransaction("Bill")}
            className="w-full py-3 rounded-lg bg-gray-300 text-black font-semibold hover:bg-gray-400 transition"
          >
            Bill
          </button>
        </div>

        <hr className="border-gray-400 mt-2" />

        {/* Receipt print */}
        {showPrintButton && (
          <div className="mt-4">
            <button
              onClick={handlePrintReceipt}
              className="w-full py-3 bg-yellow-400 hover:bg-yellow-500 rounded-lg font-semibold text-black transition"
            >
              Print Receipt
            </button>
            {pdfUrl && (
              <embed
                src={pdfUrl}
                type="application/pdf"
                width="100%"
                height="500px"
                className="mt-4 rounded-lg shadow-md"
              />
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default Cart;
