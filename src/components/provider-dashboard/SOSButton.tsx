import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, Phone, MapPin, Share2, X, Siren, UserCheck, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface SOSButtonProps {
  customerName?: string;
  providerName?: string;
  jobId?: number;
  location?: string;
}

const emergencyContacts = [
  { label: "Police (100)", number: "100", icon: Siren },
  { label: "Women Helpline (1091)", number: "1091", icon: Phone },
  { label: "Ambulance (108)", number: "108", icon: Phone },
];

const SOSButton = ({ customerName, providerName, jobId, location }: SOSButtonProps) => {
  const [open, setOpen] = useState(false);
  const [alertSent, setAlertSent] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  const handleSOS = () => {
    setOpen(true);
  };

  const handleEmergencyAlert = () => {
    setCountdown(5);
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          setAlertSent(true);
          toast.error("🚨 Emergency alert sent!", {
            description: "UrbanSahay safety team and emergency contacts have been notified.",
            duration: 6000,
          });
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleCancelCountdown = () => {
    setCountdown(null);
  };

  const handleShareLocation = () => {
    toast.success("📍 Live location shared with emergency contacts", {
      description: location || "Location shared successfully",
    });
  };

  const handleClose = () => {
    setOpen(false);
    setAlertSent(false);
    setCountdown(null);
  };

  return (
    <>
      {/* Floating SOS Button */}
      <motion.button
        onClick={handleSOS}
        className="fixed bottom-24 right-6 z-50 w-14 h-14 rounded-full bg-destructive text-destructive-foreground shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, delay: 1 }}
      >
        <ShieldAlert className="w-6 h-6" />
        <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-destructive animate-ping" />
      </motion.button>

      {/* SOS Dialog */}
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <ShieldAlert className="w-5 h-5" />
              Emergency SOS
            </DialogTitle>
            <DialogDescription>
              If you feel unsafe, use the options below to get immediate help.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Alert status */}
            <AnimatePresence mode="wait">
              {alertSent ? (
                <motion.div
                  key="sent"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-destructive/10 border border-destructive/30 rounded-xl p-4 text-center space-y-2"
                >
                  <Siren className="w-8 h-8 text-destructive mx-auto animate-pulse" />
                  <p className="text-sm font-semibold text-destructive">Emergency Alert Active</p>
                  <p className="text-xs text-muted-foreground">
                    Safety team has been notified. Help is on the way.
                  </p>
                  <div className="text-[10px] text-muted-foreground bg-secondary/50 rounded-lg p-2 mt-2">
                    <p>Job #{jobId} • {customerName || providerName}</p>
                    <p>{location}</p>
                  </div>
                </motion.div>
              ) : countdown !== null ? (
                <motion.div
                  key="countdown"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-destructive/10 border border-destructive/30 rounded-xl p-6 text-center space-y-3"
                >
                  <div className="w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center mx-auto">
                    <span className="text-2xl font-bold text-destructive">{countdown}</span>
                  </div>
                  <p className="text-sm font-semibold text-foreground">Sending emergency alert in {countdown}s</p>
                  <Button variant="outline" size="sm" onClick={handleCancelCountdown}>
                    Cancel
                  </Button>
                </motion.div>
              ) : (
                <motion.div key="options" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                  {/* Emergency alert button */}
                  <Button
                    variant="destructive"
                    className="w-full h-14 text-base font-semibold gap-2"
                    onClick={handleEmergencyAlert}
                  >
                    <Siren className="w-5 h-5" />
                    Send Emergency Alert
                  </Button>

                  {/* Quick call buttons */}
                  <div className="grid grid-cols-1 gap-2">
                    {emergencyContacts.map(contact => {
                      const Icon = contact.icon;
                      return (
                        <button
                          key={contact.number}
                          onClick={() => {
                            toast.info(`Calling ${contact.label}...`);
                          }}
                          className="flex items-center gap-3 p-3 rounded-xl bg-secondary/40 border border-border/20 hover:bg-secondary/60 transition-colors text-left"
                        >
                          <div className="w-9 h-9 rounded-lg bg-destructive/10 flex items-center justify-center">
                            <Icon className="w-4 h-4 text-destructive" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground">{contact.label}</p>
                            <p className="text-[10px] text-muted-foreground">Tap to call</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Share location */}
                  <Button
                    variant="outline"
                    className="w-full gap-2"
                    onClick={handleShareLocation}
                  >
                    <Share2 className="w-4 h-4" />
                    Share Live Location with Contacts
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Safety tip */}
            <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-3">
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                <span className="font-semibold text-amber-600 dark:text-amber-400">Safety Tip:</span> Stay in a well-lit area. 
                Do not share personal details. All UrbanSahay providers undergo background verification.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SOSButton;
