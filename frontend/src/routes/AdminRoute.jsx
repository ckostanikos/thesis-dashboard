import { Navigate } from "react-router-dom";

// AdminRoute component to protect admin-only routes
export default function AdminRoute({ children }) {
  let role = null;
  try {
    role = JSON.parse(localStorage.getItem("user") || "null")?.role;
  } catch {}
  return role === "admin" ? children : <Navigate to="/my-courses" replace />;
}
