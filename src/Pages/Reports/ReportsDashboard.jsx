import { useState } from "react";
import ReportList from "./ReportList";
import cover from "../../assets/cover1.jpg";
import Madeni from "./Sales/Madeni";
import Mauzo from "./Sales/Mauzo";
import BillNonPo from "./Procurement/BillNonPo";
import BillPo from "./Procurement/BillPo";

const ReportsDashboard = () => {
  const [selectedReport, setSelectedReport] = useState(null);

  return (
    <section className="h-[90vh] flex flex-col md:flex-row gap-3 pt-24 px-4 overflow-hidden">
      {/* Left Section - Sidebar */}
      <div className="w-1/5 bg-secondary rounded-xl p-6 shadow-md overflow-auto">
        <ReportList
          title="Sales Reports"
          reports={["Sales", "Madeni"]}
          selectedReport={selectedReport}
          handleSelect={setSelectedReport}
        />
        <ReportList
          title="Manunuzi"
          reports={["Report ya Madeni PO", "Report ya Madeni Non PO"]}
          selectedReport={selectedReport}
          handleSelect={setSelectedReport}
        />

        <ReportList
          title="User Management Reports"
          reports={[
            "Changes Reports",
            "Permissions Reports",
            "Activities Reports",
          ]}
          selectedReport={selectedReport}
          handleSelect={setSelectedReport}
        />
      </div>

      {/* Right Section - Display Selected Report */}
      <div className="w-4/5 bg-secondary rounded-xl p-6 shadow-md text-white overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">Selected Report:</h2>
        {selectedReport === "Sales" ? (
          <Mauzo />
        ) : selectedReport === "Madeni" ? (
          <Madeni />
        ) : selectedReport === "Report ya Madeni PO" ? (
          <BillPo />
        ) : selectedReport === "Report ya Madeni Non PO" ? (
          <BillNonPo />
        ) : selectedReport ? (
          <p className="text-lg">{selectedReport}</p>
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

export default ReportsDashboard;
