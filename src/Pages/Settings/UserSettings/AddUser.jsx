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
  FiEye,
  FiEyeOff,
  FiSave,
  FiRefreshCw,
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
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");

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

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
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

    // Password strength validation
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
    setShowPassword(false);
  };

  // Field groups configuration
  const fieldGroups = [
    {
      id: "personal",
      title: "Personal Information",
      icon: <FiUser className="w-5 h-5" />,
      fields: [
        {
          name: "firstName",
          label: "First Name",
          type: "text",
          required: true,
          icon: <FiUser className="w-4 h-4" />,
        },
        {
          name: "secondName",
          label: "Middle Name",
          type: "text",
          required: false,
          icon: <FiUser className="w-4 h-4" />,
        },
        {
          name: "lastName",
          label: "Last Name",
          type: "text",
          required: true,
          icon: <FiUser className="w-4 h-4" />,
        },
        {
          name: "userName",
          label: "Username",
          type: "text",
          required: false,
          icon: <FiUser className="w-4 h-4" />,
        },
      ],
    },
    {
      id: "contact",
      title: "Contact Details",
      icon: <FiMail className="w-5 h-5" />,
      fields: [
        {
          name: "email",
          label: "Email",
          type: "email",
          required: true,
          icon: <FiMail className="w-4 h-4" />,
        },
        {
          name: "contacts",
          label: "Phone Number",
          type: "tel",
          required: false,
          icon: <FiPhone className="w-4 h-4" />,
        },
        {
          name: "address",
          label: "Address",
          type: "text",
          required: false,
          icon: <FiHome className="w-4 h-4" />,
        },
        {
          name: "title",
          label: "Job Title",
          type: "text",
          required: false,
          icon: <FiUser className="w-4 h-4" />,
        },
      ],
    },
    {
      id: "additional",
      title: "Additional Information",
      icon: <FiCalendar className="w-5 h-5" />,
      fields: [
        {
          name: "dateOfBirth",
          label: "Date of Birth",
          type: "date",
          required: false,
          icon: <FiCalendar className="w-4 h-4" />,
        },
        {
          name: "gender",
          label: "Gender",
          type: "select",
          required: false,
          icon: <FiUser className="w-4 h-4" />,
          options: ["", "Male", "Female", "Other"],
        },
      ],
    },
  ];

  // Tabs for navigation
  const tabs = [
    { id: "personal", label: "Personal", icon: <FiUser /> },
    { id: "security", label: "Security", icon: <FiLock /> },
    { id: "photo", label: "Photo", icon: <FiUser /> },
    { id: "summary", label: "Summary", icon: <FiCheck /> },
  ];

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto text-black">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={() => !loading && setShowModal(false)}
      />

      {/* Modal Container */}
      <div className="flex min-h-screen items-center justify-center p-2 sm:p-4">
        <div className="relative w-full max-w-4xl mx-auto">
          {/* Modal Content */}
          <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-400 to-emerald-500 px-4 sm:px-6 py-4 sm:py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <div className="bg-white/20 p-2 sm:p-3 rounded-xl backdrop-blur-sm">
                    <FiUser className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white">
                      Add New User
                    </h2>
                    <p className="text-green-100 text-xs sm:text-sm mt-1">
                      Create a new user account
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => !loading && setShowModal(false)}
                  disabled={loading}
                  className="p-1.5 sm:p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <FiX className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </button>
              </div>

              {/* Tabs Navigation */}
              <div className="mt-4 sm:mt-6">
                <div className="flex space-x-1 overflow-x-auto pb-2">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center space-x-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-sm sm:text-base font-medium whitespace-nowrap transition-colors ${
                        activeTab === tab.id
                          ? "bg-white text-emerald-700"
                          : "text-green-100 hover:bg-white/10"
                      }`}
                    >
                      {tab.icon}
                      <span className="hidden sm:inline">{tab.label}</span>
                      <span className="sm:hidden">{tab.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Content Area */}
            <div className="p-4 sm:p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
              <form onSubmit={handleAddNewUser}>
                {/* Personal Information Tab */}
                {activeTab === "personal" && (
                  <div className="space-y-6">
                    <div className="bg-gradient-to-br from-gray-50 to-white p-4 sm:p-6 rounded-2xl border border-gray-200">
                      <div className="flex items-center space-x-3 mb-6">
                        <div className="p-2 bg-emerald-100 rounded-lg">
                          <FiUser className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            Personal Information
                          </h3>
                          <p className="text-sm text-gray-600">
                            Enter user's basic details
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {fieldGroups[0].fields.map((field) => (
                          <div key={field.name} className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                              {field.label}
                              {field.required && (
                                <span className="text-red-500 ml-1">*</span>
                              )}
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="text-gray-400">
                                  {field.icon}
                                </span>
                              </div>
                              <input
                                type={field.type}
                                name={field.name}
                                value={newUser[field.name]}
                                onChange={handleChange}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                                placeholder={`Enter ${field.label.toLowerCase()}`}
                                disabled={loading}
                                required={field.required}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-gray-50 to-white p-4 sm:p-6 rounded-2xl border border-gray-200">
                      <div className="flex items-center space-x-3 mb-6">
                        <div className="p-2 bg-emerald-100 rounded-lg">
                          <FiMail className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            Contact Details
                          </h3>
                          <p className="text-sm text-gray-600">
                            Enter contact information
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {fieldGroups[1].fields.map((field) => (
                          <div key={field.name} className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                              {field.label}
                              {field.required && (
                                <span className="text-red-500 ml-1">*</span>
                              )}
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="text-gray-400">
                                  {field.icon}
                                </span>
                              </div>
                              {field.type === "select" ? (
                                <select
                                  name={field.name}
                                  value={newUser[field.name]}
                                  onChange={handleChange}
                                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                                  disabled={loading}
                                >
                                  {field.options.map((option, idx) => (
                                    <option key={idx} value={option}>
                                      {option || `Select ${field.label}`}
                                    </option>
                                  ))}
                                </select>
                              ) : (
                                <input
                                  type={field.type}
                                  name={field.name}
                                  value={newUser[field.name]}
                                  onChange={handleChange}
                                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                                  placeholder={`Enter ${field.label.toLowerCase()}`}
                                  disabled={loading}
                                  required={field.required}
                                />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Security Tab */}
                {activeTab === "security" && (
                  <div className="space-y-6">
                    <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-6 rounded-2xl border border-emerald-100">
                      <div className="flex items-center space-x-3 mb-6">
                        <div className="p-2 bg-emerald-100 rounded-lg">
                          <FiLock className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            Account Security
                          </h3>
                          <p className="text-sm text-gray-600">
                            Set up secure credentials
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Password <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <FiLock className="w-4 h-4 text-gray-400" />
                            </div>
                            <input
                              type={showPassword ? "text" : "password"}
                              name="password"
                              value={newUser.password}
                              onChange={handleChange}
                              className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                              placeholder="Enter secure password (min 6 characters)"
                              disabled={loading}
                              required
                            />
                            <button
                              type="button"
                              onClick={togglePasswordVisibility}
                              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-emerald-500 transition-colors"
                              disabled={loading}
                              aria-label={
                                showPassword ? "Hide password" : "Show password"
                              }
                            >
                              {showPassword ? (
                                <FiEyeOff className="w-5 h-5" />
                              ) : (
                                <FiEye className="w-5 h-5" />
                              )}
                            </button>
                          </div>

                          {/* Password Strength Indicator */}
                          {newUser.password && (
                            <div className="mt-3 space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">
                                  Password strength:
                                </span>
                                <span
                                  className={`font-medium ${
                                    newUser.password.length >= 8 &&
                                    /[A-Z]/.test(newUser.password) &&
                                    /[0-9]/.test(newUser.password)
                                      ? "text-green-600"
                                      : newUser.password.length >= 6
                                      ? "text-amber-600"
                                      : "text-red-600"
                                  }`}
                                >
                                  {newUser.password.length >= 8 &&
                                  /[A-Z]/.test(newUser.password) &&
                                  /[0-9]/.test(newUser.password)
                                    ? "Strong"
                                    : newUser.password.length >= 6
                                    ? "Medium"
                                    : "Weak"}
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full ${
                                    newUser.password.length >= 8 &&
                                    /[A-Z]/.test(newUser.password) &&
                                    /[0-9]/.test(newUser.password)
                                      ? "bg-green-500 w-full"
                                      : newUser.password.length >= 6
                                      ? "bg-amber-500 w-2/3"
                                      : "bg-red-500 w-1/3"
                                  }`}
                                />
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Additional Information */}
                        <div className="bg-gradient-to-br from-gray-50 to-white p-4 rounded-xl border border-gray-200">
                          <h4 className="font-medium text-gray-700 mb-3">
                            Additional Information
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {fieldGroups[2].fields.map((field) => (
                              <div key={field.name} className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                  {field.label}
                                </label>
                                <div className="relative">
                                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="text-gray-400">
                                      {field.icon}
                                    </span>
                                  </div>
                                  {field.type === "select" ? (
                                    <select
                                      name={field.name}
                                      value={newUser[field.name]}
                                      onChange={handleChange}
                                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                                      disabled={loading}
                                    >
                                      {field.options.map((option, idx) => (
                                        <option key={idx} value={option}>
                                          {option || `Select ${field.label}`}
                                        </option>
                                      ))}
                                    </select>
                                  ) : (
                                    <input
                                      type={field.type}
                                      name={field.name}
                                      value={newUser[field.name]}
                                      onChange={handleChange}
                                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                                      placeholder={`Enter ${field.label.toLowerCase()}`}
                                      disabled={loading}
                                    />
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Photo Tab */}
                {activeTab === "photo" && (
                  <div className="space-y-6">
                    <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-2xl border border-gray-200">
                      <div className="flex items-center space-x-3 mb-6">
                        <div className="p-2 bg-emerald-100 rounded-lg">
                          <FiUser className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            Profile Photo
                          </h3>
                          <p className="text-sm text-gray-600">
                            Upload a profile picture (optional)
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col lg:flex-row items-center gap-6">
                        <div className="relative">
                          <div className="w-40 h-40 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gradient-to-br from-emerald-50 to-green-50">
                            {photoPreview ? (
                              <img
                                src={photoPreview}
                                alt="Preview"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <FiUser className="w-20 h-20 text-emerald-300" />
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
                              className="absolute top-2 right-2 w-8 h-8 bg-gradient-to-br from-red-500 to-pink-500 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow"
                            >
                              <FiX className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        <div className="flex-1">
                          <div className="space-y-4">
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
                              className={`flex items-center justify-center space-x-2 w-full px-6 py-3 rounded-xl cursor-pointer transition-all ${
                                loading
                                  ? "bg-gray-100 cursor-not-allowed"
                                  : "bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white shadow-md hover:shadow-lg"
                              }`}
                            >
                              <FiUpload className="w-5 h-5" />
                              <span className="font-semibold">
                                {file ? "Change Photo" : "Choose Photo"}
                              </span>
                            </label>

                            {file && (
                              <div className="p-3 bg-white rounded-lg border border-gray-200">
                                <p className="text-sm text-gray-600">
                                  <span className="font-medium">
                                    Selected file:
                                  </span>{" "}
                                  {file.name}
                                </p>
                              </div>
                            )}

                            <div className="text-sm text-gray-500 space-y-1">
                              <p>
                                • Recommended: Square image, minimum 400x400
                                pixels
                              </p>
                              <p>• Supported formats: JPG, PNG, GIF</p>
                              <p>• Maximum file size: 5MB</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Summary Tab */}
                {activeTab === "summary" && (
                  <div className="space-y-6">
                    {/* Validation Summary */}
                    <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-6 rounded-2xl border border-emerald-100">
                      <div className="flex items-center space-x-3 mb-6">
                        <div className="p-2 bg-emerald-100 rounded-lg">
                          <FiCheck className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            Validation Summary
                          </h3>
                          <p className="text-sm text-gray-600">
                            Review all information before creating account
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                          {
                            label: "First Name",
                            value: newUser.firstName,
                            required: true,
                          },
                          {
                            label: "Last Name",
                            value: newUser.lastName,
                            required: true,
                          },
                          {
                            label: "Email",
                            value: newUser.email,
                            required: true,
                          },
                          {
                            label: "Password",
                            value: newUser.password,
                            required: true,
                          },
                        ].map((field, idx) => (
                          <div
                            key={idx}
                            className={`p-4 rounded-xl border ${
                              field.required && !field.value
                                ? "border-red-200 bg-red-50"
                                : "border-green-200 bg-green-50"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-700">
                                {field.label}
                              </span>
                              <div
                                className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                  field.required && !field.value
                                    ? "bg-red-500"
                                    : "bg-green-500"
                                }`}
                              >
                                {field.required && !field.value ? (
                                  <FiX className="w-3 h-3 text-white" />
                                ) : (
                                  <FiCheck className="w-3 h-3 text-white" />
                                )}
                              </div>
                            </div>
                            <p
                              className={`text-sm ${
                                field.required && !field.value
                                  ? "text-red-600"
                                  : "text-green-600"
                              }`}
                            >
                              {field.required && !field.value
                                ? "Required"
                                : "✓ Valid"}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Additional Information Summary */}
                    <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-2xl border border-gray-200">
                      <h4 className="font-semibold text-gray-900 mb-4">
                        Additional Information
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[
                          { label: "Phone Number", value: newUser.contacts },
                          { label: "Address", value: newUser.address },
                          { label: "Job Title", value: newUser.title },
                          {
                            label: "Date of Birth",
                            value: newUser.dateOfBirth,
                          },
                          { label: "Gender", value: newUser.gender },
                          {
                            label: "Profile Photo",
                            value: file ? "Uploaded" : "Not uploaded",
                          },
                        ].map((field, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded-lg border border-gray-200 bg-white"
                          >
                            <div className="text-xs text-gray-500 mb-1">
                              {field.label}
                            </div>
                            <div className="text-sm font-medium text-gray-900 truncate">
                              {field.value || "Not provided"}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Error Message */}
                {showError && (
                  <div className="mt-6 p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-full bg-gradient-to-b from-red-500 to-pink-500 rounded-full" />
                      <div className="text-red-700">
                        <span className="font-bold">Error: </span> {showError}
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          newUser.firstName &&
                          newUser.lastName &&
                          newUser.email &&
                          newUser.password
                            ? "bg-green-500"
                            : "bg-amber-500"
                        }`}
                      />
                      <span>
                        {newUser.firstName &&
                        newUser.lastName &&
                        newUser.email &&
                        newUser.password
                          ? "All required fields are complete"
                          : "Fill in all required fields"}
                      </span>
                    </div>

                    <div className="flex items-center space-x-3 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={handleReset}
                        disabled={loading}
                        className="flex items-center justify-center space-x-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors w-full sm:w-auto"
                      >
                        <FiRefreshCw className="w-4 h-4" />
                        <span>Reset</span>
                      </button>

                      <button
                        type="submit"
                        disabled={
                          loading ||
                          !newUser.firstName ||
                          !newUser.lastName ||
                          !newUser.email ||
                          !newUser.password
                        }
                        className={`flex items-center justify-center space-x-2 px-8 py-3 font-medium rounded-xl transition-all w-full sm:w-auto ${
                          loading ||
                          !newUser.firstName ||
                          !newUser.lastName ||
                          !newUser.email ||
                          !newUser.password
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : "bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white shadow-lg hover:shadow-xl"
                        }`}
                      >
                        {loading ? (
                          <>
                            <svg
                              className="animate-spin h-5 w-5"
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
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              />
                            </svg>
                            <span>Creating Account...</span>
                          </>
                        ) : (
                          <>
                            <FiSave className="w-5 h-5" />
                            <span>Create Account</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddUser;
