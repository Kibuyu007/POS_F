import axios from "axios";
import { useState, useEffect } from "react";
import { FaCheckCircle } from "react-icons/fa";
import DeniNonPoPdf from "./DeniNonPoPdf";

const MadeniNonPo = () => {
  const [deniNon, setDeniNon] = useState([]);
  const [modalData, setModalData] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  // Fetch billed items
  const fetchUnpaidNonPo = async () => {
    try {
      const res = await axios.get("http://localhost:4004/api/grn/unpaidNonPo");
      if (res.data.success) {
        setDeniNon(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching billed items:", err);
    }
  };

  useEffect(() => {
    fetchUnpaidNonPo();
  }, []);

  // Preview GRN + completed items
  const handlePreview = (item) => {
    setModalData(item); // Use full item with completedItems
    setOpenModal(true);
  };

  // Toggle item status (e.g., mark as paid)
  const toggleStatus = async (grnId, itemId) => {
    try {
      const res = await axios.put("http://localhost:4004/api/grn/updateNonPoBill", {
        grnId,
        itemId,
      });

      if (res.data.success) {
        fetchUnpaidNonPo();
      }
    } catch (error) {
      console.error("Error updating item status:", error);
      alert("Failed to update status.");
    }
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
            <th className="p-2 border">Update</th>
            <th className="p-2 border">Preview</th>
          </tr>
        </thead>
        <tbody>
          {deniNon.map((item, idx) => (
            <tr key={idx} className="text-center text-black">
              <td className="p-2 border">{item.name}</td>
              <td className="p-2 border">Tsh {item.buyingPrice}</td>
              <td className="p-2 border">{item.supplier}</td>
              <td className="p-2 border">{item.createdBy}</td>
              <td className="p-2 border">
                {new Date(item.createdAt).toLocaleDateString()}
              </td>
              <td className="p-2 border">
                <button
                  className="text-green-600"
                  onClick={() => toggleStatus(item.grnId, item.itemId)}
                >
                  <FaCheckCircle size={20} />
                </button>
              </td>
              <td className="p-2 border">
                <button
                  onClick={() => handlePreview(item)}
                  className="bg-green-600 text-white px-2 py-1 rounded"
                >
                  Preview GRN
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal Preview */}
      {openModal && modalData && (
        <DeniNonPoPdf
          open={openModal}
          onClose={() => setOpenModal(false)}
          grn={modalData}
        />
      )}
    </div>
  );
};

export default MadeniNonPo;
