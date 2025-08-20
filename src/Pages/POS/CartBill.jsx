import { useDispatch, useSelector } from "react-redux";
import {
  clearCart,
  getTotalPrice,
  setReceiptPrinted,
} from "../../Redux/cartSlice";
import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

//API
import BASE_URL from "../../Utils/config";
import { fetchAllCustomers } from "../../Redux/customerSlice";

const Cart = ({ triggerRefreshMenu }) => {
  const user = useSelector((state) => state.user.user);
  const { allCustomers = [] } = useSelector((state) => state.customers);

  const dispatch = useDispatch();

  const [errorMsg, setErrorMsg] = useState("");
  const [lastTransactionDetails, setLastTransactionDetails] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showLoadingModal, setShowLoadingModal] = useState(false);
  const [useLoyal, setUseLoyal] = useState(false);
  const [loyalCustomerId, setLoyalCustomerId] = useState("");

  useEffect(() => {
    dispatch(fetchAllCustomers()); // Fetch loyal customers from backend
  }, [dispatch]);

  const [customerDetails, setCustomerDetails] = useState({
    name: "Mteja",
    phone: "0777777777",
  });

  const handleLoyalToggle = (e) => {
    setUseLoyal(e.target.checked);
    if (!e.target.checked) setLoyalCustomerId(""); // reset if unchecked
  };

  const handleLoyalSelect = (e) => {
    setLoyalCustomerId(e.target.value); // store the ObjectId
  };

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
    if (isProcessing) return;
    setIsProcessing(true);
    setShowLoadingModal(true);

    try {
      const payload = {
        items: cartData.map((item) => ({
          item: item.id,
          quantity: item.quantity,
          price: item.pricePerQuantity,
        })),
        totalAmount: finalTotal,
        customerDetails: useLoyal ? {} : customerDetails,
        loyalCustomer: useLoyal ? loyalCustomerId : null,
        status,
      };

      const response = await axios.post(
        `${BASE_URL}/api/transactions/sales`,
        payload,
        { withCredentials: true }
      );

      if (response.status === 201) {
        toast.success(
          `Transaction ${
            status === "Paid" ? "completed" : "saved as bill"
          } successfully!`,
          {
            position: "bottom-right",
            style: {
              borderRadius: "12px",
              background: "#27ae60",
              color: "#fff",
              fontSize: "18px",
            },
          }
        );

        dispatch(clearCart());
        triggerRefreshMenu();

        setLastTransactionDetails({
          items: payload.items,
          totalAmount: payload.totalAmount,
          customerDetails: payload.customerDetails,
        });

        dispatch(setReceiptPrinted(false));
        setShowPrintButton(true);
        setShowLoadingModal(false);
      } else {
        alert("Transaction failed");
      }
    } catch (error) {
      setShowLoadingModal(false);
      setErrorMsg(error.response?.data?.message || "Something went wrong.");
    } finally {
      setIsProcessing(false);
    }
  };

  const [pdfUrl, setPdfUrl] = useState("");
  const [showPrintButton, setShowPrintButton] = useState(false);

  const handlePrintReceipt = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}/api/receipt/receipt`,
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
      toast.error("Failed to generate receipt", {
        position: "bottom-right",
        style: {
          borderRadius: "12px",
          background: "#e74c3c",
          color: "#fff",
          fontSize: "18px",
        },
      });
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
          {/* Toggle between normal or loyal customer */}
          <div className="flex items-center space-x-3 mb-6">
            <input
              id="loyal-customer-checkbox"
              type="checkbox"
              checked={useLoyal}
              onChange={handleLoyalToggle}
              className="hidden" // Hides the default checkbox
            />
            <label
              htmlFor="loyal-customer-checkbox"
              className="relative flex items-center justify-center w-6 h-6 rounded-md border-2 border-gray-400 cursor-pointer transition-all duration-200"
            >
              <div
                className={`w-3 h-3 rounded-full bg-green-500 transform scale-0 transition-transform duration-200 ${
                  useLoyal ? "scale-100" : ""
                }`}
              ></div>
            </label>
            <label
              htmlFor="loyal-customer-checkbox"
              className="text-gray-800 font-medium cursor-pointer"
            >
              Use Loyal Customer
            </label>
          </div>

          {useLoyal ? (
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 transition-transform transform hover:scale-[1.01]">
              <label className="block text-gray-800 text-lg font-bold mb-3">
                Select Loyal Customer
              </label>
              <select
                onChange={handleLoyalSelect}
                className="w-full px-5 py-3 rounded-lg border-2 border-gray-300 focus:outline-none focus:ring-4 focus:ring-green-500 focus:border-green-500 transition-colors duration-200 shadow-sm text-gray-700 font-medium"
                defaultValue=""
              >
                <option value="" disabled>
                  Select Loyal Customer
                </option>
                {allCustomers.map((customer) => (
                  <option key={customer._id} value={customer._id}>
                    {customer.customerName}
                  </option>
                ))}
              </select>
            </div>
          ) : (
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
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400 shadow-sm"
                  placeholder="Enter phone number"
                />
              </div>
            </div>
          )}
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

        {showLoadingModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white px-6 py-8 rounded-lg shadow-xl text-center w-80">
              <h2 className="text-lg font-semibold mb-4 text-gray-700">
                Processing Transaction...
              </h2>
              <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                <div className="bg-green-500 h-4 animate-pulse w-full" />
              </div>
            </div>
          </div>
        )}

        {/* Buttons */}
        {!showPrintButton ? (
          <div className="flex gap-4">
            {user?.roles?.canMakeTransaction ? (
              <>
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
              </>
            ) : (
              <p className="text-center text-red-500 font-semibold mt-2 bg-red-200 px-2 py-2 rounded-md pr-14">
                You do not have permission to perform transactions.
              </p>
            )}
          </div>
        ) : (
          //Print Receipt
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

        <hr className="border-gray-400 mt-2" />
        <div className="mb-2">{""}</div>
      </div>
    </>
  );
};

export default Cart;
