// components/Cart.jsx
import { useDispatch, useSelector } from "react-redux";
import {
  clearCart,
  getSubTotal,
  setReceiptPrinted,
  getTotalItemDiscount,
  addItems,
} from "../../Redux/cartSlice";
import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

// API
import BASE_URL from "../../Utils/config";
import { fetchAllCustomers } from "../../Redux/customerSlice";

// Icons
import { FaTimes, FaCheckCircle, FaShoppingCart, FaBox } from "react-icons/fa";

const Cart = ({
  triggerRefreshMenu,
  orderToPay = null,
  onOrderPaymentComplete = () => {},
}) => {
  const dispatch = useDispatch();

  // Redux Selectors
  const user = useSelector((state) => state.user.user);
  const { allCustomers = [] } = useSelector((state) => state.customers);
  const cartData = useSelector((state) => state.cart.cart);
  const originalTotal = useSelector(getSubTotal);
  const totalItemDiscount = useSelector(getTotalItemDiscount);

  // Local Component States
  const [errorMsg, setErrorMsg] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showLoadingModal, setShowLoadingModal] = useState(false);
  const [useLoyal, setUseLoyal] = useState(false);
  const [loyalCustomerId, setLoyalCustomerId] = useState("");

  // Extra Discount
  const [useExtraDiscount, setUseExtraDiscount] = useState(false);
  const [extraDiscount, setExtraDiscount] = useState(0);

  // Order Payment States
  const [isOrderPaymentMode, setIsOrderPaymentMode] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [selectedOrderItems, setSelectedOrderItems] = useState({});
  const [showOrderFulfillment, setShowOrderFulfillment] = useState(false);

  const [customerDetails, setCustomerDetails] = useState({
    name: "Mteja",
    phone: "0777777777",
  });

  const [validation, setValidation] = useState({
    name: true,
    phone: true,
  });

  const [lastSaleId, setLastSaleId] = useState(null);
  const [showPrintButton, setShowPrintButton] = useState(false);

  // Fetch Customers on Mount
  useEffect(() => {
    dispatch(fetchAllCustomers());
  }, [dispatch]);

  // Effect to handle order payment trigger
  useEffect(() => {
    if (orderToPay) {
      startOrderPayment(orderToPay);
      onOrderPaymentComplete();
    }
  }, [orderToPay]);

  // Handlers
  const handleLoyalToggle = (e) => {
    setUseLoyal(e.target.checked);
    if (!e.target.checked) setLoyalCustomerId("");
  };

  const handleLoyalSelect = (e) => {
    setLoyalCustomerId(e.target.value);
  };

  const handleInput = (e) => {
    const { name, value } = e.target;
    setCustomerDetails({ ...customerDetails, [name]: value });

    if (name === "phone") {
      const phoneVali = /^[0-9]{10}$/;
      setValidation((prev) => ({ ...prev, phone: phoneVali.test(value) }));
    }
  };

  // ==================== ORDER PAYMENT FUNCTIONS ====================
  const startOrderPayment = (order) => {
    // Check if order is already completed
    if (order.status === "Completed") {
      toast.error(`Order #${order.orderNumber} is already completed!`);
      return;
    }

    // Check if there are pending items
    const pendingItems = order.items.filter(
      (item) => item.fulfillmentStatus === "Pending",
    );
    if (pendingItems.length === 0) {
      toast.error(
        `All items in order #${order.orderNumber} are already fulfilled!`,
      );
      return;
    }

    // Check if this order already has items in cart
    const existingOrderItems = cartData.filter(
      (item) => item.orderId === order._id,
    );
    if (existingOrderItems.length > 0) {
      toast.error(
        `Order #${order.orderNumber} already has items in cart. Complete or clear them first.`,
      );
      return;
    }

    setCurrentOrder(order);
    setIsOrderPaymentMode(true);
    setShowOrderFulfillment(true);

    // Pre-select all pending items
    const initialSelection = {};
    order.items.forEach((item) => {
      const itemId = item.item._id || item.item;
      if (item.fulfillmentStatus === "Pending") {
        initialSelection[itemId] = true;
      }
    });
    setSelectedOrderItems(initialSelection);
  };

  const toggleOrderItemSelection = (itemId) => {
    setSelectedOrderItems((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  const handleAddSelectedOrderItemsToCart = () => {
    if (!currentOrder) return;

    const selectedItems = currentOrder.items.filter(
      (item) =>
        selectedOrderItems[item.item._id || item.item] &&
        item.fulfillmentStatus === "Pending",
    );

    if (selectedItems.length === 0) {
      toast.error("Please select at least one item to fulfill");
      return;
    }

    // Add each selected item to cart
    selectedItems.forEach((item) => {
      const itemData = item.item || {};
      const price = item.unitPrice || 0;

      const newObj = {
        id: itemData._id || item.item,
        name: item.itemName,
        pricePerQuantity: price,
        quantity: item.quantity,
        totalPrice: price * item.quantity,
        itemQuantity: itemData.itemQuantity || 0,
        priceType: "Retail",
        buyingPrice: itemData.buyingPrice || 0,
        retailPrice: itemData.price || item.unitPrice || 0,
        wholesalePrice: itemData.wholesalePrice || 0,
        packageSize: 1,
        unitsPerPackage: 1,
        expiryDate: itemData.expiryDate || null,
        isExpired: false,
        orderId: currentOrder._id,
        orderNumber: currentOrder.orderNumber,
        orderItemId: item._id,
        fulfillmentStatus: item.fulfillmentStatus,
        isFromOrder: true,
        discount: 0,
      };

      dispatch(addItems(newObj));
    });

    const totalItems = selectedItems.reduce(
      (sum, item) => sum + item.quantity,
      0,
    );
    toast.success(
      `${selectedItems.length} items (${totalItems} units) added to cart from order #${currentOrder.orderNumber}`,
    );
    setShowOrderFulfillment(false);
  };

  // ==================== FINANCIAL CALCULATIONS ====================
  const taxRate = 0;
  const totalDiscount =
    totalItemDiscount + (useExtraDiscount ? extraDiscount : 0);
  const maxExtraDiscount = Math.max(0, originalTotal * 0.1 - totalItemDiscount);
  const taxableAmount = Math.max(0, originalTotal - totalDiscount);
  const tax = (taxableAmount * taxRate) / 100;
  const finalTotal = taxableAmount + tax;

  // ==================== TRANSACTION PROCESSOR ====================
  // components/CartBill.jsx - Update the handleTransaction function

  const handleTransaction = async (status) => {
    if (cartData.length === 0) {
      toast.error("Please add items to the cart before proceeding!");
      return;
    }

    if (isProcessing) return;
    setIsProcessing(true);
    setShowLoadingModal(true);

    try {
      // Prepare items payload
      const itemsPayload = cartData.map((item) => ({
        item: item.id,
        quantity: item.quantity,
        pricePerQuantity: item.pricePerQuantity,
        discount: item.discount || 0,
        totalPrice: item.totalPrice,
        orderItemId: item.orderItemId || null,
      }));

      const payload = {
        items: itemsPayload,
        customerDetails: useLoyal ? {} : customerDetails,
        loyalCustomer: useLoyal ? loyalCustomerId : null,
        totalDiscount,
        subtotal: originalTotal,
        finalTotal,
        status,
      };

      // CRITICAL FIX: Always check if cart has order items
      const orderItemsInCart = cartData.filter(
        (item) => item.isFromOrder && item.orderId,
      );

      // If there are order items in cart, find the order ID
      if (orderItemsInCart.length > 0) {
        // Get unique order IDs from cart
        const orderIds = [
          ...new Set(orderItemsInCart.map((item) => item.orderId)),
        ];

        // If there's only one order, use it
        if (orderIds.length === 1) {
          payload.orderId = orderIds[0];

          // Build orderItemsToFulfill from cart items
          const itemsToFulfill = orderItemsInCart.map((item) => ({
            orderItemId: item.orderItemId,
            itemId: item.id,
            quantity: item.quantity,
          }));

          payload.orderItemsToFulfill = itemsToFulfill;

          console.log("Order Payment Detected - Payload:", {
            orderId: payload.orderId,
            orderItemsToFulfill: payload.orderItemsToFulfill,
          });
        } else if (orderIds.length > 1) {
          toast.error(
            "Cannot process multiple orders at once. Please clear cart and try one order at a time.",
          );
          setShowLoadingModal(false);
          setIsProcessing(false);
          return;
        }
      }

      // If this is an explicit order payment mode (from "Pay Order" button)
      if (isOrderPaymentMode && currentOrder) {
        payload.orderId = currentOrder._id;

        const itemsToFulfill = currentOrder.items
          .filter((orderItem) => {
            const itemId = orderItem.item._id || orderItem.item;
            return (
              selectedOrderItems[itemId] &&
              orderItem.fulfillmentStatus === "Pending"
            );
          })
          .map((orderItem) => ({
            orderItemId: orderItem._id.toString(),
            itemId:
              orderItem.item._id?.toString() || orderItem.item?.toString(),
            quantity: orderItem.quantity,
          }));

        payload.orderItemsToFulfill = itemsToFulfill;

        console.log("Explicit Order Payment Payload:", {
          orderId: payload.orderId,
          orderItemsToFulfill: payload.orderItemsToFulfill,
          items: payload.items,
        });
      }

      console.log(
        "Final Payload being sent:",
        JSON.stringify(payload, null, 2),
      );

      const response = await axios.post(
        `${BASE_URL}/api/transactions/sales`,
        payload,
        { withCredentials: true },
      );

      if (response.status === 201) {
        const saleId = response.data.data._id;

        if (response.data.orderUpdate) {
          const { orderUpdate } = response.data;

          if (orderUpdate.isFullyCompleted) {
            toast.success(
              `✅ Order #${currentOrder?.orderNumber || ""} COMPLETED successfully!`,
              {
                duration: 5000,
                icon: "🎉",
              },
            );
          } else if (orderUpdate.status === "Partially Completed") {
            toast.success(
              `📦 ${orderUpdate.completedItems}/${orderUpdate.totalItems} items fulfilled. Remaining balance: ${orderUpdate.remainingBalance?.toLocaleString() || 0}/=`,
              { duration: 5000 },
            );
          }
        } else {
          // If no order update but we had order items, check if order was updated
          if (payload.orderId) {
            toast.info("Order is being processed. Refreshing...");
            // Refresh orders to see updated status
            setTimeout(() => {
              triggerRefreshMenu();
            }, 1000);
          }
        }

        toast.success(
          `Transaction ${status === "Paid" ? "completed" : "saved as bill"} successfully!`,
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

        setIsOrderPaymentMode(false);
        setCurrentOrder(null);
        setSelectedOrderItems({});
        setShowOrderFulfillment(false);

        setTimeout(() => {
          triggerRefreshMenu();
        }, 2000);
      }
    } catch (error) {
      setShowLoadingModal(false);
      console.error("Transaction error:", error);
      const errorMessage =
        error.response?.data?.message || "Something went wrong.";
      setErrorMsg(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePrintReceipt = () => {
    if (!lastSaleId) {
      toast.error("No transaction found to print");
      return;
    }

    window.open(`${BASE_URL}/api/receipt/${lastSaleId}/receipt`, "_blank");
    dispatch(setReceiptPrinted(true));
    setShowPrintButton(false);
  };

  // ==================== RENDER ORDER FULFILLMENT MODAL ====================
  const renderOrderFulfillmentModal = () => {
    if (!showOrderFulfillment || !currentOrder) return null;

    const formatCurrency = (amount) => {
      return `TSh ${(amount || 0).toLocaleString()}`;
    };

    const getStatusBadge = (status) => {
      const statusMap = {
        Pending: "bg-yellow-100 text-yellow-700",
        "Partially Completed": "bg-blue-100 text-blue-700",
        Completed: "bg-green-100 text-green-700",
        Cancelled: "bg-red-100 text-red-700",
      };
      return statusMap[status] || "bg-gray-100 text-gray-700";
    };

    const selectedCount =
      Object.values(selectedOrderItems).filter(Boolean).length;
    const pendingItems = currentOrder.items.filter(
      (item) => item.fulfillmentStatus === "Pending",
    );

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
        <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
          <div className="sticky top-0 bg-white z-10 p-6 border-b border-gray-200 rounded-t-2xl">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <FaShoppingCart className="text-emerald-500" />
                Fulfill Order Items
              </h2>
              <button
                onClick={() => {
                  setShowOrderFulfillment(false);
                  setIsOrderPaymentMode(false);
                  setCurrentOrder(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FaTimes className="text-gray-500" />
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* Order Info */}
            <div className="mb-6 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-200">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-500">Order #</p>
                  <p className="font-semibold text-gray-800">
                    {currentOrder.orderNumber}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Status</p>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(currentOrder.status)}`}
                  >
                    {currentOrder.status}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Customer</p>
                  <p className="font-semibold text-gray-800">
                    {currentOrder.customerName}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Total</p>
                  <p className="font-semibold text-gray-800">
                    {formatCurrency(currentOrder.grandTotal)}
                  </p>
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-emerald-200">
                <p className="text-xs text-gray-500">
                  Pending Items:{" "}
                  <span className="font-semibold">{pendingItems.length}</span>
                  {currentOrder.paymentStatus && (
                    <>
                      {" "}
                      | Payment:{" "}
                      <span className="font-semibold">
                        {currentOrder.paymentStatus}
                      </span>
                    </>
                  )}
                  {currentOrder.balance > 0 && (
                    <>
                      {" "}
                      | Balance:{" "}
                      <span className="font-semibold text-red-600">
                        {formatCurrency(currentOrder.balance)}
                      </span>
                    </>
                  )}
                </p>
              </div>
            </div>

            {/* Items List */}
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              <div className="flex justify-between items-center mb-3">
                <p className="text-sm text-gray-600">
                  Select items to fulfill from this order:
                </p>
                <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
                  {selectedCount} selected
                </span>
              </div>

              {currentOrder.items.map((item) => {
                const itemId = item.item._id || item.item;
                const isSelected = selectedOrderItems[itemId] || false;
                const isCompleted = item.fulfillmentStatus === "Completed";
                const itemData = item.item || {};

                return (
                  <div
                    key={item._id}
                    className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                      isCompleted
                        ? "bg-green-50 border-green-200 opacity-70"
                        : isSelected
                          ? "bg-blue-50 border-blue-300 shadow-sm"
                          : "bg-gray-50 border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleOrderItemSelection(itemId)}
                        disabled={isCompleted}
                        className="w-5 h-5 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500 disabled:opacity-50"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-gray-800 truncate">
                            {item.itemName}
                          </p>
                          {isCompleted && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <FaCheckCircle className="w-3 h-3" />
                              Fulfilled
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600 flex-wrap mt-1">
                          <span>Qty: {item.quantity}</span>
                          <span>Price: {formatCurrency(item.unitPrice)}</span>
                          {itemData.itemQuantity !== undefined &&
                            !isCompleted && (
                              <span className="text-xs">
                                Stock:{" "}
                                <span
                                  className={
                                    itemData.itemQuantity > 0
                                      ? "text-green-600"
                                      : "text-red-600"
                                  }
                                >
                                  {itemData.itemQuantity}
                                </span>
                              </span>
                            )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-3">
                      <p className="font-bold text-gray-800">
                        {formatCurrency(item.totalPrice)}
                      </p>
                      {!isCompleted && isSelected && (
                        <span className="text-xs text-blue-600 font-medium">
                          Selected
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={handleAddSelectedOrderItemsToCart}
                disabled={selectedCount === 0}
                className={`flex-1 py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2
                  ${
                    selectedCount === 0
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:shadow-lg hover:scale-[1.02] transform"
                  }`}
              >
                <FaShoppingCart className="w-4 h-4" />
                Add Selected ({selectedCount} items) to Cart
              </button>
              <button
                onClick={() => {
                  setShowOrderFulfillment(false);
                  setIsOrderPaymentMode(false);
                  setCurrentOrder(null);
                }}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ==================== MAIN RENDER ====================
  return (
    <>
      <div className="mt-6 space-y-6">
        {/* Customer Input Section */}
        <div className="bg-gradient-to-r from-blue-100 to-green-200 rounded-xl shadow-lg px-6 py-6">
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
              className="toggle-label block w-12 h-6 rounded-full transition bg-gray-300 relative cursor-pointer"
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
                  type="text"
                  name="phone"
                  value={customerDetails.phone}
                  onChange={handleInput}
                  className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 shadow-sm ${
                    validation.phone
                      ? "border-gray-300 focus:ring-green-400"
                      : "border-red-500 focus:ring-red-400"
                  }`}
                  placeholder="Enter phone number"
                />
              </div>
            </div>
          )}
        </div>

        {/* Cart Items Display */}
        <div className="bg-white rounded-xl shadow px-4 py-3">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold text-gray-700">Cart Items</h3>
            <span className="text-sm bg-gray-100 px-3 py-1 rounded-full">
              {cartData.length} items
            </span>
          </div>

          {cartData.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FaBox className="text-3xl mx-auto mb-2 text-gray-300" />
              <p>No items in cart</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {cartData.map((item, index) => (
                <div
                  key={index}
                  className="text-sm flex justify-between py-1 border-b border-gray-100 last:border-0"
                >
                  <span className="truncate">
                    {item.isFromOrder && (
                      <span className="text-xs text-blue-500 mr-1">📦</span>
                    )}
                    {item.name}
                    {item.isFromOrder && (
                      <span className="text-xs text-gray-400 ml-1">
                        (Order #{item.orderNumber})
                      </span>
                    )}
                  </span>
                  <span className="font-semibold">
                    {item.quantity} × {item.pricePerQuantity.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Trade Discount Section */}
        <div className="bg-white rounded-xl shadow px-6 py-4 space-y-3">
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
              className="toggle-label block w-12 h-6 rounded-full transition bg-gray-300 relative cursor-pointer"
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
                  const rawValue = e.target.value.replace(/[^0-9.]/g, "");
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
                  Oyaaa, acha UPIMBI we falaa, discount haitakiwi kuzidi 10% ya
                  Bei ya Bidhaa, utapata Hasara Mbwa wee.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="text-red-600 font-semibold text-center bg-red-50 p-3 rounded-lg border border-red-200">
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

          {totalItemDiscount > 0 && (
            <div className="flex justify-between text-gray-800 font-medium">
              <span>Item Discounts</span>
              <span>-{totalItemDiscount.toLocaleString()}/=</span>
            </div>
          )}

          {useExtraDiscount && extraDiscount > 0 && (
            <div className="flex justify-between text-gray-800 font-medium">
              <span>Extra Discount</span>
              <span>-{extraDiscount.toLocaleString()}/=</span>
            </div>
          )}

          <div className="flex justify-between text-lg font-bold text-black pt-2 border-t">
            <span>Total (Tsh)</span>
            <span>{finalTotal?.toLocaleString()}/=</span>
          </div>
        </div>

        {/* Processing Modal */}
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

        {/* Action Buttons */}
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
      </div>

      {/* Order Fulfillment Modal */}
      {renderOrderFulfillmentModal()}
    </>
  );
};

export default Cart;
