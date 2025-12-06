import { useState } from "react";
import axios from "axios";
import BASE_URL from "../../../Utils/config";
import {
  FiUser,
  FiPhone,
  FiX,
  FiCheck,
  FiAlertCircle,
} from "react-icons/fi";

const AddDebt = ({ close }) => {
  const [formData, setFormData] = useState({
    customerName: "",
    phone: "",
    totalAmount: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

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
      });

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        close();
      }, 1500);
    } catch (err) {
      console.error("Error adding debt:", err);
      alert(
        err.response?.data?.message || "Failed to add debt. Please try again."
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
    });
    setErrors({});
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-10 py-7">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-xl"></div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  Create New Debt Record
                </h2>
                <p className="text-green-100">
                  Add a new customer debt to the system
                </p>
              </div>
            </div>
            <button
              onClick={close}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              disabled={loading}
            >
              <FiX className="text-2xl text-white" />
            </button>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="bg-gradient-to-r from-green-100 to-emerald-100 border-b border-green-200">
            <div className="px-10 py-5 flex items-center gap-4">
              <div className="p-3 bg-green-500 rounded-full">
                <FiCheck className="text-2xl text-white" />
              </div>
              <div>
                <p className="font-bold text-green-800 text-lg">
                  Debt Record Created Successfully!
                </p>
                <p className="text-green-600">
                  The debt has been added to the system and will appear in the
                  list.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="p-10">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Customer Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <FiUser className="text-gray-500" />
                    Customer Name
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="customerName"
                      value={formData.customerName}
                      onChange={handleChange}
                      className={`w-full px-4 py-3.5 pl-12 rounded-xl border-2 ${
                        errors.customerName
                          ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                          : "border-gray-200 bg-gray-50 focus:border-green-500 focus:ring-2 focus:ring-green-200"
                      } transition-all duration-200 text-gray-900`}
                      placeholder="Enter customer's full name"
                      disabled={loading || success}
                      autoFocus
                    />
                    <FiUser className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  </div>
                  {errors.customerName && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-red-600">
                      <FiAlertCircle />
                      {errors.customerName}
                    </div>
                  )}
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <FiPhone className="text-gray-500" />
                    Phone Number
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`w-full px-4 py-3.5 pl-12 rounded-xl border-2 ${
                        errors.phone
                          ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                          : "border-gray-200 bg-gray-50 focus:border-green-500 focus:ring-2 focus:ring-green-200"
                      } transition-all duration-200 text-gray-900`}
                      placeholder="e.g., 0712 345 678 or +255712345678"
                      disabled={loading || success}
                    />
                    <FiPhone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  </div>
                  {errors.phone && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-red-600">
                      <FiAlertCircle />
                      {errors.phone}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Total Amount */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    Total Amount (Tsh)
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="totalAmount"
                      value={formData.totalAmount}
                      onChange={handleChange}
                      min="100"
                      step="100"
                      className={`w-full px-4 py-3.5 pl-12 rounded-xl border-2 ${
                        errors.totalAmount
                          ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                          : "border-gray-200 bg-gray-50 focus:border-green-500 focus:ring-2 focus:ring-green-200"
                      } transition-all duration-200 text-gray-900`}
                      placeholder="Enter amount"
                      disabled={loading || success}
                    />

                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-600 font-medium">
                      Tsh
                    </div>
                  </div>
                  {errors.totalAmount && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-red-600">
                      <FiAlertCircle />
                      {errors.totalAmount}
                    </div>
                  )}

                  {/* Quick Amount Buttons */}
                  <div className="flex gap-2 mt-3">
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          totalAmount: "10000",
                        }))
                      }
                      className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                      disabled={loading || success}
                    >
                      10,000
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          totalAmount: "50000",
                        }))
                      }
                      className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                      disabled={loading || success}
                    >
                      50,000
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          totalAmount: "100000",
                        }))
                      }
                      className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                      disabled={loading || success}
                    >
                      100,000
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          totalAmount: "500000",
                        }))
                      }
                      className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                      disabled={loading || success}
                    >
                      500,000
                    </button>
                  </div>
                </div>

                {/* Validation Summary */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Validation Summary
                  </p>
                  <div className="space-y-2">
                    <div
                      className={`flex items-center gap-2 text-sm ${
                        formData.customerName
                          ? "text-green-600"
                          : "text-gray-400"
                      }`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full ${
                          formData.customerName ? "bg-green-500" : "bg-gray-300"
                        }`}
                      />
                      Customer name{" "}
                      {formData.customerName ? "provided" : "required"}
                    </div>
                    <div
                      className={`flex items-center gap-2 text-sm ${
                        formData.phone ? "text-green-600" : "text-gray-400"
                      }`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full ${
                          formData.phone ? "bg-green-500" : "bg-gray-300"
                        }`}
                      />
                      Phone number {formData.phone ? "provided" : "required"}
                    </div>
                    <div
                      className={`flex items-center gap-2 text-sm ${
                        formData.totalAmount
                          ? "text-green-600"
                          : "text-gray-400"
                      }`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full ${
                          formData.totalAmount ? "bg-green-500" : "bg-gray-300"
                        }`}
                      />
                      Amount {formData.totalAmount ? "specified" : "required"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-10 pt-8 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row gap-4 justify-end">
                <button
                  type="button"
                  onClick={close}
                  className="px-6 py-3.5 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-6 py-3.5 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={
                    loading ||
                    success ||
                    (!formData.customerName &&
                      !formData.phone &&
                      !formData.totalAmount)
                  }
                >
                  Reset
                </button>
                <button
                  type="submit"
                  disabled={
                    loading ||
                    success ||
                    !formData.customerName ||
                    !formData.phone ||
                    !formData.totalAmount
                  }
                  className={`px-6 py-3.5 font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-3 min-w-[180px] ${
                    loading ||
                    success ||
                    !formData.customerName ||
                    !formData.phone ||
                    !formData.totalAmount
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5"
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
                  ) : success ? (
                    <>
                      <FiCheck className="text-xl" />
                      <span>Success!</span>
                    </>
                  ) : (
                    <>
                      <span>Create Debt Record</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddDebt;
