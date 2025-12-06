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

const Debts = () => {
  const [debts, setDebts] = useState([]);
  const [load, setLoad] = useState(false);
  const [deductions, setDeductions] = useState({});
  const [customerFilter, setCustomerFilter] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [openAdd, setOpenAdd] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchDebts();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [customerFilter, startDate, endDate]);

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
        "Failed to load transactions";

      toast.error(message);
    } finally {
      setLoad(false);
    }
  };

  const handlePay = async (debt) => {
    const id = debt._id;
    const amount = parseFloat(deductions[id] || 0);

    if (!amount || amount <= 0) return alert("Enter valid amount");
    if (amount > debt.remainingAmount)
      return alert("Amount exceeds remaining balance");

    try {
      const res = await axios.post(`${BASE_URL}/api/debts/payDebt/${id}`, {
        amount,
      });

      toast.success(res.data.message || "Payment updated");
      setDeductions((prev) => ({ ...prev, [id]: "" }));
      fetchDebts();
    } catch (err) {
      console.error("Error paying:", err);

      const message =
        err.response?.data?.message ||
        err.message ||
        "Failed to load transactions";

      toast.error(message);
    }
  };

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

    return matchStart && matchEnd && matchCustomer;
  });

  // Calculate stats
  const totalDebt = filteredData.reduce(
    (sum, d) => sum + (d.totalAmount || 0),
    0
  );
  const totalRemaining = filteredData.reduce(
    (sum, d) => sum + (d.remainingAmount || 0),
    0
  );
  const totalPaid = totalDebt - totalRemaining;
  const paidDebts = filteredData.filter((d) => d.remainingAmount <= 0).length;
  const pendingDebts = filteredData.filter((d) => d.remainingAmount > 0).length;

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const totalItems = filteredData.length;

  const currentList = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Debts</h2>
          <p className="text-gray-600 text-sm mt-1">
            Track and manage customer debts
          </p>
        </div>
        <button
          onClick={() => setOpenAdd(true)}
          className="bg-green-300 hover:bg-green-400 text-black font-medium px-5 py-2 rounded-full transition-colors"
        >
          Add Debt
        </button>
      </div>

      {/* Stats - Compact single line */}
      <div className="flex items-center gap-3 mb-4 text-sm">
        <div className="flex items-center gap-1">
          <span className="text-gray-500">Total:</span>
          <span className="font-medium">Tsh {totalDebt.toLocaleString()}</span>
        </div>
        <div className="h-3 w-px bg-gray-300"></div>
        <div className="flex items-center gap-1">
          <span className="text-gray-500">Pending:</span>
          <span className="font-medium text-red-600">
            Tsh {totalRemaining.toLocaleString()}
          </span>
        </div>
        <div className="h-3 w-px bg-gray-300"></div>
        <div className="flex items-center gap-1">
          <span className="text-gray-500">Paid:</span>
          <span className="font-medium text-green-600">
            Tsh {totalPaid.toLocaleString()}
          </span>
        </div>
        <div className="h-3 w-px bg-gray-300"></div>
        <div className="flex items-center gap-1">
          <span className="text-gray-500">Status:</span>
          <span className="text-red-600 text-xs">{pendingDebts} pending</span>
          <span className="text-gray-300 mx-0.5">•</span>
          <span className="text-green-600 text-xs">{paidDebts} paid</span>
        </div>
      </div>

      {/* Filters Section */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Search by Customer"
              value={customerFilter}
              onChange={(e) => setCustomerFilter(e.target.value)}
              className="px-4 py-2.5 rounded-full border border-gray-300 bg-white text-sm focus:border-green-500 focus:outline-none"
            />

            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="From Date"
                value={startDate}
                onChange={(v) => setStartDate(v)}
                slotProps={{
                  textField: {
                    size: "small",
                    fullWidth: true,
                    className:
                      "bg-white border border-gray-300 text-sm rounded-full",
                  },
                }}
              />
            </LocalizationProvider>

            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="To Date"
                value={endDate}
                onChange={(v) => setEndDate(v)}
                slotProps={{
                  textField: {
                    size: "small",
                    fullWidth: true,
                    className:
                      "bg-white border border-gray-300 text-sm rounded-full",
                  },
                }}
              />
            </LocalizationProvider>
          </div>

          <button
            onClick={() => {
              setCustomerFilter("");
              setStartDate(null);
              setEndDate(null);
            }}
            className="px-4 py-2.5 rounded-full border border-gray-300 text-gray-700 text-sm hover:bg-gray-50 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Loading */}
      <Loading load={load} />

      {/* Table - Original size */}
      <div className="overflow-x-auto rounded-lg mt-6">
        <table className="min-w-full">
          <thead className="bg-gray-100">
            <tr>
              {[
                "SN",
                "Date",
                "Customer",
                "Phone",
                "Total",
                "Remaining",
                "Deduct",
                "Action",
              ].map((h) => (
                <th
                  key={h}
                  className="px-5 py-3 bg-gray-200 text-center text-xs font-bold uppercase text-black"
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
                <td colSpan={8} className="text-center py-8 text-gray-500">
                  No debts found
                </td>
              </tr>
            ) : (
              currentList.map((d, idx) => (
                <>
                <tr
                  key={d._id}
                  className="text-center text-gray-800 hover:bg-gray-50 transition-colors"
                >
                  <td className="py-2 px-3 font-normal text-base border-x shadow-md bg-gray-100  hover:bg-gray-100  whitespace-nowrap overflow-hidden overflow-ellipsis max-w-[200px]">
                    <span className="bg-green-300 rounded-full px-3 py-1">
                      {(currentPage - 1) * itemsPerPage + idx + 1}
                    </span>
                  </td>

                  <td className="py-2 px-3 font-normal text-base border-x shadow-md bg-gray-200  hover:bg-gray-100  whitespace-nowrap overflow-hidden overflow-ellipsis max-w-[200px]">
                    <div className="items-center text-center">
                      <div className="ml-3">
                        {d.createdAt
                          ? dayjs(d.createdAt).format("DD/MM/YYYY")
                          : "N/A"}
                      </div>
                    </div>
                  </td>

                  <td className="py-2 px-3 font-normal text-base border-x shadow-md bg-green-200  hover:bg-gray-100  whitespace-nowrap overflow-hidden overflow-ellipsis max-w-[200px]">
                    <div className="items-center text-center">
                      <div className="ml-3">{d.customerName || "N/A"}</div>
                    </div>
                  </td>

                  <td className="py-2 px-3 font-normal text-base border-x shadow-md bg-gray-200  hover:bg-gray-100  whitespace-nowrap overflow-hidden overflow-ellipsis max-w-[200px]">
                    <div className="items-center text-center">
                      <div className="ml-3">{d.phone || "N/A"}</div>
                    </div>
                  </td>

                  <td className="py-2 px-3 font-normal text-base border-x shadow-md bg-yellow-100  hover:bg-gray-100  whitespace-nowrap overflow-hidden overflow-ellipsis max-w-[200px]">
                    <div className="items-center text-center">
                      <div className="ml-3">
                        Tsh {(d.totalAmount || 0).toLocaleString()}
                      </div>
                    </div>
                  </td>

                  <td className="py-2 px-3 font-normal text-base border-x shadow-md bg-gray-100  hover:bg-gray-100  whitespace-nowrap overflow-hidden overflow-ellipsis max-w-[200px]">
                    <div className="items-center text-center">
                      <div className="ml-3">
                        <span
                          className={`font-semibold bg-gray-300 px-5 py-1 rounded-full shadow-md ${
                            d.remainingAmount > 0
                              ? "text-red-500"
                              : "text-green-700"
                          }`}
                        >
                          Tsh {(d.remainingAmount || 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="py-2 px-3 font-normal text-base border-x shadow-md bg-green-200  hover:bg-gray-100  whitespace-nowrap overflow-hidden overflow-ellipsis max-w-[200px]">
                    <div className="items-center text-center">
                      <div className="ml-3">
                        <input
                          type="number"
                          value={deductions[d._id] || ""}
                          onChange={(e) =>
                            setDeductions({
                              ...deductions,
                              [d._id]: e.target.value,
                            })
                          }
                          className="w-32 px-3 py-2 rounded-full border border-gray-300 bg-white text-sm text-center focus:border-green-500 focus:outline-none"
                          placeholder="Tsh"
                          max={d.remainingAmount}
                          min="0"
                        />
                      </div>
                    </div>
                  </td>

                  <td className="py-2 px-3 font-normal text-base border-x shadow-md bg-gray-200  hover:bg-gray-100  whitespace-nowrap overflow-hidden overflow-ellipsis max-w-[200px]">
                    <div className="items-center text-center">
                      <div className="ml-3">
                        {d.status === "pending" && d.remainingAmount > 0 ? (
                          <button
                            onClick={() => handlePay(d)}
                            disabled={
                              !deductions[d._id] ||
                              parseFloat(deductions[d._id]) <= 0
                            }
                            className="bg-yellow-400 hover:bg-green-500 text-black px-6 py-2 rounded-full text-sm disabled:opacity-50 transition-colors"
                          >
                            Pay
                          </button>
                        ) : (
                          <span className="text-black font-medium bg-green-300 px-4 py-1 rounded-full shadow-md">
                            Paid
                            
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
                <tr className="h-4"/>
                </>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      {openAdd && (
        <AddDebt
          close={() => {
            setOpenAdd(false);
            fetchDebts();
          }}
        />
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between border-t py-4 mt-6">
        <p className="text-sm text-gray-700">
          Showing{" "}
          <span className="font-medium">
            {(currentPage - 1) * itemsPerPage + 1}
          </span>{" "}
          to{" "}
          <span className="font-medium">
            {Math.min(currentPage * itemsPerPage, totalItems)}
          </span>{" "}
          of <span className="font-medium">{totalItems}</span> items
        </p>

        <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm">
          <button
            onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-2 border border-gray-300 rounded-l-full disabled:opacity-50 hover:bg-gray-50"
          >
            <IoIosArrowBack className="size-5" />
          </button>

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
                  className={`px-4 py-2 border-y border-gray-300 ${
                    isCurrent
                      ? "bg-green-500 text-white font-medium"
                      : "text-gray-700 hover:bg-gray-50"
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
                <span key={i} className="px-3 py-2 text-gray-500">
                  ...
                </span>
              );
            }
            return null;
          })}

          <button
            onClick={() =>
              currentPage < totalPages && setCurrentPage(currentPage + 1)
            }
            disabled={currentPage === totalPages}
            className="px-3 py-2 border border-gray-300 rounded-r-full disabled:opacity-50 hover:bg-gray-50"
          >
            <IoIosArrowForward className="size-5" />
          </button>
        </nav>
      </div>
    </div>
  );
};

export default Debts;
