import axios from "axios";
import { useEffect, useState } from "react";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { FaSearch, FaFilter } from "react-icons/fa";
import { FiRefreshCw, FiDownload, FiCalendar, FiUsers } from "react-icons/fi";
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
        toast.success("Sales data loaded successfully!");
      }
    } catch (err) {
      console.error("Failed to load transactions:", err);
      toast.error(err.response?.data?.message || "Failed to load transactions");
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
        dayjs(txn.createdAt).isSameOrAfter(dayjs(startDate), "day")
      );
    }

    if (endDate) {
      filtered = filtered.filter((txn) =>
        dayjs(txn.createdAt).isSameOrBefore(dayjs(endDate), "day")
      );
    }

    if (cashier) {
      filtered = filtered.filter((txn) => txn.createdBy?._id === cashier);
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (txn) =>
          txn.customerDetails.name
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          txn.customerDetails.phone.includes(searchQuery) ||
          txn.items.some((item) =>
            item.item.name.toLowerCase().includes(searchQuery.toLowerCase())
          )
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

  //Export Excel
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
      toast.success("Excel report downloaded!");
    } catch (error) {
      toast.error("Failed to export Excel");
    }
  };

  //Export Pdf
  const exportToPDF = () => {
    try {
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text("Sales Report", 14, 15);
      doc.setFontSize(10);
      doc.text(`Generated: ${dayjs().format("DD/MM/YYYY HH:mm")}`, 14, 22);
      doc.text(`Total Records: ${filteredTransactions.length}`, 14, 29);

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
      toast.success("PDF report downloaded!");
    } catch (error) {
      toast.error("Failed to export PDF");
    }
  };

  // Pagination
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentTransactions = filteredTransactions.slice(
    indexOfFirst,
    indexOfLast
  );
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);

  const alieUza = [
    ...new Map(
      transactions
        .filter((txn) => txn.createdBy && txn.createdBy._id)
        .map((txn) => [txn.createdBy._id, txn.createdBy])
    ).values(),
  ];

  const clearFilters = () => {
    setStatusFilter("All");
    setStartDate(null);
    setEndDate(null);
    setCashier("");
    setSearchQuery("");
    toast.success("Filters cleared!");
  };

  return (
    <div className="p-5 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-black mb-1">Sales Report</h1>
          <p className="text-gray-600 text-sm">
            View and analyze all sales transactions
          </p>
        </div>
        <button
          onClick={fetchTransactions}
          className="mt-3 md:mt-0 px-4 py-2 bg-green-300 hover:bg-green-400 text-black font-bold rounded-full shadow hover:shadow-md transition-all duration-200 flex items-center gap-2 text-sm"
        >
          <FiRefreshCw className={`w-4 h-4 ${load ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Compact Stats */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row items-center justify-between bg-white border border-gray-200 rounded-full p-4 shadow-sm">
          <div className="flex items-center gap-3 mb-3 sm:mb-0">
            <div className="text-center px-3">
              <p className="text-xs text-gray-500 font-medium">Total Paid</p>
              <p className="text-base font-bold text-black">
                Tsh {totals.paid.toLocaleString()}
              </p>
            </div>

            <div className="h-6 w-px bg-gray-300"></div>

            <div className="text-center px-3">
              <p className="text-xs text-gray-500 font-medium">Total Billed</p>
              <p className="text-base font-bold text-green-600">
                Tsh {totals.bill.toLocaleString()}
              </p>
            </div>

            <div className="h-6 w-px bg-gray-300"></div>

            <div className="text-center px-3">
              <p className="text-xs text-gray-500 font-medium">
                Total Discount
              </p>
              <p className="text-base font-bold text-yellow-600">
                Tsh {totals.discount.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-xs font-medium text-gray-700">Paid: </span>
              <span className="font-bold text-black text-sm">
                {filteredTransactions.filter((t) => t.status === "Paid").length}
              </span>
            </div>

            <div className="h-4 w-px bg-gray-300"></div>

            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span className="text-xs font-medium text-gray-700">
                Billed:{" "}
              </span>
              <span className="font-bold text-black text-sm">
                {filteredTransactions.filter((t) => t.status === "Bill").length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search - Organized Layout */}
      <div className="mb-6 rounded-xl p-5 shadow-lg bg-white border border-gray-100">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-green-100 rounded-lg">
            <FaFilter className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 className="text-base font-bold text-black">Filters & Search</h3>
            <p className="text-xs text-gray-600">
              Filter transactions by various criteria
            </p>
          </div>
        </div>

        {/* Main Filters - First Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Transaction Status
            </label>
            <div className="flex gap-2">
              {["All", "Paid", "Bill"].map((status) => (
                <button
                  key={status}
                  className={`px-4 py-2.5 text-sm font-bold rounded-full transition-all duration-200 flex-1 ${
                    statusFilter === status
                      ? "bg-green-300 text-black shadow-lg transform scale-105"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md"
                  }`}
                  onClick={() => setStatusFilter(status)}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Date Range
            </label>
            <div className="grid grid-cols-2 gap-2">
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="From"
                  value={startDate}
                  onChange={setStartDate}
                  slotProps={{
                    textField: {
                      size: "small",
                      sx: {
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "12px",
                          fontSize: "14px",
                        },
                      },
                      className: "bg-white",
                      InputProps: {
                        startAdornment: (
                          <FiCalendar className="w-4 h-4 text-gray-400 mr-2" />
                        ),
                      },
                    },
                  }}
                />
              </LocalizationProvider>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="To"
                  value={endDate}
                  onChange={setEndDate}
                  slotProps={{
                    textField: {
                      size: "small",
                      sx: {
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "12px",
                          fontSize: "14px",
                        },
                      },
                      className: "bg-white",
                      InputProps: {
                        startAdornment: (
                          <FiCalendar className="w-4 h-4 text-gray-400 mr-2" />
                        ),
                      },
                    },
                  }}
                />
              </LocalizationProvider>
            </div>
          </div>

          {/* Search */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Quick Search
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-4 flex items-center">
                <FaSearch className="w-4 h-4 text-gray-500" />
              </div>
              <input
                type="text"
                placeholder="Customer, phone, items..."
                className="w-full pl-11 pr-4 py-3 text-sm border border-gray-300 rounded-xl bg-white text-black focus:border-green-300 focus:outline-none focus:ring-2 focus:ring-green-100 transition-all duration-300"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute inset-y-0 right-4 flex items-center text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <span className="text-xl leading-none">×</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Secondary Filters & Actions - Second Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Cashier Filter */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Filter by Cashier
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-4 flex items-center">
                <FiUsers className="w-4 h-4 text-gray-500" />
              </div>
              <select
                value={cashier}
                onChange={(e) => setCashier(e.target.value)}
                className="w-full pl-11 pr-4 py-3 text-sm border border-gray-300 rounded-xl bg-white text-black focus:border-green-300 focus:outline-none focus:ring-2 focus:ring-green-100 appearance-none transition-all duration-300"
              >
                <option value="">All Cashiers</option>
                {alieUza.map((u, idx) => (
                  <option key={idx} value={u._id}>
                    {u.firstName} {u.lastName}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-end gap-3">
            <div className="flex gap-2 flex-1">
              <button
                onClick={clearFilters}
                className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-black font-bold rounded-xl transition-all duration-300 shadow-sm hover:shadow-md flex items-center justify-center gap-2"
              >
                <span>Clear Filters</span>
              </button>
              <button
                onClick={exportToExcel}
                className="flex-1 px-4 py-3 bg-yellow-100 hover:bg-yellow-200 text-black font-bold rounded-xl transition-all duration-300 shadow-sm hover:shadow-md flex items-center justify-center gap-2"
              >
                <FiDownload className="w-4 h-4" />
                <span>Excel</span>
              </button>
              <button
                onClick={exportToPDF}
                className="flex-1 px-4 py-3 bg-green-300 hover:bg-green-400 text-black font-bold rounded-xl transition-all duration-300 shadow-sm hover:shadow-md flex items-center justify-center gap-2"
              >
                <FiDownload className="w-4 h-4" />
                <span>PDF</span>
              </button>
            </div>
          </div>
        </div>

        {/* Active Filters Indicator */}
        <div className="mt-5 pt-5 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-600">
                Active filters:
              </span>
              <div className="flex flex-wrap gap-2">
                {statusFilter !== "All" && (
                  <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                    Status: {statusFilter}
                  </span>
                )}
                {(startDate || endDate) && (
                  <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                    Date Range:{" "}
                    {startDate ? dayjs(startDate).format("DD/MM/YY") : ""} -{" "}
                    {endDate ? dayjs(endDate).format("DD/MM/YY") : ""}
                  </span>
                )}
                {cashier && (
                  <span className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                    Cashier: {alieUza.find((u) => u._id === cashier)?.firstName}
                  </span>
                )}
                {searchQuery && (
                  <span className="inline-flex items-center px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                    Search: {searchQuery}
                  </span>
                )}
              </div>
            </div>
            <div className="text-xs text-gray-500">
              {filteredTransactions.length} of {transactions.length}{" "}
              transactions
            </div>
          </div>
        </div>
      </div>

      <Loading load={load} />

      {/* Table Container */}
      <div className="rounded-xl shadow bg-white overflow-hidden">
        {/* Table */}
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
                  "Total Amount",
                  "Discount",
                  "Cashier",
                  "Billing Cashier",
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
                  <>
                    <tr
                      key={txn._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      {/* Date Column - Gray 200 */}
                      <td className="py-3 px-2 text-center bg-gray-200 border-r border-gray-300">
                        <span className="font-bold text-black text-sm">
                          {dayjs(txn.createdAt).format("DD/MM/YYYY HH:mm")}
                        </span>
                      </td>

                      {/* Customer Column - Gray 100 */}
                      <td className="py-3 px-2 text-center bg-gray-100 border-r border-gray-200">
                        <span className="font-bold text-black text-sm">
                          {txn.customerDetails.name || "Walk-in Customer"}
                        </span>
                      </td>

                      {/* Phone Column - Green 200 */}
                      <td className="py-3 px-2 text-center bg-green-200 border-r border-gray-200">
                        <span className="font-bold text-black text-sm">
                          {txn.customerDetails.phone || "-"}
                        </span>
                      </td>

                      {/* Items Column - Original Beautiful Design */}
                      <td className="py-3 px-2 border-r border-gray-200">
                        <div className="items-center text-center">
                          <div className="">
                            <ul className="space-y-1">
                              {txn.items.map((i) => (
                                <li
                                  key={i.item._id}
                                  className="flex items-center text-sm text-gray-700 bg-gray-100 py-1 px-1 rounded-full shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)] mt-2"
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
                        </div>
                      </td>

                      {/* Status Column - Color coded */}
                      <td className="py-3 px-2 text-center border-r border-gray-200">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                            txn.status === "Paid"
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {txn.status}
                        </span>
                      </td>

                      {/* Total Amount Column - Original Beautiful Design */}
                      <td className="py-3 px-2 text-center border-r border-gray-200">
                        <div className="flex flex-col space-y-2 max-w-xs bg-gradient-to-r from-yellow-100 via-yellow-50 to-yellow-100 rounded-xl p-4 shadow-lg">
                          {txn.status === "Bill" ? (
                            <>
                              <div className="flex items-center gap-2">
                                <MdReceipt className="text-yellow-500 text-md" />
                                <span className="text-yellow-700 font-semibold tracking-wide">
                                  Bill:
                                </span>
                                <span className="ml-auto font-bold text-yellow-800 text-md">
                                  {txn.totalAmount.toLocaleString()} Tsh
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <MdPayment className="text-black text-md" />
                                <span className="text-green-700 font-semibold tracking-wide">
                                  Paid:
                                </span>
                                <span className="ml-auto font-bold text-green-800 text-md">
                                  {txn.paidAmount?.toLocaleString() || 0} Tsh
                                </span>
                              </div>

                              <div className="flex items-center gap-2">
                                <MdPayment className="text-black text-md" />
                                <span className="text-green-700 font-semibold tracking-wide">
                                  OverAll:
                                </span>
                                <span className="ml-auto font-bold text-green-800 text-md">
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
                                <span className="text-green-700 font-semibold tracking-wide">
                                  Paid:
                                </span>
                                <span className="ml-auto font-extrabold text-green-900 text-sm">
                                  {(
                                    txn.paidAmount || txn.totalAmount
                                  ).toLocaleString()}{" "}
                                  Tsh
                                </span>
                              </div>

                              <div className="flex items-center gap-2 bg-gray-200 rounded-full px-4 py-2 shadow-md">
                                <span className="text-green-700 font-semibold tracking-wide">
                                  OverAll:
                                </span>
                                <span className="ml-auto font-extrabold text-black text-sm">
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

                      {/* Discount Column - Yellow 100 */}
                      <td className="py-3 px-2 text-center bg-yellow-100 border-r border-gray-200">
                        <span className="font-bold text-black text-sm">
                          {txn.tradeDiscount.toLocaleString()}
                        </span>
                      </td>

                      {/* Cashier Column - Gray 100 */}
                      <td className="py-3 px-2 text-center bg-gray-100 border-r border-gray-200">
                        <span className="font-bold text-black text-sm">
                          {txn.createdBy
                            ? `${txn.createdBy.firstName} ${txn.createdBy.lastName}`
                            : "-"}
                        </span>
                      </td>

                      {/* Billing Cashier Column - Gray 200 */}
                      <td className="py-3 px-2 text-center bg-gray-200">
                        <span className="font-bold text-black text-sm">
                          {txn.lastModifiedBy
                            ? `${txn.lastModifiedBy.firstName} ${txn.lastModifiedBy.lastName}`
                            : "-"}
                        </span>
                      </td>
                    </tr>
                    <tr className="h-3">
                      <td colSpan={9} className="p-0"></td>
                    </tr>
                  </>
                ))
              )}
            </tbody>

            {/* Totals Footer - Original Beautiful Design */}
            <tfoot>
              <tr className="bg-gradient-to-r from-green-50 to-green-100 text-sm font-semibold text-green-800 border-t border-green-200">
                <td></td>
                <td></td>
                <td></td>
                <td
                  colSpan="5"
                  className="text-right p-3 pr-6 uppercase tracking-wider"
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
                  className="text-right p-3 pr-6 uppercase tracking-wider"
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
                  className="text-right p-3 pr-6 uppercase tracking-wider"
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

        {/* Compact Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t border-gray-300 bg-gray-50">
            <div className="text-xs text-gray-700">
              <span className="font-bold text-black">
                Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                {Math.min(
                  currentPage * itemsPerPage,
                  filteredTransactions.length
                )}
              </span>{" "}
              of{" "}
              <span className="font-bold text-black">
                {filteredTransactions.length}
              </span>{" "}
              transactions
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() =>
                  currentPage > 1 && setCurrentPage(currentPage - 1)
                }
                disabled={currentPage === 1}
                className="p-2 bg-gray-200 hover:bg-gray-300 text-black font-bold rounded-full disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <IoIosArrowBack className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1">
                {[...Array(totalPages)].map((_, i) => {
                  const pageNum = i + 1;
                  const isCurrent = currentPage === pageNum;
                  const showPage =
                    pageNum === 1 ||
                    pageNum === totalPages ||
                    (pageNum >= currentPage - 1 && pageNum <= currentPage + 1);

                  if (showPage) {
                    return (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-8 h-8 text-xs font-bold rounded-full transition-colors ${
                          isCurrent
                            ? "bg-green-300 text-black shadow"
                            : "text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  } else if (
                    (pageNum === currentPage - 2 ||
                      pageNum === currentPage + 2) &&
                    totalPages > 5
                  ) {
                    return (
                      <span
                        key={i}
                        className="px-2 text-gray-500 font-bold text-xs"
                      >
                        ...
                      </span>
                    );
                  }
                  return null;
                })}
              </div>

              <button
                onClick={() =>
                  currentPage < totalPages && setCurrentPage(currentPage + 1)
                }
                disabled={currentPage === totalPages}
                className="p-2 bg-gray-200 hover:bg-gray-300 text-black font-bold rounded-full disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
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
