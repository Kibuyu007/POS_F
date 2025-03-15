import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [userLogin, setUserLogin] = useState({
    userName: "",
    password: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserLogin((prevUser) => ({
      ...prevUser,
      [name]: value,
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:4004/api/auth/login",
        userLogin
      );
   
      console.log("Login successful", response.data);

    
      localStorage.setItem("token", response.data.token);


      navigate("/");
    } catch (error) {
      console.error("Login failed", error);
      
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
                  className="mt-5 tracking-wide font-semibold bg-green-400 text-white-500 w-full py-4 rounded-lg hover:bg-green-700 transition-all duration-300 ease-in-out flex items-center justify-center focus:shadow-outline focus:outline-none"
                >
                  <span className="ml-2 text-2xl">Login</span>
                </button>
                <p className="mt-6 text-xs text-gray-600 text-center">
                  <a
                    href="#"
                    className="border-b border-gray-500 border-dotted"
                  >
                    Privacy Policy
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
