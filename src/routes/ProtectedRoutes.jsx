// src/components/ProtectedRoute.tsx
import React from "react";
import { Navigate, Outlet } from "react-router";
import Cookies from "js-cookie";

const ProtectedRoutes = () => {
  const token = Cookies.get("token");

  if (!token) {
    return <Navigate to="/auth/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoutes;
