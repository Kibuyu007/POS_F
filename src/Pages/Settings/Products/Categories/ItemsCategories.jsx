// React Imports
import { useEffect, useState } from "react";

// Pages Imports
import AddCategory from "./AddCategory";
import EditCategory from "./EditCategory";

// Icons Imports
import { FaSearch } from "react-icons/fa";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import { categoriesFetch } from "../../../../Redux/itemsCategories";
import { AiTwotoneEdit } from "react-icons/ai";

//API
import BASE_URL from "../../../../Utils/config"


const ItemsCategories = () => {
  // Redux State
  const {
    category = [],
    currentPage = 1,
    totalPages,
    itemsPerPage = 6,
    totalItems = 0,
  } = useSelector((state) => state.category);
  const dispatch = useDispatch();

  // const [filterStatus, setFilterStatus] = useState("All");
  const [showError, setShowError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch data with pagination and search
  const fetchData = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/api/itemsCategories/getItemCategories?page=${currentPage}&limit=${itemsPerPage}&search=${searchQuery}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch categories");
      }

      const data = await response.json();
      dispatch(categoriesFetch(data));
      setShowError("");
    } catch (error) {
      console.error("Error fetching categories:", error);
      setShowError(
        "An error occurred. Please contact the system administrator."
      );
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentPage, searchQuery]); // Removed `category` to prevent unnecessary re-fetching

  // Pagination Handlers
  const nextPage = () => {
    if (currentPage < totalPages) {
      dispatch(categoriesFetch({ currentPage: currentPage + 1 }));
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      dispatch(categoriesFetch({ currentPage: currentPage - 1 }));
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
        {/* <div className="flex items-center">
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
                dispatch(categoriesFetch({ currentPage: 1 })); // Reset pagination when changing status filter
              }}
            >
              {status}
            </button>
          ))}
        </div> */}

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
              dispatch(categoriesFetch({ currentPage: 1 })); // Reset pagination when searching
            }}
          />
        </div>

        <button
          onClick={() => setShowModalAdd(true)}
          className="mr-10 focus:ring-2 focus:ring-offset-2 mt-4 sm:mt-0 inline-flex items-start justify-start px-6 py-3 bg-green-300 hover:bg-gray-200 focus:outline-none rounded"
        >
          <p className="text-sm font-medium leading-none text-black">
            + Add Category
          </p>
        </button>
      </div>

      {/* Table Container */}
      <div className="bg-white py-4 md:py-7 px-4 md:px-8 xl:px-10">
        {showError && (
          <div className="mt-2 bg-red-100/70 border border-red-200 text-sm text-red-800 rounded-lg p-4">
            <span className="font-bold">Error: </span> {showError}
          </div>
        )}

        <div className="mt-7 overflow-x-auto">
          <table className="w-full whitespace-nowrap">
            <thead className="bg-gray-200 text-black">
              <tr>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-200 text-center text-xs font-bold text-black uppercase tracking-wider">
                  Index
                </th>

                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-200 text-center text-xs font-bold text-black uppercase tracking-wider">
                  Category Name
                </th>

                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-200 text-center text-xs font-bold text-black uppercase tracking-wider">
                  Description
                </th>

                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-200 text-center text-xs font-bold text-black uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>

            <tr className="h-3" />

            <tbody>
              {category.map((catego, index) => (
                <>
                  <tr
                    key={catego._id}
                    className="h-16 border-gray-500 shadow-md bg-gray-100 "
                  >
                    <td className="pl-5 font-bold hover:bg-green-300/30">
                      <p className="text-sm leading-none text-gray-800">
                        {index + 1 + (currentPage - 1) * itemsPerPage}
                      </p>
                    </td>
                    <td
                      className={`py-2 px-3 bg-gray-200 shadow-md text-base border-x text-center font-semibold ${
                        index == 0
                          ? "border-t border-gray"
                          : index == category?.length
                          ? "border-y border-gray"
                          : "border-t border-gray"
                      } hover:bg-gray-100`}
                    >
                      <div className="flex items-center">
                        <div className="ml-3">
                          <p className="text-gray-900 whitespace-no-wrap  capitalize text-left">
                            {catego.name}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td
                      className={`py-2 px-3  text-base border-x text-center font-semibold ${
                        index == 0
                          ? "border-t border-gray"
                          : index == category?.length
                          ? "border-y border-gray"
                          : "border-t border-gray"
                      } hover:bg-gray-100`}
                    >
                      <div className="flex items-center">
                        <div className="ml-3">
                          <p className="text-gray-900 whitespace-no-wrap  capitalize text-left">
                            {catego.description}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="pl-4 gap-2 font-bold">
                      <button
                        onClick={() => {
                          setShowModalEdit(true);
                          setModifiedCategory(catego);
                        }}
                        className="focus:ring-1 focus:ring-offset-2 focus:ring-blue-300 text-sm leading-none text-gray-600 py-3 px-5 bg-gray-100 rounded hover:bg-gray-200"
                      >
                        <AiTwotoneEdit size={20} />
                      </button>
                    </td>
                  </tr>

                  <tr className="h-4" />
                </>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex items-center justify-between border-t border-gray-200 bg-white py-3 sm:px-6">
            <p className="text-sm text-gray-700">
              Showing{" "}
              <span className="font-medium">
                {(currentPage - 1) * itemsPerPage + 1}
              </span>{" "}
              to{" "}
              <span className="font-medium">
                {Math.min(currentPage * itemsPerPage, totalItems)}
              </span>{" "}
              of <span className="font-medium">{totalItems}</span> results
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
                  onClick={() =>
                    dispatch(
                      categoriesFetch({ ...category, currentPage: i + 1 })
                    )
                  }
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
        </div>
      </div>

      <AddCategory
        showModal={showModalAdd}
        setShowModal={setShowModalAdd}
        onCategoryAdded={fetchData}
      />
      <EditCategory
        showModal={showModalEdit}
        setShowModal={setShowModalEdit}
        onCategoryUpdated={fetchData}
        catego={modifiedCategory}
      />
    </div>
  );
};

export default ItemsCategories;
