import { Link } from "react-router-dom";
const TableDash = ({ list }) => {
  // Calculate totals
  const totalQuantity = list.reduce((acc, tx) => {
    const sumItems =
      tx.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
    return acc + sumItems;
  }, 0);

  const totalAmount = list.reduce((acc, tx) => {
    const sumItems =
      tx.items?.reduce((sum, item) => sum + item.price * item.quantity, 0) || 0;
    return acc + sumItems;
  }, 0);

  return (
    <div className="flex-[1] bg-white rounded-2xl p-6 sm:p-8 shadow-lg text-gray-900 overflow-y-auto max-h-[80vh] scrollbar-thin scrollbar-thumb-green-400 scrollbar-track-gray-200 mt-6">
      <div className="relative flex flex-col min-w-0 break-words border border-dashed rounded-2xl border-gray-400 bg-green-50/40 p-6 shadow-inner">
        {/* Card header */}
        <div className="flex justify-between items-center flex-wrap min-h-[70px] pb-3 border-b border-green-300">
          <div className="flex flex-col">
            <h3 className="font-extrabold text-2xl tracking-wide text-emerald-700">
              Madeni
            </h3>
          </div>
          <button
            type="button"
            className="inline-block text-sm font-semibold rounded-full px-5 py-2 bg-emerald-600 text-white shadow-md hover:bg-emerald-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <Link to="/reports" className="text-white text-sm font-medium">
              View All Madeni
            </Link>
          </button>
        </div>

        {/* Totals summary */}
        <div className="mt-6 mb-6 p-4 bg-green-100  shadow-inner flex justify-around  border border-dashed rounded-2xl border-gray-400 text-black font-semibold text-lg">
          <div className="flex flex-col items-center">
            <span>Total Quantity Sold</span>
            <span className="text-3xl">{totalQuantity.toLocaleString()}</span>
          </div>
          <div className="flex flex-col items-center">
            <span>Total Amount</span>
            <span className="text-3xl">{totalAmount.toLocaleString()} TSh</span>
          </div>
        </div>

        {/* Card body */}
        <div className="flex-auto block pt-6">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-center text-gray-800">
              <thead>
                <tr className="border-b-2 border-emerald-300 text-emerald-700 font-semibold text-sm sm:text-base">
                  <th className="pb-3 px-3 min-w-[175px]">Customer</th>
                  <th className="pb-3 px-3 min-w-[100px]">Quantity</th>
                  <th className="pb-3 px-3 min-w-[120px]">Price (TSh)</th>
                  <th className="pb-3 px-8 min-w-[140px]">Status</th>
                  <th className="pb-3 px-3 min-w-[120px]">Date</th>
                </tr>
              </thead>
              <tbody>
                {list.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-10 italic text-gray-400 text-base"
                    >
                      No billed items found
                    </td>
                  </tr>
                ) : (
                  list.map((tx) =>
                    tx.items?.map((item, idx) => (
                      <tr
                        key={`${tx._id}-${item.item?._id || idx}`}
                        className="border-b border-dashed last:border-b-0 hover:bg-emerald-50 transition-colors duration-150"
                      >
                        <td className="p-3 truncate max-w-[200px] font-medium">
                          {tx.customerDetails?.name || "Unknown Customer"}
                        </td>

                        <td className="p-3 font-semibold">{item.quantity}</td>

                        <td className="p-3 font-semibold">
                          {item.price.toLocaleString()}
                        </td>

                        <td className="p-3 flex justify-center items-center">
                          <span
                            className={`inline-block px-3 py-1 rounded-full font-semibold text-sm shadow-sm ${
                              item.price > 10000
                                ? "bg-red-100 text-red-800"
                                : item.price >= 1000 && item.price <= 9900
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {item.price > 10000
                              ? "High"
                              : item.price >= 1000 && item.price <= 9900
                              ? "Medium"
                              : "Low"}
                          </span>
                        </td>

                        <td className="p-3 text-sm text-gray-700">
                          {new Date(tx.createdAt).toLocaleDateString("en-GB")}
                        </td>
                      </tr>
                    ))
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TableDash;
