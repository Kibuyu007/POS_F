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
import { FiTrendingUp, FiInfo, FiDollarSign } from "react-icons/fi";

const Section2 = ({ onAddItem }) => {
  const { items } = useSelector((state) => state.items);
  const dispatch = useDispatch();

  const [selectedItem, setSelectedItem] = useState(null);
  const [showError, setShowError] = useState("");
  const [finishAdd, setFinishAdd] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [errorDate, setErrorDate] = useState({
    manufactureDate: false,
    expiryDate: false,
    receivedDate: false,
  });

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

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
    wholesaleMinQty: 0,
    wholesalePrice: 0,
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
    // Remove any existing commas
    const stringValue = value.toString().replace(/,/g, '');
    // Parse as float to handle decimal numbers
    const number = parseFloat(stringValue);
    if (isNaN(number)) return "";
    // Format with commas for thousands
    return number.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });
  };

  // Handle numeric input change with comma formatting
  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    
    // Remove all non-numeric characters except decimal point and minus sign
    const cleanedValue = value.replace(/[^\d.-]/g, '');
    
    // Parse the cleaned value
    let parsedValue;
    if (cleanedValue === '' || cleanedValue === '-') {
      parsedValue = '';
    } else if (name === 'wholesaleMinQty' || name === 'units' || name === 'itemsPerUnit' || name === 'foc' || name === 'rejected' || name === 'billedAmount') {
      // These should be integers
      parsedValue = parseInt(cleanedValue);
      if (isNaN(parsedValue)) parsedValue = '';
    } else {
      // These can be floats
      parsedValue = parseFloat(cleanedValue);
      if (isNaN(parsedValue)) parsedValue = '';
    }
    
    setFormData(prev => {
      const updatedForm = { ...prev, [name]: parsedValue };
      
      // Recalculate based on the updated value
      const units = parseFloat(updatedForm.units) || 0;
      const itemsPerUnit = parseInt(updatedForm.itemsPerUnit) || 0;
      const foc = parseInt(updatedForm.foc) || 0;
      const rejected = parseInt(updatedForm.rejected) || 0;
      const billedAmount = parseFloat(updatedForm.billedAmount) || 0;
      const buyingPrice = parseFloat(updatedForm.buyingPrice) || 0;

      // Calculate total items received
      const totalItemsReceived = (units * itemsPerUnit) + foc;
      
      // Calculate net items after rejection
      const netItems = totalItemsReceived - rejected;
      
      // Calculate paid quantity (items actually paid for)
      const paidQuantity = Math.max(0, netItems - billedAmount);
      
      // Calculate total cost (buying price × total purchased items, excluding free items)
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
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle checkbox change
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  // Handle date change
  const handleDateChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    if (
      formData.enableWholesale &&
      formData.wholesalePrice > 0 &&
      formData.wholesaleMinQty > 0 &&
      formData.sellingPrice > 0
    ) {
      const perUnitWholesalePrice = formData.wholesalePrice / formData.wholesaleMinQty;
      const totalRetailPrice = formData.sellingPrice * formData.wholesaleMinQty;
      const savingsAmount = totalRetailPrice - formData.wholesalePrice;
      const discountPercentage = totalRetailPrice > 0 ? (savingsAmount / totalRetailPrice) * 100 : 0;

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
  }, [formData.wholesalePrice, formData.wholesaleMinQty, formData.sellingPrice, formData.enableWholesale]);

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
      wholesaleMinQty: itemToAdd.wholesaleMinQty || 0,
      wholesalePrice: itemToAdd.wholesalePrice || 0,
    }));
  };

  const toggleWholesale = () => {
    setFormData(prev => ({
      ...prev,
      enableWholesale: !prev.enableWholesale,
    }));
  };

  const handleAdd = () => {
    if (!selectedItem) return;

    const newErrors = { manufactureDate: false, expiryDate: false, receivedDate: false };
    const today = dayjs().format("YYYY-MM-DD");

    if (formData.manufactureDate && formData.manufactureDate > today) {
      newErrors.manufactureDate = true;
      setShowError("Manufacture date cannot be in the future.");
    }

    if (formData.expiryDate && formData.manufactureDate && formData.expiryDate < formData.manufactureDate) {
      newErrors.expiryDate = true;
      setShowError("Expiry date must be after manufacture date.");
    }

    if (formData.receivedDate && formData.manufactureDate && formData.receivedDate < formData.manufactureDate) {
      newErrors.receivedDate = true;
      setShowError("Received date must be on or after manufacture date.");
    }

    if (formData.expiryDate && formData.receivedDate && formData.receivedDate > formData.expiryDate) {
      newErrors.receivedDate = true;
      setShowError("Received date cannot be after expiry date.");
    }

    setErrorDate(newErrors);
    if (Object.values(newErrors).some((val) => val)) return;

    const totalItems = (formData.units || 0) * (formData.itemsPerUnit || 0) + (formData.foc || 0);
    const netItems = totalItems - (formData.rejected || 0);

    if ((formData.billedAmount || 0) > netItems) {
      setShowError("Billed Items cannot exceed available items");
      return;
    }

    // Validate wholesale minimum quantity doesn't exceed paid quantity
    if (formData.enableWholesale && (formData.wholesaleMinQty || 0) > (formData.quantity || 0)) {
      setShowError("Wholesale minimum quantity cannot exceed paid quantity");
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
      sellingPrice: parseFloat(formData.sellingPrice || selectedItem.price) || 0,
      units: parseFloat(formData.units) || 0,
      itemsPerUnit: parseInt(formData.itemsPerUnit) || 0,
      // WHOLESALE FIELDS - Convert to proper types
      enableWholesale: Boolean(formData.enableWholesale),
      wholesaleMinQty: parseInt(formData.wholesaleMinQty) || 0,
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
      wholesaleMinQty: 0,
      wholesalePrice: 0,
    });
    setErrorDate({ manufactureDate: false, expiryDate: false, receivedDate: false });
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
      wholesaleMinQty: 0,
      wholesalePrice: 0,
    });
    setErrorDate({ manufactureDate: false, expiryDate: false, receivedDate: false });
  };

  const hasItems = (Number(formData.quantity) > 0) || (Number(formData.billedAmount) > 0);
  const canAddItem = selectedItem && formData.buyingPrice && hasItems && !showError;

  const totalItemsReceived = (formData.units || 0) * (formData.itemsPerUnit || 0) + (Number(formData.foc) || 0);
  const netItemsAfterRejection = totalItemsReceived - (Number(formData.rejected) || 0);

  return (
    <section className="flex flex-col lg:flex-row gap-6 min-h-[800px]">
      {/* Products Table Section */}
      <div className="lg:w-1/2 flex flex-col bg-white rounded-lg border border-gray-300 shadow-sm h-full">
        {/* Table Header */}
        <div className="px-6 py-4 border-b border-gray-300 bg-gradient-to-r from-green-50 to-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Available Products
              </h2>
              <p className="text-gray-700 text-sm font-medium">
                Select items to add to GRN
              </p>
            </div>
            <div className="flex items-center">
              <div className="px-3 py-1 bg-green-300 rounded-lg mr-3">
                <span className="text-gray-900 font-semibold text-sm">
                  Step 1
                </span>
              </div>
              <div className="text-sm text-gray-700 font-medium">
                {items?.length || 0} items
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-6 py-4 border-b border-gray-300 bg-gray-50">
          <div className="relative">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-500" />
            </div>
            <input
              type="text"
              placeholder="Search products by name..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-green-300 focus:border-green-300 text-gray-900 font-medium shadow-sm"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                dispatch(searchItemsEveryWhere(e.target.value));
              }}
            />
          </div>
        </div>

        {/* Products Table Container */}
        <div className="flex-1 overflow-hidden p-6">
          <div className="h-[83vh] border border-gray-300 rounded-lg bg-gray-50 overflow-hidden flex flex-col">
            <div className="overflow-y-auto flex-1">
              <table className="min-w-full">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-gray-200">
                    <th className="px-4 py-3 border-b-2 border-gray-300 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                      #
                    </th>
                    <th className="px-4 py-3 border-b-2 border-gray-300 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                      Product Name
                    </th>
                    <th className="px-4 py-3 border-b-2 border-gray-300 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-4 py-3 border-b-2 border-gray-300 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                      Select
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-300">
                  {items?.length === 0 ? (
                    <tr>
                      <td
                        colSpan="4"
                        className="px-4 py-8 text-center text-gray-600"
                      >
                        <div className="flex flex-col items-center justify-center py-12">
                          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                            <FaSearch className="text-2xl text-gray-500" />
                          </div>
                          <p className="text-gray-700 font-medium">
                            No products found
                          </p>
                          <p className="text-gray-500 text-sm mt-1">
                            Try a different search term
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    items?.map((item, index) => (
                      <tr
                        key={item._id}
                        className={`hover:bg-gray-100 transition-colors ${
                          selectedItem?._id === item._id
                            ? "bg-green-100 border-l-4 border-l-green-300"
                            : "bg-gray-50"
                        }`}
                      >
                        <td className="px-4 py-3 text-gray-900 font-semibold border-r border-gray-300">
                          <div className="flex items-center justify-center w-6 h-6 bg-gray-200 rounded-full mx-auto">
                            {index + 1}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-900 font-medium border-r border-gray-300 capitalize">
                          <div className="flex items-center">
                            <div
                              className={`w-2 h-2 rounded-full mr-3 ${
                                selectedItem?._id === item._id
                                  ? "bg-green-400"
                                  : "bg-gray-400"
                              }`}
                            ></div>
                            {item.name}
                          </div>
                        </td>
                        <td className="px-4 py-3 border-r border-gray-300">
                          <div className="flex items-center">
                            <span className="text-gray-900 font-bold text-lg mr-2">
                              {item.itemQuantity}
                            </span>
                            <span className="text-xs text-gray-600 font-medium">
                              units
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleItemSelection(item)}
                            className={`w-full py-2 rounded-lg transition-all ${
                              selectedItem?._id === item._id
                                ? "bg-green-300 text-gray-900 border border-green-400 shadow-sm"
                                : "bg-gray-200 hover:bg-gray-300 text-gray-700 border border-gray-300 hover:border-gray-400"
                            }`}
                          >
                            <TiArrowRightThick className="inline-block mr-2" />
                            <span className="text-sm font-medium">
                              {selectedItem?._id === item._id
                                ? "Selected"
                                : "Select"}
                            </span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="px-4 py-3 border-t border-gray-300 bg-gray-100">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700 font-medium">
                  Showing {items?.length || 0} products
                </div>
                <div className="text-sm text-gray-700 font-medium">
                  {selectedItem ? "1 item selected" : "No selection"}
                </div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {showError && (
            <div className="mt-4 p-3 bg-red-50 border border-red-300 rounded-lg">
              <div className="flex items-center">
                <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white text-sm font-bold">!</span>
                </div>
                <p className="text-red-700 font-medium text-sm">{showError}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Item Details Section */}
      <div className="lg:w-1/2 flex flex-col bg-white rounded-lg border border-gray-300 shadow-sm h-full">
        {/* Section Header */}
        <div className="px-6 py-4 border-b border-gray-300 bg-gradient-to-r from-green-50 to-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Item Details</h2>
              <p className="text-gray-700 text-sm font-medium">
                {selectedItem
                  ? "Enter purchase details"
                  : "Select an item first"}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="px-3 py-1 bg-green-300 rounded-lg">
                <span className="text-gray-900 font-semibold text-sm">
                  Step 2
                </span>
              </div>
              {selectedItem && (
                <div className="px-3 py-1 bg-gray-200 rounded-lg">
                  <span className="text-gray-900 font-semibold text-sm">
                    Editing
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-hidden p-6">
          {selectedItem ? (
            <div className="h-full flex flex-col">
              {/* Selected Item Header */}
              <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-gray-100 border border-gray-300 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2 capitalize">
                      {selectedItem.name}
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center">
                        <span className="text-sm text-gray-700 font-medium mr-2">
                          Current Stock:
                        </span>
                        <span className="text-gray-900 font-bold text-lg">
                          {selectedItem.itemQuantity}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm text-gray-700 font-medium mr-2">
                          Current Price:
                        </span>
                        <span className="text-gray-900 font-bold text-lg">
                          Tsh {selectedItem.price?.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div
                    className={`w-4 h-4 rounded-full ${
                      formData.buyingPrice ? "bg-green-400" : "bg-gray-300"
                    }`}
                  ></div>
                </div>
              </div>

              {/* Form Content */}
              <div className="flex-1 overflow-y-auto pr-2">
                {/* Summary Section */}
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="text-md font-bold text-gray-900 mb-3">📊 Quantity Summary</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Total Items:</p>
                      <p className="font-bold text-gray-900">{totalItemsReceived.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">After Rejection:</p>
                      <p className="font-bold text-gray-900">{netItemsAfterRejection.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Billed (Unpaid):</p>
                      <p className="font-bold text-gray-900">{(formData.billedAmount || 0).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Paid Quantity:</p>
                      <p className="font-bold text-green-700">{(formData.quantity || 0).toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Buying Price */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Buying Price *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="buyingPrice"
                        value={formatNumberWithCommas(formData.buyingPrice)}
                        onChange={handleNumberChange}
                        className={`w-full pl-4 pr-12 py-3 border ${
                          Number(formData.buyingPrice) >
                          Number(selectedItem.price)
                            ? "border-red-400 bg-red-50"
                            : "border-gray-300 bg-gray-100"
                        } rounded-lg focus:ring-2 focus:ring-green-300 focus:border-green-300 text-gray-900 font-medium`}
                        placeholder="0"
                        required
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-700 font-bold">
                        Tsh
                      </div>
                    </div>
                    {Number(formData.buyingPrice) >
                      Number(selectedItem.price) && (
                      <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                        <p className="text-xs text-red-700 font-medium">
                          ⚠️ Buying price exceeds current selling price
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Selling Price */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Selling Price
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="sellingPrice"
                        value={formatNumberWithCommas(formData.sellingPrice || selectedItem.price)}
                        onChange={handleNumberChange}
                        className={`w-full pl-4 pr-12 py-3 border ${
                          Number(formData.buyingPrice) >
                          Number(formData.sellingPrice || selectedItem.price)
                            ? "border-red-400 bg-red-50"
                            : "border-gray-300 bg-gray-100"
                        } rounded-lg focus:ring-2 focus:ring-green-300 focus:border-green-300 text-gray-900 font-medium`}
                        placeholder="0"
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-700 font-bold">
                        Tsh
                      </div>
                    </div>
                    {Number(formData.buyingPrice) >
                      Number(formData.sellingPrice || selectedItem.price) && (
                      <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                        <p className="text-xs text-red-700 font-medium">
                          ⚠️ Selling price is lower than buying price
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Units & Items Per Unit */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Units
                    </label>
                    <input
                      type="text"
                      name="units"
                      value={formatNumberWithCommas(formData.units)}
                      onChange={handleNumberChange}
                      className="w-full px-4 py-3 border border-gray-300 bg-gray-100 rounded-lg focus:ring-2 focus:ring-green-300 focus:border-green-300 text-gray-900 font-medium"
                      placeholder="Number of units"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Items Per Unit
                    </label>
                    <input
                      type="text"
                      name="itemsPerUnit"
                      value={formatNumberWithCommas(formData.itemsPerUnit)}
                      onChange={handleNumberChange}
                      className="w-full px-4 py-3 border border-gray-300 bg-gray-100 rounded-lg focus:ring-2 focus:ring-green-300 focus:border-green-300 text-gray-900 font-medium"
                      placeholder="Items per unit"
                    />
                  </div>

                  {/* FOC & Rejected */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Free Items (FOC)
                    </label>
                    <input
                      type="text"
                      name="foc"
                      value={formatNumberWithCommas(formData.foc)}
                      onChange={handleNumberChange}
                      className="w-full px-4 py-3 border border-gray-300 bg-gray-100 rounded-lg focus:ring-2 focus:ring-green-300 focus:border-green-300 text-gray-900 font-medium"
                      placeholder="Free items quantity"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Rejected Items
                    </label>
                    <input
                      type="text"
                      name="rejected"
                      value={formatNumberWithCommas(formData.rejected)}
                      onChange={handleNumberChange}
                      className="w-full px-4 py-3 border border-gray-300 bg-gray-100 rounded-lg focus:ring-2 focus:ring-green-300 focus:border-green-300 text-gray-900 font-medium"
                      placeholder="Rejected quantity"
                    />
                    {formData.rejected > totalItemsReceived && (
                      <p className="text-xs text-red-600 mt-1">
                        Cannot reject more than total items received ({totalItemsReceived.toLocaleString()})
                      </p>
                    )}
                  </div>

                  {/* Billed Amount & Calculated Quantity */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Billed Amount (Unpaid)
                    </label>
                    <input
                      type="text"
                      name="billedAmount"
                      value={formatNumberWithCommas(formData.billedAmount)}
                      onChange={handleNumberChange}
                      className="w-full px-4 py-3 border border-gray-300 bg-gray-100 rounded-lg focus:ring-2 focus:ring-green-300 focus:border-green-300 text-gray-900 font-medium"
                      placeholder="Unpaid items quantity"
                    />
                    {formData.billedAmount > netItemsAfterRejection && (
                      <p className="text-xs text-red-600 mt-1">
                        Cannot bill more than available items after rejection ({netItemsAfterRejection.toLocaleString()})
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Paid Quantity (Auto)
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="quantity"
                        value={formatNumberWithCommas(formData.quantity)}
                        readOnly
                        className="w-full px-4 py-3 border border-gray-300 bg-gray-200 rounded-lg text-gray-900 font-bold"
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-900 font-bold">
                        units
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      Calculated: (Units × Items/Unit + FOC - Rejected - Billed)
                    </p>
                  </div>
                </div>

                {/* WHOLESALE SECTION */}
                <div className="col-span-1 md:col-span-2 mt-6 pt-4 border-t border-gray-300">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                        <FiTrendingUp className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-gray-900">Bulk/Wholesale Settings</h4>
                        <p className="text-gray-600 text-sm">Configure special pricing for bulk purchases</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={toggleWholesale}
                      className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-200 ${formData.enableWholesale ? 'bg-blue-600' : 'bg-gray-300'}`}
                    >
                      <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-200 ${formData.enableWholesale ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>

                  {/* Wholesale Fields */}
                  {formData.enableWholesale && (
                    <div className="space-y-3 p-4 bg-blue-50 rounded-xl border border-blue-200">
                      {/* Wholesale Fields in 2 columns */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Wholesale Minimum Quantity */}
                        <div>
                          <div className="mb-1">
                            <label className="block text-sm font-bold text-gray-900">
                              Minimum Quantity for Wholesale
                            </label>
                            <p className="text-xs text-gray-500">
                              Minimum units required to qualify for wholesale price
                            </p>
                          </div>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-3 flex items-center">
                              <FiInfo className="w-4 h-4 text-blue-500" />
                            </div>
                            <input
                              type="text"
                              name="wholesaleMinQty"
                              value={formatNumberWithCommas(formData.wholesaleMinQty)}
                              onChange={handleNumberChange}
                              className="w-full pl-10 pr-4 py-2 border border-blue-300 rounded-full bg-white text-black focus:outline-none focus:border-blue-500"
                              placeholder="20"
                            />
                          </div>
                          {formData.wholesaleMinQty > formData.quantity && (
                            <p className="text-xs text-red-600 mt-1">
                              Minimum quantity cannot exceed paid quantity ({formData.quantity.toLocaleString()})
                            </p>
                          )}
                        </div>

                        {/* Wholesale Total Price */}
                        <div>
                          <div className="mb-1">
                            <label className="block text-sm font-bold text-gray-900">
                              Wholesale Total Price (Tsh)
                            </label>
                            <p className="text-xs text-gray-500">
                              Total price for {formData.wholesaleMinQty || "minimum"} units
                            </p>
                          </div>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-3 flex items-center">
                              <FiDollarSign className="w-4 h-4 text-blue-500" />
                            </div>
                            <input
                              type="text"
                              name="wholesalePrice"
                              value={formatNumberWithCommas(formData.wholesalePrice)}
                              onChange={handleNumberChange}
                              className="w-full pl-10 pr-4 py-2 border border-blue-300 rounded-full bg-white text-black focus:outline-none focus:border-blue-500"
                              placeholder="15,000"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Wholesale Calculation Summary */}
                      {formData.enableWholesale && formData.wholesalePrice > 0 && formData.wholesaleMinQty > 0 && formData.sellingPrice > 0 && (
                        <div className="mt-3 p-3 bg-white rounded-lg border border-blue-200">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {/* Retail vs Wholesale */}
                            <div className="space-y-2">
                              <div className="p-2 bg-gray-50 rounded">
                                <p className="text-xs text-gray-500">Retail Total for {formData.wholesaleMinQty.toLocaleString()} units</p>
                                <p className="text-sm font-bold text-gray-800">
                                  Tsh {calculatedValues.totalRetailPrice.toLocaleString()}
                                </p>
                              </div>
                              <div className="p-2 bg-blue-50 rounded">
                                <p className="text-xs text-blue-600">Wholesale Total</p>
                                <p className="text-sm font-bold text-blue-700">
                                  Tsh {formData.wholesalePrice.toLocaleString()}
                                </p>
                              </div>
                            </div>

                            {/* Savings and Per Unit */}
                            <div className="space-y-2">
                              <div className={`p-2 ${calculatedValues.savingsAmount >= 0 ? 'bg-green-50' : 'bg-red-50'} rounded`}>
                                <div className="flex justify-between">
                                  <div>
                                    <p className="text-xs text-gray-600">Difference</p>
                                    <p className={`text-sm font-bold ${calculatedValues.savingsAmount >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                                      {calculatedValues.savingsAmount >= 0 ? 'Savings: ' : 'Extra: '}
                                      Tsh {Math.abs(calculatedValues.savingsAmount).toLocaleString()}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-xs text-gray-600">Discount/Premium</p>
                                    <p className={`text-sm font-bold ${calculatedValues.discountPercentage >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                                      {calculatedValues.discountPercentage >= 0 ? '' : '+'}{Math.abs(calculatedValues.discountPercentage).toFixed(1)}%
                                    </p>
                                  </div>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <div className="p-2 border border-gray-200 rounded text-center">
                                  <p className="text-xs text-gray-500">Retail/unit</p>
                                  <p className="text-sm font-medium">Tsh {parseFloat(formData.sellingPrice || selectedItem.price).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                                </div>
                                <div className={`p-2 border ${calculatedValues.perUnitWholesalePrice <= (formData.sellingPrice || selectedItem.price) ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'} rounded text-center`}>
                                  <p className={`text-xs ${calculatedValues.perUnitWholesalePrice <= (formData.sellingPrice || selectedItem.price) ? 'text-green-600' : 'text-red-600'}`}>Wholesale/unit</p>
                                  <p className={`text-sm font-bold ${calculatedValues.perUnitWholesalePrice <= (formData.sellingPrice || selectedItem.price) ? 'text-green-700' : 'text-red-700'}`}>
                                    Tsh {calculatedValues.perUnitWholesalePrice.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Stock Check */}
                          {formData.quantity > 0 && (
                            <div className={`mt-2 p-2 rounded text-center text-sm ${formData.quantity >= formData.wholesaleMinQty ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                              <span className="font-medium">
                                {formData.quantity >= formData.wholesaleMinQty ? '✓' : '⚠'} 
                                Paid quantity: {formData.quantity.toLocaleString()} units 
                                {formData.quantity >= formData.wholesaleMinQty 
                                  ? ` (Sufficient for wholesale orders)` 
                                  : ` (Insufficient for wholesale minimum of ${formData.wholesaleMinQty.toLocaleString()} units)`}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Dates Section */}
                <div className="col-span-1 md:col-span-2 mt-4 border-t border-gray-300 pt-4">
                  <h4 className="text-md font-bold text-gray-900 mb-4">
                    📅 Date Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Manufacture Date */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
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
                            handleDateChange("manufactureDate", newValue ? newValue.format("YYYY-MM-DD") : "");
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
                            },
                          }}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: "0.5rem",
                              backgroundColor: "#f9fafb",
                              "&:hover .MuiOutlinedInput-notchedOutline": {
                                borderColor: "#86efac",
                              },
                              "&.Mui-focused .MuiOutlinedInput-notchedOutline":
                                {
                                  borderColor: "#86efac",
                                  borderWidth: "2px",
                                },
                            },
                            "& .MuiInputBase-input": {
                              color: "#1f2937",
                              fontWeight: "500",
                            },
                          }}
                        />
                      </LocalizationProvider>
                    </div>

                    {/* Expiry Date */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
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
                            handleDateChange("expiryDate", newValue ? newValue.format("YYYY-MM-DD") : "");
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
                            },
                          }}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: "0.5rem",
                              backgroundColor: "#f9fafb",
                              "&:hover .MuiOutlinedInput-notchedOutline": {
                                borderColor: "#86efac",
                              },
                            },
                          }}
                        />
                      </LocalizationProvider>
                    </div>

                    {/* Received Date */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
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
                            handleDateChange("receivedDate", newValue ? newValue.format("YYYY-MM-DD") : "");
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
                            },
                          }}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: "0.5rem",
                              backgroundColor: "#f9fafb",
                              "&:hover .MuiOutlinedInput-notchedOutline": {
                                borderColor: "#86efac",
                              },
                            },
                          }}
                        />
                      </LocalizationProvider>
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                <div className="col-span-1 md:col-span-2 border-t border-gray-300 pt-4 mt-4">
                  <h4 className="text-md font-bold text-gray-900 mb-4">
                    📝 Additional Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Batch Number */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Batch Number *
                      </label>
                      <input
                        type="text"
                        name="batchNumber"
                        value={formData.batchNumber}
                        onChange={handleTextChange}
                        className="w-full px-4 py-3 border border-gray-300 bg-gray-100 rounded-lg focus:ring-2 focus:ring-green-300 focus:border-green-300 text-gray-900 font-medium"
                        placeholder="Enter batch number"
                        required
                      />
                    </div>

                    {/* Total Cost */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
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
                          className="w-full pl-4 pr-4 py-3 border border-gray-300 bg-gray-200 rounded-lg text-gray-900 font-bold"
                        />
                        {formData.totalCost && (
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-600 font-bold">
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
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Comments
                      </label>
                      <textarea
                        name="comments"
                        value={formData.comments}
                        onChange={handleTextChange}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 bg-gray-100 rounded-lg focus:ring-2 focus:ring-green-300 focus:border-green-300 text-gray-900 font-medium resize-none"
                        placeholder="Add any comments or notes about this item..."
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 pt-6 border-t border-gray-300">
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={handleAdd}
                    disabled={!canAddItem}
                    className={`flex-1 py-3 px-6 rounded-lg font-bold text-lg transition-all ${
                      !canAddItem
                        ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                        : "bg-green-300 text-gray-900 hover:bg-green-400 hover:shadow-md transform hover:-translate-y-0.5"
                    }`}
                  >
                    ✓ Add Item to List
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex-1 py-3 px-6 border border-gray-300 text-gray-900 font-bold rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    ✗ Cancel Selection
                  </button>
                </div>
                {!canAddItem && selectedItem && (
                  <p className="text-sm text-red-600 mt-2 text-center">
                    Please fill all required fields (Buying Price and at least some quantity or billed amount)
                  </p>
                )}
              </div>
            </div>
          ) : (
            /* Empty State */
            <div className="h-full flex flex-col items-center justify-center p-12">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full flex items-center justify-center shadow-inner">
                <TiArrowRightThick className="text-4xl text-gray-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                No Item Selected
              </h3>
              <p className="text-gray-600 font-medium text-center mb-8 max-w-md">
                Select an item from the products table on the left to enter
                purchase details
              </p>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Section2;