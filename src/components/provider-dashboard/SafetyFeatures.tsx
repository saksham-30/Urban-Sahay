import { useState } from "react";
import { Shield, Share2, Eye, Clock, User, MapPin, Phone, Copy, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface SafetyFeaturesProps {
  providerName: string;
  providerAvatar: string;
  service: string;
  jobId: number;
  location: string;
  isVerified?: boolean;
}

const SafetyFeatures = ({
  providerName,
  providerAvatar,
  service,
  jobId,
  location,
  isVerified = true,
}: SafetyFeaturesProps) => {
  const [idCardOpen, setIdCardOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const trackingLink = `https://urbansahay.app/track/${jobId}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(trackingLink);
    setCopied(true);
    toast.success("Tracking link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = (method: string) => {
    toast.success(`Shared via ${method}`, {
      description: "Your trusted contacts can now track this job in real-time.",
    });
    setShareOpen(false);
  };

  return (
    <>
      {/* Safety actions row */}
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          className="flex-1 gap-1.5 text-xs border-border/40 hover:bg-primary/5 hover:border-primary/20 transition-all"
          onClick={() => setIdCardOpen(true)}
        >
          <User className="w-3.5 h-3.5" /> Provider ID
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="flex-1 gap-1.5 text-xs border-border/40 hover:bg-primary/5 hover:border-primary/20 transition-all"
          onClick={() => setShareOpen(true)}
        >
          <Share2 className="w-3.5 h-3.5" /> Share Trip
        </Button>
      </div>

      {/* Provider ID Card Dialog */}
      <Dialog open={idCardOpen} onOpenChange={setIdCardOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Provider ID Card
            </DialogTitle>
            <DialogDescription>
              Verified identity details for your safety.
            </DialogDescription>
          </DialogHeader>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/30 p-5 space-y-4"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center">
                  <Shield className="w-3.5 h-3.5 text-primary" />
                </div>
                <span className="text-[10px] font-bold text-primary tracking-wider uppercase">UrbanSahay</span>
              </div>
              {isVerified && (
                <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-0 text-[9px]">
                  <CheckCircle2 className="w-3 h-3 mr-0.5" /> Verified
                </Badge>
              )}
            </div>

            {/* Avatar & Name */}
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-xl border-2 border-primary/20">
                {providerAvatar}
              </div>
              <div>
                <p className="font-bold text-foreground text-lg">{providerName}</p>
                <p className="text-xs text-muted-foreground">{service} Specialist</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">ID: USP-{String(jobId).padStart(6, "0")}</p>
              </div>
            </div>

            {/* Details */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="p-2 rounded-lg bg-background/50">
                <p className="text-[9px] text-muted-foreground uppercase">Service</p>
                <p className="text-xs font-semibold text-foreground">{service}</p>
              </div>
              <div className="p-2 rounded-lg bg-background/50">
                <p className="text-[9px] text-muted-foreground uppercase">Location</p>
                <p className="text-xs font-semibold text-foreground truncate">{location}</p>
              </div>
            </div>

            {/* Safety note */}
            <div className="text-center pt-2 border-t border-border/20">
              <p className="text-[10px] text-muted-foreground">
                This provider's identity has been verified by UrbanSahay.
                Report any concerns immediately.
              </p>
            </div>
          </motion.div>
        </DialogContent>
      </Dialog>

      {/* Share Trip Dialog */}
      <Dialog open={shareOpen} onOpenChange={setShareOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Share2 className="w-5 h-5 text-primary" />
              Share Live Trip
            </DialogTitle>
            <DialogDescription>
              Share your job details and live tracking with trusted contacts.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {/* Tracking link */}
            <div className="flex items-center gap-2 p-3 rounded-xl bg-secondary/40 border border-border/20">
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-muted-foreground uppercase font-medium">Tracking Link</p>
                <p className="text-xs text-foreground truncate font-mono">{trackingLink}</p>
              </div>
              <Button size="sm" variant="outline" className="h-8 px-2" onClick={handleCopyLink}>
                {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              </Button>
            </div>

            {/* Share options */}
            <div className="grid grid-cols-2 gap-2">
              {["WhatsApp", "SMS", "Email", "Other"].map(method => (
                <button
                  key={method}
                  onClick={() => handleShare(method)}
                  className="flex items-center justify-center gap-2 p-3 rounded-xl bg-secondary/40 border border-border/20 hover:bg-primary/5 hover:border-primary/20 transition-all text-sm font-medium text-foreground"
                >
                  {method}
                </button>
              ))}
            </div>

            {/* Info */}
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-2.5 text-center">
              <p className="text-[10px] text-muted-foreground">
                🔒 Recipients can view provider details and live status but cannot modify the job.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SafetyFeatures;
