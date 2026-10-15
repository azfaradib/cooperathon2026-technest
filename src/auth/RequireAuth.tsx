import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth, type Role } from "./AuthContext";

interface Props {
  role: Role;
  children: ReactNode;
}

function RequireAuth({ role, children }: Props) {
  const { role: current, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-gray-500">
        Loading…
      </div>
    );
  }
  if (!current) return <Navigate to="/login" replace />;
  if (current !== role) {
    return <Navigate to={current === "admin" ? "/" : "/customer"} replace />;
  }
  return <>{children}</>;
}

export default RequireAuth;
