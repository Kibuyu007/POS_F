const CardOne = ({ title, icon, number, loading }) => {
  return (
    <div className="bg-gradient-to-r from-green-100 via-green-100 to-gray-200 
      rounded-xl shadow-md p-6 hover:shadow-lg 
      transition-shadow duration-300">
      
      {/* Title + Icon */}
      <div className="flex justify-between items-center">
        <h1 className="text-gray-800 font-semibold text-lg">
          {loading ? (
            <div className="h-4 w-24 bg-gray-300 rounded animate-pulse"></div>
          ) : (
            title
          )}
        </h1>

        <div className="bg-white/20 p-3 rounded-lg text-xl text-gray-700 backdrop-blur-sm">
          {loading ? (
            <div className="h-5 w-5 bg-gray-300 rounded animate-pulse"></div>
          ) : (
            icon
          )}
        </div>
      </div>

      {/* Main Number */}
      <div className="mt-6">
        {loading ? (
          <div className="h-6 w-32 bg-gray-300 rounded animate-pulse"></div>
        ) : (
          <h1 className="text-2xl font-bold text-gray-900">{number}</h1>
        )}
      </div>

      {/* Decorative bar */}
      <div className="mt-4 h-1 w-16 rounded-full bg-gradient-to-r from-green-800 to-indigo-300 opacity-40"></div>
    </div>
  );
};

export default CardOne;
