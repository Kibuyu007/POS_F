import { useState, useEffect } from "react";
import axios from "axios";

// Icons
import { FaSearch, FaUserEdit, FaUser, FaEnvelope, FaPhone, FaIdCard, FaInfoCircle } from "react-icons/fa";
import { IoIosArrowBack, IoIosArrowForward, IoMdAdd, IoMdRefresh } from "react-icons/io";
import { BsToggleOff, BsToggleOn } from "react-icons/bs";

import AddUser from "./AddUser";
import EditUser from "./EditUser";

// API
import BASE_URL from "../../../Utils/config";
import toast from "react-hot-toast";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [showError, setShowError] = useState("");

  // User Status Filter & Searching
  const [filterStatus, setFilterStatus] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const usersPerPage = 10;

  // Filter users based on status and search
  const filteredUsers = users.filter(
    (user) =>
      (filterStatus === "All" || user.status === filterStatus) &&
      (user.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.secondName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.contacts?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Pagination calculations
  const totalItems = filteredUsers.length;
  const totalPages = Math.ceil(totalItems / usersPerPage);
  const currentUsers = filteredUsers.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  );

  const nextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));

  // Fetch data from API
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/users/allUsers`);
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
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

  // Toggle user status
  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      const newStatus = currentStatus === "Active" ? "Inactive" : "Active";

      const response = await axios.put(
        `${BASE_URL}/api/users/status/${userId}`,
        { status: newStatus }
      );

      if (response.status === 200) {
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user._id === userId ? { ...user, status: newStatus } : user
          )
        );
        toast.success(`User status updated to ${newStatus}`);
      }
    } catch (error) {
      console.error("Error updating user status:", error);
      toast.error("Failed to update user status");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Calculate stats
  const totalUsers = users.length;
  const activeUsers = users.filter(user => user.status === "Active").length;
  const inactiveUsers = users.filter(user => user.status === "Inactive").length;

  // Clear search
  const clearSearch = () => {
    setSearchQuery("");
    setCurrentPage(1);
  };

  // Modals
  const [showModalAdd, setShowModalAdd] = useState(false);
  const [showModalEdit, setShowModalEdit] = useState(false);
  const [modifiedUser, setModifiedUser] = useState(null);

  return (
    <div className="p-5 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-black mb-1">
            User Management
          </h1>
          <p className="text-gray-600 text-sm">
            Manage and organize system users
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
              <p className="text-xs text-gray-500 font-medium">Total Users</p>
              <p className="text-base font-bold text-black">
                {totalUsers}
              </p>
            </div>

            <div className="h-6 w-px bg-gray-300"></div>

            <div className="text-center px-3">
              <p className="text-xs text-gray-500 font-medium">Active</p>
              <p className="text-base font-bold text-green-600">
                {activeUsers}
              </p>
            </div>

            <div className="h-6 w-px bg-gray-300"></div>

            <div className="text-center px-3">
              <p className="text-xs text-gray-500 font-medium">Inactive</p>
              <p className="text-base font-bold text-red-600">
                {inactiveUsers}
              </p>
            </div>

            <div className="h-6 w-px bg-gray-300"></div>

            <div className="text-center px-3">
              <p className="text-xs text-gray-500 font-medium">Filtered</p>
              <p className="text-base font-bold text-black">
                {filteredUsers.length}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowModalAdd(true)}
              className="px-4 py-2 bg-green-300 hover:bg-green-400 text-black font-bold rounded-full shadow hover:shadow-md transition-all duration-200 flex items-center gap-2 text-sm"
            >
              <IoMdAdd className="w-4 h-4" />
              <span>Add User</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter & Search - Compact & Clean */}
      <div className="mb-6 rounded-xl p-4 shadow bg-white">
        <div className="flex items-center gap-3 mb-4">
          <FaSearch className="w-4 h-4 text-green-600" />
          <h3 className="text-sm font-bold text-black">Search & Filter Users</h3>
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
                placeholder="Search by name, email, or phone..."
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
      {loading && (
        <div className="flex justify-center items-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
        </div>
      )}

      {/* Table Container */}
      <div className="rounded-xl shadow bg-white overflow-hidden">
        {/* Error Message */}
        {showError && (
          <div className="m-4 p-3 bg-red-100 border border-red-300 rounded-lg">
            <div className="flex items-center gap-2 text-red-800">
              <FaInfoCircle className="w-4 h-4" />
              <span className="text-sm font-medium">{showError}</span>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-200">
                {["#", "Name", "Title", "Email", "Phone", "Status", "Actions"].map((header, idx) => (
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
              {currentUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12">
                    <div className="space-y-3">
                      <div className="text-4xl">👤</div>
                      <p className="text-lg font-bold text-black">
                        No users found
                      </p>
                      <p className="text-gray-600 text-sm">
                        {searchQuery || filterStatus !== "All" 
                          ? "Try a different search term or filter" 
                          : "Start by adding your first user"}
                      </p>
                      {!searchQuery && filterStatus === "All" && (
                        <button
                          onClick={() => setShowModalAdd(true)}
                          className="mt-2 px-4 py-2 bg-green-300 hover:bg-green-400 text-black font-bold rounded-full transition-colors text-sm"
                        >
                          Add First User
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                currentUsers.map((user, index) => (
                  <>
                    <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                      {/* # Column - Green 300 */}
                      <td className="py-3 px-3 text-center border-r border-gray-300 bg-gray-200">
                        <span className="inline-flex items-center justify-center w-8 h-8 bg-green-300 text-black font-bold rounded-full text-xs">
                          {(currentPage - 1) * usersPerPage + index + 1}
                        </span>
                      </td>

                      {/* Name Column - Gray 100 */}
                      <td className="py-3 px-3 text-center bg-gray-100 border-r border-gray-200">
                        <div className="flex flex-col items-center gap-1">
                          <div className="flex items-center gap-2">
                            <FaUser className="w-4 h-4 text-green-600" />
                            <div className="text-center">
                              <span className="font-bold text-black text-sm block">
                                {user.firstName} {user.secondName && user.secondName + " "}{user.lastName}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Title Column - Green 200 */}
                      <td className="py-3 px-3 text-center bg-green-200 border-r border-gray-200">
                        <div className="flex items-center justify-center gap-2">
                          <FaIdCard className="w-4 h-4 text-green-700" />
                          <span className="font-bold text-black text-sm">
                            {user.title || <span className="text-gray-500 italic">No title</span>}
                          </span>
                        </div>
                      </td>

                      {/* Email Column - Gray 100 */}
                      <td className="py-3 px-3 text-center bg-gray-100 border-r border-gray-200">
                        <div className="flex items-center justify-center gap-2">
                          <FaEnvelope className="w-4 h-4 text-blue-600" />
                          <span className="font-bold text-black text-sm truncate max-w-[150px]">
                            {user.email}
                          </span>
                        </div>
                      </td>

                      {/* Phone Column - Green 200 */}
                      <td className="py-3 px-3 text-center bg-green-200 border-r border-gray-200">
                        <div className="flex items-center justify-center gap-2">
                          <FaPhone className="w-4 h-4 text-green-700" />
                          <span className="font-bold text-black text-sm">
                            {user.contacts || <span className="text-gray-500 italic">No phone</span>}
                          </span>
                        </div>
                      </td>

                      {/* Status Column - Gray 100 */}
                      <td className="py-3 px-3 text-center bg-gray-100 border-r border-gray-200">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                            user.status === "Active"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {user.status}
                        </span>
                      </td>

                      {/* Actions Column - Gray 200 */}
                      <td className="py-3 px-3 text-center bg-gray-200">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => toggleUserStatus(user._id, user.status)}
                            className="p-2 bg-green-300 hover:bg-green-400 text-black rounded-full transition-colors"
                            title="Toggle Status"
                          >
                            {user.status === "Active" ? (
                              <BsToggleOff className="w-4 h-4" />
                            ) : (
                              <BsToggleOn className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => {
                              setShowModalEdit(true);
                              setModifiedUser(user);
                            }}
                            className="p-2 bg-blue-300 hover:bg-blue-400 text-black rounded-full transition-colors"
                            title="Edit User"
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
              of <span className="font-bold text-black">{totalItems}</span> users
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
                    (pageNum === currentPage - 2 || pageNum === currentPage + 2) &&
                    totalPages > 5
                  ) {
                    return (
                      <span key={i} className="px-2 text-gray-500 font-bold text-xs">
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
      <AddUser
        showModal={showModalAdd}
        setShowModal={setShowModalAdd}
        onUserAdded={fetchData}
      />
      <EditUser
        showModal={showModalEdit}
        setShowModal={setShowModalEdit}
        onUserAdded={fetchData}
        user={modifiedUser}
      />
    </div>
  );
};

export default UserManagement;