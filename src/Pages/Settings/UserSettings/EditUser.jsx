import { useEffect, useState } from "react";
import axios from "axios";
import {
  FiUser, FiX, FiCheck, FiMail, FiPhone, FiHome, FiCalendar,
  FiUpload, FiSettings, FiFileText, FiShoppingCart, FiShield,
  FiTrendingUp, FiUsers, FiLock, FiBox, FiPackage, FiDollarSign,
  FiCreditCard, FiCheckCircle, FiClipboard, FiFile, FiBarChart2,
  FiChevronRight, FiChevronDown, FiSave, FiRefreshCw, FiEdit, FiKey,
} from "react-icons/fi";
import { FaUserTie, FaWarehouse } from "react-icons/fa";
import { MdSecurity, MdOutlineAdminPanelSettings, MdCategory } from "react-icons/md";
import { HiOutlineChartBar } from "react-icons/hi";
import { BsPeople } from "react-icons/bs";
import toast from "react-hot-toast";
import BASE_URL from "../../../Utils/config";
import {
  PERMISSIONS, ROLES, ROLE_NAMES, ALL_PERMISSIONS, PERMISSION_LABELS,
} from "../../../Utils/permissions";

const PROTECTED_USER_ID = "67dac1d71e4020e195b0b590";

// Permission groups → used only for the visual grouping of the
// permissions grid. Keys must match backend permission strings.
const PERMISSION_GROUPS = [
  {
    id: "inventory",
    title: "Inventory Management",
    icon: <FaWarehouse />,
    color: "from-blue-500 to-cyan-500",
    bgColor: "from-blue-50 to-cyan-50",
    permissions: [
      { key: PERMISSIONS.ADD_ITEMS, icon: <FiBox /> },
      { key: PERMISSIONS.EDIT_ITEMS, icon: <FiPackage /> },
      { key: PERMISSIONS.ADD_CATEGORY, icon: <MdCategory /> },
      { key: PERMISSIONS.EDIT_CATEGORY, icon: <FiSettings /> },
    ],
  },
  {
    id: "transactions",
    title: "Transaction Management",
    icon: <FiCreditCard />,
    color: "from-emerald-500 to-green-500",
    bgColor: "from-emerald-50 to-green-50",
    permissions: [
      { key: PERMISSIONS.MAKE_TRANSACTION, icon: <FiTrendingUp /> },
      { key: PERMISSIONS.PAY_BILL_TRANSACTIONS, icon: <FiDollarSign /> },
      { key: PERMISSIONS.EDIT_EXPENSES, icon: <FiEdit /> },
    ],
  },
  {
    id: "grn",
    title: "GRN Management",
    icon: <FiClipboard />,
    color: "from-purple-500 to-violet-500",
    bgColor: "from-purple-50 to-violet-50",
    permissions: [
      { key: PERMISSIONS.APPROVE_NEW_GRN, icon: <FiCheckCircle /> },
      { key: PERMISSIONS.PAY_BILLED_GRN, icon: <FiCreditCard /> },
    ],
  },
  {
    id: "debts",
    title: "Debt Management",
    icon: <FiCreditCard />,
    color: "from-amber-500 to-yellow-500",
    bgColor: "from-amber-50 to-yellow-50",
    permissions: [
      { key: PERMISSIONS.CHANGE_DEBT_STATUS, icon: <FiTrendingUp /> },
      { key: PERMISSIONS.PAY_DEBT, icon: <FiDollarSign /> },
    ],
  },
  {
    id: "administration",
    title: "System Administration",
    icon: <MdOutlineAdminPanelSettings />,
    color: "from-amber-500 to-orange-500",
    bgColor: "from-amber-50 to-orange-50",
    permissions: [
      { key: PERMISSIONS.ACCESS_SETTINGS, icon: <FiSettings /> },
      { key: PERMISSIONS.ACCESS_USER_MANAGEMENT, icon: <FiUsers /> },
      { key: PERMISSIONS.ACCESS_CUSTOMER_MANAGEMENT, icon: <FiUser /> },
      { key: PERMISSIONS.ACCESS_SUPPLIER_MANAGEMENT, icon: <BsPeople /> },
    ],
  },
  {
    id: "reports",
    title: "Reports & Analytics",
    icon: <HiOutlineChartBar />,
    color: "from-indigo-500 to-purple-500",
    bgColor: "from-indigo-50 to-purple-50",
    permissions: [
      { key: PERMISSIONS.SEE_REPORTS, icon: <FiBarChart2 /> },
      { key: PERMISSIONS.ACCESS_MADENI_REPORT, icon: <FiFile /> },
    ],
  },
];

