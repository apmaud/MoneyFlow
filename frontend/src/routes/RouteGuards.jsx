import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectIsAuthenticated } from "../store/authSlice";

// Wraps routes that require a logged-in user
export function RequireAuth() {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

// Wraps routes that only make sense for a logged-out visitor
export function RequireGuest() {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  return isAuthenticated ? <Navigate to="/home" replace /> : <Outlet />;
}
