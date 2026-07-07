import { useState, useEffect } from "react";
import axios from "axios";
import {
  FaShoppingCart,
  FaTrash,
  FaPlus,
  FaMinus,
  FaCheckCircle,
  FaSearch,
  FaBoxOpen,
  FaSpinner,
  FaPhone,
  FaUser,
  FaStickyNote,
  FaStore,
  FaArrowRight,
  FaTimes,
  FaExclamationTriangle,
} from "react-icons/fa";

// BASE URL
import BASE_URL from "../../Utils/config";

// Toast Component
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === "error" ? "bg-red-500" : "bg-emerald-500";
  const icon =
    type === "error" ? (
      <FaExclamationTriangle className="text-white" />
    ) : (
      <FaCheckCircle className="text-white" />
    );

  return (
    <div className="fixed top-20 right-4 z-50 animate-slide-in">
      <div
        className={`${bgColor} text-white px-6 py-4 rounded-xl shadow-2xl max-w-md flex items-center gap-3`}
      >
        <div className="flex-shrink-0">{icon}</div>
        <p className="text-sm font-medium flex-1">{message}</p>
        <button
          onClick={onClose}
          className="flex-shrink-0 hover:opacity-70 transition-opacity"
        >
          <FaTimes />
        </button>
      </div>
    </div>
  );
};

