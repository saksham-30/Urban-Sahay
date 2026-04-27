import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useAppMode } from "@/hooks/useAppMode";
import {
  User, Shield, ClipboardList, History, Settings, LogOut,
  HelpCircle, Bell, Star, ChevronDown, Briefcase, BarChart3,
  MapPin, Wallet, Calendar, MessageSquare, Award, FileCheck
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface MenuItemType {
  icon: React.ElementType;
  label: string;
  description: string;
  action: () => void;
}

interface MenuGroup {
  label: string;
  items: MenuItemType[];
}

const ProfileDropdown = ({ variant = "desktop" }: { variant?: "desktop" | "mobile" }) => {
  const navigate = useNavigate();
  const { user, userRole, signOut } = useAuth();
  const { mode } = useAppMode();

  if (!user) return null;

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const getInitials = () => user?.email?.charAt(0).toUpperCase() || "U";

  const isProvider = mode === "provider";

  const customerGroups: MenuGroup[] = [
    {
      label: "Account",
      items: [
        { icon: User, label: "My Profile", description: "View & edit your profile", action: () => navigate("/profile") },
        { icon: Shield, label: "KYC Verification", description: "Verify your identity", action: () => navigate("/kyc-verification") },
      ],
    },
    {
      label: "Services",
      items: [
        { icon: ClipboardList, label: "My Requests", description: "Track active requests", action: () => navigate("/my-requests") },
        { icon: History, label: "Service History", description: "Past completed services", action: () => navigate("/service-history") },
        { icon: Star, label: "My Reviews", description: "Reviews you've given", action: () => navigate("/my-reviews") },
      ],
    },
    {
      label: "General",
      items: [
        { icon: Bell, label: "Notifications", description: "Manage alerts", action: () => navigate("/notifications") },
        { icon: Settings, label: "Settings", description: "Account preferences", action: () => navigate("/settings") },
        { icon: HelpCircle, label: "Help & Support", description: "Get assistance", action: () => navigate("/support") },
      ],
    },
  ];

  const providerGroups: MenuGroup[] = [
    {
      label: "Professional",
      items: [
        { icon: Briefcase, label: "Provider Profile", description: "Manage your professional profile", action: () => navigate("/provider-profile") },
        { icon: BarChart3, label: "Dashboard", description: "View stats & earnings", action: () => navigate("/provider-dashboard") },
        { icon: FileCheck, label: "KYC Verification", description: "Verify your identity", action: () => navigate("/kyc-verification") },
      ],
    },
    {
      label: "Work",
      items: [
        { icon: ClipboardList, label: "Job Requests", description: "Manage incoming jobs", action: () => navigate("/my-requests") },
        { icon: History, label: "Job History", description: "Completed jobs & payments", action: () => navigate("/service-history") },
        { icon: MessageSquare, label: "Messages", description: "Customer conversations", action: () => navigate("/chat") },
      ],
    },
    {
      label: "General",
      items: [
        { icon: Bell, label: "Notifications", description: "Alerts & updates", action: () => navigate("/notifications") },
        { icon: Settings, label: "Settings", description: "Account preferences", action: () => navigate("/settings") },
        { icon: HelpCircle, label: "Help & Support", description: "Get assistance", action: () => navigate("/support") },
      ],
    },
  ];

  const menuGroups = isProvider ? providerGroups : customerGroups;

  const roleLabel = isProvider ? "Provider" : "Customer";
  const roleBadgeClass = isProvider
    ? "bg-primary/10 text-primary border-primary/20"
    : "bg-accent/10 text-accent border-accent/20";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {variant === "desktop" ? (
          <button className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-secondary/50 transition-colors focus:outline-none">
            <Avatar className="w-8 h-8 border-2 border-primary/30">
              <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <div className="text-left hidden lg:block">
              <p className="text-sm font-medium text-foreground leading-none">
                {user.email?.split("@")[0]}
              </p>
              <p className="text-xs text-muted-foreground">{roleLabel}</p>
            </div>
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </button>
        ) : (
          <button className="p-1 focus:outline-none">
            <Avatar className="w-8 h-8 border-2 border-primary/30">
              <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
          </button>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className={`${variant === "desktop" ? "w-72" : "w-64"} p-1.5`}
      >
        {/* Header */}
        <DropdownMenuLabel className="px-3 py-2.5">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10 border-2 border-primary/20">
              <AvatarFallback className="bg-primary/10 text-primary font-bold">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">
                {user.email?.split("@")[0]}
              </p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
          <div className="mt-2">
            <Badge variant="outline" className={`text-[10px] font-semibold ${roleBadgeClass}`}>
              {isProvider ? "🔧 Provider Mode" : "👤 Customer Mode"}
            </Badge>
          </div>
        </DropdownMenuLabel>

        {/* Grouped menu items */}
        {menuGroups.map((group, gi) => (
          <div key={group.label}>
            <DropdownMenuSeparator />
            <p className="px-3 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
              {group.label}
            </p>
            <DropdownMenuGroup>
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <DropdownMenuItem
                    key={item.label}
                    onClick={item.action}
                    className="flex items-center gap-3 px-3 py-2 cursor-pointer rounded-md mx-1"
                  >
                    <div className="w-7 h-7 rounded-lg bg-secondary/80 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-3.5 h-3.5 text-foreground/70" />
                    </div>
                    {variant === "desktop" ? (
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{item.label}</p>
                        <p className="text-[11px] text-muted-foreground leading-tight">{item.description}</p>
                      </div>
                    ) : (
                      <span className="text-sm font-medium text-foreground">{item.label}</span>
                    )}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuGroup>
          </div>
        ))}

        {/* Sign out */}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2 cursor-pointer rounded-md mx-1 text-destructive focus:text-destructive"
        >
          <div className="w-7 h-7 rounded-lg bg-destructive/10 flex items-center justify-center flex-shrink-0">
            <LogOut className="w-3.5 h-3.5" />
          </div>
          {variant === "desktop" ? (
            <div>
              <p className="text-sm font-medium">Sign Out</p>
              <p className="text-[11px] opacity-70">Log out of your account</p>
            </div>
          ) : (
            <span className="text-sm font-medium">Sign Out</span>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ProfileDropdown;
