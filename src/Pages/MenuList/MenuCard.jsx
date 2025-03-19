import { useState } from "react";
import { menus } from "../../Constants/IndexDishes";
import { GrRadialSelected } from "react-icons/gr";
import { useDispatch } from "react-redux";
import { addItems } from "../../Redux/cartSlice";

const MenuCard = () => {
  const [selected, setSelected] = useState(menus[0]);

  //dispacth
  const dispatch = useDispatch();

  // DISH COUNT
  const [dishCount, setDishCount] = useState(0);
  const [itemId, setItemId] = useState();

  const increment = (id) => {
    setItemId(id);
    if (dishCount >= 10) return;
    setDishCount((prev) => prev + 1);
  };

  const decrement = (id) => {
    setItemId(id);
    if (dishCount <= 0) return;
    setDishCount((prev) => prev - 1);
  };
  //

  //ADD CART
  const handleAddCart = (item) => {
    if (dishCount === 0) return;

    const { id, name, price } = item;
    const newObj = {
      id,
      name,
      pricePerQuantity: price,
      quantity: dishCount,
      totalPrice: price * dishCount,
    };

    dispatch(addItems(newObj));
    setDishCount(0);
  };

  return (
    <>
      <div className="grid grid-cols-4 gap-4  py-4 w-[100%] overflow-y-auto md:max-h-[23vh] lg:max-h-[29vh] scrollbar-hide">
        {menus.map((menu) => (
          <div
            key={menu.id}
            className={`flex flex-col items-start justify-between shadow-md p-4 rounded-lg min-w-[150px] cursor-pointer ${
              selected?.id === menu.id
                ? "bg-green-400/40 text-white"
                : "bg-gray-200"
            }`}
            onClick={() => {
              setSelected(menu);
              setItemId();
              setDishCount(0);
            }}
          >
            <div className="flex items-center justify-between w-full ">
              <h1 className="text-black text-2xl font-bold">{menu.name}</h1>
              {selected?.id === menu.id && (
                <GrRadialSelected className="text-black " size={20} />
              )}
            </div>
            <p className="text-black text-md font-semibold">
              {menu.item?.length || 0} Items
            </p>
          </div>
        ))}
      </div>

      <hr className="border-[#2a2a2a] border-t-2 mt-4" />

      <div className="grid grid-cols-4 gap-4 py-4 w-[100%]">
        {selected?.item.map((item) => (
          <div
            key={item.id}
            className="flex flex-col items-center justify-between cursor-pointer"
          >
            <div className="mx-auto mt-2 w-80 lg:w-70 transform overflow-hidden rounded-lg bg-white dark:bg-slate-800 shadow-md duration-300 hover:scale-105 hover:shadow-lg">
              <img
                className="h-44 w-full object-cover object-center"
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSHCk_XZtyNO1LtOcVGYv3ajJpw6jBnP7GKeg&s"
                alt="Product Image"
              />
              <div className="p-4">
                <h2 className="mb-2 text-lg font-medium dark:text-white text-gray-900">
                  {item.name}
                </h2>

                <div className="flex items-center">
                  <p className="mr-2 text-lg font-semibold text-gray-900 dark:text-white">
                    Tsh: {item.price} /=
                  </p>
                  <p className="text-base  font-medium text-gray-500 line-through dark:text-gray-300">
                    $25.00
                  </p>
                  <p className="ml-auto text-base font-medium text-green-500">
                    20% off
                  </p>
                </div>
                <div className="flex justify-between items-center mt-3">
                  <div className="flex items-center bg-gray-200 px-3 py-2 rounded-lg">
                    <button
                      onClick={() => decrement(item.id)}
                      className="text-black font-bold text-2xl px-2"
                    >
                      &minus;
                    </button>
                    <span className="text-black font-bold text-lg mx-3">
                      {item.id === itemId ? dishCount : "0"}
                    </span>
                    <button
                      onClick={() => increment(item.id)}
                      className="text-black font-bold text-2xl px-2"
                    >
                      &#43;
                    </button>
                  </div>

                  <button
                    onClick={() => handleAddCart(item)}
                    className="bg-green-500 hover:bg-green-600 text-white font-semibold px-4 py-2 rounded-md ml-4"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default MenuCard;
