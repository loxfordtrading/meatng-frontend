import { Navigate } from "react-router-dom";
import { ROUTES } from "@/lib/routes";

const PlanFrequency = () => <Navigate to={ROUTES.plans} replace />;

export default PlanFrequency;
