

const DeniNonPoPdf = ({ open, onClose,grn }) => {

     if (!open) return null;
  return (
            <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 shadow-lg relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-600 hover:text-black text-xl"
        >
          &times;
        </button>

        <h3 className="text-lg font-semibold mb-2">GRN Details</h3>
        <div className="mb-4 text-sm text-gray-700 space-y-1">
          <p><strong>Supplier:</strong> {grn.supplierName}</p>
          <p><strong>Invoice Number:</strong> {grn.invoiceNumber}</p>
          <p><strong>Received On:</strong> {new Date(grn.receivingDate).toLocaleDateString()}</p>
          <p><strong>Created By:</strong> {grn.createdBy}</p>
        </div>

        <h4 className="font-bold mb-2">All Items in GRN</h4>
        <table className="min-w-full text-sm border">
          <thead className="bg-gray-100 text-xs uppercase">
            <tr>
              <th className="p-2 border">Item Name</th>
              <th className="p-2 border">Required</th>
              <th className="p-2 border">Received</th>
              <th className="p-2 border">Outstanding</th>
              <th className="p-2 border">Buying Price</th>
              <th className="p-2 border">Selling Price</th>
              <th className="p-2 border">Batch</th>
              <th className="p-2 border">Expiry</th>
            </tr>
          </thead>
          <tbody>
            {grn.items.map((item, idx) => (
              <tr key={idx} className="text-black">
                <td className="p-2 border">{item.name}</td>
                <td className="p-2 border">{item.requiredQuantity}</td>
                <td className="p-2 border">{item.receivedQuantity}</td>
                <td className="p-2 border">{item.outstandingQuantity}</td>
                <td className="p-2 border">{item.newBuyingPrice}</td>
                <td className="p-2 border">{item.newSellingPrice}</td>
                <td className="p-2 border">{item.batchNumber}</td>
                <td className="p-2 border">
                  {item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default DeniNonPoPdf