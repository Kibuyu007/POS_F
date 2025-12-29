import axios from "axios";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { additem } from "../../../../Redux/items";
import { fetchCategories } from "../../../../Redux/itemsCategories";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  FiBox,
  FiTag,
  FiPackage,
  FiCalendar,
  FiRefreshCw,
  FiPercent,
  FiCamera,
  FiX,
  FiCheck,
  FiTrendingUp,
  FiMinus,
} from "react-icons/fi";

//API
import BASE_URL from "../../../../Utils/config";
import toast from "react-hot-toast";

const AddItem = ({ showModal, setShowModal, onUserAdded }) => {
  //Use selector from Redux
  const { category } = useSelector((state) => state.category);

  const [file, setFile] = useState();
  const [photoPreview, setPhotoPreview] = useState(null);
  const [showError, setShowError] = useState("");
  const [loading, setLoading] = useState(false);

  const [regi, setRegi] = useState({
    name: "",
    price: "",
    category: "",
    barCode: "",
    itemQuantity: "",
    manufactureDate: new Date(),
    expireDate: new Date(),
    reOrder: "",
    discount: "",
    wholesalePrice: "",
    wholesaleMinQty: "",
    enableWholesale: false,
  });

  const [calculatedValues, setCalculatedValues] = useState({
    perUnitWholesalePrice: 0,
    discountPercentage: 0,
    totalRetailPrice: 0,
    savingsAmount: 0,
  });

  const dispatch = useDispatch();

  useEffect(() => {
    if (!category.length) {
      dispatch(fetchCategories());
    }
  }, [dispatch, category.length]);

  // Helper function to format numbers with commas
  const formatNumberWithCommas = (value) => {
    if (value === "" || value === null || value === undefined) return "";
    // Remove any existing commas
    const stringValue = value.toString().replace(/,/g, "");
    // Parse as float to handle decimal numbers
    const number = parseFloat(stringValue);
    if (isNaN(number)) return "";
    // Format with commas for thousands
    return number.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  };

  // Parse comma-formatted number back to raw number
  const parseCommaFormattedNumber = (formattedValue) => {
    if (
      formattedValue === "" ||
      formattedValue === null ||
      formattedValue === undefined
    )
      return "";
    // Remove all non-numeric characters except decimal point
    const cleanedValue = formattedValue.replace(/[^\d.]/g, "");
    if (cleanedValue === "") return "";

    // Parse as float
    const number = parseFloat(cleanedValue);
    return isNaN(number) ? "" : number;
  };

  useEffect(() => {
    const rawPrice = parseCommaFormattedNumber(regi.price) || 0;
    const rawWholesalePrice =
      parseCommaFormattedNumber(regi.wholesalePrice) || 0;
    const rawWholesaleMinQty =
      parseCommaFormattedNumber(regi.wholesaleMinQty) || 0;

    if (
      regi.enableWholesale &&
      rawWholesalePrice > 0 &&
      rawWholesaleMinQty > 0 &&
      rawPrice > 0
    ) {
      const perUnitWholesalePrice = rawWholesalePrice / rawWholesaleMinQty;
      const totalRetailPrice = rawPrice * rawWholesaleMinQty;
      const savingsAmount = totalRetailPrice - rawWholesalePrice;
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
    regi.wholesalePrice,
    regi.wholesaleMinQty,
    regi.price,
    regi.enableWholesale,
  ]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      setRegi({ ...regi, [name]: checked });
      return;
    }

    // Handle text fields
    if (name === "name" || name === "category" || name === "barCode") {
      setRegi({ ...regi, [name]: value });
      return;
    }

    // Handle numeric fields with comma formatting
    if (
      [
        "price",
        "itemQuantity",
        "reOrder",
        "discount",
        "wholesalePrice",
        "wholesaleMinQty",
      ].includes(name)
    ) {
      // Allow only numbers and decimal point
      const cleanedValue = value.replace(/[^\d.]/g, "");

      // Prevent multiple decimal points
      const parts = cleanedValue.split(".");
      if (parts.length > 2) {
        return; // Invalid input, don't update
      }

      // Limit decimal places to 2
      if (parts.length === 2 && parts[1].length > 2) {
        return;
      }

      setRegi({ ...regi, [name]: cleanedValue });
      return;
    }

    setRegi({ ...regi, [name]: value });
  };

  const toggleWholesale = () => {
    const newEnableWholesale = !regi.enableWholesale;
    if (!newEnableWholesale) {
      setRegi({
        ...regi,
        enableWholesale: false,
        wholesalePrice: "",
        wholesaleMinQty: "",
      });
    } else {
      setRegi({ ...regi, enableWholesale: true });
    }
  };

  const handleManufacturedDate = (date) => {
    setRegi({ ...regi, manufactureDate: date });
  };

  const handleExpireDate = (date) => {
    setRegi({ ...regi, expireDate: date });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleAddItems = async (e) => {
    e.preventDefault();

    // Parse numeric values before validation
    const rawPrice = parseCommaFormattedNumber(regi.price) || 0;
    const rawQuantity = parseCommaFormattedNumber(regi.itemQuantity) || 0;
    const rawReOrder = parseCommaFormattedNumber(regi.reOrder) || 0;
    const rawDiscount = parseCommaFormattedNumber(regi.discount) || 0;
    const rawWholesalePrice =
      parseCommaFormattedNumber(regi.wholesalePrice) || 0;
    const rawWholesaleMinQty =
      parseCommaFormattedNumber(regi.wholesaleMinQty) || 0;

    if (!regi.name.trim()) {
      setShowError("Item name is required");
      return;
    }

    if (!rawPrice || Number(rawPrice) <= 0) {
      setShowError("Price must be greater than 0");
      return;
    }

    if (!regi.category) {
      setShowError("Please select a category");
      return;
    }

    if (rawDiscount && Number(rawDiscount) > Number(rawPrice)) {
      setShowError("Discount cannot exceed item price");
      return;
    }

    if (regi.enableWholesale) {
      if (!rawWholesalePrice || Number(rawWholesalePrice) <= 0) {
        setShowError(
          "Wholesale price must be greater than 0 when wholesale is enabled"
        );
        return;
      }
      if (!rawWholesaleMinQty || Number(rawWholesaleMinQty) <= 0) {
        setShowError(
          "Wholesale minimum quantity must be greater than 0 when wholesale is enabled"
        );
        return;
      }

      const retailTotal = rawPrice * rawWholesaleMinQty;
      if (Number(rawWholesalePrice) >= retailTotal) {
        setShowError(
          "Wholesale price must be less than retail total for minimum quantity"
        );
        return;
      }
    }

    setLoading(true);
    try {
      // Prepare data with parsed numeric values
      const itemData = {
        ...regi,
        price: rawPrice,
        itemQuantity: rawQuantity,
        reOrder: rawReOrder,
        discount: rawDiscount,
        wholesalePrice: rawWholesalePrice,
        wholesaleMinQty: rawWholesaleMinQty,
      };

      const response = await axios.post(
        `${BASE_URL}/api/items/addItem`,
        itemData,
        {
          withCredentials: true,
        }
      );

      dispatch(additem(response?.data));

      setRegi({
        name: "",
        price: "",
        category: "",
        barCode: "",
        itemQuantity: "",
        manufactureDate: new Date(),
        expireDate: new Date(),
        reOrder: "",
        discount: "",
        wholesalePrice: "",
        wholesaleMinQty: "",
        enableWholesale: false,
      });

      setFile(null);
      setPhotoPreview(null);
      setShowError("");
      setCalculatedValues({
        perUnitWholesalePrice: 0,
        discountPercentage: 0,
        totalRetailPrice: 0,
        savingsAmount: 0,
      });

      toast.success("Item added successfully!");
      setTimeout(() => {
        setShowModal(false);
        onUserAdded();
      }, 1500);
    } catch (error) {
      if (error.response && error.response.data) {
        setShowError(
          error.response.data.error || "Failed to add item. Please try again."
        );
      } else {
        setShowError("An error occurred. Please Contact System Administrator.");
      }
      console.error("Add item failed", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setRegi({
      name: "",
      price: "",
      category: "",
      barCode: "",
      itemQuantity: "",
      manufactureDate: new Date(),
      expireDate: new Date(),
      reOrder: "",
      discount: "",
      wholesalePrice: "",
      wholesaleMinQty: "",
      enableWholesale: false,
    });
    setFile(null);
    setPhotoPreview(null);
    setShowError("");
    setCalculatedValues({
      perUnitWholesalePrice: 0,
      discountPercentage: 0,
      totalRetailPrice: 0,
      savingsAmount: 0,
    });
  };

  return (
    <>
      {showModal ? (
        <>
          <div className="flex justify-center items-center overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none bg-gray-900 bg-opacity-20">
            {/* Wider modal container */}
            <div className="w-11/12 md:w-4/5 lg:w-3/4 xl:w-7/12 max-w-6xl">
              <div className="border border-gray-300 rounded-2xl shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none max-h-[85vh]">
                {/* Header */}
                <div className="flex items-start justify-between p-5 bg-green-300 border-b border-gray-400 rounded-t-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center">
                      <FiBox className="w-5 h-5 text-black" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-black">
                        + Add New Item
                      </h3>
                      <p className="text-black/70 text-sm mt-1">
                        Enter item details
                      </p>
                    </div>
                  </div>
                  <button
                    className="p-2 hover:bg-black/5 rounded-full transition-colors"
                    onClick={() => setShowModal(false)}
                  >
                    <FiX className="w-5 h-5 text-black" />
                  </button>
                </div>

                {/* Main Form Content with scrolling */}
                <div className="relative p-6 flex-auto overflow-y-auto max-h-[65vh]">
                  <form
                    onSubmit={handleAddItems}
                    className="grid grid-cols-1 md:grid-cols-3 gap-4"
                  >
                    {/* Item Name - Full width */}
                    <div className="col-span-1 md:col-span-3">
                      <div className="mb-2">
                        <label className="block text-sm font-bold text-gray-900">
                          Item Name
                        </label>
                      </div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-3 flex items-center">
                          <FiBox className="w-4 h-4 text-gray-500" />
                        </div>
                        <input
                          type="text"
                          name="name"
                          value={regi.name}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full bg-white text-black focus:outline-none focus:border-green-300"
                          placeholder="Enter item name"
                          disabled={loading}
                          autoFocus
                        />
                      </div>
                    </div>

                    {/* Price */}
                    <div>
                      <div className="mb-2">
                        <label className="block text-sm font-bold text-gray-900">
                          Retail Price (per unit)
                        </label>
                      </div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-3 flex items-center"></div>
                        <input
                          type="text"
                          name="price"
                          value={formatNumberWithCommas(regi.price)}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full bg-white text-black focus:outline-none focus:border-green-300"
                          placeholder="0.00"
                          disabled={loading}
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                          Tsh
                        </div>
                      </div>
                    </div>

                    {/* Category */}
                    <div>
                      <div className="mb-2">
                        <label className="block text-sm font-bold text-gray-900">
                          Category
                        </label>
                      </div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-3 flex items-center">
                          <FiTag className="w-4 h-4 text-gray-500" />
                        </div>
                        <select
                          name="category"
                          value={regi.category}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full bg-white text-black focus:outline-none focus:border-green-300 appearance-none"
                          disabled={loading}
                        >
                          <option value="" disabled className="text-gray-500">
                            Select a category
                          </option>
                          {category.map((category) => (
                            <option key={category._id} value={category._id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Quantity */}
                    <div>
                      <div className="mb-2">
                        <label className="block text-sm font-bold text-gray-900">
                          Stock Quantity
                        </label>
                      </div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-3 flex items-center">
                          <FiPackage className="w-4 h-4 text-gray-500" />
                        </div>
                        <input
                          type="text"
                          name="itemQuantity"
                          value={formatNumberWithCommas(regi.itemQuantity)}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full bg-white text-black focus:outline-none focus:border-green-300"
                          placeholder="0"
                          disabled={loading}
                        />
                      </div>
                    </div>

                    {/* Manufacturing Date */}
                    <div>
                      <div className="mb-2">
                        <label className="block text-sm font-bold text-gray-900">
                          Manufacturing Date
                        </label>
                      </div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-3 flex items-center">
                          <FiCalendar className="w-4 h-4 text-gray-500" />
                        </div>
                        <DatePicker
                          selected={regi.manufactureDate}
                          onChange={handleManufacturedDate}
                          showTimeSelect
                          timeIntervals={1}
                          dateFormat="Pp"
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full bg-white text-black focus:outline-none focus:border-green-300 text-sm"
                          wrapperClassName="w-full"
                          disabled={loading}
                        />
                      </div>
                    </div>

                    {/* Expiry Date */}
                    <div>
                      <div className="mb-2">
                        <label className="block text-sm font-bold text-gray-900">
                          Expiry Date
                        </label>
                      </div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-3 flex items-center">
                          <FiCalendar className="w-4 h-4 text-gray-500" />
                        </div>
                        <DatePicker
                          selected={regi.expireDate}
                          onChange={handleExpireDate}
                          showTimeSelect
                          timeIntervals={1}
                          dateFormat="Pp"
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full bg-white text-black focus:outline-none focus:border-green-300 text-sm"
                          wrapperClassName="w-full"
                          disabled={loading}
                        />
                      </div>
                    </div>

                    {/* Re-Order Quantity */}
                    <div>
                      <div className="mb-2">
                        <label className="block text-sm font-bold text-gray-900">
                          Re-Order Quantity
                        </label>
                      </div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-3 flex items-center">
                          <FiRefreshCw className="w-4 h-4 text-gray-500" />
                        </div>
                        <input
                          type="text"
                          name="reOrder"
                          value={formatNumberWithCommas(regi.reOrder)}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full bg-white text-black focus:outline-none focus:border-green-300"
                          placeholder="0"
                          disabled={loading}
                        />
                      </div>
                    </div>

                    {/* Discount */}
                    <div>
                      <div className="mb-2">
                        <label className="block text-sm font-bold text-gray-900">
                          Discount Amount (per unit)
                        </label>
                      </div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-3 flex items-center">
                          <FiPercent className="w-4 h-4 text-gray-500" />
                        </div>
                        <input
                          type="text"
                          name="discount"
                          value={formatNumberWithCommas(regi.discount)}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full bg-white text-black focus:outline-none focus:border-green-300"
                          placeholder="0.00"
                          disabled={loading}
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                          Tsh
                        </div>
                      </div>
                    </div>

                    {/* WHOLESALE SECTION - Full width */}
                    <div className="col-span-1 md:col-span-3 mt-4 pt-4 border-t border-gray-300">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                            <FiTrendingUp className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="text-lg font-bold text-gray-900">
                              Bulk/Wholesale Settings
                            </h4>
                            <p className="text-gray-600 text-sm">
                              Configure special pricing for bulk purchases
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={toggleWholesale}
                          className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-200 ${
                            regi.enableWholesale ? "bg-blue-600" : "bg-gray-300"
                          }`}
                        >
                          <span
                            className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-200 ${
                              regi.enableWholesale
                                ? "translate-x-6"
                                : "translate-x-1"
                            }`}
                          />
                        </button>
                      </div>

                      {/* Wholesale Fields */}
                      {regi.enableWholesale && (
                        <div className="space-y-3 p-4 bg-blue-50 rounded-xl border border-blue-200">
                          {/* Wholesale Fields in 2 columns */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Wholesale Minimum Quantity */}
                            <div>
                              <div className="mb-1">
                                <label className="block text-sm font-bold text-gray-900">
                                  Minimum Quantity for Wholesale
                                </label>
                              </div>
                              <div className="relative">
                                <div className="absolute inset-y-0 left-3 flex items-center">
                                  <FiMinus className="w-4 h-4 text-blue-500" />
                                </div>
                                <input
                                  type="text"
                                  name="wholesaleMinQty"
                                  value={formatNumberWithCommas(
                                    regi.wholesaleMinQty
                                  )}
                                  onChange={handleChange}
                                  className="w-full pl-10 pr-4 py-2 border border-blue-300 rounded-full bg-white text-black focus:outline-none focus:border-blue-500"
                                  placeholder="20"
                                  disabled={loading}
                                />
                              </div>
                            </div>

                            {/* Wholesale Total Price */}
                            <div>
                              <div className="mb-1">
                                <label className="block text-sm font-bold text-gray-900">
                                  Wholesale Total Price (Tsh)
                                </label>
                              </div>
                              <div className="relative">
                                <div className="absolute inset-y-0 left-3 flex items-center"></div>
                                <input
                                  type="text"
                                  name="wholesalePrice"
                                  value={formatNumberWithCommas(
                                    regi.wholesalePrice
                                  )}
                                  onChange={handleChange}
                                  className="w-full pl-10 pr-4 py-2 border border-blue-300 rounded-full bg-white text-black focus:outline-none focus:border-blue-500"
                                  placeholder="15000.00"
                                  disabled={loading}
                                />
                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                                  Tsh
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Wholesale Calculation Summary */}
                          {regi.enableWholesale &&
                            parseCommaFormattedNumber(regi.wholesalePrice) >
                              0 &&
                            parseCommaFormattedNumber(regi.wholesaleMinQty) >
                              0 &&
                            parseCommaFormattedNumber(regi.price) > 0 && (
                              <div className="mt-3 p-3 bg-white rounded-lg border border-blue-200">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  {/* Retail vs Wholesale */}
                                  <div className="space-y-2">
                                    <div className="p-2 bg-gray-50 rounded">
                                      <p className="text-xs text-gray-500">
                                        Retail Total for{" "}
                                        {parseCommaFormattedNumber(
                                          regi.wholesaleMinQty
                                        ).toLocaleString()}{" "}
                                        units
                                      </p>
                                      <p className="text-sm font-bold text-gray-800">
                                        Tsh{" "}
                                        {calculatedValues.totalRetailPrice.toLocaleString()}
                                      </p>
                                    </div>
                                    <div className="p-2 bg-blue-50 rounded">
                                      <p className="text-xs text-blue-600">
                                        Wholesale Total
                                      </p>
                                      <p className="text-sm font-bold text-blue-700">
                                        Tsh{" "}
                                        {parseCommaFormattedNumber(
                                          regi.wholesalePrice
                                        ).toLocaleString()}
                                      </p>
                                    </div>
                                  </div>

                                  {/* Savings and Per Unit */}
                                  <div className="space-y-2">
                                    <div className="p-2 bg-green-50 rounded">
                                      <div className="flex justify-between">
                                        <div>
                                          <p className="text-xs text-gray-600">
                                            Savings
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
                                            {
                                              calculatedValues.discountPercentage
                                            }
                                            %
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                      <div className="p-2 border border-gray-200 rounded text-center">
                                        <p className="text-xs text-gray-500">
                                          Retail/unit
                                        </p>
                                        <p className="text-sm font-medium">
                                          Tsh{" "}
                                          {parseCommaFormattedNumber(
                                            regi.price
                                          ).toLocaleString()}
                                        </p>
                                      </div>
                                      <div className="p-2 border border-green-200 bg-green-50 rounded text-center">
                                        <p className="text-xs text-green-600">
                                          Wholesale/unit
                                        </p>
                                        <p className="text-sm font-bold text-green-700">
                                          Tsh{" "}
                                          {calculatedValues.perUnitWholesalePrice.toLocaleString()}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Stock Check */}
                                {parseCommaFormattedNumber(regi.itemQuantity) >
                                  0 && (
                                  <div
                                    className={`mt-2 p-2 rounded text-center text-sm ${
                                      parseCommaFormattedNumber(
                                        regi.itemQuantity
                                      ) >=
                                      parseCommaFormattedNumber(
                                        regi.wholesaleMinQty
                                      )
                                        ? "bg-green-100 text-green-700"
                                        : "bg-yellow-100 text-yellow-700"
                                    }`}
                                  >
                                    <span className="font-medium">
                                      {parseCommaFormattedNumber(
                                        regi.itemQuantity
                                      ) >=
                                      parseCommaFormattedNumber(
                                        regi.wholesaleMinQty
                                      )
                                        ? "✓"
                                        : "⚠"}
                                      Stock:{" "}
                                      {parseCommaFormattedNumber(
                                        regi.itemQuantity
                                      ).toLocaleString()}{" "}
                                      units
                                    </span>
                                  </div>
                                )}
                              </div>
                            )}
                        </div>
                      )}
                    </div>

                    {/* Photo Upload - Full width */}
                    <div className="col-span-1 md:col-span-3">
                      <div className="mb-2">
                        <label className="block text-sm font-bold text-gray-900">
                          Item Photo (Optional)
                        </label>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <input
                            type="file"
                            onChange={handlePhotoChange}
                            className="hidden"
                            id="photo-upload"
                            disabled={loading}
                          />
                          <label
                            htmlFor="photo-upload"
                            className="px-4 py-2 border border-gray-300 rounded-full bg-white text-black font-medium hover:bg-gray-50 cursor-pointer flex items-center gap-2 text-sm"
                          >
                            <FiCamera className="w-4 h-4" />
                            Choose Photo
                          </label>
                        </div>
                        {photoPreview && (
                          <div className="relative">
                            <img
                              src={photoPreview}
                              alt="Preview"
                              className="w-12 h-12 rounded-full object-cover border-2 border-gray-300"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setPhotoPreview(null);
                                setFile(null);
                              }}
                              className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs"
                            >
                              ×
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Validation Summary - Full width */}
                    <div className="col-span-1 md:col-span-3 bg-gray-100 rounded-xl p-3 border border-gray-300">
                      <p className="text-sm font-bold text-black mb-2">
                        Validation Status
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        <div
                          className={`flex items-center gap-2 ${
                            regi.name ? "text-green-700" : "text-gray-600"
                          }`}
                        >
                          <div
                            className={`w-2 h-2 rounded-full ${
                              regi.name ? "bg-green-300" : "bg-gray-400"
                            }`}
                          />
                          <span className="text-xs">
                            Name {regi.name ? "✓" : ""}
                          </span>
                        </div>
                        <div
                          className={`flex items-center gap-2 ${
                            parseCommaFormattedNumber(regi.price) > 0
                              ? "text-green-700"
                              : "text-gray-600"
                          }`}
                        >
                          <div
                            className={`w-2 h-2 rounded-full ${
                              parseCommaFormattedNumber(regi.price) > 0
                                ? "bg-green-300"
                                : "bg-gray-400"
                            }`}
                          />
                          <span className="text-xs">
                            Price{" "}
                            {parseCommaFormattedNumber(regi.price) > 0
                              ? "✓"
                              : ""}
                          </span>
                        </div>
                        <div
                          className={`flex items-center gap-2 ${
                            regi.category ? "text-green-700" : "text-gray-600"
                          }`}
                        >
                          <div
                            className={`w-2 h-2 rounded-full ${
                              regi.category ? "bg-green-300" : "bg-gray-400"
                            }`}
                          />
                          <span className="text-xs">
                            Category {regi.category ? "✓" : ""}
                          </span>
                        </div>
                        <div
                          className={`flex items-center gap-2 ${
                            regi.enableWholesale &&
                            parseCommaFormattedNumber(regi.wholesalePrice) >
                              0 &&
                            parseCommaFormattedNumber(regi.wholesaleMinQty) > 0
                              ? "text-green-700"
                              : regi.enableWholesale
                              ? "text-yellow-600"
                              : "text-gray-400"
                          }`}
                        >
                          <div
                            className={`w-2 h-2 rounded-full ${
                              regi.enableWholesale &&
                              parseCommaFormattedNumber(regi.wholesalePrice) >
                                0 &&
                              parseCommaFormattedNumber(regi.wholesaleMinQty) >
                                0
                                ? "bg-green-300"
                                : regi.enableWholesale
                                ? "bg-yellow-300"
                                : "bg-gray-300"
                            }`}
                          />
                          <span className="text-xs">Wholesale</span>
                        </div>
                      </div>
                    </div>

                    {/* Error Message - Full width */}
                    {showError && (
                      <div className="col-span-1 md:col-span-3">
                        <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-3 text-sm">
                          <span className="font-bold">Error: </span> {showError}
                        </div>
                      </div>
                    )}

                    {/* Submit Button - Full width */}
                    <div className="col-span-1 md:col-span-3">
                      <button
                        type="submit"
                        disabled={
                          loading ||
                          !regi.name ||
                          !parseCommaFormattedNumber(regi.price) ||
                          !regi.category
                        }
                        className={`w-full py-2 font-bold rounded-full flex items-center justify-center gap-2 text-sm ${
                          loading ||
                          !regi.name ||
                          !parseCommaFormattedNumber(regi.price) ||
                          !regi.category
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : "bg-green-300 hover:bg-green-400 text-black"
                        }`}
                      >
                        {loading ? (
                          <>
                            <svg
                              className="animate-spin h-4 w-4 text-black"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            <span>Processing...</span>
                          </>
                        ) : (
                          <>
                            <FiCheck className="w-4 h-4" />
                            <span>Add Item</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between p-4 border-t border-gray-300">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-black font-bold rounded-full transition-colors text-sm"
                    disabled={loading}
                  >
                    Reset
                  </button>
                  <button
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-black font-bold rounded-full transition-colors text-sm"
                    onClick={() => setShowModal(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </>
  );
};

export default AddItem;
