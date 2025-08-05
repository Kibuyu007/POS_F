import axios from "axios";
import { addCategory } from "../../../../Redux/itemsCategories";
import { useDispatch } from "react-redux";
import { useState } from "react";

//API
import BASE_URL from "../../../../Utils/config"


const AddCategory = ({ showModal, setShowModal, onCategoryAdded }) => {
  const dispatch = useDispatch();

  const [showError, setShowError] = useState("");

  const [regi, setRegi] = useState({
    name: "",
    description: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRegi({ ...regi, [name]: value });
  };

  const handleAddItemCategory = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${BASE_URL}/api/itemsCategories/addItemCategories`,
        regi,{ withCredentials: true }
      );
      console.log(response);
      dispatch(addCategory(response?.data));

      setRegi({
        name: "",
        description: "",
      });
      onCategoryAdded();
    } catch (error) {
      // Extract the correct error message from backend
      if (error.response && error.response.data) {
        setShowError(
          error.response.data.error ||
            "An error occurred. Please Contact System Adminstrator."
        );
      } else {
        setShowError("");
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
                  <form onSubmit={handleAddItemCategory} className="space-y-6">
                    <div>
                      <label
                        htmlFor="name"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Name Of the Category
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={regi.name}
                        onChange={handleChange}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                        placeholder="name@company.com"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="Description"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Description of Item
                      </label>
                      <textarea
                        type="text"
                        name="description"
                        value={regi.description}
                        onChange={handleChange}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                        placeholder="..."
                      />
                    </div>

                    <button
                      type="submit"
                      className="col-span-2 bg-green-300 py-2 rounded-md hover:bg-gray-300 text-black w-full"
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

export default AddCategory;
