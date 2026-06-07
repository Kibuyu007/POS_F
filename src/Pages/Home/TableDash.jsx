import { Link } from "react-router-dom";
import React from "react";
import {
  FiDollarSign,
  FiPackage,
  FiTrendingUp,
  FiArrowRight,
  FiChevronDown,
  FiChevronUp,
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
    <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 lg:p-6 shadow-lg border-2 border-dashed border-gray-300 mt-4 sm:mt-6">
      {/* Card header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 pb-4 sm:pb-6 border-b-2 border-dashed border-gray-300 mb-4 sm:mb-6">
        <div className="w-full sm:w-auto">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-2 sm:p-3 bg-gradient-to-br from-emerald-500 to-teal-400 rounded-xl flex-shrink-0">
              <FiTrendingUp className="text-white text-lg sm:text-xl" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-lg sm:text-xl md:text-2xl text-gray-900 truncate">
                Credit Sales
              </h3>
              <p className="text-gray-500 text-xs sm:text-sm truncate">
                Billed transactions awaiting payment
              </p>
            </div>
          </div>
        </div>
        <Link
          to="/reports"
          className="group flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-emerald-500 to-teal-400 
                   text-white rounded-full hover:shadow-lg transition-all duration-300 w-full sm:w-auto justify-center sm:justify-start"
        >
          <span className="font-semibold text-sm">View All</span>
          <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Totals summary */}
      <div className="mb-4 sm:mb-6 md:mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div
            className="relative overflow-hidden bg-gradient-to-br from-emerald-50 to-teal-50 
                        border-2 border-dashed border-emerald-300 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 group"
          >
            <div className="absolute -right-4 -bottom-4 w-16 h-16 sm:w-20 sm:h-20 bg-emerald-200 rounded-full opacity-20 group-hover:scale-110 transition-transform"></div>
            <div className="relative z-10 flex items-center gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 bg-gradient-to-br from-emerald-500 to-teal-400 rounded-xl flex-shrink-0">
                <FiPackage className="text-white text-base sm:text-lg" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-gray-600 font-medium truncate">
                  Total Quantity Sold
                </p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mt-0.5 sm:mt-1 truncate">
                  {totalQuantity.toLocaleString()}
                  <span className="text-xs sm:text-sm font-normal text-gray-500 ml-1 sm:ml-2">
                    items
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div
            className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-yellow-100 
                        border-2 border-dashed border-blue-300 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 group"
          >
            <div className="absolute -right-4 -bottom-4 w-16 h-16 sm:w-20 sm:h-20 bg-blue-200 rounded-full opacity-20 group-hover:scale-110 transition-transform"></div>
            <div className="relative z-10 flex items-center gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 bg-gradient-to-br from-yellow-500 to-cyan-400 rounded-xl flex-shrink-0">
                <FiDollarSign className="text-white text-base sm:text-lg" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-gray-600 font-medium truncate">
                  Total Amount
                </p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mt-0.5 sm:mt-1 truncate">
                  {totalAmount.toLocaleString()}
                  <span className="text-xs sm:text-sm font-normal text-gray-500 ml-1 sm:ml-2">
                    TSh
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Table section - Desktop */}
      <div className="hidden md:block border-2 border-dashed border-gray-300 rounded-xl sm:rounded-2xl overflow-hidden">
        {/* Table header */}
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-3 sm:p-4 border-b-2 border-dashed border-gray-300">
          <div className="grid grid-cols-5 gap-2 sm:gap-4 text-xs sm:text-sm font-semibold text-emerald-800">
            <div className="px-2 sm:px-3 py-2">Customer</div>
            <div className="px-2 sm:px-3 py-2 text-center">Qty</div>
            <div className="px-2 sm:px-3 py-2 text-center">Price</div>
            <div className="px-2 sm:px-3 py-2 text-center">Status</div>
            <div className="px-2 sm:px-3 py-2 text-center">Date</div>
          </div>
        </div>

        {/* Table body */}
        <div className="max-h-[280px] sm:max-h-[320px] overflow-y-auto scrollbar-thin scrollbar-thumb-emerald-300 scrollbar-track-gray-100">
          {list.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 sm:py-12">
              <div className="w-12 h-12 sm:w-16 sm:h-16 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                <FiPackage className="text-gray-400 text-xl sm:text-2xl" />
              </div>
              <p className="text-gray-500 text-base sm:text-lg font-medium">
                No billed items found
              </p>
              <p className="text-gray-400 text-xs sm:text-sm mt-1">
                Create a bill to see it appear here
              </p>
            </div>
          ) : (
            <div className="divide-y divide-dashed divide-gray-200">
              {list.map((tx) =>
                tx.items?.map((item, idx) => (
                  <div
                    key={`${tx._id}-${item.item?._id || idx}`}
                    className="grid grid-cols-5 gap-2 sm:gap-4 p-3 sm:p-4 hover:bg-gray-50 transition-colors duration-200"
                  >
                    <div className="px-2 sm:px-3 min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate">
                        {tx.customerDetails?.name || "Unknown"}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        ID: {tx.customerDetails?._id?.slice(-6) || "N/A"}
                      </p>
                    </div>

                    <div className="px-2 sm:px-3 flex items-center justify-center">
                      <span
                        className="inline-flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 
                                     bg-emerald-100 text-emerald-800 font-bold rounded-full text-sm"
                      >
                        {item.quantity}
                      </span>
                    </div>

                    <div className="px-2 sm:px-3 flex items-center justify-center">
                      <div className="text-right">
                        <p className="font-bold text-gray-900 text-sm sm:text-base">
                          {item.price.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500 hidden lg:block">
                          {item.quantity} ×{" "}
                          {item.unitPrice?.toLocaleString() ||
                            item.price.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="px-2 sm:px-3 flex items-center justify-center">
                      <StatusBadge price={item.price} />
                    </div>

                    <div className="px-2 sm:px-3 flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-xs sm:text-sm font-medium text-gray-900">
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
                )),
              )}
            </div>
          )}
        </div>

        {/* Table footer */}
        {list.length > 0 && (
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-3 sm:p-4 border-t-2 border-dashed border-gray-300">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <p className="text-xs sm:text-sm text-gray-600">
                Showing <span className="font-semibold">{list.length}</span>
                {list.length === 1 ? " transaction" : " transactions"}
              </p>
              <div className="flex items-center gap-3 sm:gap-4">
                <LegendItem color="bg-emerald-500" label="Low" />
                <LegendItem color="bg-amber-500" label="Medium" />
                <LegendItem color="bg-red-500" label="High" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Card View - Shows on small screens */}
      <div className="md:hidden border-2 border-dashed border-gray-300 rounded-xl overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-3 border-b-2 border-dashed border-gray-300">
          <p className="text-xs font-semibold text-emerald-800">Transactions</p>
        </div>

        <div className="max-h-[400px] overflow-y-auto">
          {list.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="w-12 h-12 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center mb-3">
                <FiPackage className="text-gray-400 text-xl" />
              </div>
              <p className="text-gray-500 text-sm font-medium">
                No billed items found
              </p>
            </div>
          ) : (
            <div className="divide-y divide-dashed divide-gray-200">
              {list.map((tx) =>
                tx.items?.map((item, idx) => (
                  <MobileTransactionCard
                    key={`${tx._id}-${item.item?._id || idx}`}
                    tx={tx}
                    item={item}
                  />
                )),
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Extracted Status Badge Component
const StatusBadge = ({ price }) => {
  const config =
    price > 10000
      ? {
          bg: "from-red-50 to-rose-50",
          text: "text-red-700",
          border: "border-red-300",
          label: "High Value",
        }
      : price >= 1000 && price <= 9900
        ? {
            bg: "from-yellow-50 to-amber-50",
            text: "text-amber-700",
            border: "border-yellow-300",
            label: "Medium",
          }
        : {
            bg: "from-emerald-50 to-teal-50",
            text: "text-emerald-700",
            border: "border-emerald-300",
            label: "Low",
          };

  return (
    <span
      className={`inline-flex items-center px-2 sm:px-4 py-1 sm:py-1.5 rounded-full font-semibold text-xs sm:text-sm 
                shadow-sm border-2 border-dashed transition-all duration-300 bg-gradient-to-r ${config.bg} ${config.text} ${config.border}`}
    >
      {config.label}
    </span>
  );
};

// Legend Item Component
const LegendItem = ({ color, label }) => (
  <div className="flex items-center gap-1.5 sm:gap-2">
    <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${color} rounded-full`}></div>
    <span className="text-xs text-gray-600">{label}</span>
  </div>
);

// Mobile Transaction Card
const MobileTransactionCard = ({ tx, item }) => {
  const [expanded, setExpanded] = React.useState(false);

  return (
    <div className="p-3 bg-white hover:bg-gray-50 transition-colors">
      <div
        className="flex items-center justify-between gap-2"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span className="inline-flex items-center justify-center w-7 h-7 bg-emerald-100 text-emerald-800 font-bold rounded-full text-xs flex-shrink-0">
            {item.quantity}
          </span>
          <div className="min-w-0">
            <p className="font-medium text-gray-900 text-sm truncate">
              {tx.customerDetails?.name || "Unknown"}
            </p>
            <p className="text-xs text-gray-500">
              {new Date(tx.createdAt).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
              })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="font-bold text-gray-900 text-sm">
            {item.price.toLocaleString()} TSh
          </span>
          {expanded ? (
            <FiChevronUp className="text-gray-400" />
          ) : (
            <FiChevronDown className="text-gray-400" />
          )}
        </div>
      </div>

      {expanded && (
        <div className="mt-3 pt-3 border-t border-dashed border-gray-200 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Customer ID:</span>
            <span className="text-gray-900 font-medium">
              {tx.customerDetails?._id?.slice(-6) || "N/A"}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Unit Price:</span>
            <span className="text-gray-900 font-medium">
              {item.unitPrice?.toLocaleString() || item.price.toLocaleString()}{" "}
              TSh
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Total:</span>
            <span className="text-gray-900 font-medium">
              {(item.price * item.quantity).toLocaleString()} TSh
            </span>
          </div>
          <div className="flex justify-between text-sm items-center">
            <span className="text-gray-500">Status:</span>
            <StatusBadge price={item.price} />
          </div>
          <div className="text-xs text-gray-400 pt-1">
            {new Date(tx.createdAt).toLocaleTimeString("en-GB", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default TableDash;
