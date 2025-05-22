import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import { fetchSuppliers } from "../../../Redux/suppliers";
import { useDispatch, useSelector } from "react-redux";
import Section2 from "./NonPOSections/Section2";

const NonPoGrn = () => {
  const { supplier } = useSelector((state) => state.suppliers);

  const dispatch = useDispatch();

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

  const handleAddItem = (itemData) => {
    setItemHold((prev) => [...prev, itemData]);
  };

  //HANDLE CHANGE FOR INPUT
  const handleChange = (e) => {
    const { name, value } = e.target;
    setRegi({ ...regi, [name]: value });
  };

  //HANDLE RECEIVING DATE
  const handleReceivingDate = (date) => {
    setRegi({ ...regi, receivingDate: date });
  };

  const [itemHold, setItemHold] = useState([]);

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
    <div className=" md:flex-row gap-3 px-4 overflow-hidden">
      <h2 className="text-xl text-black font-semibold mb-4">
        Non Purchase GRN
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

      {/* Section One Suppliers Details *********************************************************** */}
      {/* Manunuzi Details */}
      <div className="mx-auto  px-4 py-6 sm:px-6 lg:px-8 border-2 rounded-lg  shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)]">
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
      {/* end Manunuzi Details */}

      {/* Section Two Items Details *********************************************************** */}
      <Section2 onAddItem={handleAddItem} />
      {/* ************************************************************************************* */}

      {/* ************************************************************************************* */}
      {/* Section 3 */}
      {/* Table ya items zilizojazwa details  */}
      <div
        style={{ maxHeight: "500px" }}
        className="mx-auto rounded-md border-2 mt-10 max-h-96 px-4 py-6 sm:px-6 lg:px-8 shadow-md "
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

                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-200 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Buying Price
                </th>

                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-200 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Receiving Date
                </th>

                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-200 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Expiring Date
                </th>

                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-200 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Edit
                </th>

                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-200 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Remove
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
                        <div className="items-center">
                          <div className="ml-3">
                            <p className="text-gray-900 whitespace-no-wrap font-semibold capitalize">
                              {item.quantity}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-2 px-3 font-normal text-base border-x  hover:bg-gray-100">
                        <div className="items-center">
                          <div className="ml-3">
                            <p className="text-gray-900 whitespace-no-wrap font-semibold capitalize">
                              {item.buyingPrice}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="items-center">
                          <div className="ml-3">
                            <p className="text-gray-900 whitespace-no-wrap font-semibold capitalize">
                              {item.receivedDate}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="items-center">
                          <div className="ml-3">
                            <p className="text-gray-900 whitespace-no-wrap font-semibold capitalize">
                              {item.expiryDate}
                            </p>
                          </div>
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
  );
};

export default NonPoGrn;
