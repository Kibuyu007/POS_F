import { useState, useEffect } from "react";

// Redux
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllCustomers,
  customerStatusUpdate,
} from "../../../Redux/customerSlice";

// Modals
import AddCustomer from "./AddCustomer";
import EditCustomer from "./EditCustomer";
import Loading from "../../../Components/Shared/Loading";

// Icons
import {
  FaSearch,
  FaUserEdit,
  FaBuilding,
  FaPhone,
  FaMapMarkerAlt,
  FaEnvelope,
  FaInfoCircle,
} from "react-icons/fa";
import { BsToggleOff, BsToggleOn } from "react-icons/bs";
import {
  IoIosArrowBack,
  IoIosArrowForward,
  IoMdRefresh,
  IoMdAdd,
} from "react-icons/io";

import axios from "axios";
import BASE_URL from "../../../Utils/config";

const CustomerManagement = () => {
  const dispatch = useDispatch();
  const { allCustomers = [], error } = useSelector((state) => state.customers);

  const [showModalAdd, setShowModalAdd] = useState(false);
  const [showModalEdit, setShowModalEdit] = useState(false);
  const [modifiedUser, setModifiedUser] = useState(null);
  const [filterStatus, setFilterStatus] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [load, setLoad] = useState(false);

  const usersPerPage = 10;

  const fetchData = () => {
    setLoad(true);
    dispatch(fetchAllCustomers());
    setLoad(false);
  };

  useEffect(() => {
    fetchData();
  }, [dispatch]);

  // Filter customers based on status and search
  const filteredCustomers = allCustomers.filter(
    (c) =>
      (filterStatus === "All" || c.status === filterStatus) &&
      (c.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.company?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Pagination calculations
  const totalItems = filteredCustomers.length;
  const totalPages = Math.ceil(totalItems / usersPerPage);
  const currentCustomers = filteredCustomers.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  );

  const nextPage = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));

  const toggleStatus = async (customerId, currentStatus) => {
    const newStatus = currentStatus === "Active" ? "Inactive" : "Active";
    try {
      const res = await axios.put(
        `${BASE_URL}/api/customers/status/${customerId}`,
        { status: newStatus }
      );

      if (res.status === 200) {
        dispatch(customerStatusUpdate({ customerId, newStatus }));
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  // Calculate stats
  const totalCustomers = allCustomers.length;
  const activeCustomers = allCustomers.filter(
    (c) => c.status === "Active"
  ).length;
  const inactiveCustomers = allCustomers.filter(
    (c) => c.status === "Inactive"
  ).length;

  const clearSearch = () => {
    setSearchQuery("");
    setCurrentPage(1);
  };

  return (
    <div className="p-5 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-black mb-1">
            Customer Management
          </h1>
          <p className="text-gray-600 text-sm">
            Manage and organize customer information
          </p>
        </div>
        <button
          onClick={fetchData}
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
              <p className="text-xs text-gray-500 font-medium">
                Total Customers
              </p>
              <p className="text-base font-bold text-black">{totalCustomers}</p>
            </div>

            <div className="h-6 w-px bg-gray-300"></div>

            <div className="text-center px-3">
              <p className="text-xs text-gray-500 font-medium">Active</p>
              <p className="text-base font-bold text-green-600">
                {activeCustomers}
              </p>
            </div>

            <div className="h-6 w-px bg-gray-300"></div>

            <div className="text-center px-3">
              <p className="text-xs text-gray-500 font-medium">Inactive</p>
              <p className="text-base font-bold text-red-600">
                {inactiveCustomers}
              </p>
            </div>

            <div className="h-6 w-px bg-gray-300"></div>

            <div className="text-center px-3">
              <p className="text-xs text-gray-500 font-medium">Filtered</p>
              <p className="text-base font-bold text-black">
                {filteredCustomers.length}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowModalAdd(true)}
              className="px-4 py-2 bg-green-300 hover:bg-green-400 text-black font-bold rounded-full shadow hover:shadow-md transition-all duration-200 flex items-center gap-2 text-sm"
            >
              <IoMdAdd className="w-4 h-4" />
              <span>Add Customer</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter & Search - Compact & Clean */}
      <div className="mb-6 rounded-xl p-4 shadow bg-white">
        <div className="flex items-center gap-3 mb-4">
          <FaSearch className="w-4 h-4 text-green-600" />
          <h3 className="text-sm font-bold text-black">
            Search & Filter Customers
          </h3>
        </div>

        <div className="flex flex-col md:flex-row gap-3">
          {/* Status Filters */}
          <div className="flex flex-wrap gap-2">
            {["All", "Active", "Inactive"].map((status) => (
              <button
                key={status}
                className={`px-4 py-2 text-sm font-bold rounded-full transition-colors ${
                  filterStatus === status
                    ? "bg-green-300 text-black shadow"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
                onClick={() => {
                  setFilterStatus(status);
                  setCurrentPage(1);
                }}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center">
                <FaSearch className="w-4 h-4 text-gray-500" />
              </div>
              <input
                type="text"
                placeholder="Search by name, email, or company..."
                className="w-full pl-10 pr-3 py-2.5 text-sm border border-gray-300 rounded-full bg-white text-black focus:border-green-300 focus:outline-none focus:ring-1 focus:ring-green-200"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
                >
                  <span className="text-xl leading-none">×</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      <Loading load={load} />

      {/* Table Container */}
      <div className="rounded-xl shadow bg-white overflow-hidden">
        {/* Error Message */}
        {error && (
          <div className="m-4 p-3 bg-red-100 border border-red-300 rounded-lg">
            <div className="flex items-center gap-2 text-red-800">
              <FaInfoCircle className="w-4 h-4" />
              <span className="text-sm font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-200">
                {[
                  "#",
                  "Customer Name",
                  "Contact",
                  "Email",
                  "Company",
                  "Status",
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
              {currentCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12">
                    <div className="space-y-3">
                      <div className="text-4xl">👥</div>
                      <p className="text-lg font-bold text-black">
                        No customers found
                      </p>
                      <p className="text-gray-600 text-sm">
                        {searchQuery || filterStatus !== "All"
                          ? "Try a different search term or filter"
                          : "Start by adding your first customer"}
                      </p>
                      {!searchQuery && filterStatus === "All" && (
                        <button
                          onClick={() => setShowModalAdd(true)}
                          className="mt-2 px-4 py-2 bg-green-300 hover:bg-green-400 text-black font-bold rounded-full transition-colors text-sm"
                        >
                          Add First Customer
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                currentCustomers.map((customer, index) => (
                  <>
                    <tr
                      key={customer._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      {/* # Column - Green 300 */}
                      <td className="py-3 px-3 text-center border-r border-gray-300 bg-gray-200">
                        <span className="inline-flex items-center justify-center w-8 h-8 bg-green-300 text-black font-bold rounded-full text-xs">
                          {(currentPage - 1) * usersPerPage + index + 1}
                        </span>
                      </td>

                      {/* Customer Name Column - Gray 100 */}
                      <td className="py-3 px-3 text-center bg-gray-100 border-r border-gray-200">
                        <div className="flex flex-col items-center gap-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-black text-sm">
                              {customer.customerName}
                            </span>
                          </div>
                          {customer.address && (
                            <div className="flex items-center gap-1 text-xs text-gray-600">
                              <FaMapMarkerAlt className="w-3 h-3" />
                              <span className="truncate max-w-[120px]">
                                {customer.address}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Contact Column - Green 200 */}
                      <td className="py-3 px-3 text-center bg-green-200 border-r border-gray-200">
                        {customer.phone ? (
                          <div className="flex items-center justify-center gap-2">
                            <FaPhone className="w-4 h-4 text-green-700" />
                            <span className="font-bold text-black text-sm">
                              {customer.phone}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-500 italic text-sm">
                            No phone
                          </span>
                        )}
                      </td>

                      {/* Email Column - Gray 100 */}
                      <td className="py-3 px-3 text-center bg-gray-100 border-r border-gray-200">
                        <div className="flex items-center justify-center gap-2">
                          <FaEnvelope className="w-4 h-4 text-blue-600" />
                          <span className="font-bold text-black text-sm truncate max-w-[150px]">
                            {customer.email}
                          </span>
                        </div>
                      </td>

                      {/* Company Column - Green 200 */}
                      <td className="py-3 px-3 text-center bg-green-200 border-r border-gray-200">
                        <div className="flex items-center justify-center gap-2">
                          <FaBuilding className="w-4 h-4 text-green-700" />
                          <span className="font-bold text-black text-sm">
                            {customer.company || (
                              <span className="text-gray-500 italic">None</span>
                            )}
                          </span>
                        </div>
                      </td>

                      {/* Status Column - Gray 100 */}
                      <td className="py-3 px-3 text-center bg-gray-100 border-r border-gray-200">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                            customer.status === "Active"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {customer.status}
                        </span>
                      </td>

                      {/* Actions Column - Gray 200 */}
                      <td className="py-3 px-3 text-center bg-gray-200">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() =>
                              toggleStatus(customer._id, customer.status)
                            }
                            className="p-2 bg-green-300 hover:bg-green-400 text-black rounded-full transition-colors"
                            title="Toggle Status"
                          >
                            {customer.status === "Active" ? (
                              <BsToggleOff className="w-4 h-4" />
                            ) : (
                              <BsToggleOn className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => {
                              setShowModalEdit(true);
                              setModifiedUser(customer);
                            }}
                            className="p-2 bg-blue-300 hover:bg-blue-400 text-black rounded-full transition-colors"
                            title="Edit Customer"
                          >
                            <FaUserEdit className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    <tr className="h-3">
                      <td colSpan={7} className="p-0"></td>
                    </tr>
                  </>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Compact Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t border-gray-300 bg-gray-50">
            <div className="text-xs text-gray-700">
              <span className="font-bold text-black">
                Showing {(currentPage - 1) * usersPerPage + 1} to{" "}
                {Math.min(currentPage * usersPerPage, totalItems)}
              </span>{" "}
              of <span className="font-bold text-black">{totalItems}</span>{" "}
              customers
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={prevPage}
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
                onClick={nextPage}
                disabled={currentPage === totalPages}
                className="p-2 bg-gray-200 hover:bg-gray-300 text-black font-bold rounded-full disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <IoIosArrowForward className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <AddCustomer
        showModal={showModalAdd}
        setShowModal={setShowModalAdd}
        onCustomerAdded={fetchData}
      />
      <EditCustomer
        showModal={showModalEdit}
        setShowModal={setShowModalEdit}
        customer={modifiedUser}
        onCustomerUpdated={fetchData}
      />
    </div>
  );
};

export default CustomerManagement;
