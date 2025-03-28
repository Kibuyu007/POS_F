import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { GrRadialSelected } from "react-icons/gr";
import { useDispatch } from "react-redux";
import { addItems } from "../../Redux/cartSlice";

const MenuCard = () => {
  const [categories, setCategories] = useState([]);
  const [selected, setSelected] = useState(null);
  const [items, setItems] = useState([]);
  const [itemCounts, setItemCounts] = useState({}); // Track item quantities individually
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await axios.get(
          "http://localhost:4004/api/itemsCategories/getItemCategories"
        );

        if (data.success) {
          const categoriesWithItemCount = await Promise.all(
            data.data.map(async (category) => {
              const itemCount = await axios.get(
                `http://localhost:4004/api/items/getAllItems?category=${category._id}`
              );
              return {
                ...category,
                itemCount: itemCount.data.success
                  ? itemCount.data.totalItems
                  : 0,
              };
            })
          );
          setCategories(categoriesWithItemCount);
          if (categoriesWithItemCount.length > 0) {
            setSelected(categoriesWithItemCount[0]);
            fetchItems(categoriesWithItemCount[0]._id);
          }
        } else {
          console.error("Invalid categories response:", data);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const fetchItems = useCallback(async (categoryId) => {
    try {
      const { data } = await axios.get(
        `http://localhost:4004/api/items/getAllItems?category=${categoryId}`
      );

      if (data.success) {
        setItems(data.data);
        const initialItemCounts = {};
        data.data.forEach((item) => {
          initialItemCounts[item._id] = 1; // Default quantity to 1
        });
        setItemCounts(initialItemCounts);
      } else {
        console.error("Invalid items response:", data);
      }
    } catch (error) {
      console.error("Error fetching items:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Formatting Price
  const formatPriceWithCommas = (price) => {
    return new Intl.NumberFormat("en-US").format(price);
  };

  // Handle quantity change
  const handleQuantityChange = (itemId, value) => {
    setItemCounts((prevCounts) => ({
      ...prevCounts,
      [itemId]: Math.max(0, value), // Ensure at least 1 item is selected
    }));
  };

  // Add item to cart
  const handleAddCart = (item) => {
    const quantity = itemCounts[item._id] || 1;

    if (quantity <= 0 || item.itemQuantity <= 0) return;

    const newObj = {
      id: item._id,
      name: item.name,
      pricePerQuantity: item.price,
      quantity: quantity,
      totalPrice: item.price * quantity,
    };

    dispatch(addItems(newObj));
  };

  return (
    <>
      {isLoading && (
        <div className="flex justify-center items-center w-full h-screen bg-white">
          <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-green-500 border-solid"></div>
        </div>
      )}

      {/* Categories */}
      <div className="grid grid-cols-4 gap-4 py-4 w-full overflow-y-auto md:max-h-[23vh] lg:max-h-[29vh] scrollbar-hide">
        {categories.map((category) => (
          <div
            key={category._id}
            className={`flex flex-col items-start justify-between shadow-md p-4 rounded-lg min-w-[150px] cursor-pointer ${
              selected?._id === category._id
                ? "bg-green-400/40 text-white"
                : "bg-gray-200"
            }`}
            onClick={() => {
              setSelected(category);
              fetchItems(category._id);
            }}
          >
            <div className="flex items-center justify-between w-full">
              <h1 className="text-black text-2xl font-bold">{category.name}</h1>
              {selected?._id === category._id && (
                <GrRadialSelected className="text-black" size={20} />
              )}
            </div>
            <p className="text-black text-md font-semibold">
              {category.itemCount || 0} Items
            </p>
          </div>
        ))}
      </div>

      <hr className="border-[#2a2a2a] border-t-2 mt-4" />

      {/* Items */}
      <div className="grid grid-cols-4 gap-4 py-4 w-full">
        {items.map((item) => (
          <div
            key={item._id}
            className="flex flex-col items-center justify-between cursor-pointer"
          >
            <div className="mx-auto mt-2 w-80 lg:w-70 transform overflow-hidden rounded-lg bg-white dark:bg-slate-800 shadow-md duration-300 hover:scale-105 hover:shadow-lg">
              <img
                className="h-44 w-full object-cover object-center"
                src={item.image || "https://via.placeholder.com/150"}
                alt={item.name}
              />
              <div className="p-4">
                <h2 className="mb-2 text-lg font-medium dark:text-white text-gray-900">
                  {item.name} ({item.itemQuantity} available)
                </h2>

                <div className="flex items-center">
                  <p className="mr-2 text-lg font-semibold text-gray-900 dark:text-white">
                    Tsh: {formatPriceWithCommas(item.price)} /=
                  </p>
                </div>

                <div className="flex items-center justify-between mt-3">
                  <input
                    type="number"
                    value={itemCounts[item._id] || 0}
                    onChange={(e) =>
                      handleQuantityChange(item._id, parseInt(e.target.value))
                    }
                    className="w-16 border px-2 py-1 rounded-md text-center"
                    min="1"
                  />

                  <button
                    onClick={() => handleAddCart(item)}
                    className="ml-2 bg-green-500 hover:bg-green-600 text-white font-semibold px-4 py-2 rounded-md"
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
