import { useState } from "react";
import { FaHome, FaConciergeBell } from "react-icons/fa";
import { TiShoppingCart } from "react-icons/ti";
import { IoSettings } from "react-icons/io5";
import { TbTableDashed, TbReportSearch } from "react-icons/tb";
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
  ]

  // Modal Details
  const [isModalOpen, setIsModalOpen] = useState(false);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  // Order Details
  const [customerName, setCustomerName] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerContact, setCustomerContact] = useState("");
  const [tableNumber, setTableNumber] = useState("");

  //Filter only available tables
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
      <div className="fixed bottom-1 left-1/2 transform mb-4 -translate-x-1/2 bg-gray-100 backdrop-blur-md shadow-lg rounded-[20px] p-3 flex justify-around w-[90%]">
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center  px-8 py-2 rounded-full transition-all duration-300 shadow-md ${
              location.pathname === item.path ? "bg-black text-white" : "bg-green-400 "
            }`}
          >
            {item.icon}
            {/* <span className="text-xs">{item.label}</span> */}
          </button>
        ))}

        {/* Show Modal Button Only on /orders Page */}
        {location.pathname === "/orders" && (
          <button
            onClick={openModal}
            className="absolute bottom-5 bg-black text-white rounded-full p-3 items-center shadow-md"
          >
            <FaConciergeBell size={40} />
          </button>
        )}
      </div>

      {/* Render Modal Only on /orders Page */}
      {location.pathname === "/orders" && isModalOpen && (
        <Modal openModal={isModalOpen} closeModal={closeModal} title="Place Your Order">
          <div>
            <label className="block text-black mt-6 font-bold mb-2 text-sm">Main Customer Name</label>
            <div className="flex items-center rounded-lg p-3 px-4 bg-[#1f1f1f]">
              <input
                type="text"
                value={customerName}
                placeholder="Enter Name....."
                onChange={(e) => setCustomerName(e.target.value)}
                className="bg-transparent flex-1 text-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-black mt-6 font-bold mb-2 text-sm">Address</label>
            <div className="flex items-center rounded-lg p-3 px-4 bg-[#1f1f1f]">
              <input
                type="text"
                value={customerAddress}
                placeholder="Enter Address....."
                onChange={(e) => setCustomerAddress(e.target.value)}
                className="bg-transparent flex-1 text-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-black mt-6 font-bold mb-2 text-sm">Customer Contact</label>
            <div className="flex items-center rounded-lg p-3 px-4 bg-[#1f1f1f]">
              <input
                type="number"
                value={customerContact}
                placeholder="Contact......"
                onChange={(e) => setCustomerContact(e.target.value)}
                className="bg-transparent flex-1 text-white focus:outline-none"
              />
            </div>
          </div>

          {/* Table Selection Dropdown */}
          <div>
            <label className="block text-black mt-6 font-bold mb-2 text-sm">Select Table</label>
            <div className="flex items-center rounded-lg p-3 px-4 bg-[#1f1f1f]">
              <select
                value={tableNumber}
                onChange={handleTableSelection}
                className="bg-transparent flex-1 text-white focus:outline-none"
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

          <button onClick={handleCreateOrder} className="w-full bg-GreenText text-black font-bold text-2xl rounded-lg py-3 mt-8 hover:text-yellow-800">
            Create Order
          </button>
        </Modal>
      )}
    </>
  );
};

export default Navigation;
