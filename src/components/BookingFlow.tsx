import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  Clock,
  MapPin,
  ShieldCheck,
  Loader2,
  Phone,
  KeyRound,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

type BookingStep = "accepting" | "accepted" | "otp" | "working";

interface BookingFlowProps {
  providerName: string;
  serviceType: string;
  visitingCharge: string;
  onClose: () => void;
}

const BookingFlow = ({ providerName, serviceType, visitingCharge, onClose }: BookingFlowProps) => {
  const navigate = useNavigate();
  const [step, setStep] = useState<BookingStep>("accepting");
  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [estimatedMinutes] = useState(() => Math.floor(Math.random() * 20) + 10); // 10-30 mins

  // Simulate provider accepting after 2.5s
  useEffect(() => {
    if (step === "accepting") {
      const timer = setTimeout(() => setStep("accepted"), 2500);
      return () => clearTimeout(timer);
    }
  }, [step]);

  // Generate a 4-digit OTP when accepted
  useEffect(() => {
    if (step === "accepted") {
      const code = String(Math.floor(1000 + Math.random() * 9000));
      setGeneratedOtp(code);
    }
  }, [step]);

  const handleVerifyOtp = () => {
    if (otp === generatedOtp) {
      toast({ title: "OTP Verified!", description: `${providerName} has started working.` });
      setStep("working");
    } else {
      toast({ title: "Invalid OTP", description: "Please enter the correct code.", variant: "destructive" });
    }
  };

  return (
    <div className="flex flex-col items-center text-center px-2">
      <AnimatePresence mode="wait">
        {/* Step 1: Accepting */}
        {step === "accepting" && (
          <motion.div
            key="accepting"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center gap-4 py-6"
          >
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">
              Waiting for {providerName}
            </h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              We've sent your {serviceType.toLowerCase()} request. The provider is reviewing it...
            </p>
          </motion.div>
        )}

        {/* Step 2: Accepted — show arrival info + OTP */}
        {step === "accepted" && (
          <motion.div
            key="accepted"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center gap-5 py-4 w-full"
          >
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Request Accepted!</h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              {providerName} has accepted your request and is on the way.
            </p>

            {/* Arrival details */}
            <div className="w-full bg-muted/50 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-primary flex-shrink-0" />
                <div className="text-left">
                  <p className="text-xs text-muted-foreground">Estimated Arrival</p>
                  <p className="text-sm font-semibold text-foreground">{estimatedMinutes} minutes</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-primary flex-shrink-0" />
                <div className="text-left">
                  <p className="text-xs text-muted-foreground">Coming to</p>
                  <p className="text-sm font-semibold text-foreground">Your current location</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-primary flex-shrink-0" />
                <div className="text-left">
                  <p className="text-xs text-muted-foreground">Visiting Charge</p>
                  <p className="text-sm font-semibold text-foreground">{visitingCharge}</p>
                </div>
              </div>
            </div>

            {/* OTP display */}
            <div className="w-full bg-primary/5 border border-primary/20 rounded-xl p-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <ShieldCheck className="w-5 h-5 text-primary" />
                <h4 className="text-sm font-semibold text-foreground">Your Verification Code</h4>
              </div>
              <p className="text-3xl font-bold tracking-[0.3em] text-primary mb-2">
                {generatedOtp}
              </p>
              <p className="text-xs text-muted-foreground">
                Share this code with {providerName} when they arrive. Do not share it before they reach your location.
              </p>
            </div>

            <Button
              size="lg"
              className="w-full"
              onClick={() => setStep("otp")}
            >
              <KeyRound className="w-4 h-4 mr-2" />
              Provider Has Arrived — Verify OTP
            </Button>
          </motion.div>
        )}

        {/* Step 3: OTP Verification */}
        {step === "otp" && (
          <motion.div
            key="otp"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center gap-5 py-4 w-full"
          >
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <KeyRound className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Enter Verification Code</h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              Ask {providerName} to enter the 4-digit code you shared with them.
            </p>

            <div className="flex justify-center">
              <InputOTP maxLength={4} value={otp} onChange={setOtp}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                </InputOTPGroup>
              </InputOTP>
            </div>

            <Button
              size="lg"
              className="w-full"
              disabled={otp.length < 4}
              onClick={handleVerifyOtp}
            >
              Verify & Start Work
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setStep("accepted")}>
              Go Back
            </Button>
          </motion.div>
        )}

        {/* Step 4: Working */}
        {step === "working" && (
          <motion.div
            key="working"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-5 py-6 w-full"
          >
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <Wrench className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-foreground">Work In Progress</h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              {providerName} has been verified and is now working on your {serviceType.toLowerCase()} issue.
            </p>

            <div className="w-full bg-primary/5 border border-primary/20 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-sm text-primary">
                <CheckCircle2 className="w-4 h-4" />
                <span>Identity verified</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-primary">
                <CheckCircle2 className="w-4 h-4" />
                <span>OTP confirmed</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-primary">
                <CheckCircle2 className="w-4 h-4" />
                <span>Service started — payment after completion</span>
              </div>
            </div>

            <Button size="lg" className="w-full" onClick={() => {
              onClose();
              navigate("/my-requests");
            }}>
              View My Requests
            </Button>
            <Button variant="outline" size="lg" className="w-full" onClick={() => {
              onClose();
              navigate("/");
            }}>
              Back to Home
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BookingFlow;
