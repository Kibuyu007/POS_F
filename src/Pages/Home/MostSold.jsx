import { Link } from "react-router-dom";
const MostSold = ({ list }) => {
  const toDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="mt-6 pr-4">
      <div className="w-full rounded-2xl shadow-lg bg-white">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200  sm:flex-col sm:items-center sm:justify-between">
          <h1 className="text-xl font-bold text-gray-800 tracking-wide">
            Madeni
          </h1>
          <Link
            to="/reports"
            className="text-green-600 hover:underline text-sm font-medium"
          >
            View all
          </Link>
        </div>

        {/* Items List */}
        <div className="px-4 py-3">
          {list?.length === 0 ? (
            <p className="text-center text-gray-500 py-6 italic">
              No billed items today
            </p>
          ) : (
            list.map((tx, txIndex) =>
              tx.items?.map((item, itemIndex) => (
                <div
                  key={`${tx._id}-${item.item?._id || itemIndex}`}
                  className="bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl p-4 mb-4 shadow-sm hover:shadow-md transition "
                >
                  {/* Customer Name */}
                  <div className="flex text-sm font-semibold text-gray-600 mb-1 justify-between">
                    <span className="text-gray-500">Customer:</span>

                    <span
                      className={`text-black px-4 py-1 rounded-xl ${
                        item.price > 10000
                          ? "bg-red-500"
                          : item.price >= 1000 && item.price <= 9900
                          ? "bg-yellow-400"
                          : "bg-green-400"
                      }`}
                    >
                      {tx.customerDetails?.name || "No Name"}
                    </span>
                  </div>

                  {/* Item Name */}
                  <div className="mb-2 flex justify-between">
                    <h2 className="text-lg font-bold text-gray-900 mb-1">
                      {item.item?.name || "Unknown Item"}
                    </h2>

                    <p className="text-gray-500 font-bold text-end">
                      {toDate(tx.createdAt)}
                    </p>
                  </div>

                  {/* Item Details */}
                  <div className="flex text-sm text-gray-700 justify-between">
                    <div className="flex flex-col">
                      <span className="font-semibold">
                        {" "}
                        Qty: {item.quantity}
                      </span>
                      <span className="font-semibold">
                        {" "}
                        Price: {item.price} TSh
                      </span>
                    </div>

                    <div className="flex flex-col">
                      <span>Total: </span>

                      <span className="text-green-700 font-bold">
                        {(item.price * item.quantity).toLocaleString()} TSh
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default MostSold;
