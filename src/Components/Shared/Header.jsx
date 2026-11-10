import { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  FaBoxOpen,
  FaWarehouse,
  FaExclamationTriangle,
  FaSignOutAlt,
} from "react-icons/fa";
import { MdClose, MdNotificationsActive, MdInventory2 } from "react-icons/md";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import { RiDashboardLine } from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import logo from "../../assets/wise.png";
import { logoutSuccess } from "../../Redux/userSlice";
import { itemsError, itemsFetch, itemsPending } from "../../Redux/items";
import BASE_URL from "../../Utils/config";
import toast from "react-hot-toast";

const Header = () => {
  const { items = [] } = useSelector((state) => state.items);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifyOpen, setNotifyOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector((state) => state.user?.user);
  const uName = user ? `${user.firstName} ${user.lastName}` : "Guest";
  const initials = uName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const fetchData = async () => {
    try {
      dispatch(itemsPending());
      const url = `${BASE_URL}/api/items/allItemsRaw`;
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

  const handleLogout = async () => {
    try {
      await axios.get(`${BASE_URL}/api/auth/logout`, {
        withCredentials: true,
      });
      setDropdownOpen(false);
      dispatch(logoutSuccess());
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      toast.success("Logged out successfully!");
      navigate("/auth");
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Logout failed");
    }
  };

  const lowStockItems = items.filter((item) => item.reOrderStatus === "Low");

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
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="fixed left-4 right-4 top-4 flex justify-center z-50">
      <header className="w-full max-w-[1500px] mx-auto px-4 sm:px-6 md:px-8 py-3 flex justify-between items-center relative z-10">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="relative group">
            <img
              src={logo}
              className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl shadow-md transform group-hover:scale-105 transition-all duration-300 ring-2 ring-emerald-500/20"
              alt="Logo"
            />
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-emerald-500/10 to-green-500/10 group-hover:from-emerald-500/20 group-hover:to-green-500/20 transition-all duration-300"></div>
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-600 bg-clip-text text-transparent">
              Uza
            </h1>
            <p className="text-[11px] text-gray-500 hidden sm:block">
              Inventory Pro
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* ─── Notification Bell ─── */}
          <div className="relative" ref={notifyRef}>
            <button
              onClick={() => setNotifyOpen(!notifyOpen)}
              className={`group relative flex items-center gap-2.5 h-12 pl-2 pr-3.5 rounded-full bg-white shadow-md border-2 transition-all duration-300 active:scale-[0.97] ${
                notifyOpen
                  ? "border-emerald-500 shadow-emerald-200/60"
                  : "border-gray-300 hover:border-emerald-400 hover:shadow-lg"
              }`}
            >
              {/* Icon bubble */}
              <div className="relative flex items-center justify-center h-8 w-8 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 shadow-inner">
                <MdNotificationsActive className="text-white text-base" />
                {lowStockItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-white text-emerald-700 text-[10px] font-extrabold rounded-full flex items-center justify-center shadow ring-2 ring-emerald-500">
                    {lowStockItems.length}
                  </span>
                )}
              </div>

              {/* Text */}
              <div className="hidden sm:flex flex-col items-start leading-tight">
                <span className="text-[13px] font-bold text-gray-900">
                  Alerts
                </span>
                <span className="text-[11px] font-semibold text-emerald-700">
                  {lowStockItems.length} low
                </span>
              </div>
            </button>

            {/* Notification Dropdown */}
            {notifyOpen && (
              <>
                <div
                  className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-40 sm:hidden"
                  onClick={() => setNotifyOpen(false)}
                ></div>

                <div className="fixed inset-0 flex items-start justify-center pt-20 p-4 z-50 sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-3 sm:p-0">
                  <div className="w-full max-w-[90vw] sm:w-[400px] bg-white rounded-3xl shadow-2xl border-2 border-gray-200 overflow-hidden animate-slide-in-fwd">
                    {/* Header */}
                    <div className="p-4 flex items-center justify-between bg-gradient-to-br from-emerald-50/60 to-white border-b-2 border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-500 rounded-full shadow-md">
                          <FaExclamationTriangle className="text-white text-sm" />
                        </div>
                        <div>
                          <h4 className="text-gray-900 font-bold text-sm">
                            Stock Alerts
                          </h4>
                          <p className="text-gray-600 text-xs font-medium">
                            {lowStockItems.length} critical item
                            {lowStockItems.length !== 1 && "s"}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setNotifyOpen(false)}
                        className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors sm:hidden"
                      >
                        <MdClose className="text-lg" />
                      </button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-2 px-4 py-3 bg-emerald-50/30 border-b-2 border-gray-100">
                      <StatPill
                        label="Critical"
                        value={
                          lowStockItems.filter((i) => i.itemQuantity < 5).length
                        }
                        tone="red"
                      />
                      <StatPill
                        label="Low"
                        value={
                          lowStockItems.filter((i) => i.itemQuantity >= 5)
                            .length
                        }
                        tone="amber"
                      />
                      <StatPill
                        label="Total"
                        value={lowStockItems.length}
                        tone="emerald"
                      />
                    </div>

                    {/* List */}
                    <div className="p-3 overflow-y-auto max-h-[340px]">
                      {lowStockItems.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10">
                          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-3">
                            <FaBoxOpen className="text-emerald-600 text-2xl" />
                          </div>
                          <h5 className="font-bold text-gray-900 text-sm mb-1">
                            All Stock Optimal
                          </h5>
                          <p className="text-gray-600 text-xs text-center font-medium">
                            Your inventory is in perfect condition
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {lowStockItems.map((item) => {
                            const stockPercentage = Math.round(
                              (item.itemQuantity / (item.reOrderPoint || 10)) *
                                100,
                            );
                            const isCritical = item.itemQuantity < 5;

                            return (
                              <div
                                key={item._id}
                                onClick={() => {
                                  navigate("/Settings");
                                  setNotifyOpen(false);
                                }}
                                className="group bg-white hover:bg-emerald-50/60 rounded-2xl border-2 border-gray-200 hover:border-emerald-300 cursor-pointer transition-all duration-200 active:scale-[0.99] p-3"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 flex-shrink-0 bg-gradient-to-br from-emerald-100 to-green-100 rounded-full flex items-center justify-center">
                                    <FaWarehouse className="text-emerald-700 text-sm" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start gap-2">
                                      <div className="min-w-0">
                                        <h5 className="font-bold text-gray-900 text-sm truncate group-hover:text-emerald-700">
                                          {item.name}
                                        </h5>
                                        <p className="text-gray-600 text-[11px] font-medium mt-0.5">
                                          ID: {item._id.slice(-8).toUpperCase()}
                                        </p>
                                      </div>
                                      <span
                                        className={`flex-shrink-0 px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                                          isCritical
                                            ? "bg-red-100 text-red-700"
                                            : "bg-amber-100 text-amber-700"
                                        }`}
                                      >
                                        {item.itemQuantity} u
                                      </span>
                                    </div>
                                    <div className="mt-2">
                                      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                          className={`h-full rounded-full transition-all duration-500 ${
                                            isCritical
                                              ? "bg-red-500"
                                              : "bg-gradient-to-r from-amber-400 to-emerald-500"
                                          }`}
                                          style={{
                                            width: `${Math.min(
                                              stockPercentage,
                                              100,
                                            )}%`,
                                          }}
                                        ></div>
                                      </div>
                                      <div className="flex justify-between mt-1">
                                        <span className="text-[10px] text-gray-600 font-semibold flex items-center gap-0.5">
                                          <HiOutlineExclamationCircle className="text-emerald-600" />
                                          {stockPercentage}% of threshold
                                        </span>
                                        <span
                                          className={`text-[10px] font-extrabold ${
                                            isCritical
                                              ? "text-red-600"
                                              : "text-amber-600"
                                          }`}
                                        >
                                          {isCritical ? "CRITICAL" : "LOW"}
                                        </span>
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

                    {/* Footer */}
                    <div className="p-3 border-t-2 border-gray-100 bg-gray-50/60 flex gap-2">
                      <button
                        onClick={() => {
                          navigate("/inventory");
                          setNotifyOpen(false);
                        }}
                        className="flex-1 py-2.5 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white text-sm font-bold rounded-full transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 group"
                      >
                        <MdInventory2 className="text-base group-hover:rotate-12 transition-transform" />
                        <span>Manage Inventory</span>
                      </button>
                      <button
                        onClick={() => {
                          navigate("/dashboard");
                          setNotifyOpen(false);
                        }}
                        className="px-3.5 py-2.5 bg-gradient-to-br from-gray-800 to-black hover:from-gray-900 hover:to-gray-800 text-white rounded-full transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center"
                        aria-label="Dashboard"
                      >
                        <RiDashboardLine className="text-base" />
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* ─── User Profile ─── */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className={`flex items-center gap-3 h-12 pl-1.5 pr-3.5 rounded-full bg-white shadow-md border-2 transition-all duration-300 active:scale-[0.97] ${
                dropdownOpen
                  ? "border-emerald-500 shadow-emerald-200/60"
                  : "border-gray-300 hover:border-emerald-400 hover:shadow-lg"
              }`}
            >
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                {user?.photo ? (
                  <img
                    src={`${BASE_URL}/pfps/${user.photo}`}
                    className="h-9 w-9 rounded-full object-cover ring-2 ring-emerald-200"
                    alt="User"
                  />
                ) : (
                  <div className="h-9 w-9 flex items-center justify-center bg-gradient-to-br from-emerald-500 to-green-600 text-white font-extrabold rounded-full text-xs ring-2 ring-emerald-200">
                    {initials}
                  </div>
                )}
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-white"></span>
              </div>

              {/* Details */}
              <div className="hidden sm:flex flex-col items-start leading-tight">
                <span className="font-extrabold text-gray-900 text-[13px] truncate max-w-[130px]">
                  {uName}
                </span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-wide">
                    {user?.title || "Admin"}
                  </span>
                  <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                  <span className="text-[10px] text-gray-600 font-semibold">
                    ID: {user?._id?.slice(-4).toUpperCase() || "—"}
                  </span>
                </div>
              </div>

              {/* Chevron */}
              <svg
                className={`w-4 h-4 text-gray-600 transition-transform duration-200 flex-shrink-0 ${
                  dropdownOpen ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {/* User Dropdown */}
            {dropdownOpen && (
              <>
                <div
                  className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-40 sm:hidden"
                  onClick={() => setDropdownOpen(false)}
                ></div>

                <div className="fixed inset-0 flex items-start justify-center pt-20 p-4 z-50 sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-3 sm:p-0">
                  <div className="w-full max-w-[90vw] sm:w-[320px] bg-white rounded-3xl shadow-2xl border-2 border-gray-200 overflow-hidden animate-slide-in-fwd">
                    {/* Header */}
                    <div className="p-4 flex items-center gap-3 bg-gradient-to-br from-emerald-50/60 to-white border-b-2 border-gray-100">
                      {user?.photo ? (
                        <img
                          src={`${BASE_URL}/pfps/${user.photo}`}
                          className="h-12 w-12 rounded-full object-cover ring-2 ring-emerald-300"
                          alt="User"
                        />
                      ) : (
                        <div className="h-12 w-12 flex items-center justify-center bg-gradient-to-br from-emerald-500 to-green-600 text-white font-extrabold rounded-full text-sm ring-2 ring-emerald-300">
                          {initials}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-extrabold text-gray-900 text-[15px] truncate">
                          {uName}
                        </h3>
                        <p className="text-gray-600 text-xs truncate font-semibold">
                          {user?.email || "No email"}
                        </p>
                      </div>
                      <button
                        onClick={() => setDropdownOpen(false)}
                        className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors sm:hidden"
                      >
                        <MdClose className="text-lg" />
                      </button>
                    </div>

                    {/* Details */}
                    <div className="px-5 py-4 space-y-3">
                      <DetailRow
                        label="Role"
                        value={user?.title || "Admin"}
                        capitalize
                      />
                      <DetailRow
                        label="Username"
                        value={user?.userName || "—"}
                      />
                      <DetailRow
                        label="Contacts"
                        value={user?.contacts || "—"}
                      />
                      <DetailRow
                        label="Status"
                        value={
                          <span className="inline-flex items-center gap-1.5 text-emerald-700 font-extrabold">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-emerald-100"></span>
                            Online
                          </span>
                        }
                      />
                    </div>

                    {/* Logout */}
                    <div className="p-3 border-t-2 border-gray-100 bg-gray-50/60">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-full bg-gradient-to-r from-gray-900 to-black hover:from-red-600 hover:to-red-700 text-white text-sm font-extrabold transition-all duration-200 shadow-md hover:shadow-lg group"
                      >
                        <FaSignOutAlt className="text-sm group-hover:-translate-x-0.5 transition-transform" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <style>{`
        @keyframes slide-in-fwd {
          0% { transform: translateZ(-1400px); opacity: 0; }
          100% { transform: translateZ(0); opacity: 1; }
        }
        .animate-slide-in-fwd {
          animation: slide-in-fwd 0.35s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
        }
      `}</style>
    </div>
  );
};

const StatPill = ({ label, value, tone }) => {
  const tones = {
    red: "text-red-700 bg-red-100",
    amber: "text-amber-700 bg-amber-100",
    emerald: "text-emerald-700 bg-emerald-100",
  };
  return (
    <div className={`rounded-full px-2 py-1.5 text-center ${tones[tone]}`}>
      <div className="text-[10px] font-bold uppercase tracking-wide opacity-80">
        {label}
      </div>
      <div className="text-base font-extrabold">{value}</div>
    </div>
  );
};

const DetailRow = ({ label, value, capitalize }) => (
  <div className="flex items-center justify-between">
    <span className="text-[11px] text-gray-500 font-bold uppercase tracking-wider">
      {label}
    </span>
    <span
      className={`text-[13px] text-gray-900 font-extrabold truncate max-w-[160px] ${
        capitalize ? "capitalize" : ""
      }`}
    >
      {value}
    </span>
  </div>
);

export default Header;
