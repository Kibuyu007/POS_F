import axios from "axios";
import { useState, useEffect } from "react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

const BillNonPo = () => {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [filterSupplier, setFilterSupplier] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await axios.get("http://localhost:4004/api/reports/status-changes");
        if (res.data.success) {
          setReports(res.data.data);
        }
      } catch (err) {
        console.error("Error fetching reports:", err);
      }
    };
    fetchReports();
  }, []);

  useEffect(() => {
    const filtered = reports.filter((report) => {
      const supplierMatch = report.grnId?.supplier
        ?.toLowerCase()
        .includes(filterSupplier.toLowerCase());
      const dateMatch = filterDate
        ? dayjs(report.changedAt).format("YYYY-MM-DD") ===
          dayjs(filterDate).format("YYYY-MM-DD")
        : true;
      const statusMatch =
        filterStatus === "All" || report.newStatus === filterStatus;

      return supplierMatch && dateMatch && statusMatch;
    });

    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginated = filtered.slice(startIndex, startIndex + itemsPerPage);
    setFilteredReports(paginated);
  }, [reports, filterSupplier, filterDate, filterStatus, currentPage]);

  const totalPages = Math.ceil(
    reports.filter((report) => {
      const supplierMatch = report.grnId?.supplier
        ?.toLowerCase()
        .includes(filterSupplier.toLowerCase());
      const dateMatch = filterDate
        ? dayjs(report.changedAt).format("YYYY-MM-DD") ===
          dayjs(filterDate).format("YYYY-MM-DD")
        : true;
      const statusMatch =
        filterStatus === "All" || report.newStatus === filterStatus;
      return supplierMatch && dateMatch && statusMatch;
    }).length / itemsPerPage
  );

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Status Change Reports</h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        <input
          type="text"
          placeholder="Filter by Supplier"
          value={filterSupplier}
          onChange={(e) => setFilterSupplier(e.target.value)}
          className="border px-3 py-2 rounded-md w-full"
        />

        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="Filter by Date"
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
                  "bg-white border border-gray-400 text-gray-900 text-sm rounded-md",
              },
            }}
          />
        </LocalizationProvider>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border px-3 py-2 rounded-md w-full"
        >
          <option value="All">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Paid">Paid</option>
        </select>
      </div>

      <table className="w-full border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 border">Item Name</th>
            <th className="p-2 border">Old Status</th>
            <th className="p-2 border">New Status</th>
            <th className="p-2 border">Changed At</th>
            <th className="p-2 border">GRN Invoice</th>
            <th className="p-2 border">Supplier</th>
            <th className="p-2 border">Changed By</th>
          </tr>
        </thead>
        <tbody>
          {filteredReports.map((report) => (
            <tr key={report._id} className="text-center">
              <td className="p-2 border">{report.itemName}</td>
              <td className="p-2 border">{report.oldStatus}</td>
              <td className="p-2 border">{report.newStatus}</td>
              <td className="p-2 border">
                {new Date(report.changedAt).toLocaleString()}
              </td>
              <td className="p-2 border">{report.grnId?.invoiceNumber || "N/A"}</td>
              <td className="p-2 border">{report.grnId?.supplier || "N/A"}</td>
              <td className="p-2 border">{report.changedBy?.username || "System"}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <p className="text-sm text-gray-600">
          Page {currentPage} of {totalPages}
        </p>
        <div className="flex space-x-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Prev
          </button>
          <button
            onClick={() =>
              setCurrentPage((prev) =>
                prev < totalPages ? prev + 1 : prev
              )
            }
            disabled={currentPage === totalPages}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default BillNonPo;
