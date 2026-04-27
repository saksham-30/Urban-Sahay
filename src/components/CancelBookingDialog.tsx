import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  XCircle,
  CheckCircle2,
  ShieldAlert,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";

interface CancelBookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  providerName: string;
  consecutiveCancellations: number;
  onConfirmCancel: (reason: string) => void;
}

const cancellationReasons = [
  "Provider is taking too long",
  "Found another provider",
  "Issue resolved on its own",
  "Booked by mistake",
  "Emergency / personal reason",
  "Other",
];

const PENALTY_THRESHOLD = 2;

const CancelBookingDialog = ({
  open,
  onOpenChange,
  providerName,
  consecutiveCancellations,
  onConfirmCancel,
}: CancelBookingDialogProps) => {
  const [step, setStep] = useState<"reason" | "terms" | "done">("reason");
  const [selectedReason, setSelectedReason] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const willBePenalized = consecutiveCancellations >= PENALTY_THRESHOLD;
  const nextCount = consecutiveCancellations + 1;

  const handleClose = () => {
    setStep("reason");
    setSelectedReason("");
    setTermsAccepted(false);
    onOpenChange(false);
  };

  const handleProceedToTerms = () => {
    if (!selectedReason) {
      toast({ title: "Select a reason", description: "Please choose a cancellation reason.", variant: "destructive" });
      return;
    }
    setStep("terms");
  };

  const handleConfirm = () => {
    onConfirmCancel(selectedReason);
    setStep("done");
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <AnimatePresence mode="wait">
          {step === "reason" && (
            <motion.div
              key="reason"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-destructive" />
                  Cancel Booking
                </DialogTitle>
                <DialogDescription>
                  Why do you want to cancel your booking with {providerName}?
                </DialogDescription>
              </DialogHeader>

              {willBePenalized && (
                <div className="mt-3 bg-destructive/10 border border-destructive/30 rounded-xl p-3 flex items-start gap-2">
                  <ShieldAlert className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-destructive">Penalty Warning</p>
                    <p className="text-xs text-muted-foreground">
                      You have cancelled {consecutiveCancellations} time{consecutiveCancellations > 1 ? "s" : ""} consecutively.
                      This cancellation (#{nextCount}) will result in a <strong>₹50 penalty fee</strong> and a temporary cooldown of 15 minutes before you can book again.
                    </p>
                  </div>
                </div>
              )}

              <RadioGroup
                value={selectedReason}
                onValueChange={setSelectedReason}
                className="mt-4 space-y-2"
              >
                {cancellationReasons.map((reason) => (
                  <div key={reason} className="flex items-center space-x-3 bg-muted/50 rounded-lg px-3 py-2.5 hover:bg-muted transition-colors">
                    <RadioGroupItem value={reason} id={reason} />
                    <Label htmlFor={reason} className="cursor-pointer text-sm flex-1">{reason}</Label>
                  </div>
                ))}
              </RadioGroup>

              <div className="flex gap-2 mt-5">
                <Button variant="outline" className="flex-1" onClick={handleClose}>
                  Keep Booking
                </Button>
                <Button variant="destructive" className="flex-1" onClick={handleProceedToTerms} disabled={!selectedReason}>
                  Continue
                </Button>
              </div>
            </motion.div>
          )}

          {step === "terms" && (
            <motion.div
              key="terms"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Terms & Conditions
                </DialogTitle>
                <DialogDescription>
                  Please review and accept the cancellation terms before proceeding.
                </DialogDescription>
              </DialogHeader>

              <div className="mt-4 bg-muted/50 rounded-xl p-4 max-h-48 overflow-y-auto text-xs text-muted-foreground space-y-2">
                <p className="font-semibold text-foreground text-sm">Cancellation Policy</p>
                <Separator />
                <p>1. You may cancel a booking at any time before the service provider starts working (OTP verification).</p>
                <p>2. <strong>First 2 cancellations</strong> within a rolling 24-hour window are free of charge.</p>
                <p>3. From the <strong>3rd consecutive cancellation</strong> onwards, a penalty fee of <strong>₹50</strong> will be charged and added to your next booking invoice.</p>
                <p>4. After <strong>5 consecutive cancellations</strong>, your account may be temporarily restricted from booking for up to 1 hour.</p>
                <p>5. Cancellation penalties reset after a successfully completed service.</p>
                <p>6. Emergency cancellations may be reviewed and exempted upon request via the Support page.</p>
                <p>7. The platform reserves the right to modify these terms at any time. Users will be notified of changes via in-app notifications.</p>
                <p>8. By proceeding, you acknowledge that the service provider may have already begun travelling to your location.</p>
              </div>

              {willBePenalized && (
                <div className="mt-3 bg-accent/10 border border-accent/30 rounded-lg p-3">
                  <p className="text-xs text-foreground font-medium flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-accent" />
                    A ₹50 penalty will apply to this cancellation
                  </p>
                </div>
              )}

              <div className="flex items-start space-x-3 mt-4">
                <Checkbox
                  id="accept-terms"
                  checked={termsAccepted}
                  onCheckedChange={(c) => setTermsAccepted(c === true)}
                />
                <Label htmlFor="accept-terms" className="text-sm cursor-pointer leading-snug">
                  I have read and agree to the cancellation terms & conditions{willBePenalized && " and accept the penalty fee"}.
                </Label>
              </div>

              <div className="flex gap-2 mt-5">
                <Button variant="outline" className="flex-1" onClick={() => setStep("reason")}>
                  Back
                </Button>
                <Button variant="destructive" className="flex-1" disabled={!termsAccepted} onClick={handleConfirm}>
                  Confirm Cancellation
                </Button>
              </div>
            </motion.div>
          )}

          {step === "done" && (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center text-center py-4"
            >
              <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8 text-destructive" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-1">Booking Cancelled</h3>
              <p className="text-sm text-muted-foreground mb-1">
                Your booking with {providerName} has been cancelled.
              </p>
              <p className="text-xs text-muted-foreground mb-1">
                Reason: {selectedReason}
              </p>
              {willBePenalized && (
                <p className="text-xs text-destructive font-medium mt-1">
                  ₹50 penalty has been added to your account.
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-2">
                Total consecutive cancellations: {nextCount}
              </p>
              <Button className="w-full mt-5" onClick={handleClose}>
                Done
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

export default CancelBookingDialog;
