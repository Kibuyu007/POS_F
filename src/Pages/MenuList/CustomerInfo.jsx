import { useEffect, useState } from "react";
import { useSelector } from "react-redux"
import { useLocation } from "react-router-dom";


const CustomerInfo = () => {

  const customerData = useSelector(state => state.order)

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const tableNumber = searchParams.get("table") || "Unknown";


  //TIME  ######################################################


   const [currentTime, setCurrentTime] = useState(new Date());
   // Function to format the date
    const formatDate = (date) => {
      const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December",
      ];
      return `${months[date.getMonth()]} ${String(date.getDate()).padStart(2, "0")}, ${date.getFullYear()}`;
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

    //#########################################################

  return (
    <div className="flex items-center justify-between px-4 py-3 top-2">
    <div className="flex flex-col items-start">
      <h1 className="text-md text-black font-semibold tracking-wide">
        {customerData.customerName || "Customer Name"}
      </h1>
      <p className="text-xs text-black font-medium mt-1">
        Table Number {tableNumber || "#"}
      </p>
      <p className="text-xs text-black font-medium mt-2">
        {formatDate(currentTime)}, {formatTime(currentTime)}
      </p>
    </div>
    <button className="bg-GreenText p-3 text-xl text-black font-bold rounded-lg py-4 px-6">
      {customerData.orderID || "N/A"}
    </button>
  </div>
  )
}

export default CustomerInfo