import axios from "axios";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { additem } from "../../../../Redux/items";
import { fetchCategories } from "../../../../Redux/itemsCategories";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FiBox, FiDollarSign, FiTag, FiPackage, FiCalendar, FiRefreshCw, FiPercent, FiCamera, FiX, FiCheck } from "react-icons/fi";

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
    price: 0,
    category: "",
    barCode: "",
    itemQuantity: 0,
    manufactureDate: new Date(),
    expireDate: new Date(),
    reOrder: 0,
    discount: 0,
  });

  const dispatch = useDispatch();

  //Fetch ItemCategories
  useEffect(() => {
    if (!category.length) {
      dispatch(fetchCategories());
    }
  }, [dispatch, category.length]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Convert string to number
    const numericValue = Number(value);

    // If user is typing discount, validate
    if (name === "discount") {
      const price = Number(regi.price);

      // Prevent discount > price
      if (numericValue > price) {
        toast.error("Discount can't be greater than Item Price");
        return;
      }
    }
    setRegi({ ...regi, [name]: value });
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
    
    // Basic validation
    if (!regi.name.trim()) {
      setShowError("Item name is required");
      return;
    }
    
    if (!regi.price || Number(regi.price) <= 0) {
      setShowError("Price must be greater than 0");
      return;
    }
    
    if (!regi.category) {
      setShowError("Please select a category");
      return;
    }
    
    if (regi.discount && Number(regi.discount) > Number(regi.price)) {
      setShowError("Discount cannot exceed item price");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${BASE_URL}/api/items/addItem`, regi, {
        withCredentials: true,
      });
      
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
      });

      setFile(null);
      setPhotoPreview(null);
      setShowError("");
      
      toast.success("Item added successfully!");
      setTimeout(() => {
        setShowModal(false);
        onUserAdded();
      }, 1500);
    } catch (error) {
      if (error.response && error.response.data) {
        setShowError(
          error.response.data.error ||
            "Failed to add item. Please try again."
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
      price: 0,
      category: "",
      barCode: "",
      itemQuantity: 0,
      manufactureDate: new Date(),
      expireDate: new Date(),
      reOrder: 0,
      discount: 0,
    });
    setFile(null);
    setPhotoPreview(null);
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
                      <FiBox className="w-5 h-5 text-black" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-black">+ Add New Item</h3>
                      <p className="text-black/70 text-sm mt-1">Enter item details</p>
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
                  <form onSubmit={handleAddItems} className="grid grid-cols-2 gap-4">
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
                          value={regi.name}
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
                          value={regi.price}
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
                          value={regi.category}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-full bg-white text-black focus:outline-none focus:border-green-300 appearance-none"
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
                          value={regi.itemQuantity}
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
                          selected={regi.manufactureDate}
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
                          selected={regi.expireDate}
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
                          value={regi.reOrder}
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
                          value={regi.discount}
                          min="0"
                          max={regi.price}
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
                            className="px-4 py-3 border border-gray-300 rounded-full bg-white text-black font-medium hover:bg-gray-50 cursor-pointer flex items-center gap-2"
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
                              className="w-16 h-16 rounded-full object-cover border-2 border-gray-300"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setPhotoPreview(null);
                                setFile(null);
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
                        <div className={`flex items-center gap-3 ${regi.name ? "text-green-700" : "text-gray-600"}`}>
                          <div className={`w-3 h-3 rounded-full ${regi.name ? "bg-green-300" : "bg-gray-400"}`} />
                          <span className="text-sm">Item name {regi.name ? "✓" : "(required)"}</span>
                        </div>
                        <div className={`flex items-center gap-3 ${regi.price > 0 ? "text-green-700" : "text-gray-600"}`}>
                          <div className={`w-3 h-3 rounded-full ${regi.price > 0 ? "bg-green-300" : "bg-gray-400"}`} />
                          <span className="text-sm">Price {regi.price > 0 ? "✓" : "(required)"}</span>
                        </div>
                        <div className={`flex items-center gap-3 ${regi.category ? "text-green-700" : "text-gray-600"}`}>
                          <div className={`w-3 h-3 rounded-full ${regi.category ? "bg-green-300" : "bg-gray-400"}`} />
                          <span className="text-sm">Category {regi.category ? "✓" : "(required)"}</span>
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
                        disabled={loading || !regi.name || !regi.price || !regi.category}
                        className={`w-full py-3 font-bold rounded-full flex items-center justify-center gap-2 ${
                          loading || !regi.name || !regi.price || !regi.category
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
                            <span>Processing...</span>
                          </>
                        ) : (
                          <>
                            <FiCheck className="w-5 h-5" />
                            <span>Add Item</span>
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

export default AddItem;