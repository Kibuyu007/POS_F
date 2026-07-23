import axios from "axios";
import { useEffect, useState } from "react";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import Loading from "../../../Components/Shared/Loading";
import BASE_URL from "../../../Utils/config";
import AddDebt from "./AddDebt";
import toast from "react-hot-toast";
import { FiEdit, FiCheck, FiX } from "react-icons/fi";
import { FaFilter } from "react-icons/fa";
import { useSelector } from "react-redux";
import {
  Search,
  X,
  User,
  Phone,
  Calendar,
  CheckCircle,
  Clock,
  Package,
  AlertCircle,
} from "lucide-react";

const Debts = () => {
  const user = useSelector((state) => state.user.user);
  const [debts, setDebts] = useState([]);
  const [load, setLoad] = useState(false);
  const [deductions, setDeductions] = useState({});
  const [customerFilter, setCustomerFilter] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [openAdd, setOpenAdd] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [debtStatusFilter, setDebtStatusFilter] = useState("all");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("not_paid");
  const [editingStatusId, setEditingStatusId] = useState(null);
  const [tempStatus, setTempStatus] = useState("");
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const itemsPerPage = 10;

  const debtStatusOptions = [
    { value: "Asset", label: "Asset" },
    { value: "Liability", label: "Liability" },
  ];

  const paymentStatusOptions = [
    { value: "all", label: "All" },
    { value: "not_paid", label: "Not yet Paid" },
    { value: "fully_paid", label: "Fully Paid" },
  ];

  useEffect(() => {
    fetchDebts();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    customerFilter,
    startDate,
    endDate,
    debtStatusFilter,
    paymentStatusFilter,
  ]);

  const fetchDebts = async () => {
    setLoad(true);
    try {
      const res = await axios.get(`${BASE_URL}/api/debts/allDebts`);
      setDebts(res.data);
    } catch (error) {
      console.error("Error fetching debts:", error);
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to load debts";
      toast.error(message);
    } finally {
      setLoad(false);
    }
  };

  const handlePay = async (debt) => {
    const id = debt._id;
    const amount = parseFloat(deductions[id] || 0);

    if (!amount || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    if (amount > debt.remainingAmount) {
      toast.error("Amount exceeds remaining balance");
      return;
    }

    try {
      const res = await axios.post(`${BASE_URL}/api/debts/payDebt/${id}`, {
        amount,
      });
      toast.success(res.data.message || "Payment successful");
      setDeductions((prev) => ({ ...prev, [id]: "" }));
      fetchDebts();
    } catch (err) {
      console.error("Error paying:", err);
      const message =
        err.response?.data?.message || err.message || "Payment failed";
      toast.error(message);
    }
  };

  const handleStatusEdit = (debt) => {
    setEditingStatusId(debt._id);
    setTempStatus(debt.debtStatus || "Asset");
  };

  const handleStatusCancel = () => {
    setEditingStatusId(null);
    setTempStatus("");
  };

  const handleStatusUpdate = async (debtId) => {
    if (!tempStatus) {
      toast.error("Please select a status");
      return;
    }

    setStatusUpdating(true);
    try {
      const res = await axios.put(
        `${BASE_URL}/api/debts/updateDebt/${debtId}`,
        {
          debtStatus: tempStatus,
        },
      );

      toast.success(res.data.message || "Status updated successfully");

      setDebts((prevDebts) =>
        prevDebts.map((debt) =>
          debt._id === debtId ? { ...debt, debtStatus: tempStatus } : debt,
        ),
      );

      setEditingStatusId(null);
      setTempStatus("");
    } catch (err) {
      console.error("Error updating status:", err);
      const message =
        err.response?.data?.message || err.message || "Failed to update status";
      toast.error(message);
    } finally {
      setStatusUpdating(false);
    }
  };

  const canChangeDebtStatus = user?.roles?.canChangeDebtStatus === true;
  const canPayDebts = user?.roles?.canPayDebt === true;

  const filteredData = debts.filter((d) => {
    if (!d.createdAt) return false;

    const date = dayjs(d.createdAt);
    const matchStart = startDate
      ? date.isSameOrAfter(dayjs(startDate), "day")
      : true;
    const matchEnd = endDate
      ? date.isSameOrBefore(dayjs(endDate), "day")
      : true;
    const matchCustomer = customerFilter
      ? (d.customerName || "")
          .toLowerCase()
          .includes(customerFilter.toLowerCase())
      : true;
    const matchDebtStatus =
      debtStatusFilter === "all" ? true : d.debtStatus === debtStatusFilter;

    let matchPaymentStatus = true;
    if (paymentStatusFilter === "not_paid") {
      matchPaymentStatus = (d.remainingAmount || 0) > 0;
    } else if (paymentStatusFilter === "fully_paid") {
      matchPaymentStatus = (d.remainingAmount || 0) <= 0;
    }

    return (
      matchStart &&
      matchEnd &&
      matchCustomer &&
      matchDebtStatus &&
      matchPaymentStatus
    );
  });

  const totalDebt = filteredData.reduce(
    (sum, d) => sum + (d.totalAmount || 0),
    0,
  );
  const totalRemaining = filteredData.reduce(
    (sum, d) => sum + (d.remainingAmount || 0),
    0,
  );
  const totalPaid = totalDebt - totalRemaining;
  const paidDebts = filteredData.filter((d) => d.remainingAmount <= 0).length;
  const pendingDebts = filteredData.filter((d) => d.remainingAmount > 0).length;

  const uniqueDebtStatuses = [
    ...new Set(debts.map((d) => d.debtStatus).filter(Boolean)),
  ];

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentList = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const activeFilterCount = [
    debtStatusFilter !== "all",
    paymentStatusFilter !== "not_paid",
    startDate,
    endDate,
    customerFilter,
  ].filter(Boolean).length;

  const clearFilters = () => {
    setCustomerFilter("");
    setStartDate(null);
    setEndDate(null);
    setDebtStatusFilter("all");
    setPaymentStatusFilter("not_paid");
    setCurrentPage(1);
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

  const formatNumberWithCommas = (value) => {
    if (!value) return "";
    const num = parseFloat(value);
    if (isNaN(num)) return value;
    return num.toLocaleString();
  };

  const handlePaymentInputChange = (debtId, value) => {
    const cleanValue = value.replace(/,/g, "");
    if (cleanValue === "" || /^\d*\.?\d*$/.test(cleanValue)) {
      setDeductions({
        ...deductions,
        [debtId]: cleanValue,
      });
    }
  };

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

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

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

        {startPage > 1 && (
          <>
            <button
              onClick={() => setPageFn(1)}
              className="px-3.5 py-2 rounded-lg text-sm font-medium bg-white border-2 border-gray-300 text-gray-600 hover:bg-gray-100 hover:border-gray-400 transition-all duration-200 shadow-sm"
            >
              1
            </button>
            {startPage > 2 && (
              <span className="px-1 text-gray-400 text-sm">…</span>
            )}
          </>
        )}

        {pageNumbers.map((number) => (
          <button
            key={number}
            onClick={() => setPageFn(number)}
            className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm border-2 ${
              currentPageNum === number
                ? "bg-emerald-500 text-white border-emerald-500 hover:bg-emerald-600"
                : "bg-white border-gray-300 text-gray-600 hover:bg-gray-100 hover:border-gray-400"
            }`}
          >
            {number}
          </button>
        ))}

        {endPage < totalPagesNum && (
          <>
            {endPage < totalPagesNum - 1 && (
              <span className="px-1 text-gray-400 text-sm">…</span>
            )}
            <button
              onClick={() => setPageFn(totalPagesNum)}
              className="px-3.5 py-2 rounded-lg text-sm font-medium bg-white border-2 border-gray-300 text-gray-600 hover:bg-gray-100 hover:border-gray-400 transition-all duration-200 shadow-sm"
            >
              {totalPagesNum}
            </button>
          </>
        )}

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

  const statsData = [
    { label: "Total Debt", value: formatCurrency(totalDebt), icon: Package },
    { label: "Pending", value: formatCurrency(totalRemaining), icon: Clock },
    { label: "Paid", value: formatCurrency(totalPaid), icon: CheckCircle },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-8xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200 border-2 border-emerald-300">
              <Package className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800 tracking-tight">
                Debts
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 hidden xs:block">
                Track and manage all customer debts
              </p>
            </div>
          </div>
          <button
            onClick={() => setOpenAdd(true)}
            className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-200 hover:scale-[1.02] active:scale-95 text-xs sm:text-sm font-semibold shadow-md border-2 border-emerald-400"
          >
            <span>+ Add New Debt</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 xs:grid-cols-3 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6">
          {statsData.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="bg-white p-3 sm:p-4 md:p-5 rounded-2xl border-2 border-gray-300 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
              >
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-[10px] sm:text-xs font-medium text-black/60 uppercase tracking-wider truncate">
                      {stat.label}
                    </p>
                    <p className="text-sm sm:text-lg md:text-xl font-bold text-black mt-0.5 sm:mt-1 truncate">
                      {stat.value}
                    </p>
                  </div>
                  <div className="bg-gray-100 p-2 sm:p-2.5 rounded-xl border-2 border-gray-300 flex-shrink-0">
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-black" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Search + Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-5">
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {paymentStatusOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setPaymentStatusFilter(option.value)}
                className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-semibold transition-all duration-200 border-2 ${
                  paymentStatusFilter === option.value
                    ? "bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-200"
                    : "bg-white border-gray-300 text-gray-500 hover:border-gray-400 hover:text-gray-700 hover:bg-gray-100"
                }`}
              >
                {option.label}
                <span
                  className={`text-[10px] sm:text-xs ${
                    paymentStatusFilter === option.value
                      ? "text-white/80"
                      : "text-gray-400"
                  }`}
                >
                  (
                  {option.value === "all"
                    ? filteredData.length
                    : option.value === "not_paid"
                      ? pendingDebts
                      : paidDebts}
                  )
                </span>
              </button>
            ))}
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-56 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-black/50 w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <input
                type="text"
                placeholder="Search customer..."
                value={customerFilter}
                onChange={(e) => setCustomerFilter(e.target.value)}
                className="w-full pl-8 sm:pl-9 pr-8 py-2 sm:py-2.5 bg-white border-2 border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1 transition-all duration-200 text-black placeholder:text-black/50 text-xs sm:text-sm"
              />
              {customerFilter && (
                <button
                  onClick={() => setCustomerFilter("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-black/40 hover:text-black/70"
                >
                  <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              )}
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl font-semibold text-xs sm:text-sm transition-all duration-200 border-2 ${
                showFilters || activeFilterCount > 0
                  ? "bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-200"
                  : "bg-white border-gray-300 text-gray-600 hover:bg-gray-100 hover:border-gray-400"
              }`}
            >
              <FaFilter className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Filters</span>
              {activeFilterCount > 0 && (
                <span className="bg-white text-emerald-600 text-[10px] sm:text-xs w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center font-bold">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Expandable Filters Panel */}
        {showFilters && (
          <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-lg border-2 border-gray-200 mb-4 space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-800">
                Advanced Filters
              </h3>
              <button
                onClick={() => setShowFilters(false)}
                className="p-1 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  From Date
                </label>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    value={startDate}
                    onChange={setStartDate}
                    slotProps={{
                      textField: {
                        size: "small",
                        fullWidth: true,
                        sx: {
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "12px",
                            fontSize: "13px",
                          },
                        },
                      },
                    }}
                  />
                </LocalizationProvider>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  To Date
                </label>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    value={endDate}
                    onChange={setEndDate}
                    slotProps={{
                      textField: {
                        size: "small",
                        fullWidth: true,
                        sx: {
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "12px",
                            fontSize: "13px",
                          },
                        },
                      },
                    }}
                  />
                </LocalizationProvider>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Debt Status
              </label>
              <select
                value={debtStatusFilter}
                onChange={(e) => setDebtStatusFilter(e.target.value)}
                className="w-full px-4 py-2.5 text-sm border-2 border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1 text-black"
              >
                <option value="all">All Statuses</option>
                {uniqueDebtStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={clearFilters}
              className="w-full py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-xl transition-all duration-200 text-sm"
            >
              Clear All Filters
            </button>
          </div>
        )}

        {/* Active Filter Chips */}
        {activeFilterCount > 0 && !showFilters && (
          <div className="flex flex-wrap gap-1 sm:gap-1.5 mb-3 sm:mb-4">
            {debtStatusFilter !== "all" && (
              <span className="inline-flex items-center gap-0.5 sm:gap-1 px-2 sm:px-3 py-0.5 sm:py-1 bg-red-100 text-red-700 text-[10px] sm:text-xs font-medium rounded-full border border-red-200">
                {debtStatusFilter}
                <button
                  onClick={() => setDebtStatusFilter("all")}
                  className="hover:text-red-900"
                >
                  <X className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                </button>
              </span>
            )}
            {paymentStatusFilter !== "not_paid" && (
              <span className="inline-flex items-center gap-0.5 sm:gap-1 px-2 sm:px-3 py-0.5 sm:py-1 bg-emerald-100 text-emerald-700 text-[10px] sm:text-xs font-medium rounded-full border border-emerald-200">
                {
                  paymentStatusOptions.find(
                    (o) => o.value === paymentStatusFilter,
                  )?.label
                }
                <button
                  onClick={() => setPaymentStatusFilter("not_paid")}
                  className="hover:text-emerald-900"
                >
                  <X className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                </button>
              </span>
            )}
            {startDate && (
              <span className="inline-flex items-center gap-0.5 sm:gap-1 px-2 sm:px-3 py-0.5 sm:py-1 bg-blue-100 text-blue-700 text-[10px] sm:text-xs font-medium rounded-full border border-blue-200">
                From {dayjs(startDate).format("DD/MM/YY")}
                <button
                  onClick={() => setStartDate(null)}
                  className="hover:text-blue-900"
                >
                  <X className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                </button>
              </span>
            )}
            {endDate && (
              <span className="inline-flex items-center gap-0.5 sm:gap-1 px-2 sm:px-3 py-0.5 sm:py-1 bg-blue-100 text-blue-700 text-[10px] sm:text-xs font-medium rounded-full border border-blue-200">
                To {dayjs(endDate).format("DD/MM/YY")}
                <button
                  onClick={() => setEndDate(null)}
                  className="hover:text-blue-900"
                >
                  <X className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                </button>
              </span>
            )}
            {customerFilter && (
              <span className="inline-flex items-center gap-0.5 sm:gap-1 px-2 sm:px-3 py-0.5 sm:py-1 bg-amber-100 text-amber-700 text-[10px] sm:text-xs font-medium rounded-full border border-amber-200">
                {customerFilter}
                <button
                  onClick={() => setCustomerFilter("")}
                  className="hover:text-amber-900"
                >
                  <X className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                </button>
              </span>
            )}
          </div>
        )}

        <Loading load={load} />

        {/* Results Count */}
        <div className="flex items-center justify-between mb-2 sm:mb-3 px-1">
          <p className="text-[10px] sm:text-sm text-gray-500">
            <span className="font-semibold text-gray-700">
              {filteredData.length}
            </span>{" "}
            results found
          </p>
          <p className="text-[10px] sm:text-sm text-gray-400">
            Page {currentPage} of {totalPages || 1}
          </p>
        </div>

        {/* Card List */}
        <div className="space-y-2 sm:space-y-2.5">
          {load ? (
            <div className="flex flex-col items-center justify-center py-12 sm:py-16 bg-gray-100 rounded-2xl border-2 border-gray-300 shadow-sm">
              <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-emerald-300 border-t-emerald-500 rounded-full animate-spin" />
              <p className="text-xs sm:text-sm text-gray-500 mt-3 sm:mt-4">
                Loading debts...
              </p>
            </div>
          ) : currentList.length === 0 ? (
            <div className="bg-gray-100 rounded-2xl border-2 border-gray-300 shadow-sm py-12 sm:py-16 text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 border-2 border-gray-300">
                <Package className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
              </div>
              <p className="text-sm sm:text-base text-gray-700 font-medium">
                No debts found
              </p>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Try adjusting your filters
              </p>
            </div>
          ) : (
            currentList.map((d, idx) => {
              const isEditing = editingStatusId === d._id;
              const isFullyPaid = d.remainingAmount <= 0;
              const paidAmount =
                (d.totalAmount || 0) - (d.remainingAmount || 0);

              return (
                <div
                  key={d._id}
                  className="bg-gray-200 rounded-xl border-2 border-gray-300 shadow-sm p-3 sm:p-4 hover:shadow-md hover:border-emerald-300 transition-all duration-300"
                >
                  {/* Row 1: Customer & Status */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-emerald-200 flex items-center justify-center flex-shrink-0 border-2 border-emerald-300">
                        <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-700" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                          <span className="text-xs sm:text-sm font-semibold text-gray-800 truncate max-w-[100px] xs:max-w-[150px] sm:max-w-[200px]">
                            {d.customerName || "—"}
                          </span>
                          <span className="text-[9px] sm:text-[10px] text-gray-600 bg-white px-1.5 py-0.5 rounded border border-gray-300 flex-shrink-0">
                            #{idx + 1}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 sm:gap-2 text-[9px] sm:text-[10px] text-gray-500 mt-0.5 flex-wrap">
                          <span className="flex items-center gap-0.5">
                            <Phone className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                            <span className="hidden xs:inline">
                              {d.phone || "—"}
                            </span>
                          </span>
                          <span className="w-0.5 h-0.5 bg-gray-400 rounded-full" />
                          <span className="flex items-center gap-0.5">
                            <Calendar className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                            {formatDate(d.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
                      <span
                        className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[8px] sm:text-[10px] font-semibold border-2 ${
                          d.debtStatus === "Asset"
                            ? "bg-red-100 text-red-700 border-red-200"
                            : "bg-yellow-100 text-yellow-700 border-yellow-200"
                        }`}
                      >
                        {d.debtStatus || "—"}
                      </span>
                      <span
                        className={`inline-flex items-center gap-0.5 px-1.5 sm:px-2 py-0.5 rounded-full text-[8px] sm:text-[10px] font-semibold border-2 ${
                          isFullyPaid
                            ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                            : "bg-red-100 text-red-700 border-red-200"
                        }`}
                      >
                        {isFullyPaid ? (
                          <>
                            <CheckCircle className="w-2 h-2 sm:w-2.5 sm:h-2.5" />
                            Paid
                          </>
                        ) : (
                          <>
                            <Clock className="w-2 h-2 sm:w-2.5 sm:h-2.5" />
                            Pending
                          </>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Row 2: Financial Summary */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mt-2 sm:mt-2.5 px-1">
                    <div className="flex items-center gap-3 sm:gap-4 md:gap-6 flex-wrap">
                      <div>
                        <p className="text-[7px] sm:text-[8px] text-gray-400 font-medium uppercase">
                          Total
                        </p>
                        <p className="text-[10px] sm:text-xs font-bold text-gray-800">
                          {formatCurrency(d.totalAmount)}
                        </p>
                      </div>
                      <div className="w-px h-5 sm:h-7 bg-gray-300" />
                      <div>
                        <p className="text-[7px] sm:text-[8px] text-gray-400 font-medium uppercase">
                          Paid
                        </p>
                        <p className="text-[10px] sm:text-xs font-bold text-emerald-600">
                          {formatCurrency(paidAmount)}
                        </p>
                      </div>
                      <div className="w-px h-5 sm:h-7 bg-gray-300" />
                      <div>
                        <p className="text-[7px] sm:text-[8px] text-gray-400 font-medium uppercase">
                          Remaining
                        </p>
                        <p
                          className={`text-[10px] sm:text-xs font-bold ${
                            isFullyPaid ? "text-emerald-600" : "text-red-600"
                          }`}
                        >
                          {formatCurrency(d.remainingAmount)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Row 3: Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3 mt-2 sm:mt-2.5 pt-2 sm:pt-2.5 border-t border-gray-300">
                    {/* Left: Change Status */}
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <span className="text-[8px] sm:text-[10px] text-gray-500 font-medium hidden xs:inline">
                        Type:
                      </span>
                      {canChangeDebtStatus && !isEditing && (
                        <button
                          onClick={() => handleStatusEdit(d)}
                          className="px-2.5 sm:px-4 py-1 sm:py-1.5 bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-100 font-semibold rounded-lg text-[9px] sm:text-xs transition-all duration-200 shadow-sm flex items-center gap-1 sm:gap-1.5"
                          disabled={
                            editingStatusId !== null &&
                            editingStatusId !== d._id
                          }
                        >
                          <FiEdit className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                          <span className="hidden xs:inline">Change</span>
                          <span className="xs:hidden">Edit</span>
                        </button>
                      )}
                      {isEditing && canChangeDebtStatus && (
                        <div className="flex flex-wrap items-center gap-1 sm:gap-2 bg-white rounded-lg border-2 border-gray-300 p-1 sm:p-1.5 shadow-sm">
                          <select
                            value={tempStatus}
                            onChange={(e) => setTempStatus(e.target.value)}
                            className="px-1.5 sm:px-3 py-1 sm:py-1.5 text-[9px] sm:text-xs bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 text-gray-700 font-medium max-w-[80px] sm:max-w-none"
                            disabled={statusUpdating}
                          >
                            {debtStatusOptions.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                          <div className="flex items-center gap-0.5 sm:gap-1">
                            <button
                              onClick={() => handleStatusUpdate(d._id)}
                              disabled={statusUpdating}
                              className="px-2 sm:px-3 py-1 sm:py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg text-[9px] sm:text-xs transition-colors flex items-center gap-0.5 sm:gap-1"
                            >
                              <FiCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                              <span className="hidden xs:inline">Save</span>
                            </button>
                            <button
                              onClick={handleStatusCancel}
                              disabled={statusUpdating}
                              className="px-2 sm:px-3 py-1 sm:py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg text-[9px] sm:text-xs transition-colors flex items-center gap-0.5 sm:gap-1"
                            >
                              <FiX className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                              <span className="hidden xs:inline">Cancel</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right: Payment */}
                    {!isFullyPaid && canPayDebts && (
                      <div className="flex items-center gap-1 sm:gap-1.5 flex-1 sm:flex-none min-w-[140px]">
                        <div className="relative flex-1 min-w-[80px] xs:min-w-[120px] sm:min-w-[150px] max-w-[240px]">
                          <span className="absolute left-1.5 sm:left-2.5 top-1/2 -translate-y-1/2 text-[7px] sm:text-[9px] font-bold text-gray-500">
                            TSh
                          </span>
                          <input
                            type="text"
                            value={
                              deductions[d._id]
                                ? formatNumberWithCommas(deductions[d._id])
                                : ""
                            }
                            onChange={(e) =>
                              handlePaymentInputChange(d._id, e.target.value)
                            }
                            className="w-full pl-6 sm:pl-9 pr-1.5 sm:pr-2 py-1 sm:py-1.5 rounded-lg border-2 border-gray-300 text-[9px] sm:text-xs focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300 text-black bg-white"
                            placeholder="Amount"
                            disabled={isEditing}
                          />
                        </div>
                        <button
                          onClick={() => handlePay(d)}
                          disabled={
                            !deductions[d._id] ||
                            parseFloat(deductions[d._id]) <= 0 ||
                            isEditing
                          }
                          className={`px-2.5 sm:px-4 py-1 sm:py-1.5 font-semibold rounded-lg text-[9px] sm:text-xs transition-all duration-200 ${
                            deductions[d._id] &&
                            parseFloat(deductions[d._id]) > 0 &&
                            !isEditing
                              ? "bg-yellow-400 hover:bg-yellow-500 text-black shadow-sm"
                              : "bg-gray-300 text-gray-500 cursor-not-allowed"
                          }`}
                        >
                          Pay
                        </button>
                      </div>
                    )}

                    {isFullyPaid && (
                      <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 bg-emerald-100 rounded-lg border border-emerald-300">
                        <CheckCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-600" />
                        <span className="text-[8px] sm:text-[10px] font-semibold text-emerald-700">
                          Fully Paid
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {filteredData.length > 0 && (
          <div className="mt-3 sm:mt-4 bg-white px-3 sm:px-5 py-2.5 sm:py-4 rounded-xl border-2 border-gray-200 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-3">
            <span className="text-[9px] sm:text-xs text-gray-500 text-center sm:text-left">
              Showing{" "}
              <span className="font-semibold text-gray-700">
                {(currentPage - 1) * itemsPerPage + 1}
              </span>{" "}
              to{" "}
              <span className="font-semibold text-gray-700">
                {Math.min(currentPage * itemsPerPage, filteredData.length)}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-gray-700">
                {filteredData.length}
              </span>{" "}
              debts
            </span>
            {renderPagination(currentPage, totalPages, setCurrentPage)}
          </div>
        )}

        {openAdd && (
          <AddDebt
            close={() => {
              setOpenAdd(false);
              fetchDebts();
            }}
          />
        )}
      </div>
    </div>
  );
};

export default Debts;
