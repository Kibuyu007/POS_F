import { useEffect, useMemo, useState, useCallback } from "react";
import axios from "axios";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { FaSearch, FaFilter } from "react-icons/fa";
import { FiRefreshCw, FiDownload } from "react-icons/fi";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import BASE_URL from "../../../Utils/config";
import toast from "react-hot-toast";

dayjs.extend(isBetween);

const Profit = () => {
  // ==================== STATE ====================
  const [transactions, setTransactions] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("today");
  const [range, setRange] = useState({ from: "", to: "" });
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // ==================== DATE RANGE ====================
  const getDateRange = useCallback(() => {
    const now = dayjs();
    switch (filter) {
      case "today":
        return { from: now.startOf("day"), to: now.endOf("day") };
      case "yesterday":
        return {
          from: now.subtract(1, "day").startOf("day"),
          to: now.subtract(1, "day").endOf("day"),
        };
      case "week":
        return { from: now.startOf("week"), to: now.endOf("week") };
      case "month":
        return { from: now.startOf("month"), to: now.endOf("month") };
      case "custom": {
        if (!range.from || !range.to) {
          return { from: now.startOf("day"), to: now.endOf("day") };
        }
        const fromDate = dayjs(range.from).startOf("day");
        const toDate = dayjs(range.to).endOf("day");
        return fromDate.isAfter(toDate)
          ? { from: toDate, to: fromDate }
          : { from: fromDate, to: toDate };
      }
      default:
        return { from: now.startOf("day"), to: now.endOf("day") };
    }
  }, [filter, range]);

  const { from, to } = getDateRange();

  // ==================== FETCH DATA ====================
  useEffect(() => {
    const fetchSales = async () => {
      try {
        setLoading(true);
        setError(null);

        const [salesRes, expensesRes] = await Promise.all([
          axios.get(`${BASE_URL}/api/transactions/all`, {
            withCredentials: true,
          }),
          axios.get(`${BASE_URL}/api/manunuzi/matumiziYote`, {
            withCredentials: true,
          }),
        ]);

        // Transactions API returns { success: true, data: [...] }
        if (salesRes.data.success) {
          setTransactions(salesRes.data.data || []);
        }

        // CRITICAL FIX: matumiziYote returns data DIRECTLY as array, NOT wrapped in { success, data }
        // Reference from Home.jsx: setExpenses(expRes.data || []);
        setExpenses(expensesRes.data || []);

        toast.success("Profit data loaded successfully!");
      } catch (err) {
        console.error("Profit fetch error:", err);
        setError(err.response?.data?.message || "Failed to load transactions");
        toast.error(err.response?.data?.message || "Failed to load transactions");
      } finally {
        setLoading(false);
      }
    };

    fetchSales();
  }, []);

  // ==================== FILTERED SALES ====================
  const filteredSales = useMemo(() => {
    let filtered = transactions.filter((tx) =>
      dayjs(tx.createdAt).isBetween(from, to, null, "[]")
    );

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((tx) =>
        tx.items.some((item) =>
          item.item?.name?.toLowerCase().includes(query)
        )
      );
    }

    return filtered;
  }, [transactions, from, to, searchQuery]);

  // ==================== EXPENSES - MATCHING Home.jsx PATTERN ====================
  // CRITICAL FIX: Use createdAt (not date) and amount field - matching your working Home.jsx code
  const totalExpenses = useMemo(() => {
    return expenses
      .filter((e) => dayjs(e.createdAt).isBetween(from, to, null, "[]"))
      .reduce((s, e) => s + Number(e.amount || 0), 0);
  }, [expenses, from, to]);

  // ==================== REPORT DATA ====================
  const reportData = useMemo(() => {
    const rows = [];
    filteredSales.forEach((tx) => {
      const txDiscount = tx.tradeDiscount || 0;
      const txSubTotal =
        tx.subTotal ||
        tx.items.reduce(
          (sum, item) => sum + (item.price || 0) * (item.quantity || 0),
          0
        );

      tx.items.forEach((soldItem) => {
        const qty = soldItem.quantity || 0;
        const sellingPrice = soldItem.price || 0;
        const buyingPrice = soldItem.buyingPrice || 0;
        const itemName = soldItem.item?.name || "Unknown";
        const salesAmount = qty * sellingPrice;
        const buyingAmount = qty * buyingPrice;
        const itemDiscount =
          txSubTotal > 0 ? (salesAmount / txSubTotal) * txDiscount : 0;
        const profit = salesAmount - buyingAmount - itemDiscount;

        rows.push({
          date: tx.createdAt,
          itemName,
          qty,
          sellingPrice,
          buyingPrice,
          salesAmount,
          buyingAmount,
          discount: itemDiscount,
          profit,
          status: tx.status,
        });
      });
    });
    return rows;
  }, [filteredSales]);

  // ==================== TOTALS ====================
  const totals = useMemo(() => {
    return reportData.reduce(
      (acc, row) => {
        acc.sales += row.salesAmount;
        acc.buying += row.buyingAmount;
        acc.discount += row.discount;
        acc.profit += row.profit;
        return acc;
      },
      { sales: 0, buying: 0, discount: 0, profit: 0 }
    );
  }, [reportData]);

  const finalProfit = useMemo(() => {
    return totals.profit - totalExpenses;
  }, [totals, totalExpenses]);

  // ==================== PAGINATION ====================
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentData = reportData.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(reportData.length / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [filter, range, searchQuery]);

  // ==================== EXPORT FUNCTIONS ====================
  const exportToExcel = useCallback(() => {
    try {
      const wsData = reportData.map((row) => ({
        Date: dayjs(row.date).format("DD/MM/YYYY HH:mm"),
        Item: row.itemName,
        Quantity: row.qty,
        "Buying Price": row.buyingPrice.toLocaleString(),
        "Selling Price": row.sellingPrice.toLocaleString(),
        Discount: row.discount.toFixed(2),
        Profit: row.profit.toLocaleString(),
      }));

      const ws = XLSX.utils.json_to_sheet(wsData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Profit Report");
      XLSX.writeFile(wb, `Profit_Report_${dayjs().format("YYYYMMDD")}.xlsx`);
      toast.success("Excel report downloaded!");
    } catch (err) {
      toast.error("Failed to export Excel");
    }
  }, [reportData]);

  const exportToPDF = useCallback(() => {
    try {
      const doc = new jsPDF("landscape");
      doc.setFontSize(16);
      doc.text("Item Profit Report", 14, 15);
      doc.setFontSize(10);
      doc.text(`Generated: ${dayjs().format("DD/MM/YYYY HH:mm")}`, 14, 22);
      doc.text(
        `Period: ${from.format("DD/MM/YYYY")} - ${to.format("DD/MM/YYYY")}`,
        14,
        29
      );

      const tableData = reportData.map((row) => [
        dayjs(row.date).format("DD/MM/YY"),
        row.itemName,
        row.qty.toString(),
        row.buyingPrice.toLocaleString(),
        row.sellingPrice.toLocaleString(),
        row.discount.toFixed(2),
        row.profit.toLocaleString(),
      ]);

      autoTable(doc, {
        startY: 35,
        head: [["Date", "Item", "Qty", "Buying", "Selling", "Discount", "Profit"]],
        body: tableData,
        headStyles: { fillColor: [34, 197, 94], textColor: 255 },
      });

      doc.save(`Profit_Report_${dayjs().format("YYYYMMDD")}.pdf`);
      toast.success("PDF report downloaded!");
    } catch (err) {
      toast.error("Failed to export PDF");
    }
  }, [reportData, from]);

  // ==================== HELPERS ====================
  const filters = [
    { key: "today", label: "Today" },
    { key: "yesterday", label: "Yesterday" },
    { key: "week", label: "This Week" },
    { key: "month", label: "This Month" },
    { key: "custom", label: "Custom" },
  ];

  const getProfitColor = (value) => (value >= 0 ? "text-green-600" : "text-red-600");
  const getProfitBg = (value) => (value >= 0 ? "bg-green-50" : "bg-red-50");

  const formatCurrency = (value) => {
    return `Tsh ${value.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const clearFilters = () => {
    setSearchQuery("");
    setFilter("today");
    setRange({ from: "", to: "" });
    toast.success("Filters cleared!");
  };

  // ==================== RENDER ====================
  return (
    <div className="p-3 sm:p-4 md:p-5 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 md:mb-6 gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
            Item Profit Report
          </h1>
          <p className="text-gray-600 text-xs sm:text-sm">
            Track profit margins across all items
          </p>
        </div>
        <button
          onClick={handleRefresh}
          className="self-start sm:self-auto px-3 py-2 sm:px-4 bg-green-300 hover:bg-green-400 text-black font-bold rounded-full shadow hover:shadow-md transition-all duration-200 flex items-center gap-2 text-xs sm:text-sm"
        >
          <FiRefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Stats Cards */}
      {!loading && !error && reportData.length > 0 && (
        <div className="mb-4 md:mb-6">
          <div className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 w-full">
                <div className="text-center p-2 bg-gray-50 rounded-lg">
                  <p className="text-[10px] sm:text-xs text-gray-500 font-medium uppercase">Total Sales</p>
                  <p className="text-sm sm:text-base font-bold text-gray-900">
                    {formatCurrency(totals.sales)}
                  </p>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded-lg">
                  <p className="text-[10px] sm:text-xs text-gray-500 font-medium uppercase">Total Cost</p>
                  <p className="text-sm sm:text-base font-bold text-red-600">
                    {formatCurrency(totals.buying)}
                  </p>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded-lg">
                  <p className="text-[10px] sm:text-xs text-gray-500 font-medium uppercase">Discounts</p>
                  <p className="text-sm sm:text-base font-bold text-yellow-600">
                    {formatCurrency(totals.discount)}
                  </p>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded-lg">
                  <p className="text-[10px] sm:text-xs text-gray-500 font-medium uppercase">Expenses</p>
                  <p className="text-sm sm:text-base font-bold text-orange-600">
                    {formatCurrency(totalExpenses)}
                  </p>
                  <p className="text-[9px] text-gray-400">{expenses.length} records</p>
                </div>
                <div className={`text-center p-2 rounded-lg col-span-2 sm:col-span-1 lg:col-span-2 ${getProfitBg(finalProfit)}`}>
                  <p className="text-[10px] sm:text-xs text-gray-500 font-medium uppercase">Net Profit</p>
                  <p className={`text-sm sm:text-base font-bold ${getProfitColor(finalProfit)}`}>
                    {formatCurrency(finalProfit)}
                  </p>
                </div>
              </div>
              <div className="hidden lg:flex items-center gap-2 shrink-0">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs font-medium text-gray-700">Profit</span>
                <div className="w-2 h-2 bg-red-500 rounded-full ml-2"></div>
                <span className="text-xs font-medium text-gray-700">Loss</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter Card */}
      <div className="mb-4 md:mb-6 rounded-xl p-3 sm:p-4 md:p-5 shadow-lg bg-white border border-gray-100">
        <div className="flex items-center gap-3 mb-4 md:mb-6">
          <div className="p-2 bg-green-100 rounded-lg">
            <FaFilter className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-gray-900">
              Filters & Date Range
            </h3>
            <p className="text-[10px] sm:text-xs text-gray-600">
              Filter profit data by date period
            </p>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2">
            Time Period
          </label>
          <div className="flex flex-wrap gap-2">
            {filters.map((f) => (
              <button
                key={f.key}
                className={`px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm font-bold rounded-full transition-all duration-200 ${
                  filter === f.key
                    ? "bg-green-300 text-black shadow-lg transform scale-105"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md"
                }`}
                onClick={() => setFilter(f.key)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4">
          {filter === "custom" && (
            <div className="sm:col-span-2 lg:col-span-2">
              <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2">
                Date Range
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="From"
                    value={range.from ? dayjs(range.from) : null}
                    onChange={(newValue) =>
                      setRange({
                        ...range,
                        from: newValue ? newValue.format("YYYY-MM-DD") : "",
                      })
                    }
                    slotProps={{
                      textField: {
                        size: "small",
                        fullWidth: true,
                        sx: {
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "12px",
                            fontSize: "14px",
                          },
                        },
                        className: "bg-white",
                      },
                    }}
                  />
                </LocalizationProvider>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="To"
                    value={range.to ? dayjs(range.to) : null}
                    onChange={(newValue) =>
                      setRange({
                        ...range,
                        to: newValue ? newValue.format("YYYY-MM-DD") : "",
                      })
                    }
                    slotProps={{
                      textField: {
                        size: "small",
                        fullWidth: true,
                        sx: {
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "12px",
                            fontSize: "14px",
                          },
                        },
                        className: "bg-white",
                      },
                    }}
                  />
                </LocalizationProvider>
              </div>
            </div>
          )}

          {filter !== "custom" && (
            <div>
              <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2">
                Period Info
              </label>
              <div className="bg-gray-100 rounded-xl p-2 sm:p-3 text-center">
                <span className="text-xs sm:text-sm font-bold text-gray-900">
                  {from.format("DD/MM/YYYY")} - {to.format("DD/MM/YYYY")}
                </span>
              </div>
            </div>
          )}

          <div className={filter === "custom" ? "sm:col-span-2 lg:col-span-1" : ""}>
            <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2">
              Search Items
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-3 sm:left-4 flex items-center pointer-events-none">
                <FaSearch className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
              </div>
              <input
                type="text"
                placeholder="Search by item name..."
                className="w-full pl-9 sm:pl-11 pr-3 sm:pr-4 py-2 sm:py-3 text-xs sm:text-sm border border-gray-300 rounded-xl bg-white text-gray-900 focus:border-green-300 focus:outline-none focus:ring-2 focus:ring-green-100 transition-all duration-300"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
          <button
            onClick={clearFilters}
            className="px-3 py-2 sm:px-4 bg-gray-200 hover:bg-gray-300 text-black font-bold rounded-xl transition-all duration-300 shadow-sm hover:shadow-md text-xs sm:text-sm"
          >
            Clear Filters
          </button>
          <button
            onClick={exportToExcel}
            className="px-3 py-2 sm:px-4 bg-yellow-100 hover:bg-yellow-200 text-black font-bold rounded-xl transition-all duration-300 shadow-sm hover:shadow-md flex items-center justify-center gap-2 text-xs sm:text-sm"
          >
            <FiDownload className="w-3 h-3 sm:w-4 sm:h-4" />
            Excel
          </button>
          <button
            onClick={exportToPDF}
            className="px-3 py-2 sm:px-4 bg-green-300 hover:bg-green-400 text-black font-bold rounded-xl transition-all duration-300 shadow-sm hover:shadow-md flex items-center justify-center gap-2 text-xs sm:text-sm"
          >
            <FiDownload className="w-3 h-3 sm:w-4 sm:h-4" />
            PDF
          </button>
        </div>

        <div className="mt-3 sm:mt-5 pt-3 sm:pt-5 border-t border-gray-100">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] sm:text-xs font-medium text-gray-600">
                Active filters:
              </span>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {filter !== "today" && (
                  <span className="inline-flex items-center px-2 py-1 sm:px-3 bg-green-100 text-green-800 text-[10px] sm:text-xs font-medium rounded-full">
                    Period: {filter}
                  </span>
                )}
                {searchQuery && (
                  <span className="inline-flex items-center px-2 py-1 sm:px-3 bg-yellow-100 text-yellow-800 text-[10px] sm:text-xs font-medium rounded-full">
                    Search: {searchQuery}
                  </span>
                )}
              </div>
            </div>
            <div className="text-[10px] sm:text-xs text-gray-500">
              {reportData.length} sales · {expenses.length} expenses
            </div>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && !loading && (
        <div className="rounded-xl shadow bg-white overflow-hidden mb-4">
          <div className="p-8 sm:p-12 text-center">
            <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-red-100 mb-4">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-red-600 font-medium text-sm sm:text-base">{error}</p>
            <button
              onClick={handleRefresh}
              className="mt-4 px-4 py-2 bg-green-300 text-black font-bold rounded-lg text-sm hover:bg-green-400 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="rounded-xl shadow bg-white overflow-hidden p-8 sm:p-12">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 border-b-2 border-green-500"></div>
            <p className="text-gray-500 text-xs sm:text-sm">Loading profit data...</p>
          </div>
        </div>
      )}

      {/* Table */}
      {!loading && !error && reportData.length > 0 && (
        <div className="rounded-xl shadow bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-200">
                  {["Date", "Item", "Qty", "Buying Price", "Selling Price", "Discount", "Profit"].map((header) => (
                    <th
                      key={header}
                      className="px-2 sm:px-3 py-2 sm:py-3 text-center text-[10px] sm:text-xs font-bold text-gray-900 uppercase border-r border-gray-300 whitespace-nowrap"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {currentData.map((row, index) => (
                  <tr
                    key={`${row.itemName}-${row.date}-${index}`}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-2 sm:py-3 px-1 sm:px-2 text-center bg-gray-50 border-r border-gray-300">
                      <span className="font-bold text-gray-900 text-[10px] sm:text-xs">
                        {dayjs(row.date).format("DD/MM/YY")}
                      </span>
                      <span className="block text-[9px] sm:text-[10px] text-gray-500">
                        {dayjs(row.date).format("HH:mm")}
                      </span>
                    </td>
                    <td className="py-2 sm:py-3 px-1 sm:px-2 text-center bg-gray-50 border-r border-gray-200">
                      <span className="font-bold text-gray-900 text-[10px] sm:text-xs">
                        {row.itemName}
                      </span>
                    </td>
                    <td className="py-2 sm:py-3 px-1 sm:px-2 text-center bg-green-50 border-r border-gray-200">
                      <span className="font-bold text-gray-900 text-[10px] sm:text-xs">
                        {row.qty}
                      </span>
                    </td>
                    <td className="py-2 sm:py-3 px-1 sm:px-2 text-center border-r border-gray-200">
                      <span className="font-bold text-gray-900 text-[10px] sm:text-xs">
                        {row.buyingPrice.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-2 sm:py-3 px-1 sm:px-2 text-center border-r border-gray-200">
                      <span className="font-bold text-gray-900 text-[10px] sm:text-xs">
                        {row.sellingPrice.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-2 sm:py-3 px-1 sm:px-2 text-center bg-yellow-50 border-r border-gray-200">
                      <span className="font-bold text-gray-900 text-[10px] sm:text-xs">
                        {row.discount.toFixed(0)}
                      </span>
                    </td>
                    <td className={`py-2 sm:py-3 px-1 sm:px-2 text-center bg-gray-50 ${getProfitColor(row.profit)}`}>
                      <span className="font-bold text-[10px] sm:text-xs">
                        {row.profit.toLocaleString()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gradient-to-r from-green-50 to-green-100 text-xs sm:text-sm font-semibold border-t border-green-200">
                  <td colSpan="2" className="text-right p-2 sm:p-3 pr-4 sm:pr-6 uppercase tracking-wider text-gray-700">
                    Total Qty:
                  </td>
                  <td className="p-2 sm:p-3 text-right text-sm sm:text-lg font-bold text-green-600">
                    {reportData.reduce((sum, r) => sum + r.qty, 0)}
                  </td>
                  <td colSpan="3" className="text-right p-2 sm:p-3 pr-4 sm:pr-6 uppercase tracking-wider text-gray-700">
                    Gross Profit:
                  </td>
                  <td className={`p-2 sm:p-3 text-right text-sm sm:text-lg font-bold ${getProfitColor(totals.profit)}`}>
                    {formatCurrency(totals.profit)}
                  </td>
                </tr>
                <tr className="bg-orange-50 border-t">
                  <td colSpan="6" className="text-right p-2 sm:p-3 font-bold text-orange-700 text-xs sm:text-sm">
                    Expenses: ({expenses.length} records)
                  </td>
                  <td className="p-2 sm:p-3 text-right font-bold text-orange-700 text-xs sm:text-sm">
                    {formatCurrency(totalExpenses)}
                  </td>
                </tr>
                <tr className="bg-blue-50 border-t">
                  <td colSpan="6" className="text-right p-2 sm:p-3 font-bold text-blue-700 text-xs sm:text-sm">
                    Net Profit:
                  </td>
                  <td className={`p-2 sm:p-3 text-right font-bold text-xs sm:text-sm ${getProfitColor(finalProfit)}`}>
                    {formatCurrency(finalProfit)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 sm:p-4 border-t border-gray-300 bg-gray-50">
              <div className="text-[10px] sm:text-xs text-gray-700 text-center sm:text-left">
                <span className="font-bold text-gray-900">
                  Showing {indexOfFirst + 1} to {Math.min(indexOfLast, reportData.length)}
                </span> of <span className="font-bold text-gray-900">{reportData.length}</span> records
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-1.5 sm:p-2 bg-gray-200 hover:bg-gray-300 text-black font-bold rounded-full disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <IoIosArrowBack className="w-3 h-3 sm:w-4 sm:h-4" />
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
                          className={`w-7 h-7 sm:w-8 sm:h-8 text-[10px] sm:text-xs font-bold rounded-full transition-colors ${
                            isCurrent
                              ? "bg-green-300 text-black shadow"
                              : "text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    } else if (
                      (pageNum === currentPage - 2 || pageNum === currentPage + 2) &&
                      totalPages > 5
                    ) {
                      return (
                        <span key={i} className="px-1 sm:px-2 text-gray-500 font-bold text-[10px] sm:text-xs">
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}
                </div>
                <button
                  onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-1.5 sm:p-2 bg-gray-200 hover:bg-gray-300 text-black font-bold rounded-full disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <IoIosArrowForward className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && reportData.length === 0 && (
        <div className="rounded-xl shadow bg-white overflow-hidden">
          <div className="text-center py-8 sm:py-12 px-4">
            <div className="space-y-3">
              <div className="text-3xl sm:text-4xl">📊</div>
              <p className="text-base sm:text-lg font-bold text-gray-900">
                No profit data found
              </p>
              <p className="text-gray-600 text-xs sm:text-sm">
                Try selecting a different date range or clearing filters
              </p>
              <button
                onClick={clearFilters}
                className="mt-2 px-4 py-2 bg-green-300 hover:bg-green-400 text-black font-bold rounded-full text-xs sm:text-sm transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profit;