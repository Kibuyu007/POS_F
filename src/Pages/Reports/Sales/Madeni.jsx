import axios from "axios";
import { useEffect, useState } from "react";

const Madeni = () => {

       const [billedData, setBilledData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deductions, setDeductions] = useState({});

  const fetchBilledTransactions = async () => {
    try {
      const res = await axios.get("http://localhost:4004/api/transactions/bill");
      if (res.data.success) {
        setBilledData(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching billed transactions:", error);
      alert("Failed to load billed transactions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBilledTransactions();
  }, []);


    const handleDeduct = async (id) => {
    const amount = parseFloat(deductions[id] || 0);

    if (!amount || amount <= 0) {
      alert("Enter valid amount");
      return;
    }

    try {
      const res = await axios.patch(`http://localhost:4004/api/transactions/payBill/${id}`, {
        paymentAmount: amount,
      });

      if (res.data.success) {
        alert("Payment updated!");
        setDeductions((prev) => ({ ...prev, [id]: "" }));
        fetchBilledTransactions(); // Refresh list
      }
    } catch (err) {
      console.error("Error deducting amount:", err);
      alert("Failed to update payment.");
    }
  };



  return (
      <div className="p-6 bg-white rounded-md shadow-md text-black">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Billed Transactions</h2>

      {loading ? (
        <p>Loading...</p>
      ) : billedData.length === 0 ? (
        <p className="text-gray-500">No billed transactions found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300 text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 border">Date</th>
                <th className="p-2 border">Customer</th>
                <th className="p-2 border">Phone</th>
                <th className="p-2 border">Total</th>
                <th className="p-2 border">Items</th>
              </tr>
            </thead>
            <tbody>
              {billedData.map((sale, idx) => (
                <tr key={idx} className="text-center text-gray-800">
                  <td className="border px-2 py-1">{new Date(sale.createdAt).toLocaleString()}</td>
                  <td className="border px-2 py-1">{sale.customerDetails?.name || "-"}</td>
                  <td className="border px-2 py-1">{sale.customerDetails?.phone || "-"}</td>
                  <td className="border px-2 py-1">Tsh {sale.totalAmount.toLocaleString()}</td>
                  <td className="border px-2 py-1">
                    {sale.items.map((i, iIdx) => (
                      <div key={iIdx}>
                        {i.item?.name} x {i.quantity}
                      </div>
                    ))}
                  </td>
                   <td className="border p-2">
                    <input
                      type="number"
                      value={deductions[sale._id] || ""}
                      onChange={(e) =>
                        setDeductions({ ...deductions, [sale._id]: e.target.value })
                      }
                      className="w-24 border rounded px-2 py-1 mb-2"
                      placeholder="Tsh"
                    />
                    <button
                      onClick={() => handleDeduct(sale._id)}
                      className="bg-green-500 text-white px-3 py-1 rounded"
                    >
                      Pay
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default Madeni