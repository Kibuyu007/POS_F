import { useState, useEffect } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import Loading from "../../../Components/Shared/Loading";

import BASE_URL from "../../../Utils/config";

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
    } catch (error) {
      console.log("Error fetching expenses:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getExpenses();
  }, []);

  // add expense
  const addExpense = async () => {
    if (!input.title || !input.amount || !input.date)
      return alert("Fill required fields");

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
      getExpenses();
      setInput({ title: "", amount: "", details: "", date: null });
    } catch (error) {
      console.log("Error adding expense:", error);
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

  // Excel export
  const exportExcel = () => {
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
    XLSX.writeFile(workbook, "Expenses_Report.xlsx");
  };

  // PDF export
  const exportPDF = () => {
    const pdf = new jsPDF();
    pdf.text("Expenses Report", 14, 15);
    autoTable(pdf, {
      head: [["Title", "Amount", "Details", "Date", "Created By"]],
      body: filtered.map((e) => [
        e.title,
        e.amount,
        e.details,
        dayjs(e.date).format("YYYY-MM-DD"),
        e.createdBy ? `${e.createdBy.firstName} ${e.createdBy.lastName}` : "",
      ]),
    });
    pdf.save("Expenses_Report.pdf");
  };

  return (
    <div className="p-5 text-black">
      {/* Title */}
      <h2 className="text-2xl font-bold text-gray-800">Expenses</h2>

      {/* Add Expense */}
      <div className="mt-5 p-6 bg-white shadow rounded-xl border">
        <h3 className="text-lg font-bold text-gray-700 mb-3">
          Add New Expense
        </h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Title / Name"
            value={input.title}
            onChange={(e) => setInput({ ...input, title: e.target.value })}
            className="border-2 border-gray-300 text-black bg-gray-100 px-2 py-1 w-full rounded-full focus:outline-none focus:ring-1 focus:ring-green-500"
          />
          <input
            type="number"
            placeholder="Amount"
            value={input.amount}
            onChange={(e) => setInput({ ...input, amount: e.target.value })}
            className="border-2 border-gray-300 text-black bg-gray-100 px-2 py-1 w-full rounded-full focus:outline-none focus:ring-1 focus:ring-green-500"
          />
          <input
            type="text"
            placeholder="Details"
            value={input.details}
            onChange={(e) => setInput({ ...input, details: e.target.value })}
            className="border-2 border-gray-300 text-black bg-gray-100 px-2 py-1 w-full rounded-full focus:outline-none focus:ring-1 focus:ring-green-500"
          />
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Date"
              value={input.date}
              onChange={(newValue) => setInput({ ...input, date: newValue })}
              maxDate={dayjs()}
              slotProps={{
                textField: {
                  size: "small",
                  fullWidth: true,
                  className: "bg-gray-50 border rounded-full",
                },
              }}
            />
          </LocalizationProvider>
        </div>
        <button
          onClick={addExpense}
          className="mt-5 px-6 py-2 bg-green-500 text-white rounded-full hover:bg-green-600"
        >
          Add Expense
        </button>
      </div>

      {/* Report Section */}
      <div className="mt-10 bg-white p-6 shadow rounded-xl border">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-700">Expenses Report</h3>
          <div className="flex gap-3">
            <button
              onClick={exportExcel}
              className="px-6 py-2 bg-green-200 text-green-900 rounded-full hover:bg-green-300"
            >
              Excel
            </button>
            <button
              onClick={exportPDF}
              className="px-6 py-2 bg-gray-300 text-gray-900 rounded-full hover:bg-gray-400"
            >
              PDF
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-5">
          <select
            value={filterCreatedBy}
            onChange={(e) => setFilterCreatedBy(e.target.value)}
            className="px-4 py-2 bg-gray-50 border rounded-full text-sm"
          >
            <option value="">Created By (All)</option>
            {uniqueCreators.map((user) => (
              <option key={user} value={user}>
                {user}
              </option>
            ))}
          </select>

          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="From Date"
              value={fromDate}
              onChange={(newValue) => setFromDate(newValue)}
              slotProps={{
                textField: {
                  size: "small",
                  fullWidth: true,
                  className: "bg-gray-50 border rounded-full",
                },
              }}
              maxDate={dayjs()}
            />
          </LocalizationProvider>

          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="To Date"
              value={toDate}
              onChange={(newValue) => setToDate(newValue)}
              slotProps={{
                textField: {
                  size: "small",
                  fullWidth: true,
                  className: "bg-gray-50 border rounded-full",
                },
              }}
              maxDate={dayjs()}
            />
          </LocalizationProvider>
        </div>

        <Loading load={loading} />

        {/* Table */}
        <div className="overflow-auto rounded-lg mt-4">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-gray-700 font-semibold">
              <tr>
                <th className="border border-gray-300 px-4 py-2 text-left">
                  SN
                </th>
                <th className="border border-gray-300 px-4 py-2 text-left">
                  Title
                </th>
                <th className="border border-gray-300 px-4 py-2 text-center">
                  Amount
                </th>
                <th className="border border-gray-300 px-4 py-2 text-left">
                  Details
                </th>
                <th className="border border-gray-300 px-4 py-2 text-left">
                  Date
                </th>
                <th className="border border-gray-300 px-4 py-2 text-left">
                  Created By
                </th>
              </tr>
            </thead>
            <tr className="h-3" />
            <tbody>
              {paginated.map((exp, idx) => (
                <>
                  <tr key={exp._id} className="border-t hover:bg-gray-50">
                    <td className="pl-5 font-bold bg-gray-100">
                      <p className="text-sm leading-none text-gray-600">
                        {(currentPage - 1) * itemsPerPage + idx + 1}
                      </p>
                    </td>
                    <td className="pl-5 font-bold bg-gray-200">
                      <p className="text-sm leading-none text-gray-600">
                        {exp.title}
                      </p>
                    </td>
                    <td className="p-3 font-semibold text-green-700">
                      <p className="text-sm leading-none text-green-700 text-center">
                        {exp.amount.toLocaleString()}
                      </p>
                    </td>
                    <td className="pl-5 font-bold bg-gray-200">
                      <p className="text-sm leading-none text-gray-600">
                        {exp.details}
                      </p>
                    </td>
                    <td className="pl-5 font-bold bg-gray-100">
                      <p>{dayjs(exp.date).format("YYYY-MM-DD")}</p>
                    </td>
                    <td className="pl-5 font-bold bg-gray-200">
                      <p className="text-sm leading-none text-gray-600">
                        {exp.createdBy
                          ? `${exp.createdBy.firstName} ${exp.createdBy.lastName}`
                          : "-"}
                      </p>
                    </td>
                  </tr>
                  <tr className="h-4" />
                </>
              ))}
            </tbody>

            <tfoot className="bg-gray-100 font-semibold text-gray-700">
              <tr>
                <td className="p-3" colSpan={2}>
                  Total
                </td>
                <td className="p-4  text-green-900 font-bold text-center bg-gradient-to-r from-yellow-100 via-yellow-50 to-yellow-100 rounded-xl shadow-lg">
                  {totalAmount.toLocaleString()}
                </td>
                <td className="p-3" colSpan={3}></td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t bg-white py-4 mt-2">
            <p className="text-sm text-gray-700">
              Showing{" "}
              <span className="font-medium">
                {(currentPage - 1) * itemsPerPage + 1}
              </span>{" "}
              to{" "}
              <span className="font-medium">
                {Math.min(currentPage * itemsPerPage, filtered.length)}
              </span>{" "}
              of <span className="font-medium">{filtered.length}</span> items
            </p>
            <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className={`inline-flex items-center px-2 py-2 ring-1 ring-gray-300 ${
                  currentPage === 1 ? "opacity-50" : "hover:bg-gray-100"
                }`}
              >
                <IoIosArrowBack className="size-5" />
              </button>

              {(() => {
                const maxPages = 10;
                const pages = [];

                if (totalPages <= maxPages) {
                  for (let i = 1; i <= totalPages; i++) pages.push(i);
                } else {
                  pages.push(1);
                  let start, end;

                  if (currentPage <= 6) {
                    start = 2;
                    end = 8;
                    for (let i = start; i <= end; i++) pages.push(i);
                    pages.push("...");
                    pages.push(totalPages);
                  } else if (currentPage >= totalPages - 5) {
                    pages.push("...");
                    start = totalPages - 7;
                    for (let i = start; i <= totalPages; i++) pages.push(i);
                  } else {
                    pages.push("...");
                    start = currentPage - 2;
                    end = currentPage + 2;
                    for (let i = start; i <= end; i++) pages.push(i);
                    pages.push("...");
                    pages.push(totalPages);
                  }
                }

                return pages.map((p, i) =>
                  p === "..." ? (
                    <span key={i} className="px-4 py-2">
                      ...
                    </span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p)}
                      className={`px-4 py-2 ring-1 ring-gray-300 ${
                        currentPage === p
                          ? "bg-green-500 text-white"
                          : "hover:bg-gray-100"
                      }`}
                    >
                      {p}
                    </button>
                  )
                );
              })()}

              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(p + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className={`inline-flex items-center px-2 py-2 ring-1 ring-gray-300 ${
                  currentPage === totalPages
                    ? "opacity-50"
                    : "hover:bg-gray-100"
                }`}
              >
                <IoIosArrowForward className="size-5" />
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
};

export default Expenses;
