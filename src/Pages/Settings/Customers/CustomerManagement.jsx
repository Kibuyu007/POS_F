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
  FaUser,
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

  const usersPerPage = 6;

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
        c.company?.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  // Pagination calculations
  const totalItems = filteredCustomers.length;
  const totalPages = Math.ceil(totalItems / usersPerPage);
  const currentCustomers = filteredCustomers.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage,
  );

  const toggleStatus = async (customerId, currentStatus) => {
    const newStatus = currentStatus === "Active" ? "Inactive" : "Active";
    try {
      const res = await axios.put(
        `${BASE_URL}/api/customers/status/${customerId}`,
        { status: newStatus },
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
    (c) => c.status === "Active",
  ).length;
  const inactiveCustomers = allCustomers.filter(
    (c) => c.status === "Inactive",
  ).length;

  const clearSearch = () => {
    setSearchQuery("");
    setCurrentPage(1);
  };

  const renderPagination = (currentPageNum, totalPagesNum, setPageFn) => {
    if (totalPagesNum === 0 || totalPagesNum === 1) return null;

    const pageNumbers = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(
      1,
      currentPageNum - Math.floor(maxVisiblePages / 2),
    );
    let endPage = Math.min(totalPagesNum, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="flex items-center gap-1.5 flex-wrap justify-center">
        <button
          onClick={() => currentPageNum > 1 && setPageFn(currentPageNum - 1)}
          disabled={currentPageNum === 1}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            currentPageNum === 1
              ? "bg-gray-100 text-gray-300 cursor-not-allowed"
              : "bg-white border-2 border-gray-300 text-gray-600 hover:bg-gray-100 hover:border-gray-400 shadow-sm"
          }`}
        >
          <IoIosArrowBack className="w-4 h-4" />
        </button>

        {startPage > 1 && (
          <>
            <button
              onClick={() => setPageFn(1)}
              className="px-3.5 py-2 rounded-lg text-sm font-medium bg-white border-2 border-gray-300 text-gray-600 hover:bg-gray-100 hover:border-gray-400 transition-all duration-200 shadow-sm"
            >
              1
            </button>
            {startPage > 2 && (
              <span className="px-1 text-gray-400 text-sm">…</span>
            )}
          </>
        )}

        {pageNumbers.map((number) => (
          <button
            key={number}
            onClick={() => setPageFn(number)}
            className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm border-2 ${
              currentPageNum === number
                ? "bg-green-300 text-black border-green-300 hover:bg-green-400"
                : "bg-white border-gray-300 text-gray-600 hover:bg-gray-100 hover:border-gray-400"
            }`}
          >
            {number}
          </button>
        ))}

        {endPage < totalPagesNum && (
          <>
            {endPage < totalPagesNum - 1 && (
              <span className="px-1 text-gray-400 text-sm">…</span>
            )}
            <button
              onClick={() => setPageFn(totalPagesNum)}
              className="px-3.5 py-2 rounded-lg text-sm font-medium bg-white border-2 border-gray-300 text-gray-600 hover:bg-gray-100 hover:border-gray-400 transition-all duration-200 shadow-sm"
            >
              {totalPagesNum}
            </button>
          </>
        )}

        <button
          onClick={() =>
            currentPageNum < totalPagesNum && setPageFn(currentPageNum + 1)
          }
          disabled={currentPageNum === totalPagesNum}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            currentPageNum === totalPagesNum
              ? "bg-gray-100 text-gray-300 cursor-not-allowed"
              : "bg-white border-2 border-gray-300 text-gray-600 hover:bg-gray-100 hover:border-gray-400 shadow-sm"
          }`}
        >
          <IoIosArrowForward className="w-4 h-4" />
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-8xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
        {/* Header - Responsive */}
        <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-300 rounded-xl flex items-center justify-center shadow-lg shadow-green-200 border-2 border-green-400">
              <FaUser className="w-5 h-5 sm:w-6 sm:h-6 text-black" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 tracking-tight">
                Customer Management
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 hidden xs:block">
                Manage and organize customer information
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={fetchData}
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-100 font-semibold rounded-xl transition-all duration-200 shadow-sm text-xs sm:text-sm"
            >
              <IoMdRefresh
                className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${load ? "animate-spin" : ""}`}
              />
              <span className="hidden xs:inline">Refresh</span>
            </button>
            <button
              onClick={() => setShowModalAdd(true)}
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 bg-green-300 hover:bg-green-400 text-black font-semibold rounded-xl transition-all duration-200 shadow-sm text-xs sm:text-sm border-2 border-green-400"
            >
              <IoMdAdd className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Add Customer</span>
              <span className="xs:inline">Add</span>
            </button>
          </div>
        </div>

        {/* Stats Cards - Stacked on mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6">
          <div className="bg-white p-3 sm:p-4 md:p-5 rounded-2xl border-2 border-gray-300 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] sm:text-xs font-medium text-black/60 uppercase tracking-wider">
                  Total Customers
                </p>
                <p className="text-sm sm:text-lg md:text-xl font-bold text-black mt-0.5 sm:mt-1">
                  {totalCustomers}
                </p>
              </div>
              <div className="bg-green-300 p-2 sm:p-2.5 rounded-xl border-2 border-green-400">
                <FaUser className="w-4 h-4 sm:w-5 sm:h-5 text-black" />
              </div>
            </div>
          </div>

          <div className="bg-white p-3 sm:p-4 md:p-5 rounded-2xl border-2 border-gray-300 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] sm:text-xs font-medium text-black/60 uppercase tracking-wider">
                  Active
                </p>
                <p className="text-sm sm:text-lg md:text-xl font-bold text-green-600 mt-0.5 sm:mt-1">
                  {activeCustomers}
                </p>
              </div>
              <div className="bg-green-300 p-2 sm:p-2.5 rounded-xl border-2 border-green-400">
                <FaBuilding className="w-4 h-4 sm:w-5 sm:h-5 text-black" />
              </div>
            </div>
          </div>

          <div className="bg-white p-3 sm:p-4 md:p-5 rounded-2xl border-2 border-gray-300 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] sm:text-xs font-medium text-black/60 uppercase tracking-wider">
                  Inactive
                </p>
                <p className="text-sm sm:text-lg md:text-xl font-bold text-red-600 mt-0.5 sm:mt-1">
                  {inactiveCustomers}
                </p>
              </div>
              <div className="bg-green-300 p-2 sm:p-2.5 rounded-xl border-2 border-green-400">
                <FaBuilding className="w-4 h-4 sm:w-5 sm:h-5 text-black" />
              </div>
            </div>
          </div>

          <div className="bg-white p-3 sm:p-4 md:p-5 rounded-2xl border-2 border-gray-300 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] sm:text-xs font-medium text-black/60 uppercase tracking-wider">
                  Filtered
                </p>
                <p className="text-sm sm:text-lg md:text-xl font-bold text-black mt-0.5 sm:mt-1">
                  {filteredCustomers.length}
                </p>
              </div>
              <div className="bg-green-300 p-2 sm:p-2.5 rounded-xl border-2 border-green-400">
                <FaSearch className="w-4 h-4 sm:w-5 sm:h-5 text-black" />
              </div>
            </div>
          </div>
        </div>

        {/* Search & Filters - Responsive */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-5">
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {["All", "Active", "Inactive"].map((status) => (
              <button
                key={status}
                onClick={() => {
                  setFilterStatus(status);
                  setCurrentPage(1);
                }}
                className={`px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-full text-[9px] sm:text-xs font-semibold transition-all duration-200 border-2 ${
                  filterStatus === status
                    ? "bg-green-300 border-green-300 text-black shadow-md shadow-green-200"
                    : "bg-white border-gray-300 text-gray-500 hover:border-gray-400 hover:text-gray-700 hover:bg-gray-100"
                }`}
              >
                {status}
                <span
                  className={`text-[9px] sm:text-xs ${
                    filterStatus === status ? "text-black/70" : "text-gray-400"
                  }`}
                >
                  (
                  {status === "All"
                    ? totalCustomers
                    : allCustomers.filter((c) => c.status === status).length}
                  )
                </span>
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-black/50 w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <input
              type="text"
              placeholder="Search customers..."
              className="w-full pl-8 sm:pl-9 pr-8 py-2 sm:py-2.5 bg-white border-2 border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1 transition-all duration-200 text-black placeholder:text-black/50 text-xs sm:text-sm"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-black/40 hover:text-black/70"
              >
                <span className="text-lg leading-none">×</span>
              </button>
            )}
          </div>
        </div>

        {/* Loading State */}
        <Loading load={load} />

        {/* Error Message */}
        {error && (
          <div className="mb-3 sm:mb-4 bg-red-50 border-2 border-red-200 text-red-600 rounded-xl p-3 sm:p-4 text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <FaInfoCircle className="w-4 h-4" />
              <span className="font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* Results Count */}
        <div className="flex items-center justify-between mb-2 sm:mb-3 px-1">
          <p className="text-[9px] sm:text-sm text-gray-500">
            <span className="font-semibold text-gray-700">
              {filteredCustomers.length}
            </span>{" "}
            customers found
          </p>
          <p className="text-[9px] sm:text-sm text-gray-400">
            Page {currentPage} of {totalPages || 1}
          </p>
        </div>

        {/* Card List - Responsive */}
        <div className="space-y-2 sm:space-y-3">
          {load ? (
            <div className="flex flex-col items-center justify-center py-12 sm:py-16 bg-gray-100 rounded-2xl border-2 border-gray-300 shadow-sm">
              <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-green-300 border-t-green-500 rounded-full animate-spin" />
              <p className="text-xs sm:text-sm text-gray-500 mt-3 sm:mt-4">
                Loading customers...
              </p>
            </div>
          ) : currentCustomers.length === 0 ? (
            <div className="bg-gray-100 rounded-2xl border-2 border-gray-300 shadow-sm py-12 sm:py-16 text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 border-2 border-gray-300">
                <FaUser className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
              </div>
              <p className="text-sm sm:text-base text-gray-700 font-medium">
                No customers found
              </p>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                {searchQuery || filterStatus !== "All"
                  ? "Try a different search term or filter"
                  : "Start by adding your first customer"}
              </p>
              {!searchQuery && filterStatus === "All" && (
                <button
                  onClick={() => setShowModalAdd(true)}
                  className="mt-3 px-4 py-2 bg-green-300 hover:bg-green-400 text-black font-semibold rounded-xl transition-all duration-200 text-sm border-2 border-green-400"
                >
                  Add First Customer
                </button>
              )}
            </div>
          ) : (
            currentCustomers.map((customer, idx) => {
              const isActive = customer.status === "Active";

              return (
                <div
                  key={customer._id}
                  className="bg-gray-200 rounded-xl border-2 border-gray-300 shadow-sm p-3 sm:p-5 hover:shadow-md hover:border-green-300 transition-all duration-300"
                >
                  {/* Row 1: Customer Info */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                      <div
                        className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center flex-shrink-0 border-2 ${
                          isActive
                            ? "bg-green-300 border-green-400"
                            : "bg-gray-300 border-gray-400"
                        }`}
                      >
                        <FaUser
                          className={`w-4 h-4 sm:w-5 sm:h-5 ${isActive ? "text-black" : "text-gray-600"}`}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm sm:text-base font-semibold text-gray-800 truncate max-w-[100px] xs:max-w-[180px] sm:max-w-[250px]">
                            {customer.customerName}
                          </span>
                          <span className="text-[9px] sm:text-[10px] text-gray-600 bg-white px-2 py-0.5 rounded border border-gray-300 flex-shrink-0">
                            #{idx + 1}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[8px] sm:text-[9px] font-semibold border-2 flex-shrink-0 ${
                              isActive
                                ? "bg-green-300 text-black border-green-400"
                                : "bg-red-100 text-red-700 border-red-200"
                            }`}
                          >
                            {customer.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3 text-[10px] sm:text-xs text-gray-500 mt-0.5 flex-wrap">
                          {customer.phone && (
                            <>
                              <span className="flex items-center gap-1">
                                <FaPhone className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                {customer.phone}
                              </span>
                              <span className="w-0.5 h-0.5 bg-gray-400 rounded-full" />
                            </>
                          )}
                          {customer.email && (
                            <>
                              <span className="flex items-center gap-1 truncate max-w-[100px] xs:max-w-[150px]">
                                <FaEnvelope className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                {customer.email}
                              </span>
                              <span className="w-0.5 h-0.5 bg-gray-400 rounded-full" />
                            </>
                          )}
                          {customer.company && (
                            <span className="flex items-center gap-1">
                              <FaBuilding className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                              {customer.company}
                            </span>
                          )}
                          {customer.address && (
                            <>
                              <span className="w-0.5 h-0.5 bg-gray-400 rounded-full" />
                              <span className="flex items-center gap-1 truncate max-w-[80px] xs:max-w-[120px]">
                                <FaMapMarkerAlt className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                {customer.address}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                      <button
                        onClick={() =>
                          toggleStatus(customer._id, customer.status)
                        }
                        className={`px-2.5 sm:px-4 py-1.5 sm:py-2 font-semibold rounded-full text-[9px] sm:text-xs transition-all duration-200 border-2 shadow-sm flex items-center gap-1.5 sm:gap-2 ${
                          isActive
                            ? "bg-white border-gray-300 text-gray-700 hover:bg-gray-100"
                            : "bg-green-300 border-green-400 text-black hover:bg-green-400"
                        }`}
                        title="Toggle Status"
                      >
                        {isActive ? (
                          <>
                            <BsToggleOff className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            <span className="hidden xs:inline">Deactivate</span>
                          </>
                        ) : (
                          <>
                            <BsToggleOn className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            <span className="hidden xs:inline">Activate</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => {
                          setShowModalEdit(true);
                          setModifiedUser(customer);
                        }}
                        className="p-2 sm:p-2.5 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-100 transition-all duration-200 shadow-sm"
                        title="Edit Customer"
                      >
                        <FaUserEdit className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination - Responsive */}
        {filteredCustomers.length > 0 && (
          <div className="mt-3 sm:mt-4 bg-white px-3 sm:px-5 py-2.5 sm:py-4 rounded-xl border-2 border-gray-200 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-3">
            <span className="text-[9px] sm:text-xs text-gray-500 text-center sm:text-left">
              Showing{" "}
              <span className="font-semibold text-gray-700">
                {(currentPage - 1) * usersPerPage + 1}
              </span>{" "}
              to{" "}
              <span className="font-semibold text-gray-700">
                {Math.min(currentPage * usersPerPage, filteredCustomers.length)}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-gray-700">
                {filteredCustomers.length}
              </span>{" "}
              customers
            </span>
            {renderPagination(currentPage, totalPages, setCurrentPage)}
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