import { Navigate, Outlet, useLocation } from "react-router-dom";
import { ROUTES } from "@/lib/routes";
import { useAuthStore } from "@/store/AuthStore";

const UserGuard = () => {
  const userInfo = useAuthStore((state) => state.userInfo);
  const location = useLocation();

  if (!userInfo?.access) {
    return <Navigate to={ROUTES.login} state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default UserGuard;