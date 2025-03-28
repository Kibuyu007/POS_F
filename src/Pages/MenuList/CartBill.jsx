import { useSelector } from "react-redux";
import { getTotalPrice } from "../../Redux/cartSlice";
import { useState } from "react";

const Cart = () => {
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

  const cartData = useSelector((state) => state.cart);
  const total = useSelector(getTotalPrice);
  const taxRate = 2.5;
  const tax = (total * taxRate) / 100;
  const finalTotal = total + tax;

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
        <button className="bg-[#00c853] px-4 py-3 w-full rounded-lg text-black">
          Cash
        </button>
        <button className="bg-grey px-4 py-3 w-full rounded-lg text-black">
          Bill
        </button>
      </div>
    </>
  );
};

export default Cart;
