import { useState, useEffect } from "react";
import BackToDashboard from "@/components/BackToDashboard";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import CancelBookingDialog from "@/components/CancelBookingDialog";
import {
  ClipboardList,
  Clock,
  MapPin,
  Phone,
  MessageSquare,
  Star,
  CheckCircle2,
  Navigation,
  ShieldCheck,
  Wrench,
  BadgeCheck,
  ChevronRight,
  AlertCircle,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import PhotoProofSection from "@/components/PhotoProofSection";
import ScheduledBookingsSection from "@/components/ScheduledBookingsSection";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "@/hooks/use-toast";
import { useLanguage } from '@/hooks/useLanguage';

type JobStatus = "accepted" | "on_the_way" | "arrived" | "working" | "completed";

interface ActiveJob {
  id: string;
  service: string;
  provider: string;
  providerRating: number;
  providerVerified: boolean;
  providerPhone: string;
  status: JobStatus;
  otp: string;
  estimatedArrival: number;
  visitingCharge: string;
  location: string;
  bookedAt: string;
}

interface PastRequest {
  id: string;
  service: string;
  provider: string;
  status: "completed" | "cancelled";
  date: string;
  location: string;
  amount: string;
  rated: boolean;
}

const statusSteps: { key: JobStatus; labelKey: string; icon: React.ElementType }[] = [
  { key: "accepted", labelKey: 'status.accepted', icon: CheckCircle2 },
  { key: "on_the_way", labelKey: 'status.onTheWay', icon: Navigation },
  { key: "arrived", labelKey: 'status.arrived', icon: MapPin },
  { key: "working", labelKey: 'status.working', icon: Wrench },
  { key: "completed", labelKey: 'status.completed', icon: Star },
];

const mockActiveJob: ActiveJob = {
  id: "aj1",
  service: "Plumbing Issue",
  provider: "Rajesh Patil",
  providerRating: 4.8,
  providerVerified: true,
  providerPhone: "+91 98765 43210",
  status: "on_the_way",
  otp: "4829",
  estimatedArrival: 18,
  visitingCharge: "₹200",
  location: "Kothrud, Pune",
  bookedAt: "10 min ago",
};

const mockPastRequests: PastRequest[] = [
  { id: "pr1", service: "Electrical Repair", provider: "Deepak Wagh", status: "completed", date: "2026-03-06", location: "Deccan, Pune", amount: "₹850", rated: true },
  { id: "pr2", service: "Cleaning Service", provider: "Priya Kamble", status: "completed", date: "2026-03-03", location: "Koregaon Park, Pune", amount: "₹1,200", rated: false },
  { id: "pr3", service: "Carpentry Work", provider: "Ramesh Sawant", status: "cancelled", date: "2026-02-28", location: "Baner, Pune", amount: "₹0", rated: false },
];

const MyRequests = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [activeJob, setActiveJob] = useState<ActiveJob | null>(mockActiveJob);
  const [showOtp, setShowOtp] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [consecutiveCancellations, setConsecutiveCancellations] = useState(0);

  useEffect(() => {
    if (!isLoading && !user) navigate("/auth");
  }, [user, isLoading, navigate]);

  const currentStepIndex = activeJob
    ? statusSteps.findIndex((s) => s.key === activeJob.status)
    : -1;

  const progressPercent = activeJob
    ? ((currentStepIndex + 1) / statusSteps.length) * 100
    : 0;

  const handleSimulateNext = () => {
    if (!activeJob) return;
    const idx = statusSteps.findIndex((s) => s.key === activeJob.status);
    if (idx < statusSteps.length - 1) {
      const nextStatus = statusSteps[idx + 1].key;
      setActiveJob({ ...activeJob, status: nextStatus });
      toast({
        title: `Status: ${t(statusSteps[idx + 1].labelKey)}`,
        description: `${activeJob.provider} is now ${t(statusSteps[idx + 1].labelKey).toLowerCase()}.`,
      });
    }
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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 pt-24 pb-16 max-w-2xl">
        <BackToDashboard />
        <h1 className="text-2xl font-bold text-foreground mb-1 flex items-center gap-2">
          <ClipboardList className="w-6 h-6 text-primary" />
          {t('myRequests.title')}
        </h1>
        <p className="text-muted-foreground mb-6">{t('myRequests.subtitle')}</p>

        <Tabs defaultValue="active" className="w-full">
            <TabsList className="w-full mb-6">
            <TabsTrigger value="active" className="flex-1">{t('tabs.active')}</TabsTrigger>
            <TabsTrigger value="scheduled" className="flex-1">{t('tabs.scheduled')}</TabsTrigger>
            <TabsTrigger value="past" className="flex-1">{t('tabs.past')}</TabsTrigger>
          </TabsList>

          <TabsContent value="active">
            {/* Active Job Panel */}
            {activeJob ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card rounded-2xl border-2 border-primary/30 shadow-lg p-5"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-primary" />
                    </span>
                    <h2 className="text-lg font-bold text-foreground">{t('activeJob.title')}</h2>
                  </div>
                  <Badge className="bg-primary/10 text-primary border-primary/30">
                    {t(statusSteps[currentStepIndex]?.labelKey ?? '')}
                  </Badge>
                </div>

                {/* Provider Info Card */}
                <div className="flex items-center gap-4 bg-muted/50 rounded-xl p-4 mb-4">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-xl flex-shrink-0">
                    {activeJob.provider.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground truncate">{activeJob.provider}</h3>
                      {activeJob.providerVerified && <BadgeCheck className="w-4 h-4 text-primary flex-shrink-0" />}
                    </div>
                    <p className="text-sm text-muted-foreground">{activeJob.service}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-accent fill-accent" />
                        {activeJob.providerRating}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {activeJob.location}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button size="icon" variant="outline" className="h-9 w-9" onClick={() => toast({ title: "Calling provider...", description: activeJob.providerPhone })}>
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
                            {t(step.labelKey)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Job details row */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-muted/50 rounded-lg p-3 text-center">
                    <Clock className="w-4 h-4 mx-auto text-primary mb-1" />
                    <p className="text-xs text-muted-foreground">{t('eta')}</p>
                    <p className="text-sm font-semibold text-foreground">{activeJob.estimatedArrival} min</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3 text-center">
                    <MapPin className="w-4 h-4 mx-auto text-primary mb-1" />
                    <p className="text-xs text-muted-foreground">{t('visiting')}</p>
                    <p className="text-sm font-semibold text-foreground">{activeJob.visitingCharge}</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3 text-center">
                    <Clock className="w-4 h-4 mx-auto text-primary mb-1" />
                    <p className="text-xs text-muted-foreground">{t('booked')}</p>
                    <p className="text-sm font-semibold text-foreground">{activeJob.bookedAt}</p>
                  </div>
                </div>

                {/* OTP Section */}
                {activeJob.status !== "completed" && (
                  <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-primary" />
                        <span className="text-sm font-semibold text-foreground">{t('otp.title')}</span>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => setShowOtp(!showOtp)}>
                        {showOtp ? t('otp.hide') : t('otp.show')}
                      </Button>
                    </div>
                    <AnimatePresence>
                      {showOtp && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                        >
                          <p className="text-3xl font-bold tracking-[0.3em] text-primary text-center mt-3">
                            {activeJob.otp}
                          </p>
                          <p className="text-xs text-muted-foreground text-center mt-1">
                            Share only when {activeJob.provider} arrives at your location
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* Actions */}
                {activeJob.status !== "completed" && activeJob.status !== "working" ? (
                  <div className="space-y-2">
                    <Button className="w-full" onClick={handleSimulateNext}>
                      Simulate Next Step
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                    <Button variant="destructive" className="w-full" onClick={() => setShowCancelDialog(true)}>
                      <XCircle className="w-4 h-4 mr-2" />
                      Cancel Booking
                    </Button>
                  </div>
                ) : activeJob.status === "working" ? (
                  <div className="space-y-2">
                    <Button className="w-full" onClick={handleSimulateNext}>
                      {t('actions.simulateNext')}
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                    <p className="text-xs text-center text-muted-foreground">
                      {t('cancellation.notAvailable')}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-center space-y-3">
                      <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                        <CheckCircle2 className="w-8 h-8 text-primary" />
                      </div>
                      <h3 className="font-bold text-foreground">{t('service.completed')}</h3>
                      <p className="text-sm text-muted-foreground">{t('service.ratePrompt').replace('{provider}', activeJob.provider)}</p>
                    </div>
                    <PhotoProofSection />
                    <div className="flex gap-2">
                      <Button className="flex-1" onClick={() => { toast({ title: "Thank you!", description: "Your review has been submitted." }); setActiveJob(null); setConsecutiveCancellations(0); }}>
                        <Star className="w-4 h-4 mr-1" /> {t('actions.rateReview')}
                      </Button>
                      <Button variant="outline" className="flex-1" onClick={() => { setActiveJob(null); setConsecutiveCancellations(0); }}>
                        {t('actions.skip')}
                      </Button>
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              <div className="text-center py-10 text-muted-foreground">
                <ClipboardList className="w-10 h-10 mx-auto mb-3 opacity-50" />
                <p className="font-medium">{t('noActiveJobs')}</p>
                <p className="text-sm">{t('bookServiceHint')}</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="scheduled">
            <ScheduledBookingsSection />
          </TabsContent>

          <TabsContent value="past">
            <div className="space-y-3">
              {mockPastRequests.map((r) => (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card rounded-xl border border-border p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-foreground">{r.service}</h3>
                      <p className="text-sm text-muted-foreground">{r.provider}</p>
                    </div>
                    <Badge variant="outline" className={statusColor(r.status)}>
                      {r.status === "completed" ? "✓ Completed" : "✗ Cancelled"}
                    </Badge>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{r.date}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{r.location}</span>
                    </div>
                    <span className="text-sm font-semibold text-foreground">{r.amount}</span>
                  </div>
                  {r.status === "completed" && !r.rated && (
                    <Button variant="outline" size="sm" className="mt-3 w-full text-xs" onClick={() => toast({ title: "Rating submitted!" })}>
                      <Star className="w-3 h-3 mr-1" /> Rate this service
                    </Button>
                  )}
                </motion.div>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-6 bg-secondary/30 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground">
            These are demo requests. Once you book a real service, your requests will appear here with live tracking.
          </p>
        </div>

        {activeJob && (
          <CancelBookingDialog
            open={showCancelDialog}
            onOpenChange={setShowCancelDialog}
            providerName={activeJob.provider}
            consecutiveCancellations={consecutiveCancellations}
            onConfirmCancel={(reason) => {
              setConsecutiveCancellations((c) => c + 1);
              setActiveJob(null);
              toast({
                title: "Booking Cancelled",
                description: `Reason: ${reason}`,
                variant: "destructive",
              });
            }}
          />
        )}
      </main>
      <Footer />
    </div>
  );
};

export default MyRequests;
