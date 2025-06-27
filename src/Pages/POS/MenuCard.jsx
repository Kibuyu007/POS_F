import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { addItems } from "../../Redux/cartSlice";
import { FaSearch } from "react-icons/fa";
import toast from "react-hot-toast";

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
  const [searchQuery, setSearchQuery] = useState("");

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
        console.error("Error fetching items:", error);
        toast.error("Failed to load items. Please try again.", {
          position: "top-right",
          autoClose: 4000,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, [refreshTrigger]);

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
            initialItemCounts[item._id] = 1;
          });
          setItemCounts(initialItemCounts);
        }
      } catch (error) {
        console.error("Error fetching items:", error);
        toast.error("Failed to load items. Please try again.", {
          position: "bottom-right",
          style: {
            borderRadius: "12px",
            background: "#ffccbc",
            color: "#212121",
            fontSize: "18px",
          },
        });
      } finally {
        setIsLoading(false);
      }
    },
    [refreshTrigger]
  );

  const searchItemsByCategoryAndName = async (categoryId, searchTerm) => {
    try {
      const res = await axios.get(
        "http://localhost:4004/api/items/searchInPos",
        {
          params: {
            category: categoryId,
            search: searchTerm,
          },
        }
      );

      if (res.data.success) {
        setItems(res.data.data);
        const initialItemCounts = {};
        res.data.data.forEach((item) => {
          initialItemCounts[item._id] = 1;
        });
        setItemCounts(initialItemCounts);
      }
    } catch (error) {
      console.error("Error searching items:", error);
    }
  };

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
      toast.error(
        `Stock ya  ( ${item.name} )  imeisha , kwa sasa ipo : ( ${item.itemQuantity} ) , Ongeza Stock ili undelee na mauzo.`,
        {
          position: "bottom-right",
          style: {
            borderRadius: "18px",
            background: "#ffccbc",
            color: "#212121",
            fontSize: "18px",
          },
        }
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
      toast.error(
        "Oyaa, Malizia Ku Print Receipt ya Mauzo uliyoyafanya Kwanza .",
        {
          position: "bottom-right",
          style: {
            borderRadius: "12px",
            background: "#ffccbc",
            color: "#212121",
            fontSize: "18px",
          },
        }
      );
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
      <div className="flex justify-between items-center mb-4">
        <div className="hidden sm:flex items-center bg-gray-100 rounded-[30px] px-3 sm:px-4 py-1 sm:py-2 w-full max-w-[300px] border border-gray-400">
          <FaSearch className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-black" />
          <input
            type="text"
            placeholder="Item.."
            value={searchQuery}
            onChange={(e) => {
              const value = e.target.value;
              setSearchQuery(value);
              if (selected?._id) {
                searchItemsByCategoryAndName(selected._id, value);
              }
            }}
            className="bg-transparent outline-none px-2 py-1 w-full text-black"
          />
        </div>

        <div className="hidden sm:flex items-center bg-gray-100 rounded-[30px] px-3 sm:px-4 py-1 sm:py-2 w-full max-w-[300px] border border-gray-400">
          <FaSearch className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-black" />
          <input
            type="text"
            placeholder="Search category..."
            className="bg-transparent outline-none px-2 py-1 w-full text-black"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
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
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">
              {item.name}
            </h2>

            <div className="flex justify-between items-center text-base text-gray-700 mb-4">
              <div>
                <p className="font-semibold">Price</p>
                <p className="text-gray-600 px-4 bg-gray-300 py-1 rounded-full">
                  Tsh {formatPriceWithCommas(item.price)} /=
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold">Stock</p>
                <p
                  className={`text-sm text-center font-medium ${
                    item.itemQuantity === 0
                      ? "text-black bg-red-500 rounded-full py-2 px-2"
                      : "text-gray-600  bg-green-400 rounded-full py-1 px-4"
                  }`}
                >
                  ({item.itemQuantity})
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

            <div className="flex mb-4 justify-center gap-2">
              {item.status === "Expired" && (
                <>
                  <span className="bg-red-50 px-3 text-center py-1 rounded-full">
                    x
                  </span>
                  <span className="bg-red-100 px-3 text-center py-1 rounded-full">
                    x
                  </span>
                  <span className="bg-red-200 px-3 text-center py-1 rounded-full">
                    x
                  </span>
                  <span className="bg-red-300 px-3 text-center py-1 rounded-full">
                    x
                  </span>
                  <span className="bg-red-400 px-3 text-center py-1 rounded-full">
                    x
                  </span>
                  <span className="bg-red-500 px-3 text-center py-1 rounded-full">
                    x
                  </span>
                </>
              )}
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
