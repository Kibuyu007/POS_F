import { FaSearch, FaUser, FaBell } from "react-icons/fa";
import logo from '../../assets/logo.jpg';

const Header = () => {
  return (
    <div className="fixed top-4 left-4 right-4 flex justify-center z-50">
      <header className="w-full max-w-[1500px] backdrop-blur-md px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 py-3 sm:py-4 flex justify-between items-center">
        
        {/* Logo */}
        <div className="flex items-center gap-2 sm:gap-3">
          <img src={logo} className="h-10 w-10 sm:h-12 sm:w-12 rounded-md shadow-md" alt="Logo" />
          <h1 className="text-base sm:text-lg md:text-xl font-bold">Uza</h1>
        </div>

      

        {/* User Info */}
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="bg-secondary rounded-[30px] p-2 sm:p-3 cursor-pointer shadow-md">
            <FaBell className="text-sm sm:text-base" />
          </div>

          <div className="hidden sm:flex items-center gap-2 sm:gap-3 cursor-pointer">
            <FaUser className="text-2xl sm:text-4xl" />
            <div className="hidden md:flex flex-col items-start">
              <h1 className="text-base sm:text-lg md:text-xl font-semibold text-text">Name</h1>
              <p className="text-xs sm:text-sm text-text">Title</p>
            </div>
          </div>
        </div>
      </header>
    </div>
  );
};

export default Header;
