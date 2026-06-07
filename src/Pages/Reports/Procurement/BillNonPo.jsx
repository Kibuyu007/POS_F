import React from "react";
import axios from "axios";
import { useState, useEffect } from "react";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { FaSearch, FaFilter } from "react-icons/fa";
import { FiRefreshCw, FiX } from "react-icons/fi";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import Loading from "../../../Components/Shared/Loading";
import BASE_URL from "../../../Utils/config";
import toast from "react-hot-toast";

const BillNonPo = () => {
  const [reportData, setReportData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [load, setLoad] = useState(true);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [createdBy, setCreatedBy] = useState("");
  const [supplierFilter, setSupplierFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  
  const itemsPerPage = 10;

  useEffect(() => {
    fetchReport();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
    applyFilters();
  }, [startDate, endDate, selectedSupplier, createdBy, supplierFilter, reportData]);

  const fetchReport = async () => {
    try {
      setLoad(true);
      const res = await axios.get(`${BASE_URL}/api/grn/nonPoBillReport`);
      if (res.data.success) {
        setReportData(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching report:", err);
      toast.error("Failed to load report data.");
    } finally {
      setLoad(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...reportData];

    if (startDate) {
      filtered = filtered.filter(
        (item) => dayjs(item.createdAt).isSameOrAfter(dayjs(startDate), "day")
      );
    }
    if (endDate) {
      filtered = filtered.filter(
        (item) => dayjs(item.createdAt).isSameOrBefore(dayjs(endDate), "day")
      );
    }
    if (selectedSupplier) {
      filtered = filtered.filter((item) => item.supplier === selectedSupplier);
    }
    if (createdBy) {
      filtered = filtered.filter((item) => item.changedBy === createdBy);
    }
    if (supplierFilter) {
      filtered = filtered.filter((item) =>
        (item.supplier || "").toLowerCase().includes(supplierFilter.toLowerCase())
      );
    }

    setFilteredData(filtered);
  };

  const suppliers = [...new Set(reportData.map((item) => item.supplier))];
  const alieChange = [...new Set(reportData.map((item) => item.changedBy))];

  const totalBilledCost = filteredData.reduce(
    (sum, item) => sum + (item.billedTotalCost || 0), 0
  );
  const totalBilledAmount = filteredData.reduce(
    (sum, item) => sum + (item.billedAmount || 0), 0
  );
  const billedItems = filteredData.length;
  const paidItems = filteredData.filter((item) => item.status === "Paid").length;
  const pendingItems = filteredData.filter((item) => item.status === "Pending").length;

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const currentData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const clearFilters = () => {
    setStartDate(null);
    setEndDate(null);
    setSelectedSupplier("");
    setCreatedBy("");
    setSupplierFilter("");
    toast.success("Cleared!");
  };

  const activeFilterCount = [
    startDate,
    endDate,
    selectedSupplier,
    createdBy,
    supplierFilter
  ].filter(Boolean).length;

  return (
    <div className="p-2 sm:p-3 md:p-4 lg:p-5 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-black">Non-PO Billed Report</h1>
          <p className="text-gray-600 text-xs hidden sm:block">
            View and analyze all Non-PO GRN billing records
          </p>
        </div>
        <button
          onClick={fetchReport}
          className="px-3 py-2 bg-green-300 hover:bg-green-400 text-black font-bold rounded-full shadow text-xs flex items-center gap-1.5 flex-shrink-0"
        >
          <FiRefreshCw className={`w-3.5 h-3.5 ${load ? "animate-spin" : ""}`} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* Stats Cards - Mobile Friendly */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3 sm:mb-4">
        <div className="bg-white border border-gray-200 rounded-xl p-2.5 sm:p-3 shadow-sm text-center">
          <p className="text-[10px] sm:text-xs text-gray-500 font-medium mb-0.5">Billed Cost</p>
          <p className="text-xs sm:text-sm md:text-base font-bold text-black truncate">
            {totalBilledCost.toLocaleString()}
          </p>
          <p className="text-[9px] text-gray-400">Tsh</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-2.5 sm:p-3 shadow-sm text-center">
          <p className="text-[10px] sm:text-xs text-gray-500 font-medium mb-0.5">Total Items</p>
          <p className="text-xs sm:text-sm md:text-base font-bold text-black">
            {billedItems.toLocaleString()}
          </p>
          <p className="text-[9px] text-gray-400">items</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-2.5 sm:p-3 shadow-sm text-center">
          <p className="text-[10px] sm:text-xs text-gray-500 font-medium mb-0.5">Quantity</p>
          <p className="text-xs sm:text-sm md:text-base font-bold text-green-600 truncate">
            {totalBilledAmount.toLocaleString()}
          </p>
          <p className="text-[9px] text-gray-400">qty</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-2.5 sm:p-3 shadow-sm text-center">
          <p className="text-[10px] sm:text-xs text-gray-500 font-medium mb-0.5">Status</p>
          <div className="flex items-center justify-center gap-1.5">
            <span className="text-[10px] font-bold text-green-600">{paidItems}</span>
            <span className="text-gray-400">/</span>
            <span className="text-[10px] font-bold text-red-600">{pendingItems}</span>
          </div>
          <p className="text-[9px] text-gray-400">paid/pending</p>
        </div>
      </div>

      {/* Search Bar + Filter Toggle */}
      <div className="flex gap-2 mb-3 sm:mb-4">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-3 flex items-center">
            <FaSearch className="w-3.5 h-3.5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search supplier..."
            className="w-full pl-9 pr-8 py-2.5 text-sm border border-gray-300 rounded-xl bg-white text-black focus:border-green-300 focus:outline-none focus:ring-2 focus:ring-green-100"
            value={supplierFilter}
            onChange={(e) => setSupplierFilter(e.target.value)}
          />
          {supplierFilter && (
            <button
              onClick={() => setSupplierFilter("")}
              className="absolute inset-y-0 right-3 flex items-center text-gray-400"
            >
              <FiX className="w-4 h-4" />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`px-3 py-2.5 rounded-xl border font-bold text-sm flex items-center gap-1.5 flex-shrink-0 transition-all ${
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

      {/* Expandable Filters Panel */}
      {showFilters && (
        <div className="bg-white rounded-xl p-3 sm:p-4 shadow-lg border border-gray-100 mb-3 sm:mb-4 space-y-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-black">Advanced Filters</h3>
            <button onClick={() => setShowFilters(false)} className="text-gray-400">
              <FiX className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">From Date</label>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  value={startDate}
                  onChange={setStartDate}
                  slotProps={{
                    textField: {
                      size: "small",
                      fullWidth: true,
                      sx: { "& .MuiOutlinedInput-root": { borderRadius: "10px", fontSize: "13px" } },
                    },
                  }}
                />
              </LocalizationProvider>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">To Date</label>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  value={endDate}
                  onChange={setEndDate}
                  slotProps={{
                    textField: {
                      size: "small",
                      fullWidth: true,
                      sx: { "& .MuiOutlinedInput-root": { borderRadius: "10px", fontSize: "13px" } },
                    },
                  }}
                />
              </LocalizationProvider>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Supplier</label>
              <select
                value={selectedSupplier}
                onChange={(e) => setSelectedSupplier(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-xl bg-white focus:border-green-300 focus:outline-none"
              >
                <option value="">All Suppliers</option>
                {suppliers.map((sup, idx) => (
                  <option key={idx} value={sup}>{sup}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Changed By</label>
              <select
                value={createdBy}
                onChange={(e) => setCreatedBy(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-xl bg-white focus:border-green-300 focus:outline-none"
              >
                <option value="">All Users</option>
                {alieChange.map((u, idx) => (
                  <option key={idx} value={u}>{u}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-2 pt-2 border-t border-gray-100">
            <button
              onClick={clearFilters}
              className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-black font-bold rounded-xl text-xs"
            >
              Clear All
            </button>
          </div>
        </div>
      )}

      {/* Active Filter Chips */}
      {activeFilterCount > 0 && !showFilters && (
        <div className="flex flex-wrap gap-1.5 mb-3 sm:mb-4">
          {startDate && (
            <span className="inline-flex items-center px-2.5 py-1 bg-blue-100 text-blue-800 text-[10px] font-medium rounded-full">
              From {dayjs(startDate).format("DD/MM")}
              <button onClick={() => setStartDate(null)} className="ml-1"><FiX className="w-3 h-3" /></button>
            </span>
          )}
          {endDate && (
            <span className="inline-flex items-center px-2.5 py-1 bg-blue-100 text-blue-800 text-[10px] font-medium rounded-full">
              To {dayjs(endDate).format("DD/MM")}
              <button onClick={() => setEndDate(null)} className="ml-1"><FiX className="w-3 h-3" /></button>
            </span>
          )}
          {selectedSupplier && (
            <span className="inline-flex items-center px-2.5 py-1 bg-green-100 text-green-800 text-[10px] font-medium rounded-full">
              {selectedSupplier}
              <button onClick={() => setSelectedSupplier("")} className="ml-1"><FiX className="w-3 h-3" /></button>
            </span>
          )}
          {createdBy && (
            <span className="inline-flex items-center px-2.5 py-1 bg-purple-100 text-purple-800 text-[10px] font-medium rounded-full">
              {createdBy}
              <button onClick={() => setCreatedBy("")} className="ml-1"><FiX className="w-3 h-3" /></button>
            </span>
          )}
          {supplierFilter && (
            <span className="inline-flex items-center px-2.5 py-1 bg-yellow-100 text-yellow-800 text-[10px] font-medium rounded-full">
              {supplierFilter}
              <button onClick={() => setSupplierFilter("")} className="ml-1"><FiX className="w-3 h-3" /></button>
            </span>
          )}
        </div>
      )}

      <Loading load={load} />

      {/* Results Count */}
      <div className="flex items-center justify-between mb-2 px-1">
        <p className="text-xs text-gray-500">
          <span className="font-bold text-black">{filteredData.length}</span> results
        </p>
        <p className="text-[10px] text-gray-400">
          Page {currentPage} of {totalPages || 1}
        </p>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-2 mb-4">
        {currentData.length === 0 ? (
          <div className="bg-white rounded-xl p-6 text-center border border-gray-200">
            <div className="text-3xl mb-2">📋</div>
            <p className="text-sm font-bold text-black">No billing records</p>
            <p className="text-xs text-gray-500">Try adjusting filters</p>
          </div>
        ) : (
          currentData.map((log, idx) => (
            <div key={log._id || idx} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              {/* Card Header */}
              <div className="flex items-center justify-between p-3 bg-gray-50 border-b border-gray-100">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="inline-flex items-center justify-center w-7 h-7 bg-green-300 text-black font-bold rounded-full text-xs flex-shrink-0">
                    {(currentPage - 1) * itemsPerPage + idx + 1}
                  </span>
                  <span className="text-xs font-bold text-black truncate">
                    {log.supplier || "—"}
                  </span>
                </div>
                <span className={`inline-block px-2.5 py-1 font-bold rounded-full text-[10px] flex-shrink-0 ${
                  log.status === "Paid" ? "bg-green-300 text-green-900" : "bg-red-100 text-red-700"
                }`}>
                  {log.status || "—"}
                </span>
              </div>

              {/* Card Body */}
              <div className="p-3 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Item:</span>
                  <span className="font-bold text-black">{log.itemName || "—"}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Quantity:</span>
                  <span className="font-bold text-black">{(log.billedAmount || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Total Cost:</span>
                  <span className="font-bold text-black">Tsh {(log.billedTotalCost || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Created:</span>
                  <span className="font-bold text-black">
                    {log.createdAt ? dayjs(log.createdAt).format("DD/MM/YY HH:mm") : "—"}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">By:</span>
                  <span className="font-bold text-black">{log.createdBy || "—"}</span>
                </div>
                {log.completedAt && (
                  <div className="flex justify-between text-xs pt-1 border-t border-gray-100">
                    <span className="text-gray-500">Completed:</span>
                    <span className="font-bold text-black">
                      {dayjs(log.completedAt).format("DD/MM/YY HH:mm")}
                    </span>
                  </div>
                )}
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
                {["SN", "Date", "Supplier", "Item", "Qty", "Cost", "Status", "By", "At"].map((h) => (
                  <th key={h} className="px-3 py-3 text-center text-xs font-bold text-black uppercase border-r border-gray-300">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tr className="h-3" />

            <tbody>
              {currentData.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-12">
                    <div className="space-y-3">
                      <div className="text-4xl">📋</div>
                      <p className="text-lg font-bold text-black">No billing records found</p>
                      <p className="text-gray-600 text-sm">Try adjusting your search filters</p>
                    </div>
                  </td>
                </tr>
              ) : (
                currentData.map((log, idx) => (
                  <React.Fragment key={log._id || idx}>
                    <tr className="hover:bg-gray-50 transition-colors shadow-md">
                      <td className="py-3 px-2 text-center border-r border-gray-300 bg-gray-200">
                        <span className="inline-flex items-center justify-center w-8 h-8 bg-green-300 text-black font-bold rounded-full text-xs shadow">
                          {(currentPage - 1) * itemsPerPage + idx + 1}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-center bg-gray-100 border-r border-gray-200">
                        <span className="font-bold text-black text-xs">
                          {log.createdAt ? dayjs(log.createdAt).format("DD/MM/YYYY HH:mm") : "—"}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-center bg-green-200 border-r border-gray-200">
                        <span className="font-bold text-black text-xs">{log.supplier || "—"}</span>
                      </td>
                      <td className="py-3 px-2 text-center bg-gray-200 border-r border-gray-200">
                        <span className="font-bold text-black text-xs">{log.itemName || "—"}</span>
                      </td>
                      <td className="py-3 px-2 text-center bg-yellow-100 border-r border-gray-200">
                        <span className="font-bold text-black text-xs">{(log.billedAmount || 0).toLocaleString()}</span>
                      </td>
                      <td className="py-3 px-2 text-center bg-yellow-100 border-r border-gray-200">
                        <span className="font-bold text-black text-xs">Tsh {(log.billedTotalCost || 0).toLocaleString()}</span>
                      </td>
                      <td className="py-3 px-2 text-center bg-green-200 border-r border-gray-200">
                        <span className={`inline-block px-3 py-1 font-bold rounded-full text-xs ${
                          log.status === "Paid" ? "bg-green-300 text-green-900" : "bg-red-100 text-red-700"
                        }`}>
                          {log.status || "—"}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-center bg-gray-100 border-r border-gray-200">
                        <span className="font-bold text-black text-xs">{log.createdBy || "—"}</span>
                      </td>
                      <td className="py-3 px-2 text-center bg-green-200">
                        <span className="font-bold text-black text-xs">
                          {log.completedAt ? dayjs(log.completedAt).format("DD/MM/YYYY HH:mm") : "—"}
                        </span>
                      </td>
                    </tr>
                    <tr className="h-3"><td colSpan={9} className="p-0"></td></tr>
                  </React.Fragment>
                ))
              )}
            </tbody>
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
              else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
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
            onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 bg-gray-100 hover:bg-gray-200 text-black rounded-lg disabled:opacity-40"
          >
            <IoIosArrowForward className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default BillNonPo;