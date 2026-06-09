import axios from "axios";
import { useState, useEffect } from "react";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import {
  FiSearch,
  FiRefreshCw,
  FiPackage,
  FiChevronDown,
  FiChevronUp,
  FiBox,
  FiFilter,
  FiX,
} from "react-icons/fi";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import Loading from "../../../../Components/Shared/Loading";
import BASE_URL from "../../../../Utils/config";
import toast from "react-hot-toast";

const CompletedNonPO = () => {
  const [grns, setGrns] = useState([]);
  const [filteredGrns, setFilteredGrns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterSupplier, setFilterSupplier] = useState("");
  const [filterItem, setFilterItem] = useState("");
  const [filterFrom, setFilterFrom] = useState(null);
  const [filterTo, setFilterTo] = useState(null);
  const [filterStatus, setFilterStatus] = useState("");
  const [load, setLoad] = useState(false);
  const [expandedGrn, setExpandedGrn] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchCompletedNonPoGrns = async () => {
      setLoad(true);
      try {
        const res = await axios.get(`${BASE_URL}/api/grn/nonPo`);
        if (res.data.success) {
          setGrns(res.data.data);
        } else {
          toast.error(res.data.message || "Failed to fetch data");
        }
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to load GRN data");
        console.error("Error fetching completed GRNs:", err);
      } finally {
        setLoading(false);
        setLoad(false);
      }
    };
    fetchCompletedNonPoGrns();
  }, []);

  useEffect(() => {
    const filtered = grns.filter((grn) => {
      const supplierMatch = filterSupplier
        ? grn.supplierName?.supplierName
            ?.toLowerCase()
            .includes(filterSupplier.toLowerCase())
        : true;

      const itemMatch = filterItem
        ? grn.items?.some((item) =>
            item.name?.name?.toLowerCase().includes(filterItem.toLowerCase()),
          )
        : true;

      const date = dayjs(grn.createdAt);
      const fromMatch = filterFrom
        ? date.isAfter(dayjs(filterFrom).subtract(1, "day"))
        : true;
      const toMatch = filterTo
        ? date.isBefore(dayjs(filterTo).add(1, "day"))
        : true;

      let statusMatch = true;
      if (filterStatus) {
        statusMatch = grn.items?.some(
          (item) => item.status.toLowerCase() === filterStatus.toLowerCase(),
        );
      }

      return supplierMatch && itemMatch && fromMatch && toMatch && statusMatch;
    });

    setFilteredGrns(filtered);
    setCurrentPage(1);
  }, [grns, filterSupplier, filterItem, filterFrom, filterTo, filterStatus]);

  const totalItems = filteredGrns.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedGrns = filteredGrns.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const prevPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);
  const nextPage = () =>
    currentPage < totalPages && setCurrentPage(currentPage + 1);

  const toggleExpand = (grnId) => {
    setExpandedGrn(expandedGrn === grnId ? null : grnId);
  };

  const clearFilters = () => {
    setFilterSupplier("");
    setFilterItem("");
    setFilterFrom(null);
    setFilterTo(null);
    setFilterStatus("");
  };

  const refreshData = async () => {
    setLoad(true);
    try {
      const res = await axios.get(`${BASE_URL}/api/grn/nonPo`);
      if (res.data.success) {
        setGrns(res.data.data);
        toast.success("Data refreshed!");
      }
    } catch (err) {
      toast.error("Failed to refresh data");
    } finally {
      setLoad(false);
    }
  };

  const activeFilterCount = [
    filterSupplier,
    filterItem,
    filterFrom,
    filterTo,
    filterStatus,
  ].filter(Boolean).length;

  const totalBilledItems = filteredGrns.reduce(
    (sum, grn) =>
      sum + grn.items.filter((item) => item.status === "Billed").length,
    0,
  );
  const totalCompletedItems = filteredGrns.reduce(
    (sum, grn) =>
      sum + grn.items.filter((item) => item.status === "Completed").length,
    0,
  );

  return (
    <div className="p-2 sm:p-3 md:p-4 lg:p-5 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-black">
            Completed Non-PO GRNs
          </h1>
          <p className="text-gray-600 text-xs hidden sm:block">
            View all completed Non-Purchase Order GRN records
          </p>
        </div>
        <button
          onClick={refreshData}
          className="px-3 py-2 bg-green-300 hover:bg-green-400 text-black font-bold rounded-full shadow text-xs flex items-center gap-1.5 flex-shrink-0"
        >
          <FiRefreshCw
            className={`w-3.5 h-3.5 ${load ? "animate-spin" : ""}`}
          />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3 sm:mb-4">
        <div className="bg-white border border-gray-200 rounded-full p-2.5 sm:p-3 shadow-sm text-center">
          <p className="text-[10px] sm:text-xs text-gray-500 font-medium mb-0.5">
            Total GRNs
          </p>
          <p className="text-xs sm:text-sm md:text-base font-bold text-black">
            {totalItems}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-full p-2.5 sm:p-3 shadow-sm text-center">
          <p className="text-[10px] sm:text-xs text-gray-500 font-medium mb-0.5">
            Total Items
          </p>
          <p className="text-xs sm:text-sm md:text-base font-bold text-black">
            {filteredGrns.reduce(
              (sum, grn) => sum + (grn.items?.length || 0),
              0,
            )}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-full p-2.5 sm:p-3 shadow-sm text-center">
          <p className="text-[10px] sm:text-xs text-gray-500 font-medium mb-0.5">
            Billed
          </p>
          <p className="text-xs sm:text-sm md:text-base font-bold text-yellow-600">
            {totalBilledItems}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-full p-2.5 sm:p-3 shadow-sm text-center">
          <p className="text-[10px] sm:text-xs text-gray-500 font-medium mb-0.5">
            Completed
          </p>
          <p className="text-xs sm:text-sm md:text-base font-bold text-green-600">
            {totalCompletedItems}
          </p>
        </div>
      </div>

      {/* Search Bar + Filter Toggle */}
      <div className="flex gap-2 mb-3 sm:mb-4">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-3 sm:left-4 flex items-center">
            <FiSearch className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search supplier..."
            value={filterSupplier}
            onChange={(e) => setFilterSupplier(e.target.value)}
            className="w-full pl-9 sm:pl-11 pr-8 py-2.5 sm:py-3 text-sm border border-gray-300 rounded-full bg-white text-black focus:border-green-300 focus:outline-none focus:ring-2 focus:ring-green-100"
          />
          {filterSupplier && (
            <button
              onClick={() => setFilterSupplier("")}
              className="absolute inset-y-0 right-3 flex items-center text-gray-400"
            >
              <FiX className="w-4 h-4" />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`px-3 sm:px-4 py-2.5 rounded-full border font-bold text-sm flex items-center gap-1.5 flex-shrink-0 transition-all ${
            showFilters || activeFilterCount > 0
              ? "bg-green-300 border-green-400 text-black"
              : "bg-white border-gray-300 text-gray-700"
          }`}
        >
          <FiFilter className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Filters</span>
          {activeFilterCount > 0 && (
            <span className="bg-black text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Expandable Filters Panel */}
      {showFilters && (
        <div className="bg-white rounded-xl p-3 sm:p-4 shadow-lg border border-gray-100 mb-3 sm:mb-4 space-y-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-black">Advanced Filters</h3>
            <button
              onClick={() => setShowFilters(false)}
              className="text-gray-400"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Item Name
              </label>
              <div className="relative">
                <FiBox className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search item..."
                  value={filterItem}
                  onChange={(e) => setFilterItem(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-300 rounded-full bg-white focus:border-green-300 focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-full bg-white focus:border-green-300 focus:outline-none"
              >
                <option value="">All Status</option>
                <option value="Billed">Billed</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                From Date
              </label>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  value={filterFrom}
                  onChange={setFilterFrom}
                  slotProps={{
                    textField: {
                      size: "small",
                      fullWidth: true,
                      sx: {
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "10px",
                          fontSize: "13px",
                        },
                      },
                    },
                  }}
                />
              </LocalizationProvider>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                To Date
              </label>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  value={filterTo}
                  onChange={setFilterTo}
                  slotProps={{
                    textField: {
                      size: "small",
                      fullWidth: true,
                      sx: {
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "10px",
                          fontSize: "13px",
                        },
                      },
                    },
                  }}
                />
              </LocalizationProvider>
            </div>
          </div>

          <div className="flex gap-2 pt-2 border-t border-gray-100">
            <button
              onClick={clearFilters}
              className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-black font-bold rounded-full text-xs"
            >
              Clear All
            </button>
          </div>
        </div>
      )}

      {/* Active Filter Chips */}
      {activeFilterCount > 0 && !showFilters && (
        <div className="flex flex-wrap gap-1.5 mb-3 sm:mb-4">
          {filterSupplier && (
            <span className="inline-flex items-center px-2.5 py-1 bg-green-100 text-green-800 text-[10px] font-medium rounded-full">
              Supplier: {filterSupplier}
              <button onClick={() => setFilterSupplier("")} className="ml-1">
                <FiX className="w-3 h-3" />
              </button>
            </span>
          )}
          {filterItem && (
            <span className="inline-flex items-center px-2.5 py-1 bg-blue-100 text-blue-800 text-[10px] font-medium rounded-full">
              Item: {filterItem}
              <button onClick={() => setFilterItem("")} className="ml-1">
                <FiX className="w-3 h-3" />
              </button>
            </span>
          )}
          {filterStatus && (
            <span className="inline-flex items-center px-2.5 py-1 bg-yellow-100 text-yellow-800 text-[10px] font-medium rounded-full">
              {filterStatus}
              <button onClick={() => setFilterStatus("")} className="ml-1">
                <FiX className="w-3 h-3" />
              </button>
            </span>
          )}
          {filterFrom && (
            <span className="inline-flex items-center px-2.5 py-1 bg-purple-100 text-purple-800 text-[10px] font-medium rounded-full">
              From {dayjs(filterFrom).format("DD/MM")}
              <button onClick={() => setFilterFrom(null)} className="ml-1">
                <FiX className="w-3 h-3" />
              </button>
            </span>
          )}
          {filterTo && (
            <span className="inline-flex items-center px-2.5 py-1 bg-purple-100 text-purple-800 text-[10px] font-medium rounded-full">
              To {dayjs(filterTo).format("DD/MM")}
              <button onClick={() => setFilterTo(null)} className="ml-1">
                <FiX className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}

      <Loading load={load} />

      {/* Results Count */}
      <div className="flex items-center justify-between mb-2 px-1">
        <p className="text-xs text-gray-500">
          <span className="font-bold text-black">{filteredGrns.length}</span>{" "}
          results
        </p>
        <p className="text-[10px] text-gray-400">
          Page {currentPage} of {totalPages || 1}
        </p>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-2 mb-4">
        {loading ? (
          <div className="bg-white rounded-xl p-6 text-center border border-gray-200">
            <div className="animate-spin w-8 h-8 border-2 border-green-300 border-t-transparent rounded-full mx-auto mb-3" />
            <p className="text-sm text-gray-500">Loading...</p>
          </div>
        ) : paginatedGrns.length === 0 ? (
          <div className="bg-white rounded-xl p-6 text-center border border-gray-200">
            <div className="text-3xl mb-2">📦</div>
            <p className="text-sm font-bold text-black">No GRNs found</p>
            <p className="text-xs text-gray-500">Try adjusting filters</p>
          </div>
        ) : (
          paginatedGrns.map((grn) => {
            const isExpanded = expandedGrn === grn._id;
            const billedCount =
              grn.items?.filter((i) => i.status === "Billed").length || 0;
            const completedCount =
              grn.items?.filter((i) => i.status === "Completed").length || 0;
            const totalCount = grn.items?.length || 0;

            return (
              <div
                key={grn._id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm"
              >
                {/* Card Header - Click to expand */}
                <div
                  className="p-3 bg-gradient-to-r from-green-100 to-green-200 cursor-pointer"
                  onClick={() => toggleExpand(grn._id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm flex-shrink-0">
                        <FiPackage className="text-green-600" size={16} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-black truncate">
                          {grn.supplierName?.supplierName || "Unknown"}
                        </p>
                        <p className="text-[10px] text-gray-600">
                          {dayjs(grn.receivingDate).format("DD/MM/YY")} •{" "}
                          {totalCount} items
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full" />
                        <span className="text-[10px] font-medium text-gray-700">
                          {billedCount}
                        </span>
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                        <span className="text-[10px] font-medium text-gray-700">
                          {completedCount}
                        </span>
                      </div>
                      {isExpanded ? (
                        <FiChevronUp className="text-gray-500" size={18} />
                      ) : (
                        <FiChevronDown className="text-gray-500" size={18} />
                      )}
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-2 h-1.5 bg-white/50 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-yellow-400 to-green-500 rounded-full transition-all"
                      style={{
                        width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="p-3 space-y-3">
                    {/* Info Grid */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-gray-50 rounded-lg p-2">
                        <p className="text-gray-500 text-[10px]">Invoice</p>
                        <p className="font-bold text-black">
                          {grn.invoiceNumber || "—"}
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-2">
                        <p className="text-gray-500 text-[10px]">LPO</p>
                        <p className="font-bold text-black">
                          {grn.lpoNumber || "—"}
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-2">
                        <p className="text-gray-500 text-[10px]">Delivery</p>
                        <p className="font-bold text-black">
                          {grn.deliveryPerson || "—"}
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-2">
                        <p className="text-gray-500 text-[10px]">Created</p>
                        <p className="font-bold text-black">
                          {dayjs(grn.createdAt).format("DD/MM/YY")}
                        </p>
                      </div>
                    </div>

                    {/* Items List */}
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-black">Items</p>
                      {grn.items?.map((item) => {
                        const billed = item.billedAmount || 0;
                        const paid = item.quantity || 0;
                        const totalQty = billed + paid;
                        const totalCost = totalQty * (item.buyingPrice || 0);

                        return (
                          <div
                            key={item._id}
                            className="bg-gray-50 rounded-lg p-2.5 space-y-1"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-black">
                                {item.name?.name || "—"}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  item.status === "Billed"
                                    ? "bg-yellow-200 text-yellow-800"
                                    : "bg-green-200 text-green-800"
                                }`}
                              >
                                {item.status}
                              </span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-[10px]">
                              <div>
                                <span className="text-gray-500">Qty:</span>
                                <span className="font-medium text-black ml-1">
                                  {totalQty}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-500">Buy:</span>
                                <span className="font-medium text-black ml-1">
                                  Tsh {(item.buyingPrice || 0).toLocaleString()}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-500">Total:</span>
                                <span className="font-medium text-black ml-1">
                                  Tsh {totalCost.toLocaleString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Desktop Card View */}
      <div className="hidden md:block space-y-3">
        {loading ? (
          <div className="bg-white rounded-xl p-8 text-center border border-gray-200">
            <div className="animate-spin w-10 h-10 border-3 border-green-300 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-500">Loading GRNs...</p>
          </div>
        ) : paginatedGrns.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center border border-gray-200">
            <div className="text-4xl mb-3">📦</div>
            <h3 className="text-lg font-bold text-black mb-2">No GRNs Found</h3>
            <p className="text-gray-600 text-sm mb-4">
              {activeFilterCount > 0
                ? "No GRNs match your current filters"
                : "No GRNs found in the system"}
            </p>
            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-green-300 hover:bg-green-400 text-black font-bold rounded-full transition-colors text-sm"
              >
                Clear All Filters
              </button>
            )}
          </div>
        ) : (
          paginatedGrns.map((grn) => {
            const isExpanded = expandedGrn === grn._id;
            const billedCount =
              grn.items?.filter((i) => i.status === "Billed").length || 0;
            const completedCount =
              grn.items?.filter((i) => i.status === "Completed").length || 0;
            const totalCount = grn.items?.length || 0;

            return (
              <div
                key={grn._id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Header */}
                <div
                  className="p-4 bg-gradient-to-r from-green-100 to-green-200 cursor-pointer"
                  onClick={() => toggleExpand(grn._id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                        <FiPackage className="text-green-600" size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-black">
                          {grn.supplierName?.supplierName || "Unknown Supplier"}
                        </p>
                        <p className="text-xs text-gray-600">
                          {dayjs(grn.receivingDate).format("DD/MM/YYYY")} •{" "}
                          {totalCount} items
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                        <span className="text-xs font-medium text-gray-700">
                          Billed: {billedCount}
                        </span>
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span className="text-xs font-medium text-gray-700">
                          Complete: {completedCount}
                        </span>
                      </div>
                      <div className="w-20 h-2 bg-white/50 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-yellow-400 to-green-500 rounded-full"
                          style={{
                            width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%`,
                          }}
                        />
                      </div>
                      {isExpanded ? (
                        <FiChevronUp className="text-gray-500" size={20} />
                      ) : (
                        <FiChevronDown className="text-gray-500" size={20} />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="p-4 border-t border-gray-200">
                    <div className="grid grid-cols-4 gap-3 mb-4">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 font-medium">
                          Invoice
                        </p>
                        <p className="text-sm font-bold text-black">
                          {grn.invoiceNumber || "—"}
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 font-medium">LPO</p>
                        <p className="text-sm font-bold text-black">
                          {grn.lpoNumber || "—"}
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 font-medium">
                          Delivery Person
                        </p>
                        <p className="text-sm font-bold text-black">
                          {grn.deliveryPerson || "—"}
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 font-medium">
                          Created
                        </p>
                        <p className="text-sm font-bold text-black">
                          {dayjs(grn.createdAt).format("DD/MM/YYYY HH:mm")}
                        </p>
                      </div>
                    </div>

                    {/* Items Table */}
                    <div className="overflow-x-auto rounded-lg border border-gray-200">
                      <table className="min-w-full text-sm">
                        <thead>
                          <tr className="bg-gray-100">
                            {[
                              "Item",
                              "Billed",
                              "Paid",
                              "Total",
                              "Buy Price",
                              "Total Cost",
                              "Sell Price",
                              "Est. Sales",
                              "Est. Profit",
                              "Status",
                            ].map((h) => (
                              <th
                                key={h}
                                className="px-3 py-2 text-left text-xs font-bold text-black uppercase"
                              >
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {grn.items?.map((item) => {
                            const billed = item.billedAmount || 0;
                            const paid = item.quantity || 0;
                            const totalQty = billed + paid;
                            const totalCost =
                              totalQty * (item.buyingPrice || 0);
                            const estimatedSales =
                              totalQty * (item.sellingPrice || 0);
                            const estimatedProfit = estimatedSales - totalCost;

                            return (
                              <tr
                                key={item._id}
                                className="border-t border-gray-100 hover:bg-gray-50"
                              >
                                <td className="px-3 py-2 font-medium text-black">
                                  {item.name?.name || "—"}
                                </td>
                                <td className="px-3 py-2 text-black">
                                  {billed}
                                </td>
                                <td className="px-3 py-2 text-black">{paid}</td>
                                <td className="px-3 py-2 font-bold text-black">
                                  {totalQty}
                                </td>
                                <td className="px-3 py-2 text-black">
                                  {(item.buyingPrice || 0).toLocaleString()}
                                </td>
                                <td className="px-3 py-2 font-bold text-black">
                                  {totalCost.toLocaleString()}
                                </td>
                                <td className="px-3 py-2 text-black">
                                  {(item.sellingPrice || 0).toLocaleString()}
                                </td>
                                <td className="px-3 py-2 text-black">
                                  {estimatedSales.toLocaleString()}
                                </td>
                                <td className="px-3 py-2 text-green-600 font-medium">
                                  {estimatedProfit.toLocaleString()}
                                </td>
                                <td className="px-3 py-2">
                                  <span
                                    className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${
                                      item.status === "Billed"
                                        ? "bg-yellow-200 text-yellow-800"
                                        : "bg-green-200 text-green-800"
                                    }`}
                                  >
                                    {item.status}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-2 mt-3 sm:mt-4 p-3 bg-white rounded-full border border-gray-200 shadow-sm">
          <button
            onClick={prevPage}
            disabled={currentPage === 1}
            className="p-2 bg-gray-100 hover:bg-gray-200 text-black rounded-full disabled:opacity-40"
          >
            <IoIosArrowBack className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1">
            {[...Array(Math.min(totalPages, 5))].map((_, i) => {
              let pageNum;
              if (totalPages <= 5) pageNum = i + 1;
              else if (currentPage <= 3) pageNum = i + 1;
              else if (currentPage >= totalPages - 2)
                pageNum = totalPages - 4 + i;
              else pageNum = currentPage - 2 + i;

              return (
                <button
                  key={i}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-8 h-8 text-xs font-bold rounded-full transition-colors ${
                    currentPage === pageNum
                      ? "bg-black text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={nextPage}
            disabled={currentPage === totalPages}
            className="p-2 bg-gray-100 hover:bg-gray-200 text-black rounded-full disabled:opacity-40"
          >
            <IoIosArrowForward className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default CompletedNonPO;
