import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const recentJobs = [
  { id: 1, customer: "Neha Singh", service: "AC Repair", amount: "₹1,200", status: "completed", date: "Today", rating: 5, location: "Koregaon Park, Pune" },
  { id: 2, customer: "Suresh Yadav", service: "Plumbing Fix", amount: "₹800", status: "completed", date: "Yesterday", rating: 4, location: "Shivajinagar, Pune" },
  { id: 3, customer: "Anita Gupta", service: "Pipe Fitting", amount: "₹2,500", status: "in_progress", date: "Yesterday", rating: null, location: "Aundh, Pune" },
  { id: 4, customer: "Deepak Joshi", service: "Tap Installation", amount: "₹450", status: "completed", date: "2 days ago", rating: 5, location: "Hadapsar, Pune" },
];

const RecentJobsSection = () => {
  const navigate = useNavigate();

  return (
    <Card className="glass-card border-border/30 shadow-card">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
          <div className="w-8 h-8 rounded-lg gradient-teal flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-primary-foreground" />
          </div>
          Recent Jobs
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={() => navigate("/service-history")} className="text-primary">
          View All →
        </Button>
      </CardHeader>
      <CardContent className="space-y-2">
        {recentJobs.map((job, i) => (
          <motion.div
            key={job.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.08 }}
            className="flex items-center justify-between p-3.5 rounded-xl bg-secondary/30 hover:bg-secondary/50 border border-border/20 transition-all duration-200"
          >
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${job.status === "completed" ? "bg-emerald-500" : "bg-amber-500 animate-pulse-soft"}`} />
              <div>
                <p className="font-medium text-foreground text-sm">{job.customer}</p>
                <p className="text-xs text-muted-foreground">{job.service} · {job.location}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold text-foreground text-sm">{job.amount}</p>
              <Badge
                variant={job.status === "completed" ? "secondary" : "default"}
                className="text-[10px] px-1.5 py-0"
              >
                {job.status === "completed" ? "✅ Done" : "🔄 Active"}
              </Badge>
            </div>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
};

export default RecentJobsSection;
