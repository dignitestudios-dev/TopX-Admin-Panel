import React from "react";

// Simplified Skeleton Loader
const CustomLoader = ({ imageHeight = "h-48", titleHeight = "h-6", subtitleHeight = "h-5", className = "" }) => {
  return (
    <div className={`bg-white w-full rounded-xl border border-gray-100 overflow-hidden shadow-lg ${className}`}>
      {/* Image Skeleton */}
      <div className={`w-full ${imageHeight} bg-gray-300 animate-pulse rounded-t-xl`}></div>

      {/* Content Skeleton */}
      <div className="p-4 flex flex-col space-y-3">
        {/* Title Skeleton */}
        <div className={`${titleHeight} bg-gray-300 animate-pulse rounded-md`}></div>

        {/* Subtitle Skeleton */}
        <div className={`${subtitleHeight} bg-gray-300 animate-pulse rounded-md`}></div>
      </div>
    </div>
  );
};

export default CustomLoader;
