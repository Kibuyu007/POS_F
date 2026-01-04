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
  FaWarehouse,
  FaUserTie,
  FaStore,
  FaFilter,
  FaCube,
} from "react-icons/fa";
import { MdCategory, MdInventory, MdLocalOffer, MdSwapHoriz } from "react-icons/md";
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
  const [allItems, setAllItems] = useState([]);
  const [itemCounts, setItemCounts] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [barcode, setBarcode] = useState("");
  
  // New state for wholesale mode
  const [saleType, setSaleType] = useState("Retail");
  const [packageSize, setPackageSize] = useState(1);
  const [showPackageSelector, setShowPackageSelector] = useState(false);
  const packageSizes = [1, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 32];

  // Filter items based on sale type
  useEffect(() => {
    if (saleType === "Wholesale") {
      const wholesaleItems = allItems.filter(item => item.enableWholesale === true);
      setItems(wholesaleItems);
      
      const newItemCounts = {};
      wholesaleItems.forEach(item => {
        newItemCounts[item._id] = itemCounts[item._id] || 1;
      });
      setItemCounts(newItemCounts);
      
      setPackageSize(12);
      setShowPackageSelector(true);
    } else {
      setItems(allItems);
      setPackageSize(1);
      setShowPackageSelector(false);
    }
  }, [saleType, allItems]);

  // Initialize item counts when items change
  useEffect(() => {
    const initialItemCounts = {};
    items.forEach(item => {
      initialItemCounts[item._id] = itemCounts[item._id] || 1;
    });
    setItemCounts(initialItemCounts);
  }, [items]);

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
              itemCount: itemsResponse.data.success
                ? itemsResponse.data.data.length
                : 0,
            };
          } catch (error) {
            console.error(
              `Error fetching items for category ${category.name}:`,
              error
            );
            return {
              ...category,
              itemCount: 0,
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
        setAllItems(data.data);
        setItems(data.data);
        const initialItemCounts = {};
        data.data.forEach((item) => {
          initialItemCounts[item._id] = 1;
        });
        setItemCounts(initialItemCounts);

        setCategories((prev) =>
          prev.map((cat) =>
            cat._id === categoryId
              ? { ...cat, itemCount: data.data.length }
              : cat
          )
        );
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
        setAllItems(res.data.data);
        if (saleType === "Wholesale") {
          const wholesaleItems = res.data.data.filter(item => item.enableWholesale === true);
          setItems(wholesaleItems);
          const initial = {};
          wholesaleItems.forEach((item) => (initial[item._id] = 1));
          setItemCounts(initial);
          
          setCategories((prev) =>
            prev.map((cat) =>
              cat._id === categoryId
                ? { ...cat, itemCount: wholesaleItems.length }
                : cat
            )
          );
        } else {
          setItems(res.data.data);
          const initial = {};
          res.data.data.forEach((item) => (initial[item._id] = 1));
          setItemCounts(initial);
          
          setCategories((prev) =>
            prev.map((cat) =>
              cat._id === categoryId
                ? { ...cat, itemCount: res.data.data.length }
                : cat
            )
          );
        }
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
        
        if (saleType === "Wholesale" && !item.enableWholesale) {
          toast.error("This item is not available for wholesale");
          return;
        }
        
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
    if (saleType === "Wholesale" && !item.enableWholesale) {
      toast.error(`${item.name} is not available for wholesale`);
      return;
    }
    
    const price = saleType === "Wholesale" 
      ? item.wholesalePrice || item.price 
      : item.retailPrice || item.price;
    
    if (!price || price === 0) {
      toast.error("Bidhaa haina Bei, weka bei ndo uendelee na Mauzo ");
      return;
    }

    const quantityInUnits = (itemCounts[item._id] || 1) * packageSize;
    const cartItem = cartData.find((ci) => ci.id === item._id && ci.priceType === saleType);
    const alreadyInCart = cartItem ? cartItem.quantity : 0;
    const totalIfAdded = alreadyInCart + quantityInUnits;

    if (totalIfAdded > item.itemQuantity) {
      toast.error(
        `Stock ya (${item.name}) haitoshi , kwa sasa ipo : (${item.itemQuantity}), unataka : (${totalIfAdded})`
      );
      return;
    }

    const newObj = {
      id: item._id,
      name: item.name,
      pricePerQuantity: price,
      quantity: quantityInUnits,
      totalPrice: price * quantityInUnits,
      itemQuantity: item.itemQuantity,
      priceType: saleType,
      buyingPrice: item.buyingPrice,
      retailPrice: item.retailPrice || item.price,
      wholesalePrice: item.wholesalePrice || item.price,
      packageSize: saleType === "Wholesale" ? packageSize : 1,
      unitsPerPackage: saleType === "Wholesale" ? packageSize : 1,
    };

    if (!zuiaAdd) {
      toast.error("Malizia kuprint receipt kwanza.");
      return;
    }

    dispatch(addItems(newObj));
    toast.success(`✓ ${item.name} added to cart (${saleType}${saleType === "Wholesale" ? `, Package: ${packageSize}` : ""})`);
  };

  // Toggle between retail and wholesale
  const toggleSaleType = () => {
    const newSaleType = saleType === "Retail" ? "Wholesale" : "Retail";
    setSaleType(newSaleType);
    
    if (newSaleType === "Wholesale") {
      toast.success(`Switched to Wholesale mode - Showing wholesale items only`);
    } else {
      toast.success(`Switched to Retail mode - Showing all items`);
    }
  };

  // Calculate price based on sale type
  const getItemPrice = (item) => {
    if (saleType === "Wholesale") {
      return item.wholesalePrice || item.price;
    }
    return item.retailPrice || item.price;
  };

  // Calculate profit based on sale type
  const getProfitMargin = (item) => {
    const price = getItemPrice(item);
    return price - item.buyingPrice;
  };

  // Calculate actual quantity including package size
  const getActualQuantity = (itemId) => {
    const quantity = itemCounts[itemId] || 1;
    return quantity * packageSize;
  };

  // Calculate total price including package size
  const getTotalPrice = (item) => {
    const price = getItemPrice(item);
    const quantity = itemCounts[item._id] || 1;
    return price * quantity * packageSize;
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
          <p className="mt-4 text-gray-600 font-medium">
            Loading menu items...
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Sale Type Toggle & Search Header */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              {/* Sale Type Toggle */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 font-medium">Sale Mode:</span>
                  <div className="relative inline-block">
                    <button
                      onClick={toggleSaleType}
                      className={`
                        flex items-center gap-2 px-4 py-2 rounded-xl font-medium
                        transition-all duration-300 shadow-sm border
                        ${saleType === "Retail" 
                          ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-emerald-500 shadow-md hover:shadow-lg hover:from-emerald-600 hover:to-teal-600" 
                          : "bg-gradient-to-r from-indigo-400 to-blue-400 text-white border-indigo-400 shadow-md hover:shadow-lg hover:from-indigo-500 hover:to-blue-500"
                        }
                        hover:scale-105 transform
                      `}
                    >
                      {saleType === "Retail" ? (
                        <>
                          <FaUserTie className="text-sm" />
                          <span>Retail</span>
                        </>
                      ) : (
                        <>
                          <FaStore className="text-sm" />
                          <span>Wholesale</span>
                        </>
                      )}
                      <MdSwapHoriz className="text-sm ml-1" />
                    </button>
                    {saleType === "Wholesale" && (
                      <div className="absolute -top-2 -right-2">
                        <span className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white text-xs px-2 py-0.5 rounded-full shadow-md">
                          <FaFilter className="inline mr-1 text-xs" />
                          WHOLESALE
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Package Selector for Wholesale */}
                {showPackageSelector && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 font-medium">Package:</span>
                    <div className="relative group">
                      <button
                        onClick={() => setShowPackageSelector(!showPackageSelector)}
                        className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-indigo-50 to-blue-50 hover:from-indigo-100 hover:to-blue-100 rounded-lg border border-indigo-200 text-gray-700 font-medium transition-all duration-200"
                      >
                        <FaCube className="text-indigo-600" />
                        <span>Size: {packageSize}</span>
                      </button>
                      
                      {/* Package Size Dropdown */}
                      {showPackageSelector && (
                        <div className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 z-50 w-48 max-h-60 overflow-y-auto">
                          <div className="p-2 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-blue-50">
                            <p className="text-xs text-gray-600 font-semibold">Select Package Size</p>
                          </div>
                          <div className="grid grid-cols-3 gap-1 p-2">
                            {packageSizes.map((size) => (
                              <button
                                key={size}
                                onClick={() => {
                                  setPackageSize(size);
                                  setShowPackageSelector(false);
                                  toast.success(`Package size set to ${size}`);
                                }}
                                className={`p-2 rounded-md text-sm font-medium transition-all ${
                                  packageSize === size
                                    ? "bg-gradient-to-r from-indigo-500 to-blue-500 text-white shadow-md"
                                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                                }`}
                              >
                                {size}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Search Stats */}
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className={`px-3 py-1 rounded-lg ${
                  saleType === "Retail" 
                    ? "bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200" 
                    : "bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200"
                }`}>
                  <span className="font-medium">{items.length}</span> {saleType === "Wholesale" ? "wholesale" : ""} items
                </div>
                <div className="px-3 py-1 bg-gray-100 rounded-lg border border-gray-200">
                  <span className="font-medium">{categories.length}</span> categories
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Search Items */}
              <div className="relative">
                <div className="flex items-center bg-gradient-to-r from-gray-50 to-white rounded-xl px-4 py-3 border border-gray-300/50 shadow-sm">
                  <FaSearch className="w-5 h-5 mr-3 text-gray-400" />
                  <input
                    type="text"
                    placeholder={saleType === "Wholesale" ? "Search wholesale items..." : "Search items..."}
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
                {saleType === "Wholesale" && (
                  <div className="absolute left-3 -top-2 text-xs bg-gradient-to-r from-indigo-500 to-blue-500 text-white px-2 py-0.5 rounded shadow-sm">
                    Wholesale Only
                  </div>
                )}
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
                {saleType === "Wholesale" && (
                  <span className="text-xs bg-gradient-to-r from-indigo-500 to-blue-500 text-white px-2 py-0.5 rounded shadow-sm">
                    Wholesale Filter Active
                  </span>
                )}
              </h3>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500">
                  {filteredCategories.length} available
                </span>
                <div className={`text-xs px-2 py-1 rounded-full ${
                  saleType === "Retail" 
                    ? "bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 border border-emerald-200" 
                    : "bg-gradient-to-r from-indigo-50 to-blue-50 text-indigo-700 border border-indigo-200"
                }`}>
                  Mode: {saleType}
                </div>
              </div>
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
                        ? saleType === "Retail"
                          ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-emerald-500 shadow-md"
                          : "bg-gradient-to-r from-indigo-400 to-blue-400 text-white border-indigo-400 shadow-md"
                        : "bg-white text-gray-700 hover:bg-gray-50 border-gray-200 hover:border-gray-300"
                    }`}
                >
                  <MdCategory className="text-sm" />
                  <span>{category.name}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-xs ${
                      selected?._id === category._id
                        ? "bg-white/20 text-white"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {category.itemCount || 0}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Items Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h3 className="font-semibold text-gray-800 text-lg flex items-center gap-2">
                  <MdInventory className={saleType === "Retail" ? "text-emerald-600" : "text-indigo-600"} />
                  {saleType === "Wholesale" ? "Wholesale Items" : "Menu Items"}
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    ({items.length} {saleType === "Wholesale" ? "wholesale" : ""} items in {selected?.name || "All"})
                  </span>
                </h3>
                {saleType === "Wholesale" && (
                  <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 text-gray-700 px-3 py-1 rounded-lg text-sm">
                    <FaFilter className="inline mr-1" />
                    Showing {items.length} wholesale items
                  </div>
                )}
              </div>
              <div className="flex items-center gap-4">
                {saleType === "Wholesale" && (
                  <div className="text-sm bg-gradient-to-r from-indigo-50 to-blue-50 px-3 py-1 rounded-lg border border-indigo-200">
                    <FaCube className="inline mr-2 text-indigo-600" />
                    Package: <span className="font-bold text-indigo-700">{packageSize}</span> units
                  </div>
                )}
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
            </div>

            {saleType === "Wholesale" && items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center bg-white rounded-2xl border border-gray-200">
                <div className="w-24 h-24 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-full flex items-center justify-center mb-4 border border-indigo-100">
                  <FaStore className="text-indigo-400 text-3xl" />
                </div>
                <h4 className="font-semibold text-gray-700 text-xl mb-2">
                  No Wholesale Items Found
                </h4>
                <p className="text-gray-500 text-sm max-w-sm mb-4">
                  No items are enabled for wholesale in this category.
                  <br />
                  Enable items for wholesale in the inventory management.
                </p>
                <button
                  onClick={() => setSaleType("Retail")}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:shadow-lg transition-all hover:from-emerald-600 hover:to-teal-600"
                >
                  Switch to Retail Mode
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {items.map((item) => {
                  const currentPrice = getItemPrice(item);
                  const profit = getProfitMargin(item);
                  const actualQuantity = getActualQuantity(item._id);
                  const totalPrice = getTotalPrice(item);
                  
                  return (
                    <div
                      key={item._id}
                      className={`
                        bg-white rounded-xl shadow-sm hover:shadow-lg
                        border p-4 flex flex-col justify-between
                        transition-all duration-300 hover:-translate-y-1
                        group
                        ${saleType === "Wholesale" 
                          ? "border-gray-200 hover:border-indigo-300" 
                          : "border-gray-200 hover:border-emerald-200"
                        }
                      `}
                    >
                      {/* Item Header */}
                      <div className="mb-3">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <h3 className="font-bold text-gray-800 text-base group-hover:text-emerald-700 truncate pr-2">
                              {item.name}
                            </h3>
                            {saleType === "Wholesale" && item.enableWholesale && (
                              <div className="flex items-center gap-1 mt-1">
                                <span className="text-xs bg-gradient-to-r from-indigo-500 to-blue-500 text-white px-2 py-0.5 rounded shadow-sm">
                                  <FaStore className="inline mr-1 text-xs" />
                                  WHOLESALE
                                </span>
                                <span className="text-xs bg-gradient-to-r from-indigo-50 to-blue-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-200">
                                  <FaCube className="inline mr-1" />
                                  {packageSize} units/pkg
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col items-end">
                            <span className={`text-xs px-2 py-1 rounded ${
                              saleType === "Wholesale"
                                ? "bg-gradient-to-r from-indigo-50 to-blue-50 text-indigo-700 border border-indigo-200"
                                : "text-gray-500 bg-gray-100"
                            }`}>
                              {item.category?.name || "General"}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex items-center gap-1 text-xs text-gray-600">
                            <FaWarehouse className="text-gray-400" />
                            <span>Stock: </span>
                            <span
                              className={`font-bold ${
                                item.itemQuantity === 0
                                  ? "text-red-600"
                                  : item.itemQuantity <= (item.reOrder || 5)
                                  ? "text-yellow-600"
                                  : "text-green-600"
                              }`}
                            >
                              {item.itemQuantity.toLocaleString()} units
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
                          {/* Current Price */}
                          <div className={`
                            rounded-lg p-3 border
                            ${saleType === "Wholesale"
                              ? "bg-gradient-to-r from-indigo-50 to-blue-50 border-indigo-200"
                              : "bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200"
                            }
                          `}>
                            <div className="flex items-center gap-1 mb-1">
                              <MdLocalOffer className={
                                saleType === "Wholesale" 
                                  ? "text-indigo-600" 
                                  : "text-emerald-600"
                              } />
                              <span className="text-xs text-gray-600">
                                {saleType === "Wholesale" ? "Wholesale" : "Retail"} Price
                              </span>
                            </div>
                            <div className={`font-bold text-lg ${
                              saleType === "Wholesale" 
                                ? "text-indigo-700" 
                                : "text-emerald-700"
                            }`}>
                              Tsh {currentPrice.toLocaleString()}
                              <span className="text-xs text-gray-500 ml-1">/unit</span>
                            </div>
                          </div>
                          
                          {/* Package Total for Wholesale, Buying Price for Retail */}
                          {saleType === "Wholesale" ? (
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-200">
                              <div className="flex items-center gap-1 mb-1">
                                <FaCube className="text-blue-600" />
                                <span className="text-xs text-gray-600">Package Total</span>
                              </div>
                              <div className="font-bold text-lg text-blue-700">
                                Tsh {(currentPrice * packageSize).toLocaleString()}
                                <span className="text-xs text-gray-500 ml-1">/pkg</span>
                              </div>
                            </div>
                          ) : (
                            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-3 border border-gray-200">
                              <div className="flex items-center gap-1 mb-1">
                                <FaTag className="text-gray-600 text-sm" />
                                <span className="text-xs text-gray-600">Buying</span>
                              </div>
                              <div className="font-semibold text-gray-700">
                                Tsh {item.buyingPrice.toLocaleString()}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Price Comparison & Profit */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <div className="flex items-center gap-2">
                              <span className="text-emerald-600">
                                Retail: {item.retailPrice?.toLocaleString() || item.price?.toLocaleString()} Tsh
                              </span>
                              <span className="text-indigo-600">
                                Wholesale: {item.wholesalePrice?.toLocaleString() || item.price?.toLocaleString()} Tsh
                              </span>
                            </div>
                          </div>
                          
                          {/* Profit Indicator */}
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-500">Profit Margin/unit:</span>
                            <span
                              className={`font-bold ${
                                profit > 0
                                  ? "text-green-600"
                                  : profit === 0
                                  ? "text-yellow-600"
                                  : "text-red-600"
                              }`}
                            >
                              Tsh {profit.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between bg-gray-50 rounded-lg p-1 border border-gray-300">
                          {/* Minus Button */}
                          <button
                            onClick={() =>
                              handleQuantityChange(
                                item._id,
                                (itemCounts[item._id] || 1) - 1
                              )
                            }
                            className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
                          >
                            <FaMinus className="text-gray-600" />
                          </button>

                          {/* INPUT FOR QUANTITY */}
                          <div className="flex flex-col items-center">
                            <input
                              type="number"
                              min="1"
                              className="w-16 text-center text-lg font-bold text-gray-800 border rounded-md"
                              value={itemCounts[item._id] || 1}
                              onChange={(e) =>
                                handleQuantityChange(
                                  item._id,
                                  Number(e.target.value)
                                )
                              }
                            />
                            <span className="text-xs text-gray-500">
                              {saleType === "Wholesale" ? "Packages" : "Quantity"}
                            </span>
                            {saleType === "Wholesale" && (
                              <span className="text-xs text-indigo-600 font-medium">
                                = {actualQuantity} units
                              </span>
                            )}
                          </div>

                          {/* Plus Button */}
                          <button
                            onClick={() =>
                              handleQuantityChange(
                                item._id,
                                (itemCounts[item._id] || 1) + 1
                              )
                            }
                            className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
                          >
                            <FaPlus className="text-gray-600" />
                          </button>
                        </div>

                        {/* Add to Cart Button */}
                        <button
                          onClick={() => handleAddCart(item)}
                          className={`
                            w-full py-3 rounded-lg font-semibold 
                            transition-all duration-300 shadow-md hover:shadow-lg 
                            flex items-center justify-center gap-2 group/btn
                            hover:scale-105 transform
                            ${saleType === "Wholesale"
                              ? "bg-gradient-to-r from-indigo-400 to-blue-400 text-white hover:from-indigo-500 hover:to-blue-500"
                              : "bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600"
                            }
                          `}
                        >
                          <FaShoppingCart className="group-hover/btn:scale-110 transition-transform" />
                          <span>Add to Cart ({saleType})</span>
                          <span className="text-xs bg-white/20 px-2 py-0.5 rounded">
                            Tsh {totalPrice.toLocaleString()}
                          </span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {items.length === 0 && saleType !== "Wholesale" && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-4">
                  <FaBox className="text-gray-400 text-2xl" />
                </div>
                <h4 className="font-semibold text-gray-700 text-lg mb-2">
                  No Items Found
                </h4>
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