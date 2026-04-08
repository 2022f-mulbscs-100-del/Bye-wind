import { Navigate, Outlet } from "react-router-dom";
import { getStoredRole, isSessionActive } from "@/lib/auth";
import type { BrowserRole } from "@/lib/auth";

type ProtectedRouteProps = {
  allow: Array<BrowserRole | "super-admin">;
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
