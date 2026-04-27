import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Phone, MessageCircle, Navigation, MapPin, IndianRupee, Clock,
  CheckCircle2, KeyRound, ShieldCheck, Wrench, XCircle, ChevronRight,
  AlertTriangle, User, Camera
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import JobChatDialog from "./JobChatDialog";
import VerificationBadges from "./VerificationBadges";
import JobPhotoProof from "./JobPhotoProof";
import SafetyFeatures from "./SafetyFeatures";

export type JobStep = "accepted" | "on_the_way" | "arrived" | "otp" | "working" | "completed" | "cancelled";

export interface ActiveJob {
  id: number;
  customer: string;
  avatar: string;
  service: string;
  location: string;
  distance: string;
  urgency: string;
  time: string;
  earning: string;
  description: string;
  lat: number;
  lng: number;
  step: JobStep;
  generatedOtp: string;
  enteredOtp: string;
  estimatedMinutes: number;
  customerId?: string;
}

const STEPS: { key: JobStep; label: string; color: string }[] = [
  { key: "accepted", label: "Accepted", color: "bg-blue-500" },
  { key: "on_the_way", label: "On the Way", color: "bg-amber-500" },
  { key: "arrived", label: "Arrived", color: "bg-violet-500" },
  { key: "working", label: "Working", color: "bg-purple-500" },
  { key: "completed", label: "Completed", color: "bg-emerald-500" },
];

const stepIndex = (step: JobStep): number => {
  const idx = STEPS.findIndex(s => s.key === step);
  // otp maps to arrived index
  if (step === "otp") return 2;
  return idx >= 0 ? idx : -1;
};

const urgencyStyles: Record<string, { bg: string; text: string; label: string }> = {
  high: { bg: "bg-destructive/10", text: "text-destructive", label: "High Priority" },
  medium: { bg: "bg-amber-500/10", text: "text-amber-600 dark:text-amber-400", label: "Medium Priority" },
  low: { bg: "bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400", label: "Low Priority" },
};

const CANCEL_REASONS = [
  "Customer not reachable",
  "Location too far",
  "Emergency",
  "Wrong service request",
  "Other",
];

interface Props {
  job: ActiveJob;
  onUpdateJob: (job: ActiveJob) => void;
  onJobComplete: (job: ActiveJob) => void;
  onJobCancel: (job: ActiveJob, reason: string) => void;
}

