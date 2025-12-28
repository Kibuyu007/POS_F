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
  FiMinus
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
    price: 0,
    category: "",
    photo: "",
    barCode: "",
    itemQuantity: 0,
    reOrder: 0,
    discount: 0,
    manufactureDate: new Date(),
    expireDate: new Date(),
    // WHOLESALE FIELDS
    wholesalePrice: 0,
    wholesaleMinQty: 0,
    enableWholesale: false,
  });

  useEffect(() => {
    if (item) {
      const newEditData = {
        name: item.name || "",
        price: item.price || 0,
        photo: item.photo || "",
        category: item.category?._id || item.category || "",
        barCode: item.barCode || "",
        itemQuantity: item.itemQuantity || 0,
        reOrder: item.reOrder || 0,
        discount: item.discount || 0,
        manufactureDate: item.manufactureDate ? new Date(item.manufactureDate) : new Date(),
        expireDate: item.expireDate ? new Date(item.expireDate) : new Date(),
        // WHOLESALE FIELDS
        wholesalePrice: item.wholesalePrice || 0,
        wholesaleMinQty: item.wholesaleMinQty || 0,
        enableWholesale: item.enableWholesale || false,
      };
      
      setEditData(newEditData);
      
      if (item.photo) {
        setPhotoPreview(item.photo);
      }

      // Calculate wholesale values
      if (item.enableWholesale && item.wholesalePrice > 0 && item.wholesaleMinQty > 0 && item.price > 0) {
        const perUnitWholesalePrice = item.wholesalePrice / item.wholesaleMinQty;
        const totalRetailPrice = item.price * item.wholesaleMinQty;
        const savingsAmount = totalRetailPrice - item.wholesalePrice;
        const discountPercentage = totalRetailPrice > 0 ? (savingsAmount / totalRetailPrice) * 100 : 0;

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
    if (editData.enableWholesale && editData.wholesalePrice > 0 && editData.wholesaleMinQty > 0 && editData.price > 0) {
      const perUnitWholesalePrice = editData.wholesalePrice / editData.wholesaleMinQty;
      const totalRetailPrice = editData.price * editData.wholesaleMinQty;
      const savingsAmount = totalRetailPrice - editData.wholesalePrice;
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
  }, [editData.wholesalePrice, editData.wholesaleMinQty, editData.price, editData.enableWholesale]);

  //Fetch Item Category
  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === 'checkbox') {
      setEditData({ ...editData, [name]: checked });
      return;
    }

    let numericValue = value;
    if (['price', 'itemQuantity', 'reOrder', 'discount', 'wholesalePrice', 'wholesaleMinQty'].includes(name)) {
      numericValue = value === '' ? 0 : Number(value);
      
      if (numericValue < 0) {
        numericValue = 0;
        toast.error("Value cannot be negative");
      }
    }

    if (name === "discount") {
      const price = Number(editData.price);
      if (numericValue > price) {
        toast.error("Discount can't be greater than Item Price");
        return;
      }
    }

    setEditData({ ...editData, [name]: type === 'number' ? numericValue : value });
  };

  const toggleWholesale = () => {
    const newEnableWholesale = !editData.enableWholesale;
    if (!newEnableWholesale) {
      setEditData({
        ...editData,
        enableWholesale: false,
        wholesalePrice: 0,
        wholesaleMinQty: 0,
      });
    } else {
      setEditData({ ...editData, enableWholesale: true });
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

    // Validation
    if (!editData.name.trim()) {
      toast.error("Item name is required");
      return;
    }

    if (!editData.price || Number(editData.price) <= 0) {
      toast.error("Price must be greater than 0");
      return;
    }

    if (!editData.category) {
      toast.error("Please select a category");
      return;
    }

    if (editData.discount && Number(editData.discount) > Number(editData.price)) {
      toast.error("Discount cannot exceed item price");
      return;
    }

    // Wholesale validation - REMOVED PRICE COMPARISON RESTRICTION
    if (editData.enableWholesale) {
      if (!editData.wholesalePrice || Number(editData.wholesalePrice) <= 0) {
        toast.error("Wholesale price must be greater than 0 when wholesale is enabled");
        return;
      }
      if (!editData.wholesaleMinQty || Number(editData.wholesaleMinQty) <= 0) {
        toast.error("Wholesale minimum quantity must be greater than 0 when wholesale is enabled");
        return;
      }
      // REMOVED: Price comparison restriction
    }

    setLoading(true);

    try {
      const response = await axios.put(
        `${BASE_URL}/api/items/editItem/${item._id}`,
        editData,
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
        price: item.price || 0,
        photo: item.photo || "",
        category: item.category?._id || item.category || "",
        barCode: item.barCode || "",
        itemQuantity: item.itemQuantity || 0,
        reOrder: item.reOrder || 0,
        discount: item.discount || 0,
        manufactureDate: item.manufactureDate ? new Date(item.manufactureDate) : new Date(),
        expireDate: item.expireDate ? new Date(item.expireDate) : new Date(),
        wholesalePrice: item.wholesalePrice || 0,
        wholesaleMinQty: item.wholesaleMinQty || 0,
        enableWholesale: item.enableWholesale || false,
      };
      
      setEditData(resetData);
      setPhotoPreview(item.photo || null);
      
      // Recalculate values
      if (item.enableWholesale && item.wholesalePrice > 0 && item.wholesaleMinQty > 0 && item.price > 0) {
        const perUnitWholesalePrice = item.wholesalePrice / item.wholesaleMinQty;
        const totalRetailPrice = item.price * item.wholesaleMinQty;
        const savingsAmount = totalRetailPrice - item.wholesalePrice;
        const discountPercentage = totalRetailPrice > 0 ? (savingsAmount / totalRetailPrice) * 100 : 0;

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
                <div className="flex items-start justify-between p-5 bg-green-300 border-b border-gray-400 rounded-t-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center">
                      <FiEdit className="w-5 h-5 text-black" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-black">Edit Item</h3>
                      <p className="text-black/70 text-sm mt-1">Update item details</p>
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
                  <form onSubmit={handleEdit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                          Retail Price
                        </label>
                      </div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-3 flex items-center">
                          <FiDollarSign className="w-4 h-4 text-gray-500" />
                        </div>
                        <input
                          type="number"
                          name="price"
                          value={editData.price}
                          onChange={handleChange}
                          min="0"
                          step="0.01"
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full bg-white text-black focus:outline-none focus:border-green-300"
                          placeholder="0.00"
                          disabled={loading}
                        />
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
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full bg-white text-black focus:outline-none focus:border-green-300 appearance-none"
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
                          type="number"
                          name="itemQuantity"
                          value={editData.itemQuantity}
                          onChange={handleChange}
                          min="0"
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
                          selected={editData.manufactureDate}
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
                          selected={editData.expireDate}
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
                          type="number"
                          name="reOrder"
                          value={editData.reOrder}
                          onChange={handleChange}
                          min="0"
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
                          type="number"
                          name="discount"
                          value={editData.discount}
                          min="0"
                          max={editData.price}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full bg-white text-black focus:outline-none focus:border-green-300"
                          placeholder="0.00"
                          disabled={loading}
                        />
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
                            <h4 className="text-lg font-bold text-gray-900">Bulk/Wholesale Settings</h4>
                            <p className="text-gray-600 text-sm">Configure special pricing for bulk purchases</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={toggleWholesale}
                          className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-200 ${editData.enableWholesale ? 'bg-blue-600' : 'bg-gray-300'}`}
                        >
                          <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-200 ${editData.enableWholesale ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                      </div>

                      {/* Wholesale Fields */}
                      {editData.enableWholesale && (
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
                                  type="number"
                                  name="wholesaleMinQty"
                                  value={editData.wholesaleMinQty}
                                  onChange={handleChange}
                                  min="1"
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
                                <div className="absolute inset-y-0 left-3 flex items-center">
                                  <FiDollarSign className="w-4 h-4 text-blue-500" />
                                </div>
                                <input
                                  type="number"
                                  name="wholesalePrice"
                                  value={editData.wholesalePrice}
                                  onChange={handleChange}
                                  min="0"
                                  step="0.01"
                                  className="w-full pl-10 pr-4 py-2 border border-blue-300 rounded-full bg-white text-black focus:outline-none focus:border-blue-500"
                                  placeholder="15000.00"
                                  disabled={loading}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Wholesale Calculation Summary */}
                          {editData.enableWholesale && editData.wholesalePrice > 0 && editData.wholesaleMinQty > 0 && editData.price > 0 && (
                            <div className="mt-3 p-3 bg-white rounded-lg border border-blue-200">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {/* Retail vs Wholesale */}
                                <div className="space-y-2">
                                  <div className="p-2 bg-gray-50 rounded">
                                    <p className="text-xs text-gray-500">Retail Total for {editData.wholesaleMinQty} units</p>
                                    <p className="text-sm font-bold text-gray-800">
                                      Tsh {calculatedValues.totalRetailPrice.toLocaleString()}
                                    </p>
                                  </div>
                                  <div className="p-2 bg-blue-50 rounded">
                                    <p className="text-xs text-blue-600">Wholesale Total</p>
                                    <p className="text-sm font-bold text-blue-700">
                                      Tsh {editData.wholesalePrice.toLocaleString()}
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
                                      <p className="text-sm font-medium">Tsh {parseFloat(editData.price).toFixed(2)}</p>
                                    </div>
                                    <div className={`p-2 border ${calculatedValues.perUnitWholesalePrice <= editData.price ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'} rounded text-center`}>
                                      <p className={`text-xs ${calculatedValues.perUnitWholesalePrice <= editData.price ? 'text-green-600' : 'text-red-600'}`}>Wholesale/unit</p>
                                      <p className={`text-sm font-bold ${calculatedValues.perUnitWholesalePrice <= editData.price ? 'text-green-700' : 'text-red-700'}`}>
                                        Tsh {calculatedValues.perUnitWholesalePrice.toFixed(2)}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Stock Check */}
                              {editData.itemQuantity > 0 && (
                                <div className={`mt-2 p-2 rounded text-center text-sm ${editData.itemQuantity >= editData.wholesaleMinQty ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                  <span className="font-medium">
                                    {editData.itemQuantity >= editData.wholesaleMinQty ? '✓' : '⚠'} Stock: {editData.itemQuantity} units
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
                            className="px-4 py-2 border border-gray-300 rounded-full bg-white text-black font-medium hover:bg-gray-50 cursor-pointer flex items-center gap-2 text-sm"
                          >
                            <FiCamera className="w-4 h-4" />
                            Change Photo
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
                                setEditData({...editData, photo: ""});
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
                      <p className="text-sm font-bold text-black mb-2">Validation Status</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        <div className={`flex items-center gap-2 ${editData.name ? "text-green-700" : "text-gray-600"}`}>
                          <div className={`w-2 h-2 rounded-full ${editData.name ? "bg-green-300" : "bg-gray-400"}`} />
                          <span className="text-xs">Name {editData.name ? "✓" : ""}</span>
                        </div>
                        <div className={`flex items-center gap-2 ${editData.price > 0 ? "text-green-700" : "text-gray-600"}`}>
                          <div className={`w-2 h-2 rounded-full ${editData.price > 0 ? "bg-green-300" : "bg-gray-400"}`} />
                          <span className="text-xs">Price {editData.price > 0 ? "✓" : ""}</span>
                        </div>
                        <div className={`flex items-center gap-2 ${editData.category ? "text-green-700" : "text-gray-600"}`}>
                          <div className={`w-2 h-2 rounded-full ${editData.category ? "bg-green-300" : "bg-gray-400"}`} />
                          <span className="text-xs">Category {editData.category ? "✓" : ""}</span>
                        </div>
                        <div className={`flex items-center gap-2 ${editData.enableWholesale && editData.wholesalePrice > 0 && editData.wholesaleMinQty > 0 ? "text-green-700" : editData.enableWholesale ? "text-yellow-600" : "text-gray-400"}`}>
                          <div className={`w-2 h-2 rounded-full ${editData.enableWholesale && editData.wholesalePrice > 0 && editData.wholesaleMinQty > 0 ? "bg-green-300" : editData.enableWholesale ? "bg-yellow-300" : "bg-gray-300"}`} />
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
                        disabled={loading || !editData.name || !editData.price || !editData.category}
                        className={`w-full py-2 font-bold rounded-full flex items-center justify-center gap-2 text-sm ${
                          loading || !editData.name || !editData.price || !editData.category
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

export default EditItem;