const ReuestOrder = () => {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [requestNumber, setRequestNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toast, setToast] = useState(null);

  // Toast helper functions
  const showToast = (message, type = "error") => {
    setToast({ message, type });
  };

  const hideToast = () => {
    setToast(null);
  };

  // Fetch available items on load
  useEffect(() => {
    fetchItems();
  }, []);

  // Filter items when search term changes
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredItems(items);
    } else {
      const filtered = items.filter((item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase().trim())
      );
      setFilteredItems(filtered);
    }
  }, [searchTerm, items]);

  const fetchItems = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/items/public/items`);
      setItems(res.data.data);
      setFilteredItems(res.data.data);
    } catch (err) {
      console.error("Error fetching items:", err);
      showToast("Failed to load items. Please refresh the page.", "error");
    }
  };

  const addToCart = (item) => {
    // Check if stock is available
    if (item.itemQuantity <= 0) {
      showToast(`"${item.name}" is currently out of stock.`, "error");
      return;
    }

    // Use functional update to ensure we're working with the latest state
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((c) => c.itemId === item._id);

      if (existingIndex !== -1) {
        // Item exists, check quantity limit
        const existingItem = prevCart[existingIndex];
        if (existingItem.quantity + 1 > item.itemQuantity) {
          showToast(
            `Only ${item.itemQuantity} units of "${item.name}" available.`,
            "error"
          );
          return prevCart;
        }

        // Update quantity
        const updatedCart = [...prevCart];
        updatedCart[existingIndex] = {
          ...updatedCart[existingIndex],
          quantity: updatedCart[existingIndex].quantity + 1,
        };
        return updatedCart;
      } else {
        // New item
        return [
          ...prevCart,
          {
            itemId: item._id,
            name: item.name,
            quantity: 1,
            maxQuantity: item.itemQuantity,
            price: item.price,
            wholesalePrice: item.wholesalePrice,
            enableWholesale: item.enableWholesale,
            wholesaleMinQty: item.wholesaleMinQty,
          },
        ];
      }
    });
  };

  const removeFromCart = (itemId) => {
    setCart((prevCart) => prevCart.filter((c) => c.itemId !== itemId));
  };

  const updateQuantity = (itemId, qty) => {
    if (qty <= 0) {
      removeFromCart(itemId);
      return;
    }

    setCart((prevCart) => {
      const cartItem = prevCart.find((c) => c.itemId === itemId);
      if (cartItem && qty > cartItem.maxQuantity) {
        showToast(
          `Only ${cartItem.maxQuantity} units of "${cartItem.name}" available.`,
          "error"
        );
        return prevCart;
      }

      return prevCart.map((c) =>
        c.itemId === itemId ? { ...c, quantity: qty } : c
      );
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!customerName.trim()) {
      showToast("Customer name is required", "error");
      return;
    }

    if (!customerPhone.trim()) {
      showToast("Customer phone is required", "error");
      return;
    }

    if (cart.length === 0) {
      showToast("At least one item is required", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${BASE_URL}/api/orders/addRequests`, {
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        items: cart.map((c) => ({
          itemId: c.itemId,
          quantity: c.quantity,
        })),
      });

      setRequestNumber(res.data.data.requestNumber);
      setSubmitted(true);
      setCart([]);
      showToast("Request submitted successfully!", "success");
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || "Failed to submit request";
      showToast(errorMsg, "error");
    } finally {
      setLoading(false);
    }
  };

  const [checkNumber, setCheckNumber] = useState("");
  const [requestStatus, setRequestStatus] = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusError, setStatusError] = useState("");

  const checkStatus = async () => {
    if (!checkNumber.trim()) {
      setStatusError("Please enter a request number");
      return;
    }

    setStatusLoading(true);
    setStatusError("");
    setRequestStatus(null);

    try {
      const res = await axios.get(
        `${BASE_URL}/api/orders/public/requests/${checkNumber.trim()}`
      );
      setRequestStatus(res.data.data);
    } catch (error) {
      setStatusError(error.response?.data?.message || "Request not found");
    } finally {
      setStatusLoading(false);
    }
  };

  const resetForm = () => {
    setSubmitted(false);
    setCustomerName("");
    setCustomerPhone("");
    setNotes("");
    setCart([]);
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      Pending: "bg-amber-100 text-amber-700 border-amber-200",
      Converted: "bg-emerald-100 text-emerald-700 border-emerald-200",
      Rejected: "bg-red-100 text-red-700 border-red-200",
    };
    return statusMap[status] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  const calculateItemTotal = (cartItem) => {
    let unitPrice = cartItem.price;
    if (
      cartItem.enableWholesale &&
      cartItem.quantity >= cartItem.wholesaleMinQty &&
      cartItem.wholesalePrice > 0
    ) {
      unitPrice = cartItem.wholesalePrice;
    }
    return unitPrice * cartItem.quantity;
  };

  const cartTotal = cart.reduce(
    (sum, item) => sum + calculateItemTotal(item),
    0
  );

  // Format currency - Now using TSh (Tanzanian Shillings)
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "TZS",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
      .format(amount)
      .replace("TZS", "TSh");
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-10 text-center border border-white/50 transform transition-all duration-500">
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-200 animate-bounce">
            <FaCheckCircle className="text-white text-4xl" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Request Submitted!
          </h2>
          <p className="text-gray-600 mb-1">Your request number:</p>
          <p className="text-2xl font-mono font-bold text-transparent bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text mb-4">
            {requestNumber}
          </p>
          <div className="bg-emerald-50 rounded-xl p-4 mb-8 border border-emerald-100">
            <p className="text-sm text-gray-600">
              📌 Save this number to check your order status later.
            </p>
          </div>
          <button
            onClick={resetForm}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold py-3 px-6 rounded-xl hover:shadow-lg hover:shadow-emerald-200 transition-all duration-300 hover:scale-[1.02] active:scale-95"
          >
            Place Another Request
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      )}

      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl shadow-lg shadow-emerald-200">
                <FaStore className="text-white text-xl" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">
                  Order Request
                </h1>
                <p className="text-xs text-gray-500">
                  Submit your request for review
                </p>
              </div>
            </div>
            {/* Mobile Cart Toggle */}
            <button
              onClick={() => setIsCartOpen(!isCartOpen)}
              className="lg:hidden relative bg-emerald-50 px-4 py-2 rounded-full border border-emerald-200 flex items-center gap-2"
            >
              <FaShoppingCart className="text-emerald-600" />
              <span className="font-semibold text-emerald-700">
                {cart.length}
              </span>
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              )}
            </button>
            {/* Desktop Cart Summary */}
            {cart.length > 0 && (
              <div className="hidden lg:flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-200">
                <FaShoppingCart className="text-emerald-600" />
                <span className="font-semibold text-emerald-700">
                  {cart.length} items
                </span>
                <span className="text-sm text-emerald-600">
                  · {formatCurrency(cartTotal)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 lg:py-8">
        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          {/* Left Column - Items (2/3 width) */}
          <div className="lg:col-span-2">
            {/* Status Checker - Compact */}
            <div className="bg-white rounded-2xl shadow-md p-4 mb-6 border border-gray-100">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div className="flex items-center gap-2 text-gray-600">
                  <FaSearch className="text-gray-400" />
                  <span className="text-sm font-medium">Track Request</span>
                </div>
                <div className="flex-1 w-full flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    placeholder="Enter request number"
                    value={checkNumber}
                    onChange={(e) => setCheckNumber(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && checkStatus()}
                    className="flex-1 px-4 py-2 rounded-lg border border-gray-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 outline-none transition-all text-sm"
                  />
                  <button
                    onClick={checkStatus}
                    disabled={statusLoading}
                    className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium rounded-lg hover:shadow-lg hover:shadow-emerald-200 transition-all duration-300 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-sm whitespace-nowrap"
                  >
                    {statusLoading ? (
                      <FaSpinner className="animate-spin" />
                    ) : (
                      "Check Status"
                    )}
                  </button>
                </div>
              </div>
              {statusError && (
                <div className="mt-2 text-red-600 text-sm">{statusError}</div>
              )}
              {requestStatus && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200 grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold">
                      Request #
                    </p>
                    <p className="font-mono font-semibold text-gray-800 text-sm">
                      {requestStatus.requestNumber}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold">
                      Status
                    </p>
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(requestStatus.status)}`}
                    >
                      {requestStatus.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold">
                      Customer
                    </p>
                    <p className="text-gray-700 text-sm">
                      {requestStatus.customerName}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold">
                      Items
                    </p>
                    <p className="text-gray-700 text-sm">
                      {requestStatus.items?.length || 0} items
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Items Section with Search */}
            <div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    Available Items
                  </h2>
                  <p className="text-sm text-gray-500">
                    Search and select items to add to your request
                  </p>
                </div>
                <span className="text-sm text-gray-400">
                  {filteredItems.length} items
                </span>
              </div>

              {/* Search Bar */}
              <div className="mb-6">
                <div className="relative max-w-md">
                  <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search items by name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-12 py-3 rounded-xl border border-gray-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 outline-none transition-all bg-white"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <FaTimes />
                    </button>
                  )}
                </div>
                {searchTerm && filteredItems.length === 0 && (
                  <p className="mt-2 text-sm text-gray-500">
                    No items found matching
                  </p>
                )}
              </div>

              {/* Items Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredItems.map((item) => {
                  const isOutOfStock = item.itemQuantity <= 0;
                  return (
                    <div
                      key={item._id}
                      className={`group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-emerald-200 overflow-hidden ${isOutOfStock ? "opacity-60" : ""}`}
                    >
                      <div className="p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-gray-800 group-hover:text-emerald-600 transition-colors truncate">
                              {item.name}
                            </h3>
                            {isOutOfStock && (
                              <span className="inline-block mt-1 text-xs font-medium text-red-500 bg-red-50 px-2 py-0.5 rounded">
                                Out of Stock
                              </span>
                            )}
                          </div>
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                            <FaBoxOpen className="text-emerald-500 text-lg" />
                          </div>
                        </div>

                        <div className="mb-4">
                          <p className="text-2xl font-bold text-gray-900">
                            {formatCurrency(item.price)}
                          </p>
                          {item.enableWholesale && item.wholesalePrice > 0 && (
                            <div className="mt-1 flex items-center gap-2 flex-wrap">
                              <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
                                Wholesale
                              </span>
                              <span className="text-sm text-gray-500">
                                {formatCurrency(item.wholesalePrice)} (min{" "}
                                {item.wholesaleMinQty})
                              </span>
                            </div>
                          )}
                          <p className="text-xs text-gray-400 mt-1">
                            Stock: {item.itemQuantity} units
                          </p>
                        </div>

                        <button
                          onClick={() => addToCart(item)}
                          disabled={isOutOfStock}
                          className={`w-full font-semibold py-2.5 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${
                            !isOutOfStock
                              ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:shadow-lg hover:shadow-emerald-200 hover:scale-[1.02] active:scale-95"
                              : "bg-gray-200 text-gray-500 cursor-not-allowed"
                          }`}
                        >
                          <FaPlus className="text-sm" />
                          {isOutOfStock ? "Out of Stock" : "Add to Request"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Empty State for Items */}
              {cart.length === 0 &&
                items.length > 0 &&
                filteredItems.length === 0 &&
                searchTerm && (
                  <div className="text-center py-16">
                    <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FaSearch className="text-gray-400 text-4xl" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">
                      No items found
                    </h3>
                    <p className="text-gray-400">
                      Try adjusting your search term
                    </p>
                    <button
                      onClick={() => setSearchTerm("")}
                      className="mt-4 text-emerald-600 font-medium hover:text-emerald-700 transition-colors"
                    >
                      Clear search
                    </button>
                  </div>
                )}

              {cart.length === 0 &&
                items.length > 0 &&
                filteredItems.length > 0 &&
                !searchTerm && (
                  <div className="text-center py-16">
                    <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FaBoxOpen className="text-gray-400 text-4xl" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">
                      Your request is empty
                    </h3>
                    <p className="text-gray-400">
                      Browse items above and add them to your request
                    </p>
                  </div>
                )}
            </div>
          </div>

          {/* Right Column - Cart (1/3 width) - Desktop & Tablet */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-24">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-xl shadow-lg shadow-emerald-200">
                    <FaShoppingCart className="text-white text-xl" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">
                    Your Request
                  </h2>
                  <span className="ml-auto bg-emerald-100 text-emerald-600 px-3 py-1 rounded-full text-sm font-semibold">
                    {cart.length}
                  </span>
                </div>

                {cart.length === 0 ? (
                  <div className="text-center py-8">
                    <FaShoppingCart className="text-gray-300 text-4xl mx-auto mb-3" />
                    <p className="text-gray-400 text-sm">Your cart is empty</p>
                    <p className="text-gray-400 text-xs">
                      Add items from the left
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    {/* Cart Items - Now showing ALL items correctly */}
                    <div className="space-y-3 mb-4 max-h-[400px] overflow-y-auto pr-2">
                      {cart.map((c) => {
                        const itemTotal = calculateItemTotal(c);
                        return (
                          <div
                            key={c.itemId}
                            className="p-3 bg-gray-50 rounded-xl border border-gray-100"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <span className="font-medium text-gray-700 text-sm flex-1">
                                {c.name}
                              </span>
                              <button
                                type="button"
                                onClick={() => removeFromCart(c.itemId)}
                                className="text-red-400 hover:text-red-600 transition-colors ml-2 flex-shrink-0"
                              >
                                <FaTrash className="text-xs" />
                              </button>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateQuantity(c.itemId, c.quantity - 1)
                                  }
                                  className="w-7 h-7 rounded-lg bg-gray-200 hover:bg-gray-300 transition-colors flex items-center justify-center"
                                >
                                  <FaMinus className="text-xs text-gray-600" />
                                </button>
                                <input
                                  type="number"
                                  min="1"
                                  max={c.maxQuantity}
                                  value={c.quantity}
                                  onChange={(e) =>
                                    updateQuantity(
                                      c.itemId,
                                      parseInt(e.target.value) || 1
                                    )
                                  }
                                  className="w-12 text-center py-1 rounded-lg border border-gray-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 outline-none text-sm"
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateQuantity(c.itemId, c.quantity + 1)
                                  }
                                  className="w-7 h-7 rounded-lg bg-gray-200 hover:bg-gray-300 transition-colors flex items-center justify-center"
                                >
                                  <FaPlus className="text-xs text-gray-600" />
                                </button>
                              </div>
                              <span className="text-sm font-semibold text-gray-700">
                                {formatCurrency(itemTotal)}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Total */}
                    <div className="border-t border-gray-200 pt-3 mb-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 font-medium">
                          Total
                        </span>
                        <span className="text-xl font-bold text-transparent bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text">
                          {formatCurrency(cartTotal)}
                        </span>
                      </div>
                    </div>

                    {/* Customer Details */}
                    <div className="space-y-3">
                      <div className="relative">
                        <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                        <input
                          type="text"
                          placeholder="Full Name *"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          required
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 outline-none transition-all text-sm"
                        />
                      </div>
                      <div className="relative">
                        <FaPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                        <input
                          type="tel"
                          placeholder="Phone Number *"
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          required
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 outline-none transition-all text-sm"
                        />
                      </div>
                      <div className="relative">
                        <FaStickyNote className="absolute left-3 top-3 text-gray-400 text-sm" />
                        <textarea
                          placeholder="Additional notes (optional)"
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          rows="2"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 outline-none transition-all resize-none text-sm"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full mt-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold py-3 px-6 rounded-xl hover:shadow-lg hover:shadow-emerald-200 transition-all duration-300 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <FaSpinner className="animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          Submit Request
                          <FaArrowRight className="text-sm" />
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Cart Drawer */}
      <div
        className={`lg:hidden fixed inset-0 z-40 transition-all duration-300 ${
          isCartOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Overlay */}
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={() => setIsCartOpen(false)}
        ></div>

        {/* Drawer */}
        <div
          className={`absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl transition-transform duration-300 max-h-[90vh] ${
            isCartOpen ? "translate-y-0" : "translate-y-full"
          }`}
        >
          <div className="p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-xl shadow-lg shadow-emerald-200">
                  <FaShoppingCart className="text-white text-xl" />
                </div>
                <h2 className="text-xl font-bold text-gray-800">
                  Your Request
                </h2>
                <span className="bg-emerald-100 text-emerald-600 px-3 py-1 rounded-full text-sm font-semibold">
                  {cart.length}
                </span>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FaTimes className="text-gray-500" />
              </button>
            </div>

            {cart.length === 0 ? (
              <div className="text-center py-8">
                <FaShoppingCart className="text-gray-300 text-4xl mx-auto mb-3" />
                <p className="text-gray-400 text-sm">Your cart is empty</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {/* Cart Items - Now showing ALL items correctly */}
                <div className="space-y-3 mb-4 max-h-[300px] overflow-y-auto">
                  {cart.map((c) => {
                    const itemTotal = calculateItemTotal(c);
                    return (
                      <div
                        key={c.itemId}
                        className="p-3 bg-gray-50 rounded-xl border border-gray-100"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <span className="font-medium text-gray-700 text-sm flex-1">
                            {c.name}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeFromCart(c.itemId)}
                            className="text-red-400 hover:text-red-600 transition-colors ml-2"
                          >
                            <FaTrash className="text-xs" />
                          </button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(c.itemId, c.quantity - 1)
                              }
                              className="w-7 h-7 rounded-lg bg-gray-200 hover:bg-gray-300 transition-colors flex items-center justify-center"
                            >
                              <FaMinus className="text-xs text-gray-600" />
                            </button>
                            <input
                              type="number"
                              min="1"
                              max={c.maxQuantity}
                              value={c.quantity}
                              onChange={(e) =>
                                updateQuantity(
                                  c.itemId,
                                  parseInt(e.target.value) || 1
                                )
                              }
                              className="w-12 text-center py-1 rounded-lg border border-gray-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 outline-none text-sm"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(c.itemId, c.quantity + 1)
                              }
                              className="w-7 h-7 rounded-lg bg-gray-200 hover:bg-gray-300 transition-colors flex items-center justify-center"
                            >
                              <FaPlus className="text-xs text-gray-600" />
                            </button>
                          </div>
                          <span className="text-sm font-semibold text-gray-700">
                            {formatCurrency(itemTotal)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Total */}
                <div className="border-t border-gray-200 pt-3 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 font-medium">Total</span>
                    <span className="text-xl font-bold text-transparent bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text">
                      {formatCurrency(cartTotal)}
                    </span>
                  </div>
                </div>

                {/* Customer Details */}
                <div className="space-y-3">
                  <div className="relative">
                    <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                    <input
                      type="text"
                      placeholder="Full Name *"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 outline-none transition-all text-sm"
                    />
                  </div>
                  <div className="relative">
                    <FaPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                    <input
                      type="tel"
                      placeholder="Phone Number *"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 outline-none transition-all text-sm"
                    />
                  </div>
                  <div className="relative">
                    <FaStickyNote className="absolute left-3 top-3 text-gray-400 text-sm" />
                    <textarea
                      placeholder="Additional notes (optional)"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows="2"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 outline-none transition-all resize-none text-sm"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold py-3 px-6 rounded-xl hover:shadow-lg hover:shadow-emerald-200 transition-all duration-300 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit Request
                      <FaArrowRight className="text-sm" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Floating Cart Button */}
      {cart.length > 0 && !isCartOpen && (
        <button
          onClick={() => setIsCartOpen(true)}
          className="lg:hidden fixed bottom-6 right-6 z-30 bg-gradient-to-r from-emerald-500 to-teal-500 text-white p-4 rounded-full shadow-2xl shadow-emerald-200 hover:scale-110 transition-all duration-300 animate-bounce"
        >
          <div className="relative">
            <FaShoppingCart className="text-2xl" />
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
              {cart.length}
            </span>
          </div>
        </button>
      )}
    </div>
  );
};

export default ReuestOrder;