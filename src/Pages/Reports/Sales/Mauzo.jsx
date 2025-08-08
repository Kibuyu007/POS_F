import axios from "axios";
import { useEffect, useState } from "react";

import "react-datepicker/dist/react-datepicker.css";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { MdReceipt, MdPayment } from "react-icons/md";

import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers";

import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import Loading from "../../../Components/Shared/Loading";

//API
import BASE_URL from "../../../Utils/config";

const Mauzo = () => {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [totals, setTotals] = useState({ paid: 0, bill: 0 });
  const [statusFilter, setStatusFilter] = useState("All");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [load, setLoad] = useState(false);
  const [cashier, setCashier] = useState("");

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setLoad(true);
    try {
      const res = await axios.get(`${BASE_URL}/api/transactions/all`);
      if (res.data.success) {
        setTransactions(res.data.data);
        setFilteredTransactions(res.data.data);
        calculateTotals(res.data.data);
        setLoad(false);
      }
    } catch (err) {
      console.error("Failed to load transactions:", err);
    }
  };

  useEffect(() => {
    filterData();
  }, [statusFilter, startDate, endDate, cashier]);

  const filterData = () => {
    let filtered = [...transactions];

    if (statusFilter !== "All") {
      filtered = filtered.filter((txn) => txn.status === statusFilter);
    }

    if (startDate) {
      filtered = filtered.filter(
        (txn) => new Date(txn.createdAt) >= new Date(startDate)
      );
    }

    if (endDate) {
      filtered = filtered.filter(
        (txn) => new Date(txn.createdAt) <= new Date(endDate)
      );
    }

    if (cashier) {
      filtered = filtered.filter((txn) => txn.createdBy?._id === cashier);
    }

    setFilteredTransactions(filtered);
    calculateTotals(filtered);
    setCurrentPage(1);
  };

  const calculateTotals = (data) => {
    let paid = 0;
    let bill = 0;

    data.forEach((txn) => {
      if (txn.status === "Paid") {
        paid += txn.paidAmount || txn.totalAmount;
      } else if (txn.status === "Bill") {
        bill += txn.totalAmount;
        paid += txn.paidAmount || 0;
      }
    });

    setTotals({ paid, bill });
  };

  //Export Excel
  const exportToExcel = () => {
    const wsData = filteredTransactions.map((txn) => ({
      Date: new Date(txn.createdAt).toLocaleString(),
      Customer: txn.customerDetails.name,
      Phone: txn.customerDetails.phone,
      Status: txn.status,
      Items: txn.items.map((i) => `${i.item.name} x ${i.quantity}`).join(", "),
      TotalAmount: txn.totalAmount,
      PaidAmount: txn.paidAmount || 0,
    }));

    const ws = XLSX.utils.json_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Transactions");
    XLSX.writeFile(wb, "Transactions_Report.xlsx");
  };

  //Export Pdf
  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("Transactions Report", 14, 15);

    const tableData = filteredTransactions.map((txn) => [
      new Date(txn.createdAt).toLocaleString(),
      txn.customerDetails.name,
      txn.customerDetails.phone,
      txn.status,
      txn.items.map((i) => `${i.item.name} × ${i.quantity}`).join(", "),
      `${txn.totalAmount.toLocaleString()} Tsh`,
      `${(txn.paidAmount || txn.totalAmount).toLocaleString()} Tsh`,
    ]);

    doc.autoTable({
      head: [["Date", "Customer", "Phone", "Status", "Items", "Total", "Paid"]],
      body: tableData,
      startY: 25,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [22, 160, 133] },
    });

    doc.save("Transactions_Report.pdf");
  };

  // Pagination
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentTransactions = filteredTransactions.slice(
    indexOfFirst,
    indexOfLast
  );
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const alieUza = [
    ...new Map(
      transactions
        .filter((txn) => txn.createdBy && txn.createdBy._id)
        .map((txn) => [txn.createdBy._id, txn.createdBy])
    ).values(),
  ];

  //****************************************************************************************************** */

  return (
    <div className="p-6">
      <div className="px-4 py-4 md:py-7">
        <div className="flex items-center justify-between">
          <p className="text-lg md:text-xl lg:text-2xl font-bold text-gray-800">
            REPORT YA MAUZO
          </p>
        </div>
      </div>

      {/* Filters */}

      <div className="grid md:grid-cols-6 gap-2 mb-4 items-center">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border-2 border-gray-300 text-black bg-gray-100 px-2 py-1 w-full rounded-full focus:outline-none focus:ring-1 focus:ring-green-500"
        >
          <option value="All">All</option>
          <option value="Paid">Paid</option>
          <option value="Bill">Bill</option>
        </select>

        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="From Date"
            value={startDate}
            onChange={(newVal) => setStartDate(newVal)}
            slotProps={{
              textField: {
                size: "small",
                fullWidth: true,
                className:
                  "bg-gray-50 border border-gray-400 text-sm rounded-full dark:bg-gray-700 dark:border-gray-600 dark:text-white",
              },
            }}
          />
        </LocalizationProvider>

        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="To Date"
            value={endDate}
            onChange={(newVal) => setEndDate(newVal)}
            slotProps={{
              textField: {
                size: "small",
                fullWidth: true,
                className:
                  "bg-gray-50 border border-gray-400 text-sm rounded-full dark:bg-gray-700 dark:border-gray-600 dark:text-white",
              },
            }}
          />
        </LocalizationProvider>

        <select
          value={cashier}
          onChange={(e) => setCashier(e.target.value)}
          className="border border-gray-400 rounded-full text-sm px-4 py-2 w-full bg-white text-black"
        >
          <option value="">Cashiers</option>
          {alieUza.map((u, idx) => (
            <option key={idx} value={u._id}>
              {u.firstName} {u.lastName}
            </option>
          ))}
        </select>

        {/* Empty div to take the 4th column space if needed */}
        <div></div>

        <div className="flex justify-end gap-4">
          <button
            onClick={exportToExcel}
            className="px-4 py-2 bg-green-400 text-black rounded-full text-sm hover:bg-gray-300 w-40"
          >
            Export Excel
          </button>

          <button
            onClick={exportToPDF}
            className="px-4 py-2 bg-gray-400 text-black rounded-full text-sm hover:bg-green-100 w-40"
          >
            Export PDF
          </button>
        </div>
      </div>

      <Loading load={load} />

      {/* Table */}
      <div className="overflow-auto shadow-md rounded-lg mt-4">
        <table className="min-w-full text-sm text-left text-gray-700">
          <thead className="bg-gray-200 text-gray-800 font-bold text-xs uppercase tracking-wide">
            <tr>
              <th className="p-3">Date</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Phone</th>
              <th className="p-3">Items</th>
              <th className="p-3">Status</th>
              <th className="p-3">Total Amount</th>
              <th className="p-3">Cashier</th>
              <th className="p-3">Billing Cashier</th>
            </tr>
          </thead>
          <tr className="h-4" />
          <tbody>
            {currentTransactions.map((txn) => (
              <>
                <tr key={txn._id} className="border-t hover:bg-gray-50">
                  <td className="py-2 px-3 font-normal text-base border-x shadow-md bg-gray-200  hover:bg-gray-100  whitespace-nowrap overflow-hidden overflow-ellipsis max-w-[200px]">
                    <div className="items-center text-center">
                      <div className="ml-3">
                        {new Date(txn.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </td>
                  <td className="p-3">{txn.customerDetails.name}</td>
                  <td className="py-2 px-3 font-normal text-base border-x shadow-md bg-green-200  hover:bg-gray-100  whitespace-nowrap overflow-hidden overflow-ellipsis max-w-[200px]">
                    <div className="items-center text-center">
                      <div className="ml-3">{txn.customerDetails.phone}</div>
                    </div>
                  </td>

                  <td className="py-2 px-3 font-normal text-base border-x shadow-md bg-gray-200  hover:bg-gray-100  whitespace-nowrap overflow-hidden overflow-ellipsis max-w-[200px]">
                    <div className="items-center text-center">
                      <div className="ml-3">
                        <ul className="ml-2 space-y-1 item">
                          {txn.items.map((i) => (
                            <li
                              key={i.item._id}
                              className="flex items-center text-sm text-gray-700 bg-gray-100 py-1 px-1 rounded-full shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)] mt-2"
                            >
                              <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></span>
                              <span className="font-medium text-gray-800">
                                {i.item.name}
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

                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        txn.status === "Paid"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {txn.status}
                    </span>
                  </td>

                  <td className="py-2 px-3 font-normal text-base border-x shadow-md bg-green-200  hover:bg-gray-200  whitespace-nowrap overflow-hidden overflow-ellipsis max-w-[200px]">
                    <div className="flex flex-col space-y-2 max-w-xs bg-gradient-to-r from-yellow-100 via-yellow-50 to-yellow-100 rounded-xl p-4 shadow-lg">
                      {txn.status === "Bill" ? (
                        <>
                          <div className="flex items-center gap-2">
                            <MdReceipt className="text-yellow-500 text-md" />
                            <span className="text-yellow-700 font-semibold tracking-wide">
                              Bill:
                            </span>
                            <span className="ml-auto font-bold text-yellow-800 text-md">
                              {txn.totalAmount.toLocaleString()} Tsh
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MdPayment className="text-black text-md" />
                            <span className="text-green-700 font-semibold tracking-wide">
                              Paid:
                            </span>
                            <span className="ml-auto font-bold text-green-800 text-md">
                              {txn.paidAmount?.toLocaleString() || 0} Tsh
                            </span>
                          </div>
                        </>
                      ) : (
                        <div className="flex items-center gap-2 bg-green-100 rounded-full px-4 py-2 shadow-md">
                          <span className="text-green-700 font-semibold tracking-wide">
                            Paid:
                          </span>
                          <span className="ml-auto font-extrabold text-green-900 text-sm">
                            {(
                              txn.paidAmount || txn.totalAmount
                            ).toLocaleString()}{" "}
                            Tsh
                          </span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-1 px-2 font-normal text-sm border-x shadow-md bg-gray-100  hover:bg-gray-100  whitespace-nowrap overflow-hidden overflow-ellipsis max-w-[150px]">
                    <div className="items-center text-center">
                      <div className="ml-3">
                        {txn.createdBy
                          ? `${txn.createdBy.firstName} ${txn.createdBy.lastName} `
                          : ""}
                      </div>
                    </div>
                  </td>
                  <td className="py-1 px-2 font-normal text-sm border-x shadow-md bg-gray-100  hover:bg-gray-100  whitespace-nowrap overflow-hidden overflow-ellipsis max-w-[150px]">
                    <div className="items-center text-center">
                      <div className="ml-3">
                        {txn.lastModifiedBy
                          ? `${txn.lastModifiedBy.firstName} ${txn.lastModifiedBy.lastName} `
                          : ""}
                      </div>
                    </div>
                  </td>
                </tr>
                <tr className="h-4" />
              </>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gradient-to-r from-green-50 to-green-100 text-sm font-semibold text-green-800 border-t border-green-200">
              <td></td>
              <td></td>
              <td
                colSpan="5"
                className="text-right p-3 pr-6 uppercase tracking-wider"
              >
                Total Paid:
              </td>
              <td className="p-3 text-right text-lg font-bold text-green-600">
                {totals.paid.toLocaleString()} Tsh
              </td>
            </tr>
            <tr className="bg-gradient-to-r from-yellow-50 to-yellow-100 text-sm font-semibold text-yellow-800 border-t border-yellow-200">
              <td></td>
              <td></td>
              <td
                colSpan="5"
                className="text-right p-3 pr-6 uppercase tracking-wider"
              >
                Total Billed:
              </td>
              <td className="p-3 text-right text-lg font-bold text-yellow-600">
                {totals.bill.toLocaleString()} Tsh
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Pagenation */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 bg-white py-3 mt-2">
          <p className="text-sm text-gray-700">
            Showing{" "}
            <span className="font-medium">
              {(currentPage - 1) * itemsPerPage + 1}
            </span>{" "}
            to{" "}
            <span className="font-medium">
              {Math.min(
                currentPage * itemsPerPage,
                filteredTransactions.length
              )}
            </span>{" "}
            of <span className="font-medium">{transactions.length}</span> items
          </p>

          <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm">
            {/* Prev Button */}
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-gray-300 hover:bg-gray-50 ${
                currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <IoIosArrowBack className="size-5" />
            </button>

            {/* Page Buttons with Ellipsis */}
            {(() => {
              const maxPagesToShow = 10;
              const pageButtons = [];

              // If total pages <= maxPagesToShow, show all pages
              if (totalPages <= maxPagesToShow) {
                for (let i = 1; i <= totalPages; i++) {
                  pageButtons.push(i);
                }
              } else {
                // Show first page
                pageButtons.push(1);

                let startPage, endPage;
                // Calculate start and end page for the sliding window
                if (currentPage <= 6) {
                  startPage = 2;
                  endPage = 8;
                  // Show pages 2 to 8, then ...
                  for (let i = startPage; i <= endPage; i++) {
                    pageButtons.push(i);
                  }
                  pageButtons.push("ellipsis-right");
                  pageButtons.push(totalPages);
                } else if (currentPage >= totalPages - 5) {
                  // Show first page, ellipsis, pages near the end
                  pageButtons.push("ellipsis-left");
                  startPage = totalPages - 7;
                  for (let i = startPage; i < totalPages; i++) {
                    pageButtons.push(i);
                  }
                  pageButtons.push(totalPages);
                } else {
                  // Middle: first page, ellipsis, 5 pages around current, ellipsis, last page
                  pageButtons.push("ellipsis-left");
                  startPage = currentPage - 2;
                  endPage = currentPage + 2;
                  for (let i = startPage; i <= endPage; i++) {
                    pageButtons.push(i);
                  }
                  pageButtons.push("ellipsis-right");
                  pageButtons.push(totalPages);
                }
              }

              return pageButtons.map((page, idx) => {
                if (page === "ellipsis-left" || page === "ellipsis-right") {
                  return (
                    <span
                      key={"ellipsis-" + idx}
                      className="relative inline-flex items-center px-4 py-2 text-sm text-gray-700 select-none"
                    >
                      ...
                    </span>
                  );
                }
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ring-1 ring-gray-300 hover:bg-gray-50 ${
                      currentPage === page
                        ? "bg-green-500 text-white"
                        : "text-gray-900"
                    }`}
                  >
                    {page}
                  </button>
                );
              });
            })()}

            {/* Next Button */}
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-gray-300 hover:bg-gray-50 ${
                currentPage === totalPages
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
            >
              <IoIosArrowForward className="size-5" />
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

export default Mauzo;
