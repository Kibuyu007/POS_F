const DeniNonPoPdf = ({ open, onClose, grn }) => {
  if (!open || !grn) return null;

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-40 flex justify-center items-center text-black">
      <div className="bg-white p-6 rounded shadow-lg w-[600px] max-h-[80vh] overflow-y-auto">
        <h2 className="text-lg font-bold mb-2">GRN: {grn.name}</h2>

        <p className="mb-2">
          Supplier: <strong>{grn.supplier}</strong>
        </p>
        <p className="mb-2">
          Created By: <strong>{grn.createdBy}</strong>
        </p>

        <h3 className="font-semibold mt-4 mb-1">Completed Items</h3>
        <ul className="list-disc pl-5 text-sm">
          {grn.completedItems?.map((item, idx) => (
            <li key={idx}>
              {item.name} - Qty: {item.quantity}
            </li>
          ))}
        </ul>

        <button
          className="mt-4 px-4 py-1 bg-red-600 text-white rounded"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default DeniNonPoPdf;
