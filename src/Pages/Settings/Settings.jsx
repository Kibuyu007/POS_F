import { useState } from "react";
import SettingsList from "./SettingsList";
import UserManagement from "./UserSettings/UserManagement";

const Settings = () => {
  const [selectedSetting, setSelectedSetting] = useState(null);

  return (
    <section className="h-[90vh] flex flex-col md:flex-row gap-3 pt-24 px-4 overflow-hidden">
      {/* Left Section - User Setup */}
      <div className="w-1/4 bg-secondary rounded-xl p-6 shadow-md overflow-auto">
        <SettingsList
          title="Procurement"
          settings={["Purchasing", "Purchasing Bills", "Suppliers"]}
          selectedSetting={selectedSetting}
          handleSelect={setSelectedSetting}
        />

        <SettingsList
          title="Products Management"
          settings={["Changes Reports", "Permissions Reports", "Activities Reports"]}
          selectedSetting={selectedSetting}
          handleSelect={setSelectedSetting}
        />

        <SettingsList
          title="Tables Management"
          settings={["Changes Reports", "Permissions Reports", "Activities Reports"]}
          selectedSetting={selectedSetting}
          handleSelect={setSelectedSetting}
        />

        <SettingsList
          title="User Management"
          settings={["All Users", "Manage User"]}
          selectedSetting={selectedSetting}
          handleSelect={setSelectedSetting}
        />
      </div>

      {/* Right Section - Display Content */}
      <div className="w-3/4 bg-secondary rounded-xl p-6 shadow-md text-white overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">Selected Report:</h2>
        {selectedSetting === "All Users" ? (
          <UserManagement />
        ) : (
          <p className="text-lg">{selectedSetting || "No report selected"}</p>
        )}
      </div>
    </section>
  );
};

export default Settings;
