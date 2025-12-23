import React, { useState } from "react";
import { useNavigate } from "react-router";
import { FiLoader } from "react-icons/fi";
import { Logo, loginbg } from "../../assets/export";
import axios from "../../axios";
import { ErrorToast, SuccessToast } from "../../components/global/Toaster";

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");

  const validate = () => {
    if (!email) {
      setEmailError("Email is required.");
      return false;
    }
    setEmailError("");
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);

    try {
      const res = await axios.post("/auth/forgot", {
        email,
        role: "admin",
      });

      if (res.data.success) {
        SuccessToast("Verification code sent to email.");

        // redirect to verification page
        navigate("/auth/verification", { state: { email } });
      } else {
        ErrorToast(res.data.message || "Something went wrong");
      }
    } catch (error) {
      ErrorToast(
        error.response?.data?.message || 
        "Unable to process request. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex items-center justify-center">
      <div className="w-full max-w-[1150px] h-[650px] bg-white border border-gray-200 rounded-3xl shadow-[0_8px_25px_rgba(0,0,0,0.08)] overflow-hidden flex">

        {/* LEFT */}
        <div className="w-full md:w-1/2 flex flex-col items-center px-12 py-12">

          <img src={Logo} alt="logo" className="w-28 mb-4" />

          <h2 className="text-3xl font-semibold text-black tracking-tight">
            Forgot Password
          </h2>
          <p className="text-gray-600 mb-10 mt-1">
            Enter your email to reset your password.
          </p>

          {/* FORM */}
          <form className="w-full flex flex-col gap-6" onSubmit={(e) => e.preventDefault()}>

            {/* EMAIL */}
            <div>
              <label className="text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                className="
                  w-full h-12 mt-1 px-4 bg-white border border-gray-300 text-black 
                  rounded-xl outline-none placeholder:text-gray-500
                  focus:ring-2 focus:ring-[#DE4B12]/50 focus:border-[#DE4B12] transition
                "
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {emailError && (
                <p className="text-red-500 text-sm mt-1">{emailError}</p>
              )}
            </div>

            {/* SUBMIT */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="
                w-full h-12 rounded-xl bg-[#DE4B12] text-white font-medium 
                flex items-center justify-center gap-2 text-[1.05rem]
                hover:bg-[#c34410] active:scale-[.98]
                transition disabled:opacity-60
              "
            >
              {loading ? (
                <>
                  <FiLoader className="animate-spin" />
                  Sending...
                </>
              ) : (
                "Submit"
              )}
            </button>

          </form>
        </div>

        {/* RIGHT IMAGE */}
        <div className="hidden md:flex w-1/2 h-full relative">
          <img
            src={loginbg}
            alt="login"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
