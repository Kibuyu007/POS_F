import { useEffect, useState } from "react";
import AddCategory from "./AddCategory";
import EditCategory from "./EditCategory";
import { FaSearch, FaTags, FaFilter, FaInfoCircle } from "react-icons/fa";
import {
  IoIosArrowBack,
  IoIosArrowForward,
  IoMdAdd,
  IoMdRefresh,
} from "react-icons/io";
import { AiTwotoneEdit } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import { categoriesFetch } from "../../../../Redux/itemsCategories";
import BASE_URL from "../../../../Utils/config";
import toast from "react-hot-toast";

const ItemsCategories = () => {
  const user = useSelector((state) => state.user.user);
  const { category = [] } = useSelector((state) => state.category);
  const dispatch = useDispatch();

  const [showError, setShowError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filtered categories based on search
  const filteredCategories = category.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalItems = filteredCategories.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const currentItems = filteredCategories.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const fetchData = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/api/itemsCategories/getItemCategories`
      );
      if (!response.ok) throw new Error("Failed to fetch categories");
      const data = await response.json();
      dispatch(categoriesFetch({ data: data.data }));
      setShowError("");
      toast.success("Categories loaded successfully!");
    } catch (error) {
      console.error("Error fetching categories:", error);
      setShowError(
        "An error occurred. Please contact the system administrator."
      );
      toast.error("Failed to load categories");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Pagination handlers
  const nextPage = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));

  // Modal states
  const [showModalAdd, setShowModalAdd] = useState(false);
  const [showModalEdit, setShowModalEdit] = useState(false);
  const [modifiedCategory, setModifiedCategory] = useState(null);

  // Calculate stats
  const totalCategories = category.length;
  const categoriesWithDesc = category.filter(
    (c) => c.description && c.description.trim() !== ""
  ).length;

  const clearSearch = () => {
    setSearchQuery("");
    setCurrentPage(1);
  };

  // Check if user has add permission
  const canAddCategory = user?.roles?.canAddCategory === true;
  
  // Check if user has edit permission
  const canEditCategory = user?.roles?.canEditCategory === true;

  return (
    <div className="p-5 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-black mb-1">
            Item Categories
          </h1>
          <p className="text-gray-600 text-sm">
            Manage and organize item categories
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
              <p className="text-xs text-gray-500 font-medium">
                Total Categories
              </p>
              <p className="text-base font-bold text-black">
                {totalCategories}
              </p>
            </div>

            <div className="h-6 w-px bg-gray-300"></div>

            <div className="text-center px-3">
              <p className="text-xs text-gray-500 font-medium">Filtered</p>
              <p className="text-base font-bold text-black">
                {filteredCategories.length}
              </p>
            </div>

            <div className="h-6 w-px bg-gray-300"></div>

            <div className="text-center px-3">
              <p className="text-xs text-gray-500 font-medium">
                With Description
              </p>
              <p className="text-base font-bold text-green-600">
                {categoriesWithDesc}
              </p>
            </div>
          </div>

          {/* Add Category Button with Permission Check */}
          {canAddCategory ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowModalAdd(true)}
                className="px-4 py-2 bg-green-300 hover:bg-green-400 text-black font-bold rounded-full shadow hover:shadow-md transition-all duration-200 flex items-center gap-2 text-sm"
              >
                <IoMdAdd className="w-4 h-4" />
                <span>Add Category</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                disabled
                className="px-4 py-2 bg-gray-300 text-gray-500 font-bold rounded-full shadow flex items-center gap-2 text-sm cursor-not-allowed"
                title="You don't have permission to add categories"
              >
                <IoMdAdd className="w-4 h-4" />
                <span>Add Category</span>
              </button>
              <div className="relative group">
                <div className="text-gray-500">
                  <FaInfoCircle className="w-5 h-5" />
                </div>
                <div className="absolute right-0 top-full mt-2 w-64 p-3 bg-gray-800 text-white text-sm rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                  <div className="absolute -top-1 right-3 w-3 h-3 bg-gray-800 transform rotate-45"></div>
                  <p className="font-semibold">Permission Required</p>
                  <p className="mt-1 text-gray-300">
                    You need the <span className="font-bold">Add Categories</span> permission to create new categories.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Filter & Search - Compact & Clean */}
      <div className="mb-6 rounded-xl p-4 shadow bg-white">
        <div className="flex items-center gap-3 mb-4">
          <FaFilter className="w-4 h-4 text-green-600" />
          <h3 className="text-sm font-bold text-black">Search Categories</h3>
        </div>

        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center">
                <FaSearch className="w-4 h-4 text-gray-500" />
              </div>
              <input
                type="text"
                placeholder="Search category name..."
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
                {["#", "Category Name", "Description", "Action"].map(
                  (header, idx) => (
                    <th
                      key={idx}
                      className="px-4 py-3 text-center text-xs font-bold text-black uppercase border-r border-gray-300"
                    >
                      {header}
                    </th>
                  )
                )}
              </tr>
            </thead>

            <tr className="h-3" />

            <tbody>
              {currentItems.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-12">
                    <div className="space-y-3">
                      <div className="text-4xl">🏷️</div>
                      <p className="text-lg font-bold text-black">
                        No categories found
                      </p>
                      <p className="text-gray-600 text-sm">
                        {searchQuery
                          ? "Try a different search term"
                          : "Start by adding your first category"}
                      </p>
                      {canAddCategory && !searchQuery && (
                        <button
                          onClick={() => setShowModalAdd(true)}
                          className="mt-2 px-4 py-2 bg-green-300 hover:bg-green-400 text-black font-bold rounded-full transition-colors text-sm"
                        >
                          Add First Category
                        </button>
                      )}
                      {!canAddCategory && !searchQuery && (
                        <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                          <p className="text-sm text-amber-800 font-medium">
                            <span className="font-bold">Permission Required:</span> You need Add Categories permission to create new categories.
                          </p>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                currentItems.map((catego, index) => (
                  <>
                    <tr
                      key={catego._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      {/* # Column - Green 300 */}
                      <td className="py-3 px-3 text-center border-r border-gray-300 bg-gray-200">
                        <span className="inline-flex items-center justify-center w-8 h-8 bg-green-300 text-black font-bold rounded-full text-xs">
                          {(currentPage - 1) * itemsPerPage + index + 1}
                        </span>
                      </td>

                      {/* Category Name Column - Gray 200 */}
                      <td className="py-3 px-3 text-center bg-gray-100 border-r border-gray-200">
                        <div className="flex items-center justify-center gap-2">
                          <FaTags className="w-4 h-4 text-green-600" />
                          <span className="font-bold text-black text-sm">
                            {catego.name}
                          </span>
                        </div>
                      </td>

                      {/* Description Column - Green 200 */}
                      <td className="py-3 px-3 text-center bg-green-200 border-r border-gray-200">
                        <span className="font-bold text-black text-sm">
                          {catego.description || (
                            <span className="text-gray-500 italic">
                              No description
                            </span>
                          )}
                        </span>
                      </td>

                      {/* Action Column - Gray 200 */}
                      <td className="py-3 px-3 text-center bg-gray-200">
                        {canEditCategory ? (
                          <button
                            onClick={() => {
                              setShowModalEdit(true);
                              setModifiedCategory(catego);
                            }}
                            className="p-2 bg-green-300 hover:bg-green-400 text-black rounded-full transition-colors"
                            title="Edit Category"
                          >
                            <AiTwotoneEdit className="w-4 h-4" />
                          </button>
                        ) : (
                          <div className="relative group inline-block">
                            <button
                              disabled
                              className="p-2 bg-gray-300 text-gray-500 rounded-full cursor-not-allowed"
                              title="You don't have permission to edit categories"
                            >
                              <AiTwotoneEdit className="w-4 h-4" />
                            </button>
                            <div className="absolute right-0 top-full mt-2 w-64 p-3 bg-gray-800 text-white text-sm rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                              <div className="absolute -top-1 right-3 w-3 h-3 bg-gray-800 transform rotate-45"></div>
                              <p className="font-semibold">Permission Required</p>
                              <p className="mt-1 text-gray-300">
                                You need the <span className="font-bold">Edit Categories</span> permission to modify existing categories.
                              </p>
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>
                    <tr className="h-3">
                      <td colSpan={4} className="p-0"></td>
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
                Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                {Math.min(currentPage * itemsPerPage, totalItems)}
              </span>{" "}
              of <span className="font-bold text-black">{totalItems}</span>{" "}
              categories
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
                    (pageNum === currentPage - 2 ||
                      pageNum === currentPage + 2) &&
                    totalPages > 5
                  ) {
                    return (
                      <span
                        key={i}
                        className="px-2 text-gray-500 font-bold text-xs"
                      >
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

      {/* Modals - Only render if user has permission */}
      {canAddCategory && (
        <AddCategory
          showModal={showModalAdd}
          setShowModal={setShowModalAdd}
          onCategoryAdded={fetchData}
        />
      )}
      
      {canEditCategory && modifiedCategory && (
        <EditCategory
          showModal={showModalEdit}
          setShowModal={setShowModalEdit}
          onCategoryUpdated={fetchData}
          catego={modifiedCategory}
        />
      )}
    </div>
  );
};

export default ItemsCategories;