/**
 * ORDERS MANAGEMENT COMPONENT
 *
 * This component handles:
 * - Viewing and managing orders
 * - Viewing and managing customer requests
 * - Creating new orders with items
 * - Converting requests to orders
 * - Reviewing requests (accept/reject items, change delivery date)
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
  Calendar,
  Globe,
  Info,
  Edit,
  Save,
  RefreshCw,
  History,
  Check,
  X as XIcon,
  Hourglass,
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
  // STATE - REVIEW MODAL
  // ==========================================================================
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [requestToReview, setRequestToReview] = useState(null);
  const [reviewItems, setReviewItems] = useState([]);
  const [reviewData, setReviewData] = useState({
    approvedDeliveryDate: "",
    deliveryDateChangeReason: "",
    reviewNotes: "",
  });
  const [reviewLoading, setReviewLoading] = useState(false);

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
  // STATE - PAGINATION (ORDERS) - SEPARATE
  // ==========================================================================
  const [ordersCurrentPage, setOrdersCurrentPage] = useState(1);
  const [ordersItemsPerPage] = useState(5);

  // ==========================================================================
  // STATE - PAGINATION (REQUESTS) - SEPARATE
  // ==========================================================================
  const [requestsCurrentPage, setRequestsCurrentPage] = useState(1);
  const [requestsItemsPerPage] = useState(5);

  // ==========================================================================
  // STATE - REQUEST DETAIL EXPANDED SECTIONS
  // ==========================================================================
  const [expandedSections, setExpandedSections] = useState({
    items: true,
    review: false,
    delivery: false,
    amendment: false,
  });

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
      filtered = filtered.filter(
        (r) =>
          r.status === "Pending Review" ||
          r.status === "Awaiting Customer Confirmation",
      );
    } else if (requestsFilter === "accepted") {
      filtered = filtered.filter((r) => r.status === "Accepted");
    } else if (requestsFilter === "converted") {
      filtered = filtered.filter((r) => r.status === "Converted");
    } else if (requestsFilter === "rejected") {
      filtered = filtered.filter((r) => r.status === "Rejected");
    } else if (requestsFilter === "cancelled") {
      filtered = filtered.filter((r) => r.status === "Cancelled");
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
   */
  const filteredOrders = (
    filter === "All" ? [...orders] : orders.filter((o) => o.status === filter)
  ).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  // ==========================================================================
  // PAGINATION CALCULATIONS - ORDERS (SEPARATE)
  // ==========================================================================
  const ordersIndexOfLastItem = ordersCurrentPage * ordersItemsPerPage;
  const ordersIndexOfFirstItem = ordersIndexOfLastItem - ordersItemsPerPage;
  const currentOrders = filteredOrders.slice(
    ordersIndexOfFirstItem,
    ordersIndexOfLastItem,
  );
  const ordersTotalPages = Math.ceil(filteredOrders.length / ordersItemsPerPage);

  // ==========================================================================
  // PAGINATION CALCULATIONS - REQUESTS (SEPARATE)
  // ==========================================================================
  const filteredRequests = [...getFilteredRequests()].sort(
    (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
  );
  const requestsIndexOfLastItem = requestsCurrentPage * requestsItemsPerPage;
  const requestsIndexOfFirstItem = requestsIndexOfLastItem - requestsItemsPerPage;
  const currentRequests = filteredRequests.slice(
    requestsIndexOfFirstItem,
    requestsIndexOfLastItem,
  );
  const requestsTotalPages = Math.ceil(
    filteredRequests.length / requestsItemsPerPage,
  );

  // ==========================================================================
  // UTILITY FUNCTIONS
  // ==========================================================================

  /**
   * Validate phone number format
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

  /**
   * Format date for display
   */
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  /**
   * Format date for input (YYYY-MM-DD)
   */
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  };

  /**
   * Format date and time for display
   */
  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  /**
   * Get request status display name
   */
  const getStatusDisplayName = (status) => {
    const nameMap = {
      "Pending Review": "Pending Review",
      "Awaiting Customer Confirmation": "Awaiting Confirmation",
      Accepted: "Accepted",
      Converted: "Converted",
      Rejected: "Rejected",
      Cancelled: "Cancelled",
    };
    return nameMap[status] || status;
  };

  /**
   * Get item status badge
   */
  const getItemStatusBadge = (status) => {
    const statusMap = {
      Pending: "bg-amber-100 text-amber-700",
      Accepted: "bg-emerald-100 text-emerald-700",
      Rejected: "bg-red-100 text-red-700",
    };
    return statusMap[status] || "bg-gray-100 text-gray-700";
  };

  /**
   * Get request source badge
   */
  const getSourceBadge = (source) => {
    const sourceMap = {
      Website: "bg-blue-100 text-blue-700",
      Phone: "bg-purple-100 text-purple-700",
      "Walk-in": "bg-orange-100 text-orange-700",
      WhatsApp: "bg-green-100 text-green-700",
      Manual: "bg-gray-100 text-gray-700",
    };
    return sourceMap[source] || "bg-gray-100 text-gray-700";
  };

  /**
   * Get request status badge
   */
  const getRequestStatusBadge = (status) => {
    const statusMap = {
      "Pending Review": "bg-amber-100 text-amber-700 border-amber-200",
      "Awaiting Customer Confirmation":
        "bg-blue-100 text-blue-700 border-blue-200",
      Accepted: "bg-emerald-100 text-emerald-700 border-emerald-200",
      Converted: "bg-purple-100 text-purple-700 border-purple-200",
      Rejected: "bg-red-100 text-red-700 border-red-200",
      Cancelled: "bg-gray-100 text-gray-700 border-gray-200",
    };
    return statusMap[status] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  /**
   * Get request status icon
   */
  const getRequestStatusIcon = (status) => {
    const iconMap = {
      "Pending Review": Clock,
      "Awaiting Customer Confirmation": Hourglass,
      Accepted: CheckCircle,
      Converted: CheckCircle,
      Rejected: XCircle,
      Cancelled: XCircle,
    };
    return iconMap[status] || Info;
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
  // EVENT HANDLERS - PAGINATION (SEPARATE)
  // ==========================================================================
  const ordersPaginate = (pageNumber) => setOrdersCurrentPage(pageNumber);
  const requestsPaginate = (pageNumber) => setRequestsCurrentPage(pageNumber);

  const ordersNextPage = () => {
    if (ordersCurrentPage < ordersTotalPages)
      setOrdersCurrentPage(ordersCurrentPage + 1);
  };
  const ordersPrevPage = () => {
    if (ordersCurrentPage > 1) setOrdersCurrentPage(ordersCurrentPage - 1);
  };

  const requestsNextPage = () => {
    if (requestsCurrentPage < requestsTotalPages)
      setRequestsCurrentPage(requestsCurrentPage + 1);
  };
  const requestsPrevPage = () => {
    if (requestsCurrentPage > 1) setRequestsCurrentPage(requestsCurrentPage - 1);
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
    if (activeView === "requests") {
      fetchRequests();
      setRequestsCurrentPage(1);
    }
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

  /**
   * Reset orders pagination when filter changes
   */
  useEffect(() => {
    setOrdersCurrentPage(1);
  }, [filter]);

  /**
   * Reset requests pagination when filter changes
   */
  useEffect(() => {
    setRequestsCurrentPage(1);
  }, [requestsFilter, requestsSearch]);

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
        setRequestsCurrentPage(1);
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
  // REVIEW REQUEST HANDLERS
  // ==========================================================================

  /**
   * Open review modal for a request
   */
  const openReviewModal = (request) => {
    setRequestToReview(request);
    const initialItems = (request.items || []).map((item) => ({
      itemId: item.item?._id || item.item,
      itemName: item.itemName || item.item?.name || "Unknown",
      quantity: item.quantity,
      status: item.status || "Pending",
      rejectionReason: item.rejectionReason || "",
    }));
    setReviewItems(initialItems);
    setReviewData({
      approvedDeliveryDate: request.approvedDeliveryDate
        ? formatDateForInput(request.approvedDeliveryDate)
        : request.requestedDeliveryDate
          ? formatDateForInput(request.requestedDeliveryDate)
          : "",
      deliveryDateChangeReason: request.deliveryDateChangeReason || "",
      reviewNotes: request.reviewNotes || "",
    });
    setShowReviewModal(true);
  };

  /**
   * Update item status in review
   */
  const updateReviewItemStatus = (index, status) => {
    const updated = [...reviewItems];
    updated[index].status = status;
    if (status === "Accepted") {
      updated[index].rejectionReason = "";
    }
    setReviewItems(updated);
  };

  /**
   * Update item rejection reason in review
   */
  const updateReviewItemRejectionReason = (index, reason) => {
    const updated = [...reviewItems];
    updated[index].rejectionReason = reason;
    setReviewItems(updated);
  };

  /**
   * Submit review to backend
   */
  const handleSubmitReview = async () => {
    const allPending = reviewItems.every((item) => item.status === "Pending");
    if (allPending) {
      toast.error("Please review at least one item (Accept or Reject)");
      return;
    }

    const missingReason = reviewItems.some(
      (item) => item.status === "Rejected" && !item.rejectionReason.trim(),
    );
    if (missingReason) {
      toast.error("Please provide a reason for all rejected items");
      return;
    }

    if (!reviewData.approvedDeliveryDate) {
      toast.error("Please set an approved delivery date");
      return;
    }

    setReviewLoading(true);
    try {
      const payload = {
        items: reviewItems.map((item) => ({
          itemId: item.itemId,
          status: item.status,
          rejectionReason: item.rejectionReason || "",
        })),
        approvedDeliveryDate: reviewData.approvedDeliveryDate,
        deliveryDateChangeReason: reviewData.deliveryDateChangeReason || "",
        reviewNotes: reviewData.reviewNotes || "",
      };

      const response = await axios.put(
        `${BASE_URL}/api/orders/reviewRequests/${requestToReview._id}`,
        payload,
        { withCredentials: true },
      );

      if (response.data.success) {
        toast.success("✅ Request reviewed successfully!");
        setShowReviewModal(false);
        await fetchRequests();
        if (selectedRequest && selectedRequest._id === requestToReview._id) {
          setSelectedRequest(null);
          setShowRequestDetailModal(false);
        }
        setRequestToReview(null);
        setReviewItems([]);
      } else {
        toast.error(response.data.message || "Failed to review request");
      }
    } catch (error) {
      console.error("Failed to review request:", error);
      toast.error(error.response?.data?.message || "Failed to review request");
    } finally {
      setReviewLoading(false);
    }
  };

  // ==========================================================================
  // REQUEST ACTION HANDLERS
  // ==========================================================================

  /**
   * Convert a request to an order - Only for Accepted requests
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
      const errorMsg =
        error.response?.data?.message || "Failed to convert request";
      toast.error(errorMsg);
    } finally {
      setRequestActionLoading(false);
    }
  };

  /**
   * Reject a customer request - Only for Pending Review
   */
  const handleRejectRequest = async (requestId) => {
    if (!window.confirm("Reject this request?")) return;
    setRequestActionLoading(true);
    try {
      const response = await axios.post(
        `${BASE_URL}/api/orders/requests/${requestId}/reject`,
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

    const existingIndex = formData.items.findIndex(
      (i) => i.itemId === newItem.itemId && i.priceType === newItem.priceType,
    );
    if (existingIndex >= 0) {
      toast.error(
        `${selectedItem.name} (${newItem.priceType}) already in cart`,
      );
      return;
    }

    const isWholesale =
      newItem.priceType === "Wholesale" &&
      selectedItem.enableWholesale &&
      newItem.quantity >= (selectedItem.wholesaleMinQty || 0);

    const unitPrice = isWholesale
      ? selectedItem.wholesalePrice || selectedItem.price
      : selectedItem.retailPrice || selectedItem.price;

    const discount = Math.max(0, Number(newItem.discount || 0));

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
    "Pending Review": "bg-amber-50 text-amber-700 border-amber-200",
    "Awaiting Customer Confirmation":
      "bg-blue-50 text-blue-700 border-blue-200",
    Accepted: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Converted: "bg-purple-50 text-purple-700 border-purple-200",
    Rejected: "bg-red-50 text-red-700 border-red-200",
    Cancelled: "bg-gray-50 text-gray-700 border-gray-200",
  };

  const statusOptions = [
    "All",
    "Pending",
    "Confirmed",
    "Completed",
    "Cancelled",
  ];

  const requestStats = {
    pending: (requests || []).filter(
      (r) =>
        r.status === "Pending Review" ||
        r.status === "Awaiting Customer Confirmation",
    ).length,
    accepted: (requests || []).filter((r) => r.status === "Accepted").length,
    converted: (requests || []).filter((r) => r.status === "Converted").length,
    rejected: (requests || []).filter((r) => r.status === "Rejected").length,
    cancelled: (requests || []).filter((r) => r.status === "Cancelled").length,
  };

  const statsData = [
    {
      label: "Total Orders",
      value: orders.length,
      icon: ShoppingCart,
      bg: "bg-emerald-50",
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
      border: "border-emerald-200",
      textColor: "text-emerald-700",
    },
    {
      label: "Revenue",
      value: `TSh ${orders.reduce((sum, o) => sum + (o.grandTotal || 0), 0).toLocaleString()}`,
      icon: Banknote,
      bg: "bg-blue-50",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      border: "border-blue-200",
      textColor: "text-blue-700",
    },
    {
      label: "Active Orders",
      value: orders.filter(
        (o) => o.status === "Pending" || o.status === "Confirmed",
      ).length,
      icon: Activity,
      bg: "bg-amber-50",
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
      border: "border-amber-200",
      textColor: "text-amber-700",
    },
    {
      label: "Completion Rate",
      value: `${orders.length > 0 ? Math.round((orders.filter((o) => o.status === "Completed").length / orders.length) * 100) : 0}%`,
      icon: BarChart3,
      bg: "bg-purple-50",
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      border: "border-purple-200",
      textColor: "text-purple-700",
    },
  ];

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
        <button
          onClick={prevFn}
          disabled={currentPageNum === 1}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            currentPageNum === 1
              ? "bg-gray-100 text-gray-300 cursor-not-allowed"
              : "bg-white border-2 border-gray-300 text-gray-600 hover:bg-gray-100 hover:border-gray-400 shadow-sm"
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {startPage > 1 && (
          <>
            <button
              onClick={() => paginateFn(1)}
              className="px-3.5 py-2 rounded-lg text-sm font-medium bg-white border-2 border-gray-300 text-gray-600 hover:bg-gray-100 hover:border-gray-400 transition-all duration-200 shadow-sm"
            >
              1
            </button>
            {startPage > 2 && (
              <span className="px-1 text-gray-400 text-sm">…</span>
            )}
          </>
        )}

        {pageNumbers.map((number) => (
          <button
            key={number}
            onClick={() => paginateFn(number)}
            className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm border-2 ${
              currentPageNum === number
                ? "bg-emerald-500 text-white border-emerald-500 hover:bg-emerald-600"
                : "bg-white border-gray-300 text-gray-600 hover:bg-gray-100 hover:border-gray-400"
            }`}
          >
            {number}
          </button>
        ))}

        {endPage < totalPagesNum && (
          <>
            {endPage < totalPagesNum - 1 && (
              <span className="px-1 text-gray-400 text-sm">…</span>
            )}
            <button
              onClick={() => paginateFn(totalPagesNum)}
              className="px-3.5 py-2 rounded-lg text-sm font-medium bg-white border-2 border-gray-300 text-gray-600 hover:bg-gray-100 hover:border-gray-400 transition-all duration-200 shadow-sm"
            >
              {totalPagesNum}
            </button>
          </>
        )}

        <button
          onClick={nextFn}
          disabled={currentPageNum === totalPagesNum}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            currentPageNum === totalPagesNum
              ? "bg-gray-100 text-gray-300 cursor-not-allowed"
              : "bg-white border-2 border-gray-300 text-gray-600 hover:bg-gray-100 hover:border-gray-400 shadow-sm"
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
      <div className="flex bg-white rounded-xl p-1 border-2 border-gray-200 shadow-sm">
        <button
          onClick={() => setActiveView("orders")}
          className={`flex items-center gap-2 px-4 sm:px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
            activeView === "orders"
              ? "bg-emerald-500 text-white shadow-md shadow-emerald-200"
              : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
          }`}
        >
          <List className="w-4 h-4" />
          Orders
          <span
            className={`text-xs px-2 py-0.5 rounded-full ${
              activeView === "orders"
                ? "bg-white/20 text-white"
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
              ? "bg-emerald-500 text-white shadow-md shadow-emerald-200"
              : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          Requests
          {requestStats.pending > 0 && (
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                activeView === "requests"
                  ? "bg-white/20 text-white"
                  : "bg-amber-200 text-amber-700"
              }`}
            >
              {requestStats.pending}
            </span>
          )}
        </button>
      </div>

      <div className="relative w-full sm:w-64">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          placeholder={
            activeView === "orders" ? "Search orders..." : "Search requests..."
          }
          className="w-full pl-9 pr-4 py-2.5 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-transparent transition-all duration-200 text-sm text-black placeholder-gray-400 shadow-sm"
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
          className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 border-2 ${
            filter === s
              ? "bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-200"
              : "bg-white border-gray-300 text-gray-500 hover:border-gray-400 hover:text-gray-700 hover:bg-gray-100"
          }`}
        >
          {s !== "All" && (
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                filter === s
                  ? "bg-white"
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
              className={`text-xs ${filter === s ? "text-white/80" : "text-gray-400"}`}
            >
              {orders.filter((o) => o.status === s).length}
            </span>
          )}
        </button>
      ))}
    </div>
  );

  /**
   * Render a single order card - LIGHT GREY BG
   */
  const renderOrderCard = (order) => {
    const StatusIcon = statusIcons[order.status] || Clock;
    return (
      <div
        key={order._id}
        className="bg-gray-100 rounded-2xl border-2 border-gray-300 shadow-sm p-4 sm:p-5 hover:shadow-md hover:border-emerald-300 transition-all duration-300"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="w-11 h-11 rounded-full bg-emerald-200 flex items-center justify-center text-emerald-700 text-sm font-bold flex-shrink-0 border-2 border-emerald-300">
              <User className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-semibold text-gray-800">
                  {order.customerName}
                </span>
                <span className="font-mono text-xs text-gray-600 bg-white px-2 py-0.5 rounded-md border border-gray-300">
                  {order.orderNumber}
                </span>
                <span className="text-xs text-gray-600 bg-white px-2 py-0.5 rounded-full border border-gray-300">
                  {order.items?.length || 0} items
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                <span>{order.customerPhone}</span>
                <span className="w-1 h-1 bg-gray-400 rounded-full" />
                <span>{new Date(order.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <div className="text-right mr-2">
              <div className="text-sm font-bold text-gray-800">
                {formatCurrency(order.grandTotal)}
              </div>
              {order.totalDiscount > 0 && (
                <span className="text-[10px] text-emerald-700 font-medium bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                  -{formatCurrency(order.totalDiscount)}
                </span>
              )}
            </div>

            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border-2 ${statusColors[order.status]}`}
            >
              <StatusIcon className="w-3 h-3" />
              {order.status}
            </span>

            <button
              onClick={() => {
                setSelectedOrder(order);
                setShowDetailModal(true);
              }}
              className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-lg transition-all duration-200 border border-transparent hover:border-blue-200"
              title="View Details"
            >
              <FileText className="w-4 h-4" />
            </button>

            {order.status !== "Completed" && (
              <button
                onClick={() => handleDeleteOrder(order._id)}
                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-100 rounded-lg transition-all duration-200 border border-transparent hover:border-red-200"
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
        <div className="flex flex-col items-center justify-center py-20 bg-gray-100 rounded-2xl border-2 border-gray-300 shadow-sm">
          <div className="w-12 h-12 border-4 border-emerald-300 border-t-emerald-500 rounded-full animate-spin" />
          <p className="text-sm text-gray-500 mt-4">Loading orders...</p>
        </div>
      );
    }

    if (currentOrders.length === 0) {
      return (
        <div className="bg-gray-100 rounded-2xl border-2 border-gray-300 shadow-sm py-20 text-center">
          <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-gray-300">
            <Package className="w-10 h-10 text-gray-400" />
          </div>
          <p className="text-gray-700 font-medium">No orders found</p>
          <p className="text-sm text-gray-500 mt-1">
            {filter === "All"
              ? "Create your first order to get started"
              : `No ${filter.toLowerCase()} orders`}
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
        {
          key: "pending",
          label: "Pending",
          color: "amber",
          count: requestStats.pending,
        },
        {
          key: "accepted",
          label: "Accepted",
          color: "emerald",
          count: requestStats.accepted,
        },
        {
          key: "converted",
          label: "Converted",
          color: "purple",
          count: requestStats.converted,
        },
        {
          key: "rejected",
          label: "Rejected",
          color: "red",
          count: requestStats.rejected,
        },
        {
          key: "cancelled",
          label: "Cancelled",
          color: "gray",
          count: requestStats.cancelled,
        },
      ].map((tab) => {
        const isActive = requestsFilter === tab.key;
        const dotColor = {
          amber: "bg-amber-400",
          emerald: "bg-emerald-400",
          purple: "bg-purple-400",
          red: "bg-red-400",
          gray: "bg-gray-400",
        }[tab.color];
        const activeBg = {
          amber: "bg-amber-500 border-amber-500 text-white",
          emerald: "bg-emerald-500 border-emerald-500 text-white",
          purple: "bg-purple-500 border-purple-500 text-white",
          red: "bg-red-500 border-red-500 text-white",
          gray: "bg-gray-500 border-gray-500 text-white",
        }[tab.color];

        return (
          <button
            key={tab.key}
            onClick={() => setRequestsFilter(tab.key)}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 border-2 shadow-sm ${
              isActive
                ? activeBg
                : "bg-white border-gray-300 text-gray-500 hover:border-gray-400 hover:text-gray-700 hover:bg-gray-100"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-white" : dotColor}`}
            />
            {tab.label}
            {tab.count > 0 && (
              <span className={`text-xs ${isActive ? "text-white/80" : "text-gray-400"}`}>
                ({tab.count})
              </span>
            )}
          </button>
        );
      })}
    </div>
  );

  /**
   * Render a single request card - LIGHT GREY BG
   */
  const renderRequestCard = (request) => {
    const StatusIcon = getRequestStatusIcon(request.status);
    const statusDisplay = getStatusDisplayName(request.status);

    const acceptedItems = (request.items || []).filter(
      (i) => i.status === "Accepted",
    ).length;
    const rejectedItems = (request.items || []).filter(
      (i) => i.status === "Rejected",
    ).length;
    const pendingItems = (request.items || []).filter(
      (i) => i.status === "Pending",
    ).length;

    const canReview = request.status === "Pending Review";
    const canConvert = request.status === "Accepted";
    const canReject =
      request.status === "Pending Review" ||
      request.status === "Awaiting Customer Confirmation";

    return (
      <div
        key={request._id}
        className="bg-gray-100 rounded-2xl border-2 border-gray-300 shadow-sm p-4 sm:p-5 hover:shadow-md hover:border-emerald-300 transition-all duration-300"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="w-11 h-11 rounded-full bg-emerald-200 flex items-center justify-center text-emerald-700 text-sm font-bold flex-shrink-0 border-2 border-emerald-300">
              <User className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-semibold text-gray-800">
                  {request.customerName}
                </span>
                <span className="font-mono text-xs text-gray-600 bg-white px-2 py-0.5 rounded-md border border-gray-300">
                  {request.requestNumber}
                </span>
                <span className="text-xs text-gray-600 bg-white px-2 py-0.5 rounded-full border border-gray-300">
                  {request.items?.length || 0} items
                </span>
                {request.source && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${getSourceBadge(request.source)}`}
                  >
                    {request.source}
                  </span>
                )}
                {request.customerAction &&
                  request.customerAction !== "Waiting" && (
                    <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium border border-blue-200">
                      {request.customerAction === "Accepted"
                        ? "✓ Accepted"
                        : "✎ Amended"}
                    </span>
                  )}
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5 flex-wrap">
                <span>{request.customerPhone}</span>
                <span className="w-1 h-1 bg-gray-400 rounded-full" />
                <span>{new Date(request.createdAt).toLocaleDateString()}</span>
                {request.requestedDeliveryDate && (
                  <>
                    <span className="w-1 h-1 bg-gray-400 rounded-full" />
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(request.requestedDeliveryDate)}
                    </span>
                  </>
                )}
                {request.reviewCycle && request.reviewCycle > 1 && (
                  <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium border border-purple-200">
                    Cycle {request.reviewCycle}
                  </span>
                )}
              </div>
              {(request.status === "Awaiting Customer Confirmation" ||
                request.status === "Accepted") && (
                <div className="flex items-center gap-2 mt-1 text-xs">
                  {acceptedItems > 0 && (
                    <span className="text-emerald-600 font-medium flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      {acceptedItems} accepted
                    </span>
                  )}
                  {rejectedItems > 0 && (
                    <span className="text-red-600 font-medium flex items-center gap-1">
                      <XIcon className="w-3 h-3" />
                      {rejectedItems} rejected
                    </span>
                  )}
                  {pendingItems > 0 && (
                    <span className="text-amber-600 font-medium flex items-center gap-1">
                      <Hourglass className="w-3 h-3" />
                      {pendingItems} pending
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border-2 ${requestStatusColors[request.status]}`}
            >
              <StatusIcon className="w-3 h-3" />
              {statusDisplay}
            </span>

            <button
              onClick={() => {
                setSelectedRequest(request);
                setShowRequestDetailModal(true);
              }}
              className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-lg transition-all duration-200 border border-transparent hover:border-blue-200"
              title="View Details"
            >
              <FileText className="w-4 h-4" />
            </button>

            {canReview && (
              <>
                <button
                  onClick={() => openReviewModal(request)}
                  disabled={requestActionLoading}
                  className="flex items-center gap-1 px-3 py-1.5 bg-blue-500 text-white text-xs font-semibold rounded-lg hover:bg-blue-600 hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Review Request"
                >
                  <Edit className="w-3.5 h-3.5" />
                  Review
                </button>
                <button
                  onClick={() => handleRejectRequest(request._id)}
                  disabled={requestActionLoading}
                  className="p-2 text-red-400 hover:text-red-600 hover:bg-red-100 rounded-lg transition-all duration-200 border border-transparent hover:border-red-200 disabled:opacity-50"
                  title="Reject Request"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              </>
            )}

            {request.status === "Awaiting Customer Confirmation" && (
              <button
                onClick={() => handleRejectRequest(request._id)}
                disabled={requestActionLoading}
                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-100 rounded-lg transition-all duration-200 border border-transparent hover:border-red-200 disabled:opacity-50"
                title="Reject Request"
              >
                <XCircle className="w-4 h-4" />
              </button>
            )}

            {canConvert && (
              <button
                onClick={() => handleConvertRequest(request._id)}
                disabled={requestActionLoading}
                className="flex items-center gap-1 px-3 py-1.5 bg-purple-500 text-white text-xs font-semibold rounded-lg hover:bg-purple-600 hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowRight className="w-3.5 h-3.5" />
                Convert
              </button>
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
        <div className="flex flex-col items-center justify-center py-20 bg-gray-100 rounded-2xl border-2 border-gray-300 shadow-sm">
          <div className="w-12 h-12 border-4 border-emerald-300 border-t-emerald-500 rounded-full animate-spin" />
          <p className="text-sm text-gray-500 mt-4">Loading requests...</p>
        </div>
      );
    }

    if (currentRequests.length === 0) {
      return (
        <div className="bg-gray-100 rounded-2xl border-2 border-gray-300 shadow-sm py-20 text-center">
          <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-gray-300">
            <ClipboardList className="w-10 h-10 text-gray-400" />
          </div>
          <p className="text-gray-700 font-medium">No requests found</p>
          <p className="text-sm text-gray-500 mt-1">
            {requestsFilter === "pending"
              ? "No pending requests"
              : `No ${requestsFilter} requests`}
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
          <div className="sticky top-0 z-10 bg-white px-6 sm:px-8 py-5 border-b border-gray-200 rounded-t-2xl">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-xl shadow-lg shadow-emerald-200">
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-gray-100 rounded-xl p-4 border-2 border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-500" />
                    Customer Details
                  </h4>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">
                        Customer Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full px-3.5 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-transparent transition-all duration-200 text-black bg-white text-sm"
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

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="tel"
                          required
                          className={`w-full pl-9 pr-4 py-2.5 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-transparent transition-all duration-200 text-black bg-white text-sm ${
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

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">
                        Notes
                      </label>
                      <div className="relative">
                        <StickyNote className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                        <textarea
                          className="w-full pl-9 pr-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-transparent transition-all duration-200 resize-none text-black bg-white text-sm"
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

              <div className="space-y-4">
                <div className="bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-xl p-4 border-2 border-emerald-300">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-emerald-600" />
                    Order Summary
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between py-1.5 border-b border-emerald-300/50">
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
                    <div className="flex justify-between pt-2 border-t-2 border-emerald-400">
                      <span className="text-gray-700 font-semibold">
                        Grand Total:
                      </span>
                      <span className="text-xl font-bold text-emerald-700">
                        TSh {calculateTotal(formData.items).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-blue-100 rounded-lg p-3 border-2 border-blue-200">
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
                  <div className="bg-purple-100 rounded-lg p-3 border-2 border-purple-200">
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

            <div className="mt-6">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-gray-500" />
                  Add Items <span className="text-red-500">*</span>
                </label>
                <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full border-2 border-gray-200">
                  {formData.items.length} items added
                </span>
              </div>

              <div className="bg-gray-100 rounded-xl p-4 border-2 border-gray-200">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                  <div className="sm:col-span-4 relative">
                    <select
                      className="w-full px-3.5 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-transparent transition-all duration-200 text-black bg-white text-sm appearance-none pr-10 max-h-[200px] overflow-y-auto"
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

                  <select
                    className="sm:col-span-2 px-3.5 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-transparent transition-all duration-200 text-black bg-white text-sm"
                    value={newItem.priceType}
                    onChange={(e) =>
                      setNewItem({ ...newItem, priceType: e.target.value })
                    }
                  >
                    <option value="Retail">Retail</option>
                    <option value="Wholesale">Wholesale</option>
                  </select>

                  <input
                    type="number"
                    min="1"
                    className="sm:col-span-2 px-3.5 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-transparent transition-all duration-200 text-black bg-white text-sm"
                    value={newItem.quantity}
                    onChange={(e) =>
                      setNewItem({
                        ...newItem,
                        quantity: parseInt(e.target.value) || 1,
                      })
                    }
                    placeholder="Qty"
                  />

                  <div className="sm:col-span-2 relative">
                    <Percent className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="number"
                      min="0"
                      className="w-full pl-9 pr-3.5 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-transparent transition-all duration-200 text-black bg-white text-sm"
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

                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="sm:col-span-2 px-4 py-2.5 bg-emerald-500 text-white font-semibold rounded-lg hover:bg-emerald-600 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-200 hover:scale-[1.02] active:scale-95 text-sm shadow-sm flex items-center justify-center gap-2 border-2 border-emerald-400"
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

            {formData.items.length > 0 && (
              <div className="mt-4 bg-white rounded-xl p-4 border-2 border-gray-200">
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {formData.items.map((item, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all ${
                        item.isExpired
                          ? "border-yellow-300 bg-yellow-100/50"
                          : "border-gray-200 hover:border-emerald-300 bg-gray-100/50"
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
                          <span className="text-[10px] bg-emerald-200 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">
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

            <div className="mt-6 pt-4 border-t-2 border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
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
                  className="flex-1 sm:flex-none px-6 py-2.5 border-2 border-gray-300 text-gray-600 font-semibold rounded-lg hover:bg-gray-100 hover:border-gray-400 transition-all duration-200 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formData.items.length === 0 || !isPhoneValid}
                  className="flex-1 sm:flex-none px-6 py-2.5 bg-emerald-500 text-white font-semibold rounded-lg hover:bg-emerald-600 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-200 hover:scale-[1.02] active:scale-95 text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md border-2 border-emerald-400"
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
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-100 rounded-xl border-2 border-gray-200">
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
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border-2 mt-1 ${statusColors[selectedOrder.status]}`}
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

            <div>
              <h4 className="font-semibold text-gray-700 text-sm mb-3 flex items-center gap-2">
                <Package className="w-4 h-4 text-gray-500" />
                Items
              </h4>
              <div className="space-y-2">
                {selectedOrder.items?.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-3 bg-gray-100 rounded-lg border-2 border-gray-200"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-gray-800 text-sm">
                        {item.itemName}
                      </span>
                      <span className="text-sm text-gray-500">
                        ×{item.quantity}
                      </span>
                      {item.priceType === "Wholesale" && (
                        <span className="text-[10px] bg-emerald-200 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">
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

            <div className="border-t-2 border-gray-200 pt-4">
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
                    <span className="font-medium text-emerald-700">
                      -{formatCurrency(selectedOrder.totalDiscount)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-base font-bold pt-2 border-t-2 border-gray-200">
                  <span className="text-gray-800">Total</span>
                  <span className="text-emerald-700">
                    {formatCurrency(selectedOrder.grandTotal)}
                  </span>
                </div>
              </div>
            </div>

            {selectedOrder.notes && (
              <div className="p-3 bg-yellow-100 rounded-lg border-2 border-yellow-200">
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

    const toggleSection = (section) => {
      setExpandedSections((prev) => ({
        ...prev,
        [section]: !prev[section],
      }));
    };

    const acceptedItems = (selectedRequest.items || []).filter(
      (i) => i.status === "Accepted",
    ).length;
    const rejectedItems = (selectedRequest.items || []).filter(
      (i) => i.status === "Rejected",
    ).length;
    const pendingItems = (selectedRequest.items || []).filter(
      (i) => i.status === "Pending",
    ).length;

    const statusDisplay = getStatusDisplayName(selectedRequest.status);
    const canConvert = selectedRequest.status === "Accepted";

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 z-10 bg-white px-6 sm:px-8 py-5 border-b border-gray-200 rounded-t-2xl">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-xl shadow-lg ${
                    selectedRequest.status === "Pending Review"
                      ? "bg-gradient-to-br from-amber-400 to-amber-500 shadow-amber-200"
                      : selectedRequest.status ===
                          "Awaiting Customer Confirmation"
                        ? "bg-gradient-to-br from-blue-400 to-blue-500 shadow-blue-200"
                        : selectedRequest.status === "Accepted"
                          ? "bg-gradient-to-br from-emerald-400 to-emerald-500 shadow-emerald-200"
                          : selectedRequest.status === "Converted"
                            ? "bg-gradient-to-br from-purple-400 to-purple-500 shadow-purple-200"
                            : selectedRequest.status === "Rejected"
                              ? "bg-gradient-to-br from-red-400 to-red-500 shadow-red-200"
                              : "bg-gradient-to-br from-gray-400 to-gray-500 shadow-gray-200"
                  }`}
                >
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
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-100 rounded-xl border-2 border-gray-200">
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
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border-2 mt-1 ${requestStatusColors[selectedRequest.status]}`}
                >
                  {statusDisplay}
                </span>
                {selectedRequest.reviewCycle &&
                  selectedRequest.reviewCycle > 1 && (
                    <span className="ml-2 text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium border border-purple-200">
                      Cycle {selectedRequest.reviewCycle}
                    </span>
                  )}
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Source
                </p>
                <span
                  className={`inline-block px-2 py-1 rounded-full text-xs font-semibold mt-1 border ${getSourceBadge(selectedRequest.source)}`}
                >
                  {selectedRequest.source || "Website"}
                </span>
              </div>
              <div className="col-span-2">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer Action
                </p>
                <span className="font-semibold text-gray-800 mt-1">
                  {selectedRequest.customerAction || "Waiting"}
                </span>
                {selectedRequest.customerAction === "Requested Amendment" && (
                  <span className="ml-2 text-xs text-blue-600 font-medium">
                    (Amendment requested)
                  </span>
                )}
              </div>
              <div className="col-span-2">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Requested Delivery Date
                </p>
                <p className="font-semibold text-gray-800 mt-1">
                  {selectedRequest.requestedDeliveryDate
                    ? formatDate(selectedRequest.requestedDeliveryDate)
                    : "Not specified"}
                </p>
              </div>
              {selectedRequest.approvedDeliveryDate && (
                <div className="col-span-2">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Approved Delivery Date
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-semibold text-emerald-700">
                      {formatDate(selectedRequest.approvedDeliveryDate)}
                    </span>
                    {selectedRequest.deliveryDateChanged && (
                      <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium border border-amber-200">
                        Changed
                      </span>
                    )}
                  </div>
                </div>
              )}
              <div className="col-span-2">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submitted
                </p>
                <p className="font-semibold text-gray-800 mt-1">
                  {formatDateTime(selectedRequest.createdAt)}
                </p>
              </div>
            </div>

            <div className="border-2 border-gray-200 rounded-xl overflow-hidden">
              <button
                onClick={() => toggleSection("items")}
                className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-gray-500" />
                  <span className="font-semibold text-gray-700 text-sm">
                    Items ({selectedRequest.items?.length || 0})
                  </span>
                  {(selectedRequest.status ===
                    "Awaiting Customer Confirmation" ||
                    selectedRequest.status === "Accepted") && (
                    <div className="flex items-center gap-1 ml-2 text-xs">
                      {acceptedItems > 0 && (
                        <span className="text-emerald-600 font-medium flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          {acceptedItems}
                        </span>
                      )}
                      {rejectedItems > 0 && (
                        <span className="text-red-600 font-medium flex items-center gap-1 ml-1">
                          <XIcon className="w-3 h-3" />
                          {rejectedItems}
                        </span>
                      )}
                      {pendingItems > 0 && (
                        <span className="text-amber-600 font-medium flex items-center gap-1 ml-1">
                          <Hourglass className="w-3 h-3" />
                          {pendingItems}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <span className="text-gray-400">
                  {expandedSections.items ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </span>
              </button>
              {expandedSections.items && (
                <div className="p-3 space-y-2">
                  {selectedRequest.items?.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-2 bg-gray-100 rounded-lg border-2 border-gray-200"
                    >
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-gray-800 text-sm">
                          {item.itemName}
                        </span>
                        <span className="text-sm text-gray-500">
                          ×{item.quantity}
                        </span>
                        {item.status && (
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${getItemStatusBadge(item.status)}`}
                          >
                            {item.status}
                          </span>
                        )}
                      </div>
                      {item.status === "Rejected" && item.rejectionReason && (
                        <span
                          className="text-xs text-red-600 max-w-[150px] truncate"
                          title={item.rejectionReason}
                        >
                          ⚠️ {item.rejectionReason}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {selectedRequest.amendmentHistory &&
              selectedRequest.amendmentHistory.length > 0 && (
                <div className="border-2 border-gray-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => toggleSection("amendment")}
                    className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <History className="w-4 h-4 text-gray-500" />
                      <span className="font-semibold text-gray-700 text-sm">
                        Amendment History (
                        {selectedRequest.amendmentHistory.length})
                      </span>
                    </div>
                    <span className="text-gray-400">
                      {expandedSections.amendment ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </span>
                  </button>
                  {expandedSections.amendment && (
                    <div className="p-3 space-y-3 max-h-[300px] overflow-y-auto">
                      {selectedRequest.amendmentHistory.map(
                        (amendment, idx) => (
                          <div
                            key={idx}
                            className="bg-gray-50 p-3 rounded-lg border-2 border-gray-200"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-semibold text-gray-700">
                                Amendment #{amendment.cycle}
                              </span>
                              <span className="text-xs text-gray-500">
                                {formatDateTime(amendment.amendedAt)}
                              </span>
                            </div>
                            {amendment.customerComment && (
                              <p className="text-sm text-gray-600 mb-2 bg-white p-2 rounded border-2 border-gray-200">
                                💬 {amendment.customerComment}
                              </p>
                            )}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                              <div>
                                <p className="text-gray-400 font-medium mb-1">
                                  Previous Items
                                </p>
                                <div className="space-y-0.5">
                                  {amendment.previousItems?.map((i, idx) => (
                                    <p key={idx} className="text-gray-600">
                                      {i.itemName} (×{i.quantity})
                                    </p>
                                  ))}
                                  {(!amendment.previousItems ||
                                    amendment.previousItems.length === 0) && (
                                    <p className="text-gray-400 text-xs">
                                      No items
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div>
                                <p className="text-gray-400 font-medium mb-1">
                                  New Items
                                </p>
                                <div className="space-y-0.5">
                                  {amendment.newItems?.map((i, idx) => (
                                    <p key={idx} className="text-gray-600">
                                      {i.itemName} (×{i.quantity})
                                    </p>
                                  ))}
                                  {(!amendment.newItems ||
                                    amendment.newItems.length === 0) && (
                                    <p className="text-gray-400 text-xs">
                                      No items
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                            {amendment.previousRequestedDeliveryDate && (
                              <div className="mt-2 pt-2 border-t-2 border-gray-200 text-xs">
                                <div className="flex justify-between">
                                  <span className="text-gray-400">
                                    Previous Delivery:
                                  </span>
                                  <span className="text-gray-600">
                                    {formatDate(
                                      amendment.previousRequestedDeliveryDate,
                                    )}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-400">
                                    New Delivery:
                                  </span>
                                  <span className="text-gray-600">
                                    {formatDate(
                                      amendment.newRequestedDeliveryDate,
                                    )}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        ),
                      )}
                    </div>
                  )}
                </div>
              )}

            <div className="border-2 border-gray-200 rounded-xl overflow-hidden">
              <button
                onClick={() => toggleSection("delivery")}
                className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="font-semibold text-gray-700 text-sm">
                    Delivery Information
                  </span>
                  {selectedRequest.deliveryDateChanged && (
                    <span className="text-xs text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full font-medium border border-amber-200">
                      Changed
                    </span>
                  )}
                </div>
                <span className="text-gray-400">
                  {expandedSections.delivery ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </span>
              </button>
              {expandedSections.delivery && (
                <div className="p-3 space-y-2 text-sm">
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span className="text-gray-500">
                      Requested Delivery Date
                    </span>
                    <span className="font-medium text-gray-800">
                      {selectedRequest.requestedDeliveryDate
                        ? formatDate(selectedRequest.requestedDeliveryDate)
                        : "Not specified"}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span className="text-gray-500">
                      Approved Delivery Date
                    </span>
                    <span className="font-medium text-gray-800">
                      {selectedRequest.approvedDeliveryDate
                        ? formatDate(selectedRequest.approvedDeliveryDate)
                        : "Not approved yet"}
                    </span>
                  </div>
                  {selectedRequest.deliveryDateChanged && (
                    <div className="flex justify-between py-1">
                      <span className="text-gray-500">Change Reason</span>
                      <span className="font-medium text-gray-800 text-right max-w-[200px]">
                        {selectedRequest.deliveryDateChangeReason ||
                          "No reason provided"}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {(selectedRequest.status === "Awaiting Customer Confirmation" ||
              selectedRequest.status === "Accepted" ||
              selectedRequest.status === "Converted" ||
              selectedRequest.status === "Rejected") && (
              <div className="border-2 border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => toggleSection("review")}
                  className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-gray-500" />
                    <span className="font-semibold text-gray-700 text-sm">
                      Review Information
                    </span>
                  </div>
                  <span className="text-gray-400">
                    {expandedSections.review ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </span>
                </button>
                {expandedSections.review && (
                  <div className="p-3 space-y-2 text-sm">
                    {selectedRequest.reviewedBy && (
                      <div className="flex justify-between py-1 border-b border-gray-100">
                        <span className="text-gray-500">Reviewed By</span>
                        <span className="font-medium text-gray-800">
                          {selectedRequest.reviewedBy?.name ||
                            selectedRequest.reviewedBy?.fullName ||
                            "Unknown"}
                        </span>
                      </div>
                    )}
                    {selectedRequest.reviewedAt && (
                      <div className="flex justify-between py-1 border-b border-gray-100">
                        <span className="text-gray-500">Reviewed At</span>
                        <span className="font-medium text-gray-800">
                          {formatDateTime(selectedRequest.reviewedAt)}
                        </span>
                      </div>
                    )}
                    {selectedRequest.reviewNotes && (
                      <div className="py-1">
                        <p className="text-gray-500 mb-1">Review Notes</p>
                        <p className="font-medium text-gray-800 bg-gray-50 p-2 rounded border-2 border-gray-200">
                          {selectedRequest.reviewNotes}
                        </p>
                      </div>
                    )}
                    {selectedRequest.status === "Rejected" && (
                      <div className="py-1">
                        <p className="text-gray-500 mb-1 text-red-600 font-medium">
                          Rejection Reason
                        </p>
                        <p className="font-medium text-red-700 bg-red-50 p-2 rounded border-2 border-red-200">
                          {selectedRequest.reviewNotes || "No reason provided"}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {selectedRequest.notes && (
              <div className="p-3 bg-yellow-100 rounded-lg border-2 border-yellow-200">
                <p className="text-sm text-yellow-800 flex items-start gap-2">
                  <StickyNote className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                  {selectedRequest.notes}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t-2 border-gray-200">
              {selectedRequest.status === "Pending Review" && (
                <>
                  <button
                    onClick={() => {
                      setShowRequestDetailModal(false);
                      openReviewModal(selectedRequest);
                    }}
                    disabled={requestActionLoading}
                    className="flex-1 bg-blue-500 text-white font-semibold py-2.5 px-5 rounded-lg hover:bg-blue-600 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 text-sm border-2 border-blue-400"
                  >
                    <Edit className="w-4 h-4" /> Review Request
                  </button>
                  <button
                    onClick={() => handleRejectRequest(selectedRequest._id)}
                    disabled={requestActionLoading}
                    className="flex-1 bg-white border-2 border-gray-300 text-gray-600 font-semibold py-2.5 px-5 rounded-lg hover:bg-gray-100 hover:border-gray-400 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                  >
                    <XCircle className="w-4 h-4" /> Reject
                  </button>
                </>
              )}

              {selectedRequest.status === "Awaiting Customer Confirmation" && (
                <button
                  onClick={() => handleRejectRequest(selectedRequest._id)}
                  disabled={requestActionLoading}
                  className="flex-1 bg-white border-2 border-gray-300 text-gray-600 font-semibold py-2.5 px-5 rounded-lg hover:bg-gray-100 hover:border-gray-400 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                >
                  <XCircle className="w-4 h-4" /> Reject
                </button>
              )}

              {canConvert && (
                <button
                  onClick={() => handleConvertRequest(selectedRequest._id)}
                  disabled={requestActionLoading}
                  className="flex-1 bg-purple-500 text-white font-semibold py-2.5 px-5 rounded-lg hover:bg-purple-600 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 text-sm border-2 border-purple-400"
                >
                  {requestActionLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  ) : (
                    <>
                      <ArrowRight className="w-4 h-4" /> Convert to Order
                    </>
                  )}
                </button>
              )}

              {selectedRequest.status === "Converted" &&
                selectedRequest.order && (
                  <div className="w-full p-3 bg-purple-100 rounded-lg border-2 border-purple-200">
                    <p className="text-sm text-purple-700 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Converted to Order:{" "}
                      <span className="font-mono font-bold">
                        {typeof selectedRequest.order === "object"
                          ? selectedRequest.order.orderNumber
                          : selectedRequest.order}
                      </span>
                      {typeof selectedRequest.order === "object" &&
                        selectedRequest.order.status && (
                          <span className="text-[10px] bg-purple-200 text-purple-800 px-2 py-0.5 rounded-full font-medium border border-purple-300">
                            {selectedRequest.order.status}
                          </span>
                        )}
                    </p>
                  </div>
                )}

              {selectedRequest.status === "Rejected" && (
                <div className="w-full p-3 bg-red-100 rounded-lg border-2 border-red-200">
                  <p className="text-sm text-red-700 flex items-center gap-2">
                    <XCircle className="w-4 h-4" />
                    This request has been rejected.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  /**
   * Render Review Request Modal
   */
  const renderReviewModal = () => {
    if (!showReviewModal || !requestToReview) return null;

    const totalItems = reviewItems.length;
    const acceptedCount = reviewItems.filter(
      (i) => i.status === "Accepted",
    ).length;
    const rejectedCount = reviewItems.filter(
      (i) => i.status === "Rejected",
    ).length;
    const pendingCount = reviewItems.filter(
      (i) => i.status === "Pending",
    ).length;

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 z-10 bg-white px-6 sm:px-8 py-5 border-b border-gray-200 rounded-t-2xl">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl shadow-lg shadow-blue-200">
                  <Edit className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">
                    Review Request
                  </h2>
                  <p className="text-sm text-gray-500 font-mono">
                    {requestToReview.requestNumber} -{" "}
                    {requestToReview.customerName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowReviewModal(false);
                  setRequestToReview(null);
                  setReviewItems([]);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-gray-100 rounded-lg p-3 text-center border-2 border-gray-200">
                <p className="text-xs text-gray-500">Total Items</p>
                <p className="text-xl font-bold text-gray-800">{totalItems}</p>
              </div>
              <div className="bg-emerald-100 rounded-lg p-3 text-center border-2 border-emerald-200">
                <p className="text-xs text-emerald-600">Accepted</p>
                <p className="text-xl font-bold text-emerald-700">
                  {acceptedCount}
                </p>
              </div>
              <div className="bg-red-100 rounded-lg p-3 text-center border-2 border-red-200">
                <p className="text-xs text-red-600">Rejected</p>
                <p className="text-xl font-bold text-red-700">
                  {rejectedCount}
                </p>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-700 text-sm mb-3 flex items-center gap-2">
                <Package className="w-4 h-4 text-gray-500" />
                Review Each Item
                {pendingCount > 0 && (
                  <span className="text-xs text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full font-medium border border-amber-200">
                    {pendingCount} pending
                  </span>
                )}
              </h4>
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {reviewItems.map((item, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      item.status === "Accepted"
                        ? "border-emerald-300 bg-emerald-50"
                        : item.status === "Rejected"
                          ? "border-red-300 bg-red-50"
                          : "border-gray-200 bg-gray-50"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-gray-800 text-sm">
                            {item.itemName}
                          </span>
                          <span className="text-sm text-gray-500">
                            ×{item.quantity}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <button
                          onClick={() =>
                            updateReviewItemStatus(index, "Accepted")
                          }
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center gap-1 border-2 ${
                            item.status === "Accepted"
                              ? "bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-200"
                              : "bg-gray-200 text-gray-600 border-gray-300 hover:bg-emerald-100 hover:text-emerald-700 hover:border-emerald-300"
                          }`}
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          Accept
                        </button>
                        <button
                          onClick={() =>
                            updateReviewItemStatus(index, "Rejected")
                          }
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center gap-1 border-2 ${
                            item.status === "Rejected"
                              ? "bg-red-500 text-white border-red-500 shadow-md shadow-red-200"
                              : "bg-gray-200 text-gray-600 border-gray-300 hover:bg-red-100 hover:text-red-700 hover:border-red-300"
                          }`}
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Reject
                        </button>
                      </div>
                    </div>
                    {item.status === "Rejected" && (
                      <div className="mt-2">
                        <input
                          type="text"
                          placeholder="Reason for rejection..."
                          value={item.rejectionReason}
                          onChange={(e) =>
                            updateReviewItemRejectionReason(
                              index,
                              e.target.value,
                            )
                          }
                          className="w-full px-3 py-1.5 text-sm border-2 border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-transparent bg-white"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  <Calendar className="w-4 h-4 inline mr-1 text-gray-500" />
                  Approved Delivery Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={reviewData.approvedDeliveryDate}
                  onChange={(e) =>
                    setReviewData({
                      ...reviewData,
                      approvedDeliveryDate: e.target.value,
                    })
                  }
                  className="w-full px-3.5 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-all duration-200 text-black bg-white text-sm"
                  required
                />
                {requestToReview.requestedDeliveryDate && (
                  <p className="text-xs text-gray-500 mt-1">
                    Requested:{" "}
                    {formatDate(requestToReview.requestedDeliveryDate)}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  <Info className="w-4 h-4 inline mr-1 text-gray-500" />
                  Date Change Reason
                </label>
                <input
                  type="text"
                  placeholder="Why is the date changed?"
                  value={reviewData.deliveryDateChangeReason}
                  onChange={(e) =>
                    setReviewData({
                      ...reviewData,
                      deliveryDateChangeReason: e.target.value,
                    })
                  }
                  className="w-full px-3.5 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-all duration-200 text-black bg-white text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                <StickyNote className="w-4 h-4 inline mr-1 text-gray-500" />
                Review Notes
              </label>
              <textarea
                rows="2"
                placeholder="Add any notes about this review..."
                value={reviewData.reviewNotes}
                onChange={(e) =>
                  setReviewData({
                    ...reviewData,
                    reviewNotes: e.target.value,
                  })
                }
                className="w-full px-3.5 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-all duration-200 resize-none text-black bg-white text-sm"
              />
            </div>

            <div className="bg-gray-100 rounded-xl p-4 border-2 border-gray-200">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Items Accepted:</span>
                <span className="font-semibold text-emerald-600">
                  {acceptedCount}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Items Rejected:</span>
                <span className="font-semibold text-red-600">
                  {rejectedCount}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Pending Review:</span>
                <span className="font-semibold text-amber-600">
                  {pendingCount}
                </span>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t-2 border-gray-300 mt-2">
                <span className="text-gray-700 font-medium">
                  Overall Status:
                </span>
                <span className="font-semibold">
                  {pendingCount > 0 ? (
                    <span className="text-amber-600">Pending</span>
                  ) : acceptedCount > 0 && rejectedCount > 0 ? (
                    <span className="text-blue-600">Partial (Reviewed)</span>
                  ) : acceptedCount > 0 ? (
                    <span className="text-emerald-600">All Accepted</span>
                  ) : rejectedCount > 0 ? (
                    <span className="text-red-600">All Rejected</span>
                  ) : (
                    <span className="text-gray-500">Not Reviewed</span>
                  )}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t-2 border-gray-200">
              <button
                onClick={() => {
                  setShowReviewModal(false);
                  setRequestToReview(null);
                  setReviewItems([]);
                }}
                className="flex-1 px-6 py-2.5 border-2 border-gray-300 text-gray-600 font-semibold rounded-lg hover:bg-gray-100 hover:border-gray-400 transition-all duration-200 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitReview}
                disabled={reviewLoading || pendingCount > 0}
                className="flex-1 px-6 py-2.5 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-all duration-300 hover:shadow-lg hover:shadow-blue-200 hover:scale-[1.02] active:scale-95 text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md border-2 border-blue-400"
              >
                {reviewLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Submit Review
                  </>
                )}
              </button>
            </div>
            {pendingCount > 0 && (
              <p className="text-xs text-amber-600 text-center">
                ⚠️ Please review all items before submitting
              </p>
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
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200 border-2 border-emerald-300">
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
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-200 hover:scale-[1.02] active:scale-95 text-sm font-semibold shadow-md border-2 border-emerald-400"
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
                className={`bg-white p-4 sm:p-5 rounded-xl border-2 ${stat.border} shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02]`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {stat.label}
                    </p>
                    <p className={`text-lg sm:text-xl font-bold ${stat.textColor} mt-1`}>
                      {stat.value}
                    </p>
                  </div>
                  <div className={`${stat.iconBg} p-2.5 rounded-lg border-2 ${stat.border}`}>
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
              <div className="mt-4 bg-white px-4 sm:px-5 py-3 sm:py-4 rounded-xl border-2 border-gray-200 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-3">
                <span className="text-xs text-gray-500">
                  Showing{" "}
                  <span className="font-semibold text-gray-700">
                    {ordersIndexOfFirstItem + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-semibold text-gray-700">
                    {Math.min(ordersIndexOfLastItem, filteredOrders.length)}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-gray-700">
                    {filteredOrders.length}
                  </span>{" "}
                  orders
                </span>
                {renderPagination(
                  ordersCurrentPage,
                  ordersTotalPages,
                  ordersPaginate,
                  ordersNextPage,
                  ordersPrevPage,
                )}
              </div>
            )}
          </>
        ) : (
          <>
            {renderRequestFilters()}
            {renderRequestsList()}

            {/* Requests Pagination - SEPARATE */}
            {filteredRequests.length > 0 && (
              <div className="mt-4 bg-white px-4 sm:px-5 py-3 sm:py-4 rounded-xl border-2 border-gray-200 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-3">
                <span className="text-xs text-gray-500">
                  Showing{" "}
                  <span className="font-semibold text-gray-700">
                    {requestsIndexOfFirstItem + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-semibold text-gray-700">
                    {Math.min(requestsIndexOfLastItem, filteredRequests.length)}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-gray-700">
                    {filteredRequests.length}
                  </span>{" "}
                  requests
                </span>
                {renderPagination(
                  requestsCurrentPage,
                  requestsTotalPages,
                  requestsPaginate,
                  requestsNextPage,
                  requestsPrevPage,
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
      {renderReviewModal()}
    </div>
  );
};

export default Orders;