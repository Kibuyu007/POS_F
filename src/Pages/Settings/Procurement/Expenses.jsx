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
  IoMdRefresh
} from "react-icons/io";
import { 
  FiDollarSign, 
  FiFilter,
  FiUser
} from "react-icons/fi";
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
      toast.error("Failed to add expense");
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
      XLSX.writeFile(workbook, `Expenses_Report_${dayjs().format('YYYYMMDD')}.xlsx`);
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
      pdf.text(`Generated on: ${dayjs().format('YYYY-MM-DD HH:mm')}`, 14, 22);
      pdf.text(`Total Expenses: ${totalAmount.toLocaleString()}`, 14, 29);
      
      autoTable(pdf, {
        startY: 35,
        head: [["Title", "Amount", "Details", "Date", "Created By"]],
        body: filtered.map((e) => [
          e.title,
          e.amount.toLocaleString(),
          e.details || "-",
          dayjs(e.date).format("YYYY-MM-DD"),
          e.createdBy ? `${e.createdBy.firstName} ${e.createdBy.lastName}` : "-",
        ]),
        headStyles: { fillColor: [34, 197, 94], textColor: 255 },
      });
      pdf.save(`Expenses_Report_${dayjs().format('YYYYMMDD')}.pdf`);
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

  return (
    <div className="p-5 bg-gray-50 min-h-screen">
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
        <div className="flex flex-col sm:flex-row items-center justify-between bg-white border border-gray-200 rounded-full p-4 shadow-sm">
          <div className="flex items-center gap-3 mb-3 sm:mb-0">
            <div className="text-center px-3">
              <p className="text-xs text-gray-500 font-medium">Total Expenses</p>
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
              <span className="text-xs font-medium text-gray-700">
                Users:{" "}
              </span>
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
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">Tsh</span>
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
                        fontSize: '14px'
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
                          fontSize: '14px'
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
                          fontSize: '14px'
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
              <h3 className="text-lg font-bold text-black mb-2">No Expenses Found</h3>
              <p className="text-gray-600 text-sm mb-4">Try adjusting your filters or add new expenses</p>
            </div>
          ) : (
            <>
              {/* Table */}
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gray-200">
                      {["SN", "Title", "Amount", "Details", "Date", "Created By"].map((header, idx) => (
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
                        <tr key={exp._id} className="hover:bg-gray-50 transition-colors">
                          {/* SN Column - Green 300 */}
                          <td className="py-3 px-2 text-center border-r border-gray-300 bg-gray-200">
                            <span className="inline-flex items-center justify-center w-8 h-8 bg-green-300 text-black font-bold rounded-full text-xs">
                              {(currentPage - 1) * itemsPerPage + idx + 1}
                            </span>
                          </td>

                          {/* Title Column - Gray 200 */}
                          <td className="py-3 px-2 text-center bg-gray-100 border-r border-gray-200">
                            <span className="font-bold text-black text-sm">
                              {exp.title}
                            </span>
                          </td>

                          {/* Amount Column - Yellow 100 */}
                          <td className="py-3 px-2 text-center bg-yellow-100 border-r border-gray-200">
                            <span className="font-bold text-green-700 text-sm">
                              Tsh {exp.amount.toLocaleString()}
                            </span>
                          </td>

                          {/* Details Column - Gray 200 */}
                          <td className="py-3 px-2 text-center bg-gray-200 border-r border-gray-200">
                            <span className="font-bold text-black text-sm">
                              {exp.details || "-"}
                            </span>
                          </td>

                          {/* Date Column - Green 200 */}
                          <td className="py-3 px-2 text-center bg-green-200 border-r border-gray-200">
                            <span className="font-bold text-black text-sm">
                              {dayjs(exp.date).format("DD/MM/YYYY")}
                            </span>
                          </td>

                          {/* Created By Column - Gray 100 */}
                          <td className="py-3 px-2 text-center bg-gray-100">
                            <span className="font-bold text-black text-sm">
                              {exp.createdBy
                                ? `${exp.createdBy.firstName} ${exp.createdBy.lastName}`
                                : "-"}
                            </span>
                          </td>
                        </tr>
                        <tr className="h-3">
                          <td colSpan={6} className="p-0"></td>
                        </tr>
                      </>
                    ))}
                  </tbody>

                  {/* Total Row */}
                  <tfoot>
                    <tr className="bg-gray-200 border-t border-gray-300">
                      <td colSpan={2} className="py-3 px-4 text-right">
                        <span className="text-sm font-bold text-black">Total:</span>
                      </td>
                      <td className="py-3 px-2 text-center">
                        <div className="inline-flex items-center px-3 py-1 bg-green-300 rounded-full">
                          <span className="text-sm font-bold text-black">
                            Tsh {totalAmount.toLocaleString()}
                          </span>
                        </div>
                      </td>
                      <td colSpan={3}></td>
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
                  of <span className="font-bold text-black">{filtered.length}</span> expenses
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
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
                        (pageNum === currentPage - 2 || pageNum === currentPage + 2) &&
                        totalPages > 5
                      ) {
                        return (
                          <span key={i} className="px-2 text-gray-500 font-bold text-xs">
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
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Expenses;