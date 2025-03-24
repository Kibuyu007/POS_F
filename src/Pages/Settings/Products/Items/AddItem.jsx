import axios from "axios";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { additem } from "../../../../Redux/items";
import { fetchCategories } from "../../../../Redux/itemsCategories";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const AddItem = ({ showModal, setShowModal, onUserAdded }) => {
  //Use selector from Redux
  const { categories } = useSelector((state) => state.category);

  const [file, setFile] = useState();
  const [photoPreview, setPhotoPreview] = useState(null);
  const [showError, setShowError] = useState("");

  const [regi, setRegi] = useState({
    name: "",
    price: 0,
    category: "",
    unit: "",
    barcode: "",
    itemQuantity: 0,
    manufactureDate: new Date(),
    expireDate: new Date(),
  });

  const dispatch = useDispatch();

  //Fetch ItemCategories
  useEffect(() => {
    if (!categories.length) {
      dispatch(fetchCategories());
    }
  }, [dispatch, categories.length]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRegi({ ...regi, [name]: value });
  };

  const handleManufacturedDate = (date) => {
    setRegi({ ...regi, manufactureDate: date });
  };

  const handleExpireDate = (date) => {
    setRegi({ ...regi, expireDate: date });
  };

  const handleAddItems = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:4004/api/items/addItem",
        regi
      );
      console.log(response);
      dispatch(additem(response?.data));

      setRegi({
        name: "",
        price: "",
        category: "",
        unit: "",
        barcode: "",
        itemQuantity: "",
        manufactureDate: "",
        expireDate: "",
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
      {showModal ? (
        <>
          <div className="flex justify-center items-center overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none bg-indigo-600 bg-opacity-10 ">
            <div className="w-full md:w-1/2 lg:w-1/3">
              <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
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

                <div className="relative p-6 flex-auto">
                  <form
                    onSubmit={handleAddItems}
                    className=" grid grid-cols-2 gap-4"
                  >
                    <div>
                      <label
                        htmlFor="name"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Name Of the Item
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={regi.name}
                        onChange={handleChange}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                        placeholder=".........."
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="price"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Price of the Item
                      </label>
                      <input
                        type="number"
                        name="price"
                        value={regi.price}
                        onChange={handleChange}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                        placeholder="..."
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="category"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Item category
                      </label>
                      <select
                        name="category"
                        value={regi.category}
                        onChange={handleChange}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                      >
                        <option value="" disabled>
                          Select a category
                        </option>
                        {categories.map((category) => (
                          <option key={category._id} value={category._id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="itemQuantity"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Quantity
                      </label>
                      <input
                        type="number"
                        name="itemQuantity"
                        value={regi.itemQuantity}
                        onChange={handleChange}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                        placeholder="..."
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="barcode"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        QRcode
                      </label>
                      <input
                        type="text"
                        name="barcode"
                        value={regi.barcode}
                        onChange={handleChange}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                        placeholder="..."
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="barcode"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Manufacturing Date
                      </label>
                      <span className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white">
                        {" "}
                        <DatePicker
                          selected={regi.manufactureDate}
                          onChange={handleManufacturedDate}
                          showTimeSelect
                          timeIntervals={1}
                          dateFormat="Pp"
                        />
                      </span>
                    </div>

                    <div>
                      <label
                        htmlFor="barcode"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Expiring Date
                      </label>
                      <span className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white">
                        {" "}
                        <DatePicker
                          selected={regi.expireDate}
                          onChange={handleExpireDate}
                          showTimeSelect
                          timeIntervals={1}
                          dateFormat="Pp"
                        />
                      </span>
                    </div>

                    <div className="flex col-span-2 mt-3 border-solid">
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

export default AddItem;
