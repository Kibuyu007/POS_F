import axios from "axios";
import { useEffect } from "react";
import { useState } from "react";


const IncompletePoGrn = () => {

   const [items, setItems] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:4004/api/grn/outstand")
      .then((res) => {
        if (res.data.success) {
          setItems(res.data.data);
        }
      })
      .catch((err) => {
        console.error("Error fetching outstanding items:", err);
      });
  }, []);


  return (
     <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Outstanding PO Items</h2>
      <table className="w-full border border-gray-300">
        <thead className="bg-gray-100">
          <tr className="text-black">
            <th className="p-2 border">Item Name</th>
            <th className="p-2 border">Required Quantity</th>
            <th className="p-2 border">Outstanding Quantity</th>
            <th className="p-2 border">Buying Price</th>
            <th className="p-2 border">Supplier</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <tr key={idx} className="text-center text-black">
              <td className="p-2 border">{item.itemName}</td>
              <td className="p-2 border">{item.requiredQuantity}</td>
              <td className="p-2 border">{item.outstandingQuantity}</td>
              <td className="p-2 border">Tsh {item.newBuyingPrice}</td>
              <td className="p-2 border">{item.supplier}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default IncompletePoGrn