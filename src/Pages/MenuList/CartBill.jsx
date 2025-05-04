import { useDispatch, useSelector } from "react-redux";
import { clearCart, getTotalPrice, setReceiptPrinted } from "../../Redux/cartSlice";
import { useState } from "react";
import axios from "axios";

const Cart = ({ triggerRefreshMenu }) => {
  const dispatch = useDispatch();

  const [errorMsg, setErrorMsg] = useState("");
  const [lastTransactionDetails, setLastTransactionDetails] = useState(null);
  

  const [customerDetails, setCustomerDetails] = useState({
    name: "Mteja",
    phone: "0777777777",
  });

  const [validation, setValidation] = useState({
    name: true,
    phone: true,
  });

  const handleInput = async (e) => {
    const { name, value } = e.target;
    setCustomerDetails({ ...customerDetails, [name]: value });

    if (name == "phone") {
      const phoneVali = /^[0-9]{10}$/;
      setValidation((prev) => ({ ...prev, phone: phoneVali.test(value) }));
    }
  };

  const cartData = useSelector((state) => state.cart.cart);
  const total = useSelector(getTotalPrice);
  const taxRate = 2.5;
  const tax = (total * taxRate) / 100;
  const finalTotal = total + tax;

  const handleTransaction = async (status) => {
    try {
      const payload = {
        items: cartData.map((item) => ({
          item: item.id,
          quantity: item.quantity,
          price: item.pricePerQuantity,
        })),
        totalAmount: finalTotal,
        customerDetails,
        status,
      };

      const response = await axios.post(
        "http://localhost:4004/api/transactions/sales",
        payload
      );

      if (response.status === 201) {
        alert(
          `Transaction ${
            status === "paid" ? "completed" : "saved as bill"
          } successfully!`
        );
        dispatch(clearCart());
        triggerRefreshMenu();

        // Save for receipt generation
        setLastTransactionDetails({
          items: payload.items,
          totalAmount: payload.totalAmount,
          customerDetails: payload.customerDetails,
        });

        dispatch(setReceiptPrinted(false));
        setShowPrintButton(true); // Show button
      } else {
        alert("Transaction failed");
      }
    } 
    
    catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        setErrorMsg(error.response.data.message);
      } else {
        setErrorMsg("Something went wrong.");
      }
    }
  };


  const [pdfUrl, setPdfUrl] = useState("");
  const [showPrintButton, setShowPrintButton] = useState(false);

  const handlePrintReceipt = async () => {
    try {
      const response = await axios.get(
        "http://localhost:4004/api/receipt/receipt",
        lastTransactionDetails,
        {
          responseType: "blob", // PDF blob
        }
      );

      const blob = new Blob([response.data], { type: "application/pdf" }); 
      const pdfUrl = URL.createObjectURL(blob);
      setPdfUrl(pdfUrl);
      window.open(pdfUrl, "_blank");
      dispatch(setReceiptPrinted(true));
      
    } catch (err) {
      alert("Failed to generate receipt");
      console.error("Receipt error:", err);
    }finally {
      window.location.reload();
    }
  };

  return (
    <>
      {/* Customer Details, Name and Phone Number */}
      <div className="mt-5 py-4">
        <div className="rounded-md shadow-lg px-4 py-4 bg-gradient-to-r from-blue-100 to-green-500">
          <div className="flex flex-row justify-between items-center">
            <div className="flex flex-row justify-between gap-10 py-4">
              <div className="  w-full">
                <label className="font-bold text-lg ml-2">Customer Name</label>
                <input
                  type="text"
                  name="name"
                  value={customerDetails.name}
                  onChange={handleInput}
                  className="w-full h-12 px-4 py-1 rounded-lg border border-gray-400 text-gray-800 focus:outline-none"
                  placeholder="Name"
                />
              </div>

              <div className="  w-full">
                <label className="font-bold text-lg ml-2">Phone Number</label>
                <input
                  type="number"
                  name="phone"
                  value={customerDetails.phone}
                  onChange={handleInput}
                  className={`w-full h-12 px-4 py-1 rounded-lg border ${
                    validation.phone
                      ? "border-gray-400"
                      : "border-red-500 border-2"
                  } text-gray-800 focus:outline-none`}
                  placeholder="Phone"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error message if any */}
      {errorMsg && (
        <div className="text-red-600 font-semibold text-center mt-2">
          {errorMsg}
        </div>
      )}

      <div className="flex items-center justify-between px-5 mt-2">
        <p className="text-black font-bold mt-2"> {cartData.length} : Items</p>
        <h1 className="text-black text-xl  font-bold">{total}/=</h1>
      </div>

      <div className="flex items-center justify-between px-5 mt-2">
        <p className="text-black font-bold mt-2">Tax : (2.5%)</p>
        <h1 className="text-black text-xl  font-bold">{tax}/=</h1>
      </div>

      <div className="flex items-center justify-between px-5 mt-2">
        <p className="text-black font-bold mt-2">Total : Tsh</p>
        <h1 className="text-black text-2xl  font-bold">{finalTotal}/=</h1>
      </div>

      <div className="flex items-center gap-3  px-5 mt-4">
        <button
          onClick={() => handleTransaction("paid")}
          className="bg-[#00c853] px-4 py-3 w-full rounded-lg text-black"
        >
          Cash
        </button>
        <button
          onClick={() => handleTransaction("pending")}
          className="bg-grey px-4 py-3 w-full rounded-lg text-black"
        >
          Bill
        </button>
      </div>

      <div>
        {showPrintButton && (
          <div className="px-5 mt-3">
            <button
              onClick={handlePrintReceipt}
              className="bg-yellow-500 px-4 py-3 w-full rounded-lg text-black font-semibold"
            >
              Print Receipt
            </button>
            {pdfUrl && (
            <embed
              src={pdfUrl}
              type="application/pdf"
              width="100%"
              height="600px"
            />
          )}
          </div>
        )}
      </div>
    </>
  );
};

export default Cart;
