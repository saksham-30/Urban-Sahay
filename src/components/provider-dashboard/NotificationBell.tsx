import { useState } from "react";
import { Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const initialNotifications = [
  { id: 1, text: "New job request from Ravi Kumar in Kothrud", time: "2 min ago", type: "job" },
  { id: 2, text: "Payment of ₹1,200 received for Koregaon Park job", time: "1 hr ago", type: "payment" },
  { id: 3, text: "Priya Sharma (Hinjewadi) sent a message", time: "2 hrs ago", type: "message" },
  { id: 4, text: "Your weekly earnings report is ready", time: "5 hrs ago", type: "report" },
];

const typeEmoji: Record<string, string> = {
  job: "🔔",
  payment: "💰",
  message: "💬",
  report: "📊",
};

const routeMap: Record<string, string> = {
  job: "/my-requests",
  payment: "/service-history",
  message: "/notifications",
  report: "/service-history",
};

const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState(initialNotifications);
  const navigate = useNavigate();

  const handleClick = (n: typeof initialNotifications[0]) => {
    setNotifications(prev => prev.filter(item => item.id !== n.id));
    setOpen(false);
    navigate(routeMap[n.type] || "/notifications");
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button className="relative p-2 rounded-xl glass-card border-border/30 hover:shadow-card transition-all">
          <Bell className="w-5 h-5 text-foreground" />
          {notifications.length > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive text-primary-foreground text-[10px] font-bold flex items-center justify-center">
              {notifications.length}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-2">
        <p className="text-sm font-bold text-foreground px-2 py-1.5">Notifications</p>
        {notifications.length === 0 ? (
          <p className="text-xs text-muted-foreground px-2 py-4 text-center">All caught up! ✅</p>
        ) : (
          notifications.map((n) => (
            <DropdownMenuItem key={n.id} className="flex items-start gap-2 px-2 py-2.5 cursor-pointer" onClick={() => handleClick(n)}>
              <span className="text-lg">{typeEmoji[n.type]}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground">{n.text}</p>
                <p className="text-xs text-muted-foreground">{n.time}</p>
              </div>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationBell;
