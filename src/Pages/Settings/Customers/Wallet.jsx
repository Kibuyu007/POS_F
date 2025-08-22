const Wallet = ({ selectedBill, currentBalance = 50000 }) => {
  if (!selectedBill) return null;

  // Total of all bills for this customer
  const totalBills = selectedBill.bills.reduce(
    (sum, bill) => sum + (bill.totalAmount || 0),
    0
  );

  const debt = totalBills > currentBalance ? totalBills - currentBalance : 0;

  return (
    <div className="font-sans text-gray-800">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-5 rounded-2xl shadow-sm text-center">
          <p className="text-gray-500 text-sm uppercase tracking-wide">
            Current Balance
          </p>
          <p className="text-2xl font-bold mt-2 text-gray-900">
            {currentBalance.toLocaleString()} TSh
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm text-center">
          <p className="text-gray-500 text-sm uppercase tracking-wide">
            Total Bills
          </p>
          <p className="text-2xl font-bold mt-2 text-gray-900">
            {totalBills.toLocaleString()} TSh
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm text-center">
          <p className="text-gray-500 text-sm uppercase tracking-wide">Debt</p>
          <p
            className={`text-2xl font-bold mt-2 ${
              debt > 0 ? "text-red-500" : "text-green-500"
            }`}
          >
            {debt.toLocaleString()} TSh
          </p>
        </div>
      </div>

      {/* Customer Info */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold">
          {selectedBill.name}{" "}
          <span className="text-gray-500">({selectedBill.phone})</span>
        </h2>
      </div>

      {/* Bills List */}
      {selectedBill.bills.map((bill) => (
        <div
          key={bill._id}
          className="bg-white rounded-2xl shadow-sm p-5 mb-6"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Bill #{bill._id.slice(-5)}</h3>
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                bill.status === "Bill"
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-green-100 text-green-700"
              }`}
            >
              {bill.status}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4 text-sm text-gray-600">
            <p>
              <span className="font-medium">Created:</span>{" "}
              {new Date(bill.createdAt).toLocaleDateString()}
            </p>
            <p>
              <span className="font-medium">Total:</span>{" "}
              {bill.totalAmount.toLocaleString()} TSh
            </p>
          </div>

          <h4 className="text-md font-semibold mb-3">Items</h4>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="py-2">Item</th>
                <th className="py-2">Qty</th>
                <th className="py-2">Price</th>
                <th className="py-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {bill.items?.map((item, idx) => (
                <tr key={idx} className="border-b last:border-0">
                  <td className="py-2">{item.name}</td>
                  <td className="py-2">{item.quantity}</td>
                  <td className="py-2">
                    {item.price.toLocaleString()} TSh
                  </td>
                  <td className="py-2">
                    {(item.price * item.quantity).toLocaleString()} TSh
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}

      {/* Action Buttons */}
      <div className="flex gap-3 mt-6">
        <button className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-full text-sm font-medium transition">
          Deposit
        </button>
        <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-full text-sm font-medium transition">
          Pay
        </button>
        <button className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-full text-sm font-medium transition">
          Withdraw
        </button>
      </div>
    </div>
  );
};

export default Wallet;
