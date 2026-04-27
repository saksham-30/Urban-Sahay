import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { User, ClipboardList, Star, IndianRupee, HelpCircle, Shield, Bell, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";

const QuickActionsPanel = () => {
  const navigate = useNavigate();

  const actions = [
    { label: "My Profile", icon: User, action: () => navigate("/provider-profile"), gradient: "gradient-blue" },
    { label: "Pending Jobs", icon: ClipboardList, action: () => navigate("/my-requests"), gradient: "gradient-teal" },
    { label: "Chat", icon: MessageCircle, action: () => navigate("/chat"), gradient: "gradient-blue" },
    { label: "Earnings Report", icon: IndianRupee, action: () => navigate("/service-history"), gradient: "gradient-amber" },
    { label: "Reviews", icon: Star, action: () => navigate("/my-reviews"), gradient: "gradient-violet" },
    { label: "KYC Status", icon: Shield, action: () => navigate("/kyc-verification"), gradient: "gradient-emerald" },
    { label: "Notifications", icon: Bell, action: () => navigate("/notifications"), gradient: "gradient-rose" },
    { label: "Support", icon: HelpCircle, action: () => navigate("/support"), gradient: "gradient-amber" },
  ];

  return (
    <div>
      <h3 className="text-base font-bold text-foreground mb-3">Quick Actions</h3>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2">
        {actions.map((item, i) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04 }}
            >
              <Button
                variant="outline"
                className="w-full h-auto py-4 flex flex-col items-center gap-2 glass-card border-border/30 hover:shadow-card hover:border-primary/30 transition-all duration-300 group"
                onClick={item.action}
              >
                <div className={`w-9 h-9 rounded-lg ${item.gradient} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <Icon className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="text-xs font-medium text-foreground">{item.label}</span>
              </Button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActionsPanel;
