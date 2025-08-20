import axios from "axios";
import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { updateCustomer } from "../../../Redux/customerSlice";

// API
import BASE_URL from "../../../Utils/config";

const EditCustomer = ({ showModal, setShowModal, customer }) => {
  const dispatch = useDispatch();

  const [showError, setShowError] = useState("");
  const [editCustomer, setEditCustomer] = useState({
    _id: "",
    customerName: "",
    phone: "",
    address: "",
    company: "",
    email: "",
    status: "Active",
  });

  useEffect(() => {
    if (customer && showModal) {
      setEditCustomer({
        _id: customer._id || "",
        customerName: customer.customerName || "",
        phone: customer.phone || "",
        address: customer.address || "",
        company: customer.company || "",
        email: customer.email || "",
        status: customer.status || "Active",
      });
    }
  }, [customer, showModal]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditCustomer((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditCustomer = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.put(
        `${BASE_URL}/api/customers/updateCustomer/${editCustomer._id}`, 
        editCustomer
      );

      dispatch(updateCustomer(response.data.updatedCustomer || editCustomer));

      console.log(response);
      setShowModal(false);
    } catch (error) {
      if (error.response && error.response.data) {
        setShowError(
          error.response.data.error ||
            "Update failed. Please check the input data."
        );
      } else {
        setShowError("An error occurred. Please contact system administrator.");
      }
      console.error("Update failed", error);
    }
  };

  return (
    showModal && (
      <div className="flex justify-center items-center fixed inset-0 z-50 bg-indigo-600 bg-opacity-10">
        <div className="w-full md:w-3/4 lg:w-2/3 xl:w-1/2 max-h-[90vh] overflow-y-auto scrollbar-hide bg-white rounded-lg shadow-lg">
          <div className="flex items-start justify-between p-5 border-b border-gray-300 rounded-t">
            <h3 className="text-2xl font-semibold">Edit Customer</h3>
            <button
              className="text-red-600 text-xl font-bold"
              onClick={() => setShowModal(false)}
            >
              <span className="text-red-700 h-6 w-6 text-xl bg-grey py-3 px-7 rounded-lg">
                X
              </span>
            </button>
          </div>

          <div className="p-6">
            <form
              onSubmit={handleEditCustomer}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {/* Customer Name */}
              <div>
                <label className="block text-sm font-medium text-gray-900">
                  Customer Name
                </label>
                <input
                  type="text"
                  name="customerName"
                  value={editCustomer.customerName}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md text-black"
                  required
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-900">
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={editCustomer.phone}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md text-black"
                  required
                />
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-900">
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={editCustomer.address}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md text-black"
                  required
                />
              </div>

              {/* Company */}
              <div>
                <label className="block text-sm font-medium text-gray-900">
                  Company
                </label>
                <input
                  type="text"
                  name="company"
                  value={editCustomer.company}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md text-black"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-900">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={editCustomer.email}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md text-black"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-900">
                  Status
                </label>
                <select
                  name="status"
                  value={editCustomer.status}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md text-black"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              {/* Submit Button */}
              <div className="col-span-1 md:col-span-2">
                <button
                  type="submit"
                  className="w-full bg-green-300 text-black py-2 rounded-md hover:bg-gray-300 transition"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>

          <div className="flex justify-center p-4 border-t">
            <button
              className="text-red-600 font-bold uppercase px-6 py-2"
              onClick={() => setShowModal(false)}
            >
              Close
            </button>
          </div>

          {showError && (
            <div className="px-6 pb-4">
              <div className="bg-red-100 border border-red-200 text-red-800 rounded-lg p-4">
                Error: {showError}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  );
};

export default EditCustomer;
