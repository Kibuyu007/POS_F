import { useState, useEffect } from "react";
import SettingsList from "./SettingsList";
import UserManagement from "./UserSettings/UserManagement";
import ItemsCategories from "./Products/Categories/ItemsCategories";
import Items from "./Products/Items/Items";
import Manunuzi from "./Procurement/Manunuzi";
import Suppliers from "./Procurement/Suppliers";
import PoGrn from "./GRN/PO GRN/PoGrn";
import NonPoGrn from "./GRN/NonPOSections/NonPoGrn";
import CompletedPo from "./Procurement/CompletedPo";
import CompletedPoGrn from "./GRN/PO GRN/IncompletePoGrn";
import CompletedNonPO from "./GRN/NonPOSections/CompletedNonPO";
import cover from "../../assets/cover1.jpg";
import IncompleteNonPo from "./GRN/Madeni/MadeniNonPo";
import MadeniPo from "./GRN/Madeni/MadeniPo";
import MadeniNonPo from "./GRN/Madeni/MadeniNonPo";
import { useSelector } from "react-redux";
import CustomerManagement from "./Customers/CustomerManagement";
import WalletList from "./Customers/WalletList";
import WalletReport from "./Customers/WalletReport";
import Expenses from "./Procurement/Expenses";
import Debts from "./Debts/Debts";
import Orders from "./../Orders/Orders";

const Settings = () => {
  const [selectedSetting, setSelectedSetting] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const user = useSelector((state) => state.user.user);

  // Close sidebar when pressing Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") setSidebarOpen(false);
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  const handleSelect = (setting) => {
    setSelectedSetting(setting);
    setSidebarOpen(false);
  };

  const renderContent = () => {
    switch (selectedSetting) {
      case "All Users":
        return <UserManagement />;
      case "Items":
        return <Items />;
      case "Items Categories":
        return <ItemsCategories />;
      case "Purchase Order":
        return <Manunuzi />;
      case "Completed PO":
        return <CompletedPo />;
      case "Suppliers":
        return <Suppliers />;
      case "Process PO GRN":
        return <PoGrn />;
      case "Icomplete PO GRN":
        return <CompletedPoGrn />;
      case "Process Non-PO GRN":
        return <NonPoGrn />;
      case "Incomplete Non-PO GRN":
        return <IncompleteNonPo />;
      case "Completed Non-PO GRN":
        return <CompletedNonPO />;
      case "Unpaid PO":
        return <MadeniPo />;
      case "Unpaid Non-PO":
        return <MadeniNonPo />;
      case "Expenses":
        return <Expenses />;
      case "All Customers":
        return <CustomerManagement />;
      case "Wallet Transactions":
        return <WalletList />;
      case "Madeni Binafsi":
        return <Debts />;
      case "Orders":
        return <Orders />;
      case "Report":
        return <WalletReport />;
      case null:
        return (
          <div className="flex flex-col items-center justify-center h-full min-h-[50vh]">
            <img
              src={cover}
              alt="No report selected"
              className="object-contain opacity-20 max-w-[200px] sm:max-w-[300px]"
            />
            <p className="text-base sm:text-lg text-gray-300 mt-4">
              No report selected
            </p>
          </div>
        );
      default:
        return <p className="text-base sm:text-lg">{selectedSetting}</p>;
    }
  };

  return (
    <section className="h-[90vh] flex flex-col lg:flex-row gap-3 pt-20 sm:pt-24 px-3 sm:px-4 lg:px-6 overflow-hidden relative">
      {/* ==================== MOBILE: TOP BAR WITH TOGGLE ==================== */}
      <div className="lg:hidden flex items-center justify-between bg-secondary rounded-xl p-3 sm:p-4 shadow-md shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-black transition-colors"
            aria-label="Open menu"
          >
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <h2 className="text-white font-semibold text-sm sm:text-base">
            {selectedSetting || "Settings"}
          </h2>
        </div>
        {selectedSetting && (
          <button
            onClick={() => setSelectedSetting(null)}
            className="text-xs sm:text-sm text-gray-700 hover:text-white transition-colors px-2 py-1"
          >
            Clear
          </button>
        )}
      </div>

      {/* ==================== MOBILE: OVERLAY BACKDROP ==================== */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ==================== SIDEBAR ==================== */}
      <div
        className={`
        bg-secondary rounded-xl shadow-md overflow-y-auto
        lg:w-1/4 xl:w-1/5 lg:min-w-[240px] lg:max-w-[300px]
        lg:static lg:block lg:p-4 xl:p-6
        transition-transform duration-300 ease-in-out z-50
        ${
          sidebarOpen
            ? "fixed inset-y-0 left-0 w-[280px] sm:w-[320px] p-4 translate-x-0"
            : "fixed inset-y-0 left-0 w-[280px] sm:w-[320px] p-4 -translate-x-full lg:translate-x-0 lg:w-auto lg:p-4 xl:p-6"
        }
      `}
      >
        {/* Mobile: Close button inside sidebar */}
        <div className="lg:hidden flex items-center justify-between mb-4 pb-4 border-b border-white/10">
          <h2 className="text-white font-bold text-lg">Menu</h2>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-black transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <SettingsList
          title="Pre-Purchase"
          settings={[
            {
              group: "Vendors",
              items: ["Suppliers", "Madeni Binafsi", "Orders"],
            },
          ]}
          selectedSetting={selectedSetting}
          handleSelect={handleSelect}
        />

        {user?.roles?.canApproveNewGrn && (
          <SettingsList
            title="GRN"
            settings={[
              {
                group: "GRNS & Expenses",
                items: [
                  "Process Non-PO GRN",
                  "Unpaid Non-PO",
                  "Completed Non-PO GRN",
                  "Expenses",
                ],
              },
            ]}
            selectedSetting={selectedSetting}
            handleSelect={handleSelect}
          />
        )}

        <SettingsList
          title="Products Management"
          settings={["Items", "Items Categories"]}
          selectedSetting={selectedSetting}
          handleSelect={handleSelect}
        />

        {user?.roles?.canAccessCustomerManagement && (
          <SettingsList
            title="Customer Management"
            settings={["All Customers"]}
            selectedSetting={selectedSetting}
            handleSelect={handleSelect}
          />
        )}

        {user?.roles?.canAccessUserManagement && (
          <SettingsList
            title="User Management"
            settings={["All Users", "User Logs"]}
            selectedSetting={selectedSetting}
            handleSelect={handleSelect}
          />
        )}
      </div>

      {/* ==================== RIGHT CONTENT AREA ==================== */}
      <div className="flex-1 bg-secondary rounded-xl p-3 sm:p-4 lg:p-6 shadow-md text-white overflow-y-auto min-h-0">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h2 className="text-base sm:text-lg lg:text-xl font-semibold">
            {selectedSetting ? selectedSetting : "Select a Report"}
          </h2>
          {selectedSetting && (
            <button
              onClick={() => setSelectedSetting(null)}
              className="text-xs sm:text-sm text-gray-300 hover:text-white transition-colors px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg"
            >
              ← Back to Menu
            </button>
          )}
        </div>
        {renderContent()}
      </div>
    </section>
  );
};

export default Settings;
