import { useState } from "react";
import { motion } from "framer-motion";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Bell, MessageSquare, CalendarDays, ShieldCheck,
  Star, CreditCard, MapPin, Megaphone, Save
} from "lucide-react";
import { toast } from "sonner";

interface NotifPref {
  key: string;
  label: string;
  description: string;
  icon: React.ElementType;
  push: boolean;
  sms: boolean;
  email: boolean;
}

const defaultPrefs: NotifPref[] = [
  { key: "booking", label: "Booking Updates", description: "When a provider accepts, arrives, or completes", icon: CalendarDays, push: true, sms: true, email: true },
  { key: "chat", label: "Chat Messages", description: "New messages from providers or customers", icon: MessageSquare, push: true, sms: false, email: false },
  { key: "safety", label: "Safety Alerts", description: "SOS triggers, identity verification alerts", icon: ShieldCheck, push: true, sms: true, email: true },
  { key: "reviews", label: "Reviews & Ratings", description: "When someone rates your service", icon: Star, push: true, sms: false, email: true },
  { key: "payments", label: "Payment Updates", description: "Payment confirmations and invoices", icon: CreditCard, push: true, sms: true, email: true },
  { key: "location", label: "Provider Tracking", description: "Real-time location updates of your provider", icon: MapPin, push: true, sms: false, email: false },
  { key: "promo", label: "Promotions & Offers", description: "Discounts, deals, and seasonal offers", icon: Megaphone, push: false, sms: false, email: true },
];

const NotificationPreferences = () => {
  const [prefs, setPrefs] = useState(defaultPrefs);
  const [hasChanges, setHasChanges] = useState(false);

  const togglePref = (key: string, channel: "push" | "sms" | "email") => {
    setPrefs((prev) =>
      prev.map((p) =>
        p.key === key ? { ...p, [channel]: !p[channel] } : p
      )
    );
    setHasChanges(true);
  };

  const handleSave = () => {
    setHasChanges(false);
    toast.success("Notification preferences saved!");
  };

  return (
    <div className="space-y-4">
      {/* Channel Header */}
      <div className="flex items-center justify-end gap-6 pr-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
        <span className="w-10 text-center">Push</span>
        <span className="w-10 text-center">SMS</span>
        <span className="w-10 text-center">Email</span>
      </div>

      {prefs.map((pref, i) => {
        const Icon = pref.icon;
        return (
          <motion.div
            key={pref.key}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="flex items-center gap-3 bg-card rounded-xl border border-border p-4 hover:border-primary/20 transition-colors"
          >
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Icon className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">{pref.label}</p>
              <p className="text-[11px] text-muted-foreground truncate">{pref.description}</p>
            </div>
            <div className="flex items-center gap-6">
              <Switch
                checked={pref.push}
                onCheckedChange={() => togglePref(pref.key, "push")}
                className="scale-90"
              />
              <Switch
                checked={pref.sms}
                onCheckedChange={() => togglePref(pref.key, "sms")}
                className="scale-90"
              />
              <Switch
                checked={pref.email}
                onCheckedChange={() => togglePref(pref.key, "email")}
                className="scale-90"
              />
            </div>
          </motion.div>
        );
      })}

      {hasChanges && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Button className="w-full" onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Save Preferences
          </Button>
        </motion.div>
      )}
    </div>
  );
};

export default NotificationPreferences;
