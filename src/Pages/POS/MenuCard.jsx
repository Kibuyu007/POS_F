import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { addItems } from "../../Redux/cartSlice";
import { 
  FaSearch, 
  FaPlus, 
  FaMinus, 
  FaBarcode, 
  FaBox,
  FaShoppingCart,
  FaTag,
  FaWarehouse
} from "react-icons/fa";
import { MdCategory, MdInventory, MdLocalOffer } from "react-icons/md";
import { RiArrowUpDownLine } from "react-icons/ri";
import toast from "react-hot-toast";

// API
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
          setCategories(data.data);

          if (data.data.length > 0) {
            const firstCategory = data.data[0];
            setSelected(firstCategory);
            await fetchItems(firstCategory._id);
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
        setBarcode("");
      } else {
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
        const item = res.data.data[0];
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

  const handleQuantityChange = (itemId, value) => {
    const qty = value > 0 ? value : 1;
    setItemCounts((prev) => ({
      ...prev,
      [itemId]: qty,
    }));
  };

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
    toast.success(`✓ ${item.name} added to cart`);
  };

  return (
    <>
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <FaShoppingCart className="text-emerald-600 text-xl" />
            </div>
          </div>
          <p className="mt-4 text-gray-600 font-medium">Loading menu items...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Search & Filter Header */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Search Items */}
              <div className="relative">
                <div className="flex items-center bg-gradient-to-r from-gray-50 to-white rounded-xl px-4 py-3 border border-gray-300/50 shadow-sm">
                  <FaSearch className="w-5 h-5 mr-3 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search items by name..."
                    value={searchQuery}
                    onChange={(e) => {
                      const value = e.target.value;
                      setSearchQuery(value);
                      if (selected?._id) {
                        setIsLoading(true);
                        searchItemsByCategoryAndName(selected._id, value);
                      }
                    }}
                    className="bg-transparent outline-none w-full text-gray-700 placeholder-gray-500"
                  />
                </div>
                <div className="absolute right-3 top-3 flex items-center gap-2">
                  <div className="flex items-center text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    <FaBarcode className="mr-1" />
                    Scan
                  </div>
                </div>
              </div>

              {/* Search Categories */}
              <div className="relative">
                <div className="flex items-center bg-gradient-to-r from-gray-50 to-white rounded-xl px-4 py-3 border border-gray-300/50 shadow-sm">
                  <MdCategory className="w-5 h-5 mr-3 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search categories..."
                    className="bg-transparent outline-none w-full text-gray-700 placeholder-gray-500"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setIsLoading(true);
                      setTimeout(() => setIsLoading(false), 300);
                    }}
                  />
                </div>
                <div className="absolute right-3 top-3 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {filteredCategories.length} categories
                </div>
              </div>
            </div>
          </div>

          {/* Categories */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <MdCategory className="text-emerald-600" />
                Categories
              </h3>
              <span className="text-sm text-gray-500">{filteredCategories.length} available</span>
            </div>
            <div className="flex flex-wrap gap-2 max-h-[120px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 p-1">
              {filteredCategories.map((category) => (
                <button
                  key={category._id}
                  onClick={() => {
                    setIsLoading(true);
                    setSelected(category);
                    fetchItems(category._id);
                  }}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border flex items-center gap-2
                    ${
                      selected?._id === category._id
                        ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-emerald-500 shadow-md"
                        : "bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-200 hover:border-gray-300"
                    }`}
                >
                  <MdCategory className="text-sm" />
                  <span>{category.name}</span>
                  <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                    selected?._id === category._id
                      ? "bg-white/20 text-white"
                      : "bg-gray-200 text-gray-700"
                  }`}>
                    {category.itemCount || 0}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Items Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-800 text-lg flex items-center gap-2">
                <MdInventory className="text-emerald-600" />
                Menu Items
                <span className="text-sm font-normal text-gray-500 ml-2">
                  ({items.length} items in {selected?.name || "All"})
                </span>
              </h3>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>In Stock</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span>Low Stock</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {items.map((item) => (
                <div
                  key={item._id}
                  className="
                    bg-white rounded-xl shadow-sm hover:shadow-lg
                    border border-gray-200 hover:border-emerald-200
                    p-4 flex flex-col justify-between
                    transition-all duration-300 hover:-translate-y-1
                    group
                  "
                >
                  {/* Item Header */}
                  <div className="mb-3">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-gray-800 text-base group-hover:text-emerald-700 truncate pr-2">
                        {item.name}
                      </h3>
                      <div className="flex flex-col items-end">
                        <span className="text-xs text-gray-500 px-2 py-1 bg-gray-100 rounded">
                          {item.category?.name || "General"}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center gap-1 text-xs text-gray-600">
                        <FaWarehouse className="text-gray-400" />
                        <span>Stock: </span>
                        <span className={`font-bold ${
                          item.itemQuantity === 0
                            ? "text-red-600"
                            : item.itemQuantity <= item.reOrder
                            ? "text-yellow-600"
                            : "text-green-600"
                        }`}>
                          {item.itemQuantity.toLocaleString()}
                        </span>
                      </div>
                      {item.status === "Expired" && (
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                          Expired
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="space-y-3 mb-4">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg p-3 border border-emerald-100">
                        <div className="flex items-center gap-1 mb-1">
                          <MdLocalOffer className="text-emerald-600 text-sm" />
                          <span className="text-xs text-gray-600">Selling</span>
                        </div>
                        <div className="font-bold text-lg text-emerald-700">
                          Tsh {item.price.toLocaleString()}
                        </div>
                      </div>
                      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-3 border border-gray-200">
                        <div className="flex items-center gap-1 mb-1">
                          <FaTag className="text-gray-600 text-sm" />
                          <span className="text-xs text-gray-600">Buying</span>
                        </div>
                        <div className="font-semibold text-gray-700">
                          Tsh {item.buyingPrice.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    
                    {/* Profit Indicator */}
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Profit Margin:</span>
                      <span className={`font-bold ${
                        item.price - item.buyingPrice > 0 
                          ? "text-green-600" 
                          : "text-red-600"
                      }`}>
                        Tsh {(item.price - item.buyingPrice).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Quantity Controls */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between bg-gray-50 rounded-lg p-1">
                      <button
                        onClick={() => handleQuantityChange(item._id, (itemCounts[item._id] || 1) - 1)}
                        className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <FaMinus className="text-gray-600" />
                      </button>
                      <div className="flex flex-col items-center">
                        <span className="text-lg font-bold text-gray-800">
                          {itemCounts[item._id] || 1}
                        </span>
                        <span className="text-xs text-gray-500">Quantity</span>
                      </div>
                      <button
                        onClick={() => handleQuantityChange(item._id, (itemCounts[item._id] || 1) + 1)}
                        className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <FaPlus className="text-gray-600" />
                      </button>
                    </div>

                    {/* Add to Cart Button */}
                    <button
                      onClick={() => handleAddCart(item)}
                      className="
                        w-full py-3 rounde bg-gradient-to-r from-blue-100 to-green-200 
                        hover:from-grey-600 hover:to-green-500
                        text-black font-semibold 
                        transition-all duration-300 
                        shadow-md hover:shadow-lg
                        flex items-center justify-center gap-2
                        group/btn
                      "
                    >
                      <FaShoppingCart className="group-hover/btn:scale-110 transition-transform" />
                      <span>Add to Cart</span>
                      <span className="text-xs bg-white/20 px-2 py-0.5 rounded">
                        Tsh {((itemCounts[item._id] || 1) * item.price).toLocaleString()}
                      </span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {items.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-4">
                  <FaBox className="text-gray-400 text-2xl" />
                </div>
                <h4 className="font-semibold text-gray-700 text-lg mb-2">No Items Found</h4>
                <p className="text-gray-500 text-sm max-w-sm">
                  Try changing your search or select a different category
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default MenuCard;