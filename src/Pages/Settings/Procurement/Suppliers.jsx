import React from "react";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllSuppliers,
  supplierStatusUpdate,
} from "../../../Redux/suppliers";
import axios from "axios";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import {
  FiEdit,
  FiToggleLeft,
  FiToggleRight,
  FiUserPlus,
  FiX,
} from "react-icons/fi";
import { FaSearch, FaFilter } from "react-icons/fa";

// Modals
import AddSupplier from "./AddSupplier";
import EditSupplier from "./EditSupplier";
import Loading from "../../../Components/Shared/Loading";

// API
import BASE_URL from "../../../Utils/config";

const Suppliers = () => {
  const dispatch = useDispatch();
  const { allSuppliers = [], error } = useSelector((state) => state.suppliers);
  const user = useSelector((state) => state.user.user);

  const [showModalAdd, setShowModalAdd] = useState(false);
  const [showModalEdit, setShowModalEdit] = useState(false);
  const [modifiedUser, setModifiedUser] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [load, setLoad] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const suppliersPerPage = 10;

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  useEffect(() => {
    setLoad(true);
    dispatch(fetchAllSuppliers());
    setLoad(false);
  }, [dispatch]);

  const activeSuppliers = allSuppliers.filter(
    (s) => s.status === "Active",
  ).length;
  const inactiveSuppliers = allSuppliers.filter(
    (s) => s.status === "Inactive",
  ).length;
  const totalSuppliers = allSuppliers.length;

  const filteredSuppliers = allSuppliers.filter(
    (s) =>
      (statusFilter === "all" || s.status === statusFilter) &&
      (s.supplierName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.phone?.includes(searchQuery)),
  );

  const indexOfLast = currentPage * suppliersPerPage;
  const indexOfFirst = indexOfLast - suppliersPerPage;
  const currentSuppliers = filteredSuppliers.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredSuppliers.length / suppliersPerPage);

  const toggleStatus = async (supplierId, currentStatus) => {
    const newStatus = currentStatus === "Active" ? "Inactive" : "Active";
    try {
      const res = await axios.put(
        `${BASE_URL}/api/suppliers/status/${supplierId}`,
        { status: newStatus },
      );

      if (res.status === 200) {
        dispatch(supplierStatusUpdate({ supplierId, newStatus }));
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const canEditSupplier = user?.roles?.canAccessSupplierManagement === true;

  const activeFilterCount = [statusFilter !== "all", searchQuery].filter(
    Boolean,
  ).length;

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setCurrentPage(1);
  };

  return (
    <div className="p-2 sm:p-3 md:p-4 lg:p-5 bg-gray-50 min-h-screen">
      {/* Header - rounded-full */}
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-black">
            Suppliers
          </h1>
          <p className="text-gray-600 text-xs hidden sm:block">
            Manage all your suppliers and their information
          </p>
        </div>
        <button
          onClick={() => setShowModalAdd(true)}
          className="px-3 sm:px-4 py-2 sm:py-2.5 bg-green-300 hover:bg-green-400 text-black font-bold rounded-full shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm flex-shrink-0"
        >
          <FiUserPlus className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="hidden sm:inline">Add</span>
          <span className="sm:hidden">+</span>
        </button>
      </div>

      {/* Stats Cards - rounded-full */}
      <div className="grid grid-cols-3 gap-2 mb-3 sm:mb-4">
        <div className="bg-white border border-gray-200 rounded-full p-2.5 sm:p-3 shadow-sm text-center">
          <p className="text-[10px] sm:text-xs text-gray-500 font-medium mb-0.5">
            Total
          </p>
          <p className="text-xs sm:text-sm md:text-base font-bold text-black">
            {totalSuppliers}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-full p-2.5 sm:p-3 shadow-sm text-center">
          <p className="text-[10px] sm:text-xs text-gray-500 font-medium mb-0.5">
            Active
          </p>
          <p className="text-xs sm:text-sm md:text-base font-bold text-green-600">
            {activeSuppliers}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-full p-2.5 sm:p-3 shadow-sm text-center">
          <p className="text-[10px] sm:text-xs text-gray-500 font-medium mb-0.5">
            Inactive
          </p>
          <p className="text-xs sm:text-sm md:text-base font-bold text-red-600">
            {inactiveSuppliers}
          </p>
        </div>
      </div>

      {/* Search Bar + Filter Toggle - rounded-full */}
      <div className="flex gap-2 mb-3 sm:mb-4">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-3 sm:left-4 flex items-center">
            <FaSearch className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search suppliers..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 sm:pl-11 pr-8 py-2.5 sm:py-3 text-sm border border-gray-300 rounded-full bg-white text-black focus:border-green-300 focus:outline-none focus:ring-2 focus:ring-green-100"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 right-3 flex items-center text-gray-400"
            >
              <FiX className="w-4 h-4" />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`px-3 sm:px-4 py-2.5 rounded-full border font-bold text-sm flex items-center gap-1.5 flex-shrink-0 transition-all ${
            showFilters || activeFilterCount > 0
              ? "bg-green-300 border-green-400 text-black"
              : "bg-white border-gray-300 text-gray-700"
          }`}
        >
          <FaFilter className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Filters</span>
          {activeFilterCount > 0 && (
            <span className="bg-black text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Status Pills - rounded-full */}
      <div className="flex gap-2 mb-3 sm:mb-4 overflow-x-auto pb-1 scrollbar-hide">
        {["all", "Active", "Inactive"].map((status) => (
          <button
            key={status}
            onClick={() => {
              setStatusFilter(status);
              setCurrentPage(1);
            }}
            className={`px-4 sm:px-5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all flex-shrink-0 ${
              statusFilter === status
                ? "bg-black text-white shadow-md"
                : "bg-white border border-gray-200 text-gray-600"
            }`}
          >
            {status === "all" ? "All" : status}
            <span className="ml-1.5 opacity-70">
              {status === "all"
                ? totalSuppliers
                : allSuppliers.filter((s) => s.status === status).length}
            </span>
          </button>
        ))}
      </div>

      {/* Expandable Filters Panel - rounded-full */}
      {showFilters && (
        <div className="bg-white rounded-full p-3 sm:p-4 shadow-lg border border-gray-100 mb-3 sm:mb-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-black">Advanced Filters</h3>
            <button
              onClick={() => setShowFilters(false)}
              className="text-gray-400"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
          <div className="flex gap-2">
            <button
              onClick={clearFilters}
              className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-black font-bold rounded-full text-xs"
            >
              Clear All
            </button>
          </div>
        </div>
      )}

      {/* Active Filter Chips - rounded-full */}
      {activeFilterCount > 0 && !showFilters && (
        <div className="flex flex-wrap gap-1.5 mb-3 sm:mb-4">
          {statusFilter !== "all" && (
            <span className="inline-flex items-center px-2.5 py-1 bg-green-100 text-green-800 text-[10px] font-medium rounded-full">
              {statusFilter}
              <button onClick={() => setStatusFilter("all")} className="ml-1">
                <FiX className="w-3 h-3" />
              </button>
            </span>
          )}
          {searchQuery && (
            <span className="inline-flex items-center px-2.5 py-1 bg-yellow-100 text-yellow-800 text-[10px] font-medium rounded-full">
              {searchQuery}
              <button onClick={() => setSearchQuery("")} className="ml-1">
                <FiX className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}

      {/* Loading */}
      <Loading load={load} />

      {/* Error Message - rounded-full */}
      {error && (
        <div className="mb-3 sm:mb-4 bg-red-50 border border-red-200 text-red-600 rounded-full p-3 sm:p-4 text-xs sm:text-sm">
          <span className="font-bold">Error: </span> {error}
        </div>
      )}

      {/* Results Count */}
      <div className="flex items-center justify-between mb-2 px-1">
        <p className="text-xs text-gray-500">
          <span className="font-bold text-black">
            {filteredSuppliers.length}
          </span>{" "}
          results
        </p>
        <p className="text-[10px] text-gray-400">
          Page {currentPage} of {totalPages || 1}
        </p>
      </div>

      {/* Mobile Card View - NO rounded-full, use rounded-xl */}
      <div className="md:hidden space-y-2 mb-4">
        {currentSuppliers.length === 0 ? (
          <div className="bg-white rounded-xl p-6 text-center border border-gray-200">
            <div className="text-3xl mb-2">🏭</div>
            <p className="text-sm font-bold text-black">No suppliers found</p>
            <p className="text-xs text-gray-500">Try adjusting filters</p>
          </div>
        ) : (
          currentSuppliers.map((supplier, idx) => (
            <div
              key={supplier._id}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm"
            >
              {/* Card Header - rounded-xl */}
              <div className="flex items-center justify-between p-3 bg-gray-50 border-b border-gray-100">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="inline-flex items-center justify-center w-7 h-7 bg-green-300 text-black font-bold rounded-full text-xs flex-shrink-0">
                    {(currentPage - 1) * suppliersPerPage + idx + 1}
                  </span>
                  <span className="text-xs font-bold text-black truncate">
                    {supplier.supplierName || "—"}
                  </span>
                </div>
                <span
                  className={`inline-block px-2.5 py-1 font-bold rounded-full text-[10px] flex-shrink-0 ${
                    supplier.status === "Active"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {supplier.status}
                </span>
              </div>

              {/* Card Body - rounded-xl */}
              <div className="p-3 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Company:</span>
                  <span className="font-bold text-black">
                    {supplier.company || "—"}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Phone:</span>
                  <span className="font-bold text-black">
                    {supplier.phone || "—"}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Email:</span>
                  <span className="font-bold text-black truncate max-w-[150px]">
                    {supplier.email || "—"}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Address:</span>
                  <span className="font-bold text-black truncate max-w-[150px]">
                    {supplier.address || "—"}
                  </span>
                </div>

                {/* Actions - buttons rounded-full */}
                <div className="flex gap-2 pt-2 border-t border-gray-100">
                  <button
                    onClick={() => toggleStatus(supplier._id, supplier.status)}
                    className={`flex-1 py-2 rounded-full text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
                      supplier.status === "Active"
                        ? "bg-blue-100 hover:bg-blue-200 text-blue-800"
                        : "bg-green-100 hover:bg-green-200 text-green-800"
                    }`}
                  >
                    {supplier.status === "Active" ? (
                      <>
                        <FiToggleLeft className="w-3.5 h-3.5" /> Deactivate
                      </>
                    ) : (
                      <>
                        <FiToggleRight className="w-3.5 h-3.5" /> Activate
                      </>
                    )}
                  </button>
                  {canEditSupplier ? (
                    <button
                      onClick={() => {
                        setShowModalEdit(true);
                        setModifiedUser(supplier);
                      }}
                      className="flex-1 py-2 rounded-full bg-gray-200 hover:bg-gray-300 text-black font-bold text-xs flex items-center justify-center gap-1.5"
                    >
                      <FiEdit className="w-3.5 h-3.5" /> Edit
                    </button>
                  ) : (
                    <span className="flex-1 py-2 rounded-full bg-gray-100 text-gray-500 font-bold text-xs text-center">
                      Not Allowed
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Table View - NO rounded-full, use rounded-xl */}
      <div className="hidden md:block rounded-xl shadow bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-200">
                {[
                  "SN",
                  "Name",
                  "Phone",
                  "Email",
                  "Company",
                  "Address",
                  "Status",
                  "Toggle",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-3 py-3 text-center text-xs font-bold text-black uppercase border-r border-gray-300"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tr className="h-3" />

            <tbody>
              {currentSuppliers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-12">
                    <div className="space-y-3">
                      <div className="text-4xl">🏭</div>
                      <p className="text-lg font-bold text-black">
                        No suppliers found
                      </p>
                      <p className="text-gray-600 text-sm">
                        Try adjusting your search filters
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                currentSuppliers.map((supplier, idx) => (
                  <React.Fragment key={supplier._id}>
                    <tr className="hover:bg-gray-50 transition-colors shadow-md">
                      <td className="py-3 px-2 text-center border-r border-gray-300 bg-gray-200">
                        <span className="inline-flex items-center justify-center w-8 h-8 bg-green-300 text-black font-bold rounded-full text-xs shadow">
                          {(currentPage - 1) * suppliersPerPage + idx + 1}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-center bg-green-200 border-r border-gray-200">
                        <span className="font-bold text-black text-xs">
                          {supplier.supplierName || "—"}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-center bg-gray-200 border-r border-gray-200">
                        <span className="font-bold text-black text-xs">
                          {supplier.phone || "—"}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-center bg-gray-100 border-r border-gray-200">
                        <span className="font-bold text-black text-xs">
                          {supplier.email || "—"}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-center bg-yellow-100 border-r border-gray-200">
                        <span className="font-bold text-black text-xs">
                          {supplier.company || "—"}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-center bg-gray-200 border-r border-gray-200">
                        <span className="font-bold text-black text-xs">
                          {supplier.address || "—"}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-center bg-gray-100 border-r border-gray-200">
                        <span
                          className={`inline-block px-3 py-1 font-bold rounded-full text-xs ${
                            supplier.status === "Active"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {supplier.status}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-center bg-blue-50 border-r border-gray-200">
                        <button
                          onClick={() =>
                            toggleStatus(supplier._id, supplier.status)
                          }
                          className="px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-800 font-bold rounded-full flex items-center gap-1.5 justify-center text-xs transition-colors"
                        >
                          {supplier.status === "Active" ? (
                            <>
                              <FiToggleLeft className="w-4 h-4" /> Deactivate
                            </>
                          ) : (
                            <>
                              <FiToggleRight className="w-4 h-4" /> Activate
                            </>
                          )}
                        </button>
                      </td>
                      <td className="py-3 px-2 text-center bg-gray-100">
                        {canEditSupplier ? (
                          <button
                            onClick={() => {
                              setShowModalEdit(true);
                              setModifiedUser(supplier);
                            }}
                            className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-black font-bold rounded-full flex items-center gap-1.5 justify-center text-xs transition-colors"
                          >
                            <FiEdit className="w-4 h-4" /> Edit
                          </button>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1.5 bg-gray-300 text-gray-600 font-bold rounded-full text-xs">
                            Not Allowed
                          </span>
                        )}
                      </td>
                    </tr>
                    <tr className="h-3">
                      <td colSpan={9} className="p-0"></td>
                    </tr>
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination - rounded-full */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-2 mt-3 sm:mt-4 p-3 bg-white rounded-full border border-gray-200 shadow-sm">
          <button
            onClick={prevPage}
            disabled={currentPage === 1}
            className="p-2 bg-gray-100 hover:bg-gray-200 text-black rounded-full disabled:opacity-40"
          >
            <IoIosArrowBack className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1">
            {[...Array(Math.min(totalPages, 5))].map((_, i) => {
              let pageNum;
              if (totalPages <= 5) pageNum = i + 1;
              else if (currentPage <= 3) pageNum = i + 1;
              else if (currentPage >= totalPages - 2)
                pageNum = totalPages - 4 + i;
              else pageNum = currentPage - 2 + i;

              return (
                <button
                  key={i}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-8 h-8 text-xs font-bold rounded-full transition-colors ${currentPage === pageNum ? "bg-black text-white" : "text-gray-700 hover:bg-gray-100"}`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={nextPage}
            disabled={currentPage === totalPages}
            className="p-2 bg-gray-100 hover:bg-gray-200 text-black rounded-full disabled:opacity-40"
          >
            <IoIosArrowForward className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Modals */}
      <AddSupplier showModal={showModalAdd} setShowModal={setShowModalAdd} />
      <EditSupplier
        showModal={showModalEdit}
        setShowModal={setShowModalEdit}
        supplier={modifiedUser}
      />
    </div>
  );
};

export default Suppliers;
