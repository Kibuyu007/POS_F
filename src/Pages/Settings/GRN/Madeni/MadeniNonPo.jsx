import axios from "axios";
import { useEffect, useState } from "react";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import Loading from "../../../../Components/Shared/Loading";
import BASE_URL from "../../../../Utils/config";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";

const MadeniNonPo = () => {
  const user = useSelector((state) => state.user.user);
  const [nonPoData, setNonPoData] = useState([]);
  const [load, setLoad] = useState(false);
  const [deductions, setDeductions] = useState({});
  const [supplierFilter, setSupplierFilter] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 10;

  useEffect(() => {
    fetchNonPoTransactions();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [supplierFilter, startDate, endDate]);

  // GET NON PO UNPAID ITEMS
  const fetchNonPoTransactions = async () => {
    setLoad(true);
    try {
      const res = await axios.get(`${BASE_URL}/api/grn/unpaidNonPo`);
      if (res.data.success) {
        const itemsWithBalance = res.data.data.map((item) => ({
          ...item,
          reportId: item._id || item.reportId,
          paidAmount: item.paidAmount || 0,
          remainingBalance:
            item.remainingBalance ||
            (item.billedTotalCost || 0) - (item.paidAmount || 0),
          isFullyPaid:
            item.isFullyPaid || item.paidAmount >= item.billedTotalCost,
        }));
        setNonPoData(itemsWithBalance);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load unpaid GRN items.");
    } finally {
      setLoad(false);
    }
  };

  // FILTER LOGIC
  const filteredData = nonPoData.filter((txn) => {
    if (!txn.createdAt) return false;
    const date = dayjs(txn.createdAt);
    const matchStart = startDate
      ? date.isSameOrAfter(dayjs(startDate), "day")
      : true;
    const matchEnd = endDate
      ? date.isSameOrBefore(dayjs(endDate), "day")
      : true;
    const matchSupplier = supplierFilter
      ? (txn.supplier || "")
          .toLowerCase()
          .includes(supplierFilter.toLowerCase())
      : true;
    return matchStart && matchEnd && matchSupplier;
  });

  // Calculate statistics
  const totalDebt = filteredData.reduce(
    (sum, d) => sum + (d.billedTotalCost || 0),
    0
  );
  const totalRemaining = filteredData.reduce(
    (sum, d) => sum + (d.remainingBalance || 0),
    0
  );
  const totalPaid = totalDebt - totalRemaining;
  const paidItems = filteredData.filter(
    (d) => d.remainingBalance <= 0 || d.isFullyPaid
  ).length;
  const pendingItems = filteredData.filter(
    (d) => d.remainingBalance > 0 && !d.isFullyPaid
  ).length;

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const totalItems = filteredData.length;

  const currentList = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Helper function for inline payment
  const handlePay = async (item) => {
    const itemKey = `${item.grnId}_${item.itemId}`;
    const amount = parseFloat(deductions[itemKey] || 0);

    if (!amount || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (amount > item.remainingBalance) {
      toast.error("Amount exceeds remaining balance");
      return;
    }

    setLoad(true);
    try {
      const res = await axios.post(
        `${BASE_URL}/api/grn/payNonPoBills`,
        {
          grnId: item.grnId,
          itemId: item.itemId,
          paymentAmount: amount,
        },
        { withCredentials: true }
      );

      if (res.data.success) {
        toast.success(res.data.message || "Payment recorded successfully!");
        // Clear the input for this item
        setDeductions((prev) => ({ ...prev, [itemKey]: "" }));
        // Refresh the list to reflect updated paidAmount & remainingBalance
        fetchNonPoTransactions();
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to process payment.");
    } finally {
      setLoad(false);
    }
  };

  const formatNumber = (value) => {
    if (!value) return "";
    return value.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const unformatNumber = (value) => {
    return value.replace(/,/g, "");
  };

  // Check if user has add permission
  const canPayBilledGrn = user?.roles?.canPayBilledGrn === true;

  return (
    <div className="p-5 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-black mb-2">
            GRN Payment Management
          </h1>
          <p className="text-gray-600">
            Track and manage all Non-PO GRN payments
          </p>
        </div>
        <button
          onClick={fetchNonPoTransactions}
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
              <p className="text-xs text-gray-500 font-medium">Total Billed</p>
              <p className="text-lg font-bold text-black">
                Tsh {totalDebt.toLocaleString()}
              </p>
            </div>

            <div className="h-10 w-px bg-gray-300"></div>

            <div className="text-center px-4">
              <p className="text-xs text-gray-500 font-medium">Pending</p>
              <p className="text-lg font-bold text-red-600">
                Tsh {totalRemaining.toLocaleString()}
              </p>
            </div>

            <div className="h-10 w-px bg-gray-300"></div>

            <div className="text-center px-4">
              <p className="text-xs text-gray-500 font-medium">Paid</p>
              <p className="text-lg font-bold text-green-600">
                Tsh {totalPaid.toLocaleString()}
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

          {/* Clear Button */}
          <div className="flex gap-3 lg:items-end">
            <button
              onClick={() => {
                setSupplierFilter("");
                setStartDate(null);
                setEndDate(null);
              }}
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
                "Quantity",
                "Total Cost",
                "Paid",
                "Remaining Balance",
                "Deduct",
                "Action",
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
            {currentList.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-12">
                  <div className="space-y-3">
                    <div className="text-4xl">📋</div>
                    <p className="text-xl font-bold text-black">
                      No unpaid GRN items found
                    </p>
                    <p className="text-gray-600">
                      Try adjusting your search filters
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              currentList.map((item, idx) => {
                const itemKey = `${item.grnId}_${item.itemId}`;
                const isFullyPaid =
                  item.remainingBalance <= 0 || item.isFullyPaid;

                return (
                  <>
                    <tr
                      key={itemKey}
                      className="hover:bg-gray-50 transition-colors shadow-md"
                    >
                      {/* SN Column - Green 300 */}
                      <td className="py-4 px-3 text-center  border-r border-gray-300 bg-gray-200">
                        <span className="inline-flex items-center justify-center w-10 h-10  bg-green-300 text-black font-bold rounded-full shadow">
                          {(currentPage - 1) * itemsPerPage + idx + 1}
                        </span>
                      </td>

                      {/* Date Column - Gray 200 */}
                      <td className="py-4 px-3 text-center bg-gray-100 border-r border-gray-200">
                        <span className="font-bold text-black">
                          {item.createdAt
                            ? dayjs(item.createdAt).format("DD/MM/YYYY")
                            : "—"}
                        </span>
                      </td>

                      {/* Supplier Column - Green 200 */}
                      <td className="py-4 px-3 text-center bg-green-200 border-r border-gray-200">
                        <span className="font-bold text-black">
                          {item.supplier || "—"}
                        </span>
                      </td>

                      {/* Item Column - Gray 200 */}
                      <td className="py-4 px-3 text-center bg-gray-200 border-r border-gray-200">
                        <span className="font-bold text-black">
                          {item.name || "—"}
                        </span>
                      </td>

                      {/* Quantity Column - Gray 100 */}
                      <td className="py-4 px-3 text-center bg-gray-100 border-r border-gray-200">
                        <span className="font-bold text-black">
                          {item.billedAmount.toLocaleString() || 0}
                        </span>
                      </td>

                      {/* Total Cost Column - Yellow 100 */}
                      <td className="py-4 px-3 text-center bg-yellow-100 border-r border-gray-200">
                        <span className="font-bold text-black">
                          {(item.billedTotalCost || 0).toLocaleString()}
                        </span>
                      </td>

                      {/* Paid Column - Gray 100 */}
                      <td className="py-4 px-3 text-center bg-gray-100 border-r border-gray-200">
                        <span className="font-bold text-green-700">
                          {(item.paidAmount || 0).toLocaleString()}
                        </span>
                      </td>

                      {/* Balance Column - Green 200 */}
                      <td className="py-4 px-3 text-center bg-green-200 border-r border-gray-200">
                        <span
                          className={`inline-block px-4 py-2 font-bold rounded-full ${
                            item.remainingBalance > 0
                              ? "bg-red-100 text-red-700"
                              : "bg-green-300 text-green-900"
                          }`}
                        >
                          {(item.remainingBalance || 0).toLocaleString()}
                        </span>
                      </td>

                      {/* Deduct Column - Gray 100 */}
                      <td className="py-4 px-3 text-center bg-gray-100 border-r border-gray-200">
                        <div className="flex justify-center">
                          <div className="relative">
                            <span className="absolute left-3 top-2.5 text-gray-600 font-medium">
                              Tsh
                            </span>
                            <input
                              type="text"
                              value={formatNumber(
                                deductions[itemKey]?.toString() || ""
                              )}
                              onChange={(e) => {
                                const rawValue = unformatNumber(e.target.value);

                                if (!/^\d*\.?\d*$/.test(rawValue)) return;

                                setDeductions({
                                  ...deductions,
                                  [itemKey]: rawValue,
                                });
                              }}
                              className="w-48 pl-12 pr-4 py-2.5 border border-gray-300 rounded-full bg-white text-black font-medium focus:border-green-300 focus:outline-none"
                              placeholder="0.00"
                              disabled={isFullyPaid}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Action Column - Gray 100 */}
                      <td className="py-4 px-3 text-center bg-gray-100">
                        {!isFullyPaid && canPayBilledGrn ? (
                          <div className="flex flex-col gap-2">
                            <button
                              onClick={() => handlePay(item)}
                              disabled={
                                !deductions[itemKey] ||
                                parseFloat(deductions[itemKey]) <= 0
                              }
                              className={`px-4 py-2.5 font-bold rounded-full transition-all ${
                                deductions[itemKey] &&
                                parseFloat(deductions[itemKey]) > 0
                                  ? "bg-yellow-100 hover:bg-yellow-200 text-black shadow hover:shadow-md"
                                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
                              }`}
                            >
                              Pay Now
                            </button>
                          </div>
                        ) : isFullyPaid ? (
                          <span className="inline-flex items-center px-6 py-2.5 bg-green-300 text-black font-bold rounded-full shadow">
                            Fully Paid
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-6 py-2.5 bg-red-300 text-black font-bold rounded-full shadow">
                            Not Allowed
                          </span>
                        )}
                      </td>
                    </tr>
                    {/* Spacing row between rows */}
                    <tr className="h-3">
                      <td colSpan={9} className="p-0"></td>
                    </tr>
                  </>
                );
              })
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

export default MadeniNonPo;
