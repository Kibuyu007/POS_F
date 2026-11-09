import { useState, useEffect } from "react";
import { FaSearch } from "react-icons/fa";
import { FiRefreshCw, FiDownload, FiX } from "react-icons/fi";
import { MdReceipt, MdHistory } from "react-icons/md";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import BASE_URL from "../../../Utils/config";
import Loading from "../../../Components/Shared/Loading";
import toast from "react-hot-toast";

// Date Picker Imports
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers";
import dayjs from "dayjs";

// Export Libraries
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const Ledger = () => {
  // --- STATE ---
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [ledgerData, setLedgerData] = useState([]);

  // UI State
  const [searchTerm, setSearchTerm] = useState("");
  const [load, setLoad] = useState(false);
  const [error, setError] = useState(null);

  // Modern Date State
  const [startDate, setStartDate] = useState(dayjs().startOf("month"));
  const [endDate, setEndDate] = useState(dayjs());

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // --- FETCH FUNCTIONS ---
  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoad(true);
        const response = await fetch(`${BASE_URL}/api/items/getAllItems`);
        if (!response.ok) throw new Error("Failed to fetch items");

        const result = await response.json();
        setItems(result.data || []);

        if (result.data && result.data.length > 0 && !selectedItem) {
          setSelectedItem(result.data[0]);
        }
      } catch (err) {
        setError(err.message);
        toast.error("Failed to load items");
      } finally {
        setLoad(false);
      }
    };
    fetchItems();
  }, []);

  useEffect(() => {
    if (!selectedItem) return;

    const fetchLedger = async () => {
      try {
        setLoad(true);
        setCurrentPage(1);

        const startStr = startDate ? startDate.format("YYYY-MM-DD") : "";
        const endStr = endDate ? endDate.format("YYYY-MM-DD") : "";

        const url = `${BASE_URL}/api/items/stock-ledger/${selectedItem._id}?startDate=${startStr}&endDate=${endStr}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to fetch ledger data");

        const result = await response.json();
        setLedgerData(result.data || []);
      } catch (err) {
        setError(err.message);
        toast.error("Failed to load ledger history");
      } finally {
        setLoad(false);
      }
    };
    fetchLedger();
  }, [selectedItem, startDate, endDate]);

  // --- DERIVED DATA ---
  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const displayedSidebarItems = searchTerm
    ? filteredItems
    : filteredItems.slice(0, 10);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentLedgerRows = ledgerData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(ledgerData.length / itemsPerPage);

  const tableTotals = ledgerData.reduce(
    (acc, row) => {
      acc.received += Number(row.received) || 0;
      acc.sold += Number(row.sold) || 0;
      acc.adjIn += Number(row.adjustmentIn) || 0;
      acc.adjOut += Number(row.adjustmentOut) || 0;
      return acc;
    },
    { received: 0, sold: 0, adjIn: 0, adjOut: 0 },
  );

  const formatDate = (dateString) => {
    return dayjs(dateString).format("DD MMM YYYY, HH:mm");
  };

  // ==========================================
  // EXPORT FUNCTIONS
  // ==========================================
  const exportToExcel = () => {
    if (ledgerData.length === 0) return toast.error("No data to export");
    try {
      const wsData = ledgerData.map((row, index) => ({
        "S/N": index + 1,
        "Doc No": row.docNo,
        Date: formatDate(row.docDate),
        Narration: row.narration,
        Received: row.received || 0,
        Sold: row.sold || 0,
        "Adj In": row.adjustmentIn || 0,
        "Adj Out": row.adjustmentOut || 0,
        "Running Balance": row.runningBalance,
        Reason: row.reason,
        Employee: row.employee,
      }));

      const ws = XLSX.utils.json_to_sheet(wsData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "StockLedger");
      XLSX.writeFile(
        wb,
        `Stock_Ledger_${selectedItem?.name}_${dayjs().format("YYYYMMDD")}.xlsx`,
      );
      toast.success("Excel downloaded!");
    } catch (error) {
      toast.error("Excel export failed");
    }
  };

  const exportToCSV = () => {
    if (ledgerData.length === 0) return toast.error("No data to export");
    try {
      const headers = [
        "S/N",
        "Doc No",
        "Date",
        "Narration",
        "Received",
        "Sold",
        "Adj In",
        "Adj Out",
        "Running Balance",
        "Reason",
        "Employee",
      ];
      const csvRows = ledgerData.map((row, index) =>
        [
          index + 1,
          `"${row.docNo}"`,
          `"${formatDate(row.docDate)}"`,
          `"${row.narration.replace(/"/g, '""')}"`,
          row.received || 0,
          row.sold || 0,
          row.adjustmentIn || 0,
          row.adjustmentOut || 0,
          row.runningBalance,
          `"${row.reason}"`,
          `"${row.employee}"`,
        ].join(","),
      );

      const csvString = [headers.join(","), ...csvRows].join("\n");
      const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });

      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `Stock_Ledger_${selectedItem?.name}_${dayjs().format("YYYYMMDD")}.csv`,
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("CSV downloaded!");
    } catch (error) {
      toast.error("CSV export failed");
    }
  };

  const exportToPDF = () => {
    if (ledgerData.length === 0) return toast.error("No data to export");
    try {
      const doc = new jsPDF({ orientation: "landscape" });
      doc.setFontSize(16);
      doc.text(`Stock Ledger Report: ${selectedItem?.name}`, 14, 15);

      doc.setFontSize(10);
      doc.text(
        `Date Range: ${startDate ? startDate.format("DD MMM YYYY") : "All"} to ${endDate ? endDate.format("DD MMM YYYY") : "All"}`,
        14,
        22,
      );
      doc.text(`Generated: ${dayjs().format("DD/MM/YYYY HH:mm")}`, 14, 28);
      doc.text(`Total Records: ${ledgerData.length}`, 14, 34);

      const tableData = ledgerData.map((row, index) => [
        index + 1,
        row.docNo,
        formatDate(row.docDate),
        row.narration,
        row.received > 0 ? `+${row.received}` : "-",
        row.sold > 0 ? `-${row.sold}` : "-",
        row.adjustmentIn > 0 ? `+${row.adjustmentIn}` : "-",
        row.adjustmentOut > 0 ? `-${row.adjustmentOut}` : "-",
        row.runningBalance,
        row.reason,
        row.employee,
      ]);

      autoTable(doc, {
        startY: 40,
        head: [
          [
            "S/N",
            "Doc No",
            "Date",
            "Narration",
            "Recv",
            "Sold",
            "Adj In",
            "Adj Out",
            "Running Bal",
            "Reason",
            "Employee",
          ],
        ],
        body: tableData,
        headStyles: { fillColor: [34, 197, 94], textColor: 255, fontSize: 8 },
        bodyStyles: { fontSize: 8 },
        alternateRowStyles: { fillColor: [245, 245, 245] },
      });

      doc.save(
        `Stock_Ledger_${selectedItem?.name}_${dayjs().format("YYYYMMDD")}.pdf`,
      );
      toast.success("PDF downloaded!");
    } catch (error) {
      toast.error("PDF export failed");
    }
  };

  // --- PAGINATION RENDERER ---
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
    for (let i = startPage; i <= endPage; i++) pageNumbers.push(i);

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
        <Loading load={load} />

        {/* ================= HEADER ================= */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-300 rounded-2xl flex items-center justify-center shadow-lg shadow-green-200 border-2 border-green-400 shrink-0">
              <MdHistory className="w-5 h-5 sm:w-6 sm:h-6 text-black" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 tracking-tight">
                Stock Ledger Report
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 hidden xs:block">
                Track item movements, GRNs, and Sales
              </p>
            </div>
          </div>
          <button
            onClick={() => setSelectedItem({ ...selectedItem })}
            className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-100 font-semibold rounded-xl transition-all duration-200 shadow-sm text-xs sm:text-sm w-full sm:w-auto"
          >
            <FiRefreshCw
              className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${load ? "animate-spin" : ""}`}
            />
            <span>Refresh</span>
          </button>
        </div>

        {/* ================= MAIN LAYOUT ================= */}
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
          {/* ================= LEFT SIDEBAR ================= */}
          <div className="w-full lg:w-1/4 flex flex-col bg-white rounded-2xl border-2 border-gray-300 shadow-md overflow-hidden shrink-0">
            <div className="p-3 sm:p-4 border-b-2 border-gray-200 bg-gradient-to-r from-green-200 via-yellow-100 to-green-200">
              <h2 className="font-bold text-gray-800 mb-2 sm:mb-3 text-xs sm:text-sm uppercase tracking-wider">
                Select Item
              </h2>
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-black/50 w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <input
                  type="text"
                  placeholder="Search item name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 sm:pl-9 pr-8 sm:pr-10 py-2 sm:py-2.5 bg-white border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-transparent transition-all duration-200 text-black text-xs sm:text-sm"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-black/40 hover:text-black/70"
                  >
                    <FiX className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Scrollable list */}
            <div className="overflow-y-auto flex-1 custom-scrollbar bg-gray-50/50 p-2 space-y-1.5 max-h-[250px] lg:max-h-[calc(100vh-250px)]">
              {displayedSidebarItems.length === 0 ? (
                <div className="p-4 text-center text-gray-500 font-medium text-xs sm:text-sm">
                  No items found
                </div>
              ) : (
                displayedSidebarItems.map((item) => (
                  <div
                    key={item._id}
                    onClick={() => setSelectedItem(item)}
                    className={`flex justify-between items-center p-2.5 sm:p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 shadow-sm
                      ${
                        selectedItem?._id === item._id
                          ? "bg-green-100 border-green-400 transform scale-[1.02]"
                          : "bg-white border-gray-200 hover:border-green-300 hover:bg-green-50"
                      }`}
                  >
                    <span
                      className={`truncate pr-2 w-3/4 text-xs sm:text-sm ${selectedItem?._id === item._id ? "font-bold text-black" : "text-gray-700 font-medium"}`}
                    >
                      {item.name}
                    </span>
                    <span
                      className={`font-bold px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs border-2 shadow-sm
                      ${
                        selectedItem?._id === item._id
                          ? "bg-green-300 border-green-500 text-black"
                          : "bg-gray-100 border-gray-300 text-gray-600"
                      }`}
                    >
                      {item.itemQuantity}
                    </span>
                  </div>
                ))
              )}
              {!searchTerm && filteredItems.length > 10 && (
                <div className="pt-2 pb-4 text-center">
                  <span className="text-[9px] sm:text-[10px] text-gray-400 font-medium bg-gray-100 px-2 sm:px-3 py-1 rounded-full border border-gray-200">
                    Showing first 10 items. Search to see more.
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* ================= MAIN CONTENT ================= */}
          <div className="w-full lg:w-3/4 flex flex-col min-w-0">
            {/* Toolbar: Filters & Exports */}
            <div className="bg-white p-3 sm:p-4 rounded-2xl border-2 border-gray-300 shadow-md mb-4 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-3 sm:gap-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 w-full xl:w-auto">
                <div className="w-full sm:w-56">
                  <input
                    type="text"
                    disabled
                    value={selectedItem ? selectedItem.name : "Select an item"}
                    className="w-full bg-gray-100 border-2 border-gray-300 rounded-xl p-2 sm:p-2.5 font-bold text-gray-700 text-xs sm:text-sm truncate"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      value={startDate}
                      onChange={(newValue) => setStartDate(newValue)}
                      slotProps={{
                        textField: {
                          size: "small",
                          sx: {
                            width: { xs: "calc(50% - 10px)", sm: "120px" },
                            "& .MuiOutlinedInput-root": {
                              borderRadius: "10px",
                              fontSize: "12px",
                              borderColor: "#d1d5db",
                            },
                          },
                        },
                      }}
                    />
                    <span className="text-gray-400 text-xs font-bold hidden sm:block">
                      TO
                    </span>
                    <DatePicker
                      value={endDate}
                      onChange={(newValue) => setEndDate(newValue)}
                      slotProps={{
                        textField: {
                          size: "small",
                          sx: {
                            width: { xs: "calc(50% - 10px)", sm: "120px" },
                            "& .MuiOutlinedInput-root": {
                              borderRadius: "10px",
                              fontSize: "12px",
                            },
                          },
                        },
                      }}
                    />
                  </LocalizationProvider>
                </div>
              </div>

              <div className="flex gap-2 w-full xl:w-auto overflow-x-auto pb-1 xl:pb-0">
                <button
                  onClick={exportToPDF}
                  className="flex-1 xl:flex-none justify-center flex items-center gap-1.5 bg-white border-2 border-red-500 text-red-600 hover:bg-red-50 hover:-translate-y-0.5 px-3 sm:px-4 py-2 rounded-xl text-[10px] sm:text-xs font-bold transition-all duration-200 shadow-sm whitespace-nowrap"
                >
                  <FiDownload className="w-3.5 h-3.5" /> PDF
                </button>
                <button
                  onClick={exportToExcel}
                  className="flex-1 xl:flex-none justify-center flex items-center gap-1.5 bg-white border-2 border-green-500 text-green-600 hover:bg-green-50 hover:-translate-y-0.5 px-3 sm:px-4 py-2 rounded-xl text-[10px] sm:text-xs font-bold transition-all duration-200 shadow-sm whitespace-nowrap"
                >
                  <FiDownload className="w-3.5 h-3.5" /> Excel
                </button>
                <button
                  onClick={exportToCSV}
                  className="flex-1 xl:flex-none justify-center flex items-center gap-1.5 bg-white border-2 border-yellow-500 text-yellow-600 hover:bg-yellow-50 hover:-translate-y-0.5 px-3 sm:px-4 py-2 rounded-xl text-[10px] sm:text-xs font-bold transition-all duration-200 shadow-sm whitespace-nowrap"
                >
                  <FiDownload className="w-3.5 h-3.5" /> CSV
                </button>
              </div>
            </div>

            {/* ---------------- MOBILE CARD VIEW ---------------- */}
            <div className="md:hidden space-y-2 mb-4">
              {currentLedgerRows.length === 0 ? (
                <div className="bg-white rounded-2xl border-2 border-gray-300 shadow-sm py-12 text-center">
                  <div className="text-4xl mb-3">📭</div>
                  <p className="text-sm font-bold text-black">
                    No movements found
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Try adjusting your filters
                  </p>
                </div>
              ) : (
                currentLedgerRows.map((row) => (
                  <div
                    key={row._id}
                    className="bg-white rounded-xl border-2 border-gray-200 shadow-sm hover:shadow-md transition-all duration-300"
                  >
                    <div className="p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border-2
                            ${
                              row.reason === "Purchase"
                                ? "bg-green-100 text-green-700 border-green-300"
                                : row.reason === "Dispense"
                                  ? "bg-red-100 text-red-700 border-red-300"
                                  : "bg-gray-100 text-gray-700 border-gray-300"
                            }`}
                          >
                            {row.reason}
                          </span>
                          <span className="text-xs font-bold text-blue-700 truncate">
                            {row.docNo}
                          </span>
                        </div>
                        <span className="text-[10px] text-gray-500 flex-shrink-0">
                          {formatDate(row.docDate)}
                        </span>
                      </div>

                      <div className="mb-2 text-xs text-gray-700 bg-gray-50 p-2 rounded-lg border border-gray-200">
                        <span className="font-semibold text-gray-900">
                          Narration:
                        </span>{" "}
                        {row.narration}
                      </div>

                      <div className="grid grid-cols-2 gap-2 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-2.5 border border-gray-200">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-600">Received:</span>
                          <span className="font-bold text-green-600">
                            {row.received > 0 ? `+${row.received}` : "-"}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-600">Sold:</span>
                          <span className="font-bold text-red-600">
                            {row.sold > 0 ? `-${row.sold}` : "-"}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-600">Adj In:</span>
                          <span className="font-bold text-blue-600">
                            {row.adjustmentIn > 0
                              ? `+${row.adjustmentIn}`
                              : "-"}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-600">Adj Out:</span>
                          <span className="font-bold text-orange-500">
                            {row.adjustmentOut > 0
                              ? `-${row.adjustmentOut}`
                              : "-"}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs col-span-2 pt-1.5 border-t border-gray-300">
                          <span className="font-bold text-gray-900">
                            Running Bal:
                          </span>
                          <span className="font-extrabold text-black bg-yellow-200 px-2 rounded">
                            {row.runningBalance}
                          </span>
                        </div>
                      </div>

                      <div className="mt-2 text-right text-[10px] text-gray-500">
                        Employee:{" "}
                        <span className="font-semibold text-gray-700">
                          {row.employee}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* ---------------- DESKTOP TABLE VIEW ---------------- */}
            <div className="hidden md:flex bg-white rounded-2xl border-2 border-gray-300 shadow-md flex-1 overflow-hidden flex-col min-h-[500px]">
              <div className="p-3 sm:p-4 border-b-2 border-gray-200 bg-gray-50 flex justify-between items-center shrink-0">
                <h3 className="font-bold text-gray-800 text-sm sm:text-base flex items-center gap-2">
                  <MdReceipt className="text-green-600 w-4 h-4 sm:w-5 sm:h-5" />
                  Stock Ledger History
                </h3>
                <span className="bg-green-300 text-black px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold border-2 border-green-400 shadow-sm whitespace-nowrap">
                  {ledgerData.length} Records
                </span>
              </div>

              <div className="overflow-auto flex-1 custom-scrollbar p-2 bg-gray-50/30">
                {error ? (
                  <div className="p-8 text-center text-red-500 font-bold">
                    {error}
                  </div>
                ) : (
                  <table className="w-full text-left text-sm whitespace-nowrap border-separate border-spacing-y-2 min-w-[900px]">
                    <thead className="bg-gray-200 sticky top-0 shadow-sm z-10">
                      <tr>
                        <th className="p-2 sm:p-3 font-bold text-black text-[10px] sm:text-xs uppercase text-center border-y-2 border-l-2 border-gray-300 rounded-l-lg">
                          S/N
                        </th>
                        <th className="p-2 sm:p-3 font-bold text-black text-[10px] sm:text-xs uppercase border-y-2 border-gray-300">
                          Doc No
                        </th>
                        <th className="p-2 sm:p-3 font-bold text-black text-[10px] sm:text-xs uppercase border-y-2 border-gray-300">
                          Date
                        </th>
                        <th className="p-2 sm:p-3 font-bold text-black text-[10px] sm:text-xs uppercase border-y-2 border-gray-300">
                          Narration
                        </th>
                        <th className="p-2 sm:p-3 font-bold text-black text-[10px] sm:text-xs uppercase text-right bg-green-200 border-y-2 border-gray-300">
                          Received
                        </th>
                        <th className="p-2 sm:p-3 font-bold text-black text-[10px] sm:text-xs uppercase text-right bg-red-200 border-y-2 border-gray-300">
                          Sold
                        </th>
                        <th className="p-2 sm:p-3 font-bold text-black text-[10px] sm:text-xs uppercase text-right border-y-2 border-gray-300">
                          Adj In
                        </th>
                        <th className="p-2 sm:p-3 font-bold text-black text-[10px] sm:text-xs uppercase text-right border-y-2 border-gray-300">
                          Adj Out
                        </th>
                        <th className="p-2 sm:p-3 font-bold text-black text-[10px] sm:text-xs uppercase text-right bg-yellow-200 border-y-2 border-gray-300">
                          Running Bal
                        </th>
                        <th className="p-2 sm:p-3 font-bold text-black text-[10px] sm:text-xs uppercase text-center border-y-2 border-gray-300">
                          Reason
                        </th>
                        <th className="p-2 sm:p-3 font-bold text-black text-[10px] sm:text-xs uppercase border-y-2 border-r-2 border-gray-300 rounded-r-lg">
                          Employee
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentLedgerRows.length === 0 ? (
                        <tr>
                          <td
                            colSpan="11"
                            className="p-12 text-center bg-white border-2 border-gray-200 rounded-xl shadow-sm"
                          >
                            <div className="text-4xl mb-3">📭</div>
                            <p className="text-lg font-bold text-black">
                              No movements found
                            </p>
                            <p className="text-gray-500 text-sm">
                              Try changing the date range or selecting a
                              different item.
                            </p>
                          </td>
                        </tr>
                      ) : (
                        currentLedgerRows.map((row, index) => (
                          <tr
                            key={row._id}
                            className="bg-white hover:bg-green-50 hover:scale-[1.005] hover:shadow-md hover:border hover:border-green-300 transition-all duration-200 cursor-default group"
                          >
                            <td className="p-2 sm:p-3 text-center border-y-2 border-l-2 border-gray-200 rounded-l-xl font-bold text-gray-500 bg-gray-50 group-hover:bg-green-100 transition-colors text-xs">
                              {indexOfFirstItem + index + 1}
                            </td>
                            <td className="p-2 sm:p-3 text-blue-700 font-bold border-y-2 border-gray-200 text-xs sm:text-base group-hover:bg-green-50 transition-colors">
                              {row.docNo}
                            </td>
                            <td className="p-2 sm:p-3 text-gray-600 font-medium border-y-2 border-gray-200 group-hover:bg-green-50 transition-colors text-xs">
                              {formatDate(row.docDate)}
                            </td>
                            <td
                              className="p-2 sm:p-3 truncate max-w-[150px] lg:max-w-[200px] text-gray-800 border-y-2 border-gray-200 group-hover:bg-green-50 transition-colors text-xs"
                              title={row.narration}
                            >
                              {row.narration}
                            </td>

                            <td className="p-2 sm:p-3 text-right font-extrabold text-green-700 bg-green-50 border-y-2 border-gray-200 group-hover:bg-green-100 transition-colors text-xs">
                              {row.received > 0 ? `+${row.received}` : "-"}
                            </td>
                            <td className="p-2 sm:p-3 text-right font-extrabold text-red-700 bg-red-50 border-y-2 border-gray-200 group-hover:bg-red-100 transition-colors text-xs">
                              {row.sold > 0 ? `-${row.sold}` : "-"}
                            </td>
                            <td className="p-2 sm:p-3 text-right font-bold text-blue-600 border-y-2 border-gray-200 group-hover:bg-green-50 transition-colors text-xs">
                              {row.adjustmentIn > 0
                                ? `+${row.adjustmentIn}`
                                : "-"}
                            </td>
                            <td className="p-2 sm:p-3 text-right font-bold text-orange-500 border-y-2 border-gray-200 group-hover:bg-green-50 transition-colors text-xs">
                              {row.adjustmentOut > 0
                                ? `-${row.adjustmentOut}`
                                : "-"}
                            </td>

                            <td className="p-2 sm:p-3 text-right font-black text-black bg-yellow-50 text-sm sm:text-base border-y-2 border-gray-200 group-hover:bg-yellow-100 transition-colors">
                              {row.runningBalance}
                            </td>

                            <td className="p-2 sm:p-3 text-center border-y-2 border-gray-200 group-hover:bg-green-50 transition-colors">
                              <span
                                className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-wider border-2 shadow-sm
                                ${
                                  row.reason === "Purchase"
                                    ? "bg-green-100 text-green-700 border-green-300"
                                    : row.reason === "Dispense"
                                      ? "bg-red-100 text-red-700 border-red-300"
                                      : "bg-gray-100 text-gray-700 border-gray-300"
                                }`}
                              >
                                {row.reason}
                              </span>
                            </td>
                            <td className="p-2 sm:p-3 text-gray-700 font-medium border-y-2 border-r-2 border-gray-200 rounded-r-xl group-hover:bg-green-50 transition-colors text-xs">
                              {row.employee}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>

                    {/* TABLE FOOTER TOTALS */}
                    {ledgerData.length > 0 && (
                      <tfoot>
                        <tr className="bg-gray-200 text-xs sm:text-sm font-bold text-black shadow-sm">
                          <td
                            colSpan="4"
                            className="p-2 sm:p-3 text-right uppercase tracking-wider text-[10px] sm:text-xs border-y-2 border-l-2 border-gray-300 rounded-l-xl"
                          >
                            Totals for {selectedItem?.name}:
                          </td>
                          <td className="p-2 sm:p-3 text-right text-green-700 bg-green-100 border-y-2 border-gray-300 text-xs">
                            {tableTotals.received > 0
                              ? `+${tableTotals.received}`
                              : "-"}
                          </td>
                          <td className="p-2 sm:p-3 text-right text-red-700 bg-red-100 border-y-2 border-gray-300 text-xs">
                            {tableTotals.sold > 0
                              ? `-${tableTotals.sold}`
                              : "-"}
                          </td>
                          <td className="p-2 sm:p-3 text-right text-blue-700 border-y-2 border-gray-300 text-xs">
                            {tableTotals.adjIn > 0
                              ? `+${tableTotals.adjIn}`
                              : "-"}
                          </td>
                          <td className="p-2 sm:p-3 text-right text-orange-600 border-y-2 border-gray-300 text-xs">
                            {tableTotals.adjOut > 0
                              ? `-${tableTotals.adjOut}`
                              : "-"}
                          </td>
                          <td className="p-2 sm:p-3 text-right text-black text-base sm:text-lg bg-yellow-200 border-y-2 border-gray-300">
                            {selectedItem?.itemQuantity || 0}
                          </td>
                          <td
                            colSpan="2"
                            className="border-y-2 border-r-2 border-gray-300 rounded-r-xl bg-gray-200"
                          ></td>
                        </tr>
                      </tfoot>
                    )}
                  </table>
                )}
              </div>
            </div>

            {/* Mobile Pagination */}
            {totalPages > 1 && (
              <div className="mt-3 bg-white px-3 py-2.5 rounded-xl border-2 border-gray-300 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-2 md:hidden">
                <span className="text-[9px] text-gray-500 text-center sm:text-left">
                  Showing{" "}
                  <span className="font-semibold text-gray-700">
                    {indexOfFirstItem + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-semibold text-gray-700">
                    {Math.min(indexOfLastItem, ledgerData.length)}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-gray-700">
                    {ledgerData.length}
                  </span>
                </span>
                {renderPagination(currentPage, totalPages, setCurrentPage)}
              </div>
            )}

            {/* Desktop Pagination */}
            {ledgerData.length > 0 && (
              <div className="hidden md:flex p-3 border-2 border-t-0 border-gray-300 bg-gray-50 rounded-b-2xl justify-between items-center gap-3 shrink-0 -mt-[2px] z-0">
                <span className="text-xs text-gray-600 font-medium">
                  Showing{" "}
                  <span className="font-bold text-black">
                    {indexOfFirstItem + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-bold text-black">
                    {Math.min(indexOfLastItem, ledgerData.length)}
                  </span>{" "}
                  of{" "}
                  <span className="font-bold text-black">
                    {ledgerData.length}
                  </span>{" "}
                  entries
                </span>
                {renderPagination(currentPage, totalPages, setCurrentPage)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Custom Scrollbar CSS */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `,
        }}
      />
    </div>
  );
};

export default Ledger;