// Same ordering the backend enum uses
const ROLE_OPTIONS = ["Admin", "Manager", "Cashier", "Accountant"];

const buildEmptyUser = () => ({
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
  password: "",
  role: "Cashier",
  permissions: [],
  customizePermissions: false,
});

// Compare two arrays as sets
const samePermissions = (a = [], b = []) => {
  if (a.length !== b.length) return false;
  const setB = new Set(b);
  return a.every((p) => setB.has(p));
};

const EditUser = ({
  showModal,
  setShowModal,
  onUserUpdated,        // keep parity with UserManagement (rename to onUserAdded if preferred)
  user,
  currentUserRole,
}) => {
  const isAdmin = currentUserRole === "Admin";

  const [showError, setShowError] = useState("");
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [activeTab, setActiveTab] = useState("personal");
  const [collapsedSections, setCollapsedSections] = useState({});
  const [editUser, setEditUser] = useState(buildEmptyUser());

  const isProtected = user?._id === PROTECTED_USER_ID;

  // Hydrate on open / user change
  useEffect(() => {
    if (!user) return;

    const storedPermissions = Array.isArray(user.permissions) ? user.permissions : [];
    const roleDefaults = ROLES[user.role]?.permissions || [];
    // Consider "customized" only if the stored set differs from role defaults
    const isCustomized = !samePermissions(storedPermissions, roleDefaults);

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
      role: user.role || "Cashier",
      permissions: isCustomized ? storedPermissions : [],
      customizePermissions: isCustomized,
    });

    setPhotoPreview(user.photo ? `${BASE_URL}/pfps/${user.photo}` : null);
    setFile(null);
    setShowError("");
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditUser((prev) => {
      // When role changes and not customizing, sync permissions to role defaults
      if (name === "role") {
        return {
          ...prev,
          role: value,
          permissions: prev.customizePermissions
            ? prev.permissions
            : [],
        };
      }
      return { ...prev, [name]: value };
    });
    if (showError) setShowError("");
  };

  const handleToggleCustomize = (checked) => {
    setEditUser((prev) => {
      if (checked) {
        // Seed from current role defaults so user can tweak
        return {
          ...prev,
          customizePermissions: true,
          permissions: [...(ROLES[prev.role]?.permissions || [])],
        };
      }
      // Unchecking = revert to role defaults (clear custom list)
      return { ...prev, customizePermissions: false, permissions: [] };
    });
  };

  const handleTogglePermission = (perm) => {
    setEditUser((prev) => {
      const has = prev.permissions.includes(perm);
      return {
        ...prev,
        permissions: has
          ? prev.permissions.filter((p) => p !== perm)
          : [...prev.permissions, perm],
      };
    });
  };

  const handleApplyPreset = (roleName) => {
    setEditUser((prev) => ({
      ...prev,
      role: roleName,
      permissions: prev.customizePermissions
        ? [...(ROLES[roleName]?.permissions || [])]
        : [],
    }));
  };

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (f) {
      setFile(f);
      setPhotoPreview(URL.createObjectURL(f));
    }
  };

  const handleReset = () => {
    if (!user) return;
    const storedPermissions = Array.isArray(user.permissions) ? user.permissions : [];
    const roleDefaults = ROLES[user.role]?.permissions || [];
    const isCustomized = !samePermissions(storedPermissions, roleDefaults);

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
      role: user.role || "Cashier",
      permissions: isCustomized ? storedPermissions : [],
      customizePermissions: isCustomized,
    });
    setPhotoPreview(user.photo ? `${BASE_URL}/pfps/${user.photo}` : null);
    setFile(null);
    setShowError("");
  };

  const handleEditUser = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!editUser.firstName.trim() || !editUser.lastName.trim()) {
      return setShowError("First name and last name are required");
    }
    if (!editUser.email.trim()) {
      return setShowError("Email is required");
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editUser.email)) {
      return setShowError("Please enter a valid email address");
    }
    if (editUser.password && editUser.password.length < 6) {
      return setShowError("Password must be at least 6 characters long");
    }

    setLoading(true);
    try {
      const formData = new FormData();

      // Basic fields
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

      if (editUser.password) formData.append("password", editUser.password);
      if (file) formData.append("photo", file);

      // Role/permissions → only Admins may send these
      if (isAdmin) {
        formData.append("role", editUser.role);
        if (editUser.customizePermissions) {
          formData.append("permissions", JSON.stringify(editUser.permissions));
        } else {
          // Sending an empty array signals "use role defaults"
          formData.append("permissions", JSON.stringify([]));
        }
      }

      await axios.put(`${BASE_URL}/api/users/update/${user._id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      toast.success("User updated successfully!");
      setTimeout(() => {
        setShowModal(false);
        onUserUpdated?.();
      }, 1000);
    } catch (error) {
      const msg =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Failed to update user. Please try again.";
      setShowError(msg);
      console.error("Update error:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section) =>
    setCollapsedSections((prev) => ({ ...prev, [section]: !prev[section] }));

  const tabs = [
    { id: "personal", label: "Personal Info", icon: <FiUser /> },
    { id: "security", label: "Security", icon: <FiLock /> },
    { id: "permissions", label: "Role & Permissions", icon: <FiShield /> },
    { id: "summary", label: "Summary", icon: <FiFileText /> },
  ];

  if (!showModal || !user) return null;

  const effectivePermissions = editUser.customizePermissions
    ? editUser.permissions
    : ROLES[editUser.role]?.permissions || [];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={() => !loading && setShowModal(false)}
      />

      <div className="flex min-h-screen items-center justify-center p-2 sm:p-4">
        <div className="relative w-full max-w-6xl mx-auto">
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

              <div className="mt-4 sm:mt-6">
                <div className="flex space-x-1 overflow-x-auto pb-2">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center space-x-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-sm sm:text-base font-medium whitespace-nowrap transition-colors ${
                        activeTab === tab.id
                          ? "bg-white text-emerald-700"
                          : "text-green-100 hover:bg-white/10"
                      }`}
                    >
                      {tab.icon}
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
              {isProtected && (
                <div className="mb-4 p-3 bg-red-50 border-2 border-red-200 rounded-xl text-sm text-red-700">
                  This is a protected account. Editing is disabled by the server.
                </div>
              )}

              <form onSubmit={handleEditUser}>
                {/* ================== PERSONAL ================== */}
                {activeTab === "personal" && (
                  <div className="space-y-6 text-black">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Photo */}
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
                                          ? `${BASE_URL}/pfps/${user.photo}`
                                          : null
                                      );
                                      setFile(null);
                                    }}
                                    className="absolute bottom-2 right-2 w-8 h-8 bg-gradient-to-br from-red-500 to-pink-500 text-white rounded-full flex items-center justify-center shadow-lg"
                                    title="Remove new photo"
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
                                  Selected: <span className="font-medium">{file.name}</span>
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Form fields */}
                      <div className="lg:col-span-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                          <div className="sm:col-span-2">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                              Basic Information
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <TextField name="firstName" label="First Name" required value={editUser.firstName} onChange={handleChange} disabled={loading} />
                              <TextField name="secondName" label="Middle Name" value={editUser.secondName} onChange={handleChange} disabled={loading} />
                              <TextField name="lastName" label="Last Name" required value={editUser.lastName} onChange={handleChange} disabled={loading} />
                              <TextField name="userName" label="Username" value={editUser.userName} onChange={handleChange} disabled={loading} />
                            </div>
                          </div>

                          <div className="sm:col-span-2">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                              Contact Information
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <TextField name="email" label="Email" type="email" required value={editUser.email} onChange={handleChange} disabled={loading} icon={<FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />} />
                              <TextField name="contacts" label="Phone Number" type="tel" value={editUser.contacts} onChange={handleChange} disabled={loading} icon={<FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />} />
                            </div>
                          </div>

                          <div className="sm:col-span-2">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                              Additional Information
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <TextField name="dateOfBirth" label="Date of Birth" type="date" value={editUser.dateOfBirth} onChange={handleChange} disabled={loading} icon={<FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />} />
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Gender
                                </label>
                                <select
                                  name="gender"
                                  value={editUser.gender}
                                  onChange={handleChange}
                                  disabled={loading}
                                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                                >
                                  <option value="">Select Gender</option>
                                  <option value="Male">Male</option>
                                  <option value="Female">Female</option>
                                  <option value="Other">Other</option>
                                </select>
                              </div>
                              <TextField name="title" label="Job Title" value={editUser.title} onChange={handleChange} disabled={loading} icon={<FaUserTie className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />} />
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
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
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

                {/* ================== SECURITY ================== */}
                {activeTab === "security" && (
                  <div className="space-y-6 text-black">
                    <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-6 rounded-2xl border border-emerald-100">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="p-2 bg-emerald-100 rounded-lg">
                          <FiLock className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">Account Security</h3>
                          <p className="text-sm text-gray-600">Update the user's password</p>
                        </div>
                      </div>
                      <div className="max-w-md">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          New Password
                          <span className="text-xs text-gray-500 ml-2">(Optional - leave blank to keep current)</span>
                        </label>
                        <div className="relative">
                          <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input
                            type="password"
                            name="password"
                            value={editUser.password}
                            onChange={handleChange}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                            placeholder="Enter new password (min 6 characters)"
                            disabled={loading}
                          />
                        </div>
                        {editUser.password && (
                          <div className={`mt-2 text-sm ${editUser.password.length >= 6 ? "text-green-600" : "text-amber-600"}`}>
                            {editUser.password.length >= 6
                              ? "✓ Strong password"
                              : "Password must be at least 6 characters"}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* ================== ROLE & PERMISSIONS ================== */}
                {activeTab === "permissions" && (
                  <div className="space-y-6">
                    {/* Role selector */}
                    <div className="bg-gradient-to-br from-gray-50 to-white p-4 sm:p-6 rounded-2xl border border-gray-200">
                      <div className="flex items-center space-x-3 mb-6">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <MdSecurity className="w-6 h-6 text-gray-700" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">Role</h3>
                          <p className="text-sm text-gray-600">
                            The role defines default permissions
                          </p>
                        </div>
                      </div>

                      {!isAdmin && (
                        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700">
                          Only Admins can change role or permissions. Fields below are read-only.
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {ROLE_OPTIONS.map((roleName) => {
                          const disabled =
                            !isAdmin ||
                            (["Admin", "Manager"].includes(roleName) &&
                              currentUserRole !== "Admin");
                          const selected = editUser.role === roleName;
                          return (
                            <button
                              type="button"
                              key={roleName}
                              disabled={disabled || loading}
                              onClick={() => handleApplyPreset(roleName)}
                              className={`text-left p-4 rounded-xl border transition-all ${
                                selected
                                  ? "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-200"
                                  : "border-gray-200 bg-white hover:border-emerald-300"
                              } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-semibold text-gray-900">{roleName}</span>
                                {selected && (
                                  <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                                    <FiCheck className="w-3 h-3 text-white" />
                                  </div>
                                )}
                              </div>
                              <p className="text-xs text-gray-500 mt-1">
                                {(ROLES[roleName]?.permissions.length ?? 0)} default permissions
                              </p>
                            </button>
                          );
                        })}
                      </div>

                      {isAdmin && (
                        <div className="mt-6">
                          <label className="flex items-center space-x-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={editUser.customizePermissions}
                              onChange={(e) => handleToggleCustomize(e.target.checked)}
                              className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
                              disabled={loading}
                            />
                            <span className="text-sm font-medium text-gray-700">
                              Customize permissions for this user (overrides role defaults)
                            </span>
                          </label>
                        </div>
                      )}
                    </div>

                    {/* Permission grid — only editable when customizing + admin */}
                    {isAdmin && editUser.customizePermissions ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-gray-900">Permissions</h3>
                          <div className="text-sm text-gray-600">
                            <span className="font-semibold text-emerald-600">
                              {editUser.permissions.length}
                            </span>{" "}
                            of {ALL_PERMISSIONS.length} enabled
                          </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          {PERMISSION_GROUPS.map((group) => (
                            <div
                              key={group.id}
                              className={`bg-gradient-to-br ${group.bgColor} border border-gray-200 rounded-xl overflow-hidden`}
                            >
                              <div className={`p-4 bg-gradient-to-r ${group.color}`}>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-3">
                                    <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                                      <div className="text-white">{group.icon}</div>
                                    </div>
                                    <h4 className="font-bold text-white">{group.title}</h4>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => toggleSection(group.id)}
                                    className="text-white hover:bg-white/10 p-1 rounded-lg"
                                  >
                                    {collapsedSections[group.id] ? <FiChevronRight /> : <FiChevronDown />}
                                  </button>
                                </div>
                              </div>

                              {!collapsedSections[group.id] && (
                                <div className="p-4 space-y-3">
                                  {group.permissions.map(({ key, icon }) => (
                                    <div
                                      key={key}
                                      className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100"
                                    >
                                      <div className="flex items-center space-x-3">
                                        <div className="p-1.5 rounded-lg bg-gray-100 text-gray-600">
                                          {icon}
                                        </div>
                                        <div className="font-medium text-gray-900">
                                          {PERMISSION_LABELS[key] || key}
                                        </div>
                                      </div>
                                      <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                          type="checkbox"
                                          checked={editUser.permissions.includes(key)}
                                          onChange={() => handleTogglePermission(key)}
                                          className="sr-only peer"
                                          disabled={loading}
                                        />
                                        <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500" />
                                      </label>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-2xl border border-gray-200">
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="p-2 bg-gray-100 rounded-lg">
                            <FiKey className="w-6 h-6 text-gray-700" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              Effective Permissions
                            </h3>
                            <p className="text-sm text-gray-600">
                              {editUser.customizePermissions
                                ? "Custom set"
                                : `Inherited from ${editUser.role} role`}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {effectivePermissions.length === 0 ? (
                            <span className="text-sm text-gray-500">No permissions</span>
                          ) : (
                            effectivePermissions.map((p) => (
                              <span
                                key={p}
                                className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium"
                              >
                                {PERMISSION_LABELS[p] || p}
                              </span>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ================== SUMMARY ================== */}
                {activeTab === "summary" && (
                  <div className="space-y-6">
                    <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-6 rounded-2xl border border-emerald-100">
                      <div className="flex items-center space-x-3 mb-6">
                        <div className="p-2 bg-emerald-100 rounded-lg">
                          <FiCheckCircle className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            Validation Summary
                          </h3>
                          <p className="text-sm text-gray-600">Review all information before saving</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[
                          { label: "First Name", value: editUser.firstName, required: true },
                          { label: "Last Name", value: editUser.lastName, required: true },
                          { label: "Email", value: editUser.email, required: true },
                          { label: "Role", value: editUser.role, required: true },
                          { label: "Password", value: editUser.password, required: false },
                        ].map((field, idx) => {
                          const ok = !field.required || !!field.value;
                          return (
                            <div
                              key={idx}
                              className={`p-4 rounded-xl border ${ok ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-700">{field.label}</span>
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${ok ? "bg-green-500" : "bg-red-500"}`}>
                                  {ok ? <FiCheck className="w-3 h-3 text-white" /> : <FiX className="w-3 h-3 text-white" />}
                                </div>
                              </div>
                              <p className={`text-sm ${ok ? "text-green-600" : "text-red-600"}`}>
                                {ok ? (field.value || "Optional") : "Required"}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-2xl border border-gray-200">
                      <div className="flex items-center space-x-3 mb-6">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <FiFileText className="w-6 h-6 text-gray-700" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            Permission Summary
                          </h3>
                          <p className="text-sm text-gray-600">
                            {editUser.customizePermissions
                              ? `${editUser.permissions.length} custom permissions`
                              : `Using ${editUser.role} role defaults (${ROLES[editUser.role]?.permissions.length || 0})`}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

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

                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <div className={`w-3 h-3 rounded-full ${
                        editUser.firstName && editUser.lastName && editUser.email
                          ? "bg-green-500"
                          : "bg-amber-500"
                      }`} />
                      <span>
                        {editUser.firstName && editUser.lastName && editUser.email
                          ? "All required fields are valid"
                          : "Fill in all required fields"}
                      </span>
                    </div>

                    <div className="flex items-center space-x-3 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={handleReset}
                        disabled={loading}
                        className="flex items-center justify-center space-x-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl w-full sm:w-auto"
                      >
                        <FiRefreshCw className="w-4 h-4" />
                        <span>Reset</span>
                      </button>

                      <button
                        type="submit"
                        disabled={loading || isProtected}
                        className={`flex items-center justify-center space-x-2 px-8 py-3 font-medium rounded-xl w-full sm:w-auto ${
                          loading || isProtected
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : "bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white shadow-lg"
                        }`}
                      >
                        {loading ? (
                          <>
                            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
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

// Small helper
function TextField({ name, label, type = "text", required, value, onChange, disabled, icon }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        {icon}
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          className={`w-full ${icon ? "pl-10" : "pl-4"} pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors`}
          placeholder={`Enter ${label.toLowerCase()}`}
          disabled={disabled}
          required={required}
        />
      </div>
    </div>
  );
}

export default EditUser;