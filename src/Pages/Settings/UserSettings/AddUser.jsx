import { useState } from "react";
import axios from "axios";

//API
import BASE_URL from "../../../Utils/config"


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
    },
    password: "",
  });

  const [showError, setShowError] = useState("");

  const [file, setFile] = useState();
  const [photoPreview, setPhotoPreview] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewUser((prevUser) => ({
      ...prevUser,
      [name]: value,
    }));
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
      formData.append("file", file);
      formData.append("roles", JSON.stringify(newUser.roles));
      formData.append("password", newUser.password);

      await axios.post(`${BASE_URL}/api/auth/register`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log("User added:");

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
        photo: "",
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
      setShowModal(false);
      onUserAdded();
    } catch (error) {
      // Extract the correct error message from backend
      if (error.response && error.response.data) {
        setShowError(
          error.response.data.error ||
            "Login failed. Please check your credentials."
        );
      } else {
        setShowError("An error occurred. Please Contact System Adminstrator.");
      }

      console.error("Login failed", error);
    }
  };

  return (
    <>
      {showModal && (
        <div className="flex justify-center items-center fixed inset-0 z-50 bg-indigo-600 bg-opacity-10">
          <div className="w-full md:w-3/4 lg:w-2/3 xl:w-1/2 max-h-[90vh] overflow-y-auto scrollbar-hide">
            <div className="bg-white rounded-lg shadow-lg">
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
                <form
                  onSubmit={handleAddNewUser}
                  className="grid grid-cols-2 gap-4"
                >
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
                        {name.charAt(0).toUpperCase() +
                          name.slice(1).replace(/([A-Z])/g, " $1")}
                      </label>
                      <input
                        type={
                          name === "dateOfBirth"
                            ? "date"
                            : name === "password"
                            ? "password"
                            : name === "email"
                            ? "email"
                            : "text"
                        }
                        name={name}
                        value={newUser[name]}
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
                      value={newUser.gender}
                      onChange={handleChange}
                      className="w-full p-2 border rounded-md text-gray-600"
                    >
                      <option value="">Select Gender</option>
                      <option value="Female" className="bg-gray-200">
                        Female
                      </option>
                      <option value="Male" className="bg-gray-100">
                        Male
                      </option>
                    </select>
                  </div>

                  <div className="flex col-span-2">
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
                            checked={newUser.roles[role]}
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
                  <div
                    className="mt-2 bg-red-100/70 border border-red-200 text-sm text-red-800 rounded-lg p-4 dark:bg-red-800/10 dark:border-red-900 dark:text-red-500"
                    role="alert"
                  >
                    <span className="font-bold">Error: </span> {showError}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AddUser;
