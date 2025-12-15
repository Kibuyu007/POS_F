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
import { FiDollarSign, FiFilter, FiUser, FiEdit2 } from "react-icons/fi";
import Loading from "../../../Components/Shared/Loading";
import BASE_URL from "../../../Utils/config";
import toast from "react-hot-toast";

const Expenses = () => {
  const [itemHold, setItemHold] = useState([]);
  const [loading, setLoading] = useState(false);

  // input states
  const [input, setInput] = useState({
    title: "",
    amount: "",
    details: "",
    date: null,
  });

  // edit modal states
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "",
    amount: "",
    details: "",
    date: null,
  });
  const [editLoading, setEditLoading] = useState(false);

  // filters
  const [filterCreatedBy, setFilterCreatedBy] = useState("");
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);

  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // fetch expenses
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

  // add expense
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
        { withCredentials: true }
      );
      toast.success("Expense added successfully!");
      getExpenses();
      setInput({ title: "", amount: "", details: "", date: null });
    } catch (error) {
      console.log("Error adding expense:", error);
       const message =
        error.response?.data?.message || error.message || "Failed to add expense";
      toast.error(message);
    }
  };

  // open edit modal
  const openEditModal = (expense) => {
    setEditingExpense(expense);
    setEditForm({
      title: expense.title,
      amount: expense.amount.toString(),
      details: expense.details || "",
      date: dayjs(expense.date),
    });
    setEditModalOpen(true);
  };

  // close edit modal
  const closeEditModal = () => {
    setEditModalOpen(false);
    setEditingExpense(null);
    setEditForm({
      title: "",
      amount: "",
      details: "",
      date: null,
    });
  };

  // update expense
  const updateExpense = async () => {
    if (!editForm.title || !editForm.amount || !editForm.date) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      setEditLoading(true);
      await axios.put(
        `${BASE_URL}/api/manunuzi/updateMatumizi/${editingExpense._id}`,
        {
          title: editForm.title,
          amount: Number(editForm.amount),
          details: editForm.details || "",
          date: editForm.date,
        },
        { withCredentials: true }
      );
      toast.success("Expense updated successfully!");
      getExpenses();
      closeEditModal();
    } catch (error) {
      console.log("Error updating expense:", error);
      const message =
        error.response?.data?.message || error.message || "Failed to update status";
      toast.error(message);
    } finally {
      setEditLoading(false);
    }
  };

  // generate unique creators for dropdown
  const uniqueCreators = [
    ...new Set(
      itemHold.map((i) =>
        i.createdBy
          ? `${i.createdBy.firstName} ${i.createdBy.lastName}`
          : "Unknown"
      )
    ),
  ].sort();

  // filtering
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

  // pagination
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  //Total of Expenses Amounts
  const totalAmount = filtered.reduce(
    (acc, exp) => acc + Number(exp.amount),
    0
  );

  // Calculate statistics
  const avgAmount = filtered.length > 0 ? totalAmount / filtered.length : 0;

  // Excel export
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
        }))
      );
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Expenses");
      XLSX.writeFile(
        workbook,
        `Expenses_Report_${dayjs().format("YYYYMMDD")}.xlsx`
      );
      toast.success("Excel report downloaded!");
    } catch (error) {
      toast.error("Failed to export Excel file");
    }
  };

  // PDF export
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
        head: [["Title", "Amount", "Details", "Date", "Created By", "Actions"]],
        body: filtered.map((e) => [
          e.title,
          e.amount.toLocaleString(),
          e.details || "-",
          dayjs(e.date).format("YYYY-MM-DD"),
          e.createdBy
            ? `${e.createdBy.firstName} ${e.createdBy.lastName}`
            : "-",
          "Edit/Delete",
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

  // Edit Expense Modal Component - UPDATED DESIGN
  const EditExpenseModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl">
        {/* Modal Header */}
        <div className="bg-green-300 px-8 py-6 border-b border-green-200 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-green-800">
              <span className="mr-3">✏️</span> Edit Expense
            </h2>
            <button
              onClick={closeEditModal}
              className="text-green-800 hover:text-green-900 text-2xl font-bold"
            >
              ×
            </button>
          </div>
          <p className="text-green-700 mt-2">
            Update expense information below
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Left Column */}
            <div className="space-y-6">
              <div>
                <label
                  className="block text-gray-700 font-medium mb-2"
                  htmlFor="editTitle"
                >
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="editTitle"
                  value={editForm.title}
                  onChange={(e) =>
                    setEditForm({ ...editForm, title: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-transparent transition duration-200 text-black"
                  placeholder="Enter expense title"
                />
              </div>

              <div>
                <label
                  className="block text-gray-700 font-medium mb-2"
                  htmlFor="editDetails"
                >
                  Details
                </label>
                <textarea
                  id="editDetails"
                  value={editForm.details}
                  onChange={(e) =>
                    setEditForm({ ...editForm, details: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-transparent transition duration-200 resize-none text-black"
                  placeholder="Additional details (optional)"
                  rows="4"
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <div>
                <label
                  className="block text-gray-700 font-medium mb-2"
                  htmlFor="editAmount"
                >
                  Amount <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">
                    Tsh
                  </span>
                  <input
                    type="number"
                    id="editAmount"
                    value={editForm.amount}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        amount: e.target.value,
                      })
                    }
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-transparent transition duration-200 text-black"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label
                  className="block text-gray-700 font-medium mb-2"
                  htmlFor="editDate"
                >
                  Date <span className="text-red-500">*</span>
                </label>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    value={editForm.date}
                    onChange={(newValue) =>
                      setEditForm({ ...editForm, date: newValue })
                    }
                    maxDate={dayjs()}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        sx: {
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "12px",
                            fontSize: "14px",
                            padding: "8px 14px",
                          },
                        },
                        className: "bg-white",
                      },
                    }}
                  />
                </LocalizationProvider>
              </div>

              {/* Current Data Preview */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Current Data
                </h4>
                <div className="space-y-2">
                  <p className="text-xs text-gray-600">
                    <span className="font-medium">Original Amount:</span> Tsh{" "}
                    {editingExpense?.amount?.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-600">
                    <span className="font-medium">Original Date:</span>{" "}
                    {dayjs(editingExpense?.date).format("DD/MM/YYYY")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Info Section */}
          <div className="bg-gray-50 p-6 rounded-xl mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Additional Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <FiUser className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Created By</p>
                  <p className="text-sm font-medium text-gray-800">
                    {editingExpense?.createdBy
                      ? `${editingExpense.createdBy.firstName} ${editingExpense.createdBy.lastName}`
                      : "Unknown"}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <FiDollarSign className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Original Amount</p>
                  <p className="text-sm font-medium text-gray-800">
                    Tsh {editingExpense?.amount?.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-gray-50 px-8 py-6 border-t border-gray-200 rounded-b-2xl">
          <div className="flex justify-between items-center">
            <div className="text-gray-600 text-sm">
              <span className="font-medium">Note:</span> Changes will be applied
              immediately
            </div>
            <div className="flex space-x-4">
              <button
                onClick={closeEditModal}
                className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition duration-200"
                disabled={editLoading}
              >
                Cancel
              </button>
              <button
                onClick={updateExpense}
                disabled={editLoading}
                className="px-6 py-3 bg-green-300 text-green-800 font-medium rounded-lg hover:bg-green-400 transition duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {editLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-green-800 border-t-transparent rounded-full animate-spin"></div>
                    Updating...
                  </>
                ) : (
                  <>
                    <FiEdit2 className="w-4 h-4" />
                    Update Expense
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-5 bg-gray-50 min-h-screen">
      {/* Edit Expense Modal */}
      {editModalOpen && <EditExpenseModal />}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-black mb-1">
            Expenses Management
          </h1>
          <p className="text-gray-600 text-sm">
            Track and manage all company expenses
          </p>
        </div>
        <button
          onClick={getExpenses}
          className="mt-3 md:mt-0 px-4 py-2 bg-green-300 hover:bg-green-400 text-black font-bold rounded-full shadow hover:shadow-md transition-all duration-200 flex items-center gap-2 text-sm"
        >
          <IoMdRefresh className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Compact Stats */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row items-center justify-between text-black bg-white border border-gray-200 rounded-full p-4 shadow-sm">
          <div className="flex items-center gap-3 mb-3 sm:mb-0">
            <div className="text-center px-3">
              <p className="text-xs text-gray-500 font-medium">
                Total Expenses
              </p>
              <p className="text-base font-bold text-black">
                Tsh {totalAmount.toLocaleString()}
              </p>
            </div>

            <div className="h-6 w-px bg-gray-300"></div>

            <div className="text-center px-3">
              <p className="text-xs text-gray-500 font-medium">Records</p>
              <p className="text-base font-bold text-black">
                {filtered.length}
              </p>
            </div>

            <div className="h-6 w-px bg-gray-300"></div>

            <div className="text-center px-3">
              <p className="text-xs text-gray-500 font-medium">Average</p>
              <p className="text-base font-bold text-green-600">
                Tsh {avgAmount.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-xs font-medium text-gray-700">Users: </span>
              <span className="font-bold text-black text-sm">
                {uniqueCreators.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Add New Expense - Compact */}
      <div className="mb-6 rounded-xl p-4 shadow bg-white">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-green-300 rounded-lg">
            <IoMdAdd className="w-4 h-4 text-black" />
          </div>
          <h3 className="text-lg font-bold text-black">Add New Expense</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              placeholder="Expense title..."
              value={input.title}
              onChange={(e) => setInput({ ...input, title: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-full bg-white text-black focus:border-green-300 focus:outline-none focus:ring-1 focus:ring-green-200"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Amount
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                Tsh
              </span>
              <input
                type="number"
                placeholder="0.00"
                value={input.amount}
                onChange={(e) => setInput({ ...input, amount: e.target.value })}
                className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-full bg-white text-black focus:border-green-300 focus:outline-none focus:ring-1 focus:ring-green-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Details
            </label>
            <input
              type="text"
              placeholder="Additional details..."
              value={input.details}
              onChange={(e) => setInput({ ...input, details: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-full bg-white text-black focus:border-green-300 focus:outline-none focus:ring-1 focus:ring-green-200"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Date
            </label>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                value={input.date}
                onChange={(newValue) => setInput({ ...input, date: newValue })}
                maxDate={dayjs()}
                slotProps={{
                  textField: {
                    size: "small",
                    fullWidth: true,
                    sx: {
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "9999px",
                        fontSize: "14px",
                      },
                    },
                    className: "bg-white text-sm",
                  },
                }}
              />
            </LocalizationProvider>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={addExpense}
            className="px-4 py-2 bg-green-300 hover:bg-green-400 text-black font-bold rounded-full shadow hover:shadow-md transition-all duration-200 flex items-center gap-2 text-sm"
          >
            <IoMdAdd className="w-4 h-4" />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* Report Section */}
      <div className="rounded-xl shadow bg-white overflow-hidden">
        {/* Report Header */}
        <div className="p-4 bg-green-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-black">Expenses Report</h3>
              <p className="text-gray-700 text-sm mt-1">
                Filter, analyze and export expense data
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={exportExcel}
                className="px-3 py-2 bg-yellow-100 hover:bg-yellow-200 text-black font-bold rounded-full shadow-sm hover:shadow transition-all duration-200 flex items-center gap-1 text-sm"
              >
                <IoMdDownload className="w-4 h-4" />
                <span>Excel</span>
              </button>
              <button
                onClick={exportPDF}
                className="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-black font-bold rounded-full shadow-sm hover:shadow transition-all duration-200 flex items-center gap-1 text-sm"
              >
                <IoMdDownload className="w-4 h-4" />
                <span>PDF</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="p-4 bg-white">
          <div className="flex items-center gap-2 mb-3">
            <FiFilter className="w-4 h-4 text-green-600" />
            <h4 className="text-sm font-bold text-black">Filters</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Created By
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center">
                  <FiUser className="w-4 h-4 text-gray-400" />
                </div>
                <select
                  value={filterCreatedBy}
                  onChange={(e) => setFilterCreatedBy(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-full bg-white text-black focus:border-green-300 focus:outline-none focus:ring-1 focus:ring-green-200 appearance-none"
                >
                  <option value="">All Users</option>
                  {uniqueCreators.map((user) => (
                    <option key={user} value={user}>
                      {user}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
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
                          borderRadius: "9999px",
                          fontSize: "14px",
                        },
                      },
                      className: "bg-white text-sm",
                    },
                  }}
                />
              </LocalizationProvider>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
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
                          borderRadius: "9999px",
                          fontSize: "14px",
                        },
                      },
                      className: "bg-white text-sm",
                    },
                  }}
                />
              </LocalizationProvider>
            </div>

            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="w-full px-3 py-2 bg-gray-200 hover:bg-gray-300 text-black font-bold rounded-full transition-colors text-sm"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="p-4 bg-white">
          <Loading load={loading} />

          {filtered.length === 0 ? (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-200 rounded-full mb-4">
                <FiDollarSign className="w-8 h-8 text-gray-500" />
              </div>
              <h3 className="text-lg font-bold text-black mb-2">
                No Expenses Found
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Try adjusting your filters or add new expenses
              </p>
            </div>
          ) : (
            <>
              {/* Table */}
              <div className="overflow-x-auto rounded-lg border border-gray-200">
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
                        "Actions",
                      ].map((header, idx) => (
                        <th
                          key={idx}
                          className="px-4 py-3 text-center text-xs font-bold text-black uppercase border-r border-gray-300"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tr className="h-3" />

                  <tbody>
                    {paginated.map((exp, idx) => (
                      <>
                        <tr
                          key={exp._id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          {/* SN Column */}
                          <td className="py-3 px-2 text-center border-r border-gray-300 bg-gray-200">
                            <span className="inline-flex items-center justify-center w-8 h-8 bg-green-300 text-black font-bold rounded-full text-xs">
                              {(currentPage - 1) * itemsPerPage + idx + 1}
                            </span>
                          </td>

                          {/* Title Column */}
                          <td className="py-3 px-2 text-center bg-gray-100 border-r border-gray-200">
                            <span className="font-bold text-black text-sm">
                              {exp.title}
                            </span>
                          </td>

                          {/* Amount Column */}
                          <td className="py-3 px-2 text-center bg-yellow-100 border-r border-gray-200">
                            <span className="font-bold text-green-700 text-sm">
                              Tsh {exp.amount.toLocaleString()}
                            </span>
                          </td>

                          {/* Details Column */}
                          <td className="py-3 px-2 text-center bg-gray-200 border-r border-gray-200">
                            <span className="font-bold text-black text-sm">
                              {exp.details || "-"}
                            </span>
                          </td>

                          {/* Date Column */}
                          <td className="py-3 px-2 text-center bg-green-200 border-r border-gray-200">
                            <span className="font-bold text-black text-sm">
                              {dayjs(exp.date).format("DD/MM/YYYY")}
                            </span>
                          </td>

                          {/* Created By Column */}
                          <td className="py-3 px-2 text-center bg-gray-100 border-r border-gray-200">
                            <span className="font-bold text-black text-sm">
                              {exp.createdBy
                                ? `${exp.createdBy.firstName} ${exp.createdBy.lastName}`
                                : "-"}
                            </span>
                          </td>

                          {/* Actions Column */}
                          <td className="py-3 px-2 text-center bg-gray-50">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => openEditModal(exp)}
                                className="p-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-full transition-colors"
                                title="Edit"
                              >
                                <FiEdit2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                        <tr className="h-3">
                          <td colSpan={7} className="p-0"></td>
                        </tr>
                      </>
                    ))}
                  </tbody>

                  {/* Total Row */}
                  <tfoot>
                    <tr className="bg-gray-200 border-t border-gray-300">
                      <td colSpan={2} className="py-3 px-4 text-right">
                        <span className="text-sm font-bold text-black">
                          Total:
                        </span>
                      </td>
                      <td className="py-3 px-2 text-center">
                        <div className="inline-flex items-center px-3 py-1 bg-green-300 rounded-full">
                          <span className="text-sm font-bold text-black">
                            Tsh {totalAmount.toLocaleString()}
                          </span>
                        </div>
                      </td>
                      <td colSpan={4}></td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Compact Pagination */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-6 pt-4 border-t border-gray-300">
                <div className="text-xs text-gray-700">
                  <span className="font-bold text-black">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                    {Math.min(currentPage * itemsPerPage, filtered.length)}
                  </span>{" "}
                  of{" "}
                  <span className="font-bold text-black">
                    {filtered.length}
                  </span>{" "}
                  expenses
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
                        (pageNum >= currentPage - 1 &&
                          pageNum <= currentPage + 1);

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
                      currentPage < totalPages &&
                      setCurrentPage(currentPage + 1)
                    }
                    disabled={currentPage === totalPages}
                    className="p-2 bg-gray-200 hover:bg-gray-300 text-black font-bold rounded-full disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <IoIosArrowForward className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Expenses;
