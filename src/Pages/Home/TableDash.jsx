import { Link } from "react-router-dom";
import {
  FiDollarSign,
  FiPackage,
  FiTrendingUp,
  FiArrowRight,
} from "react-icons/fi";

const TableDash = ({ list }) => {
  // Calculate totals
  const totalQuantity = list.reduce((acc, tx) => {
    const sumItems =
      tx.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
    return acc + sumItems;
  }, 0);

  const totalAmount = list.reduce((acc, tx) => {
    const sumItems =
      tx.items?.reduce((sum, item) => sum + item.price * item.quantity, 0) || 0;
    return acc + sumItems;
  }, 0);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-dashed border-gray-300 mt-6">
      {/* Card header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b-2 border-dashed border-gray-300 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-400 rounded-xl">
              <FiTrendingUp className="text-white text-xl" />
            </div>
            <div>
              <h3 className="font-bold text-2xl text-gray-900">Credit Sales</h3>
              <p className="text-gray-500 text-sm">
                Billed transactions awaiting payment
              </p>
            </div>
          </div>
        </div>
        <Link
          to="/reports"
          className="group flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-400 
                   text-white rounded-full hover:shadow-lg transition-all duration-300"
        >
          <span className="font-semibold text-sm">View All</span>
          <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Totals summary - Enhanced with gradients */}
      <div className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            className="relative overflow-hidden bg-gradient-to-br from-emerald-50 to-teal-50 
                        border-2 border-dashed border-emerald-300 rounded-2xl p-6 group"
          >
            <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-emerald-200 rounded-full opacity-20 group-hover:scale-110 transition-transform"></div>
            <div className="relative z-10 flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-400 rounded-xl">
                <FiPackage className="text-white text-lg" />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">
                  Total Quantity Sold
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {totalQuantity.toLocaleString()}
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    items
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div
            className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-yellow-100 
                        border-2 border-dashed border-blue-300 rounded-2xl p-6 group"
          >
            <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-blue-200 rounded-full opacity-20 group-hover:scale-110 transition-transform"></div>
            <div className="relative z-10 flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-yellow-500 to-cyan-400 rounded-xl">
                <FiPackage className="text-white text-lg" />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">
                  Total Amount
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {totalAmount.toLocaleString()}
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    TSh
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Table section */}
      <div className="border-2 border-dashed border-gray-300 rounded-2xl overflow-hidden">
        {/* Table header */}
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-4 border-b-2 border-dashed border-gray-300">
          <div className="grid grid-cols-5 gap-4 text-sm font-semibold text-emerald-800">
            <div className="px-3 py-2">Customer</div>
            <div className="px-3 py-2 text-center">Quantity</div>
            <div className="px-3 py-2 text-center">Price (TSh)</div>
            <div className="px-3 py-2 text-center">Status</div>
            <div className="px-3 py-2 text-center">Date</div>
          </div>
        </div>

        {/* Table body */}
        <div className="max-h-[320px] overflow-y-auto scrollbar-thin scrollbar-thumb-emerald-300 scrollbar-track-gray-100">
          {list.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center mb-4">
                <FiPackage className="text-gray-400 text-2xl" />
              </div>
              <p className="text-gray-500 text-lg font-medium">
                No billed items found
              </p>
              <p className="text-gray-400 text-sm mt-1">
                Create a bill to see it appear here
              </p>
            </div>
          ) : (
            <div className="divide-y divide-dashed divide-gray-200">
              {list.map((tx) =>
                tx.items?.map((item, idx) => (
                  <div
                    key={`${tx._id}-${item.item?._id || idx}`}
                    className="grid grid-cols-5 gap-4 p-4 hover:bg-gray-50 transition-colors duration-200"
                  >
                    <div className="px-3">
                      <p className="font-medium text-gray-900 truncate">
                        {tx.customerDetails?.name || "Unknown Customer"}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        ID: {tx.customerDetails?._id || "N/A"}
                      </p>
                    </div>

                    <div className="px-3 flex items-center justify-center">
                      <span
                        className="inline-flex items-center justify-center w-10 h-10 
                                     bg-emerald-100 text-emerald-800 font-bold rounded-full"
                      >
                        {item.quantity}
                      </span>
                    </div>

                    <div className="px-3 flex items-center justify-center">
                      <div className="text-right">
                        <p className="font-bold text-gray-900 text-lg">
                          {item.price.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">
                          {item.quantity} ×{" "}
                          {item.unitPrice?.toLocaleString() ||
                            item.price.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="px-3 flex items-center justify-center">
                      <span
                        className={`inline-flex items-center px-4 py-1.5 rounded-full font-semibold text-sm 
                                  shadow-sm border-2 border-dashed transition-all duration-300 ${
                                    item.price > 10000
                                      ? "bg-gradient-to-r from-red-50 to-rose-50 text-red-700 border-red-300"
                                      : item.price >= 1000 && item.price <= 9900
                                      ? "bg-gradient-to-r from-yellow-50 to-amber-50 text-amber-700 border-yellow-300"
                                      : "bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 border-emerald-300"
                                  }`}
                      >
                        {item.price > 10000
                          ? "High Value"
                          : item.price >= 1000 && item.price <= 9900
                          ? "Medium"
                          : "Low"}
                      </span>
                    </div>

                    <div className="px-3 flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-900">
                          {new Date(tx.createdAt).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                          })}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(tx.createdAt).toLocaleTimeString("en-GB", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Table footer */}
        {list.length > 0 && (
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 border-t-2 border-dashed border-gray-300">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing <span className="font-semibold">{list.length}</span>
                {list.length === 1 ? " transaction" : " transactions"}
              </p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                  <span className="text-xs text-gray-600">Low</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                  <span className="text-xs text-gray-600">Medium</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-xs text-gray-600">High</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TableDash;
