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
  FiDollarSign,
} from "react-icons/fi";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import Loading from "../../../../Components/Shared/Loading";
import BASE_URL from "../../../../Utils/config";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";

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

  return (
    <div className="p-2 sm:p-3 md:p-4 lg:p-5 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-black">
            Supplier Payments
          </h1>
          <p className="text-gray-600 text-xs hidden sm:block">
            Track and manage supplier bill payments (FIFO)
          </p>
        </div>
        <button
          onClick={fetchSupplierBills}
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
            Total Billed
          </p>
          <p className="text-xs sm:text-sm md:text-base font-bold text-black truncate">
            {totalDebt.toLocaleString()}
          </p>
          <p className="text-[9px] text-gray-400">Tsh</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-full p-2.5 sm:p-3 shadow-sm text-center">
          <p className="text-[10px] sm:text-xs text-gray-500 font-medium mb-0.5">
            Pending
          </p>
          <p className="text-xs sm:text-sm md:text-base font-bold text-red-600 truncate">
            {totalRemaining.toLocaleString()}
          </p>
          <p className="text-[9px] text-gray-400">Tsh</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-full p-2.5 sm:p-3 shadow-sm text-center">
          <p className="text-[10px] sm:text-xs text-gray-500 font-medium mb-0.5">
            Paid
          </p>
          <p className="text-xs sm:text-sm md:text-base font-bold text-green-600 truncate">
            {totalPaid.toLocaleString()}
          </p>
          <p className="text-[9px] text-gray-400">Tsh</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-full p-2.5 sm:p-3 shadow-sm text-center">
          <p className="text-[10px] sm:text-xs text-gray-500 font-medium mb-0.5">
            Suppliers
          </p>
          <div className="flex items-center justify-center gap-1.5">
            <span className="text-xs sm:text-sm font-bold text-yellow-600">
              {suppliersWithBalance}
            </span>
            <span className="text-gray-400 text-[10px]">/</span>
            <span className="text-xs sm:text-sm font-bold text-green-600">
              {suppliersFullyPaid}
            </span>
          </div>
          <p className="text-[9px] text-gray-400">pending/paid</p>
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
            value={supplierFilter}
            onChange={(e) => setSupplierFilter(e.target.value)}
            className="w-full pl-9 sm:pl-11 pr-8 py-2.5 sm:py-3 text-sm border border-gray-300 rounded-full bg-white text-black focus:border-green-300 focus:outline-none focus:ring-2 focus:ring-green-100"
          />
          {supplierFilter && (
            <button
              onClick={() => setSupplierFilter("")}
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
                  value={endDate}
                  onChange={setEndDate}
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
          {supplierFilter && (
            <span className="inline-flex items-center px-2.5 py-1 bg-green-100 text-green-800 text-[10px] font-medium rounded-full">
              {supplierFilter}
              <button onClick={() => setSupplierFilter("")} className="ml-1">
                <FiX className="w-3 h-3" />
              </button>
            </span>
          )}
          {startDate && (
            <span className="inline-flex items-center px-2.5 py-1 bg-blue-100 text-blue-800 text-[10px] font-medium rounded-full">
              From {dayjs(startDate).format("DD/MM")}
              <button onClick={() => setStartDate(null)} className="ml-1">
                <FiX className="w-3 h-3" />
              </button>
            </span>
          )}
          {endDate && (
            <span className="inline-flex items-center px-2.5 py-1 bg-blue-100 text-blue-800 text-[10px] font-medium rounded-full">
              To {dayjs(endDate).format("DD/MM")}
              <button onClick={() => setEndDate(null)} className="ml-1">
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
          <span className="font-bold text-black">{filteredData.length}</span>{" "}
          suppliers
        </p>
        <p className="text-[10px] text-gray-400">
          Page {currentPage} of {totalPages || 1}
        </p>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-2 mb-4">
        {currentSuppliers.length === 0 ? (
          <div className="bg-white rounded-xl p-6 text-center border border-gray-200">
            <div className="text-3xl mb-2">📦</div>
            <p className="text-sm font-bold text-black">No suppliers found</p>
            <p className="text-xs text-gray-500">Try adjusting filters</p>
          </div>
        ) : (
          currentSuppliers.map((supplier, idx) => {
            const isExpanded = expandedSuppliers[supplier.supplierId];

            return (
              <div
                key={supplier.supplierId}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm"
              >
                {/* Card Header */}
                <div
                  className="p-3 bg-gradient-to-r from-green-100 to-green-200 cursor-pointer"
                  onClick={() => toggleSupplierExpansion(supplier.supplierId)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm flex-shrink-0">
                        <span className="text-sm font-bold text-black">
                          {(currentPage - 1) * itemsPerPage + idx + 1}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-black truncate">
                          {supplier.supplierName}
                        </p>
                        <p className="text-[10px] text-gray-600">
                          {supplier.items.length} items • {supplier.createdBy}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          supplier.totalRemainingBalance > 0
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-300 text-green-900"
                        }`}
                      >
                        {supplier.totalRemainingBalance > 0
                          ? "Pending"
                          : "Paid"}
                      </span>
                      {isExpanded ? (
                        <FiChevronUp className="text-gray-500" size={18} />
                      ) : (
                        <FiChevronDown className="text-gray-500" size={18} />
                      )}
                    </div>
                  </div>

                  {/* Amount Summary */}
                  <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center">
                      <p className="text-gray-500 text-[10px]">Billed</p>
                      <p className="font-bold text-black">
                        {supplier.totalBilledAmount.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-500 text-[10px]">Paid</p>
                      <p className="font-bold text-green-600">
                        {supplier.totalPaidAmount.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-500 text-[10px]">Remaining</p>
                      <p className="font-bold text-red-600">
                        {supplier.totalRemainingBalance.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-2 h-1.5 bg-white/50 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-yellow-400 to-green-500 rounded-full transition-all"
                      style={{
                        width: `${supplier.totalBilledAmount > 0 ? (supplier.totalPaidAmount / supplier.totalBilledAmount) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="p-3 space-y-3">
                    {/* Payment Button */}
                    {supplier.totalRemainingBalance > 0 && canPayBilledGrn && (
                      <button
                        onClick={() => openPaymentDialog(supplier)}
                        className="w-full py-2.5 bg-yellow-100 hover:bg-yellow-200 text-black font-bold rounded-full text-sm transition-colors flex items-center justify-center gap-2"
                      >
                        <FiDollarSign size={16} />
                        Make Payment
                      </button>
                    )}

                    {/* Items List */}
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-black">
                        Items ({supplier.items.length})
                      </p>
                      {supplier.items.map((item, itemIdx) => {
                        const remaining = calculateItemRemainingBalance(item);
                        const isPaid = isItemFullyPaid(item);

                        return (
                          <div
                            key={itemIdx}
                            className="bg-gray-50 rounded-lg p-2.5 space-y-1"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-black">
                                {item.name}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  isPaid
                                    ? "bg-green-200 text-green-800"
                                    : "bg-yellow-200 text-yellow-800"
                                }`}
                              >
                                {isPaid ? "Paid" : "Pending"}
                              </span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-[10px]">
                              <div>
                                <span className="text-gray-500">Qty:</span>
                                <span className="font-medium text-black ml-1">
                                  {item.quantity}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-500">Price:</span>
                                <span className="font-medium text-black ml-1">
                                  Tsh {(item.buyingPrice || 0).toLocaleString()}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-500">Total:</span>
                                <span className="font-medium text-black ml-1">
                                  Tsh{" "}
                                  {(item.billedTotalCost || 0).toLocaleString()}
                                </span>
                              </div>
                            </div>
                            <div className="flex justify-between text-[10px] pt-1 border-t border-gray-200">
                              <span className="text-gray-500">
                                Paid:{" "}
                                <span className="font-medium text-green-600">
                                  Tsh {(item.paidAmount || 0).toLocaleString()}
                                </span>
                              </span>
                              <span className="text-gray-500">
                                Remaining:{" "}
                                <span className="font-medium text-red-600">
                                  Tsh {remaining.toLocaleString()}
                                </span>
                              </span>
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

      {/* Desktop Table View */}
      <div className="hidden md:block rounded-xl shadow bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-200">
                {[
                  "SN",
                  "Supplier",
                  "Created By",
                  "Billed",
                  "Paid",
                  "Remaining",
                  "Items",
                  "Status",
                  "Action",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-3 py-3 text-center text-xs font-bold text-black uppercase border-r border-gray-300"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tr className="h-3" />

            <tbody>
              {currentSuppliers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-12">
                    <div className="space-y-3">
                      <div className="text-4xl">📦</div>
                      <p className="text-lg font-bold text-black">
                        No suppliers found
                      </p>
                      <p className="text-gray-600 text-sm">
                        Try adjusting your search filters
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                currentSuppliers.map((supplier, idx) => {
                  const isExpanded = expandedSuppliers[supplier.supplierId];

                  return (
                    <React.Fragment key={supplier.supplierId}>
                      <tr className="hover:bg-gray-50 transition-colors shadow-md">
                        <td className="py-3 px-2 text-center border-r border-gray-300 bg-gray-200">
                          <button
                            onClick={() =>
                              toggleSupplierExpansion(supplier.supplierId)
                            }
                            className="w-8 h-8 bg-green-300 hover:bg-green-400 text-black font-bold rounded-full shadow transition-colors flex items-center justify-center"
                          >
                            {(currentPage - 1) * itemsPerPage + idx + 1}
                          </button>
                        </td>
                        <td className="py-3 px-2 text-center bg-green-200 border-r border-gray-200">
                          <button
                            onClick={() =>
                              toggleSupplierExpansion(supplier.supplierId)
                            }
                            className="font-bold text-black text-xs hover:bg-green-300 px-2 py-1 rounded-full transition-colors"
                          >
                            {isExpanded ? "▼" : "▶"} {supplier.supplierName}
                          </button>
                        </td>
                        <td className="py-3 px-2 text-center bg-gray-100 border-r border-gray-200">
                          <span className="font-bold text-black text-xs">
                            {supplier.createdBy}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-center bg-yellow-100 border-r border-gray-200">
                          <span className="font-bold text-black text-xs">
                            {supplier.totalBilledAmount.toLocaleString()}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-center bg-gray-100 border-r border-gray-200">
                          <span className="font-bold text-green-700 text-xs">
                            {supplier.totalPaidAmount.toLocaleString()}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-center bg-green-200 border-r border-gray-200">
                          <span
                            className={`inline-block px-3 py-1 font-bold rounded-full text-xs ${
                              supplier.totalRemainingBalance > 0
                                ? "bg-red-100 text-red-700"
                                : "bg-green-300 text-green-900"
                            }`}
                          >
                            {supplier.totalRemainingBalance.toLocaleString()}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-center bg-gray-100 border-r border-gray-200">
                          <div className="w-8 h-8 bg-green-300 rounded-full flex items-center justify-center mx-auto">
                            <span className="font-bold text-black text-xs">
                              {supplier.items.length}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-2 text-center bg-gray-200 border-r border-gray-200">
                          <span
                            className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${
                              supplier.totalRemainingBalance > 0
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-green-300 text-green-900"
                            }`}
                          >
                            {supplier.totalRemainingBalance > 0
                              ? "Pending"
                              : "Fully Paid"}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-center bg-gray-100">
                          {supplier.totalRemainingBalance > 0 &&
                          canPayBilledGrn ? (
                            <button
                              onClick={() => openPaymentDialog(supplier)}
                              className="px-3 py-1.5 bg-yellow-100 hover:bg-yellow-200 text-black font-bold rounded-full text-xs transition-colors"
                            >
                              Pay
                            </button>
                          ) : supplier.totalRemainingBalance <= 0 ? (
                            <span className="inline-flex px-3 py-1.5 bg-green-300 text-black font-bold rounded-full text-xs">
                              Paid
                            </span>
                          ) : (
                            <span className="inline-flex px-3 py-1.5 bg-gray-300 text-gray-600 font-bold rounded-full text-xs">
                              Not Allowed
                            </span>
                          )}
                        </td>
                      </tr>

                      {/* Expanded Items */}
                      {isExpanded && (
                        <tr>
                          <td colSpan={9} className="p-0">
                            <div className="p-4 bg-gray-50 border-t border-gray-200">
                              <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
                                <table className="min-w-full text-sm">
                                  <thead>
                                    <tr className="bg-gray-100">
                                      {[
                                        "Item",
                                        "Date",
                                        "Qty",
                                        "Price",
                                        "Total",
                                        "Paid",
                                        "Remaining",
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
                                    {supplier.items.map((item, itemIdx) => {
                                      const remaining =
                                        calculateItemRemainingBalance(item);
                                      const isPaid = isItemFullyPaid(item);

                                      return (
                                        <tr
                                          key={itemIdx}
                                          className="border-t border-gray-100 hover:bg-gray-50"
                                        >
                                          <td className="px-3 py-2 font-medium text-xs text-black">
                                            {item.name}
                                          </td>
                                          <td className="px-3 py-2 text-xs text-gray-600">
                                            {item.createdAt
                                              ? dayjs(item.createdAt).format(
                                                  "DD/MM/YY",
                                                )
                                              : "—"}
                                          </td>
                                          <td className="px-3 py-2 text-xs text-black">
                                            {item.quantity}
                                          </td>
                                          <td className="px-3 py-2 text-xs text-black">
                                            {(
                                              item.buyingPrice || 0
                                            ).toLocaleString()}
                                          </td>
                                          <td className="px-3 py-2 font-bold text-xs text-black">
                                            {(
                                              item.billedTotalCost || 0
                                            ).toLocaleString()}
                                          </td>
                                          <td className="px-3 py-2 text-xs text-green-600">
                                            {(
                                              item.paidAmount || 0
                                            ).toLocaleString()}
                                          </td>
                                          <td className="px-3 py-2 font-bold text-xs text-red-600">
                                            {remaining.toLocaleString()}
                                          </td>
                                          <td className="px-3 py-2">
                                            <span
                                              className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                                isPaid
                                                  ? "bg-green-200 text-green-800"
                                                  : "bg-yellow-200 text-yellow-800"
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
                          </td>
                        </tr>
                      )}

                      <tr className="h-3">
                        <td colSpan={9} className="p-0"></td>
                      </tr>
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-2 mt-3 sm:mt-4 p-3 bg-white rounded-full border border-gray-200 shadow-sm">
          <button
            onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
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
            onClick={() =>
              currentPage < totalPages && setCurrentPage(currentPage + 1)
            }
            disabled={currentPage === totalPages}
            className="p-2 bg-gray-100 hover:bg-gray-200 text-black rounded-full disabled:opacity-40"
          >
            <IoIosArrowForward className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Payment Dialog Modal */}
      {paymentDialogOpen && selectedSupplier && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-xl overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
              <h3 className="font-bold text-black text-sm sm:text-base">
                Payment to {selectedSupplier.supplierName}
              </h3>
              <button
                onClick={() => {
                  setPaymentDialogOpen(false);
                  setSelectedSupplier(null);
                }}
                className="text-gray-500 hover:text-gray-700 p-2"
              >
                <FiX size={20} />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Balance Summary */}
              <div className="space-y-2">
                <div className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-full">
                  <span className="text-xs text-gray-700 font-medium">
                    Total Billed
                  </span>
                  <span className="text-sm font-bold text-black">
                    Tsh {selectedSupplier.totalBilledAmount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-full">
                  <span className="text-xs text-gray-700 font-medium">
                    Amount Paid
                  </span>
                  <span className="text-sm font-bold text-green-600">
                    Tsh {selectedSupplier.totalPaidAmount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-full">
                  <span className="text-xs text-gray-700 font-medium">
                    Remaining
                  </span>
                  <span className="text-sm font-bold text-red-600">
                    Tsh{" "}
                    {selectedSupplier.totalRemainingBalance.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Payment Input */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Payment Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 font-medium">
                    Tsh
                  </span>
                  <input
                    type="text"
                    value={formatNumber(bulkPaymentAmount)}
                    onChange={(e) => {
                      const rawValue = unformatNumber(e.target.value);
                      if (!/^\d*\.?\d*$/.test(rawValue)) return;
                      setBulkPaymentAmount(rawValue);
                    }}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-full text-base focus:outline-none focus:ring-2 focus:ring-green-200 text-black"
                    placeholder="0.00"
                  />
                </div>
                <button
                  onClick={() =>
                    setBulkPaymentAmount(
                      selectedSupplier.totalRemainingBalance.toString(),
                    )
                  }
                  className="text-xs text-green-600 font-medium mt-1 hover:text-green-700"
                >
                  Pay full balance
                </button>
              </div>

              {/* Info Note */}
              <div className="bg-blue-50 border border-blue-200 rounded-full px-3 py-2 flex items-center gap-2">
                <span className="text-blue-500 text-xs">ℹ️</span>
                <p className="text-blue-800 text-xs">
                  Payment will be applied to oldest items first (FIFO)
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setPaymentDialogOpen(false);
                    setSelectedSupplier(null);
                  }}
                  className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-black font-medium rounded-full text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSupplierPayment(selectedSupplier)}
                  disabled={
                    !bulkPaymentAmount || parseFloat(bulkPaymentAmount) <= 0
                  }
                  className={`flex-1 py-3 font-medium rounded-full text-sm transition-colors ${
                    bulkPaymentAmount && parseFloat(bulkPaymentAmount) > 0
                      ? "bg-green-300 hover:bg-green-400 text-black"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
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
  );
};

export default MadeniNonPo;
