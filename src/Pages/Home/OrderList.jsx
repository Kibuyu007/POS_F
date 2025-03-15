import { TbProgressCheck } from "react-icons/tb";
import { RiProgress8Line } from "react-icons/ri";
import OrderCard from "../Orders/OrderCard";

const OrderList = () => {


    const orders = [
        { id: 101, status: "In Progress", total: 25.99, items: [{ name: "Burger", quantity: 2 }] },
        { id: 102, status: "Completed", total: 15.49, items: [{ name: "Pizza", quantity: 1 }] },
        { id: 103, status: "Ready", total: 32.99, items: [{ name: "Pasta", quantity: 3 }] },
      ];
      
  return (
    <div className="flex items-center gap-4 mt-4 px-3 py-2 flex-wrap sm:flex-nowrap bg-black rounded-[8px]">
      {/* Status Button */}
      <button className="bg-GreenText p-3 text-xl font-bold rounded-lg">EM</button>

      {/* Order Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full ">
        {/* Customer Info */}
        <div className="flex flex-col items-start gap-2">
          <h1 className="text-white text-lg font-semibold tracking-wide">
            Name Customer
          </h1>
          <p className="text-[#ababab] text-sm">5 Items</p>
        </div>

        {/* Table Number */}
        <div className="mt-2 sm:mt-0">
          <h1 className="text-white font-semibold border border-GreenText rounded-[40px] px-4 py-1 text-center">
            Table No: 05
          </h1>
        </div>

        {/* Status Info */}
        <div className="flex flex-col items-start sm:items-end gap-2 mt-2 sm:mt-0">
          <p className="text-GreenText px-4">
            <TbProgressCheck className="inline mr-2" /> Ready
          </p>
          <p className="text-[#ababab]">
            <RiProgress8Line className="inline mr-2 text-GreenText" /> Ready to Save
          </p>
        </div>
      </div>

      <section className="h-screen pt-24 px-4">
      <h1 className="text-black text-2xl font-bold mb-4">Orders</h1>
      <div className="flex flex-wrap gap-4">
        {orders.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
      </div>
    </section>
    </div>

    
  );
};

export default OrderList;
