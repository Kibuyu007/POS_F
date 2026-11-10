import { useState, useEffect } from "react";
import {
  FaSearch,
  FaBox,
  FaChevronDown,
  FaChevronUp,
  FaTags,
  FaExclamationTriangle,
} from "react-icons/fa";
import { FiRefreshCw, FiEdit3, FiX, FiCheckCircle } from "react-icons/fi";
import { MdOutlineInventory2, MdWarning } from "react-icons/md";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import BASE_URL from "../../../../Utils/config";
import Loading from "../../../../Components/Shared/Loading";
import toast from "react-hot-toast";
import axios from "axios";

const Adjustment = () => {
  // --- STATE ---
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [load, setLoad] = useState(false);
  const [expandedItem, setExpandedItem] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Form State
  const [adjustType, setAdjustType] = useState("IN");
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("Correction");
  const [narration, setNarration] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // --- FETCH ITEMS ---
  const fetchItems = async () => {
    try {
      setLoad(true);
      const response = await fetch(`${BASE_URL}/api/items/getAllItems`);
      if (!response.ok) throw new Error("Failed to fetch items");

      const result = await response.json();
      setItems(result.data || []);
    } catch (err) {
      toast.error("Failed to load items");
      console.error(err);
    } finally {
      setLoad(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // --- FILTERING & PAGINATION ---
  const filteredItems = items.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.barCode.includes(searchTerm),
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
    setExpandedItem(null);
  }, [searchTerm]);

  // --- HANDLE ADJUSTMENT ---
  const handleAdjustmentSubmit = async (e) => {
    e.preventDefault();
    if (!quantity || Number(quantity) <= 0)
      return toast.error("Please enter a valid quantity");
    if (!reason) return toast.error("Please select a reason");

    try {
      setIsSubmitting(true);

      const payload = {
        type: adjustType,
        quantity: Number(quantity),
        reason,
        narration:
          narration ||
          `Manual stock adjustment (${adjustType}) - Reason: ${reason}`,
      };

      const response = await axios.post(
        `${BASE_URL}/api/items/adjust-stock/${selectedItem._id}`,
        payload,
        { withCredentials: true },
      );

      if (response.data.success) {
        toast.success(
          `Successfully adjusted ${selectedItem.name} by ${adjustType === "IN" ? "+" : "-"}${quantity}`,
        );
        setIsModalOpen(false);
        fetchItems();
      } else {
        toast.error(response.data.message || "Failed to adjust stock");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openModal = (item) => {
    setSelectedItem(item);
    setAdjustType("IN");
    setQuantity("");
    setReason("Correction");
    setNarration("");
    setIsModalOpen(true);
  };

  // Pagination Renderer
  const renderPagination = () => {
    if (totalPages <= 1) return null;
    let startPage = Math.max(1, currentPage - 4);
    let endPage = Math.min(totalPages, startPage + 8);
    if (endPage - startPage < 8) startPage = Math.max(1, endPage - 8);

    const pages = [];
    for (let i = startPage; i <= endPage; i++) pages.push(i);

    return (
      <div className="flex flex-col sm:flex-row justify-between items-center mt-4 bg-white px-3 sm:px-5 py-3 rounded-xl border-2 border-gray-200 shadow-sm gap-3">
        <span className="text-[10px] sm:text-xs text-gray-500 text-center sm:text-left">
          Showing{" "}
          <span className="font-semibold text-gray-700">
            {indexOfFirstItem + 1}
          </span>{" "}
          to{" "}
          <span className="font-semibold text-gray-700">
            {Math.min(indexOfLastItem, filteredItems.length)}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-gray-700">
            {filteredItems.length}
          </span>{" "}
          items
        </span>

        <div className="flex items-center gap-1.5 flex-wrap justify-center">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              currentPage === 1
                ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                : "bg-white border-2 border-gray-300 text-gray-600 hover:bg-gray-100 hover:border-gray-400 shadow-sm"
            }`}
          >
            <IoIosArrowBack className="w-4 h-4" />
          </button>

          {startPage > 1 && (
            <>
              <button
                onClick={() => setCurrentPage(1)}
                className="px-3.5 py-2 rounded-lg text-sm font-medium bg-white border-2 border-gray-300 text-gray-600 hover:bg-gray-100 shadow-sm"
              >
                1
              </button>
              {startPage > 2 && <span className="text-gray-400">...</span>}
            </>
          )}

          {pages.map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium shadow-sm border-2 transition-all ${
                currentPage === page
                  ? "bg-green-300 text-black border-green-300 hover:bg-green-400"
                  : "bg-white border-gray-300 text-gray-600 hover:bg-gray-100"
              }`}
            >
              {page}
            </button>
          ))}

          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && (
                <span className="text-gray-400">...</span>
              )}
              <button
                onClick={() => setCurrentPage(totalPages)}
                className="px-3.5 py-2 rounded-lg text-sm font-medium bg-white border-2 border-gray-300 text-gray-600 hover:bg-gray-100 shadow-sm"
              >
                {totalPages}
              </button>
            </>
          )}

          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              currentPage === totalPages
                ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                : "bg-white border-2 border-gray-300 text-gray-600 hover:bg-gray-100 hover:border-gray-400 shadow-sm"
            }`}
          >
            <IoIosArrowForward className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-8xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
        <Loading load={load} />

        {/* ================= HEADER ================= */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 sm:mb-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-300 rounded-xl flex items-center justify-center shadow-lg shadow-green-200 border-2 border-green-400">
              <MdOutlineInventory2 className="w-5 h-5 sm:w-6 sm:h-6 text-black" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 tracking-tight">
                Stock Adjustments
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">
                Manage inventory corrections, damages, and stock counts
              </p>
            </div>
          </div>
          <button
            onClick={fetchItems}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-100 font-semibold rounded-xl transition-all duration-200 shadow-sm text-xs sm:text-sm"
          >
            <FiRefreshCw
              className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${load ? "animate-spin" : ""}`}
            />
            <span className="hidden xs:inline">Refresh</span>
          </button>
        </div>

        {/* ================= SEARCH BAR ================= */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-5">
          <div className="relative w-full sm:w-72">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-black/50 w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <input
              type="text"
              placeholder="Search by item name or barcode..."
              className="w-full pl-8 sm:pl-9 pr-8 py-2 sm:py-2.5 bg-white border-2 border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1 transition-all duration-200 text-black placeholder:text-black/50 text-xs sm:text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-black/40 hover:text-black/70"
              >
                <FiX className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            )}
          </div>
          <span className="text-[10px] sm:text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full border border-gray-200">
            {filteredItems.length} items found
          </span>
        </div>

        {/* ================= ROWS (Matches Items.jsx Style) ================= */}
        <div className="space-y-2.5 sm:space-y-3">
          {currentItems.length === 0 ? (
            <div className="bg-gray-100 rounded-2xl border-2 border-gray-300 shadow-sm py-12 text-center">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3 border-2 border-gray-300">
                <FaBox className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-sm font-medium text-gray-700">
                No items found
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Try adjusting your search
              </p>
            </div>
          ) : (
            currentItems.map((item) => {
              const isExpanded = expandedItem === item._id;

              // Determine dynamic styling based on stock level
              const isLowStock = item.itemQuantity <= 5; // Adjust this logic to match your reOrder logic

              return (
                <div
                  key={item._id}
                  className="bg-white rounded-xl border-2 border-gray-200 shadow-sm hover:shadow-lg hover:border-green-300 transition-all duration-300 overflow-hidden"
                >
                  {/* Row Header (Clickable) */}
                  <div
                    className={`p-3 sm:p-4 cursor-pointer ${
                      isLowStock
                        ? "bg-gradient-to-r from-red-100 to-red-200"
                        : "bg-gradient-to-r from-green-100 to-green-200"
                    }`}
                    onClick={() =>
                      setExpandedItem(isExpanded ? null : item._id)
                    }
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="w-10 h-10 sm:w-11 sm:h-11 bg-white rounded-full flex items-center justify-center shadow-sm border-2 border-gray-200 flex-shrink-0">
                          <FaBox
                            className={
                              isLowStock ? "text-red-600" : "text-green-600"
                            }
                            size={20}
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm sm:text-base font-bold text-black truncate">
                            {item.name}
                          </p>
                          <p className="text-[10px] sm:text-xs text-gray-600">
                            {item.barCode} • {item.itemQuantity} units
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
                        <span
                          className={`px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-bold border ${
                            isLowStock
                              ? "bg-red-100 text-red-700 border-red-200"
                              : "bg-green-300 text-black border-green-400"
                          }`}
                        >
                          {isLowStock ? (
                            <FaExclamationTriangle className="inline mr-1 w-3 h-3" />
                          ) : null}
                          {isLowStock ? "Low Stock" : "In Stock"}
                        </span>
                        {isExpanded ? (
                          <FaChevronUp className="text-gray-500" size={20} />
                        ) : (
                          <FaChevronDown className="text-gray-500" size={20} />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="p-4 sm:p-5 border-t-2 border-gray-200">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                          <p className="text-xs text-gray-500 font-medium">
                            Barcode
                          </p>
                          <p className="text-sm font-bold text-black">
                            {item.barCode}
                          </p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                          <p className="text-xs text-gray-500 font-medium">
                            Category
                          </p>
                          <p className="text-sm font-bold text-black flex items-center gap-1">
                            <FaTags className="text-gray-400 w-3 h-3" />
                            {item.category?.name || "N/A"}
                          </p>
                        </div>
                        <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                          <p className="text-xs text-green-600 font-medium">
                            Sell Price
                          </p>
                          <p className="text-sm font-bold text-green-700">
                            {(item.price || 0).toLocaleString()}
                          </p>
                        </div>
                        <div
                          className={`rounded-lg p-3 border ${isLowStock ? "bg-red-50 border-red-200" : "bg-blue-50 border-blue-200"}`}
                        >
                          <p className="text-xs text-gray-500 font-medium">
                            Current Qty
                          </p>
                          <p
                            className={`text-sm font-bold ${isLowStock ? "text-red-600" : "text-black"}`}
                          >
                            {item.itemQuantity}
                          </p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t-2 border-gray-200">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openModal(item);
                          }}
                          className="flex-1 sm:flex-none px-4 py-2 bg-green-300 hover:bg-green-400 text-black font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-2 border border-green-400"
                        >
                          <FiEdit3 className="w-4 h-4" />
                          Adjust Stock Now
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* ================= PAGINATION ================= */}
        {renderPagination()}
      </div>

      {/* ================= ADJUSTMENT MODAL ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-4 border-b-2 border-gray-100 bg-gradient-to-r from-yellow-200 via-yellow-100 to-white">
              <h2 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                <MdWarning className="text-yellow-600 w-5 h-5" />
                Adjust Stock
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-800 transition-colors bg-white/50 rounded-full p-1"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleAdjustmentSubmit} className="p-5">
              {/* Item Info */}
              <div className="bg-gray-50 p-3 rounded-xl border-2 border-gray-200 mb-5">
                <p className="text-xs text-gray-500 font-bold uppercase mb-1">
                  Selected Item
                </p>
                <p className="font-bold text-gray-800">{selectedItem?.name}</p>
                <div className="flex justify-between mt-2 pt-2 border-t-2 border-gray-200">
                  <span className="text-sm text-gray-600 font-medium">
                    Current Balance:
                  </span>
                  <span className="font-extrabold text-black text-lg">
                    {selectedItem?.itemQuantity}
                  </span>
                </div>
              </div>

              {/* Type Selection */}
              <div className="flex gap-2 mb-5">
                <button
                  type="button"
                  onClick={() => setAdjustType("IN")}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${
                    adjustType === "IN"
                      ? "bg-green-300 border-green-400 text-black shadow-inner"
                      : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  + Stock In
                </button>
                <button
                  type="button"
                  onClick={() => setAdjustType("OUT")}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${
                    adjustType === "OUT"
                      ? "bg-red-200 border-red-400 text-red-900 shadow-inner"
                      : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  - Stock Out
                </button>
              </div>

              {/* Quantity & Reason */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Quantity <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:border-yellow-400 font-bold text-lg text-black placeholder-gray-400 transition-all"
                    placeholder="Enter quantity"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Reason <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:border-yellow-400 font-medium text-black transition-all"
                  >
                    <option value="Correction">Stock Count Correction</option>
                    <option value="Damage">Damaged / Broken</option>
                    <option value="Expiry">Expired Item</option>
                    <option value="Theft">Lost / Theft</option>
                    <option value="Return">Customer Return</option>
                    <option value="Other">Other (Specify below)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Additional Notes (Optional)
                  </label>
                  <textarea
                    rows="2"
                    value={narration}
                    onChange={(e) => setNarration(e.target.value)}
                    className="w-full px-4 py-2 bg-white border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:border-yellow-400 text-sm text-black placeholder-gray-400 transition-all"
                    placeholder="Provide more details..."
                  ></textarea>
                </div>
              </div>

              {/* Submit Button */}
              <div className="mt-6">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-3 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2
                    ${adjustType === "IN" ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"}
                    ${isSubmitting ? "opacity-70 cursor-not-allowed" : "hover:-translate-y-0.5"}
                  `}
                >
                  {isSubmitting ? (
                    "Processing..."
                  ) : (
                    <>
                      <FiCheckCircle className="w-5 h-5" />
                      Confirm Adjustment
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Adjustment;
