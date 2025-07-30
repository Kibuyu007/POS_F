import { useEffect, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { loginSuccess, logoutSuccess } from "../../Redux/userSlice";

//API
const URL = import.meta.env.VITE_API;

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
      await axios.get(`${URL}/api/auth/logout`, {
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
    setLoginError("");

    try {
      const res = await axios.post(
        `${URL}/api/auth/login`,
        userLogin,
        {
          withCredentials: true,
        }
      );

      const token = res.data.token;
      const user = res.data.user;

      const decoded = jwtDecode(token);
      const expirationTime = decoded.exp * 1000; // convert to ms

      // Store in localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("exp", expirationTime);

      dispatch(loginSuccess({ token, user }));

      // Set auto logout timer
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
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="absolute inset-0 bg-black shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
        <div className="relative px-4 py-10 bg-[#f2f2f2] shadow-lg sm:rounded-3xl sm:p-20">
          <div className="max-w-md mx-auto">
            <div className="divide-y divide-gray-200 mt-4">
              <div className="mx-auto max-w-xs">
                <input
                  className="w-full px-8 py-4 rounded-lg font-bold bg-gray-300 border border-gray-200 placeholder-gray-800 focus:placeholder-gray-300 text-lg focus:outline-none focus:border-gray-400 focus:bg-white"
                  type="text"
                  name="userName"
                  value={userLogin.userName}
                  onChange={handleChange}
                  placeholder="Username"
                />
                <input
                  className="w-full px-8 py-4 rounded-lg font-bold bg-gray-300 border border-gray-200 placeholder-gray-800 focus:placeholder-gray-300 text-lg focus:outline-none focus:border-gray-400 focus:bg-white mt-5"
                  type="password"
                  name="password"
                  value={userLogin.password}
                  onChange={handleChange}
                  placeholder="Password"
                />
                <button
                  onClick={handleLogin}
                  className="mt-5 tracking-wide font-semibold bg-green-400 text-white w-full py-4 rounded-lg hover:bg-green-700 transition-all duration-300 ease-in-out flex items-center justify-center focus:shadow-outline focus:outline-none"
                >
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5 mr-3 text-white"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v4l3.5-3.5L12 0V4a8 8 0 01-8 8z"
                        ></path>
                      </svg>
                      Loading...
                    </>
                  ) : (
                    <span className="ml-2 text-2xl">Login</span>
                  )}
                </button>
                {loginSuccessfuly && (
                  <div className="mt-3 text-green-500 text-center">
                    {loginSuccessfuly}
                  </div>
                )}
                {loginError && (
                  <div className="mt-3 text-red-500 text-center bg-green-300/40 rounded-3xl py-2 px-4">
                    {loginError}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
