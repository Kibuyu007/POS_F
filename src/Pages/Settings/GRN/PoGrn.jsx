import axios from "axios";
import { useEffect } from "react";
import { useState } from "react";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import PreviewPo from "./PreviewPo";

const PoGrn = () => {
  const [sessions, setSessions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [selectedSession, setSelectedSession] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("http://localhost:4004/api/manunuzi/getPo");
        if (res.data.success) {
          // Summarize sessions
          const summarized = res.data.data.map((session) => ({
            grnSessionId: session.grnSessionId,
            createdAt: session.createdAt,
            totalProducts: session.allItems.reduce(
              (total, item) => total + item.requiredQuantity,
              0
            ),
          }));
          setSessions(summarized);
        } else {
          console.error("Failed to fetch GRN data");
        }
      } catch (err) {
        console.error("API Error:", err);
      }
    };

    fetchData();
  }, []);

  const handlePreview = (session) => {
    setSelectedSession(session);
    setShowPreviewModal(true);
  };

  const totalItems = sessions.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const paginatedSessions = sessions.slice(
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
    <div className="p-4 bg-white rounded shadow-md">
      <table className="min-w-full text-sm text-left text-gray-700">
        <thead className="bg-gray-100 text-xs uppercase">
          <tr>
            <th className="px-4 py-2">Session ID</th>
            <th className="px-4 py-2">Total Products</th>
            <th className="px-4 py-2">Created At</th>
            <th className="px-4 py-2">Created At</th>
            <th className="px-4 py-2">Created At</th>
          </tr>
        </thead>
        <tbody>
          {paginatedSessions.map((session, idx) => (
            <tr key={idx} className="border-b">
              <td className="px-4 py-2">
                {(currentPage - 1) * itemsPerPage + idx + 1}
              </td>
              <td className="px-4 py-2">{session.totalProducts}</td>
              <td className="px-4 py-2">
                {new Date(session.createdAt).toLocaleDateString()}
              </td>
              <td className="px-4 py-2">
                {" "}
                <button
                  className="bg-gray-300 px-6 py-2 rounded-3xl shadow-md"
                  onClick={() => handlePreview(session.grnSessionId)}
                >
                  Preview
                </button>
              </td>
              <td className="px-4 py-2">
                {" "}
                <button className="bg-green-300 px-6 py-2 rounded-3xl shadow-md">
                  {" "}
                  Process{" "}
                </button>{" "}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showPreviewModal && selectedSession && (
        <PreviewPo
          session={selectedSession}
          onClose={() => setShowPreviewModal(false)}
        />
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between border-t border-gray-200 bg-white py-3">
        <p className="text-sm text-gray-700 px-2">
          Showing{" "}
          <span className="font-medium">
            {(currentPage - 1) * itemsPerPage + 1}
          </span>{" "}
          to{" "}
          <span className="font-medium">
            {Math.min(currentPage * itemsPerPage, totalItems)}
          </span>{" "}
          of <span className="font-medium">{totalItems}</span> sessions
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
              currentPage === totalPages ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <IoIosArrowForward className="size-5" />
          </button>
        </nav>
      </div>
    </div>
  );
};

export default PoGrn;
