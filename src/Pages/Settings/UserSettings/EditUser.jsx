import axios from "axios";
import { useEffect, useState } from "react";

//API
import BASE_URL from "../../../Utils/config"


const EditUser = ({ showModal, setShowModal, onUserAdded, user }) => {
  const [showError, setShowError] = useState("");
  const [file, setFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
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
      canSeeReports: false,
      canAccessSettings: false,
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
      password: "", // Don't pre-fill for security
      roles: {
        canAddItems: user.roles?.canAddItems || false,
        canEditItems: user.roles?.canEditItems || false,
        canSeeReports: user.roles?.canSeeReports || false,
        canAccessSettings: user.roles?.canAccessSettings || false,
        canMakeTransaction: user.roles?.canMakeTransaction || false,
        canAccessUserManagement: user.roles?.canAccessUserManagement || false,
      },
    });
    setPhotoPreview(user.photo ? `/uploads/${user.photo}` : null); // if you display existing image
  }
}, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log("Changed", name, value);
    setEditUser((prevUser) => ({ ...prevUser, [name]: value }));
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

    try {
      // Build FormData object
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
      formData.append("password", editUser.password || "");
      formData.append("roles", JSON.stringify(editUser.roles));
      if (file) {
        formData.append("photo", file);
      }

      // Send PUT request to backend
      const response = await axios.put(
        `${BASE_URL}/api/users/update/${user._id}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );

      console.log("Update success:", response.data);
      console.log("Submitting data:", editUser);
      setShowModal(false);
      onUserAdded(); // Refresh user list or UI

    } catch (error) {
      if (error.response && error.response.data) {
        setShowError(error.response.data.error || "Update failed.");
      } else {
        setShowError("An error occurred. Please contact support.");
      }
      console.error("Update error:", error);
    }
  };

  return (
    showModal && (
      <div className="flex justify-center items-center fixed inset-0 z-50 bg-indigo-600 bg-opacity-10">
        <div className="w-full md:w-3/4 lg:w-2/3 xl:w-1/2 max-h-[90vh] overflow-y-auto scrollbar-hide bg-white rounded-lg shadow-lg">
          <div className="flex items-start justify-between p-5 border-b border-solid border-gray-300 rounded-t ">
            <h3 className="text-3xl font=semibold">Add Item</h3>
            <button
              className="bg-transparent border-0 text-black float-right"
              onClick={() => setShowModal(false)}
            >
              <span className="text-red-700 opacity-7 h-6 w-6 text-xl blockpy-0 rounded-lg bg-grey py-3 px-7">
                x
              </span>
            </button>
          </div>

          <div className="p-6">
            <form onSubmit={handleEditUser} className="grid grid-cols-2 gap-4">
              {[
                "firstName",
                "secondName",
                "lastName",
                "userName",
                "dateOfBirth",
                "email",
                "contacts",
                "address",
                "title",
                "password",
              ].map((name) => (
                <div key={name}>
                  <label className="block text-sm font-medium text-gray-900">
                    {name.replace(/([A-Z])/g, " $1").trim()}
                  </label>
                  <input
                    type={
                      name === "password"
                        ? "password"
                        : name === "email"
                        ? "email"
                        : name === "dateOfBirth"
                        ? "date"
                        : "text"
                    }
                    name={name}
                    value={editUser[name] || ""}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-md text-black"
                  />
                </div>
              ))}

              <div>
                <label className="block text-sm font-medium text-gray-900">
                  Gender
                </label>
                <select
                  name="gender"
                  value={editUser.gender}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md text-gray-600"
                >
                  <option value="">Select Gender</option>
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                </select>
              </div>
              <div className="col-span-2 mt-4">
                <label className="block text-sm font-bold text-gray-900">
                  Photo
                </label>
                <input type="file" onChange={handleFileChange} />
                {photoPreview && (
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="mt-2 w-24 h-24 rounded-lg object-cover"
                  />
                )}
              </div>

              <div className="col-span-2 mt-4 max-h-60 overflow-y-auto">
                <p className="font-semibold mb-2">Roles and Permissions</p>
                {[
                  "canAddItems",
                  "canEditItems",
                  "canSeeReports",
                  "canAccessSettings",
                  "canMakeTransaction",
                  "canAccessUserManagement",
                ].map((role) => (
                  <label
                    key={role}
                    className="flex items-center justify-between bg-gray-300 px-4 py-2 rounded-lg mt-2 text-black"
                  >
                    <span>{role.replace(/([A-Z])/g, " $1")}</span>

                    <div className="relative">
                      <input
                        type="checkbox"
                        name={role}
                        checked={editUser.roles[role]}
                        onChange={handleCheckboxChange}
                        className="peer sr-only"
                      />
                      <div className="block h-8 rounded-full dark:bg-dark-2 bg-white w-14" />
                      <div className="absolute w-6 h-6 transition bg-black rounded-full dot dark:bg-dark-4 left-1 top-1 peer-checked:translate-x-full peer-checked:bg-green-500" />
                    </div>
                  </label>
                ))}
              </div>
              <button
                type="submit"
                className="col-span-2 bg-green-300 py-2 rounded-md hover:bg-gray-300 text-black"
              >
                Submit
              </button>
            </form>
          </div>
          <div className="flex items-center justify-center p-4 border-t">
            <button
              className="text-red-500 font-bold uppercase px-6 py-2 rounded-lg"
              onClick={() => setShowModal(false)}
            >
              Close
            </button>
          </div>
          <div className="flex items-center justify-center p-4 border-t">
            {showError && (
              <div className="bg-red-100 border border-red-200 text-red-800 rounded-lg p-4">
                Error: {showError}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  );
};

export default EditUser;
