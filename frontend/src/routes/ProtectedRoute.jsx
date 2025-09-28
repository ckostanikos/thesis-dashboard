
import { Navigate, useLocation } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const location = useLocation();
  let hasUser = false;
  try {
    hasUser = !!JSON.parse(localStorage.getItem("user") || "null");
  } catch {}

  if (!hasUser) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return children;
}