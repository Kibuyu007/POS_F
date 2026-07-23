import React from "react";
import axios from "axios";
import { useEffect, useState } from "react";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import {
  FiSearch,
  FiRefreshCw,
  FiChevronDown,
  FiChevronUp,
  FiFilter,
  FiX,
} from "react-icons/fi";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import Loading from "../../../../Components/Shared/Loading";
import BASE_URL from "../../../../Utils/config";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import {
  Search,
  X,
  Package,
  Clock,
  CheckCircle,
  Building,
  User,
  ChevronDown as ChevronDownIcon,
  ChevronRight,
} from "lucide-react";

const MadeniNonPo = () => {
  const user = useSelector((state) => state.user.user);
  const [supplierBills, setSupplierBills] = useState([]);
  const [load, setLoad] = useState(false);
  const [expandedSuppliers, setExpandedSuppliers] = useState({});
  const [supplierFilter, setSupplierFilter] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [bulkPaymentAmount, setBulkPaymentAmount] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const itemsPerPage = 10;

  useEffect(() => {
    fetchSupplierBills();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [supplierFilter, startDate, endDate]);

  const fetchSupplierBills = async () => {
    setLoad(true);
    try {
      const res = await axios.get(`${BASE_URL}/api/grn/unpaidNonPo`);
      if (res.data.success) {
        setSupplierBills(res.data.data);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load supplier bills.");
    } finally {
      setLoad(false);
    }
  };

  const filteredData = supplierBills.filter((supplier) => {
    if (
      supplierFilter &&
      !supplier.supplierName
        .toLowerCase()
        .includes(supplierFilter.toLowerCase())
    ) {
      return false;
    }

    if (startDate || endDate) {
      const hasItemsInRange = supplier.items.some((item) => {
        const itemDate = dayjs(item.createdAt);
        const matchStart = startDate
          ? itemDate.isSameOrAfter(dayjs(startDate), "day")
          : true;
        const matchEnd = endDate
          ? itemDate.isSameOrBefore(dayjs(endDate), "day")
          : true;
        return matchStart && matchEnd;
      });
      return hasItemsInRange;
    }

    return true;
  });

  const totalDebt = filteredData.reduce(
    (sum, supplier) => sum + (supplier.totalBilledAmount || 0),
    0,
  );
  const totalRemaining = filteredData.reduce(
    (sum, supplier) => sum + (supplier.totalRemainingBalance || 0),
    0,
  );
  const totalPaid = totalDebt - totalRemaining;

  const suppliersWithBalance = filteredData.filter(
    (s) => s.totalRemainingBalance > 0,
  ).length;
  const suppliersFullyPaid = filteredData.filter(
    (s) => s.totalRemainingBalance <= 0,
  ).length;

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const totalSuppliers = filteredData.length;

  const currentSuppliers = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const toggleSupplierExpansion = (supplierId) => {
    setExpandedSuppliers((prev) => ({
      ...prev,
      [supplierId]: !prev[supplierId],
    }));
  };

  const calculateItemRemainingBalance = (item) => {
    return (item.billedTotalCost || 0) - (item.paidAmount || 0);
  };

  const isItemFullyPaid = (item) => {
    return item.isFullyPaid || calculateItemRemainingBalance(item) <= 0;
  };

  const handleSupplierPayment = async (supplier) => {
    const amount = parseFloat(bulkPaymentAmount || 0);

    if (!amount || amount <= 0) {
      toast.error("Please enter a valid payment amount");
      return;
    }

    if (amount > supplier.totalRemainingBalance) {
      toast.error("Payment amount exceeds supplier's remaining balance");
      return;
    }

    setLoad(true);
    try {
      const res = await axios.post(
        `${BASE_URL}/api/grn/payNonPoBills`,
        {
          supplierId: supplier.supplierId,
          paymentAmount: amount,
        },
        { withCredentials: true },
      );

      if (res.data.success) {
        toast.success(
          `Payment of Tsh ${amount.toLocaleString()} processed successfully!`,
        );
        setBulkPaymentAmount("");
        setPaymentDialogOpen(false);
        setSelectedSupplier(null);
        fetchSupplierBills();
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to process payment.");
    } finally {
      setLoad(false);
    }
  };

  const openPaymentDialog = (supplier) => {
    setSelectedSupplier(supplier);
    setBulkPaymentAmount("");
    setPaymentDialogOpen(true);
  };

  const formatNumber = (value) => {
    if (!value && value !== 0) return "";
    const num = parseFloat(value);
    if (isNaN(num)) return "";
    return num.toLocaleString();
  };

  const unformatNumber = (value) => {
    return value.replace(/,/g, "");
  };

  const canPayBilledGrn = user?.roles?.canPayBilledGrn === true;

  const activeFilterCount = [supplierFilter, startDate, endDate].filter(
    Boolean,
  ).length;

  const clearFilters = () => {
    setSupplierFilter("");
    setStartDate(null);
    setEndDate(null);
  };

  const formatCurrency = (amount) => {
    return `TSh ${(amount || 0).toLocaleString()}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

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

  const statsData = [
    { label: "Total Billed", value: formatCurrency(totalDebt), icon: Package },
    { label: "Pending", value: formatCurrency(totalRemaining), icon: Clock },
    { label: "Paid", value: formatCurrency(totalPaid), icon: CheckCircle },
    {
      label: "Suppliers",
      value: `${suppliersWithBalance} / ${suppliersFullyPaid}`,
      icon: Building,
      subtext: "pending / paid",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-8xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200 border-2 border-emerald-300">
              <Package className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800 tracking-tight">
                Supplier Payments
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 hidden xs:block">
                Track and manage supplier bill payments (FIFO)
              </p>
            </div>
          </div>
          <button
            onClick={fetchSupplierBills}
            className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-100 font-semibold rounded-xl transition-all duration-200 shadow-sm text-xs sm:text-sm"
          >
            <FiRefreshCw
              className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${load ? "animate-spin" : ""}`}
            />
            <span className="hidden xs:inline">Refresh</span>
          </button>
        </div>

        {/* Stats Cards - Stack vertically on mobile */}
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
                    <p className="text-sm sm:text-lg md:text-xl font-bold text-black mt-0.5 sm:mt-1 truncate">
                      {stat.value}
                    </p>
                    {stat.subtext && (
                      <p className="text-[8px] sm:text-[9px] text-gray-400 mt-0.5">
                        {stat.subtext}
                      </p>
                    )}
                  </div>
                  <div className="bg-gray-100 p-2 sm:p-2.5 rounded-xl border-2 border-gray-300 flex-shrink-0">
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-black" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Search + Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-5">
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-56 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-black/50 w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <input
                type="text"
                placeholder="Search supplier..."
                value={supplierFilter}
                onChange={(e) => setSupplierFilter(e.target.value)}
                className="w-full pl-8 sm:pl-9 pr-8 py-2 sm:py-2.5 bg-white border-2 border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1 transition-all duration-200 text-black placeholder:text-black/50 text-xs sm:text-sm"
              />
              {supplierFilter && (
                <button
                  onClick={() => setSupplierFilter("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-black/40 hover:text-black/70"
                >
                  <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              )}
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl font-semibold text-xs sm:text-sm transition-all duration-200 border-2 ${
                showFilters || activeFilterCount > 0
                  ? "bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-200"
                  : "bg-white border-gray-300 text-gray-600 hover:bg-gray-100 hover:border-gray-400"
              }`}
            >
              <FiFilter className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Filters</span>
              {activeFilterCount > 0 && (
                <span className="bg-white text-emerald-600 text-[10px] sm:text-xs w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center font-bold">
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
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
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
            {supplierFilter && (
              <span className="inline-flex items-center gap-0.5 sm:gap-1 px-2 sm:px-3 py-0.5 sm:py-1 bg-emerald-100 text-emerald-700 text-[10px] sm:text-xs font-medium rounded-full border border-emerald-200">
                {supplierFilter}
                <button
                  onClick={() => setSupplierFilter("")}
                  className="hover:text-emerald-900"
                >
                  <X className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                </button>
              </span>
            )}
            {startDate && (
              <span className="inline-flex items-center gap-0.5 sm:gap-1 px-2 sm:px-3 py-0.5 sm:py-1 bg-blue-100 text-blue-700 text-[10px] sm:text-xs font-medium rounded-full border border-blue-200">
                From {dayjs(startDate).format("DD/MM/YY")}
                <button
                  onClick={() => setStartDate(null)}
                  className="hover:text-blue-900"
                >
                  <X className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                </button>
              </span>
            )}
            {endDate && (
              <span className="inline-flex items-center gap-0.5 sm:gap-1 px-2 sm:px-3 py-0.5 sm:py-1 bg-blue-100 text-blue-700 text-[10px] sm:text-xs font-medium rounded-full border border-blue-200">
                To {dayjs(endDate).format("DD/MM/YY")}
                <button
                  onClick={() => setEndDate(null)}
                  className="hover:text-blue-900"
                >
                  <X className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                </button>
              </span>
            )}
          </div>
        )}

        <Loading load={load} />

        {/* Results Count */}
        <div className="flex items-center justify-between mb-2 sm:mb-3 px-1">
          <p className="text-[10px] sm:text-sm text-gray-500">
            <span className="font-semibold text-gray-700">
              {filteredData.length}
            </span>{" "}
            suppliers found
          </p>
          <p className="text-[10px] sm:text-sm text-gray-400">
            Page {currentPage} of {totalPages || 1}
          </p>
        </div>

        {/* Card List - Vertical on mobile */}
        <div className="space-y-2 sm:space-y-2.5">
          {load ? (
            <div className="flex flex-col items-center justify-center py-12 sm:py-16 bg-gray-100 rounded-2xl border-2 border-gray-300 shadow-sm">
              <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-emerald-300 border-t-emerald-500 rounded-full animate-spin" />
              <p className="text-xs sm:text-sm text-gray-500 mt-3 sm:mt-4">
                Loading supplier bills...
              </p>
            </div>
          ) : currentSuppliers.length === 0 ? (
            <div className="bg-gray-100 rounded-2xl border-2 border-gray-300 shadow-sm py-12 sm:py-16 text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 border-2 border-gray-300">
                <Package className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
              </div>
              <p className="text-sm sm:text-base text-gray-700 font-medium">
                No suppliers found
              </p>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Try adjusting your filters
              </p>
            </div>
          ) : (
            currentSuppliers.map((supplier, idx) => {
              const isExpanded = expandedSuppliers[supplier.supplierId];
              const isFullyPaid = supplier.totalRemainingBalance <= 0;

              return (
                <div
                  key={supplier.supplierId}
                  className="bg-gray-200 rounded-xl border-2 border-gray-300 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all duration-300 overflow-hidden"
                >
                  {/* Card Header */}
                  <div className="p-3 sm:p-4">
                    <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-2">
                      {/* Left: Supplier Info */}
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0 w-full xs:w-auto">
                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-emerald-200 flex items-center justify-center flex-shrink-0 border-2 border-emerald-300">
                          <Building className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-700" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                            <span className="text-xs sm:text-sm font-semibold text-gray-800 truncate max-w-[100px] xs:max-w-[150px] sm:max-w-[200px]">
                              {supplier.supplierName}
                            </span>
                            <span className="text-[9px] sm:text-[10px] text-gray-600 bg-white px-1.5 py-0.5 rounded border border-gray-300 flex-shrink-0">
                              #{idx + 1}
                            </span>
                            <span
                              className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[8px] sm:text-[10px] font-semibold border-2 flex-shrink-0 ${
                                isFullyPaid
                                  ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                                  : "bg-yellow-100 text-yellow-700 border-yellow-200"
                              }`}
                            >
                              {isFullyPaid ? "Fully Paid" : "Pending"}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 sm:gap-2 text-[9px] sm:text-[10px] text-gray-500 mt-0.5 flex-wrap">
                            <span className="flex items-center gap-0.5">
                              <User className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                              {supplier.createdBy || "—"}
                            </span>
                            <span className="w-0.5 h-0.5 bg-gray-400 rounded-full" />
                            <span className="flex items-center gap-0.5">
                              <Package className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                              {supplier.items.length} items
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center gap-1.5 sm:gap-2 w-full xs:w-auto justify-end">
                        {/* Financial Summary - Mobile */}
                        <div className="text-right mr-1 sm:mr-2">
                          <div className="text-xs sm:text-sm font-bold text-gray-800">
                            {formatCurrency(supplier.totalRemainingBalance)}
                          </div>
                          <span className="text-[8px] sm:text-[9px] text-gray-500">
                            of {formatCurrency(supplier.totalBilledAmount)}
                          </span>
                        </div>

                        {/* Expand Button */}
                        <button
                          onClick={() =>
                            toggleSupplierExpansion(supplier.supplierId)
                          }
                          className="p-1.5 sm:p-2 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-100 transition-all duration-200 flex-shrink-0"
                        >
                          {isExpanded ? (
                            <ChevronDownIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600" />
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600" />
                          )}
                        </button>

                        {/* Pay Button */}
                        {!isFullyPaid && canPayBilledGrn && (
                          <button
                            onClick={() => openPaymentDialog(supplier)}
                            className="px-2.5 sm:px-4 py-1 sm:py-1.5 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold rounded-lg text-[9px] sm:text-xs transition-all duration-200 shadow-sm flex items-center gap-1 sm:gap-1.5 flex-shrink-0"
                          >
                            <span>Pay</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Progress Bar - Mobile friendly */}
                    {!isFullyPaid && (
                      <div className="mt-2">
                        <div className="h-1.5 bg-white/60 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-yellow-400 to-emerald-500 rounded-full transition-all"
                            style={{
                              width: `${supplier.totalBilledAmount > 0 ? (supplier.totalPaidAmount / supplier.totalBilledAmount) * 100 : 0}%`,
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Expanded Items */}
                  {isExpanded && (
                    <div className="px-3 sm:px-4 pb-3 sm:pb-4">
                      <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="bg-gray-100">
                                <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-left text-[8px] sm:text-[9px] font-bold text-gray-700 uppercase border-r border-gray-200">
                                  Item
                                </th>
                                <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-left text-[8px] sm:text-[9px] font-bold text-gray-700 uppercase border-r border-gray-200">
                                  Date
                                </th>
                                <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-center text-[8px] sm:text-[9px] font-bold text-gray-700 uppercase border-r border-gray-200">
                                  Qty
                                </th>
                                <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-right text-[8px] sm:text-[9px] font-bold text-gray-700 uppercase border-r border-gray-200">
                                  Price
                                </th>
                                <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-right text-[8px] sm:text-[9px] font-bold text-gray-700 uppercase border-r border-gray-200">
                                  Total
                                </th>
                                <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-right text-[8px] sm:text-[9px] font-bold text-gray-700 uppercase border-r border-gray-200">
                                  Paid
                                </th>
                                <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-right text-[8px] sm:text-[9px] font-bold text-gray-700 uppercase border-r border-gray-200">
                                  Remaining
                                </th>
                                <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-center text-[8px] sm:text-[9px] font-bold text-gray-700 uppercase">
                                  Status
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {supplier.items.map((item, itemIdx) => {
                                const remaining =
                                  calculateItemRemainingBalance(item);
                                const isPaid = isItemFullyPaid(item);

                                return (
                                  <tr
                                    key={itemIdx}
                                    className="border-t border-gray-100 hover:bg-gray-50"
                                  >
                                    <td className="px-2 sm:px-3 py-1.5 text-[9px] sm:text-[10px] font-medium text-gray-800 border-r border-gray-100">
                                      {item.name}
                                    </td>
                                    <td className="px-2 sm:px-3 py-1.5 text-[9px] sm:text-[10px] text-gray-600 border-r border-gray-100">
                                      {formatDate(item.createdAt)}
                                    </td>
                                    <td className="px-2 sm:px-3 py-1.5 text-[9px] sm:text-[10px] text-center text-gray-700 border-r border-gray-100">
                                      {item.quantity}
                                    </td>
                                    <td className="px-2 sm:px-3 py-1.5 text-[9px] sm:text-[10px] text-right text-gray-700 border-r border-gray-100">
                                      {formatCurrency(item.buyingPrice || 0)}
                                    </td>
                                    <td className="px-2 sm:px-3 py-1.5 text-[9px] sm:text-[10px] text-right font-semibold text-gray-800 border-r border-gray-100">
                                      {formatCurrency(
                                        item.billedTotalCost || 0,
                                      )}
                                    </td>
                                    <td className="px-2 sm:px-3 py-1.5 text-[9px] sm:text-[10px] text-right text-emerald-600 border-r border-gray-100">
                                      {formatCurrency(item.paidAmount || 0)}
                                    </td>
                                    <td className="px-2 sm:px-3 py-1.5 text-[9px] sm:text-[10px] text-right font-bold text-red-600 border-r border-gray-100">
                                      {formatCurrency(remaining)}
                                    </td>
                                    <td className="px-2 sm:px-3 py-1.5 text-center">
                                      <span
                                        className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[7px] sm:text-[8px] font-semibold border ${
                                          isPaid
                                            ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                                            : "bg-yellow-100 text-yellow-700 border-yellow-200"
                                        }`}
                                      >
                                        {isPaid ? "Paid" : "Pending"}
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
        {filteredData.length > 0 && (
          <div className="mt-3 sm:mt-4 bg-white px-3 sm:px-5 py-2.5 sm:py-4 rounded-xl border-2 border-gray-200 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-3">
            <span className="text-[9px] sm:text-xs text-gray-500 text-center sm:text-left">
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
              suppliers
            </span>
            {renderPagination(currentPage, totalPages, setCurrentPage)}
          </div>
        )}

        {/* Payment Dialog Modal */}
        {paymentDialogOpen && selectedSupplier && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 z-10 bg-white px-6 sm:px-8 py-5 border-b-2 border-gray-200 rounded-t-2xl">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-xl shadow-lg shadow-yellow-200">
                      <Package className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-800">
                        Make Payment
                      </h2>
                      <p className="text-sm text-gray-500">
                        {selectedSupplier.supplierName}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setPaymentDialogOpen(false);
                      setSelectedSupplier(null);
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 sm:p-8 space-y-4">
                {/* Balance Summary */}
                <div className="bg-gray-100 rounded-xl p-4 border-2 border-gray-300 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600 font-medium">
                      Total Billed
                    </span>
                    <span className="text-sm font-bold text-gray-800">
                      {formatCurrency(selectedSupplier.totalBilledAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600 font-medium">
                      Amount Paid
                    </span>
                    <span className="text-sm font-bold text-emerald-600">
                      {formatCurrency(selectedSupplier.totalPaidAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t-2 border-gray-300">
                    <span className="text-xs font-semibold text-gray-700">
                      Remaining Balance
                    </span>
                    <span className="text-sm font-bold text-red-600">
                      {formatCurrency(selectedSupplier.totalRemainingBalance)}
                    </span>
                  </div>
                </div>

                {/* Payment Input */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Payment Amount <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-500">
                      TSh
                    </span>
                    <input
                      type="text"
                      value={formatNumber(bulkPaymentAmount)}
                      onChange={(e) => {
                        const rawValue = unformatNumber(e.target.value);
                        if (!/^\d*\.?\d*$/.test(rawValue)) return;
                        setBulkPaymentAmount(rawValue);
                      }}
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:border-transparent text-black bg-white"
                      placeholder="0.00"
                    />
                  </div>
                  <button
                    onClick={() =>
                      setBulkPaymentAmount(
                        selectedSupplier.totalRemainingBalance.toString(),
                      )
                    }
                    className="text-xs text-emerald-600 font-semibold mt-1.5 hover:text-emerald-700 transition-colors"
                  >
                    Pay full balance
                  </button>
                </div>

                {/* Info Note */}
                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl px-4 py-3 flex items-start gap-2">
                  <span className="text-blue-500 text-sm">ℹ️</span>
                  <p className="text-xs text-blue-800">
                    Payment will be applied to oldest items first (FIFO)
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => {
                      setPaymentDialogOpen(false);
                      setSelectedSupplier(null);
                    }}
                    className="flex-1 px-6 py-2.5 bg-white border-2 border-gray-300 text-gray-600 font-semibold rounded-xl hover:bg-gray-100 hover:border-gray-400 transition-all duration-200 text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleSupplierPayment(selectedSupplier)}
                    disabled={
                      !bulkPaymentAmount || parseFloat(bulkPaymentAmount) <= 0
                    }
                    className={`flex-1 px-6 py-2.5 font-semibold rounded-xl text-sm transition-all duration-300 border-2 ${
                      bulkPaymentAmount && parseFloat(bulkPaymentAmount) > 0
                        ? "bg-yellow-400 hover:bg-yellow-500 border-yellow-500 text-black shadow-md hover:shadow-lg hover:shadow-yellow-200 hover:scale-[1.02] active:scale-95"
                        : "bg-gray-200 border-gray-300 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    Process Payment
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MadeniNonPo;
