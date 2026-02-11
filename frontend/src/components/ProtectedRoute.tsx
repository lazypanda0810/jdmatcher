import { Navigate } from "react-router-dom";
import { authService } from "@/services/api";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const user = authService.getUser();
  const isAuth = authService.isAuthenticated();

  if (!isAuth || !user) {
    return <Navigate to="/auth?mode=login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    // Redirect to the user's own dashboard
    const redirectMap: Record<string, string> = {
      candidate: "/candidate",
      recruiter: "/recruiter",
      admin: "/admin",
    };
    return <Navigate to={redirectMap[user.role] || "/"} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
