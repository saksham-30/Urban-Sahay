import {
  ClipboardList, CheckCircle, IndianRupee, Star, Clock,
  ThumbsUp, AlertCircle, TrendingUp, TrendingDown
} from "lucide-react";

interface Props {
  rating: number | null;
}

const stats = [
  { label: "Requests", value: "124", trend: "+12%", up: true, icon: ClipboardList },
  { label: "Completed", value: "98", trend: "+8%", up: true, icon: CheckCircle },
  { label: "Earnings", value: "₹42.5K", trend: "+18%", up: true, icon: IndianRupee },
  { label: "Rating", value: "4.8", trend: "+0.2", up: true, icon: Star, useRating: true },
  { label: "Response", value: "< 8 min", trend: "-3 min", up: true, icon: Clock },
  { label: "Satisfaction", value: "96%", trend: "+2%", up: true, icon: ThumbsUp },
  { label: "Pending", value: "5", trend: "+2", up: false, icon: AlertCircle },
];

const DashboardStatsStrip = ({ rating }: Props) => {
  return (
    <div className="w-full overflow-x-auto scrollbar-hide">
      <div className="flex items-stretch gap-2 min-w-max py-1">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const TrendIcon = stat.up ? TrendingUp : TrendingDown;
          const displayValue = stat.useRating ? (rating?.toFixed(1) || stat.value) : stat.value;

          return (
            <div
              key={stat.label}
              className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl glass-card border-border/30 hover:shadow-card transition-all duration-200 group cursor-default"
            >
              <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Icon className="w-3.5 h-3.5 text-primary" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-foreground leading-none">{displayValue}</span>
                  <span className={`flex items-center gap-0.5 text-[10px] font-semibold leading-none ${stat.up ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"}`}>
                    <TrendIcon className="w-2.5 h-2.5" />
                    {stat.trend}
                  </span>
                </div>
                <span className="text-[10px] text-muted-foreground leading-tight mt-0.5">{stat.label}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DashboardStatsStrip;
