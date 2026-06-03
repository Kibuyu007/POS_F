import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { FaSearch, FaFilter } from "react-icons/fa";
import { FiRefreshCw, FiDownload} from "react-icons/fi";
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
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("today");
  const [range, setRange] = useState({ from: "", to: "" });
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const getDateRange = () => {
    const now = dayjs();
    switch (filter) {
      case "today":
        return { from: now.startOf("day"), to: now.endOf("day") };
      case "yesterday":
        return { from: now.subtract(1, "day").startOf("day"), to: now.subtract(1, "day").endOf("day") };
      case "week":
        return { from: now.startOf("week"), to: now.endOf("week") };
      case "month":
        return { from: now.startOf("month"), to: now.endOf("month") };
      case "custom":
        if (!range.from || !range.to) return { from: now.startOf("day"), to: now.endOf("day") };
        const fromDate = dayjs(range.from).startOf("day");
        const toDate = dayjs(range.to).endOf("day");
        return fromDate.isAfter(toDate) ? { from: toDate, to: fromDate } : { from: fromDate, to: toDate };
      default:
        return { from: now.startOf("day"), to: now.endOf("day") };
    }
  };

  const { from, to } = getDateRange();

  useEffect(() => {
    const fetchSales = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${BASE_URL}/api/transactions/all`, { withCredentials: true });
        if (res.data.success) {
          setTransactions(res.data.data || []);
          toast.success("Profit data loaded successfully!");
        }
      } catch (error) {
        console.error(error);
        toast.error(error.response?.data?.message || "Failed to load transactions");
      } finally {
        setLoading(false);
      }
    };
    fetchSales();
  }, []);

  const filteredSales = useMemo(() => {
    let filtered = transactions.filter((tx) => dayjs(tx.createdAt).isBetween(from, to, null, "[]"));
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((tx) =>
        tx.items.some((item) => item.item?.name?.toLowerCase().includes(query))
      );
    }
    
    return filtered;
  }, [transactions, from, to, searchQuery]);

  const reportData = useMemo(() => {
    const rows = [];
    filteredSales.forEach((tx) => {
      const txDiscount = tx.tradeDiscount || 0;
      const txSubTotal = tx.subTotal || tx.items.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0);

      tx.items.forEach((soldItem) => {
        const qty = soldItem.quantity || 0;
        const sellingPrice = soldItem.price || 0;
        const buyingPrice = soldItem.buyingPrice || 0;
        const itemName = soldItem.item?.name || "Unknown";
        const salesAmount = qty * sellingPrice;
        const buyingAmount = qty * buyingPrice;
        const itemDiscount = txSubTotal > 0 ? (salesAmount / txSubTotal) * txDiscount : 0;
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

  // Pagination
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentData = reportData.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(reportData.length / itemsPerPage);

  const exportToExcel = () => {
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
    } catch (error) {
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
      doc.text(`Period: ${from.format("DD/MM/YYYY")} - ${to.format("DD/MM/YYYY")}`, 14, 29);

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
    } catch (error) {
      toast.error("Failed to export PDF");
    }
  };

  const filters = [
    { key: "today", label: "Today" },
    { key: "yesterday", label: "Yesterday" },
    { key: "week", label: "This Week" },
    { key: "month", label: "This Month" },
    { key: "custom", label: "Custom" },
  ];

  const getProfitColor = (value) => (value >= 0 ? "text-green-600" : "text-red-600");

  return (
    <div className="p-5 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-black mb-1">Item Profit Report</h1>
          <p className="text-gray-600 text-sm">
            Track profit margins across all items
          </p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="mt-3 md:mt-0 px-4 py-2 bg-green-300 hover:bg-green-400 text-black font-bold rounded-full shadow hover:shadow-md transition-all duration-200 flex items-center gap-2 text-sm"
        >
          <FiRefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Stats Cards */}
      {!loading && reportData.length > 0 && (
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row items-center justify-between bg-white border border-gray-200 rounded-full p-4 shadow-sm">
            <div className="flex items-center gap-3 mb-3 sm:mb-0">
              <div className="text-center px-3">
                <p className="text-xs text-gray-500 font-medium">Total Sales</p>
                <p className="text-base font-bold text-black">
                  Tsh {totals.sales.toLocaleString()}
                </p>
              </div>
              <div className="h-6 w-px bg-gray-300"></div>
              <div className="text-center px-3">
                <p className="text-xs text-gray-500 font-medium">Total Cost</p>
                <p className="text-base font-bold text-red-600">
                  Tsh {totals.buying.toLocaleString()}
                </p>
              </div>
              <div className="h-6 w-px bg-gray-300"></div>
              <div className="text-center px-3">
                <p className="text-xs text-gray-500 font-medium">Discounts</p>
                <p className="text-base font-bold text-yellow-600">
                  Tsh {totals.discount.toFixed(2)}
                </p>
              </div>
              <div className="h-6 w-px bg-gray-300"></div>
              <div className="text-center px-3">
                <p className="text-xs text-gray-500 font-medium">Net Profit</p>
                <p className={`text-base font-bold ${getProfitColor(totals.profit)}`}>
                  Tsh {totals.profit.toLocaleString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-xs font-medium text-gray-700">Profit</span>
              <div className="w-2 h-2 bg-red-500 rounded-full ml-2"></div>
              <span className="text-xs font-medium text-gray-700">Loss</span>
            </div>
          </div>
        </div>
      )}

      {/* Filter Card */}
      <div className="mb-6 rounded-xl p-5 shadow-lg bg-white border border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-green-100 rounded-lg">
            <FaFilter className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 className="text-base font-bold text-black">Filters & Date Range</h3>
            <p className="text-xs text-gray-600">
              Filter profit data by date period
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Time Period
            </label>
            <div className="flex gap-2">
              {filters.map((f) => (
                <button
                  key={f.key}
                  className={`px-4 py-2.5 text-sm font-bold rounded-full transition-all duration-200 flex-1 ${
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

          {filter === "custom" && (
            <>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Date Range
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="From"
                      value={range.from ? dayjs(range.from) : null}
                      onChange={(newValue) => setRange({ ...range, from: newValue ? newValue.format("YYYY-MM-DD") : "" })}
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
                        },
                      }}
                    />
                  </LocalizationProvider>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="To"
                      value={range.to ? dayjs(range.to) : null}
                      onChange={(newValue) => setRange({ ...range, to: newValue ? newValue.format("YYYY-MM-DD") : "" })}
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
                        },
                      }}
                    />
                  </LocalizationProvider>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Search Items
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-4 flex items-center">
                    <FaSearch className="w-4 h-4 text-gray-500" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search by item name..."
                    className="w-full pl-11 pr-4 py-3 text-sm border border-gray-300 rounded-xl bg-white text-black focus:border-green-300 focus:outline-none focus:ring-2 focus:ring-green-100 transition-all duration-300"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </>
          )}

          {filter !== "custom" && (
            <>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Period Info
                </label>
                <div className="bg-gray-100 rounded-xl p-3 text-center">
                  <span className="text-sm font-bold text-black">
                    {from.format("DD/MM/YYYY")} - {to.format("DD/MM/YYYY")}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Search Items
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-4 flex items-center">
                    <FaSearch className="w-4 h-4 text-gray-500" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search by item name..."
                    className="w-full pl-11 pr-4 py-3 text-sm border border-gray-300 rounded-xl bg-white text-black focus:border-green-300 focus:outline-none focus:ring-2 focus:ring-green-100 transition-all duration-300"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={() => {
              setSearchQuery("");
              setFilter("today");
              setRange({ from: "", to: "" });
              toast.success("Filters cleared!");
            }}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-black font-bold rounded-xl transition-all duration-300 shadow-sm hover:shadow-md flex items-center gap-2"
          >
            Clear Filters
          </button>
          <button
            onClick={exportToExcel}
            className="px-4 py-2 bg-yellow-100 hover:bg-yellow-200 text-black font-bold rounded-xl transition-all duration-300 shadow-sm hover:shadow-md flex items-center gap-2"
          >
            <FiDownload className="w-4 h-4" />
            Excel
          </button>
          <button
            onClick={exportToPDF}
            className="px-4 py-2 bg-green-300 hover:bg-green-400 text-black font-bold rounded-xl transition-all duration-300 shadow-sm hover:shadow-md flex items-center gap-2"
          >
            <FiDownload className="w-4 h-4" />
            PDF
          </button>
        </div>

        <div className="mt-5 pt-5 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-600">Active filters:</span>
              <div className="flex flex-wrap gap-2">
                {filter !== "today" && (
                  <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                    Period: {filter}
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
              {reportData.length} item sales recorded
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="rounded-xl shadow bg-white overflow-hidden p-12">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-500"></div>
            <p className="text-gray-500 text-sm">Loading profit data...</p>
          </div>
        </div>
      )}

      {/* Table */}
      {!loading && reportData.length > 0 && (
        <div className="rounded-xl shadow bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-200">
                  {["Date", "Item", "Qty", "Buying Price", "Selling Price", "Discount", "Profit"].map((header, idx) => (
                    <th key={idx} className="px-3 py-3 text-center text-xs font-bold text-black uppercase border-r border-gray-300">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tr className="h-3" />
              <tbody>
                {currentData.map((row, index) => (
                  <>
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-2 text-center bg-gray-200 border-r border-gray-300">
                        <span className="font-bold text-black text-sm">
                          {dayjs(row.date).format("DD/MM/YYYY HH:mm")}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-center bg-gray-100 border-r border-gray-200">
                        <span className="font-bold text-black text-sm">
                          {row.itemName}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-center bg-green-200 border-r border-gray-200">
                        <span className="font-bold text-black text-sm">
                          {row.qty}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-center border-r border-gray-200">
                        <span className="font-bold text-black text-sm">
                          {row.buyingPrice.toLocaleString()} Tsh
                        </span>
                      </td>
                      <td className="py-3 px-2 text-center border-r border-gray-200">
                        <span className="font-bold text-black text-sm">
                          {row.sellingPrice.toLocaleString()} Tsh
                        </span>
                      </td>
                      <td className="py-3 px-2 text-center bg-yellow-100 border-r border-gray-200">
                        <span className="font-bold text-black text-sm">
                          {row.discount.toFixed(2)} Tsh
                        </span>
                      </td>
                      <td className={`py-3 px-2 text-center ${getProfitColor(row.profit)} bg-gray-100`}>
                        <span className="font-bold text-sm">
                          {row.profit.toLocaleString()} Tsh
                        </span>
                      </td>
                    </tr>
                    <tr className="h-3">
                      <td colSpan={7} className="p-0"></td>
                    </tr>
                  </>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gradient-to-r from-green-50 to-green-100 text-sm font-semibold text-green-800 border-t border-green-200">
                  <td colSpan="2" className="text-right p-3 pr-6 uppercase tracking-wider">Total Sales:</td>
                  <td className="p-3 text-right text-lg font-bold text-green-600">{reportData.reduce((sum, r) => sum + r.qty, 0)}</td>
                  <td colSpan="3" className="text-right p-3 pr-6 uppercase tracking-wider">Total Profit:</td>
                  <td className={`p-3 text-right text-lg font-bold ${getProfitColor(totals.profit)}`}>
                    {totals.profit.toLocaleString()} Tsh
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t border-gray-300 bg-gray-50">
              <div className="text-xs text-gray-700">
                <span className="font-bold text-black">
                  Showing {indexOfFirst + 1} to {Math.min(indexOfLast, reportData.length)}
                </span>{" "}
                of{" "}
                <span className="font-bold text-black">{reportData.length}</span>{" "}
                records
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 bg-gray-200 hover:bg-gray-300 text-black font-bold rounded-full disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <IoIosArrowBack className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-1">
                  {[...Array(totalPages)].map((_, i) => {
                    const pageNum = i + 1;
                    const isCurrent = currentPage === pageNum;
                    const showPage = pageNum === 1 || pageNum === totalPages || (pageNum >= currentPage - 1 && pageNum <= currentPage + 1);
                    if (showPage) {
                      return (
                        <button
                          key={i}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-8 h-8 text-xs font-bold rounded-full transition-colors ${
                            isCurrent ? "bg-green-300 text-black shadow" : "text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    } else if ((pageNum === currentPage - 2 || pageNum === currentPage + 2) && totalPages > 5) {
                      return <span key={i} className="px-2 text-gray-500 font-bold text-xs">...</span>;
                    }
                    return null;
                  })}
                </div>
                <button
                  onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 bg-gray-200 hover:bg-gray-300 text-black font-bold rounded-full disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <IoIosArrowForward className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!loading && reportData.length === 0 && (
        <div className="rounded-xl shadow bg-white overflow-hidden">
          <div className="text-center py-12">
            <div className="space-y-3">
              <div className="text-4xl">📊</div>
              <p className="text-lg font-bold text-black">No profit data found</p>
              <p className="text-gray-600 text-sm">Try selecting a different date range</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profit;