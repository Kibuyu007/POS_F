import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { GrRadialSelected } from "react-icons/gr";
import { useDispatch } from "react-redux";
import { addItems } from "../../Redux/cartSlice";

const MenuCard = () => {
  const [categories, setCategories] = useState([]);
  const [selected, setSelected] = useState(null);
  const [items, setItems] = useState([]);
  const [productCount, setProductCount] = useState(0);
  const [itemId, setItemId] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Loading state
  const dispatch = useDispatch();

  // Fetch categories and items from backend using useEffect
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await axios.get(
          "http://localhost:4004/api/itemsCategories/getItemCategories"
        );

        if (data.success) {
          // For each category, fetch the item count and add it to the category
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
            setSelected(categoriesWithItemCount[0]); // Select the first category
            fetchItems(categoriesWithItemCount[0]._id); // Fetch items for the first category
          }
        } else {
          console.error("Invalid categories response:", data);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setIsLoading(false); // Set loading state to false after fetching
      }
    };

    fetchCategories();
  }, []);

  // Fetch items for the selected category using useCallback to avoid re-fetching
  const fetchItems = useCallback(async (categoryId) => {
    // hapa tuta set loading baadae tukiona chenga
    try {
      const { data } = await axios.get(
        `http://localhost:4004/api/items/getAllItems?category=${categoryId}`
      );

      if (data.success) {
        setItems(data.data);
      } else {
        console.error("Invalid items response:", data);
      }
    } catch (error) {
      console.error("Error fetching items:", error);
    } finally {
      setIsLoading(false); // Set loading state to false after fetching
    }
  }, []);

  // Increment item count
  const increment = (id) => {
    setItemId(id);
    if (productCount >= 10) return;
    setProductCount((prev) => prev + 1);
  };

  // Decrement item count
  const decrement = (id) => {
    setItemId(id);
    if (productCount <= 0) return;
    setProductCount((prev) => prev - 1);
  };

  // Add item to cart
  const handleAddCart = (item) => {
    if (productCount === 0) return;

    const { _id, name, price } = item;
    const newObj = {
      id: _id,
      name,
      pricePerQuantity: price,
      quantity: productCount,
      totalPrice: price * productCount,
    };

    dispatch(addItems(newObj));
    setProductCount(0);
  };

  return (
    <>
      {/* Loading Spinner */}
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
              setItemId(null);
              setProductCount(0);
              fetchItems(category._id); // Fetch items when category is selected
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
                src={item.image || "https://via.placeholder.com/150"} // Default image if none exists
                alt={item.name}
              />
              <div className="p-4">
                <h2 className="mb-2 text-lg font-medium dark:text-white text-gray-900">
                  {item.itemQuantity}
                </h2>

                <div className="flex items-center">
                  <p className="mr-2 text-lg font-semibold text-gray-900 dark:text-white">
                    Tsh: {item.price} /=
                  </p>
                  <p className="text-base font-medium text-gray-500 line-through dark:text-gray-300">
                    $25.00
                  </p>
                  <p className="ml-auto text-base font-medium text-green-500">
                    20% off
                  </p>
                </div>

                <div className="flex justify-between items-center mt-3">
                  <div className="flex items-center bg-gray-200 px-3 py-2 rounded-lg">
                    <button
                      onClick={() => decrement(item._id)}
                      className="text-black font-bold text-2xl px-2"
                    >
                      &minus;
                    </button>
                    <span className="text-black font-bold text-lg mx-3">
                      {item._id === itemId ? productCount : "0"}
                    </span>
                    <button
                      onClick={() => increment(item._id)}
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
