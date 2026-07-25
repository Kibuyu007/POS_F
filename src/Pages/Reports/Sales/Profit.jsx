import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { FaFilter } from "react-icons/fa";
import { FiRefreshCw, FiDownload, FiX } from "react-icons/fi";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import toast from "react-hot-toast";
import Loading from "../../../Components/Shared/Loading";
import {
  Search,
  Package,
  Clock,
  TrendingUp,
  TrendingDown,
  Calendar,
  User,
} from "lucide-react";
import BASE_URL from "../../../Utils/config";

dayjs.extend(isBetween);

const Profit = () => {
  // ==================== STATE ====================
  const [reportData, setReportData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("today");
  const [range, setRange] = useState({ from: "", to: "" });
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);

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

  const itemsPerPage = 10;

  // ==================== DATE RANGE ====================
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

        const res = await axios.get(
          `${BASE_URL}/api/transactions/profitReport?from=${from.format("YYYY-MM-DD")}&to=${to.format("YYYY-MM-DD")}`,
          { withCredentials: true, signal: controller.signal },
        );

        if (res.data.success) {
          const { data } = res.data;
          setReportData(data.reportData);
          setFilteredData(data.reportData);
          setTotals(data.totals);
          setTotalTradeDiscount(data.totalTradeDiscount);
          setTotalExpenses(data.totalExpenses);
          setFinalProfit(data.finalProfit);
        }
      } catch (err) {
        if (axios.isCancel(err)) return;
        console.error("Profit fetch error:", err);
        const message =
          err.response?.data?.message || "Failed to load profit data";
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfitData();
    return () => controller.abort();
  }, [from, to]);

  // ==================== FILTERS ====================
  useEffect(() => {
    setCurrentPage(1);
    applySearchFilter();
  }, [searchQuery, reportData]);

  const applySearchFilter = () => {
    if (!searchQuery.trim()) {
      setFilteredData(reportData);
      return;
    }
    const query = searchQuery.toLowerCase();
    const filtered = reportData.filter((row) =>
      row.itemName.toLowerCase().includes(query),
    );
    setFilteredData(filtered);
  };

  // ==================== PAGINATION ====================
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentData = filteredData.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

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

  const formatCurrency = (amount) => `${(amount || 0).toLocaleString()}`;

  const handleRefresh = () => window.location.reload();

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
        "Net Profit": row.profit.toLocaleString(),
        Customer: row.customer,
        Cashier: row.cashier,
      }));

      const ws = XLSX.utils.json_to_sheet(wsData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Profit Report");
      XLSX.writeFile(wb, `Profit_Report_${dayjs().format("YYYYMMDD")}.xlsx`);
      toast.success("Excel report downloaded!");
    } catch {
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

      const finalY = doc.lastAutoTable.finalY + 10;
      doc.setFontSize(12);
      doc.text("Summary", 14, finalY);
      doc.setFontSize(10);
      doc.text(
        `Gross Profit: ${totals.profit.toLocaleString()}`,
        14,
        finalY + 7,
      );
      doc.text(
        `Trade Discount: ${totalTradeDiscount.toLocaleString()}`,
        14,
        finalY + 14,
      );
      doc.text(`Expenses: ${totalExpenses.toLocaleString()}`, 14, finalY + 21);
      doc.setFontSize(12);
      doc.setTextColor(
        finalProfit >= 0 ? 0 : 255,
        finalProfit >= 0 ? 128 : 0,
        0,
      );
      doc.text(`Net Profit: ${finalProfit.toLocaleString()}`, 14, finalY + 30);

      doc.save(`Profit_Report_${dayjs().format("YYYYMMDD")}.pdf`);
      toast.success("PDF report downloaded!");
    } catch {
      toast.error("Failed to export PDF");
    }
  };

  // ==================== PAGINATION RENDER ====================
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

  // ==================== STATS DATA ====================
  const statsData = [
    { label: "Sales", value: formatCurrency(totals.sales), icon: Package },
    { label: "Cost", value: formatCurrency(totals.buying), icon: Package },
    {
      label: "Trade Discount",
      value: formatCurrency(totalTradeDiscount),
      icon: TrendingDown,
    },
    { label: "Expenses", value: formatCurrency(totalExpenses), icon: Clock },
    {
      label: "Net Profit",
      value: formatCurrency(finalProfit),
      icon: TrendingUp,
    },
  ];

  // ==================== RENDER ====================
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-8xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
        {/* Header - Responsive */}
        <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-300 rounded-xl flex items-center justify-center shadow-lg shadow-green-200 border-2 border-green-400">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-black" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 tracking-tight">
                Report Ya Faida
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 hidden xs:block">
                Track profit margins across all items
              </p>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-100 font-semibold rounded-xl transition-all duration-200 shadow-sm text-xs sm:text-sm"
          >
            <FiRefreshCw
              className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${loading ? "animate-spin" : ""}`}
            />
            <span className="hidden xs:inline">Refresh</span>
          </button>
        </div>

        {/* Stats Cards - Stacked on mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6">
          {statsData.map((stat, index) => {
            const Icon = stat.icon;
            const isProfit = index === 4;
            return (
              <div
                key={index}
                className={`bg-white p-3 sm:p-4 md:p-5 rounded-2xl border-2 border-gray-300 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02] ${
                  isProfit ? getProfitBg(finalProfit) : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-[10px] sm:text-xs font-medium text-black/60 uppercase tracking-wider truncate">
                      {stat.label}
                    </p>
                    <p
                      className={`text-base sm:text-lg md:text-xl font-bold mt-0.5 sm:mt-1 truncate ${
                        isProfit ? getProfitColor(finalProfit) : "text-black"
                      }`}
                    >
                      {stat.value}
                    </p>
                  </div>
                  <div className="bg-green-300 p-2 sm:p-2.5 rounded-xl border-2 border-green-400 flex-shrink-0">
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-black" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Period Pills + Search - Responsive */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-5">
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {filters.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-full text-[9px] sm:text-xs font-semibold transition-all duration-200 border-2 ${
                  filter === f.key
                    ? "bg-green-300 border-green-300 text-black shadow-md shadow-green-200"
                    : "bg-white border-gray-300 text-gray-500 hover:border-gray-400 hover:text-gray-700 hover:bg-gray-100"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-56 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-black/50 w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <input
                type="text"
                placeholder="Search items..."
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
                showFilters || activeFilterCount > 0
                  ? "bg-green-300 border-green-300 text-black shadow-md shadow-green-200"
                  : "bg-white border-gray-300 text-gray-600 hover:bg-gray-100 hover:border-gray-400"
              }`}
            >
              <FaFilter className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Filters</span>
              {activeFilterCount > 0 && (
                <span className="bg-black text-white text-[10px] sm:text-xs w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center font-bold">
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

            {filter === "custom" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
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
              <div className="bg-gradient-to-r from-green-50 to-yellow-50 rounded-xl p-3 text-center border-2 border-gray-200">
                <span className="text-xs font-bold text-black">
                  {from.format("DD/MM/YYYY")} - {to.format("DD/MM/YYYY")}
                </span>
              </div>
            )}

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

        {/* Active Filter Chips - Responsive */}
        {activeFilterCount > 0 && !showFilters && (
          <div className="flex flex-wrap gap-1 sm:gap-1.5 mb-3 sm:mb-4">
            {filter !== "today" && (
              <span className="inline-flex items-center gap-0.5 sm:gap-1 px-2 sm:px-3 py-0.5 sm:py-1 bg-green-100 text-black text-[10px] sm:text-xs font-medium rounded-full border border-green-200">
                Period: {filters.find((f) => f.key === filter)?.label}
                <button
                  onClick={() => setFilter("today")}
                  className="hover:text-black/70"
                >
                  <FiX className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                </button>
              </span>
            )}
            {filter === "custom" && range.from && (
              <span className="inline-flex items-center gap-0.5 sm:gap-1 px-2 sm:px-3 py-0.5 sm:py-1 bg-blue-100 text-black text-[10px] sm:text-xs font-medium rounded-full border border-blue-200">
                From {dayjs(range.from).format("DD/MM")}
                <button
                  onClick={() => setRange({ ...range, from: "" })}
                  className="hover:text-black/70"
                >
                  <FiX className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                </button>
              </span>
            )}
            {filter === "custom" && range.to && (
              <span className="inline-flex items-center gap-0.5 sm:gap-1 px-2 sm:px-3 py-0.5 sm:py-1 bg-blue-100 text-black text-[10px] sm:text-xs font-medium rounded-full border border-blue-200">
                To {dayjs(range.to).format("DD/MM")}
                <button
                  onClick={() => setRange({ ...range, to: "" })}
                  className="hover:text-black/70"
                >
                  <FiX className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                </button>
              </span>
            )}
            {searchQuery && (
              <span className="inline-flex items-center gap-0.5 sm:gap-1 px-2 sm:px-3 py-0.5 sm:py-1 bg-yellow-100 text-black text-[10px] sm:text-xs font-medium rounded-full border border-yellow-200">
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

        <Loading load={loading} />

        {/* Results Count - Responsive */}
        <div className="flex items-center justify-between mb-2 sm:mb-3 px-1">
          <p className="text-[9px] sm:text-sm text-gray-500">
            <span className="font-semibold text-gray-700">
              {filteredData.length}
            </span>{" "}
            items found
          </p>
          <p className="text-[9px] sm:text-sm text-gray-400">
            Page {currentPage} of {totalPages || 1}
          </p>
        </div>

        {/* Card List - Responsive */}
        <div className="space-y-2 sm:space-y-2.5">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 sm:py-16 bg-gray-100 rounded-2xl border-2 border-gray-300 shadow-sm">
              <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-green-300 border-t-green-500 rounded-full animate-spin" />
              <p className="text-xs sm:text-sm text-gray-500 mt-3 sm:mt-4">
                Loading profit data...
              </p>
            </div>
          ) : currentData.length === 0 ? (
            <div className="bg-gray-100 rounded-2xl border-2 border-gray-300 shadow-sm py-12 sm:py-16 text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 border-2 border-gray-300">
                <TrendingUp className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
              </div>
              <p className="text-sm sm:text-base text-gray-700 font-medium">
                No profit data found
              </p>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Try adjusting your filters
              </p>
            </div>
          ) : (
            currentData.map((row, idx) => {
              const isProfit = row.profit >= 0;

              return (
                <div
                  key={`${row.itemName}-${row.date}-${idx}`}
                  className="bg-gray-200 rounded-xl border-2 border-gray-300 shadow-sm p-3 sm:p-4 hover:shadow-md hover:border-green-300 transition-all duration-300"
                >
                  {/* Row 1: Item & Status */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                      <div
                        className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center flex-shrink-0 border-2 ${
                          isProfit
                            ? "bg-green-300 border-green-400"
                            : "bg-red-300 border-red-400"
                        }`}
                      >
                        {isProfit ? (
                          <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-black" />
                        ) : (
                          <TrendingDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-black" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                          <span className="text-sm sm:text-base font-semibold text-gray-800 truncate max-w-[100px] xs:max-w-[150px] sm:max-w-[200px]">
                            {row.itemName}
                          </span>
                          <span className="text-[10px] sm:text-[11px] text-gray-600 bg-white px-1.5 py-0.5 rounded border border-gray-300 flex-shrink-0">
                            #{idx + 1}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-gray-500 mt-0.5 flex-wrap">
                          <span className="flex items-center gap-0.5">
                            <Calendar className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                            {dayjs(row.date).format("DD/MM/YYYY HH:mm")}
                          </span>
                          <span className="w-0.5 h-0.5 bg-gray-400 rounded-full" />
                          <span className="flex items-center gap-0.5">
                            <User className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                            {row.cashier || "—"}
                          </span>
                          {row.customer && (
                            <>
                              <span className="w-0.5 h-0.5 bg-gray-400 rounded-full" />
                              <span className="flex items-center gap-0.5 truncate max-w-[80px]">
                                <User className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                {row.customer}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
                      <span
                        className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[11px] font-semibold border-2 ${
                          isProfit
                            ? "bg-green-300 text-black border-green-400"
                            : "bg-red-100 text-red-700 border-red-200"
                        }`}
                      >
                        {isProfit ? "Profit" : "Loss"}
                      </span>
                      <span className="px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[11px] font-semibold border-2 bg-gray-100 text-gray-700 border-gray-300">
                        Qty: {row.qty}
                      </span>
                    </div>
                  </div>

                  {/* Row 2: Financial Summary - Responsive */}
                  <div className="mt-2 pt-2 border-t-2 border-gray-300">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm">
                        <div>
                          <span className="text-gray-600">Buying:</span>
                          <span className="font-semibold text-gray-800 ml-1">
                            {formatCurrency(row.buyingPrice)}
                          </span>
                        </div>
                        <div className="w-px h-4 sm:h-5 bg-gray-300" />
                        <div>
                          <span className="text-gray-600">Selling:</span>
                          <span className="font-semibold text-gray-800 ml-1">
                            {formatCurrency(row.sellingPrice)}
                          </span>
                        </div>
                        <div className="w-px h-4 sm:h-5 bg-gray-300" />
                        <div>
                          <span className="text-gray-600">Gross:</span>
                          <span className="font-semibold text-blue-600 ml-1">
                            {formatCurrency(row.gross)}
                          </span>
                        </div>
                        <div className="w-px h-4 sm:h-5 bg-gray-300" />
                        <div>
                          <span className="text-gray-600">Discount:</span>
                          <span className="font-semibold text-yellow-600 ml-1">
                            {formatCurrency(row.discount)}
                          </span>
                        </div>
                      </div>

                      {/* Net Profit - Large, Bold, at the end */}
                      <div
                        className={`flex items-center gap-2 bg-white px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg border-2 ${
                          isProfit ? "border-green-400" : "border-red-400"
                        } shadow-sm`}
                      >
                        {isProfit ? (
                          <TrendingUp className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-green-600" />
                        ) : (
                          <TrendingDown className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-red-600" />
                        )}
                        <span
                          className={`text-sm sm:text-lg md:text-xl font-bold ${
                            isProfit ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {formatCurrency(row.profit)}
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
              items
            </span>
            {renderPagination(currentPage, totalPages, setCurrentPage)}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profit;
