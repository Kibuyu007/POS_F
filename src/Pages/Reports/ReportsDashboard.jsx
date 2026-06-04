import { useState, useEffect } from "react";
import ReportList from "./ReportList";
import cover from "../../assets/cover1.jpg";
import Madeni from "./Sales/Madeni";
import Mauzo from "./Sales/Mauzo";
import BillNonPo from "./Procurement/BillNonPo";
import BillPo from "./Procurement/BillPo";
import Profit from "./Sales/Profit";

const ReportsDashboard = () => {
  const [selectedReport, setSelectedReport] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") setSidebarOpen(false);
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  const handleSelect = (report) => {
    setSelectedReport(report);
    setSidebarOpen(false);
  };

  const renderContent = () => {
    switch (selectedReport) {
      case "Mauzo":
        return <Mauzo />;
      case "Madeni":
        return <Madeni />;
      case "Faida ya Bidhaa":
        return <Profit />;
      case "Report ya Madeni PO":
        return <BillPo />;
      case "Report ya Madeni Non PO":
        return <BillNonPo />;
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
        return <p className="text-base sm:text-lg">{selectedReport}</p>;
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
            {selectedReport || "Reports"}
          </h2>
        </div>
        {selectedReport && (
          <button
            onClick={() => setSelectedReport(null)}
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

        <ReportList
          title="Sales Reports"
          reports={["Mauzo", "Madeni", "Faida ya Bidhaa"]}
          selectedReport={selectedReport}
          handleSelect={handleSelect}
        />

        <ReportList
          title="Manunuzi"
          reports={["Report ya Madeni Non PO"]}
          selectedReport={selectedReport}
          handleSelect={handleSelect}
        />

        <ReportList
          title="User Management Reports"
          reports={[
            "Changes Reports",
            "Permissions Reports",
            "Activities Reports",
          ]}
          selectedReport={selectedReport}
          handleSelect={handleSelect}
        />
      </div>

      {/* ==================== RIGHT CONTENT AREA ==================== */}
      <div className="flex-1 bg-secondary rounded-xl p-3 sm:p-4 lg:p-6 shadow-md text-white overflow-y-auto min-h-0">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h2 className="text-base sm:text-lg lg:text-xl font-semibold">
            {selectedReport ? selectedReport : "Select a Report"}
          </h2>
          {selectedReport && (
            <button
              onClick={() => setSelectedReport(null)}
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

export default ReportsDashboard;
