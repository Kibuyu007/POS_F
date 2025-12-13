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
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-green-900 to-red-900 relative overflow-hidden">
      {/* Subtle Snowflakes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute top-0 w-1 h-1 bg-white rounded-full animate-snowfall"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${8 + Math.random() * 12}s`,
              opacity: 0.5 + Math.random() * 0.5,
            }}
          />
        ))}
      </div>

      {/* Christmas Lights Decoration - Simple & Elegant */}
      <div className="absolute top-0 left-0 right-0 h-12 flex justify-center items-center z-10 mt-4">
        <div className="flex gap-3">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="relative">
              <div
                className="w-5 h-8 rounded-full shadow-lg animate-bounce"
                style={{
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: "1.2s",
                  backgroundColor:
                    i % 4 === 0
                      ? "#ef4444"
                      : i % 4 === 1
                      ? "#10b981"
                      : i % 4 === 2
                      ? "#f59e0b"
                      : "#6366f1",
                  boxShadow: `0 4px 15px ${
                    i % 4 === 0
                      ? "#ef4444"
                      : i % 4 === 1
                      ? "#10b981"
                      : i % 4 === 2
                      ? "#f59e0b"
                      : "#6366f6"
                  }`,
                }}
              >
                {/* Light cap */}
                <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-3 h-2 bg-gray-800 rounded-t-sm"></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="min-h-screen flex flex-col justify-center items-center px-4 relative z-10">
        {/* Christmas Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-3">
            <span className="text-3xl animate-bounce">🎄</span>
            <h1 className="text-3xl font-bold text-white">
              Happy Christmas Season
            </h1>
            <span
              className="text-3xl animate-bounce"
              style={{ animationDelay: "0.5s" }}
            >
              🎅
            </span>
          </div>
          <p className="text-yellow-200 font-medium">Login to continue</p>
        </div>

        {/* Login Card - Keeping original style */}
        <div className="relative py-3 w-full max-w-md mx-auto">
          <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-green-600 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl animate-pulse"></div>

          <div className="relative px-4 py-10 bg-white shadow-xl rounded-2xl sm:rounded-3xl sm:p-20">
            <div className="max-w-md mx-auto w-full">
              {/* Christmas Decoration on Card */}
              <div className="flex justify-center gap-2 mb-6">
                <span className="text-2xl animate-pulse">🎁</span>
                <span
                  className="text-2xl animate-pulse"
                  style={{ animationDelay: "0.3s" }}
                >
                  🌟
                </span>
                <span
                  className="text-2xl animate-pulse"
                  style={{ animationDelay: "0.6s" }}
                >
                  🔔
                </span>
              </div>

              <form onSubmit={handleLogin} className="w-full">
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-red-600">
                    👤
                  </div>
                  <input
                    ref={usernameRef}
                    className="w-full pl-12 pr-6 py-4 rounded-lg font-bold bg-gray-100 border-2 border-gray-200
                    placeholder-gray-600 text-lg focus:outline-none
                    focus:border-red-500 focus:bg-white transition-all duration-300"
                    type="text"
                    name="userName"
                    value={userLogin.userName}
                    onChange={handleChange}
                    placeholder="Username"
                  />
                </div>

                <div className="relative mt-5">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-600">
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
                  className="mt-8 tracking-wide font-bold bg-gradient-to-r from-red-600 to-green-600 text-white w-full py-4
                  rounded-lg hover:from-red-700 hover:to-green-700 transition-all duration-300 ease-in-out flex
                  items-center justify-center focus:shadow-outline focus:outline-none shadow-lg hover:scale-105"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                      <span className="text-lg">Logging in...</span>
                    </>
                  ) : (
                    <>
                      <span className="text-xl mr-2">🎅</span>
                      <span className="text-xl">Login</span>
                      <span className="text-xl ml-2">🎄</span>
                    </>
                  )}
                </button>

                {loginSuccessfuly && (
                  <div className="mt-4 p-3 bg-green-100 border-2 border-green-400 text-green-800 text-center rounded-lg">
                    🎉 {loginSuccessfuly}
                  </div>
                )}

                {loginError && (
                  <div className="mt-4 p-3 bg-red-100 border-2 border-red-400 text-red-800 text-center rounded-lg">
                    ❌ {loginError}
                  </div>
                )}
              </form>

              {/* Christmas Message */}
              <div className="mt-6 pt-6 border-t border-gray-200 text-center">
                <p className="text-gray-600 text-sm">
                  <span className="text-red-600 font-bold">🎁</span> Wishing you
                  a joyful holiday season!
                  <span className="text-green-600 font-bold"> 🎁</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Christmas Decorations */}
        <div className="mt-8 flex gap-4">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="text-2xl animate-bounce"
              style={{
                animationDelay: `${i * 0.3}s`,
                animationDuration: "1.5s",
              }}
            >
              {["🎄", "🎁", "🌟", "🔔", "🦌"][i]}
            </div>
          ))}
        </div>
      </div>

      {/* CSS Animations */}
      <style >{`
        @keyframes snowfall {
          0% {
            transform: translateY(-100px) rotate(0deg);
          }
          100% {
            transform: translateY(100vh) rotate(360deg);
          }
        }

        .animate-snowfall {
          animation: snowfall linear infinite;
        }

        .animate-pulse {
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }
      `}</style>
    </div>
  );
};

export default Login;
