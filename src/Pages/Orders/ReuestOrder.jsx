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
  FaClock,
  FaCalendarAlt,
  FaInfoCircle,
  FaCheck,
  FaTimes as FaTimesIcon,
  FaHourglassHalf,
  FaGlobe,
  FaRegCalendarCheck,
  FaRegClock,
  FaTag,
  FaList,
  FaFileAlt,
  FaWhatsapp,
  FaHistory,
  FaEdit,
  FaSave,
} from "react-icons/fa";
import BASE_URL from "../../Utils/config";

// Toast Component
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const styles = {
    error: "bg-red-500",
    success: "bg-emerald-500",
    info: "bg-blue-500",
  };

  const icons = {
    error: <FaExclamationTriangle className="text-white" />,
    success: <FaCheckCircle className="text-white" />,
    info: <FaInfoCircle className="text-white" />,
  };

  return (
    <div className="fixed top-4 right-4 left-4 sm:left-auto z-50 animate-slide-in">
      <div
        className={`${styles[type]} text-white px-4 sm:px-6 py-3 sm:py-4 rounded-xl shadow-2xl max-w-md w-full sm:w-auto flex items-center gap-3`}
      >
        <div className="flex-shrink-0">{icons[type]}</div>
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

// Customer Request Status Modal
const CustomerRequestModal = ({ requestNumber, onClose, onRefresh }) => {
  const [loading, setLoading] = useState(true);
  const [request, setRequest] = useState(null);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [isAmending, setIsAmending] = useState(false);
  const [amendmentData, setAmendmentData] = useState({
    items: [],
    requestedDeliveryDate: "",
    notes: "",
    customerComment: "",
  });
  const [availableItems, setAvailableItems] = useState([]);
  const [newItem, setNewItem] = useState({ itemId: "", quantity: 1 });
  const [expandedSections, setExpandedSections] = useState({
    items: true,
    amendmentHistory: false,
    reviewInfo: false,
  });

  useEffect(() => {
    if (requestNumber) {
      fetchRequest();
      fetchAvailableItems();
    }
  }, [requestNumber]);

  useEffect(() => {
    if (isAmending && request) {
      setAmendmentData({
        items: request.items.map((item) => ({
          itemId: item.itemId,
          itemName: item.itemName,
          quantity: item.quantity,
          status: item.status,
          rejectionReason: item.rejectionReason || "",
        })),
        requestedDeliveryDate: request.requestedDeliveryDate
          ? new Date(request.requestedDeliveryDate).toISOString().split("T")[0]
          : "",
        notes: request.notes || "",
        customerComment: "",
      });
    }
  }, [isAmending, request]);

  const fetchRequest = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `${BASE_URL}/api/orders/public/requests/${requestNumber}`,
      );
      if (response.data.success) {
        setRequest(response.data.data);
      } else {
        setError(response.data.message || "Request not found");
      }
    } catch (error) {
      setError(error.response?.data?.message || "Failed to fetch request");
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableItems = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/items/public/items`);
      setAvailableItems(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch items:", error);
    }
  };

  const showToast = (message, type = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleAcceptRequest = async () => {
    if (!window.confirm("Are you sure you want to accept this request?"))
      return;
    setActionLoading(true);
    try {
      const response = await axios.patch(
        `${BASE_URL}/api/orders/${request._id}/accept`,
      );
      if (response.data.success) {
        showToast("Request accepted successfully!", "success");
        await fetchRequest();
        if (onRefresh) onRefresh();
      } else {
        showToast(response.data.message || "Failed to accept request", "error");
      }
    } catch (error) {
      showToast(
        error.response?.data?.message || "Failed to accept request",
        "error",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleAmendRequest = async (e) => {
    e.preventDefault();
    if (amendmentData.items.length === 0) {
      showToast("At least one item is required", "error");
      return;
    }
    setActionLoading(true);
    try {
      const payload = {
        items: amendmentData.items.map((item) => ({
          itemId: item.itemId,
          quantity: item.quantity,
        })),
        requestedDeliveryDate: amendmentData.requestedDeliveryDate,
        notes: amendmentData.notes,
        customerComment: amendmentData.customerComment,
      };
      const response = await axios.put(
        `${BASE_URL}/api/orders/${request._id}/amend`,
        payload,
      );
      if (response.data.success) {
        showToast("Amendments submitted successfully!", "success");
        setIsAmending(false);
        await fetchRequest();
        if (onRefresh) onRefresh();
      } else {
        showToast(
          response.data.message || "Failed to submit amendments",
          "error",
        );
      }
    } catch (error) {
      showToast(
        error.response?.data?.message || "Failed to submit amendments",
        "error",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const addAmendmentItem = () => {
    if (!newItem.itemId) {
      showToast("Please select an item", "error");
      return;
    }
    const selectedItem = availableItems.find(
      (item) => item._id === newItem.itemId,
    );
    if (!selectedItem) {
      showToast("Item not found", "error");
      return;
    }
    if (amendmentData.items.some((item) => item.itemId === newItem.itemId)) {
      showToast(`${selectedItem.name} is already in the list`, "error");
      return;
    }
    if (selectedItem.itemQuantity < newItem.quantity) {
      showToast(
        `Only ${selectedItem.itemQuantity} ${selectedItem.name} available`,
        "error",
      );
      return;
    }
    setAmendmentData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          itemId: selectedItem._id,
          itemName: selectedItem.name,
          quantity: newItem.quantity,
          status: "Pending",
          rejectionReason: "",
        },
      ],
    }));
    setNewItem({ itemId: "", quantity: 1 });
    showToast(`${selectedItem.name} added!`, "success");
  };

  const removeAmendmentItem = (index) => {
    setAmendmentData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const updateAmendmentItemQuantity = (index, quantity) => {
    if (quantity < 1) return;
    const updatedItems = [...amendmentData.items];
    updatedItems[index].quantity = quantity;
    setAmendmentData((prev) => ({ ...prev, items: updatedItems }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      "Pending Review": "bg-amber-100 text-amber-800 border-amber-200",
      "Awaiting Customer Confirmation":
        "bg-blue-100 text-blue-800 border-blue-200",
      Accepted: "bg-emerald-100 text-emerald-800 border-emerald-200",
      Converted: "bg-purple-100 text-purple-800 border-purple-200",
      Rejected: "bg-red-100 text-red-800 border-red-200",
      Cancelled: "bg-gray-100 text-gray-700 border-gray-200",
    };
    return statusMap[status] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  const getStatusDisplayName = (status) => {
    const nameMap = {
      "Pending Review": "Pending Review",
      "Awaiting Customer Confirmation": "Awaiting Your Confirmation",
      Accepted: "Accepted",
      Converted: "Converted to Order",
      Rejected: "Rejected",
      Cancelled: "Cancelled",
    };
    return nameMap[status] || status;
  };

  const getStatusIcon = (status) => {
    const iconMap = {
      "Pending Review": <FaClock className="w-5 h-5" />,
      "Awaiting Customer Confirmation": <FaHourglassHalf className="w-5 h-5" />,
      Accepted: <FaCheckCircle className="w-5 h-5" />,
      Converted: <FaCheckCircle className="w-5 h-5" />,
      Rejected: <FaTimesIcon className="w-5 h-5" />,
      Cancelled: <FaTimesIcon className="w-5 h-5" />,
    };
    return iconMap[status] || <FaInfoCircle className="w-5 h-5" />;
  };

  const getItemStatusBadge = (status) => {
    const statusMap = {
      Pending: "bg-amber-100 text-amber-700",
      Accepted: "bg-emerald-100 text-emerald-700",
      Rejected: "bg-red-100 text-red-700",
    };
    return statusMap[status] || "bg-gray-100 text-gray-700";
  };

  const getSourceBadge = (source) => {
    const sourceMap = {
      Website: "bg-indigo-100 text-indigo-800",
      WhatsApp: "bg-emerald-100 text-emerald-800",
      Manual: "bg-gray-100 text-gray-700",
    };
    return sourceMap[source] || "bg-gray-100 text-gray-700";
  };

  const getSourceIcon = (source) => {
    const iconMap = {
      Website: <FaGlobe className="w-3 h-3" />,
      WhatsApp: <FaWhatsapp className="w-3 h-3" />,
      Manual: <FaUser className="w-3 h-3" />,
    };
    return iconMap[source] || <FaInfoCircle className="w-3 h-3" />;
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl p-8 text-center">
          <div className="w-12 h-12 border-4 border-emerald-300 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your request...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaExclamationTriangle className="text-red-500 text-3xl" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">
            Request Not Found
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold py-2.5 px-6 rounded-xl hover:shadow-xl transition-all duration-300"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white px-4 sm:px-6 py-4 border-b border-gray-200 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl shadow-lg shadow-emerald-200 flex-shrink-0">
                <FaStore className="text-white text-lg" />
              </div>
              <div className="min-w-0">
                <h2 className="text-lg font-bold text-gray-800 truncate">
                  Request Status
                </h2>
                <p className="text-sm text-gray-500 font-mono truncate">
                  {request.requestNumber}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-gray-700 flex-shrink-0"
            >
              <FaTimes className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 space-y-6">
          {/* Status Badge */}
          <div className="flex flex-wrap items-center gap-3">
            {request.source && (
              <span
                className={`text-xs px-3 py-1 rounded-full font-medium ${getSourceBadge(request.source)} flex items-center gap-1`}
              >
                {getSourceIcon(request.source)}
                {request.source}
              </span>
            )}
            <span
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold border ${getStatusBadge(request.status)}`}
            >
              {getStatusIcon(request.status)}
              {getStatusDisplayName(request.status)}
            </span>
            {request.reviewCycle && request.reviewCycle > 1 && (
              <span className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-medium">
                Cycle {request.reviewCycle}
              </span>
            )}
          </div>

          {/* Status Messages */}
          {request.status === "Awaiting Customer Confirmation" &&
            !isAmending && (
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                <div className="flex flex-col sm:flex-row items-start gap-3">
                  <div className="p-2 bg-blue-100 rounded-full flex-shrink-0">
                    <FaInfoCircle className="text-blue-600 text-lg" />
                  </div>
                  <div className="flex-1 w-full">
                    <h3 className="text-sm font-semibold text-blue-800 mb-1">
                      Your Request Has Been Reviewed!
                    </h3>
                    <p className="text-sm text-blue-700">
                      Please review the changes below. You can either{" "}
                      <strong>Accept</strong> or <strong>Amend</strong> it.
                    </p>
                    <div className="flex flex-wrap gap-3 mt-4">
                      <button
                        onClick={handleAcceptRequest}
                        disabled={actionLoading}
                        className="px-5 py-2 bg-emerald-500 text-white font-semibold rounded-lg hover:bg-emerald-600 hover:shadow-lg transition-all duration-300 disabled:opacity-50 flex items-center gap-2 text-sm"
                      >
                        {actionLoading ? (
                          <FaSpinner className="animate-spin" />
                        ) : (
                          <FaCheck className="w-4 h-4" />
                        )}
                        Accept
                      </button>
                      <button
                        onClick={() => setIsAmending(true)}
                        disabled={actionLoading}
                        className="px-5 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 hover:shadow-lg transition-all duration-300 disabled:opacity-50 flex items-center gap-2 text-sm"
                      >
                        <FaEdit className="w-4 h-4" />
                        Amend
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

          {/* Amendment Form */}
          {isAmending && (
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
                  <FaEdit className="text-blue-500" />
                  Amend Request
                </h3>
                <button
                  onClick={() => setIsAmending(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimes className="text-lg" />
                </button>
              </div>
              <form onSubmit={handleAmendRequest}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Items <span className="text-red-500">*</span>
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2 mb-3">
                    <select
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm bg-white"
                      value={newItem.itemId}
                      onChange={(e) =>
                        setNewItem({ ...newItem, itemId: e.target.value })
                      }
                    >
                      <option value="">Select an item</option>
                      {availableItems.map((item) => (
                        <option key={item._id} value={item._id}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min="1"
                      className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm bg-white"
                      value={newItem.quantity}
                      onChange={(e) =>
                        setNewItem({
                          ...newItem,
                          quantity: parseInt(e.target.value) || 1,
                        })
                      }
                    />
                    <button
                      type="button"
                      onClick={addAmendmentItem}
                      className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-all duration-200 flex items-center gap-2 text-sm whitespace-nowrap"
                    >
                      <FaPlus className="w-3 h-3" />
                      Add
                    </button>
                  </div>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {amendmentData.items.map((item, index) => (
                      <div
                        key={index}
                        className="flex flex-wrap items-center justify-between p-2 bg-white rounded-lg border border-gray-200 gap-2"
                      >
                        <span className="font-medium text-gray-800 text-sm flex-1 min-w-[100px]">
                          {item.itemName}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              updateAmendmentItemQuantity(
                                index,
                                item.quantity - 1,
                              )
                            }
                            className="w-6 h-6 rounded bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
                          >
                            <FaMinus className="text-xs" />
                          </button>
                          <span className="w-8 text-center font-semibold text-sm">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              updateAmendmentItemQuantity(
                                index,
                                item.quantity + 1,
                              )
                            }
                            className="w-6 h-6 rounded bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
                          >
                            <FaPlus className="text-xs" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeAmendmentItem(index)}
                            className="text-red-400 hover:text-red-600 ml-1"
                          >
                            <FaTrash className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {amendmentData.items.length === 0 && (
                      <p className="text-sm text-gray-400 text-center py-2">
                        No items added yet.
                      </p>
                    )}
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    <FaCalendarAlt className="inline mr-1 text-gray-500" />
                    Requested Delivery Date{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full sm:w-64 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm bg-white"
                    value={amendmentData.requestedDeliveryDate}
                    onChange={(e) =>
                      setAmendmentData((prev) => ({
                        ...prev,
                        requestedDeliveryDate: e.target.value,
                      }))
                    }
                    required
                  />
                  {request.requestedDeliveryDate && (
                    <p className="text-xs text-gray-500 mt-1">
                      Previous: {formatDate(request.requestedDeliveryDate)}
                    </p>
                  )}
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    <FaStickyNote className="inline mr-1 text-gray-500" />
                    Comment to Staff
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none text-sm bg-white"
                    rows="2"
                    placeholder="Add any comments about your amendments..."
                    value={amendmentData.customerComment}
                    onChange={(e) =>
                      setAmendmentData((prev) => ({
                        ...prev,
                        customerComment: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setIsAmending(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-600 font-semibold rounded-lg hover:bg-gray-100 text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading || amendmentData.items.length === 0}
                    className="flex-1 px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                  >
                    {actionLoading ? (
                      <FaSpinner className="animate-spin" />
                    ) : (
                      <FaSave className="w-4 h-4" />
                    )}
                    Submit Amendments
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Customer Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <div className="flex items-center gap-3">
              <FaUser className="text-emerald-500 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-gray-400">Name</p>
                <p className="font-medium text-gray-800 text-sm truncate">
                  {request.customerName}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <FaPhone className="text-blue-500 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-gray-400">Phone</p>
                <p className="font-medium text-gray-800 text-sm truncate">
                  {request.customerPhone}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <FaCalendarAlt className="text-amber-500 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-gray-400">Requested Delivery</p>
                <p className="font-medium text-gray-800 text-sm truncate">
                  {request.requestedDeliveryDate
                    ? formatDate(request.requestedDeliveryDate)
                    : "N/A"}
                </p>
              </div>
            </div>
            {request.approvedDeliveryDate && (
              <div className="flex items-center gap-3 bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                <FaRegCalendarCheck className="text-emerald-500 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-emerald-600">Approved Delivery</p>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-emerald-700 text-sm">
                      {formatDate(request.approvedDeliveryDate)}
                    </p>
                    {request.deliveryDateChanged && (
                      <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                        Changed
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Items List */}
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <button
              onClick={() =>
                setExpandedSections((prev) => ({ ...prev, items: !prev.items }))
              }
              className="w-full p-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex flex-wrap items-center gap-2">
                <FaBoxOpen className="text-gray-500 flex-shrink-0" />
                <span className="font-semibold text-gray-700 text-sm">
                  Items ({request.items?.length || 0})
                </span>
                {request.status === "Awaiting Customer Confirmation" && (
                  <div className="flex items-center gap-1 ml-2 text-xs">
                    {request.items?.filter((i) => i.status === "Accepted")
                      .length > 0 && (
                      <span className="text-emerald-600 font-medium flex items-center gap-1">
                        <FaCheck className="w-3 h-3" />
                        {
                          request.items?.filter((i) => i.status === "Accepted")
                            .length
                        }
                      </span>
                    )}
                    {request.items?.filter((i) => i.status === "Rejected")
                      .length > 0 && (
                      <span className="text-red-600 font-medium flex items-center gap-1 ml-1">
                        <FaTimesIcon className="w-3 h-3" />
                        {
                          request.items?.filter((i) => i.status === "Rejected")
                            .length
                        }
                      </span>
                    )}
                  </div>
                )}
              </div>
              {expandedSections.items ? (
                <FaChevronUp className="text-gray-400" />
              ) : (
                <FaChevronDown className="text-gray-400" />
              )}
            </button>
            {expandedSections.items && (
              <div className="p-3 pt-0 space-y-2">
                {request.items?.map((item, index) => (
                  <div
                    key={index}
                    className={`flex flex-wrap justify-between items-center p-2 rounded-lg border gap-2 ${
                      item.status === "Accepted"
                        ? "border-emerald-200 bg-emerald-50"
                        : item.status === "Rejected"
                          ? "border-red-200 bg-red-50"
                          : "border-gray-200 bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-[100px]">
                      <FaTag className="text-gray-400 w-3 h-3 flex-shrink-0" />
                      <span className="font-medium text-gray-800 text-sm truncate">
                        {item.itemName}
                      </span>
                      <span className="text-xs text-gray-500 flex-shrink-0">
                        ×{item.quantity}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {item.status && (
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${getItemStatusBadge(item.status)}`}
                        >
                          {item.status}
                        </span>
                      )}
                      {item.status === "Rejected" && item.rejectionReason && (
                        <span
                          className="text-xs text-red-600 max-w-[150px] truncate"
                          title={item.rejectionReason}
                        >
                          ⚠️ {item.rejectionReason}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Review Information */}
          {request.reviewedBy && (
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <button
                onClick={() =>
                  setExpandedSections((prev) => ({
                    ...prev,
                    reviewInfo: !prev.reviewInfo,
                  }))
                }
                className="w-full p-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <FaFileAlt className="text-gray-500 flex-shrink-0" />
                  <span className="font-semibold text-gray-700 text-sm">
                    Review Information
                  </span>
                </div>
                {expandedSections.reviewInfo ? (
                  <FaChevronUp className="text-gray-400" />
                ) : (
                  <FaChevronDown className="text-gray-400" />
                )}
              </button>
              {expandedSections.reviewInfo && (
                <div className="p-3 pt-0 space-y-2 text-sm">
                  {request.reviewedBy && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <FaUser className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                      <span>
                        Reviewed by:{" "}
                        <span className="font-medium text-gray-800">
                          {request.reviewedBy?.name ||
                            request.reviewedBy?.fullName ||
                            "Staff"}
                        </span>
                      </span>
                    </div>
                  )}
                  {request.reviewedAt && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <FaRegClock className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                      <span>
                        Reviewed on:{" "}
                        <span className="font-medium text-gray-800">
                          {formatDateTime(request.reviewedAt)}
                        </span>
                      </span>
                    </div>
                  )}
                  {request.reviewNotes && (
                    <div className="mt-1 p-2 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-xs text-gray-400 uppercase font-medium mb-0.5">
                        Notes
                      </p>
                      <p className="text-sm text-gray-700">
                        {request.reviewNotes}
                      </p>
                    </div>
                  )}
                  {request.deliveryDateChangeReason && (
                    <div className="mt-1 p-2 bg-amber-50 rounded-lg border border-amber-200">
                      <p className="text-xs text-amber-600 uppercase font-medium mb-0.5">
                        Delivery Date Change Reason
                      </p>
                      <p className="text-sm text-amber-700">
                        {request.deliveryDateChangeReason}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Amendment History */}
          {request.amendmentHistory?.length > 0 && (
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <button
                onClick={() =>
                  setExpandedSections((prev) => ({
                    ...prev,
                    amendmentHistory: !prev.amendmentHistory,
                  }))
                }
                className="w-full p-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <FaHistory className="text-gray-500 flex-shrink-0" />
                  <span className="font-semibold text-gray-700 text-sm">
                    Amendment History ({request.amendmentHistory.length})
                  </span>
                </div>
                {expandedSections.amendmentHistory ? (
                  <FaChevronUp className="text-gray-400" />
                ) : (
                  <FaChevronDown className="text-gray-400" />
                )}
              </button>
              {expandedSections.amendmentHistory && (
                <div className="p-3 pt-0 space-y-3 max-h-[200px] overflow-y-auto">
                  {request.amendmentHistory.map((amendment, idx) => (
                    <div
                      key={idx}
                      className="bg-gray-50 p-3 rounded-lg border border-gray-200"
                    >
                      <div className="flex flex-wrap items-center justify-between mb-2 gap-2">
                        <span className="text-sm font-semibold text-gray-700">
                          Amendment #{amendment.cycle}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDateTime(amendment.amendedAt)}
                        </span>
                      </div>
                      {amendment.customerComment && (
                        <p className="text-sm text-gray-600 mb-2 bg-white p-2 rounded border border-gray-200">
                          💬 {amendment.customerComment}
                        </p>
                      )}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div>
                          <p className="text-gray-400 font-medium mb-0.5">
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
                              <p className="text-gray-400">No items</p>
                            )}
                          </div>
                        </div>
                        <div>
                          <p className="text-gray-400 font-medium mb-0.5">
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
                              <p className="text-gray-400">No items</p>
                            )}
                          </div>
                        </div>
                      </div>
                      {amendment.previousRequestedDeliveryDate && (
                        <div className="mt-2 pt-1 border-t border-gray-200 text-xs">
                          <div className="flex flex-wrap justify-between gap-1">
                            <span className="text-gray-400">
                              Previous Delivery:
                            </span>
                            <span className="text-gray-600">
                              {formatDate(
                                amendment.previousRequestedDeliveryDate,
                              )}
                            </span>
                          </div>
                          <div className="flex flex-wrap justify-between gap-1">
                            <span className="text-gray-400">New Delivery:</span>
                            <span className="text-gray-600">
                              {formatDate(amendment.newRequestedDeliveryDate)}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          {request.notes && (
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
              <div className="flex items-start gap-2">
                <FaStickyNote className="text-amber-500 flex-shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-xs text-amber-600 uppercase font-medium mb-0.5">
                    Notes
                  </p>
                  <p className="text-sm text-gray-700 break-words">
                    {request.notes}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Timeline */}
          {request.timeline?.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <FaList className="text-gray-500" />
                Timeline
              </h3>
              <div className="space-y-3 max-h-[200px] overflow-y-auto">
                {request.timeline.map((event, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="relative flex-shrink-0">
                      {index < request.timeline.length - 1 && (
                        <div className="absolute left-2 top-5 bottom-0 w-0.5 bg-gray-200"></div>
                      )}
                      <div
                        className={`w-3 h-3 rounded-full mt-1.5 ${
                          event.actor === "Customer"
                            ? "bg-blue-500"
                            : event.actor === "Staff"
                              ? "bg-emerald-500"
                              : "bg-gray-400"
                        }`}
                      ></div>
                    </div>
                    <div className="flex-1 pb-3 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <span className="font-medium text-gray-800 text-sm">
                          {event.action}
                        </span>
                        <span className="text-xs text-gray-400">
                          {formatDateTime(event.createdAt)}
                        </span>
                      </div>
                      {event.description && (
                        <p className="text-sm text-gray-600 mt-0.5 break-words">
                          {event.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Main ReuestOrder Component
const ReuestOrder = () => {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [requestedDeliveryDate, setRequestedDeliveryDate] = useState("");
  const [source, setSource] = useState("Website");
  const [submitted, setSubmitted] = useState(false);
  const [requestNumber, setRequestNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [activeTab, setActiveTab] = useState("items");
  const [showOrderPage, setShowOrderPage] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [modalRequestNumber, setModalRequestNumber] = useState("");
  const [checkNumber, setCheckNumber] = useState("");
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusError, setStatusError] = useState("");

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    setFilteredItems(
      searchTerm.trim() === ""
        ? items
        : items.filter((item) =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase().trim()),
          ),
    );
  }, [searchTerm, items]);

  const fetchItems = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/items/public/items`);
      setItems(res.data.data);
      setFilteredItems(res.data.data);
    } catch (err) {
      showToast("Failed to load items. Please refresh the page.", "error");
    }
  };

  const showToast = (message, type = "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const addToCart = (item) => {
    setCart((prevCart) => {
      const existing = prevCart.find((c) => c.itemId === item._id);
      if (existing) {
        return prevCart.map((c) =>
          c.itemId === item._id ? { ...c, quantity: c.quantity + 1 } : c,
        );
      }
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
          stock: item.itemQuantity,
        },
      ];
    });
  };

  const removeFromCart = (itemId) => {
    setCart((prev) => prev.filter((c) => c.itemId !== itemId));
  };

  const updateQuantity = (itemId, qty) => {
    if (qty <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCart((prev) =>
      prev.map((c) => {
        if (c.itemId === itemId) {
          if (qty > c.stock) {
            showToast(`Only ${c.stock} ${c.name}(s) available.`, "error");
            return c;
          }
          return { ...c, quantity: qty };
        }
        return c;
      }),
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!customerName.trim()) {
      showToast("Please enter your full name", "error");
      return;
    }
    if (!customerPhone.trim()) {
      showToast("Please enter your phone number", "error");
      return;
    }
    if (!/^[0-9+\-\s()]{10,15}$/.test(customerPhone.trim())) {
      showToast("Please enter a valid phone number (10-15 digits)", "error");
      return;
    }
    if (!requestedDeliveryDate) {
      showToast("Please select a delivery date", "error");
      return;
    }
    const selectedDate = new Date(requestedDeliveryDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      showToast("Delivery date cannot be in the past", "error");
      return;
    }
    if (cart.length === 0) {
      showToast("Please add at least one item to your request", "error");
      return;
    }
    for (const cartItem of cart) {
      const item = items.find((i) => i._id === cartItem.itemId);
      if (!item) {
        showToast(`Item ${cartItem.name} no longer exists.`, "error");
        return;
      }
      if (item.itemQuantity < cartItem.quantity) {
        showToast(
          `Only ${item.itemQuantity} ${item.name}(s) available.`,
          "error",
        );
        return;
      }
    }
    setLoading(true);
    try {
      const res = await axios.post(`${BASE_URL}/api/orders/addRequests`, {
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        requestedDeliveryDate,
        items: cart.map((c) => ({ itemId: c.itemId, quantity: c.quantity })),
        notes: notes.trim(),
        source,
      });
      setRequestNumber(res.data.data.requestNumber);
      setSubmitted(true);
      setCart([]);
      showToast("Request submitted successfully!", "success");
    } catch (error) {
      showToast(
        error.response?.data?.message || "Failed to submit request",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  const openRequestModal = (number) => {
    setModalRequestNumber(number);
    setShowRequestModal(true);
  };

  const closeRequestModal = () => {
    setShowRequestModal(false);
    setModalRequestNumber("");
  };

  const checkStatus = () => {
    if (!checkNumber.trim()) {
      setStatusError("Please enter a request number");
      return;
    }
    setStatusError("");
    openRequestModal(checkNumber.trim());
  };

  const resetForm = () => {
    setSubmitted(false);
    setCustomerName("");
    setCustomerPhone("");
    setNotes("");
    setRequestedDeliveryDate("");
    setCart([]);
    setShowOrderPage(false);
  };

  const goBackToWelcome = () => {
    setShowOrderPage(false);
    setCart([]);
    setCustomerName("");
    setCustomerPhone("");
    setNotes("");
    setRequestedDeliveryDate("");
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
    })
      .format(amount)
      .replace("TZS", "TSh");
  };

  // Welcome Page
  if (!showOrderPage && !submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center px-4 py-8">
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
        {showRequestModal && (
          <CustomerRequestModal
            requestNumber={modalRequestNumber}
            onClose={closeRequestModal}
            onRefresh={() => {}}
          />
        )}
        <div className="max-w-2xl w-full">
          <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-12 text-center border border-gray-100">
            <div className="w-24 h-24 sm:w-28 sm:h-28 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-200">
              <FaStore className="text-white text-4xl sm:text-5xl" />
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-gray-800 mb-2">
              UZA{" "}
              <span className="text-transparent bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text">
                ONLINE SHOP
              </span>
            </h1>
            <div className="h-1 w-20 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600 text-base sm:text-lg mb-1">
              Welcome to your trusted online store
            </p>
            <p className="text-gray-400 text-sm mb-8">
              Quality products, delivered with care
            </p>
            <div className="space-y-4">
              <button
                onClick={() => {
                  setShowOrderPage(true);
                  fetchItems();
                }}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold py-4 px-6 rounded-xl hover:shadow-xl hover:shadow-emerald-200 transition-all duration-300 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 text-base sm:text-lg"
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
                  <span className="px-4 bg-white text-gray-400">
                    or track your request
                  </span>
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 sm:p-5 border border-gray-200">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <div className="flex items-center gap-2 text-gray-600 flex-shrink-0">
                    <div className="p-2 bg-emerald-100 rounded-lg flex-shrink-0">
                      <FaSearch className="text-emerald-600" />
                    </div>
                    <span className="text-sm font-medium whitespace-nowrap">
                      Track Request
                    </span>
                  </div>
                  <div className="flex-1 w-full flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      placeholder="Enter request number (e.g., REQ-20260115-0001)"
                      value={checkNumber}
                      onChange={(e) => setCheckNumber(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && checkStatus()}
                      className="flex-1 w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 outline-none transition-all text-sm bg-white"
                    />
                    <button
                      onClick={checkStatus}
                      disabled={statusLoading}
                      className="w-full sm:w-auto px-4 sm:px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium rounded-lg hover:shadow-lg hover:shadow-emerald-200 transition-all duration-300 hover:scale-[1.02] active:scale-95 disabled:opacity-50 text-sm whitespace-nowrap flex items-center justify-center gap-2"
                    >
                      {statusLoading ? (
                        <FaSpinner className="animate-spin" />
                      ) : (
                        <>
                          <FaSearch className="w-4 h-4" />
                          Check Status
                        </>
                      )}
                    </button>
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-400 text-left">
                  💡 Enter your request number to track its status
                </div>
                {statusError && (
                  <div className="mt-3 text-red-600 text-sm flex items-center gap-2 bg-red-50 p-2 rounded-lg border border-red-200">
                    <FaExclamationTriangle className="w-4 h-4 flex-shrink-0" />
                    {statusError}
                  </div>
                )}
              </div>
            </div>
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center px-4 py-8">
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-6 sm:p-10 text-center border border-gray-100">
          <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-200 animate-bounce">
            <FaCheckCircle className="text-white text-5xl" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
            Request Submitted! 🎉
          </h2>
          <p className="text-gray-600 mb-1">Your request number:</p>
          <p className="text-xl sm:text-2xl font-mono font-bold text-transparent bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text mb-4 break-all">
            {requestNumber}
          </p>
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-5 mb-8 border border-emerald-200">
            <p className="text-sm text-gray-700">
              📌 Save this number to check your order status later.
            </p>
            <button
              onClick={() => openRequestModal(requestNumber)}
              className="mt-3 text-sm text-emerald-600 font-medium hover:text-emerald-700 transition-colors flex items-center gap-2 mx-auto"
            >
              <FaSearch className="w-4 h-4" />
              Track this request
            </button>
          </div>
          <button
            onClick={resetForm}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold py-3.5 px-6 rounded-xl hover:shadow-xl hover:shadow-emerald-200 transition-all duration-300 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
          >
            <FaPlus className="w-4 h-4" />
            Place Another Request
          </button>
        </div>
      </div>
    );
  }

  // Main Order Page
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      {showRequestModal && (
        <CustomerRequestModal
          requestNumber={modalRequestNumber}
          onClose={closeRequestModal}
        />
      )}

      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
              <button
                onClick={goBackToWelcome}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-600 hover:text-gray-800 flex-shrink-0"
              >
                <FaArrowLeft className="text-base sm:text-lg" />
              </button>
              <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl shadow-lg shadow-emerald-200 flex-shrink-0">
                <FaStore className="text-white text-lg sm:text-xl" />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-2xl font-bold text-gray-800 truncate">
                  Order Request
                </h1>
                <p className="text-[10px] sm:text-xs text-gray-500 hidden sm:block">
                  Submit your request for review
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsCartOpen(!isCartOpen)}
              className="lg:hidden relative bg-emerald-50 px-3 sm:px-4 py-2 rounded-full border border-emerald-200 flex items-center gap-2 hover:bg-emerald-100 transition-colors flex-shrink-0"
            >
              <FaShoppingCart className="text-emerald-600" />
              <span className="font-semibold text-emerald-700">
                {cart.length}
              </span>
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></span>
              )}
            </button>
            {cart.length > 0 && (
              <div className="hidden lg:flex items-center gap-3 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-200">
                <FaShoppingCart className="text-emerald-600" />
                <span className="font-semibold text-emerald-700">
                  {cart.length} item{cart.length !== 1 ? "s" : ""}
                </span>
                <span className="w-px h-4 bg-emerald-300"></span>
                <span className="font-bold text-emerald-700">
                  {formatCurrency(cartTotal)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-8xl mx-auto px-4 sm:px-6 py-4 sm:py-6 lg:py-10">
        {/* Mobile/Tablet Tabs */}
        <div className="lg:hidden mb-6">
          <div className="bg-white rounded-2xl shadow-md p-1 flex gap-1">
            <button
              onClick={() => setActiveTab("items")}
              className={`flex-1 py-3 px-4 rounded-xl font-medium text-sm transition-all duration-300 ${
                activeTab === "items"
                  ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-200"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <FaBoxOpen className="text-sm" />
                Items
                <span className="text-xs opacity-75">
                  ({filteredItems.length})
                </span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab("cart")}
              className={`flex-1 py-3 px-4 rounded-xl font-medium text-sm transition-all duration-300 ${
                activeTab === "cart"
                  ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-200"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <FaShoppingCart className="text-sm" />
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
            <div className="bg-white rounded-2xl shadow-md p-4 sm:p-6 mb-6 border border-gray-100">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2 text-gray-700">
                  <div className="p-2 bg-emerald-100 rounded-lg flex-shrink-0">
                    <FaSearch className="text-emerald-600" />
                  </div>
                  <span className="text-base font-semibold">
                    Track Your Request
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    placeholder="Enter request number (e.g., REQ-20260115-0001)"
                    value={checkNumber}
                    onChange={(e) => setCheckNumber(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && checkStatus()}
                    className="flex-1 w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 outline-none transition-all text-sm bg-white"
                  />
                  <button
                    onClick={checkStatus}
                    disabled={statusLoading}
                    className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-emerald-200 transition-all duration-300 hover:scale-[1.02] active:scale-95 disabled:opacity-50 text-sm whitespace-nowrap flex items-center justify-center gap-2"
                  >
                    {statusLoading ? (
                      <FaSpinner className="animate-spin" />
                    ) : (
                      <>
                        <FaSearch className="w-4 h-4" />
                        Check Status
                      </>
                    )}
                  </button>
                </div>
                <div className="text-xs text-gray-400">
                  💡 Enter your request number to check its current status
                </div>
              </div>
              {statusError && (
                <div className="mt-4 text-red-600 text-sm flex items-center gap-2 bg-red-50 p-3 rounded-lg border border-red-200">
                  <FaExclamationTriangle className="w-4 h-4 flex-shrink-0" />
                  {statusError}
                </div>
              )}
            </div>

            {/* Items Grid */}
            <div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                    Available Items
                  </h2>
                  <p className="text-sm text-gray-500">
                    Select items to add to your request
                  </p>
                </div>
                <span className="text-sm text-gray-400 bg-white px-4 py-1.5 rounded-full border border-gray-200 whitespace-nowrap">
                  {filteredItems.length} items
                </span>
              </div>

              <div className="mb-6">
                <div className="relative">
                  <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search items by name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-12 py-3.5 rounded-xl border border-gray-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 outline-none transition-all bg-white text-sm"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <FaTimes className="text-sm" />
                    </button>
                  )}
                </div>
                {searchTerm && filteredItems.length === 0 && (
                  <p className="mt-3 text-sm text-gray-500 bg-amber-50 p-3 rounded-lg border border-amber-200">
                    No items found matching
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredItems.map((item) => (
                  <div
                    key={item._id}
                    className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-emerald-300 overflow-hidden"
                  >
                    <div className="p-4 sm:p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-semibold text-gray-800 group-hover:text-emerald-600 transition-colors truncate">
                            {item.name}
                          </h3>
                        </div>
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100">
                          <FaBoxOpen className="text-lg text-emerald-500" />
                        </div>
                      </div>
                      <div className="mb-4">
                        <p className="text-2xl font-bold text-gray-900">
                          {formatCurrency(item.price)}
                        </p>
                        {item.enableWholesale && item.wholesalePrice > 0 && (
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
                              Wholesale
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatCurrency(item.wholesalePrice)} (min{" "}
                              {item.wholesaleMinQty})
                            </span>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => addToCart(item)}
                        className="w-full font-semibold py-3 px-4 rounded-xl transition-all duration-300 bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:shadow-lg hover:shadow-emerald-200 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 text-sm"
                      >
                        <FaPlus className="text-xs" />
                        Add to Request
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {cart.length === 0 &&
                items.length > 0 &&
                filteredItems.length === 0 &&
                searchTerm && (
                  <div className="text-center py-16">
                    <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FaSearch className="text-gray-400 text-4xl" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">
                      No items found
                    </h3>
                    <p className="text-sm text-gray-400">
                      Try adjusting your search term
                    </p>
                    <button
                      onClick={() => setSearchTerm("")}
                      className="mt-4 text-emerald-600 font-medium hover:text-emerald-700 transition-colors text-sm"
                    >
                      Clear search
                    </button>
                  </div>
                )}
            </div>
          </div>

          {/* Right Column - Cart (Desktop) */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-24">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2.5 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-xl shadow-lg shadow-emerald-200">
                    <FaShoppingCart className="text-white text-xl" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">
                    Your Request
                  </h2>
                  <span className="ml-auto bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm font-semibold">
                    {cart.length}
                  </span>
                </div>

                {cart.length === 0 ? (
                  <div className="text-center py-12">
                    <FaShoppingCart className="text-gray-300 text-5xl mx-auto mb-4" />
                    <p className="text-gray-400 font-medium">
                      Your cart is empty
                    </p>
                    <p className="text-gray-400 text-sm mt-1">
                      Add items from the list
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
                            className="p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-emerald-200 transition-colors"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <span className="font-medium text-gray-700 text-sm flex-1">
                                {c.name}
                              </span>
                              <button
                                type="button"
                                onClick={() => removeFromCart(c.itemId)}
                                className="text-red-400 hover:text-red-600 transition-colors ml-2 flex-shrink-0 p-1 hover:bg-red-50 rounded-lg"
                              >
                                <FaTrash className="text-xs" />
                              </button>
                            </div>
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateQuantity(c.itemId, c.quantity - 1)
                                  }
                                  className="w-8 h-8 rounded-lg bg-white border border-gray-200 hover:bg-gray-100 hover:border-emerald-300 transition-all flex items-center justify-center"
                                >
                                  <FaMinus className="text-xs text-gray-600" />
                                </button>
                                <input
                                  type="number"
                                  min="1"
                                  max={c.stock}
                                  value={c.quantity}
                                  onChange={(e) =>
                                    updateQuantity(
                                      c.itemId,
                                      parseInt(e.target.value) || 1,
                                    )
                                  }
                                  className="w-14 text-center py-1.5 rounded-lg border border-gray-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 outline-none text-sm font-medium"
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateQuantity(c.itemId, c.quantity + 1)
                                  }
                                  disabled={c.quantity >= c.stock}
                                  className={`w-8 h-8 rounded-lg bg-white border border-gray-200 hover:bg-gray-100 hover:border-emerald-300 transition-all flex items-center justify-center ${
                                    c.quantity >= c.stock
                                      ? "opacity-50 cursor-not-allowed"
                                      : ""
                                  }`}
                                >
                                  <FaPlus className="text-xs text-gray-600" />
                                </button>
                              </div>
                              <span className="text-sm font-bold text-gray-800">
                                {formatCurrency(itemTotal)}
                              </span>
                            </div>
                            <div className="mt-2 text-[10px] text-gray-400 flex justify-end">
                              Stock: {c.stock} units
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-4 mb-4 border border-emerald-200">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 font-medium">Total</span>
                        <span className="text-2xl font-bold text-transparent bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text">
                          {formatCurrency(cartTotal)}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3.5">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          <FaUser className="inline mr-1" /> Full Name{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input
                            type="text"
                            placeholder="e.g., Kibuyu Shop"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            required
                            className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 outline-none transition-all text-sm bg-white"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          <FaPhone className="inline mr-1" /> Phone Number{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <FaPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input
                            type="tel"
                            placeholder="e.g., 0712345678"
                            value={customerPhone}
                            onChange={(e) => setCustomerPhone(e.target.value)}
                            required
                            className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 outline-none transition-all text-sm bg-white"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          <FaCalendarAlt className="inline mr-1" /> Preferred
                          Delivery Date <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <FaCalendarAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input
                            type="date"
                            min={new Date().toISOString().split("T")[0]}
                            value={requestedDeliveryDate}
                            onChange={(e) =>
                              setRequestedDeliveryDate(e.target.value)
                            }
                            required
                            className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 outline-none transition-all text-sm bg-white"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          <FaStickyNote className="inline mr-1" /> Additional
                          Notes
                        </label>
                        <div className="relative">
                          <FaStickyNote className="absolute left-4 top-4 text-gray-400" />
                          <textarea
                            placeholder="Any special instructions or comments..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows="2"
                            className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 outline-none transition-all resize-none text-sm bg-white"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          <FaInfoCircle className="inline mr-1" /> How did you
                          find us?
                        </label>
                        <div className="relative">
                          <FaInfoCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                          <select
                            value={source}
                            onChange={(e) => setSource(e.target.value)}
                            className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 outline-none transition-all text-sm appearance-none bg-white"
                          >
                            <option value="Website">Website</option>
                            <option value="WhatsApp">WhatsApp</option>
                            <option value="Manual">Manual</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full mt-6 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold py-4 px-6 rounded-xl hover:shadow-xl hover:shadow-emerald-200 transition-all duration-300 hover:scale-[1.02] active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 text-base"
                    >
                      {loading ? (
                        <>
                          <FaSpinner className="animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          Submit Request <FaArrowRight className="text-sm" />
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
        className={`lg:hidden fixed inset-0 z-50 transition-all duration-400 ${isCartOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
      >
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={() => setIsCartOpen(false)}
        ></div>
        <div
          className={`absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl transition-transform duration-400 ease-out ${isCartOpen ? "translate-y-0" : "translate-y-full"}`}
          style={{ maxHeight: "92vh" }}
        >
          <div className="flex justify-center pt-4 pb-2">
            <div className="w-12 h-1.5 bg-gray-300 rounded-full"></div>
          </div>
          <div
            className="px-4 sm:px-6 pb-6 overflow-y-auto"
            style={{ maxHeight: "calc(92vh - 20px)" }}
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2.5 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-xl shadow-lg shadow-emerald-200 flex-shrink-0">
                  <FaShoppingCart className="text-white text-xl" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">
                    Your Request
                  </h2>
                  <p className="text-xs text-gray-500">
                    {cart.length} item{cart.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
              >
                <FaTimes className="text-gray-500 text-lg" />
              </button>
            </div>

            {cart.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaShoppingCart className="text-gray-300 text-4xl" />
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
                        className="p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-emerald-200 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <span className="font-medium text-gray-700 text-sm flex-1">
                            {c.name}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeFromCart(c.itemId)}
                            className="text-red-400 hover:text-red-600 transition-colors ml-2 flex-shrink-0 p-1 hover:bg-red-50 rounded-lg"
                          >
                            <FaTrash className="text-sm" />
                          </button>
                        </div>
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(c.itemId, c.quantity - 1)
                              }
                              className="w-9 h-9 rounded-lg bg-white border border-gray-200 hover:bg-gray-100 hover:border-emerald-300 transition-all flex items-center justify-center"
                            >
                              <FaMinus className="text-xs text-gray-600" />
                            </button>
                            <span className="w-10 text-center font-semibold text-gray-700 text-sm">
                              {c.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(c.itemId, c.quantity + 1)
                              }
                              disabled={c.quantity >= c.stock}
                              className={`w-9 h-9 rounded-lg bg-white border border-gray-200 hover:bg-gray-100 hover:border-emerald-300 transition-all flex items-center justify-center ${
                                c.quantity >= c.stock
                                  ? "opacity-50 cursor-not-allowed"
                                  : ""
                              }`}
                            >
                              <FaPlus className="text-xs text-gray-600" />
                            </button>
                          </div>
                          <span className="text-sm font-bold text-gray-800">
                            {formatCurrency(itemTotal)}
                          </span>
                        </div>
                        <div className="mt-1 text-[10px] text-gray-400 text-right">
                          Stock: {c.stock} units
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-4 mb-4 border border-emerald-200">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 font-medium">Total</span>
                    <span className="text-2xl font-bold text-transparent bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text">
                      {formatCurrency(cartTotal)}
                    </span>
                  </div>
                </div>

                <div className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      <FaUser className="inline mr-1" /> Full Name{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="e.g., John Doe"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        required
                        className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 outline-none transition-all text-sm bg-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      <FaPhone className="inline mr-1" /> Phone Number{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <FaPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="tel"
                        placeholder="e.g., 0712345678"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        required
                        className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 outline-none transition-all text-sm bg-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      <FaCalendarAlt className="inline mr-1" /> Preferred
                      Delivery Date <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <FaCalendarAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="date"
                        min={new Date().toISOString().split("T")[0]}
                        value={requestedDeliveryDate}
                        onChange={(e) =>
                          setRequestedDeliveryDate(e.target.value)
                        }
                        required
                        className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 outline-none transition-all text-sm bg-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      <FaStickyNote className="inline mr-1" /> Additional Notes
                    </label>
                    <div className="relative">
                      <FaStickyNote className="absolute left-4 top-4 text-gray-400" />
                      <textarea
                        placeholder="Any special instructions or comments..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows="2"
                        className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 outline-none transition-all resize-none text-sm bg-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      <FaInfoCircle className="inline mr-1" /> How did you find
                      us?
                    </label>
                    <div className="relative">
                      <FaInfoCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <select
                        value={source}
                        onChange={(e) => setSource(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 outline-none transition-all text-sm appearance-none bg-white"
                      >
                        <option value="Website">Website</option>
                        <option value="WhatsApp">WhatsApp</option>
                        <option value="Manual">Manual</option>
                      </select>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-6 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold py-4 px-6 rounded-xl hover:shadow-xl hover:shadow-emerald-200 transition-all duration-300 hover:scale-[1.02] active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 text-base"
                >
                  {loading ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit Request <FaArrowRight className="text-sm" />
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
