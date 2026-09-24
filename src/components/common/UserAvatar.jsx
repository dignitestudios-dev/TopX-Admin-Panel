/* eslint-disable react/prop-types */
import { useState } from "react";
import { User } from "lucide-react";

export const UserAvatar = ({
  src,
  alt = "User Avatar",
  name = "",
  size = "md", // "sm", "md", "lg", "xl"
  className = "",
}) => {
  const [hasError, setHasError] = useState(false);

  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-12 h-12 text-sm",
    lg: "w-16 h-16 text-base",
    xl: "w-24 h-24 text-xl",
    "2xl": "w-28 h-28 text-2xl",
  };

  const getInitials = (n) => {
    if (!n) return "";
    const parts = n.trim().split(" ");
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  if (!src || hasError) {
    const initials = getInitials(name);
    return (
      <div
        className={`flex items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-[#DE4B12] text-white font-semibold flex-shrink-0 shadow-sm ${
          sizeClasses[size] || sizeClasses.md
        } ${className}`}
      >
        {initials ? initials : <User className="w-1/2 h-1/2 opacity-90" />}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setHasError(true)}
      className={`rounded-full object-cover flex-shrink-0 ${
        sizeClasses[size] || sizeClasses.md
      } ${className}`}
    />
  );
};

export default UserAvatar;
