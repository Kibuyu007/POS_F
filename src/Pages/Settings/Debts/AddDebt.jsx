import { useState } from "react";
import axios from "axios";
import BASE_URL from "../../../Utils/config";
import toast from "react-hot-toast";
import { FiUser, FiPhone, FiCheck, FiX, FiCreditCard } from "react-icons/fi";

const AddDebt = ({ close }) => {
  const [formData, setFormData] = useState({
    customerName: "",
    phone: "",
    totalAmount: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

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

      toast.success("Debt record created successfully!");
      setTimeout(() => {
        close();
      }, 1500);
    } catch (err) {
      console.error("Error adding debt:", err);
      toast.error(err.response?.data?.message || "Failed to add debt. Please try again.");
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
    <>
      <div className="flex justify-center items-center overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none bg-gray-900 bg-opacity-20">
        <div className="w-full md:w-2/3 lg:w-1/2">
          <div className="border border-gray-300 rounded-2xl shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
            {/* Header - Clean and simple */}
            <div className="flex items-start justify-between p-5 bg-green-400 border-b border-gray-400 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center">
                  <FiCreditCard className="w-5 h-5 text-black" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-black">+ Add New Debt</h3>
                  <p className="text-black/70 text-sm mt-1">Enter customer details and debt amount</p>
                </div>
              </div>
              <button
                onClick={close}
                className="p-2 hover:bg-black/5 rounded-full transition-colors"
              >
                <FiX className="w-5 h-5 text-black" />
              </button>
            </div>

            {/* Main Form Content */}
            <div className="relative p-6 flex-auto">
              <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                {/* Customer Name - Full width */}
                <div className="col-span-2">
                  <div className="mb-2">
                    <label className="block text-sm font-bold text-gray-900">
                      Customer Name
                    </label>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-3 flex items-center">
                      <FiUser className="w-4 h-4 text-gray-500" />
                    </div>
                    <input
                      type="text"
                      name="customerName"
                      value={formData.customerName}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-3 border ${
                        errors.customerName
                          ? "border-red-300"
                          : "border-gray-300"
                      } rounded-full bg-white text-black focus:outline-none focus:border-green-300`}
                      placeholder="Enter customer's full name"
                      disabled={loading}
                      autoFocus
                    />
                  </div>
                  {errors.customerName && (
                    <div className="mt-2 text-sm text-red-600">
                      {errors.customerName}
                    </div>
                  )}
                </div>

                {/* Phone Number */}
                <div>
                  <div className="mb-2">
                    <label className="block text-sm font-bold text-gray-900">
                      Phone Number
                    </label>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-3 flex items-center">
                      <FiPhone className="w-4 h-4 text-gray-500" />
                    </div>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-3 border ${
                        errors.phone
                          ? "border-red-300"
                          : "border-gray-300"
                      } rounded-full bg-white text-black focus:outline-none focus:border-green-300`}
                      placeholder="0712 345 678"
                      disabled={loading}
                    />
                  </div>
                  {errors.phone && (
                    <div className="mt-2 text-sm text-red-600">
                      {errors.phone}
                    </div>
                  )}
                </div>

                {/* Total Amount */}
                <div>
                  <div className="mb-2">
                    <label className="block text-sm font-bold text-gray-900">
                      Total Amount
                    </label>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      name="totalAmount"
                      value={formData.totalAmount}
                      onChange={handleChange}
                      min="100"
                      step="100"
                      className={`w-full px-4 py-3 border ${
                        errors.totalAmount
                          ? "border-red-300"
                          : "border-gray-300"
                      } rounded-full bg-white text-black focus:outline-none focus:border-green-300`}
                      placeholder="0.00"
                      disabled={loading}
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-700 font-bold text-sm">
                      Tsh
                    </div>
                  </div>
                  {errors.totalAmount && (
                    <div className="mt-2 text-sm text-red-600">
                      {errors.totalAmount}
                    </div>
                  )}
                </div>

                {/* Quick Amount Buttons - Full width */}
                <div className="col-span-2">
                  <p className="text-sm font-medium text-gray-700 mb-2">Quick Amount (Tsh)</p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          totalAmount: "10000",
                        }))
                      }
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-black font-medium rounded-full transition-colors text-sm"
                      disabled={loading}
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
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-black font-medium rounded-full transition-colors text-sm"
                      disabled={loading}
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
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-black font-medium rounded-full transition-colors text-sm"
                      disabled={loading}
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
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-black font-medium rounded-full transition-colors text-sm"
                      disabled={loading}
                    >
                      500,000
                    </button>
                  </div>
                </div>

                {/* Validation Summary - Clean and simple */}
                <div className="col-span-2 bg-gray-100 rounded-xl p-4 border border-gray-300">
                  <p className="text-sm font-bold text-black mb-3">Validation Status</p>
                  <div className="space-y-2">
                    <div className={`flex items-center gap-3 ${formData.customerName ? "text-green-700" : "text-gray-600"}`}>
                      <div className={`w-3 h-3 rounded-full ${formData.customerName ? "bg-green-300" : "bg-gray-400"}`} />
                      <span className="text-sm">Customer name {formData.customerName ? "✓" : "(required)"}</span>
                    </div>
                    <div className={`flex items-center gap-3 ${formData.phone ? "text-green-700" : "text-gray-600"}`}>
                      <div className={`w-3 h-3 rounded-full ${formData.phone ? "bg-green-300" : "bg-gray-400"}`} />
                      <span className="text-sm">Phone number {formData.phone ? "✓" : "(required)"}</span>
                    </div>
                    <div className={`flex items-center gap-3 ${formData.totalAmount ? "text-green-700" : "text-gray-600"}`}>
                      <div className={`w-3 h-3 rounded-full ${formData.totalAmount ? "bg-green-300" : "bg-gray-400"}`} />
                      <span className="text-sm">Total amount {formData.totalAmount ? "✓" : "(required)"}</span>
                    </div>
                  </div>
                </div>

                {/* Submit Button - Full width */}
                <div className="col-span-2">
                  <button
                    type="submit"
                    disabled={
                      loading ||
                      !formData.customerName ||
                      !formData.phone ||
                      !formData.totalAmount
                    }
                    className={`w-full py-3 font-bold rounded-full flex items-center justify-center gap-2 ${
                      loading ||
                      !formData.customerName ||
                      !formData.phone ||
                      !formData.totalAmount
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
                        <span>Create Debt Record</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Footer - Simple */}
            <div className="flex items-center justify-between p-5 border-t border-gray-300">
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-black font-bold rounded-full transition-colors text-sm"
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
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-black font-bold rounded-full transition-colors text-sm"
                onClick={close}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddDebt;