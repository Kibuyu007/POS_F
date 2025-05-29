import { useState } from "react";
import React from "react";

const mockItems = [
    { _id: "1", name: "Sugar", currentPrice: 10, currentBalance: 50 },
    { _id: "2", name: "Flour", currentPrice: 8, currentBalance: 30 },
  ];


const Madeni = () => {

    const [expandedRow, setExpandedRow] = useState(null);
    const [stockUpdates, setStockUpdates] = useState({});
  
    const handleToggleRow = (id) => {
      setExpandedRow((prev) => (prev === id ? null : id));
    };
  
    const handleChange = (id, field, value) => {
      setStockUpdates((prev) => ({
        ...prev,
        [id]: {
          ...prev[id],
          [field]: value,
        },
      }));
    };
  
    const handleSave = (id) => {
      const update = stockUpdates[id];
      if (!update?.newBalance || !update?.buyingPrice || !update?.newSellingPrice) {
        alert("Fill all fields.");
        return;
      }
  
      console.log("Submit new stock:", { itemId: id, ...update });
  
      // Call backend API here...
  
      // Reset form
      setExpandedRow(null);
      setStockUpdates((prev) => ({ ...prev, [id]: {} }));
    };

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Add New Stock</h2>

      <table className="w-full table-auto border border-gray-300">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-2 border">Item Name</th>
            <th className="p-2 border">Current Price</th>
            <th className="p-2 border">Balance</th>
            <th className="p-2 border">Action</th>
          </tr>
        </thead>
        <tbody>
          {mockItems.map((item) => (
            <React.Fragment key={item._id}>
              <tr className="border-t">
                <td className="p-2 border">{item.name}</td>
                <td className="p-2 border">${item.currentPrice.toFixed(2)}</td>
                <td className="p-2 border">{item.currentBalance}</td>
                <td className="p-2 border">
                  <button
                    className="text-blue-600 font-medium"
                    onClick={() => handleToggleRow(item._id)}
                  >
                    {expandedRow === item._id ? "Close" : "Add Stock"}
                  </button>
                </td>
              </tr>

              {expandedRow === item._id && (
                <tr className="bg-gray-50">
                  <td colSpan={4} className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <input
                        type="number"
                        placeholder="New Balance"
                        className="p-2 border rounded"
                        value={stockUpdates[item._id]?.newBalance || ""}
                        onChange={(e) =>
                          handleChange(item._id, "newBalance", e.target.value)
                        }
                      />
                      <input
                        type="number"
                        placeholder="Buying Price"
                        className="p-2 border rounded"
                        value={stockUpdates[item._id]?.buyingPrice || ""}
                        onChange={(e) =>
                          handleChange(item._id, "buyingPrice", e.target.value)
                        }
                      />
                      <input
                        type="number"
                        placeholder="New Selling Price"
                        className="p-2 border rounded"
                        value={stockUpdates[item._id]?.newSellingPrice || ""}
                        onChange={(e) =>
                          handleChange(item._id, "newSellingPrice", e.target.value)
                        }
                      />
                    </div>
                    <div className="mt-3 flex gap-2">
                      <button
                        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                        onClick={() => handleSave(item._id)}
                      >
                        Save
                      </button>
                      <button
                        className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
                        onClick={() => handleToggleRow(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Madeni