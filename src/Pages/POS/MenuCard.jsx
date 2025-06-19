import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { addItems } from "../../Redux/cartSlice";

const MenuCard = ({ refreshTrigger }) => {
  const cartData = useSelector((state) => state.cart.cart);
  const zuiaAdd = useSelector((state) => state.cart.receiptPrinted);

  const [categories, setCategories] = useState([]);
  const [selected, setSelected] = useState(null);
  const [items, setItems] = useState([]);
  const [itemCounts, setItemCounts] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                itemCount: itemCount.data.success ? itemCount.data.totalItems : 0,
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

    fetchCategories();
  }, [refreshTrigger]);

  const fetchItems = useCallback(async (categoryId) => {
    try {
      const { data } = await axios.get(
        `http://localhost:4004/api/items/getAllItems?category=${categoryId}`
      );

      if (data.success) {
        setItems(data.data);
        const initialItemCounts = {};
        data.data.forEach((item) => {
          initialItemCounts[item._id] = 1;
        });
        setItemCounts(initialItemCounts);
      }
    } catch (error) {
      console.error("Error fetching items:", error);
    } finally {
      setIsLoading(false);
    }
  }, [refreshTrigger]);

  const formatPriceWithCommas = (price) => {
    return new Intl.NumberFormat("en-US").format(price);
  };

  const handleQuantityChange = (itemId, value) => {
    setItemCounts((prev) => ({
      ...prev,
      [itemId]: Math.max(1, value),
    }));
  };

  const handleAddCart = (item) => {
    const quantityToAdd = itemCounts[item._id] || 1;
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

      <div className="w-full mb-3 mt-8">
        <input
          type="text"
          placeholder="Search category..."
          className="w-full px-3 py-2 border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-2  focus:ring-green-400"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="flex flex-wrap gap-2 max-h-[30vh] overflow-y-auto scrollbar-hide">
        {filteredCategories.map((category) => (
          <button
            key={category._id}
            onClick={() => {
              setSelected(category);
              fetchItems(category._id);
            }}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border shadow-sm 
              ${
                selected?._id === category._id
                  ? "bg-green-500 text-black border-green-400"
                  : "bg-gray-100 text-gray-800 hover:bg-gray-300"
              }`}
          >
            {category.name}
            <span className="ml-2 text-xs text-gray-600">
              ({category.itemCount || 0})
            </span>
          </button>
        ))}
      </div>

      <hr className="border-[#2a2a2a] border-t-2 mt-4" />

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 py-6 w-full">
        {items.map((item) => (
          <div
            key={item._id}
            className="bg-gradient-to-r from-blue-100 to-green-200 rounded-2xl shadow-lg p-6 flex flex-col justify-between transition-all hover:shadow-xl"
          >
            <h2 className="text-xl font-bold text-center text-gray-800 mb-4">
              {item.name}
            </h2>

            <div className="flex justify-between items-center text-base text-gray-700 mb-4">
              <div>
                <p className="font-semibold">Price</p>
                <p className="text-gray-600">
                  Tsh {formatPriceWithCommas(item.price)} /=
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold">Stock</p>
                <p className="text-gray-600">
                  ({item.itemQuantity} available)
                </p>
              </div>
            </div>

            <div className="flex justify-center mb-4">
              <input
                type="number"
                min="1"
                value={itemCounts[item._id] || 1}
                onChange={(e) =>
                  handleQuantityChange(item._id, parseInt(e.target.value))
                }
                className="w-20 text-center border border-gray-300 rounded-md py-2"
              />
            </div>

            <button
              onClick={() => handleAddCart(item)}
              className="w-full bg-gray-300 hover:bg-green-300 text-black py-2 rounded-full font-semibold text-base"
            >
              Weka kwenye List
            </button>
          </div>
        ))}
      </div>
    </>
  );
};

export default MenuCard;
