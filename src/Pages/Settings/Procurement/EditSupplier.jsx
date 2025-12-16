import axios from "axios";
import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { updateSupplier } from "../../../Redux/suppliers";
import {
  FiUser,
  FiPhone,
  FiMapPin,
  FiMail,
  FiBriefcase,
  FiX,
  FiCheck,
  FiCheckCircle,
} from "react-icons/fi";

//API
import BASE_URL from "../../../Utils/config";
import toast from "react-hot-toast";

const EditSupplier = ({ showModal, setShowModal, supplier }) => {
  const dispatch = useDispatch();

  const [showError, setShowError] = useState("");
  const [editSupplier, setEditSupplier] = useState({
    _id: "",
    supplierName: "",
    phone: "",
    address: "",
    company: "",
    email: "",
    status: "Active",
  });

  const [validation, setValidation] = useState({
    supplierName: true,
    phone: true,
    email: true,
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (supplier && showModal) {
      setEditSupplier({
        _id: supplier._id || "",
        supplierName: supplier.supplierName || "",
        phone: supplier.phone || "",
        address: supplier.address || "",
        company: supplier.company || "",
        email: supplier.email || "",
        status: supplier.status || "Active",
      });

      // Set initial validation
      setValidation({
        supplierName: supplier.supplierName?.trim().length >= 2 || false,
        phone: /^[0-9]{10}$/.test(supplier.phone || ""),
        email:
          !supplier.email ||
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(supplier.email || ""),
      });
    }
  }, [supplier, showModal]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditSupplier((prev) => ({ ...prev, [name]: value }));

    // Update validation
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

  const handleEditSupplier = async (e) => {
    e.preventDefault();

    // Validation
    if (
      !editSupplier.supplierName ||
      editSupplier.supplierName.trim().length < 2
    ) {
      setShowError("Supplier name must be at least 2 characters");
      return;
    }

    if (!editSupplier.phone) {
      setShowError("Phone number is required");
      return;
    }

    if (!validation.phone) {
      setShowError("Please enter a valid 10-digit phone number");
      return;
    }

    if (editSupplier.email && !validation.email) {
      setShowError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.put(
        `${BASE_URL}/api/suppliers/updateSupplier/${editSupplier._id}`,
        editSupplier
      );

      dispatch(updateSupplier(response.data.updatedSupplier || editSupplier));

      console.log(response);
      toast.success(response.data.message || "Angalia Success kwenye console");

      setTimeout(() => {
        setShowModal(false);
      }, 1500);
    } catch (error) {
      if (error.response && error.response.data) {
        const message =
          error.response?.data?.message ||
          error.message ||
          "Angalia Error kwenye console";
        toast.error(message);
      } else {
        setShowError("An error occurred. Please contact system administrator.");
      }
      const message =
        error.response?.data?.message ||
        error.message ||
        "Angalia Error kwenye console";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    if (supplier) {
      setEditSupplier({
        _id: supplier._id || "",
        supplierName: supplier.supplierName || "",
        phone: supplier.phone || "",
        address: supplier.address || "",
        company: supplier.company || "",
        email: supplier.email || "",
        status: supplier.status || "Active",
      });
    }
    setShowError("");
  };

  return (
    <>
      {showModal && (
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
                    <h3 className="text-2xl font-bold text-black">
                      Edit Supplier
                    </h3>
                    <p className="text-black/70 text-sm mt-1">
                      Update supplier details
                    </p>
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
                <form
                  onSubmit={handleEditSupplier}
                  className="grid grid-cols-2 gap-4"
                >
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
                        value={editSupplier.supplierName}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-4 py-3 border ${
                          !validation.supplierName && editSupplier.supplierName
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
                        type="tel"
                        name="phone"
                        value={editSupplier.phone}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-4 py-3 border ${
                          !validation.phone && editSupplier.phone
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
                        value={editSupplier.email}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-4 py-3 border ${
                          !validation.email && editSupplier.email
                            ? "border-red-300"
                            : "border-gray-300"
                        } rounded-full bg-white text-black focus:outline-none focus:border-green-300`}
                        placeholder="Enter email address"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  {/* Status */}
                  <div>
                    <div className="mb-2">
                      <label className="block text-sm font-bold text-gray-900">
                        Status
                      </label>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-3 flex items-center">
                        <FiCheckCircle className="w-4 h-4 text-gray-500" />
                      </div>
                      <select
                        name="status"
                        value={editSupplier.status}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-full bg-white text-black focus:outline-none focus:border-green-300 appearance-none"
                        disabled={loading}
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                        <option value="Pending">Pending</option>
                      </select>
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
                        value={editSupplier.address}
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
                        value={editSupplier.company}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-full bg-white text-black focus:outline-none focus:border-green-300"
                        placeholder="Enter company name"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  {/* Validation Summary */}
                  <div className="col-span-2 bg-gray-100 rounded-xl p-4 border border-gray-300">
                    <p className="text-sm font-bold text-black mb-3">
                      Validation Status
                    </p>
                    <div className="space-y-2">
                      <div
                        className={`flex items-center gap-3 ${
                          editSupplier.supplierName && validation.supplierName
                            ? "text-green-700"
                            : "text-gray-600"
                        }`}
                      >
                        <div
                          className={`w-3 h-3 rounded-full ${
                            editSupplier.supplierName && validation.supplierName
                              ? "bg-green-300"
                              : "bg-gray-400"
                          }`}
                        />
                        <span className="text-sm">
                          Supplier name{" "}
                          {editSupplier.supplierName && validation.supplierName
                            ? "✓"
                            : "(min 2 characters)"}
                        </span>
                      </div>
                      <div
                        className={`flex items-center gap-3 ${
                          editSupplier.phone
                            ? validation.phone
                              ? "text-green-700"
                              : "text-red-600"
                            : "text-gray-600"
                        }`}
                      >
                        <div
                          className={`w-3 h-3 rounded-full ${
                            editSupplier.phone
                              ? validation.phone
                                ? "bg-green-300"
                                : "bg-red-300"
                              : "bg-gray-400"
                          }`}
                        />
                        <span className="text-sm">
                          Phone number{" "}
                          {editSupplier.phone
                            ? validation.phone
                              ? "✓"
                              : "(10 digits)"
                            : "(required)"}
                        </span>
                      </div>
                      <div
                        className={`flex items-center gap-3 ${
                          editSupplier.email
                            ? validation.email
                              ? "text-green-700"
                              : "text-red-600"
                            : "text-gray-600"
                        }`}
                      >
                        <div
                          className={`w-3 h-3 rounded-full ${
                            editSupplier.email
                              ? validation.email
                                ? "bg-green-300"
                                : "bg-red-300"
                              : "bg-gray-400"
                          }`}
                        />
                        <span className="text-sm">
                          Email{" "}
                          {editSupplier.email
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
                      disabled={
                        loading ||
                        !editSupplier.supplierName ||
                        !editSupplier.phone ||
                        !validation.supplierName ||
                        !validation.phone
                      }
                      className={`w-full py-3 font-bold rounded-full flex items-center justify-center gap-2 ${
                        loading ||
                        !editSupplier.supplierName ||
                        !editSupplier.phone ||
                        !validation.supplierName ||
                        !validation.phone
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
                          <FiCheck className="w-5 h-5" />
                          <span>Update Supplier</span>
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
      )}
    </>
  );
};

export default EditSupplier;
