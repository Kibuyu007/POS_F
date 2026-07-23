import axios from "axios";
import { addSupplier, supplierFetch } from "../../../Redux/suppliers";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import {
  User,
  Phone,
  MapPin,
  Mail,
  Building,
  X,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import BASE_URL from "../../../Utils/config";
import toast from "react-hot-toast";

const AddSupplier = ({ showModal, setShowModal }) => {
  const { supplier } = useSelector((state) => state.suppliers);
  const dispatch = useDispatch();

  const [showError, setShowError] = useState("");
  const [regi, setRegi] = useState({
    supplierName: "",
    phone: "",
    address: "",
    company: "",
    email: "",
  });

  const [validation, setValidation] = useState({
    supplierName: true,
    phone: true,
    email: true,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    dispatch(supplierFetch(supplier));
  }, [dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRegi({ ...regi, [name]: value });

    if (name === "phone") {
      const phoneVali = /^[0-9]{10}$/;
      setValidation((prev) => ({ ...prev, phone: phoneVali.test(value) }));
    }

    if (name === "email" && value) {
      const emailVali = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      setValidation((prev) => ({ ...prev, email: emailVali.test(value) }));
    }

    if (name === "supplierName") {
      setValidation((prev) => ({
        ...prev,
        supplierName: value.trim().length >= 2,
      }));
    }
  };

  const handleAddItems = async (e) => {
    e.preventDefault();

    if (!regi.supplierName || regi.supplierName.trim().length < 2) {
      setShowError("Supplier name must be at least 2 characters");
      return;
    }

    if (!regi.phone) {
      setShowError("Phone number is required");
      return;
    }

    if (!validation.phone) {
      setShowError("Please enter a valid 10-digit phone number");
      return;
    }

    if (regi.email && !validation.email) {
      setShowError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${BASE_URL}/api/suppliers/addSupplier`,
        regi,
      );
      dispatch(addSupplier(response?.data));
      toast.success("Supplier added successfully!");

      setRegi({
        supplierName: "",
        phone: "",
        address: "",
        email: "",
        company: "",
      });
      setShowError("");
      setTimeout(() => {
        setShowModal(false);
      }, 1500);
    } catch (error) {
      if (error.response && error.response.data) {
        setShowError(
          error.response.data.error ||
            "Failed to add supplier. Please try again.",
        );
      } else {
        setShowError("An error occurred. Please Contact System Administrator.");
      }
      console.error("Add supplier failed", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setRegi({
      supplierName: "",
      phone: "",
      address: "",
      email: "",
      company: "",
    });
    setShowError("");
    setValidation({
      supplierName: true,
      phone: true,
      email: true,
    });
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white px-6 sm:px-8 py-5 border-b-2 border-gray-200 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-xl shadow-lg shadow-emerald-200">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  Add Supplier
                </h2>
                <p className="text-sm text-gray-500">Enter supplier details</p>
              </div>
            </div>
            <button
              onClick={() => setShowModal(false)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6 sm:p-8">
          <form onSubmit={handleAddItems} className="space-y-5">
            {/* Supplier Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Supplier Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  name="supplierName"
                  value={regi.supplierName}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-2.5 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-transparent transition-all duration-200 text-black bg-white text-sm ${
                    !validation.supplierName && regi.supplierName
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300"
                  }`}
                  placeholder="Enter supplier name"
                  disabled={loading}
                  autoFocus
                />
              </div>
              {!validation.supplierName && regi.supplierName && (
                <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Name must be at least 2 characters
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
                  type="text"
                  name="phone"
                  value={regi.phone}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-2.5 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-transparent transition-all duration-200 text-black bg-white text-sm ${
                    !validation.phone && regi.phone
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300"
                  }`}
                  placeholder="Enter phone number"
                  disabled={loading}
                />
              </div>
              {!validation.phone && regi.phone && (
                <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Enter a valid 10-digit phone number
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Email <span className="text-gray-400 text-xs">(Optional)</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="email"
                  name="email"
                  value={regi.email}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-2.5 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-transparent transition-all duration-200 text-black bg-white text-sm ${
                    !validation.email && regi.email
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300"
                  }`}
                  placeholder="Enter email address"
                  disabled={loading}
                />
              </div>
              {!validation.email && regi.email && (
                <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Enter a valid email address
                </p>
              )}
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Address{" "}
                <span className="text-gray-400 text-xs">(Optional)</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  name="address"
                  value={regi.address}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-transparent transition-all duration-200 text-black bg-white text-sm"
                  placeholder="Enter supplier address"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Company Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Company Name{" "}
                <span className="text-gray-400 text-xs">(Optional)</span>
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  name="company"
                  value={regi.company}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-transparent transition-all duration-200 text-black bg-white text-sm"
                  placeholder="Enter company name"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Validation Summary */}
            <div className="bg-gray-100 rounded-xl p-4 border-2 border-gray-300">
              <p className="text-sm font-semibold text-gray-700 mb-3">
                Validation Status
              </p>
              <div className="space-y-2">
                <div
                  className={`flex items-center gap-2 ${regi.supplierName ? "text-emerald-700" : "text-gray-500"}`}
                >
                  <div
                    className={`w-2.5 h-2.5 rounded-full ${regi.supplierName ? "bg-emerald-400" : "bg-gray-400"}`}
                  />
                  <span className="text-sm">
                    Supplier name {regi.supplierName ? "✓" : "(required)"}
                  </span>
                </div>
                <div
                  className={`flex items-center gap-2 ${regi.phone ? (validation.phone ? "text-emerald-700" : "text-red-600") : "text-gray-500"}`}
                >
                  <div
                    className={`w-2.5 h-2.5 rounded-full ${regi.phone ? (validation.phone ? "bg-emerald-400" : "bg-red-400") : "bg-gray-400"}`}
                  />
                  <span className="text-sm">
                    Phone number{" "}
                    {regi.phone
                      ? validation.phone
                        ? "✓"
                        : "(invalid)"
                      : "(required)"}
                  </span>
                </div>
                <div
                  className={`flex items-center gap-2 ${regi.email ? (validation.email ? "text-emerald-700" : "text-red-600") : "text-gray-500"}`}
                >
                  <div
                    className={`w-2.5 h-2.5 rounded-full ${regi.email ? (validation.email ? "bg-emerald-400" : "bg-red-400") : "bg-gray-400"}`}
                  />
                  <span className="text-sm">
                    Email{" "}
                    {regi.email
                      ? validation.email
                        ? "✓"
                        : "(invalid)"
                      : "(optional)"}
                  </span>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {showError && (
              <div className="bg-red-50 border-2 border-red-200 text-red-600 rounded-xl p-4 text-sm">
                <span className="font-bold">Error: </span> {showError}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !regi.supplierName || !regi.phone}
              className={`w-full py-3 font-semibold rounded-xl flex items-center justify-center gap-2 text-sm transition-all duration-300 border-2 ${
                loading || !regi.supplierName || !regi.phone
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
                  <span>Add Supplier</span>
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
              (!regi.supplierName &&
                !regi.phone &&
                !regi.address &&
                !regi.email &&
                !regi.company)
            }
          >
            Reset
          </button>
          <button
            type="button"
            onClick={() => setShowModal(false)}
            className="px-5 py-2 bg-white border-2 border-gray-300 text-gray-600 font-semibold rounded-xl hover:bg-gray-100 hover:border-gray-400 transition-all duration-200 text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddSupplier;
