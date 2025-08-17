const DeniPoPdf = ({ open, onClose, grn }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
      <div className="bg-white rounded-md w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 shadow-lg relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-600 hover:text-black text-xl bg-green-300 py-2 px-4 rounded-full"
        >
          &times;
        </button>

        <h3 className="text-lg font-semibold mb-2">GRN Details</h3>
        <div className="mb-4 text-sm text-gray-700 space-y-1">
          <p>
            <strong>Invoice Number:</strong> {grn.invoiceNumber}
          </p>
          <p>
            <strong>Received On:</strong>{" "}
            {new Date(grn.receivingDate).toLocaleDateString()}
          </p>
        </div>

        <h4 className="font-bold mb-2">All Items in GRN</h4>
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 text-xs uppercase">
            <tr>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-200 text-center text-xs font-bold text-gray-900 uppercase tracking-wider">
                Item Name
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-200 text-center text-xs font-bold text-gray-900 uppercase tracking-wider">
                Required
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-200 text-center text-xs font-bold text-gray-900 uppercase tracking-wider">
                Received
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-200 text-center text-xs font-bold text-gray-900 uppercase tracking-wider">
                Outstanding
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-200 text-center text-xs font-bold text-gray-900 uppercase tracking-wider">
                Buying Price
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-200 text-center text-xs font-bold text-gray-900 uppercase tracking-wider">
                Selling Price
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-200 text-center text-xs font-bold text-gray-900 uppercase tracking-wider">
                Batch
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-200 text-center text-xs font-bold text-gray-900 uppercase tracking-wider">
                Expiry
              </th>
            </tr>
          </thead>
          <tr className="h-4" />
          <tbody>
            {grn.items.map((item, idx) => (
              <>
                <tr key={idx} className="text-black">
                  <td className="py-2 px-3 font-normal text-base border-x shadow-md bg-gray-200  hover:bg-gray-100  whitespace-nowrap overflow-hidden overflow-ellipsis max-w-[200px]">
                    <div className="items-center text-center">
                      <div className="ml-3">{item.name}</div>
                    </div>
                  </td>
                  <td className="py-2 px-3 font-normal text-base border-x shadow-md bg-gray-200  hover:bg-gray-100  whitespace-nowrap overflow-hidden overflow-ellipsis max-w-[200px]">
                    <div className="items-center text-center">
                      <div className="ml-3">
                        {item.requiredQuantity.toLocaleString()}
                      </div>
                    </div>
                  </td>
                  <td className="p-2 border">
                    <div>
                      <div>{item.receivedQuantity.toLocaleString()}</div>
                    </div>{" "}
                  </td>
                  <td className="py-2 px-3 font-normal text-base border-x shadow-md bg-gray-200  hover:bg-gray-100  whitespace-nowrap overflow-hidden overflow-ellipsis max-w-[200px]">
                    <div className="items-center text-center">
                      <div className="ml-3">
                        {item.outstandingQuantity.toLocaleString()}
                      </div>
                    </div>
                  </td>
                  <td className="p-2 border">
                    <div>
                      <div>{item.newBuyingPrice.toLocaleString()}</div>
                    </div>{" "}
                  </td>

                  <td className="py-2 px-3 font-normal text-base border-x shadow-md bg-gray-200  hover:bg-gray-100  whitespace-nowrap overflow-hidden overflow-ellipsis max-w-[200px]">
                    <div className="items-center text-center">
                      <div className="ml-3">
                        {item.newSellingPrice.toLocaleString()}
                      </div>
                    </div>
                  </td>

                  <td className="py-2 px-3 font-normal text-base border-x shadow-md bg-gray-200  hover:bg-gray-100  whitespace-nowrap overflow-hidden overflow-ellipsis max-w-[200px]">
                    <div className="items-center text-center">
                      <div className="ml-3">{item.batchNumber}</div>
                    </div>
                  </td>
                  <td className="py-2 px-3 font-normal text-base border-x shadow-md bg-red-200  hover:bg-red-100  whitespace-nowrap overflow-hidden overflow-ellipsis max-w-[200px]">
                    <div className="items-center text-center">
                      <div className="ml-3">
                        {item.expiryDate
                          ? new Date(item.expiryDate).toLocaleDateString()
                          : "—"}
                      </div>
                    </div>
                  </td>
                </tr>
                <tr className="h-4" />
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DeniPoPdf;
