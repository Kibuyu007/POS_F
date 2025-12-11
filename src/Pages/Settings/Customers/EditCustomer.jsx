import axios from "axios";
import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { updateCustomer } from "../../../Redux/customerSlice";
import { FiUser, FiPhone, FiMapPin, FiMail, FiBriefcase, FiCheckCircle, FiX, FiAlertCircle, FiRefreshCw } from "react-icons/fi";
import { MdOutlineToggleOn, MdOutlineToggleOff } from "react-icons/md";
import BASE_URL from "../../../Utils/config";
import toast from "react-hot-toast";

const EditCustomer = ({ showModal, setShowModal, customer, onCustomerUpdated }) => {
  const dispatch = useDispatch();
  const [showError, setShowError] = useState("");
  const [loading, setLoading] = useState(false);

  const [editCustomer, setEditCustomer] = useState({
    _id: "",
    customerName: "",
    phone: "",
    address: "",
    company: "",
    email: "",
    status: "Active",
  });

  const [validation, setValidation] = useState({
    customerName: true,
    phone: true,
    email: true,
  });

  useEffect(() => {
    if (customer && showModal) {
      setEditCustomer({
        _id: customer._id || "",
        customerName: customer.customerName || "",
        phone: customer.phone || "",
        address: customer.address || "",
        company: customer.company || "",
        email: customer.email || "",
        status: customer.status || "Active",
      });
      setShowError("");
      // Set initial validation
      setValidation({
        customerName: customer.customerName?.trim().length >= 2 || false,
        phone: /^[0-9]{10}$/.test(customer.phone || "") || customer.phone === "",
        email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email || "") || customer.email === "",
      });
    }
  }, [customer, showModal]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditCustomer((prev) => ({ ...prev, [name]: value }));
    
    // Validation on change
    if (name === "phone") {
      const phoneVali = /^[0-9]{10}$/;
      setValidation((prev) => ({ ...prev, phone: phoneVali.test(value) || value === "" }));
    } else if (name === "email") {
      const emailVali = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      setValidation((prev) => ({ ...prev, email: emailVali.test(value) || value === "" }));
    } else if (name === "customerName") {
      setValidation((prev) => ({ ...prev, customerName: value.trim().length >= 2 }));
    }
    
    if (showError) setShowError("");
  };

  const toggleStatus = () => {
    setEditCustomer(prev => ({
      ...prev,
      status: prev.status === "Active" ? "Inactive" : "Active"
    }));
  };

  const handleEditCustomer = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!editCustomer.customerName.trim()) {
      setShowError("Customer name is required");
      return;
    }
    
    if (editCustomer.customerName.trim().length < 2) {
      setShowError("Customer name must be at least 2 characters");
      return;
    }
    
    if (editCustomer.phone && !validation.phone) {
      setShowError("Phone number must be 10 digits");
      return;
    }
    
    if (editCustomer.email && !validation.email) {
      setShowError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.put(
        `${BASE_URL}/api/customers/updateCustomer/${editCustomer._id}`, 
        editCustomer,
        { withCredentials: true }
      );

      dispatch(updateCustomer(response.data.updatedCustomer || editCustomer));
      toast.success("Customer updated successfully!");
      
      setTimeout(() => {
        setShowModal(false);
        if (onCustomerUpdated) onCustomerUpdated();
      }, 1500);
    } catch (error) {
      if (error.response && error.response.data) {
        setShowError(
          error.response.data.error ||
            "Update failed. Please check the input data."
        );
      } else {
        setShowError("An error occurred. Please contact system administrator.");
      }
      console.error("Update failed", error);
      toast.error("Failed to update customer");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    if (customer) {
      setEditCustomer({
        _id: customer._id || "",
        customerName: customer.customerName || "",
        phone: customer.phone || "",
        address: customer.address || "",
        company: customer.company || "",
        email: customer.email || "",
        status: customer.status || "Active",
      });
      setValidation({
        customerName: customer.customerName?.trim().length >= 2 || false,
        phone: /^[0-9]{10}$/.test(customer.phone || "") || customer.phone === "",
        email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email || "") || customer.email === "",
      });
    }
    setShowError("");
  };

  return (
    showModal && (
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
                  <h3 className="text-2xl font-bold text-black">Edit Customer</h3>
                  <p className="text-black/70 text-sm mt-1">Update customer information</p>
                </div>
              </div>
              <button
                className="p-2 hover:bg-black/5 rounded-full transition-colors"
                onClick={() => setShowModal(false)}
                disabled={loading}
              >
                <FiX className="w-5 h-5 text-black" />
              </button>
            </div>

            {/* Main Form Content */}
            <div className="relative p-6 flex-auto">
              <form onSubmit={handleEditCustomer} className="space-y-6">
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
                        value={editCustomer.customerName}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-4 py-3 border ${
                          editCustomer.customerName && !validation.customerName 
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
                        value={editCustomer.phone}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-4 py-3 border ${
                          editCustomer.phone && !validation.phone 
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
                        value={editCustomer.email}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-4 py-3 border ${
                          editCustomer.email && !validation.email 
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
                        value={editCustomer.company}
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
                        value={editCustomer.address}
                        onChange={handleChange}
                        rows="2"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl bg-white text-black focus:outline-none focus:border-green-300 resize-none"
                        placeholder="Enter customer address"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  {/* Status - Full Width */}
                  <div className="md:col-span-2">
                    <div className="mb-2">
                      <label className="block text-sm font-bold text-gray-900">
                        Status
                      </label>
                    </div>
                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={toggleStatus}
                        className={`flex items-center gap-3 px-4 py-3 rounded-full font-bold transition-colors ${
                          editCustomer.status === "Active" 
                            ? "bg-green-100 text-green-800 hover:bg-green-200" 
                            : "bg-red-100 text-red-800 hover:bg-red-200"
                        }`}
                        disabled={loading}
                      >
                        {editCustomer.status === "Active" ? (
                          <MdOutlineToggleOn className="w-6 h-6" />
                        ) : (
                          <MdOutlineToggleOff className="w-6 h-6" />
                        )}
                        <span>{editCustomer.status}</span>
                      </button>
                      <div className="text-sm text-gray-600">
                        {editCustomer.status === "Active" 
                          ? "Customer can make purchases" 
                          : "Customer is inactive"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Validation Summary */}
                <div className="bg-gray-100 rounded-xl p-4 border border-gray-300">
                  <p className="text-sm font-bold text-black mb-3">Validation Status</p>
                  <div className="space-y-2">
                    <div className={`flex items-center gap-3 ${
                      validation.customerName && editCustomer.customerName 
                        ? "text-green-700" 
                        : editCustomer.customerName ? "text-red-600" : "text-gray-600"
                    }`}>
                      <div className={`w-3 h-3 rounded-full ${
                        validation.customerName && editCustomer.customerName 
                          ? "bg-green-300" 
                          : editCustomer.customerName ? "bg-red-300" : "bg-gray-400"
                      }`} />
                      <span className="text-sm">
                        Customer name {editCustomer.customerName ? (validation.customerName ? "✓" : "(min 2 characters)") : "(required)"}
                      </span>
                    </div>
                    <div className={`flex items-center gap-3 ${
                      validation.phone && editCustomer.phone 
                        ? "text-green-700" 
                        : editCustomer.phone ? "text-red-600" : "text-gray-600"
                    }`}>
                      <div className={`w-3 h-3 rounded-full ${
                        validation.phone && editCustomer.phone 
                          ? "bg-green-300" 
                          : editCustomer.phone ? "bg-red-300" : "bg-gray-400"
                      }`} />
                      <span className="text-sm">
                        Phone number {editCustomer.phone ? (validation.phone ? "✓" : "(10 digits)") : "(optional)"}
                      </span>
                    </div>
                    <div className={`flex items-center gap-3 ${
                      validation.email && editCustomer.email 
                        ? "text-green-700" 
                        : editCustomer.email ? "text-red-600" : "text-gray-600"
                    }`}>
                      <div className={`w-3 h-3 rounded-full ${
                        validation.email && editCustomer.email 
                          ? "bg-green-300" 
                          : editCustomer.email ? "bg-red-300" : "bg-gray-400"
                      }`} />
                      <span className="text-sm">
                        Email address {editCustomer.email ? (validation.email ? "✓" : "(valid format)") : "(optional)"}
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
                    disabled={loading || !editCustomer.customerName.trim() || !validation.customerName}
                    className={`w-full py-3 font-bold rounded-full flex items-center justify-center gap-2 ${
                      loading || !editCustomer.customerName.trim() || !validation.customerName
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
                        <span>Updating...</span>
                      </>
                    ) : (
                      <>
                        <FiCheckCircle className="w-5 h-5" />
                        <span>Update Customer</span>
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
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-black font-bold rounded-full transition-colors text-sm flex items-center gap-2"
                disabled={loading}
              >
                <FiRefreshCw className="w-4 h-4" />
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
    )
  );
};

export default EditCustomer;