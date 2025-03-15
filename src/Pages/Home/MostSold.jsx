import bestDishes from './../../Constants/IndexDishes';

const MostSold = () => {
  return (
    <div className="mt-6 pr-6">
    <div className=" w-full rounded-lg">
      <div className="flex justify-between items-center px-6 py-4">
        <h1 className="text-black text-lg font-semibold tracking-wide">
          Popular Dishes
        </h1>
        <a href="" className="text-[#358648] text-xl font-semibold">
          View all
        </a>
      </div>

      <div>
        {bestDishes.map((dish, index) => (
             <div
             key={dish.id}
             className="flex items-center w-full gap-4 bg-[#d6d6d6] rounded-[15px] p-4 mx-2 sm:mx-4 md:mx-6 mt-3"
           >
             {/* Serial Number */}
             <span className="text-black font-semibold text-lg text-center">{index + 1}.</span>

             {/* Dish Image */}
             <img src={dish.image} alt={dish.name} className="w-[50px] h-[50px] rounded-lg" />

             {/* Dish Info */}
             <div>
               <h1 className="text-black font-semibold">{dish.name}</h1>
               <p className="text-black text-sm">{dish.numberOfOrders} orders</p>
             </div>
           </div>
        )
          // Your mapping logic here
        )}
      </div>
    </div>
  </div>
  );
};

export default MostSold;
