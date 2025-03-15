import { useState } from "react";
import TableCard from "./TableCard";
import { table } from "../../Constants/IndexDishes"; // Import your table data

const Tables = () => {
  const [activeButton, setActiveButton] = useState("All");
  const buttons = ["All", "Available", "Booked", "Closed Table"];

  // Filtering tables based on active button selection
  const filteredTables = table.filter((t) => {
    if (activeButton === "All") return true;
    if (activeButton === "Available") return t.status.toLowerCase() === "available";
    if (activeButton === "Booked") return t.status.toLowerCase() === "booked";
    if (activeButton === "Closed Table") return t.status.toLowerCase() === "closed";
    return false;
  });

  return (
    <div className="h-[90vh] flex flex-col gap-3 pt-24 px-2 sm:px-4 md:px-6 lg:px-8 xl:px-12 overflow-hidden">
      <section className="bg-secondary rounded-lg h-full w-full gap-3 pt-10 px-3 sm:px-6 lg:px-10">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-center justify-between px-3 sm:px-10 py-3">
          <h1 className="text-black text-lg sm:text-2xl md:text-3xl font-bold tracking-wider">
            Tables
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

        {/* Order Cards Grid */}
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6 overflow-y-auto max-h-screen md:max-h-[75vh] lg:max-h-[88vh] scrollbar-hide">
          {filteredTables.length > 0 ? (
            filteredTables.map((t) => (
              <TableCard 
                key={t.id} 
                index={t.id} 
                status={t.status.toLowerCase()} 
                name={t.name} 
                initial={t.initial} 
              />
            ))
          ) : (
            <p className="text-center text-gray-500 text-lg col-span-full">No tables found</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default Tables;
