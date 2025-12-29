import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import { MdDeleteForever } from "react-icons/md";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

// Icons
import {
  FiTruck,
  FiFileText,
  FiUser,
  FiCalendar,
  FiPackage,
  FiEdit2,
  FiCheckCircle,
} from "react-icons/fi";
import { RiBillLine } from "react-icons/ri";

// API & Redux
import BASE_URL from "../../../../Utils/config";
import { fetchSuppliers } from "../../../../Redux/suppliers";
import { fetchProducts } from "../../../../Redux/items";
import Section2 from "./Section2";

const NonPoGrn = () => {
  const dispatch = useDispatch();
  const { supplier } = useSelector((state) => state.suppliers);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [itemHold, setItemHold] = useState(() => {
    const storedItems = localStorage.getItem("itemHold");
    return storedItems ? JSON.parse(storedItems) : [];
  });

  // Form state with localStorage persistence
  const [formData, setFormData] = useState(() => {
    const stored = localStorage.getItem("nonPoGrnForm");
    return stored
      ? JSON.parse(stored)
      : {
          supplierName: "",
          receivingDate: new Date().toISOString().split("T")[0],
          invoiceNumber: "",
          lpoNumber: "",
          deliveryPerson: "",
          deliveryNumber: "",
          description: "",
        };
  });

  // Fetch initial data
  useEffect(() => {
    dispatch(fetchSuppliers());
    dispatch(fetchProducts());
  }, [dispatch]);

  // Persist form data to localStorage
  useEffect(() => {
    localStorage.setItem("nonPoGrnForm", JSON.stringify(formData));
  }, [formData]);

  // Persist items to localStorage
  useEffect(() => {
    localStorage.setItem("itemHold", JSON.stringify(itemHold));
  }, [itemHold]);

  // Handlers
  const handleAddItem = (itemData) => {
    setItemHold((prev) => [...prev, itemData]);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleReceivingDate = (date) => {
    setFormData((prev) => ({
      ...prev,
      receivingDate: date ? dayjs(date).format("YYYY-MM-DD") : "",
    }));
  };

  const removeItem = (itemToRemove) => {
    setItemHold((items) => items.filter((item) => item !== itemToRemove));
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.supplierName || !formData.receivingDate) {
      setError("Please fill all required fields.");
      return;
    }

    if (itemHold.length === 0) {
      setError("Add at least one item.");
      return;
    }

    const selectedSupplier = supplier.find(
      (sup) => sup._id === formData.supplierName
    );

    setLoading(true);
    setError("");

    const grnData = {
      supplierName: selectedSupplier?.supplierName || "",
      invoiceNumber: formData.invoiceNumber,
      lpoNumber: formData.lpoNumber,
      deliveryPerson: formData.deliveryPerson,
      deliveryNumber: formData.deliveryNumber,
      description: formData.description,
      receivingDate: formData.receivingDate,
      items: itemHold.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        buyingPrice: item.buyingPrice,
        sellingPrice: item.sellingPrice,
        enableWholesale: item.enableWholesale || false,
        wholesaleMinQty: item.enableWholesale
          ? Number(item.wholesaleMinQty)
          : 0,
        wholesalePrice: item.enableWholesale ? Number(item.wholesalePrice) : 0,
        batchNumber: item.batchNumber,
        manufactureDate: item.manufactureDate,
        expiryDate: item.expiryDate,
        foc: item.foc || false,
        rejected: item.rejected || false,
        billedAmount: item.billedAmount,
        comments: item.comments || "",
        totalCost: item.totalCost || 0,
      })),
    };

    try {
      const response = await axios.post(`${BASE_URL}/api/grn/newGrn`, grnData, {
        withCredentials: true,
      });

      if (response.status === 200 && response.data.success) {
        // Reset form on success
        setFormData({
          supplierName: "",
          invoiceNumber: "",
          lpoNumber: "",
          deliveryPerson: "",
          deliveryNumber: "",
          description: "",
          receivingDate: new Date().toISOString().split("T")[0],
        });
        setItemHold([]);
        localStorage.removeItem("itemHold");
        toast.success("GRN submitted successfully!");
      } else {
        throw new Error(response.data.message || "Failed to save GRN.");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Tatizo katika kuhifadhi manunuzi.";
      setError(errorMessage);
      toast.error(errorMessage, {
        position: "bottom-right",
        style: {
          borderRadius: "12px",
          fontSize: "16px",
          background: "#ef4444",
          color: "#fff",
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setItemHold([]);
    setFormData({
      supplierName: "",
      receivingDate: new Date().toISOString().split("T")[0],
      invoiceNumber: "",
      lpoNumber: "",
      deliveryPerson: "",
      deliveryNumber: "",
      description: "",
    });
    localStorage.removeItem("itemHold");
    localStorage.removeItem("nonPoGrnForm");
    setError("");
  };

  const formatPriceWithCommas = (price) => {
    return new Intl.NumberFormat("en-US").format(price || 0);
  };

  // Validation states
  const isSupplierValid = formData.supplierName !== "";
  const isDateValid = formData.receivingDate !== "";

  return (
    <div className="md:flex-row gap-6 px-4 py-6">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          Create Non-Purchase GRN
        </h1>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-green-300 rounded-full mr-3"></div>
          <p className="text-gray-700 text-base font-medium">
            Register goods received from suppliers without a purchase order
          </p>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="mb-8 flex items-center space-x-6">
        <div className="flex items-center">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center ${
              isSupplierValid
                ? "bg-green-300 border-2 border-green-400"
                : "bg-gray-200 border-2 border-gray-300"
            }`}
          >
            {isSupplierValid ? (
              <FiCheckCircle className="text-gray-900 text-lg font-bold" />
            ) : (
              <span className="text-gray-900 font-bold">1</span>
            )}
          </div>
          <div className="ml-3">
            <span
              className={`font-semibold ${
                isSupplierValid ? "text-gray-900" : "text-gray-600"
              }`}
            >
              Supplier Details
            </span>
          </div>
        </div>
        <div className="w-12 h-2 bg-gray-300"></div>
        <div className="flex items-center">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center ${
              itemHold.length > 0
                ? "bg-green-300 border-2 border-green-400"
                : "bg-gray-200 border-2 border-gray-300"
            }`}
          >
            {itemHold.length > 0 ? (
              <FiCheckCircle className="text-gray-900 text-lg font-bold" />
            ) : (
              <span className="text-gray-900 font-bold">2</span>
            )}
          </div>
          <div className="ml-3">
            <span
              className={`font-semibold ${
                itemHold.length > 0 ? "text-gray-900" : "text-gray-600"
              }`}
            >
              Add Items
            </span>
          </div>
        </div>
      </div>

      {/* Supplier Details Section */}
      <div className="bg-white rounded-lg border border-gray-300 mb-8 shadow-sm">
        {/* Section Header */}
        <div className="px-6 py-4 border-b border-gray-300 bg-gradient-to-r from-green-50 to-gray-100">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-green-300 rounded-lg flex items-center justify-center mr-4 shadow-sm">
              <RiBillLine className="text-gray-900 font-bold" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Supplier Information
              </h2>
              <p className="text-gray-700 text-sm font-medium">
                Fill in the supplier and delivery details
              </p>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6">
          <div className="space-y-6">
            {/* First Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Supplier Selection */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-semibold text-gray-900">
                  <RiBillLine className="mr-2 text-gray-700" />
                  Supplier <span className="text-red-500 ml-1">*</span>
                </label>
                <div className="relative">
                  <select
                    name="supplierName"
                    onChange={handleChange}
                    value={formData.supplierName}
                    className={`w-full pl-10 pr-4 py-3 border ${
                      formData.supplierName
                        ? "border-green-300 bg-green-50"
                        : "border-gray-300 bg-gray-100"
                    } rounded-lg focus:ring-2 focus:ring-green-300 focus:border-green-300 font-medium text-gray-900`}
                    required
                  >
                    <option value="" disabled>
                      Select a supplier
                    </option>
                    {supplier.map((s) => (
                      <option key={s._id} value={s._id} className="font-medium">
                        {s.supplierName}
                      </option>
                    ))}
                  </select>
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <RiBillLine
                      className={`${
                        formData.supplierName
                          ? "text-gray-900"
                          : "text-gray-600"
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Receiving Date */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-semibold text-gray-900">
                  <FiCalendar className="mr-2 text-gray-700" />
                  Receiving Date <span className="text-red-500 ml-1">*</span>
                </label>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    value={dayjs(formData.receivingDate)}
                    onChange={handleReceivingDate}
                    maxDate={dayjs()}
                    format="DD/MM/YYYY"
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        size: "small",
                        error: !formData.receivingDate,
                        helperText: !formData.receivingDate ? "Required" : "",
                      },
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "0.5rem",
                        height: "44px",
                        backgroundColor: "#f9fafb",
                        "&:hover .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#86efac",
                        },
                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
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
            </div>

            {/* Document Numbers Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Invoice Number */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-semibold text-gray-900">
                  <FiFileText className="mr-2 text-gray-700" />
                  Invoice Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="invoiceNumber"
                    value={formData.invoiceNumber}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 bg-gray-100 rounded-lg focus:ring-2 focus:ring-green-300 focus:border-green-300 font-medium text-gray-900"
                    placeholder="INV-2023-001"
                  />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <FiFileText className="text-gray-600" />
                  </div>
                </div>
              </div>

              {/* LPO Number */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-semibold text-gray-900">
                  <FiFileText className="mr-2 text-gray-700" />
                  LPO Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="lpoNumber"
                    value={formData.lpoNumber}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 bg-gray-100 rounded-lg focus:ring-2 focus:ring-green-300 focus:border-green-300 font-medium text-gray-900"
                    placeholder="LPO-2023-001"
                  />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <FiFileText className="text-gray-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Information Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Delivery Person */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-semibold text-gray-900">
                  <FiUser className="mr-2 text-gray-700" />
                  Delivery Person
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="deliveryPerson"
                    value={formData.deliveryPerson}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 bg-gray-100 rounded-lg focus:ring-2 focus:ring-green-300 focus:border-green-300 font-medium text-gray-900"
                    placeholder="Eddward Mwakayebe"
                  />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <FiUser className="text-gray-600" />
                  </div>
                </div>
              </div>

              {/* Delivery Note Number */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-semibold text-gray-900">
                  <FiTruck className="mr-2 text-gray-700" />
                  Delivery Note No.
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="deliveryNumber"
                    value={formData.deliveryNumber}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 bg-gray-100 rounded-lg focus:ring-2 focus:ring-green-300 focus:border-green-300 font-medium text-gray-900"
                    placeholder="DN-2023-001"
                  />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <FiTruck className="text-gray-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-semibold text-gray-900">
                <FiEdit2 className="mr-2 text-gray-700" />
                Description
              </label>
              <div className="relative">
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 bg-gray-100 rounded-lg focus:ring-2 focus:ring-green-300 focus:border-green-300 font-medium text-gray-900 resize-none"
                  placeholder="Enter any additional notes or description..."
                />
                <div className="absolute left-3 top-3">
                  <FiEdit2 className="text-gray-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form Status */}
        <div className="px-6 py-4 border-t border-gray-300 bg-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center">
                <div
                  className={`w-3 h-3 rounded-full mr-3 ${
                    isSupplierValid ? "bg-green-400" : "bg-gray-400"
                  }`}
                ></div>
                <span className="text-sm text-gray-900 font-medium">
                  Supplier selected
                </span>
              </div>
              <div className="flex items-center">
                <div
                  className={`w-3 h-3 rounded-full mr-3 ${
                    isDateValid ? "bg-green-400" : "bg-gray-400"
                  }`}
                ></div>
                <span className="text-sm text-gray-900 font-medium">
                  Date selected
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setFormData({
                  supplierName: "",
                  invoiceNumber: "",
                  lpoNumber: "",
                  deliveryPerson: "",
                  deliveryNumber: "",
                  description: "",
                  receivingDate: new Date().toISOString().split("T")[0],
                });
              }}
              className="px-4 py-2 text-sm text-gray-900 font-medium hover:text-gray-700 hover:bg-gray-200 rounded transition-colors border border-gray-300"
            >
              Clear Form
            </button>
          </div>
        </div>
      </div>

      {/* Add Items Section */}
      <div className="mb-8">
        <div className="bg-white rounded-lg border border-gray-300 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-300 bg-gradient-to-r from-green-50 to-gray-100">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-300 rounded-lg flex items-center justify-center mr-4 shadow-sm">
                <span className="text-gray-900 font-bold">2</span>
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Add Items</h2>
                <p className="text-gray-700 text-sm font-medium">
                  Add products received in this delivery
                </p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <Section2 onAddItem={handleAddItem} />
          </div>
        </div>
      </div>

      {/* Items Summary */}
      {itemHold.length > 0 && (
        <div className="mb-6 bg-gradient-to-r from-gray-100 to-green-100 rounded-lg p-5 border border-green-400 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center shadow-sm mr-4 border border-gray-300">
                <FiPackage className="text-2xl text-gray-900 font-bold" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">
                  Items Ready for Submission
                </h3>
                <p className="text-gray-900 font-medium">
                  Review before creating GRN
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-8">
              <div className="text-center">
                <div className="text-sm text-gray-900 font-medium">
                  Total Items
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {itemHold.length}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-900 font-medium">
                  Total Cost
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {formatPriceWithCommas(
                    itemHold.reduce(
                      (sum, item) => sum + (item.totalCost || 0),
                      0
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Items Table (UNCHANGED) */}
      <div
        style={{ maxHeight: "500px" }}
        className="mx-auto rounded-md border-2 border-gray-300 mt-10 max-h-96 px-4 py-6 sm:px-6 lg:px-8 shadow-sm overflow-x-auto bg-gray-50"
      >
        <div className="">
          <table className="min-w-full leading-normal table-fixed">
            <thead>
              <tr>
                <th className="px-5 py-3 border-b-2 border-gray-300 bg-gray-200 text-xs font-bold text-gray-900 uppercase tracking-wider">
                  (S/N)
                </th>

                <th className="px-5 py-3 border-b-2 border-gray-300 bg-gray-200 text-xs font-bold text-gray-900 uppercase tracking-wider">
                  Product Name
                </th>

                <th className="px-5 py-3 border-b-2 border-gray-300 bg-gray-200 text-xs font-bold text-gray-900 uppercase tracking-wider">
                  Previous Balnce
                </th>

                <th className="px-5 py-3 border-b-2 border-gray-300 bg-gray-200 text-xs font-bold text-gray-900 uppercase tracking-wider">
                  New Balance
                </th>

                <th className="px-5 py-3 border-b-2 border-gray-300 bg-gray-200 text-xs font-bold text-gray-900 uppercase tracking-wider">
                  Buying Price
                </th>

                <th className="px-5 py-3 border-b-2 border-gray-300 bg-gray-200 text-xs font-bold text-gray-900 uppercase tracking-wider">
                  Total Buying Price
                </th>

                <th className="px-5 py-3 border-b-2 border-gray-300 bg-gray-200 text-xs font-bold text-gray-900 uppercase tracking-wider">
                  Previous Price
                </th>

                <th className="px-5 py-3 border-b-2 border-gray-300 bg-gray-200 text-xs font-bold text-gray-900 uppercase tracking-wider">
                  New Price
                </th>

                <th className="px-5 py-3 border-b-2 border-gray-300 bg-gray-200 text-xs font-bold text-gray-900 uppercase tracking-wider">
                  Receiving Date
                </th>

                <th className="px-5 py-3 border-b-2 border-gray-300 bg-gray-200 text-xs font-bold text-gray-900 uppercase tracking-wider">
                  Expiring Date
                </th>

                <th className="px-5 py-3 border-b-2 border-gray-300 bg-gray-200 text-xs font-bold text-gray-900 uppercase tracking-wider">
                  Remove
                </th>
              </tr>

              <tr className="h-4" />
            </thead>

            <tbody>
              <>
                {Array.isArray(itemHold) &&
                  itemHold.map((item, index) => (
                    <>
                      <tr
                        key={item._id}
                        className="h-16 border-gray-400 shadow-sm bg-gray-100"
                      >
                        <td className="py-2 px-3 font-medium text-base border-x hover:bg-gray-200">
                          <div className="flex justify-center">
                            <div className="ml-3">
                              <p className="text-gray-900 whitespace-no-wrap font-bold capitalize bg-green-300 rounded-full flex items-center justify-center h-8 w-8">
                                {index + 1}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td
                          className={`py-2 px-3 font-medium text-base border-x ${
                            index == 0
                              ? "border-t border-gray-300"
                              : index == item?.length
                              ? "border-y border-gray-300"
                              : "border-t border-gray-300"
                          } hover:bg-gray-200`}
                        >
                          <div className="flex">
                            <span className="relative inline-block px-3 py-1 font-semibold capitalize leading-tight">
                              <span
                                aria-hidden
                                className="absolute inset-0 opacity-50 rounded-full"
                              />
                              <span className="relative text-gray-900 font-medium">
                                {item.name}
                              </span>
                            </span>
                          </div>
                        </td>

                        <td className="py-2 px-3 font-medium text-base border-x hover:bg-gray-200 whitespace-nowrap overflow-hidden overflow-ellipsis max-w-[200px]">
                          <div className="items-center text-center">
                            <div className="ml-3">
                              <p className="text-gray-900 whitespace-no-wrap font-semibold capitalize">
                                {formatPriceWithCommas(item.previousQuantity)}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="py-2 px-3 font-medium text-base border-x hover:bg-gray-200">
                          <div className="items-center text-center">
                            <div className="ml-3">
                              <p className="text-gray-900 whitespace-nowrap font-semibold capitalize">
                                {formatPriceWithCommas(
                                  (Number(item.quantity) || 0) +
                                    (Number(item.billedAmount) || 0)
                                )}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="py-2 px-3 font-medium text-base border-x hover:bg-gray-200">
                          <div className="items-center text-center">
                            <div className="ml-3">
                              <p className="text-gray-900 whitespace-no-wrap font-semibold capitalize">
                                {formatPriceWithCommas(item.buyingPrice)}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="py-2 px-3 font-medium text-base border-x hover:bg-gray-200">
                          <div className="items-center text-center">
                            <div className="ml-3">
                              <p className="text-gray-900 whitespace-no-wrap font-semibold capitalize">
                                {formatPriceWithCommas(item.totalCost)}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="py-2 px-3 font-medium text-base border-x hover:bg-gray-200 whitespace-nowrap overflow-hidden overflow-ellipsis max-w-[200px]">
                          <div className="items-center text-center">
                            <div className="ml-3">
                              <p className="text-gray-900 whitespace-no-wrap font-semibold capitalize">
                                {formatPriceWithCommas(item.previousPrice)}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="py-2 px-3 font-medium text-base border-x hover:bg-gray-200">
                          <div className="items-center text-center">
                            <div className="ml-3">
                              <p className="text-gray-900 whitespace-no-wrap font-semibold capitalize">
                                {formatPriceWithCommas(item.sellingPrice)}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="py-2 px-3 font-medium text-base border-x hover:bg-gray-200">
                          <div className="items-center text-center">
                            <div className="ml-3">
                              <p className="text-gray-900 whitespace-no-wrap font-semibold capitalize">
                                {item.manufactureDate}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="py-2 px-3 font-medium text-base border-x hover:bg-gray-200">
                          <div className="items-center text-center">
                            <div className="ml-3">
                              <p className="text-gray-900 whitespace-no-wrap font-semibold capitalize">
                                {item.expiryDate}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="py-2 px-3 font-medium text-base border-x hover:bg-gray-200">
                          <div className="flex justify-center">
                            <button
                              type="button"
                              onClick={() => removeItem(item)}
                            >
                              <span className="relative inline-block px-3 py-1 font-semibold text-gray-900 leading-tight">
                                <span
                                  aria-hidden
                                  className="absolute inset-0 opacity-50 rounded-full"
                                />
                                <span className="relative text-3xl">
                                  <MdDeleteForever />
                                </span>
                              </span>
                            </button>
                          </div>
                        </td>
                      </tr>
                      <tr className="h-4" />
                    </>
                  ))}
              </>
            </tbody>
          </table>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 pt-6 border-t border-gray-300">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-300 rounded-lg">
              <div className="flex items-center">
                <svg
                  className="w-5 h-5 text-red-500 mr-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="text-red-700 font-semibold">{error}</p>
              </div>
            </div>
          )}

          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div>
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-3 border border-gray-300 text-gray-900 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>

            <div className="flex items-center space-x-8">
              <button
                type="submit"
                className="px-8 py-3 bg-green-300 text-gray-900 font-bold rounded-lg hover:bg-green-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-w-[180px] shadow-sm"
                onClick={handleSubmit}
                disabled={loading || itemHold.length === 0}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-900"
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
                    Creating GRN...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Submit GRN
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NonPoGrn;
