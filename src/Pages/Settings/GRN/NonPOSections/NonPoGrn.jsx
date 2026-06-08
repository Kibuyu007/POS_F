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
} from "react-icons/fi";
import { RiBillLine } from "react-icons/ri";
import { FiPackage } from "react-icons/fi";

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

  // Small screen warning component
  const SmallScreenWarning = () => (
    <div className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center p-6 text-center">
      <div className="mb-8 relative">
        <div className="w-32 h-32 bg-green-400/20 rounded-full flex items-center justify-center animate-pulse">
          <div className="w-24 h-24 bg-green-400/30 rounded-full flex items-center justify-center">
            <FiMonitor className="text-green-400 w-12 h-12" />
          </div>
        </div>
        <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
          <FiSmartphone className="text-white w-5 h-5" />
        </div>
      </div>

      <h1 className="text-2xl font-bold text-white mb-3">Screen Too Small</h1>
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
        onClick={() => (window.location.href = "/home")}
        className="mt-8 px-6 py-3 bg-green-400 hover:bg-green-500 text-black font-bold rounded-full transition-colors text-sm"
      >
        Go to Dashboard
      </button>
    </div>
  );

  return (
    <>
      {/* Small screen warning - shows on screens less than 768px */}
      <div className="md:hidden">
        <SmallScreenWarning />
      </div>

      {/* Main content - only visible on md (768px) and above */}
      <div className="hidden md:block p-4 lg:p-6 max-w-7xl mx-auto bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl lg:text-3xl font-bold text-black">
            Create Non-PO GRN
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Goods Received Note - Register supplier deliveries
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                formData.supplierName
                  ? "bg-green-300 text-black"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              {formData.supplierName ? <FiCheckCircle size={18} /> : "1"}
            </div>
            <span className="text-sm font-medium text-gray-700">Details</span>
          </div>
          <div className="w-8 h-0.5 bg-gray-300" />
          <div className="flex items-center gap-2">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                itemHold.length > 0
                  ? "bg-green-300 text-black"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              {itemHold.length > 0 ? <FiCheckCircle size={18} /> : "2"}
            </div>
            <span className="text-sm font-medium text-gray-700">
              Items ({itemHold.length})
            </span>
          </div>
        </div>

        {/* Supplier Details - Beautiful Card Design */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm mb-6 overflow-hidden">
          <div className="p-4 lg:p-5 border-b border-gray-100 bg-gradient-to-r from-green-50 to-gray-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-300 rounded-xl flex items-center justify-center shadow-sm">
                <RiBillLine className="text-black" size={20} />
              </div>
              <div>
                <h2 className="font-bold text-black text-base lg:text-lg">
                  Supplier Information
                </h2>
                <p className="text-gray-500 text-xs">
                  Fill in delivery and supplier details
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 lg:p-5 space-y-5">
            {/* Row 1: Supplier + Date */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Supplier <span className="text-red-500">*</span>
                </label>
                <select
                  name="supplierName"
                  onChange={handleChange}
                  value={formData.supplierName}
                  className={`w-full px-4 py-3 border rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-green-200 appearance-none ${
                    formData.supplierName
                      ? "border-green-300 bg-green-50"
                      : "border-gray-300 bg-white"
                  }`}
                >
                  <option value="" disabled>
                    Select a supplier
                  </option>
                  {supplier.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.supplierName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Receiving Date <span className="text-red-500">*</span>
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
                            fontSize: "16px",
                          },
                        },
                      },
                    }}
                  />
                </LocalizationProvider>
              </div>
            </div>

            {/* Row 2: Invoice + LPO */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Invoice Number
                </label>
                <input
                  type="text"
                  name="invoiceNumber"
                  value={formData.invoiceNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-green-200"
                  placeholder="INV-2024-001"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  LPO Number
                </label>
                <input
                  type="text"
                  name="lpoNumber"
                  value={formData.lpoNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-green-200"
                  placeholder="LPO-2024-001"
                />
              </div>
            </div>

            {/* Row 3: Delivery Person + Note */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Delivery Person
                </label>
                <input
                  type="text"
                  name="deliveryPerson"
                  value={formData.deliveryPerson}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-green-200"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Delivery Note No.
                </label>
                <input
                  type="text"
                  name="deliveryNumber"
                  value={formData.deliveryNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-green-200"
                  placeholder="DN-2024-001"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Description / Notes
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-green-200 resize-none"
                placeholder="Additional notes about this delivery..."
              />
            </div>
          </div>

          {/* Form Footer */}
          <div className="px-4 lg:px-5 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <div
                  className={`w-2.5 h-2.5 rounded-full ${formData.supplierName ? "bg-green-400" : "bg-gray-400"}`}
                />
                <span className="text-xs text-gray-600">Supplier</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div
                  className={`w-2.5 h-2.5 rounded-full ${formData.receivingDate ? "bg-green-400" : "bg-gray-400"}`}
                />
                <span className="text-xs text-gray-600">Date</span>
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
              className="text-xs font-medium text-gray-600 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Clear Form
            </button>
          </div>
        </div>

        {/* Add Items Toggle */}
        <button
          onClick={() => setShowSection2(!showSection2)}
          className="w-full mb-5 py-4 bg-green-300 hover:bg-green-400 text-black font-bold rounded-xl flex items-center justify-center gap-2 transition-colors text-base"
        >
          <FiPlus size={20} />
          {showSection2 ? "Close Add Items" : "Add Items"}
          <span className="bg-black text-white text-xs px-2.5 py-1 rounded-full ml-2">
            {itemHold.length}
          </span>
        </button>

        {/* Section 2 */}
        {showSection2 && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm mb-5 overflow-hidden">
            <div className="p-4 lg:p-5">
              <Section2 onAddItem={handleAddItem} />
            </div>
          </div>
        )}

        {/* Items Summary */}
        {itemHold.length > 0 && (
          <div
            className="bg-green-50 border border-green-200 rounded-xl p-4 mb-5 flex items-center justify-between cursor-pointer hover:bg-green-100 transition-colors"
            onClick={() => setShowItems(!showItems)}
          >
            <div className="flex items-center gap-3">
              <FiPackage className="text-green-600" size={24} />
              <div>
                <p className="text-base font-bold text-black">
                  {itemHold.length} items added
                </p>
                <p className="text-sm text-gray-600">
                  Total cost: Tsh {formatPrice(totalCost)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setItemHold([]);
                }}
                className="text-sm font-medium text-red-600 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors"
              >
                Clear All
              </button>
              {showItems ? (
                <FiChevronUp className="text-gray-500" size={20} />
              ) : (
                <FiChevronDown className="text-gray-500" size={20} />
              )}
            </div>
          </div>
        )}

        {/* Items Table */}
        {itemHold.length > 0 && showItems && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm mb-5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-100">
                    {[
                      "#",
                      "Product",
                      "Qty",
                      "Buy Price",
                      "Total",
                      "Sell Price",
                      "Mfg Date",
                      "Exp Date",
                      "",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {itemHold.map((item, index) => (
                    <tr
                      key={index}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <span className="w-8 h-8 bg-green-300 rounded-full flex items-center justify-center text-xs font-bold text-black">
                          {index + 1}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium text-sm text-black">
                        {item.name}
                      </td>
                      <td className="px-4 py-3 text-sm text-black">
                        {formatPrice(item.quantity)}
                      </td>
                      <td className="px-4 py-3 text-sm text-black">
                        Tsh {formatPrice(item.buyingPrice)}
                      </td>
                      <td className="px-4 py-3 text-sm font-bold text-black">
                        Tsh {formatPrice(item.totalCost)}
                      </td>
                      <td className="px-4 py-3 text-sm text-black">
                        Tsh {formatPrice(item.sellingPrice)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {item.manufactureDate || "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {item.expiryDate || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => removeItem(item)}
                          className="p-2 text-red-500 hover:text-red-700 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          <MdDeleteForever size={20} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
            <FiX className="text-red-500 flex-shrink-0" size={20} />
            <p className="text-sm text-red-700 font-medium">{error}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 pb-6">
          <button
            onClick={handleCancel}
            className="px-6 py-4 border border-gray-300 text-black font-medium rounded-xl hover:bg-gray-100 transition-colors text-base"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || itemHold.length === 0}
            className="flex-1 px-6 py-4 bg-green-300 text-black font-bold rounded-xl hover:bg-green-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-base flex items-center justify-center gap-2"
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
                Saving...
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
    </>
  );
};

export default NonPoGrn;
