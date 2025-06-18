import axios from "axios";
import { useEffect } from "react";
import { useState } from "react";
import DeniPoPdf from "./DeniPoPdf";
import { FaCheckCircle } from "react-icons/fa";


const MadeniPo = () => {
  const [deni, setDeni] = useState([]);
  const [modalData, setModalData] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  const fetchUnpaidPo = async () => {
    try {
      const res = await axios.get("http://localhost:4004/api/grn/unpaidPo");
      if (res.data.success) {
        setDeni(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching billed items:", err);
    }
  };

  useEffect(() => {
    fetchUnpaidPo();
  }, []);

  const handlePreview = async (grnId) => {
    try {
      const res = await axios.get(
        `http://localhost:4004/api/grn/billDetails/${grnId}`
      );
      if (res.data.success) {
        setModalData(res.data.data);
        setOpenModal(true);
      }
    } catch (error) {
      console.error("Preview fetch failed", error);
    }
  };

  const toggleStatus = async (grnId, itemId) => {
    try {
      const res = await axios.put("http://localhost:4004/api/grn/updateBill", {
        grnId,
        itemId,
      });

      if (res.data.success) {
        fetchUnpaidPo();
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
            <th className="p-2 border">Required Quantity</th>
            <th className="p-2 border">Update</th>
            <th className="p-2 border">Preview</th>
          </tr>
        </thead>
        <tbody>
          {deni.map((item, idx) => (
            <tr key={idx} className="text-center text-black">
              <td className="p-2 border">{item.name}</td>
              <td className="p-2 border">Tsh {item.newBuyingPrice}</td>
              <td className="p-2 border">{item.supplier}</td>
              <td className="p-2 border">{item.createdBy}</td>
              <td className="p-2 border">
                {" "}
                {new Date(item.createdAt).toLocaleDateString()}
              </td>
              <td className="p-2 border">{item.requiredQuantity}</td>

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
                  onClick={() => handlePreview(item.grnId)}
                  className="bg-green-600 text-white px-2 py-1 rounded"
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
        <DeniPoPdf
          open={openModal}
          onClose={() => setOpenModal(false)}
          grn={modalData}
        />
      )}
    </div>
  );
};

export default MadeniPo;
