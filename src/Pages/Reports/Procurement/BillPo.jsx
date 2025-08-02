import axios from "axios";
import { useState, useEffect } from "react";

import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import Loading from "../../../Components/Shared/Loading";


//API
const URL = import.meta.env.VITE_API_URL;


const BillPo = () => {
  const [reportData, setReportData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [load, setLoad] = useState(true);

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [createdBy, setcreatedBy] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    try {
      setLoad(true);
      const res = await axios.get(`${URL}/api/grn/billPo`);
      if (res.data.success) {
        setReportData(res.data.data);
        setFilteredData(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching report:", err);
    } finally {
      setLoad(false);
    }
  };

  useEffect(() => {
    applyFilters();
  }, [startDate, endDate, selectedSupplier, createdBy, reportData]);

  const applyFilters = () => {
    let filtered = [...reportData];

    if (startDate) {
      filtered = filtered.filter(
        (item) => new Date(item.createdAt) >= new Date(startDate)
      );
    }
    if (endDate) {
      filtered = filtered.filter(
        (item) => new Date(item.createdAt) <= new Date(endDate)
      );
    }
    if (selectedSupplier) {
      filtered = filtered.filter((item) => item.supplier === selectedSupplier);
    }

    if (createdBy) {
      filtered = filtered.filter((item) => item.changedBy === createdBy);
    }

    setFilteredData(filtered);
    setCurrentPage(1);
  };

  const suppliers = [...new Set(reportData.map((item) => item.supplier))];
  const alieChange = [...new Set(reportData.map((item) => item.changedBy))];

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const totalItems = filteredData.length;
  const currentData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };
  const prevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        PO Billed Report
      </h2>

      {/* Filters */}
      <div className="grid md:grid-cols-4 gap-4 mb-4">
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="From Date"
            value={startDate}
            onChange={(val) => setStartDate(val)}
            slotProps={{
              textField: {
                size: "small",
                fullWidth: true,
                className:
                  "bg-white border border-gray-400 text-sm rounded-full",
              },
            }}
          />
        </LocalizationProvider>

        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="To Date"
            value={endDate}
            onChange={(val) => setEndDate(val)}
            slotProps={{
              textField: {
                size: "small",
                fullWidth: true,
                className:
                  "bg-white border border-gray-400 text-sm rounded-full",
              },
            }}
          />
        </LocalizationProvider>

        <select
          value={selectedSupplier}
          onChange={(e) => setSelectedSupplier(e.target.value)}
          className="border border-gray-400 rounded-full text-sm px-4 py-2 w-full bg-white text-black"
        >
          <option value="">All Suppliers</option>
          {suppliers.map((sup, idx) => (
            <option key={idx} value={sup}>
              {sup}
            </option>
          ))}
        </select>

        <select
          value={createdBy}
          onChange={(e) => setcreatedBy(e.target.value)}
          className="border border-gray-400 rounded-full text-sm px-4 py-2 w-full bg-white text-black"
        >
          <option value="">User</option>
          {alieChange.map((u, idx) => (
            <option key={idx} value={u}>
              {u}
            </option>
          ))}
        </select>
      </div>

      <Loading load={load} />

      {/* Table */}
      <div className="overflow-x-auto  rounded-2xl mt-4">
        <table className="min-w-full text-sm text-left text-gray-700">
          <thead className="bg-gray-200 text-gray-800">
            <tr>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-200 text-center text-xs font-bold text-gray-900 uppercase tracking-wider">
                SN
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-200 text-center text-xs font-bold text-gray-900 uppercase tracking-wider">
                Date
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-200 text-center text-xs font-bold text-gray-900 uppercase tracking-wider">
                Supplier
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-200 text-center text-xs font-bold text-gray-900 uppercase tracking-wider">
                Item
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-200 text-center text-xs font-bold text-gray-900 uppercase tracking-wider">
                Old Status
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-200 text-center text-xs font-bold text-gray-900 uppercase tracking-wider">
                New Status
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-200 text-center text-xs font-bold text-gray-900 uppercase tracking-wider">
                Changed By
              </th>
            </tr>
          </thead>
          <tr className="h-4" />
          <tbody>
            {currentData.map((log, idx) => (
              <>
                <tr key={idx} className="hover:bg-gray-50 border-t">
                  <td className="h-16 border-gray-00 shadow-md bg-gray-100 text-center">
                    <span className="bg-green-300 rounded-full px-3 py-2">
                      {(currentPage - 1) * itemsPerPage + idx + 1}
                    </span>
                  </td>
                  <td className="py-2 px-3 font-normal text-base border-x shadow-md bg-gray-200  hover:bg-gray-100  whitespace-nowrap overflow-hidden overflow-ellipsis max-w-[200px]">
                    <div className="items-center text-center">
                      <div className="ml-3">
                        {new Date(log.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </td>
                  <td className="py-2 px-3 font-normal text-base border-x shadow-md bg-gray-100  hover:bg-gray-100  whitespace-nowrap overflow-hidden overflow-ellipsis max-w-[200px]">
                    <div className="items-center text-center">
                      <div className="ml-3">{log.supplier || "-"}</div>
                    </div>
                  </td>
                  <td className="py-2 px-3 font-normal text-base border-x shadow-md bg-gray-200  hover:bg-gray-100  whitespace-nowrap overflow-hidden overflow-ellipsis max-w-[200px]">
                    <div className="items-center text-center">
                      <div className="ml-3">{log.itemName || "-"}</div>
                    </div>
                  </td>
                  <td className="py-2 px-3 font-normal text-base border-x shadow-md bg-yellow-100  hover:bg-gray-100  whitespace-nowrap overflow-hidden overflow-ellipsis max-w-[200px]">
                    <div className="items-center text-center">
                      <div className="ml-3">{log.oldStatus}</div>
                    </div>
                  </td>
                  <td className="py-2 px-3 font-normal text-base border-x shadow-md bg-green-200  hover:bg-gray-100  whitespace-nowrap overflow-hidden overflow-ellipsis max-w-[200px]">
                    <div className="items-center text-center">
                      <div className="ml-3">{log.newStatus}</div>
                    </div>
                  </td>
                  <td className="py-2 px-3 font-normal text-base border-x shadow-md bg-gray-100  hover:bg-gray-100  whitespace-nowrap overflow-hidden overflow-ellipsis max-w-[200px]">
                    <div className="items-center text-center">
                      <div className="ml-3">
                        {log.lastModifiedBy?.username || "-"}
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
      <div className="flex items-center justify-between border-t border-gray-200 py-3 mt-4">
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

        <nav className="inline-flex -space-x-px rounded-md shadow-sm">
          <button
            onClick={prevPage}
            disabled={currentPage === 1}
            className={`px-3 py-1 text-gray-400 ring-1 ring-gray-300 ${
              currentPage === 1
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-gray-100"
            }`}
          >
            <IoIosArrowBack className="size-5" />
          </button>

          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-4 py-1 text-sm font-medium ring-1 ring-gray-300 ${
                currentPage === i + 1
                  ? "bg-green-500 text-white"
                  : "hover:bg-gray-100"
              }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            onClick={nextPage}
            disabled={currentPage === totalPages}
            className={`px-3 py-1 text-gray-400 ring-1 ring-gray-300 ${
              currentPage === totalPages
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-gray-100"
            }`}
          >
            <IoIosArrowForward className="size-5" />
          </button>
        </nav>
      </div>
    </div>
  );
};

export default BillPo;
