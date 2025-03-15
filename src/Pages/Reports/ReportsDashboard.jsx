import { useState } from "react";
import ReportList from "./ReportList";

const ReportsDashboard = () => {
  const [selectedReport, setSelectedReport] = useState(null);

  return (
    <section className="h-[90vh] flex flex-col md:flex-row gap-3 pt-24 px-4 overflow-hidden">
      {/* Left Section - Sidebar */}
        <div className="w-1/4 bg-secondary rounded-xl p-6 shadow-md overflow-auto">
          <ReportList
            title="User Management Reports"
            reports={["Changes Reports", "Permissions Reports", "Activities Reports"]}
            selectedReport={selectedReport}
            handleSelect={setSelectedReport}
          />
          <ReportList
            title="Sales Reports"
            reports={["Sales Summary", "Revenue Reports", "Discount Reports"]}
            selectedReport={selectedReport}
            handleSelect={setSelectedReport}
          />
          <ReportList
            title="Procurement Reports"
            reports={["Purchase Orders", "Supplier Reports", "Inventory Reports"]}
            selectedReport={selectedReport}
            handleSelect={setSelectedReport}
          />
        </div>

      {/* Right Section - Display Selected Report */}
      <div className="w-3/4 bg-secondary rounded-xl p-6 shadow-md text-white overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">Report</h2>
      </div>
    </section>
  );
};

export default ReportsDashboard;
