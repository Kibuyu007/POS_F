import React from "react";
import axios from "axios";
import { useEffect, useState } from "react";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { FaSearch, FaFilter } from "react-icons/fa";
import {
  FiRefreshCw,
  FiDownload,
  FiX,
} from "react-icons/fi";
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
  const itemsPerPage = 10;
  const [totals, setTotals] = useState({ paid: 0, bill: 0, discount: 0 });
  const [statusFilter, setStatusFilter] = useState("All");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [load, setLoad] = useState(false);
  const [cashier, setCashier] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setLoad(true);
    try {
      const res = await axios.get(`${BASE_URL}/api/transactions/all`);
      if (res.data.success) {
        setTransactions(res.data.data);
        setFilteredTransactions(res.data.data);
        calculateTotals(res.data.data);
        toast.success("Sales data loaded!");
      }
    } catch (err) {
      console.error("Failed to load transactions:", err);
      toast.error(err.response?.data?.message || "Failed to load");
    } finally {
      setLoad(false);
    }
  };

  useEffect(() => {
    filterData();
  }, [statusFilter, startDate, endDate, cashier, searchQuery]);

  const filterData = () => {
    let filtered = [...transactions];

    if (statusFilter !== "All") {
      filtered = filtered.filter((txn) => txn.status === statusFilter);
    }

    if (startDate) {
      filtered = filtered.filter((txn) =>
        dayjs(txn.createdAt).isSameOrAfter(dayjs(startDate), "day"),
      );
    }

    if (endDate) {
      filtered = filtered.filter((txn) =>
        dayjs(txn.createdAt).isSameOrBefore(dayjs(endDate), "day"),
      );
    }

    if (cashier) {
      filtered = filtered.filter((txn) => txn.createdBy?._id === cashier);
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (txn) =>
          txn.customerDetails?.name
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          txn.customerDetails?.phone?.includes(searchQuery) ||
          txn.items.some((item) =>
            item.item.name.toLowerCase().includes(searchQuery.toLowerCase()),
          ),
      );
    }

    setFilteredTransactions(filtered);
    calculateTotals(filtered);
    setCurrentPage(1);
  };

  const calculateTotals = (data) => {
    let paid = 0;
    let bill = 0;
    let discount = 0;

    data.forEach((txn) => {
      const paidAmount = Number(txn.paidAmount) || 0;
      const totalAmount = Number(txn.totalAmount) || 0;
      const tradeDiscount = Number(txn.tradeDiscount) || 0;

      if (txn.status === "Paid") {
        paid += paidAmount || totalAmount;
      }

      if (txn.status === "Bill") {
        bill += totalAmount;
        paid += paidAmount;
      }

      discount += tradeDiscount;
    });

    setTotals({ paid, bill, discount });
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
        `${txn.totalAmount.toLocaleString()} Tsh`,
        `${(txn.paidAmount || txn.totalAmount).toLocaleString()} Tsh`,
        `${txn.tradeDiscount.toLocaleString()} Tsh`,
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

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentTransactions = filteredTransactions.slice(
    indexOfFirst,
    indexOfLast,
  );
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);

  const alieUza = [
    ...new Map(
      transactions
        .filter((txn) => txn.createdBy && txn.createdBy._id)
        .map((txn) => [txn.createdBy._id, txn.createdBy]),
    ).values(),
  ];

  const clearFilters = () => {
    setStatusFilter("All");
    setStartDate(null);
    setEndDate(null);
    setCashier("");
    setSearchQuery("");
    toast.success("Cleared!");
  };

  const activeFilterCount = [
    statusFilter !== "All",
    startDate || endDate,
    cashier,
    searchQuery,
  ].filter(Boolean).length;

  return (
    <div className="p-2 sm:p-3 md:p-4 lg:p-5 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-black">
            Report Ya Mauzo
          </h1>
          <p className="text-gray-600 text-xs hidden sm:block">
            View and analyze all sales transactions
          </p>
        </div>
        <button
          onClick={fetchTransactions}
          className="px-3 py-2 bg-green-300 hover:bg-green-400 text-black font-bold rounded-full shadow text-xs flex items-center gap-1.5 flex-shrink-0"
        >
          <FiRefreshCw
            className={`w-3.5 h-3.5 ${load ? "animate-spin" : ""}`}
          />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* Stats Cards - Mobile Friendly */}
      <div className="grid grid-cols-3 gap-2 mb-3 sm:mb-4">
        <div className="bg-white border border-gray-200 rounded-full p-2.5 sm:p-3 shadow-sm text-center">
          <p className="text-[10px] sm:text-xs text-gray-500 font-medium mb-0.5">
            Paid
          </p>
          <p className="text-xs sm:text-sm md:text-base font-bold text-black truncate">
            {totals.paid.toLocaleString()}
          </p>
          <p className="text-[9px] text-gray-400">Tsh</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-full p-2.5 sm:p-3 shadow-sm text-center">
          <p className="text-[10px] sm:text-xs text-gray-500 font-medium mb-0.5">
            Billed
          </p>
          <p className="text-xs sm:text-sm md:text-base font-bold text-green-600 truncate">
            {totals.bill.toLocaleString()}
          </p>
          <p className="text-[9px] text-gray-400">Tsh</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-full p-2.5 sm:p-3 shadow-sm text-center">
          <p className="text-[10px] sm:text-xs text-gray-500 font-medium mb-0.5">
            Discount
          </p>
          <p className="text-xs sm:text-sm md:text-base font-bold text-yellow-600 truncate">
            {totals.discount.toLocaleString()}
          </p>
          <p className="text-[9px] text-gray-400">Tsh</p>
        </div>
      </div>

      {/* Quick Status Filter + Search Bar */}
      <div className="flex gap-2 mb-3 sm:mb-4">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-3 flex items-center">
            <FaSearch className="w-3.5 h-3.5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-9 pr-8 py-2.5 text-sm border border-gray-300 rounded-full bg-white text-black focus:border-green-300 focus:outline-none focus:ring-2 focus:ring-green-100"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 right-3 flex items-center text-gray-400"
            >
              <FiX className="w-4 h-4" />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`px-3 py-2.5 rounded-full border font-bold text-sm flex items-center gap-1.5 flex-shrink-0 transition-all ${
            showFilters || activeFilterCount > 0
              ? "bg-green-300 border-green-400 text-black"
              : "bg-white border-gray-300 text-gray-700"
          }`}
        >
          <FaFilter className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Filters</span>
          {activeFilterCount > 0 && (
            <span className="bg-black text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Status Pills - Always Visible */}
      <div className="flex gap-2 mb-3 sm:mb-4 overflow-x-auto pb-1 scrollbar-hide">
        {["All", "Paid", "Bill"].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all flex-shrink-0 ${
              statusFilter === status
                ? "bg-black text-white shadow-md"
                : "bg-white border border-gray-200 text-gray-600"
            }`}
          >
            {status}
            <span className="ml-1.5 opacity-70">
              {status === "All"
                ? filteredTransactions.length
                : filteredTransactions.filter((t) => t.status === status)
                    .length}
            </span>
          </button>
        ))}
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

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              Cashier
            </label>
            <select
              value={cashier}
              onChange={(e) => setCashier(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-xl bg-white focus:border-green-300 focus:outline-none"
            >
              <option value="">All Cashiers</option>
              {alieUza.map((u, idx) => (
                <option key={idx} value={u._id}>
                  {u.firstName} {u.lastName}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2 pt-2 border-t border-gray-100">
            <button
              onClick={clearFilters}
              className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-black font-bold rounded-xl text-xs"
            >
              Clear All
            </button>
            <button
              onClick={exportToExcel}
              className="flex-1 py-2.5 bg-yellow-100 hover:bg-yellow-200 text-black font-bold rounded-xl text-xs flex items-center justify-center gap-1"
            >
              <FiDownload className="w-3.5 h-3.5" /> Excel
            </button>
            <button
              onClick={exportToPDF}
              className="flex-1 py-2.5 bg-green-300 hover:bg-green-400 text-black font-bold rounded-xl text-xs flex items-center justify-center gap-1"
            >
              <FiDownload className="w-3.5 h-3.5" /> PDF
            </button>
          </div>
        </div>
      )}

      {/* Active Filter Chips */}
      {activeFilterCount > 0 && !showFilters && (
        <div className="flex flex-wrap gap-1.5 mb-3 sm:mb-4">
          {statusFilter !== "All" && (
            <span className="inline-flex items-center px-2.5 py-1 bg-green-100 text-green-800 text-[10px] font-medium rounded-full">
              {statusFilter}
              <button onClick={() => setStatusFilter("All")} className="ml-1">
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
          {cashier && (
            <span className="inline-flex items-center px-2.5 py-1 bg-purple-100 text-purple-800 text-[10px] font-medium rounded-full">
              {alieUza.find((u) => u._id === cashier)?.firstName}
              <button onClick={() => setCashier("")} className="ml-1">
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
          <span className="font-bold text-black">
            {filteredTransactions.length}
          </span>{" "}
          results
        </p>
        <p className="text-[10px] text-gray-400">
          Page {currentPage} of {totalPages || 1}
        </p>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-2 mb-4">
        {currentTransactions.length === 0 ? (
          <div className="bg-white rounded-xl p-6 text-center border border-gray-200">
            <div className="text-3xl mb-2">📊</div>
            <p className="text-sm font-bold text-black">No transactions</p>
            <p className="text-xs text-gray-500">Try adjusting filters</p>
          </div>
        ) : (
          currentTransactions.map((txn) => (
            <div
              key={txn._id}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm"
            >
              {/* Card Header */}
              <div className="flex items-center justify-between p-3 bg-gray-50 border-b border-gray-100">
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

              {/* Items */}
              <div className="p-3">
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

                {/* Amount Section */}
                <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg p-2.5 space-y-1.5">
                  {txn.status === "Bill" ? (
                    <>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Bill:</span>
                        <span className="font-bold text-yellow-700">
                          {txn.totalAmount.toLocaleString()} Tsh
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Paid:</span>
                        <span className="font-bold text-green-700">
                          {txn.paidAmount?.toLocaleString() || 0} Tsh
                        </span>
                      </div>
                      <div className="flex justify-between text-xs pt-1 border-t border-yellow-200">
                        <span className="text-gray-600 font-medium">
                          Total:
                        </span>
                        <span className="font-bold text-black">
                          {(
                            (txn.totalAmount || 0) + (txn.tradeDiscount || 0)
                          ).toLocaleString()}{" "}
                          Tsh
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Paid:</span>
                        <span className="font-bold text-green-700">
                          {(txn.paidAmount || txn.totalAmount).toLocaleString()}{" "}
                          Tsh
                        </span>
                      </div>
                      <div className="flex justify-between text-xs pt-1 border-t border-yellow-200">
                        <span className="text-gray-600 font-medium">
                          Total:
                        </span>
                        <span className="font-bold text-black">
                          {(
                            (txn.paidAmount || 0) + (txn.tradeDiscount || 0)
                          ).toLocaleString()}{" "}
                          Tsh
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                  <span className="text-[10px] text-gray-500">
                    {txn.createdBy ? `${txn.createdBy.firstName}` : "-"}
                  </span>
                  <span className="text-[10px] text-yellow-600 font-medium">
                    Disc: {txn.tradeDiscount.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Table View */}
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
              {currentTransactions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-12">
                    <div className="space-y-3">
                      <div className="text-4xl">📊</div>
                      <p className="text-lg font-bold text-black">
                        No sales transactions found
                      </p>
                      <p className="text-gray-600 text-sm">
                        Try adjusting your search filters
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                currentTransactions.map((txn) => (
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
                                  {txn.totalAmount.toLocaleString()} Tsh
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <MdPayment className="text-black text-sm" />
                                <span className="text-green-700 font-semibold text-xs tracking-wide">
                                  Paid:
                                </span>
                                <span className="ml-auto font-bold text-green-800 text-xs">
                                  {txn.paidAmount?.toLocaleString() || 0} Tsh
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <MdPayment className="text-black text-sm" />
                                <span className="text-green-700 font-semibold text-xs tracking-wide">
                                  OverAll:
                                </span>
                                <span className="ml-auto font-bold text-green-800 text-xs">
                                  {(
                                    (txn.totalAmount || 0) +
                                    (txn.tradeDiscount || 0)
                                  ).toLocaleString()}{" "}
                                  Tsh
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
                                  ).toLocaleString()}{" "}
                                  Tsh
                                </span>
                              </div>
                              <div className="flex items-center gap-2 bg-gray-200 rounded-full px-4 py-2 shadow-md">
                                <span className="text-green-700 font-semibold text-xs tracking-wide">
                                  OverAll:
                                </span>
                                <span className="ml-auto font-extrabold text-black text-xs">
                                  {(
                                    (txn.paidAmount || 0) +
                                    (txn.tradeDiscount || 0)
                                  ).toLocaleString()}{" "}
                                  Tsh
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
                  {totals.paid.toLocaleString()} Tsh
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
                  {totals.bill.toLocaleString()} Tsh
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
                  {totals.discount.toLocaleString()} Tsh
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-2 mt-3 sm:mt-4 p-3 bg-white rounded-xl border border-gray-200 shadow-sm">
          <button
            onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 bg-gray-100 hover:bg-gray-200 text-black rounded-lg disabled:opacity-40"
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
                  className={`w-8 h-8 text-xs font-bold rounded-lg transition-colors ${currentPage === pageNum ? "bg-black text-white" : "text-gray-700 hover:bg-gray-100"}`}
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
            className="p-2 bg-gray-100 hover:bg-gray-200 text-black rounded-lg disabled:opacity-40"
          >
            <IoIosArrowForward className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default Mauzo;
