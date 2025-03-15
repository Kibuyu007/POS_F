import { FaSearch } from "react-icons/fa";
import OrderList from "./OrderList";

const RecentOrders = () => {
  return (
    <div className="mt-4">
      <div className="bg-glassBlack w-full h-full max-h-[60vh] rounded-lg p-4 flex flex-col">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-4 py-2">
          <h1 className="text-white text-lg font-semibold tracking-wide">
            Recent Orders
          </h1>
          <a href="#" className="text-totallyBlue text-sm font-semibold">
            View All
          </a>
        </div>

        {/* Search Bar */}
        <div className="flex items-center bg-white rounded-[30px] px-4 py-1 w-full max-w-[300px] mx-auto sm:ml-4">
          <FaSearch className="w-5 h-5 mr-2 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search"
            className="bg-transparent outline-none px-2 py-1 w-full text-text"
          />
        </div>

        {/* Orders List with Proper Scroll */}
        <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide px-4 mt-3">
          <OrderList />
          <OrderList />
          <OrderList />
          <OrderList />
          <OrderList />
          <OrderList />
          <OrderList />
        </div>
      </div>
    </div>
  );
};

export default RecentOrders;
