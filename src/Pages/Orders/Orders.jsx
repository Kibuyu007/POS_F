/**
 * ORDERS MANAGEMENT COMPONENT
 *
 * This component handles:
 * - Viewing and managing orders
 * - Viewing and managing customer requests
 * - Creating new orders with items
 * - Converting requests to orders
 * - Deleting orders
 * - Pagination for both orders and requests
 */

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  searchOrders,
  fetchOrders,
  createOrder,
  deleteOrder,
} from "../../Redux/orders";
import {
  Search,
  Plus,
  X,
  Trash2,
  CheckCircle,
  Clock,
  Package,
  XCircle,
  ClipboardList,
  ArrowRight,
  BarChart3,
  Activity,
  ShoppingCart,
  List,
  FileText,
  ChevronLeft,
  ChevronRight,
  User,
  Phone,
  StickyNote,
  Tag,
  Percent,
  Layers,
  AlertCircle,
  Banknote,
  ChevronDown,
} from "lucide-react";

import BASE_URL from "../../Utils/config";
import toast from "react-hot-toast";
import axios from "axios";

// ============================================================================
// MAIN COMPONENT
// ============================================================================
const Orders = () => {
  // ==========================================================================
  // REDUX HOOKS
  // ==========================================================================
  const dispatch = useDispatch();
  const { orders, loading } = useSelector((state) => state.orders);

  // ==========================================================================
  // STATE - REQUESTS
  // ==========================================================================
  const [requests, setRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(false);

  // ==========================================================================
  // STATE - FILTERS & VIEWS
  // ==========================================================================
  const [filter, setFilter] = useState("All"); // Order status filter
  const [searchTerm, setSearchTerm] = useState(""); // Order search
  const [activeView, setActiveView] = useState("orders"); // "orders" | "requests"
  const [requestsFilter, setRequestsFilter] = useState("pending"); // Request status filter
  const [requestsSearch, setRequestsSearch] = useState(""); // Request search

  // ==========================================================================
  // STATE - MODALS
  // ==========================================================================
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showRequestDetailModal, setShowRequestDetailModal] = useState(false);
  const [requestActionLoading, setRequestActionLoading] = useState(false);

  // ==========================================================================
  // STATE - FORM DATA (Create Order)
  // ==========================================================================
  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    items: [],
    notes: "",
  });
  const [newItem, setNewItem] = useState({
    itemId: "",
    quantity: 1,
    discount: 0,
    priceType: "Retail",
  });
  const [availableItems, setAvailableItems] = useState([]);

  // ==========================================================================
  // STATE - PHONE VALIDATION
  // ==========================================================================
  const [phoneError, setPhoneError] = useState("");
  const [isPhoneValid, setIsPhoneValid] = useState(false);

  // ==========================================================================
  // STATE - PAGINATION (ORDERS)
  // ==========================================================================
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  // ==========================================================================
  // STATE - PAGINATION (REQUESTS)
  // ==========================================================================
  const [currentRequestPage, setCurrentRequestPage] = useState(1);
  const [requestItemsPerPage] = useState(5);

  // ==========================================================================
  // FILTER FUNCTIONS
  // ==========================================================================

  /**
   * Get filtered requests based on status and search term
   */
  const getFilteredRequests = () => {
    let filtered = requests || [];

    // Filter by status
    if (requestsFilter === "pending") {
      filtered = filtered.filter((r) => r.status === "Pending");
    } else if (requestsFilter === "converted") {
      filtered = filtered.filter((r) => r.status === "Converted");
    } else if (requestsFilter === "rejected") {
      filtered = filtered.filter((r) => r.status === "Rejected");
    }

    // Filter by search term
    if (requestsSearch.trim()) {
      const term = requestsSearch.toLowerCase().trim();
      filtered = filtered.filter(
        (r) =>
          r.customerName?.toLowerCase().includes(term) ||
          r.customerPhone?.includes(term) ||
          r.requestNumber?.toLowerCase().includes(term),
      );
    }
    return filtered;
  };

  /**
   * Filter orders by status - SORTED by createdAt ascending (oldest first)
   * IMPORTANT: Create a copy of the array before sorting to avoid mutating Redux state
   */
  const filteredOrders = (
    filter === "All"
      ? [...orders] // Create a copy of the orders array
      : orders.filter((o) => o.status === filter)
  ).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  // ==========================================================================
  // PAGINATION CALCULATIONS - ORDERS
  // ==========================================================================
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  // ==========================================================================
  // PAGINATION CALCULATIONS - REQUESTS
  // ==========================================================================
  const filteredRequests = [...getFilteredRequests()] // Create a copy before sorting
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  const requestIndexOfLastItem = currentRequestPage * requestItemsPerPage;
  const requestIndexOfFirstItem = requestIndexOfLastItem - requestItemsPerPage;
  const currentRequests = filteredRequests.slice(
    requestIndexOfFirstItem,
    requestIndexOfLastItem,
  );
  const requestTotalPages = Math.ceil(
    filteredRequests.length / requestItemsPerPage,
  );

  // ==========================================================================
  // UTILITY FUNCTIONS
  // ==========================================================================

  /**
   * Validate phone number format
   * Accepts: 07XXXXXXXX or 255XXXXXXXXX
   */
  const validatePhoneNumber = (phone) => {
    const cleaned = phone.replace(/[\s\-()]/g, "");
    if (cleaned.startsWith("255")) {
      return cleaned.length === 12 && /^255\d{9}$/.test(cleaned);
    }
    if (cleaned.startsWith("0")) {
      return cleaned.length === 10 && /^0[67]\d{8}$/.test(cleaned);
    }
    return false;
  };

  /**
   * Format currency to TSh
   */
  const formatCurrency = (amount) => {
    return `TSh ${(amount || 0).toLocaleString()}`;
  };

  /**
   * Calculate total from items array
   */
  const calculateTotal = (items) => {
    return items.reduce((sum, item) => {
      const total =
        (item.unitPrice || 0) * (item.quantity || 0) - (item.discount || 0);
      return sum + Math.max(0, total);
    }, 0);
  };

  // ==========================================================================
  // EVENT HANDLERS - PHONE
  // ==========================================================================
  const handlePhoneChange = (e) => {
    const value = e.target.value;
    setFormData({ ...formData, customerPhone: value });

    if (value.length === 0) {
      setPhoneError("");
      setIsPhoneValid(false);
      return;
    }

    if (validatePhoneNumber(value)) {
      setPhoneError("");
      setIsPhoneValid(true);
    } else {
      setPhoneError("Invalid phone. Use 07XXXXXXXX or 255XXXXXXXXX");
      setIsPhoneValid(false);
    }
  };

  // ==========================================================================
  // EVENT HANDLERS - FORM RESET
  // ==========================================================================
  const resetForm = () => {
    setFormData({ customerName: "", customerPhone: "", items: [], notes: "" });
    setNewItem({ itemId: "", quantity: 1, discount: 0, priceType: "Retail" });
    setPhoneError("");
    setIsPhoneValid(false);
  };

  // ==========================================================================
  // EVENT HANDLERS - PAGINATION
  // ==========================================================================
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const requestPaginate = (pageNumber) => setCurrentRequestPage(pageNumber);

  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };
  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const requestNextPage = () => {
    if (currentRequestPage < requestTotalPages)
      setCurrentRequestPage(currentRequestPage + 1);
  };
  const requestPrevPage = () => {
    if (currentRequestPage > 1) setCurrentRequestPage(currentRequestPage - 1);
  };

  // ==========================================================================
  // EFFECTS
  // ==========================================================================

  /**
   * Fetch orders and items on component mount
   */
  useEffect(() => {
    dispatch(fetchOrders());
    fetchAllItems();
  }, [dispatch]);

  /**
   * Fetch requests when switching to requests view
   */
  useEffect(() => {
    if (activeView === "requests") fetchRequests();
  }, [activeView]);

  /**
   * Search orders with debounce
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm) {
        dispatch(searchOrders(searchTerm));
      } else {
        dispatch(fetchOrders());
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, dispatch]);

  // ==========================================================================
  // API CALLS
  // ==========================================================================

  /**
   * Fetch all available items
   */
  const fetchAllItems = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/items/getAllItems`);
      const data = await response.json();
      setAvailableItems(data.data || []);
    } catch (error) {
      console.error("Failed to fetch items:", error);
      toast.error("Failed to load items");
    }
  };

  /**
   * Fetch customer requests
   */
  const fetchRequests = async () => {
    setRequestsLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}/api/orders/requests`, {
        withCredentials: true,
      });
      if (response.data.success) {
        setRequests(response.data.data || []);
        setCurrentRequestPage(1);
      } else {
        toast.error(response.data.message || "Failed to fetch requests");
      }
    } catch (error) {
      console.error("Failed to fetch requests:", error);
      toast.error("Failed to load requests");
    } finally {
      setRequestsLoading(false);
    }
  };

  // ==========================================================================
  // REQUEST ACTION HANDLERS
  // ==========================================================================

  /**
   * Convert a request to an order
   */
  const handleConvertRequest = async (requestId) => {
    if (!window.confirm("Convert this request to an order?")) return;
    setRequestActionLoading(true);
    try {
      const response = await axios.post(
        `${BASE_URL}/api/orders/requests/${requestId}/convert`,
        {},
        { withCredentials: true },
      );

      if (response.data.success) {
        toast.success("✅ Request converted to order successfully!");
        await fetchRequests();
        await dispatch(fetchOrders());
        setShowRequestDetailModal(false);
      } else {
        toast.error(response.data.message || "Failed to convert request");
      }
    } catch (error) {
      console.error("Failed to convert request:", error);
      toast.error(error.response?.data?.message || "Failed to convert request");
    } finally {
      setRequestActionLoading(false);
    }
  };

  /**
   * Reject a customer request
   */
  const handleRejectRequest = async (requestId) => {
    if (!window.confirm("Reject this request?")) return;
    setRequestActionLoading(true);
    try {
      const response = await axios.put(
        `${BASE_URL}/api/orders/${requestId}/reject`,
        { reason: "Rejected by staff" },
        { withCredentials: true },
      );

      if (response.data.success) {
        toast.success("✅ Request rejected successfully");
        await fetchRequests();
        setShowRequestDetailModal(false);
      } else {
        toast.error(response.data.message || "Failed to reject request");
      }
    } catch (error) {
      console.error("Failed to reject request:", error);
      toast.error(error.response?.data?.message || "Failed to reject request");
    } finally {
      setRequestActionLoading(false);
    }
  };

  // ==========================================================================
  // ITEM MANAGEMENT (Create Order)
  // ==========================================================================

  /**
   * Validate item before adding to order
   */
  const validateItem = (itemId, quantity) => {
    const selectedItem = availableItems.find((item) => item._id === itemId);
    if (!selectedItem) return { valid: false, message: "Item not found" };
    if (selectedItem.status === "Expired") {
      return { valid: true, item: selectedItem, warning: "Item is expired" };
    }
    if (selectedItem.itemQuantity === 0) {
      return { valid: false, message: `${selectedItem.name} is out of stock` };
    }
    if (quantity > selectedItem.itemQuantity) {
      return {
        valid: false,
        message: `Only ${selectedItem.itemQuantity} ${selectedItem.name} available`,
      };
    }
    return { valid: true, item: selectedItem };
  };

  /**
   * Add item to order form
   */
  const handleAddItem = () => {
    if (!newItem.itemId || !newItem.quantity) {
      toast.error("Please select an item and enter quantity");
      return;
    }

    const validation = validateItem(newItem.itemId, newItem.quantity);
    if (!validation.valid) {
      toast.error(validation.message);
      return;
    }

    const selectedItem = validation.item;

    // Check for duplicate items
    const existingIndex = formData.items.findIndex(
      (i) => i.itemId === newItem.itemId && i.priceType === newItem.priceType,
    );
    if (existingIndex >= 0) {
      toast.error(
        `${selectedItem.name} (${newItem.priceType}) already in cart`,
      );
      return;
    }

    // Determine pricing type
    const isWholesale =
      newItem.priceType === "Wholesale" &&
      selectedItem.enableWholesale &&
      newItem.quantity >= (selectedItem.wholesaleMinQty || 0);

    const unitPrice = isWholesale
      ? selectedItem.wholesalePrice || selectedItem.price
      : selectedItem.retailPrice || selectedItem.price;

    const discount = Math.max(0, Number(newItem.discount || 0));

    // Add item to form
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          itemId: selectedItem._id,
          itemName: selectedItem.name,
          quantity: Number(newItem.quantity),
          unitPrice,
          discount,
          priceType: isWholesale ? "Wholesale" : "Retail",
          isExpired: selectedItem.status === "Expired",
          maxQuantity: selectedItem.itemQuantity,
        },
      ],
    }));

    setNewItem({ itemId: "", quantity: 1, discount: 0, priceType: "Retail" });

    if (validation.warning) {
      toast.success(`⚠️ ${selectedItem.name} added (expired)`);
    } else {
      toast.success(`✅ ${selectedItem.name} added successfully!`);
    }
  };

  /**
   * Remove item from order form
   */
  const handleRemoveItem = (index) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
    toast.success("Item removed from cart");
  };

  // ==========================================================================
  // ORDER CRUD OPERATIONS
  // ==========================================================================

  /**
   * Create new order
   */
  const handleCreateOrder = async (e) => {
    e.preventDefault();

    if (!validatePhoneNumber(formData.customerPhone)) {
      toast.error("Invalid phone number. Use 07XXXXXXXX or 255XXXXXXXXX");
      return;
    }

    if (formData.items.length === 0) {
      toast.error("Please add at least one item to the order");
      return;
    }

    try {
      const result = await dispatch(createOrder(formData));
      setShowCreateModal(false);
      resetForm();
      dispatch(fetchOrders());
      toast.success(
        `✅ Order created successfully! Order #${result.orderNumber || ""}`,
      );
    } catch (error) {
      console.error("Failed to create order:", error);
      toast.error(error.response?.data?.message || "Failed to create order");
    }
  };

  /**
   * Delete an order
   */
  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;
    try {
      await dispatch(deleteOrder(orderId));
      dispatch(fetchOrders());
      toast.success("✅ Order deleted successfully");
    } catch (error) {
      console.error("Failed to delete order:", error);
      toast.error(error.response?.data?.message || "Failed to delete order");
    }
  };

  // ==========================================================================
  // STYLE CONSTANTS
  // ==========================================================================

  const statusColors = {
    Pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
    Confirmed: "bg-blue-50 text-blue-700 border-blue-200",
    Completed: "bg-green-50 text-green-700 border-green-200",
    Cancelled: "bg-red-50 text-red-700 border-red-200",
  };

  const statusIcons = {
    Pending: Clock,
    Confirmed: CheckCircle,
    Completed: CheckCircle,
    Cancelled: XCircle,
  };

  const requestStatusColors = {
    Pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
    Converted: "bg-green-50 text-green-700 border-green-200",
    Rejected: "bg-red-50 text-red-700 border-red-200",
  };

  const statsData = [
    {
      label: "Total Orders",
      value: orders.length,
      icon: ShoppingCart,
      bg: "bg-green-50",
      iconColor: "text-green-600",
      border: "border-green-100",
    },
    {
      label: "Revenue",
      value: `TSh ${orders.reduce((sum, o) => sum + (o.grandTotal || 0), 0).toLocaleString()}`,
      icon: Banknote,
      bg: "bg-blue-50",
      iconColor: "text-blue-600",
      border: "border-blue-100",
    },
    {
      label: "Active Orders",
      value: orders.filter(
        (o) => o.status === "Pending" || o.status === "Confirmed",
      ).length,
      icon: Activity,
      bg: "bg-yellow-50",
      iconColor: "text-yellow-600",
      border: "border-yellow-100",
    },
    {
      label: "Completion Rate",
      value: `${orders.length > 0 ? Math.round((orders.filter((o) => o.status === "Completed").length / orders.length) * 100) : 0}%`,
      icon: BarChart3,
      bg: "bg-violet-50",
      iconColor: "text-violet-600",
      border: "border-violet-100",
    },
  ];

  const statusOptions = [
    "All",
    "Pending",
    "Confirmed",
    "Completed",
    "Cancelled",
  ];

  const requestStats = {
    pending: (requests || []).filter((r) => r.status === "Pending").length,
    converted: (requests || []).filter((r) => r.status === "Converted").length,
    rejected: (requests || []).filter((r) => r.status === "Rejected").length,
  };

  // ==========================================================================
  // RENDER HELPERS - PAGINATION
  // ==========================================================================

  /**
   * Render pagination component
   */
  const renderPagination = (
    currentPageNum,
    totalPagesNum,
    paginateFn,
    nextFn,
    prevFn,
  ) => {
    if (totalPagesNum === 0 || totalPagesNum === 1) return null;

    const pageNumbers = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(
      1,
      currentPageNum - Math.floor(maxVisiblePages / 2),
    );
    let endPage = Math.min(totalPagesNum, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="flex items-center gap-1.5 flex-wrap justify-center">
        {/* Previous Button */}
        <button
          onClick={prevFn}
          disabled={currentPageNum === 1}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            currentPageNum === 1
              ? "bg-gray-100 text-gray-300 cursor-not-allowed"
              : "bg-white border border-gray-300 text-gray-600 hover:bg-gray-100 hover:border-gray-400 shadow-sm"
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* First Page */}
        {startPage > 1 && (
          <>
            <button
              onClick={() => paginateFn(1)}
              className="px-3.5 py-2 rounded-lg text-sm font-medium bg-white border border-gray-300 text-gray-600 hover:bg-gray-100 hover:border-gray-400 transition-all duration-200 shadow-sm"
            >
              1
            </button>
            {startPage > 2 && (
              <span className="px-1 text-gray-400 text-sm">…</span>
            )}
          </>
        )}

        {/* Page Numbers */}
        {pageNumbers.map((number) => (
          <button
            key={number}
            onClick={() => paginateFn(number)}
            className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm ${
              currentPageNum === number
                ? "bg-green-300 text-green-800 border border-green-400 hover:bg-green-400"
                : "bg-white border border-gray-300 text-gray-600 hover:bg-gray-100 hover:border-gray-400"
            }`}
          >
            {number}
          </button>
        ))}

        {/* Last Page */}
        {endPage < totalPagesNum && (
          <>
            {endPage < totalPagesNum - 1 && (
              <span className="px-1 text-gray-400 text-sm">…</span>
            )}
            <button
              onClick={() => paginateFn(totalPagesNum)}
              className="px-3.5 py-2 rounded-lg text-sm font-medium bg-white border border-gray-300 text-gray-600 hover:bg-gray-100 hover:border-gray-400 transition-all duration-200 shadow-sm"
            >
              {totalPagesNum}
            </button>
          </>
        )}

        {/* Next Button */}
        <button
          onClick={nextFn}
          disabled={currentPageNum === totalPagesNum}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            currentPageNum === totalPagesNum
              ? "bg-gray-100 text-gray-300 cursor-not-allowed"
              : "bg-white border border-gray-300 text-gray-600 hover:bg-gray-100 hover:border-gray-400 shadow-sm"
          }`}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    );
  };

  // ==========================================================================
  // RENDER HELPERS - VIEW TABS
  // ==========================================================================

  /**
   * Render view toggle buttons (Orders / Requests)
   */
  const renderViewToggle = () => (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5">
      <div className="flex bg-white rounded-xl p-1 border border-gray-200 shadow-sm">
        <button
          onClick={() => setActiveView("orders")}
          className={`flex items-center gap-2 px-4 sm:px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
            activeView === "orders"
              ? "bg-green-300 text-green-800 shadow-md shadow-green-200"
              : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
          }`}
        >
          <List className="w-4 h-4" />
          Orders
          <span
            className={`text-xs px-2 py-0.5 rounded-full ${
              activeView === "orders"
                ? "bg-green-400 text-green-800"
                : "bg-gray-200 text-gray-500"
            }`}
          >
            {orders.length}
          </span>
        </button>
        <button
          onClick={() => {
            setActiveView("requests");
            fetchRequests();
          }}
          className={`flex items-center gap-2 px-4 sm:px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
            activeView === "requests"
              ? "bg-green-300 text-green-800 shadow-md shadow-green-200"
              : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          Requests
          {requestStats.pending > 0 && (
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                activeView === "requests"
                  ? "bg-green-400 text-green-800"
                  : "bg-red-200 text-red-600"
              }`}
            >
              {requestStats.pending}
            </span>
          )}
        </button>
      </div>

      {/* Search Input */}
      <div className="relative w-full sm:w-64">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          placeholder={
            activeView === "orders" ? "Search orders..." : "Search requests..."
          }
          className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-transparent transition-all duration-200 text-sm text-black placeholder-gray-400 shadow-sm"
          value={activeView === "orders" ? searchTerm : requestsSearch}
          onChange={(e) =>
            activeView === "orders"
              ? setSearchTerm(e.target.value)
              : setRequestsSearch(e.target.value)
          }
        />
      </div>
    </div>
  );

  // ==========================================================================
  // RENDER HELPERS - ORDERS SECTION
  // ==========================================================================

  /**
   * Render order status filter pills
   */
  const renderOrderFilters = () => (
    <div className="flex flex-wrap gap-2 mb-5">
      {statusOptions.map((s) => (
        <button
          key={s}
          onClick={() => setFilter(s)}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 border ${
            filter === s
              ? "bg-green-300 border-green-400 text-green-800 shadow-md shadow-green-200"
              : "bg-white border-gray-300 text-gray-500 hover:border-gray-400 hover:text-gray-700 hover:bg-gray-100"
          }`}
        >
          {s !== "All" && (
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                filter === s
                  ? "bg-green-600"
                  : s === "Pending"
                    ? "bg-yellow-400"
                    : s === "Confirmed"
                      ? "bg-blue-400"
                      : s === "Completed"
                        ? "bg-green-400"
                        : "bg-red-400"
              }`}
            />
          )}
          {s}
          {s !== "All" && (
            <span
              className={`text-xs ${filter === s ? "text-green-700" : "text-gray-400"}`}
            >
              {orders.filter((o) => o.status === s).length}
            </span>
          )}
        </button>
      ))}
    </div>
  );

  /**
   * Render a single order card
   */
  const renderOrderCard = (order) => {
    const StatusIcon = statusIcons[order.status] || Clock;
    return (
      <div
        key={order._id}
        className="bg-gray-200 rounded-2xl border border-gray-300 shadow-sm p-4 sm:p-5 hover:shadow-md hover:border-green-300 transition-all duration-300"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Left: Customer Info */}
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="w-11 h-11 rounded-full bg-green-300 flex items-center justify-center text-green-800 text-sm font-bold flex-shrink-0 shadow-sm">
              <User className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-semibold text-gray-800">
                  {order.customerName}
                </span>
                <span className="font-mono text-xs text-gray-600 bg-gray-300 px-2 py-0.5 rounded-md">
                  {order.orderNumber}
                </span>
                <span className="text-xs text-gray-600 bg-gray-300 px-2 py-0.5 rounded-full">
                  {order.items?.length || 0} items
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-600 mt-0.5">
                <span>{order.customerPhone}</span>
                <span className="w-1 h-1 bg-gray-400 rounded-full" />
                <span>{new Date(order.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Right: Actions & Status */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <div className="text-right mr-2">
              <div className="text-sm font-bold text-gray-800">
                {formatCurrency(order.grandTotal)}
              </div>
              {order.totalDiscount > 0 && (
                <span className="text-[10px] text-green-700 font-medium bg-green-200 px-2 py-0.5 rounded-full">
                  -{formatCurrency(order.totalDiscount)}
                </span>
              )}
            </div>

            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[order.status]}`}
            >
              <StatusIcon className="w-3 h-3" />
              {order.status}
            </span>

            <button
              onClick={() => {
                setSelectedOrder(order);
                setShowDetailModal(true);
              }}
              className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-lg transition-all duration-200"
              title="View Details"
            >
              <FileText className="w-4 h-4" />
            </button>

            {order.status !== "Completed" && (
              <button
                onClick={() => handleDeleteOrder(order._id)}
                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-100 rounded-lg transition-all duration-200"
                title="Delete Order"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  /**
   * Render the orders list
   */
  const renderOrdersList = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center py-20 bg-gray-200 rounded-2xl border border-gray-300 shadow-sm">
          <div className="w-12 h-12 border-4 border-green-300 border-t-green-500 rounded-full animate-spin" />
          <p className="text-sm text-gray-600 mt-4">Loading orders...</p>
        </div>
      );
    }

    if (currentOrders.length === 0) {
      return (
        <div className="bg-gray-200 rounded-2xl border border-gray-300 shadow-sm py-20 text-center">
          <div className="w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-10 h-10 text-gray-500" />
          </div>
          <p className="text-gray-700 font-medium">No orders found</p>
          <p className="text-sm text-gray-500 mt-1">
            Create your first order to get started
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-3">{currentOrders.map(renderOrderCard)}</div>
    );
  };

  // ==========================================================================
  // RENDER HELPERS - REQUESTS SECTION
  // ==========================================================================

  /**
   * Render request status filter pills
   */
  const renderRequestFilters = () => (
    <div className="flex flex-wrap gap-2 mb-5">
      {[
        { key: "pending", label: "Pending", color: "yellow" },
        { key: "converted", label: "Converted", color: "green" },
        { key: "rejected", label: "Rejected", color: "red" },
      ].map((tab) => {
        const isActive = requestsFilter === tab.key;
        const dotColor = {
          yellow: "bg-yellow-400",
          green: "bg-green-400",
          red: "bg-red-400",
        }[tab.color];
        const activeBg = {
          yellow: "bg-yellow-300 border-yellow-400 text-yellow-800",
          green: "bg-green-300 border-green-400 text-green-800",
          red: "bg-red-300 border-red-400 text-red-800",
        }[tab.color];

        return (
          <button
            key={tab.key}
            onClick={() => setRequestsFilter(tab.key)}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 border shadow-sm ${
              isActive
                ? activeBg
                : "bg-white border-gray-300 text-gray-500 hover:border-gray-400 hover:text-gray-700 hover:bg-gray-100"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-white" : dotColor}`}
            />
            {tab.label}
            <span
              className={`text-xs ${isActive ? "text-opacity-80" : "text-gray-400"}`}
            >
              {
                (requests || []).filter(
                  (r) => r.status.toLowerCase() === tab.key,
                ).length
              }
            </span>
          </button>
        );
      })}
    </div>
  );

  /**
   * Render a single request card
   */
  const renderRequestCard = (request) => {
    const StatusIcon =
      request.status === "Pending"
        ? Clock
        : request.status === "Converted"
          ? CheckCircle
          : XCircle;
    return (
      <div
        key={request._id}
        className="bg-gray-200 rounded-2xl border border-gray-300 shadow-sm p-4 sm:p-5 hover:shadow-md hover:border-green-300 transition-all duration-300"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Left: Customer Info */}
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="w-11 h-11 rounded-full bg-green-300 flex items-center justify-center text-green-800 text-sm font-bold flex-shrink-0 shadow-sm">
              <User className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-semibold text-gray-800">
                  {request.customerName}
                </span>
                <span className="font-mono text-xs text-gray-600 bg-gray-300 px-2 py-0.5 rounded-md">
                  {request.requestNumber}
                </span>
                <span className="text-xs text-gray-600 bg-gray-300 px-2 py-0.5 rounded-full">
                  {request.items?.length || 0} items
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-600 mt-0.5">
                <span>{request.customerPhone}</span>
                <span className="w-1 h-1 bg-gray-400 rounded-full" />
                <span>{new Date(request.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Right: Actions & Status */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${requestStatusColors[request.status]}`}
            >
              <StatusIcon className="w-3 h-3" />
              {request.status}
            </span>

            <button
              onClick={() => {
                setSelectedRequest(request);
                setShowRequestDetailModal(true);
              }}
              className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-lg transition-all duration-200"
              title="View Details"
            >
              <FileText className="w-4 h-4" />
            </button>

            {request.status === "Pending" && (
              <>
                <button
                  onClick={() => handleConvertRequest(request._id)}
                  disabled={requestActionLoading}
                  className="flex items-center gap-1 px-3 py-1.5 bg-green-300 text-green-800 text-xs font-semibold rounded-lg hover:bg-green-400 hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  Convert
                </button>
                <button
                  onClick={() => handleRejectRequest(request._id)}
                  disabled={requestActionLoading}
                  className="p-2 text-red-400 hover:text-red-600 hover:bg-red-100 rounded-lg transition-all duration-200 border border-red-200 disabled:opacity-50"
                  title="Reject Request"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  /**
   * Render the requests list
   */
  const renderRequestsList = () => {
    if (requestsLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-20 bg-gray-200 rounded-2xl border border-gray-300 shadow-sm">
          <div className="w-12 h-12 border-4 border-green-300 border-t-green-500 rounded-full animate-spin" />
          <p className="text-sm text-gray-600 mt-4">Loading requests...</p>
        </div>
      );
    }

    if (currentRequests.length === 0) {
      return (
        <div className="bg-gray-200 rounded-2xl border border-gray-300 shadow-sm py-20 text-center">
          <div className="w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
            <ClipboardList className="w-10 h-10 text-gray-500" />
          </div>
          <p className="text-gray-700 font-medium">No requests found</p>
          <p className="text-sm text-gray-500 mt-1">
            Customer requests will appear here
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-3">{currentRequests.map(renderRequestCard)}</div>
    );
  };

  // ==========================================================================
  // MODAL RENDERERS
  // ==========================================================================

  /**
   * Render Create Order Modal
   */
  const renderCreateOrderModal = () => {
    if (!showCreateModal) return null;

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl max-h-[90vh] overflow-y-auto">
          {/* Modal Header */}
          <div className="sticky top-0 z-10 bg-white px-6 sm:px-8 py-5 border-b border-gray-200 rounded-t-2xl">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-green-400 to-green-500 rounded-xl shadow-lg shadow-green-200">
                  <Plus className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">
                    Create New Order
                  </h2>
                  <p className="text-sm text-gray-500">
                    Fill in the details to create a new order
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  resetForm();
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <form onSubmit={handleCreateOrder} className="p-6 sm:p-8">
            {/* Two Column Layout: Customer Details + Order Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* LEFT: Customer Details */}
              <div className="space-y-4">
                <div className="bg-gray-100 rounded-xl p-4 border border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-500" />
                    Customer Details
                  </h4>

                  <div className="space-y-3">
                    {/* Name Input */}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">
                        Customer Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-transparent transition-all duration-200 text-black bg-white text-sm"
                        value={formData.customerName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            customerName: e.target.value,
                          })
                        }
                        placeholder="Enter customer name"
                      />
                    </div>

                    {/* Phone Input */}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="tel"
                          required
                          className={`w-full pl-9 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-transparent transition-all duration-200 text-black bg-white text-sm ${
                            formData.customerPhone && !isPhoneValid
                              ? "border-red-300 bg-red-50"
                              : formData.customerPhone && isPhoneValid
                                ? "border-green-300 bg-green-50"
                                : "border-gray-300"
                          }`}
                          value={formData.customerPhone}
                          onChange={handlePhoneChange}
                          placeholder="e.g. 0712345678"
                        />
                      </div>
                      {phoneError && (
                        <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {phoneError}
                        </p>
                      )}
                      {isPhoneValid && formData.customerPhone && (
                        <p className="text-xs text-green-600 mt-1.5 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Valid phone number
                        </p>
                      )}
                    </div>

                    {/* Notes Input */}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">
                        Notes
                      </label>
                      <div className="relative">
                        <StickyNote className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                        <textarea
                          className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-transparent transition-all duration-200 resize-none text-black bg-white text-sm"
                          rows="3"
                          value={formData.notes}
                          onChange={(e) =>
                            setFormData({ ...formData, notes: e.target.value })
                          }
                          placeholder="Add any additional notes..."
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT: Order Summary */}
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-xl p-4 border border-green-300">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-green-600" />
                    Order Summary
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between py-1.5 border-b border-green-300/50">
                      <span className="text-gray-600">Items:</span>
                      <span className="font-semibold text-gray-800">
                        {formData.items.length}
                      </span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-gray-600">Total Units:</span>
                      <span className="font-semibold text-gray-800">
                        {formData.items.reduce(
                          (sum, i) => sum + (i.quantity || 0),
                          0,
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t-2 border-green-400">
                      <span className="text-gray-700 font-semibold">
                        Grand Total:
                      </span>
                      <span className="text-xl font-bold text-green-700">
                        TSh {calculateTotal(formData.items).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-blue-100 rounded-lg p-3 border border-blue-200">
                    <p className="text-[10px] text-blue-600 font-medium uppercase tracking-wider">
                      Retail Items
                    </p>
                    <p className="text-lg font-bold text-blue-700">
                      {
                        formData.items.filter((i) => i.priceType === "Retail")
                          .length
                      }
                    </p>
                  </div>
                  <div className="bg-purple-100 rounded-lg p-3 border border-purple-200">
                    <p className="text-[10px] text-purple-600 font-medium uppercase tracking-wider">
                      Wholesale Items
                    </p>
                    <p className="text-lg font-bold text-purple-700">
                      {
                        formData.items.filter(
                          (i) => i.priceType === "Wholesale",
                        ).length
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Add Items Section */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-gray-500" />
                  Add Items <span className="text-red-500">*</span>
                </label>
                <span className="text-xs text-gray-500 bg-gray-200 px-3 py-1 rounded-full border border-gray-300">
                  {formData.items.length} items added
                </span>
              </div>

              <div className="bg-gray-100 rounded-xl p-4 border border-gray-200">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                  {/* Item Select */}
                  <div className="sm:col-span-4 relative">
                    <select
                      className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-transparent transition-all duration-200 text-black bg-white text-sm appearance-none pr-10 max-h-[200px] overflow-y-auto"
                      value={newItem.itemId}
                      onChange={(e) =>
                        setNewItem({ ...newItem, itemId: e.target.value })
                      }
                      style={{ maxHeight: "200px" }}
                    >
                      <option value="">Select an item</option>
                      {availableItems.map((item) => {
                        const hasWholesale =
                          item.enableWholesale && item.wholesalePrice > 0;
                        return (
                          <option
                            key={item._id}
                            value={item._id}
                            className="py-1"
                          >
                            {item.name} — TSh {item.price?.toLocaleString()}
                            {hasWholesale &&
                              ` (Wholesale: TSh ${item.wholesalePrice?.toLocaleString()})`}
                            {item.itemQuantity === 0 && " ⚠️ OOS"}
                          </option>
                        );
                      })}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                  </div>

                  {/* Price Type Select */}
                  <select
                    className="sm:col-span-2 px-3.5 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-transparent transition-all duration-200 text-black bg-white text-sm"
                    value={newItem.priceType}
                    onChange={(e) =>
                      setNewItem({ ...newItem, priceType: e.target.value })
                    }
                  >
                    <option value="Retail">Retail</option>
                    <option value="Wholesale">Wholesale</option>
                  </select>

                  {/* Quantity Input */}
                  <input
                    type="number"
                    min="1"
                    className="sm:col-span-2 px-3.5 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-transparent transition-all duration-200 text-black bg-white text-sm"
                    value={newItem.quantity}
                    onChange={(e) =>
                      setNewItem({
                        ...newItem,
                        quantity: parseInt(e.target.value) || 1,
                      })
                    }
                    placeholder="Qty"
                  />

                  {/* Discount Input */}
                  <div className="sm:col-span-2 relative">
                    <Percent className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="number"
                      min="0"
                      className="w-full pl-9 pr-3.5 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-transparent transition-all duration-200 text-black bg-white text-sm"
                      value={newItem.discount}
                      onChange={(e) =>
                        setNewItem({
                          ...newItem,
                          discount: parseFloat(e.target.value) || 0,
                        })
                      }
                      placeholder="Discount"
                    />
                  </div>

                  {/* Add Button */}
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="sm:col-span-2 px-4 py-2.5 bg-green-300 text-green-800 font-semibold rounded-lg hover:bg-green-400 transition-all duration-300 hover:shadow-lg hover:shadow-green-200 hover:scale-[1.02] active:scale-95 text-sm shadow-sm flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </button>
                </div>
                <p className="text-[10px] text-gray-500 mt-2 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Expired items can be added but will show a warning
                </p>
              </div>
            </div>

            {/* Items List */}
            {formData.items.length > 0 && (
              <div className="mt-4 bg-white rounded-xl p-4 border border-gray-200">
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {formData.items.map((item, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                        item.isExpired
                          ? "border-yellow-300 bg-yellow-100/50"
                          : "border-gray-200 hover:border-green-300 bg-gray-100/50"
                      }`}
                    >
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="font-medium text-gray-800 text-sm">
                          {item.itemName}
                        </span>
                        <span className="text-xs text-gray-600 bg-gray-200 px-2 py-0.5 rounded border border-gray-300">
                          ×{item.quantity}
                        </span>
                        <span className="text-xs text-gray-600 bg-gray-200 px-2 py-0.5 rounded border border-gray-300">
                          TSh {item.unitPrice?.toLocaleString()}
                        </span>
                        {item.priceType === "Wholesale" && (
                          <span className="text-[10px] bg-green-200 text-green-700 px-2 py-0.5 rounded-full font-semibold">
                            Wholesale
                          </span>
                        )}
                        {item.isExpired && (
                          <span className="text-[10px] bg-yellow-200 text-yellow-700 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            Expired
                          </span>
                        )}
                        {item.discount > 0 && (
                          <span className="text-[10px] bg-blue-200 text-blue-700 px-2 py-0.5 rounded-full font-semibold">
                            -TSh {item.discount.toLocaleString()}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-gray-800 text-sm">
                          TSh{" "}
                          {(
                            (item.unitPrice || 0) * (item.quantity || 0) -
                            (item.discount || 0)
                          ).toLocaleString()}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="text-red-400 hover:text-red-600 hover:bg-red-100 p-1.5 rounded-lg transition-all"
                          title="Remove item"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer Actions */}
            <div className="mt-6 pt-4 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <AlertCircle className="w-4 h-4 text-yellow-500" />
                <span>
                  Order will be created with{" "}
                  <span className="font-semibold text-yellow-600">Pending</span>{" "}
                  status
                </span>
              </div>
              <div className="flex space-x-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="flex-1 sm:flex-none px-6 py-2.5 border border-gray-300 text-gray-600 font-semibold rounded-lg hover:bg-gray-100 hover:border-gray-400 transition-all duration-200 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formData.items.length === 0 || !isPhoneValid}
                  className="flex-1 sm:flex-none px-6 py-2.5 bg-green-300 text-green-800 font-semibold rounded-lg hover:bg-green-400 transition-all duration-300 hover:shadow-lg hover:shadow-green-200 hover:scale-[1.02] active:scale-95 text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                >
                  <CheckCircle className="w-4 h-4" />
                  Create Order
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  };

  /**
   * Render Order Detail Modal
   */
  const renderOrderDetailModal = () => {
    if (!showDetailModal || !selectedOrder) return null;

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
          {/* Modal Header */}
          <div className="sticky top-0 z-10 bg-white px-6 sm:px-8 py-5 border-b border-gray-200 rounded-t-2xl">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl shadow-lg shadow-blue-200">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">
                    Order Details
                  </h2>
                  <p className="text-sm text-gray-500 font-mono">
                    {selectedOrder.orderNumber}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Customer Info Grid */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-100 rounded-xl border border-gray-200">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </p>
                <p className="font-semibold text-gray-800 mt-1">
                  {selectedOrder.customerName}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone
                </p>
                <p className="font-semibold text-gray-800 mt-1">
                  {selectedOrder.customerPhone}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </p>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border mt-1 ${statusColors[selectedOrder.status]}`}
                >
                  {selectedOrder.status}
                </span>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </p>
                <p className="font-semibold text-gray-800 mt-1">
                  {new Date(selectedOrder.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Items List */}
            <div>
              <h4 className="font-semibold text-gray-700 text-sm mb-3 flex items-center gap-2">
                <Package className="w-4 h-4 text-gray-500" />
                Items
              </h4>
              <div className="space-y-2">
                {selectedOrder.items?.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-3 bg-gray-100 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-gray-800 text-sm">
                        {item.itemName}
                      </span>
                      <span className="text-sm text-gray-500">
                        ×{item.quantity}
                      </span>
                      {item.priceType === "Wholesale" && (
                        <span className="text-[10px] bg-green-200 text-green-700 px-2 py-0.5 rounded-full font-semibold">
                          Wholesale
                        </span>
                      )}
                    </div>
                    <span className="font-semibold text-gray-800 text-sm">
                      {formatCurrency(item.totalPrice)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="border-t border-gray-200 pt-4">
              <div className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-medium text-gray-800">
                    {formatCurrency(selectedOrder.totalAmount)}
                  </span>
                </div>
                {selectedOrder.totalDiscount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Discount</span>
                    <span className="font-medium text-green-700">
                      -{formatCurrency(selectedOrder.totalDiscount)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-base font-bold pt-2 border-t border-gray-200">
                  <span className="text-gray-800">Total</span>
                  <span className="text-green-700">
                    {formatCurrency(selectedOrder.grandTotal)}
                  </span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {selectedOrder.notes && (
              <div className="p-3 bg-yellow-100 rounded-lg border border-yellow-200">
                <p className="text-sm text-yellow-800 flex items-start gap-2">
                  <StickyNote className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                  {selectedOrder.notes}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  /**
   * Render Request Detail Modal
   */
  const renderRequestDetailModal = () => {
    if (!showRequestDetailModal || !selectedRequest) return null;

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
          {/* Modal Header */}
          <div className="sticky top-0 z-10 bg-white px-6 sm:px-8 py-5 border-b border-gray-200 rounded-t-2xl">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-xl shadow-lg shadow-yellow-200">
                  <ClipboardList className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">
                    Request Details
                  </h2>
                  <p className="text-sm text-gray-500 font-mono">
                    {selectedRequest.requestNumber}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowRequestDetailModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Customer Info Grid */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-100 rounded-xl border border-gray-200">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </p>
                <p className="font-semibold text-gray-800 mt-1">
                  {selectedRequest.customerName}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone
                </p>
                <p className="font-semibold text-gray-800 mt-1">
                  {selectedRequest.customerPhone}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </p>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border mt-1 ${requestStatusColors[selectedRequest.status]}`}
                >
                  {selectedRequest.status}
                </span>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </p>
                <p className="font-semibold text-gray-800 mt-1">
                  {new Date(selectedRequest.createdAt).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Items List */}
            <div>
              <h4 className="font-semibold text-gray-700 text-sm mb-3 flex items-center gap-2">
                <Package className="w-4 h-4 text-gray-500" />
                Items ({selectedRequest.items?.length || 0})
              </h4>
              <div className="space-y-2">
                {selectedRequest.items?.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-3 bg-gray-100 rounded-lg border border-gray-200"
                  >
                    <div>
                      <span className="font-medium text-gray-800 text-sm">
                        {item.itemName}
                      </span>
                      <span className="text-sm text-gray-500 ml-2">
                        ×{item.quantity}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Notes */}
            {selectedRequest.notes && (
              <div className="p-3 bg-yellow-100 rounded-lg border border-yellow-200">
                <p className="text-sm text-yellow-800 flex items-start gap-2">
                  <StickyNote className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                  {selectedRequest.notes}
                </p>
              </div>
            )}

            {/* Rejection Reason */}
            {selectedRequest.status === "Rejected" &&
              selectedRequest.rejectionReason && (
                <div className="p-3 bg-red-100 rounded-lg border border-red-200">
                  <p className="text-sm text-red-700 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                    <span className="font-semibold">Rejection Reason:</span>
                    {selectedRequest.rejectionReason}
                  </p>
                </div>
              )}

            {/* Action Buttons for Pending Requests */}
            {selectedRequest.status === "Pending" && (
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleConvertRequest(selectedRequest._id)}
                  disabled={requestActionLoading}
                  className="flex-1 bg-green-300 text-green-800 font-semibold py-2.5 px-5 rounded-lg hover:bg-green-400 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                >
                  {requestActionLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-800" />
                  ) : (
                    <>
                      <ArrowRight className="w-4 h-4" /> Convert to Order
                    </>
                  )}
                </button>
                <button
                  onClick={() => handleRejectRequest(selectedRequest._id)}
                  disabled={requestActionLoading}
                  className="flex-1 bg-white border border-gray-300 text-gray-600 font-semibold py-2.5 px-5 rounded-lg hover:bg-gray-100 hover:border-gray-400 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                >
                  <XCircle className="w-4 h-4" /> Reject
                </button>
              </div>
            )}

            {/* Conversion Confirmation */}
            {selectedRequest.status === "Converted" &&
              selectedRequest.order && (
                <div className="p-3 bg-green-100 rounded-lg border border-green-200">
                  <p className="text-sm text-green-700 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Converted to Order: {selectedRequest.order.orderNumber}
                  </p>
                </div>
              )}
          </div>
        </div>
      </div>
    );
  };

  // ==========================================================================
  // MAIN RENDER
  // ==========================================================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-500 rounded-xl flex items-center justify-center shadow-lg shadow-green-200">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800 tracking-tight">
                Orders
              </h1>
              <p className="text-sm text-gray-500">
                Manage orders & customer requests
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-green-300 text-green-800 rounded-xl hover:bg-green-400 transition-all duration-300 hover:shadow-lg hover:shadow-green-200 hover:scale-[1.02] active:scale-95 text-sm font-semibold shadow-md"
          >
            <Plus className="w-4 h-4" />
            New Order
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          {statsData.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className={`bg-white p-4 sm:p-5 rounded-xl border ${stat.border} shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02]`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {stat.label}
                    </p>
                    <p className="text-lg sm:text-xl font-bold text-gray-800 mt-1">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`${stat.bg} p-2.5 rounded-lg`}>
                    <Icon className={`w-5 h-5 ${stat.iconColor}`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* View Toggle */}
        {renderViewToggle()}

        {/* Content Area - Orders or Requests */}
        {activeView === "orders" ? (
          <>
            {renderOrderFilters()}
            {renderOrdersList()}

            {/* Orders Pagination */}
            {filteredOrders.length > 0 && (
              <div className="mt-4 bg-white px-4 sm:px-5 py-3 sm:py-4 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-3">
                <span className="text-xs text-gray-500">
                  Showing{" "}
                  <span className="font-semibold text-gray-700">
                    {indexOfFirstItem + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-semibold text-gray-700">
                    {Math.min(indexOfLastItem, filteredOrders.length)}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-gray-700">
                    {filteredOrders.length}
                  </span>{" "}
                  orders
                </span>
                {renderPagination(
                  currentPage,
                  totalPages,
                  paginate,
                  nextPage,
                  prevPage,
                )}
              </div>
            )}
          </>
        ) : (
          <>
            {renderRequestFilters()}
            {renderRequestsList()}

            {/* Requests Pagination */}
            {filteredRequests.length > 0 && (
              <div className="mt-4 bg-white px-4 sm:px-5 py-3 sm:py-4 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-3">
                <span className="text-xs text-gray-500">
                  Showing{" "}
                  <span className="font-semibold text-gray-700">
                    {requestIndexOfFirstItem + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-semibold text-gray-700">
                    {Math.min(requestIndexOfLastItem, filteredRequests.length)}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-gray-700">
                    {filteredRequests.length}
                  </span>{" "}
                  requests
                </span>
                {renderPagination(
                  currentRequestPage,
                  requestTotalPages,
                  requestPaginate,
                  requestNextPage,
                  requestPrevPage,
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      {renderCreateOrderModal()}
      {renderOrderDetailModal()}
      {renderRequestDetailModal()}
    </div>
  );
};

export default Orders;
