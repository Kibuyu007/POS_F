import axios from "axios";
import { useState, useEffect } from "react";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import {
  FiSearch,
  FiRefreshCw,
  FiPackage,
  FiChevronDown,
  FiChevronUp,
  FiBox,
} from "react-icons/fi";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import Loading from "../../../../Components/Shared/Loading";
import BASE_URL from "../../../../Utils/config";
import toast from "react-hot-toast";

const CompletedNonPO = () => {
  const [grns, setGrns] = useState([]);
  const [filteredGrns, setFilteredGrns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterSupplier, setFilterSupplier] = useState("");
  const [filterItem, setFilterItem] = useState("");
  const [filterFrom, setFilterFrom] = useState(null);
  const [filterTo, setFilterTo] = useState(null);
  const [filterStatus, setFilterStatus] = useState("");
  const [load, setLoad] = useState(false);
  const [expandedGrn, setExpandedGrn] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchCompletedNonPoGrns = async () => {
      setLoad(true);
      try {
        const res = await axios.get(`${BASE_URL}/api/grn/nonPo`);
        if (res.data.success) {
          setGrns(res.data.data);
        } else {
          toast.error(res.data.message || "Failed to fetch data");
        }
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to load GRN data");
        console.error("Error fetching completed GRNs:", err);
      } finally {
        setLoading(false);
        setLoad(false);
      }
    };
    fetchCompletedNonPoGrns();
  }, []);

  useEffect(() => {
    const filtered = grns.filter((grn) => {
      // Supplier filter
      const supplierMatch = filterSupplier
        ? grn.supplierName?.supplierName
            ?.toLowerCase()
            .includes(filterSupplier.toLowerCase())
        : true;

      // Item filter - check if any item name matches
      const itemMatch = filterItem
        ? grn.items?.some((item) =>
            item.name?.name
              ?.toLowerCase()
              .includes(filterItem.toLowerCase())
          )
        : true;

      // Date filter
      const date = dayjs(grn.createdAt);
      const fromMatch = filterFrom
        ? date.isAfter(dayjs(filterFrom).subtract(1, "day"))
        : true;
      const toMatch = filterTo
        ? date.isBefore(dayjs(filterTo).add(1, "day"))
        : true;

      // Status filter
      let statusMatch = true;
      if (filterStatus) {
        statusMatch = grn.items?.some(
          (item) => item.status.toLowerCase() === filterStatus.toLowerCase()
        );
      }

      return supplierMatch && itemMatch && fromMatch && toMatch && statusMatch;
    });

    setFilteredGrns(filtered);
    setCurrentPage(1);
  }, [grns, filterSupplier, filterItem, filterFrom, filterTo, filterStatus]);

  const totalItems = filteredGrns.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedGrns = filteredGrns.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const prevPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);
  const nextPage = () =>
    currentPage < totalPages && setCurrentPage(currentPage + 1);

  const toggleExpand = (grnId) => {
    setExpandedGrn(expandedGrn === grnId ? null : grnId);
  };

  const clearFilters = () => {
    setFilterSupplier("");
    setFilterItem("");
    setFilterFrom(null);
    setFilterTo(null);
    setFilterStatus("");
  };

  const refreshData = async () => {
    setLoad(true);
    try {
      const res = await axios.get(`${BASE_URL}/api/grn/nonPo`);
      if (res.data.success) {
        setGrns(res.data.data);
        toast.success("Data refreshed successfully!");
      }
    } catch (err) {
      toast.error("Failed to refresh data");
    } finally {
      setLoad(false);
    }
  };

  return (
    <div className="p-5 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-black mb-1">
            COMPLETED NON-PO GRNs
          </h1>
          <p className="text-gray-600 text-sm">
            View all completed Non-Purchase Order GRN records
          </p>
        </div>
        <button
          onClick={refreshData}
          className="mt-3 md:mt-0 px-4 py-2 bg-green-300 hover:bg-green-400 text-black font-bold rounded-full shadow hover:shadow-md transition-all duration-200 flex items-center gap-2 text-sm"
        >
          <FiRefreshCw className={`w-4 h-4 ${load ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Compact Stats */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row items-center justify-between bg-white border border-gray-200 rounded-full p-4 shadow-sm">
          <div className="flex items-center gap-3 mb-3 sm:mb-0">
            <div className="text-center px-3">
              <p className="text-xs text-gray-500 font-medium">Total GRNs</p>
              <p className="text-base font-bold text-black">{totalItems}</p>
            </div>

            <div className="h-6 w-px bg-gray-300"></div>

            <div className="text-center px-3">
              <p className="text-xs text-gray-500 font-medium">Total Items</p>
              <p className="text-base font-bold text-black">
                {filteredGrns.reduce(
                  (sum, grn) => sum + (grn.items?.length || 0),
                  0
                )}
              </p>
            </div>

            <div className="h-6 w-px bg-gray-300"></div>

            <div className="text-center px-3">
              <p className="text-xs text-gray-500 font-medium">Billed Items</p>
              <p className="text-base font-bold text-black">
                {filteredGrns.reduce(
                  (sum, grn) =>
                    sum +
                    grn.items.reduce(
                      (itemSum, item) => itemSum + (item.billedAmount || 0),
                      0
                    ),
                  0
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span className="text-xs font-medium text-gray-700">
                Billed:{" "}
              </span>
              <span className="font-bold text-black text-sm">
                {filteredGrns.reduce(
                  (sum, grn) =>
                    sum +
                    grn.items.filter((item) => item.status === "Billed").length,
                  0
                )}
              </span>
            </div>

            <div className="h-4 w-px bg-gray-300"></div>

            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-xs font-medium text-gray-700">
                Completed:{" "}
              </span>
              <span className="font-bold text-black text-sm">
                {filteredGrns.reduce(
                  (sum, grn) =>
                    sum +
                    grn.items.filter((item) => item.status === "Completed")
                      .length,
                  0
                )}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Compact Filters */}
      <div className="mb-6 rounded-xl p-4 shadow bg-white">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search Supplier */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Search Supplier
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center">
                <FiSearch className="w-4 h-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Supplier name..."
                value={filterSupplier}
                onChange={(e) => setFilterSupplier(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-full bg-white text-black focus:border-green-300 focus:outline-none focus:ring-1 focus:ring-green-200"
              />
            </div>
          </div>

          {/* Search Item */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Search Item
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center">
                <FiBox className="w-4 h-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Item name..."
                value={filterItem}
                onChange={(e) => setFilterItem(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-full bg-white text-black focus:border-green-300 focus:outline-none focus:ring-1 focus:ring-green-200"
              />
            </div>
          </div>

          {/* Date Range */}
          <div className="lg:col-span-2">
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Date Range
            </label>
            <div className="flex gap-2">
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="From"
                  value={filterFrom}
                  onChange={setFilterFrom}
                  slotProps={{
                    textField: {
                      size: "small",
                      sx: {
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "9999px",
                          fontSize: "14px",
                        },
                      },
                      className: "w-full bg-white text-sm",
                    },
                  }}
                />
              </LocalizationProvider>

              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="To"
                  value={filterTo}
                  onChange={setFilterTo}
                  slotProps={{
                    textField: {
                      size: "small",
                      sx: {
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "9999px",
                          fontSize: "14px",
                        },
                      },
                      className: "w-full bg-white text-sm",
                    },
                  }}
                />
              </LocalizationProvider>
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Status
            </label>
            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-full bg-white text-black focus:border-green-300 focus:outline-none focus:ring-1 focus:ring-green-200"
              >
                <option value="">All Status</option>
                <option value="Billed">Billed</option>
                <option value="Completed">Completed</option>
              </select>
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-black font-bold rounded-full transition-colors whitespace-nowrap text-sm"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      </div>

      <Loading load={load} />

      {/* Compact GRN Cards */}
      {!loading && (
        <div className="space-y-3">
          {paginatedGrns.map((grn) => (
            <div
              key={grn._id}
              className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Compact Header */}
              <div
                className="group relative p-2 cursor-pointer transition-all duration-300 overflow-hidden"
                onClick={() => toggleExpand(grn._id)}
              >
                {/* Compact Gradient Background */}
                <div className="absolute inset-0 bg-gradient-to-r from-green-200  to-green-300 group-hover:from-gray-100 group-hover:via-yellow-100 group-hover:to-green-200 transition-all duration-300">
                  {/* Subtle Shimmer */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-50 group-hover:translate-x-full transition-all duration-700"></div>
                </div>

                {/* Glass Border */}
                <div className="absolute inset-0 border border-white/40 rounded-lg"></div>

                {/* Content */}
                <div className="relative z-10">
                  <div className="flex items-center justify-between">
                    {/* Left Section - More Compact */}
                    <div className="flex items-center gap-2">
                      {/* Compact Icon */}
                      <div className="relative">
                        {/* Outer Glow */}
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-gray-400 via-yellow-300 to-green-400 rounded-full opacity-60 blur-sm"></div>
                        {/* Icon Container */}
                        <div className="relative w-8 h-8 flex items-center justify-center bg-gradient-to-br from-white to-gray-50 rounded-full border border-white/80">
                          <FiPackage className="w-4 h-4 bg-gradient-to-r from-gray-700 via-yellow-600 to-green-700 bg-clip-text text-transparent" />
                        </div>
                      </div>

                      {/* Compact Text Content */}
                      <div className="min-w-0">
                        {/* Supplier Name - Single Line */}
                        <h4 className="font-bold text-gray-900 text-sm truncate max-w-[180px]">
                          {grn.supplierName?.supplierName || "Unknown Supplier"}
                          <span className="block w-0 group-hover:w-full h-0.5 bg-gradient-to-r from-yellow-400 to-green-500 rounded-full transition-all duration-300 mt-0.5"></span>
                        </h4>

                        {/* Compact Badges - Inline */}
                        <div className="flex items-center gap-1.5 mt-1">
                          {/* Invoice Badge */}
                          <span className="text-xs px-2 py-0.5 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 rounded-full border border-gray-300/50 truncate max-w-[80px]">
                            📋 {grn.invoiceNumber || "N/A"}
                          </span>

                          {/* LPO Badge */}
                          <span className="text-xs px-2 py-0.5 bg-gradient-to-r from-yellow-50 to-yellow-100 text-yellow-900 rounded-full border border-yellow-300/50 truncate max-w-[80px]">
                            📄 {grn.lpoNumber || "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right Section - Compact */}
                    <div className="flex items-center gap-2">
                      {/* Compact Date Badge */}
                      <span className="text-xs px-2 py-0.5 bg-gradient-to-r from-green-50 to-green-100 text-green-900 rounded-full border border-green-300/50 whitespace-nowrap">
                        {dayjs(grn.receivingDate).format("DD/MM/YY")}
                      </span>

                      {/* Compact Items Counter */}
                      <div className="relative">
                        <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-br from-white to-gray-50 rounded-lg border border-gray-300/40 shadow-sm">
                          <span className="text-xs font-medium text-gray-600">
                            Items:
                          </span>
                          <span className="text-sm font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
                            {grn.items?.length || 0}
                          </span>
                        </div>
                        {/* Tiny Glow Dot */}
                        <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-gradient-to-r from-yellow-400 to-green-400 rounded-full animate-pulse"></div>
                      </div>

                      {/* Compact Expand Button */}
                      <button className="relative w-7 h-7 flex items-center justify-center bg-gradient-to-br from-white to-gray-50 rounded-full border border-gray-300 shadow-sm hover:shadow transition-all duration-200">
                        {expandedGrn === grn._id ? (
                          <FiChevronUp className="w-3 h-3 text-gray-700" />
                        ) : (
                          <FiChevronDown className="w-3 h-3 text-gray-700" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Compact Status Indicator - Only show if needed */}
                  {expandedGrn !== grn._id && grn.items?.length > 0 && (
                    <div className="mt-1.5 pt-1.5 border-t border-gray-200/20">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5">
                          <div className="flex items-center gap-1">
                            <div className="w-1.5 h-1.5 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full"></div>
                            <span className="text-gray-600">
                              Billed:{" "}
                              {
                                grn.items.filter(
                                  (item) => item.status === "Billed"
                                ).length
                              }
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-1.5 h-1.5 bg-gradient-to-r from-green-400 to-green-500 rounded-full"></div>
                            <span className="text-gray-600">
                              Complete:{" "}
                              {
                                grn.items.filter(
                                  (item) => item.status === "Completed"
                                ).length
                              }
                            </span>
                          </div>
                        </div>
                        <div className="w-16 h-1.5 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-yellow-400 to-green-500 rounded-full"
                            style={{
                              width: `${
                                (grn.items.filter(
                                  (item) => item.status === "Completed"
                                ).length /
                                  grn.items.length) *
                                100
                              }%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Corner Accents - Smaller */}
                <div className="absolute top-0 right-0 w-4 h-4 bg-gradient-to-br from-gray-300/10 to-transparent rounded-bl-full"></div>
                <div className="absolute bottom-0 left-0 w-4 h-4 bg-gradient-to-tr from-green-300/10 to-transparent rounded-tr-full"></div>
              </div>

              {/* Expanded Details - Only shows when clicked */}
              {expandedGrn === grn._id && (
                <div className="p-3 border-t border-gray-200">
                  {/* Additional Info */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                    <div className="bg-gray-100 rounded p-2">
                      <p className="text-xs text-gray-500 font-medium">
                        Delivery Person
                      </p>
                      <p className="text-sm font-bold text-black">
                        {grn.deliveryPerson || "-"}
                      </p>
                    </div>
                    <div className="bg-gray-200 rounded p-2">
                      <p className="text-xs text-gray-500 font-medium">
                        Delivery Number
                      </p>
                      <p className="text-sm font-bold text-black">
                        {grn.deliveryNumber || "-"}
                      </p>
                    </div>
                    <div className="bg-gray-100 rounded p-2">
                      <p className="text-xs text-gray-500 font-medium">
                        Description
                      </p>
                      <p className="text-sm font-bold text-black truncate">
                        {grn.description || "-"}
                      </p>
                    </div>
                    <div className="bg-gray-200 rounded p-2">
                      <p className="text-xs text-gray-500 font-medium">
                        Created
                      </p>
                      <p className="text-sm font-bold text-black">
                        {dayjs(grn.createdAt).format("DD/MM/YY HH:mm")}
                      </p>
                    </div>
                  </div>

                  {/* Compact Items Table */}
                  <div className="overflow-x-auto rounded-lg border border-gray-200">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="bg-gray-200">
                          {[
                            "Item",
                            "Billed",
                            "Paid",
                            "Total",
                            "Buy Price",
                            "Total Cost",
                            "Sell Price",
                            "Estimated Sales",
                            "Estimated Profit",
                            "Status",
                          ].map((header, idx) => (
                            <th
                              key={idx}
                              className="px-3 py-2 text-center text-xs font-bold text-black uppercase border-r border-gray-300"
                            >
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {grn.items.map((item) => {
                          const billed = item.billedAmount || 0;
                          const paid = item.quantity || 0;
                          const totalQty = billed + paid;
                          const totalCost = totalQty * (item.buyingPrice || 0);
                          const estimatedSales =
                            totalQty * (item.sellingPrice || 0);
                          const estimatedProfit = estimatedSales - totalCost;

                          return (
                            <tr
                              key={item._id}
                              className="border-t border-gray-100"
                            >
                              <td className="px-3 py-2 text-center bg-gray-100 border-r border-gray-200">
                                <span className="font-bold text-black text-xs">
                                  {item.name?.name || "-"}
                                </span>
                              </td>
                              <td className="px-3 py-2 text-center bg-yellow-100 border-r border-gray-200">
                                <span className="font-bold text-black text-xs">
                                  {billed}
                                </span>
                              </td>
                              <td className="px-3 py-2 text-center bg-green-200 border-r border-gray-200">
                                <span className="font-bold text-black text-xs">
                                  {paid}
                                </span>
                              </td>
                              <td className="px-3 py-2 text-center bg-blue-100 border-r border-gray-200">
                                <span className="font-bold text-black text-xs">
                                  {totalQty}
                                </span>
                              </td>
                              <td className="px-3 py-2 text-center bg-yellow-100 border-r border-gray-200">
                                <span className="font-bold text-black text-xs">
                                  {(item.buyingPrice || 0).toLocaleString()}
                                </span>
                              </td>
                              <td className="px-3 py-2 text-center bg-red-100 border-r border-gray-200">
                                <span className="font-bold text-black text-xs">
                                  {totalCost.toLocaleString()}
                                </span>
                              </td>
                              <td className="px-3 py-2 text-center bg-green-100 border-r border-gray-200">
                                <span className="font-bold text-black text-xs">
                                  {(item.sellingPrice || 0).toLocaleString()}
                                </span>
                              </td>
                              <td className="px-3 py-2 text-center bg-green-100 border-r border-gray-200">
                                <span className="font-bold text-black text-xs">
                                  {(estimatedSales || 0).toLocaleString()}
                                </span>
                              </td>
                              <td className="px-3 py-2 text-center bg-green-100 border-r border-gray-200">
                                <span className="font-bold text-black text-xs">
                                  {(estimatedProfit || 0).toLocaleString()}
                                </span>
                              </td>

                              <td className="px-3 py-2 text-center">
                                <span
                                  className={`inline-flex items-center justify-center px-2 py-1 rounded-full text-xs font-bold ${
                                    item.status === "Billed"
                                      ? "bg-yellow-300 text-yellow-900"
                                      : "bg-green-300 text-green-900"
                                  }`}
                                >
                                  {item.status}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Compact Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-6 pt-4 border-t border-gray-300">
          <div className="text-xs text-gray-700">
            <span className="font-bold text-black">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
              {Math.min(currentPage * itemsPerPage, totalItems)}
            </span>{" "}
            of <span className="font-bold text-black">{totalItems}</span> GRNs
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={prevPage}
              disabled={currentPage === 1}
              className="p-2 bg-gray-200 hover:bg-gray-300 text-black font-bold rounded-full disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <IoIosArrowBack className="w-4 h-4" />
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
                      className={`w-8 h-8 text-xs font-bold rounded-full transition-colors ${
                        isCurrent
                          ? "bg-green-300 text-black shadow"
                          : "text-gray-700 hover:bg-gray-200"
                      }`}
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
                    <span
                      key={i}
                      className="px-2 text-gray-500 font-bold text-xs"
                    >
                      ...
                    </span>
                  );
                }
                return null;
              })}
            </div>

            <button
              onClick={nextPage}
              disabled={currentPage === totalPages}
              className="p-2 bg-gray-200 hover:bg-gray-300 text-black font-bold rounded-full disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <IoIosArrowForward className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredGrns.length === 0 && (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-200 rounded-full mb-4">
            <FiPackage className="w-8 h-8 text-gray-500" />
          </div>
          <h3 className="text-lg font-bold text-black mb-2">No GRNs Found</h3>
          <p className="text-gray-600 text-sm mb-4">
            {filterSupplier || filterItem || filterFrom || filterTo || filterStatus
              ? "No GRNs match your current filters"
              : "No GRNs found in the system"}
          </p>
          <button
            onClick={clearFilters}
            className="px-4 py-2 bg-green-300 hover:bg-green-400 text-black font-bold rounded-full transition-colors text-sm"
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default CompletedNonPO;