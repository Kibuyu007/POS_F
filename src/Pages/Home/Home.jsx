import CardOne from "./CardOne";
import ShiftDetails from "./ShiftDetails";
import { BsCashCoin } from "react-icons/bs";
import { RiProgress2Fill } from "react-icons/ri";
import Chart from "../../Components/Shared/Chart";
import MostSold from "./MostSold";
import { useEffect, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";

const Home = () => {
  const [totalSales, setTotalSales] = useState(0);
  const [totalPaid, setTotalPaid] = useState(0);
  const [totalBills, setTotalBills] = useState(0);
  const [totalgrn, setTotalgrn] = useState(0);
  const [billed,setBilled] = useState([]);

  useEffect(() => {
    const fetchSales = async () => {
      try {
        const res = await axios.get(
          "http://localhost:4004/api/transactions/all",
          {
            withCredentials: true,
          }
        );

        const allSales = res.data.data;

        // Get today's date in YYYY-MM-DD format
        const today = dayjs().format("YYYY-MM-DD");

        // Filter only today's sales
        const todaySales = allSales.filter(
          (tx) => dayjs(tx.createdAt).format("YYYY-MM-DD") === today
        );

        // Total sales
        const total = todaySales.reduce((sum, tx) => sum + tx.totalAmount, 0);
        setTotalSales(total);

        // Total paid
        const paid = todaySales
          .filter((tx) => tx.status === "Paid")
          .reduce((sum, tx) => sum + tx.totalAmount, 0);
        setTotalPaid(paid);

        // Total bills
        const bills = todaySales
          .filter((tx) => tx.status === "Bill")
          .reduce((sum, tx) => sum + tx.totalAmount, 0);
        setTotalBills(bills);

        const billTransactions = allSales.filter(
          (tx) => tx.status === "Bill"
        );
        setBilled(billTransactions)
      } catch (error) {
        console.error("Failed to fetch transactions", error);
      }
    };

    fetchSales();
  }, []);

  useEffect(() => {
    const fetchgrn = async () => {
      try {
        const today = dayjs().format("YYYY-MM-DD");

        const [resPo, resNonPo] = await Promise.all([
          axios.get("http://localhost:4004/api/grn/allGrnPo", {
            withCredentials: true,
          }),
          axios.get("http://localhost:4004/api/grn/nonPo", {
            withCredentials: true,
          }),
        ]);

        const allPo = resPo.data?.data || [];
        const allNonPo = resNonPo.data?.data || [];

        // 🔐 Safely calculate today's total for PO
        const todayPoCost = allPo
          .filter((grn) => dayjs(grn.createdAt).format("YYYY-MM-DD") === today)
          .reduce((total, grn) => {
            const items = Array.isArray(grn.items) ? grn.items : [];
            const grnTotal = items.reduce((sum, item) => {
              const cost = parseFloat(item?.totalCost) || 0;
              return sum + cost;
            }, 0);
            return total + grnTotal;
          }, 0);

        // 🔐 Safely calculate today's total for non-PO
        const todayNonPoCost = allNonPo
          .filter((grn) => dayjs(grn.createdAt).format("YYYY-MM-DD") === today)
          .reduce((total, grn) => {
            const items = Array.isArray(grn.allItems) ? grn.allItems : [];
            const grnTotal = items.reduce((sum, item) => {
              const cost = parseFloat(item?.totalCost) || 0;
              return sum + cost;
            }, 0);
            return total + grnTotal;
          }, 0);

        setTotalgrn(todayPoCost + todayNonPoCost);
        console.log("Total GRN cost for today:", todayPoCost + todayNonPoCost);
      } catch (error) {
        console.error("Failed to fetch GRNs:", error);
      }
    };

    fetchgrn();
  }, []);

  const paidPercentage =
    totalSales > 0 ? ((totalPaid / totalSales) * 100).toFixed(1) : 0;
  const billsPercentage =
    totalSales > 0 ? ((totalBills / totalSales) * 100).toFixed(1) : 0;

  const manunuziPercentage =
    totalSales > 0 ? ((totalSales / totalgrn) * 100).toFixed(1) : 0;

  return (
    <section className="h-[90vh] flex flex-col md:flex-row gap-3 pt-24 px-2 sm:px-4 md:px-6 lg:px-8 xl:px-12 overflow-hidden ">
      {/* Right Section */}
      <div className="flex-[3] bg-secondary rounded-xl p-4 sm:p-6 shadow-md overflow-auto min-h-[50vh] md:min-h-[auto]">
        <ShiftDetails />

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3 mt-4 ">
          <CardOne
            title="Sales Today"
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

        {/* Charts Section */}
        <Chart
          totalSales={totalSales}
          totalPaid={totalPaid}
          totalBills={totalBills}
          totalManunuzi={totalgrn}
        />
      </div>

      {/* Left Section */}
      <div className="flex-[1] bg-secondary rounded-xl p-4 sm:p-6 shadow-md text-black w-full md:w-auto overflow-y-auto max-h-[80vh] md:max-h-[120vh] scrollbar-hide">
        <MostSold list={billed}/>
      </div>
    </section>
  );
};

export default Home;
