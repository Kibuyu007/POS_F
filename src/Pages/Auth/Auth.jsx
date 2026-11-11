import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { loginSuccess, logoutSuccess } from "../../Redux/userSlice";
import BASE_URL from "./../../Utils/config";

const Login = () => {
  const [userLogin, setUserLogin] = useState({
    userName: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [loginSuccessfuly, setLoginSuccessfuly] = useState("");
  const [loginError, setLoginError] = useState("");

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const usernameRef = useRef(null);

  useEffect(() => {
    usernameRef.current?.focus();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const token = localStorage.getItem("token");
      if (token) {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const expiry = payload.exp * 1000;
        if (Date.now() > expiry) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          dispatch(loginSuccess(null));
          navigate("/login");
        }
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [dispatch, navigate]);

  const handleChange = (e) => {
    setUserLogin({ ...userLogin, [e.target.name]: e.target.value });
  };

  const handleLogout = async () => {
    try {
      await axios.get(`${BASE_URL}/api/auth/logout`, {
        withCredentials: true,
      });
      dispatch(logoutSuccess());
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("exp");
      navigate("/auth");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLoginSuccessfuly("");
    setLoginError("");

    try {
      const res = await axios.post(`${BASE_URL}/api/auth/login`, userLogin, {
        withCredentials: true,
      });

      const token = res.data.token;
      const user = res.data.user;
      const decoded = jwtDecode(token);
      const expirationTime = decoded.exp * 1000;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("exp", expirationTime);

      dispatch(loginSuccess({ token, user }));

      setTimeout(() => {
        handleLogout();
      }, expirationTime - Date.now());

      navigate("/home");
    } catch (err) {
      setLoginError(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const MobilePOSIcon = () => (
    <svg
      className="w-12 h-12 text-emerald-600"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
      />
    </svg>
  );

  const TabletPOSIcon = () => (
    <svg viewBox="0 0 300 250" className="w-48 h-auto">
      <circle cx="150" cy="125" r="120" fill="#10B981" fillOpacity="0.04" />
      <circle cx="150" cy="125" r="90" fill="#10B981" fillOpacity="0.06" />
      <rect
        x="60"
        y="40"
        width="160"
        height="120"
        rx="10"
        fill="#10B981"
        fillOpacity="0.12"
        stroke="#10B981"
        strokeWidth="1.5"
      />
      <rect
        x="68"
        y="48"
        width="144"
        height="104"
        rx="6"
        fill="white"
        stroke="#10B981"
        strokeWidth="1"
      />
      <rect
        x="76"
        y="56"
        width="128"
        height="16"
        rx="4"
        fill="#10B981"
        fillOpacity="0.08"
      />
      <rect
        x="76"
        y="78"
        width="80"
        height="8"
        rx="3"
        fill="#10B981"
        fillOpacity="0.2"
      />
      <rect
        x="76"
        y="92"
        width="60"
        height="8"
        rx="3"
        fill="#10B981"
        fillOpacity="0.15"
      />
      <rect
        x="76"
        y="106"
        width="70"
        height="8"
        rx="3"
        fill="#10B981"
        fillOpacity="0.15"
      />
      <rect
        x="76"
        y="120"
        width="50"
        height="8"
        rx="3"
        fill="#10B981"
        fillOpacity="0.15"
      />
      <rect
        x="164"
        y="78"
        width="32"
        height="8"
        rx="3"
        fill="#10B981"
        fillOpacity="0.25"
      />
      <rect
        x="164"
        y="92"
        width="28"
        height="8"
        rx="3"
        fill="#10B981"
        fillOpacity="0.2"
      />
      <rect
        x="164"
        y="106"
        width="35"
        height="8"
        rx="3"
        fill="#10B981"
        fillOpacity="0.2"
      />
      <rect
        x="164"
        y="120"
        width="25"
        height="8"
        rx="3"
        fill="#10B981"
        fillOpacity="0.2"
      />
      <rect
        x="76"
        y="134"
        width="40"
        height="10"
        rx="4"
        fill="#10B981"
        fillOpacity="0.15"
      />
      <rect
        x="164"
        y="134"
        width="55"
        height="10"
        rx="4"
        fill="#10B981"
        fillOpacity="0.35"
      />
      <rect
        x="130"
        y="160"
        width="20"
        height="10"
        rx="3"
        fill="#10B981"
        fillOpacity="0.15"
      />
      <rect
        x="122"
        y="170"
        width="36"
        height="6"
        rx="3"
        fill="#10B981"
        fillOpacity="0.1"
      />
      <rect
        x="116"
        y="176"
        width="48"
        height="8"
        rx="4"
        fill="#10B981"
        fillOpacity="0.2"
      />
      <rect
        x="90"
        y="192"
        width="100"
        height="30"
        rx="6"
        fill="#10B981"
        fillOpacity="0.08"
        stroke="#10B981"
        strokeWidth="1"
      />
      <rect
        x="100"
        y="198"
        width="30"
        height="18"
        rx="3"
        fill="#10B981"
        fillOpacity="0.1"
      />
      <circle cx="150" cy="204" r="4" fill="#10B981" fillOpacity="0.2" />
      <circle cx="150" cy="214" r="4" fill="#10B981" fillOpacity="0.15" />
      <circle cx="162" cy="204" r="4" fill="#10B981" fillOpacity="0.15" />
      <circle cx="162" cy="214" r="4" fill="#10B981" fillOpacity="0.1" />
      <circle cx="174" cy="204" r="4" fill="#10B981" fillOpacity="0.1" />
      <circle cx="174" cy="214" r="4" fill="#10B981" fillOpacity="0.08" />
      <circle cx="40" cy="80" r="4" fill="#10B981" fillOpacity="0.1" />
      <circle cx="250" cy="100" r="4" fill="#10B981" fillOpacity="0.1" />
    </svg>
  );

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col">
      {/* ═══════════════════════════════════════════════════════════
          AFRICAN SKETCHES — bold, visible line-art SVGs
          ═══════════════════════════════════════════════════════════ */}

      {/* Warm sand canvas */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#fdf6ec] via-[#f5e9d5] to-[#e8d4b8]" />

      {/* ─── Sketch layer — bold African line art ─── */}
      <svg
        className="absolute inset-0 w-full h-full"
        preserveAspectRatio="xMidYMid slice"
        viewBox="0 0 1200 800"
        fill="none"
        stroke="#8b4513"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.42"
      >
        {/* ── 1. ACACIA TREE (savanna) — top left, bigger ── */}
        <g transform="translate(140, 160) scale(1.4)">
          <path d="M0,90 L0,40" strokeWidth="3" />
          <path d="M0,40 Q-25,20 -35,0" strokeWidth="2.5" />
          <path d="M0,40 Q25,20 40,-3" strokeWidth="2.5" />
          <path d="M0,40 Q-8,22 -12,5" strokeWidth="2.5" />
          <path d="M0,40 Q12,22 18,5" strokeWidth="2.5" />
          {/* Wide flat canopy */}
          <path
            d="M-50,-8 Q-40,-22 -15,-18 Q10,-25 45,-10 Q40,-2 10,-5 Q-20,-8 -50,-8 Z"
            fill="#8b4513"
            fillOpacity="0.25"
          />
          <path d="M-50,-8 Q-40,-22 -15,-18 Q10,-25 45,-10" strokeWidth="2.5" />
          <path d="M-10,5 L-10,90" strokeWidth="3" />
          <line x1="-60" y1="90" x2="60" y2="90" strokeWidth="2" />
        </g>

        {/* ── 2. MAASAI SHIELD (with spears) — top right, bigger ── */}
        <g transform="translate(1050, 170) scale(1.4)">
          <ellipse
            cx="0"
            cy="0"
            rx="40"
            ry="60"
            strokeWidth="3"
            fill="#8b4513"
            fillOpacity="0.08"
          />
          <ellipse cx="0" cy="0" rx="26" ry="46" strokeWidth="2.5" />
          <ellipse cx="0" cy="0" rx="14" ry="30" strokeWidth="2" />
          {/* Central spear */}
          <line x1="0" y1="-70" x2="0" y2="70" strokeWidth="2.5" />
          {/* Horizontal spear bands */}
          <line x1="-28" y1="-20" x2="28" y2="-20" strokeWidth="2" />
          <line x1="-28" y1="20" x2="28" y2="20" strokeWidth="2" />
          {/* Crossed spears behind */}
          <line x1="-45" y1="-60" x2="45" y2="60" strokeWidth="2" />
          <line x1="45" y1="-60" x2="-45" y2="60" strokeWidth="2" />
        </g>

        {/* ── 3. DJEMBE DRUM — bottom left, bigger ── */}
        <g transform="translate(160, 640) scale(1.5)">
          <path
            d="M-22,-40 Q-38,-28 -36,-2 Q-32,30 -22,44 L22,44 Q32,30 36,-2 Q38,-28 22,-40 Z"
            strokeWidth="3"
            fill="#8b4513"
            fillOpacity="0.1"
          />
          <ellipse cx="0" cy="-40" rx="22" ry="8" strokeWidth="2.5" />
          <path d="M-22,-20 Q0,-14 22,-20" strokeWidth="2" />
          <path d="M-26,5 Q0,12 26,5" strokeWidth="2" />
          <path d="M-22,28 Q0,34 22,28" strokeWidth="2" />
          {/* Tension cords */}
          <line x1="-22" y1="-40" x2="-18" y2="-15" strokeWidth="1.5" />
          <line x1="-11" y1="-40" x2="-9" y2="-15" strokeWidth="1.5" />
          <line x1="0" y1="-40" x2="0" y2="-15" strokeWidth="1.5" />
          <line x1="11" y1="-40" x2="9" y2="-15" strokeWidth="1.5" />
          <line x1="22" y1="-40" x2="18" y2="-15" strokeWidth="1.5" />
        </g>

        {/* ── 4. ADINKRA GYE NYAME — bottom right, bigger ── */}
        <g transform="translate(1040, 650) scale(1.5)">
          <path
            d="M0,-40 Q-18,-45 -24,-28 Q-30,-10 -14,2 Q-5,9 -5,20 Q-5,34 12,36 Q26,38 32,22 Q38,6 24,-6 Q16,-14 16,-26 Q16,-38 5,-40"
            strokeWidth="3"
          />
          <path
            d="M0,-24 Q-10,-26 -13,-14 Q-15,-3 -4,4 Q3,8 3,16 Q3,26 14,26 Q24,26 26,14 Q27,4 18,-2 Q12,-8 12,-18 Q12,-26 4,-26"
            strokeWidth="2.5"
          />
        </g>

        {/* ── 5. SUN WITH RAYS — top center, bigger ── */}
        <g transform="translate(600, 90) scale(1.3)">
          <circle
            cx="0"
            cy="0"
            r="28"
            strokeWidth="3"
            fill="#8b4513"
            fillOpacity="0.12"
          />
          {[...Array(16)].map((_, i) => {
            const angle = (i * 22.5 * Math.PI) / 180;
            const x1 = Math.cos(angle) * 38;
            const y1 = Math.sin(angle) * 38;
            const x2 = Math.cos(angle) * 54;
            const y2 = Math.sin(angle) * 54;
            return (
              <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth="2.5" />
            );
          })}
        </g>

        {/* ── 6. KENTE GEOMETRIC BAND — bottom center ── */}
        <g transform="translate(430, 750) scale(1.4)" strokeWidth="2.5">
          {[...Array(12)].map((_, i) => (
            <g key={i} transform={`translate(${i * 26}, 0)`}>
              <rect x="0" y="0" width="16" height="16" />
              <line x1="0" y1="0" x2="16" y2="16" />
              <line x1="16" y1="0" x2="0" y2="16" />
            </g>
          ))}
        </g>

        {/* ── 7. SANKOFA BIRD — mid left, bigger ── */}
        <g transform="translate(90, 420) scale(1.3)">
          <path
            d="M0,0 Q-14,-20 0,-34 Q20,-44 38,-30 Q48,-20 42,-6"
            strokeWidth="3"
            fill="#8b4513"
            fillOpacity="0.1"
          />
          <path d="M0,0 Q-20,7 -28,28 Q-20,20 -8,14" strokeWidth="2.5" />
          <path d="M42,-6 Q52,8 48,22" strokeWidth="2.5" />
          <circle cx="28" cy="-26" r="2.5" fill="#8b4513" />
          {/* Tail feathers */}
          <path d="M-8,14 Q-14,26 -10,36" strokeWidth="2" />
          <path d="M-4,12 Q-8,26 -4,38" strokeWidth="2" />
        </g>

        {/* ── 8. CALABASH BOWL — mid right ── */}
        <g transform="translate(1120, 430) scale(1.4)">
          <path
            d="M-38,0 Q-50,24 -40,44 Q-28,60 0,60 Q28,60 40,44 Q50,24 38,0 Q28,-10 0,-10 Q-28,-10 -38,0 Z"
            strokeWidth="3"
            fill="#8b4513"
            fillOpacity="0.1"
          />
          <path d="M-40,-2 Q0,-18 40,-2" strokeWidth="2.5" />
          <path d="M-24,22 Q0,30 24,22" strokeWidth="2" />
          <path d="M-28,40 Q0,48 28,40" strokeWidth="2" />
        </g>
      </svg>

      {/* Soft white wash so UI cards stay clean */}
      <div className="absolute inset-0 bg-white/55" />

      {/* Emerald + amber corner glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-80 -left-80 w-[1000px] h-[1000px] bg-gradient-to-br from-emerald-500/18 via-emerald-400/8 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute -top-80 -right-80 w-[1000px] h-[1000px] bg-gradient-to-bl from-emerald-500/15 via-emerald-400/8 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute -bottom-80 -left-80 w-[800px] h-[800px] bg-gradient-to-tr from-amber-500/12 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute -bottom-80 -right-80 w-[800px] h-[800px] bg-gradient-to-tl from-emerald-300/10 to-transparent rounded-full blur-3xl"></div>
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(25)].map((_, i) => (
          <div
            key={i}
            className="absolute top-0 w-1 h-1 bg-emerald-600/30 rounded-full animate-bg-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${8 + Math.random() * 12}s`,
              opacity: 0.2 + Math.random() * 0.3,
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-20 relative z-10">
        {/* Mobile Layout */}
        <div className="lg:hidden w-full max-w-sm mx-auto">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-green-100 rounded-2xl flex items-center justify-center shadow-lg">
                <MobilePOSIcon />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">POS System</h2>
            <p className="text-emerald-600 text-sm mt-1">
              Secure login to continue
            </p>
          </div>

          <div className="relative py-3 w-full">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-green-600 shadow-xl transform -skew-y-3 sm:skew-y-0 rounded-3xl opacity-60"></div>
            <div className="relative px-4 py-8 bg-white/95 backdrop-blur-sm shadow-2xl rounded-2xl">
              <form onSubmit={handleLogin} className="w-full">
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-600">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <input
                    ref={usernameRef}
                    className="w-full pl-10 pr-4 py-3 rounded-lg font-semibold bg-gray-100 border-2 border-gray-200 placeholder-gray-500 text-base focus:outline-none focus:border-emerald-500 focus:bg-white transition-all duration-300"
                    type="text"
                    name="userName"
                    value={userLogin.userName}
                    onChange={handleChange}
                    placeholder="Username"
                  />
                </div>
                <div className="relative mt-4 group">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-600">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                  <input
                    className="w-full pl-10 pr-4 py-3 rounded-lg font-semibold bg-gray-100 border-2 border-gray-200 placeholder-gray-500 text-base focus:outline-none focus:border-green-500 focus:bg-white transition-all duration-300"
                    type="password"
                    name="password"
                    value={userLogin.password}
                    onChange={handleChange}
                    placeholder="Password"
                  />
                </div>
                <button
                  type="submit"
                  className="mt-6 tracking-wide font-bold bg-gradient-to-r from-emerald-600 to-green-600 text-white w-full py-3 rounded-lg hover:from-emerald-700 hover:to-green-700 transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                      <span>Logging in...</span>
                    </>
                  ) : (
                    <>
                      <span className="mr-2">→</span>
                      <span className="font-semibold">Sign In</span>
                      <span className="ml-2">←</span>
                    </>
                  )}
                </button>
                {loginSuccessfuly && (
                  <div className="mt-3 p-2.5 bg-emerald-100 border-2 border-emerald-400 text-emerald-800 text-center rounded-lg text-sm">
                    ✓ {loginSuccessfuly}
                  </div>
                )}
                {loginError && (
                  <div className="mt-3 p-2.5 bg-red-100 border-2 border-red-400 text-red-600 text-center rounded-lg text-sm">
                    ✗ {loginError}
                  </div>
                )}
              </form>
            </div>
          </div>

          <div className="mt-6 flex justify-center">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
              <div
                className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"
                style={{ animationDelay: "0.2s" }}
              ></div>
              <div
                className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-pulse"
                style={{ animationDelay: "0.4s" }}
              ></div>
              <span className="text-xs ml-1 text-gray-600 font-medium">
                🔐 Secure
              </span>
            </div>
          </div>
        </div>

        {/* Tablet Layout */}
        <div className="hidden lg:hidden xl:hidden w-full max-w-2xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="w-full md:w-1/2 flex justify-center">
              <TabletPOSIcon />
            </div>
            <div className="w-full md:w-1/2">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  Welcome Back
                </h2>
                <p className="text-emerald-600 text-sm mt-1">
                  Sign in to your account
                </p>
              </div>
              <div className="relative py-3 w-full">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-green-600 shadow-xl transform -skew-y-3 rounded-3xl opacity-60"></div>
                <div className="relative px-5 py-8 bg-white/95 backdrop-blur-sm shadow-2xl rounded-2xl">
                  <form onSubmit={handleLogin} className="w-full">
                    <div className="relative group">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-600">
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      </div>
                      <input
                        ref={usernameRef}
                        className="w-full pl-10 pr-4 py-3.5 rounded-lg font-semibold bg-gray-100 border-2 border-gray-200 placeholder-gray-500 text-base focus:outline-none focus:border-emerald-500 focus:bg-white transition-all duration-300"
                        type="text"
                        name="userName"
                        value={userLogin.userName}
                        onChange={handleChange}
                        placeholder="Username"
                      />
                    </div>
                    <div className="relative mt-4 group">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-600">
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                          />
                        </svg>
                      </div>
                      <input
                        className="w-full pl-10 pr-4 py-3.5 rounded-lg font-semibold bg-gray-100 border-2 border-gray-200 placeholder-gray-500 text-base focus:outline-none focus:border-green-500 focus:bg-white transition-all duration-300"
                        type="password"
                        name="password"
                        value={userLogin.password}
                        onChange={handleChange}
                        placeholder="Password"
                      />
                    </div>
                    <button
                      type="submit"
                      className="mt-6 tracking-wide font-bold bg-gradient-to-r from-emerald-600 to-green-600 text-white w-full py-3.5 rounded-lg hover:from-emerald-700 hover:to-green-700 transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                          <span>Logging in...</span>
                        </>
                      ) : (
                        <>
                          <span className="mr-2">→</span>
                          <span className="font-semibold">Sign In</span>
                          <span className="ml-2">←</span>
                        </>
                      )}
                    </button>
                    {loginSuccessfuly && (
                      <div className="mt-3 p-2.5 bg-emerald-100 border-2 border-emerald-400 text-emerald-800 text-center rounded-lg text-sm">
                        ✓ {loginSuccessfuly}
                      </div>
                    )}
                    {loginError && (
                      <div className="mt-3 p-2.5 bg-red-100 border-2 border-red-400 text-red-600 text-center rounded-lg text-sm">
                        ✗ {loginError}
                      </div>
                    )}
                  </form>
                </div>
              </div>
              <div className="mt-4 flex justify-center">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
                  <div
                    className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                  <div
                    className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-pulse"
                    style={{ animationDelay: "0.4s" }}
                  ></div>
                  <span className="text-xs ml-1 text-gray-600 font-medium">
                    🔐 Secure Connection
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden xl:flex w-full items-center justify-between">
          <div className="w-1/2 flex items-center justify-center">
            <div className="relative">
              <svg viewBox="0 0 500 450" className="w-[400px] h-auto">
                <circle
                  cx="250"
                  cy="225"
                  r="200"
                  fill="#10B981"
                  fillOpacity="0.03"
                />
                <circle
                  cx="250"
                  cy="225"
                  r="160"
                  fill="#10B981"
                  fillOpacity="0.05"
                />
                <circle
                  cx="250"
                  cy="225"
                  r="120"
                  fill="#10B981"
                  fillOpacity="0.07"
                />
                <rect
                  x="100"
                  y="60"
                  width="280"
                  height="200"
                  rx="16"
                  fill="#10B981"
                  fillOpacity="0.12"
                  stroke="#10B981"
                  strokeWidth="2"
                />
                <rect
                  x="110"
                  y="70"
                  width="260"
                  height="180"
                  rx="10"
                  fill="white"
                  stroke="#10B981"
                  strokeWidth="1.5"
                />
                <rect
                  x="110"
                  y="70"
                  width="260"
                  height="35"
                  rx="10"
                  fill="#10B981"
                  fillOpacity="0.08"
                />
                <rect
                  x="110"
                  y="95"
                  width="260"
                  height="10"
                  fill="#10B981"
                  fillOpacity="0.08"
                />
                <circle
                  cx="130"
                  cy="87"
                  r="4"
                  fill="#10B981"
                  fillOpacity="0.4"
                />
                <circle
                  cx="145"
                  cy="87"
                  r="4"
                  fill="#10B981"
                  fillOpacity="0.3"
                />
                <circle
                  cx="160"
                  cy="87"
                  r="4"
                  fill="#10B981"
                  fillOpacity="0.2"
                />
                <rect
                  x="200"
                  y="84"
                  width="40"
                  height="6"
                  rx="3"
                  fill="#10B981"
                  fillOpacity="0.2"
                />
                <rect
                  x="330"
                  y="82"
                  width="20"
                  height="10"
                  rx="2"
                  fill="#10B981"
                  fillOpacity="0.15"
                  stroke="#10B981"
                  strokeWidth="1"
                />
                <rect
                  x="350"
                  y="85"
                  width="3"
                  height="4"
                  rx="1"
                  fill="#10B981"
                  fillOpacity="0.2"
                />
                <rect
                  x="120"
                  y="115"
                  width="100"
                  height="12"
                  rx="4"
                  fill="#10B981"
                  fillOpacity="0.2"
                />
                <rect
                  x="120"
                  y="133"
                  width="80"
                  height="8"
                  rx="3"
                  fill="#10B981"
                  fillOpacity="0.15"
                />
                <rect
                  x="120"
                  y="147"
                  width="90"
                  height="8"
                  rx="3"
                  fill="#10B981"
                  fillOpacity="0.15"
                />
                <rect
                  x="120"
                  y="161"
                  width="70"
                  height="8"
                  rx="3"
                  fill="#10B981"
                  fillOpacity="0.15"
                />
                <rect
                  x="120"
                  y="175"
                  width="85"
                  height="8"
                  rx="3"
                  fill="#10B981"
                  fillOpacity="0.15"
                />
                <rect
                  x="120"
                  y="189"
                  width="75"
                  height="8"
                  rx="3"
                  fill="#10B981"
                  fillOpacity="0.15"
                />
                <rect
                  x="230"
                  y="115"
                  width="50"
                  height="12"
                  rx="4"
                  fill="#10B981"
                  fillOpacity="0.3"
                />
                <rect
                  x="240"
                  y="133"
                  width="30"
                  height="8"
                  rx="3"
                  fill="#10B981"
                  fillOpacity="0.2"
                />
                <rect
                  x="240"
                  y="147"
                  width="35"
                  height="8"
                  rx="3"
                  fill="#10B981"
                  fillOpacity="0.2"
                />
                <rect
                  x="240"
                  y="161"
                  width="25"
                  height="8"
                  rx="3"
                  fill="#10B981"
                  fillOpacity="0.2"
                />
                <rect
                  x="240"
                  y="175"
                  width="35"
                  height="8"
                  rx="3"
                  fill="#10B981"
                  fillOpacity="0.2"
                />
                <rect
                  x="240"
                  y="189"
                  width="28"
                  height="8"
                  rx="3"
                  fill="#10B981"
                  fillOpacity="0.2"
                />
                <rect
                  x="120"
                  y="215"
                  width="60"
                  height="14"
                  rx="4"
                  fill="#10B981"
                  fillOpacity="0.15"
                />
                <rect
                  x="230"
                  y="215"
                  width="90"
                  height="14"
                  rx="4"
                  fill="#10B981"
                  fillOpacity="0.35"
                />
                <rect
                  x="120"
                  y="240"
                  width="35"
                  height="8"
                  rx="3"
                  fill="#10B981"
                  fillOpacity="0.2"
                />
                <rect
                  x="165"
                  y="240"
                  width="35"
                  height="8"
                  rx="3"
                  fill="#10B981"
                  fillOpacity="0.2"
                />
                <rect
                  x="210"
                  y="240"
                  width="35"
                  height="8"
                  rx="3"
                  fill="#10B981"
                  fillOpacity="0.3"
                />
                <rect
                  x="255"
                  y="240"
                  width="35"
                  height="8"
                  rx="3"
                  fill="#10B981"
                  fillOpacity="0.2"
                />
                <rect
                  x="220"
                  y="260"
                  width="30"
                  height="15"
                  rx="4"
                  fill="#10B981"
                  fillOpacity="0.15"
                />
                <rect
                  x="210"
                  y="275"
                  width="50"
                  height="8"
                  rx="4"
                  fill="#10B981"
                  fillOpacity="0.1"
                />
                <rect
                  x="200"
                  y="283"
                  width="70"
                  height="10"
                  rx="5"
                  fill="#10B981"
                  fillOpacity="0.2"
                />
                <rect
                  x="160"
                  y="305"
                  width="150"
                  height="45"
                  rx="8"
                  fill="#10B981"
                  fillOpacity="0.08"
                  stroke="#10B981"
                  strokeWidth="1.5"
                />
                <rect
                  x="175"
                  y="312"
                  width="50"
                  height="30"
                  rx="4"
                  fill="#10B981"
                  fillOpacity="0.1"
                  stroke="#10B981"
                  strokeWidth="1"
                />
                <text
                  x="188"
                  y="332"
                  fontSize="10"
                  fill="#10B981"
                  fillOpacity="0.4"
                >
                  $0.00
                </text>
                <circle
                  cx="250"
                  cy="320"
                  r="6"
                  fill="#10B981"
                  fillOpacity="0.2"
                />
                <circle
                  cx="250"
                  cy="335"
                  r="6"
                  fill="#10B981"
                  fillOpacity="0.15"
                />
                <circle
                  cx="265"
                  cy="320"
                  r="6"
                  fill="#10B981"
                  fillOpacity="0.15"
                />
                <circle
                  cx="265"
                  cy="335"
                  r="6"
                  fill="#10B981"
                  fillOpacity="0.1"
                />
                <circle
                  cx="280"
                  cy="320"
                  r="6"
                  fill="#10B981"
                  fillOpacity="0.1"
                />
                <circle
                  cx="280"
                  cy="335"
                  r="6"
                  fill="#10B981"
                  fillOpacity="0.08"
                />
                <rect
                  x="315"
                  y="315"
                  width="15"
                  height="25"
                  rx="3"
                  fill="#10B981"
                  fillOpacity="0.1"
                  stroke="#10B981"
                  strokeWidth="1"
                />
                <rect
                  x="319"
                  y="320"
                  width="7"
                  height="4"
                  rx="1"
                  fill="#10B981"
                  fillOpacity="0.2"
                />
                <rect
                  x="319"
                  y="328"
                  width="7"
                  height="4"
                  rx="1"
                  fill="#10B981"
                  fillOpacity="0.15"
                />
                <rect
                  x="319"
                  y="336"
                  width="7"
                  height="4"
                  rx="1"
                  fill="#10B981"
                  fillOpacity="0.1"
                />
                <rect
                  x="90"
                  y="360"
                  width="80"
                  height="35"
                  rx="6"
                  fill="#10B981"
                  fillOpacity="0.08"
                  stroke="#10B981"
                  strokeWidth="1.5"
                />
                <rect
                  x="100"
                  y="368"
                  width="60"
                  height="4"
                  rx="2"
                  fill="#10B981"
                  fillOpacity="0.2"
                />
                <rect
                  x="100"
                  y="376"
                  width="60"
                  height="4"
                  rx="2"
                  fill="#10B981"
                  fillOpacity="0.15"
                />
                <rect
                  x="105"
                  y="395"
                  width="50"
                  height="8"
                  rx="1"
                  fill="#10B981"
                  fillOpacity="0.15"
                />
                <rect
                  x="105"
                  y="405"
                  width="45"
                  height="6"
                  rx="1"
                  fill="#10B981"
                  fillOpacity="0.1"
                />
                <rect
                  x="105"
                  y="413"
                  width="48"
                  height="6"
                  rx="1"
                  fill="#10B981"
                  fillOpacity="0.07"
                />
                <rect
                  x="105"
                  y="421"
                  width="40"
                  height="6"
                  rx="1"
                  fill="#10B981"
                  fillOpacity="0.05"
                />
                <circle
                  cx="50"
                  cy="100"
                  r="8"
                  fill="#10B981"
                  fillOpacity="0.08"
                />
                <circle
                  cx="50"
                  cy="130"
                  r="5"
                  fill="#10B981"
                  fillOpacity="0.06"
                />
                <circle
                  cx="440"
                  cy="120"
                  r="8"
                  fill="#10B981"
                  fillOpacity="0.08"
                />
                <circle
                  cx="440"
                  cy="150"
                  r="5"
                  fill="#10B981"
                  fillOpacity="0.06"
                />
                <circle
                  cx="70"
                  cy="250"
                  r="4"
                  fill="#10B981"
                  fillOpacity="0.15"
                >
                  <animate
                    attributeName="opacity"
                    values="0.15;0.3;0.15"
                    dur="2s"
                    repeatCount="indefinite"
                  />
                </circle>
                <circle
                  cx="420"
                  cy="280"
                  r="4"
                  fill="#10B981"
                  fillOpacity="0.15"
                >
                  <animate
                    attributeName="opacity"
                    values="0.15;0.3;0.15"
                    dur="2.5s"
                    repeatCount="indefinite"
                  />
                </circle>
                <rect
                  x="420"
                  y="180"
                  width="45"
                  height="22"
                  rx="4"
                  fill="#10B981"
                  fillOpacity="0.08"
                  stroke="#10B981"
                  strokeWidth="1"
                />
                <text
                  x="428"
                  y="195"
                  fontSize="9"
                  fill="#10B981"
                  fillOpacity="0.3"
                >
                  $29.99
                </text>
                <rect
                  x="420"
                  y="210"
                  width="40"
                  height="22"
                  rx="4"
                  fill="#10B981"
                  fillOpacity="0.08"
                  stroke="#10B981"
                  strokeWidth="1"
                />
                <text
                  x="427"
                  y="225"
                  fontSize="9"
                  fill="#10B981"
                  fillOpacity="0.3"
                >
                  $14.99
                </text>
                <rect
                  x="30"
                  y="200"
                  width="45"
                  height="22"
                  rx="4"
                  fill="#10B981"
                  fillOpacity="0.08"
                  stroke="#10B981"
                  strokeWidth="1"
                />
                <text
                  x="38"
                  y="215"
                  fontSize="9"
                  fill="#10B981"
                  fillOpacity="0.3"
                >
                  $9.99
                </text>
              </svg>
            </div>
          </div>
          <div className="w-1/2 flex items-center justify-center">
            <div className="w-full max-w-md">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-800">
                  Welcome Back
                </h2>
                <p className="text-emerald-600 text-sm mt-1">
                  Sign in to your account
                </p>
              </div>
              <div className="relative py-3 w-full">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-green-600 shadow-xl transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl opacity-70"></div>
                <div className="relative px-4 py-10 bg-white/95 backdrop-blur-sm shadow-2xl rounded-2xl sm:rounded-3xl sm:p-20">
                  <form onSubmit={handleLogin} className="w-full">
                    <div className="relative group">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-600 group-focus-within:text-emerald-700 transition-colors">
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      </div>
                      <input
                        ref={usernameRef}
                        className="w-full pl-12 pr-6 py-4 rounded-lg font-bold bg-gray-100 border-2 border-gray-200 placeholder-gray-600 text-lg focus:outline-none focus:border-emerald-500 focus:bg-white focus:shadow-md transition-all duration-300"
                        type="text"
                        name="userName"
                        value={userLogin.userName}
                        onChange={handleChange}
                        placeholder="Username"
                      />
                    </div>
                    <div className="relative mt-5 group">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-600 group-focus-within:text-emerald-700 transition-colors">
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                          />
                        </svg>
                      </div>
                      <input
                        className="w-full pl-12 pr-6 py-4 rounded-lg font-bold bg-gray-100 border-2 border-gray-200 placeholder-gray-600 text-lg focus:outline-none focus:border-green-500 focus:bg-white focus:shadow-md transition-all duration-300"
                        type="password"
                        name="password"
                        value={userLogin.password}
                        onChange={handleChange}
                        placeholder="Password"
                      />
                    </div>
                    <button
                      type="submit"
                      className="mt-8 tracking-wide font-bold bg-gradient-to-r from-emerald-600 to-green-600 text-white w-full py-4 rounded-lg hover:from-emerald-700 hover:to-green-700 transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-[1.02]"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                          <span className="text-lg">Logging in...</span>
                        </>
                      ) : (
                        <>
                          <span className="text-lg mr-2">→</span>
                          <span className="text-lg font-semibold">Sign In</span>
                          <span className="text-lg ml-2">←</span>
                        </>
                      )}
                    </button>
                    {loginSuccessfuly && (
                      <div className="mt-4 p-3 bg-emerald-100 border-2 border-emerald-400 text-emerald-800 text-center rounded-lg animate-fade-in">
                        ✓ {loginSuccessfuly}
                      </div>
                    )}
                    {loginError && (
                      <div className="mt-4 p-3 bg-red-100 border-2 border-red-400 text-red-600 text-center rounded-lg animate-fade-in">
                        ✗ {loginError}
                      </div>
                    )}
                  </form>
                </div>
              </div>
              <div className="mt-6 flex justify-center">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                  <div
                    className="w-2 h-2 bg-green-400 rounded-full animate-pulse"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-teal-400 rounded-full animate-pulse"
                    style={{ animationDelay: "0.4s" }}
                  ></div>
                  <span className="text-sm ml-2 text-gray-700 font-medium">
                    🔐 Secure Connection
                  </span>
                  <div
                    className="w-2 h-2 bg-teal-400 rounded-full animate-pulse"
                    style={{ animationDelay: "0.4s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-green-400 rounded-full animate-pulse"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="w-full py-3 sm:py-4 bg-white/60 backdrop-blur-sm mt-auto relative z-10 border-t border-emerald-100/50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-center md:text-left mb-2 md:mb-0">
              <p className="text-gray-500 text-xs sm:text-sm">
                &copy; {new Date().getFullYear()} Sys Tech. All rights reserved.
              </p>
            </div>
            <div className="flex items-center justify-center space-x-4 sm:space-x-6">
              <a
                href="#"
                className="text-gray-400 hover:text-emerald-600 transition-colors duration-300 text-xs sm:text-sm hover:underline"
              >
                Privacy
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-emerald-600 transition-colors duration-300 text-xs sm:text-sm hover:underline"
              >
                Terms
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-emerald-600 transition-colors duration-300 text-xs sm:text-sm hover:underline"
              >
                Support
              </a>
            </div>
          </div>
          <div className="mt-2 text-center">
            <p className="text-gray-400 text-[10px] sm:text-xs">
              Inventory Management System v2.0
            </p>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 via-green-500 to-emerald-500 z-10"></div>

      <style>{`
        @keyframes bg-pulse {
          0% { transform: translateY(-100px) scale(1); opacity: 0.2; }
          50% { opacity: 0.5; }
          100% { transform: translateY(100vh) scale(1.2); opacity: 0.2; }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-bg-pulse { animation: bg-pulse linear infinite; }
        .animate-fade-in { animation: fade-in 0.3s ease-out; }
      `}</style>
    </div>
  );
};

export default Login;
