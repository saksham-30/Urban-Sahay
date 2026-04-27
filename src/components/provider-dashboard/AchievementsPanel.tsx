import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Trophy, Star, Zap, Shield, Flame, Award, Target, Crown,
  Heart, Sparkles, TrendingUp, Clock
} from "lucide-react";
import { motion } from "framer-motion";

interface MilestoneConfig {
  id: string;
  icon: React.ElementType;
  label: string;
  description: string;
  threshold: number;
  metric: "jobs" | "rating" | "reviews" | "streak" | "speed";
  color: string;
  bgColor: string;
  tier: "bronze" | "silver" | "gold" | "platinum";
}

const milestones: MilestoneConfig[] = [
  // Jobs completed milestones
  { id: "first-job", icon: Zap, label: "First Spark", description: "Complete your first job", threshold: 1, metric: "jobs", color: "text-amber-600", bgColor: "bg-amber-500/15", tier: "bronze" },
  { id: "10-jobs", icon: Flame, label: "On Fire", description: "Complete 10 jobs", threshold: 10, metric: "jobs", color: "text-orange-500", bgColor: "bg-orange-500/15", tier: "bronze" },
  { id: "25-jobs", icon: Target, label: "Sharpshooter", description: "Complete 25 jobs", threshold: 25, metric: "jobs", color: "text-blue-500", bgColor: "bg-blue-500/15", tier: "silver" },
  { id: "50-jobs", icon: Award, label: "Pro Provider", description: "Complete 50 jobs", threshold: 50, metric: "jobs", color: "text-violet-500", bgColor: "bg-violet-500/15", tier: "silver" },
  { id: "100-jobs", icon: Crown, label: "Century Club", description: "Complete 100 jobs", threshold: 100, metric: "jobs", color: "text-yellow-500", bgColor: "bg-yellow-500/15", tier: "gold" },
  { id: "200-jobs", icon: Trophy, label: "Legend", description: "Complete 200 jobs", threshold: 200, metric: "jobs", color: "text-primary", bgColor: "bg-primary/15", tier: "platinum" },
  
  // Rating milestones
  { id: "rating-4", icon: Star, label: "Rising Star", description: "Achieve 4.0+ rating", threshold: 4.0, metric: "rating", color: "text-amber-500", bgColor: "bg-amber-500/15", tier: "bronze" },
  { id: "rating-45", icon: Sparkles, label: "Superstar", description: "Achieve 4.5+ rating", threshold: 4.5, metric: "rating", color: "text-yellow-500", bgColor: "bg-yellow-500/15", tier: "silver" },
  { id: "rating-48", icon: Crown, label: "Elite", description: "Achieve 4.8+ rating", threshold: 4.8, metric: "rating", color: "text-primary", bgColor: "bg-primary/15", tier: "gold" },
  
  // Reviews milestones
  { id: "10-reviews", icon: Heart, label: "Crowd Fave", description: "Get 10 reviews", threshold: 10, metric: "reviews", color: "text-rose-500", bgColor: "bg-rose-500/15", tier: "bronze" },
  { id: "50-reviews", icon: TrendingUp, label: "Trending", description: "Get 50 reviews", threshold: 50, metric: "reviews", color: "text-emerald-500", bgColor: "bg-emerald-500/15", tier: "silver" },
  { id: "100-reviews", icon: Shield, label: "Trusted", description: "Get 100 reviews", threshold: 100, metric: "reviews", color: "text-blue-600", bgColor: "bg-blue-600/15", tier: "gold" },
];

const tierConfig = {
  bronze: { label: "Bronze", border: "border-amber-600/30", ring: "ring-amber-600/20" },
  silver: { label: "Silver", border: "border-slate-400/40", ring: "ring-slate-400/20" },
  gold: { label: "Gold", border: "border-yellow-500/40", ring: "ring-yellow-500/20" },
  platinum: { label: "Platinum", border: "border-primary/40", ring: "ring-primary/20" },
};

