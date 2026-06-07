import { useState } from "react";
import { FaHome, FaConciergeBell } from "react-icons/fa";
import { TiShoppingCart } from "react-icons/ti";
import { IoSettings } from "react-icons/io5";
import { TbReportSearch } from "react-icons/tb";
import { useNavigate, useLocation } from "react-router-dom";
import Modal from "../../Pages/Orders/Modal";
import { useDispatch } from "react-redux";
import { setCustomerOrder, updateTableOrder } from "../../Redux/customerOrderSlice";
import { table } from "../../Constants/IndexDishes"; 

const Navigation = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: "/home", label: "Home", icon: <FaHome size={20} /> },
    { path: "/menu", label: "menu", icon: <TiShoppingCart size={20} /> },
    { path: "/reports", label: "Reports", icon: <TbReportSearch size={20} /> },
    { path: "/settings", label: "Settings", icon: <IoSettings size={20} /> },
  ];

  // Modal Details
  const [isModalOpen, setIsModalOpen] = useState(false);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  // Order Details
  const [customerName, setCustomerName] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerContact, setCustomerContact] = useState("");
  const [tableNumber, setTableNumber] = useState("");

  // Filter only available tables
  const availableTables = table.filter((t) => t.status.toLowerCase() === "available");

  // Handle table selection and update Redux
  const handleTableSelection = (e) => {
    const selectedTable = e.target.value;
    setTableNumber(selectedTable);
    dispatch(updateTableOrder({ tableNo: selectedTable }));
  };

  // Create Order Function
  const handleCreateOrder = () => {
    if (!tableNumber) {
      alert("Please select a table number!");
      return;
    }
    dispatch(setCustomerOrder({ customerName, customerAddress, customerContact, tableNo: tableNumber }));
    navigate("/tables");
  };

  return (
    <>
      {/* Bottom Navigation - Same Design, Responsive */}
      <div className="fixed bottom-1 left-1/2 transform -translate-x-1/2 mb-2 sm:mb-4 bg-gray-100/95 backdrop-blur-md shadow-lg rounded-[20px] p-2 sm:p-3 flex justify-around w-[95%] sm:w-[90%] max-w-[600px]">
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center px-3 sm:px-6 md:px-8 py-2 sm:py-2.5 rounded-full transition-all duration-300 shadow-md active:scale-95 ${
              location.pathname === item.path ? "bg-black text-white" : "bg-green-400"
            }`}
          >
            {item.icon}
          </button>
        ))}

        {/* Show Modal Button Only on /orders Page */}
        {location.pathname === "/orders" && (
          <button
            onClick={openModal}
            className="absolute -top-4 sm:-top-5 bg-black text-white rounded-full p-2.5 sm:p-3 shadow-md active:scale-95 transition-transform"
          >
            <FaConciergeBell size={28} className="sm:w-8 sm:h-8 md:w-10 md:h-10" />
          </button>
        )}
      </div>

      {/* Render Modal Only on /orders Page */}
      {location.pathname === "/orders" && isModalOpen && (
        <Modal openModal={isModalOpen} closeModal={closeModal} title="Place Your Order">
          <div className="max-h-[70vh] overflow-y-auto px-1">
            <div>
              <label className="block text-black mt-4 sm:mt-6 font-bold mb-2 text-sm">Main Customer Name</label>
              <div className="flex items-center rounded-lg p-2.5 sm:p-3 px-3 sm:px-4 bg-[#1f1f1f]">
                <input
                  type="text"
                  value={customerName}
                  placeholder="Enter Name....."
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="bg-transparent flex-1 text-white focus:outline-none text-sm sm:text-base"
                />
              </div>
            </div>

            <div>
              <label className="block text-black mt-4 sm:mt-6 font-bold mb-2 text-sm">Address</label>
              <div className="flex items-center rounded-lg p-2.5 sm:p-3 px-3 sm:px-4 bg-[#1f1f1f]">
                <input
                  type="text"
                  value={customerAddress}
                  placeholder="Enter Address....."
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  className="bg-transparent flex-1 text-white focus:outline-none text-sm sm:text-base"
                />
              </div>
            </div>

            <div>
              <label className="block text-black mt-4 sm:mt-6 font-bold mb-2 text-sm">Customer Contact</label>
              <div className="flex items-center rounded-lg p-2.5 sm:p-3 px-3 sm:px-4 bg-[#1f1f1f]">
                <input
                  type="number"
                  value={customerContact}
                  placeholder="Contact......"
                  onChange={(e) => setCustomerContact(e.target.value)}
                  className="bg-transparent flex-1 text-white focus:outline-none text-sm sm:text-base"
                />
              </div>
            </div>

            {/* Table Selection Dropdown */}
            <div>
              <label className="block text-black mt-4 sm:mt-6 font-bold mb-2 text-sm">Select Table</label>
              <div className="flex items-center rounded-lg p-2.5 sm:p-3 px-3 sm:px-4 bg-[#1f1f1f]">
                <select
                  value={tableNumber}
                  onChange={handleTableSelection}
                  className="bg-transparent flex-1 text-white focus:outline-none text-sm sm:text-base"
                >
                  <option value="">Select a Table</option>
                  {availableTables.map((t) => (
                    <option key={t.id} value={t.id} className="text-black">
                      {t.name} ({t.initial})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button 
              onClick={handleCreateOrder} 
              className="w-full bg-GreenText text-black font-bold text-xl sm:text-2xl rounded-lg py-2.5 sm:py-3 mt-6 sm:mt-8 hover:text-yellow-800 active:scale-[0.98] transition-transform"
            >
              Create Order
            </button>
          </div>
        </Modal>
      )}
    </>
  );
};

export default Navigation;