import { Calendar, Clock, MapPin, User, XCircle, Edit3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";

interface ScheduledBooking {
  id: string;
  service: string;
  provider: string;
  date: string;
  time: string;
  location: string;
  visitingCharge: string;
  status: "upcoming" | "today";
}

const mockScheduledBookings: ScheduledBooking[] = [
  {
    id: "sb1",
    service: "AC Servicing",
    provider: "Amit Deshmukh",
    date: "2026-03-16",
    time: "10:00 AM",
    location: "Kothrud, Pune",
    visitingCharge: "₹150",
    status: "today",
  },
  {
    id: "sb2",
    service: "Deep Cleaning",
    provider: "Sneha Jadhav",
    date: "2026-03-18",
    time: "2:00 PM",
    location: "Baner, Pune",
    visitingCharge: "₹300",
    status: "upcoming",
  },
  {
    id: "sb3",
    service: "Electrical Wiring",
    provider: "Vikram More",
    date: "2026-03-22",
    time: "11:30 AM",
    location: "Hinjewadi, Pune",
    visitingCharge: "₹200",
    status: "upcoming",
  },
];

const ScheduledBookingsSection = () => {
  const [bookings, setBookings] = useState(mockScheduledBookings);

  const handleCancel = (id: string) => {
    setBookings((prev) => prev.filter((b) => b.id !== id));
    toast({ title: "Booking cancelled", description: "Your scheduled booking has been cancelled.", variant: "destructive" });
  };

  const handleReschedule = (id: string) => {
    toast({ title: "Reschedule", description: "Reschedule functionality coming soon." });
  };

  if (bookings.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        <Calendar className="w-10 h-10 mx-auto mb-3 opacity-50" />
        <p className="font-medium">No scheduled bookings</p>
        <p className="text-sm">Book a service and schedule it for later to see it here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <AnimatePresence>
        {bookings.map((b) => (
          <motion.div
            key={b.id}
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="bg-card rounded-xl border border-border p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-semibold text-foreground">{b.service}</h3>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <User className="w-3.5 h-3.5" /> {b.provider}
                </p>
              </div>
              <Badge
                variant="outline"
                className={
                  b.status === "today"
                    ? "bg-primary/10 text-primary border-primary/30"
                    : "bg-accent/10 text-accent-foreground border-accent/30"
                }
              >
                {b.status === "today" ? "Today" : "Upcoming"}
              </Badge>
            </div>
            <Separator className="my-2" />
            <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> {b.date}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> {b.time}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> {b.location}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground">Visiting: {b.visitingCharge}</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="text-xs" onClick={() => handleReschedule(b.id)}>
                  <Edit3 className="w-3 h-3 mr-1" /> Reschedule
                </Button>
                <Button variant="destructive" size="sm" className="text-xs" onClick={() => handleCancel(b.id)}>
                  <XCircle className="w-3 h-3 mr-1" /> Cancel
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ScheduledBookingsSection;
