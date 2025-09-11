import { useEffect, useState } from "react";
import MenuCard from "./MenuCard";
// import CustomerInfo from "./CustomerInfo";
import CartInfo from "./CartInfo";
import CartBill from "./CartBill";
import { FcSalesPerformance } from "react-icons/fc";

const MenuList = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [refreshMenu, setRefreshMenu] = useState(false);

  // Function to format the date
  const formatDate = (date) => {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return `${months[date.getMonth()]} ${String(date.getDate()).padStart(
      2,
      "0"
    )}, ${date.getFullYear()}`;
  };

  // Function to format the time (hh:mm:ss)
  const formatTime = (date) => {
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  };

  // Update the time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="h-[90vh] flex flex-col md:flex-row gap-3 pt-24 px-2 sm:px-4 md:px-6 lg:px-8 xl:px-12 overflow-hidden">


      
      {/* Right Section ################################################*/}
      <div className="flex-1 md:flex-[3] sm:flex-[2] bg-secondary rounded-xl p-4 sm:p-6 shadow-md overflow-auto min-h-[50vh] md:min-h-[auto]">
        {/* Display Table Number */}
        <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-secondary rounded-lg  w-full sm:w-auto gap-2 sm:gap-4">
          <FcSalesPerformance size={50} />
          <div className="text-center w-full sm:w-auto">
            <h1 className="text-xl sm:text-2xl font-bold text-black bg-greyBackg px-4 py-2 rounded-lg">
              {formatTime(currentTime)}
            </h1>
            <p className="text-black text-sm sm:text-base">
              {formatDate(currentTime)}
            </p>
          </div>
        </div>

        {/* Cards - Responsive Grid */}
        <MenuCard refreshTrigger={refreshMenu}/>
      </div>





      {/* Left Section  ####################################################### */}
      <div className="flex-[1] bg-secondary rounded-xl p-4 sm:p-6 shadow-md text-black w-full md:w-auto overflow-y-auto max-h-[60vh] md:max-h-[100vh] scrollbar-hide">
        <div className="flex-[1] bg-white mt-4 mr-3 h-[680px] rounded-lg pt-2">
          {/* Customer Info */}
          {/* <CustomerInfo /> */}

          <hr className="border-[#2a2a2a] border-t-2" />

          {/* Cart Items */}
          <CartInfo />

          <hr className="border-[#2a2a2a] border-t-2" />
          <hr className="border-[#2a2a2a] border-t-2" />

          {/* Bills */}
          <CartBill
            triggerRefreshMenu={() => setRefreshMenu((prev) => !prev)}
          />
        </div>
      </div>
    </section>
  );
};

export default MenuList;
