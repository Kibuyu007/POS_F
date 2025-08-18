import axios from "axios";
import { useState, useEffect } from "react";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";

import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers";
import dayjs from "dayjs";

import Loading from "../../../../Components/Shared/Loading";

//API
import BASE_URL from "../../../../Utils/config";
import toast from "react-hot-toast";

const CompletedNonPO = () => {
  const [grns, setGrns] = useState([]);
  const [filteredGrns, setFilteredGrns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filterSupplier, setFilterSupplier] = useState("");
  const [filterFrom, setFilterFrom] = useState(null);
  const [filterTo, setFilterTo] = useState(null);
  const [filterStatus, setFilterStatus] = useState("");
  const [load, setLoad] = useState(false);

  const itemsPerPage = 3;
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchCompletedNonPoGrns = async () => {
      setLoad(true);
      try {
        const res = await axios.get(`${BASE_URL}/api/grn/nonPo`);
        if (res.data.success) {
          setGrns(res.data.data);
          setLoad(false);
        } else {
          setError(res.data.message || "Unknown error");
        }
      } catch (err) {
        toast.error(error.data.message || "Tatizo katika kuhifadhi manunuzi.", {
          position: "bottom-right",
          style: {
            borderRadius: "12px",
            background: "#dd2c00",
            color: "#212121",
            fontSize: "26px",
          },
        });
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

      const date = dayjs(grn.createdAt);
      const fromMatch = filterFrom
        ? date.isAfter(dayjs(filterFrom).subtract(1, "day"))
        : true;
      const toMatch = filterTo
        ? date.isBefore(dayjs(filterTo).add(1, "day"))
        : true;

      let statusMatch = true;
      if (filterStatus) {
        statusMatch = grn.items.some(
          (item) => item.status.toLowerCase() === filterStatus.toLowerCase()
        );
      }

      return supplierMatch && fromMatch && toMatch && statusMatch;
    });

    setFilteredGrns(filtered);
    setCurrentPage(1);
  }, [grns, filterSupplier, filterFrom, filterTo, filterStatus]);

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

      <div className="grid md:grid-cols-4 gap-3 mb-4">
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

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm    focus:border-green-500 focus:ring focus:ring-gray-100 focus:ring-opacity-50 transition  duration-200 ease-in-out cursor-pointer "
        >
          <option value="">All Status</option>
          <option value="Billed">Billed</option>
          <option value="Completed">Completed</option>
        </select>
      </div>
      <Loading load={load} />
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && (
        <div className="space-y-8 text-gray-900 dark:text-gray-100">
          {paginatedGrns.map((grn) => (
            <div
              key={grn._id}
              className="bg-white dark:bg-neutral-900 rounded-xl shadow-lg p-6 mb-8 border border-gray-300 dark:border-gray-700"
            >
              {/* Info row - horizontal, responsive */}
              <div className="flex flex-wrap justify-between gap-6 text-gray-700 dark:text-gray-400 text-sm font-semibold bg-gray-100 dark:bg-neutral-800 p-5 rounded-lg shadow-inner">
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
                    <span className="text-green-600 uppercase tracking-wide text-xs mb-1">
                      {label}
                    </span>
                    <span
                      className={`mt-1 ${
                        isDescription
                          ? "text-gray-900 dark:text-gray-100 font-semibold truncate"
                          : "text-gray-800 dark:text-gray-200"
                      }`}
                      title={isDescription ? value : ""}
                    >
                      {value || "-"}
                    </span>
                  </div>
                ))}
              </div>

              {/* Items Table */}
              <h4 className="mt-8 mb-4 text-gray-900 dark:text-gray-100 font-semibold border-b border-gray-300 dark:border-gray-700 pb-2 tracking-wide text-lg">
                Items
              </h4>
              <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                <table className="w-full text-center text-gray-700 dark:text-gray-300 text-sm">
                  <thead className="bg-gray-50 dark:bg-neutral-800">
                    <tr>
                      {[
                        "Item",
                        "Billed Qty",
                        "Paid Qty",
                        "Total Purchased Qty",
                        "Buy Price",
                        "Total Cost",
                        "Sell Price",
                        "Estimated Profit",
                        "Status",
                      ].map((header) => (
                        <th
                          key={header}
                          className="py-3 px-4 uppercase font-semibold tracking-wide text-gray-600 dark:text-gray-400"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {grn.items
                      .filter((item) => {
                        if (!filterStatus) return true;
                        return (
                          item.status.toLowerCase() ===
                          filterStatus.toLowerCase()
                        );
                      })
                      .map((item) => {
                        const billed = item.billedAmount || 0;
                        const paid = item.quantity || 0;
                        const totalQty = billed + paid;
                        const totalCost = totalQty * (item.buyingPrice || 0);
                        const estimatedProfit =
                          totalQty * (item.sellingPrice || 0);

                        return (
                          <tr key={item._id} className="border-b ...">
                            <td>{item.name?.name || "-"}</td>
                            <td>{billed}</td>
                            <td>{paid}</td>
                            <td>{totalQty}</td>
                            <td>{item.buyingPrice?.toLocaleString() || 0}</td>
                            <td>{totalCost.toLocaleString()}</td>
                            <td>{item.sellingPrice?.toLocaleString() || 0}</td>
                            <td>{estimatedProfit.toLocaleString()}</td>
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
                        );
                      })}
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
            {/* Prev Button */}
            <button
              onClick={prevPage}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-gray-300 hover:bg-gray-50 ${
                currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <IoIosArrowBack className="size-5" />
            </button>

            {/* Page buttons with ellipsis */}
            {(() => {
              const maxPagesToShow = 10;
              const pages = [];

              if (totalPages <= maxPagesToShow) {
                for (let i = 1; i <= totalPages; i++) {
                  pages.push(i);
                }
              } else {
                pages.push(1); // always show first page

                let startPage, endPage;

                if (currentPage <= 6) {
                  startPage = 2;
                  endPage = 8;
                  for (let i = startPage; i <= endPage; i++) pages.push(i);
                  pages.push("ellipsis-right");
                  pages.push(totalPages);
                } else if (currentPage >= totalPages - 5) {
                  pages.push("ellipsis-left");
                  startPage = totalPages - 7;
                  for (let i = startPage; i < totalPages; i++) pages.push(i);
                  pages.push(totalPages);
                } else {
                  pages.push("ellipsis-left");
                  startPage = currentPage - 2;
                  endPage = currentPage + 2;
                  for (let i = startPage; i <= endPage; i++) pages.push(i);
                  pages.push("ellipsis-right");
                  pages.push(totalPages);
                }
              }

              return pages.map((page, idx) => {
                if (page === "ellipsis-left" || page === "ellipsis-right") {
                  return (
                    <span
                      key={`ellipsis-${idx}`}
                      className="relative inline-flex items-center px-4 py-2 text-sm text-gray-700 select-none"
                    >
                      ...
                    </span>
                  );
                }
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ring-1 ring-gray-300 hover:bg-gray-50 ${
                      currentPage === page
                        ? "bg-green-500 text-white"
                        : "text-gray-900"
                    }`}
                  >
                    {page}
                  </button>
                );
              });
            })()}

            {/* Next Button */}
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
