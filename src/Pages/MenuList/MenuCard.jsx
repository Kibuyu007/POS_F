import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { GrRadialSelected } from "react-icons/gr";
import { useDispatch, useSelector } from "react-redux";
import { addItems } from "../../Redux/cartSlice";

const MenuCard = ({ refreshTrigger }) => {
  const cartData = useSelector((state) => state.cart.cart);
  const zuiaAdd = useSelector((state) => state.cart.receiptPrinted);

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

          const activeCategory = categoriesWithItemCount.find(
            (cat) => cat._id === selected?._id
          );

          if (activeCategory) {
            setSelected(activeCategory);
            fetchItems(activeCategory._id);
          } else if (categoriesWithItemCount.length > 0) {
            setSelected(categoriesWithItemCount[0]);
            fetchItems(categoriesWithItemCount[0]._id);
          }
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories(); // ← always runs on refreshTrigger change
  }, [refreshTrigger]); // ← works whether toggle is true or false

  const fetchItems = useCallback(
    async (categoryId) => {
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
    },
    [refreshTrigger]
  );

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
    const quantityToAdd = itemCounts[item._id] || 1;

    // Find current quantity in cart
    const cartItem = cartData.find((ci) => ci.id === item._id);
    const alreadyInCart = cartItem ? cartItem.quantity : 0;

    const totalIfAdded = alreadyInCart + quantityToAdd;

    if (totalIfAdded > item.itemQuantity) {
      alert(
        `Cannot add ${quantityToAdd}. You already have ${alreadyInCart} of "${item.name}" in cart, and only ${item.itemQuantity} are available in stock.`
      );
      return;
    }

    const newObj = {
      id: item._id,
      name: item.name,
      pricePerQuantity: item.price,
      quantity: quantityToAdd,
      totalPrice: item.price * quantityToAdd,
      itemQuantity: item.itemQuantity,
    };

    if (!zuiaAdd) {
      alert("Please print the receipt before adding new items.");
      return;
    }

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

          
              <div className="w-80 mt-24 m-auto lg:mt-12 max-w-sm shadow-[0_3px_10px_rgb(0,0,0,0.2)] rounded-2xl">
                <div className="bg-white mt-8 rounded-3xl">
                  <div className=" lg:w-5/6 m-auto bg-indigo-50 mt-2 p-4 lg:p-4 rounded-xl ">
                    <h2 className="text-center text-gray-800 text-2xl font-bold">
                      {item.name}
                    </h2>
                  </div>
                  <div className="grid grid-cols-4 w-72 lg:w-5/6 m-auto bg-indigo-50 mt-5 p-4 lg:p-4 rounded-xl">
                    <div className="col-span-2 pt-1">
                      <p className="text-gray-800 font-bold lg:text-sm">
                        Price
                      </p>
                      <p className="text-gray-500 text-sm">
                        Tsh: {formatPriceWithCommas(item.price)} /=
                      </p>
                    </div>

                    <div className="col-span-2 pt-1">
                      <p className="text-gray-800 font-bold lg:text-sm">
                        Quantity
                      </p>
                      <p className="text-gray-500 text-sm">
                        ({item.itemQuantity} available)
                      </p>
                    </div>
                  </div>

                  <div className="text-center m-auto mt-6 w-full">
                    <input
                      type="number"
                      value={itemCounts[item._id] || 0}
                      onChange={(e) =>
                        handleQuantityChange(item._id, parseInt(e.target.value))
                      }
                      className="w-16 border px-2 py-1 rounded-md text-center"
                      min="1"
                    />
                  </div>
                  <div className="bg-green-500 w-72 lg:w-5/6 m-auto mt-6 p-2 hover:bg-indigo-50 rounded-lg  text-black text-center shadow-xl shadow-bg-blue-700">
                    <button
                      onClick={() => handleAddCart(item)}
                      className="lg:text-sm text-lg font-bold"
                    >
                      Weka kwenye List
                    </button>
                  </div>
                  <div className="text-center m-auto mt-6 w-full">
                    <button className="text-gray-500 font-bold lg:text-sm hover:text-gray-900"></button>
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
