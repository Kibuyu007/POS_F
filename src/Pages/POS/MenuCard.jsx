import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { addItems } from "../../Redux/cartSlice";
import {
  FaSearch,
  FaPlus,
  FaMinus,
  FaBox,
  FaShoppingCart,
  FaTag,
  FaWarehouse,
  FaUserTie,
  FaStore,
  FaFilter,
  FaCube,
  FaBars,
  FaTimes,
  FaList,
  FaTh,
  FaClock,
  FaCheckCircle,
  FaSpinner,
  FaChevronDown,
  FaChevronUp,
  FaUser,
  FaPhone,
  FaCalendar,
  FaCalendarAlt,
  FaExclamationTriangle,
} from "react-icons/fa";
import {
  MdCategory,
  MdInventory,
  MdLocalOffer,
  MdSwapHoriz,
} from "react-icons/md";
import toast from "react-hot-toast";

import BASE_URL from "../../Utils/config";

const MenuCard = ({ refreshTrigger }) => {
  const cartData = useSelector((state) => state.cart.cart);
  const zuiaAdd = useSelector((state) => state.cart.receiptPrinted);
  const dispatch = useDispatch();

  // ==================== STATE ====================
  const [categories, setCategories] = useState([]);
  const [selected, setSelected] = useState(null);
  const [items, setItems] = useState([]);
  const [allItems, setAllItems] = useState([]);
  const [itemCounts, setItemCounts] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [barcode, setBarcode] = useState("");

  // Tab state
  const [activeTab, setActiveTab] = useState("menu");
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [expandedOrders, setExpandedOrders] = useState({});

  // Order search
  const [orderSearchTerm, setOrderSearchTerm] = useState("");

  // Mobile UI states
  const [showCategories, setShowCategories] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Sale type
  const [saleType, setSaleType] = useState("Retail");
  const [packageSize, setPackageSize] = useState(1);
  const [showPackageSelector, setShowPackageSelector] = useState(false);
  const packageSizes = [1, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 32];

  // ==================== FETCH ORDERS ====================
  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}/api/orders/allOrders`, {
        withCredentials: true,
      });
      if (response.data.success) {
        const sortedOrders = (response.data.data || []).sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
        );
        setOrders(sortedOrders);

        const initialExpanded = {};
        sortedOrders.forEach((order) => {
          initialExpanded[order._id] = false;
        });
        setExpandedOrders(initialExpanded);
      } else {
        toast.error(response.data.message || "Failed to fetch orders");
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      toast.error("Failed to load orders");
    } finally {
      setOrdersLoading(false);
    }
  };

  // Filter orders by search term
  const filteredOrders = orders.filter((order) => {
    if (!orderSearchTerm.trim()) return true;
    const searchLower = orderSearchTerm.toLowerCase().trim();
    return (
      order.orderNumber?.toLowerCase().includes(searchLower) ||
      order.customerName?.toLowerCase().includes(searchLower) ||
      order.customerPhone?.includes(searchLower)
    );
  });

  // ==================== EFFECTS ====================
  useEffect(() => {
    if (activeTab === "orders") {
      fetchOrders();
    }
  }, [activeTab]);

  useEffect(() => {
    if (saleType === "Wholesale") {
      const wholesaleItems = allItems.filter(
        (item) => item.enableWholesale === true,
      );
      setItems(wholesaleItems);
      const newItemCounts = {};
      wholesaleItems.forEach((item) => {
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

  useEffect(() => {
    const initialItemCounts = {};
    items.forEach((item) => {
      initialItemCounts[item._id] = itemCounts[item._id] || 1;
    });
    setItemCounts(initialItemCounts);
  }, [items]);

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true);
      try {
        const { data } = await axios.get(
          `${BASE_URL}/api/itemsCategories/getItemCategories`,
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
              `${BASE_URL}/api/items/getAllItems?category=${category._id}`,
            );
            return {
              ...category,
              itemCount: itemsResponse.data.success
                ? itemsResponse.data.data.length
                : 0,
            };
          } catch (error) {
            return { ...category, itemCount: 0 };
          }
        }),
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
        `${BASE_URL}/api/items/getAllItems?category=${categoryId}`,
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
              : cat,
          ),
        );
      }
    } catch (error) {
      console.error("Error fetching items:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const searchItemsByCategoryAndName = async (categoryId, searchTerm) => {
    try {
      const res = await axios.get(`${BASE_URL}/api/items/searchInPos`, {
        params: { category: categoryId, search: searchTerm },
      });

      if (res.data.success) {
        setAllItems(res.data.data);
        if (saleType === "Wholesale") {
          const wholesaleItems = res.data.data.filter(
            (item) => item.enableWholesale === true,
          );
          setItems(wholesaleItems);
          const initial = {};
          wholesaleItems.forEach((item) => (initial[item._id] = 1));
          setItemCounts(initial);
          setCategories((prev) =>
            prev.map((cat) =>
              cat._id === categoryId
                ? { ...cat, itemCount: wholesaleItems.length }
                : cat,
            ),
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
                : cat,
            ),
          );
        }
      }
    } catch (error) {
      console.error("Error searching items:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Enter" && barcode) {
        handleBarcodeSearch(barcode);
        setBarcode("");
      } else if (/^[0-9a-zA-Z]$/.test(e.key)) {
        setBarcode((prev) => prev + e.key);
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
    setItemCounts((prev) => ({ ...prev, [itemId]: qty }));
  };

  // ==================== ADD TO CART - MENU TAB ====================
  const handleAddCart = (item) => {
    if (!zuiaAdd) {
      toast.error("Please complete the current transaction first");
      return;
    }

    const price =
      saleType === "Wholesale"
        ? item.wholesalePrice || item.price
        : item.retailPrice || item.price;

    if (!price || price === 0) {
      toast.error(`${item.name} has no price set. Please set price first.`);
      return;
    }

    if (saleType === "Wholesale" && !item.enableWholesale) {
      toast.error(`${item.name} is not available for wholesale`);
      return;
    }

    // Check stock first - this is the only restriction
    const quantityInUnits = (itemCounts[item._id] || 1) * packageSize;
    const cartItem = cartData.find(
      (ci) => ci.id === item._id && ci.priceType === saleType,
    );
    const alreadyInCart = cartItem ? cartItem.quantity : 0;
    const totalIfAdded = alreadyInCart + quantityInUnits;

    if (totalIfAdded > item.itemQuantity) {
      toast.error(
        `Stock of (${item.name}) is insufficient. Available: (${item.itemQuantity}), Requested: (${totalIfAdded})`,
      );
      return;
    }

    // Allow expired items - show warning with icon
    const expiryDate = item.expiryDate || item.expirationDate;
    const isExpired =
      item.status === "Expired" ||
      (expiryDate && new Date(expiryDate) < new Date());
    if (isExpired) {
      toast.error(`${item.name} is expired. Adding anyway.`, {
        icon: "⚠️",
        duration: 3000,
      });
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
      expiryDate: expiryDate || null,
      isExpired: isExpired,
    };

    dispatch(addItems(newObj));
    toast.success(
      `✓ ${item.name} added to cart (${saleType}${saleType === "Wholesale" ? `, Package: ${packageSize}` : ""})`,
    );
  };

  // ==================== ADD ORDER ITEM TO CART - ORDERS TAB ====================
  const handleAddOrderItemToCart = (order, item) => {
    if (!zuiaAdd) {
      toast.error("Please complete the current transaction first");
      return;
    }

    const currentStock =
      item.currentStock !== undefined ? item.currentStock : 0;
    const retailPrice = item.retailPrice || 0;
    const wholesalePrice = item.wholesalePrice || 0;
    const enableWholesale = item.enableWholesale || false;
    const expiryDate = item.expiryDate || null;
    const itemStatus = item.status || "Active";

    if (item.itemExists === false) {
      toast.error(`Item ${item.itemName} no longer exists in inventory`);
      return;
    }

    const price =
      saleType === "Wholesale" ? wholesalePrice || 0 : retailPrice || 0;

    if (!price || price === 0) {
      toast.error(`${item.itemName} has no price set. Please set price first.`);
      return;
    }

    if (saleType === "Wholesale" && !enableWholesale) {
      toast.error(`${item.itemName} is not available for wholesale`);
      return;
    }

    // Check stock first - this is the only restriction
    const quantityInUnits = item.quantity * packageSize;
    const cartItem = cartData.find(
      (ci) => ci.id === item.itemId && ci.priceType === saleType,
    );
    const alreadyInCart = cartItem ? cartItem.quantity : 0;
    const totalIfAdded = alreadyInCart + quantityInUnits;

    if (totalIfAdded > currentStock) {
      toast.error(
        `Stock of (${item.itemName}) is insufficient. Available: (${currentStock}), Requested: (${totalIfAdded})`,
      );
      return;
    }

    // Allow expired items - show warning with icon
    const isExpired =
      itemStatus === "Expired" ||
      (expiryDate && new Date(expiryDate) < new Date());
    if (isExpired) {
      toast.error(`${item.itemName} is expired. Adding anyway.`, {
        icon: "⚠️",
        duration: 3000,
      });
    }

    const newObj = {
      id: item.itemId,
      name: item.itemName,
      pricePerQuantity: price,
      quantity: quantityInUnits,
      totalPrice: price * quantityInUnits,
      itemQuantity: currentStock,
      priceType: saleType,
      buyingPrice: item.buyingPrice || 0,
      retailPrice: retailPrice,
      wholesalePrice: wholesalePrice,
      packageSize: saleType === "Wholesale" ? packageSize : 1,
      unitsPerPackage: saleType === "Wholesale" ? packageSize : 1,
      expiryDate: expiryDate || null,
      isExpired: isExpired,
    };

    dispatch(addItems(newObj));
    toast.success(
      `✓ ${item.itemName} added to cart from order #${order.orderNumber}`,
    );
  };

  const toggleSaleType = () => {
    const newSaleType = saleType === "Retail" ? "Wholesale" : "Retail";
    setSaleType(newSaleType);
    if (newSaleType === "Wholesale") {
      toast.success(`Switched to Wholesale mode`);
    } else {
      toast.success(`Switched to Retail mode`);
    }
  };

  const getItemPrice = (item) => {
    if (saleType === "Wholesale") {
      return item.wholesalePrice || item.price;
    }
    return item.retailPrice || item.price;
  };

  const getProfitMargin = (item) => {
    const price = getItemPrice(item);
    return price - item.buyingPrice;
  };

  const getActualQuantity = (itemId) => {
    const quantity = itemCounts[itemId] || 1;
    return quantity * packageSize;
  };

  const getTotalPrice = (item) => {
    const price = getItemPrice(item);
    const quantity = itemCounts[item._id] || 1;
    return price * quantity * packageSize;
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      Pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
      Confirmed: "bg-blue-100 text-blue-700 border-blue-200",
      Completed: "bg-green-100 text-green-700 border-green-200",
      Cancelled: "bg-red-100 text-red-700 border-red-200",
    };
    return statusMap[status] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Pending":
        return <FaClock className="text-yellow-600" />;
      case "Confirmed":
        return <FaSpinner className="text-blue-600 animate-spin" />;
      case "Completed":
        return <FaCheckCircle className="text-green-600" />;
      case "Cancelled":
        return <FaTimes className="text-red-600" />;
      default:
        return null;
    }
  };

  const formatCurrency = (amount) => {
    return `TSh ${(amount || 0).toLocaleString()}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const isItemExpired = (item) => {
    const expiryDate = item.expiryDate || item.expirationDate;
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  const toggleOrderExpand = (orderId) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  // ==================== LOADING STATE ====================
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <div className="relative">
          <div className="w-16 h-16 sm:w-20 sm:h-20 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <FaShoppingCart className="text-emerald-600 text-lg sm:text-xl" />
          </div>
        </div>
        <p className="mt-4 text-gray-600 font-medium text-sm sm:text-base">
          Loading All Items...
        </p>
      </div>
    );
  }

  // ==================== RENDER ORDERS TAB ====================
  const renderOrdersTab = () => {
    if (ordersLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-20 px-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
          </div>
          <p className="mt-4 text-gray-600 font-medium">Loading orders...</p>
        </div>
      );
    }

    if (orders.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-2xl border border-gray-200 px-4">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <FaList className="text-gray-400 text-2xl" />
          </div>
          <h4 className="font-semibold text-gray-700 text-lg mb-2">
            No Orders Found
          </h4>
          <p className="text-gray-500 text-sm">
            Orders will appear here once they are created
          </p>
        </div>
      );
    }

    const displayedOrders = filteredOrders;

    return (
      <div className="space-y-6">
        {/* Header with Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-5 border border-emerald-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl shadow-lg shadow-emerald-200">
              <FaList className="text-white text-xl" />
            </div>
            <div>
              <h3 className="font-bold text-gray-800 text-xl">Recent Orders</h3>
              <p className="text-sm text-gray-500">
                {displayedOrders.length} order
                {displayedOrders.length !== 1 ? "s" : ""} found
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:min-w-[200px]">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by order #, name or phone..."
                value={orderSearchTerm}
                onChange={(e) => setOrderSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white rounded-xl border border-gray-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 outline-none transition-all text-sm"
              />
            </div>
            <button
              onClick={toggleSaleType}
              className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md hover:shadow-lg whitespace-nowrap
                ${
                  saleType === "Retail"
                    ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white"
                    : "bg-gradient-to-r from-indigo-500 to-blue-500 text-white"
                }`}
            >
              {saleType === "Retail" ? <FaUserTie /> : <FaStore />}
              {saleType} Mode
            </button>
          </div>
        </div>

        {/* Orders Grid */}
        {displayedOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center bg-white rounded-2xl border border-gray-200 px-4">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <FaSearch className="text-gray-400 text-2xl" />
            </div>
            <h4 className="font-semibold text-gray-700 text-lg mb-2">
              No Orders Found
            </h4>
            <p className="text-gray-500 text-sm">
              No orders match your search "{orderSearchTerm}"
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {displayedOrders.map((order) => {
              const isExpanded = expandedOrders[order._id] || false;
              const displayItems = isExpanded
                ? order.items
                : order.items?.slice(0, 3);

              return (
                <div
                  key={order._id}
                  className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300"
                >
                  {/* Order Header */}
                  <div
                    className="px-6 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 cursor-pointer hover:from-emerald-600 hover:to-teal-600 transition-colors flex items-center justify-between"
                    onClick={() => toggleOrderExpand(order._id)}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1 flex-wrap">
                      <span className="font-mono font-bold text-white text-sm bg-white/20 px-3 py-1 rounded-lg">
                        #{order.orderNumber || order._id.slice(-6)}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(order.status)}`}
                      >
                        {getStatusIcon(order.status)}
                        <span>{order.status}</span>
                      </span>
                      <span className="text-xs text-white/80 bg-white/20 px-3 py-1 rounded-full">
                        {order.items?.length || 0} items
                      </span>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="text-right text-white">
                        <div className="text-sm font-bold">
                          {formatCurrency(order.grandTotal || 0)}
                        </div>
                        <div className="text-[10px] text-white/70">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      {isExpanded ? (
                        <FaChevronUp className="w-5 h-5 text-white/80" />
                      ) : (
                        <FaChevronDown className="w-5 h-5 text-white/80" />
                      )}
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="px-6 py-3 bg-gray-50 border-b border-gray-200 flex items-center gap-6 text-sm text-gray-600 flex-wrap">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-emerald-100 rounded-full">
                        <FaUser className="w-3.5 h-3.5 text-emerald-600" />
                      </div>
                      <span className="font-medium">{order.customerName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-blue-100 rounded-full">
                        <FaPhone className="w-3.5 h-3.5 text-blue-600" />
                      </div>
                      <span>{order.customerPhone}</span>
                    </div>
                    <div className="flex items-center gap-2 ml-auto">
                      <div className="p-1.5 bg-gray-200 rounded-full">
                        <FaCalendar className="w-3.5 h-3.5 text-gray-600" />
                      </div>
                      <span className="text-xs">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="divide-y divide-gray-100">
                    {displayItems?.map((item, index) => {
                      const currentStock =
                        item.currentStock !== undefined ? item.currentStock : 0;
                      const retailPrice = item.retailPrice || 0;
                      const wholesalePrice = item.wholesalePrice || 0;
                      const enableWholesale = item.enableWholesale || false;
                      const expiryDate = item.expiryDate || null;
                      const itemStatus = item.status || "Active";
                      const itemExists =
                        item.itemExists !== undefined ? item.itemExists : true;

                      const isInStock = currentStock > 0;
                      const hasPrice =
                        saleType === "Retail"
                          ? retailPrice > 0
                          : wholesalePrice > 0;
                      const isExpired =
                        itemStatus === "Expired" ||
                        (expiryDate && new Date(expiryDate) < new Date());
                      const isLowStock = isInStock && currentStock <= 5;

                      // Can add if in stock AND has price (expired items are allowed)
                      const canAdd =
                        isInStock && hasPrice && zuiaAdd && itemExists;

                      return (
                        <div
                          key={`${order._id}_${item.itemId}`}
                          className={`px-4 py-3 mx-3 my-2 rounded-xl ${index % 2 === 0 ? "bg-gray-100/80" : "bg-gray-50/80"} border border-gray-200/60 hover:border-emerald-300 transition-all duration-200
                            ${isExpired ? "border-l-4 border-l-yellow-400" : ""}`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            {/* Item Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span
                                  className={`font-semibold text-sm ${!isInStock ? "text-gray-400" : "text-gray-800"}`}
                                >
                                  {item.itemName}
                                </span>
                                {item.priceType === "Wholesale" && (
                                  <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                                    WS
                                  </span>
                                )}
                                {!isInStock && (
                                  <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                                    Out of Stock
                                  </span>
                                )}
                                {isExpired && isInStock && (
                                  <span className="text-[10px] bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                                    <FaExclamationTriangle className="w-3 h-3" />
                                    Expired
                                  </span>
                                )}
                                {isLowStock && isInStock && !isExpired && (
                                  <span className="text-[10px] bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
                                    Low Stock: {currentStock}
                                  </span>
                                )}
                                {!itemExists && (
                                  <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                                    Not in inventory
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 flex-wrap">
                                <span className="flex items-center gap-1">
                                  <FaTag className="w-3 h-3 text-gray-400" />
                                  Qty: {item.quantity}
                                </span>
                                <span className="flex items-center gap-1 font-medium text-gray-700">
                                  {formatCurrency(item.totalPrice || 0)}
                                </span>
                                {itemExists && (
                                  <>
                                    <span className="text-gray-300">|</span>
                                    <span className="flex items-center gap-1">
                                      <FaWarehouse className="w-3 h-3 text-gray-400" />
                                      Stock:{" "}
                                      <span
                                        className={
                                          isInStock
                                            ? "text-green-600 font-medium"
                                            : "text-red-600 font-medium"
                                        }
                                      >
                                        {currentStock}
                                      </span>
                                    </span>
                                    {retailPrice > 0 && (
                                      <>
                                        <span className="text-gray-300">|</span>
                                        <span className="flex items-center gap-1">
                                          <FaTag className="w-3 h-3 text-gray-400" />
                                          Retail: {formatCurrency(retailPrice)}
                                        </span>
                                      </>
                                    )}
                                    {wholesalePrice > 0 && enableWholesale && (
                                      <>
                                        <span className="text-gray-300">|</span>
                                        <span className="flex items-center gap-1 text-indigo-600">
                                          <FaStore className="w-3 h-3" />
                                          WS: {formatCurrency(wholesalePrice)}
                                        </span>
                                      </>
                                    )}
                                    {expiryDate && (
                                      <>
                                        <span className="text-gray-300">|</span>
                                        <span className="flex items-center gap-1">
                                          <FaCalendarAlt className="w-3 h-3 text-gray-400" />
                                          Exp:{" "}
                                          <span
                                            className={
                                              isExpired
                                                ? "text-yellow-600 font-medium"
                                                : "text-gray-600"
                                            }
                                          >
                                            {formatDate(expiryDate)}
                                          </span>
                                        </span>
                                      </>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>

                            {/* Add Button */}
                            <button
                              onClick={() => {
                                if (!canAdd) {
                                  if (!zuiaAdd) {
                                    toast.error(
                                      "Please complete the current transaction first",
                                    );
                                    return;
                                  }
                                  if (!itemExists) {
                                    toast.error(
                                      `Item ${item.itemName} no longer exists in inventory`,
                                    );
                                    return;
                                  }
                                  if (!isInStock) {
                                    toast.error(
                                      `${item.itemName} is out of stock (Available: ${currentStock})`,
                                    );
                                    return;
                                  }
                                  if (!hasPrice) {
                                    toast.error(
                                      `${item.itemName} has no price set`,
                                    );
                                    return;
                                  }
                                  toast.error(`Cannot add ${item.itemName}`);
                                  return;
                                }
                                handleAddOrderItemToCart(order, item);
                              }}
                              disabled={!canAdd}
                              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 shadow-sm hover:shadow-md flex-shrink-0
                                ${
                                  !canAdd
                                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                    : saleType === "Wholesale"
                                      ? "bg-gradient-to-r from-indigo-500 to-blue-500 text-white hover:from-indigo-600 hover:to-blue-600"
                                      : "bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600"
                                }`}
                            >
                              <FaShoppingCart className="w-3.5 h-3.5" />
                              {!itemExists
                                ? "Not Found"
                                : !isInStock
                                  ? "Out of Stock"
                                  : !hasPrice
                                    ? "No Price"
                                    : "Add to Cart"}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Show more */}
                  {(order.items?.length || 0) > 3 && (
                    <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
                      <button
                        onClick={() => toggleOrderExpand(order._id)}
                        className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-2"
                      >
                        {isExpanded ? (
                          <>
                            Show less <FaChevronUp className="w-4 h-4" />
                          </>
                        ) : (
                          <>
                            View {order.items.length - 3} more items{" "}
                            <FaChevronDown className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // ==================== RENDER MENU TAB ====================
  const renderMenuTab = () => (
    <div className="space-y-4">
      {/* Mobile: Top Bar */}
      <div className="lg:hidden flex items-center justify-between bg-white rounded-xl shadow-sm border border-gray-200 p-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCategories(!showCategories)}
            className="p-2 bg-emerald-100 hover:bg-emerald-200 rounded-lg text-emerald-700 transition-colors"
          >
            <FaBars className="w-4 h-4" />
          </button>
          <span className="font-semibold text-gray-800 text-sm">
            {selected?.name || "All Categories"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 transition-colors"
          >
            <FaFilter className="w-4 h-4" />
          </button>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            {items.length} items
          </span>
        </div>
      </div>

      {/* Mobile: Collapsible Categories */}
      <div className={`lg:hidden ${showCategories ? "block" : "hidden"}`}>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
              <MdCategory className="text-emerald-600" />
              Categories
            </h3>
            <button
              onClick={() => setShowCategories(false)}
              className="p-1 text-gray-400 hover:text-gray-600"
            >
              <FaTimes className="w-4 h-4" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2 max-h-[200px] overflow-y-auto">
            {filteredCategories.map((category) => (
              <button
                key={category._id}
                onClick={() => {
                  setSelected(category);
                  fetchItems(category._id);
                  setShowCategories(false);
                }}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all border flex items-center gap-1.5
                  ${
                    selected?._id === category._id
                      ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-emerald-500 shadow-md"
                      : "bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-200"
                  }`}
              >
                <MdCategory className="text-xs" />
                <span className="truncate max-w-[100px]">{category.name}</span>
                <span
                  className={`px-1 py-0.5 rounded-full text-[10px] ${selected?._id === category._id ? "bg-white/20 text-white" : "bg-gray-200 text-gray-600"}`}
                >
                  {category.itemCount || 0}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile: Collapsible Filters */}
      <div className={`lg:hidden ${showFilters ? "block" : "hidden"}`}>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-800 text-sm">Filters</h3>
            <button
              onClick={() => setShowFilters(false)}
              className="p-1 text-gray-400 hover:text-gray-600"
            >
              <FaTimes className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs text-gray-600">Mode:</span>
            <button
              onClick={toggleSaleType}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                ${
                  saleType === "Retail"
                    ? "bg-emerald-500 text-white"
                    : "bg-indigo-500 text-white"
                }`}
            >
              {saleType === "Retail" ? <FaUserTie /> : <FaStore />}
              {saleType}
            </button>
          </div>

          <div className="relative mb-3">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (selected?._id) {
                  searchItemsByCategoryAndName(selected._id, e.target.value);
                }
              }}
              className="w-full pl-9 pr-3 py-2 bg-gray-50 rounded-lg text-sm border border-gray-200 focus:border-emerald-300 focus:outline-none"
            />
          </div>

          {saleType === "Wholesale" && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-600">Package:</span>
              <select
                value={packageSize}
                onChange={(e) => setPackageSize(Number(e.target.value))}
                className="bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 text-sm"
              >
                {packageSizes.map((size) => (
                  <option key={size} value={size}>
                    {size} units
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Desktop: Full Header */}
      <div className="hidden lg:block bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 font-medium">
              Sale Mode:
            </span>
            <button
              onClick={toggleSaleType}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all shadow-sm border hover:scale-105 transform
                ${
                  saleType === "Retail"
                    ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-emerald-500"
                    : "bg-gradient-to-r from-indigo-400 to-blue-400 text-white border-indigo-400"
                }`}
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
              <span className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white text-xs px-2 py-0.5 rounded-full shadow-md">
                <FaFilter className="inline mr-1 text-xs" /> WHOLESALE
              </span>
            )}
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div
              className={`px-3 py-1 rounded-lg border ${saleType === "Retail" ? "bg-emerald-50 border-emerald-200" : "bg-indigo-50 border-indigo-200"}`}
            >
              <span className="font-medium">{items.length}</span>{" "}
              {saleType === "Wholesale" ? "wholesale" : ""} items
            </div>
            <div className="px-3 py-1 bg-gray-100 rounded-lg border border-gray-200">
              <span className="font-medium">{categories.length}</span>{" "}
              categories
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <div className="flex items-center bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
              <FaSearch className="w-5 h-5 mr-3 text-gray-400" />
              <input
                type="text"
                placeholder={
                  saleType === "Wholesale"
                    ? "Search wholesale items..."
                    : "Search items..."
                }
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (selected?._id) {
                    searchItemsByCategoryAndName(selected._id, e.target.value);
                  }
                }}
                className="bg-transparent outline-none w-full text-gray-700"
              />
            </div>
            {saleType === "Wholesale" && (
              <div className="absolute left-3 -top-2 text-xs bg-indigo-500 text-white px-2 py-0.5 rounded shadow-sm">
                Wholesale Only
              </div>
            )}
          </div>

          <div className="relative">
            <div className="flex items-center bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
              <MdCategory className="w-5 h-5 mr-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search categories..."
                className="bg-transparent outline-none w-full text-gray-700"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="absolute right-3 top-3 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {filteredCategories.length} categories
            </div>
          </div>
        </div>
      </div>

      {/* Desktop: Categories Bar */}
      <div className="hidden lg:block bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            <MdCategory className="text-emerald-600" />
            Categories
            {saleType === "Wholesale" && (
              <span className="text-xs bg-indigo-500 text-white px-2 py-0.5 rounded shadow-sm">
                Wholesale Filter Active
              </span>
            )}
          </h3>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">
              {filteredCategories.length} available
            </span>
            <div
              className={`text-xs px-2 py-1 rounded-full border ${saleType === "Retail" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-indigo-50 text-indigo-700 border-indigo-200"}`}
            >
              Mode: {saleType}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 max-h-[120px] overflow-y-auto p-1">
          {filteredCategories.map((category) => (
            <button
              key={category._id}
              onClick={() => {
                setSelected(category);
                fetchItems(category._id);
              }}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all border flex items-center gap-2
                ${
                  selected?._id === category._id
                    ? saleType === "Retail"
                      ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-emerald-500 shadow-md"
                      : "bg-gradient-to-r from-indigo-400 to-blue-400 text-white border-indigo-400 shadow-md"
                    : "bg-white text-gray-700 hover:bg-gray-50 border-gray-200"
                }`}
            >
              <MdCategory className="text-sm" />
              <span>{category.name}</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-xs ${selected?._id === category._id ? "bg-white/20 text-white" : "bg-gray-200 text-gray-700"}`}
              >
                {category.itemCount || 0}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Items Grid */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h3 className="font-semibold text-gray-800 text-base sm:text-lg flex items-center gap-2">
              <MdInventory
                className={
                  saleType === "Retail" ? "text-emerald-600" : "text-indigo-600"
                }
              />
              {saleType === "Wholesale" ? "Wholesale Items" : "Menu Items"}
              <span className="text-xs sm:text-sm font-normal text-gray-500">
                ({items.length} {saleType === "Wholesale" ? "wholesale" : ""}{" "}
                items)
              </span>
            </h3>
          </div>
          <div className="flex items-center gap-3">
            {saleType === "Wholesale" && (
              <div className="text-xs sm:text-sm bg-indigo-50 px-2 sm:px-3 py-1 rounded-lg border border-indigo-200">
                <FaCube className="inline mr-1 sm:mr-2 text-indigo-600" />
                Package:{" "}
                <span className="font-bold text-indigo-700">
                  {packageSize}
                </span>{" "}
                units
              </div>
            )}
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>In Stock</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span>Low</span>
              </div>
            </div>
          </div>
        </div>

        {saleType === "Wholesale" && items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center bg-white rounded-2xl border border-gray-200 px-4">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-indigo-50 rounded-full flex items-center justify-center mb-4 border border-indigo-100">
              <FaStore className="text-indigo-400 text-2xl sm:text-3xl" />
            </div>
            <h4 className="font-semibold text-gray-700 text-lg sm:text-xl mb-2">
              No Wholesale Items Found
            </h4>
            <p className="text-gray-500 text-sm max-w-sm mb-4">
              No items are enabled for wholesale in this category.
            </p>
            <button
              onClick={() => setSaleType("Retail")}
              className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:shadow-lg transition-all text-sm"
            >
              Switch to Retail Mode
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            {items.map((item) => {
              const currentPrice = getItemPrice(item);
              const profit = getProfitMargin(item);
              const actualQuantity = getActualQuantity(item._id);
              const totalPrice = getTotalPrice(item);
              const expired = isItemExpired(item);
              const expiryDate = item.expiryDate || item.expirationDate;
              const isOutOfStock = item.itemQuantity === 0;

              return (
                <div
                  key={item._id}
                  className={`bg-white rounded-xl shadow-sm hover:shadow-lg border p-3 sm:p-4 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1
                    ${saleType === "Wholesale" ? "hover:border-indigo-300" : "hover:border-emerald-200"}
                    ${expired ? "border-yellow-300 bg-yellow-50/30" : ""}
                    ${isOutOfStock ? "opacity-70" : ""}`}
                >
                  <div className="mb-2 sm:mb-3">
                    <div className="flex justify-between items-start mb-1.5 sm:mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-800 text-sm sm:text-base truncate pr-2">
                          {item.name}
                          {expired && (
                            <span className="ml-1 text-[10px] bg-yellow-500 text-white px-1.5 py-0.5 rounded-full">
                              EXPIRED
                            </span>
                          )}
                          {isOutOfStock && (
                            <span className="ml-1 text-[10px] bg-gray-500 text-white px-1.5 py-0.5 rounded-full">
                              OUT OF STOCK
                            </span>
                          )}
                        </h3>
                        {saleType === "Wholesale" && item.enableWholesale && (
                          <div className="flex flex-wrap items-center gap-1 mt-1">
                            <span className="text-[10px] sm:text-xs bg-indigo-500 text-white px-1.5 sm:px-2 py-0.5 rounded">
                              <FaStore className="inline mr-1 text-[10px]" />{" "}
                              WHOLESALE
                            </span>
                            <span className="text-[10px] sm:text-xs bg-indigo-50 text-indigo-700 px-1.5 sm:px-2 py-0.5 rounded border border-indigo-200">
                              <FaCube className="inline mr-1" /> {packageSize}{" "}
                              units/pkg
                            </span>
                          </div>
                        )}
                      </div>
                      <span
                        className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded ${saleType === "Wholesale" ? "bg-indigo-50 text-indigo-700 border border-indigo-200" : "text-gray-500 bg-gray-100"}`}
                      >
                        {item.category?.name || "General"}
                      </span>
                    </div>

                    {/* Stock and Expiry Info */}
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <div className="flex items-center gap-1 text-xs text-gray-600">
                        <FaWarehouse className="text-gray-400 text-xs" />
                        <span>Stock:</span>
                        <span
                          className={`font-bold ${isOutOfStock ? "text-red-600" : item.itemQuantity <= (item.reOrder || 5) ? "text-yellow-600" : "text-green-600"}`}
                        >
                          {item.itemQuantity.toLocaleString()}
                        </span>
                      </div>
                      {expiryDate && (
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <FaCalendarAlt className="text-gray-400 text-xs" />
                          <span>Expiry:</span>
                          <span
                            className={`font-bold ${expired ? "text-yellow-600" : "text-gray-700"}`}
                          >
                            {formatDate(expiryDate)}
                          </span>
                        </div>
                      )}
                      {item.status === "Expired" && !expiryDate && (
                        <span className="text-[10px] bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded-full">
                          Expired
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-4">
                    <div className="grid grid-cols-2 gap-2">
                      <div
                        className={`rounded-lg p-2 sm:p-3 border ${saleType === "Wholesale" ? "bg-indigo-50 border-indigo-200" : "bg-emerald-50 border-emerald-200"}`}
                      >
                        <div className="flex items-center gap-1 mb-0.5 sm:mb-1">
                          <MdLocalOffer
                            className={
                              saleType === "Wholesale"
                                ? "text-indigo-600"
                                : "text-emerald-600"
                            }
                          />
                          <span className="text-[10px] sm:text-xs text-gray-600">
                            {saleType === "Wholesale" ? "Wholesale" : "Retail"}{" "}
                            Price
                          </span>
                        </div>
                        <div
                          className={`font-bold text-sm sm:text-lg ${saleType === "Wholesale" ? "text-indigo-700" : "text-emerald-700"}`}
                        >
                          Tsh {currentPrice.toLocaleString()}
                          <span className="text-[10px] text-gray-500 ml-1">
                            /unit
                          </span>
                        </div>
                      </div>

                      {saleType === "Wholesale" ? (
                        <div className="bg-blue-50 rounded-lg p-2 sm:p-3 border border-blue-200">
                          <div className="flex items-center gap-1 mb-0.5 sm:mb-1">
                            <FaCube className="text-blue-600 text-xs" />
                            <span className="text-[10px] sm:text-xs text-gray-600">
                              Package Total
                            </span>
                          </div>
                          <div className="font-bold text-sm sm:text-lg text-blue-700">
                            Tsh {(currentPrice * packageSize).toLocaleString()}
                            <span className="text-[10px] text-gray-500 ml-1">
                              /pkg
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-gray-50 rounded-lg p-2 sm:p-3 border border-gray-200">
                          <div className="flex items-center gap-1 mb-0.5 sm:mb-1">
                            <FaTag className="text-gray-600 text-xs" />
                            <span className="text-[10px] sm:text-xs text-gray-600">
                              Buying
                            </span>
                          </div>
                          <div className="font-semibold text-sm sm:text-base text-gray-700">
                            Tsh {item.buyingPrice.toLocaleString()}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Profit/unit:</span>
                      <span
                        className={`font-bold ${profit > 0 ? "text-green-600" : profit === 0 ? "text-yellow-600" : "text-red-600"}`}
                      >
                        Tsh {profit.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex items-center justify-between bg-gray-50 rounded-lg p-1 border border-gray-300">
                      <button
                        onClick={() =>
                          handleQuantityChange(
                            item._id,
                            (itemCounts[item._id] || 1) - 1,
                          )
                        }
                        className="p-2 sm:p-2.5 rounded-lg hover:bg-gray-200 transition-colors"
                        disabled={isOutOfStock}
                      >
                        <FaMinus className="text-gray-600 text-xs sm:text-sm" />
                      </button>

                      <div className="flex flex-col items-center">
                        <input
                          type="number"
                          min="1"
                          className="w-12 sm:w-16 text-center text-base sm:text-lg font-bold text-gray-800 border rounded-md text-sm"
                          value={itemCounts[item._id] || 1}
                          onChange={(e) =>
                            handleQuantityChange(
                              item._id,
                              Number(e.target.value),
                            )
                          }
                          disabled={isOutOfStock}
                        />
                        <span className="text-[10px] text-gray-500">
                          {saleType === "Wholesale" ? "Packages" : "Qty"}
                        </span>
                        {saleType === "Wholesale" && (
                          <span className="text-[10px] text-indigo-600 font-medium">
                            = {actualQuantity} units
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() =>
                          handleQuantityChange(
                            item._id,
                            (itemCounts[item._id] || 1) + 1,
                          )
                        }
                        className="p-2 sm:p-2.5 rounded-lg hover:bg-gray-200 transition-colors"
                        disabled={isOutOfStock}
                      >
                        <FaPlus className="text-gray-600 text-xs sm:text-sm" />
                      </button>
                    </div>

                    <button
                      onClick={() => handleAddCart(item)}
                      disabled={isOutOfStock}
                      className={`w-full py-2.5 sm:py-3 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 hover:scale-105 transform text-sm
                        ${
                          isOutOfStock
                            ? "bg-gray-400 text-white cursor-not-allowed"
                            : saleType === "Wholesale"
                              ? "bg-gradient-to-r from-indigo-400 to-blue-400 text-white hover:from-indigo-500 hover:to-blue-500"
                              : "bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600"
                        }`}
                    >
                      <FaShoppingCart />
                      <span>
                        {isOutOfStock ? "Out of Stock" : `Add (${saleType})`}
                      </span>
                      {!isOutOfStock && (
                        <span className="text-[10px] sm:text-xs bg-white/20 px-1.5 sm:px-2 py-0.5 rounded">
                          Tsh {totalPrice.toLocaleString()}
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {items.length === 0 && saleType !== "Wholesale" && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <FaBox className="text-gray-400 text-xl sm:text-2xl" />
            </div>
            <h4 className="font-semibold text-gray-700 text-base sm:text-lg mb-2">
              No Items Found
            </h4>
            <p className="text-gray-500 text-sm">
              Try changing your search or select a different category
            </p>
          </div>
        )}
      </div>
    </div>
  );

  // ==================== MAIN RENDER ====================
  return (
    <div className="space-y-4 sm:space-y-6 px-3 sm:px-4 lg:px-6 pb-6">
      {/* Tab Navigation */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-1 sm:p-1.5 flex gap-1">
        <button
          onClick={() => setActiveTab("menu")}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 sm:py-3 rounded-xl font-semibold text-sm sm:text-base transition-all duration-300
            ${
              activeTab === "menu"
                ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-200"
                : "text-gray-600 hover:bg-gray-100"
            }`}
        >
          <FaTh className="text-sm sm:text-base" />
          Menu Items
          <span
            className={`text-xs px-2 py-0.5 rounded-full ${
              activeTab === "menu"
                ? "bg-white/20 text-white"
                : "bg-gray-200 text-gray-600"
            }`}
          >
            {items.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab("orders")}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 sm:py-3 rounded-xl font-semibold text-sm sm:text-base transition-all duration-300
            ${
              activeTab === "orders"
                ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-200"
                : "text-gray-600 hover:bg-gray-100"
            }`}
        >
          <FaList className="text-sm sm:text-base" />
          Orders
          <span
            className={`text-xs px-2 py-0.5 rounded-full ${
              activeTab === "orders"
                ? "bg-white/20 text-white"
                : "bg-gray-200 text-gray-600"
            }`}
          >
            {orders.length}
          </span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "menu" ? renderMenuTab() : renderOrdersTab()}
    </div>
  );
};

export default MenuCard;
