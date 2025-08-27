import { useEffect, useState } from "react";
import axios from "axios";
import BASE_URL from "../../../Utils/config";

const formatTZS = (n = 0) => `${Number(n || 0).toLocaleString()} TSh`;
const formatDateTime = (d) =>
  d ? new Date(d).toLocaleString() : "—";

const WalletReport = ({ customerId }) => {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);

  const fetchReport = async () => {
    if (!customerId) return;
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/api/deposits/report/${customerId}`);
      setReport(res.data);
    } catch (err) {
      console.error("Failed to fetch report:", err);
      setReport(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [customerId]);

  if (!customerId) return <p className="text-gray-500">No customer selected</p>;

  if (loading)
    return <p className="text-gray-500">Loading report...</p>;

  if (!report) return <p className="text-gray-500">No transactions found</p>;

  return (
    <div className="font-sans text-gray-800">
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-5 shadow-sm text-center border border-dashed border-gray-400 rounded-lg">
          <p className="text-gray-500 text-sm uppercase tracking-wide">Total Deposits</p>
          <p className="text-2xl font-bold mt-2 text-green-600">
            {formatTZS(report.totalDeposits)}
          </p>
        </div>
        <div className="bg-white p-5 shadow-sm text-center border border-dashed border-gray-400 rounded-lg">
          <p className="text-gray-500 text-sm uppercase tracking-wide">Total Withdrawals</p>
          <p className="text-2xl font-bold mt-2 text-red-500">
            {formatTZS(report.totalWithdrawals)}
          </p>
        </div>
        <div className="bg-white p-5 shadow-sm text-center border border-dashed border-gray-400 rounded-lg">
          <p className="text-gray-500 text-sm uppercase tracking-wide">Current Balance</p>
          <p className="text-2xl font-bold mt-2 text-gray-900">
            {formatTZS(report.balance)}
          </p>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white shadow-sm p-5 rounded-lg border border-dashed border-gray-400">
        <h2 className="text-lg font-semibold mb-4">Transactions</h2>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-100 text-gray-600 uppercase text-left">
              <th className="py-2 px-3">Date</th>
              <th className="py-2 px-3">Type</th>
              <th className="py-2 px-3">Amount</th>
              <th className="py-2 px-3">Performed By</th>
            </tr>
          </thead>
          <tbody>
            {report.transactions.map((tx) => (
              <tr key={tx._id} className="border-b last:border-0">
                <td className="py-2 px-3">{formatDateTime(tx.createdAt)}</td>
                <td className="py-2 px-3">
                  {tx.depositAmount > 0 ? "Deposit" : "Withdraw"}
                </td>
                <td className="py-2 px-3 text-right">
                  {formatTZS(tx.depositAmount || tx.withdrawAmount)}
                </td>
                <td className="py-2 px-3">{tx.createdBy?.name || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WalletReport;
