import { useState } from "react";
import axios from "axios";
import BASE_URL from "../../../Utils/config";
import toast from "react-hot-toast";
import {
  User,
  Phone,
  DollarSign,
  CreditCard,
  X,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

const AddDebt = ({ close }) => {
  const [formData, setFormData] = useState({
    customerName: "",
    phone: "",
    totalAmount: "",
    debtStatus: "Asset",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const debtStatusOptions = [
    {
      value: "Asset",
      label: "Asset",
      color: "bg-red-100 text-red-700 border-red-200",
    },
    {
      value: "Liability",
      label: "Liability",
      color: "bg-yellow-100 text-yellow-700 border-yellow-200",
    },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.customerName.trim()) {
      newErrors.customerName = "Customer name is required";
    } else if (formData.customerName.trim().length < 2) {
      newErrors.customerName = "Name must be at least 2 characters";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else {
      const phoneDigits = formData.phone.replace(/[\s\-()]/g, "");
      if (!/^[0-9+]{10,15}$/.test(phoneDigits)) {
        newErrors.phone = "Enter a valid phone number (10-15 digits)";
      }
    }

    if (!formData.totalAmount) {
      newErrors.totalAmount = "Amount is required";
    } else if (parseFloat(formData.totalAmount) <= 0) {
      newErrors.totalAmount = "Amount must be greater than 0";
    } else if (parseFloat(formData.totalAmount) > 1000000000) {
      newErrors.totalAmount = "Amount cannot exceed 1,000,000,000";
    } else if (parseFloat(formData.totalAmount) < 100) {
      newErrors.totalAmount = "Minimum amount is 100 Tsh";
    }

    if (!formData.debtStatus) {
      newErrors.debtStatus = "Debt status is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      await axios.post(`${BASE_URL}/api/debts/addDebt`, {
        customerName: formData.customerName.trim(),
        phone: formData.phone.trim(),
        totalAmount: parseFloat(formData.totalAmount),
        debtStatus: formData.debtStatus,
      });

      toast.success("✅ Debt record created successfully!");
      setTimeout(() => {
        close();
      }, 1500);
    } catch (err) {
      console.error("Error adding debt:", err);
      toast.error(
        err.response?.data?.message || "Failed to add debt. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      customerName: "",
      phone: "",
      totalAmount: "",
      debtStatus: "Asset",
    });
    setErrors({});
  };

  const handleStatusSelect = (status) => {
    setFormData((prev) => ({
      ...prev,
      debtStatus: status,
    }));
    if (errors.debtStatus) {
      setErrors((prev) => ({
        ...prev,
        debtStatus: "",
      }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header - Matching Debts page style */}
        <div className="sticky top-0 z-10 bg-white px-6 sm:px-8 py-5 border-b-2 border-gray-200 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-xl shadow-lg shadow-emerald-200">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  Add New Debt
                </h2>
                <p className="text-sm text-gray-500">
                  Enter customer details and debt information
                </p>
              </div>
            </div>
            <button
              onClick={close}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Customer Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Customer Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-2.5 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-transparent transition-all duration-200 text-black bg-white text-sm ${
                    errors.customerName
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300"
                  }`}
                  placeholder="Enter customer's full name"
                  disabled={loading}
                  autoFocus
                />
              </div>
              {errors.customerName && (
                <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.customerName}
                </p>
              )}
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-2.5 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-transparent transition-all duration-200 text-black bg-white text-sm ${
                    errors.phone
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300"
                  }`}
                  placeholder="0712 345 678"
                  disabled={loading}
                />
              </div>
              {errors.phone && (
                <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.phone}
                </p>
              )}
            </div>

            {/* Total Amount */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Total Amount <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="number"
                  name="totalAmount"
                  value={formData.totalAmount}
                  onChange={handleChange}
                  min="100"
                  step="100"
                  className={`w-full pl-10 pr-16 py-2.5 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-transparent transition-all duration-200 text-black bg-white text-sm ${
                    errors.totalAmount
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300"
                  }`}
                  placeholder="Enter amount"
                  disabled={loading}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-500">
                  TSh
                </span>
              </div>
              {errors.totalAmount && (
                <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.totalAmount}
                </p>
              )}
            </div>

            {/* Quick Amount Buttons */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">
                Quick Amount (TSh)
              </p>
              <div className="flex flex-wrap gap-2">
                {[10000, 50000, 100000, 500000].map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        totalAmount: amount.toString(),
                      }))
                    }
                    className="px-4 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-full text-xs transition-all duration-200 border-2 border-gray-300 hover:border-gray-400"
                    disabled={loading}
                  >
                    {amount.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            {/* Debt Status */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Debt Status <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  name="debtStatus"
                  value={formData.debtStatus}
                  onChange={handleChange}
                  className={`w-full px-4 py-2.5 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-transparent transition-all duration-200 text-black bg-white text-sm appearance-none ${
                    errors.debtStatus
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300"
                  }`}
                  disabled={loading}
                >
                  {debtStatusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
              {errors.debtStatus && (
                <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.debtStatus}
                </p>
              )}
            </div>

            {/* Quick Status Selection - Clean buttons */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">
                Quick Status Selection
              </p>
              <div className="flex flex-wrap gap-2">
                {debtStatusOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleStatusSelect(option.value)}
                    className={`px-4 py-1.5 font-semibold rounded-full text-xs transition-all duration-200 border-2 ${
                      formData.debtStatus === option.value
                        ? `${option.color} shadow-sm`
                        : "bg-white border-gray-300 text-gray-600 hover:bg-gray-100 hover:border-gray-400"
                    }`}
                    disabled={loading}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Validation Summary - Clean card */}
            <div className="bg-gray-100 rounded-xl p-4 border-2 border-gray-300">
              <p className="text-sm font-semibold text-gray-700 mb-3">
                Validation Status
              </p>
              <div className="space-y-2">
                <div
                  className={`flex items-center gap-2 ${formData.customerName ? "text-emerald-700" : "text-gray-500"}`}
                >
                  <div
                    className={`w-2.5 h-2.5 rounded-full ${formData.customerName ? "bg-emerald-400" : "bg-gray-400"}`}
                  />
                  <span className="text-sm">
                    Customer name {formData.customerName ? "✓" : "(required)"}
                  </span>
                </div>
                <div
                  className={`flex items-center gap-2 ${formData.phone ? "text-emerald-700" : "text-gray-500"}`}
                >
                  <div
                    className={`w-2.5 h-2.5 rounded-full ${formData.phone ? "bg-emerald-400" : "bg-gray-400"}`}
                  />
                  <span className="text-sm">
                    Phone number {formData.phone ? "✓" : "(required)"}
                  </span>
                </div>
                <div
                  className={`flex items-center gap-2 ${formData.totalAmount ? "text-emerald-700" : "text-gray-500"}`}
                >
                  <div
                    className={`w-2.5 h-2.5 rounded-full ${formData.totalAmount ? "bg-emerald-400" : "bg-gray-400"}`}
                  />
                  <span className="text-sm">
                    Total amount {formData.totalAmount ? "✓" : "(required)"}
                  </span>
                </div>
                <div
                  className={`flex items-center gap-2 ${formData.debtStatus ? "text-emerald-700" : "text-gray-500"}`}
                >
                  <div
                    className={`w-2.5 h-2.5 rounded-full ${formData.debtStatus ? "bg-emerald-400" : "bg-gray-400"}`}
                  />
                  <span className="text-sm">
                    Debt status:{" "}
                    <span
                      className={`px-2 py-0.5 ml-1 rounded-full text-[10px] font-semibold border-2 ${
                        formData.debtStatus === "Asset"
                          ? "bg-red-100 text-red-700 border-red-200"
                          : formData.debtStatus === "Liability"
                            ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                            : "bg-gray-100 text-gray-500 border-gray-200"
                      }`}
                    >
                      {formData.debtStatus || "(required)"}
                    </span>
                  </span>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={
                loading ||
                !formData.customerName ||
                !formData.phone ||
                !formData.totalAmount ||
                !formData.debtStatus
              }
              className={`w-full py-3 font-semibold rounded-xl flex items-center justify-center gap-2 text-sm transition-all duration-300 border-2 ${
                loading ||
                !formData.customerName ||
                !formData.phone ||
                !formData.totalAmount ||
                !formData.debtStatus
                  ? "bg-gray-200 border-gray-300 text-gray-400 cursor-not-allowed"
                  : "bg-emerald-500 hover:bg-emerald-600 border-emerald-400 text-white shadow-md hover:shadow-lg hover:shadow-emerald-200 hover:scale-[1.02] active:scale-95"
              }`}
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
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
                  <CheckCircle className="w-4 h-4" />
                  <span>Create Debt Record</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 sm:px-8 py-4 border-t-2 border-gray-200">
          <button
            type="button"
            onClick={handleReset}
            className="px-5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-xl transition-all duration-200 text-sm border-2 border-gray-300 hover:border-gray-400"
            disabled={
              loading ||
              (!formData.customerName &&
                !formData.phone &&
                !formData.totalAmount)
            }
          >
            Reset
          </button>
          <button
            type="button"
            onClick={close}
            className="px-5 py-2 bg-white border-2 border-gray-300 text-gray-600 font-semibold rounded-xl hover:bg-gray-100 hover:border-gray-400 transition-all duration-200 text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddDebt;
