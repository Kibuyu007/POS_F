import axios from "axios";
import { addSupplier, supplierFetch } from "../../../Redux/suppliers";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";

//API
import BASE_URL from "../../../Utils/config"


const AddSupplier = ({ showModal, setShowModal }) => {
  //Use selector from Redux
  const { supplier } = useSelector((state) => state.suppliers);
  const dispatch = useDispatch();

  const [showError, setShowError] = useState("");
  const [regi, setRegi] = useState({
    supplierName: "",
    phone: 0,
    address: "",
    company: "",
    email: "",
  });

  const [validation, setValidation] = useState({
    supplierName: true,
    phone: true,
  });

  //Fetch Suppliers
  useEffect(() => {
    dispatch(supplierFetch(supplier));
  }, [dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRegi({ ...regi, [name]: value });

    if (name == "phone") {
      const phoneVali = /^[0-9]{10}$/;
      setValidation((prev) => ({ ...prev, phone: phoneVali.test(value) }));
    }
  };

  const handleAddItems = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${BASE_URL}/api/suppliers/addSupplier`,
        regi
      );
      console.log(response);
      dispatch(addSupplier(response?.data));

      setRegi({
        supplierName: "",
        phone: 0,
        address: "",
        email: "",
        company: "",
      });
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
      {showModal ? (
        <>
          <div className="flex justify-center items-center overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none bg-indigo-600 bg-opacity-10 ">
            <div className="w-full md:w-1/2 lg:w-1/3">
              <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
                <div className="flex items-start justify-between p-5 border-b border-solid border-gray-300 rounded-t ">
                  <h3 className="text-3xl font=semibold">+ Supplier</h3>
                  <button
                    className="bg-transparent border-0 text-black float-right"
                    onClick={() => setShowModal(false)}
                  >
                    <span className="text-red-700 opacity-7 h-6 w-6 text-xl blockpy-0 rounded-lg bg-grey py-3 px-7">
                      X
                    </span>
                  </button>
                </div>

                <div className="relative p-6 flex-auto">
                  <form
                    onSubmit={handleAddItems}
                    className=" grid grid-cols-2 gap-4"
                  >
                    <div>
                      <label
                        htmlFor="supplierName"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Name Of the Supplier
                      </label>
                      <input
                        type="text"
                        name="supplierName"
                        value={regi.supplierName}
                        onChange={handleChange}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                        placeholder="name@company.com"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="phone"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Phone Number
                      </label>
                      <input
                        type="number"
                        name="phone"
                        value={regi.phone}
                        onChange={handleChange}
                        className={`w-full h-12 px-4 py-1 rounded-lg border ${
                          validation.phone
                            ? "border-gray-400"
                            : "border-red-500 border-2"
                        } text-gray-800 focus:outline-none`}
                        placeholder="Phone"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="address"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Address
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={regi.address}
                        onChange={handleChange}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                        placeholder="..."
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="email"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={regi.email}
                        onChange={handleChange}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                        placeholder="..."
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="company"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Name of The Company
                      </label>
                      <input
                        type="text"
                        name="company"
                        value={regi.company}
                        onChange={handleChange}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                        placeholder="..."
                      />
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
        </>
      ) : null}
    </>
  );
};

export default AddSupplier;
