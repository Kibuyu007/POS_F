import { useEffect } from "react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts } from "../../../Redux/items";
import axios from "axios";

const ManunuziHold = ({ showModal, setShowModal }) => {
  const { items } = useSelector((state) => state.items);
  const [showError, setShowError] = useState("");
  const [itemName, setItemName] = useState("");
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    buyingPrice: "",
    units: "",
    itemsPerUnit: "",
    quantity: "",
    rejected: "",
    foc: "",
    batchNumber: "",
    manufactureDate: "",
    expiryDate: "",
    receivedDate: new Date().toISOString().split("T")[0],
    comments: "",
  });

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setShowError("");
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const selectedItem = items.find((item) => item.name === itemName);

    if (!selectedItem) {
      setShowError("Please select a valid item from the list.");
      return;
    }

    const itemId = selectedItem._id;

    try {
      const response = await axios.post(
        "http://localhost:4004/api/manunuzi/addHold",
        { ...formData, itemId }
      );

      console.log(response);
      setFormData({
        buyingPrice: "",
        units: "",
        itemsPerUnit: "",
        quantity: "",
        rejected: "",
        foc: "",
        batchNumber: "",
        manufactureDate: "",
        expiryDate: "",
        receivedDate: new Date().toISOString().split("T")[0],
        comments: "",
      });
      setItemName("");
      setShowError("");
    } catch (error) {
      console.log(error);
      if (error.response && error.response.data) {
        setShowError(error.response.data.message);
      } else {
        setShowError("An unexpected error occurred.");
      }
    }
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center px-4">
      <div className="bg-white w-full max-w-4xl rounded-md shadow-lg p-6 relative overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-4 mb-4">
          <h3 className="text-2xl font-bold text-black ">Add GRN Item</h3>
          <button
            onClick={() => setShowModal(false)}
            className="text-red-500 text-xl font-bold hover:text-red-700"
          >
            <span className="text-red-700 opacity-7 h-6 w-6 text-xl blockpy-0 rounded-lg bg-grey py-3 px-7">
              X
            </span>
          </button>
        </div>

        {/* Item Name Search */}
        <div className="mb-6">
          <label className="block font-semibold mb-1 text-black">
            Item Name
          </label>
          <input
            type="text"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
            list="itemList"
            placeholder="Search or type item name..."
            value={itemName}
            onChange={(e) => {
              setItemName(e.target.value);
              setShowError("");
            }}
          />
          <datalist id="itemList">
            {Array.isArray(items) &&
              items.map((item, index) => (
                <option key={index} value={item.name || item} />
              ))}
          </datalist>
        </div>

        {/* GRN Entry Fields */}
        {itemName && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label
                htmlFor="Buying Price"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Buying Price
              </label>
              <input
                type="number"
                name="buyingPrice"
                value={formData.buyingPrice}
                onChange={handleChange}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
              />
            </div>

            <div>
              <label
                htmlFor="units"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Units
              </label>
              <input
                type="number"
                name="units"
                value={formData.units}
                onChange={handleChange}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
              />
            </div>

            <div>
              <label
                htmlFor="itemsPerUnit"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Items Per Unit
              </label>
              <input
                type="number"
                name="itemsPerUnit"
                value={formData.itemsPerUnit}
                onChange={handleChange}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
              />
            </div>

            <div>
              <label
                htmlFor="rejected"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Declined
              </label>
              <input
                type="number"
                name="rejected"
                value={formData.rejected}
                onChange={handleChange}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
              />
            </div>

            <div>
              <label
                htmlFor="foc"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Offer
              </label>
              <input
                type="number"
                name="foc"
                value={formData.foc}
                onChange={handleChange}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
              />
            </div>

            <div>
              <label
                htmlFor="batchNumber"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Batch Number
              </label>
              <input
                type="text"
                name="batchNumber"
                value={formData.batchNumber}
                onChange={handleChange}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
              />
            </div>

            <div>
              <label
                htmlFor="quantity"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Idadi
              </label>
              <input
                type="text"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
              />
            </div>

            <div>
              <label
                htmlFor="manufactureDate"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Manufacture Date
              </label>
              <input
                type="date"
                name="manufactureDate"
                value={formData.manufactureDate}
                onChange={handleChange}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
              />
            </div>

            <div>
              <label
                htmlFor="expiryDate"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Expiry Date
              </label>
              <input
                type="date"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleChange}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
              />
            </div>

            <div>
              <label
                htmlFor="receivedDate"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Received Date
              </label>
              <input
                type="date"
                name="receivedDate"
                value={formData.receivedDate}
                onChange={handleChange}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
              />
            </div>

            <div>
              <label
                htmlFor="comments"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Comments
              </label>
              <input
                type="text"
                name="comments"
                value={formData.comments}
                onChange={handleChange}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
              />
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={handleSave}
            disabled={!itemName || !formData.quantity}
            className={`px-6 py-2 rounded-md w-full transition ${
              !itemName || !formData.quantity
                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                : "bg-green-300 text-black hover:bg-green-400"
            }`}
          >
            Save
          </button>
        </div>
        <div className="flex items-center justify-center p-4 border-t mt-4">
          <button
            className="text-red-500 font-bold uppercase px-6 py-2 rounded-lg"
            onClick={() => setShowModal(false)}
          >
            Close
          </button>
        </div>
        <div className="flex items-center justify-center p-4 border-t">
          {showError && (
            <div
              className="mt-2 bg-red-100/70 border border-red-200 text-sm text-red-800 rounded-lg p-4 dark:bg-red-800/10 dark:border-red-900 dark:text-red-500"
              role="alert"
            >
              <span className="font-bold">Error: </span> {showError}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManunuziHold;
