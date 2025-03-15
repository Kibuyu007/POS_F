import { useState, useEffect } from "react";

const ShiftDetails = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Function to determine the shift based on the current hour
  const getShift = (hour) => {
    if (hour >= 6 && hour < 12) return "Morning Shift";
    if (hour >= 12 && hour < 17) return "Afternoon Shift";
    if (hour >= 17 && hour < 19) return "Evening Shift";
    return "Night Shift";
  };

  // Function to format the date
  const formatDate = (date) => {
    const months = [
      "January", "February", "March", "April", "May", "June", "July",
      "August", "September", "October", "November", "December"
    ];
    return `${months[date.getMonth()]} ${String(date.getDate()).padStart(2, '0')}, ${date.getFullYear()}`;
  };

  // Function to format the time (hh:mm:ss)
  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  };

  // Update the time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-secondary rounded-lg shadow-md w-full sm:w-auto gap-2 sm:gap-4">
      
      {/* Shift Name & Date */}
      <div className="text-center sm:text-left w-full sm:w-auto">
        <h1 className="text-lg sm:text-xl font-bold text-textPrimary">{getShift(currentTime.getHours())}</h1>
        <p className="text-textSecondary text-sm sm:text-base">{formatDate(currentTime)}</p>
      </div>

      {/* Current Time */}
      <div className="text-center w-full sm:w-auto">
        <h1 className="text-xl sm:text-2xl font-bold text-black bg-greyBackg px-4 py-2 rounded-lg">
          {formatTime(currentTime)}
        </h1>
      </div>
    </div>
  );
};

export default ShiftDetails;
