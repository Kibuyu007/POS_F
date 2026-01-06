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

  return (
    <div className="min-h-screen bg-gray-100 relative overflow-hidden flex flex-col">
      {/* Subtle background effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute top-0 w-1 h-1 bg-emerald-400/20 rounded-full animate-bg-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${8 + Math.random() * 12}s`,
              opacity: 0.3 + Math.random() * 0.4,
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-center items-center px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-emerald-100 font-medium">
            Secure login to continue
          </p>
        </div>

        {/* Login Card */}
        <div className="relative py-3 w-full max-w-md mx-auto">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-green-600 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl opacity-80"></div>

          <div className="relative px-4 py-10 bg-white shadow-xl rounded-2xl sm:rounded-3xl sm:p-20">
            <div className="max-w-md mx-auto w-full">
              {/* Card decoration */}
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-green-100 rounded-full flex items-center justify-center shadow-md">
                  <span className="text-2xl text-emerald-600">🔑</span>
                </div>
              </div>

              <form onSubmit={handleLogin} className="w-full">
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-600">
                    👤
                  </div>
                  <input
                    ref={usernameRef}
                    className="w-full pl-12 pr-6 py-4 rounded-lg font-bold bg-gray-100 border-2 border-gray-200
                    placeholder-gray-600 text-lg focus:outline-none
                    focus:border-emerald-500 focus:bg-white transition-all duration-300"
                    type="text"
                    name="userName"
                    value={userLogin.userName}
                    onChange={handleChange}
                    placeholder="Username"
                  />
                </div>

                <div className="relative mt-5">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-600">
                    🔒
                  </div>
                  <input
                    className="w-full pl-12 pr-6 py-4 rounded-lg font-bold bg-gray-100 border-2 border-gray-200
                    placeholder-gray-600 text-lg focus:outline-none
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
                  className="mt-8 tracking-wide font-bold bg-gradient-to-r from-emerald-600 to-green-600 text-white w-full py-4
                  rounded-lg hover:from-emerald-700 hover:to-green-700 transition-all duration-300 ease-in-out flex
                  items-center justify-center focus:shadow-outline focus:outline-none shadow-lg hover:scale-105"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                      <span className="text-lg">Logging in...</span>
                    </>
                  ) : (
                    <>
                      <span className="text-lg mr-2">→</span>
                      <span className="text-lg">Login</span>
                      <span className="text-lg ml-2">←</span>
                    </>
                  )}
                </button>

                {loginSuccessfuly && (
                  <div className="mt-4 p-3 bg-emerald-100 border-2 border-emerald-400 text-emerald-800 text-center rounded-lg">
                    ✓ {loginSuccessfuly}
                  </div>
                )}

                {loginError && (
                  <div className="mt-4 p-3 bg-red-100 border-2 border-red-400 text-red-800 text-center rounded-lg">
                    ✗ {loginError}
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>

        {/* Bottom decoration */}
        <div className="mt-8 flex justify-center">
          <div className="flex items-center gap-2 text-emerald-100">
            <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <div className="w-2 h-2 bg-teal-400 rounded-full"></div>
            <span className="text-sm ml-2 text-black">Secure Connection</span>
            <div className="w-2 h-2 bg-teal-400 rounded-full"></div>
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Footer - Added at the bottom */}
      <div className="w-full py-4 bg-gray-100 mt-auto relative z-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-center md:text-left mb-4 md:mb-0">
              <p className="text-gray-600 text-sm">
                &copy; {new Date().getFullYear()} Sys Tech. All rights reserved.
              </p>
            </div>
            <div className="flex items-center justify-center space-x-6">
              <a
                href="#"
                className="text-gray-400 hover:text-emerald-400 transition-colors duration-300 text-sm"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-emerald-400 transition-colors duration-300 text-sm"
              >
                Terms of Service
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-emerald-400 transition-colors duration-300 text-sm"
              >
                Contact Support
              </a>
            </div>
          </div>
          <div className="mt-4 text-center">
            <p className="text-gray-500 text-xs">
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
            opacity: 0.3;
          }
          50% {
            opacity: 0.6;
          }
          100% {
            transform: translateY(100vh) scale(1.2);
            opacity: 0.3;
          }
        }

        .animate-bg-pulse {
          animation: bg-pulse linear infinite;
        }
      `}</style>
    </div>
  );
};

export default Login;
