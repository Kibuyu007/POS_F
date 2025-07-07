import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { FaBell } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import logo from "../../assets/logo.jpg";
import { logoutSuccess } from "../../Redux/userSlice";
import { AiOutlineLogout } from "react-icons/ai";

const Header = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Get user details from Redux store
  const user = useSelector((state) => state.user?.user);
  const uName = user ? `${user.firstName} ${user.lastName}` : "Guest";

  // Handle Logout
  const handleLogout = async () => {
    try {
      await axios.get("http://localhost:4004/api/auth/logout", {
        withCredentials: true,
      });

      // Clear Redux state & localStorage
      setDropdownOpen(false);
      dispatch(logoutSuccess());
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Redirect to login page
      navigate("/auth");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Function to calculate age from date of birth
  const calculateAge = (dateOfBirth) => {
    const dob = new Date(dateOfBirth); // Convert date of birth to a Date object
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();

    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      age--;
    }

    return age;
  };

  return (
    <div className="fixed  left-4 right-4 flex justify-center z-50">
      <header className="w-full max-w-[1500px] backdrop-blur-md px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 py-3 sm:py-4 flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center gap-2 sm:gap-3">
          <img
            src={logo}
            className="h-80 w-10 sm:h-12 sm:w-12 rounded-md shadow-md"
            alt="Logo"
          />
          <h1 className="text-base sm:text-lg md:text-xl font-bold">Uza</h1>
        </div>

        {/* Notifications */}
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="bg-secondary rounded-[30px] p-2 sm:p-3 cursor-pointer shadow-md">
            <FaBell className="text-sm sm:text-base" />
          </div>

          {/* User Dropdown */}
          <div className="relative">
            <div
              className=" gap-2 sm:gap-3 cursor-pointer hs-dropdown-toggle py-2 ps-1 pe-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-full border border-gray-200 bg-white text-gray-800 shadow-2xs hover:bg-gray-50 focus:outline-hidden focus:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-white dark:hover:bg-neutral-800 dark:focus:bg-neutral-800 shadow-[0px_0px_0px_1px_rgba(0,0,0,0.06),0px_1px_1px_-0.5px_rgba(0,0,0,0.06),0px_3px_3px_-1.5px_rgba(0,0,0,0.06),_0px_6px_6px_-3px_rgba(0,0,0,0.06),0px_12px_12px_-6px_rgba(0,0,0,0.06),0px_24px_24px_-12px_rgba(0,0,0,0.06)]"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              {user?.photo ? (
                <img
                  src={`http://localhost:4004/pfps/${user.photo}`}
                  className="h-4 w-4 sm:h-10 sm:w-10 rounded-full object-cover shadow-md"
                  alt="User"
                />
              ) : (
                <svg
                  className="w-4 h-4 sm:w-12 sm:h-12 rounded-full"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12.12 12.78C12.05 12.77 11.96 12.77 11.88 12.78C10.12 12.72 8.71997 11.28 8.71997 9.50998C8.71997 7.69998 10.18 6.22998 12 6.22998C13.81 6.22998 15.28 7.69998 15.28 9.50998C15.27 11.28 13.88 12.72 12.12 12.78Z"
                    stroke="#292D32"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M18.74 19.3801C16.96 21.0101 14.6 22.0001 12 22.0001C9.40001 22.0001 7.04001 21.0101 5.26001 19.3801C5.36001 18.4401 5.96001 17.5201 7.03001 16.8001C9.77001 14.9801 14.25 14.9801 16.97 16.8001C18.04 17.5201 18.64 18.4401 18.74 19.3801Z"
                    stroke="#292D32"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                    stroke="#292D32"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}

              <span className="text-green-700 font-xl font-bold truncate max-w-30 dark:text-neutral-400">
                {uName}
              </span>
              <AiOutlineLogout className="text-xl" />
            </div>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white shadow-[4.0px_8.0px_8.0px_rgba(0,0,0,0.38)] rounded-lg p-4 ">
                <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-xl leading-6 font-bold text-gray-900">
                    User Profile
                  </h3>
                </div>
                <hr className="my-2" />

                <div className="py-2 sm:py-2 sm:flex sm:flex-cols-2 gap-6 sm:px-6 bg-gray-200 rounded-md shadow-sm">
                  <h3 className="text-xl font-bold text-gray-900">
                    User name :
                  </h3>
                  <span className="text-xl font-bold text-gray-900 sm:mt-0 sm:col-span-2">
                    {user?.userName}
                  </span>
                </div>

                <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <h3 className="text-md font-bold text-green-700">Age</h3>
                  <span className="mt-1 text-md text-gray-900 sm:mt-0 sm:col-span-2">
                    {calculateAge(user?.dateOfBirth)} years old
                  </span>
                </div>

                <div className="py-2 sm:py-2 sm:flex sm:flex-cols-2 gap-6 sm:px-6 bg-gray-200 rounded-md shadow-sm">
                  <h3 className="text-xl font-bold text-gray-900">Title :</h3>
                  <span className="text-xl font-bold text-gray-900 sm:mt-0 sm:col-span-2">
                    {user?.title}
                  </span>
                </div>

                <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <h3 className="text-md font-bold text-green-700">Address</h3>
                  <span className="mt-1 text-md text-gray-900 sm:mt-0 sm:col-span-2">
                    {user?.address}
                  </span>
                </div>

                <div className="py-2 sm:py-2 sm:flex sm:flex-cols-2 gap-6 sm:px-6 bg-gray-200 rounded-md shadow-sm">
                  <h3 className="text-xl font-bold text-gray-900">
                    Contacts :
                  </h3>
                  <span className="text-xl font-bold text-gray-900 sm:mt-0 sm:col-span-2">
                    {user?.contacts}
                  </span>
                </div>

                <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <h3 className="text-md font-bold text-green-700">Email</h3>
                  <span className="mt-1 text-md text-gray-900 sm:mt-0 sm:col-span-2">
                    {user?.email}
                  </span>
                </div>

                <hr className="my-2" />
                <button
                  className="w-full bg-green-500 font-bold text-lg text-white py-2 rounded-lg hover:bg-grey transition"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
    </div>
  );
};

export default Header;
