
import axios from "axios";
import { useState, useEffect } from "react";


const BillNonPo = () => {

      const [reports, setReports] = useState([]);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await axios.get("http://localhost:4004/api/reports/status-changes");
        if (res.data.success) {
          setReports(res.data.data);
        }
      } catch (err) {
        console.error("Error fetching reports:", err);
      }
    };
    fetchReports();
  }, []);

  return (
        <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Status Change Reports</h2>
      <table className="w-full border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 border">Item Name</th>
            <th className="p-2 border">Old Status</th>
            <th className="p-2 border">New Status</th>
            <th className="p-2 border">Changed At</th>
            <th className="p-2 border">GRN Invoice</th>
            <th className="p-2 border">Changed By</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((report) => (
            <tr key={report._id} className="text-center">
              <td className="p-2 border">{report.itemName}</td>
              <td className="p-2 border">{report.oldStatus}</td>
              <td className="p-2 border">{report.newStatus}</td>
              <td className="p-2 border">
                {new Date(report.changedAt).toLocaleString()}
              </td>
              <td className="p-2 border">{report.grnId?.invoiceNumber || "N/A"}</td>
              <td className="p-2 border">{report.changedBy?.username || "System"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default BillNonPo





