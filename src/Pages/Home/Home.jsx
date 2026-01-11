import CardOne from "./CardOne";
import ShiftDetails from "./ShiftDetails";
import { FiCalendar, FiX, FiCheck } from "react-icons/fi";
import { MdOutlineToday, MdOutlineCalendarViewDay } from "react-icons/md";
import { TbCalendarWeek, TbCalendarMonth } from "react-icons/tb";
import Chart from "../../Components/Shared/Chart";
import MostSold from "./MostSold";
import TableDash from "./TableDash";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";

import BASE_URL from "../../Utils/config";

const Home = () => {
  // -------------------- RAW DATA --------------------
  const [transactions, setTransactions] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [grns, setGrns] = useState([]);

  // -------------------- FILTER --------------------
  const [filter, setFilter] = useState("today");
  const [range, setRange] = useState({ from: null, to: null });

  // -------------------- LOADING --------------------
  const [loading, setLoading] = useState(true);

  // -------------------- DATE LOGIC --------------------
  const getDateRange = () => {
    const now = dayjs();

    switch (filter) {
      case "today":
        return {
          from: now.startOf("day"),
          to: now.endOf("day"),
        };

      case "yesterday":
        return {
          from: now.subtract(1, "day").startOf("day"),
          to: now.subtract(1, "day").endOf("day"),
        };

      case "week":
        return {
          from: now.startOf("week"),
          to: now.endOf("week"),
        };

      case "month":
        return {
          from: now.startOf("month"),
          to: now.endOf("month"),
        };

      case "custom":
        return {
          from: dayjs(range.from).startOf("day"),
          to: dayjs(range.to).endOf("day"),
        };

      default:
        return {
          from: now.startOf("day"),
          to: now.endOf("day"),
        };
    }
  };

  const { from, to } = getDateRange();

  // -------------------- CLEAR FILTER --------------------
  const clearFilter = () => {
    setFilter("today");
    setRange({ from: null, to: null });
  };

  // -------------------- FETCH DATA ONCE --------------------
  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [txRes, expRes, grnPoRes, grnNonPoRes] = await Promise.all([
          axios.get(`${BASE_URL}/api/transactions/all`, {
            withCredentials: true,
          }),
          axios.get(`${BASE_URL}/api/manunuzi/matumiziYote`),
          axios.get(`${BASE_URL}/api/grn/allGrnPo`, { withCredentials: true }),
          axios.get(`${BASE_URL}/api/grn/nonPo`, { withCredentials: true }),
        ]);

        setTransactions(txRes.data.data || []);
        setExpenses(expRes.data || []);
        setGrns([
          ...(grnPoRes.data.data || []),
          ...(grnNonPoRes.data.data || []),
        ]);
      } catch (err) {
        console.error("Dashboard fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  // -------------------- FILTERED DATA --------------------
  const filteredSales = useMemo(() => {
    return transactions.filter((tx) =>
      dayjs(tx.createdAt).isBetween(from, to, null, "[]")
    );
  }, [transactions, from, to]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) =>
      dayjs(e.createdAt).isBetween(from, to, null, "[]")
    );
  }, [expenses, from, to]);

  const filteredGrns = useMemo(() => {
    return grns.filter((g) =>
      dayjs(g.receivingDate).isBetween(from, to, null, "[]")
    );
  }, [grns, from, to]);

  // -------------------- CALCULATIONS --------------------
  const totalSales = useMemo(
    () => filteredSales.reduce((s, t) => s + (t.totalAmount || 0), 0),
    [filteredSales]
  );

  const totalPaid = useMemo(
    () =>
      filteredSales
        .filter((t) => t.status === "Paid")
        .reduce((s, t) => s + (t.totalAmount || 0), 0),
    [filteredSales]
  );

  const totalBills = useMemo(
    () =>
      filteredSales
        .filter((t) => t.status === "Bill")
        .reduce((s, t) => s + (t.totalAmount || 0), 0),
    [filteredSales]
  );

  const totalDiscount = useMemo(
    () => filteredSales.reduce((s, t) => s + (t.tradeDiscount || 0), 0),
    [filteredSales]
  );

  const totalBuyingPrice = useMemo(() => {
    return filteredSales.reduce((sum, tx) => {
      const txBuying = tx.items.reduce(
        (s, i) => s + (i.quantity || 0) * (i.buyingPrice || 0),
        0
      );
      return sum + txBuying;
    }, 0);
  }, [filteredSales]);

  const totalExpenses = useMemo(
    () => filteredExpenses.reduce((s, e) => s + Number(e.amount || 0), 0),
    [filteredExpenses]
  );

  const totalGrn = useMemo(() => {
    return filteredGrns
      .flatMap((g) => g.items || [])
      .reduce((s, i) => s + (i.totalCost || 0), 0);
  }, [filteredGrns]);

  const profit = useMemo(() => {
    return totalSales - (totalBuyingPrice + totalExpenses + totalDiscount);
  }, [totalSales, totalBuyingPrice, totalExpenses, totalDiscount]);

  const billed = filteredSales.filter((t) => t.status === "Bill");

  // Handle range selection
  const handleRangeSelect = (fromDate, toDate) => {
    setRange({ from: fromDate, to: toDate });
    setFilter("custom");
  };

  const composedChartData = useMemo(() => {
    const map = {};

    filteredSales.forEach((tx) => {
      const day = dayjs(tx.createdAt).format("YYYY-MM-DD");

      if (!map[day]) {
        map[day] = {
          name: day,
          sales: 0,
          paid: 0,
          bills: 0,
        };
      }

      map[day].sales += tx.totalAmount || 0;

      if (tx.status === "Paid") {
        map[day].paid += tx.totalAmount || 0;
      }

      if (tx.status === "Bill") {
        map[day].bills += tx.totalAmount || 0;
      }
    });

    return Object.values(map);
  }, [filteredSales]);

  return (
    <section className="h-[90vh] flex gap-3 pt-24 px-6 overflow-hidden">
      <div className="flex-[3] bg-secondary rounded-xl p-6 overflow-auto">
        <ShiftDetails />

        {/* Add gap between ShiftDetails and filter section */}
        <div className="h-6"></div>

        {/* COMPACT FILTER SECTION */}
        <div className="mb-8">
          {/* Header */}
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-1">
              Dashboard Analytics
            </h2>
            <p className="text-sm text-gray-500">
              Select time period to filter data
            </p>
          </div>

          {/* Main Filter Row */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            {/* Quick Filter Buttons */}
            <div className="flex gap-2">
              {[
                {
                  id: "today",
                  label: "Today",
                  icon: <MdOutlineToday size={18} />,
                  gradient: "from-emerald-500 to-teal-400",
                },
                {
                  id: "yesterday",
                  label: "Yesterday",
                  icon: <MdOutlineCalendarViewDay size={18} />,
                  gradient: "from-blue-500 to-cyan-400",
                },
                {
                  id: "week",
                  label: "This Week",
                  icon: <TbCalendarWeek size={18} />,
                  gradient: "from-purple-500 to-pink-400",
                },
                {
                  id: "month",
                  label: "This Month",
                  icon: <TbCalendarMonth size={18} />,
                  gradient: "from-orange-500 to-amber-400",
                },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setFilter(item.id);
                    setRange({ from: null, to: null });
                  }}
                  className={`px-4 py-2 rounded-full flex items-center gap-2 transition-all duration-300
                            ${
                              filter === item.id
                                ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg scale-105`
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                >
                  {item.icon}
                  <span className="font-medium">{item.label}</span>
                  {filter === item.id && <FiCheck size={14} />}
                </button>
              ))}
            </div>

            {/* Date Range Input - Compact */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-300 rounded-full px-3 py-2">
                <FiCalendar className="text-gray-400" size={16} />
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={range.from || ""}
                    onChange={(e) =>
                      handleRangeSelect(
                        e.target.value,
                        range.to || e.target.value
                      )
                    }
                    className="w-36 bg-transparent focus:outline-none text-sm"
                    placeholder="From date"
                  />
                  <span className="text-gray-400">→</span>
                  <input
                    type="date"
                    value={range.to || ""}
                    onChange={(e) =>
                      handleRangeSelect(
                        range.from || e.target.value,
                        e.target.value
                      )
                    }
                    className="w-36 bg-transparent focus:outline-none text-sm"
                    placeholder="To date"
                  />
                </div>
              </div>

              {/* Clear Button */}
              {(filter !== "today" || range.from || range.to) && (
                <button
                  onClick={clearFilter}
                  className="px-3 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-full 
                           hover:from-gray-600 hover:to-gray-700 transition-all duration-300 flex items-center gap-1"
                >
                  <FiX size={14} />
                  <span className="text-sm">Clear</span>
                </button>
              )}
            </div>
          </div>

          {/* Active Range Display */}
          {filter === "custom" && range.from && range.to && (
            <div className="mb-4 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    Showing data for:
                  </p>
                  <p className="text-lg font-bold text-gray-900">
                    {dayjs(range.from).format("MMM D, YYYY")} →{" "}
                    {dayjs(range.to).format("MMM D, YYYY")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Period</p>
                  <p className="text-xl font-bold text-emerald-600">
                    {dayjs(range.to).diff(dayjs(range.from), "day") + 1} days
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* CARDS - UNCHANGED */}
        <div className="grid grid-cols-4 gap-3 mt-4">
          <CardOne
            title="Sales"
            number={`${totalSales.toLocaleString()} TSh`}
            loading={loading}
          />
          <CardOne
            title="Paid"
            number={`${totalPaid.toLocaleString()} TSh`}
            loading={loading}
          />
          <CardOne
            title="Bills"
            number={`${totalBills.toLocaleString()} TSh`}
            loading={loading}
          />
          <CardOne
            title="GRN"
            number={`${totalGrn.toLocaleString()} TSh`}
            loading={loading}
          />
          <CardOne
            title="Expenses"
            number={`${totalExpenses.toLocaleString()} TSh`}
            loading={loading}
          />
          <CardOne
            title="Discounts"
            number={`${totalDiscount.toLocaleString()} TSh`}
            loading={loading}
          />
          <CardOne
            title="Buying Price"
            number={`${totalBuyingPrice.toLocaleString()} TSh`}
            loading={loading}
          />
          <CardOne
            title="Profit"
            number={`${profit.toLocaleString()} TSh`}
            loading={loading}
          />
        </div>

        <TableDash list={billed} />
        <Chart composedData={composedChartData} />
      </div>

      <div className="flex-1 bg-secondary rounded-xl p-6 overflow-auto">
        <MostSold />
      </div>
    </section>
  );
};

export default Home;
