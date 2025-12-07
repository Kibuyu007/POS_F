import { useState } from "react";
import axios from "axios";
import { FiUser, FiX, FiCheck, FiMail, FiPhone, FiHome, FiKey, FiCalendar, FiUserCheck, FiUpload } from "react-icons/fi";
import { FaUserTag, FaUserTie, FaLock, FaUserEdit, FaChartBar, FaCog, FaExchangeAlt, FaUsers } from "react-icons/fa";
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
      canSeeReports: false,
      canAccessSettings: false,
      canMakeTransaction: false,
      canAccessUserManagement: false,
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

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setNewUser((prevUser) => ({
      ...prevUser,
      roles: {
        ...prevUser.roles,
        [name]: checked,
      },
    }));
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
    
    if (!newUser.password) {
      setShowError("Password is required");
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
        canSeeReports: false,
        canAccessSettings: false,
        canMakeTransaction: false,
        canAccessUserManagement: false,
      },
      password: "",
    });
    setFile(null);
    setPhotoPreview(null);
    setShowError("");
  };

  const getRoleIcon = (role) => {
    switch(role) {
      case 'canAddItems': return <FiUser className="w-4 h-4" />;
      case 'canEditItems': return <FaUserEdit className="w-4 h-4" />;
      case 'canSeeReports': return <FaChartBar className="w-4 h-4" />;
      case 'canAccessSettings': return <FaCog className="w-4 h-4" />;
      case 'canMakeTransaction': return <FaExchangeAlt className="w-4 h-4" />;
      case 'canAccessUserManagement': return <FaUsers className="w-4 h-4" />;
      default: return <FiUserCheck className="w-4 h-4" />;
    }
  };

  const formatRoleName = (role) => {
    return role
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase());
  };

  const fieldGroups = [
    {
      title: "Personal Information",
      fields: [
        { name: "firstName", label: "First Name", type: "text", icon: <FiUser className="w-4 h-4" /> },
        { name: "secondName", label: "Middle Name", type: "text", icon: <FiUser className="w-4 h-4" /> },
        { name: "lastName", label: "Last Name", type: "text", icon: <FiUser className="w-4 h-4" /> },
        { name: "userName", label: "Username", type: "text", icon: <FaUserTag className="w-4 h-4" /> },
        { name: "dateOfBirth", label: "Date of Birth", type: "date", icon: <FiCalendar className="w-4 h-4" /> },
        { 
          name: "gender", 
          label: "Gender", 
          type: "select", 
          options: ["", "Male", "Female", "Other"],
          icon: <FiUser className="w-4 h-4" />
        },
      ]
    },
    {
      title: "Contact Information",
      fields: [
        { name: "email", label: "Email", type: "email", icon: <FiMail className="w-4 h-4" /> },
        { name: "contacts", label: "Phone Number", type: "tel", icon: <FiPhone className="w-4 h-4" /> },
        { name: "address", label: "Address", type: "text", icon: <FiHome className="w-4 h-4" /> },
        { name: "title", label: "Job Title", type: "text", icon: <FaUserTie className="w-4 h-4" /> },
      ]
    }
  ];

  return (
    <>
      {showModal && (
        <div className="flex justify-center items-center overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none bg-gray-900 bg-opacity-20">
          <div className="w-full md:w-11/12 lg:w-10/12 xl:w-8/12 2xl:w-6/12 max-h-[90vh] overflow-y-auto">
            <div className="border border-gray-300 rounded-2xl shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
              {/* Header */}
              <div className="flex items-start justify-between p-5 bg-green-300 border-b border-gray-400 rounded-t-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center">
                    <FiUser className="w-5 h-5 text-black" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-black">+ Add New User</h3>
                    <p className="text-black/70 text-sm mt-1">Create a new user account</p>
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
                <form onSubmit={handleAddNewUser} className="space-y-8">
                  {/* Field Groups */}
                  {fieldGroups.map((group, groupIndex) => (
                    <div key={groupIndex} className="space-y-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-6 bg-green-300 rounded-full" />
                        <h4 className="text-lg font-bold text-gray-900">{group.title}</h4>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {group.fields.map((field) => (
                          <div key={field.name}>
                            <label className="block text-sm font-bold text-gray-900 mb-2">
                              {field.label}
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-3 flex items-center">
                                {field.icon}
                              </div>
                              {field.type === "select" ? (
                                <select
                                  name={field.name}
                                  value={newUser[field.name]}
                                  onChange={handleChange}
                                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-full bg-white text-black focus:outline-none focus:border-green-300 appearance-none"
                                  disabled={loading}
                                >
                                  {field.options.map((option, idx) => (
                                    <option key={idx} value={option} className="text-black">
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
                                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-full bg-white text-black focus:outline-none focus:border-green-300"
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
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-6 bg-green-300 rounded-full" />
                      <h4 className="text-lg font-bold text-gray-900">Security</h4>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-2">
                        Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-3 flex items-center">
                          <FiKey className="w-4 h-4 text-gray-500" />
                        </div>
                        <input
                          type="password"
                          name="password"
                          value={newUser.password}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-full bg-white text-black focus:outline-none focus:border-green-300"
                          placeholder="Enter password"
                          disabled={loading}
                          autoComplete="new-password"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Photo Upload */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-6 bg-green-300 rounded-full" />
                      <h4 className="text-lg font-bold text-gray-900">Profile Photo</h4>
                    </div>
                    <div className="flex flex-col md:flex-row items-center gap-6">
                      <div className="relative">
                        <div className="w-32 h-32 rounded-full border-4 border-gray-300 overflow-hidden bg-gray-100">
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
                            className="absolute -top-1 -right-1 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                          >
                            <FiX className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm font-bold text-gray-900 mb-2">
                          Upload Photo
                        </label>
                        <div className="relative">
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
                            className={`flex items-center justify-center gap-2 px-6 py-3 border-2 border-dashed border-gray-300 rounded-full cursor-pointer transition-colors ${
                              loading
                                ? "bg-gray-100 cursor-not-allowed"
                                : "hover:border-green-300 hover:bg-green-50"
                            }`}
                          >
                            <FiUpload className="w-4 h-4" />
                            <span className="font-medium">
                              {file ? "Change Photo" : "Choose Photo"}
                            </span>
                          </label>
                          {file && (
                            <p className="mt-2 text-sm text-gray-600">
                              Selected: {file.name}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Roles and Permissions */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-6 bg-green-300 rounded-full" />
                      <h4 className="text-lg font-bold text-gray-900">Roles & Permissions</h4>
                    </div>
                    <div className="bg-gray-100 rounded-2xl p-4 border border-gray-300">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {Object.keys(newUser.roles).map((role) => (
                          <div key={role} className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-300">
                            <div className="flex items-center gap-3">
                              {getRoleIcon(role)}
                              <span className="text-sm font-medium text-gray-900">
                                {formatRoleName(role)}
                              </span>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                name={role}
                                checked={newUser.roles[role]}
                                onChange={handleCheckboxChange}
                                className="sr-only peer"
                                disabled={loading}
                              />
                              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-300"></div>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Validation Summary */}
                  <div className="bg-gray-100 rounded-xl p-4 border border-gray-300">
                    <p className="text-sm font-bold text-black mb-3">Required Fields Status</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {[
                        { label: "First Name", value: newUser.firstName },
                        { label: "Last Name", value: newUser.lastName },
                        { label: "Email", value: newUser.email },
                        { label: "Password", value: newUser.password },
                      ].map((field, idx) => (
                        <div key={idx} className={`flex items-center gap-3 ${field.value ? "text-green-700" : "text-red-600"}`}>
                          <div className={`w-3 h-3 rounded-full ${field.value ? "bg-green-300" : "bg-red-300"}`} />
                          <span className="text-sm">{field.label} {field.value ? "✓" : "(required)"}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Error Message */}
                  {showError && (
                    <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-4">
                      <span className="font-bold">Error: </span> {showError}
                    </div>
                  )}

                  {/* Submit Button */}
                  <div>
                    <button
                      type="submit"
                      disabled={loading || !newUser.firstName || !newUser.lastName || !newUser.email || !newUser.password}
                      className={`w-full py-3 font-bold rounded-full flex items-center justify-center gap-2 ${
                        loading || !newUser.firstName || !newUser.lastName || !newUser.email || !newUser.password
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
                          <span>Creating User...</span>
                        </>
                      ) : (
                        <>
                          <FiCheck className="w-5 h-5" />
                          <span>Create User</span>
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
                  className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-black font-bold rounded-full transition-colors"
                  disabled={loading}
                >
                  Reset
                </button>
                <button
                  className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-black font-bold rounded-full transition-colors"
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

export default AddUser;