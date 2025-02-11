import { useAuth } from "@/lib/auth";
import { Navigate } from "react-router-dom";

interface AuthGuardProps {
  children: React.ReactNode;
  requireDispatcher?: boolean;
}

export const AuthGuard = ({
  children,
  requireDispatcher = false,
}: AuthGuardProps) => {
  const { user, isDispatcher } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireDispatcher && !isDispatcher) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
