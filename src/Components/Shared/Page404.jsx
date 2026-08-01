import { Link } from "react-router-dom";
import { FaExclamationTriangle } from "react-icons/fa";

const Page404 = () => {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-green-50 flex items-center justify-center px-4">
      {/* Animated background blobs - using your emerald colors */}
      <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-emerald-400/20 blur-3xl animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-emerald-500/15 blur-3xl animate-pulse [animation-delay:2s]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[300px] w-[300px] rounded-full bg-green-400/10 blur-3xl animate-pulse [animation-delay:4s]" />

      {/* Corner gradients - matching your login page */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-gradient-to-br from-emerald-500/20 via-emerald-400/5 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-gradient-to-bl from-emerald-500/15 via-emerald-400/5 to-transparent rounded-full blur-3xl"></div>
      </div>

      {/* Glass card - with your emerald theme */}
      <div className="relative w-full max-w-lg rounded-3xl border border-emerald-200/30 bg-white/80 backdrop-blur-xl p-10 text-center shadow-2xl transition-all duration-500 hover:scale-[1.02] hover:border-emerald-300/50 hover:shadow-[0_0_50px_rgba(16,185,129,0.15)]">
        {/* Icon with glow - using emerald gradient */}
        <div className="relative mx-auto mb-6 flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-green-500 shadow-[0_0_60px_rgba(16,185,129,0.3)] transition-transform duration-300 hover:scale-110 hover:shadow-[0_0_80px_rgba(16,185,129,0.5)]">
          <FaExclamationTriangle
            size={44}
            className="text-white drop-shadow-lg"
          />
        </div>

        {/* 404 text with emerald gradient */}
        <h1 className="bg-gradient-to-r from-emerald-600 via-green-500 to-emerald-600 bg-clip-text text-7xl font-extrabold text-transparent drop-shadow-[0_0_30px_rgba(16,185,129,0.15)]">
          404
        </h1>

        {/* Page title */}
        <h2 className="mt-4 text-3xl font-bold text-gray-800 tracking-tight">
          Page Not Found
        </h2>

        {/* Description */}
        <p className="mt-3 text-gray-600 text-lg leading-relaxed">
          The page you are looking for does not exist or has been moved.
        </p>

        {/* Back to Login button - matching your login button */}
        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4">
          <Link
            to="/request"
            className="rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 px-8 py-3.5 font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:from-emerald-700 hover:to-green-700 hover:shadow-xl active:scale-95"
          >
            Back to a Safe Page
          </Link>
        </div>

        {/* Subtle footer text */}
        <p className="mt-8 text-sm text-gray-400">Error 404 — Page not found</p>

        {/* Decorative emerald dots at bottom */}
        <div className="mt-6 flex justify-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
        </div>
      </div>
    </div>
  );
};

export default Page404;
