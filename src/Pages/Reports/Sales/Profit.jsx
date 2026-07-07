import React from "react";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { FaSearch, FaFilter } from "react-icons/fa";
import { FiRefreshCw, FiDownload, FiX } from "react-icons/fi";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import toast from "react-hot-toast";
import Loading from "../../../Components/Shared/Loading";

//URL
import BASE_URL from "../../../Utils/config";

dayjs.extend(isBetween);

const Profit = () => {
  // ==================== STATE ====================
  const [reportData, setReportData] = useState([]);
  const [totals, setTotals] = useState({
    sales: 0,
    buying: 0,
    discount: 0,
    profit: 0,
    qty: 0,
  });
  const [totalTradeDiscount, setTotalTradeDiscount] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [finalProfit, setFinalProfit] = useState(0);
  const [expensesCount, setExpensesCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("today");
  const [range, setRange] = useState({ from: "", to: "" });
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const itemsPerPage = 10;

  // ==================== DATE RANGE MEMO ====================
  const { from, to } = useMemo(() => {
    const now = dayjs();
    switch (filter) {
      case "today":
        return { from: now.startOf("day"), to: now.endOf("day") };
      case "yesterday": {
        const yesterday = now.subtract(1, "day");
        return { from: yesterday.startOf("day"), to: yesterday.endOf("day") };
      }
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
  }, [filter, range.from, range.to]);

  // ==================== FETCH DATA ====================
  useEffect(() => {
    const controller = new AbortController();

    const fetchProfitData = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await axios.get(
          `${BASE_URL}/api/transactions/profitReport?from=${from.format("YYYY-MM-DD")}&to=${to.format("YYYY-MM-DD")}`,
          { withCredentials: true, signal: controller.signal },
        );

        if (res.data.success) {
          const { data } = res.data;
          setReportData(data.reportData);
          setTotals(data.totals);
          setTotalTradeDiscount(data.totalTradeDiscount);
          setTotalExpenses(data.totalExpenses);
          setFinalProfit(data.finalProfit);
          setExpensesCount(data.expensesCount);
        }
      } catch (err) {
        if (axios.isCancel(err)) return;
        console.error("Profit fetch error:", err);
        setError(err.response?.data?.message || "Failed to load profit data");
        toast.error(
          err.response?.data?.message || "Failed to load profit data",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfitData();
    return () => controller.abort();
  }, [from, to]);

  // ==================== FILTERED DATA (search only) ====================
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return reportData;

    const query = searchQuery.toLowerCase();
    return reportData.filter((row) =>
      row.itemName.toLowerCase().includes(query),
    );
  }, [reportData, searchQuery]);

  // ==================== PAGINATION ====================
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentData = useMemo(
    () => filteredData.slice(indexOfFirst, indexOfLast),
    [filteredData, indexOfFirst, indexOfLast],
  );
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [filter, range.from, range.to, searchQuery]);

  // ==================== EXPORT FUNCTIONS ====================
  const exportToExcel = () => {
    try {
      const wsData = filteredData.map((row) => ({
        Date: dayjs(row.date).format("DD/MM/YYYY HH:mm"),
        Item: row.itemName,
        Quantity: row.qty,
        "Buying Price": row.buyingPrice.toLocaleString(),
        "Selling Price": row.sellingPrice.toLocaleString(),
        "Gross Profit": row.grossProfit.toLocaleString(),
        Discount: row.discount.toFixed(2),
        "Trade Discount": row.cardDiscount.toFixed(2),
        "Net Profit (Item)": row.profit.toLocaleString(),
        Customer: row.customer,
        Cashier: row.cashier,
      }));

      const ws = XLSX.utils.json_to_sheet(wsData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Profit Report");
      XLSX.writeFile(wb, `Profit_Report_${dayjs().format("YYYYMMDD")}.xlsx`);
      toast.success("Excel report downloaded!");
    } catch (err) {
      toast.error("Failed to export Excel");
    }
  };

  const exportToPDF = () => {
    try {
      const doc = new jsPDF("landscape");
      doc.setFontSize(16);
      doc.text("Item Profit Report", 14, 15);
      doc.setFontSize(10);
      doc.text(`Generated: ${dayjs().format("DD/MM/YYYY HH:mm")}`, 14, 22);
      doc.text(
        `Period: ${from.format("DD/MM/YYYY")} - ${to.format("DD/MM/YYYY")}`,
        14,
        29,
      );

      const tableData = filteredData.map((row) => [
        dayjs(row.date).format("DD/MM/Y"),
        row.itemName,
        row.qty.toString(),
        row.buyingPrice.toLocaleString(),
        row.sellingPrice.toLocaleString(),
        row.grossProfit.toLocaleString(),
        row.discount.toFixed(2),
        row.profit.toLocaleString(),
      ]);

      autoTable(doc, {
        startY: 35,
        head: [
          [
            "Date",
            "Item",
            "Qty",
            "Buying",
            "Selling",
            "Gross Profit",
            "Discount",
            "Net Profit",
          ],
        ],
        body: tableData,
        headStyles: { fillColor: [34, 197, 94], textColor: 255 },
      });

      // Add summary section
      const finalY = doc.lastAutoTable.finalY + 10;
      doc.setFontSize(12);
      doc.text("Summary", 14, finalY);
      doc.setFontSize(10);
      doc.text(
        `Gross Profit: ${totals.profit.toLocaleString()} Tsh`,
        14,
        finalY + 7,
      );
      doc.text(
        `Trade Discount: ${totalTradeDiscount.toLocaleString()} Tsh`,
        14,
        finalY + 14,
      );
      doc.text(
        `Expenses: ${totalExpenses.toLocaleString()} Tsh`,
        14,
        finalY + 21,
      );
      doc.setFontSize(12);
      doc.setTextColor(
        finalProfit >= 0 ? 0 : 255,
        finalProfit >= 0 ? 128 : 0,
        0,
      );
      doc.text(
        `Net Profit: ${finalProfit.toLocaleString()} Tsh`,
        14,
        finalY + 30,
      );

      doc.save(`Profit_Report_${dayjs().format("YYYYMMDD")}.pdf`);
      toast.success("PDF report downloaded!");
    } catch (err) {
      toast.error("Failed to export PDF");
    }
  };

  // ==================== HELPERS ====================
  const filters = [
    { key: "today", label: "Today" },
    { key: "yesterday", label: "Yesterday" },
    { key: "week", label: "This Week" },
    { key: "month", label: "This Month" },
    { key: "custom", label: "Custom" },
  ];

  const getProfitColor = (value) =>
    value >= 0 ? "text-green-600" : "text-red-600";
  const getProfitBg = (value) => (value >= 0 ? "bg-green-50" : "bg-red-50");

  const formatCurrency = (value) => {
    return `${value.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })} Tsh`;
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

  const activeFilterCount = [
    filter !== "today",
    searchQuery,
    filter === "custom" && (range.from || range.to),
  ].filter(Boolean).length;

  // ==================== RENDER ====================
  return (
    <div className="p-2 sm:p-3 md:p-4 lg:p-5 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-black">
            Report Ya Faida
          </h1>
          <p className="text-gray-600 text-xs hidden sm:block">
            Track profit margins across all items
          </p>
        </div>
        <button
          onClick={handleRefresh}
          className="px-3 py-2 bg-green-300 hover:bg-green-400 text-black font-bold rounded-full shadow text-xs flex items-center gap-1.5 flex-shrink-0"
        >
          <FiRefreshCw
            className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
          />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* Stats Cards - Show even while loading */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 mb-3 sm:mb-4">
        <div className="bg-white border border-gray-200 rounded-full p-2.5 sm:p-3 shadow-sm text-center">
          <p className="text-[10px] sm:text-xs text-gray-500 font-medium mb-0.5">
            Sales
          </p>
          <p className="text-xs sm:text-sm md:text-base font-bold text-black truncate">
            {loading ? "..." : totals.sales.toLocaleString()}
          </p>
          <p className="text-[9px] text-gray-400">Tsh</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-full p-2.5 sm:p-3 shadow-sm text-center">
          <p className="text-[10px] sm:text-xs text-gray-500 font-medium mb-0.5">
            Cost
          </p>
          <p className="text-xs sm:text-sm md:text-base font-bold text-red-600 truncate">
            {loading ? "..." : totals.buying.toLocaleString()}
          </p>
          <p className="text-[9px] text-gray-400">Tsh</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-full p-2.5 sm:p-3 shadow-sm text-center">
          <p className="text-[10px] sm:text-xs text-gray-500 font-medium mb-0.5">
            Trade Discount
          </p>
          <p className="text-xs sm:text-sm md:text-base font-bold text-yellow-600 truncate">
            {loading ? "..." : totalTradeDiscount.toLocaleString()}
          </p>
          <p className="text-[9px] text-gray-400">Tsh</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-full p-2.5 sm:p-3 shadow-sm text-center">
          <p className="text-[10px] sm:text-xs text-gray-500 font-medium mb-0.5">
            Expenses
          </p>
          <p className="text-xs sm:text-sm md:text-base font-bold text-orange-600 truncate">
            {loading ? "..." : totalExpenses.toLocaleString()}
          </p>
          <p className="text-[9px] text-gray-400">Tsh</p>
        </div>
        <div
          className={`bg-white border border-gray-200 rounded-full p-2.5 sm:p-3 shadow-sm text-center col-span-2 sm:col-span-1 ${getProfitBg(totals.profit)}`}
        >
          <p className="text-[10px] sm:text-xs text-gray-500 font-medium mb-0.5">
            Net Profit
          </p>
          <p
            className={`text-xs sm:text-sm md:text-base font-bold truncate ${getProfitColor(finalProfit)}`}
          >
            {loading ? "..." : finalProfit.toLocaleString()}
          </p>
          <p className="text-[9px] text-gray-400">Tsh</p>
        </div>
      </div>

      {/* Quick Search + Filter Toggle */}
      <div className="flex gap-2 mb-3 sm:mb-4">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-3 flex items-center">
            <FaSearch className="w-3.5 h-3.5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search items..."
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

      {/* Period Pills - Always Visible */}
      <div className="flex gap-2 mb-3 sm:mb-4 overflow-x-auto pb-1 scrollbar-hide">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all flex-shrink-0 ${
              filter === f.key
                ? "bg-black text-white shadow-md"
                : "bg-white border border-gray-200 text-gray-600"
            }`}
          >
            {f.label}
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

          {filter === "custom" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  From Date
                </label>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
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
          )}

          {filter !== "custom" && (
            <div className="bg-gray-100 rounded-xl p-2.5 text-center">
              <span className="text-xs font-bold text-black">
                {from.format("DD/MM/YYYY")} - {to.format("DD/MM/YYYY")}
              </span>
            </div>
          )}

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
          {filter !== "today" && (
            <span className="inline-flex items-center px-2.5 py-1 bg-green-100 text-green-800 text-[10px] font-medium rounded-full">
              Period: {filter}
              <button onClick={() => setFilter("today")} className="ml-1">
                <FiX className="w-3 h-3" />
              </button>
            </span>
          )}
          {searchQuery && (
            <span className="inline-flex items-center px-2.5 py-1 bg-yellow-100 text-yellow-800 text-[10px] font-medium rounded-full">
              Search: {searchQuery}
              <button onClick={() => setSearchQuery("")} className="ml-1">
                <FiX className="w-3 h-3" />
              </button>
            </span>
          )}
          {filter === "custom" && range.from && (
            <span className="inline-flex items-center px-2.5 py-1 bg-blue-100 text-blue-800 text-[10px] font-medium rounded-full">
              From {dayjs(range.from).format("DD/MM")}
              <button
                onClick={() => setRange({ ...range, from: "" })}
                className="ml-1"
              >
                <FiX className="w-3 h-3" />
              </button>
            </span>
          )}
          {filter === "custom" && range.to && (
            <span className="inline-flex items-center px-2.5 py-1 bg-blue-100 text-blue-800 text-[10px] font-medium rounded-full">
              To {dayjs(range.to).format("DD/MM")}
              <button
                onClick={() => setRange({ ...range, to: "" })}
                className="ml-1"
              >
                <FiX className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}

      <Loading load={loading} />

      {/* Results Count */}
      <div className="flex items-center justify-between mb-2 px-1">
        <p className="text-xs text-gray-500">
          <span className="font-bold text-black">{filteredData.length}</span>{" "}
          results
        </p>
        <p className="text-[10px] text-gray-400">
          Page {currentPage} of {totalPages || 1}
        </p>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-2 mb-4">
        {currentData.length === 0 ? (
          <div className="bg-white rounded-xl p-6 text-center border border-gray-200">
            <div className="text-3xl mb-2">📊</div>
            <p className="text-sm font-bold text-black">No profit data</p>
            <p className="text-xs text-gray-500">Try adjusting filters</p>
          </div>
        ) : (
          currentData.map((row, idx) => (
            <div
              key={`${row.itemName}-${row.date}-${idx}`}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm"
            >
              <div className="flex items-center justify-between p-3 bg-gray-50 border-b border-gray-100">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className={`w-2 h-2 rounded-full flex-shrink-0 ${row.profit >= 0 ? "bg-green-500" : "bg-red-500"}`}
                  />
                  <span className="text-xs font-bold text-black truncate">
                    {row.itemName}
                  </span>
                </div>
                <span className="text-[10px] text-gray-500 flex-shrink-0">
                  {dayjs(row.date).format("DD/MM HH:mm")}
                </span>
              </div>
              <div className="p-3 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Qty:</span>
                  <span className="font-bold text-black">{row.qty}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Buying:</span>
                  <span className="font-bold text-red-600">
                    {row.buyingPrice.toLocaleString()} Tsh
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Selling:</span>
                  <span className="font-bold text-black">
                    {row.sellingPrice.toLocaleString()} Tsh
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Gross Profit:</span>
                  <span className="font-bold text-blue-600">
                    {row.gross.toLocaleString()} Tsh
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Item Discount:</span>
                  <span className="font-bold text-yellow-600">
                    {row.discount.toLocaleString()} Tsh
                  </span>
                </div>
                <div
                  className={`flex justify-between text-xs pt-2 border-t border-gray-100 ${getProfitColor(row.profit)}`}
                >
                  <span className="font-bold">Net Profit (Item):</span>
                  <span className="font-bold">
                    {row.profit.toLocaleString()} Tsh
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-t border-gray-100">
                <span className="text-[10px] text-gray-500">{row.cashier}</span>
                <span className="text-[10px] text-gray-400">
                  {row.customer}
                </span>
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
                  "Item",
                  "Buying Price",
                  "Selling Price",
                  "Qty",
                  "Gross Profit",
                  "Item Discount",
                  "Net Profit (Item)",
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
            <tbody>
              <tr className="h-3">
                <td colSpan={8} className="p-0"></td>
              </tr>
              {currentData.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12">
                    <div className="space-y-3">
                      <div className="text-4xl">📊</div>
                      <p className="text-lg font-bold text-black">
                        No profit data found
                      </p>
                      <p className="text-gray-600 text-sm">
                        Try selecting a different date range or clearing filters
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                currentData.map((row, index) => (
                  <React.Fragment key={`${row.itemName}-${row.date}-${index}`}>
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-2 text-center bg-gray-200 border-r border-gray-300">
                        <span className="font-bold text-black text-xs">
                          {dayjs(row.date).format("DD/MM/YYYY HH:mm")}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-center bg-gray-100 border-r border-gray-200">
                        <span className="font-bold text-black text-xs">
                          {row.itemName}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-center border-r border-gray-200">
                        <span className="font-bold text-red-600 text-xs">
                          {row.buyingPrice.toLocaleString()}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-center border-r border-gray-200">
                        <span className="font-bold text-black text-xs">
                          {row.sellingPrice.toLocaleString()}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-center bg-green-50 border-r border-gray-200">
                        <span className="font-bold text-black text-xs">
                          {row.qty}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-center bg-blue-50 border-r border-gray-200">
                        <span className="font-bold text-blue-700 text-xs">
                          {row.gross.toLocaleString()}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-center bg-yellow-50 border-r border-gray-200">
                        <span className="font-bold text-yellow-700 text-xs">
                          {row.discount.toLocaleString()}
                        </span>
                      </td>
                      <td
                        className={`py-3 px-2 text-center bg-gray-50 ${getProfitColor(row.profit)}`}
                      >
                        <span className="font-bold text-xs">
                          {row.profit.toLocaleString()}
                        </span>
                      </td>
                    </tr>
                    <tr className="h-3">
                      <td colSpan={8} className="p-0"></td>
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
                <td></td>
                <td className="text-right p-3 pr-6 uppercase tracking-wider text-xs">
                  Total Qty:
                </td>
                <td className="p-3 text-right text-lg font-bold text-green-600">
                  {totals.qty}
                </td>
                <td
                  colSpan="1"
                  className="text-right p-3 pr-6 uppercase tracking-wider text-xs"
                >
                  Gross Profit:
                </td>
                <td
                  className={`p-3 text-right text-lg font-bold ${getProfitColor(totals.profit)}`}
                >
                  {formatCurrency(totals.profit)}
                </td>
              </tr>
              <tr className="bg-yellow-50 border-t">
                <td></td>
                <td
                  colSpan="6"
                  className="text-right p-3 font-bold text-yellow-700 text-xs"
                >
                  Trade Discount:
                </td>
                <td className="p-3 text-right font-bold text-yellow-700 text-xs">
                  {formatCurrency(totalTradeDiscount)}
                </td>
              </tr>
              <tr className="bg-orange-50 border-t">
                <td></td>
                <td
                  colSpan="6"
                  className="text-right p-3 font-bold text-orange-700 text-xs"
                >
                  Expenses: ({expensesCount} records)
                </td>
                <td className="p-3 text-right font-bold text-orange-700 text-xs">
                  {formatCurrency(totalExpenses)}
                </td>
              </tr>
              <tr className="bg-blue-50 border-t">
                <td></td>
                <td
                  colSpan="6"
                  className="text-right p-3 font-bold text-blue-700 text-xs"
                >
                  Net Profit:
                </td>
                <td
                  className={`p-3 text-right font-bold text-xs ${getProfitColor(finalProfit)}`}
                >
                  {formatCurrency(finalProfit)}
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

      {/* Empty State */}
      {!loading && !error && filteredData.length === 0 && (
        <div className="bg-white rounded-xl p-6 text-center border border-gray-200">
          <div className="text-3xl mb-2">📊</div>
          <p className="text-sm font-bold text-black">No profit data found</p>
          <p className="text-xs text-gray-500">
            Try selecting a different date range or clearing filters
          </p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-white rounded-xl p-6 text-center border border-gray-200">
          <div className="text-3xl mb-2">⚠️</div>
          <p className="text-sm font-bold text-red-600">{error}</p>
          <button
            onClick={handleRefresh}
            className="mt-3 px-4 py-2 bg-green-300 hover:bg-green-400 text-black font-bold rounded-full text-xs"
          >
            Retry
          </button>
        </div>
      )}
    </div>
  );
};

export default Profit;
