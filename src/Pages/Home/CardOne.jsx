const CardOne = ({ title, icon, number }) => {
  return (
    <div className="bg-gradient-to-r from-green-100 via-green-100 to-gray-200 rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-300 w-full sm:w-[48%] md:w-full lg:w-full">
      {/* Top section: title + icon */}
      <div className="flex justify-between items-center">
        <h1 className="text-gray-800 font-semibold text-lg">{title}</h1>
        <div className="bg-white/20 p-3 rounded-lg text-xl text-gray-700 backdrop-blur-sm">
          {icon}
        </div>
      </div>

      {/* Main number */}
      <div className="mt-6">
        <h1 className="text-2xl font-bold text-gray-900">{number}</h1>
      </div>

      {/* Decorative subtle gradient line */}
      <div className="mt-4 h-1 w-16 rounded-full bg-gradient-to-r from-green-800 to-indigo-300 opacity-40"></div>
    </div>
  );
};

export default CardOne;
