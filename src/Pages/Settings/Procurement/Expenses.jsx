import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { useState } from "react";

const Expenses = () => {
  const [itemHold, setItemHold] = useState([]);

  return (
    <div>
      <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-800">
        Expenses
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

      <div className="mx-auto  px-4 py-6 sm:px-6 lg:px-8 border rounded-lg shadow-md">
        <div className="flex flex-wrap -mx-2">
          <div className="w-full sm:w-1/3 p-2 ">
            <label
              htmlFor="input2"
              className="block text-md font-bold text-black"
            >
              Title/Name
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
              className="block text-md font-bold text-black"
            >
              Amount
            </label>
            <input
              type="Number"
              name="deliveryPerson"
              className="bg-gray-100 rounded-[30px] px-1 sm:px-4 py-1 sm:py-2 max-w-[300px] border border-gray-400  p-2 w-full capitalize text-black"
            />
          </div>

          <div className="w-full sm:w-1/3 p-2">
            <label
              htmlFor="input3"
              className="block text-md font-bold text-black"
            >
              Details
            </label>
            <textarea
              type="text"
              name="description"
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
                slotProps={{
                  textField: {
                    size: "small",
                    fullWidth: true,
                    className:
                      "bg-gray-50 border border-gray-400 text-gray-900 text-sm rounded-[30px] focus:ring-blue-500 focus:border-blue-500 block dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white",
                  },
                }}
              />
            </div>
          </LocalizationProvider>

          <div>
            <button className="mt-6 px-6 py-2 bg-green-500 text-white rounded-full text-sm hover:bg-green-600">
              Add Expense
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="px-4 py-4 md:py-7">
          <div className="flex items-center justify-between">
            <p className="text-lg md:text-xl lg:text-2xl font-bold text-gray-800">
              Expenses Report
            </p>
          </div>
        </div>

        {/* Filters */}

        <div className="grid md:grid-cols-6 gap-2 mb-4 items-center">
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="From Date"
              slotProps={{
                textField: {
                  size: "small",
                  fullWidth: true,
                  className:
                    "bg-gray-50 border border-gray-400 text-sm rounded-full dark:bg-gray-700 dark:border-gray-600 dark:text-white",
                },
              }}
            />
          </LocalizationProvider>

          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="To Date"
              slotProps={{
                textField: {
                  size: "small",
                  fullWidth: true,
                  className:
                    "bg-gray-50 border border-gray-400 text-sm rounded-full dark:bg-gray-700 dark:border-gray-600 dark:text-white",
                },
              }}
            />
          </LocalizationProvider>

          {/* Empty div to take the 4th column space if needed */}
          <div></div>

          <div className="flex justify-end gap-4">
            <button className="px-4 py-2 bg-green-400 text-black rounded-full text-sm hover:bg-gray-300 w-40">
              Export Excel
            </button>

            <button className="px-4 py-2 bg-gray-400 text-black rounded-full text-sm hover:bg-green-100 w-40">
              Export PDF
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-auto shadow-md rounded-lg mt-4">
          <table className="min-w-full text-sm text-left text-gray-700">
            <thead className="bg-gray-200 text-gray-800 font-bold text-xs uppercase tracking-wide">
              <tr>
                <th className="p-3">SN</th>
                <th className="p-3">Name/Title</th>
                <th className="p-3">Expenses Amount</th>
                <th className="p-3">Details</th>
                <th className="p-3">Date</th>
                <th className="p-3">Added By</th>
              </tr>
            </thead>
            <tr className="h-4" />
            <tbody>
              {itemHold.map((txn) => (
                <>
                  <tr key={txn._id} className="border-t hover:bg-gray-50">
                    <td className="p-3">{txn.customerDetails.name}</td>
                    <td className="py-2 px-3 font-normal text-base border-x shadow-md bg-green-200  hover:bg-gray-100  whitespace-nowrap overflow-hidden overflow-ellipsis max-w-[200px]">
                      <div className="items-center text-center">
                        <div className="ml-3">{txn.customerDetails.phone}</div>
                      </div>
                    </td>

                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          txn.status === "Paid"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {txn.status}
                      </span>
                    </td>

                    <td className="py-2 px-3 font-normal text-base border-x shadow-md bg-gray-200  hover:bg-gray-100  whitespace-nowrap overflow-hidden overflow-ellipsis max-w-[200px]">
                      <div className="items-center text-center">
                        <div className="ml-3">
                          {new Date(txn.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </td>

                    <td className="py-1 px-2 font-normal text-sm border-x shadow-md bg-gray-100  hover:bg-gray-100  whitespace-nowrap overflow-hidden overflow-ellipsis max-w-[150px]">
                      <div className="items-center text-center">
                        <div className="ml-3">
                          {txn.createdBy
                            ? `${txn.createdBy.firstName} ${txn.createdBy.lastName} `
                            : ""}
                        </div>
                      </div>
                    </td>
                  </tr>
                  <tr className="h-4" />
                </>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gradient-to-r from-green-50 to-green-100 text-sm font-semibold text-green-800 border-t border-green-200">
                <td></td>
                <td></td>
                <td
                  colSpan="5"
                  className="text-right p-3 pr-6 uppercase tracking-wider"
                >
                  Total Paid:
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Expenses;
