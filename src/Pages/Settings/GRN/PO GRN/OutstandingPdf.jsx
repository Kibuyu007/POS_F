const OutstandingPdf = ({ open, onClose, grn }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center px-4">
      <div className="bg-white rounded-md shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto p-6 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-600 hover:text-black text-xl bg-green-300 py-2 px-4 rounded-full"
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
            <span className="font-medium">Invoice Number:</span>{" "}
            {grn.invoiceNumber}
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
          <table className="min-w-full text-sm rounded-md overflow-hidden">
            <thead className="bg-gray-100 text-gray-700 text-xs uppercase">
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
            <tbody className="text-center text-gray-800">
              {grn.items.map((item, idx) => (
                <>
                  <tr
                    key={idx}
                    className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="py-2 px-3 font-normal text-base border-x shadow-md bg-gray-200  hover:bg-gray-100  whitespace-nowrap overflow-hidden overflow-ellipsis max-w-[200px]">
                      <div className="items-center text-center">
                        <div className="ml-3">{item.name}</div>
                      </div>
                    </td>
                    <td className="py-2 px-3 font-normal text-base border-x shadow-md bg-gray-200  hover:bg-gray-100  whitespace-nowrap overflow-hidden overflow-ellipsis max-w-[200px]">
                      <div className="items-center text-center">
                        <div className="ml-3">{item.requiredQuantity}</div>
                      </div>
                    </td>
                    <td className="py-2 px-3 font-normal text-base border-x shadow-md bg-gray-200  hover:bg-gray-100  whitespace-nowrap overflow-hidden overflow-ellipsis max-w-[200px]">
                      <div className="items-center text-center">
                        <div className="ml-3">{item.receivedQuantity}</div>
                      </div>
                    </td>
                    <td className="py-2 px-3 font-normal text-base border-x shadow-md bg-gray-200  hover:bg-gray-100  whitespace-nowrap overflow-hidden overflow-ellipsis max-w-[200px]">
                      <div className="items-center text-center">
                        <div className="ml-3">{item.outstandingQuantity}</div>
                      </div>
                    </td>
                    <td className="py-2 px-3 font-normal text-base border-x shadow-md bg-gray-200  hover:bg-gray-100  whitespace-nowrap overflow-hidden overflow-ellipsis max-w-[200px]">
                      <div className="items-center text-center">
                        <div className="ml-3">Tsh {item.newBuyingPrice}</div>
                      </div>
                    </td>
                    <td className="py-2 px-3 font-normal text-base border-x shadow-md bg-gray-200  hover:bg-gray-100  whitespace-nowrap overflow-hidden overflow-ellipsis max-w-[200px]">
                      <div className="items-center text-center">
                        <div className="ml-3">Tsh {item.newSellingPrice}</div>
                      </div>
                    </td>
                    <td className="py-2 px-3 font-normal text-base border-x shadow-md bg-gray-200  hover:bg-gray-100  whitespace-nowrap overflow-hidden overflow-ellipsis max-w-[200px]">
                      <div className="items-center text-center">
                        <div className="ml-3">{item.batchNumber}</div>
                      </div>
                    </td>
                    <td className="py-2 px-3 font-normal text-base border-x shadow-md bg-gray-200  hover:bg-gray-100  whitespace-nowrap overflow-hidden overflow-ellipsis max-w-[200px]">
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
    </div>
  );
};

export default OutstandingPdf;
