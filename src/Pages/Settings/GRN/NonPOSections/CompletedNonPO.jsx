import axios from "axios";
import { useState } from "react";
import { useEffect } from "react";

const CompletedNonPO = () => {
  const [grns, setGrns] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:4004/api/manunuzi/nonPo")
      .then((res) => {
        if (res.data.success) {
          setGrns(res.data.data);
        }
      })
      .catch((err) => {
        console.error("Error fetching all new GRNs:", err);
      });
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">All New GRNs</h2>
      {grns.length === 0 ? (
        <p>No GRNs found.</p>
      ) : (
        grns.map((grn) => (
          <div
            key={grn._id}
            className="mb-6 border rounded-md p-4 shadow-sm bg-white"
          >
            <h3 className="font-semibold mb-2">
              Supplier: {grn.supplierName?.supplierName || "Unknown"}
            </h3>
            <p>Invoice Number: {grn.invoiceNumber}</p>
            <p>LPO Number: {grn.lpoNumber}</p>
            <p>Delivery Person: {grn.deliveryPerson}</p>
            <p>Delivery Number: {grn.deliveryNumber}</p>
            <p>Description: {grn.description}</p>
            <p>
              Receiving Date:{" "}
              {new Date(grn.receivingDate).toLocaleDateString() || "N/A"}
            </p>
            <div className="mt-3">
              <h4 className="font-semibold">Items:</h4>
              <table className="min-w-full border border-gray-300">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border px-2 py-1">Name</th>
                    <th className="border px-2 py-1">Quantity</th>
                    <th className="border px-2 py-1">Buying Price</th>
                    <th className="border px-2 py-1">Selling Price</th>
                    <th className="border px-2 py-1">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {grn.items.map((item) => (
                    <tr key={item._id}>
                      <td className="border px-2 py-1">
                        {item.name?.name || "Unknown"}
                      </td>
                      <td className="border px-2 py-1">{item.quantity}</td>
                      <td className="border px-2 py-1">{item.buyingPrice}</td>
                      <td className="border px-2 py-1">{item.sellingPrice}</td>
                      <td className="border px-2 py-1">{item.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default CompletedNonPO;