const ActiveJobPanel = ({ job, onUpdateJob, onJobComplete, onJobCancel }: Props) => {
  const navigate = useNavigate();
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelNote, setCancelNote] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [photoType, setPhotoType] = useState<"before" | "after">("before");
  const [photoOpen, setPhotoOpen] = useState(false);
  const [beforePhoto, setBeforePhoto] = useState<string | null>(null);
  const [afterPhoto, setAfterPhoto] = useState<string | null>(null);

  const currentStepIdx = stepIndex(job.step);
  const urgency = urgencyStyles[job.urgency] || urgencyStyles.medium;
  const canCancel = job.step !== "completed" && job.step !== "cancelled";

  const advanceStep = () => {
    const transitions: Record<string, JobStep> = {
      accepted: "on_the_way",
      on_the_way: "arrived",
      arrived: "otp",
    };
    const next = transitions[job.step];
    if (next) {
      onUpdateJob({ ...job, step: next });
      if (next === "on_the_way") {
        toast.success("Status updated! Heading to customer's location.", {
          description: `ETA: ${job.estimatedMinutes} mins`,
        });
      } else if (next === "arrived") {
        toast.success("Marked as arrived! Ask for OTP to verify.");
      }
    }
  };

  const handleVerifyOtp = () => {
    if (job.enteredOtp === job.generatedOtp) {
      onUpdateJob({ ...job, step: "working", enteredOtp: "" });
      toast.success("OTP Verified! Work in progress.");
    } else {
      toast.error("Invalid OTP. Please try again.");
    }
  };

  const handleComplete = () => {
    onJobComplete({ ...job, step: "completed" });
    toast.success(`Job completed for ${job.customer}! 🎉`, {
      description: `${job.service} · ${job.earning}`,
    });
  };

  const handleCancelConfirm = () => {
    const reason = cancelReason === "Other" ? cancelNote || "Other" : cancelReason;
    onJobCancel(job, reason);
    setCancelOpen(false);
    setCancelReason("");
    setCancelNote("");
    setTermsAccepted(false);
    toast.info(`Job cancelled. Customer ${job.customer} has been notified.`);
  };

  const handleCall = () => {
    toast.info(`Calling ${job.customer}...`, {
      description: "Phone dialer would open in production.",
    });
  };

  const handleChat = () => {
    setChatOpen(true);
  };

  const handleNavigate = () => {
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${job.lat},${job.lng}`,
      "_blank"
    );
  };

  const getStepAction = () => {
    switch (job.step) {
      case "accepted":
        return { label: "Start Navigation", icon: Navigation, action: advanceStep };
      case "on_the_way":
        return { label: "I've Arrived", icon: CheckCircle2, action: advanceStep };
      case "arrived":
        return { label: "Enter OTP to Verify", icon: KeyRound, action: advanceStep };
      case "working":
        return { label: "Mark as Completed", icon: CheckCircle2, action: handleComplete };
      default:
        return null;
    }
  };

  const stepAction = getStepAction();

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-border/40 bg-card shadow-lg overflow-hidden"
      >
        {/* Status color strip */}
        <div className={`h-1.5 w-full ${STEPS[currentStepIdx]?.color || "bg-muted"}`} />

        <div className="p-5 space-y-5">
          {/* Header: Customer + Priority */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <Avatar className="w-12 h-12 border-2 border-primary/20 shadow-sm">
                <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
                  {job.avatar}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-bold text-foreground text-base">{job.customer}</h3>
                <p className="text-sm font-medium text-primary">{job.service}</p>
              </div>
            </div>
            <Badge className={`${urgency.bg} ${urgency.text} border-0 text-xs font-semibold px-2.5 py-1`}>
              {urgency.label}
            </Badge>
           </div>

          {/* Verification Badges */}
          <VerificationBadges compact />

          {/* Job details grid */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${job.lat},${job.lng}`, "_blank")}
              className="flex items-center gap-2.5 p-3 rounded-xl bg-secondary/40 border border-border/20 hover:bg-primary/5 hover:border-primary/20 transition-all cursor-pointer text-left group"
              title="View on map"
            >
              <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0 group-hover:text-primary transition-colors" />
              <div className="min-w-0">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Location</p>
                <p className="text-xs font-semibold text-foreground truncate group-hover:text-primary transition-colors">{job.location}</p>
                <p className="text-[10px] text-muted-foreground">{job.distance} away</p>
              </div>
            </button>
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-secondary/40 border border-border/20">
              <IndianRupee className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Earnings</p>
                <p className="text-xs font-semibold text-foreground">{job.earning}</p>
                <p className="text-[10px] text-muted-foreground">Estimated</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-secondary/40 border border-border/20">
              <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Booked</p>
                <p className="text-xs font-semibold text-foreground">{job.time}</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-secondary/40 border border-border/20">
              <AlertTriangle className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Issue</p>
                <p className="text-xs font-semibold text-foreground truncate">{job.description}</p>
              </div>
            </div>
          </div>

          {/* Quick action buttons */}
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="flex-1 gap-1.5 border-border/40 hover:bg-emerald-500/10 hover:text-emerald-600 hover:border-emerald-500/30 transition-all"
              onClick={handleCall}
            >
              <Phone className="w-3.5 h-3.5" /> Call
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1 gap-1.5 border-border/40 hover:bg-blue-500/10 hover:text-blue-600 hover:border-blue-500/30 transition-all"
              onClick={handleChat}
            >
              <MessageCircle className="w-3.5 h-3.5" /> Chat
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1 gap-1.5 border-border/40 hover:bg-violet-500/10 hover:text-violet-600 hover:border-violet-500/30 transition-all"
              onClick={handleNavigate}
            >
              <Navigation className="w-3.5 h-3.5" /> Navigate
            </Button>
          </div>

          {/* Safety Features - Provider ID & Share Trip */}
          <SafetyFeatures
            providerName={job.customer}
            providerAvatar={job.avatar}
            service={job.service}
            jobId={job.id}
            location={job.location}
          />

          {/* Photo Proof Buttons */}
          {(job.step === "working" || job.step === "arrived" || job.step === "otp") && (
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                className={`flex-1 gap-1.5 text-xs border-border/40 transition-all ${beforePhoto ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30" : "hover:bg-primary/5"}`}
                onClick={() => { setPhotoType("before"); setPhotoOpen(true); }}
              >
                <Camera className="w-3.5 h-3.5" />
                {beforePhoto ? "✓ Before Photo" : "Before Photo"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className={`flex-1 gap-1.5 text-xs border-border/40 transition-all ${afterPhoto ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30" : "hover:bg-primary/5"}`}
                onClick={() => { setPhotoType("after"); setPhotoOpen(true); }}
              >
                <Camera className="w-3.5 h-3.5" />
                {afterPhoto ? "✓ After Photo" : "After Photo"}
              </Button>
            </div>
          )}

          {/* Progress tracker */}
          <div className="space-y-3">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Job Progress</p>
            <div className="flex items-center gap-1">
              {STEPS.map((s, i) => {
                const isActive = i === currentStepIdx;
                const isDone = i < currentStepIdx;
                return (
                  <div key={s.key} className="flex-1 flex flex-col items-center gap-1.5">
                    <div className="w-full flex items-center">
                      <div
                        className={`w-full h-1.5 rounded-full transition-all duration-500 ${
                          isDone ? s.color : isActive ? `${s.color} animate-pulse` : "bg-muted"
                        }`}
                      />
                    </div>
                    <span className={`text-[9px] font-medium leading-tight text-center ${
                      isDone || isActive ? "text-foreground" : "text-muted-foreground/50"
                    }`}>
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* OTP Section (inline when step is otp) */}
          <AnimatePresence mode="wait">
            {job.step === "otp" && (
              <motion.div
                key="otp-section"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-primary" />
                    <h4 className="text-sm font-semibold text-foreground">Enter Customer's OTP</h4>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Ask {job.customer} for their 4-digit code to verify and start work.
                  </p>
                  <div className="flex justify-center py-2">
                    <InputOTP
                      maxLength={4}
                      value={job.enteredOtp}
                      onChange={(val) => onUpdateJob({ ...job, enteredOtp: val })}
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                  {/* Demo hint */}
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-2.5 text-center">
                    <p className="text-[11px] text-amber-700 dark:text-amber-400">
                      🔐 Demo OTP: <span className="font-bold tracking-widest">{job.generatedOtp}</span>
                    </p>
                  </div>
                  <Button
                    size="sm"
                    className="w-full"
                    disabled={job.enteredOtp.length < 4}
                    onClick={handleVerifyOtp}
                  >
                    <ShieldCheck className="w-4 h-4 mr-1.5" /> Verify & Start Work
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Working confirmation */}
            {job.step === "working" && (
              <motion.div
                key="working-section"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-purple-500/5 border border-purple-500/20 rounded-xl p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-purple-500 animate-pulse" />
                    <h4 className="text-sm font-semibold text-foreground">Work In Progress</h4>
                  </div>
                  <div className="space-y-1.5 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Identity verified via OTP</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Customer: {job.customer}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Location confirmed: {job.location}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main action button */}
          {stepAction && job.step !== "otp" && (
            <Button
              size="lg"
              className={`w-full font-semibold transition-all duration-300 ${
                job.step === "working"
                  ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                  : ""
              }`}
              onClick={stepAction.action}
            >
              <stepAction.icon className="w-4 h-4 mr-2" />
              {stepAction.label}
            </Button>
          )}

          {/* Cancel button */}
          {canCancel && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-destructive/70 hover:text-destructive hover:bg-destructive/5"
              onClick={() => setCancelOpen(true)}
            >
              <XCircle className="w-3.5 h-3.5 mr-1.5" /> Cancel Job
            </Button>
          )}
        </div>
      </motion.div>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <XCircle className="w-5 h-5" /> Cancel Job
            </DialogTitle>
            <DialogDescription>
              Please review the cancellation policy, select a reason, and confirm.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {/* Terms & Conditions */}
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 space-y-2.5">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                <h4 className="text-sm font-semibold text-foreground">Cancellation Policy</h4>
              </div>
              <ul className="space-y-1.5 text-xs text-muted-foreground list-disc list-inside leading-relaxed">
                <li>Cancelling after acceptance may affect your <span className="font-semibold text-foreground">reliability score</span> and dashboard ranking.</li>
                <li>More than <span className="font-semibold text-foreground">3 cancellations per week</span> will trigger a temporary suspension review.</li>
                <li>Repeated cancellations without valid reasons may lead to <span className="font-semibold text-foreground">account deactivation</span>.</li>
                <li>The customer will be <span className="font-semibold text-foreground">immediately notified</span> and the job will be reassigned to another provider.</li>
                <li>Cancellations due to genuine emergencies will not count against your record if verified.</li>
              </ul>
            </div>

            {/* Reason selection */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Select Reason</p>
              <RadioGroup value={cancelReason} onValueChange={setCancelReason}>
                {CANCEL_REASONS.map(reason => (
                  <div key={reason} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-secondary/50 transition-colors">
                    <RadioGroupItem value={reason} id={reason} />
                    <Label htmlFor={reason} className="text-sm cursor-pointer flex-1">{reason}</Label>
                  </div>
                ))}
              </RadioGroup>
              {cancelReason === "Other" && (
                <Textarea
                  placeholder="Please describe your reason..."
                  value={cancelNote}
                  onChange={e => setCancelNote(e.target.value)}
                  rows={2}
                />
              )}
            </div>

            {/* Acknowledgement checkbox */}
            <div className="flex items-start gap-3 p-3 rounded-xl bg-secondary/40 border border-border/20">
              <Checkbox
                id="accept-terms"
                checked={termsAccepted}
                onCheckedChange={(v) => setTermsAccepted(v === true)}
                className="mt-0.5"
              />
              <Label htmlFor="accept-terms" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
                I acknowledge the <span className="font-semibold text-foreground">UrbanSahay Cancellation Policy</span> and understand that this action may impact my provider rating and account standing.
              </Label>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setCancelOpen(false)}>Go Back</Button>
            <Button
              variant="destructive"
              disabled={!cancelReason || !termsAccepted}
              onClick={handleCancelConfirm}
            >
              Confirm Cancellation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Chat Dialog */}
      <JobChatDialog
        open={chatOpen}
        onOpenChange={setChatOpen}
        customerName={job.customer}
        customerAvatar={job.avatar}
        service={job.service}
        jobStep={job.step}
      />

      {/* Photo Proof Dialog */}
      <JobPhotoProof
        open={photoOpen}
        onOpenChange={setPhotoOpen}
        type={photoType}
        existingPhoto={photoType === "before" ? (beforePhoto || undefined) : (afterPhoto || undefined)}
        onPhotoCapture={(type, url) => {
          if (type === "before") setBeforePhoto(url);
          else setAfterPhoto(url);
        }}
      />
    </>
  );
};

export default ActiveJobPanel;
