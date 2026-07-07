import React from "react";
import { useEffect, useState } from "react";
import AddCategory from "./AddCategory";
import EditCategory from "./EditCategory";
import {
  FaSearch,
  FaTags,
  FaFilter,
  FaInfoCircle,
  FaPlus,
  FaSync,
  FaExclamationTriangle,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { AiTwotoneEdit } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import { categoriesFetch } from "../../../../Redux/itemsCategories";
import toast from "react-hot-toast";

//URL
import BASE_URL from "../../../../Utils/config";

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
    c.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const totalItems = filteredCategories.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const currentItems = filteredCategories.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const fetchData = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/api/itemsCategories/getItemCategories`,
      );
      if (!response.ok) throw new Error("Failed to fetch categories");
      const data = await response.json();
      dispatch(categoriesFetch({ data: data.data }));
      setShowError("");
      toast.success("Categories loaded successfully!");
    } catch (error) {
      console.error("Error fetching categories:", error);
      setShowError(
        "An error occurred. Please contact the system administrator.",
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
  const [expandedCategory, setExpandedCategory] = useState(null);

  // Calculate stats
  const totalCategories = category.length;
  const categoriesWithDesc = category.filter(
    (c) => c.description && c.description.trim() !== "",
  ).length;

  const clearSearch = () => {
    setSearchQuery("");
    setCurrentPage(1);
  };

  // Check permissions
  const canAddCategory = user?.roles?.canAddCategory === true;
  const canEditCategory = user?.roles?.canEditCategory === true;

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-5 gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-black">
              Item Categories
            </h1>
            <p className="text-sm text-gray-600 mt-0.5 hidden sm:block">
              Manage and organize item categories
            </p>
          </div>

          {/* Desktop Actions */}
          <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
            <button
              onClick={fetchData}
              className="flex items-center gap-2 px-4 py-2.5 bg-green-300 hover:bg-green-400 text-black font-bold rounded-full border border-green-400 shadow-sm text-sm transition-all"
            >
              <FaSync className="w-4 h-4" />
              <span>Refresh</span>
            </button>

            {canAddCategory ? (
              <button
                onClick={() => setShowModalAdd(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-green-300 hover:bg-green-400 text-black font-bold rounded-full border border-green-400 shadow-sm transition-all text-sm"
              >
                <FaPlus className="w-4 h-4" />
                <span>Add Category</span>
              </button>
            ) : (
              <div className="relative group">
                <button
                  disabled
                  className="flex items-center gap-2 px-4 py-2.5 bg-gray-300 text-gray-500 font-bold rounded-full border border-gray-400 cursor-not-allowed text-sm"
                >
                  <FaPlus className="w-4 h-4" />
                  <span>Add Category</span>
                </button>
                <div className="absolute right-0 top-full mt-2 w-64 p-3 bg-gray-800 text-white text-sm rounded-2xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <p className="font-bold mb-1">Permission Required</p>
                  <p className="text-gray-300 text-xs">
                    You need the{" "}
                    <span className="font-bold text-green-300">
                      Add Categories
                    </span>{" "}
                    permission to create new categories.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Actions - 3 small buttons in a row */}
          <div className="sm:hidden flex items-center gap-2 w-full">
            <button
              onClick={fetchData}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-green-300 hover:bg-green-400 text-black font-bold rounded-full border border-green-400 shadow-sm text-xs transition-all"
            >
              <FaSync className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>

            {canAddCategory ? (
              <button
                onClick={() => setShowModalAdd(true)}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-green-300 hover:bg-green-400 text-black font-bold rounded-full border border-green-400 shadow-sm text-xs transition-all"
              >
                <FaPlus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            ) : (
              <button
                disabled
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-gray-300 text-gray-500 font-bold rounded-full border border-gray-400 cursor-not-allowed text-xs"
              >
                <FaPlus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            )}
          </div>
        </div>

        {/* Stats Cards - Rounded Full */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-5">
          <div className="bg-white rounded-full border border-gray-300 p-3 sm:p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-green-200 rounded-full flex items-center justify-center flex-shrink-0 border border-green-400">
                <FaTags className="w-4 h-4 sm:w-5 sm:h-5 text-green-700" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs text-gray-600 font-bold truncate">
                  Total Categories
                </p>
                <p className="text-lg sm:text-xl font-bold text-black">
                  {totalCategories}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-full border border-gray-300 p-3 sm:p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-blue-200 rounded-full flex items-center justify-center flex-shrink-0 border border-blue-400">
                <FaFilter className="w-4 h-4 sm:w-5 sm:h-5 text-blue-700" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs text-gray-600 font-bold truncate">
                  Filtered
                </p>
                <p className="text-lg sm:text-xl font-bold text-black">
                  {filteredCategories.length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-full border border-gray-300 p-3 sm:p-4 shadow-sm hover:shadow-md transition-shadow col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-green-200 rounded-full flex items-center justify-center flex-shrink-0 border border-green-400">
                <FaInfoCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-700" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs text-gray-600 font-bold truncate">
                  With Description
                </p>
                <p className="text-lg sm:text-xl font-bold text-green-700">
                  {categoriesWithDesc}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar - Rounded Full */}
        <div className="bg-white rounded-full border border-gray-300 p-4 shadow-sm mb-5">
          <div className="relative">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <FaSearch className="w-4 h-4 text-gray-500" />
            </div>
            <input
              type="text"
              placeholder="Search category name..."
              className="w-full pl-11 pr-11 py-2.5 bg-gray-100 border border-gray-300 rounded-full text-sm text-black placeholder-gray-500 focus:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-100 transition-all"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute inset-y-0 right-4 flex items-center text-gray-400 hover:text-gray-600"
              >
                <span className="text-xl leading-none">×</span>
              </button>
            )}
          </div>
        </div>

        {/* Error Alert - Rounded Full */}
        {showError && (
          <div className="bg-red-100 border border-red-300 rounded-full p-4 mb-5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-red-200 rounded-full flex items-center justify-center flex-shrink-0">
                <FaExclamationTriangle className="w-4 h-4 text-red-700" />
              </div>
              <p className="text-sm text-red-800 font-bold">{showError}</p>
            </div>
          </div>
        )}

        {/* Results Count */}
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm text-gray-600">
            <span className="font-bold text-black">
              {filteredCategories.length}
            </span>{" "}
            categories found
          </p>
          <p className="text-xs text-gray-500">
            Page {currentPage} of {totalPages || 1}
          </p>
        </div>

        {/* ===== MOBILE & TABLET VIEW (Cards) ===== */}
        <div className="lg:hidden space-y-3">
          {currentItems.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-gray-300 shadow-sm">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaTags className="w-8 h-8 text-gray-500" />
              </div>
              <h3 className="text-lg font-bold text-black mb-1">
                No categories found
              </h3>
              <p className="text-sm text-gray-600">
                {searchQuery
                  ? "Try a different search term"
                  : "Start by adding your first category"}
              </p>
              {canAddCategory && !searchQuery && (
                <button
                  onClick={() => setShowModalAdd(true)}
                  className="mt-4 px-5 py-2.5 bg-green-300 hover:bg-green-400 text-black font-bold rounded-full transition-all border border-green-400"
                >
                  Add First Category
                </button>
              )}
              {!canAddCategory && !searchQuery && (
                <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <p className="text-sm text-amber-800 font-medium">
                    <span className="font-bold">Permission Required:</span> You
                    need Add Categories permission to create new categories.
                  </p>
                </div>
              )}
            </div>
          ) : (
            currentItems.map((catego) => {
              const isExpanded = expandedCategory === catego._id;
              return (
                <div
                  key={catego._id}
                  className="bg-white rounded-2xl border border-gray-300 overflow-hidden shadow-sm hover:shadow-md transition-all"
                >
                  {/* Card Header */}
                  <div
                    className="p-4"
                    onClick={() =>
                      setExpandedCategory(isExpanded ? null : catego._id)
                    }
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 bg-green-200 rounded-full flex items-center justify-center flex-shrink-0 border border-green-400">
                          <FaTags className="w-4 h-4 text-green-700" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-black text-sm truncate">
                            {catego.name}
                          </h3>
                          <p className="text-xs text-gray-600 mt-1">
                            {catego.description || (
                              <span className="italic text-gray-400">
                                No description
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        {isExpanded ? (
                          <FaChevronUp className="w-5 h-5 text-gray-500" />
                        ) : (
                          <FaChevronDown className="w-5 h-5 text-gray-500" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-gray-200">
                      <div className="mt-3 space-y-2">
                        <div className="bg-gray-100 rounded-full p-3 border border-gray-300">
                          <span className="text-xs text-gray-600 font-bold block mb-1">
                            Category Name
                          </span>
                          <span className="text-sm font-bold text-black">
                            {catego.name}
                          </span>
                        </div>
                        <div className="bg-green-100 rounded-full p-3 border border-green-300">
                          <span className="text-xs text-green-700 font-bold block mb-1">
                            Description
                          </span>
                          <span className="text-sm font-bold text-black">
                            {catego.description || (
                              <span className="italic text-gray-400">
                                No description
                              </span>
                            )}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="mt-4">
                        {canEditCategory ? (
                          <button
                            onClick={() => {
                              setShowModalEdit(true);
                              setModifiedCategory(catego);
                            }}
                            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-green-300 hover:bg-green-400 text-black font-bold rounded-full text-xs transition-all border border-green-400"
                          >
                            <AiTwotoneEdit className="w-3.5 h-3.5" />
                            Edit Category
                          </button>
                        ) : (
                          <button
                            disabled
                            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-gray-300 text-gray-500 font-bold rounded-full text-xs cursor-not-allowed border border-gray-400"
                          >
                            <AiTwotoneEdit className="w-3.5 h-3.5" />
                            Edit (No Permission)
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* ===== DESKTOP VIEW (Table - NOT rounded full) ===== */}
        <div className="hidden lg:block bg-white rounded-xl border border-gray-300 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="bg-green-200 border-b border-green-400">
                  {["SN", "Category Name", "Description", "Action"].map(
                    (header, idx) => (
                      <th
                        key={idx}
                        className="px-4 py-3.5 text-center text-xs font-bold text-black uppercase tracking-wider whitespace-nowrap border-r border-green-300"
                      >
                        {header}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {currentItems.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-16">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                          <FaTags className="w-8 h-8 text-gray-500" />
                        </div>
                        <div>
                          <p className="text-lg font-bold text-black">
                            No categories found
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            {searchQuery
                              ? "Try a different search term"
                              : "Start by adding your first category"}
                          </p>
                        </div>
                        {canAddCategory && !searchQuery && (
                          <button
                            onClick={() => setShowModalAdd(true)}
                            className="mt-2 px-5 py-2.5 bg-green-300 hover:bg-green-400 text-black font-bold rounded-full transition-all border border-green-400"
                          >
                            Add First Category
                          </button>
                        )}
                        {!canAddCategory && !searchQuery && (
                          <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                            <p className="text-sm text-amber-800 font-medium">
                              <span className="font-bold">
                                Permission Required:
                              </span>{" "}
                              You need Add Categories permission.
                            </p>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentItems.map((catego, index) => (
                    <React.Fragment key={catego._id}>
                      <tr className="hover:bg-green-50 transition-colors cursor-pointer group">
                        <td className="px-4 py-4 text-center border-r border-gray-200">
                          <span className="inline-flex items-center justify-center w-8 h-8 bg-green-300 text-black font-bold rounded-full text-xs">
                            {(currentPage - 1) * itemsPerPage + index + 1}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center border-r border-gray-200">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-8 h-8 bg-green-200 rounded-full flex items-center justify-center border border-green-400">
                              <FaTags className="w-4 h-4 text-green-700" />
                            </div>
                            <span className="font-bold text-black text-sm">
                              {catego.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center border-r border-gray-200">
                          <span className="text-sm font-bold text-black">
                            {catego.description || (
                              <span className="text-gray-500 italic">
                                No description
                              </span>
                            )}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          {canEditCategory ? (
                            <button
                              onClick={() => {
                                setShowModalEdit(true);
                                setModifiedCategory(catego);
                              }}
                              className="p-2 bg-green-300 hover:bg-green-400 text-black rounded-full transition-all border border-green-400"
                              title="Edit Category"
                            >
                              <AiTwotoneEdit className="w-4 h-4" />
                            </button>
                          ) : (
                            <div className="relative group inline-block">
                              <button
                                disabled
                                className="p-2 bg-gray-300 text-gray-500 rounded-full cursor-not-allowed border border-gray-400"
                              >
                                <AiTwotoneEdit className="w-4 h-4" />
                              </button>
                              <div className="absolute right-0 top-full mt-2 w-64 p-3 bg-gray-800 text-white text-sm rounded-2xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                                <p className="font-bold mb-1">
                                  Permission Required
                                </p>
                                <p className="text-gray-300 text-xs">
                                  You need the{" "}
                                  <span className="font-bold text-green-300">
                                    Edit Categories
                                  </span>{" "}
                                  permission to modify categories.
                                </p>
                              </div>
                            </div>
                          )}
                        </td>
                      </tr>
                      <tr className="h-2">
                        <td colSpan={4} className="p-0 bg-gray-50"></td>
                      </tr>
                    </React.Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Desktop Pagination - Rounded Full */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-gray-300 bg-gray-100">
              <p className="text-sm text-gray-600">
                Showing{" "}
                <span className="font-bold text-black">
                  {(currentPage - 1) * itemsPerPage + 1}
                </span>{" "}
                to{" "}
                <span className="font-bold text-black">
                  {Math.min(currentPage * itemsPerPage, totalItems)}
                </span>{" "}
                of <span className="font-bold text-black">{totalItems}</span>{" "}
                categories
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={prevPage}
                  disabled={currentPage === 1}
                  className="p-2.5 bg-white hover:bg-gray-100 text-black rounded-full border border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <IoIosArrowBack className="w-4 h-4" />
                </button>
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
                        className={`w-9 h-9 text-sm font-bold rounded-full transition-all ${isCurrent ? "bg-green-300 text-black shadow border border-green-400" : "text-black hover:bg-gray-200 border border-gray-300"}`}
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
                      <span key={i} className="px-2 text-gray-500 font-bold">
                        ...
                      </span>
                    );
                  }
                  return null;
                })}
                <button
                  onClick={nextPage}
                  disabled={currentPage === totalPages}
                  className="p-2.5 bg-white hover:bg-gray-100 text-black rounded-full border border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <IoIosArrowForward className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Pagination - Rounded Full */}
        {totalPages > 1 && (
          <div className="lg:hidden flex items-center justify-center gap-2 mt-4">
            <button
              onClick={prevPage}
              disabled={currentPage === 1}
              className="p-2.5 bg-white hover:bg-gray-100 text-black rounded-full border border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <IoIosArrowBack className="w-5 h-5" />
            </button>
            <span className="px-4 py-2 bg-white border border-gray-300 rounded-full text-sm font-bold text-black">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={nextPage}
              disabled={currentPage === totalPages}
              className="p-2.5 bg-white hover:bg-gray-100 text-black rounded-full border border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <IoIosArrowForward className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
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
