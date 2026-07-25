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
import { useSelector } from "react-redux";

const Madeni = () => {
  const user = useSelector((state) => state.user.user);
  const [billedData, setBilledData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [load, setLoad] = useState(false);
  const [deductions, setDeductions] = useState({});
  const today = dayjs().startOf("day");
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(dayjs());
  const [customerFilter, setCustomerFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [totals, setTotals] = useState({ billed: 0, paid: 0, remaining: 0 });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchBilledTransactions();
  }, []);

  const fetchBilledTransactions = async () => {
    setLoad(true);
    try {
      const res = await axios.get(`${BASE_URL}/api/transactions/bill`, {
        withCredentials: true,
      });
      if (res.data.success) {
        setBilledData(res.data.data);
        setFilteredData(res.data.data);
        calculateTotals(res.data.data);
        toast.success("Billed transactions loaded!");
      }
    } catch (error) {
      console.error("Error fetching billed transactions:", error);
      toast.error("Failed to load billed transactions");
    } finally {
      setLoad(false);
    }
  };

  useEffect(() => {
    filterData();
  }, [startDate, endDate, customerFilter]);

  const filterData = () => {
    let filtered = [...billedData];

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

    if (customerFilter) {
      filtered = filtered.filter(
        (txn) =>
          txn.customerDetails?.name
            ?.toLowerCase()
            .includes(customerFilter.toLowerCase()) ||
          txn.customerDetails?.phone?.includes(customerFilter),
      );
    }

    setFilteredData(filtered);
    calculateTotals(filtered);
    setCurrentPage(1);
  };

  const calculateTotals = (data) => {
    let billed = 0;
    let paid = 0;
    let remaining = 0;

    data.forEach((txn) => {
      const totalAmount = Number(txn.totalAmount) || 0;
      const paidAmount = Number(txn.paidAmount) || 0;
      const remainingAmount = totalAmount - paidAmount;

      billed += totalAmount;
      paid += paidAmount;
      remaining += remainingAmount;
    });

    setTotals({ billed, paid, remaining });
  };

  const handleDeduct = async (id) => {
    const amount = parseFloat(deductions[id] || 0);
    if (!amount || amount <= 0) {
      toast.error("Enter valid amount");
      return;
    }

    try {
      const res = await axios.patch(
        `${BASE_URL}/api/transactions/payBill/${id}`,
        { paymentAmount: amount },
        { withCredentials: true },
      );
      if (res.data.success) {
        toast.success("Payment updated!");
        setDeductions((prev) => ({ ...prev, [id]: "" }));
        fetchBilledTransactions();
      }
    } catch (err) {
      console.error("Error deducting amount:", err);
      toast.error("Failed to update payment");
    }
  };

  const exportToExcel = () => {
    try {
      const wsData = filteredData.map((txn) => ({
        Date: dayjs(txn.createdAt).format("DD/MM/YYYY HH:mm"),
        Customer: txn.customerDetails?.name || "-",
        Phone: txn.customerDetails?.phone || "-",
        Items: txn.items
          .map((i) => `${i.item?.name} x ${i.quantity}`)
          .join(", "),
        TotalAmount: txn.totalAmount,
        PaidAmount: txn.paidAmount || 0,
        Remaining: txn.totalAmount - (txn.paidAmount || 0),
        Cashier: txn.createdBy
          ? `${txn.createdBy.firstName} ${txn.createdBy.lastName}`
          : "",
      }));

      const ws = XLSX.utils.json_to_sheet(wsData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "BilledTransactions");
      XLSX.writeFile(wb, `Billed_Report_${dayjs().format("YYYYMMDD")}.xlsx`);
      toast.success("Excel downloaded!");
    } catch (error) {
      toast.error("Export failed");
    }
  };

  const exportToPDF = () => {
    try {
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text("Billed Transactions Report", 14, 15);
      doc.setFontSize(10);
      doc.text(`Generated: ${dayjs().format("DD/MM/YYYY HH:mm")}`, 14, 22);
      doc.text(`Records: ${filteredData.length}`, 14, 29);

      const tableData = filteredData.map((txn) => [
        dayjs(txn.createdAt).format("DD/MM/YY HH:mm"),
        txn.customerDetails?.name || "-",
        txn.customerDetails?.phone || "-",
        txn.items.map((i) => `${i.item?.name} × ${i.quantity}`).join(", "),
        `${txn.totalAmount.toLocaleString()}`,
        `${(txn.paidAmount || 0).toLocaleString()}`,
        `${(txn.totalAmount - (txn.paidAmount || 0)).toLocaleString()}`,
      ]);

      autoTable(doc, {
        startY: 35,
        head: [
          ["Date", "Customer", "Phone", "Items", "Total", "Paid", "Remaining"],
        ],
        body: tableData,
        headStyles: { fillColor: [34, 197, 94], textColor: 255 },
      });

      doc.save(`Billed_Report_${dayjs().format("YYYYMMDD")}.pdf`);
      toast.success("PDF downloaded!");
    } catch (error) {
      toast.error("Export failed");
    }
  };

  const clearFilters = () => {
    setStartDate(today);
    setEndDate(dayjs());
    setCustomerFilter("");
    toast.success("Filters cleared!");
  };

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentTransactions = filteredData.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const canPayBillTransaction = user?.roles?.canPayBillTransaction === true;

  const activeFilterCount = [customerFilter].filter(Boolean).length;

  const isDateFilterDefault =
    startDate &&
    endDate &&
    dayjs(startDate).isSame(today, "day") &&
    dayjs(endDate).isSame(dayjs(), "day");

  const totalActiveFilters = activeFilterCount + (isDateFilterDefault ? 0 : 1);

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
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 tracking-tight">
                Report Ya MADENI
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 hidden xs:block">
                View and manage all billed/credit transactions
              </p>
            </div>
          </div>
          <button
            onClick={fetchBilledTransactions}
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
                  Total Billed
                </p>
                <p className="text-base sm:text-lg md:text-xl font-bold text-black mt-0.5 sm:mt-1 truncate">
                  {totals.billed.toLocaleString()}
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
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                  />
                </svg>
              </div>
            </div>
          </div>

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
                  Total Remaining
                </p>
                <p className="text-base sm:text-lg md:text-xl font-bold text-black mt-0.5 sm:mt-1 truncate">
                  {totals.remaining.toLocaleString()}
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
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Date Range Display */}
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
                  {filteredData.length} transactions
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Search + Filters - Responsive */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-5">
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-56 md:w-64">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-black/50 w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <input
                type="text"
                placeholder="Search customer..."
                className="w-full pl-8 sm:pl-9 pr-8 py-2 sm:py-2.5 bg-white border-2 border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-transparent transition-all duration-200 text-black placeholder:text-black/50 text-xs sm:text-sm"
                value={customerFilter}
                onChange={(e) => setCustomerFilter(e.target.value)}
              />
              {customerFilter && (
                <button
                  onClick={() => setCustomerFilter("")}
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
            {customerFilter && (
              <span className="inline-flex items-center gap-0.5 sm:gap-1 px-2 sm:px-3 py-0.5 sm:py-1 bg-yellow-100 text-black text-[10px] sm:text-xs font-medium rounded-full border border-yellow-200">
                {customerFilter}
                <button
                  onClick={() => setCustomerFilter("")}
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
            results
          </p>
          <p className="text-[9px] sm:text-sm text-gray-400">
            Page {currentPage} of {totalPages || 1}
          </p>
        </div>

        {/* Mobile Card View - Fixed Pay Button */}
        <div className="md:hidden space-y-2 sm:space-y-2.5 mb-4">
          {currentTransactions.length === 0 ? (
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
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <p className="text-sm sm:text-base text-gray-700 font-medium">
                No billed transactions found
              </p>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Try adjusting your filters
              </p>
            </div>
          ) : (
            currentTransactions.map((sale) => {
              const remaining = sale.totalAmount - (sale.paidAmount || 0);
              const canPay = canPayBillTransaction && remaining > 0;

              return (
                <div
                  key={sale._id}
                  className="bg-white rounded-xl border-2 border-gray-200 shadow-sm hover:shadow-lg hover:border-green-300 transition-all duration-300"
                >
                  <div className="p-3 sm:p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-2 h-2 rounded-full bg-yellow-500 flex-shrink-0" />
                        <span className="text-xs font-bold text-black truncate">
                          {sale.customerDetails?.name || "Walk-in"}
                        </span>
                      </div>
                      <span className="text-[10px] text-gray-500 flex-shrink-0">
                        {dayjs(sale.createdAt).format("DD/MM HH:mm")}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-2">
                      {sale.items.slice(0, 3).map((i) => (
                        <span
                          key={i.item._id}
                          className="inline-flex items-center px-2 py-0.5 bg-gray-100 rounded-full text-[10px] text-gray-700 border border-gray-200"
                        >
                          <span className="w-1 h-1 bg-green-500 rounded-full mr-1" />
                          {i.item?.name} ×{i.quantity}
                        </span>
                      ))}
                      {sale.items.length > 3 && (
                        <span className="inline-flex items-center px-2 py-0.5 bg-gray-200 rounded-full text-[10px] text-gray-600">
                          +{sale.items.length - 3}
                        </span>
                      )}
                    </div>

                    <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg p-2.5 space-y-1.5 border border-yellow-200">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Total:</span>
                        <span className="font-bold text-yellow-700">
                          {sale.totalAmount.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Paid:</span>
                        <span className="font-bold text-green-700">
                          {(sale.paidAmount || 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs pt-1 border-t border-yellow-200">
                        <span className="text-gray-600 font-medium">
                          Remaining:
                        </span>
                        <span className="font-bold text-red-600">
                          {remaining.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Pay Section - Fixed for mobile */}
                    {canPay && (
                      <div className="mt-3 pt-2 border-t border-gray-200">
                        <div className="flex flex-col sm:flex-row gap-2">
                          <input
                            type="number"
                            value={deductions[sale._id] || ""}
                            placeholder="Amount"
                            onChange={(e) => {
                              const val = parseFloat(e.target.value);
                              if (val <= remaining || !val) {
                                setDeductions({
                                  ...deductions,
                                  [sale._id]: e.target.value,
                                });
                              } else {
                                toast.error("Exceeds remaining balance");
                              }
                            }}
                            className="flex-1 px-3 py-2 rounded-lg border-2 border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-transparent text-black w-full"
                          />
                          <button
                            onClick={() => handleDeduct(sale._id)}
                            disabled={
                              !deductions[sale._id] ||
                              parseFloat(deductions[sale._id]) <= 0
                            }
                            className="px-4 py-2 bg-green-300 hover:bg-green-400 disabled:bg-gray-300 disabled:cursor-not-allowed text-black font-bold rounded-lg text-sm transition-all duration-200 hover:scale-105 active:scale-95 w-full sm:w-auto"
                          >
                            Pay
                          </button>
                        </div>
                      </div>
                    )}
                    {!canPayBillTransaction && remaining > 0 && (
                      <div className="mt-2 text-center">
                        <span className="inline-flex items-center px-3 py-1 bg-gray-200 text-gray-500 text-xs font-bold rounded-full border border-gray-300">
                          Not Allowed
                        </span>
                      </div>
                    )}
                  </div>
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
                    "Date",
                    "Customer",
                    "Phone",
                    "Items",
                    "Remaining",
                    "Deduct",
                    "Action",
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
                    <td colSpan={8} className="text-center py-12">
                      <div className="space-y-3">
                        <div className="text-4xl">📋</div>
                        <p className="text-lg font-bold text-black">
                          No billed transactions found
                        </p>
                        <p className="text-gray-600 text-sm">
                          Try adjusting your filters
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentTransactions.map((sale, idx) => {
                    const remaining = sale.totalAmount - (sale.paidAmount || 0);
                    const canPay = canPayBillTransaction && remaining > 0;

                    return (
                      <React.Fragment key={sale._id}>
                        <tr className="hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-2 text-center bg-gray-200 border-r border-gray-300">
                            <span className="font-bold text-black text-xs">
                              {(currentPage - 1) * itemsPerPage + idx + 1}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-center bg-gray-100 border-r border-gray-200">
                            <span className="font-bold text-black text-xs">
                              {dayjs(sale.createdAt).format("DD/MM/YYYY HH:mm")}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-center bg-green-200 border-r border-gray-200">
                            <span className="font-bold text-black text-xs">
                              {sale.customerDetails?.name || "-"}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-center bg-gray-100 border-r border-gray-200">
                            <span className="font-bold text-black text-xs">
                              {sale.customerDetails?.phone || "-"}
                            </span>
                          </td>
                          <td className="py-3 px-2 border-r border-gray-200">
                            <div className="items-center text-center">
                              <ul className="space-y-1">
                                {sale.items.map((i) => (
                                  <li
                                    key={i.item._id}
                                    className="flex items-center text-xs text-gray-700 bg-gray-100 py-1 px-1 rounded-full shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)] mt-2"
                                  >
                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></span>
                                    <span className="font-medium text-gray-800">
                                      {i.item?.name}
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
                            <div className="flex flex-col space-y-2 max-w-xs bg-gradient-to-r from-yellow-100 via-yellow-50 to-yellow-100 rounded-xl p-4 shadow-lg">
                              <div className="flex items-center gap-2">
                                <MdReceipt className="text-yellow-500 text-sm" />
                                <span className="text-yellow-700 font-semibold text-xs tracking-wide">
                                  Total:
                                </span>
                                <span className="ml-auto font-bold text-yellow-800 text-xs">
                                  {sale.totalAmount.toLocaleString()}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <MdPayment className="text-black text-sm" />
                                <span className="text-green-700 font-semibold text-xs tracking-wide">
                                  Paid:
                                </span>
                                <span className="ml-auto font-bold text-green-800 text-xs">
                                  {(sale.paidAmount || 0).toLocaleString()}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 bg-red-100 rounded-full px-4 py-2 shadow-md">
                                <span className="text-red-700 font-semibold text-xs tracking-wide">
                                  Remaining:
                                </span>
                                <span className="ml-auto font-extrabold text-red-900 text-xs">
                                  {remaining.toLocaleString()}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-2 text-center bg-gray-100 border-r border-gray-200">
                            {canPay ? (
                              <div className="flex justify-center">
                                <input
                                  type="number"
                                  value={deductions[sale._id] || ""}
                                  onChange={(e) => {
                                    const val = parseFloat(e.target.value);
                                    if (val <= remaining || !val) {
                                      setDeductions({
                                        ...deductions,
                                        [sale._id]: e.target.value,
                                      });
                                    } else {
                                      toast.error(
                                        "Amount cannot exceed remaining balance",
                                      );
                                    }
                                  }}
                                  className="w-32 px-4 py-2 rounded-full border-2 border-gray-300 bg-white text-black text-sm focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-green-300 transition-all duration-300"
                                  placeholder="Amount"
                                />
                              </div>
                            ) : (
                              <span className="inline-flex items-center px-6 py-2.5 bg-gray-300 text-gray-600 font-bold rounded-full border border-gray-400">
                                Not Allowed
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-2 text-center bg-gray-200">
                            <button
                              onClick={() => handleDeduct(sale._id)}
                              disabled={
                                !deductions[sale._id] ||
                                parseFloat(deductions[sale._id]) <= 0 ||
                                !canPay
                              }
                              className="px-6 py-2 bg-green-300 hover:bg-green-400 disabled:bg-gray-300 disabled:cursor-not-allowed text-black font-bold rounded-full shadow hover:shadow-md transition-all duration-200 text-sm hover:scale-105 active:scale-95"
                            >
                              Pay
                            </button>
                          </td>
                        </tr>
                        <tr className="h-3">
                          <td colSpan={8} className="p-0"></td>
                        </tr>
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>

              <tfoot>
                <tr className="bg-gradient-to-r from-yellow-50 to-yellow-100 text-sm font-semibold text-yellow-800 border-t border-yellow-200">
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td
                    colSpan="3"
                    className="text-right p-3 pr-6 uppercase tracking-wider text-xs"
                  >
                    Total Billed:
                  </td>
                  <td className="p-3 text-right text-lg font-bold text-yellow-600">
                    {totals.billed.toLocaleString()}
                  </td>
                </tr>
                <tr className="bg-gradient-to-r from-green-50 to-green-100 text-sm font-semibold text-green-800 border-t border-green-200">
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td
                    colSpan="3"
                    className="text-right p-3 pr-6 uppercase tracking-wider text-xs"
                  >
                    Total Paid:
                  </td>
                  <td className="p-3 text-right text-lg font-bold text-green-600">
                    {totals.paid.toLocaleString()}
                  </td>
                </tr>
                <tr className="bg-gradient-to-r from-red-50 to-red-100 text-sm font-semibold text-red-800 border-t border-red-200">
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td
                    colSpan="3"
                    className="text-right p-3 pr-6 uppercase tracking-wider text-xs"
                  >
                    Total Remaining:
                  </td>
                  <td className="p-3 text-right text-lg font-bold text-red-600">
                    {totals.remaining.toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Pagination - Responsive */}
        {totalPages > 1 && (
          <div className="mt-3 sm:mt-4 bg-white px-3 sm:px-5 py-2.5 sm:py-4 rounded-xl border-2 border-gray-300 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-3">
            <span className="text-[9px] sm:text-xs text-gray-500 text-center sm:text-left">
              Showing{" "}
              <span className="font-semibold text-gray-700">
                {indexOfFirst + 1}
              </span>{" "}
              to{" "}
              <span className="font-semibold text-gray-700">
                {Math.min(indexOfLast, filteredData.length)}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-gray-700">
                {filteredData.length}
              </span>{" "}
              transactions
            </span>
            {renderPagination(currentPage, totalPages, setCurrentPage)}
          </div>
        )}
      </div>
    </div>
  );
};

export default Madeni;
