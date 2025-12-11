import axios from "axios";
import { useDispatch } from "react-redux";
import { useState } from "react";
import { FiUser, FiPhone, FiMapPin, FiMail, FiBriefcase, FiX, FiCheck, FiAlertCircle } from "react-icons/fi";
import BASE_URL from "../../../Utils/config";
import { addCustomer } from "../../../Redux/customerSlice";
import toast from "react-hot-toast";

const AddCustomer = ({ showModal, setShowModal, onCustomerAdded }) => {
  const dispatch = useDispatch();
  const [showError, setShowError] = useState("");
  const [loading, setLoading] = useState(false);

  const [regi, setRegi] = useState({
    customerName: "",
    phone: "",
    address: "",
    company: "",
    email: "",
  });

  const [validation, setValidation] = useState({
    customerName: true,
    phone: true,
    email: true,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRegi({ ...regi, [name]: value });
    
    // Validation on change
    if (name === "phone") {
      const phoneVali = /^[0-9]{10}$/;
      setValidation((prev) => ({ ...prev, phone: phoneVali.test(value) || value === "" }));
    } else if (name === "email") {
      const emailVali = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      setValidation((prev) => ({ ...prev, email: emailVali.test(value) || value === "" }));
    } else if (name === "customerName") {
      setValidation((prev) => ({ ...prev, customerName: value.trim().length >= 2 || value === "" }));
    }
    
    if (showError) setShowError("");
  };

  const handleAddCustomer = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!regi.customerName.trim()) {
      setShowError("Customer name is required");
      return;
    }
    
    if (regi.customerName.trim().length < 2) {
      setShowError("Customer name must be at least 2 characters");
      return;
    }
    
    if (regi.phone && !validation.phone) {
      setShowError("Phone number must be 10 digits");
      return;
    }
    
    if (regi.email && !validation.email) {
      setShowError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${BASE_URL}/api/customers/addCustomer`,
        regi,
        { withCredentials: true }
      );
      
      dispatch(addCustomer(response?.data));
      toast.success("Customer added successfully!");
      
      setRegi({
        customerName: "",
        phone: "",
        address: "",
        email: "",
        company: "",
      });
      setShowError("");
      
      setTimeout(() => {
        setShowModal(false);
        onCustomerAdded();
      }, 1500);
    } catch (error) {
      if (error.response && error.response.data) {
        setShowError(
          error.response.data.error ||
            "Failed to add customer. Please try again."
        );
      } else {
        setShowError("An error occurred. Please contact System Administrator.");
      }
      console.error("Error adding customer", error);
      toast.error("Failed to add customer");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setRegi({
      customerName: "",
      phone: "",
      address: "",
      email: "",
      company: "",
    });
    setShowError("");
    setValidation({
      customerName: true,
      phone: true,
      email: true,
    });
  };

  return (
    <>
      {showModal ? (
        <>
          <div className="flex justify-center items-center overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none bg-gray-900 bg-opacity-20">
            <div className="w-full md:w-2/3 lg:w-1/2">
              <div className="border border-gray-300 rounded-2xl shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
                {/* Header */}
                <div className="flex items-start justify-between p-5 bg-green-300 border-b border-gray-400 rounded-t-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center">
                      <FiUser className="w-5 h-5 text-black" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-black">+ Add Customer</h3>
                      <p className="text-black/70 text-sm mt-1">Create a new customer record</p>
                    </div>
                  </div>
                  <button
                    className="p-2 hover:bg-black/5 rounded-full transition-colors"
                    onClick={() => setShowModal(false)}
                  >
                    <FiX className="w-5 h-5 text-black" />
                  </button>
                </div>

                {/* Main Form Content */}
                <div className="relative p-6 flex-auto">
                  <form onSubmit={handleAddCustomer} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Customer Name */}
                      <div>
                        <div className="mb-2">
                          <label className="block text-sm font-bold text-gray-900">
                            Customer Name *
                          </label>
                        </div>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-3 flex items-center">
                            <FiUser className="w-4 h-4 text-gray-500" />
                          </div>
                          <input
                            type="text"
                            name="customerName"
                            value={regi.customerName}
                            onChange={handleChange}
                            className={`w-full pl-10 pr-4 py-3 border ${
                              regi.customerName && !validation.customerName 
                                ? "border-red-300" 
                                : "border-gray-300"
                            } rounded-full bg-white text-black focus:outline-none focus:border-green-300`}
                            placeholder="John Doe"
                            disabled={loading}
                            autoFocus
                          />
                        </div>
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
                            value={regi.phone}
                            onChange={handleChange}
                            className={`w-full pl-10 pr-4 py-3 border ${
                              regi.phone && !validation.phone 
                                ? "border-red-300" 
                                : "border-gray-300"
                            } rounded-full bg-white text-black focus:outline-none focus:border-green-300`}
                            placeholder="07XXXXXXXX"
                            disabled={loading}
                          />
                        </div>
                      </div>

                      {/* Email */}
                      <div>
                        <div className="mb-2">
                          <label className="block text-sm font-bold text-gray-900">
                            Email
                          </label>
                        </div>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-3 flex items-center">
                            <FiMail className="w-4 h-4 text-gray-500" />
                          </div>
                          <input
                            type="email"
                            name="email"
                            value={regi.email}
                            onChange={handleChange}
                            className={`w-full pl-10 pr-4 py-3 border ${
                              regi.email && !validation.email 
                                ? "border-red-300" 
                                : "border-gray-300"
                            } rounded-full bg-white text-black focus:outline-none focus:border-green-300`}
                            placeholder="customer@email.com"
                            disabled={loading}
                          />
                        </div>
                      </div>

                      {/* Company */}
                      <div>
                        <div className="mb-2">
                          <label className="block text-sm font-bold text-gray-900">
                            Company
                          </label>
                        </div>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-3 flex items-center">
                            <FiBriefcase className="w-4 h-4 text-gray-500" />
                          </div>
                          <input
                            type="text"
                            name="company"
                            value={regi.company}
                            onChange={handleChange}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-full bg-white text-black focus:outline-none focus:border-green-300"
                            placeholder="Company Name"
                            disabled={loading}
                          />
                        </div>
                      </div>

                      {/* Address - Full Width */}
                      <div className="md:col-span-2">
                        <div className="mb-2">
                          <label className="block text-sm font-bold text-gray-900">
                            Address
                          </label>
                        </div>
                        <div className="relative">
                          <div className="absolute top-3 left-3">
                            <FiMapPin className="w-4 h-4 text-gray-500" />
                          </div>
                          <textarea
                            name="address"
                            value={regi.address}
                            onChange={handleChange}
                            rows="2"
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl bg-white text-black focus:outline-none focus:border-green-300 resize-none"
                            placeholder="Enter customer address"
                            disabled={loading}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Validation Summary */}
                    <div className="bg-gray-100 rounded-xl p-4 border border-gray-300">
                      <p className="text-sm font-bold text-black mb-3">Validation Status</p>
                      <div className="space-y-2">
                        <div className={`flex items-center gap-3 ${
                          validation.customerName && regi.customerName 
                            ? "text-green-700" 
                            : regi.customerName ? "text-red-600" : "text-gray-600"
                        }`}>
                          <div className={`w-3 h-3 rounded-full ${
                            validation.customerName && regi.customerName 
                              ? "bg-green-300" 
                              : regi.customerName ? "bg-red-300" : "bg-gray-400"
                          }`} />
                          <span className="text-sm">
                            Customer name {regi.customerName ? (validation.customerName ? "✓" : "(min 2 characters)") : "(required)"}
                          </span>
                        </div>
                        <div className={`flex items-center gap-3 ${
                          validation.phone && regi.phone 
                            ? "text-green-700" 
                            : regi.phone ? "text-red-600" : "text-gray-600"
                        }`}>
                          <div className={`w-3 h-3 rounded-full ${
                            validation.phone && regi.phone 
                              ? "bg-green-300" 
                              : regi.phone ? "bg-red-300" : "bg-gray-400"
                          }`} />
                          <span className="text-sm">
                            Phone number {regi.phone ? (validation.phone ? "✓" : "(10 digits)") : "(optional)"}
                          </span>
                        </div>
                        <div className={`flex items-center gap-3 ${
                          validation.email && regi.email 
                            ? "text-green-700" 
                            : regi.email ? "text-red-600" : "text-gray-600"
                        }`}>
                          <div className={`w-3 h-3 rounded-full ${
                            validation.email && regi.email 
                              ? "bg-green-300" 
                              : regi.email ? "bg-red-300" : "bg-gray-400"
                          }`} />
                          <span className="text-sm">
                            Email address {regi.email ? (validation.email ? "✓" : "(valid format)") : "(optional)"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Error Message */}
                    {showError && (
                      <div>
                        <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-4">
                          <div className="flex items-center gap-2">
                            <FiAlertCircle className="w-5 h-5" />
                            <span className="font-bold">Error: </span> {showError}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Submit Button */}
                    <div>
                      <button
                        type="submit"
                        disabled={loading || !regi.customerName.trim() || !validation.customerName}
                        className={`w-full py-3 font-bold rounded-full flex items-center justify-center gap-2 ${
                          loading || !regi.customerName.trim() || !validation.customerName
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
                            <span>Creating...</span>
                          </>
                        ) : (
                          <>
                            <FiCheck className="w-5 h-5" />
                            <span>Add Customer</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between p-5 border-t border-gray-300">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-black font-bold rounded-full transition-colors text-sm"
                    disabled={loading}
                  >
                    Reset
                  </button>
                  <button
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-black font-bold rounded-full transition-colors text-sm"
                    onClick={() => setShowModal(false)}
                    disabled={loading}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </>
  );
};

export default AddCustomer;