import axios from "axios";
import { useEffect } from "react";
import { useState } from "react";
import OutstandingPdf from "./OutstandingPdf";

const IncompletePoGrn = () => {
  const [items, setItems] = useState([]);
  const [modalData, setModalData] = useState(null);
  const [openModal, setOpenModal] = useState(false);

useEffect(() => {
  const fetchOutstandingItems = async () => {
    try {
      const res = await axios.get("http://localhost:4004/api/grn/outstand");
      if (res.data.success) {
        setItems(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching outstanding items:", err);
    }
  };

  fetchOutstandingItems();
}, []);

  const handleViewClick = async (grnId) => {
    try {
      const res = await axios.get(`http://localhost:4004/api/grn/grnPo/${grnId}`);
      setModalData(res.data);
      setOpenModal(true);
    } catch (err) {
      console.error("Failed to fetch GRN items:", err);
    }
  };

  const submitFilledQuantities = async () => {
  const updates = items.filter(
    (item) => item.filledQuantity > 0 && item.outstandingQuantity > 0
  );

  for (const item of updates) {
    try {
      const res = await axios.put("/api/grn/fill-quantity", {
        grnId,
        itemId: item.itemId, // Make sure itemId is passed with each item
        filledQuantity: item.filledQuantity,
      });

      if (res.data.success) {
        console.log(`Updated ${item.name}`);
      }
    } catch (err) {
      console.error("Update failed for", item.name, err);
    }
  }

  fetchOutstandingItems(); // Refresh the GRN view
};


  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Outstanding PO Items</h2>
      <table className="w-full border border-gray-300">
        <thead className="bg-gray-100">
          <tr className="text-black">
            <th className="p-2 border">Item Name</th>
            <th className="p-2 border">Buying Price</th>
            <th className="p-2 border">Supplier</th>
            <th className="p-2 border">Created By</th>
            <th className="p-2 border">Created At</th>
            <th className="p-2 border">Required Quantity</th>
            <th className="p-2 border">Outstanding Quantity</th>
            <th className="p-2 border">Received Quantity</th>
            <th className="p-2 border">Update</th>
            <th className="p-2 border">Preview</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <tr key={idx} className="text-center text-black">
              <td className="p-2 border">{item.name}</td>
              <td className="p-2 border">Tsh {item.newBuyingPrice}</td>
              <td className="p-2 border">{item.supplier}</td>
              <td className="p-2 border">{item.createdBy}</td>
              <td className="p-2 border"> {new Date(item.createdAt).toLocaleDateString()}</td>
              <td className="p-2 border">{item.requiredQuantity}</td>
              <td className="p-2 border">{item.outstandingQuantity}</td>




              <td className="p-2 border">
                <input
                  type="number"
                  min={1}
                  max={item.outstandingQuantity}
                  disabled={item.outstandingQuantity === 0}
                  value={
                    item.filledQuantity === undefined ? "" : item.filledQuantity
                  }
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "") {
                      items[idx].filledQuantity = undefined;
                    } else {
                      const number = parseInt(value);
                      if (
                        !isNaN(number) &&
                        number <= item.outstandingQuantity
                      ) {
                        items[idx].filledQuantity = number;
                      }
                    }
                    setItems([...items]);
                  }}
                  className="border px-2 py-1 w-20"
                />
              </td>
              
              
              <td className="p-2 border">
                <button
                  onClick={submitFilledQuantities}
                  disabled={
                    !items[idx].filledQuantity || items[idx].filledQuantity <= 0
                  }
                  className="bg-green-600 text-white px-2 py-1 rounded disabled:opacity-50"
                >
                  Save
                </button>
              </td>
              <td className="p-2 border">
                <button
                onClick={() => handleViewClick(item.grnId)}
                  className="bg-green-600 text-white px-2 py-1 rounded disabled:opacity-50"
                >
                  Preview GRN
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

        {/* Modal */}
      {openModal && modalData && (
        <OutstandingPdf
          open={openModal}
          onClose={() => setOpenModal(false)}
          grn={modalData}
        />
      )}

    </div>
  );
};

export default IncompletePoGrn;
