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
import { FiX } from "react-icons/fi";
import { FiDollarSign, FiEdit2, FiFilter, FiUser } from "react-icons/fi";
import Loading from "../../../Components/Shared/Loading";
import BASE_URL from "../../../Utils/config";
import toast from "react-hot-toast";
import EditExpense from "./EditExpense";
import { useSelector } from "react-redux";

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

  return (
    <div className="p-2 sm:p-3 md:p-4 lg:p-5 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-black">
            Expenses Management
          </h1>
          <p className="text-gray-600 text-xs hidden sm:block">
            Track and manage all company expenses
          </p>
        </div>
        <button
          onClick={getExpenses}
          className="px-3 py-2 bg-green-300 hover:bg-green-400 text-black font-bold rounded-full shadow text-xs flex items-center gap-1.5 flex-shrink-0"
        >
          <IoMdRefresh
            className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
          />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* Stats Cards - Green/Yellow/Gray Theme */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3 sm:mb-4">
        <div className="bg-white border border-gray-200 rounded-full p-2.5 sm:p-3 shadow-sm text-center">
          <p className="text-[10px] sm:text-xs text-gray-500 font-medium mb-0.5">
            Total Expenses
          </p>
          <p className="text-xs sm:text-sm md:text-base font-bold text-black truncate">
            {totalAmount.toLocaleString()}
          </p>
          <p className="text-[9px] text-gray-400">Tsh</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-full p-2.5 sm:p-3 shadow-sm text-center">
          <p className="text-[10px] sm:text-xs text-gray-500 font-medium mb-0.5">
            Records
          </p>
          <p className="text-xs sm:text-sm md:text-base font-bold text-black">
            {filtered.length}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-full p-2.5 sm:p-3 shadow-sm text-center col-span-2 sm:col-span-1">
          <p className="text-[10px] sm:text-xs text-gray-500 font-medium mb-0.5">
            Average
          </p>
          <p className="text-xs sm:text-sm md:text-base font-bold text-green-600 truncate">
            {avgAmount.toLocaleString()}
          </p>
          <p className="text-[9px] text-gray-400">Tsh</p>
        </div>
      </div>

      {/* Add New Expense - Green Theme */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-3 sm:mb-4 overflow-hidden">
        <div className="p-3 sm:p-4 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-300 rounded-lg flex items-center justify-center">
              <IoMdAdd className="text-black" size={18} />
            </div>
            <div>
              <h2 className="font-bold text-black text-sm sm:text-base">
                Add New Expense
              </h2>
              <p className="text-gray-500 text-xs">Fill required fields</p>
            </div>
          </div>
        </div>

        <div className="p-3 sm:p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Title
              </label>
              <input
                type="text"
                placeholder="Expense title..."
                value={input.title}
                onChange={(e) => setInput({ ...input, title: e.target.value })}
                className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg bg-white text-black focus:border-green-300 focus:outline-none focus:ring-2 focus:ring-green-100"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Amount
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs font-bold">
                  Tsh
                </span>
                <input
                  type="number"
                  placeholder="0.00"
                  value={input.amount}
                  onChange={(e) =>
                    setInput({ ...input, amount: e.target.value })
                  }
                  className="w-full pl-10 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg bg-white text-black focus:border-green-300 focus:outline-none focus:ring-2 focus:ring-green-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Details
              </label>
              <input
                type="text"
                placeholder="Additional details..."
                value={input.details}
                onChange={(e) =>
                  setInput({ ...input, details: e.target.value })
                }
                className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg bg-white text-black focus:border-green-300 focus:outline-none focus:ring-2 focus:ring-green-100"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Date
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
                          borderRadius: "0.5rem",
                          height: "42px",
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
              className="px-4 py-2.5 bg-green-300 hover:bg-green-400 text-black font-bold rounded-full shadow-sm transition-colors text-sm flex items-center gap-2"
            >
              <IoMdAdd size={18} />
              Add Expense
            </button>
          </div>
        </div>
      </div>

      {/* Search Bar + Filter Toggle + Export */}
      <div className="flex gap-2 mb-3 sm:mb-4">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-3 flex items-center">
            <FiUser className="w-3.5 h-3.5 text-gray-400" />
          </div>
          <select
            value={filterCreatedBy}
            onChange={(e) => setFilterCreatedBy(e.target.value)}
            className="w-full pl-9 pr-8 py-2.5 text-sm border border-gray-300 rounded-full bg-white text-black focus:border-green-300 focus:outline-none focus:ring-2 focus:ring-green-100 appearance-none"
          >
            <option value="">All Users</option>
            {uniqueCreators.map((user) => (
              <option key={user} value={user}>
                {user}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`px-3 sm:px-4 py-2.5 rounded-full border font-bold text-sm flex items-center gap-1.5 flex-shrink-0 transition-all ${
            showFilters || activeFilterCount > 0
              ? "bg-green-300 border-green-400 text-black"
              : "bg-white border-gray-300 text-gray-700"
          }`}
        >
          <FiFilter className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Filters</span>
          {activeFilterCount > 0 && (
            <span className="bg-black text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>
        <button
          onClick={exportExcel}
          className="px-3 py-2.5 bg-yellow-100 hover:bg-yellow-200 text-black font-bold rounded-full text-xs flex items-center gap-1.5 transition-colors flex-shrink-0"
        >
          <IoMdDownload className="w-4 h-4" />
          <span className="hidden sm:inline">Excel</span>
        </button>
        <button
          onClick={exportPDF}
          className="px-3 py-2.5 bg-green-300 hover:bg-green-400 text-black font-bold rounded-full text-xs flex items-center gap-1.5 transition-colors flex-shrink-0"
        >
          <IoMdDownload className="w-4 h-4" />
          <span className="hidden sm:inline">PDF</span>
        </button>
      </div>

      {/* Expandable Filters Panel */}
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
                  value={fromDate}
                  onChange={setFromDate}
                  maxDate={dayjs()}
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
                  value={toDate}
                  onChange={setToDate}
                  maxDate={dayjs()}
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

      {/* Active Filter Chips */}
      {activeFilterCount > 0 && !showFilters && (
        <div className="flex flex-wrap gap-1.5 mb-3 sm:mb-4">
          {filterCreatedBy && (
            <span className="inline-flex items-center px-2.5 py-1 bg-green-100 text-green-800 text-[10px] font-medium rounded-full">
              {filterCreatedBy}
              <button onClick={() => setFilterCreatedBy("")} className="ml-1">
                <FiX className="w-3 h-3" />
              </button>
            </span>
          )}
          {fromDate && (
            <span className="inline-flex items-center px-2.5 py-1 bg-blue-100 text-blue-800 text-[10px] font-medium rounded-full">
              From {dayjs(fromDate).format("DD/MM")}
              <button onClick={() => setFromDate(null)} className="ml-1">
                <FiX className="w-3 h-3" />
              </button>
            </span>
          )}
          {toDate && (
            <span className="inline-flex items-center px-2.5 py-1 bg-blue-100 text-blue-800 text-[10px] font-medium rounded-full">
              To {dayjs(toDate).format("DD/MM")}
              <button onClick={() => setToDate(null)} className="ml-1">
                <FiX className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}

      <Loading load={loading} />

      {/* Results Count */}
      <div className="flex items-center justify-between mb-2 px-1">
        <p className="text-xs text-gray-500">
          <span className="font-bold text-black">{filtered.length}</span>{" "}
          expenses
        </p>
        <p className="text-[10px] text-gray-400">
          Page {currentPage} of {totalPages || 1}
        </p>
      </div>

      {/* Mobile Card View - Green/Gray/Yellow Theme */}
      <div className="md:hidden space-y-2 mb-4">
        {loading ? (
          <div className="bg-white rounded-xl p-6 text-center border border-gray-200">
            <div className="animate-spin w-8 h-8 border-2 border-green-300 border-t-transparent rounded-full mx-auto mb-3" />
            <p className="text-sm text-gray-500">Loading...</p>
          </div>
        ) : paginated.length === 0 ? (
          <div className="bg-white rounded-xl p-6 text-center border border-gray-200">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <FiDollarSign className="text-gray-400" size={24} />
            </div>
            <p className="text-sm font-bold text-black">No expenses found</p>
            <p className="text-xs text-gray-500 mt-1">
              Try adjusting filters or add new expenses
            </p>
          </div>
        ) : (
          paginated.map((exp, idx) => (
            <div
              key={exp._id}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm"
            >
              <div className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-8 h-8 bg-green-300 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-black">
                      {(currentPage - 1) * itemsPerPage + idx + 1}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-black truncate">
                      {exp.title}
                    </p>
                    <p className="text-[10px] text-gray-500">
                      {dayjs(exp.date).format("DD/MM/YY")} •{" "}
                      {exp.createdBy
                        ? `${exp.createdBy.firstName} ${exp.createdBy.lastName}`
                        : "Unknown"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-sm font-bold text-black">
                    Tsh {exp.amount.toLocaleString()}
                  </span>
                  {canEditExpenses ? (
                    <button
                      onClick={() => openEditModal(exp)}
                      className="p-2 bg-gray-200 hover:bg-gray-300 text-black rounded-full transition-colors"
                    >
                      <FiEdit2 className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      className="p-2 bg-gray-100 text-gray-400 rounded-full cursor-not-allowed"
                      disabled
                    >
                      <FiEdit2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
              {exp.details && (
                <div className="px-3 pb-3">
                  <p className="text-xs text-gray-600 bg-gray-50 rounded-lg p-2">
                    {exp.details}
                  </p>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Desktop Table View - Colored Columns (Matching Suppliers/Debts Style) */}
      <div className="hidden md:block rounded-xl shadow bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-200">
                {[
                  "SN",
                  "Title",
                  "Amount",
                  "Details",
                  "Date",
                  "Created By",
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
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12">
                    <div className="space-y-3">
                      <div className="text-4xl">💰</div>
                      <p className="text-lg font-bold text-black">
                        No expenses found
                      </p>
                      <p className="text-gray-600 text-sm">
                        Try adjusting your filters or add new expenses
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginated.map((exp, idx) => (
                  <React.Fragment key={exp._id}>
                    <tr className="hover:bg-gray-50 transition-colors shadow-md">
                      <td className="py-3 px-2 text-center border-r border-gray-300 bg-gray-200">
                        <span className="inline-flex items-center justify-center w-8 h-8 bg-green-300 text-black font-bold rounded-full text-xs shadow">
                          {(currentPage - 1) * itemsPerPage + idx + 1}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-center bg-green-200 border-r border-gray-200">
                        <span className="font-bold text-black text-xs">
                          {exp.title}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-center bg-yellow-100 border-r border-gray-200">
                        <span className="font-bold text-black text-xs">
                          Tsh {exp.amount.toLocaleString()}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-center bg-gray-200 border-r border-gray-200">
                        <span className="font-bold text-black text-xs">
                          {exp.details || "—"}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-center bg-gray-100 border-r border-gray-200">
                        <span className="font-bold text-black text-xs">
                          {dayjs(exp.date).format("DD/MM/YYYY")}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-center bg-green-200 border-r border-gray-200">
                        <span className="font-bold text-black text-xs">
                          {exp.createdBy
                            ? `${exp.createdBy.firstName} ${exp.createdBy.lastName}`
                            : "—"}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-center bg-gray-100">
                        {canEditExpenses ? (
                          <button
                            onClick={() => openEditModal(exp)}
                            className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-black font-bold rounded-full text-xs flex items-center justify-center gap-1 transition-colors"
                          >
                            <FiEdit2 className="w-3 h-3" /> Edit
                          </button>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1.5 bg-gray-300 text-gray-600 font-bold rounded-full text-xs">
                            Not Allowed
                          </span>
                        )}
                      </td>
                    </tr>
                    <tr className="h-3">
                      <td colSpan={7} className="p-0"></td>
                    </tr>
                  </React.Fragment>
                ))
              )}
            </tbody>

            <tfoot>
              <tr className="bg-gradient-to-r from-yellow-50 to-yellow-100 text-sm font-semibold text-yellow-800 border-t border-yellow-200">
                <td></td>
                <td></td>
                <td
                  colSpan="3"
                  className="text-right p-3 pr-6 uppercase tracking-wider text-xs"
                >
                  Total Expenses:
                </td>
                <td className="p-3 text-right text-lg font-bold text-yellow-600">
                  Tsh {totalAmount.toLocaleString()}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-2 mt-3 sm:mt-4 p-3 bg-white rounded-full border border-gray-200 shadow-sm">
          <button
            onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 bg-gray-200 hover:bg-gray-300 text-black font-bold rounded-full disabled:opacity-40"
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
                  className={`w-8 h-8 text-xs font-bold rounded-full transition-colors ${
                    currentPage === pageNum
                      ? "bg-black text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
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
            className="p-2 bg-gray-200 hover:bg-gray-300 text-black font-bold rounded-full disabled:opacity-40"
          >
            <IoIosArrowForward className="w-4 h-4" />
          </button>
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
  );
};

export default Expenses;
