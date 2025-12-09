import axios from "axios";
import { useState, useEffect } from "react";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
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

  // Calculate statistics
  const totalBilledCost = filteredData.reduce(
    (sum, item) => sum + (item.billedTotalCost || 0),
    0
  );
  const totalBilledAmount = filteredData.reduce(
    (sum, item) => sum + (item.billedAmount || 0),
    0
  );
  const billedItems = filteredData.length;
  const paidItems = filteredData.filter((item) => item.status === "Paid").length;
  const pendingItems = filteredData.filter((item) => item.status === "Pending").length;

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const totalItems = filteredData.length;

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
  };

  return (
    <div className="p-5 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-black mb-2">
            Non-PO Billed Report
          </h1>
          <p className="text-gray-600">
            View and analyze all Non-PO GRN billing records
          </p>
        </div>
        <button
          onClick={fetchReport}
          className="mt-4 md:mt-0 px-6 py-3 bg-green-300 hover:bg-green-400 text-black font-bold rounded-full shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2"
        >
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Stats Section - Horizontal Bar */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row items-center justify-between bg-white border border-gray-200 rounded-full p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4 sm:mb-0">
            <div className="text-center px-4">
              <p className="text-xs text-gray-500 font-medium">Total Billed Cost</p>
              <p className="text-lg font-bold text-black">
                Tsh {totalBilledCost.toLocaleString()}
              </p>
            </div>

            <div className="h-10 w-px bg-gray-300"></div>

            <div className="text-center px-4">
              <p className="text-xs text-gray-500 font-medium">Total Items</p>
              <p className="text-lg font-bold text-black">
                {billedItems.toLocaleString()}
              </p>
            </div>

            <div className="h-10 w-px bg-gray-300"></div>

            <div className="text-center px-4">
              <p className="text-xs text-gray-500 font-medium">Total Quantity</p>
              <p className="text-lg font-bold text-green-600">
                {totalBilledAmount.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-700">
                Pending:{" "}
              </span>
              <span className="font-bold text-black">{pendingItems}</span>
            </div>

            <div className="h-4 w-px bg-gray-300"></div>

            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-700">Paid: </span>
              <span className="font-bold text-black">{paidItems}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="mb-8 rounded-2xl p-5 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-end gap-5">
          {/* Search Input */}
          <div className="flex-1">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Search Supplier
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center">
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Supplier name..."
                value={supplierFilter}
                onChange={(e) => setSupplierFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-full bg-white text-black focus:border-green-300 focus:outline-none focus:ring-1 focus:ring-green-200"
              />
            </div>
          </div>

          {/* Date Range */}
          <div className="flex-1">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Date Range
            </label>
            <div className="flex gap-3">
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="From"
                  value={startDate}
                  onChange={setStartDate}
                  slotProps={{
                    textField: {
                      size: "small",
                      sx: {
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "9999px",
                        },
                      },
                      className: "w-full bg-white",
                    },
                  }}
                />
              </LocalizationProvider>

              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="To"
                  value={endDate}
                  onChange={setEndDate}
                  slotProps={{
                    textField: {
                      size: "small",
                      sx: {
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "9999px",
                        },
                      },
                      className: "w-full bg-white",
                    },
                  }}
                />
              </LocalizationProvider>
            </div>
          </div>

          {/* Dropdown Filters */}
          <div className="flex-1">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Filter by Supplier
            </label>
            <select
              value={selectedSupplier}
              onChange={(e) => setSelectedSupplier(e.target.value)}
              className="w-full pl-4 pr-4 py-3 border border-gray-300 rounded-full bg-white text-black focus:border-green-300 focus:outline-none focus:ring-1 focus:ring-green-200"
            >
              <option value="">All Suppliers</option>
              {suppliers.map((sup, idx) => (
                <option key={idx} value={sup}>
                  {sup}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Filter by User
            </label>
            <select
              value={createdBy}
              onChange={(e) => setCreatedBy(e.target.value)}
              className="w-full pl-4 pr-4 py-3 border border-gray-300 rounded-full bg-white text-black focus:border-green-300 focus:outline-none focus:ring-1 focus:ring-green-200"
            >
              <option value="">All Users</option>
              {alieChange.map((u, idx) => (
                <option key={idx} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>

          {/* Clear Button */}
          <div className="flex gap-3 lg:items-end">
            <button
              onClick={clearFilters}
              className="px-5 py-3 bg-gray-200 hover:bg-gray-300 text-black font-bold rounded-full transition-colors whitespace-nowrap"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Loading */}
      <Loading load={load} />

      {/* Table with Colored Columns */}
      <div className="overflow-x-auto rounded-xl">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-200">
              {[
                "SN",
                "Date",
                "Supplier",
                "Item",
                "Item Quantity",
                "Total Cost",
                "Status",
                "Changed By",
                "Changed At",
              ].map((h) => (
                <th
                  key={h}
                  className="px-6 py-4 text-center text-sm font-bold text-black uppercase tracking-wider border-b-2 border-gray-400"
                >
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
                    <p className="text-xl font-bold text-black">
                      No billing records found
                    </p>
                    <p className="text-gray-600">
                      Try adjusting your search filters
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              currentData.map((log, idx) => (
                <>
                  <tr
                    key={log._id || idx}
                    className="hover:bg-gray-50 transition-colors shadow-md"
                  >
                    {/* SN Column - Green 300 */}
                    <td className="py-4 px-3 text-center border-r border-gray-300 bg-gray-200">
                      <span className="inline-flex items-center justify-center w-10 h-10 bg-green-300 text-black font-bold rounded-full shadow">
                        {(currentPage - 1) * itemsPerPage + idx + 1}
                      </span>
                    </td>

                    {/* Date Column - Gray 200 */}
                    <td className="py-4 px-3 text-center bg-gray-100 border-r border-gray-200">
                      <span className="font-bold text-black">
                        {log.createdAt
                          ? dayjs(log.createdAt).format("DD/MM/YYYY HH:mm")
                          : "—"}
                      </span>
                    </td>

                    {/* Supplier Column - Green 200 */}
                    <td className="py-4 px-3 text-center bg-green-200 border-r border-gray-200">
                      <span className="font-bold text-black">
                        {log.supplier || "—"}
                      </span>
                    </td>

                    {/* Item Column - Gray 200 */}
                    <td className="py-4 px-3 text-center bg-gray-200 border-r border-gray-200">
                      <span className="font-bold text-black">
                        {log.itemName || "—"}
                      </span>
                    </td>

                    {/* Item Quantity Column - Yellow 100 */}
                    <td className="py-4 px-3 text-center bg-yellow-100 border-r border-gray-200">
                      <span className="font-bold text-black">
                        {(log.billedAmount || 0).toLocaleString()}
                      </span>
                    </td>

                    {/* Total Cost Column - Yellow 100 */}
                    <td className="py-4 px-3 text-center bg-yellow-100 border-r border-gray-200">
                      <span className="font-bold text-black">
                        Tsh {(log.billedTotalCost || 0).toLocaleString()}
                      </span>
                    </td>

                    {/* Status Column - Green 200 */}
                    <td className="py-4 px-3 text-center bg-green-200 border-r border-gray-200">
                      <span
                        className={`inline-block px-4 py-2 font-bold rounded-full ${
                          log.status === "Paid"
                            ? "bg-green-300 text-green-900"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {log.status || "—"}
                      </span>
                    </td>

                    {/* Changed By Column - Gray 100 */}
                    <td className="py-4 px-3 text-center bg-gray-100 border-r border-gray-200">
                      <span className="font-bold text-black">
                        {log.createdBy || "—"}
                      </span>
                    </td>

                    {/* Changed At Column - Green 200 */}
                    <td className="py-4 px-3 text-center bg-green-200">
                      <span className="font-bold text-black">
                        {log.completedAt
                          ? dayjs(log.completedAt).format("DD/MM/YYYY HH:mm")
                          : "—"}
                      </span>
                    </td>
                  </tr>
                  {/* Spacing row between rows */}
                  <tr className="h-3">
                    <td colSpan={9} className="p-0"></td>
                  </tr>
                </>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t border-gray-300">
        <div className="text-sm text-gray-700">
          <span className="font-bold text-black">
            Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
            {Math.min(currentPage * itemsPerPage, totalItems)}
          </span>{" "}
          of <span className="font-bold text-black">{totalItems}</span> items
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2.5 bg-gray-200 hover:bg-gray-300 text-black font-bold rounded-full disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <IoIosArrowBack className="w-5 h-5" />
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
                    className={`w-10 h-10 font-bold rounded-full transition-all ${
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
                  <span key={i} className="px-3 text-gray-500 font-bold">
                    ...
                  </span>
                );
              }
              return null;
            })}
          </div>

          <button
            onClick={() =>
              currentPage < totalPages && setCurrentPage(currentPage + 1)
            }
            disabled={currentPage === totalPages}
            className="p-2.5 bg-gray-200 hover:bg-gray-300 text-black font-bold rounded-full disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <IoIosArrowForward className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default BillNonPo;