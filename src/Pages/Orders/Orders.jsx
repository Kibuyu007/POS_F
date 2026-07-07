import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
  searchOrders, 
  fetchOrders, 
  createOrder,
  updateOrderStatus,
  deleteOrder 
} from "../../Redux/orders";
import { 
  Search, 
  Filter, 
  Plus, 
  X, 
  ChevronDown,
  Eye,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
  Package,
  User,
  Phone,
  ShoppingBag,
  AlertTriangle,
  Check,
  XCircle
} from "lucide-react";

//URL
import BASE_URL from "../../Utils/config";
import toast from "react-hot-toast";

const Orders = () => {
  const dispatch = useDispatch();
  const { orders, loading } = useSelector((state) => state.orders);
  const [filter, setFilter] = useState("All");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    items: [],
    notes: ""
  });
  const [newItem, setNewItem] = useState({
    itemId: "",
    quantity: 1,
    discount: 0,
    priceType: "Retail" // Add price type selection
  });
  const [availableItems, setAvailableItems] = useState([]);
  const [itemErrors, setItemErrors] = useState({});

  useEffect(() => {
    dispatch(fetchOrders());
    fetchAvailableItems();
  }, [dispatch]);

  const fetchAvailableItems = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/items/getAllItems`);
      const data = await response.json();
      // Filter to only show items with stock and not expired
      const validItems = data.data?.filter(
        item => item.itemQuantity > 0 && item.status !== "Expired"
      ) || [];
      setAvailableItems(validItems);
    } catch (error) {
      console.error('Failed to fetch items:', error);
    }
  };

  const filteredOrders = filter === "All" 
    ? orders 
    : orders.filter((o) => o.status === filter);

  const statusColors = {
    Pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    Confirmed: "bg-blue-100 text-blue-800 border-blue-200",
    Completed: "bg-green-100 text-green-800 border-green-200",
    Cancelled: "bg-red-100 text-red-800 border-red-200",
  };

  const statusIcons = {
    Pending: <Clock className="w-4 h-4" />,
    Confirmed: <CheckCircle className="w-4 h-4" />,
    Completed: <CheckCircle className="w-4 h-4" />,
    Cancelled: <AlertCircle className="w-4 h-4" />,
  };

  const statusOptions = ["All", "Pending", "Confirmed", "Completed", "Cancelled"];

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm) {
        dispatch(searchOrders(searchTerm));
      } else {
        dispatch(fetchOrders());
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, dispatch]);

  // Validate item before adding to order
  const validateItem = (itemId, quantity) => {
    const selectedItem = availableItems.find(item => item._id === itemId);
    if (!selectedItem) {
      return { valid: false, message: "Item not found" };
    }

    // Check if item is expired
    if (selectedItem.status === "Expired") {
      return { valid: false, message: `${selectedItem.name} is expired and cannot be ordered` };
    }

    // Check if item has stock
    if (selectedItem.itemQuantity === 0) {
      return { valid: false, message: `${selectedItem.name} is out of stock` };
    }

    // Check if quantity doesn't exceed available stock
    if (quantity > selectedItem.itemQuantity) {
      return { 
        valid: false, 
        message: `Only ${selectedItem.itemQuantity} ${selectedItem.name} available` 
      };
    }

    return { valid: true, item: selectedItem };
  };

  const handleAddItem = () => {
    if (!newItem.itemId || !newItem.quantity) {
      setItemErrors({ ...itemErrors, [newItem.itemId || 'general']: "Please select an item and enter quantity" });
      return;
    }

    const validation = validateItem(newItem.itemId, newItem.quantity);
    
    if (!validation.valid) {
      setItemErrors({ ...itemErrors, [newItem.itemId]: validation.message });
      toast.error(validation.message);
      return;
    }

    // Clear error for this item
    setItemErrors({ ...itemErrors, [newItem.itemId]: undefined });

    const selectedItem = validation.item;
    
    // Determine if wholesale based on selection or quantity
    const isWholesale = newItem.priceType === "Wholesale" && 
                       selectedItem.enableWholesale && 
                       newItem.quantity >= (selectedItem.wholesaleMinQty || 0);
    
    const unitPrice = isWholesale 
      ? (selectedItem.wholesalePrice || selectedItem.price)
      : (selectedItem.retailPrice || selectedItem.price);

    const itemToAdd = {
      ...newItem,
      itemName: selectedItem.name,
      unitPrice: unitPrice,
      maxQuantity: selectedItem.itemQuantity,
      isWholesale: isWholesale,
      priceType: isWholesale ? "Wholesale" : "Retail"
    };

    setFormData(prev => ({
      ...prev,
      items: [...prev.items, itemToAdd]
    }));

    setNewItem({ itemId: "", quantity: 1, discount: 0, priceType: "Retail" });
    toast.success(`✓ ${selectedItem.name} added to order (${isWholesale ? 'Wholesale' : 'Retail'})`);
  };

  const handleRemoveItem = (index) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    
    // Validate all items before creating order
    const invalidItems = [];
    for (const item of formData.items) {
      const validation = validateItem(item.itemId, item.quantity);
      if (!validation.valid) {
        invalidItems.push({
          name: item.itemName || "Unknown",
          message: validation.message
        });
      }
    }

    if (invalidItems.length > 0) {
      const errorMessages = invalidItems.map(i => `${i.name}: ${i.message}`).join('\n');
      toast.error(`Cannot create order:\n${errorMessages}`, { duration: 5000 });
      return;
    }

    try {
      await dispatch(createOrder(formData)).unwrap();
      setShowCreateModal(false);
      setFormData({ customerName: "", customerPhone: "", items: [], notes: "" });
      setItemErrors({});
      dispatch(fetchOrders());
      toast.success("Order created successfully!");
    } catch (error) {
      console.error('Failed to create order:', error);
      toast.error(error.response?.data?.message || "Failed to create order");
    }
  };

  const handleStatusUpdate = async (orderId, status) => {
    try {
      await dispatch(updateOrderStatus({ id: orderId, status })).unwrap();
      dispatch(fetchOrders());
      toast.success(`Order status updated to ${status}`);
    } catch (error) {
      console.error('Failed to update status:', error);
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to delete this order?')) return;
    try {
      await dispatch(deleteOrder(orderId)).unwrap();
      dispatch(fetchOrders());
      toast.success("Order deleted successfully");
    } catch (error) {
      console.error('Failed to delete order:', error);
      toast.error(error.response?.data?.message || "Failed to delete order");
    }
  };

  const calculateTotal = (items) => {
    return items.reduce((sum, item) => {
      const total = (item.unitPrice || 0) * (item.quantity || 0) - (item.discount || 0);
      return sum + Math.max(0, total);
    }, 0);
  };

  // Get item status indicator
  const getItemStatusIndicator = (itemId) => {
    const item = availableItems.find(i => i._id === itemId);
    if (!item) return { color: 'text-gray-400', icon: <AlertCircle className="w-4 h-4" />, label: 'Not Found' };
    if (item.status === "Expired") return { color: 'text-red-500', icon: <XCircle className="w-4 h-4" />, label: 'Expired' };
    if (item.itemQuantity === 0) return { color: 'text-red-500', icon: <XCircle className="w-4 h-4" />, label: 'Out of Stock' };
    if (item.itemQuantity < 5) return { color: 'text-yellow-500', icon: <AlertTriangle className="w-4 h-4" />, label: 'Low Stock' };
    return { color: 'text-green-500', icon: <Check className="w-4 h-4" />, label: 'Available' };
  };

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="max-w-8xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">
              Orders Dashboard
            </h1>
            <p className="text-gray-500 mt-1">Manage and track all your orders</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-400 to-green-500 text-white rounded-xl shadow-lg shadow-green-200 hover:shadow-xl hover:scale-105 transition-all duration-200 font-medium"
          >
            <Plus className="w-5 h-5" />
            New Order
          </button>
        </div>

        {/* Filters & Search */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search Bar */}
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                placeholder="Search orders by number, customer or phone..."
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white text-gray-900 placeholder-gray-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filter Buttons - Desktop */}
            <div className="hidden md:flex gap-2 flex-wrap">
              {statusOptions.map((s) => (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    filter === s
                      ? "bg-gradient-to-r from-green-400 to-green-500 text-white shadow-md shadow-green-200 scale-105"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105"
                  }`}
                >
                  {s}
                  {s !== "All" && (
                    <span className="ml-2 text-xs opacity-75">
                      ({orders.filter((o) => o.status === s).length})
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Filter Dropdown - Mobile */}
            <div className="md:hidden relative w-full">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full flex items-center justify-between px-5 py-3 bg-gray-50 rounded-xl border border-gray-200 hover:bg-gray-100 transition-all"
              >
                <span className="text-gray-700 font-medium">
                  <Filter className="inline mr-2 w-4 h-4" />
                  {filter}
                </span>
                <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
              </button>
              {isDropdownOpen && (
                <div className="absolute z-10 w-full mt-2 bg-white rounded-xl shadow-lg border border-gray-100 py-2">
                  {statusOptions.map((s) => (
                    <button
                      key={s}
                      onClick={() => {
                        setFilter(s);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full text-left px-5 py-2.5 hover:bg-green-50 transition-colors ${
                        filter === s ? "text-green-600 font-medium bg-green-50" : "text-gray-700"
                      }`}
                    >
                      {s}
                      <span className="float-right text-sm text-gray-400">
                        ({s === "All" ? orders.length : orders.filter((o) => o.status === s).length})
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-green-50 to-gray-50 border-b border-gray-200">
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Order #
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Items
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredOrders.length > 0 ? (
                      filteredOrders.map((order) => (
                        <tr
                          key={order._id}
                          className="hover:bg-green-50/30 transition-colors duration-150 group"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-medium text-gray-900">
                              {order.orderNumber}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-300 to-green-400 flex items-center justify-center text-white font-medium text-sm mr-3">
                                {order.customerName?.charAt(0) || "?"}
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {order.customerName}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {order.customerPhone}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-1">
                              <Package className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-700">
                                {order.items?.length || 0} items
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-semibold text-gray-900">
                              ${order.grandTotal?.toFixed(2)}
                            </span>
                            {order.totalDiscount > 0 && (
                              <span className="ml-2 text-xs text-green-600">
                                -${order.totalDiscount.toFixed(2)}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <span
                                className={`px-3 py-1 inline-flex items-center gap-1 text-xs leading-5 font-semibold rounded-full border ${statusColors[order.status] || "bg-gray-100 text-gray-800"}`}
                              >
                                {statusIcons[order.status]}
                                {order.status}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  setSelectedOrder(order);
                                  setShowDetailModal(true);
                                }}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              {order.status !== "Completed" && order.status !== "Cancelled" && (
                                <select
                                  onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                                  className="text-xs border border-gray-300 rounded-lg px-2 py-1 bg-white text-gray-700 hover:border-green-400 focus:ring-2 focus:ring-green-300 focus:border-transparent"
                                  value={order.status}
                                >
                                  <option value="Pending">Pending</option>
                                  <option value="Confirmed">Confirm</option>
                                  <option value="Cancelled">Cancel</option>
                                </select>
                              )}
                              {order.status !== "Completed" && (
                                <button
                                  onClick={() => handleDeleteOrder(order._id)}
                                  className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Delete Order"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="px-6 py-12 text-center">
                          <div className="text-gray-400">
                            <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p className="text-lg font-medium">No orders found</p>
                            <p className="text-sm mt-1">Try adjusting your filters or create a new order</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Table Footer */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-3">
                <span className="text-sm text-gray-500">
                  Showing <span className="font-medium text-gray-700">{filteredOrders.length}</span> of{" "}
                  <span className="font-medium text-gray-700">{orders.length}</span> orders
                </span>
                <div className="flex gap-2">
                  <button className="px-4 py-2 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 disabled:opacity-50">
                    Previous
                  </button>
                  <button className="px-4 py-2 text-sm bg-gradient-to-r from-green-400 to-green-500 text-white rounded-lg hover:shadow-md transition-all">
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Create Order Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center z-10">
              <h2 className="text-2xl font-bold text-gray-800">Create New Order</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="p-6 space-y-6">
              {/* Customer Info */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="inline w-4 h-4 mr-2" />
                    Customer Name
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-300 focus:border-transparent bg-white text-gray-900 placeholder-gray-400"
                    value={formData.customerName}
                    onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                    placeholder="Enter customer name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="inline w-4 h-4 mr-2" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-300 focus:border-transparent bg-white text-gray-900 placeholder-gray-400"
                    value={formData.customerPhone}
                    onChange={(e) => setFormData({...formData, customerPhone: e.target.value})}
                    placeholder="Enter phone number"
                  />
                </div>
              </div>

              {/* Add Items */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <ShoppingBag className="inline w-4 h-4 mr-2" />
                  Add Items
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <select
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-300 focus:border-transparent bg-white text-gray-900"
                    value={newItem.itemId}
                    onChange={(e) => setNewItem({...newItem, itemId: e.target.value})}
                  >
                    <option value="" className="text-gray-400">Select an item</option>
                    {availableItems.map((item) => (
                      <option key={item._id} value={item._id} className="text-gray-900">
                        {item.name} - ${item.price} ({item.itemQuantity} available)
                        {item.status === "Expired" && " ⚠️ Expired"}
                      </option>
                    ))}
                  </select>

                  {/* Price Type Selection */}
                  <select
                    className="w-32 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-300 focus:border-transparent bg-white text-gray-900"
                    value={newItem.priceType}
                    onChange={(e) => setNewItem({...newItem, priceType: e.target.value})}
                  >
                    <option value="Retail">Retail</option>
                    <option value="Wholesale">Wholesale</option>
                  </select>

                  <input
                    type="number"
                    min="1"
                    className="w-24 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-300 focus:border-transparent bg-white text-gray-900 placeholder-gray-400"
                    value={newItem.quantity}
                    onChange={(e) => setNewItem({...newItem, quantity: parseInt(e.target.value) || 1})}
                    placeholder="Qty"
                  />
                  <input
                    type="number"
                    min="0"
                    className="w-32 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-300 focus:border-transparent bg-white text-gray-900 placeholder-gray-400"
                    value={newItem.discount}
                    onChange={(e) => setNewItem({...newItem, discount: parseFloat(e.target.value) || 0})}
                    placeholder="Discount"
                  />
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="px-6 py-3 bg-gradient-to-r from-green-400 to-green-500 text-white rounded-xl hover:shadow-lg transition-all font-medium whitespace-nowrap"
                  >
                    Add Item
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  ⚠️ Only items with stock and not expired are shown
                </p>
              </div>

              {/* Items List */}
              {formData.items.length > 0 && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="font-medium text-gray-700 mb-3">Order Items</h4>
                  <div className="space-y-2">
                    {formData.items.map((item, index) => {
                      const status = getItemStatusIndicator(item.itemId);
                      return (
                        <div key={index} className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200">
                          <div className="flex items-center gap-3">
                            <div className={status.color}>
                              {status.icon}
                            </div>
                            <div>
                              <span className="font-medium text-gray-900">{item.itemName}</span>
                              <span className="text-sm text-gray-600 ml-2">
                                x{item.quantity} @ ${item.unitPrice}
                              </span>
                              {item.discount > 0 && (
                                <span className="text-sm text-green-600 ml-2">
                                  -${item.discount}
                                </span>
                              )}
                              {item.isWholesale && (
                                <span className="ml-2 text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                                  Wholesale
                                </span>
                              )}
                              <span className="ml-2 text-xs text-gray-400">
                                {status.label}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-semibold text-gray-900">
                              ${((item.unitPrice || 0) * (item.quantity || 0) - (item.discount || 0)).toFixed(2)}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-3 text-right font-semibold text-gray-900">
                    Total: ${calculateTotal(formData.items).toFixed(2)}
                  </div>
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <textarea
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-300 focus:border-transparent bg-white text-gray-900 placeholder-gray-400"
                  rows="3"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Add any additional notes..."
                />
              </div>

              {/* Submit */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-8 py-3 bg-gradient-to-r from-green-400 to-green-500 text-white rounded-xl hover:shadow-lg transition-all font-medium"
                >
                  Create Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {showDetailModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Order Details</h2>
                <p className="text-sm text-gray-500">{selectedOrder.orderNumber}</p>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Customer Info */}
              <div className="grid md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl">
                <div>
                  <p className="text-sm text-gray-500">Customer</p>
                  <p className="font-medium text-gray-900">{selectedOrder.customerName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium text-gray-900">{selectedOrder.customerPhone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${statusColors[selectedOrder.status]}`}>
                    {statusIcons[selectedOrder.status]}
                    {selectedOrder.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-medium text-gray-900">
                    {new Date(selectedOrder.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Items */}
              <div>
                <h4 className="font-medium text-gray-700 mb-3">Items</h4>
                <div className="space-y-2">
                  {selectedOrder.items?.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <span className="font-medium text-gray-900">{item.itemName}</span>
                        <span className="text-sm text-gray-600 ml-2">
                          x{item.quantity} @ ${item.unitPrice}
                        </span>
                        {item.isWholesale && (
                          <span className="ml-2 text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                            Wholesale
                          </span>
                        )}
                      </div>
                      <span className="font-semibold text-gray-900">
                        ${item.totalPrice?.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className="border-t border-gray-200 pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="font-medium text-gray-900">${selectedOrder.totalAmount?.toFixed(2)}</span>
                  </div>
                  {selectedOrder.totalDiscount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Discount</span>
                      <span className="font-medium text-green-600">-${selectedOrder.totalDiscount?.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
                    <span className="text-gray-800">Total</span>
                    <span className="text-green-600">${selectedOrder.grandTotal?.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {selectedOrder.notes && (
                <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">Notes:</span> {selectedOrder.notes}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;