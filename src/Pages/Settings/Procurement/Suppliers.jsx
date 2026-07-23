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
} from "react-icons/fi";

// Modals
import AddSupplier from "./AddSupplier";
import EditSupplier from "./EditSupplier";
import Loading from "../../../Components/Shared/Loading";

// API
import BASE_URL from "../../../Utils/config";
import {
  Search,
  X,
  Building,
  Phone,
  CheckCircle,
  Clock,
  Package,
} from "lucide-react";
import toast from "react-hot-toast";
import { FaFilter } from "react-icons/fa";

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
        toast.success(
          `Supplier ${newStatus === "Active" ? "activated" : "deactivated"} successfully!`,
        );
      }
    } catch (err) {
      console.error("Failed to update status:", err);
      toast.error("Failed to update supplier status");
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
                ? "bg-emerald-500 text-white border-emerald-500 hover:bg-emerald-600"
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

  const statsData = [
    { label: "Total Suppliers", value: totalSuppliers, icon: Package },
    { label: "Active", value: activeSuppliers, icon: CheckCircle },
    { label: "Inactive", value: inactiveSuppliers, icon: Clock },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-8xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200 border-2 border-emerald-300">
              <Building className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800 tracking-tight">
                Suppliers
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 hidden xs:block">
                Manage all your suppliers and their information
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowModalAdd(true)}
            className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-200 hover:scale-[1.02] active:scale-95 text-xs sm:text-sm font-semibold shadow-md border-2 border-emerald-400"
          >
            <FiUserPlus className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Add Supplier</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 xs:grid-cols-3 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6">
          {statsData.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="bg-white p-3 sm:p-4 md:p-5 rounded-2xl border-2 border-gray-300 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
              >
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-[10px] sm:text-xs font-medium text-black/60 uppercase tracking-wider truncate">
                      {stat.label}
                    </p>
                    <p className="text-sm sm:text-lg md:text-xl font-bold text-black mt-0.5 sm:mt-1">
                      {stat.value}
                    </p>
                  </div>
                  <div className="bg-gray-100 p-2 sm:p-2.5 rounded-xl border-2 border-gray-300 flex-shrink-0">
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-black" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Search + Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-5">
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {["all", "Active", "Inactive"].map((status) => (
              <button
                key={status}
                onClick={() => {
                  setStatusFilter(status);
                  setCurrentPage(1);
                }}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-semibold transition-all duration-200 border-2 ${
                  statusFilter === status
                    ? "bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-200"
                    : "bg-white border-gray-300 text-gray-500 hover:border-gray-400 hover:text-gray-700 hover:bg-gray-100"
                }`}
              >
                {status === "all" ? "All" : status}
                <span
                  className={`text-[10px] sm:text-xs ${statusFilter === status ? "text-white/80" : "text-gray-400"}`}
                >
                  (
                  {status === "all"
                    ? totalSuppliers
                    : allSuppliers.filter((s) => s.status === status).length}
                  )
                </span>
              </button>
            ))}
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-56 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-black/50 w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <input
                type="text"
                placeholder="Search suppliers..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-8 sm:pl-9 pr-8 py-2 sm:py-2.5 bg-white border-2 border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1 transition-all duration-200 text-black placeholder:text-black/50 text-xs sm:text-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-black/40 hover:text-black/70"
                >
                  <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              )}
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl font-semibold text-xs sm:text-sm transition-all duration-200 border-2 ${
                showFilters || activeFilterCount > 0
                  ? "bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-200"
                  : "bg-white border-gray-300 text-gray-600 hover:bg-gray-100 hover:border-gray-400"
              }`}
            >
              <FaFilter className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Filters</span>
              {activeFilterCount > 0 && (
                <span className="bg-white text-emerald-600 text-[10px] sm:text-xs w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center font-bold">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Expandable Filters Panel */}
        {showFilters && (
          <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-lg border-2 border-gray-200 mb-4 space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-800">
                Advanced Filters
              </h3>
              <button
                onClick={() => setShowFilters(false)}
                className="p-1 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
            <button
              onClick={clearFilters}
              className="w-full py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-xl transition-all duration-200 text-sm"
            >
              Clear All Filters
            </button>
          </div>
        )}

        {/* Active Filter Chips */}
        {activeFilterCount > 0 && !showFilters && (
          <div className="flex flex-wrap gap-1 sm:gap-1.5 mb-3 sm:mb-4">
            {statusFilter !== "all" && (
              <span className="inline-flex items-center gap-0.5 sm:gap-1 px-2 sm:px-3 py-0.5 sm:py-1 bg-emerald-100 text-emerald-700 text-[10px] sm:text-xs font-medium rounded-full border border-emerald-200">
                {statusFilter}
                <button
                  onClick={() => setStatusFilter("all")}
                  className="hover:text-emerald-900"
                >
                  <X className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                </button>
              </span>
            )}
            {searchQuery && (
              <span className="inline-flex items-center gap-0.5 sm:gap-1 px-2 sm:px-3 py-0.5 sm:py-1 bg-amber-100 text-amber-700 text-[10px] sm:text-xs font-medium rounded-full border border-amber-200">
                {searchQuery}
                <button
                  onClick={() => setSearchQuery("")}
                  className="hover:text-amber-900"
                >
                  <X className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                </button>
              </span>
            )}
          </div>
        )}

        <Loading load={load} />

        {/* Error Message */}
        {error && (
          <div className="mb-3 sm:mb-4 bg-red-50 border-2 border-red-200 text-red-600 rounded-xl p-3 sm:p-4 text-xs sm:text-sm">
            <span className="font-bold">Error: </span> {error}
          </div>
        )}

        {/* Results Count */}
        <div className="flex items-center justify-between mb-2 sm:mb-3 px-1">
          <p className="text-[10px] sm:text-sm text-gray-500">
            <span className="font-semibold text-gray-700">
              {filteredSuppliers.length}
            </span>{" "}
            results found
          </p>
          <p className="text-[10px] sm:text-sm text-gray-400">
            Page {currentPage} of {totalPages || 1}
          </p>
        </div>

        {/* Card List - Normal size */}
        <div className="space-y-2 sm:space-y-3">
          {load ? (
            <div className="flex flex-col items-center justify-center py-12 sm:py-16 bg-gray-100 rounded-2xl border-2 border-gray-300 shadow-sm">
              <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-emerald-300 border-t-emerald-500 rounded-full animate-spin" />
              <p className="text-xs sm:text-sm text-gray-500 mt-3 sm:mt-4">
                Loading suppliers...
              </p>
            </div>
          ) : currentSuppliers.length === 0 ? (
            <div className="bg-gray-100 rounded-2xl border-2 border-gray-300 shadow-sm py-12 sm:py-16 text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 border-2 border-gray-300">
                <Building className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
              </div>
              <p className="text-sm sm:text-base text-gray-700 font-medium">
                No suppliers found
              </p>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Try adjusting your filters
              </p>
            </div>
          ) : (
            currentSuppliers.map((supplier, idx) => {
              const isActive = supplier.status === "Active";

              return (
                <div
                  key={supplier._id}
                  className="bg-gray-200 rounded-xl border-2 border-gray-300 shadow-sm p-4 sm:p-4.5 hover:shadow-md hover:border-emerald-300 transition-all duration-300"
                >
                  {/* Single row - all items in one line */}
                  <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3">
                    {/* Left: Avatar + Name + Status */}
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border-2 ${
                          isActive
                            ? "bg-emerald-200 border-emerald-300"
                            : "bg-gray-300 border-gray-400"
                        }`}
                      >
                        <Building
                          className={`w-5 h-5 ${isActive ? "text-emerald-700" : "text-gray-600"}`}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold text-gray-800 truncate max-w-[120px] xs:max-w-[150px] sm:max-w-[180px]">
                            {supplier.supplierName || "—"}
                          </span>
                          <span className="text-[9px] sm:text-[10px] text-gray-500 bg-white px-1.5 py-0.5 rounded border border-gray-300 flex-shrink-0">
                            #{idx + 1}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[8px] sm:text-[9px] font-semibold border-2 flex-shrink-0 ${
                              isActive
                                ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                                : "bg-red-100 text-red-700 border-red-200"
                            }`}
                          >
                            {supplier.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[9px] sm:text-[10px] text-gray-500 mt-0.5 flex-wrap">
                          {supplier.company && (
                            <>
                              <span className="truncate max-w-[80px] sm:max-w-[120px]">
                                {supplier.company}
                              </span>
                              <span className="w-0.5 h-0.5 bg-gray-400 rounded-full" />
                            </>
                          )}
                          <span className="flex items-center gap-0.5">
                            <Phone className="w-3 h-3" />
                            {supplier.phone || "—"}
                          </span>
                          {supplier.email && (
                            <>
                              <span className="w-0.5 h-0.5 bg-gray-400 rounded-full" />
                              <span className="truncate max-w-[100px] sm:max-w-[160px]">
                                {supplier.email}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() =>
                          toggleStatus(supplier._id, supplier.status)
                        }
                        className={`px-3 sm:px-4 py-1.5 sm:py-2 font-semibold rounded-full text-[10px] sm:text-xs transition-all duration-200 border-2 shadow-sm flex items-center gap-1.5 sm:gap-2 ${
                          isActive
                            ? "bg-white border-gray-300 text-gray-700 hover:bg-gray-100"
                            : "bg-emerald-500 border-emerald-400 text-white hover:bg-emerald-600"
                        }`}
                      >
                        {isActive ? (
                          <>
                            <FiToggleLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            Deactivate
                          </>
                        ) : (
                          <>
                            <FiToggleRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            Activate
                          </>
                        )}
                      </button>

                      {canEditSupplier ? (
                        <button
                          onClick={() => {
                            setShowModalEdit(true);
                            setModifiedUser(supplier);
                          }}
                          className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-100 font-semibold rounded-full text-[10px] sm:text-xs transition-all duration-200 shadow-sm flex items-center gap-1.5 sm:gap-2"
                        >
                          <FiEdit className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          Edit
                        </button>
                      ) : (
                        <span className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-200 text-gray-400 font-semibold rounded-full text-[10px] sm:text-xs border-2 border-gray-300">
                          No Access
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {filteredSuppliers.length > 0 && (
          <div className="mt-3 sm:mt-4 bg-white px-3 sm:px-5 py-2.5 sm:py-4 rounded-xl border-2 border-gray-200 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-3">
            <span className="text-[9px] sm:text-xs text-gray-500 text-center sm:text-left">
              Showing{" "}
              <span className="font-semibold text-gray-700">
                {indexOfFirst + 1}
              </span>{" "}
              to{" "}
              <span className="font-semibold text-gray-700">
                {Math.min(indexOfLast, filteredSuppliers.length)}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-gray-700">
                {filteredSuppliers.length}
              </span>{" "}
              suppliers
            </span>
            {renderPagination(currentPage, totalPages, setCurrentPage)}
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
    </div>
  );
};

export default Suppliers;
