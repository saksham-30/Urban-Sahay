import { useAppMode } from "@/hooks/useAppMode";
import { useAuth } from "@/hooks/useAuth";
import { Briefcase, UserCircle } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const ModeToggle = () => {
  const { mode, setMode } = useAppMode();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Show toggle for all logged-in users
  if (!user) return null;

  const toggle = () => {
    if (mode === "customer") {
      setMode("provider");
      navigate("/provider-dashboard");
    } else {
      setMode("customer");
      if (location.pathname === "/provider-dashboard") {
        navigate("/");
      }
    }
  };

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border border-border hover:border-primary/40"
      style={{
        background: mode === "provider"
          ? "hsl(var(--primary) / 0.1)"
          : "hsl(var(--secondary))",
      }}
    >
      {mode === "customer" ? (
        <>
          <UserCircle className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-muted-foreground">Customer Mode</span>
        </>
      ) : (
        <>
          <Briefcase className="w-3.5 h-3.5 text-primary" />
          <span className="text-primary">Provider Mode</span>
        </>
      )}
    </button>
  );
};

export default ModeToggle;
