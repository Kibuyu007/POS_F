const Wallet = () => {
  const bills = [
    { name: "Electricity", amount: 50000, dueDate: "2025-08-25" },
    { name: "Water", amount: 20000, dueDate: "2025-08-28" },
    { name: "Internet", amount: 15000, dueDate: "2025-09-01" },
  ];

  const currentBalance = 60000;
  const totalBills = bills.reduce((sum, bill) => sum + bill.amount, 0);
  const debt = totalBills > currentBalance ? totalBills - currentBalance : 0;

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans">
      {/* Wallet Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm text-center border border-gray-200">
          <p className="text-gray-700 font-semibold uppercase text-sm">Current Balance</p>
          <p className="text-2xl font-bold mt-2 text-gray-900">
            {currentBalance.toLocaleString()} TSh
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm text-center border border-gray-200">
          <p className="text-gray-700 font-semibold uppercase text-sm">Total Bills</p>
          <p className="text-2xl font-bold mt-2 text-gray-900">
            {totalBills.toLocaleString()} TSh
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm text-center border border-gray-200">
          <p className="text-gray-700 font-semibold uppercase text-sm">Debt</p>
          <p className={`text-2xl font-bold mt-2 ${debt > 0 ? 'text-red-600' : 'text-green-600'}`}>
            {debt.toLocaleString()} TSh
          </p>
        </div>
      </div>

      {/* Bills Table */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-8 border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">Bills</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-gray-700 font-medium">Bill Name</th>
                <th className="px-4 py-2 text-gray-700 font-medium">Amount</th>
                <th className="px-4 py-2 text-gray-700 font-medium">Due Date</th>
                <th className="px-4 py-2 text-gray-700 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {bills.map((bill, idx) => {
                const status = currentBalance >= bill.amount ? "Payable" : "Pending";
                return (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-2 text-gray-900">{bill.name}</td>
                    <td className="px-4 py-2 text-gray-900 font-medium">{bill.amount.toLocaleString()} TSh</td>
                    <td className="px-4 py-2 text-gray-900">{bill.dueDate}</td>
                    <td className={`px-4 py-2 font-semibold ${status === "Payable" ? "text-green-600" : "text-red-600"}`}>
                      {status}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-4">
        <button className="bg-green-300 hover:bg-green-400 text-gray-900 px-6 py-2 rounded-full font-semibold transition-all">
          Deposit
        </button>
        <button className="bg-gray-300 hover:bg-gray-400 text-gray-900 px-6 py-2 rounded-full font-semibold transition-all">
          Withdraw
        </button>
      </div>
    </div>
  );
};

export default Wallet;
