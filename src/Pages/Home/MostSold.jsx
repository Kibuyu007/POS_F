import { useEffect, useState } from "react";
import axios from "axios";
import BASE_URL from "../../Utils/config";

export default function MostSoldItems() {
  const [mostSold, setMostSold] = useState([]);

  useEffect(() => {
    const fetchMostSold = async () => {
      try {
        const { data } = await axios.get(
          `${BASE_URL}/api/transactions/mostSold`,
          { withCredentials: true }
        );
        setMostSold(data);
      } catch (error) {
        console.error("Error fetching most sold items:", error);
      }
    };

    fetchMostSold();
  }, []);

  // Helper to format totalAmount status
  const getAmountStatus = (amount) => {
    if (amount > 1000000) {
      return (
        <span className="text-black font-semibold bg-green-400 px-2 py-0.5 rounded-full text-xs">
          High
        </span>
      );
    } else if (amount >= 500000 && amount <= 999999) {
      return (
        <span className="text-yellow-600 font-semibold bg-yellow-100 px-2 py-0.5 rounded-full text-xs">
          Medium
        </span>
      );
    } else {
      return (
        <span className="text-gray-600 font-semibold bg-gray-200 px-2 py-0.5 rounded-full text-xs">
          Normal
        </span>
      );
    }
  };

  return (
    <div className="flex flex-col">
      <div className="relative flex flex-col min-w-0 break-words border border-dashed border-stone-400 bg-light/30 rounded-2xl bg-clip-border p-4 sm:p-6 shadow-lg">
        <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight border-b-4 border-gradient-to-r from-green-400 to-blue-500 pb-2 sm:pb-3 mb-4 drop-shadow-sm">
          Most Sold Items{" "}
          <span className="text-green-600 font-semibold italic text-lg sm:text-md">
            (This Month)
          </span>
        </h2>
      </div>

      <div className="mt-4 sm:mt-6">
        {mostSold.length === 0 ? (
          <p className="text-center text-gray-400 italic text-base sm:text-lg mt-8">
            No data available
          </p>
        ) : (
          <div className="flex flex-col gap-3 sm:gap-4">
            {mostSold.map((item) => (
              <div
                key={item._id}
                className="bg-gradient-to-r from-green-50 to-blue-50 rounded-3xl shadow-xl p-4 sm:p-6 flex flex-col justify-between hover:scale-[1.03] transition-transform duration-300 ease-in-out w-full"
              >
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-800 truncate mb-1 sm:mb-2">
                      {item.name || "Unknown Item"}
                    </h3>
                  </div>
                  <div className="mb-3 sm:mb-4">
                    {getAmountStatus(item.totalAmount)}
                  </div>
                </div>

                <div className="flex justify-between items-center text-gray-700 mb-2 sm:mb-3">
                  <span className="text-sm sm:text-md font-medium">
                    Quantity Sold:
                  </span>
                  <span className="font-extrabold text-xl sm:text-2xl text-green-700">
                    {item.totalQuantity.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between items-center text-gray-700">
                  <span className="text-sm sm:text-md font-medium">
                    Total Amount:
                  </span>
                  <span className="font-extrabold text-lg sm:text-xl text-blue-600">
                    {item.totalAmount.toLocaleString()} TSh
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
