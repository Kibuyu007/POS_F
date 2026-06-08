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
        class: "bg-red-100 text-red-800 border-red-300",
        icon: <FaCalendarTimes className="w-3 h-3" />,
      };
    }
    if (expiresSoon) {
      return {
        label: `${daysUntilExpiry}d left`,
        class: "bg-yellow-100 text-yellow-800 border-yellow-300",
        icon: <FaExclamationTriangle className="w-3 h-3" />,
      };
    }
    if (item.reOrderStatus === "Low") {
      return {
        label: "Low Stock",
        class: "bg-red-100 text-red-800 border-red-300",
        icon: <FaExclamationTriangle className="w-3 h-3" />,
      };
    }
    return {
      label: "Active",
      class: "bg-green-100 text-green-800 border-green-300",
      icon: <FaBox className="w-3 h-3" />,
    };
  };

  // Helper: Quantity badge
  const getQuantityStyle = (status) => {
    if (status === "Low") return "bg-red-100 text-red-800 border-red-300";
    if (status === "Normal")
      return "bg-green-100 text-green-800 border-green-300";
    return "bg-blue-100 text-blue-800 border-blue-300";
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-5 gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-black">
              Inventory Management
            </h1>
            <p className="text-sm text-gray-600 mt-0.5 hidden sm:block">
              View and manage all inventory items
            </p>
          </div>

          {/* Desktop Actions */}
          <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
            {/* Export Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-gray-50 text-black font-bold rounded-full border border-gray-300 shadow-sm text-sm transition-all"
              >
                <FaFileCsv className="w-4 h-4 text-green-600" />
                <span>Export</span>
                <FaChevronDown
                  className={`w-3 h-3 transition-transform ${showExportMenu ? "rotate-180" : ""}`}
                />
              </button>

              {showExportMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowExportMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded-2xl shadow-xl z-50 overflow-hidden">
                    <button
                      onClick={exportToCSV}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-black hover:bg-gray-50 transition-colors font-bold"
                    >
                      <FaFileCsv className="w-4 h-4 text-blue-600" /> Export CSV
                    </button>
                    <button
                      onClick={exportToExcel}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-black hover:bg-gray-50 transition-colors font-bold"
                    >
                      <FaFileExcel className="w-4 h-4 text-green-600" /> Export
                      Excel
                    </button>
                    <button
                      onClick={exportToPDF}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-black hover:bg-gray-50 transition-colors font-bold"
                    >
                      <FaFilePdf className="w-4 h-4 text-red-600" /> Export PDF
                    </button>
                  </div>
                </>
              )}
            </div>

            <button
              onClick={fetchData}
              className="flex items-center gap-2 px-4 py-2.5 bg-green-300 hover:bg-green-400 text-black font-bold rounded-full border border-green-400 shadow-sm text-sm transition-all"
            >
              <FaSync
                className={`w-4 h-4 ${itemsPending ? "animate-spin" : ""}`}
              />
              <span>Refresh</span>
            </button>

            {canAddItem ? (
              <button
                onClick={() => setShowModalAdd(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-green-300 hover:bg-green-400 text-black font-bold rounded-full border border-green-400 shadow-sm transition-all text-sm"
              >
                <FaPlus className="w-4 h-4" />
                <span>Add Item</span>
              </button>
            ) : (
              <div className="relative group">
                <button
                  disabled
                  className="flex items-center gap-2 px-4 py-2.5 bg-gray-300 text-gray-500 font-bold rounded-full border border-gray-400 cursor-not-allowed text-sm"
                >
                  <FaPlus className="w-4 h-4" />
                  <span>Add Item</span>
                </button>
                <div className="absolute right-0 top-full mt-2 w-64 p-3 bg-gray-800 text-white text-sm rounded-2xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <p className="font-bold mb-1">Permission Required</p>
                  <p className="text-gray-300 text-xs">
                    You need the{" "}
                    <span className="font-bold text-green-300">Add Items</span>{" "}
                    permission to create new inventory items.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Actions - Compact 3-dot menu */}
          <div className="sm:hidden relative">
            <button
              onClick={() => setShowMobileActions(!showMobileActions)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-gray-50 text-black font-bold rounded-full border border-gray-300 shadow-sm text-sm transition-all w-full"
            >
              <FaEllipsisV className="w-4 h-4" />
              <span>Actions</span>
            </button>

            {showMobileActions && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowMobileActions(false)}
                />
                <div className="absolute right-0 left-0 mt-2 bg-white border border-gray-300 rounded-2xl shadow-xl z-50 overflow-hidden">
                  <button
                    onClick={() => {
                      setShowMobileActions(false);
                      setShowExportMenu(true);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-black hover:bg-gray-50 transition-colors font-bold border-b border-gray-200"
                  >
                    <FaFileCsv className="w-4 h-4 text-green-600" /> Export
                  </button>
                  <button
                    onClick={() => {
                      fetchData();
                      setShowMobileActions(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-black hover:bg-gray-50 transition-colors font-bold border-b border-gray-200"
                  >
                    <FaSync
                      className={`w-4 h-4 ${itemsPending ? "animate-spin" : ""}`}
                    />{" "}
                    Refresh
                  </button>
                  {canAddItem ? (
                    <button
                      onClick={() => {
                        setShowModalAdd(true);
                        setShowMobileActions(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-black hover:bg-gray-50 transition-colors font-bold"
                    >
                      <FaPlus className="w-4 h-4 text-green-600" /> Add Item
                    </button>
                  ) : (
                    <button
                      disabled
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-400 cursor-not-allowed font-bold"
                    >
                      <FaPlus className="w-4 h-4" /> Add Item (No Permission)
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Stats Cards - Rounded Full with better text fitting */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
          <div className="bg-white rounded-full border border-gray-300 p-3 sm:p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-green-200 rounded-full flex items-center justify-center flex-shrink-0 border border-green-400">
                <FaBox className="w-4 h-4 sm:w-5 sm:h-5 text-green-700" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs text-gray-600 font-bold truncate">
                  Total Items
                </p>
                <p className="text-lg sm:text-xl font-bold text-black">
                  {filteredItems.length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-full border border-gray-300 p-3 sm:p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-green-200 rounded-full flex items-center justify-center flex-shrink-0 border border-green-400">
                <FaDollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-green-700" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs text-gray-600 font-bold truncate">
                  Stock Value
                </p>
                <p className="text-lg sm:text-xl font-bold text-black truncate">
                  Tsh {totalValue.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-full border border-gray-300 p-3 sm:p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-red-200 rounded-full flex items-center justify-center flex-shrink-0 border border-red-400">
                <FaExclamationTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-700" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs text-gray-600 font-bold truncate">
                  Low Stock
                </p>
                <p className="text-lg sm:text-xl font-bold text-red-700">
                  {lowStockItems}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-full border border-gray-300 p-3 sm:p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-yellow-200 rounded-full flex items-center justify-center flex-shrink-0 border border-yellow-400">
                <FaCalendarTimes className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-700" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs text-gray-600 font-bold truncate">
                  Expired
                </p>
                <p className="text-lg sm:text-xl font-bold text-yellow-700">
                  {expiredItems + expiresSoonCount}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters & Search Bar - Rounded Full */}
        <div className="bg-white rounded-xl border border-gray-300 p-4 shadow-sm mb-5">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <FaSearch className="w-4 h-4 text-gray-500" />
              </div>
              <input
                type="text"
                placeholder="Search items by name or barcode..."
                className="w-full pl-11 pr-4 py-2.5 bg-gray-100 border border-gray-300 rounded-full text-sm text-black placeholder-gray-500 focus:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-100 transition-all"
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
                  className="absolute inset-y-0 right-4 flex items-center text-gray-400 hover:text-gray-600"
                >
                  <FiX className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="min-w-[200px]">
              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2.5 bg-gray-100 border border-gray-300 rounded-full text-sm text-black focus:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-100 transition-all appearance-none cursor-pointer"
              >
                <option value="All">All Categories</option>
                {category.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className={`lg:hidden flex items-center justify-center gap-2 px-4 py-2.5 rounded-full border font-bold text-sm transition-all ${
                showMobileFilters
                  ? "bg-green-300 border-green-400 text-black"
                  : "bg-gray-100 border-gray-300 text-gray-700"
              }`}
            >
              <FiFilter className="w-4 h-4" />
              Filters
            </button>
          </div>

          {/* Status Filter Pills - Rounded Full */}
          <div
            className={`mt-4 ${showMobileFilters ? "block" : "hidden lg:block"}`}
          >
            <div className="flex flex-wrap gap-2">
              {["All", "Active", "Low Stock", "Expires Soon", "Expired"].map(
                (status) => (
                  <button
                    key={status}
                    onClick={() => {
                      setFilterStatus(status);
                      setCurrentPage(1);
                    }}
                    className={`px-5 py-2 rounded-full text-sm font-bold transition-all duration-200 ${
                      filterStatus === status
                        ? "bg-green-300 text-black shadow border border-green-400"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
                    }`}
                  >
                    {status}
                  </button>
                ),
              )}
            </div>
          </div>
        </div>

        {/* Error Alert - Rounded Full */}
        {showError && (
          <div className="bg-red-100 border border-red-300 rounded-full p-4 mb-5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-red-200 rounded-full flex items-center justify-center flex-shrink-0">
                <FiAlertCircle className="w-4 h-4 text-red-700" />
              </div>
              <p className="text-sm text-red-800 font-bold">{showError}</p>
            </div>
          </div>
        )}

        {/* Results Count */}
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm text-gray-600">
            <span className="font-bold text-black">{filteredItems.length}</span>{" "}
            items found
          </p>
          <p className="text-xs text-gray-500">
            Page {currentPage} of {totalPages || 1}
          </p>
        </div>

        {/* ===== MOBILE & TABLET VIEW (Cards - Rounded 2xl) ===== */}
        <div className="lg:hidden space-y-3">
          {currentItems.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-gray-300 shadow-sm">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaBox className="w-8 h-8 text-gray-500" />
              </div>
              <h3 className="text-lg font-bold text-black mb-1">
                No items found
              </h3>
              <p className="text-sm text-gray-600">
                Try adjusting your search or filters
              </p>
              {canAddItem &&
                !searchQuery &&
                filterStatus === "All" &&
                categoryFilter === "All" && (
                  <button
                    onClick={() => setShowModalAdd(true)}
                    className="mt-4 px-5 py-2.5 bg-green-300 hover:bg-green-400 text-black font-bold rounded-full transition-all border border-green-400"
                  >
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
                  className={`bg-white rounded-2xl border overflow-hidden shadow-sm hover:shadow-md transition-all ${
                    isExpired
                      ? "border-red-300"
                      : expiresSoon
                        ? "border-yellow-300"
                        : item.reOrderStatus === "Low"
                          ? "border-red-300"
                          : "border-gray-300"
                  }`}
                >
                  {/* Card Header */}
                  <div
                    className="p-4"
                    onClick={() =>
                      setExpandedItem(isExpanded ? null : item._id)
                    }
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border-2 ${
                            isExpired
                              ? "bg-red-200 border-red-400"
                              : expiresSoon
                                ? "bg-yellow-200 border-yellow-400"
                                : item.reOrderStatus === "Low"
                                  ? "bg-red-200 border-red-400"
                                  : "bg-green-200 border-green-400"
                          }`}
                        >
                          <FaBox
                            className={`w-4 h-4 ${
                              isExpired
                                ? "text-red-700"
                                : expiresSoon
                                  ? "text-yellow-700"
                                  : item.reOrderStatus === "Low"
                                    ? "text-red-700"
                                    : "text-green-700"
                            }`}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-black text-sm truncate">
                            {item.name}
                          </h3>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className="inline-flex items-center gap-1 text-xs text-gray-600">
                              <FaBarcode className="w-3 h-3" />
                              {item.barCode}
                            </span>
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold border ${status.class}`}
                            >
                              {status.icon}
                              {status.label}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        {isExpanded ? (
                          <FaChevronUp className="w-5 h-5 text-gray-500" />
                        ) : (
                          <FaChevronDown className="w-5 h-5 text-gray-500" />
                        )}
                      </div>
                    </div>

                    {/* Quick Stats Row - Rounded Full */}
                    <div className="mt-3 flex gap-2">
                      <div className="flex-1 bg-gray-100 rounded-full p-2.5 text-center border border-gray-300">
                        <p className="text-[10px] text-gray-600 uppercase font-bold">
                          Buy
                        </p>
                        <p className="text-sm font-bold text-black">
                          {item.buyingPrice.toLocaleString()}
                        </p>
                      </div>
                      <div className="flex-1 bg-green-100 rounded-full p-2.5 text-center border border-green-300">
                        <p className="text-[10px] text-green-700 uppercase font-bold">
                          Sell
                        </p>
                        <p className="text-sm font-bold text-green-700">
                          {item.price.toLocaleString()}
                        </p>
                      </div>
                      <div
                        className={`flex-1 rounded-full p-2.5 text-center border ${getQuantityStyle(item.reOrderStatus)}`}
                      >
                        <p className="text-[10px] uppercase font-bold">Qty</p>
                        <p className="text-sm font-bold">
                          {item.itemQuantity.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-gray-200">
                      <div className="grid grid-cols-2 gap-2 mt-3">
                        <div className="bg-gray-100 rounded-full p-3 border border-gray-300">
                          <div className="flex items-center gap-1.5 mb-1">
                            <FaDollarSign className="w-3.5 h-3.5 text-gray-500" />
                            <span className="text-xs text-gray-600 font-bold">
                              Wholesale
                            </span>
                          </div>
                          <p className="text-sm font-bold text-black">
                            {(item.wholesalePrice || 0).toLocaleString()}
                          </p>
                        </div>
                        <div className="bg-gray-100 rounded-full p-3 border border-gray-300">
                          <div className="flex items-center gap-1.5 mb-1">
                            <FaWarehouse className="w-3.5 h-3.5 text-gray-500" />
                            <span className="text-xs text-gray-600 font-bold">
                              Min Qty
                            </span>
                          </div>
                          <p className="text-sm font-bold text-black">
                            {(item.wholesaleMinQty || 0).toLocaleString()}
                          </p>
                        </div>
                        <div className="bg-green-100 rounded-full p-3 border border-green-300">
                          <div className="flex items-center gap-1.5 mb-1">
                            <FaCalendarTimes className="w-3.5 h-3.5 text-green-600" />
                            <span className="text-xs text-green-700 font-bold">
                              Mfg Date
                            </span>
                          </div>
                          <p className="text-sm font-bold text-black">
                            {new Date(item.manufactureDate).toLocaleDateString(
                              "en-GB",
                            )}
                          </p>
                        </div>
                        <div
                          className={`rounded-full p-3 border ${isExpired ? "bg-red-100 border-red-300" : expiresSoon ? "bg-yellow-100 border-yellow-300" : "bg-green-100 border-green-300"}`}
                        >
                          <div className="flex items-center gap-1.5 mb-1">
                            <FaCalendarTimes
                              className={`w-3.5 h-3.5 ${isExpired ? "text-red-600" : expiresSoon ? "text-yellow-600" : "text-green-600"}`}
                            />
                            <span
                              className={`text-xs font-bold ${isExpired ? "text-red-700" : expiresSoon ? "text-yellow-700" : "text-green-700"}`}
                            >
                              Exp Date
                            </span>
                          </div>
                          <p
                            className={`text-sm font-bold ${isExpired ? "text-red-700" : expiresSoon ? "text-yellow-700" : "text-black"}`}
                          >
                            {new Date(item.expireDate).toLocaleDateString(
                              "en-GB",
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3">
                        <div className="flex items-center gap-1.5 mb-1">
                          <FaTags className="w-3.5 h-3.5 text-gray-500" />
                          <span className="text-xs text-gray-600 font-bold">
                            Category
                          </span>
                        </div>
                        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-gray-200 text-black border border-gray-300">
                          {category.find((u) => u._id === item.category)
                            ?.name || "-"}
                        </span>
                      </div>

                      {/* Actions - Rounded Full */}
                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={() => handlePrint(item)}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-gray-200 hover:bg-gray-300 text-black font-bold rounded-full text-xs transition-all border border-gray-300"
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
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-green-300 hover:bg-green-400 text-black font-bold rounded-full text-xs transition-all border border-green-400"
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

        {/* ===== DESKTOP VIEW (Table - Better Design, NOT rounded full) ===== */}
        <div className="hidden lg:block bg-white rounded-xl border border-gray-300 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1200px]">
              <thead>
                <tr className="bg-green-200 border-b border-green-400">
                  {[
                    "SN",
                    "Product",
                    "Buy Price",
                    "Sell Price",
                    "Wholesale",
                    "Min Qty",
                    "Quantity",
                    "Barcode",
                    "Mfg Date",
                    "Exp Date",
                    "Category",
                    "Status",
                    "Action",
                  ].map((header, idx) => (
                    <th
                      key={idx}
                      className="px-4 py-3.5 text-center text-xs font-bold text-black uppercase tracking-wider whitespace-nowrap border-r border-green-300"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {currentItems.length === 0 ? (
                  <tr>
                    <td colSpan={13} className="text-center py-16">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                          <FaBox className="w-8 h-8 text-gray-500" />
                        </div>
                        <div>
                          <p className="text-lg font-bold text-black">
                            No items found
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            Try adjusting your search or filters
                          </p>
                        </div>
                        {canAddItem &&
                          !searchQuery &&
                          filterStatus === "All" &&
                          categoryFilter === "All" && (
                            <button
                              onClick={() => setShowModalAdd(true)}
                              className="mt-2 px-5 py-2.5 bg-green-300 hover:bg-green-400 text-black font-bold rounded-full transition-all border border-green-400"
                            >
                              Add First Item
                            </button>
                          )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentItems.map((item, index) => {
                    const status = getItemStatus(item);
                    const isExpired = new Date(item.expireDate) < new Date();
                    const expireDate = new Date(item.expireDate);
                    const today = new Date();
                    const daysUntilExpiry = Math.ceil(
                      (expireDate - today) / (1000 * 60 * 60 * 24),
                    );
                    const expiresSoon =
                      daysUntilExpiry <= 30 && daysUntilExpiry > 0;

                    return (
                      <React.Fragment key={item._id}>
                        <tr className="hover:bg-green-50 transition-colors cursor-pointer group">
                          <td className="px-4 py-4 text-center border-r border-gray-200">
                            <span className="inline-flex items-center justify-center w-8 h-8 bg-green-300 text-black font-bold rounded-full text-xs">
                              {indexOfFirstItem + index + 1}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-left border-r border-gray-200">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                                  isExpired
                                    ? "bg-red-200 border-red-400"
                                    : expiresSoon
                                      ? "bg-yellow-200 border-yellow-400"
                                      : item.reOrderStatus === "Low"
                                        ? "bg-red-200 border-red-400"
                                        : "bg-green-200 border-green-400"
                                }`}
                              >
                                <FaBox
                                  className={`w-4 h-4 ${
                                    isExpired
                                      ? "text-red-700"
                                      : expiresSoon
                                        ? "text-yellow-700"
                                        : item.reOrderStatus === "Low"
                                          ? "text-red-700"
                                          : "text-green-700"
                                  }`}
                                />
                              </div>
                              <div>
                                <span className="font-bold text-black text-sm">
                                  {item.name}
                                </span>
                                <p className="text-xs text-gray-600">
                                  {item.barCode}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-center border-r border-gray-200">
                            <span className="text-sm font-bold text-black">
                              {item.buyingPrice.toLocaleString()}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-center border-r border-gray-200">
                            <span className="text-sm font-bold text-green-700">
                              {item.price.toLocaleString()}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-center border-r border-gray-200">
                            <span className="text-sm font-bold text-blue-700">
                              {(item.wholesalePrice || 0).toLocaleString()}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-center border-r border-gray-200">
                            <span className="text-sm font-bold text-blue-700">
                              {(item.wholesaleMinQty || 0).toLocaleString()}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-center border-r border-gray-200">
                            <span
                              className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold border ${getQuantityStyle(item.reOrderStatus)}`}
                            >
                              {item.itemQuantity.toLocaleString()}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-center border-r border-gray-200">
                            <button
                              onClick={() => handlePrint(item)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-black font-bold rounded-full text-xs transition-all border border-gray-300"
                            >
                              <FaPrint className="w-3 h-3" />
                              Print
                            </button>
                          </td>
                          <td className="px-4 py-4 text-center border-r border-gray-200">
                            <span className="text-sm font-bold text-black">
                              {new Date(
                                item.manufactureDate,
                              ).toLocaleDateString("en-GB")}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-center border-r border-gray-200">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${isExpired ? "bg-red-100 text-red-800 border-red-300" : expiresSoon ? "bg-yellow-100 text-yellow-800 border-yellow-300" : "bg-green-100 text-green-800 border-green-300"}`}
                            >
                              {new Date(item.expireDate).toLocaleDateString(
                                "en-GB",
                              )}
                              {isExpired && " (Expired)"}
                              {expiresSoon && " (Soon)"}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-center border-r border-gray-200">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-gray-200 text-black border border-gray-300">
                              {category.find((u) => u._id === item.category)
                                ?.name || "-"}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-center border-r border-gray-200">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${status.class}`}
                            >
                              {status.icon}
                              {status.label}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-center">
                            {canEditItem ? (
                              <button
                                onClick={() => {
                                  setShowModalEdit(true);
                                  setModifiedItem(item);
                                }}
                                className="p-2 bg-green-300 hover:bg-green-400 text-black rounded-full transition-all border border-green-400"
                                title="Edit Item"
                              >
                                <AiTwotoneEdit className="w-4 h-4" />
                              </button>
                            ) : (
                              <div className="relative group inline-block">
                                <button
                                  disabled
                                  className="p-2 bg-gray-300 text-gray-500 rounded-full cursor-not-allowed border border-gray-400"
                                >
                                  <AiTwotoneEdit className="w-4 h-4" />
                                </button>
                                <div className="absolute right-0 top-full mt-2 w-64 p-3 bg-gray-800 text-white text-sm rounded-2xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                                  <p className="font-bold mb-1">
                                    Permission Required
                                  </p>
                                  <p className="text-gray-300 text-xs">
                                    You need the{" "}
                                    <span className="font-bold text-green-300">
                                      Edit Items
                                    </span>{" "}
                                    permission to modify items.
                                  </p>
                                </div>
                              </div>
                            )}
                          </td>
                        </tr>
                        <tr className="h-2">
                          <td colSpan={13} className="p-0 bg-gray-50"></td>
                        </tr>
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Desktop Pagination - Rounded Full */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-gray-300 bg-gray-100">
              <p className="text-sm text-gray-600">
                Showing{" "}
                <span className="font-bold text-black">
                  {(currentPage - 1) * itemsPerPage + 1}
                </span>{" "}
                to{" "}
                <span className="font-bold text-black">
                  {Math.min(currentPage * itemsPerPage, totalItems)}
                </span>{" "}
                of <span className="font-bold text-black">{totalItems}</span>{" "}
                items
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={prevPage}
                  disabled={currentPage === 1}
                  className="p-2.5 bg-white hover:bg-gray-100 text-black rounded-full border border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <IoIosArrowBack className="w-4 h-4" />
                </button>
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
                        className={`w-9 h-9 text-sm font-bold rounded-full transition-all ${isCurrent ? "bg-green-300 text-black shadow border border-green-400" : "text-black hover:bg-gray-200 border border-gray-300"}`}
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
                      <span key={i} className="px-2 text-gray-500 font-bold">
                        ...
                      </span>
                    );
                  }
                  return null;
                })}
                <button
                  onClick={nextPage}
                  disabled={currentPage === totalPages}
                  className="p-2.5 bg-white hover:bg-gray-100 text-black rounded-full border border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <IoIosArrowForward className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Pagination - Rounded Full */}
        {totalPages > 1 && (
          <div className="lg:hidden flex items-center justify-center gap-2 mt-4">
            <button
              onClick={prevPage}
              disabled={currentPage === 1}
              className="p-2.5 bg-white hover:bg-gray-100 text-black rounded-full border border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <IoIosArrowBack className="w-5 h-5" />
            </button>
            <span className="px-4 py-2 bg-white border border-gray-300 rounded-full text-sm font-bold text-black">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={nextPage}
              disabled={currentPage === totalPages}
              className="p-2.5 bg-white hover:bg-gray-100 text-black rounded-full border border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <IoIosArrowForward className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

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
