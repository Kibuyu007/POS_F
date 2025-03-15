import { RiProgress8Line } from "react-icons/ri";
import { TbProgressCheck } from "react-icons/tb";

const OrderCard = () => {
  return (
    <div className="bg-black p-6 rounded-lg w-full max-w-lg mx-auto md:max-w-xl lg:max-w-2xl xl:max-w-3xl">
      <div className="flex flex-col sm:flex-row items-center gap-5 mb-3">
        <button className="bg-[#f6b100] p-3 text-xl font-bold rounded-lg w-12 h-12 flex items-center justify-center">
          AM
        </button>
        <div className="flex flex-col sm:flex-row justify-between w-full gap-4">
          <div className="flex flex-col items-start gap-1">
            <h1 className="text-[#f5f5f5] text-lg font-semibold tracking-wide">Amrit Raj</h1>
            <p className="text-[#ababab] text-sm">#101 / Dine in</p>
          </div>
          <div className="flex flex-col sm:items-end gap-2">
            <p className="text-green-600 px-4 flex items-center">
              <TbProgressCheck className="inline mr-2" /> Ready
            </p>
            <p className="text-[#ababab] text-sm flex items-center">
              <RiProgress8Line className="inline mr-2 text-green-600" /> Ready to serve
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mt-4 text-[#ababab] text-sm sm:text-base">
        <p>January 18, 2025 08:32 PM</p>
        <p>8 Items</p>
      </div>

      <hr className="w-full mt-4 border-t border-gray-500" />

      <div className="flex justify-between items-center mt-4">
        <h1 className="text-white text-lg font-bold">Total</h1>
        <p className="text-[#f5f5f5] text-lg font-semibold">$250.00</p>
      </div>
    </div>
  );
};

export default OrderCard;
