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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "@/hooks/use-toast";

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
          My Jobs
        </h1>
        <p className="text-muted-foreground mb-6">Manage your active and past service jobs</p>

        {/* Active Job Panel */}
        {activeJob && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl border-2 border-primary/30 shadow-lg p-5 mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-primary" />
                </span>
                <h2 className="text-lg font-bold text-foreground">Active Job</h2>
              </div>
              <Badge className="bg-primary/10 text-primary border-primary/30">
                {statusSteps[currentStepIndex]?.label}
              </Badge>
            </div>

            {/* Customer Info */}
            <div className="flex items-center gap-4 bg-muted/50 rounded-xl p-4 mb-4">
              <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center text-accent font-bold text-xl flex-shrink-0">
                <User className="w-7 h-7" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground truncate">{activeJob.customer}</h3>
                <p className="text-sm text-muted-foreground">{activeJob.service}</p>
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {activeJob.location}
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Button
                  size="icon"
                  variant="outline"
                  className="h-9 w-9"
                  onClick={() => toast({ title: "Calling customer...", description: activeJob.customerPhone })}
                >
                  <Phone className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="outline" className="h-9 w-9" onClick={() => navigate("/chat")}>
                  <MessageSquare className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Progress Tracker */}
            <div className="mb-4">
              <Progress value={progressPercent} className="h-2 mb-3" />
              <div className="flex justify-between">
                {statusSteps.map((step, i) => {
                  const isActive = i <= currentStepIndex;
                  const isCurrent = i === currentStepIndex;
                  return (
                    <div key={step.key} className="flex flex-col items-center gap-1">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                          isCurrent
                            ? "bg-primary text-primary-foreground shadow-md"
                            : isActive
                            ? "bg-primary/20 text-primary"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <step.icon className="w-4 h-4" />
                      </div>
                      <span className={`text-[10px] font-medium ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Job Details */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <IndianRupee className="w-4 h-4 mx-auto text-primary mb-1" />
                <p className="text-xs text-muted-foreground">Earnings</p>
                <p className="text-sm font-semibold text-foreground">{activeJob.earnings}</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <MapPin className="w-4 h-4 mx-auto text-primary mb-1" />
                <p className="text-xs text-muted-foreground">Location</p>
                <p className="text-sm font-semibold text-foreground truncate">{activeJob.location}</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <Clock className="w-4 h-4 mx-auto text-primary mb-1" />
                <p className="text-xs text-muted-foreground">Accepted</p>
                <p className="text-sm font-semibold text-foreground">{activeJob.acceptedAt}</p>
              </div>
            </div>

            {/* Customer Address */}
            <div className="bg-muted/50 rounded-xl p-3 mb-4 flex items-start gap-3">
              <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Customer Address</p>
                <p className="text-sm font-medium text-foreground">{activeJob.address}</p>
              </div>
            </div>

            {/* OTP Verification - shown when arrived */}
            {activeJob.status === "arrived" && !activeJob.otpVerified && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-4"
              >
                <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  Enter Customer's OTP
                </h4>
                <p className="text-xs text-muted-foreground mb-3">
                  Ask the customer for their 4-digit verification code
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={4}
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ""))}
                    placeholder="Enter OTP"
                    className="flex-1 h-10 rounded-lg border border-border bg-background px-3 text-center text-lg font-bold tracking-[0.3em] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  <Button onClick={handleVerifyOtp} disabled={otpInput.length < 4}>
                    Verify
                  </Button>
                </div>
              </motion.div>
            )}

            {activeJob.otpVerified && activeJob.status === "arrived" && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-3 mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span className="text-sm font-medium text-green-700 dark:text-green-400">OTP Verified — Ready to start work</span>
              </div>
            )}

            {/* Photo Proof Reminder */}
            {activeJob.status === "working" && (
              <div className="bg-accent/5 border border-accent/20 rounded-xl p-3 mb-4 flex items-center gap-2">
                <Camera className="w-4 h-4 text-accent" />
                <span className="text-xs text-muted-foreground">Remember to take before/after photos for proof</span>
              </div>
            )}

            {/* Action Button */}
            {activeJob.status !== "completed" ? (
              <Button className="w-full" size="lg" onClick={handleAdvanceStep}>
                {actionLabel()}
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <div className="text-center space-y-3">
                <div className="w-16 h-16 mx-auto rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="font-bold text-foreground">Job Completed!</h3>
                <p className="text-sm text-muted-foreground">Payment will be processed shortly</p>
                <Button
                  className="w-full"
                  onClick={() => {
                    toast({ title: "Great work!", description: "Job marked as complete." });
                    setActiveJob(null);
                  }}
                >
                  Done
                </Button>
              </div>
            )}
          </motion.div>
        )}

        {/* Past Jobs */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">Past Jobs</h2>
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
                    {job.status === "completed" ? "✓ Completed" : "✗ Cancelled"}
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
            These are demo jobs. Real jobs will appear here once customers book your services.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProviderJobs;
