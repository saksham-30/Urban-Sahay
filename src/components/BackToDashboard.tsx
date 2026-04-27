import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppMode } from "@/hooks/useAppMode";
import { Button } from "@/components/ui/button";

const BackToDashboard = () => {
  const { isProviderMode } = useAppMode();
  const navigate = useNavigate();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => navigate(isProviderMode ? "/provider-dashboard" : "/")}
      className="mb-4 text-muted-foreground hover:text-foreground gap-1.5"
    >
      <ArrowLeft className="w-4 h-4" />
      {isProviderMode ? "Back to Dashboard" : "Back to Home"}
    </Button>
  );
};

export default BackToDashboard;
