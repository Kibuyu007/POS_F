import { useEffect, useState } from "react";
import { FaSearch } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { TiArrowRightThick } from "react-icons/ti";
import { fetchProducts, searchItemsEveryWhere } from "../../../../Redux/items";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import { v4 as uuidv4 } from "uuid";
import { FiTrendingUp, FiDollarSign, FiPackage, FiMinus } from "react-icons/fi";
import { CiCalculator1 } from "react-icons/ci";

const Section2 = ({ onAddItem }) => {
  const { items } = useSelector((state) => state.items);
  const dispatch = useDispatch();

  const [selectedItem, setSelectedItem] = useState(null);
  const [showError, setShowError] = useState("");
  const [finishAdd, setFinishAdd] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const [errorDate, setErrorDate] = useState({
    manufactureDate: false,
    expiryDate: false,
    receivedDate: false,
  });

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  // Handle responsive window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const firstDayOfMonth = dayjs().startOf("month").format("YYYY-MM-DD");
  const lastDayOfMonth = dayjs().endOf("month").format("YYYY-MM-DD");

  const [formData, setFormData] = useState({
    buyingPrice: "",
    units: 1,
    itemsPerUnit: 1,
    quantity: 1,
    rejected: 0,
    billedAmount: 0,
    foc: 0,
    batchNumber: "",
    manufactureDate: firstDayOfMonth,
    expiryDate: lastDayOfMonth,
    receivedDate: dayjs().format("YYYY-MM-DD"),
    comments: "",
    totalCost: "",
    sellingPrice: "",
    enableWholesale: false,
    wholesaleMinQty: 1,
    wholesalePrice: 0,
    // New calculator fields
    wholesaleItemsNumber: "",
    wholesaleTotalAmount: "",
  });

  const [calculatedValues, setCalculatedValues] = useState({
    perUnitWholesalePrice: 0,
    discountPercentage: 0,
    totalRetailPrice: 0,
    savingsAmount: 0,
  });

  // Helper function to format numbers with commas
  const formatNumberWithCommas = (value) => {
    if (value === "" || value === null || value === undefined) return "";
    const stringValue = value.toString().replace(/,/g, "");
    const number = parseFloat(stringValue);
    if (isNaN(number)) return "";
    return number.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  };

  // Handle numeric input change with comma formatting
  const handleNumberChange = (e) => {
    const { name, value } = e.target;

    const cleanedValue = value.replace(/[^\d.-]/g, "");

    let parsedValue;
    if (cleanedValue === "" || cleanedValue === "-") {
      parsedValue = "";
    } else if (
      name === "units" ||
      name === "itemsPerUnit" ||
      name === "foc" ||
      name === "rejected" ||
      name === "billedAmount"
    ) {
      parsedValue = parseInt(cleanedValue);
      if (isNaN(parsedValue)) parsedValue = "";
    } else {
      parsedValue = parseFloat(cleanedValue);
      if (isNaN(parsedValue)) parsedValue = "";
    }

    setFormData((prev) => {
      const updatedForm = { ...prev, [name]: parsedValue };

      // Handle wholesale calculator
      if (name === "wholesaleItemsNumber" || name === "wholesaleTotalAmount") {
        // If both calculator fields have values, calculate wholesalePrice
        if (
          updatedForm.wholesaleItemsNumber &&
          updatedForm.wholesaleTotalAmount
        ) {
          const calculatedPrice =
            updatedForm.wholesaleTotalAmount / updatedForm.wholesaleItemsNumber;
          updatedForm.wholesalePrice = calculatedPrice;
        }
      }

      const units = parseFloat(updatedForm.units) || 0;
      const itemsPerUnit = parseInt(updatedForm.itemsPerUnit) || 0;
      const foc = parseInt(updatedForm.foc) || 0;
      const rejected = parseInt(updatedForm.rejected) || 0;
      const billedAmount = parseFloat(updatedForm.billedAmount) || 0;
      const buyingPrice = parseFloat(updatedForm.buyingPrice) || 0;

      const totalItemsReceived = units * itemsPerUnit + foc;
      const netItems = totalItemsReceived - rejected;
      const paidQuantity = Math.max(0, netItems - billedAmount);
      const totalPurchasedItems = units * itemsPerUnit;
      const totalCost = buyingPrice * totalPurchasedItems;

      return {
        ...updatedForm,
        quantity: paidQuantity,
        totalCost: totalCost,
      };
    });

    setShowError("");
  };

  // Handle text input change
  const handleTextChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle date change
  const handleDateChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    if (
      formData.enableWholesale &&
      formData.wholesalePrice > 0 &&
      formData.sellingPrice > 0
    ) {
      // Since wholesaleMinQty is fixed to 1, calculations are simpler
      const perUnitWholesalePrice = formData.wholesalePrice;
      const totalRetailPrice = formData.sellingPrice;
      const savingsAmount = totalRetailPrice - formData.wholesalePrice;
      const discountPercentage =
        totalRetailPrice > 0 ? (savingsAmount / totalRetailPrice) * 100 : 0;

      setCalculatedValues({
        perUnitWholesalePrice: parseFloat(perUnitWholesalePrice.toFixed(2)),
        discountPercentage: parseFloat(discountPercentage.toFixed(1)),
        totalRetailPrice: parseFloat(totalRetailPrice.toFixed(2)),
        savingsAmount: parseFloat(savingsAmount.toFixed(2)),
      });
    } else {
      setCalculatedValues({
        perUnitWholesalePrice: 0,
        discountPercentage: 0,
        totalRetailPrice: 0,
        savingsAmount: 0,
      });
    }
  }, [
    formData.wholesalePrice,
    formData.sellingPrice,
    formData.enableWholesale,
  ]);

  const handleItemSelection = (itemToAdd) => {
    if (finishAdd) {
      alert("Finish the current item before selecting another.");
      return;
    }

    if (selectedItem && selectedItem._id === itemToAdd._id) {
      setShowError("This item is already selected.");
      return;
    }

    setSelectedItem(itemToAdd);
    setShowError("");
    setFinishAdd(true);

    setFormData((prev) => ({
      ...prev,
      sellingPrice: itemToAdd.price || "",
      quantity: prev.units * prev.itemsPerUnit,
      enableWholesale: itemToAdd.enableWholesale || false,
      wholesaleMinQty: 1,
      wholesalePrice: itemToAdd.wholesalePrice || 0,
      wholesaleItemsNumber: "",
      wholesaleTotalAmount: "",
    }));
  };

  const toggleWholesale = () => {
    setFormData((prev) => ({
      ...prev,
      enableWholesale: !prev.enableWholesale,
      wholesaleMinQty: 1,
      wholesaleItemsNumber: "",
      wholesaleTotalAmount: "",
    }));
  };

  const handleAdd = () => {
    if (!selectedItem) return;

    const newErrors = {
      manufactureDate: false,
      expiryDate: false,
      receivedDate: false,
    };
    const today = dayjs().format("YYYY-MM-DD");

    if (formData.manufactureDate && formData.manufactureDate > today) {
      newErrors.manufactureDate = true;
      setShowError("Manufacture date cannot be in the future.");
    }

    if (
      formData.expiryDate &&
      formData.manufactureDate &&
      formData.expiryDate < formData.manufactureDate
    ) {
      newErrors.expiryDate = true;
      setShowError("Expiry date must be after manufacture date.");
    }

    if (
      formData.receivedDate &&
      formData.manufactureDate &&
      formData.receivedDate < formData.manufactureDate
    ) {
      newErrors.receivedDate = true;
      setShowError("Received date must be on or after manufacture date.");
    }

    if (
      formData.expiryDate &&
      formData.receivedDate &&
      formData.receivedDate > formData.expiryDate
    ) {
      newErrors.receivedDate = true;
      setShowError("Received date cannot be after expiry date.");
    }

    setErrorDate(newErrors);
    if (Object.values(newErrors).some((val) => val)) return;

    const totalItems =
      (formData.units || 0) * (formData.itemsPerUnit || 0) +
      (formData.foc || 0);
    const netItems = totalItems - (formData.rejected || 0);

    if ((formData.billedAmount || 0) > netItems) {
      setShowError("Billed Items cannot exceed available items");
      return;
    }


    // Prepare the data to send
    const fullItemData = {
      _id: uuidv4(),
      itemId: selectedItem._id,
      name: selectedItem.name,
      previousQuantity: selectedItem.itemQuantity,
      previousPrice: selectedItem.price,
      quantity: parseFloat(formData.quantity) || 0,
      buyingPrice: parseFloat(formData.buyingPrice) || 0,
      manufactureDate: formData.manufactureDate,
      expiryDate: formData.expiryDate,
      receivedDate: formData.receivedDate,
      batchNumber: formData.batchNumber,
      foc: parseFloat(formData.foc) || 0,
      rejected: parseFloat(formData.rejected) || 0,
      billedAmount: parseFloat(formData.billedAmount) || 0,
      comments: formData.comments,
      totalCost: parseFloat(formData.totalCost) || 0,
      sellingPrice:
        parseFloat(formData.sellingPrice || selectedItem.price) || 0,
      units: parseFloat(formData.units) || 0,
      itemsPerUnit: parseInt(formData.itemsPerUnit) || 0,
      // WHOLESALE FIELDS
      enableWholesale: Boolean(formData.enableWholesale),
      wholesaleMinQty: 1,
      wholesalePrice: parseFloat(formData.wholesalePrice) || 0,
    };

    console.log("Submitting item data:", fullItemData);
    onAddItem(fullItemData);

    // Reset form
    setFinishAdd(false);
    setSelectedItem(null);
    setShowError("");
    setFormData({
      buyingPrice: "",
      units: 1,
      itemsPerUnit: 1,
      quantity: 1,
      rejected: 0,
      billedAmount: 0,
      foc: 0,
      batchNumber: "",
      manufactureDate: firstDayOfMonth,
      expiryDate: lastDayOfMonth,
      receivedDate: dayjs().format("YYYY-MM-DD"),
      comments: "",
      totalCost: "",
      sellingPrice: "",
      enableWholesale: false,
      wholesaleMinQty: 1,
      wholesalePrice: 0,
      wholesaleItemsNumber: "",
      wholesaleTotalAmount: "",
    });
    setErrorDate({
      manufactureDate: false,
      expiryDate: false,
      receivedDate: false,
    });
  };

  const handleCancel = () => {
    setSelectedItem(null);
    setFinishAdd(false);
    setShowError("");
    setFormData({
      buyingPrice: "",
      units: 1,
      itemsPerUnit: 1,
      quantity: 1,
      rejected: 0,
      billedAmount: 0,
      foc: 0,
      batchNumber: "",
      manufactureDate: firstDayOfMonth,
      expiryDate: lastDayOfMonth,
      receivedDate: dayjs().format("YYYY-MM-DD"),
      comments: "",
      totalCost: "",
      sellingPrice: "",
      enableWholesale: false,
      wholesaleMinQty: 1,
      wholesalePrice: 0,
      wholesaleItemsNumber: "",
      wholesaleTotalAmount: "",
    });
    setErrorDate({
      manufactureDate: false,
      expiryDate: false,
      receivedDate: false,
    });
  };

  const hasItems =
    Number(formData.quantity) > 0 || Number(formData.billedAmount) > 0;
  const canAddItem =
    selectedItem && formData.buyingPrice && hasItems && !showError;

  const totalItemsReceived =
    (formData.units || 0) * (formData.itemsPerUnit || 0) +
    (Number(formData.foc) || 0);
  const netItemsAfterRejection =
    totalItemsReceived - (Number(formData.rejected) || 0);

  return (
    <section className="flex flex-col lg:flex-row gap-4 md:gap-6 min-h-[800px] p-3 md:p-0">
      {/* Products Table Section */}
      <div
        className={`${
          isMobile ? "w-full" : "lg:w-1/2"
        } flex flex-col bg-white rounded-xl border border-gray-200 shadow-sm h-full overflow-hidden`}
      >
        {/* Table Header */}
        <div className="px-4 md:px-6 py-3 md:py-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-gray-50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Available Products
              </h2>
              <p className="text-gray-600 text-sm font-medium">
                Select items to add to GRN
              </p>
            </div>
            <div className="flex items-center">
              <div className="px-2 md:px-3 py-1 bg-green-100 rounded-lg mr-2 md:mr-3">
                <span className="text-gray-800 font-semibold text-xs md:text-sm">
                  Step 1
                </span>
              </div>
              <div className="text-xs md:text-sm text-gray-700 font-medium">
                {items?.length || 0} items
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-4 md:px-6 py-3 md:py-4 border-b border-gray-200 bg-gray-50">
          <div className="relative">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-500 text-sm" />
            </div>
            <input
              type="text"
              placeholder="Search products by name..."
              className="w-full pl-9 pr-4 py-2 md:py-3 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-green-300 focus:border-green-300 text-gray-900 font-medium text-sm md:text-base"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                dispatch(searchItemsEveryWhere(e.target.value));
              }}
            />
          </div>
        </div>

        {/* Products Table Container */}
        <div className="flex-1 overflow-hidden p-4 md:p-6">
          <div className="h-[calc(100vh-320px)] md:h-[83vh] border border-gray-200 rounded-xl bg-white overflow-hidden flex flex-col shadow-sm">
            {/* Table Header */}
            <div className="sticky top-0 z-10 bg-gradient-to-r from-green-50 to-gray-50 border-b border-gray-200">
              <div className="grid grid-cols-12 px-4 py-3">
                <div className="col-span-1 text-xs font-bold text-gray-700 uppercase tracking-wider text-center">
                  #
                </div>
                <div className="col-span-6 text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Product Name
                </div>
                <div className="col-span-3 text-xs font-bold text-gray-700 uppercase tracking-wider text-center">
                  Stock
                </div>
                <div className="col-span-2 text-xs font-bold text-gray-700 uppercase tracking-wider text-center">
                  Action
                </div>
              </div>
            </div>

            {/* Table Body */}
            <div className="flex-1 overflow-y-auto bg-white">
              {items?.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-12 px-4">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <FaSearch className="text-2xl md:text-3xl text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    No products found
                  </h3>
                  <p className="text-gray-500 text-sm text-center max-w-md">
                    {searchQuery
                      ? `No results for "${searchQuery}"`
                      : "No products available"}
                  </p>
                  {searchQuery && (
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        dispatch(searchItemsEveryWhere(""));
                      }}
                      className="mt-4 px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                    >
                      Clear search
                    </button>
                  )}
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {items?.map((item, index) => (
                    <div
                      key={item._id}
                      className={`group grid grid-cols-12 px-4 py-3 hover:bg-gray-50 transition-all duration-200 ${
                        selectedItem?._id === item._id
                          ? "bg-green-50 border-l-4 border-l-green-500"
                          : "hover:border-l-4 hover:border-l-gray-200"
                      }`}
                    >
                      {/* Index Number */}
                      <div className="col-span-1 flex items-center justify-center">
                        <div
                          className={`flex items-center justify-center w-7 h-7 rounded-full text-sm font-medium ${
                            selectedItem?._id === item._id
                              ? "bg-green-500 text-white"
                              : "bg-gray-100 text-gray-600 group-hover:bg-gray-200"
                          }`}
                        >
                          {index + 1}
                        </div>
                      </div>

                      {/* Product Name */}
                      <div className="col-span-6 flex items-center">
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-2 h-2 rounded-full flex-shrink-0 ${
                              selectedItem?._id === item._id
                                ? "bg-green-500"
                                : "bg-gray-400"
                            }`}
                          />
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 capitalize truncate">
                              {item.name}
                            </p>
                            {item.code && (
                              <p className="text-xs text-gray-500 mt-0.5">
                                Code: {item.code}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Stock Quantity */}
                      <div className="col-span-3 flex items-center justify-center">
                        <div className="flex flex-col items-center">
                          <div className="flex items-center space-x-1">
                            <span className="text-lg font-bold text-gray-900">
                              {item.itemQuantity?.toLocaleString()}
                            </span>
                            <span className="text-xs text-gray-600 font-medium">
                              units
                            </span>
                          </div>
                          {item.itemQuantity <= 10 && (
                            <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded-full mt-1">
                              Low stock
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Select Button */}
                      <div className="col-span-2 flex items-center justify-center">
                        <button
                          onClick={() => handleItemSelection(item)}
                          className={`px-3 py-2 rounded-lg transition-all duration-200 text-sm font-semibold min-w-[80px] ${
                            selectedItem?._id === item._id
                              ? "bg-green-500 text-white shadow-sm hover:bg-green-600"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900 border border-gray-200"
                          }`}
                        >
                          {selectedItem?._id === item._id ? (
                            <div className="flex items-center justify-center space-x-1">
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                              <span>Selected</span>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center space-x-1">
                              <TiArrowRightThick className="w-4 h-4" />
                              <span>Select</span>
                            </div>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Table Footer */}
            <div className="sticky bottom-0 border-t border-gray-200 bg-gray-50">
              <div className="px-4 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-sm text-gray-700 font-medium">
                      Total:{" "}
                      <span className="font-bold text-gray-900">
                        {items?.length?.toLocaleString() || 0}
                      </span>{" "}
                      products
                    </div>
                    {selectedItem && (
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-gray-700 font-medium">
                          Selected:{" "}
                          <span className="font-bold text-green-600">
                            1 item
                          </span>
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="text-xs text-gray-500">
                      {searchQuery ? "Search results" : "All products"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {showError && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl shadow-sm">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-sm font-bold">!</span>
                </div>
                <div>
                  <p className="text-red-800 font-medium">{showError}</p>
                  <button
                    onClick={() => setShowError("")}
                    className="mt-2 text-sm text-red-600 hover:text-red-800 font-medium"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Item Details Section */}
      <div
        className={`${
          isMobile ? "w-full" : "lg:w-1/2"
        } flex flex-col bg-white rounded-xl border border-gray-200 shadow-sm h-full overflow-hidden mt-4 md:mt-0`}
      >
        {/* Section Header */}
        <div className="px-4 md:px-6 py-3 md:py-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-gray-50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Item Details</h2>
              <p className="text-gray-600 text-sm font-medium">
                {selectedItem
                  ? "Enter purchase details"
                  : "Select an item first"}
              </p>
            </div>
            <div className="flex items-center space-x-2 md:space-x-3">
              <div className="px-2 md:px-3 py-1 bg-green-100 rounded-lg">
                <span className="text-gray-800 font-semibold text-xs md:text-sm">
                  Step 2
                </span>
              </div>
              {selectedItem && (
                <div className="px-2 md:px-3 py-1 bg-gray-100 rounded-lg">
                  <span className="text-gray-800 font-semibold text-xs md:text-sm">
                    Editing
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-hidden p-3 md:p-6">
          {selectedItem ? (
            <div className="h-full flex flex-col">
              {/* Selected Item Header */}
              <div className="mb-4 md:mb-6 p-3 md:p-4 bg-gradient-to-r from-green-50 to-gray-50 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-base md:text-lg font-bold text-gray-900 mb-1 md:mb-2 capitalize truncate">
                      {selectedItem.name}
                    </h3>
                    <div className="grid grid-cols-2 gap-2 md:gap-4">
                      <div className="flex items-center">
                        <span className="text-xs md:text-sm text-gray-600 font-medium mr-1 md:mr-2">
                          Stock:
                        </span>
                        <span className="text-gray-900 font-bold text-sm md:text-lg">
                          {selectedItem.itemQuantity}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-xs md:text-sm text-gray-600 font-medium mr-1 md:mr-2">
                          Price:
                        </span>
                        <span className="text-gray-900 font-bold text-sm md:text-lg">
                          Tsh {selectedItem.price?.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div
                    className={`w-3 h-3 md:w-4 md:h-4 rounded-full ${
                      formData.buyingPrice ? "bg-green-400" : "bg-gray-300"
                    }`}
                  ></div>
                </div>
              </div>

              {/* Form Content */}
              <div className="flex-1 overflow-y-auto pr-1 md:pr-2 space-y-4 md:space-y-6">
                {/* Summary Section */}
                <div className="p-3 md:p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="text-sm md:text-md font-bold text-gray-900 mb-2 md:mb-3">
                    📊 Quantity Summary
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 text-xs md:text-sm">
                    <div className="bg-white p-2 rounded">
                      <p className="text-gray-600">Total Items</p>
                      <p className="font-bold text-gray-900">
                        {totalItemsReceived.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-white p-2 rounded">
                      <p className="text-gray-600">After Rejection</p>
                      <p className="font-bold text-gray-900">
                        {netItemsAfterRejection.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-white p-2 rounded">
                      <p className="text-gray-600">Billed (Unpaid)</p>
                      <p className="font-bold text-gray-900">
                        {(formData.billedAmount || 0).toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-green-50 p-2 rounded border border-green-200">
                      <p className="text-green-700">Paid Quantity</p>
                      <p className="font-bold text-green-700">
                        {(formData.quantity || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Pricing Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  {/* Buying Price */}
                  <div>
                    <label className="block text-xs md:text-sm font-semibold text-gray-900 mb-1 md:mb-2">
                      Buying Price *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="buyingPrice"
                        value={formatNumberWithCommas(formData.buyingPrice)}
                        onChange={handleNumberChange}
                        className={`w-full pl-3 md:pl-4 pr-10 md:pr-12 py-2 md:py-3 border ${
                          Number(formData.buyingPrice) >
                          Number(selectedItem.price)
                            ? "border-red-400 bg-red-50"
                            : "border-gray-300 bg-gray-50"
                        } rounded-lg focus:ring-2 focus:ring-green-300 focus:border-green-300 text-gray-900 font-medium text-sm md:text-base`}
                        placeholder="0"
                        required
                      />
                      <div className="absolute right-2 md:right-3 top-1/2 transform -translate-y-1/2 text-gray-700 font-bold text-xs md:text-sm">
                        Tsh
                      </div>
                    </div>
                    {Number(formData.buyingPrice) >
                      Number(selectedItem.price) && (
                      <div className="mt-1 md:mt-2 p-1 md:p-2 bg-red-50 border border-red-200 rounded text-xs">
                        <p className="text-red-700 font-medium">
                          Buying price exceeds current selling price
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Selling Price */}
                  <div>
                    <label className="block text-xs md:text-sm font-semibold text-gray-900 mb-1 md:mb-2">
                      Selling Price
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="sellingPrice"
                        value={formatNumberWithCommas(
                          formData.sellingPrice || selectedItem.price
                        )}
                        onChange={handleNumberChange}
                        className={`w-full pl-3 md:pl-4 pr-10 md:pr-12 py-2 md:py-3 border ${
                          Number(formData.buyingPrice) >
                          Number(formData.sellingPrice || selectedItem.price)
                            ? "border-red-400 bg-red-50"
                            : "border-gray-300 bg-gray-50"
                        } rounded-lg focus:ring-2 focus:ring-green-300 focus:border-green-300 text-gray-900 font-medium text-sm md:text-base`}
                        placeholder="0"
                      />
                      <div className="absolute right-2 md:right-3 top-1/2 transform -translate-y-1/2 text-gray-700 font-bold text-xs md:text-sm">
                        Tsh
                      </div>
                    </div>
                    {Number(formData.buyingPrice) >
                      Number(formData.sellingPrice || selectedItem.price) && (
                      <div className="mt-1 md:mt-2 p-1 md:p-2 bg-red-50 border border-red-200 rounded text-xs">
                        <p className="text-red-700 font-medium">
                          ⚠️ Selling price is lower than buying price
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Units & Items Per Unit */}
                  <div>
                    <label className="block text-xs md:text-sm font-semibold text-gray-900 mb-1 md:mb-2">
                      Units
                    </label>
                    <input
                      type="text"
                      name="units"
                      value={formatNumberWithCommas(formData.units)}
                      onChange={handleNumberChange}
                      className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 bg-gray-50 rounded-lg focus:ring-2 focus:ring-green-300 focus:border-green-300 text-gray-900 font-medium text-sm md:text-base"
                      placeholder="Number of units"
                    />
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-semibold text-gray-900 mb-1 md:mb-2">
                      Items Per Unit
                    </label>
                    <input
                      type="text"
                      name="itemsPerUnit"
                      value={formatNumberWithCommas(formData.itemsPerUnit)}
                      onChange={handleNumberChange}
                      className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 bg-gray-50 rounded-lg focus:ring-2 focus:ring-green-300 focus:border-green-300 text-gray-900 font-medium text-sm md:text-base"
                      placeholder="Items per unit"
                    />
                  </div>

                  {/* FOC & Rejected */}
                  <div>
                    <label className="block text-xs md:text-sm font-semibold text-gray-900 mb-1 md:mb-2">
                      Free Items (FOC)
                    </label>
                    <input
                      type="text"
                      name="foc"
                      value={formatNumberWithCommas(formData.foc)}
                      onChange={handleNumberChange}
                      className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 bg-gray-50 rounded-lg focus:ring-2 focus:ring-green-300 focus:border-green-300 text-gray-900 font-medium text-sm md:text-base"
                      placeholder="Free items quantity"
                    />
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-semibold text-gray-900 mb-1 md:mb-2">
                      Rejected Items
                    </label>
                    <input
                      type="text"
                      name="rejected"
                      value={formatNumberWithCommas(formData.rejected)}
                      onChange={handleNumberChange}
                      className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 bg-gray-50 rounded-lg focus:ring-2 focus:ring-green-300 focus:border-green-300 text-gray-900 font-medium text-sm md:text-base"
                      placeholder="Rejected quantity"
                    />
                    {formData.rejected > totalItemsReceived && (
                      <p className="text-xs text-red-600 mt-1">
                        Cannot reject more than total items (
                        {totalItemsReceived.toLocaleString()})
                      </p>
                    )}
                  </div>

                  {/* Billed Amount & Calculated Quantity */}
                  <div>
                    <label className="block text-xs md:text-sm font-semibold text-gray-900 mb-1 md:mb-2">
                      Billed Amount (Unpaid)
                    </label>
                    <input
                      type="text"
                      name="billedAmount"
                      value={formatNumberWithCommas(formData.billedAmount)}
                      onChange={handleNumberChange}
                      className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 bg-gray-50 rounded-lg focus:ring-2 focus:ring-green-300 focus:border-green-300 text-gray-900 font-medium text-sm md:text-base"
                      placeholder="Unpaid items quantity"
                    />
                    {formData.billedAmount > netItemsAfterRejection && (
                      <p className="text-xs text-red-600 mt-1">
                        Max: {netItemsAfterRejection.toLocaleString()}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-semibold text-gray-900 mb-1 md:mb-2">
                      Paid Quantity (Auto)
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="quantity"
                        value={formatNumberWithCommas(formData.quantity)}
                        readOnly
                        className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 bg-gray-100 rounded-lg text-gray-900 font-bold text-sm md:text-base"
                      />
                      <div className="absolute right-2 md:right-3 top-1/2 transform -translate-y-1/2 text-gray-900 font-bold text-xs md:text-sm">
                        units
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      (Units × Items/Unit + FOC - Rejected - Billed)
                    </p>
                  </div>
                </div>

                {/* WHOLESALE SECTION - WITH CALCULATOR */}
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 md:p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 md:gap-3">
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <FiPackage className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="text-base md:text-lg font-bold text-gray-900">
                            Bulk/Wholesale Pricing
                          </h4>
                          <p className="text-gray-600 text-xs md:text-sm">
                            Configure special pricing for wholesale purchases
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs md:text-sm font-medium ${
                            formData.enableWholesale
                              ? "text-blue-700"
                              : "text-gray-500"
                          }`}
                        >
                          {formData.enableWholesale ? "Active" : "Inactive"}
                        </span>
                        <button
                          type="button"
                          onClick={toggleWholesale}
                          className={`relative inline-flex items-center h-5 md:h-6 rounded-full w-9 md:w-11 transition-colors duration-200 ${
                            formData.enableWholesale
                              ? "bg-blue-600"
                              : "bg-gray-300"
                          }`}
                        >
                          <span
                            className={`inline-block w-3 h-3 md:w-4 md:h-4 transform bg-white rounded-full transition-transform duration-200 ${
                              formData.enableWholesale
                                ? "translate-x-4 md:translate-x-6"
                                : "translate-x-1"
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>

                  {formData.enableWholesale && (
                    <div className="p-3 md:p-4 space-y-4">
                      {/* Wholesale Fields */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                        {/* Wholesale Minimum Quantity - Fixed at 1 */}
                        <div className="bg-white p-3 rounded-lg border border-blue-100">
                          <label className="block text-sm font-bold text-gray-900 mb-1 flex items-center gap-2">
                            <FiPackage className="w-4 h-4 text-blue-500" />
                            Minimum Quantity
                          </label>
                          <p className="text-xs text-gray-500 mb-2">
                            Fixed at 1 unit (package selection available at POS)
                          </p>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-3 flex items-center">
                              <FiMinus className="w-4 h-4 text-blue-500" />
                            </div>
                            <input
                              type="text"
                              name="wholesaleMinQty"
                              value="1"
                              readOnly
                              disabled
                              className="w-full pl-10 pr-4 py-2 border border-blue-200 rounded-lg bg-gray-100 text-gray-700 focus:outline-none cursor-not-allowed"
                            />
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                              units
                            </div>
                          </div>
                        </div>

                        {/* Wholesale Price (Per Unit) - Direct Input */}
                        <div className="bg-white p-3 rounded-lg border border-blue-100">
                          <label className="block text-sm font-bold text-gray-900 mb-1 flex items-center gap-2">
                            <FiDollarSign className="w-4 h-4 text-blue-500" />
                            Wholesale Price (per unit)
                          </label>
                          <p className="text-xs text-gray-500 mb-2">
                            Price per unit for wholesale purchases
                          </p>
                          <input
                            type="text"
                            name="wholesalePrice"
                            value={formatNumberWithCommas(
                              formData.wholesalePrice
                            )}
                            onChange={handleNumberChange}
                            className="w-full px-3 md:px-4 py-2 border border-blue-200 rounded-lg bg-blue-50 text-gray-900 font-medium focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            placeholder="e.g., 12,000"
                          />
                        </div>
                      </div>

                      {/* Wholesale Calculator Section */}
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                        <div className="flex items-center gap-2 mb-3">
                          <CiCalculator1 className="w-5 h-5 text-blue-600" />
                          <h5 className="text-sm font-bold text-gray-900">
                            Quick Calculator
                          </h5>
                          <span className="text-xs text-gray-500 ml-auto">
                            Optional - Helps calculate price per unit
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {/* Number of Items */}
                          <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                              Number of Items
                            </label>
                            <div className="relative">
                              <input
                                type="text"
                                name="wholesaleItemsNumber"
                                value={formatNumberWithCommas(
                                  formData.wholesaleItemsNumber || ""
                                )}
                                onChange={handleNumberChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                placeholder="e.g., 5"
                              />
                              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                                units
                              </div>
                            </div>
                          </div>

                          {/* Total Amount */}
                          <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                              Total Amount
                            </label>
                            <div className="relative">
                              <input
                                type="text"
                                name="wholesaleTotalAmount"
                                value={formatNumberWithCommas(
                                  formData.wholesaleTotalAmount || ""
                                )}
                                onChange={handleNumberChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                placeholder="e.g., 50,000"
                              />
                              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm font-bold">
                                Tsh
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Calculation Display */}
                        {formData.wholesaleItemsNumber &&
                          formData.wholesaleTotalAmount && (
                            <div className="mt-3 p-3 bg-white rounded-lg border border-green-200">
                              <div className="flex items-center justify-between">
                                <div className="text-sm">
                                  <span className="text-gray-600">
                                    Calculated Price:
                                  </span>
                                  <span className="ml-2 font-bold text-green-700">
                                    Tsh{" "}
                                    {formatNumberWithCommas(
                                      (
                                        formData.wholesaleTotalAmount /
                                        formData.wholesaleItemsNumber
                                      ).toFixed(2)
                                    )}{" "}
                                    per unit
                                  </span>
                                </div>
                                <div className="text-xs text-gray-500">
                                  {formatNumberWithCommas(
                                    formData.wholesaleTotalAmount
                                  )}{" "}
                                  ÷{" "}
                                  {formatNumberWithCommas(
                                    formData.wholesaleItemsNumber
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                      </div>

                      {/* Wholesale Calculation Summary */}
                      {formData.enableWholesale &&
                        formData.wholesalePrice > 0 &&
                        formData.sellingPrice > 0 && (
                          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 md:p-4 rounded-lg border border-blue-200">
                            <h5 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                              <FiTrendingUp className="w-4 h-4 text-blue-600" />
                              Wholesale Price Comparison
                            </h5>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {/* Price Comparison */}
                              <div className="space-y-2">
                                <div className="flex items-center justify-between p-2 bg-white rounded border border-gray-300">
                                  <div>
                                    <p className="text-xs text-gray-500">
                                      Retail Price
                                    </p>
                                    <p className="text-sm font-bold text-gray-800">
                                      Tsh{" "}
                                      {formatNumberWithCommas(
                                        formData.sellingPrice ||
                                          selectedItem.price
                                      )}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-xs text-gray-500">
                                      Per unit
                                    </p>
                                    <p className="text-sm">Retail rate</p>
                                  </div>
                                </div>
                                <div className="flex items-center justify-between p-2 bg-blue-50 rounded border border-blue-200">
                                  <div>
                                    <p className="text-xs text-blue-600">
                                      Wholesale Price
                                    </p>
                                    <p className="text-sm font-bold text-blue-700">
                                      Tsh{" "}
                                      {formatNumberWithCommas(
                                        formData.wholesalePrice
                                      )}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-xs text-blue-600">
                                      Per unit
                                    </p>
                                    <p
                                      className={`text-sm font-bold ${
                                        calculatedValues.savingsAmount >= 0
                                          ? "text-green-600"
                                          : "text-red-600"
                                      }`}
                                    >
                                      {calculatedValues.savingsAmount >= 0
                                        ? "Save: "
                                        : "Premium: "}
                                      Tsh{" "}
                                      {Math.abs(
                                        calculatedValues.savingsAmount
                                      ).toLocaleString()}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {/* Unit Price & Discount */}
                              <div className="space-y-2">
                                <div className="p-2 bg-green-50 rounded border border-green-200">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <p className="text-xs text-gray-600">
                                        Savings per unit
                                      </p>
                                      <p className="text-sm font-bold text-green-700">
                                        Tsh{" "}
                                        {calculatedValues.savingsAmount.toLocaleString()}
                                      </p>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-xs text-gray-600">
                                        Discount
                                      </p>
                                      <p className="text-sm font-bold text-green-700">
                                        {calculatedValues.discountPercentage.toFixed(
                                          1
                                        )}
                                        %
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                  <div className="bg-white p-2 rounded border border-gray-300 text-center">
                                    <p className="text-xs text-gray-500">
                                      Retail/unit
                                    </p>
                                    <p className="text-sm font-medium">
                                      Tsh{" "}
                                      {formatNumberWithCommas(
                                        formData.sellingPrice ||
                                          selectedItem.price
                                      )}
                                    </p>
                                  </div>
                                  <div
                                    className={`p-2 rounded border text-center ${
                                      calculatedValues.perUnitWholesalePrice <=
                                      (formData.sellingPrice ||
                                        selectedItem.price)
                                        ? "bg-green-50 border-green-300"
                                        : "bg-red-50 border-red-300"
                                    }`}
                                  >
                                    <p className="text-xs text-gray-500">
                                      Wholesale/unit
                                    </p>
                                    <p
                                      className={`text-sm font-bold ${
                                        calculatedValues.perUnitWholesalePrice <=
                                        (formData.sellingPrice ||
                                          selectedItem.price)
                                          ? "text-green-700"
                                          : "text-red-700"
                                      }`}
                                    >
                                      Tsh{" "}
                                      {calculatedValues.perUnitWholesalePrice.toLocaleString()}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                    </div>
                  )}
                </div>

                {/* Dates Section */}
                <div className="border border-gray-200 rounded-xl p-3 md:p-4">
                  <h4 className="text-sm md:text-md font-bold text-gray-900 mb-3 md:mb-4 flex items-center gap-2">
                    <span className="text-lg">📅</span> Date Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                    {/* Manufacture Date */}
                    <div>
                      <label className="block text-xs md:text-sm font-semibold text-gray-900 mb-1 md:mb-2">
                        Manufacture Date
                      </label>
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                          value={
                            formData.manufactureDate
                              ? dayjs(formData.manufactureDate)
                              : null
                          }
                          onChange={(newValue) => {
                            handleDateChange(
                              "manufactureDate",
                              newValue ? newValue.format("YYYY-MM-DD") : ""
                            );
                            setErrorDate((prev) => ({
                              ...prev,
                              manufactureDate: false,
                            }));
                          }}
                          format="DD/MM/YYYY"
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              size: "small",
                              error: errorDate.manufactureDate,
                              helperText:
                                errorDate.manufactureDate && "Invalid date",
                              sx: {
                                "& .MuiOutlinedInput-root": {
                                  borderRadius: "0.5rem",
                                  backgroundColor: "#f9fafb",
                                  fontSize: "14px",
                                  "&:hover .MuiOutlinedInput-notchedOutline": {
                                    borderColor: "#86efac",
                                  },
                                  "&.Mui-focused .MuiOutlinedInput-notchedOutline":
                                    {
                                      borderColor: "#86efac",
                                      borderWidth: "2px",
                                    },
                                },
                              },
                            },
                          }}
                        />
                      </LocalizationProvider>
                    </div>

                    {/* Expiry Date */}
                    <div>
                      <label className="block text-xs md:text-sm font-semibold text-gray-900 mb-1 md:mb-2">
                        Expiry Date
                      </label>
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                          value={
                            formData.expiryDate
                              ? dayjs(formData.expiryDate)
                              : null
                          }
                          onChange={(newValue) => {
                            handleDateChange(
                              "expiryDate",
                              newValue ? newValue.format("YYYY-MM-DD") : ""
                            );
                            setErrorDate((prev) => ({
                              ...prev,
                              expiryDate: false,
                            }));
                          }}
                          format="DD/MM/YYYY"
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              size: "small",
                              error: errorDate.expiryDate,
                              helperText:
                                errorDate.expiryDate &&
                                "Must be after manufacture",
                              sx: {
                                "& .MuiOutlinedInput-root": {
                                  borderRadius: "0.5rem",
                                  backgroundColor: "#f9fafb",
                                  fontSize: "14px",
                                  "&:hover .MuiOutlinedInput-notchedOutline": {
                                    borderColor: "#86efac",
                                  },
                                },
                              },
                            },
                          }}
                        />
                      </LocalizationProvider>
                    </div>

                    {/* Received Date */}
                    <div>
                      <label className="block text-xs md:text-sm font-semibold text-gray-900 mb-1 md:mb-2">
                        Received Date
                      </label>
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                          value={
                            formData.receivedDate
                              ? dayjs(formData.receivedDate)
                              : null
                          }
                          onChange={(newValue) => {
                            handleDateChange(
                              "receivedDate",
                              newValue ? newValue.format("YYYY-MM-DD") : ""
                            );
                            setErrorDate((prev) => ({
                              ...prev,
                              receivedDate: false,
                            }));
                          }}
                          format="DD/MM/YYYY"
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              size: "small",
                              error: errorDate.receivedDate,
                              helperText:
                                errorDate.receivedDate && "Invalid range",
                              sx: {
                                "& .MuiOutlinedInput-root": {
                                  borderRadius: "0.5rem",
                                  backgroundColor: "#f9fafb",
                                  fontSize: "14px",
                                  "&:hover .MuiOutlinedInput-notchedOutline": {
                                    borderColor: "#86efac",
                                  },
                                },
                              },
                            },
                          }}
                        />
                      </LocalizationProvider>
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                <div className="border border-gray-200 rounded-xl p-3 md:p-4">
                  <h4 className="text-sm md:text-md font-bold text-gray-900 mb-3 md:mb-4 flex items-center gap-2">
                    <span className="text-lg">📝</span> Additional Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                    {/* Batch Number */}
                    <div>
                      <label className="block text-xs md:text-sm font-semibold text-gray-900 mb-1 md:mb-2">
                        Batch Number *
                      </label>
                      <input
                        type="text"
                        name="batchNumber"
                        value={formData.batchNumber}
                        onChange={handleTextChange}
                        className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 bg-gray-50 rounded-lg focus:ring-2 focus:ring-green-300 focus:border-green-300 text-gray-900 font-medium text-sm md:text-base"
                        placeholder="Enter batch number"
                        required
                      />
                    </div>

                    {/* Total Cost */}
                    <div>
                      <label className="block text-xs md:text-sm font-semibold text-gray-900 mb-1 md:mb-2">
                        Total Cost (Auto)
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="totalCost"
                          value={
                            formData.totalCost
                              ? `Tsh ${Number(
                                  formData.totalCost
                                ).toLocaleString()}`
                              : ""
                          }
                          readOnly
                          className="w-full pl-3 md:pl-4 pr-8 md:pr-10 py-2 md:py-3 border border-gray-300 bg-gray-100 rounded-lg text-gray-900 font-bold text-sm md:text-base"
                        />
                        {formData.totalCost && (
                          <div className="absolute right-2 md:right-3 top-1/2 transform -translate-y-1/2 text-green-600 font-bold">
                            ✔
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        Buying Price × (Units × Items/Unit)
                      </p>
                    </div>

                    {/* Comments */}
                    <div className="md:col-span-2">
                      <label className="block text-xs md:text-sm font-semibold text-gray-900 mb-1 md:mb-2">
                        Comments
                      </label>
                      <textarea
                        name="comments"
                        value={formData.comments}
                        onChange={handleTextChange}
                        rows={2}
                        className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 bg-gray-50 rounded-lg focus:ring-2 focus:ring-green-300 focus:border-green-300 text-gray-900 font-medium text-sm md:text-base resize-none"
                        placeholder="Add any comments or notes about this item..."
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row gap-2 md:gap-4">
                  <button
                    onClick={handleAdd}
                    disabled={!canAddItem}
                    className={`flex-1 py-2 md:py-3 px-4 md:px-6 rounded-lg font-bold text-sm md:text-lg transition-all ${
                      !canAddItem
                        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                        : "bg-green-500 text-white hover:bg-green-600 hover:shadow-md transform hover:-translate-y-0.5"
                    }`}
                  >
                    ✓ Add Item to List
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex-1 py-2 md:py-3 px-4 md:px-6 border border-gray-300 text-gray-900 font-bold rounded-lg hover:bg-gray-50 transition-colors text-sm md:text-base"
                  >
                    ✗ Cancel Selection
                  </button>
                </div>
                {!canAddItem && selectedItem && (
                  <p className="text-xs text-red-600 mt-2 text-center">
                    Please fill all required fields (Buying Price and at least
                    some quantity or billed amount)
                  </p>
                )}
              </div>
            </div>
          ) : (
            /* Empty State */
            <div className="h-full flex flex-col items-center justify-center p-6 md:p-12">
              <div className="w-16 h-16 md:w-24 md:h-24 mx-auto mb-4 md:mb-6 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center shadow-inner">
                <TiArrowRightThick className="text-2xl md:text-4xl text-gray-500" />
              </div>
              <h3 className="text-base md:text-xl font-bold text-gray-900 mb-2 md:mb-3 text-center">
                No Item Selected
              </h3>
              <p className="text-gray-600 font-medium text-center mb-6 md:mb-8 max-w-md text-sm md:text-base">
                Select an item from the products table to enter purchase details
              </p>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 md:w-3 md:h-3 bg-gray-400 rounded-full"></div>
                <div className="w-2 h-2 md:w-3 md:h-3 bg-gray-300 rounded-full"></div>
                <div className="w-2 h-2 md:w-3 md:h-3 bg-gray-300 rounded-full"></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Section2;
