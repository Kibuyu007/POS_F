import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useDispatch, useSelector } from "react-redux";
import { fetchCategories } from "../../../../Redux/itemsCategories";
import axios from "axios";
import { FiBox, FiDollarSign, FiTag, FiPackage, FiCalendar, FiRefreshCw, FiPercent, FiCamera, FiX, FiCheck, FiEdit } from "react-icons/fi";

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
  });

  useEffect(() => {
    if (item) {
      setEditData({
        name: item.name || "",
        price: item.price || 0,
        photo: item.photo || "",
        category: item.category || "",
        barCode: item.barCode || "",
        itemQuantity: item.itemQuantity || 0,
        reOrder: item.reOrder || 0,
        discount: item.discount || 0,
        manufactureDate: item.manufactureDate ? new Date(item.manufactureDate) : new Date(),
        expireDate: item.expireDate ? new Date(item.expireDate) : new Date(),
      });
      if (item.photo) {
        setPhotoPreview(item.photo);
      }
    }
  }, [item]);

  //Fetch Item Category
  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const numericValue = Number(value);

    if (name === "discount") {
      const price = Number(editData.price);
      if (numericValue > price) {
        toast.error("Discount can't be greater than Item Price");
        return;
      }
    }

    setEditData({ ...editData, [name]: name.includes('Quantity') || name === 'price' || name === 'discount' || name === 'reOrder' ? numericValue : value });
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

    // Backend errors
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
      setEditData({
        name: item.name || "",
        price: item.price || 0,
        photo: item.photo || "",
        category: item.category || "",
        barCode: item.barCode || "",
        itemQuantity: item.itemQuantity || 0,
        reOrder: item.reOrder || 0,
        discount: item.discount || 0,
        manufactureDate: item.manufactureDate ? new Date(item.manufactureDate) : new Date(),
        expireDate: item.expireDate ? new Date(item.expireDate) : new Date(),
      });
      setPhotoPreview(item.photo || null);
    }
    setShowError("");
  };

  return (
    <>
      {showModal ? (
        <>
          <div className="flex justify-center items-center overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none bg-gray-900 bg-opacity-20">
            <div className="w-full md:w-2/3 lg:w-2/3 xl:w-1/2">
              <div className="border border-gray-300 rounded-2xl shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
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

                {/* Main Form Content */}
                <div className="relative p-6 flex-auto">
                  <form onSubmit={handleEdit} className="grid grid-cols-2 gap-4">
                    {/* Item Name */}
                    <div className="col-span-2">
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
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-full bg-white text-black focus:outline-none focus:border-green-300"
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
                          Price
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
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-full bg-white text-black focus:outline-none focus:border-green-300"
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
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-full bg-white text-black focus:outline-none focus:border-green-300 appearance-none"
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
                          Quantity
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
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-full bg-white text-black focus:outline-none focus:border-green-300"
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
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-full bg-white text-black focus:outline-none focus:border-green-300"
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
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-full bg-white text-black focus:outline-none focus:border-green-300"
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
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-full bg-white text-black focus:outline-none focus:border-green-300"
                          placeholder="0"
                          disabled={loading}
                        />
                      </div>
                    </div>

                    {/* Discount */}
                    <div>
                      <div className="mb-2">
                        <label className="block text-sm font-bold text-gray-900">
                          Discount Amount
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
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-full bg-white text-black focus:outline-none focus:border-green-300"
                          placeholder="0.00"
                          disabled={loading}
                        />
                      </div>
                    </div>

                    {/* Photo Upload */}
                    <div className="col-span-2">
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
                            className="px-4 py-3 border border-gray-300 rounded-full bg-white text-black font-medium hover:bg-gray-50 cursor-pointer flex items-center gap-2"
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
                              className="w-16 h-16 rounded-full object-cover border-2 border-gray-300"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setPhotoPreview(null);
                                setFile(null);
                                setEditData({...editData, photo: ""});
                              }}
                              className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                            >
                              ×
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Validation Summary */}
                    <div className="col-span-2 bg-gray-100 rounded-xl p-4 border border-gray-300">
                      <p className="text-sm font-bold text-black mb-3">Validation Status</p>
                      <div className="space-y-2">
                        <div className={`flex items-center gap-3 ${editData.name ? "text-green-700" : "text-gray-600"}`}>
                          <div className={`w-3 h-3 rounded-full ${editData.name ? "bg-green-300" : "bg-gray-400"}`} />
                          <span className="text-sm">Item name {editData.name ? "✓" : "(required)"}</span>
                        </div>
                        <div className={`flex items-center gap-3 ${editData.price > 0 ? "text-green-700" : "text-gray-600"}`}>
                          <div className={`w-3 h-3 rounded-full ${editData.price > 0 ? "bg-green-300" : "bg-gray-400"}`} />
                          <span className="text-sm">Price {editData.price > 0 ? "✓" : "(required)"}</span>
                        </div>
                        <div className={`flex items-center gap-3 ${editData.category ? "text-green-700" : "text-gray-600"}`}>
                          <div className={`w-3 h-3 rounded-full ${editData.category ? "bg-green-300" : "bg-gray-400"}`} />
                          <span className="text-sm">Category {editData.category ? "✓" : "(required)"}</span>
                        </div>
                      </div>
                    </div>

                    {/* Error Message */}
                    {showError && (
                      <div className="col-span-2">
                        <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-4">
                          <span className="font-bold">Error: </span> {showError}
                        </div>
                      </div>
                    )}

                    {/* Submit Button */}
                    <div className="col-span-2">
                      <button
                        type="submit"
                        disabled={loading || !editData.name || !editData.price || !editData.category}
                        className={`w-full py-3 font-bold rounded-full flex items-center justify-center gap-2 ${
                          loading || !editData.name || !editData.price || !editData.category
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : "bg-green-300 hover:bg-green-400 text-black"
                        }`}
                      >
                        {loading ? (
                          <>
                            <svg
                              className="animate-spin h-5 w-5 text-black"
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
                            <FiCheck className="w-5 h-5" />
                            <span>Update Item</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between p-5 border-t border-gray-300">
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