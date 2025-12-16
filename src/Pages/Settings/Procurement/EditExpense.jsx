import { useState, useEffect } from "react";
import axios from "axios";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { FiEdit2, FiUser, FiDollarSign } from "react-icons/fi";
import { IoMdCheckmark, IoMdClose } from "react-icons/io";
import BASE_URL from "../../../Utils/config";
import toast from "react-hot-toast";

const EditExpense = ({
  expense, // The expense object to edit
  onClose, // Function to close the modal
  onSuccess, // Callback after successful update (to refresh parent)
}) => {
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    details: "",
    date: null,
  });

  const [originalData, setOriginalData] = useState({
    title: "",
    amount: "",
    details: "",
    date: null,
  });

  const [saving, setSaving] = useState(false);

  // Initialize form data when expense prop changes
  useEffect(() => {
    if (expense) {
      setFormData({
        title: expense.title || "",
        amount: expense.amount?.toString() || "",
        details: expense.details || "",
        date: expense.date ? dayjs(expense.date) : null,
      });

      setOriginalData({
        title: expense.title || "",
        amount: expense.amount?.toString() || "",
        details: expense.details || "",
        date: expense.date ? dayjs(expense.date) : null,
      });
    }
  }, [expense]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle date change
  const handleDateChange = (date) => {
    setFormData((prev) => ({
      ...prev,
      date: date,
    }));
  };

  // Check if form has changes
  const hasChanges = () => {
    if (!expense) return false;

    return (
      formData.title !== originalData.title ||
      formData.amount !== originalData.amount ||
      formData.details !== originalData.details ||
      !dayjs(formData.date).isSame(originalData.date, "day")
    );
  };

  // Update expense function
  const updateExpense = async () => {
    if (!expense || !expense._id) {
      toast.error("No expense selected for editing");
      return;
    }

    if (!formData.title || !formData.amount || !formData.date) {
      toast.error("Please fill all required fields");
      return;
    }

    if (!hasChanges()) {
      toast("No changes made to expense", { icon: "ℹ️" });
      return;
    }

    try {
      setSaving(true);

      const updatedData = {
        title: formData.title,
        amount: Number(formData.amount),
        details: formData.details || "",
        date: formData.date,
      };

      await axios.put(
        `${BASE_URL}/api/manunuzi/updateMatumizi/${expense._id}`,
        updatedData,
        { withCredentials: true }
      );

      toast.success("Expense updated successfully!");

      // Call the success callback to refresh parent data
      if (onSuccess) {
        onSuccess();
      }

      // Close the modal
      onClose();
    } catch (error) {
      console.log("Error updating expense:", error);
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to update expense";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  // Reset form to original data
  const resetForm = () => {
    setFormData(originalData);
    toast.success("Form reset to original values");
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount) return "Tsh 0";
    return `Tsh ${Number(amount).toLocaleString()}`;
  };

  if (!expense) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
          <div className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
              <FiDollarSign className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              No Expense Selected
            </h3>
            <p className="text-gray-600 mb-6">
              Please select an expense to edit.
            </p>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="bg-green-300 px-8 py-6 border-b border-green-200 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-green-800 flex items-center gap-2">
                <span className="p-2 bg-green-100 rounded-lg">
                  <FiEdit2 className="w-5 h-5 text-green-700" />
                </span>
                Edit Expense
              </h2>
              <p className="text-green-700 mt-1">
                Update expense information below
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-green-800 hover:text-green-900 text-2xl font-bold"
            >
              ×
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Left Column - Form */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-transparent transition duration-200 text-black"
                  placeholder="Enter expense title"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Details
                </label>
                <textarea
                  name="details"
                  value={formData.details}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-transparent transition duration-200 resize-none text-black"
                  placeholder="Additional details (optional)"
                  rows="4"
                />
              </div>

              {/* Change Preview */}
              {hasChanges() && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-blue-800 mb-2">
                    Changes Preview
                  </h4>
                  <div className="space-y-2 text-sm">
                    {formData.title !== originalData.title && (
                      <p className="text-blue-700">
                        <span className="font-medium">Title:</span>{" "}
                        {originalData.title} → {formData.title}
                      </p>
                    )}
                    {formData.amount !== originalData.amount && (
                      <p className="text-blue-700">
                        <span className="font-medium">Amount:</span>{" "}
                        {formatCurrency(originalData.amount)} →{" "}
                        {formatCurrency(formData.amount)}
                      </p>
                    )}
                    {!dayjs(formData.date).isSame(originalData.date, "day") && (
                      <p className="text-blue-700">
                        <span className="font-medium">Date:</span>{" "}
                        {dayjs(originalData.date).format("DD/MM/YYYY")} →{" "}
                        {dayjs(formData.date).format("DD/MM/YYYY")}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Amount <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                    Tsh
                  </span>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    className="w-full pl-14 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-transparent transition duration-200 text-black"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Date <span className="text-red-500">*</span>
                </label>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    value={formData.date}
                    onChange={handleDateChange}
                    maxDate={dayjs()}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        sx: {
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "12px",
                            fontSize: "14px",
                          },
                        },
                      },
                    }}
                  />
                </LocalizationProvider>
              </div>

              {/* Current Data Preview */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Current Data
                </h4>
                <div className="space-y-2">
                  <p className="text-xs text-gray-600">
                    <span className="font-medium">Original Amount:</span>{" "}
                    {formatCurrency(originalData.amount)}
                  </p>
                  <p className="text-xs text-gray-600">
                    <span className="font-medium">Original Date:</span>{" "}
                    {dayjs(originalData.date).format("DD/MM/YYYY")}
                  </p>
                </div>
              </div>

              {/* Additional Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Additional Information
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <FiUser className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Created By</p>
                      <p className="text-sm font-medium text-gray-800">
                        {expense.createdBy
                          ? `${expense.createdBy.firstName} ${expense.createdBy.lastName}`
                          : "Unknown"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <FiDollarSign className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Original Amount</p>
                      <p className="text-sm font-medium text-gray-800">
                        {formatCurrency(originalData.amount)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-gray-50 px-8 py-6 border-t border-gray-200 rounded-b-2xl">
          <div className="flex justify-between items-center">
            <div className="text-gray-600 text-sm">
              <span className="font-medium">Note:</span> Changes will be applied
              immediately
              {hasChanges() && (
                <span className="ml-2 inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
                  Unsaved changes
                </span>
              )}
            </div>
            <div className="flex space-x-4">
              <button
                onClick={onClose}
                className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition duration-200"
                disabled={saving}
              >
                Cancel
              </button>

              {hasChanges() && (
                <button
                  onClick={resetForm}
                  disabled={saving}
                  className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition duration-200 flex items-center gap-2"
                >
                  <IoMdClose className="w-4 h-4" />
                  Reset
                </button>
              )}

              <button
                onClick={updateExpense}
                disabled={saving || !hasChanges()}
                className="px-6 py-3 bg-green-300 text-green-800 font-medium rounded-lg hover:bg-green-400 transition duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-green-800 border-t-transparent rounded-full animate-spin"></div>
                    Updating...
                  </>
                ) : (
                  <>
                    <IoMdCheckmark className="w-4 h-4" />
                    Update Expense
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditExpense;
