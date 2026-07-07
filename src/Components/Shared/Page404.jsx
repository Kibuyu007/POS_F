import { Link } from "react-router-dom";
import { FaExclamationTriangle } from "react-icons/fa";

const Page404 = () => {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-emerald-900 via-teal-800 to-cyan-900 flex items-center justify-center px-4">
      {/* Animated background blobs */}
      <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-emerald-400/25 blur-3xl animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-cyan-400/25 blur-3xl animate-pulse [animation-delay:2s]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[300px] w-[300px] rounded-full bg-teal-400/20 blur-3xl animate-pulse [animation-delay:4s]" />

      {/* Glass card */}
      <div className="relative w-full max-w-lg rounded-3xl border border-white/20 bg-white/10 backdrop-blur-2xl p-10 text-center shadow-2xl transition-all duration-500 hover:scale-[1.02] hover:border-white/40 hover:shadow-[0_0_50px_rgba(52,211,153,0.2)]">
        {/* Icon with glow */}
        <div className="relative mx-auto mb-6 flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-orange-500 shadow-[0_0_60px_rgba(251,191,36,0.4)] transition-transform duration-300 hover:scale-110 hover:shadow-[0_0_80px_rgba(251,191,36,0.6)]">
          <FaExclamationTriangle size={44} className="text-white drop-shadow-lg" />
        </div>

        <h1 className="bg-gradient-to-r from-emerald-200 via-teal-100 to-cyan-200 bg-clip-text text-7xl font-extrabold text-transparent drop-shadow-[0_0_30px_rgba(52,211,153,0.2)]">
          404
        </h1>

        <h2 className="mt-4 text-3xl font-bold text-white tracking-tight">
          Page Not Found
        </h2>

        <p className="mt-3 text-emerald-100/80 text-lg leading-relaxed">
          The page you are looking for doesnt exist or has been moved.
        </p>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4">
          <Link
            to="/auth"
            className="rounded-xl border border-white/30 bg-white/5 px-8 py-3.5 font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:border-white/60 hover:bg-white/20 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] active:scale-95"
          >
            Login
          </Link>
        </div>

        {/* Subtle footer text */}
        <p className="mt-8 text-sm text-emerald-300/40">
          Error 404 — Page not found
        </p>
      </div>
    </div>
  );
};

export default Page404;