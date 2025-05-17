
import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import { FaSearch } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { itemsFetch } from "../../../Redux/items";


const Manunuzi = () => {
  // Redux State
  const { items = [] } = useSelector((state) => state.items);
  const [selectedItem,setSelectedItem] = useState([])
  const dispatch = useDispatch()



    //Fetch Items
    useEffect(() => {
        dispatch(itemsFetch());
      }, [dispatch]);

  return (
    <section className="h-[70vh] flex flex-col md:flex-row gap-3 px-4 overflow-hidden">
      {/* Section 1 */}
      <div className="w-2/4 bg-gray-50 shadow-lg rounded-xl p-6 overflow-auto border">
        <h1 className="text-black text-xl font-bold">Items</h1>

        <div className="hidden sm:flex items-center bg-gray-100 rounded-[30px] px-1 sm:px-4 py-1 sm:py-2 w-full max-w-[300px] border border-gray-400 ml-12">
          <FaSearch className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-black" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent outline-none px-2 py-1 w-full text-black"
          />
        </div>

        {/* Table of Items and Balnces */}
        <div className="mt-7 overflow-x-auto">
          <table className="w-full whitespace-nowrap">
            <thead className="bg-gray-200 text-black">
              <tr>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-200 text-center text-xs font-bold text-black uppercase tracking-wider">
                  SN
                </th>

                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-200 text-center text-xs font-bold text-black uppercase tracking-wider">
                  Item
                </th>

                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-200 text-center text-xs font-bold text-black uppercase tracking-wider">
                  Balance
                </th>
              </tr>
            </thead>
            <tr className="h-3" />

            <tbody>
              {items.map((item, index) => (
                  <>
                    <tr
                      key={item._id}
                      className="h-16 border-gray-500 shadow-md bg-gray-100"
                    >
                      <td
                        className={`pl-5 font-bold  ${
                          item.status === "Expired" ? "bg-red-500" : ""
                        }`}
                      >
                      </td>
                      <td
                        className={`py-2 px-3 font-normal text-base border-x bg-gray-200 ${
                          index == 0
                            ? "border-t border-gray"
                            : index == items?.length
                            ? "border-y border-gray"
                            : "border-t border-gray"
                        } hover:bg-gray-100`}
                      >
                        <div className="flex items-center">
                          <div className="ml-3">
                            <p className="text-gray-900 whitespace-no-wrap  capitalize text-left">
                              {item.name}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td
                        className={`py-2 px-3  text-base border-x text-center font-semibold ${
                          index == 0
                            ? "border-t border-gray"
                            : index == items?.length
                            ? "border-y border-gray"
                            : "border-t border-gray"
                        } hover:bg-gray-100`}
                      >
                        <span className="ml-2 mr-3 rounded-full text-black">
                          {" "}
                          Balance
                        </span>
                      </td>

                      <td
                        className={`py-2 px-3 font-normal text-base border-x ${
                          index == 0
                            ? "border-t border-gray"
                            : index == items?.length
                            ? "border-y border-gray"
                            : "border-t border-gray"
                        } hover:bg-gray-100`}
                      >
                        <div className="flex justify-center">
                          <button className="whitespace-nowrap bg-slate-200 text-black rounded-md shadow-md py-1 px-14 ">
                            QRcode
                          </button>
                        </div>
                      </td>
                    </tr>
                    <tr className="h-4" />
                  </>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ******************************************************************************* */}
      {/*Section 3*/}
      <div className="w-3/4 bg-gray-50 rounded-xl p-6 shadow-lg border text-white overflow-y-auto">
        <h2 className="text-xl text-black font-semibold mb-4">
          Purchase Details
        </h2>

       
          {/* header */}
          <div className="flex flex-row justify-between items-center px-5 mt-5">
            <div className="flex items-center ">
              <div>
                <span className="px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded">
                  1
                </span>
              </div>
            </div>
          </div>
          {/* end header */}

          {/* Manunuzi Details */}
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 border-2 rounded-lg">
              <div className="flex flex-wrap -mx-2">
                <div className="w-full sm:w-1/3 p-2">
                  <label
                    htmlFor="supplierName"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Supplier
                  </label>
                  <select
                    name="supplierName"
                    className="bg-gray-100 rounded-[30px] px-1 sm:px-4 py-1 sm:py-2 max-w-[300px] border border-gray-400  p-2 w-full capitalize text-black"
                  >
                    <option value="" disabled>
                      Select Supplier
                    </option>
                  </select>
                </div>

                <div className="w-full sm:w-1/3 p-2 ">
                  <label
                    htmlFor="input2"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Invoice Number
                  </label>
                  <input
                    type="text"
                    name="invoiceNumber"
                    className="bg-gray-100 rounded-[30px] px-1 sm:px-4 py-1 sm:py-2 max-w-[300px] border border-gray-400  p-2 w-full capitalize text-black"
                  />
                </div>
                <div className="w-full sm:w-1/3 p-2">
                  <label
                    htmlFor="input3"
                    className="block text-sm font-medium text-gray-700"
                  >
                    LPO Number
                  </label>
                  <input
                    type="text"
                    name="lpoNumber"
                    className="bg-gray-100 rounded-[30px] px-1 sm:px-4 py-1 sm:py-2 max-w-[300px] border border-gray-400  p-2 w-full capitalize text-black"
                  />
                </div>

                <div className="w-full sm:w-1/3 p-2">
                  <label
                    htmlFor="input3"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Delivery Person
                  </label>
                  <input
                    type="text"
                    name="deliveryPerson"
                    className="bg-gray-100 rounded-[30px] px-1 sm:px-4 py-1 sm:py-2 max-w-[300px] border border-gray-400  p-2 w-full capitalize text-black"
                  />
                </div>

                <div className="w-full sm:w-1/3 p-2">
                  <label
                    htmlFor="input3"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Delivery Note Number
                  </label>
                  <input
                    type="text"
                    name="deliveryNumber"
                    className="bg-gray-100 rounded-[30px] px-1 sm:px-4 py-1 sm:py-2 max-w-[300px] border border-gray-400  p-2 w-full capitalize text-black"
                  />
                </div>

                <div className="w-full sm:w-1/3 p-2">
                  <label
                    htmlFor="input3"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Delivery Date
                  </label>
                  <DatePicker
                    showTimeSelect
                    timeIntervals={1}
                    dateFormat="Pp"
                    className="bg-gray-100 rounded-[30px] px-1 sm:px-4 py-1 sm:py-2 max-w-[300px] border border-gray-400  p-2 w-full capitalize "
                  />
                </div>

                <div className="w-full sm:w-1/3 p-2">
                  <label
                    htmlFor="input3"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Descriptions
                  </label>
                  <textarea
                    type="text"
                    name="description"
                    className="bg-gray-100 rounded-[30px] px-1 sm:px-4 py-1 sm:py-2 max-w-[300px] border border-gray-400  p-2 w-full capitalize text-black"
                  />
                </div>

              </div>
          </div>

          {/* Table ya items zilizojazwa details  */}
          <div style={{ maxHeight: "500px" }} className="mx-auto max-w-7xl rounded-md border-2 mt-10 max-h-96 px-4 py-6 sm:px-6 lg:px-8">
            <div   className="overflow-auto">
                <table className="min-w-full leading-normal border table-fixed">
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
                        New Balance
                      </th>

                      <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-200 text-center text-xs font-bold text-orange-500 uppercase tracking-wider">
                        Buying Price
                      </th>

                      <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-200 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Manufacture Date
                      </th>

                      <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-200 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Expiring Date
                      </th>

                      <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-200 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    <>
                      {Array.isArray(selectedItem) &&
                        selectedItem.map((item, index) => (
                          <tr key={index + 1} className="border-b">
                            <td className="py-2 px-3 font-normal text-base border-x  hover:bg-gray-100">
                              <div className="flex justify-center">
                                <div className="ml-3">
                                  <p className="text-gray-900 whitespace-no-wrap font-bold capitalize bg-green-200 rounded-full flex items-center justify-center h-8 w-8">
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
                                  <span className="relative">Name</span>
                                </span>
                              </div>
                            </td>

                            <td className="py-2 px-3 font-normal text-base border-x  hover:bg-gray-100  whitespace-nowrap overflow-hidden overflow-ellipsis max-w-[200px]">
                              <div className="items-center">
                                <div className="ml-3">
                                  <p className="text-gray-900 whitespace-no-wrap font-semibold capitalize">
                                    Quantity
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="py-2 px-3 font-normal text-base border-x hover:bg-gray-100">
                              <div>
                                <input
                                  type="number"
                                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-28 p-2 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white px-1 py-3"
                                  placeholder="..."
                                  required
                                />
                              </div>
                            </td>

                            <td className="py-2 px-3 font-normal text-base border-x  hover:bg-gray-100">
                              <div>
                                <input
                                  type="number"
                                  name="buyingPrice"
                                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block w-28 p-2 dark:bg-gray-100 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white px-1 py-3"
                                  placeholder="..."
                                  required
                                />
                              </div>
                            </td>

                            <td>
                              <div className="py-2 px-3 font-normal text-base border-x  hover:bg-gray-100">
                                <DatePicker
                                  showTimeSelect
                                  timeIntervals={1}
                                  dateFormat="Pp"
                                />
                              </div>
                            </td>

                            <td>
                              <div className="py-2 px-3 font-normal text-base border-x  hover:bg-gray-100">
                                <DatePicker
                                  showTimeSelect
                                  timeIntervals={1}
                                  dateFormat="Pp"
                                />
                              </div>
                            </td>

                            <td>
                              <div className="flex justify-center">
                                <button
                                  type="button"
                                  
                                >
                                  <span className="relative inline-block px-3 py-1 font-semibold text-green-900 leading-tight ">
                                    <span
                                      aria-hidden
                                      className="absolute inset-0 opacity-50 rounded-full"
                                    />
                                    <span className="relative">
                                      icon
                                    </span>
                                  </span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </>
                  </tbody>
                </table>
            </div>

            <div className="flex justify-between">
              <button
                type="button"
                
                className="mt-6 border px-6 py-2 rounded-md bg-secondary text-black"
              >
                Cancel
              </button>

              <button
               
                type="submit"
                className="mt-6 border rounded-md px-6 py-2 bg-green-300 font-bold text-black"
              >
                Submit
              </button>
            </div>
          </div>
      </div>
    </section>
  );
};

export default Manunuzi;
