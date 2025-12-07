import axios from "axios";
import { useEffect, useState } from "react";
import { editCategory } from "../../../../Redux/itemsCategories";
import { useDispatch } from "react-redux";
import { FiFolder, FiFileText, FiX, FiCheck, FiTag } from "react-icons/fi";
import BASE_URL from "../../../../Utils/config";
import toast from "react-hot-toast";

const EditCategory = ({
  showModal,
  setShowModal,
  onCategoryUpdated,
  catego,
}) => {
  const [editData, setEditData] = useState({
    name: "",
    description: "",
  });

  const [showError, setShowError] = useState("");
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    if (catego) {
      setEditData({
        name: catego.name || "",
        description: catego.description || "",
      });
      setShowError("");
    }
  }, [catego]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditData({ ...editData, [name]: value });
    if (showError) setShowError("");
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!editData.name.trim()) {
      setShowError("Category name is required");
      return;
    }
    
    if (editData.name.trim().length < 2) {
      setShowError("Category name must be at least 2 characters");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.put(
        `${BASE_URL}/api/itemsCategories/editItemCategories/${catego._id}`,
        editData,
        { withCredentials: true }
      );
      
      dispatch(editCategory(response?.data.data));
      toast.success("Category updated successfully!");
      
      setTimeout(() => {
        setShowModal(false);
        onCategoryUpdated();
      }, 1500);
    } catch (error) {
      if (error.response && error.response.data) {
        setShowError(
          error.response.data.error ||
            "Failed to update category. Please try again."
        );
      } else {
        setShowError("An error occurred. Please contact System Administrator.");
      }
      console.error("Update category failed", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setEditData({
      name: catego?.name || "",
      description: catego?.description || "",
    });
    setShowError("");
  };

  return (
    <>
      {showModal ? (
        <>
          <div className="flex justify-center items-center overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none bg-gray-900 bg-opacity-20">
            <div className="w-full md:w-2/3 lg:w-1/2">
              <div className="border border-gray-300 rounded-2xl shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
                {/* Header */}
                <div className="flex items-start justify-between p-5 bg-green-300 border-b border-gray-400 rounded-t-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center">
                      <FiFolder className="w-5 h-5 text-black" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-black">Edit Category</h3>
                      <p className="text-black/70 text-sm mt-1">Update existing item category</p>
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
                  <form onSubmit={handleEdit} className="space-y-6">
                    {/* Category Name */}
                    <div>
                      <div className="mb-2">
                        <label className="block text-sm font-bold text-gray-900">
                          Category Name
                        </label>
                      </div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-3 flex items-center">
                          <FiTag className="w-4 h-4 text-gray-500" />
                        </div>
                        <input
                          type="text"
                          name="name"
                          value={editData.name}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-full bg-white text-black focus:outline-none focus:border-green-300"
                          placeholder="Enter category name"
                          disabled={loading}
                          autoFocus
                        />
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <div className="mb-2">
                        <label className="block text-sm font-bold text-gray-900">
                          Description (Optional)
                        </label>
                      </div>
                      <div className="relative">
                        <div className="absolute top-3 left-3">
                          <FiFileText className="w-4 h-4 text-gray-500" />
                        </div>
                        <textarea
                          name="description"
                          value={editData.description}
                          onChange={handleChange}
                          rows="3"
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl bg-white text-black focus:outline-none focus:border-green-300 resize-none"
                          placeholder="Enter category description"
                          disabled={loading}
                        />
                      </div>
                    </div>

                    {/* Validation Summary */}
                    <div className="bg-gray-100 rounded-xl p-4 border border-gray-300">
                      <p className="text-sm font-bold text-black mb-3">Validation Status</p>
                      <div className="space-y-2">
                        <div className={`flex items-center gap-3 ${editData.name ? "text-green-700" : "text-red-600"}`}>
                          <div className={`w-3 h-3 rounded-full ${editData.name ? "bg-green-300" : "bg-red-300"}`} />
                          <span className="text-sm">
                            Category name {editData.name ? "✓" : "(required - minimum 2 characters)"}
                          </span>
                        </div>
                        <div className={`flex items-center gap-3 ${editData.description ? "text-green-700" : "text-gray-600"}`}>
                          <div className={`w-3 h-3 rounded-full ${editData.description ? "bg-green-300" : "bg-gray-400"}`} />
                          <span className="text-sm">Description {editData.description ? "✓" : "(optional)"}</span>
                        </div>
                      </div>
                    </div>

                    {/* Error Message */}
                    {showError && (
                      <div>
                        <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-4">
                          <span className="font-bold">Error: </span> {showError}
                        </div>
                      </div>
                    )}

                    {/* Submit Button */}
                    <div>
                      <button
                        type="submit"
                        disabled={loading || !editData.name}
                        className={`w-full py-3 font-bold rounded-full flex items-center justify-center gap-2 ${
                          loading || !editData.name
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
                            <span>Updating...</span>
                          </>
                        ) : (
                          <>
                            <FiCheck className="w-5 h-5" />
                            <span>Update Category</span>
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
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-black font-bold rounded-full transition-colors text-sm"
                    disabled={loading}
                  >
                    Reset
                  </button>
                  <button
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-black font-bold rounded-full transition-colors text-sm"
                    onClick={() => setShowModal(false)}
                    disabled={loading}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </>
  );
};

export default EditCategory;