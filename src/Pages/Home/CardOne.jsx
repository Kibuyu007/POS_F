const CardOne = ({ title, icon, number, loading, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`
        bg-gradient-to-r from-green-100 via-green-100 to-gray-200 
        rounded-xl shadow-md 
        p-3 sm:p-4 md:p-5 lg:p-6 
        hover:shadow-lg 
        transition-shadow duration-300
        min-w-0
        ${onClick ? "cursor-pointer transform hover:scale-[1.02] active:scale-95 transition-transform" : ""}
      `}
    >
      {/* Title + Icon */}
      <div className="flex justify-between items-start gap-2">
        <h1 className="text-gray-800 font-semibold text-sm sm:text-base md:text-lg truncate min-w-0 flex-1">
          {loading ? (
            <div className="h-3 sm:h-4 w-20 sm:w-28 bg-gray-700/30 rounded-full shadow-inner animate-pulse" />
          ) : (
            <span className="block truncate">{title}</span>
          )}
        </h1>

        <div className="bg-white/20 p-2 sm:p-2.5 md:p-3 rounded-lg text-base sm:text-lg md:text-xl text-gray-700 backdrop-blur-sm flex-shrink-0">
          {loading ? (
            <div className="h-5 w-5 sm:h-6 sm:w-6 bg-gray-700/25 rounded-lg shadow-inner animate-pulse" />
          ) : (
            icon
          )}
        </div>
      </div>

      {/* Main Number */}
      <div className="mt-3 sm:mt-4 md:mt-6">
        {loading ? (
          <div className="space-y-2">
            <div className="h-6 sm:h-7 w-32 sm:w-44 bg-gray-700/35 rounded-lg shadow-inner animate-pulse" />
            <div className="h-3 sm:h-4 w-20 sm:w-28 bg-gray-700/20 rounded-full shadow-inner animate-pulse" />
          </div>
        ) : (
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 truncate">
            {number}
          </h1>
        )}
      </div>

      {/* Decorative bar */}
      {!loading && (
        <div className="mt-3 sm:mt-4 h-1 w-12 sm:w-16 rounded-full bg-gradient-to-r from-green-800 to-indigo-300 opacity-40" />
      )}
    </div>
  );
};

export default CardOne;
