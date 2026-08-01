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
  FiCalendar,
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
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage] = useState(10);
  const [summary, setSummary] = useState({
    totalItemCost: 0,
    todayTotalCost: 0,
  });

  // Fetch data with pagination and filters
  const fetchGrns = async (page = currentPage) => {
    setLoad(true);
    try {
      const params = new URLSearchParams();
      params.append("page", page);
      params.append("limit", itemsPerPage);

      if (filterSupplier) params.append("search", filterSupplier);
      if (filterFrom)
        params.append("startDate", dayjs(filterFrom).format("YYYY-MM-DD"));
      if (filterTo)
        params.append("endDate", dayjs(filterTo).format("YYYY-MM-DD"));

      const res = await axios.get(
        `${BASE_URL}/api/grn/nonPo?${params.toString()}`,
      );

      if (res.data.success) {
        setGrns(res.data.data);
        setTotalPages(res.data.pagination.totalPages);
        setTotalItems(res.data.pagination.totalItems);
        setSummary({
          totalItemCost: res.data.summary?.totalItemCost || 0,
          todayTotalCost: res.data.summary?.todayTotalCost || 0,
        });
        setCurrentPage(res.data.pagination.currentPage);
      } else {
        toast.error(res.data.message || "Failed to fetch data");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load GRN data");
      console.error("Error fetching GRNs:", err);
    } finally {
      setLoading(false);
      setLoad(false);
    }
  };

  // Initial load and filter changes
  useEffect(() => {
    fetchGrns(1);
  }, [filterSupplier, filterFrom, filterTo]);

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage !== currentPage) {
      fetchGrns(newPage);
    }
  };

  // Refresh data
  const refreshData = async () => {
    await fetchGrns(currentPage);
    toast.success("Data refreshed!");
  };

  // Clear all filters
  const clearFilters = () => {
    setFilterSupplier("");
    setFilterItem("");
    setFilterFrom(null);
    setFilterTo(null);
    setFilterStatus("");
    setCurrentPage(1);
  };

  // Toggle expand
  const toggleExpand = (grnId) => {
    setExpandedGrn(expandedGrn === grnId ? null : grnId);
  };

  // Count active filters
  const activeFilterCount = [
    filterSupplier,
    filterItem,
    filterFrom,
    filterTo,
    filterStatus,
  ].filter(Boolean).length;

  // Calculate stats from current data
  const totalBilledItems = grns.reduce(
    (sum, grn) =>
      sum + grn.items?.filter((item) => item.status === "Billed").length || 0,
    0,
  );
  const totalCompletedItems = grns.reduce(
    (sum, grn) =>
      sum + grn.items?.filter((item) => item.status === "Completed").length ||
      0,
    0,
  );
  const totalItemsCount = grns.reduce(
    (sum, grn) => sum + (grn.items?.length || 0),
    0,
  );

  // Stats data for cards
  const statsData = [
    {
      label: "Total GRNs",
      value: totalItems,
      icon: FiPackage,
      color: "bg-green-300",
    },
    {
      label: "Total Items",
      value: totalItemsCount,
      icon: FiBox,
      color: "bg-blue-300",
    },
    {
      label: "Billed Items",
      value: totalBilledItems,
      icon: FiPackage,
      color: "bg-yellow-300",
    },
    {
      label: "Completed Items",
      value: totalCompletedItems,
      icon: FiPackage,
      color: "bg-green-300",
    },
  ];

  const summaryData = [
    {
      label: "Total Cost (All GRNs)",
      value: `Tsh ${summary.totalItemCost.toLocaleString()}`,
      icon: FiCalendar,
      color: "bg-emerald-300",
      textColor: "text-emerald-800",
    },
    {
      label: "Today's Total Cost",
      value: `Tsh ${summary.todayTotalCost.toLocaleString()}`,
      icon: FiCalendar,
      color: "bg-teal-300",
      textColor: "text-teal-800",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-8xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 sm:mb-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-300 rounded-xl flex items-center justify-center shadow-lg shadow-green-200 border-2 border-green-400">
              <FiPackage className="w-5 h-5 sm:w-6 sm:h-6 text-black" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 tracking-tight">
                Completed Non-PO GRNs
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 hidden xs:block">
                View all completed Non-Purchase Order GRN records
              </p>
            </div>
          </div>
          <button
            onClick={refreshData}
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 bg-green-300 text-black rounded-xl hover:bg-green-400 transition-all duration-300 hover:shadow-lg hover:shadow-green-200 hover:scale-[1.02] active:scale-95 text-xs sm:text-sm font-semibold shadow-md border-2 border-green-400"
          >
            <FiRefreshCw
              className={`w-4 h-4 sm:w-5 sm:h-5 ${load ? "animate-spin" : ""}`}
            />
            <span className="hidden xs:inline">Refresh</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6">
          {statsData.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="bg-white p-3 sm:p-4 md:p-5 rounded-2xl border-2 border-gray-300 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
              >
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-[10px] sm:text-xs font-medium text-black/60 uppercase tracking-wider truncate">
                      {stat.label}
                    </p>
                    <p className="text-base sm:text-lg md:text-xl font-bold text-black mt-0.5 truncate">
                      {stat.value}
                    </p>
                  </div>
                  <div
                    className={`${stat.color} p-2 sm:p-2.5 rounded-xl border-2 border-gray-300 flex-shrink-0`}
                  >
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-black" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6">
          {summaryData.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="bg-white p-3 sm:p-4 md:p-5 rounded-2xl border-2 border-gray-300 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
              >
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-[10px] sm:text-xs font-medium text-black/60 uppercase tracking-wider truncate">
                      {stat.label}
                    </p>
                    <p
                      className={`text-base sm:text-lg md:text-xl font-bold ${stat.textColor} mt-0.5 truncate`}
                    >
                      {stat.value}
                    </p>
                  </div>
                  <div
                    className={`${stat.color} p-2 sm:p-2.5 rounded-xl border-2 border-gray-300 flex-shrink-0`}
                  >
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-black" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Search + Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-5">
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            <button
              onClick={() => {
                setFilterStatus("");
                setCurrentPage(1);
              }}
              className={`flex items-center gap-1 sm:gap-2 px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-full text-[9px] sm:text-xs font-semibold transition-all duration-200 border-2 ${
                filterStatus === ""
                  ? "bg-green-300 border-green-300 text-black shadow-md shadow-green-200"
                  : "bg-white border-gray-300 text-gray-500 hover:border-gray-400 hover:text-gray-700 hover:bg-gray-100"
              }`}
            >
              All
              <span
                className={`text-[9px] sm:text-xs ${filterStatus === "" ? "text-black/70" : "text-gray-400"}`}
              >
                ({totalItems})
              </span>
            </button>
            <button
              onClick={() => {
                setFilterStatus("Billed");
                setCurrentPage(1);
              }}
              className={`flex items-center gap-1 sm:gap-2 px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-full text-[9px] sm:text-xs font-semibold transition-all duration-200 border-2 ${
                filterStatus === "Billed"
                  ? "bg-green-300 border-green-300 text-black shadow-md shadow-green-200"
                  : "bg-white border-gray-300 text-gray-500 hover:border-gray-400 hover:text-gray-700 hover:bg-gray-100"
              }`}
            >
              Billed
              <span
                className={`text-[9px] sm:text-xs ${filterStatus === "Billed" ? "text-black/70" : "text-gray-400"}`}
              >
                ({totalBilledItems})
              </span>
            </button>
            <button
              onClick={() => {
                setFilterStatus("Completed");
                setCurrentPage(1);
              }}
              className={`flex items-center gap-1 sm:gap-2 px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-full text-[9px] sm:text-xs font-semibold transition-all duration-200 border-2 ${
                filterStatus === "Completed"
                  ? "bg-green-300 border-green-300 text-black shadow-md shadow-green-200"
                  : "bg-white border-gray-300 text-gray-500 hover:border-gray-400 hover:text-gray-700 hover:bg-gray-100"
              }`}
            >
              Completed
              <span
                className={`text-[9px] sm:text-xs ${filterStatus === "Completed" ? "text-black/70" : "text-gray-400"}`}
              >
                ({totalCompletedItems})
              </span>
            </button>
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-56 md:w-64">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-black/50 w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <input
                type="text"
                placeholder="Search suppliers..."
                value={filterSupplier}
                onChange={(e) => {
                  setFilterSupplier(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-8 sm:pl-9 pr-8 py-2 sm:py-2.5 bg-white border-2 border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1 transition-all duration-200 text-black placeholder:text-black/50 text-xs sm:text-sm"
              />
              {filterSupplier && (
                <button
                  onClick={() => setFilterSupplier("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-black/40 hover:text-black/70"
                >
                  <FiX className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              )}
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl font-semibold text-xs sm:text-sm transition-all duration-200 border-2 ${
                showFilters || activeFilterCount > 0
                  ? "bg-green-300 border-green-300 text-black shadow-md shadow-green-200"
                  : "bg-white border-gray-300 text-gray-600 hover:bg-gray-100 hover:border-gray-400"
              }`}
            >
              <FiFilter className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Filters</span>
              {activeFilterCount > 0 && (
                <span className="bg-white text-black text-[10px] sm:text-xs w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center font-bold">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Expandable Filters Panel */}
        {showFilters && (
          <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-lg border-2 border-gray-200 mb-4 space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-800">
                Advanced Filters
              </h3>
              <button
                onClick={() => setShowFilters(false)}
                className="p-1 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600"
              >
                <FiX className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Item Name
                </label>
                <div className="relative">
                  <FiBox className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by item name..."
                    value={filterItem}
                    onChange={(e) => setFilterItem(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-sm border-2 border-gray-300 rounded-xl bg-gray-50 focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 text-gray-800"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Status
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border-2 border-gray-300 rounded-xl bg-gray-50 focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 text-gray-800"
                >
                  <option value="">All Status</option>
                  <option value="Billed">Billed</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
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
                            borderRadius: "12px",
                            fontSize: "13px",
                            backgroundColor: "#f9fafb",
                          },
                        },
                      },
                    }}
                  />
                </LocalizationProvider>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
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
                            borderRadius: "12px",
                            fontSize: "13px",
                            backgroundColor: "#f9fafb",
                          },
                        },
                      },
                    }}
                  />
                </LocalizationProvider>
              </div>
            </div>

            <button
              onClick={clearFilters}
              className="w-full py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-xl transition-all duration-200 text-sm"
            >
              Clear All Filters
            </button>
          </div>
        )}

        {/* Active Filter Chips */}
        {activeFilterCount > 0 && !showFilters && (
          <div className="flex flex-wrap gap-1 sm:gap-1.5 mb-3 sm:mb-4">
            {filterSupplier && (
              <span className="inline-flex items-center gap-0.5 sm:gap-1 px-2 sm:px-3 py-0.5 sm:py-1 bg-green-100 text-black text-[10px] sm:text-xs font-medium rounded-full border border-green-200">
                Supplier: {filterSupplier}
                <button
                  onClick={() => setFilterSupplier("")}
                  className="hover:text-black"
                >
                  <FiX className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                </button>
              </span>
            )}
            {filterItem && (
              <span className="inline-flex items-center gap-0.5 sm:gap-1 px-2 sm:px-3 py-0.5 sm:py-1 bg-blue-100 text-blue-700 text-[10px] sm:text-xs font-medium rounded-full border border-blue-200">
                Item: {filterItem}
                <button
                  onClick={() => setFilterItem("")}
                  className="hover:text-blue-900"
                >
                  <FiX className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                </button>
              </span>
            )}
            {filterStatus && (
              <span className="inline-flex items-center gap-0.5 sm:gap-1 px-2 sm:px-3 py-0.5 sm:py-1 bg-yellow-100 text-yellow-700 text-[10px] sm:text-xs font-medium rounded-full border border-yellow-200">
                {filterStatus}
                <button
                  onClick={() => setFilterStatus("")}
                  className="hover:text-yellow-900"
                >
                  <FiX className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                </button>
              </span>
            )}
            {filterFrom && (
              <span className="inline-flex items-center gap-0.5 sm:gap-1 px-2 sm:px-3 py-0.5 sm:py-1 bg-purple-100 text-purple-700 text-[10px] sm:text-xs font-medium rounded-full border border-purple-200">
                From {dayjs(filterFrom).format("DD/MM/YYYY")}
                <button
                  onClick={() => setFilterFrom(null)}
                  className="hover:text-purple-900"
                >
                  <FiX className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                </button>
              </span>
            )}
            {filterTo && (
              <span className="inline-flex items-center gap-0.5 sm:gap-1 px-2 sm:px-3 py-0.5 sm:py-1 bg-purple-100 text-purple-700 text-[10px] sm:text-xs font-medium rounded-full border border-purple-200">
                To {dayjs(filterTo).format("DD/MM/YYYY")}
                <button
                  onClick={() => setFilterTo(null)}
                  className="hover:text-purple-900"
                >
                  <FiX className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                </button>
              </span>
            )}
          </div>
        )}

        <Loading load={load} />

        {/* Results Count */}
        <div className="flex items-center justify-between mb-2 sm:mb-3 px-1">
          <p className="text-[9px] sm:text-sm text-gray-500">
            <span className="font-semibold text-gray-700">{totalItems}</span>{" "}
            results found
          </p>
          <p className="text-[9px] sm:text-sm text-gray-400">
            Page {currentPage} of {totalPages || 1}
          </p>
        </div>

        {/* Mobile Card View */}
        <div className="block sm:hidden space-y-2 mb-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 bg-gray-100 rounded-2xl border-2 border-gray-300 shadow-sm">
              <div className="w-10 h-10 border-4 border-green-300 border-t-green-500 rounded-full animate-spin" />
              <p className="text-xs text-gray-500 mt-3">Loading GRNs...</p>
            </div>
          ) : grns.length === 0 ? (
            <div className="bg-gray-100 rounded-2xl border-2 border-gray-300 shadow-sm py-12 text-center">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3 border-2 border-gray-300">
                <FiPackage className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-sm text-gray-700 font-medium">No GRNs found</p>
              <p className="text-xs text-gray-500 mt-1">
                Try adjusting your filters
              </p>
            </div>
          ) : (
            grns.map((grn) => {
              const isExpanded = expandedGrn === grn._id;
              const billedCount =
                grn.items?.filter((i) => i.status === "Billed").length || 0;
              const completedCount =
                grn.items?.filter((i) => i.status === "Completed").length || 0;
              const totalCount = grn.items?.length || 0;

              return (
                <div
                  key={grn._id}
                  className="bg-green-100 rounded-xl border-2 border-green-300 shadow-sm p-3 hover:shadow-md hover:border-green-400 transition-all duration-300"
                >
                  <div className="flex flex-col gap-2">
                    <div
                      className="flex items-center justify-between cursor-pointer"
                      onClick={() => toggleExpand(grn._id)}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-8 h-8 bg-green-300 rounded-full flex items-center justify-center flex-shrink-0 border-2 border-green-400">
                          <FiPackage className="w-4 h-4 text-black" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-sm font-semibold text-gray-800 truncate">
                            {grn.supplierName?.supplierName || "Unknown"}
                          </span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[9px] text-gray-600">
                              {dayjs(grn.receivingDate).format("DD/MM/YY")}
                            </span>
                            <span className="w-0.5 h-0.5 bg-gray-400 rounded-full" />
                            <span className="text-[9px] text-gray-600">
                              {totalCount} items
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full" />
                          <span className="text-[9px] font-medium text-gray-700">
                            {billedCount}
                          </span>
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                          <span className="text-[9px] font-medium text-gray-700">
                            {completedCount}
                          </span>
                        </div>
                        {isExpanded ? (
                          <FiChevronUp className="text-gray-500" size={16} />
                        ) : (
                          <FiChevronDown className="text-gray-500" size={16} />
                        )}
                      </div>
                    </div>

                    <div className="h-1.5 bg-white/50 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-yellow-400 to-green-500 rounded-full transition-all"
                        style={{
                          width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%`,
                        }}
                      />
                    </div>

                    {isExpanded && (
                      <div className="pt-2 border-t border-green-200 space-y-2">
                        <div className="grid grid-cols-2 gap-1.5 text-xs">
                          <div className="bg-white rounded-lg p-1.5 border border-green-200">
                            <p className="text-[9px] text-gray-500 font-medium">
                              Invoice
                            </p>
                            <p className="text-xs font-bold text-gray-800">
                              {grn.invoiceNumber || "—"}
                            </p>
                          </div>
                          <div className="bg-white rounded-lg p-1.5 border border-green-200">
                            <p className="text-[9px] text-gray-500 font-medium">
                              LPO
                            </p>
                            <p className="text-xs font-bold text-gray-800">
                              {grn.lpoNumber || "—"}
                            </p>
                          </div>
                          <div className="bg-white rounded-lg p-1.5 border border-green-200">
                            <p className="text-[9px] text-gray-500 font-medium">
                              Delivery
                            </p>
                            <p className="text-xs font-bold text-gray-800">
                              {grn.deliveryPerson || "—"}
                            </p>
                          </div>
                          <div className="bg-white rounded-lg p-1.5 border border-green-200">
                            <p className="text-[9px] text-gray-500 font-medium">
                              Created
                            </p>
                            <p className="text-xs font-bold text-gray-800">
                              {dayjs(grn.createdAt).format("DD/MM/YY")}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <p className="text-[10px] font-bold text-gray-700">
                            Items
                          </p>
                          {grn.items?.map((item) => {
                            const billed = item.billedAmount || 0;
                            const paid = item.quantity || 0;
                            const totalQty = billed + paid;
                            const totalCost =
                              totalQty * (item.buyingPrice || 0);

                            return (
                              <div
                                key={item._id}
                                className="bg-white rounded-lg p-2 border border-green-200 space-y-1"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-bold text-gray-800">
                                    {item.name?.name || "—"}
                                  </span>
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-[8px] font-bold border-2 ${
                                      item.status === "Billed"
                                        ? "bg-yellow-200 text-yellow-800 border-yellow-300"
                                        : "bg-green-200 text-green-800 border-green-300"
                                    }`}
                                  >
                                    {item.status}
                                  </span>
                                </div>
                                <div className="grid grid-cols-3 gap-1 text-[9px]">
                                  <div>
                                    <span className="text-gray-500">Qty:</span>
                                    <span className="font-semibold text-gray-800 ml-1">
                                      {totalQty}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-gray-500">Buy:</span>
                                    <span className="font-semibold text-gray-800 ml-1">
                                      Tsh{" "}
                                      {(item.buyingPrice || 0).toLocaleString()}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-gray-500">
                                      Total:
                                    </span>
                                    <span className="font-semibold text-gray-800 ml-1">
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
                </div>
              );
            })
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden sm:block">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 sm:py-16 bg-gray-100 rounded-2xl border-2 border-gray-300 shadow-sm">
              <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-green-300 border-t-green-500 rounded-full animate-spin" />
              <p className="text-xs sm:text-sm text-gray-500 mt-3 sm:mt-4">
                Loading GRNs...
              </p>
            </div>
          ) : grns.length === 0 ? (
            <div className="bg-gray-100 rounded-2xl border-2 border-gray-300 shadow-sm py-12 sm:py-16 text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 border-2 border-gray-300">
                <FiPackage className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
              </div>
              <p className="text-sm sm:text-base text-gray-700 font-medium">
                No GRNs found
              </p>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Try adjusting your filters
              </p>
            </div>
          ) : (
            grns.map((grn) => {
              const isExpanded = expandedGrn === grn._id;
              const billedCount =
                grn.items?.filter((i) => i.status === "Billed").length || 0;
              const completedCount =
                grn.items?.filter((i) => i.status === "Completed").length || 0;
              const totalCount = grn.items?.length || 0;
              const progress =
                totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

              return (
                <div
                  key={grn._id}
                  className="bg-green-100 rounded-xl border-2 border-green-300 shadow-sm mb-3 hover:shadow-md hover:border-green-400 transition-all duration-300 overflow-hidden"
                >
                  {/* Header Row */}
                  <div
                    className="p-3 sm:p-4 cursor-pointer hover:bg-green-200 transition-colors"
                    onClick={() => toggleExpand(grn._id)}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3">
                      <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-300 rounded-full flex items-center justify-center flex-shrink-0 border-2 border-green-400">
                          <FiPackage className="w-4 h-4 sm:w-5 sm:h-5 text-black" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-800 truncate">
                            {grn.supplierName?.supplierName || "Unknown"}
                          </p>
                          <div className="flex items-center gap-2 text-[10px] sm:text-xs text-gray-600">
                            <span>
                              {dayjs(grn.receivingDate).format("DD/MM/YYYY")}
                            </span>
                            <span className="w-0.5 h-0.5 bg-gray-400 rounded-full" />
                            <span>{totalCount} items</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
                        <div className="flex items-center gap-1.5">
                          <div className="flex items-center gap-0.5 sm:gap-1">
                            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-yellow-400 rounded-full" />
                            <span className="text-[9px] sm:text-xs font-medium text-gray-700">
                              {billedCount}
                            </span>
                          </div>
                          <div className="flex items-center gap-0.5 sm:gap-1">
                            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full" />
                            <span className="text-[9px] sm:text-xs font-medium text-gray-700">
                              {completedCount}
                            </span>
                          </div>
                        </div>
                        <div className="w-16 sm:w-20 h-1.5 bg-white/50 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-yellow-400 to-green-500 rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        {isExpanded ? (
                          <FiChevronUp className="text-gray-500" size={18} />
                        ) : (
                          <FiChevronDown className="text-gray-500" size={18} />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="p-3 sm:p-4 pt-0 border-t border-green-200">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-3 sm:mb-4">
                        <div className="bg-white rounded-xl p-2 sm:p-3 border border-green-200">
                          <p className="text-[9px] sm:text-xs text-gray-500 font-medium">
                            Invoice
                          </p>
                          <p className="text-xs sm:text-sm font-bold text-gray-800">
                            {grn.invoiceNumber || "—"}
                          </p>
                        </div>
                        <div className="bg-white rounded-xl p-2 sm:p-3 border border-green-200">
                          <p className="text-[9px] sm:text-xs text-gray-500 font-medium">
                            LPO
                          </p>
                          <p className="text-xs sm:text-sm font-bold text-gray-800">
                            {grn.lpoNumber || "—"}
                          </p>
                        </div>
                        <div className="bg-white rounded-xl p-2 sm:p-3 border border-green-200">
                          <p className="text-[9px] sm:text-xs text-gray-500 font-medium">
                            Delivery Person
                          </p>
                          <p className="text-xs sm:text-sm font-bold text-gray-800">
                            {grn.deliveryPerson || "—"}
                          </p>
                        </div>
                        <div className="bg-white rounded-xl p-2 sm:p-3 border border-green-200">
                          <p className="text-[9px] sm:text-xs text-gray-500 font-medium">
                            Created
                          </p>
                          <p className="text-xs sm:text-sm font-bold text-gray-800">
                            {dayjs(grn.createdAt).format("DD/MM/YYYY HH:mm")}
                          </p>
                        </div>
                      </div>

                      <div className="bg-white rounded-xl border border-green-200 overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="min-w-full text-xs sm:text-sm">
                            <thead className="bg-green-50">
                              <tr>
                                <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-left text-[9px] sm:text-xs font-bold text-gray-600 uppercase">
                                  Item
                                </th>
                                <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-left text-[9px] sm:text-xs font-bold text-gray-600 uppercase">
                                  Billed
                                </th>
                                <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-left text-[9px] sm:text-xs font-bold text-gray-600 uppercase">
                                  Paid
                                </th>
                                <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-left text-[9px] sm:text-xs font-bold text-gray-600 uppercase">
                                  Total
                                </th>
                                <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-left text-[9px] sm:text-xs font-bold text-gray-600 uppercase">
                                  Buy Price
                                </th>
                                <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-left text-[9px] sm:text-xs font-bold text-gray-600 uppercase">
                                  Total Cost
                                </th>
                                <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-left text-[9px] sm:text-xs font-bold text-gray-600 uppercase">
                                  Status
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-green-100">
                              {grn.items?.map((item) => {
                                const billed = item.billedAmount || 0;
                                const paid = item.quantity || 0;
                                const totalQty = billed + paid;
                                const totalCost =
                                  totalQty * (item.buyingPrice || 0);

                                return (
                                  <tr
                                    key={item._id}
                                    className="hover:bg-green-50"
                                  >
                                    <td className="px-2 sm:px-3 py-1.5 sm:py-2 font-medium text-gray-800">
                                      {item.name?.name || "—"}
                                    </td>
                                    <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-gray-600">
                                      {billed}
                                    </td>
                                    <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-gray-600">
                                      {paid}
                                    </td>
                                    <td className="px-2 sm:px-3 py-1.5 sm:py-2 font-bold text-gray-800">
                                      {totalQty}
                                    </td>
                                    <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-gray-600">
                                      Tsh{" "}
                                      {(item.buyingPrice || 0).toLocaleString()}
                                    </td>
                                    <td className="px-2 sm:px-3 py-1.5 sm:py-2 font-bold text-gray-800">
                                      Tsh {totalCost.toLocaleString()}
                                    </td>
                                    <td className="px-2 sm:px-3 py-1.5 sm:py-2">
                                      <span
                                        className={`inline-flex px-2 py-0.5 rounded-full text-[8px] sm:text-[10px] font-bold border-2 ${
                                          item.status === "Billed"
                                            ? "bg-yellow-200 text-yellow-800 border-yellow-300"
                                            : "bg-green-200 text-green-800 border-green-300"
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
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-3 sm:mt-4 bg-white px-3 sm:px-5 py-2.5 sm:py-4 rounded-xl border-2 border-gray-200 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-3">
            <span className="text-[9px] sm:text-xs text-gray-500 text-center sm:text-left">
              Showing{" "}
              <span className="font-semibold text-gray-700">
                {(currentPage - 1) * itemsPerPage + 1}
              </span>{" "}
              to{" "}
              <span className="font-semibold text-gray-700">
                {Math.min(currentPage * itemsPerPage, totalItems)}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-gray-700">{totalItems}</span>{" "}
              GRNs
            </span>
            <div className="flex items-center gap-1.5 flex-wrap justify-center">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  currentPage === 1
                    ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                    : "bg-white border-2 border-gray-300 text-gray-600 hover:bg-gray-100 hover:border-gray-400 shadow-sm"
                }`}
              >
                <IoIosArrowBack className="w-4 h-4" />
              </button>

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
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm border-2 ${
                      currentPage === pageNum
                        ? "bg-green-300 text-black border-green-300 hover:bg-green-400"
                        : "bg-white border-gray-300 text-gray-600 hover:bg-gray-100 hover:border-gray-400"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
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
        )}
      </div>
    </div>
  );
};

export default CompletedNonPO;
