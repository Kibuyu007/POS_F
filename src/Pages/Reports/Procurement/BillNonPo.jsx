import axios from "axios";
import { useState, useEffect } from "react";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { FaSearch, FaFilter } from "react-icons/fa";
import { FiRefreshCw, FiX } from "react-icons/fi";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import Loading from "../../../Components/Shared/Loading";
import BASE_URL from "../../../Utils/config";
import toast from "react-hot-toast";
import {
  Package,
  Clock,
  Building,
  User,
  Calendar,
  TrendingUp,
} from "lucide-react";

const BillNonPo = () => {
  const [reportData, setReportData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [load, setLoad] = useState(true);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [createdBy, setCreatedBy] = useState("");
  const [supplierFilter, setSupplierFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const itemsPerPage = 10;

  useEffect(() => {
    fetchReport();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
    applyFilters();
  }, [
    startDate,
    endDate,
    selectedSupplier,
    createdBy,
    supplierFilter,
    reportData,
  ]);

  const fetchReport = async () => {
    try {
      setLoad(true);
      const res = await axios.get(`${BASE_URL}/api/grn/nonPoBillReport`);
      if (res.data.success) {
        setReportData(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching report:", err);
      toast.error("Failed to load report data.");
    } finally {
      setLoad(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...reportData];

    if (startDate) {
      filtered = filtered.filter((item) =>
        dayjs(item.createdAt).isSameOrAfter(dayjs(startDate), "day"),
      );
    }
    if (endDate) {
      filtered = filtered.filter((item) =>
        dayjs(item.createdAt).isSameOrBefore(dayjs(endDate), "day"),
      );
    }
    if (selectedSupplier) {
      filtered = filtered.filter((item) => item.supplier === selectedSupplier);
    }
    if (createdBy) {
      filtered = filtered.filter((item) => item.changedBy === createdBy);
    }
    if (supplierFilter) {
      filtered = filtered.filter((item) =>
        (item.supplier || "")
          .toLowerCase()
          .includes(supplierFilter.toLowerCase()),
      );
    }

    setFilteredData(filtered);
  };

  const suppliers = [...new Set(reportData.map((item) => item.supplier))];
  const alieChange = [...new Set(reportData.map((item) => item.changedBy))];

  const totalBilledCost = filteredData.reduce(
    (sum, item) => sum + (item.billedTotalCost || 0),
    0,
  );
  const totalBilledAmount = filteredData.reduce(
    (sum, item) => sum + (item.billedAmount || 0),
    0,
  );
  const billedItems = filteredData.length;
  const paidItems = filteredData.filter(
    (item) => item.status === "Paid",
  ).length;
  const pendingItems = filteredData.filter(
    (item) => item.status === "Pending",
  ).length;

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const currentData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const clearFilters = () => {
    setStartDate(null);
    setEndDate(null);
    setSelectedSupplier("");
    setCreatedBy("");
    setSupplierFilter("");
    toast.success("Filters cleared!");
  };

  const activeFilterCount = [
    startDate,
    endDate,
    selectedSupplier,
    createdBy,
    supplierFilter,
  ].filter(Boolean).length;

  const renderPagination = (currentPageNum, totalPagesNum, setPageFn) => {
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
          onClick={() => currentPageNum > 1 && setPageFn(currentPageNum - 1)}
          disabled={currentPageNum === 1}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            currentPageNum === 1
              ? "bg-gray-100 text-gray-300 cursor-not-allowed"
              : "bg-white border-2 border-gray-300 text-gray-600 hover:bg-gray-100 hover:border-gray-400 shadow-sm"
          }`}
        >
          <IoIosArrowBack className="w-4 h-4" />
        </button>

        {startPage > 1 && (
          <>
            <button
              onClick={() => setPageFn(1)}
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
            onClick={() => setPageFn(number)}
            className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm border-2 ${
              currentPageNum === number
                ? "bg-green-300 text-black border-green-300 hover:bg-green-400"
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
              onClick={() => setPageFn(totalPagesNum)}
              className="px-3.5 py-2 rounded-lg text-sm font-medium bg-white border-2 border-gray-300 text-gray-600 hover:bg-gray-100 hover:border-gray-400 transition-all duration-200 shadow-sm"
            >
              {totalPagesNum}
            </button>
          </>
        )}

        <button
          onClick={() =>
            currentPageNum < totalPagesNum && setPageFn(currentPageNum + 1)
          }
          disabled={currentPageNum === totalPagesNum}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            currentPageNum === totalPagesNum
              ? "bg-gray-100 text-gray-300 cursor-not-allowed"
              : "bg-white border-2 border-gray-300 text-gray-600 hover:bg-gray-100 hover:border-gray-400 shadow-sm"
          }`}
        >
          <IoIosArrowForward className="w-4 h-4" />
        </button>
      </div>
    );
  };

  const formatCurrency = (amount) => {
    return `${(amount || 0).toLocaleString()}`;
  };

  const statsData = [
    {
      label: "Billed Cost",
      value: formatCurrency(totalBilledCost),
      icon: Package,
    },
    {
      label: "Total Items",
      value: billedItems,
      icon: Building,
    },
    {
      label: "Quantity",
      value: formatCurrency(totalBilledAmount),
      icon: TrendingUp,
    },
    {
      label: "Status",
      value: `${paidItems} / ${pendingItems}`,
      icon: Clock,
      subtext: "paid / pending",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-8xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
        {/* Header - Responsive */}
        <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-300 rounded-xl flex items-center justify-center shadow-lg shadow-green-200 border-2 border-green-400">
              <Building className="w-5 h-5 sm:w-6 sm:h-6 text-black" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 tracking-tight">
                Non-PO Billed Report
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 hidden xs:block">
                View and analyze all Non-PO GRN billing records
              </p>
            </div>
          </div>
          <button
            onClick={fetchReport}
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-100 font-semibold rounded-xl transition-all duration-200 shadow-sm text-xs sm:text-sm"
          >
            <FiRefreshCw
              className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${load ? "animate-spin" : ""}`}
            />
            <span className="hidden xs:inline">Refresh</span>
          </button>
        </div>

        {/* Stats Cards - Stacked on mobile */}
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
                    <p className="text-base sm:text-lg md:text-xl font-bold text-black mt-0.5 sm:mt-1 truncate">
                      {stat.value}
                    </p>
                    {stat.subtext && (
                      <p className="text-[8px] sm:text-[9px] text-gray-400 mt-0.5">
                        {stat.subtext}
                      </p>
                    )}
                  </div>
                  <div className="bg-green-300 p-2 sm:p-2.5 rounded-xl border-2 border-green-400 flex-shrink-0">
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-black" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Search + Filters - Responsive */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-5">
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-56 md:w-64">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-black/50 w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <input
                type="text"
                placeholder="Search supplier..."
                className="w-full pl-8 sm:pl-9 pr-8 py-2 sm:py-2.5 bg-white border-2 border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1 transition-all duration-200 text-black placeholder:text-black/50 text-xs sm:text-sm"
                value={supplierFilter}
                onChange={(e) => setSupplierFilter(e.target.value)}
              />
              {supplierFilter && (
                <button
                  onClick={() => setSupplierFilter("")}
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
              <FaFilter className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
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
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  From Date
                </label>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    value={startDate}
                    onChange={setStartDate}
                    slotProps={{
                      textField: {
                        size: "small",
                        fullWidth: true,
                        sx: {
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "12px",
                            fontSize: "13px",
                          },
                        },
                      },
                    }}
                  />
                </LocalizationProvider>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  To Date
                </label>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    value={endDate}
                    onChange={setEndDate}
                    slotProps={{
                      textField: {
                        size: "small",
                        fullWidth: true,
                        sx: {
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "12px",
                            fontSize: "13px",
                          },
                        },
                      },
                    }}
                  />
                </LocalizationProvider>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Supplier
                </label>
                <select
                  value={selectedSupplier}
                  onChange={(e) => setSelectedSupplier(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm border-2 border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1 text-black"
                >
                  <option value="">All Suppliers</option>
                  {suppliers.map((sup, idx) => (
                    <option key={idx} value={sup}>
                      {sup}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Changed By
                </label>
                <select
                  value={createdBy}
                  onChange={(e) => setCreatedBy(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm border-2 border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1 text-black"
                >
                  <option value="">All Users</option>
                  {alieChange.map((u, idx) => (
                    <option key={idx} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
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

        {/* Active Filter Chips - Responsive */}
        {activeFilterCount > 0 && !showFilters && (
          <div className="flex flex-wrap gap-1 sm:gap-1.5 mb-3 sm:mb-4">
            {startDate && (
              <span className="inline-flex items-center gap-0.5 sm:gap-1 px-2 sm:px-3 py-0.5 sm:py-1 bg-blue-100 text-black text-[10px] sm:text-xs font-medium rounded-full border border-blue-200">
                From {dayjs(startDate).format("DD/MM/YY")}
                <button
                  onClick={() => setStartDate(null)}
                  className="hover:text-black/70"
                >
                  <FiX className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                </button>
              </span>
            )}
            {endDate && (
              <span className="inline-flex items-center gap-0.5 sm:gap-1 px-2 sm:px-3 py-0.5 sm:py-1 bg-blue-100 text-black text-[10px] sm:text-xs font-medium rounded-full border border-blue-200">
                To {dayjs(endDate).format("DD/MM/YY")}
                <button
                  onClick={() => setEndDate(null)}
                  className="hover:text-black/70"
                >
                  <FiX className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                </button>
              </span>
            )}
            {selectedSupplier && (
              <span className="inline-flex items-center gap-0.5 sm:gap-1 px-2 sm:px-3 py-0.5 sm:py-1 bg-green-100 text-black text-[10px] sm:text-xs font-medium rounded-full border border-green-200">
                {selectedSupplier}
                <button
                  onClick={() => setSelectedSupplier("")}
                  className="hover:text-black/70"
                >
                  <FiX className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                </button>
              </span>
            )}
            {createdBy && (
              <span className="inline-flex items-center gap-0.5 sm:gap-1 px-2 sm:px-3 py-0.5 sm:py-1 bg-purple-100 text-black text-[10px] sm:text-xs font-medium rounded-full border border-purple-200">
                {createdBy}
                <button
                  onClick={() => setCreatedBy("")}
                  className="hover:text-black/70"
                >
                  <FiX className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                </button>
              </span>
            )}
            {supplierFilter && (
              <span className="inline-flex items-center gap-0.5 sm:gap-1 px-2 sm:px-3 py-0.5 sm:py-1 bg-yellow-100 text-black text-[10px] sm:text-xs font-medium rounded-full border border-yellow-200">
                {supplierFilter}
                <button
                  onClick={() => setSupplierFilter("")}
                  className="hover:text-black/70"
                >
                  <FiX className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                </button>
              </span>
            )}
          </div>
        )}

        <Loading load={load} />

        {/* Results Count - Responsive */}
        <div className="flex items-center justify-between mb-2 sm:mb-3 px-1">
          <p className="text-[9px] sm:text-sm text-gray-500">
            <span className="font-semibold text-gray-700">
              {filteredData.length}
            </span>{" "}
            records found
          </p>
          <p className="text-[9px] sm:text-sm text-gray-400">
            Page {currentPage} of {totalPages || 1}
          </p>
        </div>

        {/* Card List - Responsive */}
        <div className="space-y-2 sm:space-y-2.5">
          {load ? (
            <div className="flex flex-col items-center justify-center py-12 sm:py-16 bg-gray-100 rounded-2xl border-2 border-gray-300 shadow-sm">
              <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-green-300 border-t-green-500 rounded-full animate-spin" />
              <p className="text-xs sm:text-sm text-gray-500 mt-3 sm:mt-4">
                Loading billing records...
              </p>
            </div>
          ) : currentData.length === 0 ? (
            <div className="bg-gray-100 rounded-2xl border-2 border-gray-300 shadow-sm py-12 sm:py-16 text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 border-2 border-gray-300">
                <Building className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
              </div>
              <p className="text-sm sm:text-base text-gray-700 font-medium">
                No billing records found
              </p>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Try adjusting your filters
              </p>
            </div>
          ) : (
            currentData.map((log, idx) => {
              const isPaid = log.status === "Paid";

              return (
                <div
                  key={log._id || idx}
                  className="bg-gray-200 rounded-xl border-2 border-gray-300 shadow-sm p-3 sm:p-4 hover:shadow-md hover:border-green-300 transition-all duration-300"
                >
                  {/* Row 1: Header */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-green-300 flex items-center justify-center flex-shrink-0 border-2 border-green-400">
                        <Package className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-black" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                          <span className="text-sm sm:text-base font-semibold text-gray-800 truncate max-w-[100px] xs:max-w-[150px] sm:max-w-[200px]">
                            {log.supplier || "—"}
                          </span>
                          <span className="text-[10px] sm:text-[11px] text-gray-600 bg-white px-1.5 py-0.5 rounded border border-gray-300 flex-shrink-0">
                            #{idx + 1}
                          </span>
                          <span
                            className={`px-2 sm:px-3 py-0.5 rounded-full text-[9px] sm:text-[11px] font-semibold border-2 flex-shrink-0 ${
                              isPaid
                                ? "bg-green-300 text-black border-green-400"
                                : "bg-red-100 text-red-700 border-red-200"
                            }`}
                          >
                            {log.status || "—"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-gray-500 mt-0.5 flex-wrap">
                          <span className="flex items-center gap-0.5">
                            <Calendar className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                            {log.createdAt
                              ? dayjs(log.createdAt).format("DD/MM/YYYY HH:mm")
                              : "—"}
                          </span>
                          <span className="w-0.5 h-0.5 bg-gray-400 rounded-full" />
                          <span className="flex items-center gap-0.5">
                            <User className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                            {log.createdBy || "—"}
                          </span>
                          {log.completedAt && (
                            <>
                              <span className="w-0.5 h-0.5 bg-gray-400 rounded-full" />
                              <span className="flex items-center gap-0.5">
                                <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                {dayjs(log.completedAt).format("DD/MM HH:mm")}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Row 2: Item Details with Amount highlighted */}
                  <div className="mt-2 pt-2 border-t-2 border-gray-300">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm">
                        <div>
                          <span className="text-gray-600">Item:</span>
                          <span className="font-semibold text-gray-800 ml-1">
                            {log.itemName || "—"}
                          </span>
                        </div>
                        <div className="w-px h-4 sm:h-5 bg-gray-300" />
                        <div>
                          <span className="text-gray-600">Qty:</span>
                          <span className="font-semibold text-gray-800 ml-1">
                            {(log.billedAmount || 0).toLocaleString()}
                          </span>
                        </div>
                        {log.changedBy && (
                          <>
                            <div className="w-px h-4 sm:h-5 bg-gray-300" />
                            <div>
                              <span className="text-gray-600">Changed By:</span>
                              <span className="font-semibold text-gray-800 ml-1">
                                {log.changedBy}
                              </span>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Amount - Large, Bold, Black, at the end */}
                      <div className="flex items-center gap-2 bg-white px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg border-2 border-gray-300 shadow-sm">
                        <Package className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-black" />
                        <span className="text-sm sm:text-lg md:text-xl font-bold text-black">
                          {formatCurrency(log.billedTotalCost || 0)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination - Responsive */}
        {filteredData.length > 0 && (
          <div className="mt-3 sm:mt-4 bg-white px-3 sm:px-5 py-2.5 sm:py-4 rounded-xl border-2 border-gray-200 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-3">
            <span className="text-[9px] sm:text-sm text-gray-500 text-center sm:text-left">
              Showing{" "}
              <span className="font-semibold text-gray-700">
                {(currentPage - 1) * itemsPerPage + 1}
              </span>{" "}
              to{" "}
              <span className="font-semibold text-gray-700">
                {Math.min(currentPage * itemsPerPage, filteredData.length)}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-gray-700">
                {filteredData.length}
              </span>{" "}
              records
            </span>
            {renderPagination(currentPage, totalPages, setCurrentPage)}
          </div>
        )}
      </div>
    </div>
  );
};

export default BillNonPo;