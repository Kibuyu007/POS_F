import axios from "axios";
import { useState } from "react";
import { useEffect } from "react";

const MadeniNonPo = () => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const fetchUnpaidNonPo = async () => {
      try {
        const res = await axios.get(
          "http://localhost:4004/api/grn/unpaidNonPo"
        );
        if (res.data.success) {
          setItems(res.data.data);
        }
      } catch (err) {
        console.error("Error fetching billed items:", err);
      }
    };

    fetchUnpaidNonPo();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Billed Items</h2>
      <table className="min-w-full border border-gray-300">
        <thead className="bg-gray-100">
          <tr className="text-center text-black">
            <th className="border px-4 py-2">Item Name</th>
            <th className="border px-4 py-2">Buying Price</th>
            <th className="border px-4 py-2">Selling Price</th>
            <th className="border px-4 py-2">Quantity</th>
            <th className="border px-4 py-2">Supplier</th>
            <th className="border px-4 py-2">Invoice #</th>
            <th className="border px-4 py-2">Received Date</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td colSpan="7" className="text-center p-4">
                No billed items found.
              </td>
            </tr>
          ) : (
            items.map((item) => (
              <tr key={item.id} className="text-center text-black">
                <td className="border px-4 py-2">{item.itemName}</td>
                <td className="border px-4 py-2">Tsh {item.buyingPrice}</td>
                <td className="border px-4 py-2">Tsh {item.sellingPrice}</td>
                <td className="border px-4 py-2">{item.quantity}</td>
                <td className="border px-4 py-2">{item.supplier}</td>
                <td className="border px-4 py-2">{item.invoiceNumber}</td>
                <td className="border px-4 py-2">
                  {new Date(item.receivingDate).toLocaleDateString()}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default MadeniNonPo;
