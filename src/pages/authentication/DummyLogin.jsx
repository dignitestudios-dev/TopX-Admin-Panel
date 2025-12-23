import React, { useState } from "react";
import { useNavigate } from "react-router";
import { FiLoader } from "react-icons/fi";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { Logo, loginbg } from "../../assets/export";
import Cookies from "js-cookie";
import { ErrorToast } from "../../components/global/Toaster";
import axios from "../../axios"; 

const DummyLogin = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleForgotClick = () => navigate("/auth/forgot-password");

  // 🔥 LOGIN FUNCTION
  const handleLoginClick = async () => {
    setEmailError("");
    setPasswordError("");

    if (!email) {
      setEmailError("Email is required");
      return;
    }
    if (!password) {
      setPasswordError("Password is required");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post("/auth/signIn", {
        email,
        password,
        role: "admin",  

      });

      console.log("LOGIN RESPONSE:", res.data);

      if (res.data.success) {
        const { token, admin } = res.data.data;

        // Save token + user
        Cookies.set("token", token, { expires: 7 });
        Cookies.set("user", JSON.stringify(admin), { expires: 7 });

        navigate("/app/dashboard");
      }
    } catch (error) {
      const msg =
        error?.response?.data?.message || "Login failed. Please try again.";
      ErrorToast(msg);
      console.error("LOGIN ERROR:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex items-center justify-center ">
      <div className="w-full max-w-[1150px] h-[650px] bg-white border border-gray-200 rounded-3xl shadow-[0_8px_25px_rgba(0,0,0,0.08)] overflow-hidden flex">

        {/* LEFT — Form */}
        <div className="w-full md:w-1/2 flex flex-col items-center px-12 py-12">

          <img src={Logo} alt="logo" className="w-28 mb-4" />

          <h2 className="text-3xl font-semibold text-black tracking-tight">
            Welcome Back
          </h2>
          <p className="text-gray-600 mb-10 mt-1">
            Enter your credentials to access your account.
          </p>

          <form className="w-full flex flex-col gap-6">
            
            {/* Email */}
            <div>
              <label className="text-sm font-medium text-gray-700">Email</label>
              <input
                type="text"
                className="w-full h-12 mt-1 px-4 bg-white border border-gray-300 text-black 
                rounded-xl outline-none placeholder:text-gray-500
                focus:ring-2 focus:ring-[#DE4B12]/50 focus:border-[#DE4B12] transition"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {emailError && <p className="text-red-500 text-sm mt-1">{emailError}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="text-sm font-medium text-gray-700">Password</label>
              <div
                className="w-full h-12 mt-1 flex items-center px-4 rounded-xl bg-white
                border border-gray-300 focus-within:ring-2 focus-within:ring-[#DE4B12]/50 
                focus-within:border-[#DE4B12] transition"
              >
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
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

              {passwordError && (
                <p className="text-red-500 text-sm mt-1">{passwordError}</p>
              )}
            </div>

            {/* Forgot Password */}
            <div className="flex justify-end -mt-2">
              <button
                type="button"
                onClick={handleForgotClick}
                className="text-[#DE4B12] hover:underline text-sm tracking-wide"
              >
                Forgot Password?
              </button>
            </div>

            {/* Login Button */}
            <button
              type="button"
              onClick={handleLoginClick}
              disabled={loading}
              className="w-full h-12 rounded-xl bg-[#DE4B12] text-white font-medium 
              flex items-center justify-center gap-2 text-[1.05rem]
              hover:bg-[#c34410] active:scale-[.98]
              transition disabled:opacity-60"
            >
              Log In
              {loading && <FiLoader className="animate-spin" />}
            </button>

          </form>
        </div>

        {/* RIGHT — Image */}
        <div className="hidden md:flex w-1/2 h-full relative">
          <img src={loginbg} alt="login" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
        </div>

      </div>
    </div>
  );
};

export default DummyLogin;
