import { useDispatch, useSelector } from "react-redux";
import {
  clearCart,
  getTotalPrice,
  setReceiptPrinted,
  getTotalItemDiscount,
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
  const cartData = useSelector((state) => state.cart.cart);
  const originalTotal = useSelector(getTotalPrice); // gross total before any discounts
  const totalItemDiscount = useSelector(getTotalItemDiscount);

  const dispatch = useDispatch();

  const [errorMsg, setErrorMsg] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showLoadingModal, setShowLoadingModal] = useState(false);
  const [useLoyal, setUseLoyal] = useState(false);
  const [loyalCustomerId, setLoyalCustomerId] = useState("");
  const [useExtraDiscount, setUseExtraDiscount] = useState(false);
  const [extraDiscount, setExtraDiscount] = useState(0);

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

  //TOTALS
  const taxRate = 0; // adjust if you have tax

  // Combined discount to be sent to backend (item discounts + extra discount)
  const totalDiscount =
    totalItemDiscount + (useExtraDiscount ? extraDiscount : 0);

  // Maximum allowed extra discount so that total discount ≤ 10% of original total
  const maxExtraDiscount = Math.max(0, originalTotal * 0.1 - totalItemDiscount);

  // Taxable amount after all discounts
  const taxableAmount = originalTotal - totalDiscount;
  const tax = (taxableAmount * taxRate) / 100;
  const finalTotal = taxableAmount + tax;

  //TRANSACTION HANDLER
  const handleTransaction = async (status) => {
    if (cartData.length === 0) {
      toast.error("Please add items to the cart before proceeding!", {
        position: "bottom-right",
        style: {
          borderRadius: "12px",
          background: "#e74c3c",
          color: "#fff",
          fontSize: "18px",
        },
      });
      return; // STOP the transaction completely
    }

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
        tradeDiscount: totalDiscount,
      };

      const response = await axios.post(
        `${BASE_URL}/api/transactions/sales`,
        payload,
        { withCredentials: true },
      );

      if (response.status === 201) {
        const saleId = response.data.data._id;
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
          },
        );

        dispatch(clearCart());
        setExtraDiscount(0);
        setUseExtraDiscount(false);
        triggerRefreshMenu();
        setLastSaleId(saleId);
        dispatch(setReceiptPrinted(false));
        setShowPrintButton(true);
        setShowLoadingModal(false);
        setErrorMsg("");
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

  //RECEIPT PRINTING
  const [lastSaleId, setLastSaleId] = useState(null);
  const [showPrintButton, setShowPrintButton] = useState(false);

  //Handle Print Receipt
  const handlePrintReceipt = () => {
    if (!lastSaleId) {
      toast.error("No transaction found to print");
      return;
    }

    window.open(`${BASE_URL}/api/receipt/${lastSaleId}/receipt`, "_blank");

    dispatch(setReceiptPrinted(true));
    setShowPrintButton(false);
  };

  return (
    <>
      {/* Customer Details, Name and Phone Number */}
      <div className="mt-6 space-y-6">
        {/* Customer Input Section */}
        <div className="bg-gradient-to-r from-blue-100 to-green-200 rounded-xl shadow-lg px-6 py-6">
          {/* Toggle between normal or loyal customer */}
          <div className="flex items-center justify-between space-x-3 mb-6">
            <h2 className="text-xl font-semibold text-gray-800">
              Customer Info
            </h2>
            <input
              id="loyal-customer-checkbox"
              type="checkbox"
              checked={useLoyal}
              onChange={handleLoyalToggle}
              className="hidden toggle-checkbox sr-only"
            />

            <label
              htmlFor="loyal-customer-checkbox"
              className="toggle-label block w-12 h-6 rounded-full transition bg-gray-300 relative"
            >
              <span
                className={`dot absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition 
      ${useLoyal ? "translate-x-6 bg-green-500" : ""}`}
              />
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
                {allCustomers
                  .filter((customer) => customer.status === "Active")
                  .map((customer) => (
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

        {/* Trade Discount Section */}
        <div className="bg-white rounded-xl shadow px-6 py-4 space-y-3 mt-4">
          <label className="flex items-center justify-between p-4 border rounded-xl bg-gray-50 hover:bg-gray-100 transition cursor-pointer">
            <div>
              <p className="text-gray-900 font-semibold">Extra Discount</p>
              <p className="text-xs text-gray-500">
                Add additional discount (total discounts ≤ 10% of subtotal)
              </p>
            </div>
            <input
              type="checkbox"
              checked={useExtraDiscount}
              onChange={() => setUseExtraDiscount(!useExtraDiscount)}
              className="toggle-checkbox sr-only"
              id="extraDiscountToggle"
            />
            <label
              htmlFor="extraDiscountToggle"
              className="toggle-label block w-12 h-6 rounded-full transition bg-gray-300 relative"
            >
              <span
                className={`dot absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition 
                  ${useExtraDiscount ? "translate-x-6 bg-green-500" : ""}`}
              />
            </label>
          </label>

          {useExtraDiscount && (
            <div className="mt-2">
              <label className="block text-gray-700 font-semibold mb-1">
                Extra Discount Amount
              </label>
              <input
                type="text"
                value={
                  extraDiscount > 0 ? extraDiscount.toLocaleString("en-US") : ""
                }
                onChange={(e) => {
                  // Remove commas and any non-numeric characters except decimal point
                  const rawValue = e.target.value.replace(/[^0-9.]/g, "");
                  // Handle empty input
                  const numericValue =
                    rawValue === "" ? 0 : parseFloat(rawValue);
                  if (isNaN(numericValue)) return;

                  if (numericValue > maxExtraDiscount) {
                    setExtraDiscount(maxExtraDiscount);
                    setErrorMsg(
                      `Total discount cannot exceed 10% of subtotal. You can add at most ${maxExtraDiscount.toLocaleString()} /= extra.`,
                    );
                  } else if (numericValue < 0) {
                    setExtraDiscount(0);
                    setErrorMsg("Discount cannot be negative.");
                  } else {
                    setExtraDiscount(numericValue);
                    setErrorMsg("");
                  }
                }}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-green-400 focus:border-green-400"
                placeholder={`Max extra: ${maxExtraDiscount.toLocaleString()} /=`}
                disabled={maxExtraDiscount <= 0}
              />
              {maxExtraDiscount <= 0 && (
                <p className="text-sm text-orange-600 mt-1">
                  Oyaaa, acha UPIMBI we falaa, dicount haitakiwi kuzidi 50% ya
                  Bei ya Bidhaa, utapata Hasara Mbwa wee.
                </p>
              )}
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
            <span className="bg-green-400 py-1 px-4 rounded-full">
              {cartData.length}
            </span>
          </div>

          {/* Tax */}
          {/* <div className="flex justify-between text-gray-800 font-medium">
            <span>Tax (2.5%)</span>
            <span>{tax}/=</span>
          </div> */}

          {/* Item Discounts line – always show if >0 */}
          {totalItemDiscount > 0 && (
            <div className="flex justify-between text-gray-800 font-medium">
              <span>Item Discounts</span>
              <span>-{totalItemDiscount.toLocaleString()}/=</span>
            </div>
          )}
          <div className="flex justify-between text-lg font-bold text-black pt-2 border-t">
            <span>Total (Tsh)</span>
            <span>{finalTotal?.toLocaleString()}/=</span>
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
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold hover:from-green-600 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg"
                >
                  Cash
                </button>
                <button
                  onClick={() => handleTransaction("Bill")}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all shadow-md hover:shadow-lg"
                >
                  Bill
                </button>
              </>
            ) : (
              <div className="w-full">
                <div className="backdrop-blur-sm bg-white/90 border border-red-200/50 rounded-xl p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-red-500/10 to-pink-500/10 border border-red-200/50 flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-red-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        No Access
                      </p>
                      <p className="text-xs text-gray-600">
                        Transaction permissions not granted
                      </p>
                    </div>
                  </div>
                </div>
              </div>
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
          </div>
        )}

        <hr className="border-gray-400 mt-2" />
        <div className="mb-2">{""}</div>
      </div>
    </>
  );
};

export default Cart;
