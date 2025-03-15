import { useState } from "react";
import OrderCard from "./OrderCard";

const Orders = () => {
  const [activeButton, setActiveButton] = useState("All");
  const buttons = ["All", "In Progress", "Ready", "Completed"];

  return (
    <div className="h-[90vh] flex flex-col gap-3 pt-24 px-2 sm:px-4 md:px-6 lg:px-8 xl:px-12 overflow-hidden">
      <section className="bg-secondary rounded-lg h-full w-full gap-3 pt-10 px-3 sm:px-6 lg:px-10">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-center justify-between px-3 sm:px-10 py-3">
          <h1 className="text-black text-lg sm:text-2xl md:text-3xl font-bold tracking-wider">
            Orders
          </h1>
          <div className="flex flex-wrap xs:flex-nowrap items-center justify-center gap-2 xs:gap-3 sm:gap-4">
            {buttons.map((btn) => (
              <button
                key={btn}
                onClick={() => setActiveButton(btn)}
                className={`text-sm xs:text-base sm:text-lg rounded-lg px-3 sm:px-5 py-2 font-semibold transition-all duration-300 ${
                  activeButton === btn
                    ? "bg-[#383838] text-white"
                    : "text-black bg-transparent hover:bg-gray-200"
                }`}
              >
                {btn}
              </button>
            ))}
          </div>
        </div>

        {/* Order Cards Grid with Scrolling */}
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6 overflow-y-auto max-h-[70vh] md:max-h-[75vh] lg:max-h-[88vh] scrollbar-hide">
          {[...Array(30)].map((_, index) => (
            <OrderCard key={index} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default Orders;
