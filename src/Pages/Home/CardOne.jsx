const CardOne = ({ title, icon, footerNum, number }) => {
  return (
    <div className="bg-[#d6d6d6] py-5 px-5 rounded-lg w-full sm:w-[48%] md:w-[32%] lg:w-[24%] xl:w-[100%] shadow-md md:flex-col-3">
      <div className="flex items-start justify-between">
        <h1 className="text-black text-lg font-bold tracking-wide">{title}</h1>
        <button
          className={`${title === "Card One 1" ? "bg-GreenText" : "bg-white"} p-3 text-2xl rounded-lg`}
        >
          {icon}
        </button>
      </div>

      <div>
        <h1 className="text-black text-5xl font-bold mt-5">{number}</h1>
        <h1 className="text-black font-bold text-2xl">
          <span className="text-GreenText">{footerNum}%</span>
        </h1>
      </div>
    </div>
  );
};

export default CardOne;
