import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { fetchProducts } from "../../../../Redux/items";
import { useDispatch } from "react-redux";

const ItemModal = ({ open, onSave, onClose, selectedItem }) => {
  const dispatch = useDispatch();

  // Fetch Items once
  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const [errorDate, setErrorDate] = useState({
    manufactureDate: false,
    expiryDate: false,
    receivedDate: false,
  });

  // First & Last day of current month
  const firstDayOfMonth = dayjs().startOf("month").format("YYYY-MM-DD");
  const lastDayOfMonth = dayjs().endOf("month").format("YYYY-MM-DD");

  const [formData, setFormData] = useState({
    buyingPrice: "",
    units: 1,
    itemsPerUnit: "",
    quantity: "",
    rejected: "",
    billedAmount: "",
    foc: "",
    batchNumber: "",
    manufactureDate: firstDayOfMonth,
    expiryDate: lastDayOfMonth,
    receivedDate: dayjs().format("YYYY-MM-DD"),
    comments: "",
    totalCost: "",
    sellingPrice: "",
    previousPrice: "",
  });

  // Prefill form when editing
  useEffect(() => {
    if (selectedItem) {
      setFormData({
        buyingPrice:
          selectedItem.newBuyingPrice || selectedItem.item?.buyingPrice || "",
        quantity: selectedItem.receivedQuantity || "",
        previousPrice: selectedItem.item?.price || "",
        rejected: selectedItem.rejected || "",
        units: selectedItem.units || 1,
        foc: selectedItem.foc || "",
        billedAmount: selectedItem.billedAmount || "",
        batchNumber: selectedItem.batchNumber || "",
        manufactureDate: selectedItem.manufactureDate || firstDayOfMonth,
        expiryDate: selectedItem.expiryDate || lastDayOfMonth,
        receivedDate: selectedItem.receivedDate || dayjs().format("YYYY-MM-DD"),
        comments: selectedItem.comments || "",
        totalCost: selectedItem.totalCost || "",
        requiredQuantity: selectedItem.requiredQuantity || "",
        sellingPrice:
          selectedItem.newSellingPrice || selectedItem.item?.sellingPrice || 0,
      });
    }
  }, [selectedItem]);

  // Handle changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const updatedForm = { ...prev, [name]: value };

      const units = parseInt(updatedForm.units) || 0;
      const itemsPerUnit = parseInt(updatedForm.itemsPerUnit) || 0;
      const foc = parseInt(updatedForm.foc) || 0;
      const rejected = parseInt(updatedForm.rejected) || 0;
      const buyingPrice = parseFloat(updatedForm.buyingPrice) || 0;

      const quantity = Math.max(0, units * itemsPerUnit + foc - rejected);
      const totalCost = buyingPrice * (units * itemsPerUnit);

      return { ...updatedForm, quantity, totalCost };
    });
  };

  // Save handler
  const handleSave = () => {
    const newErrors = {
      manufactureDate:
        !formData.manufactureDate ||
        dayjs(formData.manufactureDate).isAfter(dayjs(), "day"),
      expiryDate:
        !formData.expiryDate ||
        dayjs(formData.expiryDate).isBefore(
          dayjs(formData.manufactureDate),
          "day"
        ),
      receivedDate:
        !formData.receivedDate ||
        dayjs(formData.receivedDate).isBefore(
          dayjs(formData.manufactureDate),
          "day"
        ) ||
        dayjs(formData.receivedDate).isAfter(dayjs(formData.expiryDate), "day"),
    };

    setErrorDate(newErrors);

    if (Object.values(newErrors).some(Boolean)) return;

    const updatedItemData = {
      ...selectedItem,
      receivedQuantity: formData.quantity,
      newBuyingPrice: parseFloat(formData.buyingPrice),
      newSellingPrice: parseFloat(formData.sellingPrice),
      batchNumber: formData.batchNumber,
      manufactureDate: formData.manufactureDate,
      expiryDate: formData.expiryDate,
      receivedDate: formData.receivedDate,
      foc: parseInt(formData.foc) || 0,
      rejected: parseInt(formData.rejected) || 0,
      billedAmount: parseFloat(formData.billedAmount) || 0,
      comments: formData.comments,
      totalCost: parseFloat(formData.totalCost),
      detailsAdded: true,
    };

    onSave(updatedItemData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-4xl w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">
            Processing: {selectedItem?.name}
          </h2>
          <button onClick={onClose} className="text-red-500 font-bold">
            X
          </button>
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
                  {selectedItem.item.name}
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
                           Number(formData.previousPrice)
                             ? "border-red-500 dark:border-red-400"
                             : "border-gray-400 dark:border-gray-500"
                         }`}
                    />
                    {/* Warning Text */}
                    {Number(formData.buyingPrice) >
                      Number(formData.previousPrice) && (
                      <p className="mt-1 text-xs text-red-500 dark:text-red-400">
                        Bei ya manunuzi ni kubwa kuliko bei ya kuuzia kwa sasa.{" "}
                        <span className="text-black">
                          {" "}
                          (Tsh: {formData.previousPrice.toLocaleString()})
                        </span>
                      </p>
                    )}
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
                      htmlFor="billedAmount"
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
                      Paid Quantity (Iliyolipwa)
                    </label>
                    <input
                      type="number"
                      name="quantity"
                      value={formData.quantity}
                      readOnly
                      onChange={handleChange}
                      className={`bg-gray-50 border text-gray-900 text-sm rounded-[30px] focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 
                    dark:bg-gray-600 dark:placeholder-gray-400 dark:text-white
                           ${
                             Number(formData.quantity) >
                             Number(selectedItem?.requiredQuantity)
                               ? "border-red-500 dark:border-red-400"
                               : "border-gray-400 dark:border-gray-500"
                           }`}
                    />

                    {/* Warning Text */}
                    {Number(formData.quantity) >
                      Number(selectedItem?.requiredQuantity) && (
                      <p className="mt-1 text-xs text-red-500 dark:text-red-400">
                        Idadi imezidi kiwango kilichohitajika.{" "}
                        <span className="text-black">
                          (`{selectedItem?.requiredQuantity}`)
                        </span>{" "}
                        ni kiwango kilichohitajika.
                      </p>
                    )}
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
                              "bg-gray-50 border border-gray-400 text-gray-900 text-sm rounded-[30px]  focus:ring-blue-500 focus:border-blue-500 block dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white",
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
                        Expire Date
                      </label>
                      <DatePicker
                        views={["year", "month", "day"]}
                        format="YYYY-MM-DD"
                        value={
                          formData.expiryDate
                            ? dayjs(formData.expiryDate)
                            : null
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
                              "bg-gray-50 border border-gray-400 text-gray-900 text-sm rounded-[30px]  focus:ring-blue-500 focus:border-blue-500 block dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white",
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
                      htmlFor="previousPrice"
                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                    >
                      Previous Selling Price
                    </label>
                    <input
                      type="number"
                      name="sellingPrice"
                      readOnly
                      value={formData.previousPrice}
                      onChange={handleChange}
                      className="bg-gray-50 border border-gray-400 text-gray-900 text-sm rounded-[30px]  focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="sellingPrice"
                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                    >
                      New Selling Price
                    </label>
                    <input
                      type="number"
                      name="sellingPrice"
                      value={formData.sellingPrice}
                      onChange={handleChange}
                      className={`bg-gray-50 border text-gray-900 text-sm rounded-[30px] focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 
                    dark:bg-gray-600 dark:placeholder-gray-400 dark:text-white
                         ${
                           Number(formData.buyingPrice) >
                           Number(formData.sellingPrice)
                             ? "border-red-500 dark:border-red-400"
                             : "border-gray-400 dark:border-gray-500"
                         }`}
                    />
                    {/* Warning Text */}
                    {Number(formData.buyingPrice) >
                      Number(formData.previousPrice) && (
                      <p className="mt-1 text-xs text-red-500 dark:text-red-400">
                        Bei ya kuuzia ni ndogo kuliko bei ya manunuzi kwa sasa.{" "}
                        <span className="text-black">
                          {" "}
                          (Tsh: {formData.buyingPrice.toLocaleString()})
                        </span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 flex gap-10 justify-between">
            <button
              onClick={handleSave}
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
              onClick={onClose}
              disabled={!selectedItem}
              className="bg-gray-300 text-black px-4 py-2 rounded disabled:opacity-50 w-full"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemModal;
