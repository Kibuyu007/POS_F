import { useState } from "react";
import SettingsList from "./SettingsList";
import UserManagement from "./UserSettings/UserManagement";
import ItemsCategories from "./Products/Categories/ItemsCategories";
import Items from "./Products/Items/Items";
import Manunuzi from "./Procurement/Manunuzi";
import Suppliers from "./Procurement/Suppliers";
import Madeni from "./Procurement/Madeni";
import PoGrn from "./GRN/PoGrn";
import NonPoGrn from "./GRN/NonPoGrn";

const Settings = () => {
  const [selectedSetting, setSelectedSetting] = useState(null);

  return (
    <section className="h-[90vh] flex flex-col md:flex-row gap-3 pt-24 px-4 overflow-hidden">
      {/* Left Section - User Setup */}
      <div className="w-1/4 bg-secondary rounded-xl p-6 shadow-md overflow-auto">
        <SettingsList
          title="Pre-Purchase"
          settings={[
            { group: "Orders", items: ["Purchase Order", "Purchasing Bills"] },
            { group: "Vendors", items: ["Suppliers"] },
          ]}
          selectedSetting={selectedSetting}
          handleSelect={setSelectedSetting}
        />

        <SettingsList
          title="GRN"
          settings={[
            { group: "PO GRN", items: ["Pending PO GRN", "Completed PO GRN"] },
            {
              group: "Non-PO GRN",
              items: ["Process Non-PO GRN", "Completed Non-PO GRN"],
            },
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
        ) : selectedSetting === "Purchasing Bills" ? (
          <Madeni />
        ) : selectedSetting === "Suppliers" ? (
          <Suppliers />
        ) : selectedSetting === "Pending PO GRN" ? (
          <PoGrn />
        ) : selectedSetting === "Process Non-PO GRN" ? (
          <NonPoGrn />
        ) : (
          <p className="text-lg">{selectedSetting || "No report selected"}</p>
        )}
      </div>
    </section>
  );
};

export default Settings;
