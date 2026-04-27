import { motion } from "framer-motion";
import {
  ClipboardList, CheckCircle, IndianRupee, Star, Clock,
  ThumbsUp, AlertCircle, TrendingUp, TrendingDown
} from "lucide-react";

interface StatItem {
  label: string;
  value: string;
  trend: string;
  trendUp: boolean;
  icon: React.ElementType;
  gradient: string;
}

interface Props {
  rating: number | null;
}

const DashboardStatsGrid = ({ rating }: Props) => {
  const stats: StatItem[] = [
    { label: "Total Requests", value: "124", trend: "+12%", trendUp: true, icon: ClipboardList, gradient: "gradient-teal" },
    { label: "Completed Jobs", value: "98", trend: "+8%", trendUp: true, icon: CheckCircle, gradient: "gradient-emerald" },
    { label: "Monthly Earnings", value: "₹42,500", trend: "+18%", trendUp: true, icon: IndianRupee, gradient: "gradient-amber" },
    { label: "Avg Rating", value: rating?.toFixed(1) || "4.8", trend: "+0.2", trendUp: true, icon: Star, gradient: "gradient-violet" },
    { label: "Response Time", value: "< 8 min", trend: "-3 min", trendUp: true, icon: Clock, gradient: "gradient-blue" },
    { label: "Satisfaction", value: "96%", trend: "+2%", trendUp: true, icon: ThumbsUp, gradient: "gradient-emerald" },
    { label: "Pending", value: "5", trend: "+2", trendUp: false, icon: AlertCircle, gradient: "gradient-rose" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        const TrendIcon = stat.trendUp ? TrendingUp : TrendingDown;
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.4 }}
            className="glass-card rounded-xl p-4 hover:shadow-card-hover transition-all duration-300 group cursor-default"
          >
            <div className={`w-9 h-9 rounded-lg ${stat.gradient} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
              <Icon className="w-4.5 h-4.5 text-primary-foreground" />
            </div>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
            <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${stat.trendUp ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"}`}>
              <TrendIcon className="w-3 h-3" />
              {stat.trend}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default DashboardStatsGrid;
