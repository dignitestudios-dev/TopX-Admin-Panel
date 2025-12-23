import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { FiLoader } from "react-icons/fi";
import { Logo, loginbg } from "../../assets/export";
import axios from "../../axios";
import { ErrorToast, SuccessToast } from "../../components/global/Toaster";
import { IoIosArrowBack } from "react-icons/io";

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { email, token } = location.state || {};  // Destructure email and token

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    console.log('ResetPassword Token:', token);  // Verify the token value
    if (!token) {
      ErrorToast("Token missing. Please try again.");
      navigate("/auth/forgot-password");  // Redirect if no token
    }
  }, [token, navigate]);

  const handleReset = async () => {
    // Basic validation
    if (!newPassword || !confirmPassword) {
      return ErrorToast("Please fill in both password fields");
    }
    if (newPassword !== confirmPassword) {
      return ErrorToast("Passwords do not match");
    }

    setLoading(true);
    try {
      const res = await axios.post(
        "/auth/updatePassword",
        {
          // email,
          password: newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,  // Add token to the header
          },
        }
      );

      if (res.data.success) {
        SuccessToast("Password updated successfully!");
        navigate("/auth/login");
      } else {
        ErrorToast(res.data.message || "Unable to reset password");
      }
    } catch (error) {
      ErrorToast(error.response?.data?.message || "Error updating password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex items-center justify-center">
      <div className="w-full max-w-[1150px] h-[650px] bg-white border border-gray-200 rounded-3xl shadow-[0_8px_25px_rgba(0,0,0,0.08)] overflow-hidden flex relative">
        <div className="w-full md:w-1/2 flex flex-col px-12 py-10 relative">
          {/* Back Button */}
          <button
            type="button"
            onClick={() => navigate("/auth/verification")}
            className="absolute top-6 left-6 text-gray-700 hover:text-black transition"
          >
            <IoIosArrowBack className="text-3xl" />
          </button>

          {/* Logo */}
          <div className="flex justify-center">
            <img src={Logo} alt="logo" className="w-28 mt-4 mb-6" />
          </div>

          {/* Header */}
          <h2 className="text-3xl font-semibold text-black tracking-tight text-center">
            Reset Password
          </h2>
          <p className="text-gray-600 text-center mt-1 mb-10">
            Create a new password for your account.
          </p>

          {/* FORM */}
          <form className="flex flex-col gap-6 w-full">
            {/* New Password */}
            <div>
              <label className="text-sm font-medium text-gray-700">New Password</label>
              <div className="w-full h-12 mt-1 flex items-center px-4 rounded-xl bg-white border border-gray-300 focus-within:ring-2 focus-within:ring-[#DE4B12]/50 focus-within:border-[#DE4B12] transition">
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter your new password"
                  className="w-full bg-transparent outline-none placeholder:text-gray-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-500 hover:text-black transition"
                >
                  {showPassword ? <FaRegEye /> : <FaRegEyeSlash />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="text-sm font-medium text-gray-700">Confirm Password</label>
              <div className="w-full h-12 mt-1 flex items-center px-4 rounded-xl bg-white border border-gray-300 focus-within:ring-2 focus-within:ring-[#DE4B12]/50 focus-within:border-[#DE4B12] transition">
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  className="w-full bg-transparent outline-none placeholder:text-gray-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-500 hover:text-black transition"
                >
                  {showPassword ? <FaRegEye /> : <FaRegEyeSlash />}
                </button>
              </div>
            </div>

            {/* Reset Button */}
            <button
              type="button"
              onClick={handleReset}
              disabled={loading}
              className="w-full h-12 rounded-xl bg-[#DE4B12] text-white font-medium flex items-center justify-center gap-2 text-[1.05rem] hover:bg-[#c34410] active:scale-[.98] transition disabled:opacity-60"
            >
              {loading ? (
                <>
                  <FiLoader className="animate-spin" />
                  Resetting...
                </>
              ) : (
                "Reset Password"
              )}
            </button>
          </form>
        </div>
        {/* RIGHT — Image */}
        <div className="hidden md:flex w-1/2 h-full relative">
          <img
            src={loginbg} // Image source for the right side
            alt="reset-password"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
        </div>

      </div>
    </div>
  );
};

export default ResetPassword;
