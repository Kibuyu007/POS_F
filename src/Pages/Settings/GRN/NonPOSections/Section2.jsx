import { useEffect, useState } from "react";
import { FaSearch } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { TiArrowRightThick } from "react-icons/ti";
import { fetchProducts } from "../../../../Redux/items";

const Section2 = ({ onAddItem }) => {
  const { items } = useSelector((state) => state.items);
  const dispatch = useDispatch();

  const [selectedItem, setSelectedItem] = useState(null); // Single selected item
  const [itemInput, setItemInput] = useState(""); // Search input string
  const [showError, setShowError] = useState("");
  const [finishAdd, setFinishAdd] = useState(false);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

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
    totalCost: "",
  });

  // Handle selection of an item from the table
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
    setItemInput(""); // optionally clear search input
    setShowError("");
    setFinishAdd(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const updatedValue = value;

      const updatedForm = {
        ...prev,
        [name]: updatedValue,
      };

      // Parse numbers safely
      const units = parseInt(updatedForm.units) || 0;
      const itemsPerUnit = parseInt(updatedForm.itemsPerUnit) || 0;
      const foc = parseInt(updatedForm.foc) || 0;
      const rejected = parseInt(updatedForm.rejected) || 0;
      const buyingPrice = parseFloat(updatedForm.buyingPrice) || 0;

      // Compute and clamp quantity
      const rawQuantity = units * itemsPerUnit + foc - rejected;
      const quantity = Math.max(0, rawQuantity); // kusiwe kuna neg mzee
      const quantityComma = quantity.toLocaleString();

      //hii itakuwa thamani ya mzigo bila nyiongeza
      const totalCostRaw = buyingPrice * (units * itemsPerUnit);
      const totalCost = totalCostRaw.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

      return {
        ...updatedForm,
        quantity: quantityComma.toString(), // input expects string
        totalCost, // input expects string
      };
    });

    setShowError("");
  };

  // Add the selected item with details to parent component
  const handleAdd = () => {
    if (!selectedItem) return;

    const fullItemData = {
      itemId: selectedItem._id,
      itemName: selectedItem.name,
      itemQuantity: selectedItem.itemQuantity,
      quantity: formData.quantity,
      buyingPrice: formData.buyingPrice,
      expiryDate: formData.expiryDate,
      receivedDate: formData.receivedDate,
      batchNumber: formData.batchNumber,
      foc: formData.foc,
      rejected: formData.rejected,
      comments: formData.comments,
      totalCost: formData.totalCost,
    };

    onAddItem(fullItemData);

    // Reset states for next selection
    setFinishAdd(false);
    setSelectedItem(null);
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
  };

  // Cancel current selection
  const handleCancel = () => {
    setSelectedItem(null);
    setFinishAdd(false);
    setShowError("");
  };

  return (
    <section className="flex flex-col md:flex-row gap-3 overflow-hidden mt-8 shadow-[0px_0px_0px_1px_rgba(0,0,0,0.06),0px_1px_1px_-0.5px_rgba(0,0,0,0.06),0px_3px_3px_-1.5px_rgba(0,0,0,0.06),_0px_6px_6px_-3px_rgba(0,0,0,0.06),0px_12px_12px_-6px_rgba(0,0,0,0.06),0px_24px_24px_-12px_rgba(0,0,0,0.06)]">
      {/* Right Section: Products Table */}
      <div className="flex-[1] bg-secondary p-4 sm:p-6 border rounded-lg shadow-[0px_0px_0px_1px_rgba(0,0,0,0.06),0px_1px_1px_-0.5px_rgba(0,0,0,0.06),0px_3px_3px_-1.5px_rgba(0,0,0,0.06),_0px_6px_6px_-3px_rgba(0,0,0,0.06),0px_12px_12px_-6px_rgba(0,0,0,0.06),0px_24px_24px_-12px_rgba(0,0,0,0.06)] overflow-auto min-h-[50vh] md:min-h-[auto]">
        <div>
          <div className="font-bold text-xl text-black">Products</div>

          {/* Search Input */}
          <div className="flex items-center p-2 rounded-md">
            <div className="hidden sm:flex items-center bg-gray-100 rounded-[30px] px-3 sm:px-4 py-1 sm:py-2 w-full max-w-[300px] border border-gray-400">
              <FaSearch className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-black" />
              <input
                type="text"
                placeholder="Search Item..."
                className="bg-transparent outline-none px-2 py-1 w-full text-black"
                value={itemInput}
                onChange={(e) => setItemInput(e.target.value)}
              />
            </div>
          </div>

          <div>
            <table className="min-w-full leading-normal mt-6 border rounded-lg p-4">
              <thead>
                <tr>
                  <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-200 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
                    (S/N)
                  </th>
                  <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-200 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Product Name
                  </th>
                  <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-200 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Balance
                  </th>
                  <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-200 text-center text-xs font-bold text-gray-600 uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody className="overflow-auto text-black">
                {items?.map((item, index) => (
                  <tr key={item._id} className="hover:bg-gray-100">
                    <td className="py-2 px-3 font-normal text-base border-x border-t border-gray text-center">
                      {index + 1}
                    </td>
                    <td className="py-2 px-3 font-normal text-base border-x border-t border-gray capitalize">
                      {item.name}
                    </td>
                    <td className="py-2 px-3 font-normal text-base border-x border-t border-gray text-center">
                      {item.itemQuantity}
                    </td>
                    <td className="py-2 px-3 font-normal text-base border-x border-t border-gray text-center">
                      <button
                        onClick={() => handleItemSelection(item)}
                        className="cursor-pointer"
                      >
                        <TiArrowRightThick />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Error Message */}
          {showError && (
            <p className="text-red-500 text-sm mb-2 ml-6">{showError}</p>
          )}
        </div>
      </div>

      {/* Left Section: Selected Item Details */}
      <div className="flex-[2] bg-secondary p-4 sm:p-6 border rounded-md shadow-[0px_0px_0px_1px_rgba(0,0,0,0.06),0px_1px_1px_-0.5px_rgba(0,0,0,0.06),0px_3px_3px_-1.5px_rgba(0,0,0,0.06),_0px_6px_6px_-3px_rgba(0,0,0,0.06),0px_12px_12px_-6px_rgba(0,0,0,0.06),0px_24px_24px_-12px_rgba(0,0,0,0.06)] text-black w-full md:w-auto overflow-y-auto max-h-[60vh] md:max-h-[100vh] scrollbar-hide ">
        <div className="flex justify-between items-center px-5 mt-5">
          <div className="font-bold text-xl text-gray-800">
            Purchase Details
          </div>
          <span className="px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded">
            {selectedItem ? 1 : 0}
          </span>
        </div>

        <div className="p-6">
          {selectedItem && (
            <div className="border p-4 rounded mb-4 shadow">
              <h3 className="font-semibold mb-2 text-lg">
                {selectedItem.name}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* All your input fields with controlled values */}
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
                    htmlFor="quantity"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Idadi Kamili
                  </label>
                  <input
                    type="text"
                    name="quantity"
                    value={formData.quantity}
                    readOnly
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

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    Total Cost
                  </label>
                  <input
                    type="text"
                    name="totalCost"
                    value={formData.totalCost}
                    readOnly
                    className="bg-gray-100 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 dark:bg-gray-700 dark:border-gray-500 dark:text-white"
                  />
                </div>
                {/* Continue with other inputs similarly */}
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 flex gap-10 justify-between">
          <button
            onClick={handleAdd}
            disabled={!selectedItem}
            className="bg-green-300 text-black px-4 py-2 rounded disabled:opacity-50 w-full"
          >
            Add
          </button>
          <button
            onClick={handleCancel}
            disabled={!selectedItem}
            className="bg-gray-300 text-black px-4 py-2 rounded disabled:opacity-50 w-full"
          >
            Cancel
          </button>
        </div>
      </div>
    </section>
  );
};

export default Section2;
