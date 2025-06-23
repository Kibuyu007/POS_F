import axios from "axios";
import { useEffect, useState } from "react";
import DeniPoPdf from "./DeniPoPdf";
import { FaCheckCircle } from "react-icons/fa";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";

import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import Loading from "../../../../Components/Shared/Loading";

const MadeniPo = () => {
  const [deni, setDeni] = useState([]);
  const [modalData, setModalData] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [load, setLoad] = useState(false);

  const [filterItem, setFilterItem] = useState("");
  const [filterSupplier, setFilterSupplier] = useState("");
  const [filterDate, setFilterDate] = useState("");

  const fetchUnpaidPo = async () => {
    try {
      setLoad(true);
      const res = await axios.get("http://localhost:4004/api/grn/unpaidPo");
      if (res.data.success) {
        setDeni(res.data.data);
        setLoad(false);
      }
    } catch (err) {
      console.error("Error fetching billed items:", err);
    }
  };

  useEffect(() => {
    fetchUnpaidPo();
  }, []);

  const handlePreview = async (grnId) => {
    try {
      const res = await axios.get(
        `http://localhost:4004/api/grn/billDetails/${grnId}`
      );
      if (res.data.success) {
        setModalData(res.data.data);
        setOpenModal(true);
      }
    } catch (error) {
      console.error("Preview fetch failed", error);
    }
  };

  const toggleStatus = async (grnId, itemId) => {
    try {
      const res = await axios.put("http://localhost:4004/api/grn/updateBill", {
        grnId,
        itemId,
      });

      if (res.data.success) {
        fetchUnpaidPo();
      }
    } catch (error) {
      console.error("Error updating item status:", error);
      alert("Failed to update status.");
    }
  };

  // Pagination logic

  const filteredItems = deni.filter((item) => {
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

      <table className="w-full">
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
                <td className="py-2 px-3 font-normal text-base border-x shadow-md bg-gray-200  hover:bg-gray-100  whitespace-nowrap overflow-hidden overflow-ellipsis max-w-[200px]">
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
                <td className="py-2 px-3 font-normal text-base border-x shadow-md bg-gray-200  hover:bg-gray-100  whitespace-nowrap overflow-hidden overflow-ellipsis max-w-[200px]">
                  <div>
                    <div>
                      <button
                        className="text-green-600"
                        onClick={() => toggleStatus(item.grnId, item.itemId)}
                      >
                        <FaCheckCircle size={30} />
                      </button>
                    </div>
                  </div>
                </td>

                <td className="py-2 px-3 font-normal text-base border-x shadow-md bg-gray-100  hover:bg-gray-100  whitespace-nowrap overflow-hidden overflow-ellipsis max-w-[200px]">
                  <div>
                    <div>
                      <button
                        onClick={() => handlePreview(item.grnId)}
                        className="bg-green-400 text-black px-4 py-2 rounded-full"
                      >
                        Preview GRN
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

      {/* Modal */}
      {openModal && modalData && (
        <DeniPoPdf
          open={openModal}
          onClose={() => setOpenModal(false)}
          grn={modalData}
        />
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between border-t border-gray-200 bg-white py-3 mt-2">
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

export default MadeniPo;
