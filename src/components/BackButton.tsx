import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export const BackButton = () => {
  const navigate = useNavigate();

  return (
    <button
      className="h-9 w-12 rounded-full"
      onClick={() => navigate(-1)}
    >
      <ArrowLeft className="h-5 w-5 text-muted-foreground hover:text-primary" />
    </button>
  );
};