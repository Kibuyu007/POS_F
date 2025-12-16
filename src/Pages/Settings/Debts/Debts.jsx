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
  const [editingStatusId, setEditingStatusId] = useState(null);
  const [tempStatus, setTempStatus] = useState("");
  const [statusUpdating, setStatusUpdating] = useState(false);
  const itemsPerPage = 10;

  // Define available debt status options
  const debtStatusOptions = [
    { value: "Asset", label: "Asset", color: "bg-red-200 text-red-800" },
    {
      value: "Liability",
      label: "Liability",
      color: "bg-yellow-200 text-yellow-800",
    },
  ];

  useEffect(() => {
    fetchDebts();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [customerFilter, startDate, endDate, debtStatusFilter]);

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
        }
      );

      toast.success(res.data.message || "Status updated successfully");

      // Update local state
      setDebts((prevDebts) =>
        prevDebts.map((debt) =>
          debt._id === debtId ? { ...debt, debtStatus: tempStatus } : debt
        )
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

  // Check if user has add permission
  const canChangeDebtStatus = user?.roles?.canChangeDebtStatus === true;

  // Check if user has edit permission
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
    return matchStart && matchEnd && matchCustomer && matchDebtStatus;
  });

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

  // Get unique debt statuses for filter dropdown
  const uniqueDebtStatuses = [
    ...new Set(debts.map((d) => d.debtStatus).filter(Boolean)),
  ];

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const totalItems = filteredData.length;

  const currentList = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="p-5 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-black mb-2">
            Debts Management
          </h1>
          <p className="text-gray-600">
            Track and manage all customer debts in one place
          </p>
        </div>
        <button
          onClick={() => setOpenAdd(true)}
          className="mt-4 md:mt-0 px-6 py-3 bg-green-300 hover:bg-green-400 text-black font-bold rounded-full shadow-md hover:shadow-lg transition-all duration-200"
        >
          + Add New Debt
        </button>
      </div>

      {/* Stats Section - Horizontal Bar */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row items-center justify-between bg-white border border-gray-200 rounded-full p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4 sm:mb-0">
            <div className="text-center px-4">
              <p className="text-xs text-gray-500 font-medium">Total</p>
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
                Pending:{" "}
              </span>
              <span className="font-bold text-black">{pendingDebts}</span>
            </div>

            <div className="h-4 w-px bg-gray-300"></div>

            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-700">Paid: </span>
              <span className="font-bold text-black">{paidDebts}</span>
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
              Search Customer
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
                placeholder="Name or phone number..."
                value={customerFilter}
                onChange={(e) => setCustomerFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-full bg-white text-black focus:border-green-300 focus:outline-none focus:ring-1 focus:ring-green-200"
              />
            </div>
          </div>

          {/* Date Range */}
          <div className="flex-1">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Date Range
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

          {/* Debt Status Filter */}
          <div className="flex-1">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Debt Status
            </label>
            <select
              value={debtStatusFilter}
              onChange={(e) => setDebtStatusFilter(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-full bg-white text-black focus:border-green-300 focus:outline-none focus:ring-1 focus:ring-green-200"
            >
              <option value="all">All Statuses</option>
              {uniqueDebtStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          {/* Clear Button */}
          <div className="flex gap-3 lg:items-end">
            <button
              onClick={() => {
                setCustomerFilter("");
                setStartDate(null);
                setEndDate(null);
                setDebtStatusFilter("all");
              }}
              className="px-5 py-3 bg-gray-200 hover:bg-gray-300 text-black font-bold rounded-full transition-colors whitespace-nowrap"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Loading */}
      <Loading load={load} />

      {/* Table with Colored Columns */}
      <div className="overflow-x-auto rounded-xl">
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
                "Change Status",
                "Deduct",
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

          <tr className="h-3" />

          <tbody>
            {currentList.length === 0 ? (
              <tr>
                <td colSpan={10} className="text-center py-12">
                  <div className="space-y-3">
                    <div className="text-4xl">📋</div>
                    <p className="text-xl font-bold text-black">
                      No debts found
                    </p>
                    <p className="text-gray-600">
                      Try adjusting your search filters
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              currentList.map((d, idx) => (
                <>
                  <tr
                    key={d._id}
                    className="hover:bg-gray-50 transition-colors shadow-md"
                  >
                    {/* SN Column - Green 300 */}
                    <td className="py-4 px-3 text-center border-r border-gray-300 bg-gray-200">
                      <span className="inline-flex items-center justify-center w-10 h-10 bg-green-300 text-black font-bold rounded-full shadow">
                        {(currentPage - 1) * itemsPerPage + idx + 1}
                      </span>
                    </td>

                    {/* Date Column - Gray 200 */}
                    <td className="py-4 px-3 text-center bg-gray-100 border-r border-gray-200">
                      <span className="font-bold text-black">
                        {d.createdAt
                          ? dayjs(d.createdAt).format("DD/MM/YYYY")
                          : "—"}
                      </span>
                    </td>

                    {/* Customer Column - Green 200 */}
                    <td className="py-4 px-3 text-center bg-green-200 border-r border-gray-200">
                      <span className="font-bold text-black">
                        {d.customerName || "—"}
                      </span>
                    </td>

                    {/* Phone Column - Gray 200 */}
                    <td className="py-4 px-3 text-center bg-gray-200 border-r border-gray-200">
                      <span className="font-bold text-black">
                        {d.phone || "—"}
                      </span>
                    </td>

                    {/* Total Column - Yellow 100 */}
                    <td className="py-4 px-3 text-center bg-yellow-100 border-r border-gray-200">
                      <span className="font-bold text-black">
                        Tsh {(d.totalAmount || 0).toLocaleString()}
                      </span>
                    </td>

                    {/* Remaining Column - Gray 100 */}
                    <td className="py-4 px-3 text-center bg-gray-100 border-r border-gray-200">
                      <span
                        className={`inline-block px-4 py-2 font-bold rounded-full ${
                          d.remainingAmount > 0
                            ? "bg-red-100 text-red-700"
                            : "bg-green-300 text-green-900"
                        }`}
                      >
                        Tsh {(d.remainingAmount || 0).toLocaleString()}
                      </span>
                    </td>

                    {/* Status Column - Display only */}
                    <td className="py-4 px-3 text-center bg-gray-50 border-r border-gray-200">
                      <span
                        className={`px-4 py-2 rounded-full text-sm font-bold text-black
                        ${
                          d.debtStatus === "Asset"
                            ? "bg-yellow-100"
                            : d.debtStatus === "Liability"
                            ? "bg-red-200"
                            : "bg-gray-200"
                        }`}
                      >
                        {d.debtStatus}
                      </span>
                    </td>

                    {/* Change Status Column - Edit functionality */}
                    <td className="py-4 px-3 text-center bg-blue-50 border-r border-gray-200">
                      {editingStatusId === d._id   && canChangeDebtStatus ? (
                        <div className="space-y-2">
                          <select
                            value={tempStatus}
                            onChange={(e) => setTempStatus(e.target.value)}
                            className="w-full px-3 py-2 border border-blue-300 rounded-full bg-white text-black focus:outline-none focus:border-blue-400"
                            disabled={statusUpdating}
                          >
                            {debtStatusOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => handleStatusUpdate(d._id)}
                              disabled={statusUpdating}
                              className="px-3 py-1 bg-green-300 hover:bg-green-400 text-black font-bold rounded-full flex items-center gap-1 text-sm transition-colors disabled:opacity-50 min-w-[80px] justify-center"
                            >
                              {statusUpdating ? (
                                <svg
                                  className="animate-spin h-3 w-3 text-black"
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                >
                                  <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                  ></circle>
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                  ></path>
                                </svg>
                              ) : (
                                <FiCheck className="w-3 h-3" />
                              )}
                              Save
                            </button>
                            <button
                              onClick={handleStatusCancel}
                              disabled={statusUpdating}
                              className="px-3 py-1 bg-gray-300 hover:bg-gray-400 text-black font-bold rounded-full flex items-center gap-1 text-sm transition-colors min-w-[80px] justify-center"
                            >
                              <FiX className="w-3 h-3" />
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleStatusEdit(d)}
                          className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-800 font-bold rounded-full flex items-center gap-2 justify-center transition-colors"
                          disabled={
                            editingStatusId !== null &&
                            editingStatusId !== d._id
                          }
                        >
                          <FiEdit className="w-4 h-4" />
                          Change
                        </button>
                      )}
                    </td>

                    {/* Deduct Column - Green 200 */}
                    <td className="py-4 px-3 text-center bg-green-200 border-r border-gray-200">
                      <div className="flex justify-center">
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-gray-600 font-medium">
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
                            className="w-48 pl-12 pr-4 py-2.5 border border-gray-300 rounded-full bg-white text-black font-medium focus:border-green-300 focus:outline-none"
                            placeholder="0.00"
                            max={d.remainingAmount}
                            min="0"
                            disabled={editingStatusId === d._id}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Action Column - Gray 100 */}
                    <td className="py-4 px-3 text-center bg-gray-100">
                      {d.remainingAmount > 0 ? (
                        canPayDebts ? (
                          <button
                            onClick={() => handlePay(d)}
                            disabled={
                              !deductions[d._id] ||
                              parseFloat(deductions[d._id]) <= 0 ||
                              editingStatusId === d._id
                            }
                            className={`px-6 py-2.5 font-bold rounded-full transition-all ${
                              deductions[d._id] &&
                              parseFloat(deductions[d._id]) > 0 &&
                              editingStatusId !== d._id
                                ? "bg-yellow-100 hover:bg-yellow-200 text-black shadow hover:shadow-md"
                                : "bg-gray-300 text-gray-500 cursor-not-allowed"
                            }`}
                          >
                            Pay Now
                          </button>
                        ) : (
                          <span className="inline-flex items-center px-6 py-2.5 bg-gray-300 text-gray-600 font-bold rounded-full">
                            Not Allowed
                          </span>
                        )
                      ) : (
                        <span className="inline-flex items-center px-6 py-2.5 bg-green-300 text-black font-bold rounded-full shadow">
                          Fully Paid
                        </span>
                      )}
                    </td>
                  </tr>
                  {/* Spacing row between rows */}
                  <tr className="h-3">
                    <td colSpan={10} className="p-0"></td>
                  </tr>
                </>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t border-gray-300">
        <div className="text-sm text-gray-700">
          <span className="font-bold text-black">
            Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
            {Math.min(currentPage * itemsPerPage, totalItems)}
          </span>{" "}
          of <span className="font-bold text-black">{totalItems}</span> debts
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
