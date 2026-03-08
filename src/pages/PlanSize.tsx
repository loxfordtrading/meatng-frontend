import { Navigate } from "react-router-dom";
import { ROUTES } from "@/lib/routes";

const PlanSize = () => <Navigate to={ROUTES.plans} replace />;

export default PlanSize;
