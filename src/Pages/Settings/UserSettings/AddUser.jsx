import { useState } from "react";
import axios from "axios";
import {
  FiUser,
  FiX,
  FiCheck,
  FiMail,
  FiPhone,
  FiHome,
  FiCalendar,
  FiUpload,
  FiLock,
} from "react-icons/fi";
import toast from "react-hot-toast";
import BASE_URL from "../../../Utils/config";

const AddUser = ({ showModal, setShowModal, onUserAdded }) => {
  const [newUser, setNewUser] = useState({
    firstName: "",
    secondName: "",
    lastName: "",
    userName: "",
    dateOfBirth: "",
    gender: "",
    email: "",
    contacts: "",
    address: "",
    title: "",
    photo: null,
    roles: {
      canAddItems: false,
      canEditItems: false,
      canAddCategory: false,
      canEditCategory: false,
      canMakeTransaction: false,
      canPayBillTransaction: false,
      canApproveNewGrn: false,
      canPayBilledGrn: false,
      canChangeDebtStatus: false,
      canPayDebt: false,
      canAccessSettings: false,
      canAccessUserManagement: false,
      canAccessCustomerManagement: false,
      canAccessSupplierManagement: false,
      canSeeReports: false,
      canAccessMadeniReport: false,
    },
    password: "",
  });

  const [showError, setShowError] = useState("");
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState();
  const [photoPreview, setPhotoPreview] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewUser((prevUser) => ({
      ...prevUser,
      [name]: value,
    }));
    if (showError) setShowError("");
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleAddNewUser = async (e) => {
    e.preventDefault();

    // Validation
    if (!newUser.firstName.trim() || !newUser.lastName.trim()) {
      setShowError("First name and last name are required");
      return;
    }

    if (!newUser.email.trim()) {
      setShowError("Email is required");
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newUser.email)) {
      setShowError("Please enter a valid email address");
      return;
    }

    if (!newUser.password) {
      setShowError("Password is required");
      return;
    }

    // Password strength validation (optional)
    if (newUser.password.length < 6) {
      setShowError("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("firstName", newUser.firstName);
      formData.append("secondName", newUser.secondName);
      formData.append("lastName", newUser.lastName);
      formData.append("userName", newUser.userName);
      formData.append("dateOfBirth", newUser.dateOfBirth);
      formData.append("gender", newUser.gender);
      formData.append("email", newUser.email);
      formData.append("contacts", newUser.contacts);
      formData.append("title", newUser.title);
      formData.append("address", newUser.address);
      if (file) formData.append("file", file);
      formData.append("roles", JSON.stringify(newUser.roles));
      formData.append("password", newUser.password);

      await axios.post(`${BASE_URL}/api/auth/register`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      toast.success("User added successfully!");

      setTimeout(() => {
        setShowModal(false);
        onUserAdded();
      }, 1500);
    } catch (error) {
      if (error.response && error.response.data) {
        setShowError(
          error.response.data.error ||
            error.response.data.message ||
            "Failed to add user. Please try again."
        );
      } else {
        setShowError("An error occurred. Please contact System Administrator.");
      }
      console.error("Add user failed", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setNewUser({
      firstName: "",
      secondName: "",
      lastName: "",
      userName: "",
      dateOfBirth: "",
      gender: "",
      email: "",
      contacts: "",
      address: "",
      title: "",
      photo: null,
      roles: {
        canAddItems: false,
        canEditItems: false,
        canAddCategory: false,
        canEditCategory: false,
        canMakeTransaction: false,
        canPayBillTransaction: false,
        canApproveNewGrn: false,
        canPayBilledGrn: false,
        canChangeDebtStatus: false,
        canPayDebt: false,
        canAccessSettings: false,
        canAccessUserManagement: false,
        canAccessCustomerManagement: false,
        canAccessSupplierManagement: false,
        canSeeReports: false,
        canAccessMadeniReport: false,
      },
      password: "",
    });
    setFile(null);
    setPhotoPreview(null);
    setShowError("");
  };

  // Field groups configuration
  const fieldGroups = [
    {
      title: "Basic Information",
      fields: [
        { name: "firstName", label: "First Name", type: "text", required: true, icon: <FiUser className="w-4 h-4" /> },
        { name: "secondName", label: "Second Name", type: "text", required: false, icon: <FiUser className="w-4 h-4" /> },
        { name: "lastName", label: "Last Name", type: "text", required: true, icon: <FiUser className="w-4 h-4" /> },
        { name: "userName", label: "Username", type: "text", required: false, icon: <FiUser className="w-4 h-4" /> },
      ],
    },
    {
      title: "Contact Details",
      fields: [
        { name: "email", label: "Email", type: "email", required: true, icon: <FiMail className="w-4 h-4" /> },
        { name: "contacts", label: "Phone Number", type: "text", required: false, icon: <FiPhone className="w-4 h-4" /> },
        { name: "address", label: "Address", type: "text", required: false, icon: <FiHome className="w-4 h-4" /> },
      ],
    },
    {
      title: "Personal Information",
      fields: [
        { name: "dateOfBirth", label: "Date of Birth", type: "date", required: false, icon: <FiCalendar className="w-4 h-4" /> },
        { 
          name: "gender", 
          label: "Gender", 
          type: "select", 
          required: false, 
          icon: <FiUser className="w-4 h-4" />,
          options: ["", "Male", "Female", "Other"] 
        },
        { name: "title", label: "Title/Position", type: "text", required: false, icon: <FiUser className="w-4 h-4" /> },
      ],
    },
  ];

  return (
    <>
      {showModal && (
        <div className="flex justify-center items-center overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none  backdrop-blur-sm">
          <div className="w-full md:w-11/12 lg:w-10/12 xl:w-8/12 2xl:w-6/12 max-h-[90vh] overflow-y-auto animate-fadeIn">
            <div className="border border-gray-200 rounded-2xl shadow-2xl relative flex flex-col w-full bg-white outline-none focus:outline-none">
              {/* Header */}
              <div className="flex items-start justify-between p-6 bg-gradient-to-r from-green-400 to-emerald-500 border-b border-emerald-600/20 rounded-t-2xl">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                    <FiUser className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">
                      Add New User
                    </h3>
                    <p className="text-white/90 text-sm mt-1">
                      Create a new user account
                    </p>
                  </div>
                </div>
                <button
                  className="p-2 hover:bg-white/10 rounded-xl transition-all"
                  onClick={() => setShowModal(false)}
                  disabled={loading}
                >
                  <FiX className="w-6 h-6 text-white" />
                </button>
              </div>

              {/* Main Form Content */}
              <div className="relative p-6 flex-auto">
                <form onSubmit={handleAddNewUser} className="space-y-8">
                  {/* Field Groups */}
                  {fieldGroups.map((group, groupIndex) => (
                    <div key={groupIndex} className="space-y-4">
                      <div className="flex items-center gap-3 mb-4">
                        <div
                          className={`w-2 h-8 bg-gradient-to-b ${
                            groupIndex === 0
                              ? "from-blue-500 to-cyan-500"
                              : groupIndex === 1
                              ? "from-emerald-500 to-green-500"
                              : "from-purple-500 to-pink-500"
                          } rounded-full`}
                        />
                        <div>
                          <h4 className="text-lg font-bold text-gray-900">
                            {group.title}
                          </h4>
                          <p className="text-sm text-gray-500 mt-1">
                            Enter user {group.title.toLowerCase()}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {group.fields.map((field) => (
                          <div key={field.name} className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-bold text-gray-900">
                              {field.label}
                              {field.required && (
                                <span className="text-red-500">*</span>
                              )}
                            </label>
                            <div className="relative group">
                              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <div className="text-gray-400 group-focus-within:text-emerald-500 transition-colors">
                                  {field.icon}
                                </div>
                              </div>
                              {field.type === "select" ? (
                                <select
                                  name={field.name}
                                  value={newUser[field.name]}
                                  onChange={handleChange}
                                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all appearance-none"
                                  disabled={loading}
                                >
                                  {field.options.map((option, idx) => (
                                    <option
                                      key={idx}
                                      value={option}
                                      className="text-gray-900"
                                    >
                                      {option || "Select Gender"}
                                    </option>
                                  ))}
                                </select>
                              ) : (
                                <input
                                  type={field.type}
                                  name={field.name}
                                  value={newUser[field.name]}
                                  onChange={handleChange}
                                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all placeholder:text-gray-400"
                                  placeholder={`Enter ${field.label.toLowerCase()}`}
                                  disabled={loading}
                                />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  {/* Password Field */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-2 h-8 bg-gradient-to-b from-amber-500 to-orange-500 rounded-full" />
                      <div>
                        <h4 className="text-lg font-bold text-gray-900">
                          Security
                        </h4>
                        <p className="text-sm text-gray-500 mt-1">
                          Set up account credentials
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-bold text-gray-900">
                        Password
                        <span className="text-red-500">*</span>
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <FiLock className="w-4 h-4 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                        </div>
                        <input
                          type="password"
                          name="password"
                          value={newUser.password}
                          onChange={handleChange}
                          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
                          placeholder="Enter secure password (min 6 characters)"
                          disabled={loading}
                          autoComplete="new-password"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Photo Upload */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-2 h-8 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full" />
                      <div>
                        <h4 className="text-lg font-bold text-gray-900">
                          Profile Photo
                        </h4>
                        <p className="text-sm text-gray-500 mt-1">
                          Upload a profile picture (optional)
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col md:flex-row items-center gap-6 p-4 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-200">
                      <div className="relative">
                        <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                          {photoPreview ? (
                            <img
                              src={photoPreview}
                              alt="Preview"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <FiUser className="w-16 h-16 text-gray-400" />
                            </div>
                          )}
                        </div>
                        {photoPreview && (
                          <button
                            type="button"
                            onClick={() => {
                              setPhotoPreview(null);
                              setFile(null);
                            }}
                            className="absolute -top-1 -right-1 w-8 h-8 bg-gradient-to-br from-red-500 to-pink-500 text-white rounded-full flex items-center justify-center hover:shadow-lg transition-shadow"
                          >
                            <FiX className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="space-y-3">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                            id="photo-upload"
                            disabled={loading}
                          />
                          <label
                            htmlFor="photo-upload"
                            className={`inline-flex items-center gap-3 px-6 py-3 rounded-xl cursor-pointer transition-all ${
                              loading
                                ? "bg-gray-100 cursor-not-allowed"
                                : "bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 shadow-md hover:shadow-lg text-white"
                            }`}
                          >
                            <FiUpload className="w-5 h-5" />
                            <span className="font-semibold">
                              {file ? "Change Photo" : "Choose Photo"}
                            </span>
                          </label>
                          {file && (
                            <p className="text-sm text-gray-600 bg-white/50 p-2 rounded-lg">
                              <span className="font-medium">Selected:</span>{" "}
                              {file.name}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Validation Summary */}
                  <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-5 border border-gray-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-2 h-6 bg-gradient-to-b from-blue-500 to-cyan-500 rounded-full" />
                      <h5 className="font-bold text-gray-900">
                        Validation Summary
                      </h5>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                      {[
                        { label: "First Name", value: newUser.firstName },
                        { label: "Last Name", value: newUser.lastName },
                        { label: "Email", value: newUser.email },
                        { label: "Password", value: newUser.password },
                      ].map((field, idx) => (
                        <div
                          key={idx}
                          className={`flex items-center gap-3 p-3 rounded-lg border ${
                            field.value
                              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                              : "bg-amber-50 border-amber-200 text-amber-800"
                          }`}
                        >
                          <div
                            className={`w-3 h-3 rounded-full ${
                              field.value ? "bg-emerald-500" : "bg-amber-500"
                            }`}
                          />
                          <span className="text-sm font-medium">
                            {field.label}
                          </span>
                          <span className="ml-auto font-bold">
                            {field.value ? "✓" : "✗"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Error Message */}
                  {showError && (
                    <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 text-red-700 rounded-2xl p-4 flex items-center gap-3">
                      <div className="w-2 h-full bg-gradient-to-b from-red-500 to-pink-500 rounded-full" />
                      <div>
                        <span className="font-bold">Error: </span> {showError}
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="sticky bottom-0 bg-white/90 backdrop-blur-sm -mx-6 px-6 py-4 border-t border-gray-200">
                    <button
                      type="submit"
                      disabled={
                        loading ||
                        !newUser.firstName ||
                        !newUser.lastName ||
                        !newUser.email ||
                        !newUser.password
                      }
                      className={`w-full py-4 font-bold rounded-xl flex items-center justify-center gap-3 transition-all ${
                        loading ||
                        !newUser.firstName ||
                        !newUser.lastName ||
                        !newUser.email ||
                        !newUser.password
                          ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                          : "bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 shadow-lg hover:shadow-xl text-white"
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
                          <span>Creating User Account...</span>
                        </>
                      ) : (
                        <>
                          <FiCheck className="w-6 h-6" />
                          <span>Create User Account</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between p-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={loading}
                  className="px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-800 font-semibold rounded-xl transition-all shadow-sm hover:shadow"
                >
                  Reset Form
                </button>
                <button
                  className="px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-800 font-semibold rounded-xl transition-all shadow-sm hover:shadow"
                  onClick={() => setShowModal(false)}
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AddUser;