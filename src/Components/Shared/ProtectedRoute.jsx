import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  const token = localStorage.getItem("token");

  // If no token, redirect to login page
  return token ? <Outlet /> : <Navigate to="/auth" replace />;
};

export default ProtectedRoute;
