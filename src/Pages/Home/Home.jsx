import CardOne from "./CardOne";
import ShiftDetails from "./ShiftDetails";
import { BsCashCoin } from "react-icons/bs";
import { RiProgress2Fill } from "react-icons/ri";
import Chart from "../../Components/Shared/Chart";
import MostSold from "./MostSold";
import { useEffect, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";

// API
import BASE_URL from "../../Utils/config";
import TableDash from "./TableDash";

const Home = () => {
  const [totalSales, setTotalSales] = useState(0);
  const [totalPaid, setTotalPaid] = useState(0);
  const [totalBills, setTotalBills] = useState(0);
  const [totalgrn, setTotalgrn] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [totalDiscount, setTotalDiscount] = useState(0);
  const [totalBuyingPrice, setTotalBuyingPrice] = useState(0);
  const [profit, setProfit] = useState(0);
  const [billed, setBilled] = useState([]);
  const [filter, setFilter] = useState("day");
  const [composedData, setComposedData] = useState([]);

  // NEW: loading state
  const [loading, setLoading] = useState(true);

  const getStartDate = (filter) => {
    const now = dayjs();
    switch (filter) {
      case "week":
        return now.subtract(7, "day");
      case "month":
        return now.subtract(1, "month");
      case "3-Months":
        return now.subtract(3, "month");
      case "6-Months":
        return now.subtract(6, "month");
      case "A Year":
        return now.subtract(12, "month");
      default:
        return now.startOf("day");
    }
  };

  // FETCH SALES TRANSACTIONS
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      try {
        const res = await axios.get(`${BASE_URL}/api/transactions/all`, {
          withCredentials: true,
        });
        const allSales = res.data.data;
        const startDate = getStartDate(filter);

        const filteredSales = allSales.filter((tx) =>
          dayjs(tx.createdAt).isAfter(startDate)
        );

        const salesTotal = filteredSales.reduce(
          (sum, tx) => sum + tx.totalAmount,
          0
        );
        setTotalSales(salesTotal);

        setTotalPaid(
          filteredSales
            .filter((tx) => tx.status === "Paid")
            .reduce((sum, tx) => sum + tx.totalAmount, 0)
        );

        setTotalBills(
          filteredSales
            .filter((tx) => tx.status === "Bill")
            .reduce((sum, tx) => sum + tx.totalAmount, 0)
        );

        const discountTotal = filteredSales.reduce(
          (sum, tx) => sum + (tx.tradeDiscount || 0),
          0
        );
        setTotalDiscount(discountTotal);

        setBilled(filteredSales.filter((tx) => tx.status === "Bill"));

        const buyingTotal = filteredSales.reduce((sum, tx) => {
          const txBuying = tx.items.reduce(
            (s, item) => s + (item.quantity || 0) * (item.buyingPrice || 0),
            0
          );
          return sum + txBuying;
        }, 0);

        setTotalBuyingPrice(buyingTotal);

        const profitValue = salesTotal - (totalExpenses + buyingTotal);

        setProfit(profitValue);
      } catch (error) {
        console.error("Failed to fetch transactions", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filter, totalExpenses]);

  // FETCH EXPENSES
  useEffect(() => {
    const fetchExpenses = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${BASE_URL}/api/manunuzi/matumiziYote`);
        const all = res.data;
        const startDate = getStartDate(filter);

        const filtered = all.filter((exp) =>
          dayjs(exp.createdAt).isAfter(startDate)
        );

        const total = filtered.reduce(
          (sum, exp) => sum + (Number(exp.amount) || 0),
          0
        );
        setTotalExpenses(total);
      } catch (error) {
        console.error("Failed to fetch expenses", error);
      } finally {
        setLoading(false);
      }
    };
    fetchExpenses();
  }, [filter]);

  // FETCH GRN
  useEffect(() => {
    const fetchGrn = async () => {
      setLoading(true);
      try {
        const [resPo, resNonPo] = await Promise.all([
          axios.get(`${BASE_URL}/api/grn/allGrnPo`, { withCredentials: true }),
          axios.get(`${BASE_URL}/api/grn/nonPo`, { withCredentials: true }),
        ]);

        const poGrns = resPo.data.data || [];
        const nonPoGrns = resNonPo.data.data || [];
        const startDate = getStartDate(filter);

        const poTodayCost = poGrns
          .filter((grn) => dayjs(grn.receivingDate).isAfter(startDate))
          .flatMap((grn) => grn.items)
          .reduce((sum, item) => sum + (item.totalCost || 0), 0);

        const nonPoTodayCost = nonPoGrns
          .filter((grn) => dayjs(grn.receivingDate).isAfter(startDate))
          .flatMap((grn) => grn.items)
          .reduce((sum, item) => sum + (item.totalCost || 0), 0);

        setTotalgrn(poTodayCost + nonPoTodayCost);
      } catch (error) {
        console.error("Failed to fetch GRNs:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchGrn();
  }, [filter]);

  // COMPOSED CHART DATA
  useEffect(() => {
    const fetchComposedData = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/transactions/all`, {
          withCredentials: true,
        });
        const allSales = res.data.data;
        const threeMonthsAgo = dayjs().subtract(3, "month").startOf("month");

        const weeklyTotals = {};
        allSales.forEach((tx) => {
          const txDate = dayjs(tx.createdAt);
          if (txDate.isBefore(threeMonthsAgo)) return;
          const weekKey = `W${txDate.week()}`;
          if (!weeklyTotals[weekKey])
            weeklyTotals[weekKey] = {
              name: weekKey,
              sales: 0,
              paid: 0,
              bills: 0,
            };
          weeklyTotals[weekKey].sales += tx.totalAmount;
          if (tx.status === "Paid")
            weeklyTotals[weekKey].paid += tx.totalAmount;
          else if (tx.status === "Bill")
            weeklyTotals[weekKey].bills += tx.totalAmount;
        });

        setComposedData(Object.values(weeklyTotals));
      } catch (error) {
        console.error("Failed to fetch composed chart data", error);
      }
    };
    fetchComposedData();
  }, [filter]);

  const paidPercentage =
    totalSales > 0 ? ((totalPaid / totalSales) * 100).toFixed(1) : 0;
  const billsPercentage =
    totalSales > 0 ? ((totalBills / totalSales) * 100).toFixed(1) : 0;
  const manunuziPercentage =
    totalgrn > 0 ? ((totalSales / totalgrn) * 100).toFixed(1) : 0;

  return (
    <section className="h-[90vh] flex flex-col md:flex-row gap-3 pt-24 px-2 sm:px-4 md:px-6 lg:px-8 xl:px-12 overflow-hidden">
      {/* Right Section */}
      <div className="flex-1 md:flex-[3] sm:flex-[2] bg-secondary rounded-xl p-4 sm:p-6 shadow-md overflow-auto min-h-[50vh]">
        <ShiftDetails />

        {/* Filter Buttons */}
        <div className="flex gap-2 mt-4">
          {["day", "week", "month", "3-Months", "6-Months", "A Year"].map(
            (option) => (
              <button
                key={option}
                onClick={() => setFilter(option)}
                className={`px-3 py-2 rounded-full text-sm font-semibold shadow-sm transition border ${
                  filter === option
                    ? "bg-green-500 text-white"
                    : "bg-white text-gray-700"
                }`}
              >
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </button>
            )
          )}
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
          <CardOne
            title="Sales"
            icon={<BsCashCoin />}
            number={`${totalSales.toLocaleString()} : TSh`}
            loading={loading}
          />
          <CardOne
            title="Paid"
            icon={<BsCashCoin />}
            number={`${totalPaid.toLocaleString()} : TSh`}
            loading={loading}
          />
          <CardOne
            title="Bills"
            icon={<RiProgress2Fill />}
            number={`${totalBills.toLocaleString()} : TSh`}
            loading={loading}
          />
          <CardOne
            title="Purchases (GRN)"
            icon={<RiProgress2Fill />}
            number={`${totalgrn.toLocaleString()} : TSh`}
            loading={loading}
          />
          <CardOne
            title="Expenses"
            icon={<RiProgress2Fill />}
            number={`${totalExpenses.toLocaleString()} : TSh`}
            loading={loading}
          />
          <CardOne
            title="Discounts"
            icon={<RiProgress2Fill />}
            number={`${totalDiscount.toLocaleString()} : TSh`}
            loading={loading}
          />
          <CardOne
            title="Total Buying Price"
            icon={<BsCashCoin />}
            number={`${totalBuyingPrice.toLocaleString()} : TSh`}
            loading={loading}
          />
          <CardOne
            title="Profit"
            icon={<BsCashCoin />}
            number={`${profit.toLocaleString()} : TSh`}
            loading={loading}
          />
        </div>

        {/* Recent Orders */}
        <TableDash list={billed} />

        {/* Chart */}
        <Chart
          salesPercent={totalSales}
          paidPercent={totalPaid}
          billPercent={totalBills}
          manunuziPercent={manunuziPercentage}
          composedData={composedData}
        />
      </div>

      {/* Left Section */}
      <div className="flex-1 md:flex-[1] bg-secondary rounded-xl p-4 sm:p-6 shadow-md text-black overflow-y-auto max-h-[90vh] scrollbar-hide">
        <MostSold />
      </div>
    </section>
  );
};

export default Home;
