import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useDispatch, useSelector } from "react-redux";
import { fetchCategories } from "../../../../Redux/itemsCategories";
import axios from "axios";
import {
  FiBox,
  FiDollarSign,
  FiTag,
  FiPackage,
  FiCalendar,
  FiRefreshCw,
  FiPercent,
  FiCamera,
  FiX,
  FiCheck,
  FiEdit,
  FiTrendingUp,
  FiInfo,
  FiShoppingBag,
  FiMinus,
} from "react-icons/fi";

//API
import BASE_URL from "../../../../Utils/config";
import toast from "react-hot-toast";

const EditItem = ({ showModal, setShowModal, item, onItemUpdated }) => {
  const { category } = useSelector((state) => state.category);
  const dispatch = useDispatch();

  const [showError, setShowError] = useState("");
  const [file, setFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const [calculatedValues, setCalculatedValues] = useState({
    perUnitWholesalePrice: 0,
    discountPercentage: 0,
    totalRetailPrice: 0,
    savingsAmount: 0,
  });

  const [editData, setEditData] = useState({
    name: "",
    price: "",
    category: "",
    photo: "",
    barCode: "",
    itemQuantity: "",
    reOrder: "",
    discount: "",
    manufactureDate: new Date(),
    expireDate: new Date(),
    // WHOLESALE FIELDS
    wholesalePrice: "",
    wholesaleMinQty: "1", // Fixed to 1
    enableWholesale: false,
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

  // Parse comma-formatted number back to raw number
  const parseCommaFormattedNumber = (formattedValue) => {
    if (
      formattedValue === "" ||
      formattedValue === null ||
      formattedValue === undefined
    )
      return 0;
    const cleanedValue = formattedValue.replace(/[^\d.]/g, "");
    if (cleanedValue === "") return 0;
    const number = parseFloat(cleanedValue);
    return isNaN(number) ? 0 : number;
  };

  useEffect(() => {
    if (item) {
      const newEditData = {
        name: item.name || "",
        price: item.price?.toString() || "",
        photo: item.photo || "",
        category: item.category?._id || item.category || "",
        barCode: item.barCode || "",
        itemQuantity: item.itemQuantity?.toString() || "",
        reOrder: item.reOrder?.toString() || "",
        discount: item.discount?.toString() || "",
        manufactureDate: item.manufactureDate
          ? new Date(item.manufactureDate)
          : new Date(),
        expireDate: item.expireDate ? new Date(item.expireDate) : new Date(),
        // WHOLESALE FIELDS - Always set wholesaleMinQty to 1
        wholesalePrice: item.wholesalePrice?.toString() || "",
        wholesaleMinQty: "1", // Force to 1
        enableWholesale: item.enableWholesale || false,
      };

      setEditData(newEditData);

      if (item.photo) {
        setPhotoPreview(item.photo);
      }

      // Calculate wholesale values (using 1 as minQty)
      const rawPrice = parseFloat(item.price) || 0;
      const rawWholesalePrice = parseFloat(item.wholesalePrice) || 0;
      const rawWholesaleMinQty = 1; // Always 1

      if (item.enableWholesale && rawWholesalePrice > 0 && rawPrice > 0) {
        const perUnitWholesalePrice = rawWholesalePrice; // Since minQty is 1
        const totalRetailPrice = rawPrice; // Since minQty is 1
        const savingsAmount = totalRetailPrice - rawWholesalePrice;
        const discountPercentage =
          totalRetailPrice > 0 ? (savingsAmount / totalRetailPrice) * 100 : 0;

        setCalculatedValues({
          perUnitWholesalePrice: parseFloat(perUnitWholesalePrice.toFixed(2)),
          discountPercentage: parseFloat(discountPercentage.toFixed(1)),
          totalRetailPrice: parseFloat(totalRetailPrice.toFixed(2)),
          savingsAmount: parseFloat(savingsAmount.toFixed(2)),
        });
      }
    }
  }, [item]);

  // Recalculate when wholesale fields change
  useEffect(() => {
    const rawPrice = parseCommaFormattedNumber(editData.price);
    const rawWholesalePrice = parseCommaFormattedNumber(
      editData.wholesalePrice
    );
    const rawWholesaleMinQty = 1; // Always 1

    if (editData.enableWholesale && rawWholesalePrice > 0 && rawPrice > 0) {
      const perUnitWholesalePrice = rawWholesalePrice; // Since minQty is 1
      const totalRetailPrice = rawPrice; // Since minQty is 1
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
  }, [editData.wholesalePrice, editData.price, editData.enableWholesale]);

  //Fetch Item Category
  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      setEditData({ ...editData, [name]: checked });
      return;
    }

    // Handle text fields
    if (name === "name" || name === "category" || name === "barCode") {
      setEditData({ ...editData, [name]: value });
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

      setEditData({ ...editData, [name]: cleanedValue });
      return;
    }

    // Prevent changes to wholesaleMinQty - keep it as "1"
    if (name === "wholesaleMinQty") {
      return; // Do nothing, keep it as "1"
    }

    setEditData({ ...editData, [name]: value });
  };

  const toggleWholesale = () => {
    const newEnableWholesale = !editData.enableWholesale;
    if (!newEnableWholesale) {
      setEditData({
        ...editData,
        enableWholesale: false,
        wholesalePrice: "",
        wholesaleMinQty: "1",
      });
    } else {
      setEditData({ ...editData, enableWholesale: true, wholesaleMinQty: "1" });
    }
  };

  const handleManufacturedDate = (date) => {
    setEditData({ ...editData, manufactureDate: date });
  };

  const handleExpireDate = (date) => {
    setEditData({ ...editData, expireDate: date });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();

    // Parse numeric values before validation
    const rawPrice = parseCommaFormattedNumber(editData.price);
    const rawQuantity = parseCommaFormattedNumber(editData.itemQuantity);
    const rawReOrder = parseCommaFormattedNumber(editData.reOrder);
    const rawDiscount = parseCommaFormattedNumber(editData.discount);
    const rawWholesalePrice = parseCommaFormattedNumber(
      editData.wholesalePrice
    );
    const rawWholesaleMinQty = 1; // Always 1

    // Validation
    if (!editData.name.trim()) {
      toast.error("Item name is required");
      return;
    }

    if (!rawPrice || Number(rawPrice) <= 0) {
      toast.error("Price must be greater than 0");
      return;
    }

    if (!editData.category) {
      toast.error("Please select a category");
      return;
    }

    if (rawDiscount && Number(rawDiscount) > Number(rawPrice)) {
      toast.error("Discount cannot exceed item price");
      return;
    }

    // Wholesale validation (simplified since minQty is always 1)
    if (editData.enableWholesale) {
      if (!rawWholesalePrice || Number(rawWholesalePrice) <= 0) {
        toast.error(
          "Wholesale price must be greater than 0 when wholesale is enabled"
        );
        return;
      }

      if (Number(rawWholesalePrice) >= rawPrice) {
        toast.error(
          "Wholesale price must be less than retail price to offer a discount"
        );
        return;
      }
    }

    setLoading(true);

    try {
      // Prepare data with parsed numeric values
      const updateData = {
        ...editData,
        price: rawPrice,
        itemQuantity: rawQuantity,
        reOrder: rawReOrder,
        discount: rawDiscount,
        wholesalePrice: rawWholesalePrice,
        wholesaleMinQty: 1, // Always 1 for API
      };

      const response = await axios.put(
        `${BASE_URL}/api/items/editItem/${item._id}`,
        updateData,
        { withCredentials: true }
      );

      toast.success("Item updated successfully!");

      setTimeout(() => {
        setShowModal(false);
        onItemUpdated();
      }, 1200);
    } catch (error) {
      console.error("Update failed:", error);

      if (error.response?.data) {
        toast.error(
          error.response.data.message ||
            error.response.data.error ||
            "Failed to update item."
        );
      } else {
        toast.error("An unexpected error occurred. Please contact the admin.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    if (item) {
      const resetData = {
        name: item.name || "",
        price: item.price?.toString() || "",
        photo: item.photo || "",
        category: item.category?._id || item.category || "",
        barCode: item.barCode || "",
        itemQuantity: item.itemQuantity?.toString() || "",
        reOrder: item.reOrder?.toString() || "",
        discount: item.discount?.toString() || "",
        manufactureDate: item.manufactureDate
          ? new Date(item.manufactureDate)
          : new Date(),
        expireDate: item.expireDate ? new Date(item.expireDate) : new Date(),
        wholesalePrice: item.wholesalePrice?.toString() || "",
        wholesaleMinQty: "1", // Force to 1
        enableWholesale: item.enableWholesale || false,
      };

      setEditData(resetData);
      setPhotoPreview(item.photo || null);

      // Recalculate values
      const rawPrice = parseFloat(item.price) || 0;
      const rawWholesalePrice = parseFloat(item.wholesalePrice) || 0;

      if (item.enableWholesale && rawWholesalePrice > 0 && rawPrice > 0) {
        const perUnitWholesalePrice = rawWholesalePrice;
        const totalRetailPrice = rawPrice;
        const savingsAmount = totalRetailPrice - rawWholesalePrice;
        const discountPercentage =
          totalRetailPrice > 0 ? (savingsAmount / totalRetailPrice) * 100 : 0;

        setCalculatedValues({
          perUnitWholesalePrice: parseFloat(perUnitWholesalePrice.toFixed(2)),
          discountPercentage: parseFloat(discountPercentage.toFixed(1)),
          totalRetailPrice: parseFloat(totalRetailPrice.toFixed(2)),
          savingsAmount: parseFloat(savingsAmount.toFixed(2)),
        });
      }
    }
    setShowError("");
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
                <div className="flex items-start justify-between p-5 bg-gradient-to-r from-green-400 to-green-500 border-b border-gray-400 rounded-t-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                      <FiEdit className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">
                        Edit Item
                      </h3>
                      <p className="text-white/90 text-sm mt-1">
                        Update item details
                      </p>
                    </div>
                  </div>
                  <button
                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                    onClick={() => setShowModal(false)}
                  >
                    <FiX className="w-5 h-5 text-white" />
                  </button>
                </div>

                {/* Main Form Content with scrolling */}
                <div className="relative p-6 flex-auto overflow-y-auto max-h-[65vh]">
                  <form
                    onSubmit={handleEdit}
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
                          value={editData.name}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100"
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
                        <div className="absolute inset-y-0 left-3 flex items-center">
                          <FiDollarSign className="w-4 h-4 text-gray-500" />
                        </div>
                        <input
                          type="text"
                          name="price"
                          value={formatNumberWithCommas(editData.price)}
                          onChange={handleChange}
                          className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100"
                          placeholder="0.00"
                          disabled={loading}
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm font-medium">
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
                          value={editData.category}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 appearance-none"
                          disabled={loading}
                        >
                          <option value="" disabled className="text-gray-500">
                            Select a category
                          </option>
                          {category.map((cat) => (
                            <option key={cat._id} value={cat._id}>
                              {cat.name}
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
                          value={formatNumberWithCommas(editData.itemQuantity)}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100"
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
                          selected={editData.manufactureDate}
                          onChange={handleManufacturedDate}
                          showTimeSelect
                          timeIntervals={1}
                          dateFormat="Pp"
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 text-sm"
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
                          selected={editData.expireDate}
                          onChange={handleExpireDate}
                          showTimeSelect
                          timeIntervals={1}
                          dateFormat="Pp"
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 text-sm"
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
                          value={formatNumberWithCommas(editData.reOrder)}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100"
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
                          value={formatNumberWithCommas(editData.discount)}
                          onChange={handleChange}
                          className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100"
                          placeholder="0.00"
                          disabled={loading}
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm font-medium">
                          Tsh
                        </div>
                      </div>
                    </div>

                    {/* WHOLESALE SECTION - IMPROVED */}
                    <div className="col-span-1 md:col-span-3 mt-6">
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center shadow-md">
                              <FiShoppingBag className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h4 className="text-lg font-bold text-gray-900">
                                Bulk/Wholesale Pricing
                              </h4>
                              <p className="text-gray-600 text-sm">
                                Set special prices for wholesale purchases
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span
                              className={`text-sm font-medium px-3 py-1 rounded-full ${
                                editData.enableWholesale
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {editData.enableWholesale ? "ACTIVE" : "INACTIVE"}
                            </span>
                            <button
                              type="button"
                              onClick={toggleWholesale}
                              className={`relative inline-flex items-center h-7 rounded-full w-14 transition-colors duration-300 shadow-sm ${
                                editData.enableWholesale
                                  ? "bg-blue-600"
                                  : "bg-gray-300"
                              }`}
                            >
                              <span
                                className={`inline-block w-5 h-5 transform bg-white rounded-full transition-transform duration-300 shadow-md ${
                                  editData.enableWholesale
                                    ? "translate-x-8"
                                    : "translate-x-1"
                                }`}
                              />
                            </button>
                          </div>
                        </div>

                        {editData.enableWholesale && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* Wholesale Minimum Quantity - Fixed at 1 */}
                              <div className="bg-white p-4 rounded-lg border border-blue-200 shadow-sm">
                                <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                                  <FiInfo className="w-4 h-4 text-blue-500" />
                                  Minimum Quantity for Wholesale
                                </label>
                                <p className="text-xs text-gray-500 mb-3">
                                  Fixed at 1 unit (package selection available
                                  at POS)
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
                                    className="w-full pl-10 pr-4 py-2.5 border border-blue-300 rounded-lg bg-gray-100 text-gray-700 focus:outline-none cursor-not-allowed"
                                  />
                                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm font-medium">
                                    units
                                  </div>
                                </div>
                              </div>

                              {/* Wholesale Price (Per Unit) */}
                              <div className="bg-white p-4 rounded-lg border border-blue-200 shadow-sm">
                                <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                                  <FiDollarSign className="w-4 h-4 text-blue-500" />
                                  Wholesale Price (per unit)
                                </label>
                                <p className="text-xs text-gray-500 mb-3">
                                  Price per unit for wholesale purchases
                                </p>
                                <div className="relative">
                                  <div className="absolute inset-y-0 left-3 flex items-center">
                                    <FiTrendingUp className="w-4 h-4 text-blue-500" />
                                  </div>
                                  <input
                                    type="text"
                                    name="wholesalePrice"
                                    value={formatNumberWithCommas(
                                      editData.wholesalePrice
                                    )}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-12 py-2.5 border border-blue-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    placeholder="0.00"
                                    disabled={loading}
                                  />
                                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm font-medium">
                                    Tsh
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Wholesale Calculation Summary */}
                            {editData.enableWholesale &&
                              parseCommaFormattedNumber(
                                editData.wholesalePrice
                              ) > 0 &&
                              parseCommaFormattedNumber(editData.price) > 0 && (
                                <div className="bg-white rounded-xl border border-blue-200 shadow-sm overflow-hidden">
                                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 border-b border-blue-200">
                                    <h5 className="font-bold text-gray-900 flex items-center gap-2">
                                      <FiTrendingUp className="w-4 h-4 text-blue-600" />
                                      Wholesale Price Comparison
                                    </h5>
                                  </div>

                                  <div className="p-4">
                                    {/* Price Comparison */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                      <div className="space-y-2">
                                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                                          <div>
                                            <p className="text-xs text-gray-500 font-medium">
                                              Retail Price
                                            </p>
                                            <p className="text-lg font-bold text-gray-800">
                                              Tsh{" "}
                                              {formatNumberWithCommas(
                                                editData.price
                                              )}
                                            </p>
                                          </div>
                                          <div className="text-right">
                                            <p className="text-xs text-gray-500">
                                              Per unit
                                            </p>
                                            <p className="text-sm font-medium">
                                              Retail rate
                                            </p>
                                          </div>
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                                          <div>
                                            <p className="text-xs text-blue-600 font-medium">
                                              Wholesale Price
                                            </p>
                                            <p className="text-lg font-bold text-blue-700">
                                              Tsh{" "}
                                              {formatNumberWithCommas(
                                                editData.wholesalePrice
                                              )}
                                            </p>
                                          </div>
                                          <div className="text-right">
                                            <p className="text-xs text-blue-600">
                                              Per unit
                                            </p>
                                            <p
                                              className={`text-sm font-bold ${
                                                calculatedValues.savingsAmount >=
                                                0
                                                  ? "text-green-600"
                                                  : "text-red-600"
                                              }`}
                                            >
                                              {calculatedValues.savingsAmount >=
                                              0
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

                                      {/* Unit Price Comparison */}
                                      <div className="space-y-2">
                                        <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                                          <div className="flex items-center justify-between">
                                            <div>
                                              <p className="text-xs text-gray-600">
                                                Savings per unit
                                              </p>
                                              <p className="text-base font-bold text-green-700">
                                                Tsh{" "}
                                                {calculatedValues.savingsAmount.toLocaleString()}
                                              </p>
                                            </div>
                                            <div className="text-right">
                                              <p className="text-xs text-gray-600">
                                                Discount
                                              </p>
                                              <p className="text-base font-bold text-green-700">
                                                {calculatedValues.discountPercentage.toFixed(
                                                  1
                                                )}
                                                %
                                              </p>
                                            </div>
                                          </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                          <div className="p-3 bg-white rounded-lg border border-gray-200 text-center">
                                            <p className="text-xs text-gray-500 mb-1">
                                              Retail/unit
                                            </p>
                                            <p className="text-base font-bold text-gray-800">
                                              Tsh{" "}
                                              {formatNumberWithCommas(
                                                editData.price
                                              )}
                                            </p>
                                          </div>
                                          <div
                                            className={`p-3 rounded-lg border text-center ${
                                              calculatedValues.perUnitWholesalePrice <=
                                              parseCommaFormattedNumber(
                                                editData.price
                                              )
                                                ? "bg-green-50 border-green-300"
                                                : "bg-red-50 border-red-300"
                                            }`}
                                          >
                                            <p className="text-xs text-gray-500 mb-1">
                                              Wholesale/unit
                                            </p>
                                            <p
                                              className={`text-base font-bold ${
                                                calculatedValues.perUnitWholesalePrice <=
                                                parseCommaFormattedNumber(
                                                  editData.price
                                                )
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

                                    {/* Package Information Note */}
                                    <div className="mt-2 p-3 bg-indigo-50 rounded border border-indigo-200">
                                      <p className="text-xs text-indigo-700 text-center">
                                        <span className="font-bold">Note:</span>{" "}
                                        Package sizes (2,4,6,8,12,24, etc.) can
                                        be selected at the POS during wholesale
                                        sales. Wholesale price here is per unit.
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Photo Upload - Full width */}
                    <div className="col-span-1 md:col-span-3">
                      <div className="mb-2">
                        <label className="block text-sm font-bold text-gray-900">
                          Item Photo
                        </label>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <input
                            type="file"
                            onChange={handlePhotoChange}
                            className="hidden"
                            id="photo-upload-edit"
                            disabled={loading}
                          />
                          <label
                            htmlFor="photo-upload-edit"
                            className="px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-700 font-medium hover:bg-gray-50 cursor-pointer flex items-center gap-2 text-sm transition-colors"
                          >
                            <FiCamera className="w-4 h-4" />
                            Change Photo
                          </label>
                        </div>
                        {photoPreview && (
                          <div className="relative group">
                            <img
                              src={photoPreview}
                              alt="Preview"
                              className="w-14 h-14 rounded-lg object-cover border-2 border-gray-300 shadow-sm"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setPhotoPreview(null);
                                setFile(null);
                                setEditData({ ...editData, photo: "" });
                              }}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                            >
                              ×
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Validation Summary - Full width */}
                    <div className="col-span-1 md:col-span-3 bg-gray-50 rounded-xl p-4 border border-gray-200">
                      <p className="text-sm font-bold text-gray-900 mb-3">
                        Validation Status
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div
                          className={`flex items-center gap-2 ${
                            editData.name ? "text-green-700" : "text-gray-500"
                          }`}
                        >
                          <div
                            className={`w-2 h-2 rounded-full ${
                              editData.name ? "bg-green-500" : "bg-gray-400"
                            }`}
                          />
                          <span className="text-xs font-medium">
                            Name {editData.name ? "✓" : ""}
                          </span>
                        </div>
                        <div
                          className={`flex items-center gap-2 ${
                            parseCommaFormattedNumber(editData.price) > 0
                              ? "text-green-700"
                              : "text-gray-500"
                          }`}
                        >
                          <div
                            className={`w-2 h-2 rounded-full ${
                              parseCommaFormattedNumber(editData.price) > 0
                                ? "bg-green-500"
                                : "bg-gray-400"
                            }`}
                          />
                          <span className="text-xs font-medium">
                            Price{" "}
                            {parseCommaFormattedNumber(editData.price) > 0
                              ? "✓"
                              : ""}
                          </span>
                        </div>
                        <div
                          className={`flex items-center gap-2 ${
                            editData.category
                              ? "text-green-700"
                              : "text-gray-500"
                          }`}
                        >
                          <div
                            className={`w-2 h-2 rounded-full ${
                              editData.category ? "bg-green-500" : "bg-gray-400"
                            }`}
                          />
                          <span className="text-xs font-medium">
                            Category {editData.category ? "✓" : ""}
                          </span>
                        </div>
                        <div
                          className={`flex items-center gap-2 ${
                            editData.enableWholesale &&
                            parseCommaFormattedNumber(editData.wholesalePrice) >
                              0
                              ? "text-green-700"
                              : editData.enableWholesale
                              ? "text-yellow-600"
                              : "text-gray-500"
                          }`}
                        >
                          <div
                            className={`w-2 h-2 rounded-full ${
                              editData.enableWholesale &&
                              parseCommaFormattedNumber(
                                editData.wholesalePrice
                              ) > 0
                                ? "bg-green-500"
                                : editData.enableWholesale
                                ? "bg-yellow-500"
                                : "bg-gray-400"
                            }`}
                          />
                          <span className="text-xs font-medium">Wholesale</span>
                        </div>
                      </div>
                    </div>

                    {/* Error Message - Full width */}
                    {showError && (
                      <div className="col-span-1 md:col-span-3">
                        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">
                          <div className="flex items-start gap-3">
                            <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-white text-xs font-bold">
                                !
                              </span>
                            </div>
                            <div>
                              <p className="font-medium">Error</p>
                              <p className="text-red-600 mt-1">{showError}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Submit Button - Full width */}
                    <div className="col-span-1 md:col-span-3">
                      <button
                        type="submit"
                        disabled={
                          loading ||
                          !editData.name ||
                          !parseCommaFormattedNumber(editData.price) ||
                          !editData.category
                        }
                        className={`w-full py-3 font-bold rounded-lg flex items-center justify-center gap-2 text-sm transition-all ${
                          loading ||
                          !editData.name ||
                          !parseCommaFormattedNumber(editData.price) ||
                          !editData.category
                            ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                            : "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                        }`}
                      >
                        {loading ? (
                          <>
                            <svg
                              className="animate-spin h-4 w-4 text-white"
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
                            <span>Updating...</span>
                          </>
                        ) : (
                          <>
                            <FiCheck className="w-4 h-4" />
                            <span>Update Item</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between p-4 border-t border-gray-300 bg-gray-50 rounded-b-2xl">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg transition-colors text-sm flex items-center gap-2"
                    disabled={loading}
                  >
                    <FiRefreshCw className="w-4 h-4" />
                    Reset
                  </button>
                  <button
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg transition-colors text-sm flex items-center gap-2"
                    onClick={() => setShowModal(false)}
                  >
                    <FiX className="w-4 h-4" />
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

export default EditItem;
