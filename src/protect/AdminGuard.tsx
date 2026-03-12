import { Navigate, Outlet, useLocation } from "react-router-dom";
import { ROUTES } from "@/lib/routes";
import { useAuthStore } from "@/store/AuthStore";
import AdminLayout from "@/components/admin/AdminLayout";

const AdminGuard = ({ children }: { children: React.ReactNode }) => {
    const userInfo = useAuthStore((state) => state.userInfo);
    const location = useLocation();
    
    if (!userInfo?.access) {
      return <Navigate to={ROUTES.adminLogin} state={{ from: location }} replace />;
    }
  
    return <AdminLayout>{children}</AdminLayout>;
};

export default AdminGuard;