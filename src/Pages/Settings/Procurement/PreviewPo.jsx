import { jsPDF } from "jspdf";
import { useEffect, useRef } from "react";

const PreviewPo = ({ session, onClose }) => {
  const iframeRef = useRef(null);

  useEffect(() => {
  if (!session || !Array.isArray(session.allItems)) return;

  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text("Purchase Order Preview", 20, 20);
  doc.setFontSize(12);
  doc.text(`Session ID: ${session.grnSessionId}`, 20, 30);
  doc.text(`Created At: ${new Date(session.createdAt).toLocaleString()}`, 20, 40);

  doc.setFontSize(14);
  doc.text("Items:", 20, 55);

let y = 65;
if (session.allItems && session.allItems.length > 0) {
  session.allItems.forEach((item, idx) => {
    doc.setFontSize(12);
    doc.text(
      `${idx + 1}. ${item?.item?.name || "N/A"} - Qty: ${item?.requiredQuantity || 0} - ${item?.description || "No description"}`,
      20,
      y
    );
    y += 10;
  });
} else {
  doc.text("No items found in this session.", 20, y);
}

  const pdfBlob = doc.output("blob");
  const url = URL.createObjectURL(pdfBlob);

  setTimeout(() => {
    if (iframeRef.current) iframeRef.current.src = url;
  }, 0);

  return () => {
    URL.revokeObjectURL(url);
  };
}, [session]);

  if (!session) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-[80%] h-[80%] shadow-lg relative">
        <h2 className="text-lg font-semibold mb-4">PDF Preview</h2>
        <iframe ref={iframeRef} className="w-full h-[90%] border" title="PDF Preview" />
        <button
          className="absolute bottom-6 right-6 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default PreviewPo;
