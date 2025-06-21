import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaSearch } from "react-icons/fa";

//Icons
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts, searchItemsEveryWhere } from "../../../Redux/items";
import { TiArrowRightThick } from "react-icons/ti";
import { IoMdRemoveCircle } from "react-icons/io";
import { fetchSuppliers } from "../../../Redux/suppliers";
import Loading from "../../../Components/Shared/Loading";

const Manunuzi = () => {
  const [selectedItem, setSelectedItem] = useState([]);
  const { items } = useSelector((state) => state.items);
  const { supplier, error, loading } = useSelector((state) => state.suppliers);
  const [searchQuery, setSearchQuery] = useState("");
  const [load, setLoad] = useState(false);
  const dispatch = useDispatch();

  const [regi, setRegi] = useState({
    supplierName: "",
    comments: "",
  });

  //Fetch Items
  useEffect(() => {
    setLoad(true);
    dispatch(fetchProducts());
    setLoad(false);
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchSuppliers());
  }, [dispatch]);

  //Restrict select item twice
  const handleItemSelection = (selectedItemToAdd) => {
    const isSelected = selectedItem.some(
      (item) => item._id === selectedItemToAdd._id
    );

    if (isSelected) {
      // Item already selected, so do not add it again
      return;
    } else {
      setSelectedItem((prevItems) => [...prevItems, selectedItemToAdd]);
    }
  };

  //HANDLE CHANGE FOR INPUT
  const handleChangeRegi = (e) => {
    const { name, value } = e.target;
    setRegi({ ...regi, [name]: value });
  };

  const handleChange = (index, field, value) => {
    const updated = [...selectedItem];
    updated[index] = {
      ...updated[index],
      [field]: field === "requiredQuantity" ? parseFloat(value) || 0 : value,
    };
    setSelectedItem(updated);
  };

  //SUBMIT ALL DATA
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const selectedSupplier = supplier.find(
        (sup) => sup._id === regi.supplierName
      );

      const missingQuantity = selectedItem.some(
        (item) => !item.requiredQuantity || item.requiredQuantity <= 0
      );

      if (missingQuantity) {
        toast.error("Please provide a valid quantity for all selected items.", {
          style: {
            borderRadius: "12px",
            background: "#e74c3c",
            color: "#fff",
            fontSize: "20px",
          },
        });
        return;
      }

      const response = await axios.post(
        "http://localhost:4004/api/manunuzi/addPo",
        {
          ...regi,
          allItems: selectedItem.map((item) => ({
            name: item.name,
            requiredQuantity: item.requiredQuantity
              ? parseFloat(item.requiredQuantity)
              : 0,
            description: item.description || "",
          })),
          supplierName: selectedSupplier ? selectedSupplier.supplierName : "",
        },
        { withCredentials: true }
      );
      console.log("New stocks added successfully", response.data);
      const successMessage = response.data;

      toast.success(successMessage.message, {
        style: {
          borderRadius: "12px",
          background: "#27ae60",
          color: "#fff",
          fontSize: "26px",
        },
      });

      dispatch(fetchProducts());
      setSelectedItem([]);
      setRegi({
        supplierName: "",
        comments: "",
      });
    } catch (error) {
      console.error("Error adding new stocks:", error);
      toast.error("There is Error in Addning  New Stock", {
        style: {
          borderRadius: "12px",
          background: "#27ae60",
          color: "#fff",
          fontSize: "26px",
        },
      });
    }
  };

  //REMOVE SELECTED ITEM
  const removeItem = (itemToRemove) => {
    setSelectedItem((items) =>
      items.filter((item) => item._id !== itemToRemove._id)
    );
  };

  //HANDLE CANCEL FORM
  const handleCancel = () => {
    setSelectedItem([]);
  };

  // Check if suppliers are loading or if there's an error
  if (loading) return <p>Loading suppliers...</p>;
  if (error) return <p>Error loading suppliers: {error}</p>;
  if (!supplier || supplier.length === 0)
    return <p>No active suppliers available</p>;

  //***************************************************************************************************************************** */

  return (
    <div>
      <div className="px-4  py-4 md:py-7">
        <div>
          <p className="text-lg md:text-xl lg:text-2xl font-bold text-gray-800">
            PRE - PURCHASE
          </p>
        </div>
      </div>
      <section className="flex flex-col md:flex-row gap-3 overflow-hidden mt-8 shadow-[0px_0px_0px_1px_rgba(0,0,0,0.06),0px_1px_1px_-0.5px_rgba(0,0,0,0.06),0px_3px_3px_-1.5px_rgba(0,0,0,0.06),_0px_6px_6px_-3px_rgba(0,0,0,0.06),0px_12px_12px_-6px_rgba(0,0,0,0.06),0px_24px_24px_-12px_rgba(0,0,0,0.06)]">
        {/* Section One Item List */}
        {/* Right Section: Products Table */}
        <div className="flex-[2] bg-secondary p-4 sm:p-6 border rounded-md shadow-[0px_0px_0px_1px_rgba(0,0,0,0.06),0px_1px_1px_-0.5px_rgba(0,0,0,0.06),0px_3px_3px_-1.5px_rgba(0,0,0,0.06),_0px_6px_6px_-3px_rgba(0,0,0,0.06),0px_12px_12px_-6px_rgba(0,0,0,0.06),0px_24px_24px_-12px_rgba(0,0,0,0.06)] text-black w-full md:w-auto overflow-y-auto max-h-[60vh] md:max-h-[100vh] scrollbar-hide ">
          <div>
            <div className="font-bold text-xl text-black">Products</div>

            {/* Search Input */}
            <div className="flex items-center p-2 rounded-md">
              <div className="hidden sm:flex items-center bg-gray-100 rounded-[30px] px-3 sm:px-4 py-1 sm:py-2 w-full max-w-[300px] border border-gray-400">
                <FaSearch className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-black" />
                <input
                  type="text"
                  placeholder="Search Item..."
                  className="bg-transparent outline-none px-2 py-1 w-full text-black"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    dispatch(searchItemsEveryWhere(e.target.value));
                  }}
                />
              </div>
            </div>
            <Loading load={load} />

            <div className="max-h-[400px] overflow-y-auto mt-4  rounded-lg">
              <table className="min-w-full leading-normal mt-6  rounded-lg p-4">
                <thead>
                  <tr>
                    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-200 text-center text-xs font-bold text-gray-900 uppercase tracking-wider">
                      (S/N)
                    </th>
                    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-200 text-center text-xs font-bold text-gray-900 uppercase tracking-wider">
                      Product Name
                    </th>
                    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-200 text-center text-xs font-bold text-gray-900 uppercase tracking-wider">
                      Balance
                    </th>
                    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-200 text-center text-xs font-bold text-gray-900 uppercase tracking-wider">
                      Select
                    </th>
                  </tr>
                  <tr className="h-4" />
                </thead>
                <tbody className="overflow-auto text-black">
                  {items?.map((item, index) => (
                    <>
                      <tr
                        key={item._id}
                        className="h-16 border-gray-500 shadow-md bg-gray-100"
                      >
                        <td className="py-2 px-3 font-normal text-base border-x border-t border-gray text-center">
                          {index + 1}
                        </td>
                        <td className="py-2 px-3 font-normal text-base border-x border-t border-gray capitalize">
                          {item.name}
                        </td>
                        <td className="py-2 px-3 font-normal text-base border-x border-t border-gray text-center">
                          {item.itemQuantity}
                        </td>
                        <td className="py-2 px-3 font-normal text-base border-x border-t border-gray text-center">
                          <button
                            onClick={() => handleItemSelection(item)}
                            className="cursor-pointer"
                          >
                            <TiArrowRightThick />
                          </button>
                        </td>
                      </tr>
                      <tr className="h-4" />
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ****************************************************************************************************************************************** */}

        {/* Section 2 */}
        <div className="flex-[4] bg-secondary p-4 sm:p-6 border rounded-md shadow-[0px_0px_0px_1px_rgba(0,0,0,0.06),0px_1px_1px_-0.5px_rgba(0,0,0,0.06),0px_3px_3px_-1.5px_rgba(0,0,0,0.06),_0px_6px_6px_-3px_rgba(0,0,0,0.06),0px_12px_12px_-6px_rgba(0,0,0,0.06),0px_24px_24px_-12px_rgba(0,0,0,0.06)] text-black w-full md:w-auto overflow-y-auto max-h-[60vh] md:max-h-[100vh] scrollbar-hide ">
          {/* header */}
          <div className="flex flex-row justify-between items-center px-5 mt-5">
            <div className="text-gray-800 ">
              <div className="font-bold text-xl">Purchace Details</div>
            </div>

            <div className="flex items-center ">
              <div>
                <span className="px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded">
                  1
                </span>
              </div>
            </div>
          </div>
          {/* end header */}

          {/* Table ya items zilizojazwa details  */}
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
            <table className="min-w-full leading-normal  table-fixed">
              <thead>
                <tr>
                  <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-200 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
                    (S/N)
                  </th>

                  <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-200 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Product Name
                  </th>

                  <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-200 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Previous Balnce
                  </th>

                  <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-200 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Required Quantity
                  </th>

                  <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-200 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Decreption
                  </th>

                  <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-200 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
                <tr className="h-4" />
              </thead>

              <tbody>
                <>
                  {Array.isArray(selectedItem) &&
                    selectedItem.map((item, index) => (
                      <>
                        <tr
                          key={index + 1}
                          className="h-16 border-gray-500 shadow-md bg-gray-100"
                        >
                          <td className="py-2 px-3 font-normal text-base border-x  hover:bg-gray-100">
                            <div className="flex justify-center">
                              <div className="ml-3">
                                <p className="text-gray-900 whitespace-no-wrap font-bold capitalize bg-green-300 rounded-full flex items-center justify-center h-8 w-8">
                                  {index + 1}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td
                            className={`py-2 px-3 font-normal text-base border-x ${
                              index == 0
                                ? "border-t border-gray"
                                : index == item?.length
                                ? "border-y border-gray"
                                : "border-t border-gray"
                            } hover:bg-gray-100`}
                          >
                            <div className="flex">
                              <span className="relative inline-block px-3 py-1 font-semibold capitalize leading-tight">
                                <span
                                  aria-hidden
                                  className="absolute inset-0 opacity-50 rounded-full"
                                />
                                <span className="relative">{item.name}</span>
                              </span>
                            </div>
                          </td>

                          <td className="py-2 px-3 font-normal text-base border-x  hover:bg-gray-100  whitespace-nowrap overflow-hidden overflow-ellipsis max-w-[200px]">
                            <div className="items-center">
                              <div className="ml-3">
                                <p className="text-gray-900 whitespace-no-wrap font-semibold capitalize">
                                  {item.itemQuantity}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="py-2 px-3 font-normal text-base border-x hover:bg-gray-100">
                            <div>
                              <input
                                type="number"
                                name="requiredQuantity"
                                value={item.requiredQuantity}
                                onChange={(e) =>
                                  handleChange(
                                    index,
                                    "requiredQuantity",
                                    e.target.value
                                  )
                                }
                                required
                                min="1"
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-28 p-2 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white px-1 py-3"
                                placeholder="..."
                              />
                            </div>
                          </td>

                          <td className="py-2 px-3 font-normal text-base border-x  hover:bg-gray-100">
                            <div>
                              <input
                                type="text"
                                name="description"
                                value={item.description}
                                onChange={(e) =>
                                  handleChange(
                                    index,
                                    "description",
                                    e.target.value
                                  )
                                }
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block w-28 p-2 dark:bg-gray-100 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white px-1 py-3"
                                placeholder="..."
                                required
                              />
                            </div>
                          </td>

                          <td>
                            <div className="flex justify-center">
                              <button
                                type="button"
                                onClick={() => removeItem(item)}
                              >
                                <span className="relative text-2xl text-red-800">
                                  <IoMdRemoveCircle />
                                </span>
                              </button>
                            </div>
                          </td>
                        </tr>
                        <tr className="h-4" />
                      </>
                    ))}
                </>
              </tbody>
            </table>

            <div className="flex flex-wrap -mx-2 border-2 mt-4 p-2 gap-6 rounded-lg">
              <div className="w-full sm:w-1/3 p-2">
                <label
                  htmlFor="supplierName"
                  className="block text-md font-bold text-gray-700"
                >
                  Supplier
                </label>
                <select
                  name="supplierName"
                  value={regi.supplierName}
                  onChange={handleChangeRegi}
                  className="bg-gray-100 rounded-md p-2 w-full py-3 border capitalize mt-2"
                >
                  <option value="" disabled>
                    Select Supplier
                  </option>

                  {supplier.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.supplierName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="w-full sm:w-1/3 p-2">
                <label
                  htmlFor="input3"
                  className="block text-md font-bold text-gray-700"
                >
                  Comments
                </label>
                <textarea
                  type="text"
                  name="comments"
                  value={regi.comments}
                  onChange={handleChangeRegi}
                  className="bg-gray-100 rounded-md  w-full mt-2"
                />
              </div>
            </div>

            <div className="flex justify-between gap-10">
              <button
                onClick={handleSubmit}
                type="submit"
                className="mt-6 border w-full rounded-md p-3 px-2 py-2 bg-green-300 font-bold"
              >
                Submit
              </button>

              <button
                type="button"
                onClick={handleCancel}
                className="mt-6 border w-full rounded-md p-3 px-2 py-2 bg-gray-200 font-bold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Manunuzi;
