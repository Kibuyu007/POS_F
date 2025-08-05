import axios from "axios";
import { useEffect } from "react";
import { useState } from "react";
import OutstandingPdf from "./OutstandingPdf";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import Loading from "../../../../Components/Shared/Loading";

import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

//API
import BASE_URL from "../../../../Utils/config"

const IncompletePoGrn = () => {
  const [items, setItems] = useState([]);
  const [modalData, setModalData] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [load, setLoad] = useState(false);
  const itemsPerPage = 5;

  const [filterItem, setFilterItem] = useState("");
  const [filterSupplier, setFilterSupplier] = useState("");
  const [filterDate, setFilterDate] = useState("");

  const fetchOutstandingItems = async () => {
    try {
      setLoad(true);
      const res = await axios.get(`${BASE_URL}/api/grn/outstand`,{
  withCredentials: true,
});
      if (res.data.success) {
        setItems(res.data.data);
        setLoad(false);
      }
    } catch (err) {
      console.error("Error fetching outstanding items:", err);
    }
  };

  useEffect(() => {
    fetchOutstandingItems();
  }, []);

  const handleViewClick = async (grnId) => {
    try {
      const res = await axios.get(
        `${URL}/api/grn/grnPo/${grnId}`
      );
      setModalData(res.data);
      setOpenModal(true);
    } catch (err) {
      console.error("Failed to fetch GRN items:", err);
    }
  };

  const submitFilledQuantities = async () => {
    const updates = items.filter(
      (item) => item.filledQuantity > 0 && item.outstandingQuantity > 0
    );

    for (const item of updates) {
      try {
        const res = await axios.put(
          `${BASE_URL}/api/grn/updateOutstanding`,
          {
            grnId: item.grnId,
            itemId: item.itemId,
            filledQuantity: item.filledQuantity,
          },{ withCredentials: true }
        );

        if (res.data.success) {
          console.log(`Updated ${item.name}`);
        }
      } catch (err) {
        console.error("Error updating item " + item.name, err);
      }
    }

    fetchOutstandingItems();
  };

  const filteredItems = items.filter((item) => {
    const matchesItem = item.name
      .toLowerCase()
      .includes(filterItem.toLowerCase());
    const matchesSupplier = item.supplier
      .toLowerCase()
      .includes(filterSupplier.toLowerCase());
    const matchesDate = filterDate
      ? dayjs(item.createdAt).format("MM-DD-YYYY") ===
        dayjs(filterDate).format("MM-DD-YYYY")
      : true;
    return matchesItem && matchesSupplier && matchesDate;
  });

  const totalItems = filteredItems.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <div className="p-4">
      <div className="px-4 py-4 md:py-7">
        <div className="flex items-center justify-between">
          <p className="text-lg md:text-xl lg:text-2xl font-bold text-gray-800">
            INCOMPLETE GRN AGAINST PO
          </p>
          <p className="text-sm md:text-base lg:text-lg text-gray-800 bg-green-200 px-4 py-2 rounded-full shadow-lg">
            Total Purchase Orders: {totalItems}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4">
        <input
          type="text"
          placeholder="Search Item..."
          value={filterItem}
          onChange={(e) => setFilterItem(e.target.value)}
          className="border-2 border-gray-300 text-black bg-gray-100 px-2 py-1 w-full rounded-full focus:outline-none focus:ring-1 focus:ring-green-500"
        />
        <input
          type="text"
          placeholder="Search Supplier..."
          value={filterSupplier}
          onChange={(e) => setFilterSupplier(e.target.value)}
          className="border-2 border-gray-300 text-black bg-gray-100 px-2 py-1 w-full rounded-full focus:outline-none focus:ring-1 focus:ring-green-500"
        />

        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <div>
            <DatePicker
              views={["year", "month", "day"]}
              format="MM-DD-YYYY"
              value={filterDate ? dayjs(filterDate) : null}
              onChange={(newValue) =>
                setFilterDate(newValue ? newValue.format("MM/DD/YYYY") : "")
              }
              slotProps={{
                textField: {
                  size: "small",
                  fullWidth: true,
                  className:
                    "bg-gray-50 border border-gray-400 text-gray-900 text-sm rounded-[30px] focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white",
                },
              }}
            />
          </div>
        </LocalizationProvider>
      </div>

      <h2 className="text-xl font-bold mb-4">Outstanding PO Items</h2>
      <Loading load={load} />

      <div className="overflow-x-auto rounded-lg mt-4">
        <table className="min-w-full text-sm text-gray-700 rounded-2xl">
          <thead className="bg-gray-100">
            <tr className="text-black">
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-200 text-center text-xs font-bold text-gray-900 uppercase tracking-wider">
                SN
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-200 text-center text-xs font-bold text-gray-900 uppercase tracking-wider">
                Item Name
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-200 text-center text-xs font-bold text-gray-900 uppercase tracking-wider">
                Buying Price
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-200 text-center text-xs font-bold text-gray-900 uppercase tracking-wider">
                Supplier
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-200 text-center text-xs font-bold text-gray-900 uppercase tracking-wider">
                Created By
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-200 text-center text-xs font-bold text-gray-900 uppercase tracking-wider">
                Created At
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-200 text-center text-xs font-bold text-gray-900 uppercase tracking-wider">
                Required Quantity
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-200 text-center text-xs font-bold text-gray-900 uppercase tracking-wider">
                Outstanding Quantity
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-200 text-center text-xs font-bold text-gray-900 uppercase tracking-wider">
                Received Quantity
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-200 text-center text-xs font-bold text-gray-900 uppercase tracking-wider">
                Update
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-200 text-center text-xs font-bold text-gray-900 uppercase tracking-wider">
                Preview
              </th>
            </tr>
          </thead>
          <tr className="h-4" />
          <tbody>
            {paginatedItems.map((item, idx) => (
              <>
                <tr key={idx} className="text-center text-black">
                  <td className="h-16 border-gray-00 shadow-md bg-gray-100 text-center">
                    <span className="bg-green-300 rounded-full px-3 py-2">
                      {(currentPage - 1) * itemsPerPage + idx + 1}
                    </span>
                  </td>

                  <td className="py-2 px-3 font-normal text-base border-x shadow-md bg-gray-200  hover:bg-gray-100  whitespace-nowrap overflow-hidden overflow-ellipsis max-w-[200px]">
                    <div className="items-center text-center">
                      <div className="ml-3">
                        <p className="text-gray-900 whitespace-no-wrap font-semibold capitalize">
                          {item.name}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-2 px-3 font-normal text-base border-x shadow-md bg-gray-100  hover:bg-gray-100  whitespace-nowrap overflow-hidden overflow-ellipsis max-w-[200px]">
                    <div className="items-center text-center">
                      <div className="ml-3">
                        <p className="text-gray-900 whitespace-no-wrap font-semibold capitalize">
                          Tsh {item.newBuyingPrice}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="py-2 px-3 font-normal text-base border-x shadow-md bg-green-200  hover:bg-gray-100  whitespace-nowrap overflow-hidden overflow-ellipsis max-w-[200px]">
                    <div className="items-center text-center">
                      <div className="ml-3">
                        <p className="text-gray-900 whitespace-no-wrap font-semibold capitalize">
                          {item.supplier}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="py-2 px-3 font-normal text-base border-x shadow-md bg-gray-100  hover:bg-gray-100  whitespace-nowrap overflow-hidden overflow-ellipsis max-w-[200px]">
                    <div className="items-center text-center">
                      <div className="ml-3">
                        <p className="text-gray-900 whitespace-no-wrap font-semibold capitalize">
                          {item.createdBy}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="py-2 px-3 font-normal text-base border-x shadow-md bg-gray-200  hover:bg-gray-100  whitespace-nowrap overflow-hidden overflow-ellipsis max-w-[200px]">
                    <div className="items-center text-center">
                      <div className="ml-3">
                        <p className="text-gray-900 whitespace-no-wrap font-semibold capitalize">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="py-2 px-3 font-normal text-base border-x shadow-md bg-gray-100  hover:bg-gray-100  whitespace-nowrap overflow-hidden overflow-ellipsis max-w-[200px]">
                    <div className="items-center text-center">
                      <div className="ml-3">
                        <p className="text-gray-900 whitespace-no-wrap font-semibold capitalize">
                          {item.requiredQuantity}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="py-2 px-3 font-normal text-base border-x shadow-md bg-yellow-100  hover:bg-gray-100  whitespace-nowrap overflow-hidden overflow-ellipsis max-w-[200px]">
                    <div className="items-center text-center">
                      <div className="ml-3">
                        <p className="text-gray-900 whitespace-no-wrap font-semibold capitalize">
                          {item.outstandingQuantity}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="py-2 px-3 border-x shadow-md bg-gray-100 font-semibold capitalize">
                    <div className="items-center text-center">
                      <div className="ml-3">
                        <input
                          type="number"
                          min={1}
                          max={item.outstandingQuantity}
                          disabled={item.outstandingQuantity === 0}
                          value={
                            item.filledQuantity === undefined
                              ? ""
                              : item.filledQuantity
                          }
                          onChange={(e) => {
                            const value = e.target.value;
                            items[idx].filledQuantity =
                              value === "" ? undefined : parseInt(value);
                            setItems([...items]);
                          }}
                          className="border px-2 py-1 w-40 rounded-full focus:outline-none focus:ring-1 focus:ring-green-500"
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-2 px-3 border-x shadow-md bg-gray-200 font-semibold capitalize">
                    <div className="items-center text-center">
                      <div className="ml-3">
                        <button
                          onClick={submitFilledQuantities}
                          disabled={
                            !item.filledQuantity || item.filledQuantity <= 0
                          }
                          className="bg-green-500 px-5 text-black text-xl py-1 rounded-full disabled:opacity-50 disabled:bg-gray-300"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  </td>
                  <td className="py-2 px-3 border-x shadow-md bg-gray-100 font-semibold capitalize">
                    <div className="items-center text-center">
                      <div className="ml-3">
                        <button
                          onClick={() => handleViewClick(item.grnId)}
                          className="bg-green-400 text-black px-4 py-2 rounded-full"
                        >
                          Preview
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
                <tr className="h-4" />
              </>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {openModal && modalData && (
        <OutstandingPdf
          open={openModal}
          onClose={() => setOpenModal(false)}
          grn={modalData}
        />
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between border-t border-gray-200 bg-white py-3">
        <p className="text-sm text-gray-700 px-2">
          Showing{" "}
          <span className="font-medium">
            {(currentPage - 1) * itemsPerPage + 1}
          </span>{" "}
          to{" "}
          <span className="font-medium">
            {Math.min(currentPage * itemsPerPage, totalItems)}
          </span>{" "}
          of <span className="font-medium">{totalItems}</span> items
        </p>

        <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm">
          <button
            onClick={prevPage}
            disabled={currentPage === 1}
            className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-gray-300 hover:bg-gray-50 ${
              currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <IoIosArrowBack className="size-5" />
          </button>

          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i + 1}
              onClick={() => setCurrentPage(i + 1)}
              className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ring-1 ring-gray-300 hover:bg-gray-50 ${
                currentPage === i + 1
                  ? "bg-green-500 text-white"
                  : "text-gray-900"
              }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            onClick={nextPage}
            disabled={currentPage === totalPages}
            className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-gray-300 hover:bg-gray-50 ${
              currentPage === totalPages ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <IoIosArrowForward className="size-5" />
          </button>
        </nav>
      </div>
    </div>
  );
};

export default IncompletePoGrn;
