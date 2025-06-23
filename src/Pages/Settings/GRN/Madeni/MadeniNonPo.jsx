import axios from "axios";
import { useEffect, useState } from "react";
import { FaCheckCircle } from "react-icons/fa";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import DeniNonPoPdf from "./DeniNonPoPdf";
import Loading from "../../../../Components/Shared/Loading";

const MadeniNonPo = () => {
  const [deniNon, setDeniNon] = useState([]);
  const [modalData, setModalData] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  const [filterItem, setFilterItem] = useState("");
  const [filterSupplier, setFilterSupplier] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [load, setLoad] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const fetchUnpaidNonPo = async () => {
    try {
      setLoad(true);
      const res = await axios.get("http://localhost:4004/api/grn/unpaidNonPo");
      if (res.data.success) {
        setDeniNon(res.data.data);
        setLoad(false);
      }
    } catch (err) {
      console.error("Error fetching billed items:", err);
    }
  };

  useEffect(() => {
    fetchUnpaidNonPo();
  }, []);

  const handlePreview = (item) => {
    setModalData(item);
    setOpenModal(true);
  };

  const toggleStatus = async (grnId, itemId) => {
    try {
      const res = await axios.put(
        "http://localhost:4004/api/grn/updateNonPoBill",
        {
          grnId,
          itemId,
        }
      );
      if (res.data.success) fetchUnpaidNonPo();
    } catch (error) {
      console.error("Error updating item status:", error);
      alert("Failed to update status.");
    }
  };

  const filteredItems = deniNon.filter((item) => {
    const matchItem = item.name
      ?.toLowerCase()
      .includes(filterItem.toLowerCase());
    const matchSupplier = item.supplier
      ?.toLowerCase()
      .includes(filterSupplier.toLowerCase());
    const matchDate = filterDate
      ? dayjs(item.createdAt).format("YYYY-MM-DD") ===
        dayjs(filterDate).format("YYYY-MM-DD")
      : true;
    return matchItem && matchSupplier && matchDate;
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
            UNPAID GRN NON PO
          </p>
          <p className="text-sm md:text-base lg:text-lg text-gray-800 bg-green-200 px-4 py-2 rounded-full shadow-lg">
            Total Non PO: {totalItems}
          </p>
        </div>
      </div>

      {/* Filters */}
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
          <DatePicker
            format="YYYY-MM-DD"
            value={filterDate ? dayjs(filterDate) : null}
            onChange={(newValue) =>
              setFilterDate(newValue ? newValue.format("YYYY-MM-DD") : "")
            }
            slotProps={{
              textField: {
                size: "small",
                fullWidth: true,
                className:
                  "bg-gray-50 border border-gray-400 text-sm rounded-full dark:bg-gray-600 dark:border-gray-500 dark:text-white",
              },
            }}
          />
        </LocalizationProvider>
      </div>
      <Loading load={load} />
      {/* Table */}
      <div className="overflow-x-auto rounded-lg">
        <table className="min-w-full text-sm text-gray-700">
          <thead className="bg-gray-100 text-xs uppercase text-gray-900 font-bold">
            <tr>
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
                Update
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-200 text-center text-xs font-bold text-gray-900 uppercase tracking-wider">
                Preview
              </th>
            </tr>
          </thead>
          <tr className="h-4" />
          <tbody className="bg-white divide-y">
            {paginatedItems.map((item, idx) => (
              <>
                <tr key={idx} className="hover:bg-gray-50 text-center">
                  <td className="h-16 border-gray-00 shadow-md bg-gray-100 text-center">
                    <span className="bg-green-300 rounded-full px-3 py-2">
                      {(currentPage - 1) * itemsPerPage + idx + 1}
                    </span>
                  </td>

                  <td className="py-2 px-3 font-normal text-base border-x shadow-md bg-gray-200  hover:bg-gray-100  whitespace-nowrap overflow-hidden overflow-ellipsis max-w-[200px]">
                    <div className="items-center text-center">
                      <div className="ml-3">{item.name}</div>
                    </div>
                  </td>
                  <td className="py-2 px-3 font-normal text-base border-x shadow-md bg-gray-100  hover:bg-gray-100  whitespace-nowrap overflow-hidden overflow-ellipsis max-w-[200px]">
                    <div className="items-center text-center">
                      <div className="ml-3">Tsh {item.buyingPrice}</div>
                    </div>
                  </td>
                  <td className="py-2 px-3 font-normal text-base border-x shadow-md bg-gray-200  hover:bg-gray-100  whitespace-nowrap overflow-hidden overflow-ellipsis max-w-[200px]">
                    <div className="items-center text-center">
                      <div className="ml-3">{item.supplier}</div>
                    </div>
                  </td>
                  <td className="py-2 px-3 font-normal text-base border-x shadow-md bg-gray-100  hover:bg-gray-100  whitespace-nowrap overflow-hidden overflow-ellipsis max-w-[200px]">
                    <div className="items-center text-center">
                      <div className="ml-3">{item.createdBy}</div>
                    </div>
                  </td>
                  <td className="py-2 px-3 font-normal text-base border-x shadow-md bg-gray-200  hover:bg-gray-100  whitespace-nowrap overflow-hidden overflow-ellipsis max-w-[200px]">
                    <div className="items-center text-center">
                      <div className="ml-3">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </td>
                  <td className="py-2 px-3 font-normal text-base border-x shadow-md bg-gray-100  hover:bg-gray-100  whitespace-nowrap overflow-hidden overflow-ellipsis max-w-[200px]">
                    <div className="items-center text-center">
                      <div className="ml-3">
                        <button
                          className="text-green-600 hover:text-green-800"
                          onClick={() => toggleStatus(item.grnId, item.itemId)}
                        >
                          <FaCheckCircle size={30} />
                        </button>
                      </div>
                    </div>
                  </td>
                  <td className="py-2 px-3 font-normal text-base border-x shadow-md bg-gray-200  hover:bg-gray-100  whitespace-nowrap overflow-hidden overflow-ellipsis max-w-[200px]">
                    <div className="items-center text-center">
                      <div className="ml-3">
                        <button
                          onClick={() => handlePreview(item)}
                          className="bg-green-500 text-black px-4 py-2 rounded-full hover:bg-green-600"
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
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between border-t border-gray-200 bg-white py-3 mt-2">
        <p className="text-sm text-gray-700">
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

      {/* Modal */}
      {openModal && modalData && (
        <DeniNonPoPdf
          open={openModal}
          onClose={() => setOpenModal(false)}
          grn={modalData}
        />
      )}
    </div>
  );
};

export default MadeniNonPo;
