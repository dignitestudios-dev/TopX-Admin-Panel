import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router"; 
import axios from "../../axios";  // Import axios to make API calls
import { ChevronLeft } from "lucide-react";
import { ErrorToast, SuccessToast } from "../../components/global/Toaster";

// Utility component to handle image errors safely
const UserProfileImage = ({ src, alt, fallback }) => {
  const [imgSrc, setImgSrc] = useState(src);

  useEffect(() => {
    setImgSrc(src);
  }, [src]);

  const handleError = () => {
    if (imgSrc !== fallback) {
      setImgSrc(fallback);
    }
  };

  return (
    <img
      src={imgSrc}
      alt={alt}
      className="w-32 h-32 object-cover rounded-full border-4 border-orange-400 shadow-lg"
      onError={handleError}
    />
  );
};

const UserDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Receive user object from Users page
  const user = location.state?.user;

  // If user manually refreshes → no state → redirect
  if (!user) {
    navigate("/app/users");
    return null;
  }

  const [isSuspended, setIsSuspended] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Handle Suspend User Action
  const handleSuspendUser = async (userId) => {
    try {
      setIsLoading(true);
      const res = await axios.put(`/users/${userId}`, { suspended: true });

      if (res.data.success) {
        setIsSuspended(true);
        SuccessToast("User has been suspended successfully.");
      } else {
        ErrorToast("Failed to suspend user.");
      }
    } catch (error) {
      console.error("Error suspending user:", error);
      ErrorToast("Error suspending user. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 pt-2 min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <div className="relative p-8 rounded-2xl bg-white shadow-xl border border-[#E56F41]/40">
        <h1 className="text-4xl font-bold text-[#DE4B12]">User Details</h1>
      </div>

      {/* User Info */}
      <div className="mt-8 bg-white p-6 rounded-xl shadow-md">
        <div className="flex items-center space-x-8">
          {/* Left Side: Image + Basic Info */}
          <div className="flex items-center space-x-6 flex-grow">
            <UserProfileImage
              src={user.profilePicture}
              alt={user.name}
              fallback="https://placehold.co/600x400/1f2937/ffffff?text=No+Image"
            />

            <div>
              <h2 className="text-2xl font-semibold">{user.name}</h2>
              <p className="text-sm text-gray-500">{user.email}</p>
              <p className="text-sm text-gray-500">
                {user.phone || "Phone number not available"}
              </p>

              <p className="text-xs text-gray-400 mt-1 italic">
                Member since {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Right Side: Stats */}
          <div className="flex items-center gap-4 text-center">
            <div>
              <p className="text-orange-500 font-bold text-xl">
                {user.postsCount}
              </p>
              <p className="text-sm tracking-wider text-gray-500">Posts</p>
            </div>

            <div>
              <p className="text-orange-500 font-bold text-xl">
                {user.followersCount}
              </p>
              <p className="text-sm tracking-wider text-gray-500">Followers</p>
            </div>

            <div>
              <p className="text-orange-500 font-bold text-xl">
                {user.followingCount}
              </p>
              <p className="text-sm tracking-wider text-gray-500">Following</p>
            </div>
          </div>
        </div>

        {/* Suspend User Button */}
        {/* <div className="mt-6 text-center">
          <button
            onClick={() => handleSuspendUser(user._id)}
            disabled={isSuspended || isLoading}
            className={`px-6 py-3 text-white font-semibold rounded-lg transition ${
              isSuspended ? "bg-gray-500 cursor-not-allowed" : "bg-red-500 hover:bg-red-600"
            }`}
          >
            {isSuspended ? "User Suspended" : isLoading ? "Suspending..." : "Suspend User"}
          </button>
        </div> */}
      </div>
    </div>
  );
};

export default UserDetails;
