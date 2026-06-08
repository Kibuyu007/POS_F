const Loading = ({ load, message = "Loading..." }) => {
  if (!load) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/40 backdrop-blur-md">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-green-400/30 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
        <div className="absolute top-1/3 right-1/4 w-1.5 h-1.5 bg-emerald-400/40 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
        <div className="absolute bottom-1/3 left-1/3 w-2.5 h-2.5 bg-green-300/20 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
        <div className="absolute bottom-1/4 right-1/3 w-1 h-1 bg-emerald-300/50 rounded-full animate-bounce" style={{ animationDelay: '0.6s' }} />
      </div>

      {/* Main loader container */}
      <div className="relative flex flex-col items-center">
        {/* Outer glow ring */}
        <div className="absolute inset-0 w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 -m-2 sm:-m-3 md:-m-4 rounded-full bg-green-400/20 animate-ping" />
        
        {/* Spinner rings */}
        <div className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24">
          {/* Ring 1 - Slow outer */}
          <div className="absolute inset-0 rounded-full border-2 sm:border-3 border-gray-200/30 border-t-green-400 animate-[spin_2s_linear_infinite]" />
          
          {/* Ring 2 - Medium middle */}
          <div className="absolute inset-1 sm:inset-1.5 md:inset-2 rounded-full border-2 sm:border-3 border-gray-200/20 border-r-emerald-400 animate-[spin_1.5s_linear_infinite_reverse]" />
          
          {/* Ring 3 - Fast inner */}
          <div className="absolute inset-2 sm:inset-3 md:inset-4 rounded-full border-2 sm:border-3 border-gray-200/10 border-b-green-300 animate-[spin_1s_linear_infinite]" />
          
          {/* Center core */}
          <div className="absolute inset-4 sm:inset-5 md:inset-6 flex items-center justify-center">
            <div className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(74,222,128,0.6)]" />
          </div>
        </div>

        {/* Brand text */}
        <div className="mt-6 sm:mt-8 text-center space-y-2">
          <h2 className="text-lg sm:text-xl md:text-2xl font-black text-white tracking-wider uppercase">
            {message}
          </h2>
          
          {/* Animated dots */}
          <div className="flex items-center justify-center gap-1">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-[bounce_0.6s_infinite]" style={{ animationDelay: '0s' }} />
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-[bounce_0.6s_infinite]" style={{ animationDelay: '0.15s' }} />
            <span className="w-2 h-2 bg-green-300 rounded-full animate-[bounce_0.6s_infinite]" style={{ animationDelay: '0.3s' }} />
          </div>
          
          <p className="text-[10px] sm:text-xs text-white/50 font-medium tracking-widest uppercase">
            Please wait while we prepare your data
          </p>
        </div>

        {/* Progress bar with percentage */}
        <div className="mt-4 sm:mt-6 w-48 sm:w-56 md:w-64">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] sm:text-xs text-white/60 font-semibold">Processing</span>
            <span className="text-[10px] sm:text-xs text-green-400 font-bold animate-pulse">Loading...</span>
          </div>
          <div className="h-1.5 sm:h-2 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm">
            <div className="h-full bg-gradient-to-r from-green-400 via-emerald-400 to-green-300 rounded-full animate-[loadingBar_2s_ease-in-out_infinite] shadow-[0_0_10px_rgba(74,222,128,0.5)]" />
          </div>
        </div>
      </div>

      {/* Corner decoration */}
      <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
        <div className="w-8 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <span className="text-[9px] sm:text-[10px] text-white/30 font-medium tracking-widest">POS SYSTEM</span>
        <div className="w-8 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      </div>
    </div>
  );
};

export default Loading;