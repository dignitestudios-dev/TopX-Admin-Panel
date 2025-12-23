import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { IoIosArrowBack } from "react-icons/io";
import { FiLoader } from "react-icons/fi";
import axios from "../../axios";
import { Logo, loginbg } from "../../assets/export";
import { ErrorToast, SuccessToast } from "../../components/global/Toaster";

const Verification = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email;

  const [otp, setOtp] = useState(["", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(""); // To store token

  useEffect(() => {
    if (!email) {
      ErrorToast("No email found! Please request OTP again.");
      navigate("/auth/forgot-password");
    }
  }, [email, navigate]);

  // Handle input typing + auto-focus
  const handleChange = (value, index) => {
    if (/^[0-9]?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Move to next box
      if (value && index < 5) {
        document.getElementById(`otp-${index + 1}`).focus();
      }
    }
  };

  const handleVerify = async () => {
  const code = otp.join("");

  if (code.length !== 5) {
    ErrorToast("Please enter all 6 digits.");
    return;
  }

  setLoading(true);
  try {
    const res = await axios.post("/auth/verifyOTP", {
      email: email,
      role: "admin",
      otp: code,
    });

    if (res.data.success) {
      SuccessToast("OTP verified successfully!");
      // Ensure token is passed here
      navigate("/auth/reset-password", { state: { email, token: res.data.data.token } });
    } else {
      ErrorToast(res.data.message || "Invalid OTP. Try again.");
    }
  } catch (error) {
    ErrorToast(error.response?.data?.message || "Unable to verify OTP");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="w-full flex items-center justify-center">
      <div className="w-full max-w-[1150px] h-[650px] bg-white border border-gray-200 rounded-3xl shadow-[0_8px_25px_rgba(0,0,0,0.08)] overflow-hidden flex relative">
        {/* LEFT */}
        <div className="w-full md:w-1/2 flex flex-col items-center px-12 py-10 relative">
          <button
            type="button"
            onClick={() => navigate("/auth/forgot-password")}
            className="absolute top-6 left-6 text-gray-700 hover:text-black transition"
          >
            <IoIosArrowBack className="text-3xl" />
          </button>
          <img src={Logo} alt="logo" className="w-28 mt-4 mb-6" />
          <h2 className="text-3xl font-semibold text-black tracking-tight">Verification</h2>
          <p className="text-gray-600 text-center mt-1 mb-10">
            Enter the 6-digit code sent to:
            <br />
            <span className="font-semibold">{email}</span>
          </p>

          {/* OTP INPUTS */}
          <div className="flex gap-3 mt-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(e.target.value, index)}
                className="w-14 h-14 text-[22px] font-semibold text-center border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-[#DE4B12]/50 focus:border-[#DE4B12] transition outline-none"
              />
            ))}
          </div>

          {/* Resend */}
          {/* <p className="text-gray-600 mt-6 text-sm">
            Didn't receive the code?{" "}
            <button className="text-[#DE4B12] font-medium hover:underline">
              Resend
            </button>
          </p> */}

          {/* VERIFY BUTTON */}
          <button
            onClick={handleVerify}
            disabled={loading}
            className="w-full max-w-sm mt-10 h-12 rounded-xl bg-[#DE4B12] text-white font-medium text-[1.05rem] flex items-center justify-center gap-2 hover:bg-[#c34410] active:scale-[.98] transition disabled:opacity-60"
          >
            {loading ? (
              <>
                <FiLoader className="animate-spin" />
                Verifying...
              </>
            ) : (
              "Verify"
            )}
          </button>
        </div>
        {/* RIGHT */}
        <div className="hidden md:flex w-1/2 h-full relative">
          <img src={loginbg} alt="verification" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
        </div>
      </div>
    </div>
  );
};

export default Verification;
