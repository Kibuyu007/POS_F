const OutstandingPdf = ({ open, onClose, grn }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center px-4">
      <div className="bg-white rounded-md shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto p-6 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-red-600 text-2xl font-bold"
        >
          &times;
        </button>

        {/* Header */}
        <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
          Goods Received Note (GRN)
        </h2>

        {/* GRN Info Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 text-sm text-gray-700">
          <p>
            <span className="font-medium">Supplier:</span> {grn.supplierName}
          </p>
          <p>
            <span className="font-medium">Invoice Number:</span> {grn.invoiceNumber}
          </p>
          <p>
            <span className="font-medium">Received On:</span>{" "}
            {new Date(grn.receivingDate).toLocaleDateString()}
          </p>
          <p>
            <span className="font-medium">Created By:</span> {grn.createdBy}
          </p>
        </div>

        {/* Items Table */}
        <div className="overflow-x-auto">
          <h3 className="text-lg font-semibold mb-2 text-gray-800">
            GRN Items
          </h3>
          <table className="min-w-full border border-gray-300 text-sm rounded-xl overflow-hidden">
            <thead className="bg-gray-100 text-gray-700 text-xs uppercase">
              <tr>
                <th className="p-3 border">Item Name</th>
                <th className="p-3 border">Required</th>
                <th className="p-3 border">Received</th>
                <th className="p-3 border">Outstanding</th>
                <th className="p-3 border">Buying Price</th>
                <th className="p-3 border">Selling Price</th>
                <th className="p-3 border">Batch</th>
                <th className="p-3 border">Expiry</th>
              </tr>
            </thead>
            <tbody className="text-center text-gray-800">
              {grn.items.map((item, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="p-3 border font-medium">{item.name}</td>
                  <td className="p-3 border">{item.requiredQuantity}</td>
                  <td className="p-3 border">{item.receivedQuantity}</td>
                  <td className="p-3 border">{item.outstandingQuantity}</td>
                  <td className="p-3 border">Tsh {item.newBuyingPrice}</td>
                  <td className="p-3 border">Tsh {item.newSellingPrice}</td>
                  <td className="p-3 border">{item.batchNumber}</td>
                  <td className="p-3 border">
                    {item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OutstandingPdf;
