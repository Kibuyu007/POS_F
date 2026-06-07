const Loading = ({ load }) => {
  if (!load) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/30 backdrop-blur-sm">
      {/* Main spinner container */}
      <div className="relative">
        {/* Outer rotating ring */}
        <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full border-4 border-gray-200 border-t-green-400 animate-spin" />
        
        {/* Inner pulsing dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-3 h-3 sm:w-4 sm:h-4 bg-green-400 rounded-full animate-pulse" />
        </div>
      </div>

      {/* Loading text */}
      <div className="mt-4 sm:mt-6 text-center">
        <p className="text-sm sm:text-base font-bold text-white animate-pulse">
          Loading...
        </p>
        <p className="text-[10px] sm:text-xs text-white/70 mt-1">
          Please wait
        </p>
      </div>

      {/* Progress bar */}
      <div className="mt-3 sm:mt-4 w-32 sm:w-48 h-1.5 sm:h-2 bg-white/20 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-green-400 via-emerald-400 to-green-300 rounded-full animate-[loadingBar_1.5s_ease-in-out_infinite]" />
      </div>
    </div>
  );
};

export default Loading;