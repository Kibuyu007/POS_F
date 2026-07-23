import React from "react";
import { useState, useEffect } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import {
  IoIosArrowBack,
  IoIosArrowForward,
  IoMdAdd,
  IoMdDownload,
  IoMdRefresh,
} from "react-icons/io";
import { FiX, FiEdit2, FiFilter, FiUser } from "react-icons/fi";
import Loading from "../../../Components/Shared/Loading";
import BASE_URL from "../../../Utils/config";
import toast from "react-hot-toast";
import EditExpense from "./EditExpense";
import { useSelector } from "react-redux";
import {
  Search,
  X,
  Package,
  Clock,
  CheckCircle,
  User,
  Calendar,
  DollarSign,
  Edit,
  Download,
} from "lucide-react";

const Expenses = () => {
  const user = useSelector((state) => state.user.user);
  const canEditExpenses = user?.roles?.canEditExpenses === true;

  const [itemHold, setItemHold] = useState([]);
  const [loading, setLoading] = useState(false);

  const [input, setInput] = useState({
    title: "",
    amount: "",
    details: "",
    date: null,
  });

  const [filterCreatedBy, setFilterCreatedBy] = useState("");
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const itemsPerPage = 10;

  const getExpenses = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/api/manunuzi/matumiziYote`);
      setItemHold(res.data);
      toast.success("Expenses loaded successfully!");
    } catch (error) {
      console.log("Error fetching expenses:", error);
      toast.error("Failed to load expenses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getExpenses();
  }, []);

  const addExpense = async () => {
    if (!input.title || !input.amount || !input.date) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      await axios.post(
        `${BASE_URL}/api/manunuzi/matumizi`,
        {
          title: input.title,
          amount: Number(input.amount),
          details: input.details || "",
          date: input.date,
        },
        { withCredentials: true },
      );
      toast.success("Expense added successfully!");
      getExpenses();
      setInput({ title: "", amount: "", details: "", date: null });
    } catch (error) {
      console.log("Error adding expense:", error);
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to add expense";
      toast.error(message);
    }
  };

  const uniqueCreators = [
    ...new Set(
      itemHold.map((i) =>
        i.createdBy
          ? `${i.createdBy.firstName} ${i.createdBy.lastName}`
          : "Unknown",
      ),
    ),
  ].sort();

  const openEditModal = (expense) => {
    if (!canEditExpenses) {
      toast.error("You don't have permission to edit expenses");
      return;
    }
    setEditingExpense(expense);
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setEditingExpense(null);
  };

  const handleUpdateSuccess = () => {
    getExpenses();
  };

  const filtered = itemHold.filter((exp) => {
    const creatorFullName = exp.createdBy
      ? `${exp.createdBy.firstName} ${exp.createdBy.lastName}`
      : "Unknown";

    const matchByName =
      filterCreatedBy === "" || filterCreatedBy === creatorFullName;

    const matchFromDate = fromDate
      ? dayjs(exp.date).isAfter(fromDate.subtract(1, "day"))
      : true;
    const matchToDate = toDate
      ? dayjs(exp.date).isBefore(toDate.add(1, "day"))
      : true;

    return matchByName && matchFromDate && matchToDate;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const totalAmount = filtered.reduce(
    (acc, exp) => acc + Number(exp.amount),
    0,
  );

  const avgAmount = filtered.length > 0 ? totalAmount / filtered.length : 0;

  const exportExcel = () => {
    try {
      const worksheet = XLSX.utils.json_to_sheet(
        filtered.map((e) => ({
          Title: e.title,
          Amount: e.amount,
          Details: e.details,
          Date: dayjs(e.date).format("YYYY-MM-DD"),
          "Created By": e.createdBy
            ? `${e.createdBy.firstName} ${e.createdBy.lastName}`
            : "-",
        })),
      );
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Expenses");
      XLSX.writeFile(
        workbook,
        `Expenses_Report_${dayjs().format("YYYYMMDD")}.xlsx`,
      );
      toast.success("Excel report downloaded!");
    } catch (error) {
      toast.error("Failed to export Excel file");
    }
  };

  const exportPDF = () => {
    try {
      const pdf = new jsPDF();
      pdf.setFontSize(16);
      pdf.text("Expenses Report", 14, 15);
      pdf.setFontSize(10);
      pdf.text(`Generated on: ${dayjs().format("YYYY-MM-DD HH:mm")}`, 14, 22);
      pdf.text(`Total Expenses: ${totalAmount.toLocaleString()}`, 14, 29);

      autoTable(pdf, {
        startY: 35,
        head: [["Title", "Amount", "Details", "Date", "Created By"]],
        body: filtered.map((e) => [
          e.title,
          e.amount.toLocaleString(),
          e.details || "-",
          dayjs(e.date).format("YYYY-MM-DD"),
          e.createdBy
            ? `${e.createdBy.firstName} ${e.createdBy.lastName}`
            : "-",
        ]),
        headStyles: { fillColor: [34, 197, 94], textColor: 255 },
      });
      pdf.save(`Expenses_Report_${dayjs().format("YYYYMMDD")}.pdf`);
      toast.success("PDF report downloaded!");
    } catch (error) {
      toast.error("Failed to export PDF file");
    }
  };

  const clearFilters = () => {
    setFilterCreatedBy("");
    setFromDate(null);
    setToDate(null);
    setCurrentPage(1);
    toast.success("Filters cleared!");
  };

  const activeFilterCount = [filterCreatedBy, fromDate, toDate].filter(
    Boolean,
  ).length;

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
    {
      label: "Total Expenses",
      value: formatCurrency(totalAmount),
      icon: Package,
    },
    { label: "Records", value: filtered.length, icon: Clock },
    { label: "Average", value: formatCurrency(avgAmount), icon: CheckCircle },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-8xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200 border-2 border-emerald-300">
              <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800 tracking-tight">
                Expenses
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 hidden xs:block">
                Track and manage all company expenses
              </p>
            </div>
          </div>
          <button
            onClick={getExpenses}
            className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-100 font-semibold rounded-xl transition-all duration-200 shadow-sm text-xs sm:text-sm"
          >
            <IoMdRefresh
              className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${loading ? "animate-spin" : ""}`}
            />
            <span className="hidden xs:inline">Refresh</span>
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

        {/* Add New Expense */}
        <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-sm mb-4 sm:mb-6 overflow-hidden">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b-2 border-gray-200 bg-gray-50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-xl shadow-md shadow-emerald-200">
                <IoMdAdd className="text-white" size={18} />
              </div>
              <div>
                <h2 className="font-bold text-gray-800 text-sm sm:text-base">
                  Add New Expense
                </h2>
                <p className="text-gray-500 text-xs">
                  Fill in the details below
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Expense title..."
                  value={input.title}
                  onChange={(e) =>
                    setInput({ ...input, title: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 text-sm border-2 border-gray-300 rounded-xl bg-white text-black focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-transparent transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Amount <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs font-bold">
                    TSh
                  </span>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={input.amount}
                    onChange={(e) =>
                      setInput({ ...input, amount: e.target.value })
                    }
                    className="w-full pl-12 pr-3.5 py-2.5 text-sm border-2 border-gray-300 rounded-xl bg-white text-black focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Details
                </label>
                <input
                  type="text"
                  placeholder="Additional details..."
                  value={input.details}
                  onChange={(e) =>
                    setInput({ ...input, details: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 text-sm border-2 border-gray-300 rounded-xl bg-white text-black focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-transparent transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Date <span className="text-red-500">*</span>
                </label>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    value={input.date}
                    onChange={(newValue) =>
                      setInput({ ...input, date: newValue })
                    }
                    maxDate={dayjs()}
                    slotProps={{
                      textField: {
                        size: "small",
                        fullWidth: true,
                        sx: {
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "12px",
                            fontSize: "14px",
                          },
                        },
                      },
                    }}
                  />
                </LocalizationProvider>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={addExpense}
                className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg hover:shadow-emerald-200 hover:scale-[1.02] active:scale-95 transition-all duration-300 text-sm flex items-center gap-2 border-2 border-emerald-400"
              >
                <IoMdAdd size={18} />
                Add Expense
              </button>
            </div>
          </div>
        </div>

        {/* Search + Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-5">
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-56 md:w-64">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-black/50 w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <select
                value={filterCreatedBy}
                onChange={(e) => setFilterCreatedBy(e.target.value)}
                className="w-full pl-8 sm:pl-9 pr-8 py-2 sm:py-2.5 bg-white border-2 border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1 transition-all duration-200 text-black text-xs sm:text-sm appearance-none"
              >
                <option value="">All Users</option>
                {uniqueCreators.map((user) => (
                  <option key={user} value={user}>
                    {user}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg
                  className="w-3.5 h-3.5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl font-semibold text-xs sm:text-sm transition-all duration-200 border-2 ${
                showFilters || activeFilterCount > 0
                  ? "bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-200"
                  : "bg-white border-gray-300 text-gray-600 hover:bg-gray-100 hover:border-gray-400"
              }`}
            >
              <FiFilter className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Filters</span>
              {activeFilterCount > 0 && (
                <span className="bg-white text-emerald-600 text-[10px] sm:text-xs w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center font-bold">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={exportExcel}
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-100 font-semibold rounded-xl transition-all duration-200 text-xs sm:text-sm"
            >
              <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Excel</span>
            </button>
            <button
              onClick={exportPDF}
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl transition-all duration-200 shadow-sm text-xs sm:text-sm border-2 border-emerald-400"
            >
              <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">PDF</span>
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
                    value={fromDate}
                    onChange={setFromDate}
                    maxDate={dayjs()}
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
                    value={toDate}
                    onChange={setToDate}
                    maxDate={dayjs()}
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
            {filterCreatedBy && (
              <span className="inline-flex items-center gap-0.5 sm:gap-1 px-2 sm:px-3 py-0.5 sm:py-1 bg-emerald-100 text-emerald-700 text-[10px] sm:text-xs font-medium rounded-full border border-emerald-200">
                {filterCreatedBy}
                <button
                  onClick={() => setFilterCreatedBy("")}
                  className="hover:text-emerald-900"
                >
                  <X className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                </button>
              </span>
            )}
            {fromDate && (
              <span className="inline-flex items-center gap-0.5 sm:gap-1 px-2 sm:px-3 py-0.5 sm:py-1 bg-blue-100 text-blue-700 text-[10px] sm:text-xs font-medium rounded-full border border-blue-200">
                From {dayjs(fromDate).format("DD/MM/YY")}
                <button
                  onClick={() => setFromDate(null)}
                  className="hover:text-blue-900"
                >
                  <X className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                </button>
              </span>
            )}
            {toDate && (
              <span className="inline-flex items-center gap-0.5 sm:gap-1 px-2 sm:px-3 py-0.5 sm:py-1 bg-blue-100 text-blue-700 text-[10px] sm:text-xs font-medium rounded-full border border-blue-200">
                To {dayjs(toDate).format("DD/MM/YY")}
                <button
                  onClick={() => setToDate(null)}
                  className="hover:text-blue-900"
                >
                  <X className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                </button>
              </span>
            )}
          </div>
        )}

        <Loading load={loading} />

        {/* Results Count */}
        <div className="flex items-center justify-between mb-2 sm:mb-3 px-1">
          <p className="text-[10px] sm:text-sm text-gray-500">
            <span className="font-semibold text-gray-700">
              {filtered.length}
            </span>{" "}
            expenses found
          </p>
          <p className="text-[10px] sm:text-sm text-gray-400">
            Page {currentPage} of {totalPages || 1}
          </p>
        </div>

        {/* Card List - Normal size, well arranged */}
        <div className="space-y-2.5 sm:space-y-3">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 sm:py-16 bg-gray-100 rounded-2xl border-2 border-gray-300 shadow-sm">
              <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-emerald-300 border-t-emerald-500 rounded-full animate-spin" />
              <p className="text-xs sm:text-sm text-gray-500 mt-3 sm:mt-4">
                Loading expenses...
              </p>
            </div>
          ) : paginated.length === 0 ? (
            <div className="bg-gray-100 rounded-2xl border-2 border-gray-300 shadow-sm py-12 sm:py-16 text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 border-2 border-gray-300">
                <DollarSign className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
              </div>
              <p className="text-sm sm:text-base text-gray-700 font-medium">
                No expenses found
              </p>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Try adjusting your filters
              </p>
            </div>
          ) : (
            paginated.map((exp, idx) => (
              <div
                key={exp._id}
                className="bg-gray-200 rounded-xl border-2 border-gray-300 shadow-sm p-4 sm:p-5 hover:shadow-md hover:border-emerald-300 transition-all duration-300"
              >
                {/* Row 1: Expense Info */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-emerald-200 flex items-center justify-center flex-shrink-0 border-2 border-emerald-300">
                      <DollarSign className="w-5 h-5 text-emerald-700" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm sm:text-base font-semibold text-gray-800 truncate max-w-[120px] xs:max-w-[180px] sm:max-w-[250px]">
                          {exp.title}
                        </span>
                        <span className="text-[9px] sm:text-[10px] text-gray-600 bg-white px-2 py-0.5 rounded border border-gray-300 flex-shrink-0">
                          #{idx + 1}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-3 text-[10px] sm:text-xs text-gray-500 mt-0.5 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                          {formatDate(exp.date)}
                        </span>
                        <span className="w-0.5 h-0.5 bg-gray-400 rounded-full" />
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                          {exp.createdBy
                            ? `${exp.createdBy.firstName} ${exp.createdBy.lastName}`
                            : "Unknown"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                    <div className="text-right">
                      <div className="text-sm sm:text-base font-bold text-gray-800">
                        {formatCurrency(exp.amount)}
                      </div>
                    </div>
                    {canEditExpenses ? (
                      <button
                        onClick={() => openEditModal(exp)}
                        className="p-2 sm:p-2.5 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-100 transition-all duration-200 shadow-sm"
                        title="Edit Expense"
                      >
                        <Edit className="w-4 h-4 text-gray-600" />
                      </button>
                    ) : (
                      <span className="px-2 py-1 bg-gray-200 text-gray-400 text-[9px] sm:text-[10px] font-semibold rounded border border-gray-300">
                        No Access
                      </span>
                    )}
                  </div>
                </div>

                {/* Row 2: Details (if available) */}
                {exp.details && (
                  <div className="mt-3 pt-3 border-t-2 border-gray-300">
                    <p className="text-xs sm:text-sm text-gray-600">
                      <span className="font-medium text-gray-500">
                        Details:
                      </span>{" "}
                      {exp.details}
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {filtered.length > 0 && (
          <div className="mt-3 sm:mt-4 bg-white px-3 sm:px-5 py-2.5 sm:py-4 rounded-xl border-2 border-gray-200 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-3">
            <span className="text-[9px] sm:text-xs text-gray-500 text-center sm:text-left">
              Showing{" "}
              <span className="font-semibold text-gray-700">
                {(currentPage - 1) * itemsPerPage + 1}
              </span>{" "}
              to{" "}
              <span className="font-semibold text-gray-700">
                {Math.min(currentPage * itemsPerPage, filtered.length)}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-gray-700">
                {filtered.length}
              </span>{" "}
              expenses
            </span>
            {renderPagination(currentPage, totalPages, setCurrentPage)}
          </div>
        )}

        {/* Edit Modal */}
        {editModalOpen && canEditExpenses && (
          <EditExpense
            expense={editingExpense}
            onClose={closeEditModal}
            onSuccess={handleUpdateSuccess}
          />
        )}
      </div>
    </div>
  );
};

export default Expenses;
