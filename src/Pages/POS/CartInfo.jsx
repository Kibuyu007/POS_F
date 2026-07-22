// components/CartInfo.jsx
import { FaPlusCircle } from "react-icons/fa";
import { RiDeleteBin5Line } from "react-icons/ri";
import { IoIosRemoveCircle } from "react-icons/io";

import { useDispatch, useSelector } from "react-redux";
import {
  removeItems,
  increaseQuantity,
  decreaseQuantity,
  updateItemDiscount,
} from "../../Redux/cartSlice";
import { useEffect, useRef } from "react";

const CartInfo = () => {
  const cartData = useSelector((state) => state.cart.cart);
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

  // Remove Item Functionality - FIXED: pass proper object
  const removeDish = (item) => {
    dispatch(
      removeItems({
        id: item.id,
        priceType: item.priceType,
        orderId: item.orderId,
      }),
    );
  };

  // Increase Quantity Functionality - FIXED: pass proper object
  const increaseDishQuantity = (item) => {
    dispatch(
      increaseQuantity({
        id: item.id,
        priceType: item.priceType,
        orderId: item.orderId,
      }),
    );
  };

  // Decrease Quantity Functionality - FIXED: pass proper object
  const decreaseDishQuantity = (item) => {
    dispatch(
      decreaseQuantity({
        id: item.id,
        priceType: item.priceType,
        orderId: item.orderId,
      }),
    );
  };

  const handleDiscountChange = (item, value) => {
    // Remove commas and any non-numeric characters except decimal point
    const rawValue = value.replace(/[^0-9.]/g, "");
    const numericValue = rawValue === "" ? 0 : parseFloat(rawValue);
    if (isNaN(numericValue)) return;
    dispatch(
      updateItemDiscount({
        id: item.id,
        discount: numericValue,
        priceType: item.priceType,
        orderId: item.orderId,
      }),
    );
  };

  return (
    <div className="py-4 top-2">
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
          cartData.map((item) => (
            <div
              key={`${item.id}_${item.priceType || "Retail"}_${item.orderId || "regular"}`}
              className="bg-gray-100 rounded-xl shadow-sm p-4 hover:shadow-md transition-all"
            >
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-semibold text-gray-800 truncate">
                  {item.name}
                </h2>
                <span className="text-sm bg-orange-500 text-white rounded-full px-3 py-1 font-semibold">
                  Qty: {item.quantity}
                </span>
              </div>

              {/* Discount Input Row */}
              <div className="flex justify-between items-center mt-1 mb-2">
                <label className="text-sm text-gray-600 font-medium">
                  Discount
                </label>
                <input
                  type="text"
                  value={
                    item.discount > 0
                      ? item.discount.toLocaleString("en-US")
                      : ""
                  }
                  onChange={(e) => handleDiscountChange(item, e.target.value)}
                  className="w-24 text-center border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                  placeholder={`Max ${(item.totalPrice * 0.15).toLocaleString()}`}
                />
              </div>

              <div className="flex justify-between items-center">
                <div className="flex gap-4 text-gray-700">
                  <IoIosRemoveCircle
                    onClick={() => decreaseDishQuantity(item)}
                    className={`cursor-pointer hover:text-red-600 ${item.quantity <= 1 ? "opacity-40 cursor-not-allowed" : ""}`}
                    size={22}
                  />
                  <RiDeleteBin5Line
                    onClick={() => removeDish(item)}
                    className="cursor-pointer hover:text-red-600"
                    size={20}
                  />
                  <FaPlusCircle
                    onClick={() => increaseDishQuantity(item)}
                    className={`cursor-pointer hover:text-green-600 ${item.quantity >= item.itemQuantity ? "opacity-40 cursor-not-allowed" : ""}`}
                    size={22}
                  />
                </div>
                <p className="text-lg font-bold text-green-700 bg-green-200 rounded-md px-3 py-1 shadow-sm">
                  {new Intl.NumberFormat("en-US").format(item.totalPrice)} Tsh
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
