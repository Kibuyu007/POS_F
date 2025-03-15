import { useSelector } from "react-redux"
import { getTotalPrice } from "../../Redux/cartSlice"



const Cart = () => {

  const cartData = useSelector(state=> state.cart)
  const total = useSelector(getTotalPrice)
  const taxRate = 2.5;
  const tax = (total * taxRate)/100;
  const finalTotal = total + tax;


  return (
    <>
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
            <button className="bg-[#00c853] px-4 py-3 w-full rounded-lg text-black">Cash</button>
            <button className="bg-grey px-4 py-3 w-full rounded-lg text-black">Bill</button>
        </div> 
    </>
  )
}

export default Cart