interface Props {
  completedJobs?: number;
  rating?: number | null;
  totalReviews?: number | null;
}

const AchievementsPanel = ({ completedJobs = 98, rating = 4.8, totalReviews = 120 }: Props) => {
  const getMetricValue = (metric: string) => {
    switch (metric) {
      case "jobs": return completedJobs;
      case "rating": return rating ?? 0;
      case "reviews": return totalReviews ?? 0;
      default: return 0;
    }
  };

  const earned = milestones.filter(m => getMetricValue(m.metric) >= m.threshold);
  const nextUp = milestones.filter(m => getMetricValue(m.metric) < m.threshold).slice(0, 3);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <Card className="glass-card border-border/30 shadow-card">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
              <div className="w-8 h-8 rounded-lg bg-yellow-500/15 flex items-center justify-center">
                <Trophy className="w-4 h-4 text-yellow-500" />
              </div>
              Achievements & Milestones
            </CardTitle>
            <Badge variant="secondary" className="text-xs">
              {earned.length}/{milestones.length} unlocked
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Earned Badges */}
          {earned.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Earned Badges</p>
              <div className="flex flex-wrap gap-3">
                {earned.map((m, i) => {
                  const Icon = m.icon;
                  const tier = tierConfig[m.tier];
                  return (
                    <motion.div
                      key={m.id}
                      initial={{ scale: 0, rotate: -20 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.1 + i * 0.05, type: "spring", stiffness: 300 }}
                      className={`group relative flex flex-col items-center gap-1.5 p-3 rounded-xl border ${tier.border} ${m.bgColor} hover:ring-2 ${tier.ring} transition-all cursor-default min-w-[80px]`}
                    >
                      <div className="relative">
                        <Icon className={`w-6 h-6 ${m.color}`} />
                        <span className="absolute -top-1 -right-2 text-[8px] font-bold text-muted-foreground bg-background rounded px-1 border border-border">
                          {tier.label.charAt(0)}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-foreground text-center leading-tight">
                        {m.label}
                      </span>
                      {/* Tooltip on hover */}
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-foreground text-background text-[9px] px-2 py-1 rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg z-10">
                        {m.description}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Next Milestones */}
          {nextUp.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Next Milestones</p>
              <div className="space-y-3">
                {nextUp.map((m) => {
                  const Icon = m.icon;
                  const currentVal = getMetricValue(m.metric);
                  const progress = Math.min((currentVal / m.threshold) * 100, 99);
                  const remaining = m.metric === "rating"
                    ? `${(m.threshold - (currentVal as number)).toFixed(1)} more`
                    : `${Math.ceil(m.threshold - (currentVal as number))} more`;

                  return (
                    <div
                      key={m.id}
                      className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/20"
                    >
                      <div className={`w-10 h-10 rounded-lg ${m.bgColor} flex items-center justify-center flex-shrink-0 opacity-50`}>
                        <Icon className={`w-5 h-5 ${m.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-semibold text-foreground">{m.label}</span>
                          <span className="text-[10px] text-muted-foreground">{remaining}</span>
                        </div>
                        <Progress value={progress} className="h-1.5" />
                        <p className="text-[10px] text-muted-foreground mt-1">{m.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Level summary */}
          <div className="flex items-center justify-between pt-2 border-t border-border/20">
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                {completedJobs} jobs · {rating?.toFixed(1) ?? "0"} ⭐ · {totalReviews} reviews
              </span>
            </div>
            <Badge
              variant="outline"
              className={`text-[10px] ${
                earned.length >= 10
                  ? "border-primary text-primary"
                  : earned.length >= 6
                  ? "border-yellow-500 text-yellow-600"
                  : earned.length >= 3
                  ? "border-slate-400 text-slate-500"
                  : "border-amber-600 text-amber-600"
              }`}
            >
              {earned.length >= 10 ? "Platinum" : earned.length >= 6 ? "Gold" : earned.length >= 3 ? "Silver" : "Bronze"} Tier
            </Badge>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AchievementsPanel;
