// components/MenuCard.jsx
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
  FaMoneyBillWave,
  FaReceipt,
  FaUserCircle,
  FaMobileAlt,
  FaMapMarkerAlt,
  FaInfoCircle,
  FaCreditCard,
  FaShoppingBag,
} from "react-icons/fa";
import {
  MdCategory,
  MdInventory,
  MdLocalOffer,
  MdSwapHoriz,
} from "react-icons/md";
import toast from "react-hot-toast";

import BASE_URL from "../../Utils/config";

const MenuCard = ({ refreshTrigger, onOrderPay }) => {
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
        const allOrders = response.data.data || [];
        const pendingOrders = allOrders.filter(
          (order) => order.status !== "Completed"
        );
        const sortedOrders = pendingOrders.sort(
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
  }, [activeTab, refreshTrigger]);

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
      orderId: null,
      orderNumber: null,
      orderItemId: null,
      fulfillmentStatus: null,
      isFromOrder: false,
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

    if (item.itemExists === false) {
      toast.error(`Item ${item.itemName} no longer exists in inventory`);
      return;
    }

    const price =
      saleType === "Wholesale" ? wholesalePrice || 0 : retailPrice || 0;

    if (!price || price === 0) {
      toast.error(`${item.itemName} has no price set.`);
      return;
    }

    if (saleType === "Wholesale" && !enableWholesale) {
      toast.error(`${item.itemName} is not available for wholesale`);
      return;
    }

    const quantityInUnits = item.quantity * packageSize;
    const cartItem = cartData.find(
      (ci) =>
        ci.id === item.itemId &&
        ci.priceType === saleType &&
        ci.orderId === order._id,
    );
    const alreadyInCart = cartItem ? cartItem.quantity : 0;
    const totalIfAdded = alreadyInCart + quantityInUnits;

    if (totalIfAdded > currentStock) {
      toast.error(
        `Stock of (${item.itemName}) is insufficient. Available: (${currentStock}), Requested: (${totalIfAdded})`,
      );
      return;
    }

    const newObj = {
      id: item.itemId || item.item,
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
      expiryDate: item.expiryDate || null,
      isExpired: false,
      orderId: order._id,
      orderNumber: order.orderNumber,
      orderItemId: item._id,
      fulfillmentStatus: item.fulfillmentStatus,
      isFromOrder: true,
      discount: 0,
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
      Pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
      "Partially Completed": "bg-blue-100 text-blue-800 border-blue-300",
      Completed: "bg-green-100 text-green-800 border-green-300",
      Cancelled: "bg-red-100 text-red-800 border-red-300",
    };
    return statusMap[status] || "bg-gray-100 text-gray-800 border-gray-300";
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Pending":
        return <FaClock className="text-yellow-600" />;
      case "Partially Completed":
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

  // ==================== HANDLE PAY ORDER ====================
  const handlePayOrder = (order) => {
    if (order.status === "Completed") {
      toast.error("This order is already completed");
      return;
    }

    const hasPendingItems = order.items.some(
      (item) => item.fulfillmentStatus === "Pending",
    );

    if (!hasPendingItems) {
      toast.error("All items in this order are already fulfilled");
      return;
    }

    if (onOrderPay) {
      onOrderPay(order);
    } else {
      window.dispatchEvent(
        new CustomEvent("startOrderPayment", { detail: order }),
      );
    }
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
        <div className="flex flex-col items-center justify-center py-16 sm:py-20 text-center bg-white rounded-2xl border-2 border-gray-300 px-4 shadow-lg">
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-emerald-50 rounded-full flex items-center justify-center mb-4 border-2 border-emerald-200">
            <FaCheckCircle className="text-emerald-400 text-3xl sm:text-4xl" />
          </div>
          <h4 className="font-semibold text-gray-700 text-lg sm:text-xl mb-2">
            All Caught Up!
          </h4>
          <p className="text-gray-500 text-sm max-w-sm">
            No pending orders at the moment. New orders will appear here automatically.
          </p>
        </div>
      );
    }

    const displayedOrders = filteredOrders;

    return (
      <div className="space-y-4 sm:space-y-5">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl shadow-lg p-4 sm:p-5 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 sm:p-3 bg-white/20 backdrop-blur-sm rounded-xl border border-white/20">
                <FaShoppingBag className="text-white text-lg sm:text-xl" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base sm:text-lg">Pending Orders</h3>
                <p className="text-emerald-100 text-xs sm:text-sm">
                  <span className="font-semibold text-white">{displayedOrders.length}</span> orders awaiting fulfillment
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:min-w-[200px] md:min-w-[260px]">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60 w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <input
                  type="text"
                  placeholder="Search orders..."
                  value={orderSearchTerm}
                  onChange={(e) => setOrderSearchTerm(e.target.value)}
                  className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/70 outline-none focus:bg-white/30 focus:border-white/50 transition-all text-xs sm:text-sm"
                />
              </div>
              <button
                onClick={toggleSaleType}
                className={`flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-lg hover:shadow-xl whitespace-nowrap
                  ${
                    saleType === "Retail"
                      ? "bg-white text-emerald-700 hover:bg-emerald-50"
                      : "bg-white text-indigo-700 hover:bg-indigo-50"
                  }`}
              >
                {saleType === "Retail" ? <FaUserTie className="text-sm sm:text-base" /> : <FaStore className="text-sm sm:text-base" />}
                {saleType} Mode
              </button>
            </div>
          </div>
        </div>

        {/* Orders Grid */}
        {displayedOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center bg-white rounded-2xl border-2 border-gray-300 px-4 shadow-md">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4 border-2 border-gray-300">
              <FaSearch className="text-gray-400 text-xl sm:text-2xl" />
            </div>
            <h4 className="font-semibold text-gray-700 text-base sm:text-lg mb-2">
              No Orders Found
            </h4>
            <p className="text-gray-500 text-sm">
              No orders match your search "{orderSearchTerm}"
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
            {displayedOrders.map((order) => {
              const isExpanded = expandedOrders[order._id] || false;
              const displayItems = isExpanded
                ? order.items
                : order.items?.slice(0, 2);
              const hasPendingItems = order.items?.some(
                (item) => item.fulfillmentStatus === "Pending",
              );
              const pendingCount = order.items?.filter(
                (item) => item.fulfillmentStatus === "Pending"
              ).length || 0;
              const totalItems = order.items?.length || 0;

              return (
                <div
                  key={order._id}
                  className="bg-white rounded-2xl shadow-lg border-2 border-gray-300 overflow-hidden hover:shadow-xl transition-all duration-300"
                >
                  {/* Order Header */}
                  <div
                    className="px-3 sm:px-4 md:px-5 py-3 sm:py-4 bg-gradient-to-r from-emerald-500 to-teal-500 cursor-pointer hover:from-emerald-600 hover:to-teal-600 transition-colors"
                    onClick={() => toggleOrderExpand(order._id)}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 flex-wrap">
                        <div className="flex items-center gap-1.5 sm:gap-2 bg-white/20 backdrop-blur-sm px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border border-white/20">
                          <FaReceipt className="text-white/80 text-xs sm:text-sm" />
                          <span className="font-mono font-bold text-white text-xs sm:text-sm truncate max-w-[80px] sm:max-w-none">
                            #{order.orderNumber || order._id.slice(-6)}
                          </span>
                        </div>
                        <span
                          className={`inline-flex items-center gap-1 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium border ${getStatusBadge(order.status)}`}
                        >
                          {getStatusIcon(order.status)}
                          <span className="hidden xs:inline">{order.status}</span>
                        </span>
                        <span className="text-[10px] sm:text-xs text-white/90 bg-white/20 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full border border-white/20">
                          {pendingCount}/{totalItems}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                        <div className="text-right">
                          <div className="text-xs sm:text-sm font-bold text-white">
                            {formatCurrency(order.grandTotal || 0)}
                          </div>
                          <div className="text-[8px] sm:text-[10px] text-white/70">
                            {formatDate(order.createdAt)}
                          </div>
                        </div>
                        <button className="p-1 bg-white/20 rounded-lg border border-white/20 hover:bg-white/30 transition-colors">
                          {isExpanded ? (
                            <FaChevronUp className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" />
                          ) : (
                            <FaChevronDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="px-3 sm:px-4 md:px-5 py-2 sm:py-3 bg-gray-100 border-b-2 border-gray-300 flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                    <div className="flex items-center gap-1.5 sm:gap-2 bg-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border-2 border-gray-300 shadow-sm">
                      <FaUser className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-600" />
                      <span className="font-medium text-gray-700 text-xs sm:text-sm truncate max-w-[80px] sm:max-w-none">
                        {order.customerName || "Guest"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2 bg-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border-2 border-gray-300 shadow-sm">
                      <FaPhone className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-600" />
                      <span className="text-gray-600 text-xs sm:text-sm">{order.customerPhone || "N/A"}</span>
                    </div>
                    {order.paymentStatus && (
                      <span className={`text-[10px] sm:text-xs px-2 sm:px-3 py-1 rounded-lg font-medium border-2 shadow-sm ${
                        order.paymentStatus === "Paid" 
                          ? "bg-green-100 text-green-700 border-green-300" 
                          : "bg-yellow-100 text-yellow-700 border-yellow-300"
                      }`}>
                        {order.paymentStatus}
                        {order.balance > 0 && (
                          <span className="ml-1 text-red-600 font-semibold">
                            (Bal: {formatCurrency(order.balance)})
                          </span>
                        )}
                      </span>
                    )}
                  </div>

                  {/* Order Items */}
                  <div className="p-2 sm:p-3 space-y-1.5 sm:space-y-2 bg-gray-50">
                    {displayItems?.map((item, index) => {
                      const currentStock =
                        item.currentStock !== undefined ? item.currentStock : 0;
                      const isFulfilled =
                        item.fulfillmentStatus === "Completed";
                      const itemExists =
                        item.itemExists !== undefined ? item.itemExists : true;
                      const isInStock = currentStock > 0;
                      const retailPrice = item.retailPrice || 0;
                      const wholesalePrice = item.wholesalePrice || 0;
                      const hasPrice = saleType === "Retail" ? retailPrice > 0 : wholesalePrice > 0;
                      const canAdd = isInStock && hasPrice && zuiaAdd && itemExists && !isFulfilled;

                      return (
                        <div
                          key={`${order._id}_${item._id}`}
                          className={`flex flex-col xs:flex-row xs:items-center justify-between gap-2 xs:gap-3 p-2 sm:p-3 rounded-xl border-2 transition-all ${
                            isFulfilled
                              ? "bg-green-50 border-green-300"
                              : "bg-white border-gray-300 hover:border-emerald-400 hover:shadow-md"
                          }`}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                              <span className={`font-semibold text-xs sm:text-sm ${
                                isFulfilled ? "text-green-700" : "text-gray-800"
                              }`}>
                                {item.itemName}
                              </span>
                              {isFulfilled && (
                                <span className="text-[8px] sm:text-[10px] bg-green-200 text-green-700 px-1.5 sm:px-2 py-0.5 rounded-full flex items-center gap-1 font-medium">
                                  <FaCheckCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                  <span className="hidden xs:inline">Fulfilled</span>
                                </span>
                              )}
                              {!isFulfilled && !isInStock && (
                                <span className="text-[8px] sm:text-[10px] bg-red-100 text-red-700 px-1.5 sm:px-2 py-0.5 rounded-full font-medium">
                                  Out of Stock
                                </span>
                              )}
                              {!itemExists && !isFulfilled && (
                                <span className="text-[8px] sm:text-[10px] bg-gray-200 text-gray-600 px-1.5 sm:px-2 py-0.5 rounded-full font-medium">
                                  Not Found
                                </span>
                              )}
                            </div>
                            <div className="flex flex-wrap items-center gap-1.5 sm:gap-3 mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-gray-600">
                              <span className="bg-gray-200 px-1.5 sm:px-2 py-0.5 rounded font-medium">
                                Qty: <span className="font-bold text-gray-800">{item.quantity}</span>
                              </span>
                              <span className="bg-gray-200 px-1.5 sm:px-2 py-0.5 rounded font-bold text-gray-800">
                                {formatCurrency(item.totalPrice || 0)}
                              </span>
                              {!isFulfilled && itemExists && (
                                <span className="bg-gray-200 px-1.5 sm:px-2 py-0.5 rounded flex items-center gap-1">
                                  <FaWarehouse className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-gray-500" />
                                  <span className={isInStock ? "text-green-600 font-bold" : "text-red-600 font-bold"}>
                                    {currentStock}
                                  </span>
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Add to Cart Button */}
                          {!isFulfilled && (
                            <button
                              onClick={() => {
                                if (!canAdd) {
                                  if (!zuiaAdd) {
                                    toast.error("Please complete the current transaction first");
                                    return;
                                  }
                                  if (!itemExists) {
                                    toast.error(`Item ${item.itemName} no longer exists`);
                                    return;
                                  }
                                  if (!isInStock) {
                                    toast.error(`${item.itemName} is out of stock`);
                                    return;
                                  }
                                  if (!hasPrice) {
                                    toast.error(`${item.itemName} has no price set`);
                                    return;
                                  }
                                  return;
                                }
                                handleAddOrderItemToCart(order, item);
                              }}
                              disabled={!canAdd}
                              className={`px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1 sm:gap-1.5 shadow-sm hover:shadow-md flex-shrink-0
                                ${
                                  !canAdd
                                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                    : saleType === "Wholesale"
                                      ? "bg-gradient-to-r from-indigo-500 to-blue-500 text-white hover:from-indigo-600 hover:to-blue-600"
                                      : "bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600"
                                }`}
                            >
                              <FaShoppingCart className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                              <span className="hidden xs:inline">
                                {!itemExists ? "Not Found" : !isInStock ? "Out of Stock" : !hasPrice ? "No Price" : "Add to Cart"}
                              </span>
                              <span className="xs:hidden">
                                {!itemExists ? "Not Found" : !isInStock ? "Out of Stock" : !hasPrice ? "No Price" : "Add"}
                              </span>
                            </button>
                          )}
                        </div>
                      );
                    })}

                    {/* Show more/less */}
                    {totalItems > 2 && (
                      <button
                        onClick={() => toggleOrderExpand(order._id)}
                        className="w-full text-center text-xs sm:text-sm text-emerald-600 hover:text-emerald-700 font-medium py-2 sm:py-2.5 bg-white hover:bg-gray-100 rounded-xl border-2 border-gray-300 transition-colors"
                      >
                        {isExpanded ? (
                          <span className="flex items-center justify-center gap-1.5 sm:gap-2">
                            Show less <FaChevronUp className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                          </span>
                        ) : (
                          <span className="flex items-center justify-center gap-1.5 sm:gap-2">
                            View {totalItems - 2} more items <FaChevronDown className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                          </span>
                        )}
                      </button>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="px-3 sm:px-4 md:px-5 py-2 sm:py-3 bg-gray-100 border-t-2 border-gray-300 flex flex-col xs:flex-row xs:items-center justify-between gap-1.5 sm:gap-2">
                    <div className="text-[10px] sm:text-xs text-gray-600">
                      <span className="font-medium">Created:</span> {new Date(order.createdAt).toLocaleString()}
                    </div>
                    {order.status !== "Completed" && hasPendingItems && (
                      <div className="text-[10px] sm:text-xs bg-emerald-100 text-emerald-700 px-2 sm:px-3 py-1 rounded-lg font-medium border-2 border-emerald-300 flex items-center gap-1">
                        <FaClock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                        {pendingCount} item{pendingCount > 1 ? 's' : ''} pending
                      </div>
                    )}
                    {order.status === "Completed" && (
                      <span className="text-[10px] sm:text-xs bg-green-100 text-green-700 px-2 sm:px-3 py-1 rounded-lg font-medium border-2 border-green-300 flex items-center gap-1">
                        <FaCheckCircle className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
                        Completed
                      </span>
                    )}
                  </div>
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
    <div className="space-y-3 sm:space-y-4">
      {/* Mobile: Top Bar */}
      <div className="lg:hidden flex items-center justify-between bg-white rounded-xl shadow-md border-2 border-gray-300 p-2.5 sm:p-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCategories(!showCategories)}
            className="p-1.5 sm:p-2 bg-emerald-100 hover:bg-emerald-200 rounded-lg text-emerald-700 transition-colors border-2 border-emerald-200"
          >
            <FaBars className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
          <span className="font-semibold text-gray-800 text-xs sm:text-sm truncate max-w-[120px] sm:max-w-[200px]">
            {selected?.name || "All Categories"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="p-1.5 sm:p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 transition-colors border-2 border-gray-300"
          >
            <FaFilter className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
          <span className="text-[10px] sm:text-xs text-gray-500 bg-gray-100 px-1.5 sm:px-2 py-1 rounded-full border-2 border-gray-300">
            {items.length}
          </span>
        </div>
      </div>

      {/* Mobile: Collapsible Categories */}
      <div className={`lg:hidden ${showCategories ? "block" : "hidden"}`}>
        <div className="bg-white rounded-xl shadow-md border-2 border-gray-300 p-2.5 sm:p-3 mb-3 sm:mb-4">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <h3 className="font-semibold text-gray-800 text-xs sm:text-sm flex items-center gap-2">
              <MdCategory className="text-emerald-600" />
              Categories
            </h3>
            <button
              onClick={() => setShowCategories(false)}
              className="p-1 text-gray-400 hover:text-gray-600"
            >
              <FaTimes className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5 sm:gap-2 max-h-[160px] sm:max-h-[200px] overflow-y-auto">
            {filteredCategories.map((category) => (
              <button
                key={category._id}
                onClick={() => {
                  setSelected(category);
                  fetchItems(category._id);
                  setShowCategories(false);
                }}
                className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-xs font-medium transition-all border-2 flex items-center gap-1 sm:gap-1.5
                  ${
                    selected?._id === category._id
                      ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-emerald-500 shadow-md"
                      : "bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-300"
                  }`}
              >
                <MdCategory className="text-[10px] sm:text-xs" />
                <span className="truncate max-w-[60px] sm:max-w-[100px]">{category.name}</span>
                <span
                  className={`px-1 py-0.5 rounded-full text-[8px] sm:text-[10px] ${selected?._id === category._id ? "bg-white/20 text-white" : "bg-gray-200 text-gray-600"}`}
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
        <div className="bg-white rounded-xl shadow-md border-2 border-gray-300 p-2.5 sm:p-3 mb-3 sm:mb-4">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <h3 className="font-semibold text-gray-800 text-xs sm:text-sm">Filters</h3>
            <button
              onClick={() => setShowFilters(false)}
              className="p-1 text-gray-400 hover:text-gray-600"
            >
              <FaTimes className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-2 mb-2 sm:mb-3">
            <span className="text-[10px] sm:text-xs text-gray-600">Mode:</span>
            <button
              onClick={toggleSaleType}
              className={`flex items-center gap-1 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-medium transition-all border-2
                ${
                  saleType === "Retail"
                    ? "bg-emerald-500 text-white border-emerald-400"
                    : "bg-indigo-500 text-white border-indigo-400"
                }`}
            >
              {saleType === "Retail" ? <FaUserTie className="text-xs sm:text-sm" /> : <FaStore className="text-xs sm:text-sm" />}
              {saleType}
            </button>
          </div>

          <div className="relative mb-2 sm:mb-3">
            <FaSearch className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
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
              className="w-full pl-8 sm:pl-9 pr-2.5 sm:pr-3 py-1.5 sm:py-2 bg-gray-50 rounded-lg text-[10px] sm:text-sm border-2 border-gray-300 focus:border-emerald-400 focus:outline-none"
            />
          </div>

          {saleType === "Wholesale" && (
            <div className="flex items-center gap-2">
              <span className="text-[10px] sm:text-xs text-gray-600">Package:</span>
              <select
                value={packageSize}
                onChange={(e) => setPackageSize(Number(e.target.value))}
                className="bg-gray-50 border-2 border-gray-300 rounded-lg px-1.5 sm:px-2 py-1 sm:py-1.5 text-[10px] sm:text-sm"
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
      <div className="hidden lg:block bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl shadow-lg p-4 xl:p-5 text-white">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3 xl:mb-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm text-emerald-100 font-medium">Sale Mode:</span>
            <button
              onClick={toggleSaleType}
              className={`flex items-center gap-2 px-3 xl:px-4 py-1.5 xl:py-2 rounded-xl font-medium transition-all shadow-lg border hover:scale-105 transform text-sm
                ${
                  saleType === "Retail"
                    ? "bg-white text-emerald-700 border-emerald-300 hover:bg-emerald-50"
                    : "bg-white text-indigo-700 border-indigo-300 hover:bg-indigo-50"
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

          <div className="flex flex-wrap items-center gap-3 text-sm">
            <div
              className={`px-3 py-1 rounded-lg border ${saleType === "Retail" ? "bg-emerald-500/30 border-emerald-400 text-white" : "bg-indigo-500/30 border-indigo-400 text-white"}`}
            >
              <span className="font-medium">{items.length}</span>{" "}
              {saleType === "Wholesale" ? "wholesale" : ""} items
            </div>
            <div className="px-3 py-1 bg-white/20 rounded-lg border border-white/30 text-white">
              <span className="font-medium">{categories.length}</span>{" "}
              categories
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 xl:gap-4">
          <div className="relative">
            <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-xl px-3 xl:px-4 py-2.5 xl:py-3 border border-white/30">
              <FaSearch className="w-4 xl:w-5 h-4 xl:h-5 mr-2 xl:mr-3 text-white/60" />
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
                className="bg-transparent outline-none w-full text-white placeholder-white/60 text-sm"
              />
            </div>
            {saleType === "Wholesale" && (
              <div className="absolute left-3 -top-2 text-xs bg-indigo-500 text-white px-2 py-0.5 rounded shadow-sm">
                Wholesale Only
              </div>
            )}
          </div>

          <div className="relative">
            <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-xl px-3 xl:px-4 py-2.5 xl:py-3 border border-white/30">
              <MdCategory className="w-4 xl:w-5 h-4 xl:h-5 mr-2 xl:mr-3 text-white/60" />
              <input
                type="text"
                placeholder="Search categories..."
                className="bg-transparent outline-none w-full text-white placeholder-white/60 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="absolute right-3 top-2.5 xl:top-3 text-xs text-white/70 bg-white/20 px-2 py-1 rounded">
              {filteredCategories.length}
            </div>
          </div>
        </div>
      </div>

      {/* Desktop: Categories Bar */}
      <div className="hidden lg:block bg-white rounded-2xl shadow-md border-2 border-gray-300 p-3 xl:p-4">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2 xl:mb-3">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2 text-sm xl:text-base">
            <MdCategory className="text-emerald-600" />
            Categories
            {saleType === "Wholesale" && (
              <span className="text-xs bg-indigo-500 text-white px-2 py-0.5 rounded shadow-sm">
                Wholesale Filter Active
              </span>
            )}
          </h3>
          <div className="flex flex-wrap items-center gap-2 xl:gap-3">
            <span className="text-xs xl:text-sm text-gray-500">
              {filteredCategories.length} available
            </span>
            <div
              className={`text-[10px] xl:text-xs px-2 py-1 rounded-full border-2 ${saleType === "Retail" ? "bg-emerald-50 text-emerald-700 border-emerald-300" : "bg-indigo-50 text-indigo-700 border-indigo-300"}`}
            >
              Mode: {saleType}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5 xl:gap-2 max-h-[100px] xl:max-h-[120px] overflow-y-auto p-1">
          {filteredCategories.map((category) => (
            <button
              key={category._id}
              onClick={() => {
                setSelected(category);
                fetchItems(category._id);
              }}
              className={`px-2.5 xl:px-4 py-1.5 xl:py-2.5 rounded-xl text-[10px] xl:text-sm font-medium transition-all border-2 flex items-center gap-1.5 xl:gap-2
                ${
                  selected?._id === category._id
                    ? saleType === "Retail"
                      ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-emerald-500 shadow-md"
                      : "bg-gradient-to-r from-indigo-400 to-blue-400 text-white border-indigo-400 shadow-md"
                    : "bg-white text-gray-700 hover:bg-gray-50 border-gray-300"
                }`}
            >
              <MdCategory className="text-[10px] xl:text-sm" />
              <span>{category.name}</span>
              <span
                className={`px-1 py-0.5 rounded-full text-[8px] xl:text-xs ${selected?._id === category._id ? "bg-white/20 text-white" : "bg-gray-200 text-gray-700"}`}
              >
                {category.itemCount || 0}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Items Grid */}
      <div className="space-y-3 sm:space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <h3 className="font-semibold text-gray-800 text-sm sm:text-base lg:text-lg flex items-center gap-2">
              <MdInventory
                className={
                  saleType === "Retail" ? "text-emerald-600" : "text-indigo-600"
                }
              />
              {saleType === "Wholesale" ? "Wholesale Items" : "Menu Items"}
              <span className="text-[10px] sm:text-xs lg:text-sm font-normal text-gray-500">
                ({items.length} {saleType === "Wholesale" ? "wholesale" : ""}{" "}
                items)
              </span>
            </h3>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {saleType === "Wholesale" && (
              <div className="text-[10px] sm:text-xs lg:text-sm bg-indigo-50 px-1.5 sm:px-2 lg:px-3 py-0.5 sm:py-1 rounded-lg border-2 border-indigo-300">
                <FaCube className="inline mr-1 sm:mr-2 text-indigo-600 text-xs" />
                Package:{" "}
                <span className="font-bold text-indigo-700">
                  {packageSize}
                </span>{" "}
                units
              </div>
            )}
            <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-gray-600">
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full"></div>
                <span className="hidden xs:inline">In Stock</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-yellow-500 rounded-full"></div>
                <span className="hidden xs:inline">Low</span>
              </div>
            </div>
          </div>
        </div>

        {saleType === "Wholesale" && items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center bg-white rounded-2xl border-2 border-gray-300 px-4 shadow-md">
            <div className="w-16 h-16 sm:w-20 sm:h-24 bg-indigo-50 rounded-full flex items-center justify-center mb-3 sm:mb-4 border-2 border-indigo-200">
              <FaStore className="text-indigo-400 text-2xl sm:text-3xl" />
            </div>
            <h4 className="font-semibold text-gray-700 text-base sm:text-lg lg:text-xl mb-2">
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
          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
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
                  className={`bg-white rounded-2xl shadow-md hover:shadow-xl border-2 p-3 sm:p-4 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1
                    ${saleType === "Wholesale" ? "hover:border-indigo-400" : "hover:border-emerald-400"}
                    ${expired ? "border-yellow-400 bg-yellow-50/30" : "border-gray-300"}
                    ${isOutOfStock ? "opacity-70" : ""}`}
                >
                  <div className="mb-2 sm:mb-3">
                    <div className="flex justify-between items-start mb-1.5 sm:mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-800 text-xs sm:text-sm lg:text-base truncate pr-2">
                          {item.name}
                          {expired && (
                            <span className="ml-1 text-[8px] sm:text-[10px] bg-yellow-500 text-white px-1 py-0.5 rounded-full">
                              EXPIRED
                            </span>
                          )}
                          {isOutOfStock && (
                            <span className="ml-1 text-[8px] sm:text-[10px] bg-gray-500 text-white px-1 py-0.5 rounded-full">
                              OUT OF STOCK
                            </span>
                          )}
                        </h3>
                        {saleType === "Wholesale" && item.enableWholesale && (
                          <div className="flex flex-wrap items-center gap-1 mt-1">
                            <span className="text-[8px] sm:text-[10px] lg:text-xs bg-indigo-500 text-white px-1.5 sm:px-2 py-0.5 rounded">
                              <FaStore className="inline mr-1 text-[8px] sm:text-[10px]" />{" "}
                              WHOLESALE
                            </span>
                            <span className="text-[8px] sm:text-[10px] lg:text-xs bg-indigo-50 text-indigo-700 px-1.5 sm:px-2 py-0.5 rounded border-2 border-indigo-300">
                              <FaCube className="inline mr-1" /> {packageSize}{" "}
                              units/pkg
                            </span>
                          </div>
                        )}
                      </div>
                      <span
                        className={`text-[8px] sm:text-[10px] lg:text-xs px-1.5 sm:px-2 py-0.5 rounded border-2 ${saleType === "Wholesale" ? "bg-indigo-50 text-indigo-700 border-indigo-300" : "text-gray-500 bg-gray-100 border-gray-300"}`}
                      >
                        {item.category?.name || "General"}
                      </span>
                    </div>

                    {/* Stock and Expiry Info */}
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-2">
                      <div className="flex items-center gap-1 text-[10px] sm:text-xs text-gray-600 bg-gray-100 px-1.5 sm:px-2 py-0.5 rounded border-2 border-gray-300">
                        <FaWarehouse className="text-gray-500 text-[10px] sm:text-xs" />
                        <span>Stock:</span>
                        <span
                          className={`font-bold ${isOutOfStock ? "text-red-600" : item.itemQuantity <= (item.reOrder || 5) ? "text-yellow-600" : "text-green-600"}`}
                        >
                          {item.itemQuantity.toLocaleString()}
                        </span>
                      </div>
                      {expiryDate && (
                        <div className="flex items-center gap-1 text-[10px] sm:text-xs text-gray-600 bg-gray-100 px-1.5 sm:px-2 py-0.5 rounded border-2 border-gray-300">
                          <FaCalendarAlt className="text-gray-500 text-[10px] sm:text-xs" />
                          <span>Expiry:</span>
                          <span
                            className={`font-bold ${expired ? "text-yellow-600" : "text-gray-700"}`}
                          >
                            {formatDate(expiryDate)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-4">
                    <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                      <div
                        className={`rounded-xl p-2 sm:p-3 border-2 ${saleType === "Wholesale" ? "bg-indigo-50 border-indigo-300" : "bg-emerald-50 border-emerald-300"}`}
                      >
                        <div className="flex items-center gap-1 mb-0.5 sm:mb-1">
                          <MdLocalOffer
                            className={
                              saleType === "Wholesale"
                                ? "text-indigo-600 text-[10px] sm:text-xs"
                                : "text-emerald-600 text-[10px] sm:text-xs"
                            }
                          />
                          <span className="text-[8px] sm:text-[10px] lg:text-xs text-gray-600">
                            {saleType === "Wholesale" ? "Wholesale" : "Retail"}{" "}
                            Price
                          </span>
                        </div>
                        <div
                          className={`font-bold text-xs sm:text-sm lg:text-lg ${saleType === "Wholesale" ? "text-indigo-700" : "text-emerald-700"}`}
                        >
                          Tsh {currentPrice.toLocaleString()}
                          <span className="text-[8px] sm:text-[10px] text-gray-500 ml-1">
                            /unit
                          </span>
                        </div>
                      </div>

                      {saleType === "Wholesale" ? (
                        <div className="bg-blue-50 rounded-xl p-2 sm:p-3 border-2 border-blue-300">
                          <div className="flex items-center gap-1 mb-0.5 sm:mb-1">
                            <FaCube className="text-blue-600 text-[10px] sm:text-xs" />
                            <span className="text-[8px] sm:text-[10px] lg:text-xs text-gray-600">
                              Package Total
                            </span>
                          </div>
                          <div className="font-bold text-xs sm:text-sm lg:text-lg text-blue-700">
                            Tsh {(currentPrice * packageSize).toLocaleString()}
                            <span className="text-[8px] sm:text-[10px] text-gray-500 ml-1">
                              /pkg
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-gray-100 rounded-xl p-2 sm:p-3 border-2 border-gray-300">
                          <div className="flex items-center gap-1 mb-0.5 sm:mb-1">
                            <FaTag className="text-gray-600 text-[10px] sm:text-xs" />
                            <span className="text-[8px] sm:text-[10px] lg:text-xs text-gray-600">
                              Buying
                            </span>
                          </div>
                          <div className="font-semibold text-xs sm:text-sm lg:text-base text-gray-700">
                            Tsh {item.buyingPrice.toLocaleString()}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-[10px] sm:text-xs bg-gray-50 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border-2 border-gray-300">
                      <span className="text-gray-600">Profit/unit:</span>
                      <span
                        className={`font-bold ${profit > 0 ? "text-green-600" : profit === 0 ? "text-yellow-600" : "text-red-600"}`}
                      >
                        Tsh {profit.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex items-center justify-between bg-gray-100 rounded-xl p-1 border-2 border-gray-300">
                      <button
                        onClick={() =>
                          handleQuantityChange(
                            item._id,
                            (itemCounts[item._id] || 1) - 1,
                          )
                        }
                        className="p-1.5 sm:p-2.5 rounded-lg hover:bg-gray-200 transition-colors"
                        disabled={isOutOfStock}
                      >
                        <FaMinus className="text-gray-600 text-[10px] sm:text-sm" />
                      </button>

                      <div className="flex flex-col items-center">
                        <input
                          type="number"
                          min="1"
                          className="w-10 sm:w-14 text-center text-sm sm:text-lg font-bold text-gray-800 border-2 border-gray-300 rounded-lg text-[10px] sm:text-sm bg-white"
                          value={itemCounts[item._id] || 1}
                          onChange={(e) =>
                            handleQuantityChange(
                              item._id,
                              Number(e.target.value),
                            )
                          }
                          disabled={isOutOfStock}
                        />
                        <span className="text-[8px] sm:text-[10px] text-gray-500">
                          {saleType === "Wholesale" ? "Packages" : "Qty"}
                        </span>
                        {saleType === "Wholesale" && (
                          <span className="text-[8px] sm:text-[10px] text-indigo-600 font-medium">
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
                        className="p-1.5 sm:p-2.5 rounded-lg hover:bg-gray-200 transition-colors"
                        disabled={isOutOfStock}
                      >
                        <FaPlus className="text-gray-600 text-[10px] sm:text-sm" />
                      </button>
                    </div>

                    <button
                      onClick={() => handleAddCart(item)}
                      disabled={isOutOfStock}
                      className={`w-full py-2 sm:py-3 rounded-xl font-bold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-1.5 sm:gap-2 hover:scale-105 transform text-[10px] sm:text-sm
                        ${
                          isOutOfStock
                            ? "bg-gray-400 text-white cursor-not-allowed"
                            : saleType === "Wholesale"
                              ? "bg-gradient-to-r from-indigo-500 to-blue-500 text-white hover:from-indigo-600 hover:to-blue-600"
                              : "bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600"
                        }`}
                    >
                      <FaShoppingCart className="text-xs sm:text-sm" />
                      <span>
                        {isOutOfStock ? "Out of Stock" : `Add (${saleType})`}
                      </span>
                      {!isOutOfStock && (
                        <span className="text-[8px] sm:text-[10px] bg-white/20 px-1.5 sm:px-2 py-0.5 rounded-full">
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
      </div>
    </div>
  );

  // ==================== MAIN RENDER ====================
  return (
    <div className="space-y-3 sm:space-y-4 lg:space-y-6 px-2 sm:px-3 lg:px-4 xl:px-6 pb-4 sm:pb-6">
      {/* Tab Navigation */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl shadow-lg p-1.5 flex gap-1.5">
        <button
          onClick={() => setActiveTab("menu")}
          className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-2 sm:py-3 rounded-xl font-semibold text-xs sm:text-sm lg:text-base transition-all duration-300
            ${
              activeTab === "menu"
                ? "bg-white text-emerald-700 shadow-lg"
                : "text-white/70 hover:text-white hover:bg-white/10"
            }`}
        >
          <FaTh className="text-xs sm:text-sm lg:text-base" />
          <span className="hidden xs:inline">Menu Items</span>
          <span className="xs:hidden">Menu</span>
          <span
            className={`text-[8px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full ${
              activeTab === "menu"
                ? "bg-emerald-100 text-emerald-700"
                : "bg-white/20 text-white/70"
            }`}
          >
            {items.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab("orders")}
          className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-2 sm:py-3 rounded-xl font-semibold text-xs sm:text-sm lg:text-base transition-all duration-300
            ${
              activeTab === "orders"
                ? "bg-white text-emerald-700 shadow-lg"
                : "text-white/70 hover:text-white hover:bg-white/10"
            }`}
        >
          <FaList className="text-xs sm:text-sm lg:text-base" />
          <span className="hidden xs:inline">Orders</span>
          <span className="xs:hidden">Orders</span>
          <span
            className={`text-[8px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full ${
              activeTab === "orders"
                ? "bg-emerald-100 text-emerald-700"
                : "bg-white/20 text-white/70"
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