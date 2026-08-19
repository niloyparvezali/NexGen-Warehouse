import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "../context/auth/useAuth";
import { hasModulePermission } from "../utils/permissions";

const PermissionRoute = ({ module, action = "view", redirectTo = "/dashboard" }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (module && !hasModulePermission(user, module, action)) {
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
};

export default PermissionRoute;
