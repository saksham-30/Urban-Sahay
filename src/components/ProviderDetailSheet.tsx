import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import BookingFlow from "@/components/BookingFlow";
import ProviderChat from "@/components/ProviderChat";
import ScheduleBooking from "@/components/ScheduleBooking";
import {
  Star,
  MapPin,
  IndianRupee,
  BadgeCheck,
  Clock,
  Phone,
  ShieldCheck,
  Briefcase,
  MessageSquare,
  CalendarCheck,
} from "lucide-react";

interface Provider {
  id: string;
  name: string;
  rating: number;
  reviews: number;
  visitingCharge: string;
  distance: string;
  verified: boolean;
  experience: number;
}

interface ProviderDetailSheetProps {
  provider: Provider | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serviceType: string;
}

const ProviderDetailSheet = ({ provider, open, onOpenChange, serviceType }: ProviderDetailSheetProps) => {
  const [showBooking, setShowBooking] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);

  if (!provider) return null;

  const highlights = [
    {
      icon: Briefcase,
      label: "Experience",
      value: `${provider.experience} years`,
    },
    {
      icon: Star,
      label: "Rating",
      value: `${provider.rating} / 5`,
    },
    {
      icon: MessageSquare,
      label: "Reviews",
      value: `${provider.reviews} reviews`,
    },
    {
      icon: IndianRupee,
      label: "Visiting Charge",
      value: provider.visitingCharge,
    },
  ];

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setShowBooking(false);
      setShowChat(false);
      setShowSchedule(false);
    }
    onOpenChange(isOpen);
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="bottom" className="rounded-t-3xl max-h-[85vh] overflow-y-auto px-6 pb-8">
        <SheetHeader className="pb-0">
          <div className="flex items-start gap-4 pt-2">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl flex-shrink-0">
              {provider.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <SheetTitle className="text-lg text-foreground">{provider.name}</SheetTitle>
                {provider.verified && <BadgeCheck className="w-5 h-5 text-primary flex-shrink-0" />}
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">{serviceType} Specialist</p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="flex items-center gap-1 text-sm font-medium text-foreground">
                  <Star className="w-4 h-4 text-accent fill-accent" />
                  {provider.rating}
                </span>
                <span className="text-xs text-muted-foreground">({provider.reviews} reviews)</span>
                <span className="text-xs text-muted-foreground flex items-center gap-1 ml-2">
                  <MapPin className="w-3.5 h-3.5" />
                  {provider.distance}
                </span>
              </div>
            </div>
          </div>
        </SheetHeader>

        <Separator className="my-5" />

        {/* Quick highlights grid */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {highlights.map((item) => (
            <div
              key={item.label}
              className="bg-muted/50 rounded-xl p-3.5 flex items-center gap-3"
            >
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <item.icon className="w-4.5 h-4.5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className="text-sm font-semibold text-foreground">{item.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Trust & Safety */}
        <div className="bg-muted/50 rounded-xl p-4 mb-5">
          <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-primary" />
            Trust & Safety
          </h4>
          <div className="space-y-2.5">
            {provider.verified && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <BadgeCheck className="w-4 h-4 text-primary flex-shrink-0" />
                <span>Identity & background verified</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarCheck className="w-4 h-4 text-primary flex-shrink-0" />
              <span>On-time arrival guaranteed</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4 text-primary flex-shrink-0" />
              <span>Typically responds within 15 minutes</span>
            </div>
          </div>
        </div>

        {/* What's Included */}
        <div className="bg-muted/50 rounded-xl p-4 mb-6">
          <h4 className="text-sm font-semibold text-foreground mb-3">What's Included</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>Free inspection & diagnosis on first visit</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>Transparent pricing — no hidden charges</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>30-day service warranty</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>Pay after service is completed</span>
            </li>
          </ul>
        </div>

        {/* Action buttons or Booking Flow */}
        {showChat ? (
          <ProviderChat
            providerName={provider.name}
            serviceType={serviceType}
            onBack={() => setShowChat(false)}
          />
        ) : showBooking ? (
          <BookingFlow
            providerName={provider.name}
            serviceType={serviceType}
            visitingCharge={provider.visitingCharge}
            onClose={() => {
              setShowBooking(false);
              onOpenChange(false);
            }}
          />
        ) : showSchedule ? (
          <ScheduleBooking
            onBookNow={() => {
              setShowSchedule(false);
              setShowBooking(true);
            }}
            onSchedule={(date, time) => {
              setShowSchedule(false);
              setShowBooking(true);
            }}
          />
        ) : (
          <div className="flex flex-col gap-3">
            <Button
              size="lg"
              className="w-full text-base font-semibold"
              onClick={() => setShowSchedule(true)}
            >
              <Phone className="w-4 h-4 mr-2" />
              Book Service — {provider.visitingCharge} visiting charge
            </Button>
            <Button variant="outline" size="lg" className="w-full" onClick={() => setShowChat(true)}>
              <MessageSquare className="w-4 h-4 mr-2" />
              Send a Message
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default ProviderDetailSheet;
