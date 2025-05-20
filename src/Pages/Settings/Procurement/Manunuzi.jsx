import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import { useDispatch, useSelector } from "react-redux";
import { fetchSuppliers } from "../../../Redux/suppliers";
import axios from "axios";
import ManunuziHold from "./ManunuziHold";

const Manunuzi = () => {
  // Redux State
  const { supplier } = useSelector((state) => state.suppliers);

  const dispatch = useDispatch();

  const [showModalAdd, setShowModalAdd] = useState(false);

  const [regi, setRegi] = useState({
    supplierName: "",
    balance: 0,
    buyingPrice: 0,
    receivingDate: new Date(),
    newManufactureDate: new Date(),
    newExpireDate: new Date(),
    invoiceNumber: "",
    lpoNumber: "",
    deliveryPerson: "",
    deliveryNumber: "",
    description: "",
  });

  useEffect(() => {
    dispatch(fetchSuppliers());
  }, [dispatch]);

  //HANDLE CHANGE FOR INPUT
  const handleChange = (e) => {
    const { name, value } = e.target;
    setRegi({ ...regi, [name]: value });
  };

  //HANDLE MANUFACTURE DATE
  const handleManufacturedDate = (date) => {
    setRegi({ ...regi, newManufactureDate: date });
  };

  //HANDLE EXPIRE DATE
  const handleExpireDate = (date) => {
    setRegi({ ...regi, newExpireDate: date });
  };

  //HANDLE RECEIVING DATE
  const handleReceivingDate = (date) => {
    setRegi({ ...regi, receivingDate: date });
  };

  const [itemHold, setItemHold] = useState([]);

  const getHoldItem = async () => {
    try {
      const response = await axios.get(
        "http://localhost:4004/api/manunuzi/getHold"
      );
      setItemHold(response.data.allHold);
    } catch (error) {
      console.error("Error fetching items:", error);
    }
  };

  useEffect(() => {
    getHoldItem();
  }, [dispatch]);

  //REMOVE SELECTED ITEM
  const removeItem = (itemToRemove) => {
    setItemHold((items) => items.filter((item) => item !== itemToRemove));
  };

  //HANDLE CANCEL FORM
  const handleCancel = () => {
    setItemHold([]);
    setRegi({
      balance: "",
      buyingPrice: "",
      newManufactureDate: new Date(),
      newExpireDate: new Date(),
      invoiceNumber: "",
      lpoNumber: "",
      deliveryPerson: "",
      deliveryNumber: "",
      description: "",
    });
  };

  return (
    <div className="h-[80vh]  md:flex-row gap-3 px-4 overflow-hidden">
      <div className="bg-gray-50 rounded-xl p-6 shadow-lg border text-white overflow-y-auto">
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
                {supplier.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.supplierName}
                  </option>
                ))}
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
                onChange={handleChange}
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
                onChange={handleChange}
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
                onChange={handleChange}
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
                onChange={handleChange}
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
                onChange={handleReceivingDate}
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

        <div>
          <button
            onClick={() => setShowModalAdd(true)}
            className="mt-6 border rounded-md px-6 py-2 bg-green-300 font-bold text-black"
          >
            Add Bidhaa
          </button>
        </div>

        {/* Table ya items zilizojazwa details  */}
        <div
          style={{ maxHeight: "500px" }}
          className="mx-auto max-w-7xl rounded-md border-2 mt-10 max-h-96 px-4 py-6 sm:px-6 lg:px-8"
        >
          <div className="overflow-auto">
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
                  {Array.isArray(itemHold) &&
                    itemHold.map((item, index) => (
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
                              <span className="relative">
                                {item.buyingPrice}
                              </span>
                            </span>
                          </div>
                        </td>

                        <td className="py-2 px-3 font-normal text-base border-x  hover:bg-gray-100  whitespace-nowrap overflow-hidden overflow-ellipsis max-w-[200px]">
                          <div className="items-center">
                            <div className="ml-3">
                              <p className="text-gray-900 whitespace-no-wrap font-semibold capitalize">
                                {item.itemId.name}
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
                              selected={regi.newManufactureDate}
                              onChange={handleManufacturedDate}
                              dateFormat="Pp"
                            />
                          </div>
                        </td>

                        <td>
                          <div className="py-2 px-3 font-normal text-base border-x  hover:bg-gray-100">
                            <DatePicker
                              showTimeSelect
                              timeIntervals={1}
                              selected={regi.newExpireDate}
                              onChange={handleExpireDate}
                              dateFormat="Pp"
                            />
                          </div>
                        </td>

                        <td>
                          <div className="flex justify-center">
                            <button
                              type="button"
                              onClick={() => removeItem(item)}
                            >
                              <span className="relative inline-block px-3 py-1 font-semibold text-green-900 leading-tight ">
                                <span
                                  aria-hidden
                                  className="absolute inset-0 opacity-50 rounded-full"
                                />
                                <span className="relative">icon</span>
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
              onClick={handleCancel}
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

      <ManunuziHold showModal={showModalAdd} setShowModal={setShowModalAdd} />
    </div>
  );
};

export default Manunuzi;
