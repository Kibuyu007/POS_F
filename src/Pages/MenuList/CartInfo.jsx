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
    <div className="px-4 py-2 top-2">
      <div className="flex justify-between">
        <h1 className="text-lg text-black font-semibold tracking-wide">
          Cart Details
        </h1>
        <p className="font-bold ">{totalItems} Total Items</p>
      </div>

      <div
        className="mt-4 overflow-y-scroll scrollbar-hide h-[420px]"
        ref={scrolling}
      >
        {cartData.length === 0 ? (
          <p className="text-black flex justify-center items-center h-[380px]">
            <span className="bg-GreenText rounded-md py-3 px-4">
              {" "}
              {totalItems} Total Items
            </span>
          </p>
        ) : (
          cartData.map((items) => (
            <div
              key={items.id}
              className="bg-[#d6d6d6] rounded-lg px-4 py-4 mb-2"
            >
              <div className="flex items-center justify-between">
                <h1 className="text-black font-bold tracking-wide text-xl">
                  {items.name}
                </h1>
                <p className="text-black font-semibold text-2xl bg-orange-600 rounded-full px-3">
                  {items.quantity}
                </p>
              </div>

              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-3">
                  <IoIosRemoveCircle
                    onClick={() => decreaseDishQuantity(items.id)}
                    className="cursor-pointer text-[#262626]"
                    size={20}
                  />

                  <RiDeleteBin5Line
                    onClick={() => removeDish(items.id)}
                    className="cursor-pointer text-[#262626]"
                    size={20}
                  />
                  <FaPlusCircle
                    onClick={() => increaseDishQuantity(items.id)} // Increase quantity functionality
                    className="cursor-pointer text-[#262626]"
                    size={20}
                  />
                </div>
                <p className="text-black font-bold text-2xl bg-green-400/40 px-3 shadow-md py-1 rounded-md">
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
