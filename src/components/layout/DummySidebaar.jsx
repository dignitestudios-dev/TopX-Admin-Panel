import { NavLink, useNavigate } from "react-router";
import { useState } from "react";
import { sidebarData } from "../../static/Sidebar";
import { LogOut } from "lucide-react";
import { Logo } from "../../assets/export";

const DummySidebar = () => {
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    // Clear all cookies
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    localStorage.clear();
    sessionStorage.clear();
    navigate("/auth/login");
  };

  return (
    <div className="w-[280px] h-full overflow-y-auto flex flex-col gap-6 px-6 py-4 ">
      
      {/* Logo */}
      <img
        src={Logo}
        alt="logo-organization"
        loading="lazy"
        className="h-20 w-20 mx-auto rounded-full border border-[#DE4B12] cursor-pointer transition-transform duration-300 hover:scale-105"
      />

      {/* Sidebar Links */}
      <nav className="flex flex-col gap-2">
        {sidebarData?.map((item) => (
          <NavLink
            key={item.link}
            to={item.link}
            className={({ isActive }) =>
              `flex items-center gap-4 px-4 py-2 rounded-lg font-medium transition-all duration-300 text-[14px]
               ${
                 isActive
                   ? "bg-gradient-to-r from-[#E56F41] to-[#DE4B12] text-white border-2 border-transparent"
                   : "text-[#DE4B12] border border-[#DE4B12] hover:bg-orange-100"
               }`
            }
          >
            <div
              className={({ isActive }) =>
                `${isActive ? "text-white" : "text-[#DE4B12]"} w-6 h-6 `
              }
            >
              {item.icon}
            </div>
            <span>{item.title}</span>
          </NavLink>
        ))}
      </nav>

      {/* Spacer */}
      <div className="flex border-t border-[#DE4B12]"></div>

      {/* Logout Button */}
      <button
        onClick={() => setShowLogoutModal(true)}
        className="flex items-center gap-3 text-[14px] px-4 py-2 font-semibold text-[#DE4B12]  border border-[#DE4B12] rounded-md hover:bg-orange-100 transition-all duration-300"
      >
        <LogOut className="w-5 h-5 " /> Logout
      </button>

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Are you sure you want to logout?
            </h2>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium px-4 py-2 rounded transition"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700  text-white font-medium px-4 py-2 rounded transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DummySidebar;
