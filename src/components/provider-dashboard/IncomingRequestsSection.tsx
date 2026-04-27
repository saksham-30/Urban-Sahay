import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  AlertTriangle, Eye, MessageCircle, MapPin, IndianRupee, Clock,
  Check, X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import ActiveJobPanel, { type ActiveJob } from "./ActiveJobPanel";

interface Request {
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
}

const initialRequests: Request[] = [
  {
    id: 1, customer: "Ravi Kumar", avatar: "RK", service: "Plumbing Repair",
    location: "Kothrud, Pune", distance: "2.3 km", urgency: "high",
    time: "5 min ago", earning: "₹800-1,200", description: "Kitchen sink leaking badly, need urgent repair.",
    lat: 18.5074, lng: 73.8077
  },
  {
    id: 2, customer: "Priya Sharma", avatar: "PS", service: "Pipe Replacement",
    location: "Hinjewadi, Pune", distance: "4.1 km", urgency: "medium",
    time: "12 min ago", earning: "₹1,500-2,000", description: "Old pipe replacement in bathroom, scheduled for today.",
    lat: 18.5912, lng: 73.7390
  },
  {
    id: 3, customer: "Amit Verma", avatar: "AV", service: "Water Tank Cleaning",
    location: "Viman Nagar, Pune", distance: "5.8 km", urgency: "low",
    time: "30 min ago", earning: "₹600-900", description: "Routine water tank cleaning and maintenance.",
    lat: 18.5679, lng: 73.9143
  },
  {
    id: 4, customer: "Sneha Patil", avatar: "SP", service: "Tap Installation",
    location: "Baner, Pune", distance: "3.2 km", urgency: "high",
    time: "8 min ago", earning: "₹500-700", description: "New kitchen tap installation with fixtures.",
    lat: 18.5590, lng: 73.7868
  },
];

const urgencyConfig: Record<string, { variant: "destructive" | "default" | "secondary"; label: string; className: string }> = {
  high: { variant: "destructive", label: "🔴 High", className: "border-l-destructive" },
  medium: { variant: "default", label: "🟡 Medium", className: "border-l-amber-500" },
  low: { variant: "secondary", label: "🟢 Low", className: "border-l-emerald-500" },
};

