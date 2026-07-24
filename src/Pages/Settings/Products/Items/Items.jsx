import React from "react";
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
  FaFileCsv,
  FaFileExcel,
  FaFilePdf,
  FaBox,
  FaExclamationTriangle,
  FaCalendarTimes,
  FaTags,
  FaBarcode,
  FaDollarSign,
  FaWarehouse,
  FaPlus,
  FaSync,
  FaChevronDown,
  FaChevronUp,
  FaEllipsisV,
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
  const [showMobileActions, setShowMobileActions] = useState(false);

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
  const totalItems = filteredItems.length;

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
  const totalItemsCount = filteredItems.reduce(
    (sum, item) => sum + item.itemQuantity,
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
      setShowMobileActions(false);
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
      setShowMobileActions(false);
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
      setShowMobileActions(false);
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
      class: "bg-emerald-100 text-emerald-700 border-emerald-200",
      icon: <FaBox className="w-3 h-3" />,
    };
  };

  const getQuantityStyle = (status) => {
    if (status === "Low") return "bg-red-100 text-red-700 border-red-200";
    if (status === "Normal") return "bg-emerald-100 text-emerald-700 border-emerald-200";
    return "bg-blue-100 text-blue-700 border-blue-200";
  };

  const formatCurrency = (amount) => {
    return `TSh ${(amount || 0).toLocaleString()}`;
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
    <div className="p-2 sm:p-3 md:p-4 lg:p-5 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-black">
            Inventory Management
          </h1>
          <p className="text-gray-600 text-xs hidden sm:block">
            View and manage all inventory items
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            className="px-3 py-2 bg-green-300 hover:bg-green-400 text-black font-bold rounded-full shadow text-xs flex items-center gap-1.5 flex-shrink-0"
          >
            <FaSync className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          {canAddItem ? (
            <button
              onClick={() => setShowModalAdd(true)}
              className="px-3 py-2 bg-green-300 hover:bg-green-400 text-black font-bold rounded-full shadow text-xs flex items-center gap-1.5 flex-shrink-0"
            >
              <FaPlus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Add Item</span>
              <span className="sm:hidden">Add</span>
            </button>
          ) : (
            <div className="relative group">
              <button
                disabled
                className="px-3 py-2 bg-gray-300 text-gray-500 font-bold rounded-full cursor-not-allowed text-xs flex items-center gap-1.5"
              >
                <FaPlus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Add Item</span>
              </button>
              <div className="absolute right-0 top-full mt-2 w-64 p-3 bg-gray-800 text-white text-sm rounded-2xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <p className="font-bold mb-1">Permission Required</p>
                <p className="text-gray-300 text-xs">
                  You need the <span className="font-bold text-green-300">Add Items</span> permission to create new items.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3 sm:mb-4">
        <div className="bg-white border border-gray-200 rounded-full p-2.5 sm:p-3 shadow-sm text-center">
          <p className="text-[10px] sm:text-xs text-gray-500 font-medium mb-0.5">
            Total Items
          </p>
          <p className="text-xs sm:text-sm md:text-base font-bold text-black">
            {filteredItems.length}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-full p-2.5 sm:p-3 shadow-sm text-center">
          <p className="text-[10px] sm:text-xs text-gray-500 font-medium mb-0.5">
            Stock Value
          </p>
          <p className="text-xs sm:text-sm md:text-base font-bold text-black truncate">
            {totalValue.toLocaleString()}
          </p>
          <p className="text-[9px] text-gray-400">Tsh</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-full p-2.5 sm:p-3 shadow-sm text-center">
          <p className="text-[10px] sm:text-xs text-gray-500 font-medium mb-0.5">
            Low Stock
          </p>
          <p className="text-xs sm:text-sm md:text-base font-bold text-red-600">
            {lowStockItems}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-full p-2.5 sm:p-3 shadow-sm text-center">
          <p className="text-[10px] sm:text-xs text-gray-500 font-medium mb-0.5">
            Expired
          </p>
          <p className="text-xs sm:text-sm md:text-base font-bold text-yellow-600">
            {expiredItems + expiresSoonCount}
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex gap-2 mb-3 sm:mb-4">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-3 sm:left-4 flex items-center">
            <FaSearch className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search items by name or barcode..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              dispatch(searchItemsPending());
              setCurrentPage(1);
            }}
            className="w-full pl-9 sm:pl-11 pr-8 py-2.5 sm:py-3 text-sm border border-gray-300 rounded-full bg-white text-black focus:border-green-300 focus:outline-none focus:ring-2 focus:ring-green-100"
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
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          className={`px-3 sm:px-4 py-2.5 rounded-full border font-bold text-sm flex items-center gap-1.5 flex-shrink-0 transition-all ${
            showMobileFilters
              ? "bg-green-300 border-green-400 text-black"
              : "bg-white border-gray-300 text-gray-700"
          }`}
        >
          <FiFilter className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Filters</span>
        </button>
      </div>

      {/* Category & Status Filters */}
      <div className="flex flex-wrap gap-2 mb-3 sm:mb-4">
        <select
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="px-3 py-2 text-sm border border-gray-300 rounded-full bg-white text-black focus:border-green-300 focus:outline-none"
        >
          <option value="All">All Categories</option>
          {category.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Status Filter Pills */}
      <div className="flex flex-wrap gap-2 mb-3 sm:mb-4">
        {["All", "Active", "Low Stock", "Expires Soon", "Expired"].map(
          (status) => (
            <button
              key={status}
              onClick={() => {
                setFilterStatus(status);
                setCurrentPage(1);
              }}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                filterStatus === status
                  ? "bg-green-300 text-black shadow border border-green-400"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-100"
              }`}
            >
              {status}
            </button>
          ),
        )}
      </div>

      {/* Error Alert */}
      {showError && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-full p-4 mb-4 flex items-center gap-3">
          <FiAlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-bold">{showError}</p>
        </div>
      )}

      {/* Results Count */}
      <div className="flex items-center justify-between mb-2 px-1">
        <p className="text-xs text-gray-500">
          <span className="font-bold text-black">{filteredItems.length}</span>{" "}
          items found
        </p>
        <p className="text-[10px] text-gray-400">
          Page {currentPage} of {totalPages || 1}
        </p>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-2 mb-4">
        {currentItems.length === 0 ? (
          <div className="bg-white rounded-xl p-6 text-center border border-gray-200">
            <div className="text-3xl mb-2">📦</div>
            <p className="text-sm font-bold text-black">No items found</p>
            <p className="text-xs text-gray-500">Try adjusting filters</p>
            {canAddItem && (
              <button
                onClick={() => setShowModalAdd(true)}
                className="mt-3 px-4 py-2 bg-green-300 hover:bg-green-400 text-black font-bold rounded-full text-xs transition-all border border-green-400"
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
                className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm"
              >
                <div
                  className={`p-3 cursor-pointer ${
                    isExpired
                      ? "bg-gradient-to-r from-red-100 to-red-200"
                      : expiresSoon || item.reOrderStatus === "Low"
                      ? "bg-gradient-to-r from-yellow-100 to-yellow-200"
                      : "bg-gradient-to-r from-green-100 to-green-200"
                  }`}
                  onClick={() => setExpandedItem(isExpanded ? null : item._id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm flex-shrink-0">
                        <FaBox
                          className={
                            isExpired
                              ? "text-red-600"
                              : expiresSoon || item.reOrderStatus === "Low"
                              ? "text-yellow-600"
                              : "text-green-600"
                          }
                          size={16}
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-black truncate">
                          {item.name}
                        </p>
                        <p className="text-[10px] text-gray-600">
                          {item.barCode} • {item.itemQuantity} units
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${status.class}`}
                      >
                        {status.icon}
                        {status.label}
                      </span>
                      {isExpanded ? (
                        <FaChevronUp className="text-gray-500" size={18} />
                      ) : (
                        <FaChevronDown className="text-gray-500" size={18} />
                      )}
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="p-3 space-y-3">
                    {/* Quick Stats */}
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-gray-50 rounded-lg p-2 text-center border border-gray-200">
                        <p className="text-[10px] text-gray-500 font-medium">
                          Buy
                        </p>
                        <p className="text-sm font-bold text-black">
                          {formatCurrency(item.buyingPrice)}
                        </p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-2 text-center border border-green-200">
                        <p className="text-[10px] text-green-600 font-medium">
                          Sell
                        </p>
                        <p className="text-sm font-bold text-green-700">
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
                        <p className="text-[10px] text-gray-500 font-medium">
                          Qty
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
                    </div>

                    {/* Info Grid */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-gray-50 rounded-lg p-2">
                        <p className="text-gray-500 text-[10px]">Wholesale</p>
                        <p className="font-bold text-black">
                          {formatCurrency(item.wholesalePrice || 0)}
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-2">
                        <p className="text-gray-500 text-[10px]">Min Qty</p>
                        <p className="font-bold text-black">
                          {item.wholesaleMinQty || 0}
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-2">
                        <p className="text-gray-500 text-[10px]">Mfg Date</p>
                        <p className="font-bold text-black">
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
                        <p className="text-gray-500 text-[10px]">Exp Date</p>
                        <p
                          className={`font-bold ${
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

                    {/* Category */}
                    <div className="flex items-center gap-2">
                      <FaTags className="w-3.5 h-3.5 text-gray-500" />
                      <span className="text-xs font-bold text-black">
                        {category.find((u) => u._id === item.category)?.name ||
                          "-"}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2 border-t border-gray-200">
                      <button
                        onClick={() => handlePrint(item)}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-200 hover:bg-gray-300 text-black font-bold rounded-full text-xs transition-all border border-gray-300"
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
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-green-300 hover:bg-green-400 text-black font-bold rounded-full text-xs transition-all border border-green-400"
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

      {/* Desktop Card View */}
      <div className="hidden lg:block space-y-3">
        {currentItems.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center border border-gray-200">
            <div className="text-4xl mb-3">📦</div>
            <h3 className="text-lg font-bold text-black mb-2">
              No Items Found
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              {searchQuery || categoryFilter !== "All" || filterStatus !== "All"
                ? "No items match your current filters"
                : "No items found in the system"}
            </p>
            {(searchQuery || categoryFilter !== "All" ||
              filterStatus !== "All") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setCategoryFilter("All");
                  setFilterStatus("All");
                }}
                className="px-4 py-2 bg-green-300 hover:bg-green-400 text-black font-bold rounded-full transition-colors text-sm"
              >
                Clear All Filters
              </button>
            )}
            {canAddItem && !searchQuery && categoryFilter === "All" && filterStatus === "All" && (
              <button
                onClick={() => setShowModalAdd(true)}
                className="ml-3 px-4 py-2 bg-green-300 hover:bg-green-400 text-black font-bold rounded-full transition-colors text-sm border border-green-400"
              >
                <FaPlus className="w-3.5 h-3.5 inline mr-1" />
                Add First Item
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
                className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <div
                  className={`p-4 cursor-pointer ${
                    isExpired
                      ? "bg-gradient-to-r from-red-100 to-red-200"
                      : expiresSoon || item.reOrderStatus === "Low"
                      ? "bg-gradient-to-r from-yellow-100 to-yellow-200"
                      : "bg-gradient-to-r from-green-100 to-green-200"
                  }`}
                  onClick={() => setExpandedItem(isExpanded ? null : item._id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
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
                        <p className="font-bold text-black">{item.name}</p>
                        <p className="text-xs text-gray-600">
                          {item.barCode} • {item.itemQuantity} units
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-bold border ${status.class}`}
                        >
                          {status.icon}
                          {status.label}
                        </span>
                      </div>
                      {isExpanded ? (
                        <FaChevronUp className="text-gray-500" size={20} />
                      ) : (
                        <FaChevronDown className="text-gray-500" size={20} />
                      )}
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="p-4 border-t border-gray-200">
                    <div className="grid grid-cols-4 gap-3 mb-4">
                      <div className="bg-gray-50 rounded-lg p-3">
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
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 font-medium">
                          Category
                        </p>
                        <p className="text-sm font-bold text-black">
                          {category.find((u) => u._id === item.category)
                            ?.name || "-"}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-3 mb-4">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 font-medium">
                          Wholesale Price
                        </p>
                        <p className="text-sm font-bold text-black">
                          {formatCurrency(item.wholesalePrice || 0)}
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 font-medium">
                          Min Wholesale Qty
                        </p>
                        <p className="text-sm font-bold text-black">
                          {item.wholesaleMinQty || 0}
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
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

                    <div className="flex gap-3 pt-3 border-t border-gray-200">
                      <button
                        onClick={() => handlePrint(item)}
                        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-black font-bold rounded-full text-sm transition-all flex items-center gap-2 border border-gray-300"
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
                          className="px-4 py-2 bg-green-300 hover:bg-green-400 text-black font-bold rounded-full text-sm transition-all flex items-center gap-2 border border-green-400"
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-2 mt-3 sm:mt-4 p-3 bg-white rounded-full border border-gray-200 shadow-sm">
          <button
            onClick={prevPage}
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
            onClick={nextPage}
            disabled={currentPage === totalPages}
            className="p-2 bg-gray-100 hover:bg-gray-200 text-black rounded-full disabled:opacity-40"
          >
            <IoIosArrowForward className="w-4 h-4" />
          </button>
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
  );
};

export default Items;