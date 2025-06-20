import axios from "axios";
import { useEffect, useState } from "react";

const Mauzo = () => {
  const [transactions, setTransactions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [totals, setTotals] = useState({ paid: 0, bill: 0 });

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const res = await axios.get("http://localhost:4004/api/transactions/all");
      if (res.data.success) {
        setTransactions(res.data.data);
        calculateTotals(res.data.data);
      }
    } catch (err) {
      console.error("Failed to load transactions:", err);
    }
  };

  const calculateTotals = (data) => {
    let paid = 0;
    let bill = 0;

    data.forEach((txn) => {
      if (txn.status === "Paid") {
        paid += txn.paidAmount || txn.totalAmount;
      } else if (txn.status === "Bill") {
        bill += txn.totalAmount;
        paid += txn.paidAmount || 0;
      }
    });

    setTotals({ paid, bill });
  };

  // Pagination
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentTransactions = transactions.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(transactions.length / itemsPerPage);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">All Transactions Report</h1>

      <div className="overflow-auto shadow-md rounded-lg">
        <table className="min-w-full text-sm text-left text-gray-700">
          <thead className="bg-gray-100 text-gray-800 font-bold text-xs uppercase tracking-wide">
            <tr>
              <th className="p-3">Date</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Phone</th>
              <th className="p-3">Status</th>
              <th className="p-3">Items</th>
              <th className="p-3">Total Amount</th>
            </tr>
          </thead>
          <tbody>
            {currentTransactions.map((txn) => (
              <tr key={txn._id} className="border-t hover:bg-gray-50">
                <td className="p-3">
                  {new Date(txn.createdAt).toLocaleString()}
                </td>
                <td className="p-3">{txn.customerDetails.name}</td>
                <td className="p-3">{txn.customerDetails.phone}</td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      txn.status === "Paid"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {txn.status}
                  </span>
                </td>
                <td className="p-3">
                  <ul className="list-disc ml-4">
                    {txn.items.map((i) => (
                      <li key={i.item._id}>
                        {i.item.name} × {i.quantity}
                      </li>
                    ))}
                  </ul>
                </td>
                <td className="p-3 font-bold">
                  <div>
                    {txn.status === "Bill" ? (
                      <>
                        <p className="text-yellow-600">
                          Bill: {txn.totalAmount.toLocaleString()} Tsh
                        </p>
                        <p className="text-green-600">
                          Paid: {txn.paidAmount?.toLocaleString() || 0} Tsh
                        </p>
                      </>
                    ) : (
                      <p className="text-green-600">
                        Paid:{" "}
                        {(txn.paidAmount || txn.totalAmount).toLocaleString()}{" "}
                        Tsh
                      </p>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gray-200 font-bold text-sm">
              <td colSpan="5" className="text-right p-3">
                Total Paid:
              </td>
              <td className="p-3 text-green-600">
                {totals.paid.toLocaleString()} Tsh
              </td>
            </tr>
            <tr className="bg-gray-200 font-bold text-sm">
              <td colSpan="5" className="text-right p-3">
                Total Billed:
              </td>
              <td className="p-3 text-yellow-600">
                {totals.bill.toLocaleString()} Tsh
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-center gap-2 mt-6">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            onClick={() => setCurrentPage(i + 1)}
            className={`px-3 py-1 rounded-md ${
              currentPage === i + 1
                ? "bg-green-500 text-white"
                : "bg-gray-200 text-gray-800"
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Mauzo;
