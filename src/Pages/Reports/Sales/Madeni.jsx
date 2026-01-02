import axios from "axios";
import { useEffect, useState } from "react";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { FaSearch, FaFilter } from "react-icons/fa";
import { FiRefreshCw, FiDownload, FiCalendar } from "react-icons/fi";
import { MdReceipt, MdPayment } from "react-icons/md";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Loading from "../../../Components/Shared/Loading";
import BASE_URL from "../../../Utils/config";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";

const Madeni = () => {
  const user = useSelector((state) => state.user.user);
  const [billedData, setBilledData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [load, setLoad] = useState(false);
  const [deductions, setDeductions] = useState({});
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [customerFilter, setCustomerFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [totals, setTotals] = useState({ billed: 0, paid: 0, remaining: 0 });

  useEffect(() => {
    fetchBilledTransactions();
  }, []);

  const fetchBilledTransactions = async () => {
    setLoad(true);
    try {
      const res = await axios.get(`${BASE_URL}/api/transactions/bill`, {
        withCredentials: true,
      });
      if (res.data.success) {
        setBilledData(res.data.data);
        setFilteredData(res.data.data);
        calculateTotals(res.data.data);
        toast.success("Billed transactions loaded successfully!");
      }
    } catch (error) {
      console.error("Error fetching billed transactions:", error);
      toast.error("Failed to load billed transactions");
    } finally {
      setLoad(false);
    }
  };

  useEffect(() => {
    filterData();
  }, [startDate, endDate, customerFilter]);

  const filterData = () => {
    let filtered = [...billedData];

    if (startDate) {
      filtered = filtered.filter((txn) =>
        dayjs(txn.createdAt).isSameOrAfter(dayjs(startDate), "day")
      );
    }

    if (endDate) {
      filtered = filtered.filter((txn) =>
        dayjs(txn.createdAt).isSameOrBefore(dayjs(endDate), "day")
      );
    }

    if (customerFilter) {
      filtered = filtered.filter(
        (txn) =>
          txn.customerDetails?.name
            ?.toLowerCase()
            .includes(customerFilter.toLowerCase()) ||
          txn.customerDetails?.phone?.includes(customerFilter)
      );
    }

    setFilteredData(filtered);
    calculateTotals(filtered);
    setCurrentPage(1);
  };

  const calculateTotals = (data) => {
    let billed = 0;
    let paid = 0;
    let remaining = 0;

    data.forEach((txn) => {
      const totalAmount = Number(txn.totalAmount) || 0;
      const paidAmount = Number(txn.paidAmount) || 0;
      const remainingAmount = totalAmount - paidAmount;

      billed += totalAmount;
      paid += paidAmount;
      remaining += remainingAmount;
    });

    setTotals({ billed, paid, remaining });
  };

  const handleDeduct = async (id) => {
    const amount = parseFloat(deductions[id] || 0);
    if (!amount || amount <= 0) {
      toast.error("Enter valid amount");
      return;
    }

    try {
      const res = await axios.patch(
        `${BASE_URL}/api/transactions/payBill/${id}`,
        { paymentAmount: amount },
        { withCredentials: true }
      );
      if (res.data.success) {
        toast.success("Payment updated successfully!");
        setDeductions((prev) => ({ ...prev, [id]: "" }));
        fetchBilledTransactions();
      }
    } catch (err) {
      console.error("Error deducting amount:", err);
      toast.error("Failed to update payment");
    }
  };

  // Export Excel
  const exportToExcel = () => {
    try {
      const wsData = filteredData.map((txn) => ({
        Date: dayjs(txn.createdAt).format("DD/MM/YYYY HH:mm"),
        Customer: txn.customerDetails?.name || "-",
        Phone: txn.customerDetails?.phone || "-",
        Items: txn.items
          .map((i) => `${i.item?.name} x ${i.quantity}`)
          .join(", "),
        TotalAmount: txn.totalAmount,
        PaidAmount: txn.paidAmount || 0,
        Remaining: txn.totalAmount - (txn.paidAmount || 0),
        Cashier: txn.createdBy
          ? `${txn.createdBy.firstName} ${txn.createdBy.lastName}`
          : "",
      }));

      const ws = XLSX.utils.json_to_sheet(wsData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "BilledTransactions");
      XLSX.writeFile(wb, `Billed_Report_${dayjs().format("YYYYMMDD")}.xlsx`);
      toast.success("Excel report downloaded!");
    } catch (error) {
      toast.error("Failed to export Excel");
    }
  };

  // Export PDF
  const exportToPDF = () => {
    try {
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text("Billed Transactions Report", 14, 15);
      doc.setFontSize(10);
      doc.text(`Generated: ${dayjs().format("DD/MM/YYYY HH:mm")}`, 14, 22);
      doc.text(`Total Records: ${filteredData.length}`, 14, 29);

      const tableData = filteredData.map((txn) => [
        dayjs(txn.createdAt).format("DD/MM/YY HH:mm"),
        txn.customerDetails?.name || "-",
        txn.customerDetails?.phone || "-",
        txn.items.map((i) => `${i.item?.name} × ${i.quantity}`).join(", "),
        `${txn.totalAmount.toLocaleString()} Tsh`,
        `${(txn.paidAmount || 0).toLocaleString()} Tsh`,
        `${(txn.totalAmount - (txn.paidAmount || 0) - (txn.discount || 0)).toLocaleString()} Tsh`,
      ]);

      autoTable(doc, {
        startY: 35,
        head: [
          ["Date", "Customer", "Phone", "Items", "Total", "Paid", "Remaining"],
        ],
        body: tableData,
        headStyles: { fillColor: [34, 197, 94], textColor: 255 },
      });

      doc.save(`Billed_Report_${dayjs().format("YYYYMMDD")}.pdf`);
      toast.success("PDF report downloaded!");
    } catch (error) {
      toast.error("Failed to export PDF");
    }
  };

  const clearFilters = () => {
    setStartDate(null);
    setEndDate(null);
    setCustomerFilter("");
    toast.success("Filters cleared!");
  };

  // Pagination
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentTransactions = filteredData.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  // Check if user has edit permission
  const canPayBillTransaction = user?.roles?.canPayBillTransaction === true;

  return (
    <div className="p-5 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-black mb-1">
            Billed Transactions
          </h1>
          <p className="text-gray-600 text-sm">
            View and manage all billed/credit transactions
          </p>
        </div>
        <button
          onClick={fetchBilledTransactions}
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
              <p className="text-xs text-gray-500 font-medium">Total Billed</p>
              <p className="text-base font-bold text-yellow-600">
                Tsh {totals.billed.toLocaleString()}
              </p>
            </div>

            <div className="h-6 w-px bg-gray-300"></div>

            <div className="text-center px-3">
              <p className="text-xs text-gray-500 font-medium">Total Paid</p>
              <p className="text-base font-bold text-green-600">
                Tsh {totals.paid.toLocaleString()}
              </p>
            </div>

            <div className="h-6 w-px bg-gray-300"></div>

            <div className="text-center px-3">
              <p className="text-xs text-gray-500 font-medium">
                Total Remaining
              </p>
              <p className="text-base font-bold text-red-600">
                Tsh {totals.remaining.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-center px-3">
              <p className="text-xs text-gray-500 font-medium">
                Total Transactions
              </p>
              <p className="font-bold text-black text-sm">
                {filteredData.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search - Organized Layout */}
      <div className="mb-6 rounded-xl p-5 shadow-lg bg-white border border-gray-100">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-green-100 rounded-lg">
            <FaFilter className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 className="text-base font-bold text-black">Filters & Search</h3>
            <p className="text-xs text-gray-600">
              Filter billed transactions by various criteria
            </p>
          </div>
        </div>

        {/* Main Filters - First Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
          {/* Date Range */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Date Range
            </label>
            <div className="grid grid-cols-2 gap-2">
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
                          borderRadius: "12px",
                          fontSize: "14px",
                        },
                      },
                      className: "bg-white",
                      InputProps: {
                        startAdornment: (
                          <FiCalendar className="w-4 h-4 text-gray-400 mr-2" />
                        ),
                      },
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
                          borderRadius: "12px",
                          fontSize: "14px",
                        },
                      },
                      className: "bg-white",
                      InputProps: {
                        startAdornment: (
                          <FiCalendar className="w-4 h-4 text-gray-400 mr-2" />
                        ),
                      },
                    },
                  }}
                />
              </LocalizationProvider>
            </div>
          </div>

          {/* Search */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Search Customer
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-4 flex items-center">
                <FaSearch className="w-4 h-4 text-gray-500" />
              </div>
              <input
                type="text"
                placeholder="Customer name or phone..."
                className="w-full pl-11 pr-4 py-3 text-sm border border-gray-300 rounded-xl bg-white text-black focus:border-green-300 focus:outline-none focus:ring-2 focus:ring-green-100 transition-all duration-300"
                value={customerFilter}
                onChange={(e) => setCustomerFilter(e.target.value)}
              />
              {customerFilter && (
                <button
                  onClick={() => setCustomerFilter("")}
                  className="absolute inset-y-0 right-4 flex items-center text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <span className="text-xl leading-none">×</span>
                </button>
              )}
            </div>
          </div>

          {/* Empty column for alignment */}
          <div></div>
        </div>

        {/* Secondary Filters & Actions - Second Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Empty column for alignment */}
          <div></div>

          {/* Action Buttons */}
          <div className="flex items-end gap-3">
            <div className="flex gap-2 flex-1">
              <button
                onClick={clearFilters}
                className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-black font-bold rounded-xl transition-all duration-300 shadow-sm hover:shadow-md flex items-center justify-center gap-2"
              >
                <span>Clear Filters</span>
              </button>
              <button
                onClick={exportToExcel}
                className="flex-1 px-4 py-3 bg-yellow-100 hover:bg-yellow-200 text-black font-bold rounded-xl transition-all duration-300 shadow-sm hover:shadow-md flex items-center justify-center gap-2"
              >
                <FiDownload className="w-4 h-4" />
                <span>Excel</span>
              </button>
              <button
                onClick={exportToPDF}
                className="flex-1 px-4 py-3 bg-green-300 hover:bg-green-400 text-black font-bold rounded-xl transition-all duration-300 shadow-sm hover:shadow-md flex items-center justify-center gap-2"
              >
                <FiDownload className="w-4 h-4" />
                <span>PDF</span>
              </button>
            </div>
          </div>
        </div>

        {/* Active Filters Indicator */}
        <div className="mt-5 pt-5 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-600">
                Active filters:
              </span>
              <div className="flex flex-wrap gap-2">
                {(startDate || endDate) && (
                  <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                    Date Range:{" "}
                    {startDate ? dayjs(startDate).format("DD/MM/YY") : ""} -{" "}
                    {endDate ? dayjs(endDate).format("DD/MM/YY") : ""}
                  </span>
                )}
                {customerFilter && (
                  <span className="inline-flex items-center px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                    Search: {customerFilter}
                  </span>
                )}
              </div>
            </div>
            <div className="text-xs text-gray-500">
              {filteredData.length} of {billedData.length} transactions
            </div>
          </div>
        </div>
      </div>

      <Loading load={load} />

      {/* Table Container */}
      <div className="rounded-xl shadow bg-white overflow-hidden">
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-200">
                {[
                  "SN",
                  "Date",
                  "Customer",
                  "Phone",
                  "Items",
                  "Remaining",
                  "Deduct",
                  "Action",
                ].map((header, idx) => (
                  <th
                    key={idx}
                    className="px-3 py-3 text-center text-xs font-bold text-black uppercase border-r border-gray-300"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>

            <tr className="h-3" />

            <tbody>
              {currentTransactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12">
                    <div className="space-y-3">
                      <div className="text-4xl">📋</div>
                      <p className="text-lg font-bold text-black">
                        No billed transactions found
                      </p>
                      <p className="text-gray-600 text-sm">
                        Try adjusting your search filters
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                currentTransactions.map((sale, idx) => (
                  <>
                    <tr
                      key={sale._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      {/* SN Column - Gray 200 */}
                      <td className="py-3 px-2 text-center bg-gray-200 border-r border-gray-300">
                        <span className="font-bold text-black text-sm">
                          {(currentPage - 1) * itemsPerPage + idx + 1}
                        </span>
                      </td>

                      {/* Date Column - Gray 100 */}
                      <td className="py-3 px-2 text-center bg-gray-100 border-r border-gray-200">
                        <span className="font-bold text-black text-sm">
                          {dayjs(sale.createdAt).format("DD/MM/YYYY HH:mm")}
                        </span>
                      </td>

                      {/* Customer Column - Green 200 */}
                      <td className="py-3 px-2 text-center bg-green-200 border-r border-gray-200">
                        <span className="font-bold text-black text-sm">
                          {sale.customerDetails?.name || "-"}
                        </span>
                      </td>

                      {/* Phone Column - Gray 100 */}
                      <td className="py-3 px-2 text-center bg-gray-100 border-r border-gray-200">
                        <span className="font-bold text-black text-sm">
                          {sale.customerDetails?.phone || "-"}
                        </span>
                      </td>

                      {/* Items Column - Original Beautiful Design */}
                      <td className="py-3 px-2 border-r border-gray-200">
                        <div className="items-center text-center">
                          <div className="">
                            <ul className="space-y-1">
                              {sale.items.map((i) => (
                                <li
                                  key={i.item._id}
                                  className="flex items-center text-sm text-gray-700 bg-gray-100 py-1 px-1 rounded-full shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)] mt-2"
                                >
                                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></span>
                                  <span className="font-medium text-gray-800">
                                    {i.item?.name}
                                  </span>
                                  <span className="ml-1 text-gray-600">
                                    × {i.quantity}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </td>

                      {/* Remaining Amount Column - Original Beautiful Design */}
                      <td className="py-3 px-2 text-center border-r border-gray-200">
                        <div className="flex flex-col space-y-2 max-w-xs bg-gradient-to-r from-red-100 via-red-50 to-red-100 rounded-xl p-4 shadow-lg">
                          <div className="flex items-center gap-2">
                            <MdReceipt className="text-yellow-500 text-md" />
                            <span className="text-yellow-700 font-semibold tracking-wide">
                              Total:
                            </span>
                            <span className="ml-auto font-bold text-yellow-800 text-md">
                              {sale.totalAmount.toLocaleString()} Tsh
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MdPayment className="text-black text-md" />
                            <span className="text-green-700 font-semibold tracking-wide">
                              Paid:
                            </span>
                            <span className="ml-auto font-bold text-green-800 text-md">
                              {(sale.paidAmount || 0).toLocaleString()} Tsh
                            </span>
                          </div>
                          <div className="flex items-center gap-2 bg-red-100 rounded-full px-4 py-2 shadow-md">
                            <span className="text-red-700 font-semibold tracking-wide">
                              Remaining:
                            </span>
                            <span className="ml-auto font-extrabold text-red-900 text-sm">
                              {(
                                sale.totalAmount - (sale.paidAmount || 0)
                              ).toLocaleString()}{" "}
                              Tsh
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Deduct Column - Gray 100 */}
                      <td className="py-3 px-2 text-center bg-gray-100 border-r border-gray-200">
                        {canPayBillTransaction ? (
                          <div className="flex justify-center">
                            <input
                              type="number"
                              value={deductions[sale._id] || ""}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value);
                                const remaining =
                                  sale.totalAmount - (sale.paidAmount || 0);
                                if (val <= remaining || !val) {
                                  setDeductions({
                                    ...deductions,
                                    [sale._id]: e.target.value,
                                  });
                                } else {
                                  toast.error(
                                    "Amount cannot exceed remaining balance"
                                  );
                                }
                              }}
                              className="w-32 px-4 py-2 rounded-full border border-gray-300 bg-white text-black text-sm focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-green-300 transition-all duration-300"
                              placeholder="Amount (Tsh)"
                            />
                          </div>
                        ) : (
                          <span className="inline-flex items-center px-6 py-2.5 bg-gray-300 text-gray-600 font-bold rounded-full">
                            Not Allowed
                          </span>
                        )}
                      </td>

                      {/* Action Column - Gray 200 */}
                      <td className="py-3 px-2 text-center bg-gray-200">
                        <button
                          onClick={() => handleDeduct(sale._id)}
                          disabled={
                            !deductions[sale._id] ||
                            parseFloat(deductions[sale._id]) <= 0
                          }
                          className="px-6 py-2 bg-green-300 hover:bg-green-400 disabled:bg-gray-300 disabled:cursor-not-allowed text-black font-bold rounded-full shadow hover:shadow-md transition-all duration-200 text-sm"
                        >
                          Pay
                        </button>
                      </td>
                    </tr>
                    <tr className="h-3">
                      <td colSpan={8} className="p-0"></td>
                    </tr>
                  </>
                ))
              )}
            </tbody>

            {/* Totals Footer - Original Beautiful Design */}
            <tfoot>
              <tr className="bg-gradient-to-r from-yellow-50 to-yellow-100 text-sm font-semibold text-yellow-800 border-t border-yellow-200">
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td
                  colSpan="3"
                  className="text-right p-3 pr-6 uppercase tracking-wider"
                >
                  Total Billed:
                </td>
                <td className="p-3 text-right text-lg font-bold text-yellow-600">
                  {totals.billed.toLocaleString()} Tsh
                </td>
              </tr>
              <tr className="bg-gradient-to-r from-green-50 to-green-100 text-sm font-semibold text-green-800 border-t border-green-200">
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td
                  colSpan="3"
                  className="text-right p-3 pr-6 uppercase tracking-wider"
                >
                  Total Paid:
                </td>
                <td className="p-3 text-right text-lg font-bold text-green-600">
                  {totals.paid.toLocaleString()} Tsh
                </td>
              </tr>
              <tr className="bg-gradient-to-r from-red-50 to-red-100 text-sm font-semibold text-red-800 border-t border-red-200">
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td
                  colSpan="3"
                  className="text-right p-3 pr-6 uppercase tracking-wider"
                >
                  Total Remaining:
                </td>
                <td className="p-3 text-right text-lg font-bold text-red-600">
                  {totals.remaining.toLocaleString()} Tsh
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Compact Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t border-gray-300 bg-gray-50">
            <div className="text-xs text-gray-700">
              <span className="font-bold text-black">
                Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                {Math.min(currentPage * itemsPerPage, filteredData.length)}
              </span>{" "}
              of{" "}
              <span className="font-bold text-black">
                {filteredData.length}
              </span>{" "}
              transactions
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() =>
                  currentPage > 1 && setCurrentPage(currentPage - 1)
                }
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
                onClick={() =>
                  currentPage < totalPages && setCurrentPage(currentPage + 1)
                }
                disabled={currentPage === totalPages}
                className="p-2 bg-gray-200 hover:bg-gray-300 text-black font-bold rounded-full disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <IoIosArrowForward className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Madeni;
