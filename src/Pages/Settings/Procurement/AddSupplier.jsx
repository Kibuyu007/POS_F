import axios from "axios";
import { addSupplier, supplierFetch } from "../../../Redux/suppliers";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { FiUser, FiPhone, FiMapPin, FiMail, FiBriefcase, FiX, FiCheck } from "react-icons/fi";
import BASE_URL from "../../../Utils/config";

const AddSupplier = ({ showModal, setShowModal }) => {
  // Use selector from Redux
  const { supplier } = useSelector((state) => state.suppliers);
  const dispatch = useDispatch();

  const [showError, setShowError] = useState("");
  const [regi, setRegi] = useState({
    supplierName: "",
    phone: 0,
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

  // Fetch Suppliers
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
      setValidation((prev) => ({ ...prev, supplierName: value.trim().length >= 2 }));
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
        regi
      );
      console.log(response);
      dispatch(addSupplier(response?.data));

      setRegi({
        supplierName: "",
        phone: 0,
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
            "Failed to add supplier. Please try again."
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
      phone: 0,
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
                      <h3 className="text-2xl font-bold text-black">+ Add Supplier</h3>
                      <p className="text-black/70 text-sm mt-1">Enter supplier details</p>
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
                  <form onSubmit={handleAddItems} className="grid grid-cols-2 gap-4">
                    {/* Supplier Name */}
                    <div className="col-span-2">
                      <div className="mb-2">
                        <label className="block text-sm font-bold text-gray-900">
                          Supplier Name
                        </label>
                      </div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-3 flex items-center">
                          <FiUser className="w-4 h-4 text-gray-500" />
                        </div>
                        <input
                          type="text"
                          name="supplierName"
                          value={regi.supplierName}
                          onChange={handleChange}
                          className={`w-full pl-10 pr-4 py-3 border ${
                            !validation.supplierName && regi.supplierName
                              ? "border-red-300"
                              : "border-gray-300"
                          } rounded-full bg-white text-black focus:outline-none focus:border-green-300`}
                          placeholder="Enter supplier name"
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
                          type="number"
                          name="phone"
                          value={regi.phone}
                          onChange={handleChange}
                          className={`w-full pl-10 pr-4 py-3 border ${
                            !validation.phone && regi.phone
                              ? "border-red-300"
                              : "border-gray-300"
                          } rounded-full bg-white text-black focus:outline-none focus:border-green-300`}
                          placeholder="Enter phone number"
                          disabled={loading}
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <div className="mb-2">
                        <label className="block text-sm font-bold text-gray-900">
                          Email (Optional)
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
                            !validation.email && regi.email
                              ? "border-red-300"
                              : "border-gray-300"
                          } rounded-full bg-white text-black focus:outline-none focus:border-green-300`}
                          placeholder="Enter email address"
                          disabled={loading}
                        />
                      </div>
                    </div>

                    {/* Address */}
                    <div className="col-span-2">
                      <div className="mb-2">
                        <label className="block text-sm font-bold text-gray-900">
                          Address (Optional)
                        </label>
                      </div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-3 flex items-center">
                          <FiMapPin className="w-4 h-4 text-gray-500" />
                        </div>
                        <input
                          type="text"
                          name="address"
                          value={regi.address}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-full bg-white text-black focus:outline-none focus:border-green-300"
                          placeholder="Enter supplier address"
                          disabled={loading}
                        />
                      </div>
                    </div>

                    {/* Company Name */}
                    <div className="col-span-2">
                      <div className="mb-2">
                        <label className="block text-sm font-bold text-gray-900">
                          Company Name (Optional)
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
                          placeholder="Enter company name"
                          disabled={loading}
                        />
                      </div>
                    </div>

                    {/* Validation Summary */}
                    <div className="col-span-2 bg-gray-100 rounded-xl p-4 border border-gray-300">
                      <p className="text-sm font-bold text-black mb-3">Validation Status</p>
                      <div className="space-y-2">
                        <div className={`flex items-center gap-3 ${regi.supplierName ? "text-green-700" : "text-gray-600"}`}>
                          <div className={`w-3 h-3 rounded-full ${regi.supplierName ? "bg-green-300" : "bg-gray-400"}`} />
                          <span className="text-sm">Supplier name {regi.supplierName ? "✓" : "(required)"}</span>
                        </div>
                        <div className={`flex items-center gap-3 ${regi.phone ? (validation.phone ? "text-green-700" : "text-red-600") : "text-gray-600"}`}>
                          <div className={`w-3 h-3 rounded-full ${regi.phone ? (validation.phone ? "bg-green-300" : "bg-red-300") : "bg-gray-400"}`} />
                          <span className="text-sm">Phone number {regi.phone ? (validation.phone ? "✓" : "(invalid)") : "(required)"}</span>
                        </div>
                        <div className={`flex items-center gap-3 ${regi.email ? (validation.email ? "text-green-700" : "text-red-600") : "text-gray-600"}`}>
                          <div className={`w-3 h-3 rounded-full ${regi.email ? (validation.email ? "bg-green-300" : "bg-red-300") : "bg-gray-400"}`} />
                          <span className="text-sm">Email {regi.email ? (validation.email ? "✓" : "(invalid)") : "(optional)"}</span>
                        </div>
                      </div>
                    </div>

                    {/* Error Message */}
                    {showError && (
                      <div className="col-span-2">
                        <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-4">
                          <span className="font-bold">Error: </span> {showError}
                        </div>
                      </div>
                    )}

                    {/* Submit Button */}
                    <div className="col-span-2">
                      <button
                        type="submit"
                        disabled={loading || !regi.supplierName || !regi.phone}
                        className={`w-full py-3 font-bold rounded-full flex items-center justify-center gap-2 ${
                          loading || !regi.supplierName || !regi.phone
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
                            <span>Add Supplier</span>
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
                    disabled={
                      loading ||
                      (!regi.supplierName && !regi.phone && !regi.address && !regi.email && !regi.company)
                    }
                  >
                    Reset
                  </button>
                  <button
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-black font-bold rounded-full transition-colors text-sm"
                    onClick={() => setShowModal(false)}
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

export default AddSupplier;