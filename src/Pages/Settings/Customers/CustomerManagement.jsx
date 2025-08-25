import { useState, useEffect } from "react";

// Redux
import { useDispatch, useSelector } from "react-redux";
import { fetchAllCustomers, customerStatusUpdate } from "../../../Redux/customerSlice";

// Modals
import AddCustomer from "./AddCustomer";
import EditCustomer from "./EditCustomer";
import Loading from "../../../Components/Shared/Loading";

// Icons
import { FaSearch, FaUserEdit } from "react-icons/fa";
import { BsToggleOff, BsToggleOn } from "react-icons/bs";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";

import axios from "axios";


// API
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
  const usersPerPage = 5;

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
    dispatch(fetchAllCustomers());
    setLoad(false);
  }, [dispatch]);

  const filteredCustomers = allCustomers.filter(
    (c) =>
      (filterStatus === "All" || c.status === filterStatus) &&
      (c.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.company.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const indexOfLast = currentPage * usersPerPage;
  const indexOfFirst = indexOfLast - usersPerPage;
  const currentCustomers = filteredCustomers.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredCustomers.length / usersPerPage);

  const toggleStatus = async (customerId, currentStatus) => {
    const newStatus = currentStatus === "Active" ? "Inactive" : "Active";
    try {
      const res = await axios.put(
        `${BASE_URL}/api/customers/status/${customerId}`,
        {
          status: newStatus,
        }
      );

      if (res.status === 200) {
        dispatch(customerStatusUpdate({ customerId, newStatus }));
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  return (
    <div className="sm:px-6 w-full">
      <div className="px-4 md:px-10 py-4 md:py-7">
        <div className="flex items-center justify-between">
          <p className="text-lg md:text-xl lg:text-2xl font-bold text-gray-800">
            CUSTOMERS
          </p>
        </div>
      </div>

      <div className="sm:flex items-center justify-between ml-9">
        <div className="flex items-center text-black">
          {["All", "Active", "Inactive"].map((status) => (
            <button
              key={status}
              className={`rounded-full py-2 px-8 mx-2 ${
                filterStatus === status ? "bg-green-300" : "bg-gray-200"
              } hover:bg-indigo-100`}
              onClick={() => {
                setFilterStatus(status);
                setCurrentPage(1);
              }}
            >
              {status}
            </button>
          ))}
        </div>

        <div className="hidden sm:flex items-center bg-gray-100 rounded-[30px] px-4 py-2 w-full max-w-[300px] border border-gray-400">
          <FaSearch className="w-5 h-5 mr-2 text-black" />
          <input
            type="text"
            placeholder="Search"
            className="bg-transparent outline-none px-2 py-1 w-full text-black"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <button
          onClick={() => setShowModalAdd(true)}
          className="mr-10 mt-4 sm:mt-0 px-6 py-3 bg-green-300 hover:bg-gray-200 rounded-full"
        >
          <p className="text-sm font-medium text-black">+ Add Customer</p>
        </button>
      </div>

      <div className="bg-white py-4 md:py-7 px-4 md:px-8 xl:px-10">
        {error && (
          <div className="mt-2 bg-red-100 border border-red-200 text-sm text-red-800 rounded-lg p-4">
            <span className="font-bold">Error:</span> {error}
          </div>
        )}

        <Loading load={load} />

        <div className="overflow-x-auto rounded-lg mt-4">
          <table className="w-full whitespace-nowrap">
            <thead className="bg-gray-200 text-black">
              <tr>
                <th className="border border-gray-300 px-4 py-2 text-left">
                  SN
                </th>
                <th className="border border-gray-300 px-4 py-2 text-left">
                  Customer Name
                </th>
                <th className="border border-gray-300 px-4 py-2 text-left">
                  Contacts
                </th>
                <th className="border border-gray-300 px-4 py-2 text-left">
                  Address
                </th>
                <th className="border border-gray-300 px-4 py-2 text-left">
                  Email
                </th>
                <th className="border border-gray-300 px-4 py-2 text-left">
                  Company
                </th>
                <th className="border border-gray-300 px-4 py-2 text-left">
                  Status
                </th>
                <th className="border border-gray-300 px-4 py-2 text-left">
                  Change Status
                </th>
                <th className="border border-gray-300 px-4 py-2 text-left">
                  Actions
                </th>
              </tr>
            </thead>

            <tr className="h-3" />  

            <tbody>
              {currentCustomers.map((customer, index) => (
                <>
                  <tr
                    key={customer._id}
                    className="focus:outline-none h-16 border-gray-500 shadow-md bg-gray-100"
                  >
                    <td className="pl-5 font-bold bg-gray-100">
                      <p className="text-sm leading-none text-gray-600">
                        {indexOfFirst + index + 1}
                      </p>
                    </td>
                    <td className="pl-5 font-bold bg-gray-200">
                      <p className="text-sm leading-none text-gray-600">
                        {customer.customerName}
                      </p>
                    </td>
                    <td className="pl-5 font-bold bg-gray-100">
                      <p className="text-sm leading-none text-gray-600">
                        {customer.phone}
                      </p>
                    </td>

                    <td className="pl-5 font-bold bg-gray-200">
                      <p className="text-sm leading-none text-gray-600">
                        {customer.address}
                      </p>
                    </td>
                    <td className="pl-5 font-bold bg-gray-100">
                      <p className="text-sm leading-none text-gray-600">
                        {customer.email}
                      </p>
                    </td>

                    <td className="pl-5 font-bold bg-gray-200">
                      <p className="text-sm leading-none text-gray-600">
                        {customer.company}
                      </p>
                    </td>

                    <td className="pl-5 font-bold bg-gray-100">
                      <span
                        className={`py-3 px-3 text-sm leading-none border-l-2 border-gray-700 rounded-full ${
                          customer.status === "Active"
                            ? "text-green-800 bg-green-100"
                            : "text-red-800 bg-red-100"
                        } rounded`}
                      >
                        {customer.status}
                      </span>
                    </td>

                    <td className="pl-5 font-bold bg-gray-200">
                      <button
                        onClick={() =>
                          toggleStatus(customer._id, customer.status)
                        }
                        className="focus:ring-1 focus:ring-offset-2 focus:ring-red-300 text-sm leading-none text-gray-600 py-3 px-5 bg-gray-200 rounded hover:bg-gray-100 focus:outline-none"
                      >
                        {customer.status === "Active" ? (
                          <BsToggleOff size={20} />
                        ) : (
                          <BsToggleOn size={20} />
                        )}
                      </button>
                    </td>

                    <td className="pl-5 gap-2 font-bold bg-gray-100">
                      <button
                        onClick={() => {
                          setShowModalEdit(true);
                          setModifiedUser(customer);
                        }}
                        className="focus:ring-1 focus:ring-offset-2 focus:ring-blue-300 text-sm leading-none text-gray-600 py-3 px-5 bg-gray-100 rounded hover:bg-gray-200 focus:outline-none"
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

          {/* Pagination Controls */}
          <div className="flex items-center justify-between border-t border-gray-200 bg-white py-3 sm:px-6">
            <p className="text-sm text-gray-700">
              Showing{" "}
              <span className="font-medium">
                <strong>{indexOfFirst + 1}</strong>
              </span>{" "}
              to{" "}
              <span className="font-medium">
                <strong>{Math.min(indexOfLast, allCustomers.length)}</strong>
              </span>{" "}
              of{" "}
              <span className="font-medium">
                <strong>{allCustomers.length}</strong>
              </span>{" "}
              <strong>Customers</strong>
            </p>

            <nav
              aria-label="Pagination"
              className="isolate inline-flex -space-x-px rounded-md shadow-xs"
            >
              {/* Prev Button */}
              <button
                onClick={prevPage}
                disabled={currentPage === 1}
                className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-gray-300 ring-inset hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${
                  currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <IoIosArrowBack aria-hidden="true" className="size-5" />
              </button>

              {/* Page Numbers */}
              {(() => {
                const maxPagesToShow = 10;
                let startPage = Math.max(
                  1,
                  currentPage - Math.floor(maxPagesToShow / 2)
                );
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
                    className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-gray-300 ring-inset hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${
                      currentPage === page ? "bg-green-500/80 text-white" : ""
                    }`}
                  >
                    {page}
                  </button>
                ));
              })()}

              {/* Next Button */}
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
        </div>
      </div>

      <AddCustomer showModal={showModalAdd} setShowModal={setShowModalAdd} />

      <EditCustomer
        showModal={showModalEdit}
        setShowModal={setShowModalEdit}
        customer={modifiedUser}
      />
    </div>
  );
};

export default CustomerManagement;
