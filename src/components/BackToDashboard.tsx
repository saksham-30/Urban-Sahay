import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppMode } from "@/hooks/useAppMode";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/useLanguage";

const BackToDashboard = () => {
  const { isProviderMode } = useAppMode();
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => navigate("/provider-dashboard")}
      className="mb-4 text-muted-foreground hover:text-foreground gap-1.5"
    >
      <ArrowLeft className="w-4 h-4" />
      {t('common.backToDashboard')}
    </Button>
  );
};

export default BackToDashboard;
