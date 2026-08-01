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

  // Auto-focus username
  useEffect(() => {
    usernameRef.current?.focus();
  }, []);

  // Auto logout timer
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

  // Small POS Icon for mobile
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

  // Medium POS Icon for tablet
  const TabletPOSIcon = () => (
    <svg viewBox="0 0 300 250" className="w-48 h-auto">
      {/* Background circles */}
      <circle cx="150" cy="125" r="120" fill="#10B981" fillOpacity="0.04" />
      <circle cx="150" cy="125" r="90" fill="#10B981" fillOpacity="0.06" />

      {/* Tablet */}
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

      {/* Screen content */}
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

      {/* Total */}
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

      {/* Stand */}
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

      {/* Base */}
      <rect
        x="116"
        y="176"
        width="48"
        height="8"
        rx="4"
        fill="#10B981"
        fillOpacity="0.2"
      />

      {/* Terminal */}
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

      {/* Decorative */}
      <circle cx="40" cy="80" r="4" fill="#10B981" fillOpacity="0.1" />
      <circle cx="250" cy="100" r="4" fill="#10B981" fillOpacity="0.1" />
    </svg>
  );

  return (
    <div className="min-h-screen bg-white relative overflow-hidden flex flex-col">
      {/* Corner Gradients - MASSIVE */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top-left */}
        <div className="absolute -top-80 -left-80 w-[1000px] h-[1000px] bg-gradient-to-br from-emerald-500/30 via-emerald-400/10 to-transparent rounded-full blur-3xl"></div>
        {/* Top-right */}
        <div className="absolute -top-80 -right-80 w-[1000px] h-[1000px] bg-gradient-to-bl from-emerald-500/25 via-emerald-400/10 to-transparent rounded-full blur-3xl"></div>
        {/* Bottom-left */}
        <div className="absolute -bottom-80 -left-80 w-[800px] h-[800px] bg-gradient-to-tr from-emerald-300/8 to-transparent rounded-full blur-3xl"></div>
        {/* Bottom-right */}
        <div className="absolute -bottom-80 -right-80 w-[800px] h-[800px] bg-gradient-to-tl from-emerald-300/8 to-transparent rounded-full blur-3xl"></div>
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(25)].map((_, i) => (
          <div
            key={i}
            className="absolute top-0 w-1 h-1 bg-emerald-400/20 rounded-full animate-bg-pulse"
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
        {/* Mobile Layout (small screens) */}
        <div className="lg:hidden w-full max-w-sm mx-auto">
          {/* Mobile Header */}
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

          {/* Mobile Login Card */}
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
                    className="w-full pl-10 pr-4 py-3 rounded-lg font-semibold bg-gray-100 border-2 border-gray-200
                    placeholder-gray-500 text-base focus:outline-none
                    focus:border-emerald-500 focus:bg-white transition-all duration-300"
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
                    className="w-full pl-10 pr-4 py-3 rounded-lg font-semibold bg-gray-100 border-2 border-gray-200
                    placeholder-gray-500 text-base focus:outline-none
                    focus:border-green-500 focus:bg-white transition-all duration-300"
                    type="password"
                    name="password"
                    value={userLogin.password}
                    onChange={handleChange}
                    placeholder="Password"
                  />
                </div>

                <button
                  type="submit"
                  className="mt-6 tracking-wide font-bold bg-gradient-to-r from-emerald-600 to-green-600 text-white w-full py-3
                  rounded-lg hover:from-emerald-700 hover:to-green-700 transition-all duration-300 flex
                  items-center justify-center shadow-lg hover:shadow-xl"
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

          {/* Mobile Secure Badge */}
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

        {/* Tablet Layout (medium screens) */}
        <div className="hidden lg:hidden xl:hidden w-full max-w-2xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Tablet POS Illustration */}
            <div className="w-full md:w-1/2 flex justify-center">
              <TabletPOSIcon />
            </div>

            {/* Tablet Login Card */}
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
                        className="w-full pl-10 pr-4 py-3.5 rounded-lg font-semibold bg-gray-100 border-2 border-gray-200
                        placeholder-gray-500 text-base focus:outline-none
                        focus:border-emerald-500 focus:bg-white transition-all duration-300"
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
                        className="w-full pl-10 pr-4 py-3.5 rounded-lg font-semibold bg-gray-100 border-2 border-gray-200
                        placeholder-gray-500 text-base focus:outline-none
                        focus:border-green-500 focus:bg-white transition-all duration-300"
                        type="password"
                        name="password"
                        value={userLogin.password}
                        onChange={handleChange}
                        placeholder="Password"
                      />
                    </div>

                    <button
                      type="submit"
                      className="mt-6 tracking-wide font-bold bg-gradient-to-r from-emerald-600 to-green-600 text-white w-full py-3.5
                      rounded-lg hover:from-emerald-700 hover:to-green-700 transition-all duration-300 flex
                      items-center justify-center shadow-lg hover:shadow-xl"
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

        {/* Desktop Layout (large screens) */}
        <div className="hidden xl:flex w-full items-center justify-between">
          {/* Left Side - POS Illustration */}
          <div className="w-1/2 flex items-center justify-center">
            <div className="relative">
              {/* Desktop POS SVG */}
              <svg viewBox="0 0 500 450" className="w-[400px] h-auto">
                {/* Background decorative circles */}
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

                {/* Main Tablet/Display */}
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

                {/* Screen header bar */}
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

                {/* Status dots */}
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

                {/* Time */}
                <rect
                  x="200"
                  y="84"
                  width="40"
                  height="6"
                  rx="3"
                  fill="#10B981"
                  fillOpacity="0.2"
                />

                {/* Battery */}
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

                {/* POS Interface */}
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

                {/* Price column */}
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

                {/* Total */}
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

                {/* Bottom navigation */}
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

                {/* Stand */}
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

                {/* Modern Terminal/Base */}
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

                {/* Terminal buttons */}
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

                {/* Card Reader */}
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

                {/* Receipt Printer */}
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

                {/* Receipt paper */}
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

                {/* Floating decorative elements */}
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

                {/* Animated sparkles */}
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

                {/* Price tags */}
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

          {/* Right Side - Desktop Login Card */}
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
                        className="w-full pl-12 pr-6 py-4 rounded-lg font-bold bg-gray-100 border-2 border-gray-200
                        placeholder-gray-600 text-lg focus:outline-none
                        focus:border-emerald-500 focus:bg-white focus:shadow-md transition-all duration-300"
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
                        className="w-full pl-12 pr-6 py-4 rounded-lg font-bold bg-gray-100 border-2 border-gray-200
                        placeholder-gray-600 text-lg focus:outline-none
                        focus:border-green-500 focus:bg-white focus:shadow-md transition-all duration-300"
                        type="password"
                        name="password"
                        value={userLogin.password}
                        onChange={handleChange}
                        placeholder="Password"
                      />
                    </div>

                    <button
                      type="submit"
                      className="mt-8 tracking-wide font-bold bg-gradient-to-r from-emerald-600 to-green-600 text-white w-full py-4
                      rounded-lg hover:from-emerald-700 hover:to-green-700 transition-all duration-300 flex
                      items-center justify-center shadow-lg hover:shadow-xl hover:scale-[1.02]"
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

              {/* Desktop Secure Badge */}
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

      {/* Bottom accent */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 via-green-500 to-emerald-500 z-10"></div>

      {/* CSS Animations */}
      <style>{`
        @keyframes bg-pulse {
          0% {
            transform: translateY(-100px) scale(1);
            opacity: 0.2;
          }
          50% {
            opacity: 0.5;
          }
          100% {
            transform: translateY(100vh) scale(1.2);
            opacity: 0.2;
          }
        }
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-bg-pulse {
          animation: bg-pulse linear infinite;
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Login;
