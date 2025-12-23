import { Logo } from "../../assets/export";

const DummyNavbar = () => {
  return (
    <div className="w-full rounded-xl mt-4 background-gradients  border border-gray-700  h-20 px-6 py-4 flex justify-between items-center">
      {/* Logo Section */}
      {/* 
        <img
        src={Logo}
        loading="lazy"
        alt="logo-organization"
        className="h-10 cursor-pointer"
      />
      */}


      {/* User Avatar and Profile Dropdown */}
      <div className="flex items-center space-x-3 ml-auto">
        {/* User Avatar with Hover Effect */}
        <div className="relative group flex items-center space-x-3">
          <img
            src="https://i.pravatar.cc/100?img=1" // Replace with actual user avatar
            alt="user-avatar"
            className="w-10 h-10 object-contain cursor-pointer rounded-full border-2 border-gray-300 transition-transform duration-300 ease-in-out transform group-hover:scale-110"
          />
          <h1 className="text-lg font-semibold text-gray-700">User</h1>

          {/* Hovered Profile Options */}
          {/* 
          <div className="absolute right-0 w-40 mt-2 hidden group-hover:block bg-white shadow-lg rounded-lg py-2 text-gray-600 text-sm transition-all duration-200">
            <a
              href="#"
              className="block px-4 py-2 hover:bg-gray-100 rounded-md transition-all duration-200"
            >
              Profile
            </a>
            <a
              href="/"
              className="block px-4 py-2 hover:bg-gray-100 rounded-md transition-all duration-200"
            >
              Logout
            </a>
          </div> 
          */}
        </div>
      </div>
    </div>
  );
};

export default DummyNavbar;
