import { Navigate, Outlet } from "react-router-dom";
import { getStoredRole, isSessionActive } from "@/lib/auth";

type ProtectedRouteProps = {
  allow: Array<"admin" | "super-admin" | "user">;
  redirectTo?: string;
};

const ProtectedRoute = ({ allow, redirectTo = "/login" }: ProtectedRouteProps) => {
  const isAuthenticated = isSessionActive();
  const role = getStoredRole();

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  if (!role || !allow.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
