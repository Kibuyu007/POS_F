import { useEffect, useMemo, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import axios from "axios";
import BASE_URL from "../../../Utils/config";

const formatTZS = (n = 0) => `${Number(n || 0).toLocaleString()} TSh`;
const formatDate = (d) => (d ? new Date(d).toLocaleDateString() : "—");

const Wallet = ({ selectedBill, onClick, user }) => {
  const [openDeposit, setOpenDeposit] = useState(false);
  const [openWithdraw, setOpenWithdraw] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState(0);


  if (!selectedBill)
    return <p className="text-gray-500">No customer selected</p>;

  //  define customerId
  const customerId = selectedBill._id;

  // totals
  const { totalBills, debt } = useMemo(() => {
    const total = (selectedBill?.bills || []).reduce((sum, b) => {
      // take totalAmount minus already paidAmount for each bill
      const remaining = (b.totalAmount || 0) - (b.paidAmount || 0);
      return sum + (remaining > 0 ? remaining : 0);
    }, 0);

    return {
      totalBills: total,
      debt: total > balance ? total - balance : 0, // remaining debt beyond balance
    };
  }, [selectedBill, balance]);



  // Fetch balance from backend
  const fetchBalance = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${BASE_URL}/api/customers/currentBalance/${customerId}`
      );
      setBalance(res.data.balance);
    } catch (err) {
      console.error("Error fetching balance:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (customerId) {
      fetchBalance();
    }
  }, [customerId]);

  // Handle Deposit
  const handleDeposit = async () => {
    if (!depositAmount) return;
    try {
      setLoading(true);
      await axios.post(`${BASE_URL}/api/customers/deposit`, {
        customerId,
        depositAmount: Number(depositAmount),
      });
      setDepositAmount("");
      fetchBalance(); // refresh balance
    } catch (err) {
      console.error("Error depositing:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle Withdraw
  const handleWithdraw = async () => {
    if (!withdrawAmount) return;
    try {
      setLoading(true);
      await axios.post(`${BASE_URL}/api/customers/withdraw`, {
        customerId,
        withdrawAmount: Number(withdrawAmount),
      });
      setWithdrawAmount("");
      fetchBalance(); // refresh balance
    } catch (err) {
      console.error("Error withdrawing:", err);
    } finally {
      setLoading(false);
    }
  };


 // Handle Pay Bill
const handlePayBill = async () => {
  try {
    if (balance <= 0) {
      alert("Insufficient balance. Please deposit first.");
      return;
    }

    setLoading(true);

    // call backend payBill
    const res = await axios.post(`${BASE_URL}/api/customers/payBill`, {
      customerId,
      paidAmount: balance, // send current balance as the paying amount
    });

    if (res.data.success) {
      alert("Payment successful");

      // ✅ update bills on frontend (fix for your issue)
      if (res.data.updatedBills) {
        onClick(prev => ({
          ...prev,
          bills: res.data.updatedBills,
        }));
      }

      // ✅ update balance directly instead of fetchBalance again
      if (res.data.balance !== undefined) {
        setBalance(res.data.balance);
      } else {
        // fallback if backend didn’t send balance
        fetchBalance();
      }
    } else {
      alert(res.data.message || "Payment failed");
    }
  } catch (err) {
    console.error("Error paying bill:", err);
    alert("Failed to process payment");
  } finally {
    setLoading(false);
  }
};


  // === PDF generation (left same) ===
  const generatePdf = () => {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const marginX = 40;
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 48;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Customer Wallet Summary", pageWidth / 2, y, { align: "center" });
  y += 18;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generated: ${new Date().toLocaleString()}`, marginX, y);
  y += 25;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(33);
  doc.text(`Customer: ${selectedBill.name}`, marginX, y);
  y += 18;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.setTextColor(80);
  doc.text(`Phone: ${selectedBill.phone}`, marginX, y);
  y += 30;

  // ===== Add Current Amount, Debt, and Total Bills =====
  const totalBills = (selectedBill.bills || []).reduce(
    (sum, b) => sum + (b.totalAmount || 0),
    0
  );
  const totalPaid = (selectedBill.bills || []).reduce(
    (sum, b) => sum + (b.paidAmount || 0),
    0
  );
  const debt = totalBills - totalPaid;
  const currentAmount = selectedBill.currentAmount || 0; // assuming you have this in the object

  doc.setFont("helvetica", "bold");
  doc.text(`Current Amount: ${formatTZS(currentAmount)}`, marginX, y);
  y += 16;
  doc.text(`Debt: ${formatTZS(debt)}`, marginX, y);
  y += 16;
  doc.text(`Total Bills: ${formatTZS(totalBills)}`, marginX, y);
  y += 30;

  (selectedBill.bills || []).forEach((bill, idx) => {
    if (idx > 0) {
      doc.addPage();
      y = 48;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text(
      `Bill #${(bill?._id || "").slice(-5)}  •  ${formatDate(
        bill?.createdAt
      )}  •  ${bill?.status || ""}`,
      marginX,
      y
    );
    y += 18;

    const rows =
      (bill?.items || []).map((it) => [
        it?.name || "",
        String(it?.quantity ?? 0),
        formatTZS(it?.price || 0),
        formatTZS((it?.price || 0) * (it?.quantity || 0)),
      ]) || [];

    autoTable(doc, {
      startY: y,
      head: [["Item", "Qty", "Price", "Total"]],
      body: rows,
      theme: "grid",
      styles: {
        font: "helvetica",
        fontSize: 10,
        cellPadding: 6,
        textColor: [0, 0, 0],
      },
      headStyles: { fillColor: [245, 245, 245] },
      margin: { left: marginX, right: marginX },
    });

    y = doc.lastAutoTable.finalY + 20;
  });

  doc.output("dataurlnewwindow");
};


  return (
    <div className="font-sans text-gray-800">
      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 mt-16 animate-pulse font-sans text-gray-800">
          {/* Current Balance Loader */}
          <div className="bg-white p-5 shadow-sm text-center border border-dashed border-gray-400 rounded-lg">
            <div className="h-4 bg-gray-300 rounded w-1/3 mx-auto mb-3"></div>
            <div className="h-6 bg-gray-400 rounded w-1/2 mx-auto"></div>
          </div>

          {/* Total Bills Loader */}
          <div className="bg-white p-5 shadow-sm text-center border border-dashed border-gray-400 rounded-lg">
            <div className="h-4 bg-gray-300 rounded w-1/3 mx-auto mb-3"></div>
            <div className="h-6 bg-gray-400 rounded w-1/2 mx-auto"></div>
          </div>

          {/* Debt Loader */}
          <div className="bg-white p-5 shadow-sm text-center border border-dashed border-gray-400 rounded-lg">
            <div className="h-4 bg-gray-300 rounded w-1/3 mx-auto mb-3"></div>
            <div className="h-6 bg-gray-400 rounded w-1/2 mx-auto"></div>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 mt-16">
        <div className="bg-white p-5 shadow-sm text-center border border-dashed border-gray-400 rounded-lg">
          <p className="text-gray-500 text-sm uppercase tracking-wide">
            Current Balance
          </p>
          <p className="text-2xl font-bold mt-2 text-gray-900">
            {formatTZS(balance)}
          </p>
        </div>

        <div className="bg-white p-5 shadow-sm text-center border border-dashed border-gray-400 rounded-lg">
          <p className="text-gray-500 text-sm uppercase tracking-wide">
            Total Bills
          </p>
          <p className="text-2xl font-bold mt-2 text-gray-900">
            {formatTZS(totalBills)}
          </p>
        </div>

        <div className="bg-white p-5 shadow-sm text-center border border-dashed border-gray-400 rounded-lg">
          <p className="text-gray-500 text-sm uppercase tracking-wide">Debt</p>
          <p
            className={`text-2xl font-bold mt-2 ${
              debt > 0 ? "text-red-500" : "text-green-600"
            }`}
          >
            {formatTZS(debt)}
          </p>
        </div>
      </div>

      {/* Customer Info */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold">
          {selectedBill.name}{" "}
          <span className="text-gray-500">({selectedBill.phone})</span>
        </h2>
        <h2 className="text-xl font-semibold">
          Location{" "}
          <span className="text-gray-500">({selectedBill.address})</span>{" "}
        </h2>
        <h2 className="text-xl font-semibold">
          Email/NIDA{" "}
          <span className="text-gray-500">({selectedBill.email})</span>{" "}
        </h2>
      </div>

      {/* Bills */}
      {(selectedBill.bills || []).map((bill) => (
        <div
          key={bill._id}
          className="bg-white shadow-sm p-5 mb-6 border border-dashed border-gray-500 rounded-lg"
        >
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-medium">
              Bill #{String(bill._id).slice(-5)}
            </h3>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3 text-sm text-gray-600">
            <p>
              <span className="font-medium">Created:</span>{" "}
              {formatDate(bill.createdAt)}
            </p>
            <p>
              <span className="font-medium">Total:</span>{" "}
              {formatTZS(bill.totalAmount)}
            </p>
          </div>

          <div className=" px-4 py-2">
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
                {(bill.items || []).map((item, idx) => (
                  <tr key={idx} className="border-b last:border-0">
                    <td className="py-2">{item?.name}</td>
                    <td className="py-2">{item?.quantity}</td>
                    <td className="py-2">{formatTZS(item?.price)}</td>
                    <td className="py-2">
                      {formatTZS((item?.price || 0) * (item?.quantity || 0))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      {/* Actions */}
      <div className="flex flex-col md:flex-row justify-between items-center mt-4 gap-4">
        <div className="flex gap-3 mt-6">
          <button
            onClick={() => setOpenDeposit(true)}
            className="bg-green-300 hover:bg-green-500 text-black font-semibold px-6 py-3 rounded-full text-sm transition"
          >
            Deposit
          </button>
          <button
            onClick={handlePayBill}
            className="bg-gray-300 hover:bg-green-200 text-black font-semibold px-6 py-3 rounded-full text-sm transition"
          >
            Pay
          </button>
          <button
            onClick={() => setOpenWithdraw(true)}
            className="bg-gray-200 hover:bg-green-200 text-black font-semibold px-6 py-3 rounded-full text-sm transition"
          >
            Withdraw
          </button>
          <button
            onClick={generatePdf}
            className="bg-yellow-500 hover:bg-green-200 text-black font-semibold px-6 py-3 rounded-full text-sm transition"
          >
            Print Bill
          </button>
        </div>

        <div>
          <button
            onClick={onClick}
            className="bg-green-300 hover:bg-green-200 justify-end text-black font-semibold px-6 py-3 rounded-full text-sm transition"
          >
            Close
          </button>
        </div>
      </div>

      {/* Deposit Modal */}
      {openDeposit && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96">
            <h2 className="text-lg font-bold mb-4">Deposit Money</h2>
            <input
              type="number"
              placeholder="Enter amount"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              className="w-full border p-2 rounded mb-4"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setOpenDeposit(false)}
                className="px-4 py-2 bg-gray-200 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleDeposit}
                className="px-4 py-2 bg-green-500 text-white rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Withdraw Modal */}
      {openWithdraw && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96">
            <h2 className="text-lg font-bold mb-4">Withdraw Money</h2>
            <input
              type="number"
              placeholder="Enter amount"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              className="w-full border p-2 rounded mb-4"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setOpenWithdraw(false)}
                className="px-4 py-2 bg-gray-200 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleWithdraw}
                className="px-4 py-2 bg-green-500 text-white rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Wallet;
