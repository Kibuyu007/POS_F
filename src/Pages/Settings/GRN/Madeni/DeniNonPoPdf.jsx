const DeniNonPoPdf = ({ open, onClose, grn }) => {
  if (!open || !grn) return null;

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 p-6 rounded-lg shadow-2xl w-[600px] max-h-[80vh] overflow-y-auto border border-gray-300 dark:border-gray-700">
        <h2 className="text-xl font-extrabold text-green-600 mb-4">
          GRN Details: {grn.name}
        </h2>

        <div className="mb-4 space-y-1 text-sm">
          <p>
            <span className="font-semibold text-gray-600 dark:text-gray-300">
              Supplier:
            </span>{" "}
            <span className="text-green-700 font-medium">{grn.supplier}</span>
          </p>
          <p>
            <span className="font-semibold text-gray-600 dark:text-gray-300">
              Created By:
            </span>{" "}
            <span className="text-blue-700 font-medium">{grn.createdBy}</span>
          </p>
        </div>

        <h3 className="text-md font-bold border-b border-gray-300 dark:border-gray-700 mb-2 pb-1 text-gray-700 dark:text-gray-200">
          Completed Items
        </h3>
        <ul className="list-disc pl-6 text-sm space-y-1">
          {grn.completedItems?.map((item, idx) => (
            <li
              key={idx}
              className="flex justify-between items-center bg-gray-200 dark:bg-gray-800 rounded-lg px-4 py-2 shadow-sm mb-2"
            >
              <span className="font-semibold text-gray-800 dark:text-white">
                {item.name}
              </span>
              <span className="text-sm text-green-700 font-bold">
                Qty: {item.quantity}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-6 flex justify-end">
          <button
            className="px-5 py-2 rounded-full bg-green-500 hover:bg-gray-200 text-black font-semibold transition-all duration-300"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeniNonPoPdf;
