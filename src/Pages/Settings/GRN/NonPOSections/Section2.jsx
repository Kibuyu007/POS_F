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

const Section2 = ({ onAddItem }) => {
  const { items } = useSelector((state) => state.items);
  const dispatch = useDispatch();

  const [selectedItem, setSelectedItem] = useState(null); // Single selected item
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

  // Initialize form data with default values
  // First day of current month
  const firstDayOfMonth = dayjs().startOf("month").format("YYYY-MM-DD");
  // Last day of current month
  const lastDayOfMonth = dayjs().endOf("month").format("YYYY-MM-DD");

  const [formData, setFormData] = useState({
    buyingPrice: "",
    units: 1,
    itemsPerUnit: 1,
    quantity: "",
    rejected: "",
    billedAmount: "",
    foc: "",
    batchNumber: "",
    manufactureDate: firstDayOfMonth,
    expiryDate: lastDayOfMonth,
    receivedDate: new Date().toISOString().split("T")[0],
    comments: "",
    totalCost: "",
    sellingPrice: "",
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
      const billedAmount = parseFloat(updatedForm.billedAmount) || 0;

      // Compute and clamp quantity
      const rawQuantity = units * itemsPerUnit + foc - rejected - billedAmount;
      const quantityMath = Math.max(0, rawQuantity); // kusiwe kuna neg mzee

      //hii itakuwa thamani ya mzigo bila nyiongeza
      const totalCostRaw = buyingPrice * (units * itemsPerUnit);

      return {
        ...updatedForm,
        quantity: rawQuantity,
        totalCost: totalCostRaw,
        rawQuantity: quantityMath,
      };
    });

    setShowError("");
  };

  // Add the selected item with details to parent component
  const handleAdd = () => {
    if (!selectedItem) return;

    const newErrors = {
      manufactureDate: !formData.manufactureDate,
      expiryDate: !formData.expiryDate,
      receivedDate: !formData.receivedDate,
    };

    const today = new Date().toISOString().split("T")[0];

    if (formData.manufactureDate && formData.manufactureDate > today) {
      newErrors.manufactureDate = true;
    }

    if (
      formData.expiryDate &&
      formData.manufactureDate &&
      formData.expiryDate < formData.manufactureDate
    ) {
      newErrors.expiryDate = true;
    }

    if (
      formData.receivedDate &&
      (formData.receivedDate < formData.manufactureDate ||
        formData.receivedDate > formData.expiryDate)
    ) {
      newErrors.receivedDate = true;
    }

    setErrorDate(newErrors);

    // Stop if any error is true
    if (Object.values(newErrors).some((val) => val)) return;

    const fullItemData = {
      _id: uuidv4(),
      itemId: selectedItem._id,
      name: selectedItem.name,
      previousQuantity: selectedItem.itemQuantity,
      previousPrice: selectedItem.price,
      quantity: formData.quantity,
      buyingPrice: formData.buyingPrice,
      manufactureDate: formData.manufactureDate,
      expiryDate: formData.expiryDate,
      receivedDate: formData.receivedDate,
      batchNumber: formData.batchNumber,
      foc: formData.foc,
      rejected: formData.rejected,
      billedAmount: formData.billedAmount,
      comments: formData.comments,
      totalCost: formData.totalCost,
      sellingPrice: formData.sellingPrice || selectedItem.price,
    };
    onAddItem(fullItemData);

    // Reset states for next selection
    setFinishAdd(false);
    setSelectedItem(null);
    setFormData({
      buyingPrice: "",
      units: "",
      itemsPerUnit: "",
      balance: "",
      rejected: "",
      foc: "",
      billedAmount: "",
      batchNumber: "",
      manufactureDate: "",
      expiryDate: "",
      receivedDate: new Date().toISOString().split("T")[0],
      comments: "",
      totalCost: "",
      sellingPrice: "",
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
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  dispatch(searchItemsEveryWhere(e.target.value));
                }}
              />
            </div>
          </div>

          <div className="max-h-[400px] overflow-y-auto mt-4  rounded-lg">
            <table className="min-w-full leading-normal mt-6  rounded-lg p-4">
              <thead>
                <tr>
                  <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-200 text-center text-xs font-bold text-gray-900 uppercase tracking-wider">
                    (S/N)
                  </th>
                  <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-200 text-center text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Product Name
                  </th>
                  <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-200 text-center text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Balance
                  </th>
                  <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-200 text-center text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Select
                  </th>
                </tr>
                <tr className="h-4" />
              </thead>
              <tbody className="overflow-auto text-black">
                {items?.map((item, index) => (
                  <>
                    <tr
                      key={item._id}
                      className="h-16 border-gray-500 shadow-md bg-gray-100"
                    >
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
                    <tr className="h-4" />
                  </>
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

        <div className="p-6 ">
          {selectedItem && (
            <div className="border p-4 rounded mb-4 shadow-md bg-gray-100">
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
                    className={`bg-gray-50 border text-gray-900 text-sm rounded-[30px] focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 
                    dark:bg-gray-600 dark:placeholder-gray-400 dark:text-white
                         ${
                           Number(formData.buyingPrice) >
                           Number(selectedItem.price)
                             ? "border-red-500 dark:border-red-400"
                             : "border-gray-400 dark:border-gray-500"
                         }`}
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
                    className="bg-gray-50 border border-gray-400 text-gray-900 text-sm rounded-[30px]  focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
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
                    className="bg-gray-50 border border-gray-400 text-gray-900 text-sm rounded-[30px]  focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
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
                    className="bg-gray-50 border border-gray-400 text-gray-900 text-sm rounded-[30px]  focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
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
                    className="bg-gray-50 border border-gray-400 text-gray-900 text-sm rounded-[30px]  focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                  />
                </div>

                <div>
                  <label
                    htmlFor="itemsPerUnit"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Unpaid Amount (Deni)
                  </label>
                  <input
                    type="number"
                    name="billedAmount"
                    value={formData.billedAmount}
                    onChange={handleChange}
                    className="bg-gray-50 border border-gray-400 text-gray-900 text-sm rounded-[30px]  focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
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
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    readOnly
                    onChange={handleChange}
                    className="bg-gray-50 border border-gray-400 text-gray-900 text-sm rounded-[30px]  focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                  />
                </div>

                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <div>
                    <label
                      htmlFor="manufactureDate"
                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                    >
                      Manufacture Date
                    </label>
                    <DatePicker
                      views={["year", "month", "day"]}
                      format="YYYY-MM-DD"
                      value={
                        formData.manufactureDate
                          ? dayjs(formData.manufactureDate)
                          : null
                      }
                      onChange={(newValue) => {
                        handleChange({
                          target: {
                            name: "manufactureDate",
                            value: newValue
                              ? newValue.format("YYYY-MM-DD")
                              : "",
                          },
                        });
                        setErrorDate((prev) => ({
                          ...prev,
                          manufactureDate: false,
                        }));
                      }}
                      slotProps={{
                        textField: {
                          size: "small",
                          fullWidth: true,
                          error: errorDate.manufactureDate,
                          helperText:
                            errorDate.manufactureDate &&
                            "Manufacture Date cannot be in the future",
                          className:
                            "bg-gray-50 border border-gray-400 text-gray-900 text-sm rounded-[30px] focus:ring-blue-500 focus:border-blue-500 block dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white",
                        },
                      }}
                    />
                  </div>
                </LocalizationProvider>

                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <div>
                    <label
                      htmlFor="expiryDate"
                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                    >
                      Expiry Date
                    </label>
                    <DatePicker
                      views={["year", "month", "day"]}
                      format="YYYY-MM-DD"
                      value={
                        formData.expiryDate ? dayjs(formData.expiryDate) : null
                      }
                      onChange={(newValue) => {
                        handleChange({
                          target: {
                            name: "expiryDate",
                            value: newValue
                              ? newValue.format("YYYY-MM-DD")
                              : "",
                          },
                        });
                        setErrorDate((prev) => ({
                          ...prev,
                          expiryDate: false,
                        }));
                      }}
                      slotProps={{
                        textField: {
                          size: "small",
                          fullWidth: true,
                          error: errorDate.expiryDate,
                          helperText:
                            errorDate.expiryDate &&
                            "Expiry Date must be after Manufacture Date",
                          className:
                            "bg-gray-50 border border-gray-400 text-gray-900 text-sm rounded-[30px] focus:ring-blue-500 focus:border-blue-500 block dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white",
                        },
                      }}
                    />
                  </div>
                </LocalizationProvider>

                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <div>
                    <label
                      htmlFor="receivedDate"
                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                    >
                      Received Date
                    </label>
                    <DatePicker
                      views={["year", "month", "day"]}
                      format="YYYY-MM-DD"
                      value={
                        formData.receivedDate
                          ? dayjs(formData.receivedDate)
                          : null
                      }
                      onChange={(newValue) => {
                        handleChange({
                          target: {
                            name: "receivedDate",
                            value: newValue
                              ? newValue.format("YYYY-MM-DD")
                              : "",
                          },
                        });
                        setErrorDate((prev) => ({
                          ...prev,
                          receivedDate: false,
                        }));
                      }}
                      slotProps={{
                        textField: {
                          size: "small",
                          fullWidth: true,
                          error: errorDate.receivedDate,
                          helperText:
                            errorDate.receivedDate &&
                            "Received Date must be between Manufacture and Expiry Date",
                          className:
                            "bg-gray-50 border border-gray-400 text-gray-900 text-sm rounded-[30px] focus:ring-blue-500 focus:border-blue-500 block dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white",
                        },
                      }}
                    />
                  </div>
                </LocalizationProvider>

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
                    className="bg-gray-50 border border-gray-400 text-gray-900 text-sm rounded-[30px]  focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
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
                    className="bg-gray-50 border border-gray-400 text-gray-900 text-sm rounded-[30px]  focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
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
                    className="bg-gray-100 border border-gray-400 text-gray-900 text-sm rounded-[30px]  block w-full p-2.5 dark:bg-gray-700 dark:border-gray-500 dark:text-white"
                  />
                </div>

                <div>
                  <label
                    htmlFor="foc"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Selling Price
                  </label>
                  <input
                    type="number"
                    name="sellingPrice"
                    value={formData.sellingPrice || selectedItem.price}
                    onChange={handleChange}
                    className="bg-gray-50 border border-gray-400 text-gray-900 text-sm rounded-[30px]  focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
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
            disabled={!selectedItem || !formData.quantity}
            className={`px-6 py-2 rounded-md w-full transition ${
              !selectedItem || !formData.quantity || !formData.buyingPrice
                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                : "bg-green-300 text-black hover:bg-green-400"
            }`}
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
