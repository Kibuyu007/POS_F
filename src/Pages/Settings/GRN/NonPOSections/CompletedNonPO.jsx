import axios from "axios";
import { useState, useEffect } from "react";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import Loading from "../../../../Components/Shared/Loading";

const CompletedNonPO = () => {
  const [grns, setGrns] = useState([]);
  const [filteredGrns, setFilteredGrns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filterSupplier, setFilterSupplier] = useState("");
  const [filterFrom, setFilterFrom] = useState(null);
  const [filterTo, setFilterTo] = useState(null);
  const [load, setLoad] = useState(false);

  const itemsPerPage = 3;
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchCompletedNonPoGrns = async () => {
      setLoad(true);
      try {
        const res = await axios.get("http://localhost:4004/api/grn/nonPo");
        if (res.data.success) {
          setGrns(res.data.data);
          setLoad(false);
        } else {
          setError(res.data.message || "Unknown error");
        }
      } catch (err) {
        console.error("Error fetching completed GRNs:", err);
        setError("Failed to fetch completed GRNs");
      } finally {
        setLoading(false);
      }
    };

    fetchCompletedNonPoGrns();
  }, []);

  useEffect(() => {
    const filtered = grns.filter((grn) => {
      const supplierMatch = grn.supplierName?.supplierName
        ?.toLowerCase()
        .includes(filterSupplier.toLowerCase());

      const date = dayjs(grn.receivingDate);
      const fromMatch = filterFrom
        ? date.isAfter(dayjs(filterFrom).subtract(1, "day"))
        : true;
      const toMatch = filterTo
        ? date.isBefore(dayjs(filterTo).add(1, "day"))
        : true;

      return supplierMatch && fromMatch && toMatch;
    });

    setFilteredGrns(filtered);
    setCurrentPage(1); // reset to first page when filters change
  }, [grns, filterSupplier, filterFrom, filterTo]);

  const totalItems = filteredGrns.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedGrns = filteredGrns.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const prevPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);
  const nextPage = () =>
    currentPage < totalPages && setCurrentPage(currentPage + 1);

  return (
    <div className="p-4">
      <div className="px-4 py-4 md:py-7">
        <div className="flex items-center justify-between">
          <p className="text-lg md:text-xl lg:text-2xl font-bold text-gray-800">
            COMPLETE GRN NON PO
          </p>
          <p className="text-sm md:text-base lg:text-lg text-gray-800 bg-green-200 px-4 py-2 rounded-full shadow-lg">
            Total Non PO: {totalItems}
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-3 mb-4">
        <input
          type="text"
          placeholder="Search Supplier..."
          className="border-2 border-gray-300 text-black bg-gray-100 px-2 py-1 w-full rounded-full focus:outline-none focus:ring-1 focus:ring-green-500"
          value={filterSupplier}
          onChange={(e) => setFilterSupplier(e.target.value)}
        />

        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="From Date"
            value={filterFrom}
            onChange={(newVal) => setFilterFrom(newVal)}
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

        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="To Date"
            value={filterTo}
            onChange={(newVal) => setFilterTo(newVal)}
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
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && (
        <div className="space-y-6 text-black">
          {paginatedGrns.map((grn) => (
            <div
              key={grn._id}
              className="bg-white rounded-lg shadow-lg p-6 mb-6 border border-gray-200"
            >
              {/* Info row - horizontal, responsive */}
              <div className="flex flex-wrap justify-between gap-6 text-gray-700 text-sm font-medium bg-gray-200 p-4 rounded-lg shadow-md">
                {[
                  { label: "Supplier", value: grn.supplierName?.supplierName },
                  { label: "Invoice #", value: grn.invoiceNumber },
                  { label: "LPO #", value: grn.lpoNumber },
                  { label: "Delivery Person", value: grn.deliveryPerson },
                  { label: "Delivery Number", value: grn.deliveryNumber },
                  {
                    label: "Receiving Date",
                    value: new Date(grn.receivingDate).toLocaleDateString(),
                  },
                  {
                    label: "Description",
                    value: grn.description,
                    isDescription: true,
                  },
                ].map(({ label, value, isDescription }, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col min-w-[140px] max-w-xs ${
                      isDescription ? "flex-grow" : ""
                    }`}
                  >
                    <span className="text-gray-500 uppercase tracking-wide text-xs font-semibold mb-1">
                      {label}
                    </span>
                    <span
                      className={`mt-1 ${
                        isDescription
                          ? "text-gray-900 font-semibold truncate"
                          : "text-gray-800"
                      }`}
                      title={isDescription ? value : ""}
                    >
                      {value || "-"}
                    </span>
                  </div>
                ))}
              </div>

              {/* Items Table */}
              <h4 className="mt-6 mb-3 text-gray-900 font-semibold border-b pb-1">
                Items
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-gray-700 text-sm">
                  <thead>
                    <tr className="bg-gray-100 border-b border-gray-300">
                      <th className="py-2 px-3 uppercase font-semibold tracking-wider">
                        Item
                      </th>
                      <th className="py-2 px-3 uppercase font-semibold tracking-wider">
                        Qty
                      </th>
                      <th className="py-2 px-3 uppercase font-semibold tracking-wider">
                        Buy Price
                      </th>
                      <th className="py-2 px-3 uppercase font-semibold tracking-wider">
                        Sell Price
                      </th>
                      <th className="py-2 px-3 uppercase font-semibold tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {grn.items.map((item) => (
                      <tr
                        key={item._id}
                        className="border-b last:border-0 hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-2 px-3">{item.name?.name}</td>
                        <td className="py-2 px-3">{item.quantity}</td>
                        <td className="py-2 px-3">Tsh {item.buyingPrice}</td>
                        <td className="py-2 px-3">Tsh {item.sellingPrice}</td>
                        <td
                          className={`py-2 px-3 capitalize ${
                            item.status === "Billed"
                              ? "bg-yellow-300 text-yellow-900 font-semibold"
                              : item.status === "Completed"
                              ? "bg-green-300 text-green-900 font-semibold"
                              : ""
                          }`}
                        >
                          {item.status}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
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
                currentPage === totalPages
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
            >
              <IoIosArrowForward className="size-5" />
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

export default CompletedNonPO;
