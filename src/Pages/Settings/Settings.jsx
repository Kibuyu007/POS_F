import { useState } from "react";
import SettingsList from "./SettingsList";
import UserManagement from "./UserSettings/UserManagement";
import ItemsCategories from "./Products/Categories/ItemsCategories";
import Items from "./Products/Items/Items";
import Manunuzi from "./Procurement/Manunuzi";
import Suppliers from "./Procurement/Suppliers";
import Madeni from "./GRN/Madeni/Madeni";
import PoGrn from "./GRN/PO GRN/PoGrn";
import NonPoGrn from "./GRN/NonPOSections/NonPoGrn";
import CompletedPo from "./Procurement/CompletedPo";
import CompletedPoGrn from "./GRN/PO GRN/CompletedPoGrn";
import CompletedNonPO from "./GRN/NonPOSections/CompletedNonPO";

const Settings = () => {
  const [selectedSetting, setSelectedSetting] = useState(null);

  return (
    <section className="h-[90vh] flex flex-col md:flex-row gap-3 pt-24 px-4 overflow-hidden">
      {/* Left Section - User Setup */}
      <div className="w-1/4 bg-secondary rounded-xl p-6 shadow-md overflow-auto">
        <SettingsList
          title="Pre-Purchase"
          settings={[
            { group: "Orders", items: ["Purchase Order", "Completed PO"] },
            { group: "Vendors", items: ["Suppliers"] },
          ]}
          selectedSetting={selectedSetting}
          handleSelect={setSelectedSetting}
        />

        <SettingsList
          title="GRN"
          settings={[
            { group: "PO GRN", items: ["Process PO GRN", "Completed PO GRN"] },
            {
              group: "Non-PO GRN",
              items: ["Process Non-PO GRN", "Completed Non-PO GRN"],
            },
            { group: "Credit GRN", items: ["Unpaid GRN"] },
          ]}
          selectedSetting={selectedSetting}
          handleSelect={setSelectedSetting}
        />

        <SettingsList
          title="Products Management"
          settings={["Items", "Items Categories"]}
          selectedSetting={selectedSetting}
          handleSelect={setSelectedSetting}
        />

        <SettingsList
          title="User Management"
          settings={["All Users", "User Logs"]}
          selectedSetting={selectedSetting}
          handleSelect={setSelectedSetting}
        />
      </div>

      {/* Right Section - Display Content */}
      <div className="w-3/4 bg-secondary rounded-xl p-6 shadow-md text-white overflow-y-auto">
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
        ) : selectedSetting === "Completed PO GRN" ? (
          <CompletedPoGrn />
        ) : selectedSetting === "Process Non-PO GRN" ? (
          <NonPoGrn />
        ) : selectedSetting === "Completed Non-PO GRN" ? (
          <CompletedNonPO />
        ) : selectedSetting === "Unpaid GRN" ? (
          <Madeni />
        ) : selectedSetting ? (
          <p className="text-lg">{selectedSetting}</p>
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            <img
              src="/Setting.png"
              alt="No report selected"
              className="w-48 h-48 object-contain mb-4"
            />
            <p className="text-lg text-gray-300">No report selected</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default Settings;
