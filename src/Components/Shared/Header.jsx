import { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  FaBoxOpen,
  FaWarehouse,
  FaChartLine,
  FaExclamationTriangle,
  FaCog,
  FaSignOutAlt,
} from "react-icons/fa";
import {
  MdPerson,
  MdClose,
  MdNotificationsActive,
  MdInventory2,
  MdArrowForward,
} from "react-icons/md";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import { RiUserSettingsLine, RiDashboardLine } from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import logo from "../../assets/logo.jpg";
import { logoutSuccess } from "../../Redux/userSlice";
import { AiOutlineUser } from "react-icons/ai";
import { itemsError, itemsFetch, itemsPending } from "../../Redux/items";
import BASE_URL from "../../Utils/config";
import toast from "react-hot-toast";

const Header = () => {
  const { items = [] } = useSelector((state) => state.items);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifyOpen, setNotifyOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Get user details from Redux store
  const user = useSelector((state) => state.user?.user);
  const uName = user ? `${user.firstName} ${user.lastName}` : "Guest";

  // Christmas decorations state
  const [snowflakes] = useState(Array.from({ length: 15 }));

  const fetchData = async () => {
    try {
      dispatch(itemsPending());
      let url = `${BASE_URL}/api/items/allItemsRaw`;

      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch items");

      const data = await response.json();
      dispatch(itemsFetch(data));
    } catch (error) {
      console.error("Error fetching items:", error);
      dispatch(itemsError(error.message));
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle Logout
  const handleLogout = async () => {
    try {
      await axios.get(`${BASE_URL}/api/auth/logout`, {
        withCredentials: true,
      });

      // Clear Redux state & localStorage
      setDropdownOpen(false);
      dispatch(logoutSuccess());
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      toast.success("Logged out successfully!");
      // Redirect to login page
      navigate("/auth");
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Logout failed");
    }
  };

  // Function to calculate age from date of birth
  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return "-";
    const dob = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();

    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age;
  };

  // Filter for items with reOrderStatus === "Low"
  const lowStockItems = items.filter((item) => item.reOrderStatus === "Low");

  // Use Refs for Closing Dropdowns
  const dropdownRef = useRef();
  const notifyRef = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (notifyRef.current && !notifyRef.current.contains(event.target)) {
        setNotifyOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="fixed left-4 right-4 flex justify-center z-50">
      {/* Subtle Snowfall Effect - Non-interactive background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {snowflakes.map((_, i) => (
          <div
            key={i}
            className="absolute top-0 w-1 h-1 bg-white/70 rounded-full animate-fall"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${10 + Math.random() * 10}s`,
              opacity: 0.3 + Math.random() * 0.4,
            }}
          />
        ))}
      </div>

      {/* Christmas Hat for Logo */}
      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-60 pointer-events-none hidden md:block">
        <div className="relative w-16 h-16">
          <div
            className="absolute w-16 h-12 bg-red-600 rounded-tl-full rounded-tr-full"
            style={{
              clipPath: "polygon(0% 100%, 50% 0%, 100% 100%)",
            }}
          ></div>
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-20 h-4 bg-white rounded-full"></div>
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-white rounded-full flex items-center justify-center">
            <div className="w-4 h-4 bg-red-600 rounded-full"></div>
          </div>
        </div>
      </div>

      <header className="w-full max-w-[1500px] mx-auto px-4 sm:px-6 md:px-8 py-3 sm:py-4 flex justify-between items-center relative z-10">
        {/* Logo with Christmas Theme */}
        <div className="flex items-center gap-2 sm:gap-3 relative">
          <div className="relative group">
            <img
              src={logo}
              className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl shadow-md transform group-hover:scale-105 transition-all duration-300 ring-2 ring-red-500/20"
              alt="Logo"
            />
            {/* Christmas Bell on Logo */}
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center shadow-md border border-yellow-300 z-20">
              <span className="text-xs text-white">🔔</span>
            </div>
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-red-500/10 to-green-500/10 group-hover:from-red-500/20 group-hover:to-green-500/20 transition-all duration-300"></div>
          </div>
          <div>
            <h1 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 bg-gradient-to-r from-red-600 via-green-600 to-red-600 bg-clip-text text-transparent">
              Uza
            </h1>
            <p className="text-xs text-gray-500 hidden sm:block flex items-center gap-1">
              Inventory Pro <span className="text-red-500">🎄</span>
            </p>
          </div>

          {/* Christmas Ornament Decoration */}
          <div className="absolute -right-4 top-1/2 transform -translate-y-1/2 hidden lg:block">
            <div className="relative">
              <div className="w-3 h-8 bg-gradient-to-b from-red-600 to-red-800 rounded-full"></div>
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-yellow-400 rounded-full"></div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          {/* Christmas-themed Notification Bell */}
          <div className="relative" ref={notifyRef}>
            <div
              onClick={() => setNotifyOpen(!notifyOpen)}
              className="relative p-2.5 bg-gradient-to-br from-white to-gray-50 rounded-full shadow-lg cursor-pointer hover:shadow-xl transition-all duration-300 group border border-gray-400 hover:border-red-400"
            >
              <div className="relative p-1.5">
                <MdNotificationsActive className="text-xl text-red-600 group-hover:text-red-700 transition-colors" />
                {lowStockItems.length > 0 && (
                  <>
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-red-600 to-red-700 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg animate-pulse">
                      {lowStockItems.length}
                    </span>
                    <span className="absolute top-0 left-0 w-5 h-5 bg-red-500 rounded-full animate-ping opacity-20"></span>
                  </>
                )}
              </div>
              {/* Tiny Christmas decoration */}
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border border-white"></div>
            </div>

            {/* Notification Dropdown - Christmas themed */}
            {notifyOpen && (
              <>
                <div
                  className="fixed inset-0 bg-black/10 backdrop-blur-sm z-40 sm:hidden"
                  onClick={() => setNotifyOpen(false)}
                ></div>

                <div className="fixed inset-0 flex items-start justify-center pt-20 p-4 z-50 sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-3 sm:p-0">
                  <div className="w-full max-w-[90vw] sm:w-[500px] lg:w-[600px] bg-white/95 backdrop-blur-xl border border-gray-300/50 shadow-2xl rounded-2xl overflow-hidden max-h-[80vh] sm:max-h-[60vh] animate-slide-in-fwd">
                    {/* Header - Christmas Gradient */}
                    <div className="relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-red-600/90 via-green-600/90 to-red-600/90 backdrop-blur-sm"></div>
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>

                      <div className="relative p-4 sm:p-5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
                              <FaExclamationTriangle className="text-white text-xl" />
                            </div>
                            <div>
                              <h4 className="text-white font-bold text-lg flex items-center gap-2">
                                Stock Alerts{" "}
                                <span className="text-yellow-300">🎄</span>
                              </h4>
                              <p className="text-white/90 text-sm">
                                {lowStockItems.length} critical item
                                {lowStockItems.length !== 1 && "s"}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="bg-white/20 backdrop-blur-sm text-white font-bold px-3 py-1.5 rounded-full flex items-center gap-1">
                              {lowStockItems.length}{" "}
                              <span className="text-xs">🎁</span>
                            </div>
                            <button
                              onClick={() => setNotifyOpen(false)}
                              className="sm:hidden p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg"
                            >
                              <MdClose className="text-xl" />
                            </button>
                          </div>
                        </div>

                        {/* Stats Row with Christmas colors */}
                        <div className="grid grid-cols-3 gap-3 mt-4">
                          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center border border-red-300/30">
                            <div className="text-white text-sm font-medium mb-1 flex items-center justify-center gap-1">
                              Critical <span className="text-xs">🔥</span>
                            </div>
                            <div className="text-white text-xl font-bold">
                              {
                                lowStockItems.filter((i) => i.itemQuantity < 5)
                                  .length
                              }
                            </div>
                          </div>
                          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center border border-yellow-300/30">
                            <div className="text-white text-sm font-medium mb-1 flex items-center justify-center gap-1">
                              Low <span className="text-xs">⚠️</span>
                            </div>
                            <div className="text-white text-xl font-bold">
                              {
                                lowStockItems.filter((i) => i.itemQuantity >= 5)
                                  .length
                              }
                            </div>
                          </div>
                          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center border border-green-300/30">
                            <div className="text-white text-sm font-medium mb-1 flex items-center justify-center gap-1">
                              Total <span className="text-xs">📊</span>
                            </div>
                            <div className="text-white text-xl font-bold">
                              {lowStockItems.length}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Body - Modern Cards */}
                    <div className="p-4 sm:p-5 overflow-y-auto max-h-[calc(60vh-180px)]">
                      {lowStockItems.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10">
                          <div className="relative mb-4">
                            <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center shadow-lg">
                              <FaBoxOpen className="text-emerald-500 text-3xl" />
                            </div>
                            <div className="absolute -top-2 -right-2 w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center shadow-lg">
                              ✓
                            </div>
                            {/* Christmas ornament */}
                            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-red-500 rounded-full border-2 border-white shadow-md"></div>
                          </div>
                          <h5 className="font-bold text-gray-800 text-lg mb-1 flex items-center gap-2">
                            All Stock Optimal{" "}
                            <span className="text-green-600">🎅</span>
                          </h5>
                          <p className="text-gray-500 text-sm text-center">
                            Your inventory is in perfect condition for the
                            holidays!
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {lowStockItems.map((item, index) => {
                            const stockPercentage = Math.round(
                              (item.itemQuantity / (item.reOrderPoint || 10)) *
                                100
                            );
                            const isCritical = item.itemQuantity < 5;

                            return (
                              <div
                                key={item._id}
                                onClick={() => {
                                  navigate("/Settings");
                                  setNotifyOpen(false);
                                }}
                                className="group bg-gradient-to-r from-white to-gray-50 hover:from-red-50/30 hover:to-green-50/30 rounded-xl border border-gray-200 hover:border-red-200 cursor-pointer transition-all duration-300 hover:shadow-lg active:scale-[0.98] p-4"
                              >
                                <div className="flex items-center gap-4">
                                  <div className="relative flex-shrink-0">
                                    <div className="w-14 h-14 bg-gradient-to-br from-red-100 to-green-100 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg">
                                      <FaWarehouse className="text-red-500 text-base" />
                                    </div>
                                    <div className="absolute -top-2 -right-2 w-7 h-7 bg-gradient-to-r from-red-500 to-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-lg">
                                      {index + 1}
                                    </div>
                                  </div>

                                  <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-3">
                                      <div className="flex-1 min-w-0">
                                        <h5 className="font-semibold text-gray-800 text-sm group-hover:text-red-700 truncate">
                                          {item.name}
                                        </h5>
                                        <p className="text-gray-500 text-xs mt-0.5">
                                          ID: {item._id.slice(-8).toUpperCase()}
                                        </p>
                                      </div>
                                      <div className="flex flex-col items-end ml-2">
                                        <span
                                          className={`px-3 py-1 rounded-lg font-bold text-sm ${
                                            isCritical
                                              ? "bg-red-500/10 text-red-700"
                                              : "bg-yellow-500/10 text-yellow-700"
                                          }`}
                                        >
                                          {item.itemQuantity} units
                                        </span>
                                        <span className="text-gray-400 text-[10px] mt-1 flex items-center gap-1">
                                          {isCritical
                                            ? "🎯 CRITICAL"
                                            : "📉 LOW STOCK"}
                                        </span>
                                      </div>
                                    </div>

                                    <div className="space-y-2">
                                      <div className="flex items-center justify-between">
                                        <span className="text-xs text-gray-600">
                                          Stock Level
                                        </span>
                                        <div className="flex items-center gap-1">
                                          <span className="text-xs font-bold text-red-600">
                                            {stockPercentage}%
                                          </span>
                                          <HiOutlineExclamationCircle className="text-red-500" />
                                        </div>
                                      </div>

                                      <div className="relative">
                                        <div className="w-full h-2 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full overflow-hidden">
                                          <div
                                            className="h-2 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-full transition-all duration-500"
                                            style={{
                                              width: `${Math.min(
                                                stockPercentage,
                                                100
                                              )}%`,
                                            }}
                                          ></div>
                                        </div>
                                        <div className="flex justify-between mt-1">
                                          <span className="text-[10px] text-gray-500">
                                            0%
                                          </span>
                                          <span className="text-[10px] text-gray-500">
                                            Threshold
                                          </span>
                                          <span className="text-[10px] text-gray-500">
                                            100%
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Footer - Action Buttons with Christmas theme */}
                    <div className="border-t border-gray-200/50 p-4 bg-gradient-to-r from-red-50/30 to-green-50/30">
                      <div className="flex gap-3">
                        <button
                          onClick={() => {
                            navigate("/inventory");
                            setNotifyOpen(false);
                          }}
                          className="flex-1 py-3 bg-gradient-to-r from-red-600 to-green-600 hover:from-red-700 hover:to-green-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2 group"
                        >
                          <MdInventory2 className="text-lg group-hover:rotate-12 transition-transform" />
                          <span>Manage Inventory</span>
                          <MdArrowForward className="text-sm opacity-0 group-hover:opacity-100 transform group-hover:translate-x-1 transition-all" />
                        </button>
                        <button
                          onClick={() => {
                            navigate("/dashboard");
                            setNotifyOpen(false);
                          }}
                          className="px-4 py-3 bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-black text-white font-semibold rounded-xl transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                        >
                          <RiDashboardLine className="text-lg" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* User Profile - Christmas themed */}
          <div className="relative" ref={dropdownRef}>
            {/* User Button */}
            <div
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-br from-white to-gray-50 shadow-lg cursor-pointer hover:shadow-xl transition-all duration-300 group border border-gray-400 hover:border-red-400 active:scale-[0.98]"
            >
              {user?.photo ? (
                <div className="relative">
                  <img
                    src={`${BASE_URL}/pfps/${user.photo}`}
                    className="h-9 w-9 rounded-xl object-cover ring-2 ring-red-400/50 group-hover:ring-red-500 transition-all duration-300"
                    alt="User"
                  />
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-red-500 rounded-full ring-2 ring-white shadow-sm"></div>
                  {/* Tiny Santa hat on user photo */}
                  <div className="absolute -top-2 -left-1 w-4 h-3 bg-red-600 rounded-t-full"></div>
                </div>
              ) : (
                <div className="h-9 w-9 flex items-center justify-center bg-gradient-to-br from-red-500 to-green-600 text-white font-bold rounded-xl ring-2 ring-red-400/50 group-hover:ring-red-500 transition-all duration-300">
                  <AiOutlineUser className="text-base" />
                </div>
              )}
              <div className="hidden sm:block text-left">
                <span className="font-semibold text-gray-800 text-sm truncate max-w-[120px] block">
                  {uName}
                </span>
                <span className="text-xs text-gray-500 capitalize flex items-center gap-1">
                  {user?.title || "Admin"}{" "}
                  <span className="text-red-500 text-xs">🎅</span>
                </span>
              </div>
              <RiUserSettingsLine className="text-gray-600 group-hover:text-red-600 transition-colors text-lg hidden sm:block ml-1" />
            </div>

            {/* Profile Dropdown - Christmas themed */}
            {dropdownOpen && (
              <>
                <div
                  className="fixed inset-0 bg-black/10 backdrop-blur-sm z-40 sm:hidden"
                  onClick={() => setDropdownOpen(false)}
                ></div>

                <div className="fixed inset-0 flex items-start justify-center pt-20 p-4 z-50 sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-3 sm:p-0">
                  <div className="w-full max-w-[90vw] sm:w-[500px] lg:w-[550px] bg-white/95 backdrop-blur-xl border border-gray-300/50 shadow-2xl rounded-2xl overflow-hidden max-h-[80vh] sm:max-h-[60vh] animate-slide-in-fwd">
                    {/* Header - Christmas Gradient */}
                    <div className="relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-red-600/90 via-green-600/90 to-red-600/90 backdrop-blur-sm"></div>
                      <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 -translate-x-16"></div>

                      <div className="relative p-4 sm:p-5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="relative">
                              {user?.photo ? (
                                <img
                                  src={`${BASE_URL}/pfps/${user.photo}`}
                                  className="h-16 w-16 rounded-2xl object-cover ring-4 ring-white/50 shadow-xl"
                                  alt="User"
                                />
                              ) : (
                                <div className="h-16 w-16 flex items-center justify-center bg-gradient-to-br from-red-600 to-green-700 text-white font-bold rounded-2xl ring-4 ring-white/50 shadow-xl">
                                  <MdPerson className="text-2xl" />
                                </div>
                              )}
                              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-red-400 rounded-full ring-2 ring-white shadow-md"></div>
                              {/* Christmas hat on profile picture */}
                              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-12 h-8 bg-red-600 rounded-t-full">
                                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-10 h-3 bg-white rounded-full"></div>
                                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-white rounded-full">
                                  <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                                </div>
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-white font-bold text-xl truncate flex items-center gap-2">
                                {uName}{" "}
                                <span className="text-yellow-300">⭐</span>
                              </h3>
                              <p className="text-white/90 text-sm truncate mb-2">
                                {user?.email || "No email"}
                              </p>
                              <div className="flex items-center gap-2">
                                <span className="inline-flex items-center px-3 py-1.5 bg-white/20 backdrop-blur-sm text-white text-xs rounded-full font-medium">
                                  {user?.title || "Administrator"}
                                </span>
                                <span className="inline-flex items-center px-3 py-1.5 bg-red-400/30 backdrop-blur-sm text-white text-xs rounded-full font-medium">
                                  <div className="w-2 h-2 bg-red-300 rounded-full mr-1.5 animate-pulse"></div>
                                  Online 🎄
                                </span>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => setDropdownOpen(false)}
                            className="sm:hidden p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg"
                          >
                            <MdClose className="text-xl" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Profile Details - Christmas themed */}
                    <div className="p-4 sm:p-5 overflow-y-auto max-h-[calc(60vh-200px)]">
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <InfoCard
                          icon={<MdPerson className="text-lg" />}
                          color="red"
                          label="Username"
                          value={user?.userName || "Not set"}
                          gradient="from-red-50 to-red-100"
                        />
                        <InfoCard
                          icon="🎂"
                          color="green"
                          label="Age"
                          value={`${calculateAge(user?.dateOfBirth)} yrs`}
                          gradient="from-green-50 to-green-100"
                        />
                        <InfoCard
                          icon="📱"
                          color="yellow"
                          label="Contacts"
                          value={user?.contacts || "Not set"}
                          gradient="from-yellow-50 to-yellow-100"
                        />
                        <InfoCard
                          icon={<FaChartLine className="text-lg" />}
                          color="red"
                          label="Member Since"
                          value={
                            user?.createdAt
                              ? new Date(user.createdAt).toLocaleDateString(
                                  "en-US",
                                  {
                                    month: "short",
                                    year: "numeric",
                                    day: "numeric",
                                  }
                                )
                              : "N/A"
                          }
                          gradient="from-red-50 to-red-100"
                        />
                      </div>

                      {/* Address Card with Christmas theme */}
                      {user?.address && (
                        <div className="bg-gradient-to-r from-green-50/80 to-red-50/80 rounded-xl p-4 border border-green-200/50 mb-4">
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-green-100 rounded-lg mt-0.5">
                              <span className="text-green-600 text-sm">📍</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-gray-600 font-medium mb-1 flex items-center gap-2">
                                Primary Address
                                <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full flex items-center gap-1">
                                  Verified <span className="text-xs">✅</span>
                                </span>
                              </p>
                              <p className="text-gray-800 text-sm leading-relaxed">
                                {user.address}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Quick Stats with Christmas theme */}
                      <div className="bg-gradient-to-r from-red-50/50 to-green-50/50 rounded-xl p-4 border border-red-200/50 shadow-sm">
                        <h4 className="font-semibold text-gray-700 text-sm mb-3 flex items-center gap-2">
                          <RiDashboardLine className="text-red-500" />
                          Quick Stats <span className="text-xs">📊</span>
                        </h4>
                        <div className="grid grid-cols-3 gap-3">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-red-600 mb-1">
                              {items.length}
                            </div>
                            <div className="text-xs text-gray-500 flex items-center justify-center gap-1">
                              Total Items{" "}
                              <span className="text-red-500">📦</span>
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600 mb-1">
                              {lowStockItems.length}
                            </div>
                            <div className="text-xs text-gray-500 flex items-center justify-center gap-1">
                              Alerts <span className="text-red-500">🚨</span>
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-yellow-600 mb-1">
                              {user?.createdAt
                                ? Math.floor(
                                    (new Date() - new Date(user.createdAt)) /
                                      (1000 * 60 * 60 * 24)
                                  )
                                : "0"}
                            </div>
                            <div className="text-xs text-gray-500 flex items-center justify-center gap-1">
                              Active Days{" "}
                              <span className="text-green-500">🎄</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Footer - Action Buttons with Christmas theme */}
                    <div className="border-t border-gray-200/50 p-4 bg-gradient-to-r from-red-50/30 to-green-50/30">
                      <div className="flex gap-3">
                        <button
                          onClick={() => navigate("/settings")}
                          className="flex-1 py-3 bg-gradient-to-r from-red-600 to-green-600 hover:from-red-700 hover:to-green-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2 group"
                        >
                          <FaCog className="text-base group-hover:rotate-180 transition-transform duration-500" />
                          <span>Settings</span>
                        </button>
                        <button
                          onClick={handleLogout}
                          className="flex-1 py-3 bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-black text-white font-semibold rounded-xl transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2 group"
                        >
                          <FaSignOutAlt className="text-base group-hover:-translate-x-1 transition-transform" />
                          <span>Logout</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* CSS Animations for Snowfall */}
      <style>{`
        @keyframes fall {
          0% {
            transform: translateY(-100px) rotate(0deg);
          }
          100% {
            transform: translateY(100vh) rotate(360deg);
          }
        }
        
        .animate-fall {
          animation: fall linear infinite;
        }
        
        @keyframes slide-in-fwd {
          0% {
            transform: translateZ(-1400px);
            opacity: 0;
          }
          100% {
            transform: translateZ(0);
            opacity: 1;
          }
        }
        
        .animate-slide-in-fwd {
          animation: slide-in-fwd 0.4s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
        }
      `}</style>
    </div>
  );
};

// Reusable Info Card Component - Updated with Christmas colors
const InfoCard = ({ icon, color, label, value, gradient }) => {
  const colorClasses = {
    red: "from-red-100 to-red-200 text-red-600",
    green: "from-green-100 to-green-200 text-green-600",
    blue: "from-blue-100 to-blue-200 text-blue-600",
    purple: "from-purple-100 to-purple-200 text-purple-600",
    amber: "from-amber-100 to-amber-200 text-amber-600",
    yellow: "from-yellow-100 to-yellow-200 text-yellow-600",
  };

  return (
    <div
      className={`bg-gradient-to-br ${gradient} rounded-xl p-3 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300`}
    >
      <div className="flex items-center gap-2 mb-2">
        <div
          className={`p-1.5 bg-gradient-to-br ${colorClasses[color]} rounded-lg`}
        >
          <span className="text-xs">{icon}</span>
        </div>
        <span className="text-xs text-gray-600 font-medium">{label}</span>
      </div>
      <p className="font-semibold text-gray-800 text-sm truncate">{value}</p>
    </div>
  );
};

export default Header;
