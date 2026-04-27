import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { CheckCircle, MapPin, Wrench, Radar } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

interface ProviderProfile {
  full_name: string;
  service_type: string;
  city: string;
  rating: number | null;
  total_reviews: number | null;
  is_available: boolean | null;
  is_verified: boolean | null;
  experience_years: number | null;
  hourly_rate: string | null;
  description: string | null;
  service_radius: number;
}

type AvailabilityStatus = "online" | "busy" | "offline";

interface Props {
  profile: ProviderProfile | null;
  availabilityStatus: AvailabilityStatus;
  setAvailabilityStatus: (s: AvailabilityStatus) => void;
  onToggleAvailability: (s: AvailabilityStatus) => void;
  onRadiusChange?: (radius: number) => void;
}

const statusConfig: Record<AvailabilityStatus, { label: string; color: string; dot: string }> = {
  online: { label: "Online", color: "bg-emerald-500/20 text-emerald-700 dark:text-emerald-400", dot: "bg-emerald-500" },
  busy: { label: "Busy", color: "bg-amber-500/20 text-amber-700 dark:text-amber-400", dot: "bg-amber-500" },
  offline: { label: "Offline", color: "bg-destructive/20 text-destructive", dot: "bg-destructive" },
};

const DashboardWelcomeBanner = ({ profile, availabilityStatus, setAvailabilityStatus, onToggleAvailability, onRadiusChange }: Props) => {
  const [localRadius, setLocalRadius] = useState(profile?.service_radius ?? 10);
  const [isOpen, setIsOpen] = useState(false);

  const getInitials = () => {
    if (!profile?.full_name) return "P";
    return profile.full_name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const statuses: AvailabilityStatus[] = ["online", "busy", "offline"];
  const currentRadius = profile?.service_radius ?? 10;

  const handleRadiusSave = () => {
    onRadiusChange?.(localRadius);
    setIsOpen(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-2xl gradient-hero p-6 md:p-8"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-background/20 -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-background/10 translate-y-1/3 -translate-x-1/4" />
      </div>

      <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-5">
        {/* Left: Avatar + Info */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar className="w-16 h-16 border-3 border-primary-foreground/30 shadow-lg">
              <AvatarFallback className="bg-primary-foreground/20 text-primary-foreground text-xl font-bold">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            {profile?.is_verified && (
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary-foreground flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-primary" />
              </div>
            )}
          </div>
          <div className="text-primary-foreground">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl md:text-2xl font-bold">
                Welcome, {profile?.full_name || "Provider"} 👋
              </h1>
              {profile?.is_verified && (
                <Badge className="bg-primary-foreground/20 text-primary-foreground border-0 text-xs">
                  <CheckCircle className="w-3 h-3 mr-1" /> Verified
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-3 mt-1.5 text-primary-foreground/80 text-sm flex-wrap">
              <span className="flex items-center gap-1">
                <Wrench className="w-3.5 h-3.5" /> {profile?.service_type || "Service Provider"}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> {profile?.city || "Location"}
              </span>
              {profile?.experience_years && (
                <span>{profile.experience_years}+ yrs exp</span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Controls */}
        <div className="flex flex-col gap-3 items-end">
          {/* Availability Toggle */}
          <div className="flex items-center gap-2 bg-primary-foreground/15 backdrop-blur-sm rounded-xl p-1.5">
            {statuses.map((s) => {
              const cfg = statusConfig[s];
              const isActive = availabilityStatus === s;
              return (
                <button
                  key={s}
                  onClick={() => {
                    setAvailabilityStatus(s);
                    onToggleAvailability(s);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "bg-primary-foreground text-primary shadow-md"
                      : "text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10"
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${cfg.dot} ${isActive ? "animate-pulse-soft" : ""}`} />
                  {cfg.label}
                </button>
              );
            })}
          </div>

          {/* Service Radius Button */}
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2 bg-primary-foreground/15 backdrop-blur-sm rounded-xl px-3 py-2 h-auto text-primary-foreground hover:bg-primary-foreground/25 hover:text-primary-foreground"
              >
                <Radar className="w-4 h-4" />
                <span className="text-sm font-medium">{currentRadius} km</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-4" align="end">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-sm">Service Radius</h4>
                  <span className="text-lg font-bold text-primary">{localRadius} km</span>
                </div>
                <Slider
                  value={[localRadius]}
                  onValueChange={(v) => setLocalRadius(v[0])}
                  min={1}
                  max={50}
                  step={1}
                  className="w-full"
                />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>1 km</span>
                  <span>50 km</span>
                </div>
                <Button onClick={handleRadiusSave} className="w-full" size="sm">
                  Apply Radius
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </motion.div>
  );
};

export default DashboardWelcomeBanner;
