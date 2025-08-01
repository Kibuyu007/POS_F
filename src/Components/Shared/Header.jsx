import { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { FaBell } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import logo from "../../assets/logo.jpg";
import { logoutSuccess } from "../../Redux/userSlice";
import { AiOutlineLogout } from "react-icons/ai";
import { itemsError, itemsFetch, itemsPending } from "../../Redux/items";

//URL
const URL = import.meta.env.VITE_API;

const Header = () => {
  const { items = [] } = useSelector((state) => state.items);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifyOpen, setNotifyOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Get user details from Redux store
  const user = useSelector((state) => state.user?.user);
  const uName = user ? `${user.firstName} ${user.lastName}` : "Guest";

  const fetchData = async () => {
    try {
      dispatch(itemsPending());
      let url = `${URL}/api/items/allItemsRaw`;

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
      await axios.get(`${URL}/api/auth/logout`, {
        withCredentials: true,
      });

      // Clear Redux state & localStorage
      setDropdownOpen(false);
      dispatch(logoutSuccess());
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Redirect to login page
      navigate("/auth");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Function to calculate age from date of birth
  const calculateAge = (dateOfBirth) => {
    const dob = new Date(dateOfBirth); // Convert date of birth to a Date object
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

  //Use Ref for Closing Dropdowns
  const dropdownRef = useRef();
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }

      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setNotifyOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="fixed  left-4 right-4 flex justify-center z-50">
      <header className="w-full max-w-[1500px] backdrop-blur-md px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 py-3 sm:py-4 flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center gap-2 sm:gap-3">
          <img
            src={logo}
            className="h-80 w-10 sm:h-12 sm:w-12 rounded-md shadow-md"
            alt="Logo"
          />
          <h1 className="text-base sm:text-lg md:text-xl font-bold">Uza</h1>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="relative" ref={dropdownRef}>
            {/* Bell Button */}
            <div
              onClick={() => setNotifyOpen(!notifyOpen)}
              className="relative p-3 bg-white dark:bg-neutral-800 rounded-full shadow-md cursor-pointer hover:scale-105 transition-transform"
            >
              <FaBell className="text-gray-800 dark:text-white text-xl" />
              {lowStockItems.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center animate-bounce shadow">
                  {lowStockItems.length}
                </span>
              )}
            </div>

            {/* Notification Dropdown */}
            {notifyOpen && (
              <div className="absolute right-0 mt-3 w-[400px] max-h-[400px] overflow-y-auto bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 shadow-lg rounded-2xl z-50 animate-fade-in-up transition-all">
                {/* Header */}
                <div className="px-5 py-4 bg-gradient-to-r from-rose-600 to-pink-500 rounded-t-2xl flex justify-between items-center shadow-md">
                  <div className="text-white">
                    <h4 className="text-sm font-bold">
                      {lowStockItems.length} Item
                      {lowStockItems.length !== 1 && "s"} Low in Stock
                    </h4>
                    <p className="text-xs opacity-90">Check and Reorder</p>
                  </div>
                  <span className="text-xs bg-white text-red-600 font-semibold px-2 py-0.5 rounded-full shadow-sm">
                    Urgent
                  </span>
                </div>

                {/* Body */}
                <div className="px-5 py-4 space-y-3">
                  {lowStockItems.length === 0 ? (
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      All items are sufficiently stocked.
                    </p>
                  ) : (
                    lowStockItems.map((item, index) => (
                      <div
                        key={item._id}
                        className="bg-gray-100 dark:bg-neutral-800 border border-gray-300 dark:border-neutral-700 px-4 py-3 rounded-xl flex items-center justify-between gap-3 hover:bg-gray-200 dark:hover:bg-neutral-700 transition"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 flex items-center justify-center bg-white dark:bg-neutral-900 rounded-full shadow text-rose-600 font-bold text-xs select-none">
                            {index + 1}
                          </div>
                          <div className="text-sm">
                            <p className="font-medium text-gray-900 dark:text-white truncate max-w-[200px]">
                              {item.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Item Code: #{item._id.slice(-4).toUpperCase()}
                            </p>
                          </div>
                        </div>
                        <span className="text-sm font-bold text-rose-600 dark:text-rose-400 select-none">
                          {item.itemQuantity.toLocaleString()}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Dropdown */}
          <div className="relative" ref={dropdownRef}>
            {/* User Button */}
            <div
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-3 px-4 py-2 rounded-full bg-white dark:bg-neutral-900 shadow-xl border border-gray-200 dark:border-neutral-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-neutral-800 transition-all"
            >
              {user?.photo ? (
                <img
                  src={`http://localhost:4004/pfps/${user.photo}`}
                  className="h-10 w-10 rounded-full object-cover ring-2 ring-green-500 shadow-sm"
                  alt="User"
                />
              ) : (
                <div className="h-10 w-10 flex items-center justify-center bg-gray-400 dark:bg-gray-700 text-white text-sm font-bold rounded-full ring-2 ring-green-500">
                  {user?.userName?.[0] || "U"}
                </div>
              )}
              <span className="font-semibold text-gray-800 dark:text-white truncate max-w-[140px]">
                {uName}
              </span>
              <AiOutlineLogout className="text-xl text-green-600" />
            </div>

            {/* Dropdown Panel */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-4 w-[700px] backdrop-blur-sm bg-white/80 dark:bg-neutral-900/90 border border-gray-200 dark:border-neutral-700 shadow-2xl rounded-3xl z-50 overflow-hidden animate-fade-in-up transition-all duration-300">
                <div className="rounded-3xl overflow-hidden">
                  {/* Header */}
                  <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">👤</span>
                      <h3 className="text-xl font-bold tracking-wide">
                        My Profile
                      </h3>
                    </div>
                  </div>

                  {/* Profile Info */}
                  <div className="p-6 grid grid-cols-3 gap-5 text-gray-700 dark:text-gray-200 text-sm">
                    {[
                      { label: "Username", value: user?.userName },
                      {
                        label: "Age",
                        value: `${calculateAge(user?.dateOfBirth)} yrs`,
                      },
                      { label: "Title", value: user?.title },
                      { label: "Address", value: user?.address },
                      { label: "Contacts", value: user?.contacts },
                      { label: "Email", value: user?.email },
                    ].map((item, i) => (
                      <div
                        key={i}
                        className="bg-white dark:bg-neutral-800 px-5 py-4 rounded-xl border border-gray-200 dark:border-neutral-700 shadow-sm"
                      >
                        <span className="block text-gray-500 dark:text-gray-400 text-xs font-medium mb-1">
                          {item.label}
                        </span>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white break-words">
                          {item.value || "-"}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Logout Button */}
                  <div className="p-6 pt-0 flex justify-center">
                    <button
                      onClick={handleLogout}
                      className="bg-gradient-to-r from-green-500 to-emerald-600 hover:brightness-110 transition duration-300 text-white font-semibold px-10 py-3 rounded-full shadow-lg"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
    </div>
  );
};

export default Header;
