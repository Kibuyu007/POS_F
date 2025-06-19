import { FaPlusCircle } from "react-icons/fa";
import { RiDeleteBin5Line } from "react-icons/ri";
import { IoIosRemoveCircle } from "react-icons/io";

import { useDispatch, useSelector } from "react-redux";
import {
  removeItems,
  increaseQuantity,
  decreaseQuantity,
} from "../../Redux/cartSlice";
import { useEffect, useRef } from "react";

const CartInfo = () => {
  const cartData = useSelector((state) => state.cart.cart);

  // Dispatch
  const dispatch = useDispatch();

  const totalItems = cartData.length;

  // Scrolling
  const scrolling = useRef();

  useEffect(() => {
    if (scrolling.current) {
      scrolling.current.scrollTo({
        top: scrolling.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [cartData]);

  // Remove Item Functionality
  const removeDish = (itemID) => {
    dispatch(removeItems(itemID));
  };

  // Increase Quantity Functionality
  const increaseDishQuantity = (itemID) => {
    dispatch(increaseQuantity(itemID));
  };

  // Increase Quantity Functionality
  const decreaseDishQuantity = (itemID) => {
    dispatch(decreaseQuantity(itemID));
  };

  return (
    <div className=" py-4 top-2">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Cart Details</h1>
        <span className="text-md font-semibold text-gray-600">
          {totalItems} Total Item{totalItems > 1 ? "s" : ""}
        </span>
      </div>

      <div
        className="space-y-4 overflow-y-auto scrollbar-hide h-[420px] bg-white rounded-xl p-2 shadow-inner"
        ref={scrolling}
      >
        {cartData.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500 font-medium text-lg">
            <span className="bg-green-200 px-4 py-2 rounded-md">
              No items in cart
            </span>
          </div>
        ) : (
          cartData.map((items) => (
            <div
              key={items.id}
              className="bg-gray-100 rounded-xl shadow-sm p-4 hover:shadow-md transition-all"
            >
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-semibold text-gray-800 truncate">
                  {items.name}
                </h2>
                <span className="text-sm bg-orange-500 text-white rounded-full px-3 py-1 font-semibold">
                  Qty: {items.quantity}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex gap-4 text-gray-700">
                  <IoIosRemoveCircle
                    onClick={() => decreaseDishQuantity(items.id)}
                    className="cursor-pointer hover:text-red-600"
                    size={22}
                  />
                  <RiDeleteBin5Line
                    onClick={() => removeDish(items.id)}
                    className="cursor-pointer hover:text-red-600"
                    size={20}
                  />
                  <FaPlusCircle
                    onClick={() => increaseDishQuantity(items.id)}
                    className="cursor-pointer hover:text-green-600"
                    size={22}
                  />
                </div>
                <p className="text-lg font-bold text-green-700 bg-green-200 rounded-md px-3 py-1 shadow-sm">
                  {new Intl.NumberFormat("en-US").format(items.totalPrice)} Tsh
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CartInfo;
