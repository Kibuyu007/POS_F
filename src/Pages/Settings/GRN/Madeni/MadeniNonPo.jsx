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
  const [supplierBills, setSupplierBills] = useState([]);
  const [load, setLoad] = useState(false);
  const [expandedSuppliers, setExpandedSuppliers] = useState({});
  const [supplierFilter, setSupplierFilter] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [bulkPaymentAmount, setBulkPaymentAmount] = useState("");

  const itemsPerPage = 10;

  useEffect(() => {
    fetchSupplierBills();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [supplierFilter, startDate, endDate]);

  // GET SUPPLIER BILLS
  const fetchSupplierBills = async () => {
    setLoad(true);
    try {
      const res = await axios.get(`${BASE_URL}/api/grn/unpaidNonPo`);
      if (res.data.success) {
        setSupplierBills(res.data.data);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load supplier bills.");
    } finally {
      setLoad(false);
    }
  };

  // FILTER LOGIC
  const filteredData = supplierBills.filter((supplier) => {
    // Filter by supplier name
    if (
      supplierFilter &&
      !supplier.supplierName
        .toLowerCase()
        .includes(supplierFilter.toLowerCase())
    ) {
      return false;
    }

    // Filter by date range (check if any item falls within range)
    if (startDate || endDate) {
      const hasItemsInRange = supplier.items.some((item) => {
        const itemDate = dayjs(item.createdAt);
        const matchStart = startDate
          ? itemDate.isSameOrAfter(dayjs(startDate), "day")
          : true;
        const matchEnd = endDate
          ? itemDate.isSameOrBefore(dayjs(endDate), "day")
          : true;
        return matchStart && matchEnd;
      });
      return hasItemsInRange;
    }

    return true;
  });

  // Calculate statistics from filtered suppliers
  const totalDebt = filteredData.reduce(
    (sum, supplier) => sum + (supplier.totalBilledAmount || 0),
    0
  );
  const totalRemaining = filteredData.reduce(
    (sum, supplier) => sum + (supplier.totalRemainingBalance || 0),
    0
  );
  const totalPaid = totalDebt - totalRemaining;

  // Count suppliers with pending items
  const suppliersWithBalance = filteredData.filter(
    (s) => s.totalRemainingBalance > 0
  ).length;
  const suppliersFullyPaid = filteredData.filter(
    (s) => s.totalRemainingBalance <= 0
  ).length;

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const totalSuppliers = filteredData.length;

  const currentSuppliers = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Toggle supplier expansion
  const toggleSupplierExpansion = (supplierId) => {
    setExpandedSuppliers((prev) => ({
      ...prev,
      [supplierId]: !prev[supplierId],
    }));
  };

  // Calculate remaining balance for a specific supplier item
  const calculateItemRemainingBalance = (item) => {
    return (item.billedTotalCost || 0) - (item.paidAmount || 0);
  };

  // Check if item is fully paid
  const isItemFullyPaid = (item) => {
    return item.isFullyPaid || calculateItemRemainingBalance(item) <= 0;
  };

  // Handle supplier bulk payment
  const handleSupplierPayment = async (supplier) => {
    const amount = parseFloat(bulkPaymentAmount || 0);

    if (!amount || amount <= 0) {
      toast.error("Please enter a valid payment amount");
      return;
    }

    if (amount > supplier.totalRemainingBalance) {
      toast.error("Payment amount exceeds supplier's remaining balance");
      return;
    }

    setLoad(true);
    try {
      const res = await axios.post(
        `${BASE_URL}/api/grn/payNonPoBills`,
        {
          supplierId: supplier.supplierId,
          paymentAmount: amount,
        },
        { withCredentials: true }
      );

      if (res.data.success) {
        toast.success(
          `Payment of Tsh ${amount.toLocaleString()} processed successfully!`
        );
        setBulkPaymentAmount("");
        setPaymentDialogOpen(false);
        setSelectedSupplier(null);
        fetchSupplierBills(); // Refresh data
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to process payment.");
    } finally {
      setLoad(false);
    }
  };

  // Open payment dialog for supplier
  const openPaymentDialog = (supplier) => {
    setSelectedSupplier(supplier);
    setBulkPaymentAmount("");
    setPaymentDialogOpen(true);
  };

  const formatNumber = (value) => {
    if (!value && value !== 0) return "";
    const num = parseFloat(value);
    if (isNaN(num)) return "";
    return num.toLocaleString();
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
            Supplier Payment Management
          </h1>
          <p className="text-gray-600">
            Track and manage supplier bill payments (FIFO Basis)
          </p>
        </div>
        <button
          onClick={fetchSupplierBills}
          className="mt-4 md:mt-0 px-6 py-3 bg-green-300 hover:bg-green-400 text-black font-bold rounded-full shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2"
        >
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Stats Section */}
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
                Pending Suppliers:{" "}
              </span>
              <span className="font-bold text-black">
                {suppliersWithBalance}
              </span>
            </div>

            <div className="h-4 w-px bg-gray-300"></div>

            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-700">
                Fully Paid:{" "}
              </span>
              <span className="font-bold text-black">{suppliersFullyPaid}</span>
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
              Item Date Range
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

      {/* Payment Dialog Modal */}
      {paymentDialogOpen && selectedSupplier && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-xl overflow-hidden">
            {/* Modal Header */}
            <div className="px-8 py-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">
                  Payment to {selectedSupplier.supplierName}
                </h3>
                <button
                  onClick={() => {
                    setPaymentDialogOpen(false);
                    setSelectedSupplier(null);
                  }}
                  className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-full"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="px-8 py-6">
              {/* Balance Summary */}
              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center py-3 px-4 bg-gray-50 rounded-full">
                  <span className="text-gray-700 font-medium">
                    Total Billed
                  </span>
                  <span className="text-gray-900 font-bold">
                    Tsh {selectedSupplier.totalBilledAmount.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between items-center py-3 px-4 bg-gray-50 rounded-full">
                  <span className="text-gray-700 font-medium">Amount Paid</span>
                  <span className="text-green-600 font-bold">
                    Tsh {selectedSupplier.totalPaidAmount.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between items-center py-3 px-4 bg-gray-50 rounded-full">
                  <span className="text-gray-700 font-medium">
                    Remaining Balance
                  </span>
                  <span className="text-red-600 font-bold">
                    Tsh{" "}
                    {selectedSupplier.totalRemainingBalance.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Payment Amount */}
              <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-3">
                  Payment Amount
                </label>
                <div className="relative mb-2">
                  <input
                    type="text"
                    value={formatNumber(bulkPaymentAmount)}
                    onChange={(e) => {
                      const rawValue = unformatNumber(e.target.value);
                      if (!/^\d*\.?\d*$/.test(rawValue)) return;
                      setBulkPaymentAmount(rawValue);
                    }}
                    className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-full bg-white text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-600 font-medium">
                    Tsh
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <button
                    onClick={() =>
                      setBulkPaymentAmount(
                        selectedSupplier.totalRemainingBalance.toString()
                      )
                    }
                    className="text-green-600 hover:text-green-700 font-medium"
                  >
                    Pay full balance
                  </button>
                  <span className="text-gray-500">
                    Balance: Tsh{" "}
                    {selectedSupplier.totalRemainingBalance.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Info Note */}
              <div className="mb-8">
                <div className="bg-blue-50 border border-blue-200 rounded-full px-4 py-3 flex items-center gap-3">
                  <svg
                    className="w-5 h-5 text-blue-500 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="text-blue-800 text-sm">
                    Payment will be applied to oldest items first (FIFO)
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setPaymentDialogOpen(false);
                    setSelectedSupplier(null);
                  }}
                  className="flex-1 py-3 px-6 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-full transition-colors border border-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSupplierPayment(selectedSupplier)}
                  disabled={
                    !bulkPaymentAmount || parseFloat(bulkPaymentAmount) <= 0
                  }
                  className={`flex-1 py-3 px-6 font-medium rounded-full transition-colors ${
                    bulkPaymentAmount && parseFloat(bulkPaymentAmount) > 0
                      ? "bg-green-600 hover:bg-green-700 text-white"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  Process Payment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading */}
      <Loading load={load} />

      {/* Suppliers Table */}
      <div className="overflow-x-auto rounded-xl">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-200">
              {[
                "SN",
                "Supplier",
                "Created By",
                "Total Billed",
                "Amount Paid",
                "Remaining Balance",
                "Items Count",
                "Status",
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

          <tr className="h-3"></tr>

          <tbody>
            {currentSuppliers.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-12">
                  <div className="space-y-3">
                    <div className="text-4xl">📋</div>
                    <p className="text-xl font-bold text-black">
                      No supplier bills found
                    </p>
                    <p className="text-gray-600">
                      Try adjusting your search filters
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              currentSuppliers.map((supplier, idx) => {
                const isExpanded = expandedSuppliers[supplier.supplierId];
                const pendingItems = supplier.items.filter(
                  (item) => !isItemFullyPaid(item)
                ).length;
                const paidItems = supplier.items.filter((item) =>
                  isItemFullyPaid(item)
                ).length;

                return (
                  <>
                    {/* Supplier Row */}
                    <tr
                      key={supplier.supplierId}
                      className="hover:bg-green-500 transition-colors shadow-md"
                    >
                      {/* SN Column */}
                      <td className="py-4 px-3 text-center border-r border-gray-300 bg-gray-200">
                        <button
                          onClick={() =>
                            toggleSupplierExpansion(supplier.supplierId)
                          }
                          className="inline-flex items-center justify-center w-10 h-10 bg-green-300 hover:bg-green-400 text-black font-bold rounded-full shadow transition-colors"
                        >
                          {(currentPage - 1) * itemsPerPage + idx + 1}
                        </button>
                      </td>

                      {/* Supplier Name */}
                      <td className="py-4 px-3 text-center bg-green-200 border-r border-gray-200">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() =>
                              toggleSupplierExpansion(supplier.supplierId)
                            }
                            className="bg-grey hover:bg-green-300 p-1 px-4 py-2 rounded-full transition-colors"
                          >
                            {isExpanded ? "▼" : "▶"}
                          </button>
                          <span className="font-bold text-black">
                            {supplier.supplierName}
                          </span>
                        </div>
                      </td>

                      {/* Created By */}
                      <td className="py-4 px-3 text-center bg-gray-100 border-r border-gray-200">
                        <span className="font-bold text-black">
                          {supplier.createdBy}
                        </span>
                      </td>

                      {/* Total Billed */}
                      <td className="py-4 px-3 text-center bg-yellow-100 border-r border-gray-200">
                        <span className="font-bold text-black">
                          {supplier.totalBilledAmount.toLocaleString()}
                        </span>
                      </td>

                      {/* Amount Paid */}
                      <td className="py-4 px-3 text-center bg-gray-100 border-r border-gray-200">
                        <span className="font-bold text-green-700">
                          {supplier.totalPaidAmount.toLocaleString()}
                        </span>
                      </td>

                      {/* Remaining Balance */}
                      <td className="py-4 px-3 text-center bg-green-200 border-r border-gray-200">
                        <span
                          className={`inline-block px-4 py-2 font-bold rounded-full ${
                            supplier.totalRemainingBalance > 0
                              ? "bg-red-100 text-red-700"
                              : "bg-green-300 text-green-900"
                          }`}
                        >
                          {supplier.totalRemainingBalance.toLocaleString()}
                        </span>
                      </td>

                      {/* Items Count */}
                      <td className="py-4 px-3 text-center bg-gray-100 border-r border-gray-200">
                        <div className="flex flex-col items-center">
                          {/* Total Count in Circle */}
                          <div className="mb-2">
                            <div className="w-10 h-10 bg-green-300 rounded-full flex items-center justify-center mx-auto shadow">
                              <span className="font-bold text-black text-lg">
                                {supplier.items.length}
                              </span>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              items
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-3 text-center bg-gray-200 border-r border-gray-200">
                        <span
                          className={`inline-flex items-center px-4 py-2 font-bold rounded-full ${
                            supplier.totalRemainingBalance > 0
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-green-300 text-green-900"
                          }`}
                        >
                          {supplier.totalRemainingBalance > 0
                            ? "Pending"
                            : "Fully Paid"}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-4 px-3 text-center bg-gray-100">
                        {supplier.totalRemainingBalance > 0 &&
                        canPayBilledGrn ? (
                          <button
                            onClick={() => openPaymentDialog(supplier)}
                            className="px-4 py-2.5 bg-yellow-100 hover:bg-yellow-200 text-black font-bold rounded-full shadow hover:shadow-md transition-all"
                          >
                            Make Payment
                          </button>
                        ) : supplier.totalRemainingBalance <= 0 ? (
                          <span className="inline-flex items-center px-4 py-2.5 bg-green-300 text-black font-bold rounded-full shadow">
                            Fully Paid
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-4 py-2.5 bg-red-300 text-black font-bold rounded-full shadow">
                            Not Allowed
                          </span>
                        )}
                      </td>
                    </tr>

                    {/* Expanded Items Table */}
                    {isExpanded && (
                      <tr>
                        <td colSpan={9} className="p-0">
                          <div className="relative pl-24 pr-6 py-6 bg-gradient-to-br from-white via-gray-50 to-white rounded-2xl shadow-lg border border-gray-200">
                            {/* Black dotted rectangle - separated from content */}
                            <div className="absolute left-0 top-8 bottom-8 w-36 pointer-events-none">
                              <svg
                                viewBox="0 0 180 480"
                                className="h-full w-full"
                                preserveAspectRatio="none"
                              >
                                <path
                                  d="
                                  M120 30
                                    H40
                                    Q10 30 10 60
                                   V420
                                   Q10 450 40 450
                                     H120
                                       "
                                  fill="none"
                                  stroke="#000000" /* Pure black */
                                  strokeWidth="6"
                                  strokeDasharray="4 12"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </div>

                            {/* Header - Gray only */}
                            <div className="mb-6 flex items-start justify-between">
                              <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center shadow-sm">
                                  <span className="text-gray-600 text-xl">
                                    📦
                                  </span>
                                </div>

                                <div>
                                  <h4 className="font-bold text-gray-900 text-xl mb-1">
                                    {supplier.supplierName} Items
                                  </h4>

                                  <div className="flex items-center gap-4 mt-3">
                                    <div className="flex items-center gap-2 bg-gradient-to-r from-gray-50 to-gray-100 px-3 py-1.5 rounded-full border border-gray-200">
                                      <span className="w-2.5 h-2.5 bg-gray-700 rounded-full" />
                                      <span className="text-sm font-medium text-gray-800">
                                        {paidItems} paid
                                      </span>
                                    </div>

                                    <div className="flex items-center gap-2 bg-gradient-to-r from-gray-50 to-gray-100 px-3 py-1.5 rounded-full border border-gray-200">
                                      <span className="w-2.5 h-2.5 bg-gray-400 rounded-full" />
                                      <span className="text-sm font-medium text-gray-800">
                                        {pendingItems} pending
                                      </span>
                                    </div>

                                    <div className="flex items-center gap-2 bg-gradient-to-r from-gray-50 to-gray-100 px-3 py-1.5 rounded-full border border-gray-200">
                                      <span className="text-sm font-medium text-gray-800">
                                        {supplier.items.length} total items
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <button
                                onClick={() =>
                                  toggleSupplierExpansion(supplier.supplierId)
                                }
                                className="px-5 py-2.5 text-sm bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-800 font-medium rounded-full shadow-sm transition-all hover:shadow"
                              >
                                ▲ Close
                              </button>
                            </div>

                            {/* Table - Gray only */}
                            <div className="overflow-hidden rounded-xl border border-gray-300 bg-white shadow-sm">
                              <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                  <thead>
                                    <tr className="bg-gradient-to-r from-gray-100 to-gray-150 border-b border-gray-400">
                                      {[
                                        "Item",
                                        "GRN Date",
                                        "Qty",
                                        "Unit Price",
                                        "Total",
                                        "Paid",
                                        "Remaining",
                                        "Status",
                                      ].map((h, idx) => (
                                        <th
                                          key={h}
                                          className={`px-6 py-4 text-left font-bold text-gray-800 uppercase text-xs ${
                                            idx < 7
                                              ? "border-r border-gray-400"
                                              : ""
                                          }`}
                                        >
                                          {h}
                                        </th>
                                      ))}
                                    </tr>
                                  </thead>

                                  <tbody>
                                    {supplier.items.map((item, idx) => {
                                      const remaining =
                                        calculateItemRemainingBalance(item);
                                      const isPaid = isItemFullyPaid(item);

                                      return (
                                        <tr
                                          key={`${item.grnId}_${item.itemId}`}
                                          className={`group border-b last:border-b-0 transition-colors hover:bg-gray-50/60 ${
                                            idx % 2 === 0
                                              ? "bg-white"
                                              : "bg-gray-50/30"
                                          }`}
                                        >
                                          {/* Item */}
                                          <td className="px-6 py-4 border-r border-gray-300">
                                            <div className="flex items-center gap-3">
                                              <div className="w-8 h-8 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center text-xs font-bold text-gray-700 shadow-sm">
                                                {idx + 1}
                                              </div>
                                              <span className="font-semibold text-gray-900">
                                                {item.name}
                                              </span>
                                            </div>
                                          </td>

                                          {/* Date */}
                                          <td className="px-6 py-4 text-center border-r border-gray-300">
                                            <div className="bg-gradient-to-r from-gray-100 to-gray-150 px-3 py-1.5 rounded-full border border-gray-300 inline-block">
                                              <span className="font-medium text-gray-800">
                                                {item.createdAt
                                                  ? dayjs(
                                                      item.createdAt
                                                    ).format("DD/MM/YY")
                                                  : "—"}
                                              </span>
                                            </div>
                                          </td>

                                          {/* Qty */}
                                          <td className="px-6 py-4 text-center border-r border-gray-300">
                                            <div className="bg-gradient-to-r from-gray-150 to-gray-200 px-3 py-1.5 rounded-full border border-gray-400 inline-block">
                                              <span className="font-bold text-gray-800">
                                                {item.quantity.toLocaleString()}
                                              </span>
                                            </div>
                                          </td>

                                          {/* Unit Price */}
                                          <td className="px-6 py-4 text-center border-r border-gray-300">
                                            <div className="bg-gradient-to-r from-gray-100 to-gray-150 px-3 py-1.5 rounded-full border border-gray-300 inline-block shadow-sm">
                                              <span className="font-semibold text-gray-800">
                                                {item.buyingPrice.toLocaleString()}
                                              </span>
                                            </div>
                                          </td>

                                          {/* Total */}
                                          <td className="px-6 py-4 text-center">
                                            <div className="bg-indigo-50 px-4 py-2 rounded-full border border-gray-200 shadow-sm">
                                              <span className="font-bold text-gray-900 text-base ">
                                                {item.billedTotalCost.toLocaleString()}
                                              </span>
                                            </div>
                                          </td>

                                          {/* Paid */}
                                          <td className="px-6 py-4 text-center border-r border-gray-300">
                                            <div className="bg-gradient-to-r from-gray-100 to-gray-150 px-4 py-2 rounded-full border border-gray-300 shadow-sm">
                                              <span className="font-bold text-green-700 text-base">
                                                {item.paidAmount.toLocaleString()}
                                              </span>
                                            </div>
                                          </td>

                                          {/* Remaining */}
                                          <td className="px-6 py-4 text-center border-r border-gray-300">
                                            <div
                                              className={`px-4 py-2 rounded-full border shadow-sm ${
                                                remaining > 0
                                                  ? "bg-gradient-to-r from-gray-150 to-gray-200 border-gray-400"
                                                  : "bg-gradient-to-r from-gray-100 to-gray-150 border-gray-300"
                                              }`}
                                            >
                                              <span className="font-bold text-base text-red-600">
                                                {remaining.toLocaleString()}
                                              </span>
                                            </div>
                                          </td>

                                          {/* Status */}
                                          <td className="px-6 py-4 text-center">
                                            <div
                                              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold border ${
                                                isPaid
                                                  ? "bg-gradient-to-r from-gray-150 to-gray-200 border-gray-400 text-gray-800"
                                                  : "bg-gradient-to-r from-gray-100 to-gray-150 border-gray-300 text-gray-800"
                                              }`}
                                            >
                                              <span
                                                className={`w-3 h-3 rounded-full ${
                                                  isPaid
                                                    ? "bg-green-600"
                                                    : "bg-yellow-500"
                                                }`}
                                              />
                                              {isPaid ? "Paid" : "Pending"}
                                            </div>
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}

                    {/* Spacing row */}
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
            {Math.min(currentPage * itemsPerPage, totalSuppliers)}
          </span>{" "}
          of <span className="font-bold text-black">{totalSuppliers}</span>{" "}
          suppliers
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
