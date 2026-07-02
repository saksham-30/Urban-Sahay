import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackToDashboard from "@/components/BackToDashboard";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import {
  Briefcase,
  Clock,
  MapPin,
  Phone,
  MessageSquare,
  Star,
  CheckCircle2,
  Navigation,
  Wrench,
  BadgeCheck,
  ChevronRight,
  IndianRupee,
  AlertCircle,
  User,
  Camera,
} from "lucide-react";
import EarningsChart from "@/components/provider-dashboard/EarningsChart";
import RatingsChart from "@/components/provider-dashboard/RatingsChart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/useLanguage";

type JobStatus = "accepted" | "on_the_way" | "arrived" | "working" | "completed";

interface ActiveJob {
  id: string;
  service: string;
  customer: string;
  customerPhone: string;
  status: JobStatus;
  otp: string;
  otpVerified: boolean;
  earnings: string;
  location: string;
  acceptedAt: string;
  address: string;
}

interface PastJob {
  id: string;
  service: string;
  customer: string;
  status: "completed" | "cancelled";
  date: string;
  location: string;
  earned: string;
  rating: number | null;
}

const statusSteps: { key: JobStatus; label: string; icon: React.ElementType }[] = [
  { key: "accepted", label: "Accepted", icon: CheckCircle2 },
  { key: "on_the_way", label: "On the Way", icon: Navigation },
  { key: "arrived", label: "Arrived", icon: MapPin },
  { key: "working", label: "Working", icon: Wrench },
  { key: "completed", label: "Completed", icon: Star },
];

const mockActiveJob: ActiveJob = {
  id: "pj1",
  service: "Plumbing Issue",
  customer: "Amit Sharma",
  customerPhone: "+91 87654 32100",
  status: "on_the_way",
  otp: "",
  otpVerified: false,
  earnings: "₹200 + service",
  location: "Kothrud, Pune",
  acceptedAt: "5 min ago",
  address: "Flat 302, Sahyadri Apt, Karve Nagar, Kothrud",
};

const mockPastJobs: PastJob[] = [
  { id: "pj-h1", service: "Pipe Leak Repair", customer: "Sneha Desai", status: "completed", date: "2026-03-07", location: "Deccan, Pune", earned: "₹950", rating: 5 },
  { id: "pj-h2", service: "Tap Installation", customer: "Vikram Patil", status: "completed", date: "2026-03-05", location: "Baner, Pune", earned: "₹600", rating: 4 },
  { id: "pj-h3", service: "Drain Cleaning", customer: "Pooja Mehta", status: "cancelled", date: "2026-03-03", location: "Koregaon Park", earned: "₹0", rating: null },
  { id: "pj-h4", service: "Water Heater Fix", customer: "Rahul Joshi", status: "completed", date: "2026-03-01", location: "Shivajinagar", earned: "₹1,200", rating: 5 },
];

const ProviderJobs = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [activeJob, setActiveJob] = useState<ActiveJob | null>(mockActiveJob);
  const [otpInput, setOtpInput] = useState("");

  useEffect(() => {
    if (!isLoading && !user) navigate("/auth");
  }, [user, isLoading, navigate]);

  const currentStepIndex = activeJob
    ? statusSteps.findIndex((s) => s.key === activeJob.status)
    : -1;

  const progressPercent = activeJob
    ? ((currentStepIndex + 1) / statusSteps.length) * 100
    : 0;

  const handleAdvanceStep = () => {
    if (!activeJob) return;
    const idx = statusSteps.findIndex((s) => s.key === activeJob.status);

    // Must verify OTP before moving past "arrived"
    if (activeJob.status === "arrived" && !activeJob.otpVerified) {
      toast({ title: "Verify OTP first", description: "Enter the customer's OTP to start work.", variant: "destructive" });
      return;
    }

    if (idx < statusSteps.length - 1) {
      const nextStatus = statusSteps[idx + 1].key;
      setActiveJob({ ...activeJob, status: nextStatus });
      toast({
        title: `Status: ${statusSteps[idx + 1].label}`,
        description:
          nextStatus === "completed"
            ? "Great job! Payment will be processed."
            : `Updated to ${statusSteps[idx + 1].label.toLowerCase()}.`,
      });
    }
  };

  const handleVerifyOtp = () => {
    if (otpInput.length < 4) return;
    // In demo, any 4-digit code works
    setActiveJob((prev) => prev ? { ...prev, otpVerified: true } : null);
    toast({ title: "OTP Verified ✓", description: "You can now start working." });
  };

  const statusColor = (s: string) => {
    switch (s) {
      case "completed":
        return "bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700";
      case "cancelled":
        return "bg-destructive/10 text-destructive border-destructive/30";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const actionLabel = () => {
    if (!activeJob) return "";
    switch (activeJob.status) {
      case "accepted": return "Start Navigation";
      case "on_the_way": return "I've Arrived";
      case "arrived": return activeJob.otpVerified ? "Start Work" : "Verify OTP First";
      case "working": return "Mark as Completed";
      default: return "";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 pt-24 pb-16 max-w-2xl">
        <BackToDashboard />
        <h1 className="text-2xl font-bold text-foreground mb-1 flex items-center gap-2">
          <Briefcase className="w-6 h-6 text-primary" />
          {t('providerJobs.title')}
        </h1>
        <p className="text-muted-foreground mb-6">{t('providerJobs.subtitle')}</p>

        

        {/* Past Jobs */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">{t('providerJobs.pastJobs')}</h2>
          <div className="space-y-3">
            {mockPastJobs.map((job) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card rounded-xl border border-border p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-foreground">{job.service}</h3>
                    <p className="text-sm text-muted-foreground">{job.customer}</p>
                  </div>
                  <Badge variant="outline" className={statusColor(job.status)}>
                    {job.status === "completed" ? `✓ ${t('status.completed')}` : `✗ ${t('status.cancelled')}`}
                  </Badge>
                </div>
                <Separator className="my-2" />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{job.date}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{job.location}</span>
                    {job.rating && (
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-accent fill-accent" />{job.rating}
                      </span>
                    )}
                  </div>
                  <span className="text-sm font-semibold text-foreground">{job.earned}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="mt-6 bg-secondary/30 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground">
            {t('providerJobs.demoHint')}
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProviderJobs;
