import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  itemsFetch,
  itemsPending,
  itemsError,
  searchItemsPending,
} from "../../../../Redux/items";

//Pages
import AddItem from "./AddItem";
import EditItem from "./EditItem";

//Icons
import { AiTwotoneEdit } from "react-icons/ai";
import { 
  FaSearch, 
  FaPrint,
} from "react-icons/fa";
import { 
  IoIosArrowBack, 
  IoIosArrowForward,
  IoMdAdd,
  IoMdRefresh
} from "react-icons/io";
import { 

  FiAlertCircle
} from "react-icons/fi";

//API
import BASE_URL from "../../../../Utils/config";
import toast from "react-hot-toast";

const Items = () => {
  const dispatch = useDispatch();

  // Redux State
  const { items = [] } = useSelector((state) => state.items);
  const { category } = useSelector((state) => state.category);

  const [showError, setShowError] = useState("");

  // Filter and Search State
  const [filterStatus, setFilterStatus] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Modal States
  const [showModalAdd, setShowModalAdd] = useState(false);
  const [showModalEdit, setShowModalEdit] = useState(false);
  const [modifiedItem, setModifiedItem] = useState(null);

  // Fetch data
  const fetchData = async () => {
    try {
      dispatch(itemsPending());
      let url = `${BASE_URL}/api/items/getAllItems?search=${searchQuery}`;

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
      setCurrentPage(1);
      toast.success("Items loaded successfully!");
    } catch (error) {
      console.error("Error fetching items:", error);
      setShowError(
        "An error occurred. Please contact the system administrator."
      );
      dispatch(itemsError(error.message));
      toast.error("Failed to load items");
    }
  };

  useEffect(() => {
    fetchData();
  }, [searchQuery, categoryFilter, filterStatus]);

  // Filter items based on status and category
  const filteredItems = items.filter((item) => {
    const isExpired = new Date(item.expireDate) < new Date();
    const expiresSoon = () => {
      const expireDate = new Date(item.expireDate);
      const today = new Date();
      const daysUntilExpiry = Math.ceil((expireDate - today) / (1000 * 60 * 60 * 24));
      return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
    };
    
    if (filterStatus === "All") return true;
    if (filterStatus === "Expired") return isExpired;
    if (filterStatus === "Expires Soon") return expiresSoon();
    if (filterStatus === "Active") return !isExpired && !expiresSoon();
    if (filterStatus === "Low Stock") return item.reOrderStatus === "Low";
    return true;
  });

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const totalItems = filteredItems.length;

  // Next page
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Previous page
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Calculate statistics
  const totalValue = filteredItems.reduce((sum, item) => sum + (item.buyingPrice * item.itemQuantity), 0);
  const totalItemsCount = filteredItems.reduce((sum, item) => sum + item.itemQuantity, 0);
  const lowStockItems = filteredItems.filter(item => item.reOrderStatus === "Low").length;
  const expiredItems = filteredItems.filter(item => new Date(item.expireDate) < new Date()).length;

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
    toast.success("Barcode printed!");
  };

  return (
    <div className="p-5 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-black mb-1">
            Inventory Management
          </h1>
          <p className="text-gray-600 text-sm">
            View and manage all inventory items
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
              <p className="text-xs text-gray-500 font-medium">Total Items</p>
              <p className="text-base font-bold text-black">
                {filteredItems.length}
              </p>
            </div>

            <div className="h-6 w-px bg-gray-300"></div>

            <div className="text-center px-3">
              <p className="text-xs text-gray-500 font-medium">Stock Value</p>
              <p className="text-base font-bold text-black">
                Tsh {totalValue.toLocaleString()}
              </p>
            </div>

            <div className="h-6 w-px bg-gray-300"></div>

            <div className="text-center px-3">
              <p className="text-xs text-gray-500 font-medium">Total Qty</p>
              <p className="text-base font-bold text-green-600">
                {totalItemsCount.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="text-xs font-medium text-gray-700">
                Low:{" "}
              </span>
              <span className="font-bold text-black text-sm">{lowStockItems}</span>
            </div>

            <div className="h-4 w-px bg-gray-300"></div>

            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span className="text-xs font-medium text-gray-700">Expired: </span>
              <span className="font-bold text-black text-sm">{expiredItems}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search - Compact & Clean */}
      <div className="mb-6 rounded-xl p-4 shadow bg-white">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
          {/* Status Filter Buttons - Horizontal Scroll on Mobile */}
          <div className="md:col-span-2">
            <div className="flex overflow-x-auto pb-2 -mx-2 px-2">
              <div className="flex gap-2">
                {["All", "Active", "Low Stock", "Expires Soon", "Expired"].map((status) => (
                  <button
                    key={status}
                    className={`px-4 py-2.5 text-sm font-bold rounded-full transition-all duration-200 whitespace-nowrap flex-shrink-0 ${
                      filterStatus === status
                        ? "bg-green-300 text-black shadow-lg ring-2 ring-green-400 ring-offset-1"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow"
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
            </div>
          </div>

          {/* Search */}
          <div>
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center">
                <FaSearch className="w-4 h-4 text-gray-500" />
              </div>
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-3 py-2.5 text-sm border border-gray-300 rounded-full bg-white text-black focus:border-green-300 focus:outline-none focus:ring-1 focus:ring-green-200"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  dispatch(searchItemsPending());
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Category Filter */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-full bg-white text-black focus:border-green-300 focus:outline-none focus:ring-1 focus:ring-green-200"
            >
              <option value="All">All Categories</option>
              {category.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Add Item Button */}
          <div className="flex justify-end">
            <button
              onClick={() => setShowModalAdd(true)}
              className="w-full md:w-auto px-5 py-2.5 bg-green-300 hover:bg-green-400 text-black font-bold rounded-full shadow hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2 text-sm"
            >
              <IoMdAdd className="w-4 h-4" />
              <span>Add Item</span>
            </button>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="rounded-xl shadow bg-white overflow-hidden">
        {/* Error Message */}
        {showError && (
          <div className="m-4 p-3 bg-red-100 border border-red-300 rounded-lg">
            <div className="flex items-center gap-2 text-red-800">
              <FiAlertCircle className="w-4 h-4" />
              <span className="text-sm font-medium">{showError}</span>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-200">
                {["SN", "Product", "Buy Price", "Sell Price", "Quantity", "Barcode", "Manf Date", "Exp Date", "Category", "Action"].map((header, idx) => (
                  <th
                    key={idx}
                    className="px-3 py-3 text-center text-xs font-bold text-black uppercase border-r border-gray-300"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            
            <tr className="h-3" />

            <tbody>
              {currentItems.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-12">
                    <div className="space-y-3">
                      <div className="text-4xl">📦</div>
                      <p className="text-lg font-bold text-black">
                        No items found
                      </p>
                      <p className="text-gray-600 text-sm">
                        Try adjusting your search filters
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                currentItems.map((item, index) => {
                  const isExpired = new Date(item.expireDate) < new Date();
                  const expireDate = new Date(item.expireDate);
                  const today = new Date();
                  const daysUntilExpiry = Math.ceil((expireDate - today) / (1000 * 60 * 60 * 24));
                  const expiresSoon = daysUntilExpiry <= 30 && daysUntilExpiry > 0;

                  return (
                    <>
                      <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                        {/* SN Column - Green 300 */}
                        <td className="py-3 px-2 text-center border-r border-gray-300 bg-gray-200">
                          <span className="inline-flex items-center justify-center w-8 h-8 bg-green-300 text-black font-bold rounded-full text-xs">
                            {indexOfFirstItem + index + 1}
                          </span>
                        </td>

                        {/* Product Column - Gray 200 */}
                        <td className="py-3 px-2 text-center bg-gray-100 border-r border-gray-200">
                          <span className="font-bold text-black text-sm">
                            {item.name}
                          </span>
                        </td>

                        {/* Buy Price Column - Yellow 100 */}
                        <td className="py-3 px-2 text-center bg-yellow-100 border-r border-gray-200">
                          <span className="font-bold text-black text-sm">
                            {item.buyingPrice.toLocaleString()}
                          </span>
                        </td>

                        {/* Sell Price Column - Yellow 100 */}
                        <td className="py-3 px-2 text-center bg-yellow-100 border-r border-gray-200">
                          <span className="font-bold text-green-700 text-sm">
                            {item.price.toLocaleString()}
                          </span>
                        </td>

                        {/* Quantity Column - Color coded */}
                        <td className="py-3 px-2 text-center border-r border-gray-200">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                            item.reOrderStatus === "Low"
                              ? "bg-red-100 text-red-700"
                              : item.reOrderStatus === "Normal"
                              ? "bg-green-100 text-green-700"
                              : "bg-blue-100 text-blue-700"
                          }`}>
                            {item.itemQuantity.toLocaleString()}
                          </span>
                        </td>

                        {/* Barcode Column - Gray 200 */}
                        <td className="py-3 px-2 text-center bg-gray-200 border-r border-gray-200">
                          <button
                            onClick={() => handlePrint(item)}
                            className="px-3 py-1.5 bg-gray-300 hover:bg-gray-400 text-black font-bold rounded-full text-xs transition-colors flex items-center gap-1 mx-auto"
                          >
                            <FaPrint className="w-3 h-3" />
                            Print
                          </button>
                        </td>

                        {/* Manufacture Date Column - Green 200 */}
                        <td className="py-3 px-2 text-center bg-green-200 border-r border-gray-200">
                          <span className="font-bold text-black text-sm">
                            {new Date(item.manufactureDate).toLocaleDateString('en-GB')}
                          </span>
                        </td>

                        {/* Expiry Date Column - Color coded */}
                        <td className="py-3 px-2 text-center border-r border-gray-200">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                            isExpired
                              ? "bg-red-100 text-red-700"
                              : expiresSoon
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-green-100 text-green-700"
                          }`}>
                            {new Date(item.expireDate).toLocaleDateString('en-GB')}
                            {isExpired && " (Expired)"}
                            {expiresSoon && " (Soon)"}
                          </span>
                        </td>

                        {/* Category Column - Gray 100 */}
                        <td className="py-3 px-2 text-center bg-gray-100 border-r border-gray-200">
                          <span className="font-bold text-black text-sm">
                            {category.find((u) => u._id === item.category)?.name || "-"}
                          </span>
                        </td>

                        {/* Action Column - Gray 200 */}
                        <td className="py-3 px-2 text-center bg-gray-200">
                          <button
                            onClick={() => {
                              setShowModalEdit(true);
                              setModifiedItem(item);
                            }}
                            className="p-2 bg-green-300 hover:bg-green-400 text-black rounded-full transition-colors"
                          >
                            <AiTwotoneEdit className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                      <tr className="h-3">
                        <td colSpan={10} className="p-0"></td>
                      </tr>
                    </>
                  );
                })
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
              of <span className="font-bold text-black">{totalItems}</span> items
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