import { FaHome } from "react-icons/fa";
import { TiShoppingCart } from "react-icons/ti";
import { TbReportSearch } from "react-icons/tb";
import { useNavigate, useLocation } from "react-router-dom";
import { Orbit } from "lucide-react";

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: "/home", label: "Home", icon: <FaHome size={20} /> },
    { path: "/menu", label: "menu", icon: <TiShoppingCart size={20} /> },
    { path: "/reports", label: "Reports", icon: <TbReportSearch size={20} /> },
    { path: "/settings", label: "Settings", icon: <Orbit size={20} /> },
  ];

  return (
    <>
      {/* Bottom Navigation - Same Design, Responsive */}
      <div className="fixed bottom-1 left-1/2 transform -translate-x-1/2 mb-2 sm:mb-4 bg-gray-100/95 backdrop-blur-md shadow-lg rounded-[20px] p-2 sm:p-3 flex justify-around w-[95%] sm:w-[90%] max-w-[600px]">
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center px-3 sm:px-6 md:px-8 py-2 sm:py-2.5 rounded-full transition-all duration-300 shadow-md active:scale-95 ${
              location.pathname === item.path
                ? "bg-black text-white"
                : "bg-green-400"
            }`}
          >
            {item.icon}
          </button>
        ))}
      </div>
    </>
  );
};

export default Navigation;
