import CardOne from "./CardOne";
import ShiftDetails from "./ShiftDetails";
import { FiCalendar, FiX, FiCheck } from "react-icons/fi";
import { MdOutlineToday, MdOutlineCalendarViewDay } from "react-icons/md";
import { TbCalendarWeek, TbCalendarMonth } from "react-icons/tb";
import Chart from "../../Components/Shared/Chart";
import MostSold from "./MostSold";
import TableDash from "./TableDash";

import { useEffect, useMemo, useState, useCallback } from "react";
import axios from "axios";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";

import BASE_URL from "../../Utils/config";

dayjs.extend(isBetween);

const ProfitModal = ({
  isOpen,
  onClose,
  profitData,
  totalProfit,
  dateRange,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" />
      <div
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white">
                Profit Summary
              </h2>
              <p className="text-green-100 text-xs sm:text-sm mt-1">
                {dateRange}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
          <div className="mt-4 bg-white/20 rounded-xl p-3 sm:p-4 backdrop-blur-sm">
            <p className="text-green-100 text-xs sm:text-sm font-medium">
              Total Net Profit
            </p>
            <p
              className={`text-2xl sm:text-3xl font-bold ${totalProfit >= 0 ? "text-white" : "text-red-200"}`}
            >
              Tsh {totalProfit.toLocaleString()}
            </p>
          </div>
        </div>
        <div className="max-h-[60vh] sm:max-h-[65vh] overflow-y-auto">
          {profitData.length === 0 ? (
            <div className="p-8 sm:p-12 text-center">
              <p className="text-gray-500 text-sm">
                No profit data available for this period
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              <div className="grid grid-cols-12 gap-2 px-4 sm:px-6 py-3 bg-gray-50 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                <div className="col-span-1 text-center">#</div>
                <div className="col-span-6 sm:col-span-7">Item Name</div>
                <div className="col-span-3 sm:col-span-2 text-right">Qty</div>
                <div className="col-span-2 sm:col-span-2 text-right">
                  Profit
                </div>
              </div>
              {profitData.map((item, index) => (
                <div
                  key={item.itemName}
                  className="grid grid-cols-12 gap-2 px-4 sm:px-6 py-3 sm:py-4 hover:bg-gray-50 transition-colors items-center"
                >
                  <div className="col-span-1 text-center">
                    <span
                      className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                        index === 0
                          ? "bg-yellow-100 text-yellow-700"
                          : index === 1
                            ? "bg-gray-200 text-gray-700"
                            : index === 2
                              ? "bg-orange-100 text-orange-700"
                              : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {index + 1}
                    </span>
                  </div>
                  <div className="col-span-6 sm:col-span-7">
                    <p className="font-semibold text-gray-900 text-sm truncate">
                      {item.itemName}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Buy: Tsh {item.buyingPrice.toLocaleString()} → Sell: Tsh{" "}
                      {item.sellingPrice.toLocaleString()}
                    </p>
                  </div>
                  <div className="col-span-3 sm:col-span-2 text-right">
                    <span className="text-sm font-medium text-gray-700">
                      {item.qty}
                    </span>
                  </div>
                  <div className="col-span-2 sm:col-span-2 text-right">
                    <span
                      className={`text-sm font-bold ${item.profit >= 0 ? "text-green-600" : "text-red-600"}`}
                    >
                      {item.profit >= 0 ? "+" : ""}
                      {item.profit.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="border-t border-gray-200 p-4 sm:p-6 bg-gray-50">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500">
              {profitData.length} items sold
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Home = () => {
  const [filter, setFilter] = useState("today");
  const [range, setRange] = useState({ from: null, to: null });
  const [profitModalOpen, setProfitModalOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  // FIX: Return null when custom filter doesn't have both dates yet
  const dateRange = useMemo(() => {
    const now = dayjs();
    switch (filter) {
      case "today":
        return { from: now.startOf("day"), to: now.endOf("day") };
      case "yesterday":
        return {
          from: now.subtract(1, "day").startOf("day"),
          to: now.subtract(1, "day").endOf("day"),
        };
      case "week":
        return { from: now.startOf("week"), to: now.endOf("week") };
      case "month":
        return { from: now.startOf("month"), to: now.endOf("month") };
      case "custom":
        // FIX: Return null instead of falling back to today when dates are incomplete
        if (!range.from || !range.to) {
          return null;
        }
        return {
          from: dayjs(range.from).startOf("day"),
          to: dayjs(range.to).endOf("day"),
        };
      default:
        return { from: now.startOf("day"), to: now.endOf("day") };
    }
  }, [filter, range.from, range.to]);

  // FIX: Safe destructure — will be undefined when dateRange is null
  const { from, to } = dateRange || {};

  const clearFilter = useCallback(() => {
    setFilter("today");
    setRange({ from: null, to: null });
  }, []);

  useEffect(() => {
    // FIX: Skip the API call until both dates are available
    if (!from || !to) return;

    const controller = new AbortController();

    const fetchDashboard = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `${BASE_URL}/api/transactions/dashboard?from=${from.format("YYYY-MM-DD")}&to=${to.format("YYYY-MM-DD")}`,
          { withCredentials: true, signal: controller.signal },
        );
        setDashboardData(res.data.data);
      } catch (err) {
        if (axios.isCancel(err)) return;
        console.error("Dashboard fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
    return () => controller.abort();
  }, [from, to]);

  const handleFromDateChange = useCallback((e) => {
    const newFrom = e.target.value;
    setRange((prev) => ({ ...prev, from: newFrom }));
    setFilter("custom");
  }, []);

  const handleToDateChange = useCallback((e) => {
    const newTo = e.target.value;
    setRange((prev) => ({ ...prev, to: newTo }));
    setFilter("custom");
  }, []);

  const cardData = useMemo(() => {
    if (!dashboardData) {
      return [
        { title: "Sales", icon: "💰", number: "0 TSh" },
        { title: "Paid", icon: "✅", number: "0 TSh" },
        { title: "Bills", icon: "📝", number: "0 TSh" },
        { title: "GRN", icon: "📦", number: "0 TSh" },
        { title: "Expenses", icon: "💸", number: "0 TSh" },
        { title: "Discounts", icon: "🏷️", number: "0 TSh" },
        { title: "Buying", icon: "🏭", number: "0 TSh" },
        {
          title: "Profit",
          icon: "📈",
          number: "0 TSh",
          onClick: () => setProfitModalOpen(true),
        },
      ];
    }

    const {
      totalSales,
      totalPaid,
      totalBills,
      totalGrn,
      totalExpenses,
      totalDiscount,
      totalBuyingPrice,
      profit,
    } = dashboardData;

    return [
      {
        title: "Sales",
        icon: "💰",
        number: `${totalSales.toLocaleString()} TSh`,
      },
      {
        title: "Paid",
        icon: "✅",
        number: `${totalPaid.toLocaleString()} TSh`,
      },
      {
        title: "Bills",
        icon: "📝",
        number: `${totalBills.toLocaleString()} TSh`,
      },
      { title: "GRN", icon: "📦", number: `${totalGrn.toLocaleString()} TSh` },
      {
        title: "Expenses",
        icon: "💸",
        number: `${totalExpenses.toLocaleString()} TSh`,
      },
      {
        title: "Discounts",
        icon: "🏷️",
        number: `${totalDiscount.toLocaleString()} TSh`,
      },
      {
        title: "Buying",
        icon: "🏭",
        number: `${totalBuyingPrice.toLocaleString()} TSh`,
      },
      {
        title: "Profit",
        icon: "📈",
        number: `${profit.toLocaleString()} TSh`,
        onClick: () => setProfitModalOpen(true),
      },
    ];
  }, [dashboardData]);

  const billed = dashboardData?.billed || [];
  const profitSummaryData = dashboardData?.profitSummaryData || [];
  const composedChartData = dashboardData?.composedChartData || [];
  const profit = dashboardData?.profit || 0;

  return (
    <>
      <section className="h-[90vh] flex flex-col lg:flex-row gap-3 pt-20 sm:pt-24 px-3 sm:px-4 lg:px-6 overflow-hidden">
        <div className="w-full lg:flex-[3] bg-secondary rounded-xl p-3 sm:p-4 lg:p-6 overflow-auto">
          <ShiftDetails />
          <div className="h-4 sm:h-6"></div>

          {/* FILTER SECTION */}
          <div className="mb-4 sm:mb-8">
            <div className="mb-3 sm:mb-4">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-1">
                Dashboard Analytics
              </h2>
              <p className="text-xs sm:text-sm text-gray-500">
                Select time period to filter data
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="flex flex-wrap gap-2">
                {[
                  {
                    id: "today",
                    label: "Today",
                    icon: <MdOutlineToday size={16} />,
                    gradient: "from-emerald-500 to-teal-400",
                  },
                  {
                    id: "yesterday",
                    label: "Yesterday",
                    icon: <MdOutlineCalendarViewDay size={16} />,
                    gradient: "from-blue-500 to-cyan-400",
                  },
                  {
                    id: "week",
                    label: "Week",
                    icon: <TbCalendarWeek size={16} />,
                    gradient: "from-purple-500 to-pink-400",
                  },
                  {
                    id: "month",
                    label: "Month",
                    icon: <TbCalendarMonth size={16} />,
                    gradient: "from-orange-500 to-amber-400",
                  },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setFilter(item.id);
                      setRange({ from: null, to: null });
                    }}
                    className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-full flex items-center gap-1.5 sm:gap-2 transition-all duration-300 text-xs sm:text-sm ${
                      filter === item.id
                        ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg scale-105`
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {item.icon}
                    <span className="font-medium">{item.label}</span>
                    {filter === item.id && <FiCheck size={12} />}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-2 bg-gray-50 border border-gray-300 rounded-full px-2 sm:px-3 py-1.5 sm:py-2">
                  <FiCalendar className="text-gray-400" size={14} />
                  <div className="flex items-center gap-1 sm:gap-2">
                    <input
                      type="date"
                      value={range.from || ""}
                      onChange={handleFromDateChange}
                      className="w-28 sm:w-36 bg-transparent focus:outline-none text-xs sm:text-sm"
                    />
                    <span className="text-gray-400">→</span>
                    <input
                      type="date"
                      value={range.to || ""}
                      onChange={handleToDateChange}
                      className="w-28 sm:w-36 bg-transparent focus:outline-none text-xs sm:text-sm"
                    />
                  </div>
                </div>

                {(filter !== "today" || range.from || range.to) && (
                  <button
                    onClick={clearFilter}
                    className="px-2.5 py-1.5 sm:px-3 sm:py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-full hover:from-gray-600 hover:to-gray-700 transition-all duration-300 flex items-center gap-1 text-xs sm:text-sm"
                  >
                    <FiX size={12} />
                    <span>Clear</span>
                  </button>
                )}
              </div>
            </div>

            {filter === "custom" && range.from && range.to && (
              <div className="mb-3 sm:mb-4 p-3 sm:p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600 mb-0.5">
                      Showing data for:
                    </p>
                    <p className="text-base sm:text-lg font-bold text-gray-900">
                      {dayjs(range.from).format("MMM D, YYYY")} →{" "}
                      {dayjs(range.to).format("MMM D, YYYY")}
                    </p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-xs sm:text-sm text-gray-500">Period</p>
                    <p className="text-lg sm:text-xl font-bold text-emerald-600">
                      {dayjs(range.to).diff(dayjs(range.from), "day") + 1} days
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* CARDS */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 mt-3 sm:mt-4">
            {cardData.map((card) => (
              <CardOne
                key={card.title}
                title={card.title}
                icon={card.icon}
                number={card.number}
                onClick={card.onClick}
                loading={loading}
              />
            ))}
          </div>

          <TableDash list={billed} />
          <Chart composedData={composedChartData} />
        </div>

        <div className="hidden lg:block lg:flex-1 bg-secondary rounded-xl p-3 sm:p-4 lg:p-6 overflow-auto">
          <MostSold />
        </div>
      </section>

      {/* FIX: Only render ProfitModal with dateRange string when both dates exist */}
      <ProfitModal
        isOpen={profitModalOpen}
        onClose={() => setProfitModalOpen(false)}
        profitData={profitSummaryData}
        totalProfit={profit}
        dateRange={
          from && to
            ? `${from.format("MMM D, YYYY")} - ${to.format("MMM D, YYYY")}`
            : ""
        }
      />
    </>
  );
};

export default Home;
