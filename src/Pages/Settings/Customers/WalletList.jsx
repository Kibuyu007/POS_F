import { useEffect, useState } from "react";
import axios from "axios";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import BASE_URL from "../../../Utils/config";
import Wallet from "./Wallet";

const WalletList = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchBills = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/transactions/walletBill`);
        setCustomers(Array.isArray(res.data.data) ? res.data.data : []);
      } catch (error) {
        console.error("Error fetching wallet bills:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBills();
  }, []);

  const openModal = (customer) => {
    setSelectedCustomer(customer);
    setModalOpen(true);
  };

  const closeModal = () => {
    setSelectedCustomer(null);
    setModalOpen(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500 text-lg animate-pulse">
          Loading wallet list...
        </p>
      </div>
    );
  }

  // Pagination calculations
  const totalPages = Math.ceil(customers.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const endIdx = startIdx + itemsPerPage;
  const paginatedCustomers = customers.slice(startIdx, endIdx);

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Wallet Transactions
        </h1>
        <p className="text-gray-600 mt-1">
          Manage and review customer bills & balances
        </p>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-md p-4 border border-gray-200 overflow-x-auto">
        {customers.length === 0 ? (
          <p className="text-gray-500 text-center py-6">
            No wallet records found.
          </p>
        ) : (
          <>
            <table className="min-w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-3 text-gray-700 font-semibold">
                    Customer
                  </th>
                  <th className="px-4 py-3 text-gray-700 font-semibold">
                    Contacts
                  </th>
                  <th className="px-4 py-3 text-gray-700 font-semibold">
                    Total Amount
                  </th>
                  <th className="px-4 py-3 text-gray-700 font-semibold">
                    Last Bill Date
                  </th>
                  <th className="px-4 py-3 text-gray-700 font-semibold">
                    Created By
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedCustomers.map((customer, idx) => {
                  const totalAmount = customer.bills.reduce(
                    (sum, b) => sum + (b.totalAmount || 0),
                    0
                  );
                  const latestBill = customer.bills[0]; // assuming sorted desc

                  return (
                    <tr
                      key={customer._id}
                      className={`cursor-pointer transition-colors ${
                        idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                      } hover:bg-green-50`}
                      onClick={() => openModal(customer)}
                    >
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {customer.name}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {customer.phone}
                      </td>
                      <td className="px-4 py-3 text-gray-900 font-semibold">
                        {totalAmount.toLocaleString()} TSh
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {latestBill
                          ? new Date(latestBill.createdAt).toLocaleDateString()
                          : "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {latestBill?.createdBy?.firstName}{" "}
                        {latestBill?.createdBy?.lastName}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
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
          <div className="bg-white rounded-2xl shadow-xl w-11/12 md:w-2/3 lg:w-1/2 p-6 relative max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-95 animate-fadeInUp">
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl font-bold"
              onClick={closeModal}
            >
              ×
            </button>
            <Wallet selectedBill={selectedCustomer} />
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletList;
