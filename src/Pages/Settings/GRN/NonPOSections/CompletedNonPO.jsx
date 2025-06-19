import axios from "axios";
import { useState } from "react";
import { useEffect } from "react";

const CompletedNonPO = () => {
  const [grns, setGrns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch all GRNs
  const fetchCompletedNonPoGrns = async () => {
    try {
      const res = await axios.get("http://localhost:4004/api/grn/nonPo");
      if (res.data.success) {
        setGrns(res.data.data);
      } else {
        setError(res.data.message || "Unknown error");
      }
    } catch (err) {
      console.error("Error fetching completed GRNs:", err);
      setError("Failed to fetch completed GRNs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompletedNonPoGrns();
  }, []);

  return (
       <div className="p-4">
      <h2 className="text-xl font-bold mb-4">All Completed Non-PO GRNs</h2>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && (
        <div className="space-y-6 text-black">
          {grns.map((grn) => (
            <div key={grn._id} className="border p-4 rounded shadow">
              <p><strong>Supplier:</strong> {grn.supplierName?.supplierName}</p>
              <p><strong>Invoice #:</strong> {grn.invoiceNumber}</p>
              <p><strong>LPO #:</strong> {grn.lpoNumber}</p>
              <p><strong>Delivery Person:</strong> {grn.deliveryPerson}</p>
              <p><strong>Delivery Number:</strong> {grn.deliveryNumber}</p>
              <p><strong>Receiving Date:</strong> {new Date(grn.receivingDate).toLocaleDateString()}</p>
              <p><strong>Description:</strong> {grn.description}</p>

              <h4 className="mt-3 font-semibold">Items:</h4>
              <table className="w-full border mt-2 text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border p-1">Item</th>
                    <th className="border p-1">Qty</th>
                    <th className="border p-1">Buy Price</th>
                    <th className="border p-1">Sell Price</th>
                    <th className="border p-1">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {grn.items.map((item) => (
                    <tr key={item._id}>
                      <td className="border p-1">{item.name?.name}</td>
                      <td className="border p-1">{item.quantity}</td>
                      <td className="border p-1">Tsh {item.buyingPrice}</td>
                      <td className="border p-1">Tsh {item.sellingPrice}</td>
                      <td className="border p-1">{item.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CompletedNonPO;
