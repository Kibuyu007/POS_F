import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  itemsFetch,
  itemsPending,
  itemsError,
  searchItemsPending,
} from "../../../../Redux/items"; // Assuming the itemsSlice is in the same directory


//Pages
import AddItem from "./AddItem";
import EditItem from "./EditItem";

//Icons
import { AiTwotoneEdit } from "react-icons/ai";
import { FaSearch } from "react-icons/fa";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";

//API
import BASE_URL from "../../../../Utils/config";

const Items = () => {
  const dispatch = useDispatch();

  // Redux State
  const {
    items = [],
    currentPage = 1,
    totalPages,
    itemsPerPage = 6,
    totalItems = 0,
  } = useSelector((state) => state.items);
  const { category } = useSelector((state) => state.category);

  const [showError, setShowError] = useState("");

  // Filter and Search State
  const [filterStatus, setFilterStatus] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All"); // New category filter state

  // Fetch data with pagination and search
  const fetchData = async () => {
    try {
      dispatch(itemsPending());
      let url = `${BASE_URL}/api/items/getAllItems?page=${currentPage}&limit=${itemsPerPage}&search=${searchQuery}`;

      if (filterStatus !== "All") {
        url += `&status=${filterStatus.toLowerCase()}`;
      }

      if (categoryFilter !== "All") {
        url += `&category=${categoryFilter}`;
      }

      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch items");

      const data = await response.json();
      dispatch(itemsFetch(data));
      setShowError("");
    } catch (error) {
      console.error("Error fetching items:", error);
      setShowError(
        "An error occurred. Please contact the system administrator."
      );
      dispatch(itemsError(error.message));
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentPage, searchQuery, categoryFilter, filterStatus]);

  // Handlers for Pagination
  const nextPage = () => {
    if (currentPage < totalPages) {
      dispatch(itemsFetch({ ...items, currentPage: currentPage + 1 }));
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      dispatch(itemsFetch({ ...items, currentPage: currentPage - 1 }));
    }
  };

  //formating Price
  const formatPriceWithCommas = (price) => {
    return new Intl.NumberFormat("en-US").format(price);
  };

  // Modal States
  const [showModalAdd, setShowModalAdd] = useState(false);
  const [showModalEdit, setShowModalEdit] = useState(false);
  const [modifiedItem, setModifiedItem] = useState(null);

  // Print Barcode
  const handlePrint = (item) => {
    const win = window.open("", "", "height=400,width=600");
    win.document.write(`
    <html>
      <head>
        <title>Print Barcode</title>
        <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
      </head>
      <body>
        <div style="text-align:center;">
          <h3>${item.name}</h3>
          <svg id="barcode"></svg>
        </div>
        <script>
          window.onload = function() {
            JsBarcode("#barcode", "${item.barCode}", {width:2, height:60, displayValue:true});
            window.print();
            window.onafterprint = () => window.close();
          }
        </script>
      </body>
    </html>
  `);
    win.document.close();
  };

  return (
    <div className="sm:px-6 w-full">
      {/* Title */}
      <div className="px-4 md:px-10 py-4 md:py-7">
        <div className="flex items-center justify-between">
          <p className="text-lg md:text-xl lg:text-2xl font-bold text-gray-800">
            Items
          </p>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="sm:flex items-center justify-between ml-9">
        <div className="flex items-center">
          {["All", "Active", "Expired"].map((status) => (
            <button
              key={status}
              className={`rounded-full py-2 px-8 mx-2 ${
                filterStatus === status
                  ? "bg-green-300 text-black"
                  : "bg-gray-200 text-gray-600"
              } hover:text-black hover:bg-indigo-100 border-gray-400`}
              onClick={() => {
                setFilterStatus(status);
                dispatch(itemsFetch({ ...items, currentPage: 1 }));
              }}
            >
              {status}
            </button>
          ))}
        </div>

        <div className="sm:flex items-center justify-between ml-9">
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              // Reset to first page when category filter changes
              dispatch(itemsFetch({ ...items }));
            }}
            className="ml-4 px-6 py-3 border border-gray-400 rounded-full bg-gray-200/70  text-black"
          >
            <option value="All">All Categories</option>
            {category.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
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
              dispatch(searchItemsPending());
              dispatch(itemsFetch({ ...items, currentPage: 1 }));
            }}
          />
        </div>

        <button
          onClick={() => setShowModalAdd(true)}
          className="mr-10 focus:ring-2 focus:ring-offset-2  mt-4 sm:mt-0 inline-flex items-start justify-start px-6 py-3 bg-green-300 hover:bg-gray-200 focus:outline-none rounded"
        >
          <p className="text-sm font-medium leading-none text-black">
            + Add Item
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

        {/* Status Legend */}
        <div className="mt-4 flex flex-wrap items-center justify-end gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-red-500 shadow" />
            <span className="text-gray-600 dark:text-gray-300">Low Stock</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-blue-200 shadow" />
            <span className="text-gray-600 dark:text-gray-300">
              Normal Stock
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-200 shadow" />
            <span className="text-gray-600 dark:text-gray-300">
              Manufactured
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-red-100 shadow" />
            <span className="text-gray-600 dark:text-gray-300">
              Expires Soon / Expired
            </span>
          </div>
        </div>

        <div className="mt-7 overflow-x-auto">
          <table className="w-full whitespace-nowrap">
            <thead className="bg-gray-200 text-black">
              <tr>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-200 text-center text-xs font-bold text-black uppercase tracking-wider">
                  SN
                </th>

                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-200 text-center text-xs font-bold text-black uppercase tracking-wider">
                  Product
                </th>

                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-200 text-center text-xs font-bold text-black uppercase tracking-wider">
                  Price
                </th>

                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-200 text-center text-xs font-bold text-black uppercase tracking-wider">
                  Quantity
                </th>

                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-200 text-center text-xs font-bold text-black uppercase tracking-wider">
                  Barcode
                </th>

                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-200 text-center text-xs font-bold text-black uppercase tracking-wider">
                  Manf Date
                </th>

                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-200 text-center text-xs font-bold text-black uppercase tracking-wider">
                  Exp Date
                </th>

                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-200 text-center text-xs font-bold text-black uppercase tracking-wider">
                  Category
                </th>

                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-200 text-center text-xs font-bold text-black uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tr className="h-3" />

            <tbody>
              {items
                .filter((item) => {
                  const isExpired = new Date(item.expireDate) < new Date();
                  return (
                    (categoryFilter === "All" ||
                      item.category === categoryFilter) &&
                    (filterStatus === "All" ||
                      (filterStatus === "Expired" && isExpired) ||
                      (filterStatus === "Active" && !isExpired))
                  );
                })
                .map((item, index) => (
                  <>
                    <tr
                      key={item._id}
                      className="h-16 border-gray-500 shadow-md bg-gray-100"
                    >
                      <td
                        className={`pl-5 font-bold  ${
                          item.status === "Expired" ? "bg-red-500" : ""
                        }`}
                      >
                        <p className="text-sm leading-none text-gray-800">
                          {index + 1 + (currentPage - 1) * itemsPerPage}
                        </p>
                      </td>
                      <td
                        className={`py-2 px-3 font-normal text-base border-x bg-gray-200 ${
                          index == 0
                            ? "border-t border-gray"
                            : index == items?.length
                            ? "border-y border-gray"
                            : "border-t border-gray"
                        } hover:bg-gray-100`}
                      >
                        <div className="flex items-center">
                          <div className="ml-3">
                            <p className="text-gray-900 whitespace-no-wrap  capitalize text-left">
                              {item.name}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td
                        className={`py-2 px-3  text-base border-x text-center font-semibold ${
                          index == 0
                            ? "border-t border-gray"
                            : index == items?.length
                            ? "border-y border-gray"
                            : "border-t border-gray"
                        } hover:bg-gray-100`}
                      >
                        <span className="ml-2 mr-3 rounded-full text-black">
                          {" "}
                          {formatPriceWithCommas(item.price)}
                        </span>
                      </td>

                      <td
                        className={`py-2 px-3 font-normal text-base border-x text-center bg-gray-200 ${
                          index == 0
                            ? "border-t border-gray"
                            : index == items?.length
                            ? "border-y border-gray"
                            : "border-t border-gray"
                        } hover:bg-gray-100`}
                      >
                        <span
                          className={`ml-2 mr-3 rounded-full ${
                            item.reOrderStatus === "Low"
                              ? "bg-red-500 text-white"
                              : "bg-blue-200"
                          }  px-2 py-0.5 text-blue-800`}
                        >
                          {formatPriceWithCommas(item.itemQuantity)}
                        </span>
                      </td>
                      <td
                        className={`py-2 px-3 font-normal text-base border-x ${
                          index == 0
                            ? "border-t border-gray"
                            : index == items?.length
                            ? "border-y border-gray"
                            : "border-t border-gray"
                        } hover:bg-gray-100`}
                      >
                        <div className="flex flex-col items-center gap-2">
                          {/* Print button */}
                          <button
                            onClick={() => handlePrint(item)}
                            className="whitespace-nowrap bg-slate-200 text-black rounded-md shadow-md py-1 px-4 hover:bg-slate-300"
                          >
                            Print Barcode
                          </button>
                        </div>
                      </td>

                      <td
                        className={`py-2 px-3 font-normal text-base border-x text-center bg-green-200 shadow-md ${
                          index == 0
                            ? "border-t border-gray"
                            : index == items?.length
                            ? "border-y border-gray"
                            : "border-t border-gray"
                        } hover:bg-gray-100`}
                      >
                        <p className="text-gray-900 whitespace-no-wrap">
                          {new Date(item.manufactureDate).toLocaleDateString()}
                        </p>
                      </td>

                      <td
                        className={`py-2 px-3 font-normal text-base border-x text-center bg-red-100 shadow-md ${
                          index == 0
                            ? "border-t border-gray"
                            : index == items?.length
                            ? "border-y border-gray"
                            : "border-t border-gray"
                        } hover:bg-gray-100`}
                      >
                        <p className="text-gray-900 whitespace-no-wrap">
                          {new Date(item.expireDate).toLocaleDateString()}
                        </p>
                      </td>

                      <td
                        className={`py-2 px-3 font-normal text-base border-x text-center bg-gray-200 ${
                          index == 0
                            ? "border-t border-gray"
                            : index == items?.length
                            ? "border-y border-gray"
                            : "border-t border-gray"
                        } hover:bg-gray-100`}
                      >
                        <p className="text-gray-900 whitespace-no-wrap capitalize">
                          {category.find((u) => u._id === item.category)?.name}
                        </p>
                      </td>
                      <td className="pl-4 gap-2 font-bold">
                        <button
                          onClick={() => {
                            setShowModalEdit(true);
                            setModifiedItem(item);
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

              {/* Page buttons with ellipsis */}
              {(() => {
                const maxPagesToShow = 10;
                const pages = [];

                if (totalPages <= maxPagesToShow) {
                  for (let i = 1; i <= totalPages; i++) {
                    pages.push(i);
                  }
                } else {
                  pages.push(1); // always show first page

                  let startPage, endPage;

                  if (currentPage <= 6) {
                    startPage = 2;
                    endPage = 8;
                    for (let i = startPage; i <= endPage; i++) pages.push(i);
                    pages.push("ellipsis-right");
                    pages.push(totalPages);
                  } else if (currentPage >= totalPages - 5) {
                    pages.push("ellipsis-left");
                    startPage = totalPages - 7;
                    for (let i = startPage; i < totalPages; i++) pages.push(i);
                    pages.push(totalPages);
                  } else {
                    pages.push("ellipsis-left");
                    startPage = currentPage - 2;
                    endPage = currentPage + 2;
                    for (let i = startPage; i <= endPage; i++) pages.push(i);
                    pages.push("ellipsis-right");
                    pages.push(totalPages);
                  }
                }

                return pages.map((page, idx) => {
                  if (page === "ellipsis-left" || page === "ellipsis-right") {
                    return (
                      <span
                        key={`ellipsis-${idx}`}
                        className="relative inline-flex items-center px-4 py-2 text-sm text-gray-700 select-none"
                      >
                        ...
                      </span>
                    );
                  }
                  return (
                    <button
                      key={page}
                      onClick={() =>
                        dispatch(itemsFetch({ ...items, currentPage: page }))
                      }
                      className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-gray-300 ring-inset hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${
                        currentPage === page ? "bg-green-500/80 text-white" : ""
                      }`}
                    >
                      {page}
                    </button>
                  );
                });
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

      {/* Modals */}
      <AddItem
        showModal={showModalAdd}
        setShowModal={setShowModalAdd}
        onItemAdded={fetchData}
        modifiedItem={modifiedItem}
      />
      <EditItem
        showModal={showModalEdit}
        setShowModal={setShowModalEdit}
        onItemUpdated={fetchData}
        item={modifiedItem}
      />
    </div>
  );
};

export default Items;
