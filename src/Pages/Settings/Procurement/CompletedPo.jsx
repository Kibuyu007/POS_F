import axios from "axios";
import { useEffect } from "react";
import { useState } from "react";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import PreviewPo from "./PreviewPo";

//MUI
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateRangePicker } from "@mui/x-date-pickers-pro/DateRangePicker";

//Redux
import { useDispatch, useSelector } from "react-redux";
import Loading from "../../../Components/Shared/Loading";
import { fetchSuppliers } from "../../../Redux/suppliers";

const CompletedPo = () => {
  const { supplier } = useSelector((state) => state.suppliers);
  const [sessions, setSessions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [selectedSession, setSelectedSession] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [filteredSessions, setFilteredSessions] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [load, setLoad] = useState(false);
  const [value, setValue] = useState([null, null]);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchSuppliers());
  }, [dispatch]);

  useEffect(() => {
    const applyFilters = () => {
      let filtered = [...sessions];

      // Filter by date range
      if (value[0] && value[1]) {
        const startDate = new Date(value[0]);
        const endDate = new Date(value[1]);

        filtered = filtered.filter((session) => {
          const createdAt = new Date(session.createdAt);
          return createdAt >= startDate && createdAt <= endDate;
        });
      }

      // Filter by supplier
      if (selectedSupplier) {
        filtered = filtered.filter(
          (session) => session.supplierName === selectedSupplier
        );
      }

      // Filter by status
      if (filterStatus !== "All") {
        filtered = filtered.filter(
          (session) =>
            session.status?.toLowerCase() === filterStatus.toLowerCase()
        );
      }

      setFilteredSessions(filtered);
      setCurrentPage(1);
    };

    applyFilters();
  }, [sessions, value, selectedSupplier, filterStatus]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoad(true);
        const res = await axios.get("http://localhost:4004/api/manunuzi/getPo");
        if (res.data.success) {
          // Summarize sessions
          const summarized = res.data.data.map((session) => ({
            grnSessionId: session.grnSessionId,
            grnNumber: session.grnNumber,
            createdAt: session.createdAt,
            comments: session.comments,
            supplierName: session.supplierName,
            createdBy: session.createdBy,
            status: session.status,
            allItems: session.allItems,
            totalProducts: session.allItems.reduce(
              (total, item) => total + item.requiredQuantity,
              0
            ),
          }));
          setSessions(summarized);
          setLoad(false);
        } else {
          console.error("Failed to fetch GRN data");
        }
      } catch (err) {
        console.error("API Error:", err);
      }
    };

    fetchData();
  }, []);

  const handlePreview = (session) => {
    const supplierDetails = supplier.find(
      (s) => s._id === session.supplierName
    );
    const sessionWithSupplierName = {
      ...session,
      supplierName: supplierDetails
        ? supplierDetails.supplierName
        : "Unknown Supplier",
      supplierContacts: supplierDetails ? supplierDetails.phone : "No Contacts",
      supplierAddress: supplierDetails ? supplierDetails.address : "No Address",
    };

    setSelectedSession(sessionWithSupplierName);
    setShowPreviewModal(true);
  };

  const totalItems = filteredSessions.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const paginatedSessions = filteredSessions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  // Check if suppliers are loading or if there's an error

  //*************************************************************************************************************************************** */

  return (
    <div className=" overflow-y-auto mt-4  rounded-lg">
      <div className="px-4 py-4 md:py-7">
        <div className="flex items-center justify-between">
          <p className="text-lg md:text-xl lg:text-2xl font-bold text-gray-800">
            COMPLETED PURCHASE ORDERS
          </p>
          <p className="text-sm md:text-base lg:text-lg text-gray-800 bg-green-200 px-4 py-2 rounded-full shadow-lg">
            Total Purchase Orders: {totalItems}
          </p>
        </div>
      </div>
      <div className="flex-[1] bg-secondary p-4  rounded-lg">
        <div>
          <div className=" flex justify-start gap-4">
            {/* Date Filter */}

            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DateRangePicker
                value={value}
                onChange={(newValue) => setValue(newValue)}
                localeText={{ start: "Start date", end: "End date" }}
                className="w-1/4"
                slotProps={{
                  textField: {
                    variant: "outlined",
                    size: "small",
                  },
                }}
              />
            </LocalizationProvider>

            {/* Status Filter */}
            <div className="flex items-center text-black">
              {["All", "Approved", "Pending"].map((status) => (
                <button
                  key={status}
                  className={`rounded-full py-2 px-8 mx-2 ${
                    filterStatus === status ? "bg-green-300" : "bg-gray-200"
                  } hover:bg-indigo-100`}
                  onClick={() => {
                    setFilterStatus(status);
                    setCurrentPage(1);
                  }}
                >
                  {status}
                </button>
              ))}
            </div>

            <select
              className="border border-gray-700 px-2 py-2 w-1/5 rounded-full text-black"
              value={selectedSupplier}
              onChange={(e) => setSelectedSupplier(e.target.value)}
            >
              <option value="">All Suppliers</option>
              {supplier.map((sup) => (
                <option key={sup._id} value={sup._id}>
                  <p className="text-black border">{sup.supplierName} </p>
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      <Loading load={load} />

      <div className="overflow-x-auto rounded-lg mt-4">
          <table className="min-w-full text-sm text-gray-700 rounded-2xl">
        <thead className="bg-gray-100 text-xs uppercase">
          <tr>
            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-200 text-center text-xs font-bold text-gray-900 uppercase tracking-wider">
              SN
            </th>
            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-200 text-center text-xs font-bold text-gray-900 uppercase tracking-wider">
              GRN Number
            </th>
            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-200 text-center text-xs font-bold text-gray-900 uppercase tracking-wider">
              Total Products
            </th>
            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-200 text-center text-xs font-bold text-gray-900 uppercase tracking-wider">
              Purchase Comments
            </th>
            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-200 text-center text-xs font-bold text-gray-900 uppercase tracking-wider">
              Supplier
            </th>
            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-200 text-center text-xs font-bold text-gray-900 uppercase tracking-wider">
              Created At
            </th>
            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-200 text-center text-xs font-bold text-gray-900 uppercase tracking-wider">
              Status
            </th>
            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-200 text-center text-xs font-bold text-gray-900 uppercase tracking-wider">
              View PO
            </th>
          </tr>
          <tr className="h-4" />
        </thead>
        <tbody>
          {paginatedSessions.map((session, idx) => (
            <>
              <tr key={idx} className="border-b">
                <td className="h-16 border-gray-200 shadow-md bg-gray-200 text-center">
                  {(currentPage - 1) * itemsPerPage + idx + 1}
                </td>

                <td className="py-2 px-3 font-normal text-base border-x shadow-md bg-gray-100  hover:bg-gray-100  whitespace-nowrap overflow-hidden overflow-ellipsis max-w-[200px]">
                  <div className="items-center text-center">
                    <div className="ml-3">
                      <p className="text-gray-900 whitespace-no-wrap font-semibold capitalize">
                        {session.grnNumber}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="py-2 px-3 font-normal text-base border-x shadow-md bg-gray-100  hover:bg-gray-100  whitespace-nowrap overflow-hidden overflow-ellipsis max-w-[200px]">
                  <div className="items-center text-center">
                    <div className="ml-3">
                      <p className="text-gray-900 whitespace-no-wrap font-semibold capitalize">
                        {session.totalProducts}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="py-2 px-3 font-normal text-base border-x shadow-md bg-gray-100  hover:bg-gray-100  whitespace-nowrap overflow-hidden overflow-ellipsis max-w-[200px]">
                  <div className="items-center text-center">
                    <div className="ml-3">
                      <p className="text-gray-900 whitespace-no-wrap font-semibold capitalize">
                        {session.comments}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="py-2 px-3 font-normal text-base border-x shadow-md bg-gray-100  hover:bg-gray-100  whitespace-nowrap overflow-hidden overflow-ellipsis max-w-[200px]">
                  <div className="items-center text-center">
                    <div className="ml-3">
                      <p className="text-gray-900 whitespace-no-wrap font-semibold capitalize">
                        {
                          supplier.find((u) => u._id === session.supplierName)
                            ?.supplierName
                        }
                      </p>
                    </div>
                  </div>
                </td>

                <td className="py-2 px-3 font-normal text-base border-x shadow-md bg-gray-200  hover:bg-gray-100  whitespace-nowrap overflow-hidden overflow-ellipsis max-w-[200px]">
                  <div className="items-center text-center">
                    <div className="ml-3">
                      <p className="text-gray-900 whitespace-no-wrap font-semibold capitalize">
                        {new Date(session.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="py-2 px-3 font-normal text-base border-x shadow-md bg-gray-100 hover:bg-gray-100 whitespace-nowrap overflow-hidden overflow-ellipsis max-w-[200px]">
                  <div className="items-center text-center">
                    <div className="ml-3">
                      {session.status === "Pending" ? (
                        <span className="bg-yellow-400 px-6 py-2 rounded-3xl shadow-md">
                          Pending
                        </span>
                      ) : (
                        <span className="bg-gray-300 px-6 py-2 rounded-3xl shadow-md">
                          Approved
                        </span>
                      )}
                    </div>
                  </div>
                </td>

                <td className="py-2 px-3 font-normal text-base border-x shadow-md bg-gray-100  hover:bg-gray-100  whitespace-nowrap overflow-hidden overflow-ellipsis max-w-[200px]">
                  <div className="items-center text-center">
                    <div className="ml-3">
                      <button
                        className="bg-green-400 px-6 py-2 rounded-3xl shadow-md"
                        onClick={() => handlePreview(session)}
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
    

      {showPreviewModal && selectedSession && (
        <PreviewPo
          session={selectedSession}
          onClose={() => setShowPreviewModal(false)}
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
          of <span className="font-medium">{totalItems}</span> sessions
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

export default CompletedPo;
