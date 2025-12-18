import { useEffect, useState } from "react";
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
  FiSettings,
  FiFileText,
  FiShoppingCart,
  FiShield,
  FiTrendingUp,
  FiUsers,
  FiLock,
  FiBox,
  FiPackage,
  FiDollarSign,
  FiCreditCard,
  FiCheckCircle,
  FiClipboard,
  FiFile,
  FiBarChart2,
  FiChevronRight,
  FiChevronDown,
  FiSave,
  FiRefreshCw,
} from "react-icons/fi";
import { FaUserTie, FaWarehouse } from "react-icons/fa";
import {
  MdSecurity,
  MdOutlineAdminPanelSettings,
  MdCategory,
} from "react-icons/md";
import { HiOutlineChartBar } from "react-icons/hi";
import { BsPeople } from "react-icons/bs";
import toast from "react-hot-toast";
import BASE_URL from "../../../Utils/config";

const EditUser = ({ showModal, setShowModal, onUserUpdated, user }) => {
  const [showError, setShowError] = useState("");
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [activeTab, setActiveTab] = useState("personal");
  const [collapsedSections, setCollapsedSections] = useState({});

  const [editUser, setEditUser] = useState({
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
    photo: "",
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

  useEffect(() => {
    if (user) {
      setEditUser({
        firstName: user.firstName || "",
        secondName: user.secondName || "",
        lastName: user.lastName || "",
        userName: user.userName || "",
        dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split("T")[0] : "",
        gender: user.gender || "",
        email: user.email || "",
        contacts: user.contacts || "",
        address: user.address || "",
        title: user.title || "",
        password: "",
        roles: {
          canAddItems: user.roles?.canAddItems || false,
          canEditItems: user.roles?.canEditItems || false,
          canAddCategory: user.roles?.canAddCategory || false,
          canEditCategory: user.roles?.canEditCategory || false,
          canMakeTransaction: user.roles?.canMakeTransaction || false,
          canPayBillTransaction: user.roles?.canPayBillTransaction  || false,
          canApproveNewGrn: user.roles?.canApproveNewGrn || false,
          canPayBilledGrn: user.roles?.canPayBilledGrn || false,
          canChangeDebtStatus: user.roles?.canChangeDebtStatus || false,
          canPayDebt: user.roles?.canPayDebt || false,
          canAccessSettings: user.roles?.canAccessSettings || false,
          canAccessUserManagement: user.roles?.canAccessUserManagement || false,
          canAccessCustomerManagement:
            user.roles?.canAccessCustomerManagement || false,
          canAccessSupplierManagement:
            user.roles?.canAccessSupplierManagement || false,
          canSeeReports: user.roles?.canSeeReports || false,
          canAccessMadeniReport: user.roles?.canAccessMadeniReport || false,
        },
      });
      setPhotoPreview(user.photo ? `${BASE_URL}/pfps/${user.photo}` : null);
      setFile(null);
      setShowError("");
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditUser((prevUser) => ({ ...prevUser, [name]: value }));
    if (showError) setShowError("");
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setEditUser((prevUser) => ({
      ...prevUser,
      roles: { ...prevUser.roles, [name]: checked },
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleEditUser = async (e) => {
    e.preventDefault();

    if (!editUser.firstName.trim() || !editUser.lastName.trim()) {
      setShowError("First name and last name are required");
      return;
    }

    if (!editUser.email.trim()) {
      setShowError("Email is required");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editUser.email)) {
      setShowError("Please enter a valid email address");
      return;
    }

    if (editUser.password && editUser.password.length < 6) {
      setShowError("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("firstName", editUser.firstName);
      formData.append("secondName", editUser.secondName);
      formData.append("lastName", editUser.lastName);
      formData.append("userName", editUser.userName);
      formData.append("dateOfBirth", editUser.dateOfBirth);
      formData.append("gender", editUser.gender);
      formData.append("email", editUser.email);
      formData.append("contacts", editUser.contacts);
      formData.append("address", editUser.address);
      formData.append("title", editUser.title);
      if (editUser.password) {
        formData.append("password", editUser.password);
      }
      formData.append("roles", JSON.stringify(editUser.roles));
      if (file) {
        formData.append("photo", file);
      }

      await axios.put(`${BASE_URL}/api/users/update/${user._id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      toast.success("User updated successfully!");

      setTimeout(() => {
        setShowModal(false);
        onUserUpdated();
      }, 1500);
    } catch (error) {
      if (error.response && error.response.data) {
        setShowError(
          error.response.data.error ||
            error.response.data.message ||
            "Failed to update user. Please try again."
        );
      } else {
        setShowError("An error occurred. Please contact support.");
      }
      console.error("Update error:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Navigation tabs
  const tabs = [
    { id: "personal", label: "Personal Info", icon: <FiUser /> },
    { id: "security", label: "Security", icon: <FiLock /> },
    { id: "permissions", label: "Permissions", icon: <FiShield /> },
    { id: "summary", label: "Summary", icon: <FiFileText /> },
  ];

  // Permission groups with original colors
  const permissionGroups = [
    {
      id: "inventory",
      title: "Inventory Management",
      icon: <FaWarehouse />,
      color: "from-blue-500 to-cyan-500",
      bgColor: "from-blue-50 to-cyan-50",
      permissions: [
        { key: "canAddItems", label: "Add Items", icon: <FiBox /> },
        { key: "canEditItems", label: "Edit Items", icon: <FiPackage /> },
        {
          key: "canAddCategory",
          label: "Add Categories",
          icon: <MdCategory />,
        },
        {
          key: "canEditCategory",
          label: "Edit Categories",
          icon: <FiSettings />,
        },
      ],
    },
    {
      id: "transactions",
      title: "Transaction Management",
      icon: <FiCreditCard />,
      color: "from-emerald-500 to-green-500",
      bgColor: "from-emerald-50 to-green-50",
      permissions: [
        {
          key: "canMakeTransaction",
          label: "Make Transactions",
          icon: <FiTrendingUp />,
        },
        {
          key: "canPayBillTransaction",
          label: "Pay Bill Transactions",
          icon: <FiDollarSign />,
        },
      ],
    },
    {
      id: "grn",
      title: "GRN Management",
      icon: <FiClipboard />,
      color: "from-purple-500 to-violet-500",
      bgColor: "from-purple-50 to-violet-50",
      permissions: [
        {
          key: "canApproveNewGrn",
          label: "Approve New GRN",
          icon: <FiCheckCircle />,
        },
        {
          key: "canPayBilledGrn",
          label: "Pay Billed GRN",
          icon: <FiCreditCard />,
        },
      ],
    },
    {
      id: "debts",
      title: "Debt Management",
      icon: <FiCreditCard />,
      color: "from-amber-500 to-yellow-500",
      bgColor: "from-amber-50 to-yellow-50",
      permissions: [
        {
          key: "canChangeDebtStatus",
          label: "Change Debt Status",
          icon: <FiTrendingUp />,
        },
        { key: "canPayDebt", label: "Pay Debts", icon: <FiDollarSign /> },
      ],
    },
    {
      id: "administration",
      title: "System Administration",
      icon: <MdOutlineAdminPanelSettings />,
      color: "from-amber-500 to-orange-500",
      bgColor: "from-amber-50 to-orange-50",
      permissions: [
        {
          key: "canAccessSettings",
          label: "Access Settings",
          icon: <FiSettings />,
        },
        {
          key: "canAccessUserManagement",
          label: "User Management",
          icon: <FiUsers />,
        },
        {
          key: "canAccessCustomerManagement",
          label: "Customer Management",
          icon: <FiUser />,
        },
        {
          key: "canAccessSupplierManagement",
          label: "Supplier Management",
          icon: <BsPeople />,
        },
      ],
    },
    {
      id: "reports",
      title: "Reports & Analytics",
      icon: <HiOutlineChartBar />,
      color: "from-indigo-500 to-purple-500",
      bgColor: "from-indigo-50 to-purple-50",
      permissions: [
        { key: "canSeeReports", label: "View Reports", icon: <FiBarChart2 /> },
        {
          key: "canAccessMadeniReport",
          label: "Madeni Reports",
          icon: <FiFile />,
        },
      ],
    },
  ];

  // Role presets with original colors
  const rolePresets = [
    {
      id: "admin",
      name: "Administrator",
      description: "Full system access",
      icon: <FiShield />,
      color: "from-red-500 to-pink-500",
      roles: {
        canAddItems: true,
        canEditItems: true,
        canAddCategory: true,
        canEditCategory: true,
        canMakeTransaction: true,
        canPayBillTransaction: true,
        canApproveNewGrn: true,
        canPayBilledGrn: true,
        canChangeDebtStatus: true,
        canPayDebt: true,
        canAccessSettings: true,
        canAccessUserManagement: true,
        canAccessCustomerManagement: true,
        canAccessSupplierManagement: true,
        canSeeReports: true,
        canAccessMadeniReport: true,
      },
    },
    {
      id: "manager",
      name: "Store Manager",
      description: "Complete operational access",
      icon: <FiUser />,
      color: "from-blue-500 to-cyan-500",
      roles: {
        canAddItems: true,
        canEditItems: true,
        canAddCategory: true,
        canEditCategory: true,
        canMakeTransaction: true,
        canPayBillTransaction: true,
        canApproveNewGrn: true,
        canPayBilledGrn: true,
        canChangeDebtStatus: true,
        canPayDebt: true,
        canAccessSettings: false,
        canAccessUserManagement: false,
        canAccessCustomerManagement: true,
        canAccessSupplierManagement: true,
        canSeeReports: true,
        canAccessMadeniReport: true,
      },
    },
    {
      id: "staff",
      name: "Sales Staff",
      description: "Basic sales operations",
      icon: <FiShoppingCart />,
      color: "from-emerald-500 to-green-500",
      roles: {
        canAddItems: true,
        canEditItems: true,
        canAddCategory: false,
        canEditCategory: false,
        canMakeTransaction: true,
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
    },
    {
      id: "accountant",
      name: "Accountant",
      description: "Financial management",
      icon: <FiCreditCard />,
      color: "from-purple-500 to-violet-500",
      roles: {
        canAddItems: false,
        canEditItems: false,
        canAddCategory: false,
        canEditCategory: false,
        canMakeTransaction: true,
        canPayBillTransaction: true,
        canApproveNewGrn: true,
        canPayBilledGrn: true,
        canChangeDebtStatus: true,
        canPayDebt: true,
        canAccessSettings: false,
        canAccessUserManagement: false,
        canAccessCustomerManagement: true,
        canAccessSupplierManagement: true,
        canSeeReports: true,
        canAccessMadeniReport: true,
      },
    },
  ];

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={() => !loading && setShowModal(false)}
      />

      {/* Modal Container */}
      <div className="flex min-h-screen items-center justify-center p-2 sm:p-4">
        <div className="relative w-full max-w-6xl mx-auto">
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
                      Edit User Profile
                    </h2>
                    <p className="text-green-100 text-xs sm:text-sm mt-1">
                      Update user information and permissions
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
                      <span className="sm:hidden">
                        {tab.label.split(" ")[0]}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Content Area */}
            <div className="p-4 sm:p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
              <form onSubmit={handleEditUser}>
                {/* Personal Info Tab */}
                {activeTab === "personal" && (
                  <div className="space-y-6 text-black">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Left Column - Profile Photo */}
                      <div className="lg:col-span-1">
                        <div className="bg-gradient-to-br from-gray-50 to-white p-4 sm:p-6 rounded-xl border border-gray-200">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Profile Photo
                          </h3>
                          <div className="space-y-4">
                            <div className="flex justify-center">
                              <div className="relative">
                                <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gradient-to-br from-green-50 to-emerald-50">
                                  {photoPreview ? (
                                    <img
                                      src={photoPreview}
                                      alt="Profile"
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <FiUser className="w-16 h-16 sm:w-20 sm:h-20 text-green-300" />
                                    </div>
                                  )}
                                </div>
                                {photoPreview && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setPhotoPreview(
                                        user?.photo
                                          ? `${BASE_URL}/uploads/${user.photo}`
                                          : null
                                      );
                                      setFile(null);
                                    }}
                                    className="absolute bottom-2 right-2 w-8 h-8 bg-gradient-to-br from-red-500 to-pink-500 text-white rounded-full flex items-center justify-center shadow-lg"
                                  >
                                    <FiX className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </div>

                            <div>
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
                                className={`flex items-center justify-center space-x-2 w-full px-4 py-3 rounded-xl cursor-pointer transition-all ${
                                  loading
                                    ? "bg-gray-100 cursor-not-allowed"
                                    : "bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white shadow-md hover:shadow-lg"
                                }`}
                              >
                                <FiUpload className="w-4 h-4 sm:w-5 sm:h-5" />
                                <span className="font-medium text-sm sm:text-base">
                                  {file ? "Change Photo" : "Upload New Photo"}
                                </span>
                              </label>
                              {file && (
                                <p className="text-sm text-gray-600 mt-2 text-center">
                                  Selected:{" "}
                                  <span className="font-medium">
                                    {file.name}
                                  </span>
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right Column - Personal Info Form */}
                      <div className="lg:col-span-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                          {/* Basic Information */}
                          <div className="sm:col-span-2">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                              Basic Information
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  First Name{" "}
                                  <span className="text-red-500">*</span>
                                </label>
                                <input
                                  type="text"
                                  name="firstName"
                                  value={editUser.firstName}
                                  onChange={handleChange}
                                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                                  placeholder="Enter first name"
                                  required
                                  disabled={loading}
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Middle Name
                                </label>
                                <input
                                  type="text"
                                  name="secondName"
                                  value={editUser.secondName}
                                  onChange={handleChange}
                                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                                  placeholder="Enter middle name"
                                  disabled={loading}
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Last Name{" "}
                                  <span className="text-red-500">*</span>
                                </label>
                                <input
                                  type="text"
                                  name="lastName"
                                  value={editUser.lastName}
                                  onChange={handleChange}
                                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                                  placeholder="Enter last name"
                                  required
                                  disabled={loading}
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Username
                                </label>
                                <input
                                  type="text"
                                  name="userName"
                                  value={editUser.userName}
                                  onChange={handleChange}
                                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                                  placeholder="Enter username"
                                  disabled={loading}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Contact Information */}
                          <div className="sm:col-span-2">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                              Contact Information
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Email <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                  <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                  <input
                                    type="email"
                                    name="email"
                                    value={editUser.email}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                                    placeholder="user@example.com"
                                    required
                                    disabled={loading}
                                  />
                                </div>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Phone Number
                                </label>
                                <div className="relative">
                                  <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                  <input
                                    type="tel"
                                    name="contacts"
                                    value={editUser.contacts}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                                    placeholder="+255 XXX XXX XXX"
                                    disabled={loading}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Additional Information */}
                          <div className="sm:col-span-2">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                              Additional Information
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Date of Birth
                                </label>
                                <div className="relative">
                                  <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                  <input
                                    type="date"
                                    name="dateOfBirth"
                                    value={editUser.dateOfBirth}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                                    disabled={loading}
                                  />
                                </div>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Gender
                                </label>
                                <select
                                  name="gender"
                                  value={editUser.gender}
                                  onChange={handleChange}
                                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                                  disabled={loading}
                                >
                                  <option value="">Select Gender</option>
                                  <option value="Male">Male</option>
                                  <option value="Female">Female</option>
                                  <option value="Other">Other</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Job Title
                                </label>
                                <div className="relative">
                                  <FaUserTie className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                  <input
                                    type="text"
                                    name="title"
                                    value={editUser.title}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                                    placeholder="Enter job title"
                                    disabled={loading}
                                  />
                                </div>
                              </div>
                              <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Address
                                </label>
                                <div className="relative">
                                  <FiHome className="absolute left-3 top-3 text-gray-400" />
                                  <textarea
                                    name="address"
                                    value={editUser.address}
                                    onChange={handleChange}
                                    rows="3"
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                                    placeholder="Enter complete address"
                                    disabled={loading}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Security Tab */}
                {activeTab === "security" && (
                  <div className="space-y-6 text-black">
                    <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-6 rounded-2xl border border-emerald-100">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="p-2 bg-emerald-100 rounded-lg">
                          <FiLock className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            Account Security
                          </h3>
                          <p className="text-sm text-gray-600">
                            Update password and security settings
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4 max-w-md">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            New Password
                            <span className="text-xs text-gray-500 ml-2">
                              (Optional - leave blank to keep current)
                            </span>
                          </label>
                          <div className="relative">
                            <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                              type="password"
                              name="password"
                              value={editUser.password}
                              onChange={handleChange}
                              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                              placeholder="Enter new password (min 6 characters)"
                              disabled={loading}
                            />
                          </div>
                          {editUser.password && (
                            <div
                              className={`mt-2 text-sm ${
                                editUser.password.length >= 6
                                  ? "text-green-600"
                                  : "text-amber-600"
                              }`}
                            >
                              {editUser.password.length >= 6
                                ? "✓ Strong password"
                                : "Password must be at least 6 characters"}
                            </div>
                          )}
                        </div>

                        <div className="pt-4 border-t border-emerald-100">
                          <h4 className="font-medium text-gray-700 mb-2">
                            Password Requirements
                          </h4>
                          <ul className="text-sm text-gray-600 space-y-1">
                            <li className="flex items-center">
                              <div
                                className={`w-2 h-2 rounded-full mr-2 ${
                                  editUser.password.length >= 6
                                    ? "bg-green-500"
                                    : "bg-gray-300"
                                }`}
                              />
                              Minimum 6 characters
                            </li>
                            <li className="flex items-center">
                              <div className="w-2 h-2 rounded-full mr-2 bg-emerald-500" />
                              Can include letters, numbers, and symbols
                            </li>
                            <li className="flex items-center">
                              <div className="w-2 h-2 rounded-full mr-2 bg-emerald-500" />
                              Case sensitive
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Permissions Tab */}
                {activeTab === "permissions" && (
                  <div className="space-y-6">
                    {/* Quick Role Presets */}
                    <div className="bg-gradient-to-br from-gray-50 to-white p-4 sm:p-6 rounded-2xl border border-gray-200">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-gray-100 rounded-lg">
                            <MdSecurity className="w-6 h-6 text-gray-700" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              Quick Role Presets
                            </h3>
                            <p className="text-sm text-gray-600">
                              Apply predefined permission sets
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {rolePresets.map((preset) => (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() =>
                              setEditUser((prev) => ({
                                ...prev,
                                roles: preset.roles,
                              }))
                            }
                            className={`group p-4 rounded-xl border transition-all text-left ${
                              Object.keys(editUser.roles).every(
                                (key) =>
                                  editUser.roles[key] === preset.roles[key]
                              )
                                ? `border-emerald-500 bg-gradient-to-br ${
                                    preset.bgColor || "from-gray-50 to-white"
                                  } ring-2 ring-emerald-200`
                                : "border-gray-200 hover:border-gray-300 hover:shadow-md"
                            }`}
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div
                                className={`p-2 rounded-lg bg-gradient-to-br ${preset.color}`}
                              >
                                <div className="text-white">{preset.icon}</div>
                              </div>
                              <div
                                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                  Object.keys(editUser.roles).every(
                                    (key) =>
                                      editUser.roles[key] === preset.roles[key]
                                  )
                                    ? "border-emerald-500 bg-emerald-500"
                                    : "border-gray-300"
                                }`}
                              >
                                {Object.keys(editUser.roles).every(
                                  (key) =>
                                    editUser.roles[key] === preset.roles[key]
                                ) && <FiCheck className="w-3 h-3 text-white" />}
                              </div>
                            </div>
                            <h4 className="font-bold text-gray-900 mb-1">
                              {preset.name}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {preset.description}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Detailed Permissions */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-gray-100 rounded-lg">
                            <FiShield className="w-6 h-6 text-gray-700" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              Detailed Permissions
                            </h3>
                            <p className="text-sm text-gray-600">
                              Customize individual permissions
                            </p>
                          </div>
                        </div>
                        <div className="text-sm text-gray-600">
                          <span className="font-semibold text-emerald-600">
                            {
                              Object.values(editUser.roles).filter(Boolean)
                                .length
                            }
                          </span>{" "}
                          of {Object.keys(editUser.roles).length} permissions
                          enabled
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {permissionGroups.map((group) => (
                          <div
                            key={group.id}
                            className={`bg-gradient-to-br ${group.bgColor} border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow`}
                          >
                            <div
                              className={`p-4 bg-gradient-to-r ${group.color}`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                                    <div className="text-white">
                                      {group.icon}
                                    </div>
                                  </div>
                                  <h4 className="font-bold text-white">
                                    {group.title}
                                  </h4>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => toggleSection(group.id)}
                                  className="text-white hover:bg-white/10 p-1 rounded-lg"
                                >
                                  {collapsedSections[group.id] ? (
                                    <FiChevronRight />
                                  ) : (
                                    <FiChevronDown />
                                  )}
                                </button>
                              </div>
                            </div>

                            {!collapsedSections[group.id] && (
                              <div className="p-4 space-y-3">
                                {group.permissions.map((permission) => (
                                  <div
                                    key={permission.key}
                                    className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100 hover:border-gray-200 transition-colors"
                                  >
                                    <div className="flex items-center space-x-3">
                                      <div className="p-1.5 rounded-lg bg-gray-100 text-gray-600">
                                        {permission.icon}
                                      </div>
                                      <div>
                                        <div className="font-medium text-gray-900">
                                          {permission.label}
                                        </div>
                                      </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                      <input
                                        type="checkbox"
                                        name={permission.key}
                                        checked={editUser.roles[permission.key]}
                                        onChange={handleCheckboxChange}
                                        className="sr-only peer"
                                        disabled={loading}
                                      />
                                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-emerald-500 peer-checked:to-green-500"></div>
                                    </label>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Summary Tab */}
                {activeTab === "summary" && (
                  <div className="space-y-6">
                    {/* Validation Status */}
                    <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-6 rounded-2xl border border-emerald-100">
                      <div className="flex items-center space-x-3 mb-6">
                        <div className="p-2 bg-emerald-100 rounded-lg">
                          <FiCheckCircle className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            Validation Summary
                          </h3>
                          <p className="text-sm text-gray-600">
                            Review all information before saving
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                          {
                            label: "First Name",
                            value: editUser.firstName,
                            required: true,
                          },
                          {
                            label: "Last Name",
                            value: editUser.lastName,
                            required: true,
                          },
                          {
                            label: "Email",
                            value: editUser.email,
                            required: true,
                          },
                          {
                            label: "Password",
                            value: editUser.password,
                            required: false,
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
                                ? "Required field missing"
                                : field.value
                                ? "✓ Valid"
                                : "Optional"}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Permission Summary */}
                    <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-2xl border border-gray-200">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-gray-100 rounded-lg">
                            <FiFileText className="w-6 h-6 text-gray-700" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              Permission Summary
                            </h3>
                            <p className="text-sm text-gray-600">
                              Overview of enabled permissions
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {permissionGroups.map((group) => {
                          const totalPermissions = group.permissions.length;
                          const enabledPermissions = group.permissions.filter(
                            (p) => editUser.roles[p.key]
                          ).length;
                          const percentage =
                            (enabledPermissions / totalPermissions) * 100;

                          return (
                            <div
                              key={group.id}
                              className="p-4 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors"
                            >
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center space-x-2">
                                  <div
                                    className={`p-1.5 rounded-lg bg-gradient-to-br ${group.color} bg-opacity-20`}
                                  >
                                    <div className="text-gray-700">
                                      {group.icon}
                                    </div>
                                  </div>
                                  <span className="font-medium text-gray-900">
                                    {group.title}
                                  </span>
                                </div>
                                <span
                                  className={`text-sm font-semibold ${
                                    percentage === 100
                                      ? "text-green-600"
                                      : percentage > 50
                                      ? "text-emerald-600"
                                      : "text-gray-600"
                                  }`}
                                >
                                  {enabledPermissions}/{totalPermissions}
                                </span>
                              </div>
                              <div className="space-y-2">
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className={`h-2 rounded-full bg-gradient-to-r ${group.color}`}
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>
                                <div className="text-xs text-gray-500">
                                  {percentage === 100
                                    ? "All permissions enabled"
                                    : percentage === 0
                                    ? "No permissions enabled"
                                    : `${Math.round(
                                        percentage
                                      )}% of permissions enabled`}
                                </div>
                              </div>
                            </div>
                          );
                        })}
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
                          editUser.firstName &&
                          editUser.lastName &&
                          editUser.email
                            ? "bg-green-500"
                            : "bg-amber-500"
                        }`}
                      />
                      <span>
                        {editUser.firstName &&
                        editUser.lastName &&
                        editUser.email
                          ? "All required fields are valid"
                          : "Fill in all required fields"}
                      </span>
                    </div>

                    <div className="flex items-center space-x-3 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={() => {
                          if (user) {
                            setEditUser({
                              firstName: user.firstName || "",
                              secondName: user.secondName || "",
                              lastName: user.lastName || "",
                              userName: user.userName || "",
                              dateOfBirth: user.dateOfBirth
                                ? user.dateOfBirth.split("T")[0]
                                : "",
                              gender: user.gender || "",
                              email: user.email || "",
                              contacts: user.contacts || "",
                              address: user.address || "",
                              title: user.title || "",
                              password: "",
                              roles: {
                                canAddItems: user.roles?.canAddItems || false,
                                canEditItems: user.roles?.canEditItems || false,
                                canAddCategory:
                                  user.roles?.canAddCategory || false,
                                canEditCategory:
                                  user.roles?.canEditCategory || false,
                                canMakeTransaction:
                                  user.roles?.canMakeTransaction || false,
                                canPayBillTransaction:
                                  user.roles?.canPayBillTransaction || false,
                                canApproveNewGrn:
                                  user.roles?.canApproveNewGrn || false,
                                canPayBilledGrn:
                                  user.roles?.canPayBilledGrn || false,
                                canChangeDebtStatus:
                                  user.roles?.canChangeDebtStatus || false,
                                canPayDebt: user.roles?.canPayDebt || false,
                                canAccessSettings:
                                  user.roles?.canAccessSettings || false,
                                canAccessUserManagement:
                                  user.roles?.canAccessUserManagement || false,
                                canAccessCustomerManagement:
                                  user.roles?.canAccessCustomerManagement ||
                                  false,
                                canAccessSupplierManagement:
                                  user.roles?.canAccessSupplierManagement ||
                                  false,
                                canSeeReports:
                                  user.roles?.canSeeReports || false,
                                canAccessMadeniReport:
                                  user.roles?.canAccessMadeniReport || false,
                              },
                            });
                            setPhotoPreview(
                              user.photo
                                ? `${BASE_URL}/pfps/${user.photo}`
                                : null
                            );
                            setFile(null);
                            setShowError("");
                          }
                        }}
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
                          !editUser.firstName ||
                          !editUser.lastName ||
                          !editUser.email
                        }
                        className={`flex items-center justify-center space-x-2 px-8 py-3 font-medium rounded-xl transition-all w-full sm:w-auto ${
                          loading ||
                          !editUser.firstName ||
                          !editUser.lastName ||
                          !editUser.email
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
                            <span>Saving...</span>
                          </>
                        ) : (
                          <>
                            <FiSave className="w-5 h-5" />
                            <span>Save Changes</span>
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

export default EditUser;
