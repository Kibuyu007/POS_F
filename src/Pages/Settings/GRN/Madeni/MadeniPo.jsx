import axios from "axios";
import { useEffect, useState } from "react";
import DeniPoPdf from "./DeniPoPdf";
import { FaCheckCircle } from "react-icons/fa";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";

const MadeniPo = () => {
  const [deni, setDeni] = useState([]);
  const [modalData, setModalData] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

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

  // Pagination logic
  const totalItems = deni.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const paginatedItems = deni.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
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
          {paginatedItems.map((item, idx) => (
            <tr key={idx} className="text-center text-black">
              <td className="p-2 border">{item.name}</td>
              <td className="p-2 border">Tsh {item.newBuyingPrice}</td>
              <td className="p-2 border">{item.supplier}</td>
              <td className="p-2 border">{item.createdBy}</td>
              <td className="p-2 border">
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

      {/* Pagination */}
      <div className="flex items-center justify-between border-t border-gray-200 bg-white py-3 mt-2">
        <p className="text-sm text-gray-700 px-2">
          Showing{" "}
          <span className="font-medium">
            {(currentPage - 1) * itemsPerPage + 1}
          </span>{" "}
          to{" "}
          <span className="font-medium">
            {Math.min(currentPage * itemsPerPage, totalItems)}
          </span>{" "}
          of <span className="font-medium">{totalItems}</span> items
        </p>

        <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm">
          <button
            onClick={prevPage}
            disabled={currentPage === 1}
            className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-gray-300 hover:bg-gray-50 ${
              currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <IoIosArrowBack className="size-5" />
          </button>

          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i + 1}
              onClick={() => setCurrentPage(i + 1)}
              className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ring-1 ring-gray-300 hover:bg-gray-50 ${
                currentPage === i + 1
                  ? "bg-green-500 text-white"
                  : "text-gray-900"
              }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            onClick={nextPage}
            disabled={currentPage === totalPages}
            className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-gray-300 hover:bg-gray-50 ${
              currentPage === totalPages
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
          >
            <IoIosArrowForward className="size-5" />
          </button>
        </nav>
      </div>
    </div>
  );
};

export default MadeniPo;
