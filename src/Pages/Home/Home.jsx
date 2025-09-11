import CardOne from "./CardOne";
import ShiftDetails from "./ShiftDetails";
import { BsCashCoin } from "react-icons/bs";
import { RiProgress2Fill } from "react-icons/ri";
import Chart from "../../Components/Shared/Chart";
import MostSold from "./MostSold";
import { useEffect, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";

//API
import BASE_URL from "../../Utils/config";
import TableDash from "./TableDash";

const Home = () => {
  const [totalSales, setTotalSales] = useState(0);
  const [totalPaid, setTotalPaid] = useState(0);
  const [totalBills, setTotalBills] = useState(0);
  const [totalgrn, setTotalgrn] = useState(0);
  const [billed, setBilled] = useState([]);
  const [filter, setFilter] = useState("day");
  const [composedData, setComposedData] = useState([]);

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

  useEffect(() => {
    const fetchSales = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/transactions/all`, {
          withCredentials: true,
        });

        const allSales = res.data.data;
        const startDate = getStartDate(filter);

        const filteredSales = allSales.filter((tx) =>
          dayjs(tx.createdAt).isAfter(startDate)
        );

        setTotalSales(
          filteredSales.reduce((sum, tx) => sum + tx.totalAmount, 0)
        );

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

        setBilled(filteredSales.filter((tx) => tx.status === "Bill"));
      } catch (error) {
        console.error("Failed to fetch transactions", error);
      }
    };

    fetchSales();
  }, [filter]);

  useEffect(() => {
    const fetchGrn = async () => {
      try {
        const [resPo, resNonPo] = await Promise.all([
          axios.get(`${BASE_URL}/api/grn/allGrnPo`, {
            withCredentials: true,
          }),
          axios.get(`${BASE_URL}/api/grn/nonPo`, {
            withCredentials: true,
          }),
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
      }
    };

    fetchGrn();
  }, [filter]);

  useEffect(() => {
    const fetchComposedData = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/transactions/all`, {
          withCredentials: true,
        });

        const allSales = res.data.data;

        // Get date range: last 3 months from today
        const threeMonthsAgo = dayjs().subtract(3, "month").startOf("month");

        // Prepare structure for weekly data
        // Example: Week 1, Week 2 ... Week 12 (3 months ≈ 12-13 weeks)
        const weeklyTotals = {};

        allSales.forEach((tx) => {
          const txDate = dayjs(tx.createdAt);
          if (txDate.isBefore(threeMonthsAgo)) return;

          // Create a key like "2025-W32"
          const weekKey = `W${txDate.week()}`;

          if (!weeklyTotals[weekKey]) {
            weeklyTotals[weekKey] = {
              name: weekKey,
              sales: 0,
              paid: 0,
              bills: 0,
            };
          }

          weeklyTotals[weekKey].sales += tx.totalAmount;

          if (tx.status === "Paid") {
            weeklyTotals[weekKey].paid += tx.totalAmount;
          } else if (tx.status === "Bill") {
            weeklyTotals[weekKey].bills += tx.totalAmount;
          }
        });

        // Convert object → sorted array for chart
        const sortedWeeklyData = Object.values(weeklyTotals).sort((a, b) => {
          return (
            dayjs(a.name.split("-W")[0]).week(a.name.split("-W")[1]) -
            dayjs(b.name.split("-W")[0]).week(b.name.split("-W")[1])
          );
        });

        setComposedData(sortedWeeklyData);
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
                className={`px-3 py-2 rounded-full text-sm font-semibold shadow-sm transition border
                ${
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
            footerNum={100}
          />
          <CardOne
            title="Paid"
            icon={<BsCashCoin />}
            number={`${totalPaid.toLocaleString()} : TSh`}
            footerNum={paidPercentage}
          />
          <CardOne
            title="Bills"
            icon={<RiProgress2Fill />}
            number={`${totalBills.toLocaleString()} : TSh`}
            footerNum={billsPercentage}
          />
          <CardOne
            title="Manunuzi"
            icon={<RiProgress2Fill />}
            number={`${totalgrn.toLocaleString()} : TSh`}
            footerNum={manunuziPercentage}
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
      <div className="flex-1 md:flex-[1] bg-secondary rounded-xl p-4 sm:p-6 shadow-md text-black overflow-y-auto max-h-[80vh] scrollbar-hide">
        <MostSold />
      </div>
    </section>
  );
};

export default Home;
