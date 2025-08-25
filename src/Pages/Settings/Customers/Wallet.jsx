import { useMemo } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const formatTZS = (n = 0) => `${Number(n || 0).toLocaleString()} TSh`;
const formatDate = (d) => (d ? new Date(d).toLocaleDateString() : "—");

const Wallet = ({ selectedBill, currentBalance = 50000, onClick }) => {
  // guard
  if (!selectedBill)
    return <p className="text-gray-500">No customer selected</p>;

  // totals
  const { totalBills, debt } = useMemo(() => {
    const total = (selectedBill?.bills || []).reduce(
      (sum, b) => sum + (b?.totalAmount || 0),
      0
    );
    return {
      totalBills: total,
      debt: total > currentBalance ? total - currentBalance : 0,
    };
  }, [selectedBill, currentBalance]);

  const generatePdf = () => {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const marginX = 40;
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 48;

    // === PDF Header ===
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Customer Wallet Summary", pageWidth / 2, y, { align: "center" });
    y += 18;

    // Generated timestamp
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100); // softer gray for subtle text
    doc.text(`Generated: ${new Date().toLocaleString()}`, marginX, y);
    y += 25;

    // Customer Info Block
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(33); // dark color for name
    doc.text(`Customer: ${selectedBill.name}`, marginX, y);
    y += 18;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(80); // slightly lighter gray for phone
    doc.text(`Phone: ${selectedBill.phone}`, marginX, y);
    y += 30; // add spacing before next section

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

      // Build table rows
      const rows =
        (bill?.items || []).map((it) => [
          it?.name || "",
          String(it?.quantity ?? 0),
          formatTZS(it?.price || 0),
          formatTZS((it?.price || 0) * (it?.quantity || 0)),
        ]) || [];

      // Table
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

    // Downloa the PDF (only Saves)
    // const fileName = `${(selectedBill?.name || "wallet").replace(
    //   /\s+/g,
    //   "_"
    // )}-wallet.pdf`;
    // doc.save(fileName);

    // Preview the PDF in a new tab
    doc.output("dataurlnewwindow");
  };

  return (
    <div className="font-sans text-gray-800">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 mt-16">
        <div className="bg-white p-5 shadow-sm text-center border border-dashed border-gray-400 rounded-lg">
          <p className="text-gray-500 text-sm uppercase tracking-wide">
            Current Balance
          </p>
          <p className="text-2xl font-bold mt-2 text-gray-900">
            {formatTZS(currentBalance)}
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
      </div>

      {/* Bills List (UI preview) */}
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
          <button className="bg-green-300 hover:bg-green-500 text-black font-semibold px-6 py-3 rounded-full text-sm transition">
            Deposit
          </button>
          <button className="bg-gray-300 hover:bg-green-200 text-black font-semibold px-6 py-3 rounded-full text-sm transition">
            Pay
          </button>
          <button className="bg-gray-200 hover:bg-green-200 text-black font-semibold px-6 py-3 rounded-full text-sm transition">
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
    </div>
  );
};

export default Wallet;
