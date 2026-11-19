import { useState, useEffect } from "react";
import axios from "axios";
import {
  FiUser, FiX, FiCheck, FiMail, FiPhone, FiHome, FiCalendar,
  FiUpload, FiLock, FiEye, FiEyeOff, FiSave, FiRefreshCw,
  FiShield, FiKey,
} from "react-icons/fi";
import toast from "react-hot-toast";
import BASE_URL from "../../../Utils/config";
import {
  ROLES, ROLE_NAMES, ALL_PERMISSIONS, PERMISSION_LABELS,
} from "../../../Utils/permissions";

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
  permissions: [], // empty => backend uses role defaults
  customizePermissions: false,
});

const AddUser = ({ showModal, setShowModal, onUserAdded, currentUserRole }) => {
  // currentUserRole: "Admin" | "Manager" | "Cashier" | "Accountant"
  const isAdmin = currentUserRole === "Admin";

  const [newUser, setNewUser] = useState(buildEmptyUser());
  const [showError, setShowError] = useState("");
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");

  // Reset when modal opens
  useEffect(() => {
    if (showModal) {
      setNewUser(buildEmptyUser());
      setFile(null);
      setPhotoPreview(null);
      setShowError("");
      setShowPassword(false);
      setActiveTab("personal");
    }
  }, [showModal]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewUser((prev) => {
      // When role changes and not customizing, reset permissions
      if (name === "role" && !prev.customizePermissions) {
        return { ...prev, role: value, permissions: [] };
      }
      return { ...prev, [name]: value };
    });
    if (showError) setShowError("");
  };

  const handleToggleCustomize = (checked) => {
    setNewUser((prev) => {
      if (checked) {
        // Seed with current role defaults so user can tweak
        const roleDefaults = ROLES[prev.role]?.permissions || [];
        return { ...prev, customizePermissions: true, permissions: [...roleDefaults] };
      }
      return { ...prev, customizePermissions: false, permissions: [] };
    });
  };

  const handleTogglePermission = (perm) => {
    setNewUser((prev) => {
      const has = prev.permissions.includes(perm);
      return {
        ...prev,
        permissions: has
          ? prev.permissions.filter((p) => p !== perm)
          : [...prev.permissions, perm],
      };
    });
  };

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (f) {
      setFile(f);
      setPhotoPreview(URL.createObjectURL(f));
    }
  };

  const handleAddNewUser = async (e) => {
    e.preventDefault();

    if (!newUser.firstName.trim() || !newUser.lastName.trim()) {
      setShowError("First name and last name are required");
      return;
    }
    if (!newUser.email.trim()) {
      setShowError("Email is required");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newUser.email)) {
      setShowError("Please enter a valid email address");
      return;
    }
    if (!newUser.userName.trim()) {
      setShowError("Username is required");
      return;
    }
    if (!newUser.password) {
      setShowError("Password is required");
      return;
    }
    if (newUser.password.length < 6) {
      setShowError("Password must be at least 6 characters long");
      return;
    }
    if (!newUser.dateOfBirth) {
      setShowError("Date of birth is required");
      return;
    }
    if (!newUser.gender) {
      setShowError("Gender is required");
      return;
    }
    if (!newUser.contacts.trim()) {
      setShowError("Phone number is required");
      return;
    }
    if (!newUser.address.trim()) {
      setShowError("Address is required");
      return;
    }
    if (!newUser.title.trim()) {
      setShowError("Job title is required");
      return;
    }
    // Non-admins cannot create Admin/Manager
    if (!isAdmin && ["Admin", "Manager"].includes(newUser.role)) {
      setShowError("Only Admins can assign Admin or Manager roles.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("firstName", newUser.firstName);
      formData.append("secondName", newUser.secondName);
      formData.append("lastName", newUser.lastName);
      formData.append("userName", newUser.userName.trim().toLowerCase());
      formData.append("dateOfBirth", newUser.dateOfBirth);
      formData.append("gender", newUser.gender);
      formData.append("email", newUser.email);
      formData.append("contacts", newUser.contacts);
      formData.append("title", newUser.title);
      formData.append("address", newUser.address);
      formData.append("password", newUser.password);
      formData.append("role", newUser.role);

      // Only send permissions when customizing (Admin only)
      if (isAdmin && newUser.customizePermissions) {
        formData.append("permissions", JSON.stringify(newUser.permissions));
      }

      if (file) formData.append("file", file);

      await axios.post(`${BASE_URL}/api/auth/register`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      toast.success("User added successfully!");
      setTimeout(() => {
        setShowModal(false);
        onUserAdded?.();
      }, 1200);
    } catch (error) {
      const msg =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Failed to add user. Please try again.";
      setShowError(msg);
      console.error("Add user failed", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setNewUser(buildEmptyUser());
    setFile(null);
    setPhotoPreview(null);
    setShowError("");
    setShowPassword(false);
  };

  // --- Tabs ---
  const tabs = [
    { id: "personal", label: "Personal", icon: <FiUser /> },
    { id: "security", label: "Security", icon: <FiLock /> },
    { id: "role", label: "Role", icon: <FiShield /> },
    { id: "photo", label: "Photo", icon: <FiUser /> },
    { id: "summary", label: "Summary", icon: <FiCheck /> },
  ];

  const passwordStrength = (() => {
    const p = newUser.password;
    if (!p) return { label: "", cls: "", bar: "" };
    if (p.length >= 8 && /[A-Z]/.test(p) && /[0-9]/.test(p))
      return { label: "Strong", cls: "text-green-600", bar: "bg-green-500 w-full" };
    if (p.length >= 6)
      return { label: "Medium", cls: "text-amber-600", bar: "bg-amber-500 w-2/3" };
    return { label: "Weak", cls: "text-red-600", bar: "bg-red-500 w-1/3" };
  })();

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto text-black">
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={() => !loading && setShowModal(false)}
      />
      <div className="flex min-h-screen items-center justify-center p-2 sm:p-4">
        <div className="relative w-full max-w-4xl mx-auto">
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
              <form onSubmit={handleAddNewUser}>
                {/* ---------- PERSONAL ---------- */}
                {activeTab === "personal" && (
                  <div className="space-y-6">
                    <Section title="Personal Information" subtitle="Enter user's basic details" icon={<FiUser className="w-6 h-6 text-emerald-600" />}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <TextField name="firstName" label="First Name" required value={newUser.firstName} onChange={handleChange} disabled={loading} icon={<FiUser className="w-4 h-4 text-gray-400" />} />
                        <TextField name="secondName" label="Middle Name" value={newUser.secondName} onChange={handleChange} disabled={loading} icon={<FiUser className="w-4 h-4 text-gray-400" />} />
                        <TextField name="lastName" label="Last Name" required value={newUser.lastName} onChange={handleChange} disabled={loading} icon={<FiUser className="w-4 h-4 text-gray-400" />} />
                        <TextField name="userName" label="Username" required value={newUser.userName} onChange={handleChange} disabled={loading} icon={<FiUser className="w-4 h-4 text-gray-400" />} />
                      </div>
                    </Section>

                    <Section title="Contact Details" subtitle="Enter contact information" icon={<FiMail className="w-6 h-6 text-emerald-600" />}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <TextField name="email" label="Email" type="email" required value={newUser.email} onChange={handleChange} disabled={loading} icon={<FiMail className="w-4 h-4 text-gray-400" />} />
                        <TextField name="contacts" label="Phone Number" type="tel" required value={newUser.contacts} onChange={handleChange} disabled={loading} icon={<FiPhone className="w-4 h-4 text-gray-400" />} />
                        <TextField name="address" label="Address" required value={newUser.address} onChange={handleChange} disabled={loading} icon={<FiHome className="w-4 h-4 text-gray-400" />} />
                        <TextField name="title" label="Job Title" required value={newUser.title} onChange={handleChange} disabled={loading} icon={<FiUser className="w-4 h-4 text-gray-400" />} />
                      </div>
                    </Section>
                  </div>
                )}

                {/* ---------- SECURITY ---------- */}
                {activeTab === "security" && (
                  <div className="space-y-6">
                    <Section title="Account Security" subtitle="Set up secure credentials" icon={<FiLock className="w-6 h-6 text-emerald-600" />}>
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
                              className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                              placeholder="Enter secure password (min 6 characters)"
                              disabled={loading}
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword((s) => !s)}
                              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-emerald-500"
                              disabled={loading}
                            >
                              {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                            </button>
                          </div>

                          {newUser.password && (
                            <div className="mt-3 space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">Password strength:</span>
                                <span className={`font-medium ${passwordStrength.cls}`}>
                                  {passwordStrength.label}
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className={`h-2 rounded-full ${passwordStrength.bar}`} />
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="bg-gradient-to-br from-gray-50 to-white p-4 rounded-xl border border-gray-200">
                          <h4 className="font-medium text-gray-700 mb-3">Additional Information</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <TextField name="dateOfBirth" label="Date of Birth" type="date" required value={newUser.dateOfBirth} onChange={handleChange} disabled={loading} icon={<FiCalendar className="w-4 h-4 text-gray-400" />} />
                            <div className="space-y-2">
                              <label className="block text-sm font-medium text-gray-700">Gender <span className="text-red-500">*</span></label>
                              <select
                                name="gender"
                                value={newUser.gender}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                                disabled={loading}
                                required
                              >
                                <option value="">Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Section>
                  </div>
                )}

                {/* ---------- ROLE & PERMISSIONS ---------- */}
                {activeTab === "role" && (
                  <div className="space-y-6">
                    <Section title="Role Assignment" subtitle="Assign a role to this user" icon={<FiShield className="w-6 h-6 text-emerald-600" />}>
                      {!isAdmin && (
                        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700">
                          Only Admins can change roles and permissions. The user will be created with the role you select from allowed options.
                        </div>
                      )}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {ROLE_NAMES.map((roleName) => {
                          const disabled =
                            !isAdmin && ["Admin", "Manager"].includes(roleName);
                          const selected = newUser.role === roleName;
                          return (
                            <button
                              type="button"
                              key={roleName}
                              disabled={disabled || loading}
                              onClick={() => handleChange({ target: { name: "role", value: roleName } })}
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
                                {(ROLES[roleName]?.permissions.length ?? 0)} permissions
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
                              checked={newUser.customizePermissions}
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
                    </Section>

                    {newUser.customizePermissions && isAdmin && (
                      <Section title="Permissions" subtitle="Fine-tune what this user can do" icon={<FiKey className="w-6 h-6 text-emerald-600" />}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {ALL_PERMISSIONS.map((perm) => (
                            <label
                              key={perm}
                              className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={newUser.permissions.includes(perm)}
                                onChange={() => handleTogglePermission(perm)}
                                className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                                disabled={loading}
                              />
                              <span className="text-sm text-gray-700">
                                {PERMISSION_LABELS[perm] || perm}
                              </span>
                            </label>
                          ))}
                        </div>
                        <p className="text-xs text-gray-500 mt-3">
                          {newUser.permissions.length} of {ALL_PERMISSIONS.length} permissions selected.
                        </p>
                      </Section>
                    )}

                    {!newUser.customizePermissions && (
                      <Section title="Role Permissions Preview" subtitle="These will be applied by default" icon={<FiKey className="w-6 h-6 text-emerald-600" />}>
                        <div className="flex flex-wrap gap-2">
                          {(ROLES[newUser.role]?.permissions || []).map((p) => (
                            <span
                              key={p}
                              className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium"
                            >
                              {PERMISSION_LABELS[p] || p}
                            </span>
                          ))}
                        </div>
                      </Section>
                    )}
                  </div>
                )}

                {/* ---------- PHOTO ---------- */}
                {activeTab === "photo" && (
                  <Section title="Profile Photo" subtitle="Upload a profile picture (optional)" icon={<FiUser className="w-6 h-6 text-emerald-600" />}>
                    <div className="flex flex-col lg:flex-row items-center gap-6">
                      <div className="relative">
                        <div className="w-40 h-40 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gradient-to-br from-emerald-50 to-green-50">
                          {photoPreview ? (
                            <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <FiUser className="w-20 h-20 text-emerald-300" />
                            </div>
                          )}
                        </div>
                        {photoPreview && (
                          <button
                            type="button"
                            onClick={() => { setPhotoPreview(null); setFile(null); }}
                            className="absolute top-2 right-2 w-8 h-8 bg-gradient-to-br from-red-500 to-pink-500 text-white rounded-full flex items-center justify-center shadow-lg"
                          >
                            <FiX className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <div className="flex-1 space-y-4">
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
                              : "bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white shadow-md"
                          }`}
                        >
                          <FiUpload className="w-5 h-5" />
                          <span className="font-semibold">{file ? "Change Photo" : "Choose Photo"}</span>
                        </label>
                        {file && (
                          <div className="p-3 bg-white rounded-lg border border-gray-200">
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Selected file:</span> {file.name}
                            </p>
                          </div>
                        )}
                        <div className="text-sm text-gray-500 space-y-1">
                          <p>• Recommended: Square image, min 400x400px</p>
                          <p>• Supported: JPG, PNG, GIF</p>
                          <p>• Max size: 5MB</p>
                        </div>
                      </div>
                    </div>
                  </Section>
                )}

                {/* ---------- SUMMARY ---------- */}
                {activeTab === "summary" && (
                  <div className="space-y-6">
                    <Section title="Validation Summary" subtitle="Review all information before creating account" icon={<FiCheck className="w-6 h-6 text-emerald-600" />}>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[
                          { label: "First Name", value: newUser.firstName, required: true },
                          { label: "Last Name", value: newUser.lastName, required: true },
                          { label: "Username", value: newUser.userName, required: true },
                          { label: "Email", value: newUser.email, required: true },
                          { label: "Password", value: newUser.password, required: true },
                          { label: "Date of Birth", value: newUser.dateOfBirth, required: true },
                          { label: "Gender", value: newUser.gender, required: true },
                          { label: "Phone", value: newUser.contacts, required: true },
                          { label: "Role", value: newUser.role, required: true },
                        ].map((field, idx) => {
                          const ok = !field.required || !!field.value;
                          return (
                            <div key={idx} className={`p-4 rounded-xl border ${ok ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-700">{field.label}</span>
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${ok ? "bg-green-500" : "bg-red-500"}`}>
                                  {ok ? <FiCheck className="w-3 h-3 text-white" /> : <FiX className="w-3 h-3 text-white" />}
                                </div>
                              </div>
                              <p className={`text-sm ${ok ? "text-green-600" : "text-red-600"}`}>
                                {ok ? "✓ Valid" : "Required"}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </Section>

                    <Section title="Additional Information" subtitle="" icon={<FiUser className="w-6 h-6 text-emerald-600" />}>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[
                          { label: "Middle Name", value: newUser.secondName },
                          { label: "Address", value: newUser.address },
                          { label: "Job Title", value: newUser.title },
                          { label: "Profile Photo", value: file ? "Uploaded" : "Not uploaded" },
                          {
                            label: "Permissions",
                            value: newUser.customizePermissions
                              ? `${newUser.permissions.length} custom`
                              : `Role default (${ROLES[newUser.role]?.permissions.length || 0})`,
                          },
                        ].map((field, idx) => (
                          <div key={idx} className="p-3 rounded-lg border border-gray-200 bg-white">
                            <div className="text-xs text-gray-500 mb-1">{field.label}</div>
                            <div className="text-sm font-medium text-gray-900 truncate">
                              {field.value || "Not provided"}
                            </div>
                          </div>
                        ))}
                      </div>
                    </Section>
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
                        newUser.firstName && newUser.lastName && newUser.email && newUser.password
                          ? "bg-green-500" : "bg-amber-500"
                      }`} />
                      <span>
                        {newUser.firstName && newUser.lastName && newUser.email && newUser.password
                          ? "All required fields are complete"
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
                        disabled={loading}
                        className={`flex items-center justify-center space-x-2 px-8 py-3 font-medium rounded-xl w-full sm:w-auto ${
                          loading
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

// --- Small helpers to reduce repetition ---
function Section({ title, subtitle, icon, children }) {
  return (
    <div className="bg-gradient-to-br from-gray-50 to-white p-4 sm:p-6 rounded-2xl border border-gray-200">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-emerald-100 rounded-lg">{icon}</div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

function TextField({ name, label, type = "text", required, value, onChange, disabled, icon }) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}{required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">{icon}</div>
        )}
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          className={`w-full ${icon ? "pl-10" : "pl-4"} pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500`}
          placeholder={`Enter ${label.toLowerCase()}`}
          disabled={disabled}
          required={required}
        />
      </div>
    </div>
  );
}

export default AddUser;