import CardOne from "./CardOne";
import ShiftDetails from "./ShiftDetails";
import { BsCashCoin } from "react-icons/bs";
import { RiProgress2Fill } from "react-icons/ri";
import Chart from "../../Components/Shared/Chart";
import MostSold from "./MostSold";

const Home = () => {
  return (
    <section className="h-[90vh] flex flex-col md:flex-row gap-3 pt-24 px-2 sm:px-4 md:px-6 lg:px-8 xl:px-12 overflow-hidden ">
      
      {/* Right Section */}
      <div className="flex-[3] bg-secondary rounded-xl p-4 sm:p-6 shadow-md overflow-auto  min-h-[50vh] md:min-h-[auto]">
        <ShiftDetails />

        {/* Cards - Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3 mt-4 ">
          <CardOne title="Card One 1" icon={<BsCashCoin />} number={512} footerNum={1.6} />
          <CardOne title="Card One 2" icon={<RiProgress2Fill />} number={16} footerNum={3.6} />
          <CardOne title="Card One 3" icon={<RiProgress2Fill />} number={16} footerNum={3.6} />
          <CardOne title="Card One 4" icon={<RiProgress2Fill />} number={16} footerNum={3.6} />
        </div>

        {/* Charts Section */}
        <Chart />
      </div>

      {/* Left Section */}
      <div 
        className="flex-[1] bg-secondary rounded-xl p-4 sm:p-6 shadow-md text-black w-full md:w-auto overflow-y-auto max-h-[80vh] md:max-h-[120vh] scrollbar-hide">
        <MostSold />
      </div>

    </section>
  );
};

export default Home;
