import { Navigate, Outlet } from "react-router-dom";

type ProtectedRouteProps = {
  allow: Array<"admin" | "super-admin" | "user">;
  redirectTo?: string;
};

const ProtectedRoute = ({ allow, redirectTo = "/login" }: ProtectedRouteProps) => {
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
  const role = localStorage.getItem("auth_role") as
    | "admin"
    | "super-admin"
    | "user"
    | null;

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  if (!role || !allow.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
