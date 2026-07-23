import { useState, useEffect } from "react";
import axios from "axios";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { FiEdit2, FiUser, FiDollarSign } from "react-icons/fi";
import { IoMdCheckmark, IoMdClose } from "react-icons/io";
import BASE_URL from "../../../Utils/config";
import toast from "react-hot-toast";
import {
  X,
  User,
  DollarSign,
  Calendar,
  Edit,
  Save,
  RefreshCw,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

const EditExpense = ({ expense, onClose, onSuccess }) => {
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDateChange = (date) => {
    setFormData((prev) => ({
      ...prev,
      date: date,
    }));
  };

  const hasChanges = () => {
    if (!expense) return false;

    return (
      formData.title !== originalData.title ||
      formData.amount !== originalData.amount ||
      formData.details !== originalData.details ||
      !dayjs(formData.date).isSame(originalData.date, "day")
    );
  };

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
        { withCredentials: true },
      );

      toast.success("Expense updated successfully!");

      if (onSuccess) {
        onSuccess();
      }

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

  const resetForm = () => {
    setFormData(originalData);
    toast.success("Form reset to original values");
  };

  const formatCurrency = (amount) => {
    if (!amount) return "TSh 0";
    return `TSh ${Number(amount).toLocaleString()}`;
  };

  if (!expense) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
          <div className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4 border-2 border-red-200">
              <DollarSign className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              No Expense Selected
            </h3>
            <p className="text-gray-600 mb-6">
              Please select an expense to edit.
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-xl transition-all duration-200 border-2 border-gray-300 hover:border-gray-400"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white px-6 sm:px-8 py-5 border-b-2 border-gray-200 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl shadow-lg shadow-blue-200">
                <Edit className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  Edit Expense
                </h2>
                <p className="text-sm text-gray-500">
                  Update expense information below
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 sm:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 text-sm border-2 border-gray-300 rounded-xl bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-all duration-200"
                  placeholder="Enter expense title"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Details
                </label>
                <textarea
                  name="details"
                  value={formData.details}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 text-sm border-2 border-gray-300 rounded-xl bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-all duration-200 resize-none"
                  placeholder="Additional details (optional)"
                  rows="4"
                />
              </div>

              {/* Changes Preview */}
              {hasChanges() && (
                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                  <h4 className="text-sm font-semibold text-blue-800 mb-3 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Changes Preview
                  </h4>
                  <div className="space-y-2 text-sm">
                    {formData.title !== originalData.title && (
                      <p className="text-blue-700">
                        <span className="font-medium">Title:</span>{" "}
                        <span className="line-through text-gray-500">
                          {originalData.title}
                        </span>{" "}
                        → <span className="font-medium">{formData.title}</span>
                      </p>
                    )}
                    {formData.amount !== originalData.amount && (
                      <p className="text-blue-700">
                        <span className="font-medium">Amount:</span>{" "}
                        <span className="line-through text-gray-500">
                          {formatCurrency(originalData.amount)}
                        </span>{" "}
                        →{" "}
                        <span className="font-medium">
                          {formatCurrency(formData.amount)}
                        </span>
                      </p>
                    )}
                    {!dayjs(formData.date).isSame(originalData.date, "day") && (
                      <p className="text-blue-700">
                        <span className="font-medium">Date:</span>{" "}
                        <span className="line-through text-gray-500">
                          {dayjs(originalData.date).format("DD/MM/YYYY")}
                        </span>{" "}
                        →{" "}
                        <span className="font-medium">
                          {dayjs(formData.date).format("DD/MM/YYYY")}
                        </span>
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column */}
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Amount <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-500">
                    TSh
                  </span>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-3.5 py-2.5 text-sm border-2 border-gray-300 rounded-xl bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-all duration-200"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
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

              {/* Current Data */}
              <div className="bg-gray-100 rounded-xl p-4 border-2 border-gray-300">
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-gray-500" />
                  Current Data
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between py-1 border-b border-gray-200">
                    <span className="text-gray-500">Amount</span>
                    <span className="font-medium text-gray-800">
                      {formatCurrency(originalData.amount)}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-gray-500">Date</span>
                    <span className="font-medium text-gray-800">
                      {dayjs(originalData.date).format("DD/MM/YYYY")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              <div className="bg-gray-100 rounded-xl p-4 border-2 border-gray-300">
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-500" />
                  Additional Information
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between py-1 border-b border-gray-200">
                    <span className="text-gray-500">Created By</span>
                    <span className="font-medium text-gray-800">
                      {expense.createdBy
                        ? `${expense.createdBy.firstName} ${expense.createdBy.lastName}`
                        : "Unknown"}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-gray-500">Original Amount</span>
                    <span className="font-medium text-gray-800">
                      {formatCurrency(originalData.amount)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Unsaved Changes Indicator */}
              {hasChanges() && (
                <div className="flex items-center gap-2 px-3 py-2 bg-yellow-100 border-2 border-yellow-300 rounded-xl text-yellow-800 text-xs font-medium">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
                  Unsaved changes detected
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 sm:px-8 py-4 border-t-2 border-gray-200 rounded-b-2xl bg-gray-50">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-gray-500">
              <span className="font-medium">Note:</span> Changes will be applied
              immediately
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={onClose}
                className="px-5 py-2 bg-white border-2 border-gray-300 text-gray-600 font-semibold rounded-xl hover:bg-gray-100 hover:border-gray-400 transition-all duration-200 text-sm"
                disabled={saving}
              >
                Cancel
              </button>

              {hasChanges() && (
                <button
                  onClick={resetForm}
                  disabled={saving}
                  className="px-5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-xl transition-all duration-200 text-sm border-2 border-gray-300 hover:border-gray-400 flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Reset
                </button>
              )}

              <button
                onClick={updateExpense}
                disabled={saving || !hasChanges()}
                className={`px-6 py-2.5 font-semibold rounded-xl text-sm transition-all duration-300 flex items-center gap-2 border-2 ${
                  saving || !hasChanges()
                    ? "bg-gray-200 border-gray-300 text-gray-400 cursor-not-allowed"
                    : "bg-blue-500 hover:bg-blue-600 border-blue-400 text-white shadow-md hover:shadow-lg hover:shadow-blue-200 hover:scale-[1.02] active:scale-95"
                }`}
              >
                {saving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
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
