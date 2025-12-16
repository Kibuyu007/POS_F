import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllSuppliers,
  supplierStatusUpdate,
} from "../../../Redux/suppliers";
import axios from "axios";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { FiEdit, FiToggleLeft, FiToggleRight, FiUserPlus } from "react-icons/fi";
import { FaSearch } from "react-icons/fa";

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

  // Calculate statistics
  const activeSuppliers = allSuppliers.filter(s => s.status === "Active").length;
  const inactiveSuppliers = allSuppliers.filter(s => s.status === "Inactive").length;
  const totalSuppliers = allSuppliers.length;

  const filteredSuppliers = allSuppliers.filter(
    (s) =>
      (statusFilter === "all" || s.status === statusFilter) &&
      (s.supplierName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.phone?.includes(searchQuery))
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
        {
          status: newStatus,
        }
      );

      if (res.status === 200) {
        dispatch(supplierStatusUpdate({ supplierId, newStatus }));
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  // Check if user has edit permission
  const canEditSupplier = user?.roles?.canAccessSupplierManagement === true;

  return (
    <div className="p-5 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-black mb-2">
            Suppliers Management
          </h1>
          <p className="text-gray-600">
            Manage all your suppliers and their information in one place
          </p>
        </div>
        <button
          onClick={() => setShowModalAdd(true)}
          className="mt-4 md:mt-0 px-6 py-3 bg-green-300 hover:bg-green-400 text-black font-bold rounded-full shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2"
        >
          <FiUserPlus className="w-5 h-5" />
          + Add Supplier
        </button>
      </div>

      {/* Stats Section - Horizontal Bar */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row items-center justify-between bg-white border border-gray-200 rounded-full p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4 sm:mb-0">
            <div className="text-center px-4">
              <p className="text-xs text-gray-500 font-medium">Total</p>
              <p className="text-lg font-bold text-black">{totalSuppliers}</p>
            </div>

            <div className="h-10 w-px bg-gray-300"></div>

            <div className="text-center px-4">
              <p className="text-xs text-gray-500 font-medium">Active</p>
              <p className="text-lg font-bold text-green-600">{activeSuppliers}</p>
            </div>

            <div className="h-10 w-px bg-gray-300"></div>

            <div className="text-center px-4">
              <p className="text-xs text-gray-500 font-medium">Inactive</p>
              <p className="text-lg font-bold text-red-600">{inactiveSuppliers}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-700">Active: </span>
              <span className="font-bold text-black">{activeSuppliers}</span>
            </div>

            <div className="h-4 w-px bg-gray-300"></div>

            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-700">Inactive: </span>
              <span className="font-bold text-black">{inactiveSuppliers}</span>
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
              Search Suppliers
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center">
                <FaSearch className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Name, email, company or phone..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-full bg-white text-black focus:border-green-300 focus:outline-none focus:ring-1 focus:ring-green-200"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex-1">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Status Filter
            </label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-full bg-white text-black focus:border-green-300 focus:outline-none focus:ring-1 focus:ring-green-200"
            >
              <option value="all">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          {/* Clear Button */}
          <div className="flex gap-3 lg:items-end">
            <button
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("all");
                setCurrentPage(1);
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

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-600 rounded-xl p-4">
          <span className="font-bold">Error: </span> {error}
        </div>
      )}

      {/* Table with Colored Columns */}
      <div className="overflow-x-auto rounded-xl">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-200">
              {[
                "SN",
                "Supplier Name",
                "Phone",
                "Email",
                "Company",
                "Address",
                "Status",
                "Toggle Status",
                "Actions"
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

          <tbody>
            {currentSuppliers.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-12">
                  <div className="space-y-3">
                    <div className="text-4xl">🏭</div>
                    <p className="text-xl font-bold text-black">
                      No suppliers found
                    </p>
                    <p className="text-gray-600">
                      Try adjusting your search filters or add a new supplier
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              currentSuppliers.map((supplier, idx) => (
                <>
                  <tr
                    key={supplier._id}
                    className="hover:bg-gray-50 transition-colors shadow-md"
                  >
                    {/* SN Column - Green 300 */}
                    <td className="py-4 px-3 text-center border-r border-gray-300 bg-gray-200">
                      <span className="inline-flex items-center justify-center w-10 h-10 bg-green-300 text-black font-bold rounded-full shadow">
                        {(currentPage - 1) * suppliersPerPage + idx + 1}
                      </span>
                    </td>

                    {/* Supplier Name Column - Green 200 */}
                    <td className="py-4 px-3 text-center bg-green-200 border-r border-gray-200">
                      <span className="font-bold text-black">
                        {supplier.supplierName || "—"}
                      </span>
                    </td>

                    {/* Phone Column - Gray 200 */}
                    <td className="py-4 px-3 text-center bg-gray-200 border-r border-gray-200">
                      <span className="font-bold text-black">
                        {supplier.phone || "—"}
                      </span>
                    </td>

                    {/* Email Column - Gray 100 */}
                    <td className="py-4 px-3 text-center bg-gray-100 border-r border-gray-200">
                      <span className="font-bold text-black">
                        {supplier.email || "—"}
                      </span>
                    </td>

                    {/* Company Column - Yellow 100 */}
                    <td className="py-4 px-3 text-center bg-yellow-100 border-r border-gray-200">
                      <span className="font-bold text-black">
                        {supplier.company || "—"}
                      </span>
                    </td>

                    {/* Address Column - Gray 200 */}
                    <td className="py-4 px-3 text-center bg-gray-200 border-r border-gray-200">
                      <span className="font-bold text-black">
                        {supplier.address || "—"}
                      </span>
                    </td>

                    {/* Status Column - Gray 100 */}
                    <td className="py-4 px-3 text-center bg-gray-100 border-r border-gray-200">
                      <span
                        className={`inline-block px-4 py-2 font-bold rounded-full ${
                          supplier.status === "Active"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {supplier.status}
                      </span>
                    </td>

                    {/* Toggle Status Column - Blue 50 */}
                    <td className="py-4 px-3 text-center bg-blue-50 border-r border-gray-200">
                      <button
                        onClick={() => toggleStatus(supplier._id, supplier.status)}
                        className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-800 font-bold rounded-full flex items-center gap-2 justify-center transition-colors"
                      >
                        {supplier.status === "Active" ? (
                          <>
                            <FiToggleLeft className="w-5 h-5" />
                            Deactivate
                          </>
                        ) : (
                          <>
                            <FiToggleRight className="w-5 h-5" />
                            Activate
                          </>
                        )}
                      </button>
                    </td>

                    {/* Actions Column - Gray 100 */}
                    <td className="py-4 px-3 text-center bg-gray-100">
                      {canEditSupplier ? (
                        <button
                          onClick={() => {
                            setShowModalEdit(true);
                            setModifiedUser(supplier);
                          }}
                          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-black font-bold rounded-full flex items-center gap-2 justify-center transition-colors"
                        >
                          <FiEdit className="w-4 h-4" />
                          Edit
                        </button>
                      ) : (
                        <span className="inline-flex items-center px-4 py-2 bg-gray-300 text-gray-600 font-bold rounded-full">
                          Not Allowed
                        </span>
                      )}
                    </td>
                  </tr>
                  {/* Spacing row between rows */}
                  <tr className="h-3">
                    <td colSpan={9} className="p-0"></td>
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
            Showing {(currentPage - 1) * suppliersPerPage + 1} to{" "}
            {Math.min(currentPage * suppliersPerPage, filteredSuppliers.length)}
          </span>{" "}
          of <span className="font-bold text-black">{filteredSuppliers.length}</span> suppliers
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={prevPage}
            disabled={currentPage === 1}
            className="p-2.5 bg-gray-200 hover:bg-gray-300 text-black font-bold rounded-full disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <IoIosArrowBack className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-1">
            {(() => {
              const maxPagesToShow = 5;
              let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
              let endPage = startPage + maxPagesToShow - 1;

              if (endPage > totalPages) {
                endPage = totalPages;
                startPage = Math.max(1, endPage - maxPagesToShow + 1);
              }

              return Array.from(
                { length: endPage - startPage + 1 },
                (_, i) => startPage + i
              ).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-10 h-10 font-bold rounded-full transition-all ${
                    currentPage === page
                      ? "bg-green-300 text-black shadow"
                      : "text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {page}
                </button>
              ));
            })()}
          </div>

          <button
            onClick={nextPage}
            disabled={currentPage === totalPages}
            className="p-2.5 bg-gray-200 hover:bg-gray-300 text-black font-bold rounded-full disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <IoIosArrowForward className="w-5 h-5" />
          </button>
        </div>
      </div>

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