const IncomingRequestsSection = () => {
  const [requests, setRequests] = useState<Request[]>(initialRequests);
  const [activeJobs, setActiveJobs] = useState<ActiveJob[]>([]);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatTarget, setChatTarget] = useState("");
  const [chatMessage, setChatMessage] = useState("");
  const [mapOpen, setMapOpen] = useState(false);
  const [mapTarget, setMapTarget] = useState<Request | null>(null);

  const handleAccept = (req: Request) => {
    const otp = String(Math.floor(1000 + Math.random() * 9000));
    const mins = Math.floor(Math.random() * 20) + 10;
    setRequests(prev => prev.filter(r => r.id !== req.id));
    setActiveJobs(prev => [...prev, {
      ...req,
      step: "accepted" as const,
      generatedOtp: otp,
      enteredOtp: "",
      estimatedMinutes: mins,
    }]);
    toast.success(`Job accepted! ${req.customer} has been notified.`, {
      description: `${req.service} · ${req.earning}`,
    });
  };

  const handleReject = (req: Request) => {
    setRequests(prev => prev.filter(r => r.id !== req.id));
    toast.info(`Request from ${req.customer} declined.`);
  };

  const handleChat = (req: Request) => {
    setChatTarget(req.customer);
    setChatOpen(true);
  };

  const handleSendChat = () => {
    if (!chatMessage.trim()) return;
    toast.success(`Message sent to ${chatTarget}`);
    setChatMessage("");
    setChatOpen(false);
  };

  const handleMap = (req: Request) => {
    setMapTarget(req);
    setMapOpen(true);
  };

  const handleUpdateJob = (updated: ActiveJob) => {
    setActiveJobs(prev => prev.map(j => j.id === updated.id ? updated : j));
  };

  const handleJobComplete = (job: ActiveJob) => {
    setActiveJobs(prev => prev.filter(j => j.id !== job.id));
  };

  const handleJobCancel = (job: ActiveJob, reason: string) => {
    setActiveJobs(prev => prev.filter(j => j.id !== job.id));
  };

  return (
    <div className="space-y-6">
      {/* Active Jobs */}
      <AnimatePresence>
        {activeJobs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Active Jobs ({activeJobs.length})</h3>
            </div>
            {activeJobs.map(job => (
              <ActiveJobPanel
                key={job.id}
                job={job}
                onUpdateJob={handleUpdateJob}
                onJobComplete={handleJobComplete}
                onJobCancel={handleJobCancel}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Incoming Requests */}
      <Card className="glass-card border-border/30 shadow-card">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
            <div className="w-8 h-8 rounded-lg gradient-amber flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-primary-foreground" />
            </div>
            Incoming Requests
          </CardTitle>
          <Badge variant="outline" className="text-xs font-semibold">
            {requests.length} new
          </Badge>
        </CardHeader>
        <CardContent className="space-y-3">
          <AnimatePresence mode="popLayout">
            {requests.length === 0 ? (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-muted-foreground py-8 text-sm"
              >
                No incoming requests right now. Stay online! 🟢
              </motion.p>
            ) : (
              requests.map((req, i) => {
                const urgency = urgencyConfig[req.urgency];
                return (
                  <motion.div
                    key={req.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20, height: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`flex flex-col gap-3 p-4 rounded-xl glass-card border-l-4 ${urgency.className} hover:shadow-card transition-all duration-300`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1">
                        <Avatar className="w-10 h-10 border border-border">
                          <AvatarFallback className="bg-secondary text-secondary-foreground text-xs font-semibold">
                            {req.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-foreground">{req.customer}</p>
                            <Badge variant={urgency.variant} className="text-[10px] px-1.5 py-0">
                              {urgency.label}
                            </Badge>
                          </div>
                          <p className="text-sm font-medium text-primary mt-0.5">{req.service}</p>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{req.description}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                      <button
                        className="flex items-center gap-1 hover:text-primary transition-colors underline decoration-dotted underline-offset-2 cursor-pointer"
                        onClick={() => handleMap(req)}
                        title="View on map"
                      >
                        <MapPin className="w-3 h-3" /> {req.location} · {req.distance}
                      </button>
                      <span className="flex items-center gap-1">
                        <IndianRupee className="w-3 h-3" /> {req.earning}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {req.time}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <Button size="sm" className="gradient-teal text-primary-foreground border-0 hover:opacity-90" onClick={() => handleAccept(req)}>
                        <Check className="w-3.5 h-3.5 mr-1" /> Accept
                      </Button>
                      <Button size="sm" variant="outline" className="text-destructive border-destructive/30 hover:bg-destructive/10" onClick={() => handleReject(req)}>
                        <X className="w-3.5 h-3.5 mr-1" /> Reject
                      </Button>
                      <Button size="sm" variant="ghost" className="text-muted-foreground" onClick={() => handleChat(req)}>
                        <MessageCircle className="w-3.5 h-3.5 mr-1" /> Chat
                      </Button>
                      <Button size="sm" variant="ghost" className="text-muted-foreground" onClick={() => handleMap(req)}>
                        <Eye className="w-3.5 h-3.5 mr-1" /> Map
                      </Button>
                    </div>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Chat Dialog */}
      <Dialog open={chatOpen} onOpenChange={setChatOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Chat with {chatTarget}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="bg-secondary/50 rounded-lg p-3 text-sm text-muted-foreground">
              Start a conversation with your customer before accepting the job.
            </div>
            <Textarea
              placeholder="Type your message..."
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              rows={3}
            />
            <Button className="w-full" onClick={handleSendChat}>
              <MessageCircle className="w-4 h-4 mr-2" /> Send Message
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Map Dialog */}
      <Dialog open={mapOpen} onOpenChange={setMapOpen}>
        <DialogContent className="sm:max-w-lg p-0 overflow-hidden">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              {mapTarget?.customer} — {mapTarget?.location}
            </DialogTitle>
          </DialogHeader>
          <div className="w-full h-80">
            {mapTarget && (
              <iframe
                title="Request Location"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${mapTarget.lng - 0.01},${mapTarget.lat - 0.01},${mapTarget.lng + 0.01},${mapTarget.lat + 0.01}&layer=mapnik&marker=${mapTarget.lat},${mapTarget.lng}`}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default IncomingRequestsSection;
