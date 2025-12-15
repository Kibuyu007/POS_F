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
  FiEye,
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
} from "react-icons/fi";
import { FaUserTag, FaUserTie, FaWarehouse } from "react-icons/fa";
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
  const [activeTab, setActiveTab] = useState("overview");
  const [activeRoleTab, setActiveRoleTab] = useState("all");

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
      CanEditCategory: false,
      canMakeTransaction: false,
      canPayBillTransaction: false,
      canApproveNewGrn: false,
      canPayBilledGrn: false,
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
          CanEditCategory: user.roles?.CanEditCategory || false,
          canMakeTransaction: user.roles?.canMakeTransaction || false,
          canPayBillTransaction: user.roles?.canPayBillTransaction || false,
          canApproveNewGrn: user.roles?.canApproveNewGrn || false,
          canPayBilledGrn: user.roles?.canPayBilledGrn || false,
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
      setPhotoPreview(user.photo ? `${BASE_URL}/uploads/${user.photo}` : null);
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

    // Validation
    if (!editUser.firstName.trim() || !editUser.lastName.trim()) {
      setShowError("First name and last name are required");
      return;
    }

    if (!editUser.email.trim()) {
      setShowError("Email is required");
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

  const handleReset = () => {
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
          CanEditCategory: user.roles?.CanEditCategory || false,
          canMakeTransaction: user.roles?.canMakeTransaction || false,
          canPayBillTransaction: user.roles?.canPayBillTransaction || false,
          canApproveNewGrn: user.roles?.canApproveNewGrn || false,
          canPayBilledGrn: user.roles?.canPayBilledGrn || false,
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
      setPhotoPreview(user.photo ? `${BASE_URL}/uploads/${user.photo}` : null);
      setFile(null);
    }
    setShowError("");
  };

  // Organized permission groups with colors - SAME AS AddUser
  const permissionGroups = [
    {
      id: "inventory",
      title: "Inventory Management",
      icon: <FaWarehouse className="w-5 h-5" />,
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-gradient-to-br from-blue-50 to-cyan-50",
      borderColor: "border-blue-200",
      permissions: [
        {
          key: "canAddItems",
          label: "Add Items",
          description: "Create new inventory items",
          icon: <FiBox className="w-4 h-4" />,
        },
        {
          key: "canEditItems",
          label: "Edit Items",
          description: "Modify existing inventory items",
          icon: <FiPackage className="w-4 h-4" />,
        },
        {
          key: "canAddCategory",
          label: "Add Categories",
          description: "Create new product categories",
          icon: <MdCategory className="w-4 h-4" />,
        },
        {
          key: "CanEditCategory",
          label: "Edit Categories",
          description: "Modify existing categories",
          icon: <FiSettings className="w-4 h-4" />,
        },
      ],
    },
    {
      id: "transactions",
      title: "Transaction Management",
      icon: <FiCreditCard className="w-5 h-5" />,
      color: "from-emerald-500 to-green-500",
      bgColor: "bg-gradient-to-br from-emerald-50 to-green-50",
      borderColor: "border-emerald-200",
      permissions: [
        {
          key: "canMakeTransaction",
          label: "Make Transactions",
          description: "Process sales and purchases",
          icon: <FiTrendingUp className="w-4 h-4" />,
        },
        {
          key: "canPayBillTransaction",
          label: "Pay Bill Transactions",
          description: "Settle outstanding bills",
          icon: <FiDollarSign className="w-4 h-4" />,
        },
      ],
    },
    {
      id: "grn",
      title: "GRN Management",
      icon: <FiClipboard className="w-5 h-5" />,
      color: "from-purple-500 to-violet-500",
      bgColor: "bg-gradient-to-br from-purple-50 to-violet-50",
      borderColor: "border-purple-200",
      permissions: [
        {
          key: "canApproveNewGrn",
          label: "Approve New GRN",
          description: "Approve new Goods Received Notes",
          icon: <FiCheckCircle className="w-4 h-4" />,
        },
        {
          key: "canPayBilledGrn",
          label: "Pay Billed GRN",
          description: "Process payments for billed GRNs",
          icon: <FiCreditCard className="w-4 h-4" />,
        },
      ],
    },
    {
      id: "administration",
      title: "System Administration",
      icon: <MdOutlineAdminPanelSettings className="w-5 h-5" />,
      color: "from-amber-500 to-orange-500",
      bgColor: "bg-gradient-to-br from-amber-50 to-orange-50",
      borderColor: "border-amber-200",
      permissions: [
        {
          key: "canAccessSettings",
          label: "Access Settings",
          description: "Configure system settings",
          icon: <FiSettings className="w-4 h-4" />,
        },
        {
          key: "canAccessUserManagement",
          label: "User Management",
          description: "Manage user accounts",
          icon: <FiUsers className="w-4 h-4" />,
        },
        {
          key: "canAccessCustomerManagement",
          label: "Customer Management",
          description: "Manage customer profiles",
          icon: <FiUser className="w-4 h-4" />,
        },
        {
          key: "canAccessSupplierManagement",
          label: "Supplier Management",
          description: "Manage supplier information",
          icon: <BsPeople className="w-4 h-4" />,
        },
      ],
    },
    {
      id: "reports",
      title: "Reports & Analytics",
      icon: <HiOutlineChartBar className="w-5 h-5" />,
      color: "from-indigo-500 to-purple-500",
      bgColor: "bg-gradient-to-br from-indigo-50 to-purple-50",
      borderColor: "border-indigo-200",
      permissions: [
        {
          key: "canSeeReports",
          label: "View Reports",
          description: "Access all analytical reports",
          icon: <FiBarChart2 className="w-4 h-4" />,
        },
        {
          key: "canAccessMadeniReport",
          label: "Madeni Reports",
          description: "Access debt/credit reports",
          icon: <FiFile className="w-4 h-4" />,
        },
      ],
    },
  ];

  const fieldGroups = [
    {
      title: "Personal Information",
      fields: [
        {
          name: "firstName",
          label: "First Name",
          type: "text",
          icon: <FiUser className="w-4 h-4" />,
          required: true,
        },
        {
          name: "secondName",
          label: "Middle Name",
          type: "text",
          icon: <FiUser className="w-4 h-4" />,
        },
        {
          name: "lastName",
          label: "Last Name",
          type: "text",
          icon: <FiUser className="w-4 h-4" />,
          required: true,
        },
        {
          name: "userName",
          label: "Username",
          type: "text",
          icon: <FaUserTag className="w-4 h-4" />,
        },
        {
          name: "dateOfBirth",
          label: "Date of Birth",
          type: "date",
          icon: <FiCalendar className="w-4 h-4" />,
        },
        {
          name: "gender",
          label: "Gender",
          type: "select",
          options: ["", "Male", "Female", "Other"],
          icon: <FiUser className="w-4 h-4" />,
        },
      ],
    },
    {
      title: "Contact Information",
      fields: [
        {
          name: "email",
          label: "Email",
          type: "email",
          icon: <FiMail className="w-4 h-4" />,
          required: true,
        },
        {
          name: "contacts",
          label: "Phone Number",
          type: "tel",
          icon: <FiPhone className="w-4 h-4" />,
        },
        {
          name: "address",
          label: "Address",
          type: "text",
          icon: <FiHome className="w-4 h-4" />,
        },
        {
          name: "title",
          label: "Job Title",
          type: "text",
          icon: <FaUserTie className="w-4 h-4" />,
        },
      ],
    },
  ];

  // Quick preset configurations - SAME AS AddUser
  const rolePresets = [
    {
      id: "admin",
      name: "Administrator",
      description: "Full system access",
      icon: <FiShield className="w-5 h-5" />,
      color: "from-red-500 to-pink-500",
      roles: {
        canAddItems: true,
        canEditItems: true,
        canAddCategory: true,
        CanEditCategory: true,
        canMakeTransaction: true,
        canPayBillTransaction: true,
        canApproveNewGrn: true,
        canPayBilledGrn: true,
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
      icon: <FiUser className="w-5 h-5" />,
      color: "from-blue-500 to-cyan-500",
      roles: {
        canAddItems: true,
        canEditItems: true,
        canAddCategory: true,
        CanEditCategory: true,
        canMakeTransaction: true,
        canPayBillTransaction: true,
        canApproveNewGrn: true,
        canPayBilledGrn: true,
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
      icon: <FiShoppingCart className="w-5 h-5" />,
      color: "from-emerald-500 to-green-500",
      roles: {
        canAddItems: true,
        canEditItems: true,
        canAddCategory: false,
        CanEditCategory: false,
        canMakeTransaction: true,
        canPayBillTransaction: false,
        canApproveNewGrn: false,
        canPayBilledGrn: false,
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
      icon: <FiCreditCard className="w-5 h-5" />,
      color: "from-purple-500 to-violet-500",
      roles: {
        canAddItems: false,
        canEditItems: false,
        canAddCategory: false,
        CanEditCategory: false,
        canMakeTransaction: true,
        canPayBillTransaction: true,
        canApproveNewGrn: true,
        canPayBilledGrn: true,
        canAccessSettings: false,
        canAccessUserManagement: false,
        canAccessCustomerManagement: true,
        canAccessSupplierManagement: true,
        canSeeReports: true,
        canAccessMadeniReport: true,
      },
    },
  ];

  const allPermissions = permissionGroups.flatMap((group) => group.permissions);

  return (
    <>
      {showModal && (
        <div className="flex justify-center items-center overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-non backdrop-blur-sm">
          <div className="w-full md:w-11/12 lg:w-10/12 xl:w-8/12 2xl:w-6/12 max-h-[90vh] overflow-y-auto animate-fadeIn">
            <div className="border border-gray-200 rounded-2xl shadow-2xl relative flex flex-col w-full bg-white outline-none focus:outline-none">
              {/* Header - GREEN COLOR SCHEME */}
              <div className="flex items-start justify-between p-6 bg-gradient-to-r from-green-400 to-emerald-500 border-b border-emerald-600/20 rounded-t-2xl">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                    <FiUser className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">Edit User</h3>
                    <p className="text-white/90 text-sm mt-1">
                      Update user account information and permissions
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
                <form onSubmit={handleEditUser} className="space-y-8">
                  {/* Field Groups - GREEN COLOR SCHEME */}
                  {fieldGroups.map((group, groupIndex) => (
                    <div key={groupIndex} className="space-y-4">
                      <div className="flex items-center gap-3 mb-4">
                        <div
                          className={`w-2 h-8 bg-gradient-to-b ${
                            groupIndex === 0
                              ? "from-blue-500 to-cyan-500"
                              : "from-emerald-500 to-green-500"
                          } rounded-full`}
                        />
                        <div>
                          <h4 className="text-lg font-bold text-gray-900">
                            {group.title}
                          </h4>
                          <p className="text-sm text-gray-500 mt-1">
                            Update user {group.title.toLowerCase()}
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
                                  value={editUser[field.name]}
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
                                  value={editUser[field.name]}
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

                  {/* Password Field - GREEN COLOR SCHEME */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-2 h-8 bg-gradient-to-b from-emerald-500 to-green-500 rounded-full" />
                      <div>
                        <h4 className="text-lg font-bold text-gray-900">
                          Security
                        </h4>
                        <p className="text-sm text-gray-500 mt-1">
                          Update account credentials (optional)
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-bold text-gray-900">
                        New Password
                        <span className="text-xs text-gray-500">
                          (Optional)
                        </span>
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <FiLock className="w-4 h-4 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                        </div>
                        <input
                          type="password"
                          name="password"
                          value={editUser.password}
                          onChange={handleChange}
                          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
                          placeholder="Enter new password (optional)"
                          disabled={loading}
                          autoComplete="new-password"
                        />
                      </div>
                      <p className="text-sm text-gray-500 mt-2">
                        Leave blank to keep current password
                      </p>
                    </div>
                  </div>

                  {/* Photo Upload - GREEN COLOR SCHEME */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-2 h-8 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full" />
                      <div>
                        <h4 className="text-lg font-bold text-gray-900">
                          Profile Photo
                        </h4>
                        <p className="text-sm text-gray-500 mt-1">
                          Update profile picture (optional)
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
                        {photoPreview && file && (
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
                              {file ? "Change Photo" : "Choose New Photo"}
                            </span>
                          </label>
                          {file && (
                            <p className="text-sm text-gray-600 bg-white/50 p-2 rounded-lg">
                              <span className="font-medium">Selected:</span>{" "}
                              {file.name}
                            </p>
                          )}
                          {!file && user?.photo && (
                            <p className="text-sm text-gray-500 mt-2">
                              Current photo will be kept if no new photo is
                              selected
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Roles and Permissions - GREEN COLOR SCHEME */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-2 h-8 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-lg font-bold text-gray-900">
                              Roles & Permissions
                            </h4>
                            <p className="text-sm text-gray-500 mt-1">
                              Update user access levels and capabilities
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="bg-gray-100 rounded-xl p-1 flex">
                              {["overview", "details"].map((tab) => (
                                <button
                                  key={tab}
                                  type="button"
                                  onClick={() => setActiveTab(tab)}
                                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                    activeTab === tab
                                      ? "bg-white shadow-sm text-gray-900"
                                      : "text-gray-600 hover:text-gray-900"
                                  }`}
                                >
                                  {tab === "overview" ? (
                                    <FiEye className="w-4 h-4" />
                                  ) : (
                                    <FiFileText className="w-4 h-4" />
                                  )}
                                  {tab === "overview" ? "Overview" : "Detailed"}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Quick Role Presets - GREEN COLOR SCHEME */}
                    <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-5 border border-gray-200">
                      <div className="flex items-center gap-3 mb-4">
                        <MdSecurity className="w-5 h-5 text-gray-700" />
                        <h5 className="font-bold text-gray-900">
                          Quick Role Presets
                        </h5>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                            className="group relative p-4 rounded-xl border border-gray-200 bg-white hover:shadow-lg transition-all text-left"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div
                                className={`p-2 rounded-lg bg-gradient-to-br ${preset.color} shadow-sm`}
                              >
                                {preset.icon}
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
                            <h6 className="font-bold text-gray-900 mb-1">
                              {preset.name}
                            </h6>
                            <p className="text-sm text-gray-600">
                              {preset.description}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>

                    {activeTab === "overview" ? (
                      // Overview Tab - Compact Grid - GREEN COLOR SCHEME
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {permissionGroups.map((group) => (
                          <div
                            key={group.id}
                            className={`p-5 rounded-xl border ${group.borderColor} ${group.bgColor} transition-all hover:shadow-md`}
                          >
                            <div className="flex items-center gap-3 mb-4">
                              <div
                                className={`p-2 rounded-lg bg-gradient-to-br ${group.color} shadow-sm`}
                              >
                                {group.icon}
                              </div>
                              <h5 className="font-bold text-gray-900">
                                {group.title}
                              </h5>
                            </div>
                            <div className="space-y-3">
                              {group.permissions.map((permission) => (
                                <div
                                  key={permission.key}
                                  className="flex items-center justify-between p-3 bg-white/80 rounded-lg border border-white"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="text-gray-600">
                                      {permission.icon}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="font-medium text-gray-900 text-sm truncate">
                                        {permission.label}
                                      </p>
                                      <p className="text-xs text-gray-500 truncate">
                                        {permission.description}
                                      </p>
                                    </div>
                                  </div>
                                  <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                                    <input
                                      type="checkbox"
                                      name={permission.key}
                                      checked={editUser.roles[permission.key]}
                                      onChange={handleCheckboxChange}
                                      className="sr-only peer"
                                      disabled={loading}
                                    />
                                    <div className="w-12 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-emerald-500 peer-checked:to-green-500"></div>
                                  </label>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      // Detailed View Tab - GREEN COLOR SCHEME
                      <div className="space-y-4">
                        <div className="flex gap-2 overflow-x-auto pb-2">
                          <button
                            type="button"
                            onClick={() => setActiveRoleTab("all")}
                            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                              activeRoleTab === "all"
                                ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                          >
                            All Permissions
                          </button>
                          {permissionGroups.map((group) => (
                            <button
                              key={group.id}
                              type="button"
                              onClick={() => setActiveRoleTab(group.id)}
                              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                                activeRoleTab === group.id
                                  ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white"
                                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                              }`}
                            >
                              {group.title}
                            </button>
                          ))}
                        </div>

                        <div className="space-y-3">
                          {(activeRoleTab === "all"
                            ? allPermissions
                            : permissionGroups.find(
                                (g) => g.id === activeRoleTab
                              )?.permissions || []
                          ).map((permission) => (
                            <div
                              key={permission.key}
                              className="flex items-center justify-between p-4 bg-gradient-to-r from-white to-gray-50 rounded-xl border border-gray-200 hover:border-emerald-300 transition-colors"
                            >
                              <div className="flex items-center gap-4">
                                <div
                                  className={`p-2 rounded-lg ${
                                    editUser.roles[permission.key]
                                      ? "bg-gradient-to-r from-emerald-500 to-green-500"
                                      : "bg-gray-100"
                                  }`}
                                >
                                  <div
                                    className={
                                      editUser.roles[permission.key]
                                        ? "text-white"
                                        : "text-gray-600"
                                    }
                                  >
                                    {permission.icon}
                                  </div>
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h6 className="font-bold text-gray-900">
                                      {permission.label}
                                    </h6>
                                    {editUser.roles[permission.key] && (
                                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-full">
                                        Active
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-600 mt-1">
                                    {permission.description}
                                  </p>
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
                                <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-emerald-500 peer-checked:to-green-500 shadow-inner"></div>
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Permission Summary - GREEN COLOR SCHEME */}
                  <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-5 border border-gray-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-2 h-6 bg-gradient-to-b from-blue-500 to-cyan-500 rounded-full" />
                      <div className="flex-1 flex items-center justify-between">
                        <h5 className="font-bold text-gray-900">
                          Permission Summary
                        </h5>
                        <span className="text-sm font-medium text-emerald-600">
                          {Object.values(editUser.roles).filter(Boolean).length}{" "}
                          of {Object.keys(editUser.roles).length} permissions
                          enabled
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                      {permissionGroups.map((group) => {
                        const totalPermissions = group.permissions.length;
                        const enabledPermissions = group.permissions.filter(
                          (p) => editUser.roles[p.key]
                        ).length;
                        return (
                          <div
                            key={group.id}
                            className="p-3 rounded-lg bg-white border border-gray-200"
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <div
                                className={`p-1 rounded bg-gradient-to-br ${group.color}`}
                              >
                                {group.icon}
                              </div>
                              <h6 className="font-semibold text-gray-900 text-sm">
                                {group.title}
                              </h6>
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-600">
                                  Enabled
                                </span>
                                <span className="text-sm font-bold text-emerald-600">
                                  {enabledPermissions}/{totalPermissions}
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-1.5">
                                <div
                                  className={`h-1.5 rounded-full bg-gradient-to-r ${group.color}`}
                                  style={{
                                    width: `${
                                      (enabledPermissions / totalPermissions) *
                                      100
                                    }%`,
                                  }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Validation Summary - GREEN COLOR SCHEME */}
                  <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-5 border border-gray-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-2 h-6 bg-gradient-to-b from-blue-500 to-cyan-500 rounded-full" />
                      <h5 className="font-bold text-gray-900">
                        Validation Summary
                      </h5>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {[
                        { label: "First Name", value: editUser.firstName },
                        { label: "Last Name", value: editUser.lastName },
                        { label: "Email", value: editUser.email },
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

                  {/* Submit Button - GREEN COLOR SCHEME */}
                  <div className="sticky bottom-0 bg-white/90 backdrop-blur-sm -mx-6 px-6 py-4 border-t border-gray-200">
                    <button
                      type="submit"
                      disabled={
                        loading ||
                        !editUser.firstName ||
                        !editUser.lastName ||
                        !editUser.email
                      }
                      className={`w-full py-4 font-bold rounded-xl flex items-center justify-center gap-3 transition-all ${
                        loading ||
                        !editUser.firstName ||
                        !editUser.lastName ||
                        !editUser.email
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
                          <span>Updating User Account...</span>
                        </>
                      ) : (
                        <>
                          <FiCheck className="w-6 h-6" />
                          <span>Update User Account</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* Footer - GREEN COLOR SCHEME */}
              <div className="flex items-center justify-between p-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={loading}
                  className="px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-800 font-semibold rounded-xl transition-all shadow-sm hover:shadow"
                >
                  Reset Changes
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

export default EditUser;
