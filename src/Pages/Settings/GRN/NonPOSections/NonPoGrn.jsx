import { useEffect, useState } from "react";

import { fetchSuppliers } from "../../../../Redux/suppliers";
import { useDispatch, useSelector } from "react-redux";
import Section2 from "./Section2";
import toast from "react-hot-toast";

import { MdDeleteForever } from "react-icons/md";
import axios from "axios";
import { fetchProducts } from "../../../../Redux/items";

import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs from "dayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { BsToggleOff, BsToggleOn } from "react-icons/bs";

const NonPoGrn = () => {
  const { supplier } = useSelector((state) => state.suppliers);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const dispatch = useDispatch();

  const [regi, setRegi] = useState(() => {
    const stored = localStorage.getItem("nonPoGrnForm");
    return stored
      ? {
          ...JSON.parse(stored),
          receivingDate: new Date(JSON.parse(stored).receivingDate),
        }
      : {
          supplierName: "",
          receivingDate: new Date().toISOString().split("T")[0],
          invoiceNumber: "",
          lpoNumber: "",
          deliveryPerson: "",
          deliveryNumber: "",
          description: "",
        };
  });

  useEffect(() => {
    dispatch(fetchSuppliers());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const handleAddItem = (itemData) => {
    setItemHold((prev) => [...prev, itemData]);
  };

  //HANDLE CHANGE FOR INPUT
  const handleChange = (e) => {
    const { name, value } = e.target;
    setRegi((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  useEffect(() => {
    localStorage.setItem("nonPoGrnForm", JSON.stringify(regi));
  }, [regi]);

  //HANDLE RECEIVING DATE
  const handleReceivingDate = (date) => {
    setRegi((prev) => ({
      ...prev,
      receivingDate: date,
    }));
  };

  const [itemHold, setItemHold] = useState(() => {
    const storedItems = localStorage.getItem("itemHold");
    return storedItems ? JSON.parse(storedItems) : [];
  });

  useEffect(() => {
    localStorage.setItem("itemHold", JSON.stringify(itemHold));
  }, [itemHold]);

  //REMOVE SELECTED ITEM
  const removeItem = (itemToRemove) => {
    setItemHold((items) => items.filter((item) => item !== itemToRemove));
  };

  const toggleStatus = async (itemId) => {
    setItemHold((prevItems) =>
      prevItems.map((item) =>
        item._id === itemId
          ? {
              ...item,
              status: item.status === "Completed" ? "Billed" : "Completed",
            }
          : item
      )
    );
    toast.info("Item status updated!");
  };

  const handleSubmit = async () => {
    const selectedSupplier = supplier.find(
      (sup) => sup._id === regi.supplierName
    );
    if (!regi.supplierName || !regi.invoiceNumber || !regi.receivingDate) {
      setError("Please fill all required fields.");
      return;
    }

    if (itemHold.length === 0) {
      setError("Add at least one item.");
      return;
    }

    setLoading(true);
    setError("");

    const grnData = {
      supplierName: selectedSupplier ? selectedSupplier.supplierName : "",
      invoiceNumber: regi.invoiceNumber,
      lpoNumber: regi.lpoNumber,
      deliveryPerson: regi.deliveryPerson,
      deliveryNumber: regi.deliveryNumber,
      description: regi.description,
      receivingDate: regi.receivingDate,
      items: itemHold.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        buyingPrice: item.buyingPrice,
        sellingPrice: item.sellingPrice,
        batchNumber: item.batchNumber,
        manufactureDate: item.manufactureDate,
        expiryDate: item.expiryDate,
        foc: item.foc || false,
        rejected: item.rejected || false,
        comments: item.comments || "",
        totalCost: item.totalCost || 0,
        status: item.status || "Completed",
      })),
    };

    try {
      const response = await axios.post(
        "http://localhost:4004/api/grn/newGrn",
        grnData
      );

      if (response.status === 200 && response.data.success) {
        setRegi({
          supplierName: "",
          invoiceNumber: "",
          lpoNumber: "",
          deliveryPerson: "",
          deliveryNumber: "",
          description: "",
          receivingDate: "",
        });
        toast.success("Added Succeccfully", {
          position: "button-right",
          style: {
            borderRadius: "12px",
            background: "#00e676",
            color: "#212121",
            fontSize: "26px",
          },
        });
        setItemHold([]);
        localStorage.removeItem("nonPoGrnItems");
      } else {
        setError(response.data.message || "Tatizo katika kuhifadhi manunuzi.");
        toast.error(
          response.data.message || "Tatizo katika kuhifadhi manunuzi.",
          {
            position: "button-right",
            style: {
              borderRadius: "12px",
              background: "#dd2c00",
              color: "#212121",
              fontSize: "26px",
            },
          }
        );
      }
    } catch (err) {
      toast.error(error.data.message || "Tatizo katika kuhifadhi manunuzi.", {
        position: "button-right",
        style: {
          borderRadius: "12px",
          background: "#dd2c00",
          color: "#212121",
          fontSize: "26px",
        },
      });
    } finally {
      setLoading(false);
    }
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

  //formating Price
  const formatPriceWithCommas = (price) => {
    return new Intl.NumberFormat("en-US").format(price);
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
      <div className="mx-auto  px-4 py-6 sm:px-6 lg:px-8 border rounded-lg shadow-md">
        <div className="flex flex-wrap -mx-2">
          <div className="w-full sm:w-1/3 p-2">
            <label
              htmlFor="supplierName"
              className="block text-md font-bold text-black"
            >
              Supplier
            </label>
            <select
              name="supplierName"
              onChange={handleChange}
              value={regi.supplierName}
              className="bg-white rounded-[30px] px-1 sm:px-4 py-1 sm:py-2 max-w-[300px] border border-gray-500  p-2 w-full capitalize text-black"
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
              className="block text-md font-bold text-black"
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
              className="block text-md font-bold text-black"
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
              className="block text-md font-bold text-black"
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
              className="block text-md font-bold text-black"
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

          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <div>
              <label
                htmlFor="receivedDate"
                className="block mb-2 text-md font-bold text-black dark:text-white"
              >
                Received Date
              </label>
              <DatePicker
                views={["year", "month", "day"]}
                format="YYYY-MM-DD"
                value={regi.receivingDate ? dayjs(regi.receivingDate) : null}
                onChange={(newValue) =>
                  handleReceivingDate(newValue ? newValue.toDate() : null)
                }
                slotProps={{
                  textField: {
                    size: "small",
                    fullWidth: true,
                    error: !regi.receivingDate,
                    helperText: regi.receivingDate
                      ? ""
                      : "Please select a date",
                    className:
                      "bg-gray-50 border border-gray-400 text-gray-900 text-sm rounded-[30px] focus:ring-blue-500 focus:border-blue-500 block dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white",
                  },
                }}
              />
            </div>
          </LocalizationProvider>

          <div className="w-full sm:w-1/3 p-2">
            <label
              htmlFor="input3"
              className="block text-md font-bold text-black"
            >
              Descriptions
            </label>
            <textarea
              type="text"
              name="description"
              value={regi.description}
              onChange={handleChange}
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
        className="mx-auto rounded-md border-2 mt-10 max-h-96 px-4 py-6 sm:px-6 lg:px-8 shadow-lg"
      >
        <div className="overflow-auto">
          <table className="min-w-full leading-normal  table-fixed">
            <thead>
              <tr>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-200  text-xs font-bold text-gray-600 uppercase tracking-wider">
                  (S/N)
                </th>

                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-200  text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Product Name
                </th>

                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-200  text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Previous Balnce
                </th>

                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-200  text-xs font-bold text-gray-600 uppercase tracking-wider">
                  New Balance
                </th>

                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-200  text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Buying Price
                </th>

                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-200  text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Total Buying Price
                </th>

                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-200  text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Previous Price
                </th>

                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-200  text-xs font-bold text-gray-600 uppercase tracking-wider">
                  New Price
                </th>

                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-200  text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Receiving Date
                </th>

                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-200  text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Expiring Date
                </th>

                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-200  text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Bill
                </th>

                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-200  text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Remove
                </th>
              </tr>

              <tr className="h-4" />
            </thead>

            <tbody>
              <>
                {Array.isArray(itemHold) &&
                  itemHold.map((item, index) => (
                    <>
                      <tr
                        key={item._id}
                        className="h-16 border-gray-500 shadow-md bg-gray-100"
                      >
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
                              <span className="relative text-black">
                                {item.name}
                              </span>
                            </span>
                          </div>
                        </td>

                        <td className="py-2 px-3 font-normal text-base border-x  hover:bg-gray-100  whitespace-nowrap overflow-hidden overflow-ellipsis max-w-[200px]">
                          <div className="items-center text-center">
                            <div className="ml-3">
                              <p className="text-gray-900 whitespace-no-wrap font-semibold capitalize">
                                {formatPriceWithCommas(item.previousQuantity)}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="py-2 px-3 font-normal text-base border-x hover:bg-gray-100">
                          <div className="items-center text-center">
                            <div className="ml-3">
                              <p className="text-gray-900 whitespace-no-wrap font-semibold capitalize">
                                {formatPriceWithCommas(item.quantity)}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="py-2 px-3 font-normal text-base border-x  hover:bg-gray-100">
                          <div className="items-center text-center">
                            <div className="ml-3">
                              <p className="text-gray-900 whitespace-no-wrap font-semibold capitalize">
                                {formatPriceWithCommas(item.buyingPrice)}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="py-2 px-3 font-normal text-base border-x  hover:bg-gray-100">
                          <div className="items-center text-center">
                            <div className="ml-3">
                              <p className="text-gray-900 whitespace-no-wrap font-semibold capitalize">
                                {formatPriceWithCommas(item.totalCost)}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="py-2 px-3 font-normal text-base border-x  hover:bg-gray-100  whitespace-nowrap overflow-hidden overflow-ellipsis max-w-[200px]">
                          <div className="items-center text-center">
                            <div className="ml-3">
                              <p className="text-gray-900 whitespace-no-wrap font-semibold capitalize">
                                {formatPriceWithCommas(item.previousPrice)}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="py-2 px-3 font-normal text-base border-x  hover:bg-gray-100">
                          <div className="items-center text-center">
                            <div className="ml-3">
                              <p className="text-gray-900 whitespace-no-wrap font-semibold capitalize">
                                {formatPriceWithCommas(item.sellingPrice)}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td>
                          <div className="items-center text-center">
                            <div className="ml-3">
                              <p className="text-gray-900 whitespace-no-wrap font-semibold capitalize">
                                {item.manufactureDate}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td>
                          <div className="items-center text-center">
                            <div className="ml-3">
                              <p className="text-gray-900 whitespace-no-wrap font-semibold capitalize">
                                {item.expiryDate}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="pl-5 font-bold bg-gray-200">
                          <button
                            onClick={() => toggleStatus(item._id)}
                            className=" text-sm leading-none text-gray-600 py-3 px-5 bg-gray-200 rounded hover:bg-gray-100 focus:outline-none"
                          >
                            {item.status === "Billed" ? (
                              <BsToggleOn
                                size={35}
                                className="text-green-600"
                              />
                            ) : (
                              <BsToggleOff
                                size={35}
                                className="text-gray-500"
                              />
                            )}
                          </button>
                        </td>

                        <td>
                          <div className="flex justify-center">
                            <button
                              type="button"
                              onClick={() => removeItem(item)}
                            >
                              <span className="relative inline-block px-3 py-1 font-semibold text-gray-900 leading-tight ">
                                <span
                                  aria-hidden
                                  className="absolute inset-0 opacity-50 rounded-full"
                                />
                                <span className="relative text-3xl">
                                  <MdDeleteForever />
                                </span>
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
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center">
                <svg
                  className="animate-spin h-5 w-5 mr-3 text-white"
                  viewBox="0 0 24 24"
                ></svg>
                Submitting...
              </div>
            ) : (
              "Submit"
            )}
            {error && <p className="text-red-500">{error}</p>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NonPoGrn;
