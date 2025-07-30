import { useState, useEffect } from "react";
import axios from "axios";

//icons
import { FaSearch } from "react-icons/fa";
import { FaUserEdit } from "react-icons/fa";
import { BsToggleOff, BsToggleOn } from "react-icons/bs";
import { IoIosArrowBack } from "react-icons/io";
import { IoIosArrowForward } from "react-icons/io";

import AddUser from "./AddUser";
import EditUser from "./EditUser";

//API
const URL = import.meta.env.VITE_API;


const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [showError, setShowError] = useState("");

  //User Status Filter & Searching
  const [filterStatus, setFilterStatus] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  //Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 5;

  const filteredUsers = users.filter(
    (user) =>
      (filterStatus === "All" || user.status === filterStatus) &&
      (user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.secondName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.contacts.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  //funx
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

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

  // Fetch data from API or use dummy data
  const fetchData = async () => {
    try {
      const response = await fetch(`${URL}/api/users/allUsers`);
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      const data = await response.json();
      setUsers(data); // Set the fetched users to state
      setShowError("");
    } catch (error) {
      // Extract the correct error message from backend
      if (error.response && error.response.data) {
        setShowError(
          error.response.data.error ||
            "Login failed. Please check your credentials."
        );
      } else {
        setShowError("An error occurred. Please Contact System Adminstrator.");
      }

      console.error("Login failed", error);
    }
  };

  //////////////////////
  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      const newStatus = currentStatus === "Active" ? "Inactive" : "Active";

      const response = await axios.put(
        `${URL}/api/users/status/${userId}`,
        {
          status: newStatus,
        }
      );

      if (response.status === 200) {
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user._id === userId ? { ...user, status: newStatus } : user
          )
        );
      }
    } catch (error) {
      console.error("Error updating user status:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Modala
  const [showModalAdd, setShowModalAdd] = useState(false);
  const [showModalEdit, setShowModalEdit] = useState(false);
  const [modifiedUser, setModifiedUser] = useState(null);

  return (
    <div className="sm:px-6 w-full">
      {/* Title */}
      <div className="px-4 md:px-10 py-4 md:py-7">
        <div className="flex items-center justify-between">
          <p className="text-lg md:text-xl lg:text-2xl font-bold text-gray-800">
            USERS
          </p>
        </div>
      </div>

      <div className="sm:flex items-center justify-between ml-9">
        <div className="flex items-center">
          {["All", "Active", "Inactive"].map((status) => (
            <button
              key={status}
              className={`rounded-full py-2 px-8 mx-2 ${
                filterStatus === status
                  ? "bg-green-300 text-black"
                  : "bg-gray-200 text-gray-600"
              } hover:text-black hover:bg-indigo-100 border-gray-400`}
              onClick={() => {
                setFilterStatus(status);
                setCurrentPage(1);
              }}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="hidden sm:flex items-center bg-gray-100 rounded-[30px] px-3 sm:px-4 py-1 sm:py-2 w-full max-w-[300px] border border-gray-400">
          <FaSearch className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-black" />
          <input
            type="text"
            placeholder="Search"
            className="bg-transparent outline-none px-2 py-1 w-full text-black"
            value={searchQuery} // Bind input to state
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1); // Reset pagination when searching
            }}
          />
        </div>

        <button
          onClick={() => setShowModalAdd(true)}
          className="mr-10 focus:ring-2 focus:ring-offset-2  mt-4 sm:mt-0 inline-flex items-start justify-start px-6 py-3 bg-green-300 hover:bg-gray-200 focus:outline-none rounded"
        >
          <p className="text-sm font-medium leading-none text-black">
            + Add User
          </p>
        </button>
      </div>

      {/* Table Container */}
      <div className="bg-white py-4 md:py-7 px-4 md:px-8 xl:px-10">
        {/* Error Message (Only Shows When There is an Error) */}
        {showError && (
          <div
            className="mt-2 bg-red-100/70 border border-red-200 text-sm text-red-800 rounded-lg p-4 dark:bg-red-800/10 dark:border-red-900 dark:text-red-500"
            role="alert"
          >
            <span className="font-bold">Error: </span> {showError}
          </div>
        )}
        <div className="mt-7 overflow-x-auto">
          <table className="w-full whitespace-nowrap">
            <thead className="bg-gray-200 text-black">
              <tr>
                <th className="border border-gray-300 px-4 py-2 text-left">
                  SN
                </th>

                <th className="border border-gray-300 px-4 py-2 text-left">
                  Name
                </th>
                <th className="border border-gray-300 px-4 py-2 text-left">
                  Title
                </th>
                <th className="border border-gray-300 px-4 py-2 text-left">
                  Email
                </th>
                <th className="border border-gray-300 px-4 py-2 text-left">
                  Phone Number
                </th>
                <th className="border border-gray-300 px-4 py-2 text-center">
                  Active Status
                </th>
                <th className="border border-gray-300 px-4 py-2 text-left">
                  Change Status
                </th>
                <th className="border border-gray-300 px-4 py-2 text-left">
                  Action
                </th>
              </tr>
            </thead>

            <tr className="h-3" />

            <tbody>
              {currentUsers.map((user, index) => (
                <>
                  <tr
                    key={user.id}
                    className="focus:outline-none h-16 border-gray-500 shadow-md bg-gray-100"
                  >
                    <td className="pl-5 font-bold">
                      <p className="text-sm leading-none text-gray-600">
                        {indexOfFirstUser + index + 1}
                      </p>
                    </td>

                    <td className="pl-4 bg-gray-200 font-bold">
                      <div className="flex items-center">
                        <p className="text-sm leading-none text-gray-600 ml-2">
                          {user.firstName}
                        </p>
                        <p className="text-sm leading-none text-gray-600 ml-2">
                          {user.secondName}
                        </p>
                        <p className="text-sm leading-none text-gray-600 ml-2">
                          {user.lastName}
                        </p>
                      </div>
                    </td>

                    <td className="pl-5 font-bold">
                      <p className="text-sm leading-none text-gray-600">
                        {user.title}
                      </p>
                    </td>

                    <td className="pl-5 bg-gray-200 font-bold">
                      <p className="text-sm leading-none text-gray-600">
                        {user.email}
                      </p>
                    </td>

                    <td className="pl-5 font-bold">
                      <p className="text-sm leading-none text-gray-600">
                        {user.contacts}
                      </p>
                    </td>

                    <td className="pl-5 font-bold bg-gray-200">
                      <span
                        className={`py-3 px-3 text-sm leading-none border-l-2 border-gray-700 rounded-full ${
                          user.status === "Active"
                            ? "text-green-800 bg-green-100"
                            : "text-red-800 bg-red-100"
                        } rounded`}
                      >
                        {user.status}
                      </span>
                    </td>

                    <td>
                      <button
                        className="focus:ring-1 focus:ring-offset-2 focus:ring-red-300 text-sm leading-none text-gray-600 py-3 px-5 bg-gray-100 rounded hover:bg-gray-200 focus:outline-none"
                        onClick={() => toggleUserStatus(user._id, user.status)}
                      >
                        {user.status === "Active" ? (
                          <BsToggleOff size={20} />
                        ) : (
                          <BsToggleOn size={20} />
                        )}
                      </button>
                    </td>

                    <td className="pl-4 gap-2 font-bold bg-gray-200">
                      <button
                        onClick={() => {
                          setShowModalEdit(true);
                          setModifiedUser(user);
                        }}
                        className="focus:ring-1 focus:ring-offset-2 focus:ring-blue-300 text-sm leading-none text-gray-600 py-3 px-5 bg-gray-200 rounded hover:bg-gray-100 focus:outline-none"
                      >
                        <FaUserEdit size={20} />
                      </button>
                    </td>
                  </tr>
                  <tr className="h-4" />
                </>
              ))}
            </tbody>
          </table>

          <div className="flex items-center justify-between border-t border-gray-200 bg-white py-3 sm:px-6">
            <p className="text-sm text-gray-700">
              Showing{" "}
              <span className="font-medium">
                {" "}
                <strong>{indexOfFirstUser + 1}</strong>{" "}
              </span>{" "}
              to{" "}
              <span className="font-medium">
                <strong>{Math.min(indexOfLastUser, users.length)}</strong>
              </span>{" "}
              of{" "}
              <span className="font-medium">
                {" "}
                <strong>{users.length}</strong>{" "}
              </span>{" "}
              <strong>Users</strong>
            </p>

            <nav
              aria-label="Pagination"
              className="isolate inline-flex -space-x-px rounded-md shadow-xs"
            >
              <button
                onClick={prevPage}
                disabled={currentPage === 1}
                className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-gray-300 ring-inset hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${
                  currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <IoIosArrowBack aria-hidden="true" className="size-5" />
              </button>

              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-gray-300 ring-inset hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${
                    currentPage === i + 1 ? "bg-green-500/80 text-white" : ""
                  }`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                onClick={nextPage}
                disabled={currentPage === totalPages}
                className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-gray-300 ring-inset hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${
                  currentPage === totalPages
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              >
                <IoIosArrowForward aria-hidden="true" className="size-5" />
              </button>
            </nav>
          </div>

          <AddUser
            showModal={showModalAdd}
            setShowModal={setShowModalAdd}
            onUserAdded={fetchData}
            modifiedUser={modifiedUser}
          />

          <EditUser
            showModal={showModalEdit}
            setShowModal={setShowModalEdit}
            onUserAdded={fetchData}
            user={modifiedUser}
          />
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
