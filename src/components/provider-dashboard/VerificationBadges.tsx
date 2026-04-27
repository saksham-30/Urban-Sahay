import { BadgeCheck, ShieldCheck, Fingerprint, Award, Star, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";

interface VerificationBadgesProps {
  isKYCVerified?: boolean;
  isBackgroundChecked?: boolean;
  isSkillCertified?: boolean;
  rating?: number | null;
  experienceYears?: number | null;
  compact?: boolean;
}

const badges = [
  {
    key: "kyc",
    label: "Identity Verified",
    description: "Aadhaar & selfie verified via e-KYC",
    icon: Fingerprint,
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-500/10",
  },
  {
    key: "background",
    label: "Background Checked",
    description: "Police verification & address confirmed",
    icon: ShieldCheck,
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-500/10",
  },
  {
    key: "skill",
    label: "Skill Certified",
    description: "Professional skill assessment passed",
    icon: Award,
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-500/10",
  },
];

const VerificationBadges = ({
  isKYCVerified = true,
  isBackgroundChecked = true,
  isSkillCertified = false,
  rating,
  experienceYears,
  compact = false,
}: VerificationBadgesProps) => {
  const activeBadges = [
    isKYCVerified && badges[0],
    isBackgroundChecked && badges[1],
    isSkillCertified && badges[2],
  ].filter(Boolean) as typeof badges;

  if (compact) {
    return (
      <TooltipProvider>
        <div className="flex items-center gap-1">
          {activeBadges.map(b => {
            const Icon = b.icon;
            return (
              <Tooltip key={b.key}>
                <TooltipTrigger asChild>
                  <div className={`w-5 h-5 rounded-full ${b.bg} flex items-center justify-center`}>
                    <Icon className={`w-3 h-3 ${b.color}`} />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  <p className="font-semibold">{b.label}</p>
                  <p className="text-muted-foreground">{b.description}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
          {activeBadges.length === 3 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-0 text-[9px] px-1.5 py-0 h-5">
                  <BadgeCheck className="w-3 h-3 mr-0.5" /> Trusted
                </Badge>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                Fully verified professional on UrbanSahay
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </TooltipProvider>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Trust & Verification</p>
      <div className="grid grid-cols-1 gap-2">
        {badges.map(b => {
          const Icon = b.icon;
          const isActive = (b.key === "kyc" && isKYCVerified) ||
            (b.key === "background" && isBackgroundChecked) ||
            (b.key === "skill" && isSkillCertified);
          return (
            <div
              key={b.key}
              className={`flex items-center gap-2.5 p-2.5 rounded-lg border transition-all ${
                isActive
                  ? `${b.bg} border-transparent`
                  : "bg-muted/30 border-border/20 opacity-40"
              }`}
            >
              <div className={`w-8 h-8 rounded-lg ${isActive ? b.bg : "bg-muted/50"} flex items-center justify-center`}>
                <Icon className={`w-4 h-4 ${isActive ? b.color : "text-muted-foreground"}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-semibold ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                  {b.label}
                </p>
                <p className="text-[10px] text-muted-foreground">{b.description}</p>
              </div>
              {isActive && <BadgeCheck className={`w-4 h-4 ${b.color} flex-shrink-0`} />}
            </div>
          );
        })}
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-3 pt-1">
        {rating != null && rating > 0 && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span className="font-semibold text-foreground">{rating.toFixed(1)}</span>
          </div>
        )}
        {experienceYears != null && experienceYears > 0 && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="w-3.5 h-3.5" />
            <span>{experienceYears} yr{experienceYears > 1 ? "s" : ""} exp</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerificationBadges;
