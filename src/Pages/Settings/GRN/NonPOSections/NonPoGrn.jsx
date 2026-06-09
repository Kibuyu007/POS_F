import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import { MdDeleteForever } from "react-icons/md";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

import {
  FiCheckCircle,
  FiX,
  FiPlus,
  FiChevronDown,
  FiChevronUp,
  FiMonitor,
  FiTablet,
  FiSmartphone,
  FiTruck,
  FiFileText,
  FiCalendar,
  FiUser,
  FiHash,
  FiClipboard,
  FiAlertCircle,
  FiShoppingCart,
  FiDollarSign,
  FiPackage,
} from "react-icons/fi";
import { RiBillLine } from "react-icons/ri";

import BASE_URL from "../../../../Utils/config";
import { fetchSuppliers } from "../../../../Redux/suppliers";
import { fetchProducts } from "../../../../Redux/items";
import Section2 from "./Section2";

const NonPoGrn = () => {
  const dispatch = useDispatch();
  const { supplier } = useSelector((state) => state.suppliers);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSection2, setShowSection2] = useState(false);
  const [showItems, setShowItems] = useState(true);

  const [itemHold, setItemHold] = useState(() => {
    const storedItems = localStorage.getItem("itemHold");
    return storedItems ? JSON.parse(storedItems) : [];
  });

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

  useEffect(() => {
    dispatch(fetchSuppliers());
    dispatch(fetchProducts());
  }, [dispatch]);

  useEffect(() => {
    localStorage.setItem("nonPoGrnForm", JSON.stringify(formData));
  }, [formData]);

  useEffect(() => {
    localStorage.setItem("itemHold", JSON.stringify(itemHold));
  }, [itemHold]);

  const handleAddItem = (itemData) => {
    setItemHold((prev) => [...prev, itemData]);
    setShowSection2(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
    if (!formData.supplierName || !formData.receivingDate) {
      setError("Please select supplier and date.");
      return;
    }

    if (itemHold.length === 0) {
      setError("Add at least one item.");
      return;
    }

    const selectedSupplier = supplier.find(
      (sup) => sup._id === formData.supplierName,
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
      const errorMessage = error.response?.data?.message || "Error saving GRN.";
      setError(errorMessage);
      toast.error(errorMessage);
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

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-US").format(price || 0);
  };

  const totalCost = itemHold.reduce(
    (sum, item) => sum + (item.totalCost || 0),
    0,
  );

  const isStep1Complete = formData.supplierName && formData.receivingDate;
  const isStep2Complete = itemHold.length > 0;

  // Small screen warning component
  const SmallScreenWarning = () => (
    <div className="fixed inset-0 z-50 bg-gray-200 flex flex-col items-center justify-center p-6 text-center">
      <div className="mb-8 relative">
        <div className="w-32 h-32 bg-green-400/20 rounded-full flex items-center justify-center animate-pulse">
          <div className="w-24 h-24 bg-green-400/30 rounded-full flex items-center justify-center">
            <FiMonitor className="text-green-400 w-12 h-12" />
          </div>
        </div>
        <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-red-500 rounded-full flex items-center justify-center shadow-lg shadow-red-500/30">
          <FiSmartphone className="text-white w-5 h-5" />
        </div>
      </div>

      <h1 className="text-2xl font-bold text-black mb-3">Screen Too Small</h1>
      <p className="text-gray-400 text-base mb-2 max-w-xs">
        This page requires a larger screen to manage GRN forms properly.
      </p>
      <p className="text-gray-500 text-sm mb-8 max-w-xs">
        Please use a tablet, laptop, or desktop computer for the best
        experience.
      </p>

      <div className="flex items-center gap-4 mb-8">
        <div className="flex flex-col items-center gap-2 opacity-50">
          <FiSmartphone className="text-gray-500 w-8 h-8" />
          <span className="text-xs text-gray-600">Mobile</span>
        </div>
        <div className="w-12 h-0.5 bg-gray-700" />
        <div className="flex flex-col items-center gap-2">
          <FiTablet className="text-green-400 w-8 h-8" />
          <span className="text-xs text-green-400">Tablet+</span>
        </div>
        <div className="w-12 h-0.5 bg-gray-700" />
        <div className="flex flex-col items-center gap-2">
          <FiMonitor className="text-green-400 w-8 h-8" />
          <span className="text-xs text-green-400">Desktop</span>
        </div>
      </div>

      <div className="bg-gray-800/50 rounded-2xl p-4 border border-gray-700 max-w-xs">
        <p className="text-gray-400 text-xs mb-3">Minimum recommended:</p>
        <div className="flex items-center justify-between text-sm">
          <span className="text-white font-medium">Screen width</span>
          <span className="text-green-400 font-bold">768px+</span>
        </div>
        <div className="flex items-center justify-between text-sm mt-2">
          <span className="text-white font-medium">Device</span>
          <span className="text-green-400 font-bold">Tablet / PC</span>
        </div>
      </div>

      <button
        onClick={() => (window.location.href = "/Settings")}
        className="mt-8 px-6 py-3 bg-green-400 hover:bg-green-500 text-black font-bold rounded-full transition-all duration-200 text-sm shadow-lg shadow-green-400/20 hover:shadow-green-400/30"
      >
        Go to Settings
      </button>
    </div>
  );

  return (
    <>
      {/* Small screen warning */}
      <div className="md:hidden">
        <SmallScreenWarning />
      </div>

      {/* Main content */}
      <div className="hidden md:block min-h-screen bg-gray-50">
        {/* Top Navigation Bar */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 lg:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-300 rounded-xl flex items-center justify-center shadow-md shadow-green-300/30">
                <RiBillLine className="text-black" size={22} />
              </div>
              <div>
                <h1 className="text-lg font-bold text-black">
                  Create Non-PO GRN
                </h1>
                <p className="text-xs text-gray-500">
                  Goods Received Note — Register supplier deliveries
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg border border-gray-200">
                <div
                  className={`w-2 h-2 rounded-full ${isStep1Complete ? "bg-green-500" : "bg-amber-400"} animate-pulse`}
                />
                <span className="text-xs font-medium text-gray-600">
                  {isStep1Complete
                    ? "Ready to add items"
                    : "Fill required fields"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-8xl mx-auto px-4 lg:px-8 py-6 space-y-6">
          {/* Progress Steps */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center justify-between max-w-2xl mx-auto">
              {/* Step 1 */}
              <div className="flex flex-col items-center gap-2">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                    isStep1Complete
                      ? "bg-green-300 text-black shadow-lg shadow-green-300/30"
                      : "bg-gray-100 text-gray-400 border-2 border-gray-200"
                  }`}
                >
                  {isStep1Complete ? <FiCheckCircle size={20} /> : "1"}
                </div>
                <div className="text-center">
                  <span
                    className={`text-xs font-semibold ${isStep1Complete ? "text-green-700" : "text-gray-500"}`}
                  >
                    Details
                  </span>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    Supplier info
                  </p>
                </div>
              </div>

              {/* Connector */}
              <div className="flex-1 mx-4 mb-6">
                <div className="h-1 rounded-full bg-gray-200 relative overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isStep1Complete ? "bg-green-300 w-full" : "w-0"
                    }`}
                  />
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col items-center gap-2">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                    isStep2Complete
                      ? "bg-green-300 text-black shadow-lg shadow-green-300/30"
                      : isStep1Complete
                        ? "bg-white text-green-600 border-2 border-green-300"
                        : "bg-gray-100 text-gray-400 border-2 border-gray-200"
                  }`}
                >
                  {isStep2Complete ? <FiCheckCircle size={20} /> : "2"}
                </div>
                <div className="text-center">
                  <span
                    className={`text-xs font-semibold ${isStep2Complete ? "text-green-700" : isStep1Complete ? "text-green-600" : "text-gray-500"}`}
                  >
                    Items
                  </span>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    {itemHold.length} added
                  </p>
                </div>
              </div>

              {/* Connector */}
              <div className="flex-1 mx-4 mb-6">
                <div className="h-1 rounded-full bg-gray-200 relative overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isStep2Complete ? "bg-green-300 w-full" : "w-0"
                    }`}
                  />
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col items-center gap-2">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                    isStep2Complete && isStep1Complete
                      ? "bg-white text-green-600 border-2 border-green-300"
                      : "bg-gray-100 text-gray-400 border-2 border-gray-200"
                  }`}
                >
                  <FiClipboard size={18} />
                </div>
                <div className="text-center">
                  <span
                    className={`text-xs font-semibold ${isStep2Complete && isStep1Complete ? "text-green-600" : "text-gray-500"}`}
                  >
                    Submit
                  </span>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    Review & save
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Supplier Details Card */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Card Header */}
            <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-green-50 to-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-300 rounded-xl flex items-center justify-center shadow-md shadow-green-300/30">
                    <FiTruck className="text-black" size={20} />
                  </div>
                  <div>
                    <h2 className="font-bold text-black text-base">
                      Supplier Information
                    </h2>
                    <p className="text-gray-500 text-xs mt-0.5">
                      Fill in delivery and supplier details
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 font-medium">
                    Required fields marked with
                  </span>
                  <span className="text-red-500 text-xs font-bold">*</span>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Row 1: Supplier + Date */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <FiUser className="text-gray-400" size={14} />
                    Supplier
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      name="supplierName"
                      onChange={handleChange}
                      value={formData.supplierName}
                      className={`w-full px-4 py-3.5 border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-300/50 focus:border-green-300 appearance-none transition-all duration-200 cursor-pointer ${
                        formData.supplierName
                          ? "border-green-300 bg-green-50/50 text-black"
                          : "border-gray-300 bg-white text-gray-500"
                      }`}
                    >
                      <option value="" disabled>
                        Select a supplier...
                      </option>
                      {supplier.map((s) => (
                        <option key={s._id} value={s._id}>
                          {s.supplierName}
                        </option>
                      ))}
                    </select>
                    <FiChevronDown
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                      size={18}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <FiCalendar className="text-gray-400" size={14} />
                    Receiving Date
                    <span className="text-red-500">*</span>
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
                          sx: {
                            "& .MuiOutlinedInput-root": {
                              borderRadius: "0.75rem",
                              height: "50px",
                              fontSize: "14px",
                              backgroundColor: "#fafafa",
                              transition: "all 0.2s",
                              "& fieldset": { borderColor: "#d1d5db" },
                              "&:hover fieldset": { borderColor: "#9ca3af" },
                              "&.Mui-focused fieldset": {
                                borderColor: "#86efac",
                                borderWidth: "2px",
                              },
                            },
                          },
                        },
                      }}
                    />
                  </LocalizationProvider>
                </div>
              </div>

              {/* Row 2: Invoice + LPO */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <FiFileText className="text-gray-400" size={14} />
                    Invoice Number
                  </label>
                  <input
                    type="text"
                    name="invoiceNumber"
                    value={formData.invoiceNumber}
                    onChange={handleChange}
                    className="w-full px-4 py-3.5 border border-gray-300 rounded-xl text-sm font-medium text-black placeholder:text-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-green-300/50 focus:border-green-300 transition-all duration-200"
                    placeholder="e.g. INV-2024-001"
                  />
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <FiHash className="text-gray-400" size={14} />
                    LPO Number
                  </label>
                  <input
                    type="text"
                    name="lpoNumber"
                    value={formData.lpoNumber}
                    onChange={handleChange}
                    className="w-full px-4 py-3.5 border border-gray-300 rounded-xl text-sm font-medium text-black placeholder:text-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-green-300/50 focus:border-green-300 transition-all duration-200"
                    placeholder="e.g. LPO-2024-001"
                  />
                </div>
              </div>

              {/* Row 3: Delivery Person + Note */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <FiUser className="text-gray-400" size={14} />
                    Delivery Person
                  </label>
                  <input
                    type="text"
                    name="deliveryPerson"
                    value={formData.deliveryPerson}
                    onChange={handleChange}
                    className="w-full px-4 py-3.5 border border-gray-300 rounded-xl text-sm font-medium text-black placeholder:text-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-green-300/50 focus:border-green-300 transition-all duration-200"
                    placeholder="e.g. John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <FiFileText className="text-gray-400" size={14} />
                    Delivery Note No.
                  </label>
                  <input
                    type="text"
                    name="deliveryNumber"
                    value={formData.deliveryNumber}
                    onChange={handleChange}
                    className="w-full px-4 py-3.5 border border-gray-300 rounded-xl text-sm font-medium text-black placeholder:text-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-green-300/50 focus:border-green-300 transition-all duration-200"
                    placeholder="e.g. DN-2024-001"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <FiClipboard className="text-gray-400" size={14} />
                  Description / Notes
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-3.5 border border-gray-300 rounded-xl text-sm font-medium text-black placeholder:text-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-green-300/50 focus:border-green-300 transition-all duration-200 resize-none"
                  placeholder="Additional notes about this delivery..."
                />
              </div>
            </div>

            {/* Form Footer */}
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/80 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2.5 h-2.5 rounded-full transition-colors ${
                      formData.supplierName ? "bg-green-400" : "bg-gray-300"
                    }`}
                  />
                  <span className="text-xs text-gray-500 font-medium">
                    Supplier
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2.5 h-2.5 rounded-full transition-colors ${
                      formData.receivingDate ? "bg-green-400" : "bg-gray-300"
                    }`}
                  />
                  <span className="text-xs text-gray-500 font-medium">
                    Date
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2.5 h-2.5 rounded-full transition-colors ${
                      formData.invoiceNumber ? "bg-green-400" : "bg-gray-300"
                    }`}
                  />
                  <span className="text-xs text-gray-500 font-medium">
                    Invoice
                  </span>
                </div>
              </div>
              <button
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
                className="text-xs font-semibold text-gray-500 px-4 py-2 rounded-lg hover:bg-white hover:text-gray-700 hover:shadow-sm transition-all duration-200 border border-transparent hover:border-gray-200"
              >
                Reset Form
              </button>
            </div>
          </div>

          {/* Add Items Toggle */}
          <button
            onClick={() => setShowSection2(!showSection2)}
            className={`w-full py-4 rounded-2xl flex items-center justify-center gap-3 font-bold text-sm transition-all duration-300 shadow-md ${
              showSection2
                ? "bg-green-600 text-white hover:bg-gray-300 shadow-gray-300/20 hover:text-black"
                : "bg-green-300 text-black hover:bg-green-400 shadow-green-300/30 hover:shadow-green-300/40"
            }`}
          >
            {showSection2 ? (
              <>
                <FiX size={18} />
                Close Add Items
              </>
            ) : (
              <>
                <FiPlus size={18} />
                Add Items to GRN
              </>
            )}
            <span
              className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                showSection2
                  ? "bg-gray-700 text-gray-300"
                  : "bg-black/10 text-black"
              }`}
            >
              {itemHold.length} items
            </span>
          </button>

          {/* Section 2 */}
          {showSection2 && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden animate-in slide-in-from-top-2 duration-300">
              <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-300 rounded-lg flex items-center justify-center shadow-sm shadow-green-300/30">
                    <FiShoppingCart className="text-black" size={16} />
                  </div>
                  <div>
                    <h3 className="font-bold text-black text-sm">
                      Add New Item
                    </h3>
                    <p className="text-gray-500 text-xs">
                      Fill item details and pricing
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <Section2 onAddItem={handleAddItem} />
              </div>
            </div>
          )}

          {/* Items Summary Banner */}
          {itemHold.length > 0 && (
            <div
              className={`rounded-2xl p-5 flex items-center justify-between cursor-pointer transition-all duration-300 shadow-sm ${
                showItems
                  ? "bg-green-50 border border-green-200 hover:bg-green-100/80"
                  : "bg-white border border-gray-200 hover:bg-gray-50"
              }`}
              onClick={() => setShowItems(!showItems)}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    showItems
                      ? "bg-green-300 text-black shadow-md shadow-green-300/30"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  <FiPackage size={22} />
                </div>
                <div>
                  <p className="text-base font-bold text-black">
                    {itemHold.length} {itemHold.length === 1 ? "item" : "items"}{" "}
                    added
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <FiDollarSign className="text-green-600" size={14} />
                    <p className="text-sm font-semibold text-green-700">
                      Total: Tsh {formatPrice(totalCost)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setItemHold([]);
                    toast.success("All items cleared");
                  }}
                  className="text-sm font-semibold text-red-600 px-4 py-2.5 rounded-xl hover:bg-red-50 transition-all duration-200 border border-transparent hover:border-red-200"
                >
                  Clear All
                </button>
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ${
                    showItems
                      ? "bg-green-200 text-green-700 rotate-180"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {showItems ? (
                    <FiChevronUp size={18} />
                  ) : (
                    <FiChevronDown size={18} />
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Items Table */}
          {itemHold.length > 0 && showItems && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden animate-in fade-in duration-300">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gray-100 border-b border-gray-200">
                      {[
                        { label: "#", width: "w-14" },
                        { label: "Product", width: "min-w-[180px]" },
                        { label: "Qty", width: "w-20" },
                        { label: "Buy Price", width: "w-28" },
                        { label: "Total", width: "w-28" },
                        { label: "Sell Price", width: "w-28" },
                        { label: "Mfg Date", width: "w-28" },
                        { label: "Exp Date", width: "w-28" },
                        { label: "", width: "w-14" },
                      ].map((h) => (
                        <th
                          key={h.label}
                          className={`px-4 py-3.5 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider ${h.width}`}
                        >
                          {h.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {itemHold.map((item, index) => (
                      <tr
                        key={index}
                        className="group hover:bg-gray-50/80 transition-colors duration-200"
                      >
                        <td className="px-4 py-4">
                          <span className="w-8 h-8 bg-green-300 text-black rounded-lg flex items-center justify-center text-xs font-bold shadow-sm shadow-green-300/20">
                            {index + 1}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="font-semibold text-sm text-black">
                            {item.name}
                          </div>
                          {item.batchNumber && (
                            <div className="text-[11px] text-gray-400 mt-0.5">
                              Batch: {item.batchNumber}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-gray-100 text-gray-700 text-xs font-semibold border border-gray-200">
                            {formatPrice(item.quantity)}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-600 font-medium">
                          Tsh {formatPrice(item.buyingPrice)}
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-sm font-bold text-green-700">
                            Tsh {formatPrice(item.totalCost)}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-600 font-medium">
                          Tsh {formatPrice(item.sellingPrice)}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-500">
                          {item.manufactureDate || (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-500">
                          {item.expiryDate || (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <button
                            onClick={() => removeItem(item)}
                            className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-all duration-200 opacity-0 group-hover:opacity-100"
                          >
                            <MdDeleteForever size={20} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Table Footer */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                <span className="text-xs text-gray-500 font-medium">
                  Showing {itemHold.length}{" "}
                  {itemHold.length === 1 ? "item" : "items"}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Grand Total:</span>
                  <span className="text-sm font-bold text-green-700">
                    Tsh {formatPrice(totalCost)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Error Alert */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3 animate-in slide-in-from-bottom-2 duration-300">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <FiAlertCircle className="text-red-500" size={18} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-800">{error}</p>
                <p className="text-xs text-red-600 mt-0.5">
                  Please fix the issues above and try again.
                </p>
              </div>
              <button
                onClick={() => setError("")}
                className="p-1.5 rounded-lg hover:bg-red-100 text-red-400 hover:text-red-600 transition-colors"
              >
                <FiX size={16} />
              </button>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 pb-8">
            <button
              onClick={handleCancel}
              className="px-8 py-4 border border-gray-300 text-gray-600 font-semibold rounded-xl hover:bg-white hover:border-gray-400 hover:text-gray-800 transition-all duration-200 text-sm shadow-sm hover:shadow"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || itemHold.length === 0}
              className="flex-1 px-8 py-4 bg-green-300 text-black font-bold rounded-xl hover:bg-green-400 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-green-300 transition-all duration-200 text-sm shadow-md shadow-green-300/30 hover:shadow-green-300/40 flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <FiCheckCircle size={20} />
                  Submit GRN
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default NonPoGrn;
