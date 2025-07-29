import { PDFViewer } from "@react-pdf/renderer";
import PoDocument from "./PdfPo";

const PreviewPo = ({ session, onClose }) => {
  if (!session) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded-lg w-[90%] h-[90%] shadow-lg relative">
        <h2 className="text-lg font-semibold mb-2 text-black">PDF Preview</h2>

        <div className="h-[90%]">
          <PDFViewer width="100%" height="100%">
            <PoDocument session={session} />
          </PDFViewer>
        </div>

        <button
          className="absolute bottom-4 right-4 px-4 py-2 bg-green-500 text-black rounded hover:bg-gray-300"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default PreviewPo;
