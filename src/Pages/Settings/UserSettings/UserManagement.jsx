import { useState, useEffect } from "react";
import axios from "axios";

// Icons
import {
  FaSearch,
  FaUserEdit,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaIdCard,
  FaInfoCircle,
  FaBuilding,
  FaShieldAlt, // NEW: for role badge
} from "react-icons/fa";
import {
  IoIosArrowBack,
  IoIosArrowForward,
  IoMdAdd,
  IoMdRefresh,
} from "react-icons/io";
import { BsToggleOff, BsToggleOn } from "react-icons/bs";

import AddUser from "./AddUser";
import EditUser from "./EditUser";

import BASE_URL from "../../../Utils/config";
import toast from "react-hot-toast";

// Role → tailwind color classes for badge
const ROLE_STYLES = {
  Admin: "bg-purple-100 text-purple-800 border-purple-300",
  Manager: "bg-blue-100 text-blue-800 border-blue-300",
  Cashier: "bg-amber-100 text-amber-800 border-amber-300",
  Accountant: "bg-teal-100 text-teal-800 border-teal-300",
};

const UserManagement = ({ currentUserRole }) => {
  // currentUserRole: "Admin" | "Manager" | "Cashier" | "Accountant"
  const isAdmin = currentUserRole === "Admin";

  const [users, setUsers] = useState([]);
  const [showError, setShowError] = useState("");

  const [filterStatus, setFilterStatus] = useState("All");
  const [filterRole, setFilterRole] = useState("All"); // NEW: role filter
  const [searchQuery, setSearchQuery] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const usersPerPage = 6;

  // Filter users based on status, role and search
  const filteredUsers = users.filter(
    (user) =>
      (filterStatus === "All" || user.status === filterStatus) &&
      (filterRole === "All" || user.role === filterRole) &&
      (user.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.secondName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.contacts?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.userName?.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  const totalItems = filteredUsers.length;
  const totalPages = Math.ceil(totalItems / usersPerPage);
  const currentUsers = filteredUsers.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage,
  );

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/users/allUsers`);
      if (!response.ok) throw new Error("Failed to fetch users");
      const data = await response.json();
      setUsers(data);
      setShowError("");
      toast.success("Users loaded successfully!");
    } catch (error) {
      setShowError("An error occurred. Please Contact System Administrator.");
      console.error("Fetch failed", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    // Only Admins can toggle status (matches backend)
    if (!isAdmin) {
      toast.error("Only Admins can change user status.");
      return;
    }
    try {
      const newStatus = currentStatus === "Active" ? "Inactive" : "Active";
      const response = await axios.put(
        `${BASE_URL}/api/users/status/${userId}`,
        { status: newStatus },
      );
      if (response.status === 200) {
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user._id === userId ? { ...user, status: newStatus } : user,
          ),
        );
        toast.success(`User status updated to ${newStatus}`);
      }
    } catch (error) {
      console.error("Error updating user status:", error);
      toast.error(error.response?.data?.error || "Failed to update user status");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.status === "Active").length;
  const inactiveUsers = users.filter((u) => u.status === "Inactive").length;

  const clearSearch = () => {
    setSearchQuery("");
    setCurrentPage(1);
  };

  const renderPagination = (currentPageNum, totalPagesNum, setPageFn) => {
    if (totalPagesNum === 0 || totalPagesNum === 1) return null;
    const pageNumbers = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPageNum - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPagesNum, startPage + maxVisiblePages - 1);
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    for (let i = startPage; i <= endPage; i++) pageNumbers.push(i);

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
            {startPage > 2 && <span className="px-1 text-gray-400 text-sm">…</span>}
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
          onClick={() => currentPageNum < totalPagesNum && setPageFn(currentPageNum + 1)}
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

  const [showModalAdd, setShowModalAdd] = useState(false);
  const [showModalEdit, setShowModalEdit] = useState(false);
  const [modifiedUser, setModifiedUser] = useState(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-8xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-300 rounded-xl flex items-center justify-center shadow-lg shadow-green-200 border-2 border-green-400">
              <FaUser className="w-5 h-5 sm:w-6 sm:h-6 text-black" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 tracking-tight">
                User Management
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 hidden xs:block">
                Manage and organize system users
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={fetchData}
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-100 font-semibold rounded-xl transition-all duration-200 shadow-sm text-xs sm:text-sm"
            >
              <IoMdRefresh className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${loading ? "animate-spin" : ""}`} />
              <span className="hidden xs:inline">Refresh</span>
            </button>
            <button
              onClick={() => setShowModalAdd(true)}
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 bg-green-300 hover:bg-green-400 text-black font-semibold rounded-xl transition-all duration-200 shadow-sm text-xs sm:text-sm border-2 border-green-400"
            >
              <IoMdAdd className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Add User</span>
              <span className="xs:inline">Add</span>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6">
          <StatCard label="Total Users" value={totalUsers} icon={<FaUser className="w-4 h-4 sm:w-5 sm:h-5 text-black" />} />
          <StatCard label="Active" value={activeUsers} valueClass="text-green-600" icon={<FaBuilding className="w-4 h-4 sm:w-5 sm:h-5 text-black" />} />
          <StatCard label="Inactive" value={inactiveUsers} valueClass="text-red-600" icon={<FaBuilding className="w-4 h-4 sm:w-5 sm:h-5 text-black" />} />
          <StatCard label="Filtered" value={filteredUsers.length} icon={<FaSearch className="w-4 h-4 sm:w-5 sm:h-5 text-black" />} />
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-5">
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {["All", "Active", "Inactive"].map((status) => (
              <button
                key={status}
                onClick={() => { setFilterStatus(status); setCurrentPage(1); }}
                className={`px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-full text-[9px] sm:text-xs font-semibold transition-all duration-200 border-2 ${
                  filterStatus === status
                    ? "bg-green-300 border-green-300 text-black shadow-md shadow-green-200"
                    : "bg-white border-gray-300 text-gray-500 hover:border-gray-400 hover:text-gray-700 hover:bg-gray-100"
                }`}
              >
                {status}
                <span className={`text-[9px] sm:text-xs ml-1 ${filterStatus === status ? "text-black/70" : "text-gray-400"}`}>
                  ({status === "All" ? totalUsers : users.filter((u) => u.status === status).length})
                </span>
              </button>
            ))}

            {/* NEW: Role filter */}
            <select
              value={filterRole}
              onChange={(e) => { setFilterRole(e.target.value); setCurrentPage(1); }}
              className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[9px] sm:text-xs font-semibold bg-white border-2 border-gray-300 text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
              <option value="All">All Roles</option>
              <option value="Admin">Admin</option>
              <option value="Manager">Manager</option>
              <option value="Cashier">Cashier</option>
              <option value="Accountant">Accountant</option>
            </select>
          </div>

          <div className="relative w-full sm:w-64">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-black/50 w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <input
              type="text"
              placeholder="Search users..."
              className="w-full pl-8 sm:pl-9 pr-8 py-2 sm:py-2.5 bg-white border-2 border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1 transition-all duration-200 text-black placeholder:text-black/50 text-xs sm:text-sm"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
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

        {loading && (
          <div className="flex flex-col items-center justify-center py-12 sm:py-16 bg-gray-100 rounded-2xl border-2 border-gray-300 shadow-sm">
            <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-green-300 border-t-green-500 rounded-full animate-spin" />
            <p className="text-xs sm:text-sm text-gray-500 mt-3 sm:mt-4">Loading users...</p>
          </div>
        )}

        {showError && (
          <div className="mb-3 sm:mb-4 bg-red-50 border-2 border-red-200 text-red-600 rounded-xl p-3 sm:p-4 text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <FaInfoCircle className="w-4 h-4" />
              <span className="font-medium">{showError}</span>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-2 sm:mb-3 px-1">
          <p className="text-[9px] sm:text-sm text-gray-500">
            <span className="font-semibold text-gray-700">{filteredUsers.length}</span> users found
          </p>
          <p className="text-[9px] sm:text-sm text-gray-400">
            Page {currentPage} of {totalPages || 1}
          </p>
        </div>

        {/* User cards */}
        <div className="space-y-2 sm:space-y-3">
          {currentUsers.length === 0 ? (
            <div className="bg-gray-100 rounded-2xl border-2 border-gray-300 shadow-sm py-12 sm:py-16 text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 border-2 border-gray-300">
                <FaUser className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
              </div>
              <p className="text-sm sm:text-base text-gray-700 font-medium">No users found</p>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                {searchQuery || filterStatus !== "All" || filterRole !== "All"
                  ? "Try a different search term or filter"
                  : "Start by adding your first user"}
              </p>
              {!searchQuery && filterStatus === "All" && filterRole === "All" && (
                <button
                  onClick={() => setShowModalAdd(true)}
                  className="mt-3 px-4 py-2 bg-green-300 hover:bg-green-400 text-black font-semibold rounded-xl transition-all duration-200 text-sm border-2 border-green-400"
                >
                  Add First User
                </button>
              )}
            </div>
          ) : (
            currentUsers.map((user, idx) => {
              const isActive = user.status === "Active";
              const fullName =
                `${user.firstName} ${user.secondName || ""} ${user.lastName || ""}`.trim();
              const roleClass =
                ROLE_STYLES[user.role] || "bg-gray-100 text-gray-700 border-gray-300";

              return (
                <div
                  key={user._id}
                  className="bg-gray-200 rounded-xl border-2 border-gray-300 shadow-sm p-3 sm:p-5 hover:shadow-md hover:border-green-300 transition-all duration-300"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                      <div
                        className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center flex-shrink-0 border-2 ${
                          isActive
                            ? "bg-green-300 border-green-400"
                            : "bg-gray-300 border-gray-400"
                        }`}
                      >
                        <FaUser className={`w-4 h-4 sm:w-5 sm:h-5 ${isActive ? "text-black" : "text-gray-600"}`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm sm:text-base font-semibold text-gray-800 truncate max-w-[100px] xs:max-w-[180px] sm:max-w-[250px]">
                            {fullName || "—"}
                          </span>
                          <span className="text-[9px] sm:text-[10px] text-gray-600 bg-white px-2 py-0.5 rounded border border-gray-300 flex-shrink-0">
                            #{idx + 1}
                          </span>

                          {/* NEW: Role badge */}
                          {user.role && (
                            <span
                              className={`px-2 py-0.5 rounded-full text-[8px] sm:text-[9px] font-semibold border-2 flex-shrink-0 flex items-center gap-1 ${roleClass}`}
                            >
                              <FaShieldAlt className="w-2.5 h-2.5" />
                              {user.role}
                            </span>
                          )}

                          <span
                            className={`px-2 py-0.5 rounded-full text-[8px] sm:text-[9px] font-semibold border-2 flex-shrink-0 ${
                              isActive
                                ? "bg-green-300 text-black border-green-400"
                                : "bg-red-100 text-red-700 border-red-200"
                            }`}
                          >
                            {user.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3 text-[10px] sm:text-xs text-gray-500 mt-0.5 flex-wrap">
                          {user.email && (
                            <>
                              <span className="flex items-center gap-1">
                                <FaEnvelope className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                {user.email}
                              </span>
                              <span className="w-0.5 h-0.5 bg-gray-400 rounded-full" />
                            </>
                          )}
                          {user.contacts && (
                            <span className="flex items-center gap-1">
                              <FaPhone className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                              {user.contacts}
                            </span>
                          )}
                          {user.title && (
                            <>
                              <span className="w-0.5 h-0.5 bg-gray-400 rounded-full" />
                              <span className="flex items-center gap-1">
                                <FaIdCard className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                {user.title}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                      {/* Status toggle — Admin only, disabled for self/protected */}
                      <button
                        onClick={() => toggleUserStatus(user._id, user.status)}
                        disabled={!isAdmin}
                        className={`px-2.5 sm:px-4 py-1.5 sm:py-2 font-semibold rounded-full text-[9px] sm:text-xs transition-all duration-200 border-2 shadow-sm flex items-center gap-1.5 sm:gap-2 ${
                          !isAdmin
                            ? "opacity-50 cursor-not-allowed bg-white border-gray-300 text-gray-400"
                            : isActive
                            ? "bg-white border-gray-300 text-gray-700 hover:bg-gray-100"
                            : "bg-green-300 border-green-400 text-black hover:bg-green-400"
                        }`}
                        title={!isAdmin ? "Only Admins can change status" : "Toggle Status"}
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
                          setModifiedUser(user);
                          setShowModalEdit(true);
                        }}
                        className="p-2 sm:p-2.5 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-100 transition-all duration-200 shadow-sm"
                        title="Edit User"
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

        {filteredUsers.length > 0 && (
          <div className="mt-3 sm:mt-4 bg-white px-3 sm:px-5 py-2.5 sm:py-4 rounded-xl border-2 border-gray-200 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-3">
            <span className="text-[9px] sm:text-xs text-gray-500 text-center sm:text-left">
              Showing{" "}
              <span className="font-semibold text-gray-700">
                {(currentPage - 1) * usersPerPage + 1}
              </span>{" "}
              to{" "}
              <span className="font-semibold text-gray-700">
                {Math.min(currentPage * usersPerPage, filteredUsers.length)}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-gray-700">{filteredUsers.length}</span> users
            </span>
            {renderPagination(currentPage, totalPages, setCurrentPage)}
          </div>
        )}
      </div>

      {/* Modals — pass currentUserRole through */}
      <AddUser
        showModal={showModalAdd}
        setShowModal={setShowModalAdd}
        onUserAdded={fetchData}
        currentUserRole={currentUserRole}
      />
      <EditUser
        showModal={showModalEdit}
        setShowModal={setShowModalEdit}
        onUserAdded={fetchData}
        user={modifiedUser}
        currentUserRole={currentUserRole}
      />
    </div>
  );
};

// Small helper for stat cards to reduce repetition
function StatCard({ label, value, valueClass = "text-black", icon }) {
  return (
    <div className="bg-white p-3 sm:p-4 md:p-5 rounded-2xl border-2 border-gray-300 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] sm:text-xs font-medium text-black/60 uppercase tracking-wider">
            {label}
          </p>
          <p className={`text-sm sm:text-lg md:text-xl font-bold mt-0.5 sm:mt-1 ${valueClass}`}>
            {value}
          </p>
        </div>
        <div className="bg-green-300 p-2 sm:p-2.5 rounded-xl border-2 border-green-400">{icon}</div>
      </div>
    </div>
  );
}

export default UserManagement;