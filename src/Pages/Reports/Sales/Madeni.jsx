import axios from "axios";
import { useEffect, useState } from "react";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import Loading from "../../../Components/Shared/Loading";

//API
import BASE_URL from "../../../Utils/config"


const Madeni = () => {
  const [billedData, setBilledData] = useState([]);
  const [load, setLoad] = useState(false);
  const [deductions, setDeductions] = useState({});
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [customerFilter, setCustomerFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchBilledTransactions();
  }, []);

  const fetchBilledTransactions = async () => {
    setLoad(true);
    try {
      const res = await axios.get(
        `${BASE_URL}/api/transactions/bill`,
        { withCredentials: true }
      );
      if (res.data.success) {
        setBilledData(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching billed transactions:", error);
      alert("Failed to load billed transactions.");
    } finally {
      setLoad(false);
    }
  };

  const handleDeduct = async (id) => {
    const amount = parseFloat(deductions[id] || 0);
    if (!amount || amount <= 0) {
      alert("Enter valid amount");
      return;
    }
    try {
      const res = await axios.patch(
        `${BASE_URL}/api/transactions/payBill/${id}`,
        { paymentAmount: amount },
        { withCredentials: true }
      );
      if (res.data.success) {
        alert("Payment updated!");
        setDeductions((prev) => ({ ...prev, [id]: "" }));
        fetchBilledTransactions();
      }
    } catch (err) {
      console.error("Error deducting amount:", err);
      alert("Failed to update payment.");
    }
  };

  const filteredData = billedData.filter((txn) => {
    const txnDate = new Date(txn.createdAt);
    const matchesStart = startDate ? txnDate >= new Date(startDate) : true;
    const matchesEnd = endDate ? txnDate <= new Date(endDate) : true;
    const matchesCustomer = customerFilter
      ? txn.customerDetails?.name
          ?.toLowerCase()
          .includes(customerFilter.toLowerCase())
      : true;
    return matchesStart && matchesEnd && matchesCustomer;
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const totalItems = filteredData.length;
  const currentTransactions = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        Billed Transactions
      </h2>

      {/* Filters */}
      <div className="grid md:grid-cols-3 gap-4 mb-4">
        <input
          type="text"
          placeholder="Search by Customer"
          value={customerFilter}
          onChange={(e) => setCustomerFilter(e.target.value)}
          className="w-60 px-3 py-2 rounded-full border border-gray-400 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />

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
      </div>
      <Loading load={load} />
      <div className="overflow-x-auto  rounded-2xl mt-4">
        <table className="min-w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-200 text-center text-xs font-bold text-gray-900 uppercase tracking-wider">
                SN
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-200 text-center text-xs font-bold text-gray-900 uppercase tracking-wider">
                Date
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-200 text-center text-xs font-bold text-gray-900 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-200 text-center text-xs font-bold text-gray-900 uppercase tracking-wider">
                Phone
              </th>

              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-200 text-center text-xs font-bold text-gray-900 uppercase tracking-wider">
                Items
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-200 text-center text-xs font-bold text-gray-900 uppercase tracking-wider">
                Total
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-200 text-center text-xs font-bold text-gray-900 uppercase tracking-wider">
                Deduct
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-200 text-center text-xs font-bold text-gray-900 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tr className="h-4" />
          <tbody>
            {currentTransactions.map((sale, idx) => (
              <>
                <tr key={idx} className="text-center text-gray-800">
                  <td className="h-16 border-gray-00 shadow-md bg-gray-100 text-center">
                    <span className="bg-green-300 rounded-full px-3 py-2">
                      {(currentPage - 1) * itemsPerPage + idx + 1}
                    </span>
                  </td>
                  <td className="py-2 px-3 font-normal text-base border-x shadow-md bg-gray-200  hover:bg-gray-100  whitespace-nowrap overflow-hidden overflow-ellipsis max-w-[200px]">
                    <div className="items-center text-center">
                      <div className="ml-3">
                        {new Date(sale.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </td>
                  <td className="py-2 px-3 font-normal text-base border-x shadow-md bg-green-200  hover:bg-gray-100  whitespace-nowrap overflow-hidden overflow-ellipsis max-w-[200px]">
                    <div className="items-center text-center">
                      <div className="ml-3">
                        {sale.customerDetails?.name || "-"}
                      </div>
                    </div>
                  </td>
                  <td className="py-2 px-3 font-normal text-base border-x shadow-md bg-gray-100  hover:bg-gray-100  whitespace-nowrap overflow-hidden overflow-ellipsis max-w-[200px]">
                    <div className="items-center text-center">
                      <div className="ml-3">
                        {sale.customerDetails?.phone || "-"}
                      </div>
                    </div>
                  </td>

                  <td className="py-2 px-3 font-normal text-base border-x shadow-md bg-gray-200  hover:bg-gray-100  whitespace-nowrap overflow-hidden overflow-ellipsis max-w-[200px]">
                    <div className="items-center text-center">
                      <div className="flex flex-col gap-1">
                        {sale.items.map((i, iIdx) => (
                          <div
                            key={iIdx}
                            className="bg-gray-100 text-xs rounded-full px-2 py-1 shadow text-gray-700"
                          >
                            {i.item?.name} × {i.quantity}
                          </div>
                        ))}
                      </div>
                    </div>
                  </td>
                  <td className="py-2 px-3 font-normal text-base border-x shadow-md bg-yellow-100  hover:bg-gray-100  whitespace-nowrap overflow-hidden overflow-ellipsis max-w-[200px]">
                    <div className="items-center text-center">
                      <div className="ml-3">
                        Tsh{" "}
                        {(
                          sale.totalAmount - (sale.paidAmount || 0)
                        ).toLocaleString()}
                      </div>
                    </div>
                  </td>
                  <td className="py-2 px-3 font-normal text-base border-x shadow-md bg-gray-100  hover:bg-gray-100  whitespace-nowrap overflow-hidden overflow-ellipsis max-w-[200px]">
                    <div className="items-center text-center">
                      <div className="ml-3">
                        <input
                          type="number"
                          value={deductions[sale._id] || ""}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            if (val <= sale.totalAmount || !val) {
                              setDeductions({
                                ...deductions,
                                [sale._id]: e.target.value,
                              });
                            } else {
                              alert("Amount cannot exceed total.");
                            }
                          }}
                          className="w-28 px-3 py-2 rounded-full border border-gray-400 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          placeholder="Tsh"
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-2 px-3 font-normal text-base border-x shadow-md bg-gray-200  hover:bg-gray-100  whitespace-nowrap overflow-hidden overflow-ellipsis max-w-[200px]">
                    <div className="items-center text-center">
                      <div className="ml-3">
                        <button
                          onClick={() => handleDeduct(sale._id)}
                          className="bg-green-400 text-black px-6 py-2 rounded-full"
                        >
                          Pay
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
                <tr className="h-4" />
              </>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between border-t border-gray-200 bg-white py-3 mt-2">
        <p className="text-sm text-gray-700 px-2">
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
            onClick={prevPage}
            disabled={currentPage === 1}
            className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-gray-300 hover:bg-gray-50 ${
              currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <IoIosArrowBack className="size-5" />
          </button>

          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i + 1}
              onClick={() => setCurrentPage(i + 1)}
              className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ring-1 ring-gray-300 hover:bg-gray-50 ${
                currentPage === i + 1
                  ? "bg-green-500 text-white"
                  : "text-gray-900"
              }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            onClick={nextPage}
            disabled={currentPage === totalPages}
            className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-gray-300 hover:bg-gray-50 ${
              currentPage === totalPages ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <IoIosArrowForward className="size-5" />
          </button>
        </nav>
      </div>
    </div>
  );
};

export default Madeni;
