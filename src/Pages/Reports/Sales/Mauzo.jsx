import React from "react";
import axios from "axios";
import { useEffect, useState } from "react";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { FaSearch, FaFilter } from "react-icons/fa";
import { FiRefreshCw, FiDownload, FiX } from "react-icons/fi";
import { MdReceipt, MdPayment } from "react-icons/md";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Loading from "../../../Components/Shared/Loading";
import BASE_URL from "../../../Utils/config";
import toast from "react-hot-toast";

const Mauzo = () => {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totals, setTotals] = useState({ paid: 0, bill: 0, discount: 0 });
  const [statusFilter, setStatusFilter] = useState("All");
  const today = dayjs().startOf("day");
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(dayjs());
  const [load, setLoad] = useState(false);
  const [cashier, setCashier] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
    hasNextPage: false,
    hasPrevPage: false,
    nextPage: null,
    prevPage: null,
  });

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async (page = 1, limit = 10) => {
    setLoad(true);
    try {
      const params = new URLSearchParams();
      params.append("page", page);
      params.append("limit", limit);

      if (startDate) {
        params.append("startDate", dayjs(startDate).format("YYYY-MM-DD"));
      }
      if (endDate) {
        params.append("endDate", dayjs(endDate).format("YYYY-MM-DD"));
      }
      if (statusFilter !== "All") {
        params.append("status", statusFilter);
      }
      if (cashier) {
        params.append("cashier", cashier);
      }
      if (searchQuery) {
        params.append("search", searchQuery);
      }

      const res = await axios.get(
        `${BASE_URL}/api/transactions/all?${params.toString()}`,
      );
      if (res.data.success) {
        setTransactions(res.data.data);
        setFilteredTransactions(res.data.data);
        setPagination(res.data.pagination);
        setTotals(res.data.totals || { paid: 0, bill: 0, discount: 0 });
        setCurrentPage(res.data.pagination.currentPage);
        toast.success("Sales data loaded!");
      }
    } catch (err) {
      console.error("Failed to load transactions:", err);
      toast.error(err.response?.data?.message || "Failed to load");
    } finally {
      setLoad(false);
    }
  };

  const fetchFilteredTransactions = async (page = 1, limit = 10) => {
    setLoad(true);
    try {
      const params = new URLSearchParams();
      params.append("page", page);
      params.append("limit", limit);

      if (startDate) {
        params.append("startDate", dayjs(startDate).format("YYYY-MM-DD"));
      }
      if (endDate) {
        params.append("endDate", dayjs(endDate).format("YYYY-MM-DD"));
      }
      if (statusFilter !== "All") {
        params.append("status", statusFilter);
      }
      if (cashier) {
        params.append("cashier", cashier);
      }
      if (searchQuery) {
        params.append("search", searchQuery);
      }

      const res = await axios.get(
        `${BASE_URL}/api/transactions/all?${params.toString()}`,
      );
      if (res.data.success) {
        setTransactions(res.data.data);
        setFilteredTransactions(res.data.data);
        setPagination(res.data.pagination);
        setTotals(res.data.totals || { paid: 0, bill: 0, discount: 0 });
        setCurrentPage(res.data.pagination.currentPage);
      }
    } catch (err) {
      console.error("Failed to load filtered transactions:", err);
      toast.error(err.response?.data?.message || "Failed to load");
    } finally {
      setLoad(false);
    }
  };

  useEffect(() => {
    fetchFilteredTransactions(1, itemsPerPage);
  }, [statusFilter, startDate, endDate, cashier, searchQuery]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchFilteredTransactions(newPage, itemsPerPage);
    }
  };

  const exportToExcel = () => {
    try {
      const wsData = filteredTransactions.map((txn) => ({
        Date: dayjs(txn.createdAt).format("DD/MM/YYYY HH:mm"),
        Customer: txn.customerDetails.name,
        Phone: txn.customerDetails.phone,
        Status: txn.status,
        Items: txn.items
          .map((i) => `${i.item.name} x ${i.quantity}`)
          .join(", "),
        TotalAmount: txn.totalAmount,
        PaidAmount: txn.paidAmount || 0,
        Discount: txn.tradeDiscount || 0,
        Cashier: txn.createdBy
          ? `${txn.createdBy.firstName} ${txn.createdBy.lastName}`
          : "",
      }));

      const ws = XLSX.utils.json_to_sheet(wsData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Transactions");
      XLSX.writeFile(wb, `Sales_Report_${dayjs().format("YYYYMMDD")}.xlsx`);
      toast.success("Excel downloaded!");
    } catch (error) {
      toast.error("Export failed");
    }
  };

  const exportToPDF = () => {
    try {
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text("Sales Report", 14, 15);
      doc.setFontSize(10);
      doc.text(`Generated: ${dayjs().format("DD/MM/YYYY HH:mm")}`, 14, 22);
      doc.text(`Records: ${filteredTransactions.length}`, 14, 29);

      const tableData = filteredTransactions.map((txn) => [
        dayjs(txn.createdAt).format("DD/MM/YY HH:mm"),
        txn.customerDetails.name,
        txn.customerDetails.phone,
        txn.status,
        txn.items.map((i) => `${i.item.name} × ${i.quantity}`).join(", "),
        `${txn.totalAmount.toLocaleString()}`,
        `${(txn.paidAmount || txn.totalAmount).toLocaleString()}`,
        `${txn.tradeDiscount.toLocaleString()}`,
      ]);

      autoTable(doc, {
        startY: 35,
        head: [
          [
            "Date",
            "Customer",
            "Phone",
            "Status",
            "Items",
            "Total",
            "Paid",
            "Discount",
          ],
        ],
        body: tableData,
        headStyles: { fillColor: [34, 197, 94], textColor: 255 },
      });

      doc.save(`Sales_Report_${dayjs().format("YYYYMMDD")}.pdf`);
      toast.success("PDF downloaded!");
    } catch (error) {
      toast.error("Export failed");
    }
  };

  const alieUza = [
    ...new Map(
      transactions
        .filter((txn) => txn.createdBy && txn.createdBy._id)
        .map((txn) => [txn.createdBy._id, txn.createdBy]),
    ).values(),
  ];

  const clearFilters = () => {
    setStatusFilter("All");
    setStartDate(today);
    setEndDate(dayjs());
    setCashier("");
    setSearchQuery("");
    toast.success("Filters cleared!");
  };

  const activeFilterCount = [
    statusFilter !== "All",
    cashier,
    searchQuery,
  ].filter(Boolean).length;

  const isDateFilterDefault =
    startDate &&
    endDate &&
    dayjs(startDate).isSame(today, "day") &&
    dayjs(endDate).isSame(dayjs(), "day");

  const totalActiveFilters = activeFilterCount + (isDateFilterDefault ? 0 : 1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-8xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
        {/* Header - Responsive */}
        <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-300 rounded-2xl flex items-center justify-center shadow-lg shadow-green-200 border-2 border-green-400">
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6 text-black"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 tracking-tight">
                Report Ya Mauzo
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 hidden xs:block">
                View and analyze all sales transactions
              </p>
            </div>
          </div>
          <button
            onClick={() => fetchFilteredTransactions(currentPage, itemsPerPage)}
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-100 font-semibold rounded-xl transition-all duration-200 shadow-sm text-xs sm:text-sm"
          >
            <FiRefreshCw
              className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${load ? "animate-spin" : ""}`}
            />
            <span className="hidden xs:inline">Refresh</span>
          </button>
        </div>

        {/* Stats Cards - Stacked on mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6">
          <div className="bg-white p-3 sm:p-4 md:p-5 rounded-2xl border-2 border-gray-400 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider truncate">
                  Total Paid
                </p>
                <p className="text-base sm:text-lg md:text-xl font-bold text-black mt-0.5 sm:mt-1 truncate">
                  {totals.paid.toLocaleString()}
                </p>
              </div>
              <div className="bg-green-300 p-2 sm:p-2.5 rounded-xl border-2 border-green-400 flex-shrink-0">
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 text-black"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white p-3 sm:p-4 md:p-5 rounded-2xl border-2 border-gray-400 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider truncate">
                  Total Billed
                </p>
                <p className="text-base sm:text-lg md:text-xl font-bold text-black mt-0.5 sm:mt-1 truncate">
                  {totals.bill.toLocaleString()}
                </p>
              </div>
              <div className="bg-green-300 p-2 sm:p-2.5 rounded-xl border-2 border-green-400 flex-shrink-0">
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 text-black"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white p-3 sm:p-4 md:p-5 rounded-2xl border-2 border-gray-400 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider truncate">
                  Total Discount
                </p>
                <p className="text-base sm:text-lg md:text-xl font-bold text-black mt-0.5 sm:mt-1 truncate">
                  {totals.discount.toLocaleString()}
                </p>
              </div>
              <div className="bg-green-300 p-2 sm:p-2.5 rounded-xl border-2 border-green-400 flex-shrink-0">
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 text-black"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Date Range Display - Super Cool with Gradient */}
        <div className="relative mb-4 sm:mb-5 overflow-hidden">
          <div className="bg-gradient-to-r from-green-200 via-yellow-100 to-green-200 rounded-2xl p-3 sm:p-4 border-2 border-gray-300 shadow-md">
            <div className="absolute inset-0 bg-gradient-to-r from-green-300/20 via-transparent to-green-300/20" />
            <div className="relative flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="bg-white/80 backdrop-blur-sm p-2 rounded-xl border border-gray-300 shadow-sm">
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5 text-black"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Date Range
                  </p>
                  <p className="text-xs sm:text-sm font-bold text-black flex items-center gap-2">
                    {dayjs(startDate).format("DD MMM YYYY")}
                    <span className="text-gray-400">→</span>
                    {dayjs(endDate).format("DD MMM YYYY")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isDateFilterDefault && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-300 text-black text-[10px] sm:text-xs font-bold rounded-full border-2 border-green-400 shadow-sm">
                    <span className="w-1.5 h-1.5 bg-black rounded-full" />
                    Today
                  </span>
                )}
                <span className="text-[10px] sm:text-xs text-gray-600 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full border border-gray-300">
                  {pagination.totalItems} transactions
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Status Filter + Search Bar - Responsive */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-5">
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {["All", "Paid", "Bill"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-full text-[9px] sm:text-xs font-semibold transition-all duration-200 border-2 ${
                  statusFilter === status
                    ? "bg-green-300 border-green-300 text-black shadow-md shadow-green-200"
                    : "bg-white border-gray-300 text-gray-500 hover:border-gray-400 hover:text-gray-700 hover:bg-gray-100"
                }`}
              >
                {status}
                <span
                  className={`text-[9px] sm:text-xs ${
                    statusFilter === status ? "text-black/70" : "text-gray-400"
                  }`}
                >
                  (
                  {status === "All"
                    ? pagination.totalItems
                    : filteredTransactions.filter((t) => t.status === status)
                        .length}
                  )
                </span>
              </button>
            ))}
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-56 md:w-64">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-black/50 w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <input
                type="text"
                placeholder="Search sales..."
                className="w-full pl-8 sm:pl-9 pr-8 py-2 sm:py-2.5 bg-white border-2 border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-transparent transition-all duration-200 text-black placeholder:text-black/50 text-xs sm:text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-black/40 hover:text-black/70"
                >
                  <FiX className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              )}
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl font-semibold text-xs sm:text-sm transition-all duration-200 border-2 ${
                showFilters || totalActiveFilters > 0
                  ? "bg-green-300 border-green-300 text-black shadow-md shadow-green-200"
                  : "bg-white border-gray-300 text-gray-600 hover:bg-gray-100 hover:border-gray-400"
              }`}
            >
              <FaFilter className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Filters</span>
              {totalActiveFilters > 0 && (
                <span className="bg-black text-white text-[10px] sm:text-xs w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center font-bold">
                  {totalActiveFilters}
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

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Cashier
              </label>
              <select
                value={cashier}
                onChange={(e) => setCashier(e.target.value)}
                className="w-full px-4 py-2.5 text-sm border-2 border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-transparent transition-all duration-200 text-black"
              >
                <option value="">All Cashiers</option>
                {alieUza.map((u, idx) => (
                  <option key={idx} value={u._id}>
                    {u.firstName} {u.lastName}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-wrap gap-2 pt-2 border-t-2 border-gray-200">
              <button
                onClick={clearFilters}
                className="flex-1 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-xl transition-all duration-200 text-sm"
              >
                Clear All
              </button>
              <button
                onClick={exportToExcel}
                className="flex-1 py-2.5 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold rounded-xl transition-all duration-200 text-sm flex items-center justify-center gap-2"
              >
                <FiDownload className="w-4 h-4" /> Excel
              </button>
              <button
                onClick={exportToPDF}
                className="flex-1 py-2.5 bg-green-300 hover:bg-green-400 text-black font-semibold rounded-xl transition-all duration-200 text-sm flex items-center justify-center gap-2 border-2 border-green-400"
              >
                <FiDownload className="w-4 h-4" /> PDF
              </button>
            </div>
          </div>
        )}

        {/* Active Filter Chips */}
        {totalActiveFilters > 0 && !showFilters && (
          <div className="flex flex-wrap gap-1 sm:gap-1.5 mb-3 sm:mb-4">
            {!isDateFilterDefault && (
              <span className="inline-flex items-center gap-0.5 sm:gap-1 px-2 sm:px-3 py-0.5 sm:py-1 bg-blue-100 text-black text-[10px] sm:text-xs font-medium rounded-full border border-blue-200">
                <svg
                  className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-black"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                {dayjs(startDate).format("DD/MM")} -{" "}
                {dayjs(endDate).format("DD/MM")}
                <button
                  onClick={() => {
                    setStartDate(today);
                    setEndDate(dayjs());
                  }}
                  className="hover:text-black/70"
                >
                  <FiX className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                </button>
              </span>
            )}
            {statusFilter !== "All" && (
              <span className="inline-flex items-center gap-0.5 sm:gap-1 px-2 sm:px-3 py-0.5 sm:py-1 bg-green-100 text-black text-[10px] sm:text-xs font-medium rounded-full border border-green-200">
                {statusFilter}
                <button
                  onClick={() => setStatusFilter("All")}
                  className="hover:text-black/70"
                >
                  <FiX className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                </button>
              </span>
            )}
            {cashier && (
              <span className="inline-flex items-center gap-0.5 sm:gap-1 px-2 sm:px-3 py-0.5 sm:py-1 bg-purple-100 text-black text-[10px] sm:text-xs font-medium rounded-full border border-purple-200">
                {alieUza.find((u) => u._id === cashier)?.firstName}
                <button
                  onClick={() => setCashier("")}
                  className="hover:text-black/70"
                >
                  <FiX className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                </button>
              </span>
            )}
            {searchQuery && (
              <span className="inline-flex items-center gap-0.5 sm:gap-1 px-2 sm:px-3 py-0.5 sm:py-1 bg-gray-100 text-black text-[10px] sm:text-xs font-medium rounded-full border border-gray-200">
                {searchQuery}
                <button
                  onClick={() => setSearchQuery("")}
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
              {pagination.totalItems}
            </span>{" "}
            transactions found
          </p>
          <p className="text-[9px] sm:text-sm text-gray-400">
            Page {pagination.currentPage} of {pagination.totalPages || 1}
          </p>
        </div>

        {/* Mobile Card View - Responsive */}
        <div className="md:hidden space-y-2 sm:space-y-2.5 mb-4">
          {filteredTransactions.length === 0 ? (
            <div className="bg-white rounded-2xl border-2 border-gray-300 shadow-sm py-12 sm:py-16 text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 border-2 border-gray-300">
                <svg
                  className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
                  />
                </svg>
              </div>
              <p className="text-sm sm:text-base text-gray-700 font-medium">
                No transactions found
              </p>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Try adjusting your filters
              </p>
            </div>
          ) : (
            filteredTransactions.map((txn) => (
              <div
                key={txn._id}
                className="bg-white rounded-xl border-2 border-gray-200 shadow-sm hover:shadow-lg hover:border-green-300 transition-all duration-300"
              >
                <div className="p-3 sm:p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={`w-2 h-2 rounded-full flex-shrink-0 ${txn.status === "Paid" ? "bg-green-500" : "bg-yellow-500"}`}
                      />
                      <span className="text-xs font-bold text-black truncate">
                        {txn.customerDetails.name || "Walk-in"}
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-500 flex-shrink-0">
                      {dayjs(txn.createdAt).format("DD/MM HH:mm")}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-2">
                    {txn.items.map((i) => (
                      <span
                        key={i.item._id}
                        className="inline-flex items-center px-2 py-0.5 bg-gray-100 rounded-full text-[10px] text-gray-700"
                      >
                        <span className="w-1 h-1 bg-green-500 rounded-full mr-1" />
                        {i.item.name} ×{i.quantity}
                      </span>
                    ))}
                  </div>

                  <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg p-2.5 space-y-1.5">
                    {txn.status === "Bill" ? (
                      <>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-600">Bill:</span>
                          <span className="font-bold text-yellow-700">
                            {txn.totalAmount.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-600">Paid:</span>
                          <span className="font-bold text-green-700">
                            {txn.paidAmount?.toLocaleString() || 0}
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Paid:</span>
                        <span className="font-bold text-green-700">
                          {(txn.paidAmount || txn.totalAmount).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop Table View - ORIGINAL DESIGN */}
        <div className="hidden md:block rounded-xl shadow bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-200">
                  {[
                    "Date",
                    "Customer",
                    "Phone",
                    "Items",
                    "Status",
                    "Total",
                    "Discount",
                    "Cashier",
                    "Billing",
                  ].map((header, idx) => (
                    <th
                      key={idx}
                      className="px-3 py-3 text-center text-xs font-bold text-black uppercase border-r border-gray-300"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>

              <tr className="h-3" />

              <tbody>
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-12">
                      <div className="space-y-3">
                        <div className="text-4xl">📊</div>
                        <p className="text-lg font-bold text-black">
                          No sales transactions found
                        </p>
                        <p className="text-gray-600 text-sm">
                          Try adjusting your filters
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((txn) => (
                    <React.Fragment key={txn._id}>
                      <tr className="hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-2 text-center bg-gray-200 border-r border-gray-300">
                          <span className="font-bold text-black text-xs">
                            {dayjs(txn.createdAt).format("DD/MM/YYYY HH:mm")}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-center bg-gray-100 border-r border-gray-200">
                          <span className="font-bold text-black text-xs">
                            {txn.customerDetails.name || "Walk-in Customer"}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-center bg-green-200 border-r border-gray-200">
                          <span className="font-bold text-black text-xs">
                            {txn.customerDetails.phone || "-"}
                          </span>
                        </td>
                        <td className="py-3 px-2 border-r border-gray-200">
                          <div className="items-center text-center">
                            <ul className="space-y-1">
                              {txn.items.map((i) => (
                                <li
                                  key={i.item._id}
                                  className="flex items-center text-xs text-gray-700 bg-gray-100 py-1 px-1 rounded-full shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)] mt-2"
                                >
                                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></span>
                                  <span className="font-medium text-gray-800">
                                    {i.item.name || "Unknown Item"}
                                  </span>
                                  <span className="ml-1 text-gray-600">
                                    × {i.quantity}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </td>
                        <td className="py-3 px-2 text-center border-r border-gray-200">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${txn.status === "Paid" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}
                          >
                            {txn.status}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-center border-r border-gray-200">
                          <div className="flex flex-col space-y-2 max-w-xs bg-gradient-to-r from-yellow-100 via-yellow-50 to-yellow-100 rounded-xl p-4 shadow-lg">
                            {txn.status === "Bill" ? (
                              <>
                                <div className="flex items-center gap-2">
                                  <MdReceipt className="text-yellow-500 text-sm" />
                                  <span className="text-yellow-700 font-semibold text-xs tracking-wide">
                                    Bill:
                                  </span>
                                  <span className="ml-auto font-bold text-yellow-800 text-xs">
                                    {txn.totalAmount.toLocaleString()}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <MdPayment className="text-black text-sm" />
                                  <span className="text-green-700 font-semibold text-xs tracking-wide">
                                    Paid:
                                  </span>
                                  <span className="ml-auto font-bold text-green-800 text-xs">
                                    {txn.paidAmount?.toLocaleString() || 0}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 pt-1 border-t border-yellow-200">
                                  <MdPayment className="text-black text-sm" />
                                  <span className="text-gray-700 font-semibold text-xs tracking-wide">
                                    OverAll:
                                  </span>
                                  <span className="ml-auto font-bold text-black text-xs">
                                    {(
                                      (txn.totalAmount || 0) +
                                      (txn.tradeDiscount || 0)
                                    ).toLocaleString()}
                                  </span>
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="flex items-center gap-2 bg-green-100 rounded-full px-4 py-2 shadow-md">
                                  <span className="text-green-700 font-semibold text-xs tracking-wide">
                                    Paid:
                                  </span>
                                  <span className="ml-auto font-extrabold text-green-900 text-xs">
                                    {(
                                      txn.paidAmount || txn.totalAmount
                                    ).toLocaleString()}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 bg-gray-200 rounded-full px-4 py-2 shadow-md">
                                  <span className="text-gray-700 font-semibold text-xs tracking-wide">
                                    OverAll:
                                  </span>
                                  <span className="ml-auto font-extrabold text-black text-xs">
                                    {(
                                      (txn.paidAmount || 0) +
                                      (txn.tradeDiscount || 0)
                                    ).toLocaleString()}
                                  </span>
                                </div>
                              </>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-2 text-center bg-yellow-100 border-r border-gray-200">
                          <span className="font-bold text-black text-xs">
                            {txn.tradeDiscount.toLocaleString()}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-center bg-gray-100 border-r border-gray-200">
                          <span className="font-bold text-black text-xs">
                            {txn.createdBy
                              ? `${txn.createdBy.firstName} ${txn.createdBy.lastName}`
                              : "-"}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-center bg-gray-200">
                          <span className="font-bold text-black text-xs">
                            {txn.lastModifiedBy
                              ? `${txn.lastModifiedBy.firstName} ${txn.lastModifiedBy.lastName}`
                              : "-"}
                          </span>
                        </td>
                      </tr>
                      <tr className="h-3">
                        <td colSpan={9} className="p-0"></td>
                      </tr>
                    </React.Fragment>
                  ))
                )}
              </tbody>

              <tfoot>
                <tr className="bg-gradient-to-r from-green-50 to-green-100 text-sm font-semibold text-green-800 border-t border-green-200">
                  <td></td>
                  <td></td>
                  <td></td>
                  <td
                    colSpan="5"
                    className="text-right p-3 pr-6 uppercase tracking-wider text-xs"
                  >
                    Total Paid:
                  </td>
                  <td className="p-3 text-right text-lg font-bold text-green-600">
                    {totals.paid.toLocaleString()}
                  </td>
                </tr>
                <tr className="bg-gradient-to-r from-yellow-50 to-yellow-100 text-sm font-semibold text-yellow-800 border-t border-yellow-200">
                  <td></td>
                  <td></td>
                  <td></td>
                  <td
                    colSpan="5"
                    className="text-right p-3 pr-6 uppercase tracking-wider text-xs"
                  >
                    Total Billed:
                  </td>
                  <td className="p-3 text-right text-lg font-bold text-yellow-600">
                    {totals.bill.toLocaleString()}
                  </td>
                </tr>
                <tr className="bg-gradient-to-r from-yellow-50 to-yellow-100 text-sm font-semibold text-yellow-800 border-t border-yellow-200">
                  <td></td>
                  <td></td>
                  <td></td>
                  <td
                    colSpan="5"
                    className="text-right p-3 pr-6 uppercase tracking-wider text-xs"
                  >
                    Total Discount:
                  </td>
                  <td className="p-3 text-right text-lg font-bold text-yellow-600">
                    {totals.discount.toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Pagination - Responsive */}
        {pagination.totalPages > 1 && (
          <div className="mt-3 sm:mt-4 bg-white px-3 sm:px-5 py-2.5 sm:py-4 rounded-xl border-2 border-gray-300 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-3">
            <span className="text-[9px] sm:text-xs text-gray-500 text-center sm:text-left">
              Showing{" "}
              <span className="font-semibold text-gray-700">
                {(pagination.currentPage - 1) * itemsPerPage + 1}
              </span>{" "}
              to{" "}
              <span className="font-semibold text-gray-700">
                {Math.min(
                  pagination.currentPage * itemsPerPage,
                  pagination.totalItems,
                )}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-gray-700">
                {pagination.totalItems}
              </span>{" "}
              transactions
            </span>
            <div className="flex items-center gap-1.5 flex-wrap justify-center">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={!pagination.hasPrevPage}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  !pagination.hasPrevPage
                    ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                    : "bg-white border-2 border-gray-300 text-gray-600 hover:bg-gray-100 hover:border-gray-400 shadow-sm"
                }`}
              >
                <IoIosArrowBack className="w-4 h-4" />
              </button>

              {[...Array(Math.min(pagination.totalPages, 5))].map((_, i) => {
                let pageNum;
                const totalPages = pagination.totalPages;
                const currentPageNum = pagination.currentPage;

                if (totalPages <= 5) pageNum = i + 1;
                else if (currentPageNum <= 3) pageNum = i + 1;
                else if (currentPageNum >= totalPages - 2)
                  pageNum = totalPages - 4 + i;
                else pageNum = currentPageNum - 2 + i;

                return (
                  <button
                    key={i}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm border-2 ${
                      pagination.currentPage === pageNum
                        ? "bg-green-300 text-black border-green-300 hover:bg-green-400"
                        : "bg-white border-gray-300 text-gray-600 hover:bg-gray-100 hover:border-gray-400"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={!pagination.hasNextPage}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  !pagination.hasNextPage
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

export default Mauzo;
