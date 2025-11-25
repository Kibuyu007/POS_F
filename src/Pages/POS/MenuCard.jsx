import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { addItems } from "../../Redux/cartSlice";
import { FaSearch } from "react-icons/fa";
import toast from "react-hot-toast";

//API
import BASE_URL from "../../Utils/config";

const MenuCard = ({ refreshTrigger }) => {
  const cartData = useSelector((state) => state.cart.cart);
  const zuiaAdd = useSelector((state) => state.cart.receiptPrinted);
  const dispatch = useDispatch();

  const [categories, setCategories] = useState([]);
  const [selected, setSelected] = useState(null);
  const [items, setItems] = useState([]);
  const [itemCounts, setItemCounts] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [barcode, setBarcode] = useState("");

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true);
      try {
        const { data } = await axios.get(
          `${BASE_URL}/api/itemsCategories/getItemCategories`
        );

        if (data.success) {
          // First, set categories without item count
          setCategories(data.data);

          // Fetch items for the first category to initialize
          if (data.data.length > 0) {
            const firstCategory = data.data[0];
            setSelected(firstCategory);
            await fetchItems(firstCategory._id);
            
            // Now update categories with item counts from the fetched items
            updateCategoryItemCounts(data.data);
          }
        }
      } catch (error) {
        console.error("Error fetching items:", error);
        toast.error("Failed to load items.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, [refreshTrigger]);

  // Update category item counts based on fetched items
  const updateCategoryItemCounts = async (categoriesList) => {
    try {
      const categoriesWithCounts = await Promise.all(
        categoriesList.map(async (category) => {
          try {
            const itemsResponse = await axios.get(
              `${BASE_URL}/api/items/getAllItems?category=${category._id}`
            );
            
            return {
              ...category,
              itemCount: itemsResponse.data.success ? itemsResponse.data.data.length : 0
            };
          } catch (error) {
            console.error(`Error fetching items for category ${category.name}:`, error);
            return {
              ...category,
              itemCount: 0
            };
          }
        })
      );

      setCategories(categoriesWithCounts);
    } catch (error) {
      console.error("Error updating category counts:", error);
    }
  };

  // Fetch items and update category count
  const fetchItems = useCallback(async (categoryId) => {
    setIsLoading(true);
    try {
      const { data } = await axios.get(
        `${BASE_URL}/api/items/getAllItems?category=${categoryId}`
      );

      if (data.success) {
        setItems(data.data);
        const initialItemCounts = {};
        data.data.forEach((item) => {
          initialItemCounts[item._id] = 1;
        });
        setItemCounts(initialItemCounts);

        // Update the selected category's item count
        setCategories(prev => prev.map(cat => 
          cat._id === categoryId 
            ? { ...cat, itemCount: data.data.length }
            : cat
        ));
      }
    } catch (error) {
      console.error("Error fetching items:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Search by name or barcode
  const searchItemsByCategoryAndName = async (categoryId, searchTerm) => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/api/items/searchInPos`, {
        params: {
          category: categoryId,
          search: searchTerm,
        },
      });

      if (res.data.success) {
        setItems(res.data.data);
        const initial = {};
        res.data.data.forEach((item) => (initial[item._id] = 1));
        setItemCounts(initial);

        // Update category count with search results
        setCategories(prev => prev.map(cat => 
          cat._id === categoryId 
            ? { ...cat, itemCount: res.data.data.length }
            : cat
        ));
      }
    } catch (error) {
      console.error("Error searching items:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle barcode scanning
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Enter" && barcode) {
        handleBarcodeSearch(barcode);
        setBarcode(""); // reset after search
      } else {
        // accumulate scanner digits
        if (/^[0-9a-zA-Z]$/.test(e.key)) {
          setBarcode((prev) => prev + e.key);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [barcode]);

  const handleBarcodeSearch = async (code) => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/api/items/searchInPos`, {
        params: { search: code },
      });

      if (res.data.success && res.data.data.length > 0) {
        const item = res.data.data[0]; // assuming barcode is unique
        handleAddCart(item);
        toast.success(`Scanned: ${item.name}`);
      } else {
        toast.error("No item found for this barcode");
      }
    } catch (error) {
      console.error("Error scanning item:", error);
      toast.error("Barcode search failed");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle quantity change
  const handleQuantityChange = (itemId, value) => {
    const qty = value > 0 ? value : 1;

    setItemCounts((prev) => ({
      ...prev,
      [itemId]: qty,
    }));
  };

  // Add to cart
  const handleAddCart = (item) => {
    if (!item.price || item.price === 0) {
      toast.error("Bidhaa haina Bei, weka bei ndo uendelee na Mauzo ");
      return;
    }

    const quantityToAdd = itemCounts[item._id] || 1;
    const cartItem = cartData.find((ci) => ci.id === item._id);
    const alreadyInCart = cartItem ? cartItem.quantity : 0;
    const totalIfAdded = alreadyInCart + quantityToAdd;

    if (totalIfAdded > item.itemQuantity) {
      toast.error(
        `Stock ya (${item.name}) imeisha , kwa sasa ipo : (${item.itemQuantity})`
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
      toast.error("Malizia kuprint receipt kwanza.");
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
        {/* Search Items */}
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
                setIsLoading(true);
                searchItemsByCategoryAndName(selected._id, value);
              }
            }}
            className="bg-transparent outline-none px-2 py-1 w-full text-black"
          />
        </div>

        {/* Search Category */}
        <div className="hidden sm:flex items-center bg-gray-100 rounded-[30px] px-3 sm:px-4 py-1 sm:py-2 w-full max-w-[300px] border border-gray-400">
          <FaSearch className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-black" />
          <input
            type="text"
            placeholder="Search category..."
            className="bg-transparent outline-none px-2 py-1 w-full text-black"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setIsLoading(true);
              setTimeout(() => setIsLoading(false), 300); // small UX delay
            }}
          />
        </div>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-2 max-h-[30vh] overflow-y-auto scrollbar-hide">
        {filteredCategories.map((category) => (
          <button
            key={category._id}
            onClick={() => {
              setIsLoading(true);
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

      {/* ITEM CARD GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 py-6 w-full">
        {items.map((item) => (
          <div
            key={item._id}
            className="
              bg-gradient-to-br from-green-50 via-green-50 to-gray-100
              rounded-2xl shadow-sm hover:shadow-md
              border border-gray-200
              p-5 flex flex-col justify-between
              transition-all hover:-translate-y-1 cursor-pointer
            "
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-semibold text-gray-800">
                {item.name}
              </h2>
              <span className="text-xs text-gray-500 uppercase">
                {item.category?.name}
              </span>
            </div>

            {/* Prices */}
            <div className="flex justify-between items-center mb-3">
              <div className="flex flex-col">
                <span className="text-gray-500 text-xs">Selling</span>
                <span className="font-semibold mt-1 px-3 py-1 rounded-lg bg-green-50 text-green-800">
                  Tsh {item.price.toLocaleString()}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-500 text-xs">Buying</span>
                <span className="font-medium text-gray-700 mt-1 px-3 py-1 rounded-lg bg-gray-50">
                  Tsh {item.buyingPrice.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Stock Indicator */}
            <div className="flex justify-between items-center mb-4">
              <span
                className={`text-sm font-medium px-3 py-1 rounded-full ${
                  item.itemQuantity === 0
                    ? "bg-red-100 text-red-800"
                    : item.itemQuantity <= item.reOrder
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-green-100 text-green-800"
                }`}
              >
                {item.itemQuantity.toLocaleString()} in stock
              </span>
              {item.status === "Expired" && (
                <span className="text-xs bg-red-50 text-red-700 px-2 py-1 rounded-full">
                  Expired
                </span>
              )}
            </div>

            {/* Qty + Button */}
            <div className="flex flex-col gap-3">
              <input
                type="number"
                min="1"
                value={itemCounts[item._id] || 1}
                onChange={(e) =>
                  handleQuantityChange(item._id, parseInt(e.target.value))
                }
                className="w-full text-center py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-400 focus:outline-none"
              />

              <button
                onClick={() => handleAddCart(item)}
                className="w-full py-2 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold transition-all shadow-sm"
              >
                Weka kwenye List
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default MenuCard;