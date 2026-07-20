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
  FaStar,
  FaTrophy,
  FaGift,
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
          (order) => order.status !== "Completed",
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
      Pending: "bg-amber-50 text-amber-700 border-amber-200",
      "Partially Completed": "bg-sky-50 text-sky-700 border-sky-200",
      Completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
      Cancelled: "bg-rose-50 text-rose-700 border-rose-200",
    };
    return statusMap[status] || "bg-gray-50 text-gray-700 border-gray-200";
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Pending":
        return <FaClock className="text-amber-600" />;
      case "Partially Completed":
        return <FaSpinner className="text-sky-600 animate-spin" />;
      case "Completed":
        return <FaCheckCircle className="text-emerald-600" />;
      case "Cancelled":
        return <FaTimes className="text-rose-600" />;
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
          <div className="w-16 h-16 sm:w-20 sm:h-20 border-4 border-emerald-100 border-t-emerald-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <FaShoppingCart className="text-emerald-500 text-lg sm:text-xl" />
          </div>
        </div>
        <p className="mt-4 text-gray-500 font-medium text-sm sm:text-base">
          Loading All Items...
        </p>
      </div>
    );
  }

  // ==================== RENDER ORDERS TAB - PREMIUM COOL DESIGN ====================
  const renderOrdersTab = () => {
    if (ordersLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-20 px-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-emerald-100 border-t-emerald-500 rounded-full animate-spin"></div>
          </div>
          <p className="mt-4 text-gray-500 font-medium">Loading orders...</p>
        </div>
      );
    }

    if (orders.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16 sm:py-20 text-center bg-gradient-to-br from-white to-emerald-50 rounded-2xl border-2 border-emerald-200 px-4 shadow-lg">
          <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-4 border-4 border-emerald-200">
            <FaTrophy className="text-emerald-500 text-4xl" />
          </div>
          <h4 className="font-bold text-gray-800 text-xl mb-2">
            All Caught Up! 🎉
          </h4>
          <p className="text-gray-500 text-sm max-w-sm">
            No pending orders at the moment. Everything is fulfilled and ready
            to go!
          </p>
        </div>
      );
    }

    const displayedOrders = filteredOrders;

    return (
      <div className="space-y-5">
        {/* Header - Green gradient (this is the main accent) */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl shadow-lg p-5 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl border-2 border-white/20">
                <FaShoppingBag className="text-white text-xl" />
              </div>
              <div>
                <h3 className="font-bold text-white text-lg">
                  📦 Pending Orders
                </h3>
                <p className="text-emerald-100 text-sm">
                  <span className="font-semibold text-white">
                    {displayedOrders.length}
                  </span>{" "}
                  orders awaiting fulfillment
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:min-w-[220px]">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60" />
                <input
                  type="text"
                  placeholder="Search orders..."
                  value={orderSearchTerm}
                  onChange={(e) => setOrderSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-xl text-white placeholder-white/70 outline-none focus:bg-white/30 focus:border-white/50 transition-all text-sm"
                />
              </div>
              <button
                onClick={toggleSaleType}
                className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md hover:shadow-lg whitespace-nowrap
                  ${
                    saleType === "Retail"
                      ? "bg-white text-emerald-700 hover:bg-emerald-50"
                      : "bg-white text-emerald-700 hover:bg-emerald-50"
                  }`}
              >
                {saleType === "Retail" ? <FaUserTie /> : <FaStore />}
                {saleType} Mode
              </button>
            </div>
          </div>
        </div>

        {/* Orders Grid - SUPER COOL CARDS */}
        {displayedOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center bg-white rounded-2xl border-2 border-gray-200 px-4 shadow-sm">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 border-2 border-gray-200">
              <FaSearch className="text-gray-400 text-2xl" />
            </div>
            <h4 className="font-semibold text-gray-700 text-lg mb-2">
              No Orders Found
            </h4>
            <p className="text-gray-400 text-sm">
              No orders match your search "{orderSearchTerm}"
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {displayedOrders.map((order) => {
              const isExpanded = expandedOrders[order._id] || false;
              const displayItems = isExpanded
                ? order.items
                : order.items?.slice(0, 2);
              const hasPendingItems = order.items?.some(
                (item) => item.fulfillmentStatus === "Pending",
              );
              const pendingCount =
                order.items?.filter(
                  (item) => item.fulfillmentStatus === "Pending",
                ).length || 0;
              const totalItems = order.items?.length || 0;

              return (
                <div
                  key={order._id}
                  className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl border-2 border-gray-200 hover:border-emerald-300 overflow-hidden transition-all duration-300 hover:-translate-y-2"
                >
                  {/* Premium glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/0 to-emerald-50/0 group-hover:from-emerald-50/30 group-hover:to-teal-50/30 transition-all duration-500 pointer-events-none"></div>

                  {/* Decorative corner accent */}
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-emerald-400/10 to-transparent rounded-bl-full pointer-events-none"></div>

                  {/* Order Header - Premium gradient with pattern */}
                  <div
                    className="relative px-5 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 cursor-pointer hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 overflow-hidden"
                    onClick={() => toggleOrderExpand(order._id)}
                  >
                    {/* Background pattern overlay */}
                    <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC40Ij48cGF0aCBkPSJNMzYgMzR2LTRoNHY0aC00em0wIDB2LTRoLTR2NGg0eiIvPjwvZz48L2c+PC9zdmc+')]"></div>

                    <div className="relative flex items-center justify-between gap-2">
                      <div className="flex items-center gap-3 min-w-0 flex-1 flex-wrap">
                        <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-lg border-2 border-white/20">
                          <FaReceipt className="text-white/80 text-sm" />
                          <span className="font-mono font-bold text-white text-sm truncate max-w-[100px]">
                            #{order.orderNumber || order._id.slice(-6)}
                          </span>
                        </div>
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border-2 shadow-sm ${getStatusBadge(order.status)}`}
                        >
                          {getStatusIcon(order.status)}
                          <span>{order.status}</span>
                        </span>
                        <span className="text-xs text-white/90 bg-white/20 px-2.5 py-1 rounded-full border-2 border-white/20 font-semibold">
                          {pendingCount}/{totalItems}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="text-right">
                          <div className="text-sm font-bold text-white">
                            {formatCurrency(order.grandTotal || 0)}
                          </div>
                          <div className="text-[10px] text-white/70">
                            {formatDate(order.createdAt)}
                          </div>
                        </div>
                        <button className="p-1.5 bg-white/20 rounded-lg border-2 border-white/20 hover:bg-white/30 transition-all duration-200 group-hover:scale-110">
                          {isExpanded ? (
                            <FaChevronUp className="w-3.5 h-3.5 text-white" />
                          ) : (
                            <FaChevronDown className="w-3.5 h-3.5 text-white" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Customer Info - Premium grey with icons */}
                  <div className="px-5 py-3 bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200 flex flex-wrap items-center gap-3 text-sm">
                    <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border-2 border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                      <div className="p-1 bg-emerald-100 rounded-full">
                        <FaUser className="w-3 h-3 text-emerald-600" />
                      </div>
                      <span className="font-semibold text-gray-700 truncate max-w-[80px]">
                        {order.customerName || "Guest"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border-2 border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                      <div className="p-1 bg-emerald-100 rounded-full">
                        <FaPhone className="w-3 h-3 text-emerald-600" />
                      </div>
                      <span className="text-gray-600">
                        {order.customerPhone || "N/A"}
                      </span>
                    </div>
                    {order.paymentStatus && (
                      <span
                        className={`text-xs px-3 py-1.5 rounded-lg font-bold border-2 shadow-sm ${
                          order.paymentStatus === "Paid"
                            ? "bg-emerald-100 text-emerald-700 border-emerald-300"
                            : "bg-amber-100 text-amber-700 border-amber-300"
                        }`}
                      >
                        {order.paymentStatus}
                        {order.balance > 0 && (
                          <span className="ml-1 text-rose-600 font-bold">
                            (Bal: {formatCurrency(order.balance)})
                          </span>
                        )}
                      </span>
                    )}
                  </div>

                  {/* Order Items - Premium with hover effects */}
                  <div className="p-4 space-y-2 bg-white">
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
                      const hasPrice =
                        saleType === "Retail"
                          ? retailPrice > 0
                          : wholesalePrice > 0;
                      const canAdd =
                        isInStock &&
                        hasPrice &&
                        zuiaAdd &&
                        itemExists &&
                        !isFulfilled;

                      return (
                        <div
                          key={`${order._id}_${item._id}`}
                          className={`flex flex-col xs:flex-row xs:items-center justify-between gap-3 p-3 rounded-xl border-2 transition-all duration-300 hover:shadow-md
                            ${
                              isFulfilled
                                ? "bg-emerald-50 border-emerald-200"
                                : "bg-white border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/30"
                            }`}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className={`font-semibold text-sm ${
                                  isFulfilled
                                    ? "text-emerald-700"
                                    : "text-gray-800"
                                }`}
                              >
                                {item.itemName}
                              </span>
                              {isFulfilled && (
                                <span className="text-[10px] bg-emerald-200 text-emerald-700 px-2 py-0.5 rounded-full flex items-center gap-1 font-bold">
                                  <FaCheckCircle className="w-3 h-3" />✓
                                  Fulfilled
                                </span>
                              )}
                              {!isFulfilled && !isInStock && (
                                <span className="text-[10px] bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full font-bold">
                                  ⚠️ Out of Stock
                                </span>
                              )}
                              {!itemExists && !isFulfilled && (
                                <span className="text-[10px] bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full font-bold">
                                  Not Found
                                </span>
                              )}
                            </div>
                            <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-gray-500">
                              <span className="bg-gray-100 px-2 py-0.5 rounded font-medium">
                                Qty:{" "}
                                <span className="font-bold text-gray-700">
                                  {item.quantity}
                                </span>
                              </span>
                              <span className="bg-gray-100 px-2 py-0.5 rounded font-bold text-gray-700">
                                {formatCurrency(item.totalPrice || 0)}
                              </span>
                              {!isFulfilled && itemExists && (
                                <span className="bg-gray-100 px-2 py-0.5 rounded flex items-center gap-1">
                                  <FaWarehouse className="text-gray-400" />
                                  <span
                                    className={
                                      isInStock
                                        ? "text-emerald-600 font-bold"
                                        : "text-rose-600 font-bold"
                                    }
                                  >
                                    {currentStock}
                                  </span>
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Premium Add Button */}
                          {!isFulfilled && (
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
                                      `Item ${item.itemName} no longer exists`,
                                    );
                                    return;
                                  }
                                  if (!isInStock) {
                                    toast.error(
                                      `${item.itemName} is out of stock`,
                                    );
                                    return;
                                  }
                                  if (!hasPrice) {
                                    toast.error(
                                      `${item.itemName} has no price set`,
                                    );
                                    return;
                                  }
                                  return;
                                }
                                handleAddOrderItemToCart(order, item);
                              }}
                              disabled={!canAdd}
                              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-300 whitespace-nowrap flex items-center gap-2 shadow-md hover:shadow-lg flex-shrink-0 transform hover:scale-105
                                ${
                                  !canAdd
                                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                    : "bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600"
                                }`}
                            >
                              <FaShoppingCart className="w-3.5 h-3.5" />
                              <span>
                                {!itemExists
                                  ? "Not Found"
                                  : !isInStock
                                    ? "Out of Stock"
                                    : !hasPrice
                                      ? "No Price"
                                      : "Add to Cart"}
                              </span>
                            </button>
                          )}
                        </div>
                      );
                    })}

                    {/* Show more/less - Premium */}
                    {totalItems > 2 && (
                      <button
                        onClick={() => toggleOrderExpand(order._id)}
                        className="w-full text-center text-sm text-emerald-600 hover:text-emerald-700 font-bold py-2.5 bg-white hover:bg-emerald-50 rounded-xl border-2 border-gray-200 hover:border-emerald-300 transition-all duration-200 group"
                      >
                        {isExpanded ? (
                          <span className="flex items-center justify-center gap-2">
                            Show less{" "}
                            <FaChevronUp className="w-3.5 h-3.5 group-hover:-translate-y-1 transition-transform" />
                          </span>
                        ) : (
                          <span className="flex items-center justify-center gap-2">
                            View {totalItems - 2} more items{" "}
                            <FaChevronDown className="w-3.5 h-3.5 group-hover:translate-y-1 transition-transform" />
                          </span>
                        )}
                      </button>
                    )}
                  </div>

                  {/* Footer - Premium */}
                  <div className="px-5 py-3 bg-gray-50 border-t-2 border-gray-200 flex flex-col xs:flex-row xs:items-center justify-between gap-2">
                    <div className="text-xs text-gray-500">
                      <span className="font-medium">🕐 Created:</span>{" "}
                      {new Date(order.createdAt).toLocaleString()}
                    </div>
                    {order.status !== "Completed" && hasPendingItems && (
                      <div className="text-xs bg-emerald-100 text-emerald-700 px-3 py-1 rounded-lg font-bold border-2 border-emerald-200 flex items-center gap-1.5">
                        <FaClock className="w-3 h-3" />
                        {pendingCount} item{pendingCount > 1 ? "s" : ""} pending
                      </div>
                    )}
                    {order.status === "Completed" && (
                      <span className="text-xs bg-emerald-100 text-emerald-700 px-3 py-1 rounded-lg font-bold border-2 border-emerald-200 flex items-center gap-1.5">
                        <FaCheckCircle className="w-3 h-3" />✅ Completed
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

  // ==================== RENDER MENU TAB - WITH DEPTH ====================
  const renderMenuTab = () => (
    <div className="space-y-4">
      {/* Mobile: Top Bar */}
      <div className="lg:hidden flex items-center justify-between bg-gradient-to-r from-white to-gray-50 rounded-xl shadow-md border-2 border-gray-200 p-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCategories(!showCategories)}
            className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 rounded-lg text-white transition-all shadow-md"
          >
            <FaBars className="w-4 h-4" />
          </button>
          <span className="font-semibold text-gray-800 text-sm truncate max-w-[120px]">
            {selected?.name || "All Categories"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 transition-colors border-2 border-gray-200"
          >
            <FaFilter className="w-4 h-4" />
          </button>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full border-2 border-gray-200 font-bold">
            {items.length}
          </span>
        </div>
      </div>

      {/* Mobile: Collapsible Categories */}
      <div className={`lg:hidden ${showCategories ? "block" : "hidden"}`}>
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-md border-2 border-gray-200 p-3 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
              <MdCategory className="text-emerald-500 text-lg" />
              Categories
            </h3>
            <button
              onClick={() => setShowCategories(false)}
              className="p-1 text-gray-400 hover:text-gray-600"
            >
              <FaTimes className="w-4 h-4" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2 max-h-[160px] overflow-y-auto">
            {filteredCategories.map((category) => (
              <button
                key={category._id}
                onClick={() => {
                  setSelected(category);
                  fetchItems(category._id);
                  setShowCategories(false);
                }}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all border-2 flex items-center gap-1.5 shadow-sm hover:shadow-md
                  ${
                    selected?._id === category._id
                      ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-emerald-500"
                      : "bg-white text-gray-700 hover:bg-gray-50 border-gray-200"
                  }`}
              >
                <MdCategory className="text-xs" />
                <span className="truncate max-w-[60px]">{category.name}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] ${selected?._id === category._id ? "bg-white/20 text-white" : "bg-gray-200 text-gray-600"}`}
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
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-md border-2 border-gray-200 p-3 mb-4">
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
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border-2 shadow-sm
                ${
                  saleType === "Retail"
                    ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-emerald-400"
                    : "bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-emerald-400"
                }`}
            >
              {saleType === "Retail" ? (
                <FaUserTie className="text-sm" />
              ) : (
                <FaStore className="text-sm" />
              )}
              {saleType}
            </button>
          </div>

          <div className="relative mb-3">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
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
              className="w-full pl-9 pr-3 py-2 bg-white rounded-lg text-sm border-2 border-gray-200 focus:border-emerald-400 focus:outline-none shadow-sm"
            />
          </div>

          {saleType === "Wholesale" && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-600">Package:</span>
              <select
                value={packageSize}
                onChange={(e) => setPackageSize(Number(e.target.value))}
                className="bg-white border-2 border-gray-200 rounded-lg px-2 py-1.5 text-sm shadow-sm"
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

      {/* Desktop: Full Header - Clean grey with depth */}
      <div className="hidden lg:block bg-gradient-to-r from-white to-gray-50 rounded-2xl shadow-md border-2 border-gray-200 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm text-gray-600 font-medium">
              Sale Mode:
            </span>
            <button
              onClick={toggleSaleType}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all shadow-md border-2 hover:shadow-lg transform hover:scale-105 text-sm
                ${
                  saleType === "Retail"
                    ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-emerald-400"
                    : "bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-emerald-400"
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
              <span className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs px-3 py-1 rounded-full shadow-md font-bold">
                <FaFilter className="inline mr-1 text-xs" /> WHOLESALE
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm">
            <div className="px-4 py-1.5 rounded-lg border-2 border-gray-200 bg-white shadow-sm text-gray-700 font-medium">
              <span className="font-bold text-emerald-600">{items.length}</span>{" "}
              {saleType === "Wholesale" ? "wholesale" : ""} items
            </div>
            <div className="px-4 py-1.5 bg-white rounded-lg border-2 border-gray-200 shadow-sm text-gray-700 font-medium">
              <span className="font-bold text-emerald-600">
                {categories.length}
              </span>{" "}
              categories
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <div className="flex items-center bg-white rounded-xl px-4 py-3 border-2 border-gray-200 focus-within:border-emerald-400 transition-colors shadow-sm">
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
                className="bg-transparent outline-none w-full text-gray-700 placeholder-gray-400 text-sm"
              />
            </div>
            {saleType === "Wholesale" && (
              <div className="absolute left-3 -top-2 text-xs bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-2 py-0.5 rounded shadow-md font-bold">
                Wholesale Only
              </div>
            )}
          </div>

          <div className="relative">
            <div className="flex items-center bg-white rounded-xl px-4 py-3 border-2 border-gray-200 focus-within:border-emerald-400 transition-colors shadow-sm">
              <MdCategory className="w-5 h-5 mr-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search categories..."
                className="bg-transparent outline-none w-full text-gray-700 placeholder-gray-400 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="absolute right-3 top-3 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded font-bold">
              {filteredCategories.length}
            </div>
          </div>
        </div>
      </div>

      {/* Desktop: Categories Bar */}
      <div className="hidden lg:block bg-gradient-to-r from-white to-gray-50 rounded-2xl shadow-md border-2 border-gray-200 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <h3 className="font-bold text-gray-800 flex items-center gap-2 text-base">
            <MdCategory className="text-emerald-500 text-xl" />
            Categories
            {saleType === "Wholesale" && (
              <span className="text-xs bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-2 py-0.5 rounded shadow-md font-bold">
                Wholesale Filter Active
              </span>
            )}
          </h3>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm text-gray-500">
              {filteredCategories.length} available
            </span>
            <div className="text-xs px-3 py-1 rounded-full border-2 border-gray-200 bg-white text-gray-700 font-bold shadow-sm">
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
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all border-2 flex items-center gap-2 shadow-sm hover:shadow-md
                ${
                  selected?._id === category._id
                    ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-emerald-500"
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

      {/* Items Grid - WITH DEPTH AND VISUAL INTEREST */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
              <MdInventory className="text-emerald-500 text-2xl" />
              {saleType === "Wholesale" ? "Wholesale Items" : "Menu Items"}
              <span className="text-xs font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full border-2 border-gray-200">
                {items.length} {saleType === "Wholesale" ? "wholesale" : ""}{" "}
                items
              </span>
            </h3>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {saleType === "Wholesale" && (
              <div className="text-xs bg-gradient-to-r from-gray-50 to-white px-3 py-1 rounded-lg border-2 border-gray-200 shadow-sm font-medium">
                <FaCube className="inline mr-1 text-emerald-500" />
                Package:{" "}
                <span className="font-bold text-emerald-600">
                  {packageSize}
                </span>{" "}
                units
              </div>
            )}
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-sm"></div>
                <span className="hidden xs:inline font-medium">In Stock</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-amber-500 rounded-full shadow-sm"></div>
                <span className="hidden xs:inline font-medium">Low</span>
              </div>
            </div>
          </div>
        </div>

        {saleType === "Wholesale" && items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center bg-gradient-to-br from-white to-emerald-50 rounded-2xl border-2 border-emerald-200 px-4 shadow-lg">
            <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-4 border-4 border-emerald-200">
              <FaStore className="text-emerald-500 text-4xl" />
            </div>
            <h4 className="font-bold text-gray-800 text-xl mb-2">
              No Wholesale Items Found
            </h4>
            <p className="text-gray-500 text-sm max-w-sm mb-4">
              No items are enabled for wholesale in this category.
            </p>
            <button
              onClick={() => setSaleType("Retail")}
              className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all text-sm hover:scale-105"
            >
              Switch to Retail Mode
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
                  className={`group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl border-2 p-4 flex flex-col justify-between transition-all duration-300 hover:-translate-y-2
                    ${expired ? "border-amber-300 bg-amber-50/30" : "border-gray-200 hover:border-emerald-300"}
                    ${isOutOfStock ? "opacity-60" : ""}`}
                >
                  {/* Card glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/0 to-emerald-50/0 group-hover:from-emerald-50/20 group-hover:to-teal-50/20 transition-all duration-500 rounded-2xl pointer-events-none"></div>

                  {/* Decorative top accent */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                  <div className="relative mb-3">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-800 text-sm truncate pr-2">
                          {item.name}
                          {expired && (
                            <span className="ml-1 text-[10px] bg-amber-500 text-white px-1.5 py-0.5 rounded-full font-bold">
                              ⚠️ EXPIRED
                            </span>
                          )}
                          {isOutOfStock && (
                            <span className="ml-1 text-[10px] bg-gray-500 text-white px-1.5 py-0.5 rounded-full font-bold">
                              OUT OF STOCK
                            </span>
                          )}
                        </h3>
                        {saleType === "Wholesale" && item.enableWholesale && (
                          <div className="flex flex-wrap items-center gap-1 mt-1">
                            <span className="text-[10px] bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-2 py-0.5 rounded font-bold">
                              <FaStore className="inline mr-1 text-[10px]" />{" "}
                              WHOLESALE
                            </span>
                            <span className="text-[10px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded border-2 border-gray-200 font-medium">
                              <FaCube className="inline mr-1" /> {packageSize}{" "}
                              units/pkg
                            </span>
                          </div>
                        )}
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded border-2 border-gray-200 text-gray-500 bg-gray-50 font-medium">
                        {item.category?.name || "General"}
                      </span>
                    </div>

                    {/* Stock and Expiry Info */}
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <div className="flex items-center gap-1 text-xs text-gray-500 bg-gray-50 px-2 py-0.5 rounded border-2 border-gray-200">
                        <FaWarehouse className="text-gray-400 text-xs" />
                        <span>Stock:</span>
                        <span
                          className={`font-bold ${isOutOfStock ? "text-rose-600" : item.itemQuantity <= (item.reOrder || 5) ? "text-amber-600" : "text-emerald-600"}`}
                        >
                          {item.itemQuantity.toLocaleString()}
                        </span>
                      </div>
                      {expiryDate && (
                        <div className="flex items-center gap-1 text-xs text-gray-500 bg-gray-50 px-2 py-0.5 rounded border-2 border-gray-200">
                          <FaCalendarAlt className="text-gray-400 text-xs" />
                          <span>Expiry:</span>
                          <span
                            className={`font-bold ${expired ? "text-amber-600" : "text-gray-700"}`}
                          >
                            {formatDate(expiryDate)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="relative space-y-3 mb-4">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-xl p-3 border-2 border-gray-200 bg-gradient-to-br from-gray-50 to-white group-hover:border-emerald-300 transition-colors shadow-sm">
                        <div className="flex items-center gap-1 mb-1">
                          <MdLocalOffer className="text-emerald-500 text-xs" />
                          <span className="text-[10px] text-gray-500 font-medium">
                            {saleType === "Wholesale" ? "Wholesale" : "Retail"}{" "}
                            Price
                          </span>
                        </div>
                        <div className="font-bold text-sm text-gray-800">
                          Tsh {currentPrice.toLocaleString()}
                          <span className="text-[10px] text-gray-400 ml-1">
                            /unit
                          </span>
                        </div>
                      </div>

                      {saleType === "Wholesale" ? (
                        <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-3 border-2 border-gray-200 group-hover:border-emerald-300 transition-colors shadow-sm">
                          <div className="flex items-center gap-1 mb-1">
                            <FaCube className="text-emerald-500 text-xs" />
                            <span className="text-[10px] text-gray-500 font-medium">
                              Package Total
                            </span>
                          </div>
                          <div className="font-bold text-sm text-gray-800">
                            Tsh {(currentPrice * packageSize).toLocaleString()}
                            <span className="text-[10px] text-gray-400 ml-1">
                              /pkg
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-gray-50 rounded-xl p-3 border-2 border-gray-200 shadow-sm">
                          <div className="flex items-center gap-1 mb-1">
                            <FaTag className="text-gray-500 text-xs" />
                            <span className="text-[10px] text-gray-500 font-medium">
                              Buying
                            </span>
                          </div>
                          <div className="font-semibold text-sm text-gray-700">
                            Tsh {item.buyingPrice.toLocaleString()}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs bg-gray-50 px-3 py-1.5 rounded-lg border-2 border-gray-200 shadow-sm">
                      <span className="text-gray-500 font-medium">
                        Profit/unit:
                      </span>
                      <span
                        className={`font-bold ${profit > 0 ? "text-emerald-600" : profit === 0 ? "text-amber-600" : "text-rose-600"}`}
                      >
                        Tsh {profit.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="relative space-y-3">
                    <div className="flex items-center justify-between bg-gray-50 rounded-xl p-1 border-2 border-gray-200 group-hover:border-emerald-300 transition-colors shadow-sm">
                      <button
                        onClick={() =>
                          handleQuantityChange(
                            item._id,
                            (itemCounts[item._id] || 1) - 1,
                          )
                        }
                        className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
                        disabled={isOutOfStock}
                      >
                        <FaMinus className="text-gray-600 text-sm" />
                      </button>

                      <div className="flex flex-col items-center">
                        <input
                          type="number"
                          min="1"
                          className="w-14 text-center text-lg font-bold text-gray-800 border-2 border-gray-200 rounded-lg text-sm bg-white focus:border-emerald-400 outline-none"
                          value={itemCounts[item._id] || 1}
                          onChange={(e) =>
                            handleQuantityChange(
                              item._id,
                              Number(e.target.value),
                            )
                          }
                          disabled={isOutOfStock}
                        />
                        <span className="text-[10px] text-gray-400">
                          {saleType === "Wholesale" ? "Packages" : "Qty"}
                        </span>
                        {saleType === "Wholesale" && (
                          <span className="text-[10px] text-emerald-600 font-bold">
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
                        className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
                        disabled={isOutOfStock}
                      >
                        <FaPlus className="text-gray-600 text-sm" />
                      </button>
                    </div>

                    <button
                      onClick={() => handleAddCart(item)}
                      disabled={isOutOfStock}
                      className={`w-full py-2.5 rounded-xl font-bold transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2 transform hover:scale-[1.02] text-sm
                        ${
                          isOutOfStock
                            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                            : "bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600"
                        }`}
                    >
                      <FaShoppingCart className="text-sm" />
                      <span>
                        {isOutOfStock ? "Out of Stock" : `Add (${saleType})`}
                      </span>
                      {!isOutOfStock && (
                        <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold">
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
    <div className="space-y-4 lg:space-y-6 px-2 sm:px-3 lg:px-4 xl:px-6 pb-6">
      {/* Tab Navigation - Premium */}
      <div className="bg-gradient-to-r from-white to-gray-50 rounded-2xl shadow-md border-2 border-gray-200 p-1.5 flex gap-1.5">
        <button
          onClick={() => setActiveTab("menu")}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-sm transition-all duration-300
            ${
              activeTab === "menu"
                ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg"
                : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
            }`}
        >
          <FaTh className="text-sm" />
          <span className="hidden xs:inline">Menu Items</span>
          <span className="xs:hidden">Menu</span>
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
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-sm transition-all duration-300
            ${
              activeTab === "orders"
                ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg"
                : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
            }`}
        >
          <FaList className="text-sm" />
          <span className="hidden xs:inline">Orders</span>
          <span className="xs:hidden">Orders</span>
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
