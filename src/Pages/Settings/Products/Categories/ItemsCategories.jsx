// React Imports
import { useEffect, useState } from "react";

// Pages Imports
import AddCategory from './AddCategory'
import EditCategory from './EditCategory'

// Icons Imports
import { FaSearch, FaUserEdit } from "react-icons/fa";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";


const ItemsCategories = () => {
  const [categories, setCategories] = useState([]); // Changed users to categories
  const [showError, setShowError] = useState("");
  
  // Filter and Search State
  const [filterStatus, setFilterStatus] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [totalItems, setTotalItems] = useState(0);

  // Fetch data with pagination and search
  const fetchData = async () => {
    try {
      const response = await fetch(`http://localhost:4004/api/itemsCategories/getItemCategories?page=${currentPage}&limit=${itemsPerPage}&search=${searchQuery}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch categories");
      }
      
      const data = await response.json();
      
      // Update the state with fetched data
      setCategories(data.data);
      setTotalPages(data.totalPages);
      setTotalItems(data.totalItems);
      setItemsPerPage(data.itemsPerPage);
      setShowError("");
    } catch (error) {
      console.error("Error fetching categories:", error);
      setShowError("An error occurred. Please contact the system administrator.");
    }
  };

  useEffect(() => {
    fetchData(); // Fetch data when component mounts or dependencies change
  }, [currentPage, searchQuery]); // Fetch data when currentPage or searchQuery changes

  // Handlers for Pagination
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

  // Modal States
  const [showModalAdd, setShowModalAdd] = useState(false);
  const [showModalEdit, setShowModalEdit] = useState(false);
  const [modifiedCategory, setModifiedCategory] = useState(null);

  return (
    <div className="sm:px-6 w-full">
      {/* Title */}
      <div className="px-4 md:px-10 py-4 md:py-7">
        <div className="flex items-center justify-between">
          <p className="text-lg md:text-xl lg:text-2xl font-bold text-gray-800">
            Item Categories
          </p>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="sm:flex items-center justify-between ml-9">
        <div className="flex items-center">
          {["All", "Active", "Inactive"].map((status) => (
            <button
              key={status}
              className={`rounded-full py-2 px-8 mx-2 ${
                filterStatus === status ? "bg-green-300 text-black" : "bg-gray-200 text-gray-600"
              } hover:text-black hover:bg-indigo-100 border-gray-400`}
              onClick={() => {
                setFilterStatus(status);
                setCurrentPage(1); // Reset pagination when changing status filter
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
            value={searchQuery}
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
            + Add Category
          </p>
        </button>
      </div>

      {/* Table Container */}
      <div className="bg-white py-4 md:py-7 px-4 md:px-8 xl:px-10">
        {/* Error Message */}
        {showError && (
          <div
            className="mt-2 bg-red-100/70 border border-red-200 text-sm text-red-800 rounded-lg p-4"
            role="alert"
          >
            <span className="font-bold">Error: </span> {showError}
          </div>
        )}
        <div className="mt-7 overflow-x-auto">
          <table className="w-full whitespace-nowrap">
            <thead className="bg-gray-200 text-black">
              <tr>
                <th className="border border-gray-300 px-4 py-2 text-left">SN</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Name</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Description</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>

            <tbody>
              {categories.map((category, index) => (
                <tr key={category._id} className="h-16 border-gray-500 shadow-md bg-gray-100">
                  <td className="pl-5 font-bold">
                    <p className="text-sm leading-none text-gray-600">
                      {index + 1 + (currentPage - 1) * itemsPerPage}
                    </p>
                  </td>
                  <td className="pl-5 font-bold">
                    <p className="text-sm leading-none text-gray-600">{category.name}</p>
                  </td>
                  <td className="pl-5 font-bold">
                    <p className="text-sm leading-none text-gray-600">{category.description}</p>
                  </td>
                  <td className="pl-4 gap-2 font-bold">
                    <button
                      onClick={() => {
                        setShowModalEdit(true);
                        setModifiedCategory(category);
                      }}
                      className="focus:ring-1 focus:ring-offset-2 focus:ring-blue-300 text-sm leading-none text-gray-600 py-3 px-5 bg-gray-100 rounded hover:bg-gray-200"
                    >
                      <FaUserEdit size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex items-center justify-between border-t border-gray-200 bg-white py-3 sm:px-6">
            <p className="text-sm text-gray-700">
              Showing{" "}
              <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{" "}
              <span className="font-medium">{Math.min(currentPage * itemsPerPage, totalItems)}</span> of{" "}
              <span className="font-medium">{totalItems}</span> results
            </p>

            <nav aria-label="Pagination" className="isolate inline-flex -space-x-px rounded-md shadow-xs">
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
                  currentPage === totalPages ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <IoIosArrowForward aria-hidden="true" className="size-5" />
              </button>
            </nav>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddCategory showModal={showModalAdd} setShowModal={setShowModalAdd} onCategoryAdded={fetchData} modifiedUser={modifiedCategory}/>
      <EditCategory showModal={showModalEdit} setShowModal={setShowModalEdit} onCategoryUpdated={fetchData} modifiedUser={modifiedCategory}/>
    </div>
  );
};

export default ItemsCategories;
