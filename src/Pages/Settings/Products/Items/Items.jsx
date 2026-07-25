import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  itemsFetch,
  itemsPending,
  itemsError,
  searchItemsPending,
} from "../../../../Redux/items";

//Pages
import AddItem from "./AddItem";
import EditItem from "./EditItem";

//Icons
import { AiTwotoneEdit } from "react-icons/ai";
import {
  FaSearch,
  FaPrint,
  FaBox,
  FaExclamationTriangle,
  FaCalendarTimes,
  FaTags,
  FaPlus,
  FaSync,
  FaChevronDown,
  FaChevronUp,
  FaFileExport,
} from "react-icons/fa";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { FiAlertCircle, FiFilter, FiX } from "react-icons/fi";

//API
import BASE_URL from "../../../../Utils/config";
import toast from "react-hot-toast";

// Export libraries
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

const Items = () => {
  const dispatch = useDispatch();

  // Redux State
  const { items = [] } = useSelector((state) => state.items);
  const { category } = useSelector((state) => state.category);
  const user = useSelector((state) => state.user.user);

  const [showError, setShowError] = useState("");

  // Filter and Search State
  const [filterStatus, setFilterStatus] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Modal States
  const [showModalAdd, setShowModalAdd] = useState(false);
  const [showModalEdit, setShowModalEdit] = useState(false);
  const [modifiedItem, setModifiedItem] = useState(null);

  // UI States
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [expandedItem, setExpandedItem] = useState(null);
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Fetch data
  const fetchData = async () => {
    try {
      dispatch(itemsPending());
      let url = `${BASE_URL}/api/items/getAllItems?search=${searchQuery}`;

      if (filterStatus !== "All") {
        url += `&status=${filterStatus.toLowerCase()}`;
      }

      if (categoryFilter !== "All") {
        url += `&category=${categoryFilter}`;
      }

      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch items");

      const data = await response.json();
      dispatch(itemsFetch(data));
      setShowError("");
      setCurrentPage(1);
      toast.success("Items loaded successfully!");
    } catch (error) {
      console.error("Error fetching items:", error);
      setShowError(
        "An error occurred. Please contact the system administrator.",
      );
      dispatch(itemsError(error.message));
      toast.error("Failed to load items");
    }
  };

  useEffect(() => {
    fetchData();
  }, [searchQuery, categoryFilter, filterStatus]);

  // Check permissions
  const canAddItem = user?.roles?.canAddItems === true;
  const canEditItem = user?.roles?.canEditItems === true;

  // Filter items
  const filteredItems = items.filter((item) => {
    const isExpired = new Date(item.expireDate) < new Date();
    const expiresSoon = () => {
      const expireDate = new Date(item.expireDate);
      const today = new Date();
      const daysUntilExpiry = Math.ceil(
        (expireDate - today) / (1000 * 60 * 60 * 24),
      );
      return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
    };

    if (filterStatus === "All") return true;
    if (filterStatus === "Expired") return isExpired;
    if (filterStatus === "Expires Soon") return expiresSoon();
    if (filterStatus === "Active") return !isExpired && !expiresSoon();
    if (filterStatus === "Low Stock") return item.reOrderStatus === "Low";
    return true;
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  // Statistics
  const totalValue = filteredItems.reduce(
    (sum, item) => sum + item.buyingPrice * item.itemQuantity,
    0,
  );

  const lowStockItems = filteredItems.filter(
    (item) => item.reOrderStatus === "Low",
  ).length;
  const expiredItems = filteredItems.filter(
    (item) => new Date(item.expireDate) < new Date(),
  ).length;
  const expiresSoonCount = filteredItems.filter((item) => {
    const expireDate = new Date(item.expireDate);
    const today = new Date();
    const daysUntilExpiry = Math.ceil(
      (expireDate - today) / (1000 * 60 * 60 * 24),
    );
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  }).length;

  // Print Barcode
  const handlePrint = (item) => {
    const win = window.open("", "", "height=400,width=600");
    win.document.write(`
    <html>
      <head>
        <title>Print Barcode</title>
        <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
      </head>
      <body>
        <div style="text-align:center; padding: 20px;">
          <h3 style="font-family: Arial, sans-serif; color: #1e293b; margin-bottom: 15px;">${item.name}</h3>
          <svg id="barcode"></svg>
        </div>
        <script>
          window.onload = function() {
            JsBarcode("#barcode", "${item.barCode}", {width:2, height:60, displayValue:true, font: "Arial"});
            window.print();
            window.onafterprint = () => window.close();
          }
        </script>
      </body>
    </html>
  `);
    win.document.close();
    toast.success("Barcode printed!");
  };

  // Export Functions
  const exportToCSV = () => {
    if (filteredItems.length === 0) {
      toast.error("No data to export");
      return;
    }
    try {
      const exportData = filteredItems.map((item) => ({
        "Item Name": item.name,
        Barcode: item.barCode,
        "Buy Price": item.buyingPrice,
        "Sell Price": item.price,
        "Wholesale Price": item.wholesalePrice || 0,
        "Wholesale Min Qty": item.wholesaleMinQty || 0,
        Quantity: item.itemQuantity,
        Category: category.find((u) => u._id === item.category)?.name || "-",
        Status: item.reOrderStatus,
        "Manufacture Date": new Date(item.manufactureDate).toLocaleDateString(
          "en-GB",
        ),
        "Expiry Date": new Date(item.expireDate).toLocaleDateString("en-GB"),
      }));
      const headers = Object.keys(exportData[0]);
      const csvRows = [headers.join(",")];
      for (const row of exportData) {
        const values = headers.map((header) => {
          const val = row[header];
          const escaped = String(val).replace(/"/g, '""');
          return `"${escaped}"`;
        });
        csvRows.push(values.join(","));
      }
      const csvString = csvRows.join("\n");
      const blob = new Blob(["\uFEFF" + csvString], {
        type: "text/csv;charset=utf-8;",
      });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.href = url;
      link.setAttribute(
        "download",
        `items_export_${new Date().toISOString().slice(0, 19)}.csv`,
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("CSV exported successfully!");
      setShowExportMenu(false);
    } catch (error) {
      console.error("CSV export error:", error);
      toast.error("Failed to export CSV");
    }
  };

  const exportToExcel = () => {
    if (filteredItems.length === 0) {
      toast.error("No data to export");
      return;
    }
    try {
      const exportData = filteredItems.map((item) => ({
        "Item Name": item.name,
        Barcode: item.barCode,
        "Buy Price": item.buyingPrice,
        "Sell Price": item.price,
        "Wholesale Price": item.wholesalePrice || 0,
        "Wholesale Min Qty": item.wholesaleMinQty || 0,
        Quantity: item.itemQuantity,
        Category: category.find((u) => u._id === item.category)?.name || "-",
        Status: item.reOrderStatus,
        "Manufacture Date": new Date(item.manufactureDate).toLocaleDateString(
          "en-GB",
        ),
        "Expiry Date": new Date(item.expireDate).toLocaleDateString("en-GB"),
      }));
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Items");
      XLSX.writeFile(
        workbook,
        `items_export_${new Date().toISOString().slice(0, 19)}.xlsx`,
      );
      toast.success("Excel exported successfully!");
      setShowExportMenu(false);
    } catch (error) {
      console.error("Excel export error:", error);
      toast.error("Failed to export Excel");
    }
  };

  const exportToPDF = () => {
    if (filteredItems.length === 0) {
      toast.error("No data to export");
      return;
    }
    try {
      const doc = new jsPDF();
      const tableColumn = [
        "Item Name",
        "Barcode",
        "Buy Price",
        "Sell Price",
        "Wholesale",
        "Qty",
        "Category",
        "Status",
      ];
      const tableRows = filteredItems.map((item) => [
        item.name,
        item.barCode,
        item.buyingPrice.toLocaleString(),
        item.price.toLocaleString(),
        (item.wholesalePrice || 0).toLocaleString(),
        item.itemQuantity.toLocaleString(),
        category.find((u) => u._id === item.category)?.name || "-",
        item.reOrderStatus,
      ]);
      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 20,
        theme: "grid",
        styles: { fontSize: 9, cellPadding: 2, font: "helvetica" },
        headStyles: {
          fillColor: [76, 175, 80],
          textColor: 255,
          fontStyle: "bold",
        },
        alternateRowStyles: { fillColor: [248, 250, 252] },
      });
      doc.setFontSize(16);
      doc.setTextColor(76, 175, 80);
      doc.text("Inventory Report", 14, 15);
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text(
        `Generated on ${new Date().toLocaleDateString("en-GB")}`,
        14,
        22,
      );
      doc.save(`items_export_${new Date().toISOString().slice(0, 19)}.pdf`);
      toast.success("PDF exported successfully!");
      setShowExportMenu(false);
    } catch (error) {
      console.error("PDF export error:", error);
      toast.error("Failed to export PDF");
    }
  };

  // Helper: Status badge
  const getItemStatus = (item) => {
    const isExpired = new Date(item.expireDate) < new Date();
    const expireDate = new Date(item.expireDate);
    const today = new Date();
    const daysUntilExpiry = Math.ceil(
      (expireDate - today) / (1000 * 60 * 60 * 24),
    );
    const expiresSoon = daysUntilExpiry <= 30 && daysUntilExpiry > 0;

    if (isExpired) {
      return {
        label: "Expired",
        class: "bg-red-100 text-red-700 border-red-200",
        icon: <FaCalendarTimes className="w-3 h-3" />,
      };
    }
    if (expiresSoon) {
      return {
        label: `${daysUntilExpiry}d left`,
        class: "bg-yellow-100 text-yellow-700 border-yellow-200",
        icon: <FaExclamationTriangle className="w-3 h-3" />,
      };
    }
    if (item.reOrderStatus === "Low") {
      return {
        label: "Low Stock",
        class: "bg-red-100 text-red-700 border-red-200",
        icon: <FaExclamationTriangle className="w-3 h-3" />,
      };
    }
    return {
      label: "Active",
      class: "bg-green-300 text-black border-green-400",
      icon: <FaBox className="w-3 h-3" />,
    };
  };

  const formatCurrency = (amount) => {
    return `${(amount || 0).toLocaleString()}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-8xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-300 rounded-xl flex items-center justify-center shadow-lg shadow-green-200 border-2 border-green-400">
              <FaBox className="w-5 h-5 sm:w-6 sm:h-6 text-black" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 tracking-tight">
                Inventory Management
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">
                View and manage all inventory items
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={fetchData}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-100 font-semibold rounded-xl transition-all duration-200 shadow-sm text-xs sm:text-sm"
            >
              <FaSync className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Refresh</span>
            </button>

            {/* Export Button with Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 bg-green-300 hover:bg-green-400 text-black font-semibold rounded-xl transition-all duration-200 shadow-sm text-xs sm:text-sm border-2 border-green-400"
              >
                <FaFileExport className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">Export</span>
              </button>
              {showExportMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border-2 border-gray-200 z-50 overflow-hidden">
                  <button
                    onClick={exportToPDF}
                    className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors border-b border-gray-100"
                  >
                    📄 Export as PDF
                  </button>
                  <button
                    onClick={exportToExcel}
                    className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors border-b border-gray-100"
                  >
                    📊 Export as Excel
                  </button>
                  <button
                    onClick={exportToCSV}
                    className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    📋 Export as CSV
                  </button>
                </div>
              )}
            </div>

            {canAddItem ? (
              <button
                onClick={() => setShowModalAdd(true)}
                className="flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 bg-green-300 hover:bg-green-400 text-black font-semibold rounded-xl transition-all duration-200 shadow-sm text-xs sm:text-sm border-2 border-green-400"
              >
                <FaPlus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">Add Item</span>
              </button>
            ) : (
              <div className="relative group">
                <button
                  disabled
                  className="px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-300 text-gray-500 font-semibold rounded-xl cursor-not-allowed text-xs sm:text-sm flex items-center gap-1.5"
                >
                  <FaPlus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden xs:inline">Add Item</span>
                </button>
                <div className="absolute right-0 top-full mt-2 w-48 sm:w-64 p-3 bg-gray-800 text-white text-sm rounded-2xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <p className="font-bold mb-1 text-xs sm:text-sm">
                    Permission Required
                  </p>
                  <p className="text-gray-300 text-xs">
                    You need the{" "}
                    <span className="font-bold text-green-300">Add Items</span>{" "}
                    permission to create new items.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stats Cards - Stacked on mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6">
          <div className="bg-white p-3 sm:p-4 md:p-5 rounded-2xl border-2 border-gray-300 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs font-medium text-black/60 uppercase tracking-wider truncate">
                  Total Items
                </p>
                <p className="text-base sm:text-lg md:text-xl font-bold text-black mt-0.5 truncate">
                  {filteredItems.length}
                </p>
              </div>
              <div className="bg-green-300 p-2 sm:p-2.5 rounded-xl border-2 border-green-400 flex-shrink-0">
                <FaBox className="w-4 h-4 sm:w-5 sm:h-5 text-black" />
              </div>
            </div>
          </div>

          <div className="bg-white p-3 sm:p-4 md:p-5 rounded-2xl border-2 border-gray-300 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs font-medium text-black/60 uppercase tracking-wider truncate">
                  Stock Value
                </p>
                <p className="text-base sm:text-lg md:text-xl font-bold text-black mt-0.5 truncate">
                  {formatCurrency(totalValue)}
                </p>
              </div>
              <div className="bg-green-300 p-2 sm:p-2.5 rounded-xl border-2 border-green-400 flex-shrink-0">
                <FaTags className="w-4 h-4 sm:w-5 sm:h-5 text-black" />
              </div>
            </div>
          </div>

          <div className="bg-white p-3 sm:p-4 md:p-5 rounded-2xl border-2 border-gray-300 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs font-medium text-black/60 uppercase tracking-wider truncate">
                  Low Stock
                </p>
                <p className="text-base sm:text-lg md:text-xl font-bold text-red-600 mt-0.5 truncate">
                  {lowStockItems}
                </p>
              </div>
              <div className="bg-red-100 p-2 sm:p-2.5 rounded-xl border-2 border-red-300 flex-shrink-0">
                <FaExclamationTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-3 sm:p-4 md:p-5 rounded-2xl border-2 border-gray-300 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs font-medium text-black/60 uppercase tracking-wider truncate">
                  Expired
                </p>
                <p className="text-base sm:text-lg md:text-xl font-bold text-yellow-600 mt-0.5 truncate">
                  {expiredItems + expiresSoonCount}
                </p>
              </div>
              <div className="bg-yellow-100 p-2 sm:p-2.5 rounded-xl border-2 border-yellow-300 flex-shrink-0">
                <FaCalendarTimes className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-5">
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-56 md:w-64">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-black/50 w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <input
                type="text"
                placeholder="Search items..."
                className="w-full pl-8 sm:pl-9 pr-8 py-2 sm:py-2.5 bg-white border-2 border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1 transition-all duration-200 text-black placeholder:text-black/50 text-xs sm:text-sm"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  dispatch(searchItemsPending());
                  setCurrentPage(1);
                }}
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
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl font-semibold text-xs sm:text-sm transition-all duration-200 border-2 ${
                showMobileFilters
                  ? "bg-green-300 border-green-300 text-black shadow-md shadow-green-200"
                  : "bg-white border-gray-300 text-gray-600 hover:bg-gray-100 hover:border-gray-400"
              }`}
            >
              <FiFilter className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Filters</span>
            </button>
          </div>
        </div>

        {/* Category & Status Filters - Responsive */}
        <div className="flex flex-wrap items-center gap-2 mb-3 sm:mb-4">
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="flex-1 sm:flex-none px-3 sm:px-4 py-2 text-xs sm:text-sm border-2 border-gray-300 rounded-xl bg-white text-black focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-transparent"
          >
            <option value="All">All Categories</option>
            {category.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter Pills - Responsive */}
        <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-4 sm:mb-5">
          {["All", "Active", "Low Stock", "Expires Soon", "Expired"].map(
            (status) => (
              <button
                key={status}
                onClick={() => {
                  setFilterStatus(status);
                  setCurrentPage(1);
                }}
                className={`px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-full text-[9px] sm:text-xs font-semibold transition-all duration-200 border-2 ${
                  filterStatus === status
                    ? "bg-green-300 border-green-300 text-black shadow-md shadow-green-200"
                    : "bg-white border-gray-300 text-gray-500 hover:border-gray-400 hover:text-gray-700 hover:bg-gray-100"
                }`}
              >
                {status}
              </button>
            ),
          )}
        </div>

        {/* Error Alert */}
        {showError && (
          <div className="mb-3 sm:mb-4 bg-red-50 border-2 border-red-200 text-red-600 rounded-xl p-3 sm:p-4 text-xs sm:text-sm flex items-center gap-3">
            <FiAlertCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
            <p className="font-bold">{showError}</p>
          </div>
        )}

        {/* Results Count */}
        <div className="flex items-center justify-between mb-2 sm:mb-3 px-1">
          <p className="text-[9px] sm:text-sm text-gray-500">
            <span className="font-semibold text-gray-700">
              {filteredItems.length}
            </span>{" "}
            items found
          </p>
          <p className="text-[9px] sm:text-sm text-gray-400">
            Page {currentPage} of {totalPages || 1}
          </p>
        </div>

        {/* Mobile Card View */}
        <div className="block sm:hidden space-y-2 mb-4">
          {currentItems.length === 0 ? (
            <div className="bg-gray-100 rounded-2xl border-2 border-gray-300 shadow-sm py-12 text-center">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3 border-2 border-gray-300">
                <FaBox className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-sm font-medium text-gray-700">
                No items found
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Try adjusting your filters
              </p>
              {canAddItem && (
                <button
                  onClick={() => setShowModalAdd(true)}
                  className="mt-3 px-4 py-2 bg-green-300 hover:bg-green-400 text-black font-semibold rounded-xl transition-all duration-200 text-sm border-2 border-green-400"
                >
                  <FaPlus className="w-3.5 h-3.5 inline mr-1" />
                  Add New Item
                </button>
              )}
            </div>
          ) : (
            currentItems.map((item) => {
              const isExpanded = expandedItem === item._id;
              const status = getItemStatus(item);
              const isExpired = new Date(item.expireDate) < new Date();
              const expireDate = new Date(item.expireDate);
              const today = new Date();
              const daysUntilExpiry = Math.ceil(
                (expireDate - today) / (1000 * 60 * 60 * 24),
              );
              const expiresSoon = daysUntilExpiry <= 30 && daysUntilExpiry > 0;

              return (
                <div
                  key={item._id}
                  className="bg-white rounded-xl border-2 border-gray-200 shadow-sm hover:shadow-lg hover:border-green-300 transition-all duration-300 overflow-hidden"
                >
                  <div
                    className={`p-3 cursor-pointer ${
                      isExpired
                        ? "bg-gradient-to-r from-red-100 to-red-200"
                        : expiresSoon || item.reOrderStatus === "Low"
                          ? "bg-gradient-to-r from-yellow-100 to-yellow-200"
                          : "bg-gradient-to-r from-green-100 to-green-200"
                    }`}
                    onClick={() =>
                      setExpandedItem(isExpanded ? null : item._id)
                    }
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm flex-shrink-0 border-2 border-gray-200">
                          <FaBox
                            className={
                              isExpired
                                ? "text-red-600"
                                : expiresSoon || item.reOrderStatus === "Low"
                                  ? "text-yellow-600"
                                  : "text-green-600"
                            }
                            size={14}
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-black truncate">
                            {item.name}
                          </p>
                          <p className="text-[9px] text-gray-600">
                            {item.barCode} • {item.itemQuantity} units
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[8px] font-bold border ${status.class}`}
                        >
                          {status.icon}
                          {status.label}
                        </span>
                        {isExpanded ? (
                          <FaChevronUp className="text-gray-500" size={16} />
                        ) : (
                          <FaChevronDown className="text-gray-500" size={16} />
                        )}
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="p-3 space-y-3">
                      <div className="grid grid-cols-3 gap-2">
                        <div className="bg-gray-50 rounded-lg p-2 text-center border border-gray-200">
                          <p className="text-[9px] text-gray-500 font-medium">
                            Buy
                          </p>
                          <p className="text-xs font-bold text-black">
                            {formatCurrency(item.buyingPrice)}
                          </p>
                        </div>
                        <div className="bg-green-50 rounded-lg p-2 text-center border border-green-200">
                          <p className="text-[9px] text-green-600 font-medium">
                            Sell
                          </p>
                          <p className="text-xs font-bold text-green-700">
                            {formatCurrency(item.price)}
                          </p>
                        </div>
                        <div
                          className={`rounded-lg p-2 text-center border ${
                            item.reOrderStatus === "Low"
                              ? "bg-red-50 border-red-200"
                              : "bg-blue-50 border-blue-200"
                          }`}
                        >
                          <p className="text-[9px] text-gray-500 font-medium">
                            Qty
                          </p>
                          <p
                            className={`text-xs font-bold ${
                              item.reOrderStatus === "Low"
                                ? "text-red-600"
                                : "text-black"
                            }`}
                          >
                            {item.itemQuantity}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-gray-50 rounded-lg p-2">
                          <p className="text-gray-500 text-[9px]">Wholesale</p>
                          <p className="font-bold text-black text-xs">
                            {formatCurrency(item.wholesalePrice || 0)}
                          </p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-2">
                          <p className="text-gray-500 text-[9px]">Min Qty</p>
                          <p className="font-bold text-black text-xs">
                            {item.wholesaleMinQty || 0}
                          </p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-2">
                          <p className="text-gray-500 text-[9px]">Mfg Date</p>
                          <p className="font-bold text-black text-xs">
                            {formatDate(item.manufactureDate)}
                          </p>
                        </div>
                        <div
                          className={`rounded-lg p-2 ${
                            isExpired
                              ? "bg-red-50"
                              : expiresSoon
                                ? "bg-yellow-50"
                                : "bg-gray-50"
                          }`}
                        >
                          <p className="text-gray-500 text-[9px]">Exp Date</p>
                          <p
                            className={`font-bold text-xs ${
                              isExpired
                                ? "text-red-600"
                                : expiresSoon
                                  ? "text-yellow-600"
                                  : "text-black"
                            }`}
                          >
                            {formatDate(item.expireDate)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <FaTags className="w-3.5 h-3.5 text-gray-500" />
                        <span className="text-xs font-bold text-black">
                          {category.find((u) => u._id === item.category)
                            ?.name || "-"}
                        </span>
                      </div>

                      <div className="flex flex-col gap-2 pt-2 border-t border-gray-200">
                        <button
                          onClick={() => handlePrint(item)}
                          className="flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-200 hover:bg-gray-300 text-black font-bold rounded-lg text-xs transition-all border border-gray-300"
                        >
                          <FaPrint className="w-3.5 h-3.5" />
                          Print Barcode
                        </button>
                        {canEditItem && (
                          <button
                            onClick={() => {
                              setShowModalEdit(true);
                              setModifiedItem(item);
                            }}
                            className="flex items-center justify-center gap-1.5 px-3 py-2 bg-green-300 hover:bg-green-400 text-black font-bold rounded-lg text-xs transition-all border border-green-400"
                          >
                            <AiTwotoneEdit className="w-3.5 h-3.5" />
                            Edit Item
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Tablet & Desktop Card View */}
        <div className="hidden sm:block space-y-2.5 sm:space-y-3">
          {currentItems.length === 0 ? (
            <div className="bg-gray-100 rounded-2xl border-2 border-gray-300 shadow-sm py-12 sm:py-16 text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 border-2 border-gray-300">
                <FaBox className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
              </div>
              <h3 className="text-sm sm:text-base text-gray-700 font-medium mb-1">
                No Items Found
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                {searchQuery ||
                categoryFilter !== "All" ||
                filterStatus !== "All"
                  ? "No items match your current filters"
                  : "No items found in the system"}
              </p>
              {(searchQuery ||
                categoryFilter !== "All" ||
                filterStatus !== "All") && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setCategoryFilter("All");
                    setFilterStatus("All");
                  }}
                  className="mt-3 px-4 py-2 bg-green-300 hover:bg-green-400 text-black font-semibold rounded-xl transition-all duration-200 text-sm border-2 border-green-400"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          ) : (
            currentItems.map((item) => {
              const isExpanded = expandedItem === item._id;
              const status = getItemStatus(item);
              const isExpired = new Date(item.expireDate) < new Date();
              const expireDate = new Date(item.expireDate);
              const today = new Date();
              const daysUntilExpiry = Math.ceil(
                (expireDate - today) / (1000 * 60 * 60 * 24),
              );
              const expiresSoon = daysUntilExpiry <= 30 && daysUntilExpiry > 0;

              return (
                <div
                  key={item._id}
                  className="bg-white rounded-xl border-2 border-gray-200 shadow-sm hover:shadow-lg hover:border-green-300 transition-all duration-300 overflow-hidden"
                >
                  <div
                    className={`p-3 sm:p-4 cursor-pointer ${
                      isExpired
                        ? "bg-gradient-to-r from-red-100 to-red-200"
                        : expiresSoon || item.reOrderStatus === "Low"
                          ? "bg-gradient-to-r from-yellow-100 to-yellow-200"
                          : "bg-gradient-to-r from-green-100 to-green-200"
                    }`}
                    onClick={() =>
                      setExpandedItem(isExpanded ? null : item._id)
                    }
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="w-10 h-10 sm:w-11 sm:h-11 bg-white rounded-full flex items-center justify-center shadow-sm border-2 border-gray-200">
                          <FaBox
                            className={
                              isExpired
                                ? "text-red-600"
                                : expiresSoon || item.reOrderStatus === "Low"
                                  ? "text-yellow-600"
                                  : "text-green-600"
                            }
                            size={20}
                          />
                        </div>
                        <div>
                          <p className="text-sm sm:text-base font-bold text-black">
                            {item.name}
                          </p>
                          <p className="text-[10px] sm:text-xs text-gray-600">
                            {item.barCode} • {item.itemQuantity} units
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 sm:gap-4">
                        <span
                          className={`px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-bold border ${status.class}`}
                        >
                          {status.icon}
                          {status.label}
                        </span>
                        {isExpanded ? (
                          <FaChevronUp className="text-gray-500" size={20} />
                        ) : (
                          <FaChevronDown className="text-gray-500" size={20} />
                        )}
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="p-4 sm:p-5 border-t-2 border-gray-200">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                          <p className="text-xs text-gray-500 font-medium">
                            Buy Price
                          </p>
                          <p className="text-sm font-bold text-black">
                            {formatCurrency(item.buyingPrice)}
                          </p>
                        </div>
                        <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                          <p className="text-xs text-green-600 font-medium">
                            Sell Price
                          </p>
                          <p className="text-sm font-bold text-green-700">
                            {formatCurrency(item.price)}
                          </p>
                        </div>
                        <div
                          className={`rounded-lg p-3 border ${
                            item.reOrderStatus === "Low"
                              ? "bg-red-50 border-red-200"
                              : "bg-blue-50 border-blue-200"
                          }`}
                        >
                          <p className="text-xs text-gray-500 font-medium">
                            Quantity
                          </p>
                          <p
                            className={`text-sm font-bold ${
                              item.reOrderStatus === "Low"
                                ? "text-red-600"
                                : "text-black"
                            }`}
                          >
                            {item.itemQuantity}
                          </p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                          <p className="text-xs text-gray-500 font-medium">
                            Category
                          </p>
                          <p className="text-sm font-bold text-black">
                            {category.find((u) => u._id === item.category)
                              ?.name || "-"}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                          <p className="text-xs text-gray-500 font-medium">
                            Wholesale Price
                          </p>
                          <p className="text-sm font-bold text-black">
                            {formatCurrency(item.wholesalePrice || 0)}
                          </p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                          <p className="text-xs text-gray-500 font-medium">
                            Min Wholesale Qty
                          </p>
                          <p className="text-sm font-bold text-black">
                            {item.wholesaleMinQty || 0}
                          </p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                          <p className="text-xs text-gray-500 font-medium">
                            Manufacture Date
                          </p>
                          <p className="text-sm font-bold text-black">
                            {formatDate(item.manufactureDate)}
                          </p>
                        </div>
                        <div
                          className={`rounded-lg p-3 border ${
                            isExpired
                              ? "bg-red-50 border-red-200"
                              : expiresSoon
                                ? "bg-yellow-50 border-yellow-200"
                                : "bg-gray-50 border-gray-200"
                          }`}
                        >
                          <p className="text-xs text-gray-500 font-medium">
                            Expiry Date
                          </p>
                          <p
                            className={`text-sm font-bold ${
                              isExpired
                                ? "text-red-600"
                                : expiresSoon
                                  ? "text-yellow-600"
                                  : "text-black"
                            }`}
                          >
                            {formatDate(item.expireDate)}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t-2 border-gray-200">
                        <button
                          onClick={() => handlePrint(item)}
                          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-black font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-2 border border-gray-300"
                        >
                          <FaPrint className="w-4 h-4" />
                          Print Barcode
                        </button>
                        {canEditItem && (
                          <button
                            onClick={() => {
                              setShowModalEdit(true);
                              setModifiedItem(item);
                            }}
                            className="px-4 py-2 bg-green-300 hover:bg-green-400 text-black font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-2 border border-green-400"
                          >
                            <AiTwotoneEdit className="w-4 h-4" />
                            Edit Item
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Pagination - Responsive */}
        {totalPages > 1 && (
          <div className="mt-3 sm:mt-4 bg-white px-3 sm:px-5 py-2.5 sm:py-4 rounded-xl border-2 border-gray-200 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-2">
            <span className="text-[9px] sm:text-xs text-gray-500 text-center sm:text-left">
              Showing{" "}
              <span className="font-semibold text-gray-700">
                {indexOfFirstItem + 1}
              </span>{" "}
              to{" "}
              <span className="font-semibold text-gray-700">
                {Math.min(indexOfLastItem, filteredItems.length)}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-gray-700">
                {filteredItems.length}
              </span>{" "}
              items
            </span>
            <div className="flex items-center gap-1.5 flex-wrap justify-center">
              <button
                onClick={prevPage}
                disabled={currentPage === 1}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  currentPage === 1
                    ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                    : "bg-white border-2 border-gray-300 text-gray-600 hover:bg-gray-100 hover:border-gray-400 shadow-sm"
                }`}
              >
                <IoIosArrowBack className="w-4 h-4" />
              </button>

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
                    className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm border-2 ${
                      currentPage === pageNum
                        ? "bg-green-300 text-black border-green-300 hover:bg-green-400"
                        : "bg-white border-gray-300 text-gray-600 hover:bg-gray-100 hover:border-gray-400"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={nextPage}
                disabled={currentPage === totalPages}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  currentPage === totalPages
                    ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                    : "bg-white border-2 border-gray-300 text-gray-600 hover:bg-gray-100 hover:border-gray-400 shadow-sm"
                }`}
              >
                <IoIosArrowForward className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Modals */}
        {canAddItem && (
          <AddItem
            showModal={showModalAdd}
            setShowModal={setShowModalAdd}
            onItemAdded={fetchData}
            modifiedItem={modifiedItem}
          />
        )}
        {canEditItem && modifiedItem && (
          <EditItem
            showModal={showModalEdit}
            setShowModal={setShowModalEdit}
            onItemUpdated={fetchData}
            item={modifiedItem}
          />
        )}
      </div>
    </div>
  );
};

export default Items;
