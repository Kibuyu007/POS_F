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
  FaChevronDown,
  FaChevronUp,
  FaArrowLeft,
  FaShoppingBag,
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
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState("items");
  const [showOrderPage, setShowOrderPage] = useState(false); // Welcome page state

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
        item.name.toLowerCase().includes(searchTerm.toLowerCase().trim()),
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
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((c) => c.itemId === item._id);

      if (existingIndex !== -1) {
        const updatedCart = [...prevCart];
        updatedCart[existingIndex] = {
          ...updatedCart[existingIndex],
          quantity: updatedCart[existingIndex].quantity + 1,
        };
        return updatedCart;
      } else {
        return [
          ...prevCart,
          {
            itemId: item._id,
            name: item.name,
            quantity: 1,
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
      return prevCart.map((c) =>
        c.itemId === itemId ? { ...c, quantity: qty } : c,
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
        `${BASE_URL}/api/orders/public/requests/${checkNumber.trim()}`,
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
    setShowOrderPage(false);
  };

  const goBackToWelcome = () => {
    setShowOrderPage(false);
    setCart([]);
    setCustomerName("");
    setCustomerPhone("");
    setNotes("");
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
    0,
  );

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

  // Welcome Page
  if (!showOrderPage && !submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center px-4">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-200 rounded-full opacity-10 blur-3xl -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-200 rounded-full opacity-10 blur-3xl -ml-20 -mb-20"></div>

        <div className="max-w-2xl w-full relative">
          {/* Main Card */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-12 text-center border border-white/50 transform transition-all duration-500 hover:scale-[1.01]">
            {/* Logo/Brand Icon */}
            <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-200">
              <FaStore className="text-white text-4xl" />
            </div>

            {/* Brand Name */}
            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-800 mb-2">
              UZA
              <span className="text-transparent bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text">
                ONLINE SHOP
              </span>
            </h1>

            <div className="h-1 w-20 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full mx-auto mb-4"></div>

            <p className="text-gray-600 text-lg mb-2">
              Welcome to your trusted online store
            </p>
            <p className="text-gray-400 text-sm mb-8">
              Quality products, delivered with care
            </p>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={() => {
                  setShowOrderPage(true);
                  fetchItems();
                }}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold py-4 px-6 rounded-xl hover:shadow-xl hover:shadow-emerald-200 transition-all duration-300 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 text-lg"
              >
                <FaShoppingBag className="text-xl" />
                Start Your Order Request
                <FaArrowRight className="text-sm" />
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-2 bg-white text-gray-400">or</span>
                </div>
              </div>

              {/* Status Checker on Welcome Page */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <div className="flex items-center gap-2 text-gray-600 w-full sm:w-auto">
                    <FaSearch className="text-gray-400" />
                    <span className="text-sm font-medium whitespace-nowrap">
                      Track Request
                    </span>
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
                      className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium rounded-lg hover:shadow-lg hover:shadow-emerald-200 transition-all duration-300 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-sm whitespace-nowrap"
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
                  <div className="mt-2 text-red-600 text-sm text-left">
                    {statusError}
                  </div>
                )}
                {requestStatus && (
                  <div className="mt-3 p-3 bg-white rounded-lg border border-gray-200 grid grid-cols-2 gap-2 text-left">
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
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <p className="text-xs text-gray-400 mt-6">
              © 2026 UZA ONLINE SHOP. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    );
  }

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

  // Main Order Page
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Toast Notification */}
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={hideToast} />
      )}

      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Back Button */}
              <button
                onClick={goBackToWelcome}
                className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
                title="Go back to welcome page"
              >
                <FaArrowLeft className="text-sm sm:text-base" />
              </button>

              <div className="p-1.5 sm:p-2 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg sm:rounded-xl shadow-lg shadow-emerald-200">
                <FaStore className="text-white text-sm sm:text-xl" />
              </div>
              <div>
                <h1 className="text-base sm:text-xl font-bold text-gray-800">
                  Order Request
                </h1>
                <p className="text-[10px] sm:text-xs text-gray-500 hidden sm:block">
                  Submit your request for review
                </p>
              </div>
            </div>

            {/* Mobile Cart Toggle */}
            <button
              onClick={() => setIsCartOpen(!isCartOpen)}
              className="lg:hidden relative bg-emerald-50 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-emerald-200 flex items-center gap-1.5 sm:gap-2"
            >
              <FaShoppingCart className="text-emerald-600 text-sm sm:text-base" />
              <span className="font-semibold text-emerald-700 text-sm sm:text-base">
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

      {/* Main Content */}
      <div className="max-w-8xl mx-auto px-3 sm:px-6 py-4 sm:py-6 lg:py-8">
        {/* Mobile/Tablet: Tab Navigation */}
        <div className="lg:hidden mb-4 sm:mb-6">
          <div className="bg-white rounded-2xl shadow-md p-1 flex gap-1">
            <button
              onClick={() => setActiveTab("items")}
              className={`flex-1 py-2.5 sm:py-3 px-4 rounded-xl font-medium text-sm sm:text-base transition-all duration-300 ${
                activeTab === "items"
                  ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-200"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <FaBoxOpen className="text-sm sm:text-base" />
                Items
                <span className="text-xs opacity-75">
                  ({filteredItems.length})
                </span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab("cart")}
              className={`flex-1 py-2.5 sm:py-3 px-4 rounded-xl font-medium text-sm sm:text-base transition-all duration-300 ${
                activeTab === "cart"
                  ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-200"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <FaShoppingCart className="text-sm sm:text-base" />
                Cart
                <span className="text-xs opacity-75">({cart.length})</span>
              </div>
            </button>
          </div>
        </div>

        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          {/* Left Column - Items */}
          <div
            className={`lg:col-span-2 ${activeTab === "cart" ? "hidden lg:block" : "block"}`}
          >
            {/* Status Checker */}
            <div className="bg-white rounded-2xl shadow-md p-3 sm:p-4 mb-4 sm:mb-6 border border-gray-100">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 text-gray-600">
                  <FaSearch className="text-gray-400 text-sm sm:text-base" />
                  <span className="text-sm font-medium">Track Request</span>
                </div>

                {/* Mobile: Collapsible Status Checker */}
                <div className="sm:hidden">
                  <button
                    onClick={() => setIsSearchExpanded(!isSearchExpanded)}
                    className="w-full flex items-center justify-between px-4 py-2 bg-gray-50 rounded-xl"
                  >
                    <span className="text-sm text-gray-600">
                      {isSearchExpanded
                        ? "Hide status checker"
                        : "Check request status"}
                    </span>
                    {isSearchExpanded ? (
                      <FaChevronUp className="text-gray-400" />
                    ) : (
                      <FaChevronDown className="text-gray-400" />
                    )}
                  </button>
                  {isSearchExpanded && (
                    <div className="mt-3 space-y-2">
                      <input
                        type="text"
                        placeholder="Enter request number"
                        value={checkNumber}
                        onChange={(e) => setCheckNumber(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && checkStatus()}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 outline-none transition-all text-sm"
                      />
                      <button
                        onClick={checkStatus}
                        disabled={statusLoading}
                        className="w-full px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-emerald-200 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                      >
                        {statusLoading ? (
                          <FaSpinner className="animate-spin mx-auto" />
                        ) : (
                          "Check Status"
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {/* Tablet/Desktop: Full Status Checker */}
                <div className="hidden sm:flex flex-1 w-full flex-col sm:flex-row gap-2">
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
                <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200 grid grid-cols-2 gap-2">
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

            {/* Items Section */}
            <div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-2 sm:gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                    Available Items
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-500">
                    Search and select items to add to your request
                  </p>
                </div>
                <span className="text-xs sm:text-sm text-gray-400">
                  {filteredItems.length} items
                </span>
              </div>

              {/* Search Bar */}
              <div className="mb-4 sm:mb-6">
                <div className="relative">
                  <FaSearch className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm sm:text-base" />
                  <input
                    type="text"
                    placeholder="Search items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 sm:pl-12 pr-9 sm:pr-12 py-2.5 sm:py-3 rounded-xl border border-gray-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 outline-none transition-all bg-white text-sm sm:text-base"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <FaTimes className="text-sm sm:text-base" />
                    </button>
                  )}
                </div>
                {searchTerm && filteredItems.length === 0 && (
                  <p className="mt-2 text-sm text-gray-500">
                    No items found matching
                  </p>
                )}
              </div>

              {/* Items Grid - No Out of Stock indicators */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
                {filteredItems.map((item) => (
                  <div
                    key={item._id}
                    className="group bg-gradient-to-br from-emerald-50 via-teal-100 to-gray-100 rounded-xl sm:rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-300 hover:border-emerald-200 overflow-hidden"
                  >
                    <div className="p-3 sm:p-5">
                      <div className="flex items-start justify-between mb-2 sm:mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base sm:text-lg font-semibold text-gray-800 group-hover:text-emerald-600 transition-colors truncate">
                            {item.name}
                          </h3>
                        </div>
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                          <FaBoxOpen className="text-emerald-500 text-base sm:text-lg" />
                        </div>
                      </div>

                      <div className="mb-3 sm:mb-4">
                        <p className="text-xl sm:text-2xl font-bold text-gray-900">
                          {formatCurrency(item.price)}
                        </p>
                        {item.enableWholesale && item.wholesalePrice > 0 && (
                          <div className="mt-1 flex items-center gap-1 sm:gap-2 flex-wrap">
                            <span className="text-[10px] sm:text-xs bg-emerald-100 text-emerald-700 px-1.5 sm:px-2 py-0.5 rounded-full font-medium">
                              Wholesale
                            </span>
                            <span className="text-xs sm:text-sm text-gray-500">
                              {formatCurrency(item.wholesalePrice)} (min{" "}
                              {item.wholesaleMinQty})
                            </span>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => addToCart(item)}
                        className="w-full font-semibold py-2 sm:py-2.5 px-3 sm:px-4 rounded-lg sm:rounded-xl transition-all duration-300 flex items-center justify-center gap-1.5 sm:gap-2 text-sm sm:text-base bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:shadow-lg hover:shadow-emerald-200 hover:scale-[1.02] active:scale-95"
                      >
                        <FaPlus className="text-xs sm:text-sm" />
                        Add to Request
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Empty States */}
              {cart.length === 0 &&
                items.length > 0 &&
                filteredItems.length === 0 &&
                searchTerm && (
                  <div className="text-center py-12 sm:py-16">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                      <FaSearch className="text-gray-400 text-3xl sm:text-4xl" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-600 mb-2">
                      No items found
                    </h3>
                    <p className="text-sm sm:text-base text-gray-400">
                      Try adjusting your search term
                    </p>
                    <button
                      onClick={() => setSearchTerm("")}
                      className="mt-3 sm:mt-4 text-emerald-600 font-medium hover:text-emerald-700 transition-colors text-sm sm:text-base"
                    >
                      Clear search
                    </button>
                  </div>
                )}

              {cart.length === 0 &&
                items.length > 0 &&
                filteredItems.length > 0 &&
                !searchTerm && (
                  <div className="text-center py-12 sm:py-16">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                      <FaBoxOpen className="text-gray-400 text-3xl sm:text-4xl" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-600 mb-2">
                      Your request is empty
                    </h3>
                    <p className="text-sm sm:text-base text-gray-400">
                      Browse items above and add them to your request
                    </p>
                  </div>
                )}
            </div>
          </div>

          {/* Right Column - Cart - Desktop */}
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
                    <div className="space-y-3 mb-4 max-h-[400px] overflow-y-auto pr-2">
                      {cart.map((c) => {
                        const itemTotal = calculateItemTotal(c);
                        return (
                          <div
                            key={c.itemId}
                            className="p-3 bg-gray-200 rounded-xl border border-gray-100"
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
                                  value={c.quantity}
                                  onChange={(e) =>
                                    updateQuantity(
                                      c.itemId,
                                      parseInt(e.target.value) || 1,
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

                    <div className="border-t border-gray-200 pt-3 mb-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 font-medium">Total</span>
                        <span className="text-xl font-bold text-transparent bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text">
                          {formatCurrency(cartTotal)}
                        </span>
                      </div>
                    </div>

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

      {/* Mobile/Tablet Cart Bottom Sheet */}
      <div
        className={`lg:hidden fixed inset-0 z-50 transition-all duration-400 ${
          isCartOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Overlay */}
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={() => setIsCartOpen(false)}
        ></div>

        {/* Bottom Sheet */}
        <div
          className={`absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl transition-transform duration-400 ease-out ${
            isCartOpen ? "translate-y-0" : "translate-y-full"
          }`}
          style={{ maxHeight: "92vh" }}
        >
          {/* Handle Bar */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-12 h-1.5 bg-gray-300 rounded-full"></div>
          </div>

          <div
            className="px-4 sm:px-6 pb-6 overflow-y-auto"
            style={{ maxHeight: "calc(92vh - 20px)" }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-xl shadow-lg shadow-emerald-200">
                  <FaShoppingCart className="text-white text-lg sm:text-xl" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-800">
                    Your Request
                  </h2>
                  <p className="text-xs text-gray-500">
                    {cart.length} item{cart.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FaTimes className="text-gray-500 text-lg" />
              </button>
            </div>

            {cart.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaShoppingCart className="text-gray-300 text-3xl" />
                </div>
                <p className="text-gray-400 font-medium">Your cart is empty</p>
                <p className="text-gray-400 text-sm mt-1">
                  Add items from the list below
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="mt-4 text-emerald-600 font-medium hover:text-emerald-700 transition-colors"
                >
                  Browse items
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="space-y-3 mb-4 max-h-[40vh] overflow-y-auto pr-1">
                  {cart.map((c) => {
                    const itemTotal = calculateItemTotal(c);
                    return (
                      <div
                        key={c.itemId}
                        className="p-3 bg-gray-50 rounded-xl border border-gray-100 hover:border-emerald-200 transition-colors"
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
                            <FaTrash className="text-sm" />
                          </button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(c.itemId, c.quantity - 1)
                              }
                              className="w-8 h-8 rounded-lg bg-white border border-gray-200 hover:bg-gray-100 hover:border-emerald-300 transition-all flex items-center justify-center"
                            >
                              <FaMinus className="text-xs text-gray-600" />
                            </button>
                            <span className="w-8 text-center font-semibold text-gray-700 text-sm">
                              {c.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(c.itemId, c.quantity + 1)
                              }
                              className="w-8 h-8 rounded-lg bg-white border border-gray-200 hover:bg-gray-100 hover:border-emerald-300 transition-all flex items-center justify-center"
                            >
                              <FaPlus className="text-xs text-gray-600" />
                            </button>
                          </div>
                          <span className="text-sm font-bold text-gray-800">
                            {formatCurrency(itemTotal)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-4 mb-4 border border-emerald-100">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 font-medium">Total</span>
                    <span className="text-xl font-bold text-transparent bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text">
                      {formatCurrency(cartTotal)}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="relative">
                    <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                    <input
                      type="text"
                      placeholder="Full Name *"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 outline-none transition-all text-sm"
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
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 outline-none transition-all text-sm"
                    />
                  </div>
                  <div className="relative">
                    <FaStickyNote className="absolute left-3 top-3 text-gray-400 text-sm" />
                    <textarea
                      placeholder="Additional notes (optional)"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows="2"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 outline-none transition-all resize-none text-sm"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold py-3.5 px-6 rounded-xl hover:shadow-lg hover:shadow-emerald-200 transition-all duration-300 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base"
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
          className="lg:hidden fixed bottom-6 right-6 z-40 bg-gradient-to-r from-emerald-500 to-teal-500 text-white p-4 rounded-full shadow-2xl shadow-emerald-200 hover:scale-110 transition-all duration-300 animate-bounce"
        >
          <div className="relative">
            <FaShoppingCart className="text-2xl" />
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow-lg shadow-red-200">
              {cart.length}
            </span>
          </div>
        </button>
      )}
    </div>
  );
};

export default ReuestOrder;
