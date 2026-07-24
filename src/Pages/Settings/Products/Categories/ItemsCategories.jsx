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
  const [expandedCategory, setExpandedCategory] = useState(null);

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
    <div className="p-2 sm:p-3 md:p-4 lg:p-5 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-black">
            Item Categories
          </h1>
          <p className="text-gray-600 text-xs hidden sm:block">
            Manage and organize item categories
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            className="px-3 py-2 bg-green-300 hover:bg-green-400 text-black font-bold rounded-full shadow text-xs flex items-center gap-1.5 flex-shrink-0"
          >
            <FaSync className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {canAddCategory ? (
            <button
              onClick={() => setShowModalAdd(true)}
              className="px-3 py-2 bg-green-300 hover:bg-green-400 text-black font-bold rounded-full shadow text-xs flex items-center gap-1.5 flex-shrink-0"
            >
              <FaPlus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Add Category</span>
              <span className="sm:hidden">Add</span>
            </button>
          ) : (
            <div className="relative group">
              <button
                disabled
                className="px-3 py-2 bg-gray-300 text-gray-500 font-bold rounded-full cursor-not-allowed text-xs flex items-center gap-1.5"
              >
                <FaPlus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Add Category</span>
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
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3 sm:mb-4">
        <div className="bg-white border border-gray-200 rounded-full p-2.5 sm:p-3 shadow-sm text-center">
          <p className="text-[10px] sm:text-xs text-gray-500 font-medium mb-0.5">
            Total Categories
          </p>
          <p className="text-xs sm:text-sm md:text-base font-bold text-black">
            {totalCategories}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-full p-2.5 sm:p-3 shadow-sm text-center">
          <p className="text-[10px] sm:text-xs text-gray-500 font-medium mb-0.5">
            Filtered
          </p>
          <p className="text-xs sm:text-sm md:text-base font-bold text-black">
            {filteredCategories.length}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-full p-2.5 sm:p-3 shadow-sm text-center">
          <p className="text-[10px] sm:text-xs text-gray-500 font-medium mb-0.5">
            With Description
          </p>
          <p className="text-xs sm:text-sm md:text-base font-bold text-green-600">
            {categoriesWithDesc}
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex gap-2 mb-3 sm:mb-4">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-3 sm:left-4 flex items-center">
            <FaSearch className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search category name..."
            className="w-full pl-9 sm:pl-11 pr-8 py-2.5 sm:py-3 text-sm border border-gray-300 rounded-full bg-white text-black focus:border-green-300 focus:outline-none focus:ring-2 focus:ring-green-100"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute inset-y-0 right-3 flex items-center text-gray-400"
            >
              <span className="text-xl leading-none">×</span>
            </button>
          )}
        </div>
      </div>

      {/* Error Alert */}
      {showError && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-full p-4 mb-4 flex items-center gap-3">
          <FaExclamationTriangle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-bold">{showError}</p>
        </div>
      )}

      {/* Results Count */}
      <div className="flex items-center justify-between mb-2 px-1">
        <p className="text-xs text-gray-500">
          <span className="font-bold text-black">{filteredCategories.length}</span>{" "}
          categories found
        </p>
        <p className="text-[10px] text-gray-400">
          Page {currentPage} of {totalPages || 1}
        </p>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-2 mb-4">
        {currentItems.length === 0 ? (
          <div className="bg-white rounded-xl p-6 text-center border border-gray-200">
            <div className="text-3xl mb-2">🏷️</div>
            <p className="text-sm font-bold text-black">No categories found</p>
            <p className="text-xs text-gray-500">Try adjusting filters</p>
          </div>
        ) : (
          currentItems.map((catego) => {
            const isExpanded = expandedCategory === catego._id;
            return (
              <div
                key={catego._id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm"
              >
                {/* Card Header - Click to expand */}
                <div
                  className="p-3 bg-gradient-to-r from-green-100 to-green-200 cursor-pointer"
                  onClick={() =>
                    setExpandedCategory(isExpanded ? null : catego._id)
                  }
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm flex-shrink-0">
                        <FaTags className="text-green-600" size={16} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-black truncate">
                          {catego.name}
                        </p>
                        <p className="text-[10px] text-gray-600 truncate">
                          {catego.description || "No description"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {isExpanded ? (
                        <FaChevronUp className="text-gray-500" size={18} />
                      ) : (
                        <FaChevronDown className="text-gray-500" size={18} />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="p-3 space-y-3">
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                      <p className="text-[10px] text-gray-500 font-medium">
                        Category Name
                      </p>
                      <p className="text-sm font-bold text-black">
                        {catego.name}
                      </p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                      <p className="text-[10px] text-green-600 font-medium">
                        Description
                      </p>
                      <p className="text-sm font-bold text-black">
                        {catego.description || (
                          <span className="italic text-gray-400">
                            No description
                          </span>
                        )}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="pt-2 border-t border-gray-200">
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
                          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-gray-200 text-gray-400 font-bold rounded-full text-xs cursor-not-allowed border border-gray-300"
                        >
                          <AiTwotoneEdit className="w-3.5 h-3.5" />
                          No Permission
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

      {/* Desktop Card View - Same style as CompletedNonPO */}
      <div className="hidden lg:block space-y-3">
        {currentItems.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center border border-gray-200">
            <div className="text-4xl mb-3">🏷️</div>
            <h3 className="text-lg font-bold text-black mb-2">
              No Categories Found
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              {searchQuery
                ? "No categories match your search"
                : "No categories found in the system"}
            </p>
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="px-4 py-2 bg-green-300 hover:bg-green-400 text-black font-bold rounded-full transition-colors text-sm"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          currentItems.map((catego) => {
            const isExpanded = expandedCategory === catego._id;
            return (
              <div
                key={catego._id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Header */}
                <div
                  className="p-4 bg-gradient-to-r from-green-100 to-green-200 cursor-pointer"
                  onClick={() =>
                    setExpandedCategory(isExpanded ? null : catego._id)
                  }
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                        <FaTags className="text-green-600" size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-black">{catego.name}</p>
                        <p className="text-xs text-gray-600">
                          {catego.description
                            ? catego.description.length > 60
                              ? catego.description.substring(0, 60) + "..."
                              : catego.description
                            : "No description"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2.5 py-1 bg-white/60 rounded-full text-xs font-bold text-gray-700">
                          {catego.description ? "Has Description" : "No Description"}
                        </span>
                      </div>
                      {isExpanded ? (
                        <FaChevronUp className="text-gray-500" size={20} />
                      ) : (
                        <FaChevronDown className="text-gray-500" size={20} />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="p-4 border-t border-gray-200">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <p className="text-xs text-gray-500 font-medium mb-1">
                          Category Name
                        </p>
                        <p className="text-lg font-bold text-black">
                          {catego.name}
                        </p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                        <p className="text-xs text-green-600 font-medium mb-1">
                          Description
                        </p>
                        <p className="text-sm font-bold text-black">
                          {catego.description || (
                            <span className="italic text-gray-400">
                              No description provided
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-4 pt-3 border-t border-gray-200">
                      {canEditCategory ? (
                        <button
                          onClick={() => {
                            setShowModalEdit(true);
                            setModifiedCategory(catego);
                          }}
                          className="px-4 py-2 bg-green-300 hover:bg-green-400 text-black font-bold rounded-full text-sm transition-all flex items-center gap-2 border border-green-400"
                        >
                          <AiTwotoneEdit className="w-4 h-4" />
                          Edit Category
                        </button>
                      ) : (
                        <button
                          disabled
                          className="px-4 py-2 bg-gray-200 text-gray-400 font-bold rounded-full text-sm cursor-not-allowed border border-gray-300 flex items-center gap-2"
                        >
                          <AiTwotoneEdit className="w-4 h-4" />
                          No Permission
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-2 mt-3 sm:mt-4 p-3 bg-white rounded-full border border-gray-200 shadow-sm">
          <button
            onClick={prevPage}
            disabled={currentPage === 1}
            className="p-2 bg-gray-100 hover:bg-gray-200 text-black rounded-full disabled:opacity-40"
          >
            <IoIosArrowBack className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1">
            {[...Array(Math.min(totalPages, 5))].map((_, i) => {
              let pageNum;
              if (totalPages <= 5) pageNum = i + 1;
              else if (currentPage <= 3) pageNum = i + 1;
              else if (currentPage >= totalPages - 2)
                pageNum = totalPages - 4 + i;
              else pageNum = currentPage - 2 + i;

              return (
                <button
                  key={i}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-8 h-8 text-xs font-bold rounded-full transition-colors ${
                    currentPage === pageNum
                      ? "bg-black text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={nextPage}
            disabled={currentPage === totalPages}
            className="p-2 bg-gray-100 hover:bg-gray-200 text-black rounded-full disabled:opacity-40"
          >
            <IoIosArrowForward className="w-4 h-4" />
          </button>
        </div>
      )}

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