import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Clock, CheckCircle2, ArrowRight } from "lucide-react";

const timeSlots = [
  { label: "9:00 AM", value: "09:00" },
  { label: "10:00 AM", value: "10:00" },
  { label: "11:00 AM", value: "11:00" },
  { label: "12:00 PM", value: "12:00" },
  { label: "2:00 PM", value: "14:00" },
  { label: "3:00 PM", value: "15:00" },
  { label: "4:00 PM", value: "16:00" },
  { label: "5:00 PM", value: "17:00" },
  { label: "6:00 PM", value: "18:00" },
];

interface ScheduleBookingProps {
  onSchedule: (date: Date, time: string) => void;
  onBookNow: () => void;
}

const ScheduleBooking = ({ onSchedule, onBookNow }: ScheduleBookingProps) => {
  const [mode, setMode] = useState<"choose" | "schedule">("choose");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 14);

  const handleConfirm = () => {
    if (selectedDate && selectedTime) {
      onSchedule(selectedDate, selectedTime);
    }
  };

  return (
    <div className="space-y-4">
      <AnimatePresence mode="wait">
        {mode === "choose" ? (
          <motion.div
            key="choose"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-3"
          >
            <p className="text-sm font-medium text-foreground text-center">
              When would you like the service?
            </p>
            <Button
              size="lg"
              className="w-full"
              onClick={onBookNow}
            >
              <Clock className="w-4 h-4 mr-2" />
              Book Now — Instant
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full"
              onClick={() => setMode("schedule")}
            >
              <CalendarDays className="w-4 h-4 mr-2" />
              Schedule for Later
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="schedule"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {/* Date Picker */}
            <div>
              <p className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-primary" />
                Select Date
              </p>
              <div className="flex justify-center bg-muted/30 rounded-xl border border-border p-1">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => date < tomorrow || date > maxDate}
                  className="pointer-events-auto"
                />
              </div>
            </div>

            {/* Time Slots */}
            {selectedDate && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
              >
                <p className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  Select Time Slot
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {timeSlots.map((slot) => (
                    <button
                      key={slot.value}
                      onClick={() => setSelectedTime(slot.value)}
                      className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-all border ${
                        selectedTime === slot.value
                          ? "bg-primary text-primary-foreground border-primary shadow-sm"
                          : "bg-card text-foreground border-border hover:border-primary/40 hover:bg-primary/5"
                      }`}
                    >
                      {slot.label}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Summary & Confirm */}
            {selectedDate && selectedTime && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-primary/5 border border-primary/20 rounded-xl p-4"
              >
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold text-foreground">Booking Summary</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <CalendarDays className="w-3.5 h-3.5" />
                  {selectedDate.toLocaleDateString("en-IN", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-3.5 h-3.5" />
                  {timeSlots.find((s) => s.value === selectedTime)?.label}
                </div>
              </motion.div>
            )}

            <div className="flex gap-2">
              <Button
                variant="ghost"
                className="flex-1"
                onClick={() => setMode("choose")}
              >
                Back
              </Button>
              <Button
                className="flex-1"
                disabled={!selectedDate || !selectedTime}
                onClick={handleConfirm}
              >
                Confirm Schedule
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ScheduleBooking;
