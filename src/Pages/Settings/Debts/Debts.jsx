import React from "react";
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
import { FiEdit, FiCheck, FiX, FiSearch } from "react-icons/fi";
import { FaFilter } from "react-icons/fa";
import { useSelector } from "react-redux";

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
    { value: "Asset", label: "Asset", color: "bg-red-200 text-red-800" },
    {
      value: "Liability",
      label: "Liability",
      color: "bg-yellow-200 text-yellow-800",
    },
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
  const totalItems = filteredData.length;

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

  return (
    <div className="p-2 sm:p-3 md:p-4 lg:p-5 bg-gray-50 min-h-screen">
      {/* Header - rounded-full */}
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-black">
            Debts Management
          </h1>
          <p className="text-gray-600 text-xs hidden sm:block">
            Track and manage all customer debts
          </p>
        </div>
        <button
          onClick={() => setOpenAdd(true)}
          className="px-3 sm:px-4 py-2 sm:py-2.5 bg-green-300 hover:bg-green-400 text-black font-bold rounded-full shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm flex-shrink-0"
        >
          <span className="hidden sm:inline">+ Add New Debt</span>
          <span className="sm:hidden">+</span>
        </button>
      </div>

      {/* Stats Cards - rounded-full */}
      <div className="grid grid-cols-3 gap-2 mb-3 sm:mb-4">
        <div className="bg-white border border-gray-200 rounded-full p-2.5 sm:p-3 shadow-sm text-center">
          <p className="text-[10px] sm:text-xs text-gray-500 font-medium mb-0.5">
            Total
          </p>
          <p className="text-xs sm:text-sm md:text-base font-bold text-black truncate">
            {totalDebt.toLocaleString()}
          </p>
          <p className="text-[9px] text-gray-400">Tsh</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-full p-2.5 sm:p-3 shadow-sm text-center">
          <p className="text-[10px] sm:text-xs text-gray-500 font-medium mb-0.5">
            Pending
          </p>
          <p className="text-xs sm:text-sm md:text-base font-bold text-red-600 truncate">
            {totalRemaining.toLocaleString()}
          </p>
          <p className="text-[9px] text-gray-400">Tsh</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-full p-2.5 sm:p-3 shadow-sm text-center">
          <p className="text-[10px] sm:text-xs text-gray-500 font-medium mb-0.5">
            Paid
          </p>
          <p className="text-xs sm:text-sm md:text-base font-bold text-green-600 truncate">
            {totalPaid.toLocaleString()}
          </p>
          <p className="text-[9px] text-gray-400">Tsh</p>
        </div>
      </div>

      {/* Search Bar + Filter Toggle - rounded-full */}
      <div className="flex gap-2 mb-3 sm:mb-4">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-3 sm:left-4 flex items-center">
            <FiSearch className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search customer..."
            value={customerFilter}
            onChange={(e) => setCustomerFilter(e.target.value)}
            className="w-full pl-9 sm:pl-11 pr-8 py-2.5 sm:py-3 text-sm border border-gray-300 rounded-full bg-white text-black focus:border-green-300 focus:outline-none focus:ring-2 focus:ring-green-100"
          />
          {customerFilter && (
            <button
              onClick={() => setCustomerFilter("")}
              className="absolute inset-y-0 right-3 flex items-center text-gray-400"
            >
              <FiX className="w-4 h-4" />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`px-3 sm:px-4 py-2.5 rounded-full border font-bold text-sm flex items-center gap-1.5 flex-shrink-0 transition-all ${
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

      {/* Status Pills - rounded-full */}
      <div className="flex gap-2 mb-3 sm:mb-4 overflow-x-auto pb-1 scrollbar-hide">
        {paymentStatusOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => setPaymentStatusFilter(option.value)}
            className={`px-4 sm:px-5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all flex-shrink-0 ${
              paymentStatusFilter === option.value
                ? "bg-black text-white shadow-md"
                : "bg-white border border-gray-200 text-gray-600"
            }`}
          >
            {option.label}
            <span className="ml-1.5 opacity-70">
              {option.value === "all"
                ? filteredData.length
                : option.value === "not_paid"
                  ? pendingDebts
                  : paidDebts}
            </span>
          </button>
        ))}
      </div>

      {/* Expandable Filters Panel - rounded-full */}
      {showFilters && (
        <div className="bg-white rounded-full p-3 sm:p-4 shadow-lg border border-gray-100 mb-3 sm:mb-4 space-y-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-black">Advanced Filters</h3>
            <button
              onClick={() => setShowFilters(false)}
              className="text-gray-400"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
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
                          borderRadius: "10px",
                          fontSize: "13px",
                        },
                      },
                    },
                  }}
                />
              </LocalizationProvider>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
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
                          borderRadius: "10px",
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
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              Debt Status
            </label>
            <select
              value={debtStatusFilter}
              onChange={(e) => setDebtStatusFilter(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-full bg-white focus:border-green-300 focus:outline-none"
            >
              <option value="all">All Statuses</option>
              {uniqueDebtStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2 pt-2 border-t border-gray-100">
            <button
              onClick={clearFilters}
              className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-black font-bold rounded-full text-xs"
            >
              Clear All
            </button>
          </div>
        </div>
      )}

      {/* Active Filter Chips - rounded-full */}
      {activeFilterCount > 0 && !showFilters && (
        <div className="flex flex-wrap gap-1.5 mb-3 sm:mb-4">
          {debtStatusFilter !== "all" && (
            <span className="inline-flex items-center px-2.5 py-1 bg-red-100 text-red-800 text-[10px] font-medium rounded-full">
              {debtStatusFilter}
              <button
                onClick={() => setDebtStatusFilter("all")}
                className="ml-1"
              >
                <FiX className="w-3 h-3" />
              </button>
            </span>
          )}
          {paymentStatusFilter !== "not_paid" && (
            <span className="inline-flex items-center px-2.5 py-1 bg-green-100 text-green-800 text-[10px] font-medium rounded-full">
              {
                paymentStatusOptions.find(
                  (o) => o.value === paymentStatusFilter,
                )?.label
              }
              <button
                onClick={() => setPaymentStatusFilter("not_paid")}
                className="ml-1"
              >
                <FiX className="w-3 h-3" />
              </button>
            </span>
          )}
          {startDate && (
            <span className="inline-flex items-center px-2.5 py-1 bg-blue-100 text-blue-800 text-[10px] font-medium rounded-full">
              From {dayjs(startDate).format("DD/MM")}
              <button onClick={() => setStartDate(null)} className="ml-1">
                <FiX className="w-3 h-3" />
              </button>
            </span>
          )}
          {endDate && (
            <span className="inline-flex items-center px-2.5 py-1 bg-blue-100 text-blue-800 text-[10px] font-medium rounded-full">
              To {dayjs(endDate).format("DD/MM")}
              <button onClick={() => setEndDate(null)} className="ml-1">
                <FiX className="w-3 h-3" />
              </button>
            </span>
          )}
          {customerFilter && (
            <span className="inline-flex items-center px-2.5 py-1 bg-yellow-100 text-yellow-800 text-[10px] font-medium rounded-full">
              {customerFilter}
              <button onClick={() => setCustomerFilter("")} className="ml-1">
                <FiX className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}

      <Loading load={load} />

      {/* Results Count */}
      <div className="flex items-center justify-between mb-2 px-1">
        <p className="text-xs text-gray-500">
          <span className="font-bold text-black">{filteredData.length}</span>{" "}
          results
        </p>
        <p className="text-[10px] text-gray-400">
          Page {currentPage} of {totalPages || 1}
        </p>
      </div>

      {/* Mobile Card View - NO rounded-full, use rounded-xl */}
      <div className="md:hidden space-y-2 mb-4">
        {currentList.length === 0 ? (
          <div className="bg-white rounded-xl p-6 text-center border border-gray-200">
            <div className="text-3xl mb-2">📋</div>
            <p className="text-sm font-bold text-black">No debts found</p>
            <p className="text-xs text-gray-500">Try adjusting filters</p>
          </div>
        ) : (
          currentList.map((d, idx) => {
            const isEditing = editingStatusId === d._id;

            return (
              <div
                key={d._id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm"
              >
                {/* Card Header */}
                <div className="flex items-center justify-between p-3 bg-gray-50 border-b border-gray-100">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="inline-flex items-center justify-center w-7 h-7 bg-green-300 text-black font-bold rounded-full text-xs flex-shrink-0">
                      {(currentPage - 1) * itemsPerPage + idx + 1}
                    </span>
                    <span className="text-xs font-bold text-black truncate">
                      {d.customerName || "—"}
                    </span>
                  </div>
                  <span
                    className={`inline-block px-2.5 py-1 font-bold rounded-full text-[10px] flex-shrink-0 ${
                      d.remainingAmount > 0
                        ? "bg-red-100 text-red-700"
                        : "bg-green-300 text-green-900"
                    }`}
                  >
                    {d.remainingAmount > 0 ? "Pending" : "Paid"}
                  </span>
                </div>

                {/* Card Body */}
                <div className="p-3 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Date:</span>
                    <span className="font-bold text-black">
                      {d.createdAt
                        ? dayjs(d.createdAt).format("DD/MM/YY")
                        : "—"}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Phone:</span>
                    <span className="font-bold text-black">
                      {d.phone || "—"}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Total:</span>
                    <span className="font-bold text-black">
                      Tsh {(d.totalAmount || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Remaining:</span>
                    <span className="font-bold text-red-600">
                      Tsh {(d.remainingAmount || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs items-center">
                    <span className="text-gray-500">Status:</span>
                    {isEditing && canChangeDebtStatus ? (
                      <div className="flex items-center gap-1">
                        <select
                          value={tempStatus}
                          onChange={(e) => setTempStatus(e.target.value)}
                          className="px-2 py-1 text-xs border border-blue-300 rounded-full bg-white"
                          disabled={statusUpdating}
                        >
                          {debtStatusOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => handleStatusUpdate(d._id)}
                          disabled={statusUpdating}
                          className="p-1 bg-green-300 rounded-full"
                        >
                          <FiCheck className="w-3 h-3" />
                        </button>
                        <button
                          onClick={handleStatusCancel}
                          disabled={statusUpdating}
                          className="p-1 bg-gray-300 rounded-full"
                        >
                          <FiX className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          d.debtStatus === "Asset"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {d.debtStatus || "—"}
                      </span>
                    )}
                  </div>

                  {/* Pay Section */}
                  {d.remainingAmount > 0 && (
                    <div className="pt-2 border-t border-gray-100">
                      {canPayDebts ? (
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <span className="absolute left-3 top-2 text-[10px] text-gray-500 font-bold">
                              Tsh
                            </span>
                            <input
                              type="number"
                              value={deductions[d._id] || ""}
                              onChange={(e) =>
                                setDeductions({
                                  ...deductions,
                                  [d._id]: e.target.value,
                                })
                              }
                              className="w-full pl-10 pr-3 py-2 rounded-full border border-gray-300 text-sm focus:outline-none focus:border-green-300"
                              placeholder="0.00"
                            />
                          </div>
                          <button
                            onClick={() => handlePay(d)}
                            disabled={
                              !deductions[d._id] ||
                              parseFloat(deductions[d._id]) <= 0
                            }
                            className="px-4 py-2 bg-yellow-100 hover:bg-yellow-200 text-black font-bold rounded-full text-xs disabled:bg-gray-200 disabled:text-gray-500"
                          >
                            Pay
                          </button>
                        </div>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 bg-gray-200 text-gray-500 text-xs font-bold rounded-full">
                          Not Allowed
                        </span>
                      )}
                    </div>
                  )}
                  {d.remainingAmount <= 0 && (
                    <div className="pt-2 border-t border-gray-100 text-center">
                      <span className="inline-flex items-center px-3 py-1 bg-green-300 text-black text-xs font-bold rounded-full">
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

      {/* Desktop Table View - NO rounded-full, use rounded-xl */}
      <div className="hidden md:block rounded-xl shadow bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-200">
                {[
                  "SN",
                  "Date",
                  "Customer",
                  "Phone",
                  "Total",
                  "Remaining",
                  "Status",
                  "Change",
                  "Deduct",
                  "Action",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-3 py-3 text-center text-xs font-bold text-black uppercase border-r border-gray-300"
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
                  <td colSpan={10} className="text-center py-12">
                    <div className="space-y-3">
                      <div className="text-4xl">📋</div>
                      <p className="text-lg font-bold text-black">
                        No debts found
                      </p>
                      <p className="text-gray-600 text-sm">
                        Try adjusting your search filters
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                currentList.map((d, idx) => {
                  const isEditing = editingStatusId === d._id;

                  return (
                    <React.Fragment key={d._id}>
                      <tr className="hover:bg-gray-50 transition-colors shadow-md">
                        <td className="py-3 px-2 text-center border-r border-gray-300 bg-gray-200">
                          <span className="inline-flex items-center justify-center w-8 h-8 bg-green-300 text-black font-bold rounded-full text-xs shadow">
                            {(currentPage - 1) * itemsPerPage + idx + 1}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-center bg-gray-100 border-r border-gray-200">
                          <span className="font-bold text-black text-xs">
                            {d.createdAt
                              ? dayjs(d.createdAt).format("DD/MM/YYYY")
                              : "—"}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-center bg-green-200 border-r border-gray-200">
                          <span className="font-bold text-black text-xs">
                            {d.customerName || "—"}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-center bg-gray-200 border-r border-gray-200">
                          <span className="font-bold text-black text-xs">
                            {d.phone || "—"}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-center bg-yellow-100 border-r border-gray-200">
                          <span className="font-bold text-black text-xs">
                            Tsh {(d.totalAmount || 0).toLocaleString()}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-center bg-gray-100 border-r border-gray-200">
                          <span
                            className={`inline-block px-3 py-1 font-bold rounded-full text-xs ${
                              d.remainingAmount > 0
                                ? "bg-red-100 text-red-700"
                                : "bg-green-300 text-green-900"
                            }`}
                          >
                            Tsh {(d.remainingAmount || 0).toLocaleString()}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-center bg-gray-50 border-r border-gray-200">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${
                              d.debtStatus === "Asset"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {d.debtStatus || "—"}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-center bg-blue-50 border-r border-gray-200">
                          {isEditing && canChangeDebtStatus ? (
                            <div className="space-y-2">
                              <select
                                value={tempStatus}
                                onChange={(e) => setTempStatus(e.target.value)}
                                className="w-full px-2 py-1 text-xs border border-blue-300 rounded-full bg-white"
                                disabled={statusUpdating}
                              >
                                {debtStatusOptions.map((opt) => (
                                  <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                  </option>
                                ))}
                              </select>
                              <div className="flex justify-center gap-1">
                                <button
                                  onClick={() => handleStatusUpdate(d._id)}
                                  disabled={statusUpdating}
                                  className="p-1 bg-green-300 rounded-full"
                                >
                                  <FiCheck className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={handleStatusCancel}
                                  disabled={statusUpdating}
                                  className="p-1 bg-gray-300 rounded-full"
                                >
                                  <FiX className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleStatusEdit(d)}
                              className="px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-800 font-bold rounded-full text-xs flex items-center gap-1 transition-colors"
                              disabled={
                                editingStatusId !== null &&
                                editingStatusId !== d._id
                              }
                            >
                              <FiEdit className="w-3 h-3" /> Change
                            </button>
                          )}
                        </td>
                        <td className="py-3 px-2 text-center bg-green-200 border-r border-gray-200">
                          <div className="flex justify-center">
                            <div className="relative">
                              <span className="absolute left-3 top-2 text-[10px] text-gray-500 font-bold">
                                Tsh
                              </span>
                              <input
                                type="number"
                                value={deductions[d._id] || ""}
                                onChange={(e) =>
                                  setDeductions({
                                    ...deductions,
                                    [d._id]: e.target.value,
                                  })
                                }
                                className="w-32 pl-10 pr-3 py-2 rounded-full border border-gray-300 bg-white text-xs focus:outline-none focus:border-green-300"
                                placeholder="0.00"
                                disabled={isEditing}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-2 text-center bg-gray-100">
                          {d.remainingAmount > 0 ? (
                            canPayDebts ? (
                              <button
                                onClick={() => handlePay(d)}
                                disabled={
                                  !deductions[d._id] ||
                                  parseFloat(deductions[d._id]) <= 0 ||
                                  isEditing
                                }
                                className={`px-4 py-2 font-bold rounded-full text-xs transition-all ${
                                  deductions[d._id] &&
                                  parseFloat(deductions[d._id]) > 0 &&
                                  !isEditing
                                    ? "bg-yellow-100 hover:bg-yellow-200 text-black shadow"
                                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                }`}
                              >
                                Pay Now
                              </button>
                            ) : (
                              <span className="inline-flex items-center px-4 py-2 bg-gray-300 text-gray-600 font-bold rounded-full text-xs">
                                Not Allowed
                              </span>
                            )
                          ) : (
                            <span className="inline-flex items-center px-4 py-2 bg-green-300 text-black font-bold rounded-full text-xs shadow">
                              Fully Paid
                            </span>
                          )}
                        </td>
                      </tr>
                      <tr className="h-3">
                        <td colSpan={10} className="p-0"></td>
                      </tr>
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination - rounded-full */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-2 mt-3 sm:mt-4 p-3 bg-white rounded-full border border-gray-200 shadow-sm">
          <button
            onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
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
                  className={`w-8 h-8 text-xs font-bold rounded-full transition-colors ${currentPage === pageNum ? "bg-black text-white" : "text-gray-700 hover:bg-gray-100"}`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={() =>
              currentPage < totalPages && setCurrentPage(currentPage + 1)
            }
            disabled={currentPage === totalPages}
            className="p-2 bg-gray-100 hover:bg-gray-200 text-black rounded-full disabled:opacity-40"
          >
            <IoIosArrowForward className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Add Debt Modal */}
      {openAdd && (
        <AddDebt
          close={() => {
            setOpenAdd(false);
            fetchDebts();
          }}
        />
      )}
    </div>
  );
};

export default Debts;
