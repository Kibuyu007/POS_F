import { useEffect, useState } from "react";
import axios from "axios";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import BASE_URL from "../../../Utils/config";
import Wallet from "./Wallet";
import Loading from "../../../Components/Shared/Loading";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

const WalletList = () => {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [load, setLoad] = useState(false);
  const [filterName, setFilterName] = useState("");
  const [filterFrom, setFilterFrom] = useState(null);
  const [filterTo, setFilterTo] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchBills = async () => {
    setLoad(true);
    try {
      const res = await axios.get(`${BASE_URL}/api/transactions/walletBill`);
      setCustomers(Array.isArray(res.data.data) ? res.data.data : []);
    } catch (error) {
      console.error("Error fetching wallet bills:", error);
    } finally {
      setLoad(false);
    }
  };

  useEffect(() => {
    fetchBills();
  }, []);

  const openModal = (customer) => {
    setSelectedCustomer(customer);
    setModalOpen(true);
  };

  const closeModal = () => {
    setSelectedCustomer(null);
    setModalOpen(false);
    fetchBills();
  };

  const filteredCustomers = customers.filter((customer) => {
    // Filter by name
    const matchesName = customer.name
      .toLowerCase()
      .includes(filterName.toLowerCase());

    // Filter by date
    let matchesDate = true;
    const latestBill = customer.bills[0]; // assuming bills sorted descending
    if (latestBill && (filterFrom || filterTo)) {
      const billDate = dayjs(latestBill.createdAt);
      if (filterFrom)
        matchesDate = billDate.isAfter(filterFrom.subtract(1, "day"));
      if (matchesDate && filterTo)
        matchesDate = billDate.isBefore(filterTo.add(1, "day"));
    }

    return matchesName && matchesDate;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const endIdx = startIdx + itemsPerPage;
  const paginatedCustomers = filteredCustomers.slice(startIdx, endIdx);

  return (
    <div className="p-6 min-h-screen font-sans">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Wallet Transactions
        </h1>
      </div>

      <div className="grid md:grid-cols-4 gap-3 mb-4">
        {/* Customer Name Filter */}
        <input
          type="text"
          placeholder="Search Customer..."
          className="border-2 border-gray-300 text-black bg-gray-100 px-2 py-1 w-full rounded-full focus:outline-none focus:ring-1 focus:ring-green-500"
          value={filterName}
          onChange={(e) => setFilterName(e.target.value)}
        />

        {/* From Date */}
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="From Date"
            value={filterFrom}
            onChange={(newVal) => setFilterFrom(newVal)}
            slotProps={{
              textField: {
                size: "small",
                fullWidth: true,
                className:
                  "bg-gray-50 border border-gray-400 text-sm rounded-full focus:outline-none focus:ring-1 focus:ring-green-500",
              },
            }}
          />
        </LocalizationProvider>

        {/* To Date */}
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="To Date"
            value={filterTo}
            onChange={(newVal) => setFilterTo(newVal)}
            slotProps={{
              textField: {
                size: "small",
                fullWidth: true,
                className:
                  "bg-gray-50 border border-gray-400 text-sm rounded-full focus:outline-none focus:ring-1 focus:ring-green-500",
              },
            }}
          />
        </LocalizationProvider>
      </div>

      <Loading load={load} />

      {/* Table */}
      <div className=" border-gray-200 overflow-x-auto">
        {customers.length === 0 ? (
          <p className="text-gray-500 text-center py-6">
            No wallet records found.
          </p>
        ) : (
          <>
            <div className="overflow-x-auto rounded-lg mt-4">
              <table className="min-w-full text-left border-collapse text-black">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-4 py-2 text-left">
                      SN
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-left">
                      Customer
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-center">
                      Contacts
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-center">
                      Total Amount
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-center">
                      Last Bill Date
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-left">
                      Created By
                    </th>
                  </tr>
                </thead>

                <tr className="h-4" />

                <tbody className="divide-y divide-gray-200 font-bold">
                  {paginatedCustomers.map((customer, idx) => {
                    const totalAmount = customer.bills.reduce(
                      (sum, b) => sum + (b.totalAmount || 0),
                      0
                    );
                    const latestBill = customer.bills[0]; // assuming sorted desc

                    return (
                      <>
                        <tr
                          key={customer._id}
                          className={`cursor-pointer transition-colors h-16 shadow-md ${
                            idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                          } hover:bg-green-200`}
                          onClick={() => openModal(customer)}
                        >
                          <td className="pl-5 font-bold">
                            <p className="text-sm leading-none text-gray-600">
                              {idx + 1}
                            </p>
                          </td>
                          <td className="pl-5 bg-gray-200 text-gray-600">
                            {customer.name}
                          </td>
                          <td className="px-4 py-3 text-gray-600 text-center">
                            {customer.phone}
                          </td>
                          <td className="px-4 py-3 text-gray-900 bg-gray-200 text-center">
                            {totalAmount.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-gray-600 bg-gray-100 text-center">
                            {latestBill
                              ? new Date(
                                  latestBill.createdAt
                                ).toLocaleDateString()
                              : "—"}
                          </td>
                          <td className="px-4 py-3 text-gray-700">
                            {latestBill?.createdBy?.firstName}{" "}
                            {latestBill?.createdBy?.lastName || "--------"}
                          </td>
                        </tr>

                        <tr className="h-4" />
                      </>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-gray-200 bg-white py-3 mt-4">
          {/* Info */}
          <p className="text-sm text-gray-700">
            Showing <span className="font-medium">{startIdx + 1}</span> to{" "}
            <span className="font-medium">
              {Math.min(endIdx, customers.length)}
            </span>{" "}
            of <span className="font-medium">{customers.length}</span> items
          </p>

          {/* Pagination Buttons */}
          <nav className="flex items-center gap-1">
            {/* Prev */}
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`px-3 py-2 rounded-md border text-sm font-medium ${
                currentPage === 1
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              <IoIosArrowBack />
            </button>

            {/* Page Numbers */}
            {(() => {
              const maxPagesToShow = 7;
              const pageButtons = [];

              if (totalPages <= maxPagesToShow) {
                for (let i = 1; i <= totalPages; i++) {
                  pageButtons.push(i);
                }
              } else {
                pageButtons.push(1);

                let startPage, endPage;
                if (currentPage <= 4) {
                  startPage = 2;
                  endPage = 5;
                  for (let i = startPage; i <= endPage; i++) {
                    pageButtons.push(i);
                  }
                  pageButtons.push("ellipsis-right");
                  pageButtons.push(totalPages);
                } else if (currentPage >= totalPages - 3) {
                  pageButtons.push("ellipsis-left");
                  startPage = totalPages - 4;
                  for (let i = startPage; i < totalPages; i++) {
                    pageButtons.push(i);
                  }
                  pageButtons.push(totalPages);
                } else {
                  pageButtons.push("ellipsis-left");
                  startPage = currentPage - 1;
                  endPage = currentPage + 1;
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
                      className="px-3 py-2 text-gray-500 select-none"
                    >
                      ...
                    </span>
                  );
                }
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-2 rounded-md border text-sm font-medium ${
                      currentPage === page
                        ? "bg-green-500 text-white"
                        : "bg-white text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {page}
                  </button>
                );
              });
            })()}

            {/* Next */}
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className={`px-3 py-2 rounded-md border text-sm font-medium ${
                currentPage === totalPages
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              <IoIosArrowForward />
            </button>
          </nav>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-11/12 md:w-2/3 lg:w-1/2 p-6 relative max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-95 animate-fadeInUp mb-2">
            <button
              className="absolute top-4 right-4 bg-gray-300 py-1 px-3 rounded-full text-gray-500 hover:text-gray-800 text-2xl font-bold"
              onClick={closeModal}
            >
              ×
            </button>
            <h2 className="text-2xl font-bold mb-4 text-gray-900">
              {selectedCustomer.name}'s Wallet
            </h2>
            <Wallet selectedBill={selectedCustomer} onClick={closeModal} />
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletList;
