import { useEffect, useState } from "react";
import MenuCard from "./MenuCard";
import CartInfo from "./CartInfo";
import CartBill from "./CartBill";
import { FcSalesPerformance } from "react-icons/fc";
import {
  FaShoppingCart,
  FaChevronDown,
  FaChevronUp,
  FaReceipt,
} from "react-icons/fa";

const MenuList = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [refreshMenu, setRefreshMenu] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [showBill, setShowBill] = useState(false);

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
    return `${months[date.getMonth()]} ${String(date.getDate()).padStart(2, "0")}, ${date.getFullYear()}`;
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  };

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="h-[90vh] flex flex-col md:flex-row gap-3 pt-20 sm:pt-24 px-3 sm:px-4 md:px-5 overflow-hidden">
      {/* ==================== LEFT: MENU ITEMS (Products) ==================== */}
      <div className="flex-1 md:flex-[2] lg:flex-[3] bg-secondary rounded-xl p-3 sm:p-4 md:p-5 shadow-md overflow-auto min-h-0 relative">
        {/* Header with Clock */}
        <div className="flex items-center justify-between p-3 sm:p-4 bg-secondary rounded-lg gap-3 mb-4">
          <FcSalesPerformance size={40} className="sm:w-12 sm:h-12" />
          <div className="text-right">
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-black bg-gray-100 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg inline-block">
              {formatTime(currentTime)}
            </h1>
            <p className="text-black text-xs sm:text-sm mt-1">
              {formatDate(currentTime)}
            </p>
          </div>
        </div>

        <MenuCard refreshTrigger={refreshMenu} />

        {/* Mobile: Floating Cart Toggle */}
        <div className="md:hidden fixed bottom-4 right-4 z-40 flex flex-col gap-2">
          <button
            onClick={() => {
              setShowCart(!showCart);
              setShowBill(false);
            }}
            className={`p-4 rounded-full shadow-lg transition-all ${showCart ? "bg-red-500 text-white" : "bg-emerald-500 text-white"}`}
          >
            <FaShoppingCart className="w-6 h-6" />
          </button>
          <button
            onClick={() => {
              setShowBill(!showBill);
              setShowCart(false);
            }}
            className={`p-4 rounded-full shadow-lg transition-all ${showBill ? "bg-red-500 text-white" : "bg-blue-500 text-white"}`}
          >
            <FaReceipt className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* ==================== RIGHT: CART (Checkout) - Desktop Always Visible ==================== */}
      <div className="hidden md:block md:flex-[1] md:min-w-[280px] lg:min-w-[320px] xl:min-w-[360px] bg-secondary rounded-xl p-3 sm:p-4 md:p-5 shadow-md text-black overflow-y-auto min-h-0">
        <div className="bg-white rounded-lg pt-2 h-full md:h-auto">
          <hr className="border-gray-800 border-t-2" />
          <CartInfo />
          <hr className="border-gray-800 border-t-2" />
          <hr className="border-gray-800 border-t-2" />
          <CartBill
            triggerRefreshMenu={() => setRefreshMenu((prev) => !prev)}
          />
        </div>
      </div>

      {/* ==================== MOBILE: SLIDE-UP CART PANEL ==================== */}
      <div
        className={`md:hidden fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.3)] transition-transform duration-300 ${showCart ? "translate-y-0" : "translate-y-full"}`}
      >
        <div className="p-4 max-h-[70vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <FaShoppingCart className="text-emerald-600" />
              Cart Items
            </h3>
            <button
              onClick={() => setShowCart(false)}
              className="p-2 bg-gray-100 rounded-full"
            >
              <FaChevronDown className="w-5 h-5" />
            </button>
          </div>
          <CartInfo />
        </div>
      </div>

      {/* ==================== MOBILE: SLIDE-UP BILL PANEL ==================== */}
      <div
        className={`md:hidden fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.3)] transition-transform duration-300 ${showBill ? "translate-y-0" : "translate-y-full"}`}
      >
        <div className="p-4 max-h-[70vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <FaReceipt className="text-blue-600" />
              Checkout
            </h3>
            <button
              onClick={() => setShowBill(false)}
              className="p-2 bg-gray-100 rounded-full"
            >
              <FaChevronDown className="w-5 h-5" />
            </button>
          </div>
          <CartBill
            triggerRefreshMenu={() => setRefreshMenu((prev) => !prev)}
          />
        </div>
      </div>

      {/* Mobile Backdrop */}
      {(showCart || showBill) && (
        <div
          className="md:hidden fixed inset-0 bg-black/30 z-40"
          onClick={() => {
            setShowCart(false);
            setShowBill(false);
          }}
        />
      )}
    </section>
  );
};

export default MenuList;
