import { useState } from "react";
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

const Settings = () => {
  const [selectedSetting, setSelectedSetting] = useState(null);
  const user = useSelector((state) => state.user.user);

  return (
    <section className="h-[90vh] flex flex-col md:flex-row gap-3 pt-24 px-4 overflow-hidden">
      {/* Left Section - User Setup */}
      <div className="w-full md:w-1/5 bg-secondary rounded-xl p-6 shadow-md overflow-auto">
        <SettingsList
          title="Pre-Purchase"
          settings={[
            // { group: "Orders", items: ["Purchase Order", "Completed PO"] },
            {
              group: "Vendors",
              items: [
                user?.role?.canAccessSupplierManagement ? "Suppliers" : null,
                "Madeni Binafsi",
              ].filter(Boolean), // This removes null/empty values
            },
          ]}
          selectedSetting={selectedSetting}
          handleSelect={setSelectedSetting}
        />

        {user?.roles?.canApproveNewGrn && (
          <SettingsList
            title="GRN"
            settings={[
              // {
              //   group: "PO GRN",
              //   items: ["Process PO GRN", "Icomplete PO GRN", "Unpaid PO"],
              // },
              {
                // group: "Non-PO GRN",
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
            handleSelect={setSelectedSetting}
          />
        )}

        <SettingsList
          title="Products Management"
          settings={["Items", "Items Categories"]}
          selectedSetting={selectedSetting}
          handleSelect={setSelectedSetting}
        />

        {user?.roles?.canAccessCustomerManagement && (
          <SettingsList
            title="Customer Management"
            settings={["All Customers"]}
            selectedSetting={selectedSetting}
            handleSelect={setSelectedSetting}
          />
        )}

        {user?.roles?.canAccessUserManagement && (
          <SettingsList
            title="User Management"
            settings={["All Users", "User Logs"]}
            selectedSetting={selectedSetting}
            handleSelect={setSelectedSetting}
          />
        )}
      </div>

      {/* Right Section - Display Content */}
      <div className="w-full md:w-4/5 bg-secondary rounded-xl p-6 shadow-md text-white overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">Selected Report:</h2>
        {selectedSetting === "All Users" ? (
          <UserManagement />
        ) : selectedSetting === "Items" ? (
          <Items />
        ) : selectedSetting === "Items Categories" ? (
          <ItemsCategories />
        ) : selectedSetting === "Purchase Order" ? (
          <Manunuzi />
        ) : selectedSetting === "Completed PO" ? (
          <CompletedPo />
        ) : selectedSetting === "Suppliers" ? (
          <Suppliers />
        ) : selectedSetting === "Process PO GRN" ? (
          <PoGrn />
        ) : selectedSetting === "Icomplete PO GRN" ? (
          <CompletedPoGrn />
        ) : selectedSetting === "Process Non-PO GRN" ? (
          <NonPoGrn />
        ) : selectedSetting === "Incomplete Non-PO GRN" ? (
          <IncompleteNonPo />
        ) : selectedSetting === "Completed Non-PO GRN" ? (
          <CompletedNonPO />
        ) : selectedSetting === "Unpaid PO" ? (
          <MadeniPo />
        ) : selectedSetting === "Unpaid Non-PO" ? (
          <MadeniNonPo />
        ) : selectedSetting === "Expenses" ? (
          <Expenses />
        ) : selectedSetting === "All Customers" ? (
          <CustomerManagement />
        ) : selectedSetting === "Wallet Transactions" ? (
          <WalletList />
        ) : selectedSetting === "Madeni Binafsi" ? (
          <Debts />
        ) : selectedSetting === "Report" ? (
          <WalletReport />
        ) : selectedSetting ? (
          <p className="text-lg">{selectedSetting}</p>
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            <img
              src={cover}
              alt="No report selected"
              className="object-contain opacity-20"
            />
            <p className="text-lg text-gray-300">No report selected</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default Settings;
