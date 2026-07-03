import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, CheckCircle2, MapPin, Phone, User, ArrowLeft, Loader2, LocateFixed, IndianRupee } from "lucide-react";
import { useGeolocation } from "@/hooks/useGeolocation";
import { toast } from "sonner";
import { api, PRICE_API_ORIGIN } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const concernCategoryMap: Record<string, string> = {
  plumber: "Plumbing Issue",
  electrician: "Electrical Problem",
  cleaner: "Cleaning Service",
  painter: "Painting & Renovation",
  doctor: "Medical Emergency",
  carpenter: "Carpentry Work",
  mechanic: "Vehicle Repair",
  salon: "Salon & Spa",
  "pest-control": "Pest Control",
  "appliance-repair": "AC & Appliance",
  "bathroom-renovation": "Bathroom Renovation",
  "packers-movers": "Packers & Movers",
  laundry: "Laundry & Ironing",
  gardening: "Gardening",
  cook: "Cook & Chef",
  babysitter: "Babysitter",
  "pet-care": "Pet Care",
  fitness: "Fitness Trainer",
  tutor: "Home Tutor",
  emergency: "Emergency Services",
};

const pricingServiceMap: Record<string, string> = {
  plumber: "Plumber",
  electrician: "Electrician",
  cleaner: "Cleaner",
  painter: "Painter",
  doctor: "Doctor",
  carpenter: "Carpenter",
  mechanic: "Mechanic",
  salon: "Salon & Spa",
  "pest-control": "Pest Control",
  "appliance-repair": "AC Technician",
  "bathroom-renovation": "Bathroom Renovation",
  "packers-movers": "Packers & Movers",
  laundry: "Laundry & Ironing",
  gardening: "Gardening",
  cook: "Cook & Chef",
  babysitter: "Babysitter",
  "pet-care": "Pet Care",
  fitness: "Fitness Trainer",
  tutor: "Home Tutor",
  emergency: "Emergency Services",
};

const fallbackPriceRanges: Record<string, Record<string, { min: number; max: number }>> = {
  Plumber: {
    low: { min: 300, max: 800 },
    medium: { min: 800, max: 1800 },
    high: { min: 1800, max: 3500 },
  },
  Electrician: {
    low: { min: 400, max: 900 },
    medium: { min: 900, max: 2200 },
    high: { min: 2200, max: 4000 },
  },
  Cleaner: {
    low: { min: 300, max: 1000 },
    medium: { min: 1000, max: 2000 },
    high: { min: 2000, max: 3500 },
  },
  Painter: {
    low: { min: 1200, max: 3000 },
    medium: { min: 3000, max: 8000 },
    high: { min: 8000, max: 18000 },
  },
  Doctor: {
    low: { min: 500, max: 1200 },
    medium: { min: 1200, max: 2500 },
    high: { min: 2500, max: 6000 },
  },
  "AC Technician": {
    low: { min: 600, max: 1400 },
    medium: { min: 1400, max: 3000 },
    high: { min: 3000, max: 6000 },
  },
  Carpenter: {
    low: { min: 500, max: 1500 },
    medium: { min: 1500, max: 3500 },
    high: { min: 3500, max: 8000 },
  },
  "Pet Care": {
    low: { min: 250, max: 500 },
    medium: { min: 350, max: 700 },
    high: { min: 500, max: 1000 },
  },
  Mechanic: {
    low: { min: 500, max: 1200 },
    medium: { min: 1200, max: 2500 },
    high: { min: 2500, max: 5000 },
  },
  "Salon & Spa": {
    low: { min: 200, max: 500 },
    medium: { min: 400, max: 1200 },
    high: { min: 1000, max: 2500 },
  },
  "Pest Control": {
    low: { min: 700, max: 1800 },
    medium: { min: 1800, max: 3500 },
    high: { min: 3500, max: 7000 },
  },
  "Bathroom Renovation": {
    low: { min: 3000, max: 12000 },
    medium: { min: 12000, max: 35000 },
    high: { min: 35000, max: 120000 },
  },
  "Packers & Movers": {
    low: { min: 2500, max: 8000 },
    medium: { min: 8000, max: 20000 },
    high: { min: 20000, max: 45000 },
  },
  "Laundry & Ironing": {
    low: { min: 150, max: 500 },
    medium: { min: 500, max: 1200 },
    high: { min: 1200, max: 2500 },
  },
  Gardening: {
    low: { min: 400, max: 1200 },
    medium: { min: 1200, max: 3000 },
    high: { min: 3000, max: 7000 },
  },
  "Cook & Chef": {
    low: { min: 700, max: 2000 },
    medium: { min: 2000, max: 6000 },
    high: { min: 6000, max: 15000 },
  },
  Babysitter: {
    low: { min: 500, max: 1500 },
    medium: { min: 1500, max: 4000 },
    high: { min: 4000, max: 9000 },
  },
  "Fitness Trainer": {
    low: { min: 600, max: 1800 },
    medium: { min: 1800, max: 4500 },
    high: { min: 4500, max: 10000 },
  },
  "Home Tutor": {
    low: { min: 500, max: 2000 },
    medium: { min: 2000, max: 6000 },
    high: { min: 6000, max: 15000 },
  },
  "Emergency Services": {
    low: { min: 1200, max: 3000 },
    medium: { min: 3000, max: 8000 },
    high: { min: 8000, max: 20000 },
  },
};

const concernKeywordServiceMap: Array<{ keywords: string[]; service: string }> = [
  { keywords: ["haircut", "hairstyle", "hair", "beard", "facial", "salon", "spa", "grooming", "waxing"], service: "Salon & Spa" },
  { keywords: ["pipe", "leak", "tap", "drain", "toilet", "sink", "plumb"], service: "Plumber" },
  { keywords: ["switch", "socket", "wire", "wiring", "fan", "light", "sparking", "electric"], service: "Electrician" },
  { keywords: ["ac", "air conditioner", "fridge", "refrigerator", "washing machine", "geyser", "microwave", "appliance"], service: "AC Technician" },
  { keywords: ["paint", "repaint", "wall", "color", "putty"], service: "Painter" },
  { keywords: ["clean", "cleaning", "sanitize", "dust", "mop"], service: "Cleaner" },
  { keywords: ["door", "furniture", "wood", "cabinet", "carpenter"], service: "Carpenter" },
  { keywords: ["doctor", "medical", "fever", "pain", "injury"], service: "Doctor" },
  { keywords: ["pet", "dog", "cat", "groom", "walking"], service: "Pet Care" },
];

const apiServiceMap: Record<string, string> = {
  Plumber: "Plumber",
  Electrician: "Electrician",
  Cleaner: "Cleaner",
  Painter: "Painter",
  Doctor: "Doctor",
  "AC Technician": "AC Technician",
  Carpenter: "Carpenter",
  "Pet Care": "Pet Care",
  Mechanic: "AC Technician",
  "Salon & Spa": "Cleaner",
  "Pest Control": "Cleaner",
  "Bathroom Renovation": "Painter",
  "Packers & Movers": "Carpenter",
  "Laundry & Ironing": "Cleaner",
  Gardening: "Cleaner",
  "Cook & Chef": "Cleaner",
  Babysitter: "Doctor",
  "Fitness Trainer": "Doctor",
  "Home Tutor": "Doctor",
  "Emergency Services": "Doctor",
};

const mlSupportedServices = new Set([
  "Plumber",
  "Electrician",
  "Cleaner",
  "Painter",
  "Doctor",
  "AC Technician",
  "Carpenter",
  "Pet Care",
]);

const affordableServices = new Set([
  "Cleaner",
  "Salon & Spa",
  "Laundry & Ironing",
  "Pet Care",
  "Babysitter",
  "Fitness Trainer",
  "Home Tutor",
]);

const PRICE_API_BASE_URL = PRICE_API_ORIGIN;

type PriceEstimate = {
  min: number;
  max: number;
  source: "api" | "fallback";
};

const formatUrgency = (urgency: string): "Low" | "Medium" | "High" => {
  if (urgency === "low") return "Low";
  if (urgency === "high") return "High";
  return "Medium";
};

const normalizeLocationForPricing = (locationText: string): "Downtown" | "Suburbs" => {
  const value = locationText.toLowerCase();
  if (value.includes("suburb") || value.includes("outskirts") || value.includes("village")) {
    return "Suburbs";
  }
  return "Downtown";
};

const inferServiceFromConcern = (concern: string): string | null => {
  const text = concern.toLowerCase();
  if (!text) return null;

  for (const item of concernKeywordServiceMap) {
    if (item.keywords.some((keyword) => text.includes(keyword))) {
      return item.service;
    }
  }

  return null;
};

const applyAffordabilityAdjustment = (
  range: { min: number; max: number },
  service: string,
  urgency: "low" | "medium" | "high",
): { min: number; max: number } => {
  const urgencyMultiplier =
    urgency === "low"
      ? { min: 0.8, max: 0.85 }
      : urgency === "medium"
        ? { min: 0.88, max: 0.92 }
        : { min: 0.95, max: 0.98 };

  const serviceDiscount = affordableServices.has(service) ? 0.9 : 0.96;

  const adjustedMin = Math.max(100, Math.round(range.min * urgencyMultiplier.min * serviceDiscount));
  const adjustedMax = Math.max(
    adjustedMin + 100,
    Math.round(range.max * urgencyMultiplier.max * serviceDiscount),
  );

  return { min: adjustedMin, max: adjustedMax };
};

const urgencyOptions = [
  { value: "low", label: "Low", description: "Not urgent, can wait a few days" },
  { value: "medium", label: "Medium", description: "Needs attention soon" },
  { value: "high", label: "High", description: "Urgent, need help ASAP" },
] as const;

const RaiseConcernPage = () => {
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const locationState = useLocation();
  const { user } = useAuth();
  const serviceType = concernCategoryMap[category || ""] || "Other";
  const pricingService = pricingServiceMap[category || ""] || "Cleaner";
  const { location: geoLocation, loading: geoLoading } = useGeolocation();
  const [reverseGeocoding, setReverseGeocoding] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    location: "",
    concern: "",
    urgency: "medium",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEstimatingPrice, setIsEstimatingPrice] = useState(false);
  const [priceEstimate, setPriceEstimate] = useState<PriceEstimate | null>(null);
  const [priceEstimateNote, setPriceEstimateNote] = useState("");

  useEffect(() => {
    const prefill = (locationState.state as {
      prefill?: { concern?: string; urgency?: string; location?: string };
    } | null)?.prefill;

    if (!prefill) return;

    setFormData((prev) => ({
      ...prev,
      concern: prefill.concern || prev.concern,
      location: prefill.location || prev.location,
      urgency:
        prefill.urgency === "low" || prefill.urgency === "medium" || prefill.urgency === "high"
          ? prefill.urgency
          : prev.urgency,
    }));
  }, [locationState.state]);

  // Auto-fill location via reverse geocoding
  useEffect(() => {
    if (!geoLocation || formData.location) return;
    setReverseGeocoding(true);
    fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${geoLocation.lat}&lon=${geoLocation.lng}&format=json`
    )
      .then((res) => res.json())
      .then((data) => {
        if (data?.display_name) {
          setFormData((prev) => ({ ...prev, location: data.display_name }));
        }
      })
      .catch(() => {})
      .finally(() => setReverseGeocoding(false));
  }, [geoLocation, formData.location]);

  // Live price estimate while user types concern details.
  useEffect(() => {
    const concernText = formData.concern.trim();
    if (concernText.length < 6) {
      setPriceEstimate(null);
      setPriceEstimateNote("");
      setIsEstimatingPrice(false);
      return;
    }

    const timer = window.setTimeout(async () => {
      const selectedUrgency = formData.urgency as "low" | "medium" | "high";
      const inferredService = inferServiceFromConcern(concernText);
      const resolvedPricingService = inferredService || pricingService;
      const fallback = fallbackPriceRanges[resolvedPricingService]?.[selectedUrgency];
      const apiService = apiServiceMap[resolvedPricingService] || "Cleaner";
      const shouldUseMlPricing = mlSupportedServices.has(resolvedPricingService);

      setIsEstimatingPrice(true);
      setPriceEstimateNote("");

      if (!shouldUseMlPricing && fallback) {
        const adjustedFallback = applyAffordabilityAdjustment(
          fallback,
          resolvedPricingService,
          selectedUrgency,
        );
        setPriceEstimate({ ...adjustedFallback, source: "fallback" });
        const notePrefix = inferredService && inferredService !== pricingService
          ? `Adjusted using concern details (${inferredService}). `
          : "";
        setPriceEstimateNote(`${notePrefix}Showing flexible budget-friendly estimate`);
        setIsEstimatingPrice(false);
        return;
      }

      try {
        const response = await fetch(`${PRICE_API_BASE_URL}/predict-price`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            service: apiService,
            location: normalizeLocationForPricing(formData.location || "Downtown"),
            urgency: formatUrgency(formData.urgency),
          }),
        });

        if (!response.ok) {
          throw new Error("Unable to fetch live estimate");
        }

        const data = (await response.json()) as {
          price_range?: { min: number; max: number };
        };

        if (!data.price_range) {
          throw new Error("Missing price range");
        }

        const apiRange = {
          min: data.price_range.min,
          max: data.price_range.max,
        };

        const adjustedFromApi = applyAffordabilityAdjustment(
          apiRange,
          resolvedPricingService,
          selectedUrgency,
        );

        const clampedRange = fallback
          ? {
              min: Math.max(adjustedFromApi.min, Math.round(fallback.min * 0.7)),
              max: Math.min(adjustedFromApi.max, Math.round(fallback.max * 1.05)),
            }
          : adjustedFromApi;

        const normalizedRange = clampedRange.max <= clampedRange.min
          ? { min: clampedRange.min, max: clampedRange.min + 100 }
          : clampedRange;

        setPriceEstimate({
          min: normalizedRange.min,
          max: normalizedRange.max,
          source: "api",
        });

        if (inferredService && inferredService !== pricingService) {
          setPriceEstimateNote(`Adjusted estimate based on your concern details (${inferredService}) with budget-friendly pricing`);
        } else {
          setPriceEstimateNote("Showing flexible budget-friendly estimate");
        }
      } catch {
        if (fallback) {
          const adjustedFallback = applyAffordabilityAdjustment(
            fallback,
            resolvedPricingService,
            selectedUrgency,
          );
          setPriceEstimate({ ...adjustedFallback, source: "fallback" });
          const notePrefix = inferredService && inferredService !== pricingService
            ? `Adjusted using concern details (${inferredService}). `
            : "";
          setPriceEstimateNote(`${notePrefix}Showing flexible budget-friendly estimate`);
        } else {
          setPriceEstimate(null);
          setPriceEstimateNote("Unable to estimate price right now");
        }
      } finally {
        setIsEstimatingPrice(false);
      }
    }, 450);

    return () => window.clearTimeout(timer);
  }, [formData.concern, formData.location, formData.urgency, pricingService]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("Please log in to raise a concern.", {
        action: { label: "Log in", onClick: () => navigate("/auth") },
      });
      return;
    }

    if (formData.name.trim().length === 0 || formData.concern.trim().length === 0) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);

    try {
      await api.raiseConcern({
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        location: formData.location.trim(),
        serviceType,
        concern: formData.concern.trim(),
        urgency: formData.urgency as 'low' | 'medium' | 'high',
      });
      toast.success('Concern raised successfully!', { description: 'Showing nearby providers...' });
      setFormData({ name: '', phone: '', location: '', concern: '', urgency: 'medium' });
      navigate('/provider-results', { state: { serviceType } });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to submit concern. Please try again.';
      toast.error(message);
    }

    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to categories
            </button>

            <div className="bg-card rounded-2xl p-6 md:p-8 shadow-card border border-border">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-foreground">Raise Your Concern</h1>
                  <p className="text-sm text-muted-foreground">We'll get back to you ASAP</p>
                </div>
              </div>

              {/* Pre-selected service badge */}
              <div className="mb-6 mt-4">
                <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
                  {serviceType}
                </span>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Your Name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="pl-10"
                      maxLength={100}
                      required
                    />
                  </div>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="tel"
                      placeholder="Phone Number"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="pl-10"
                      maxLength={15}
                      required
                    />
                  </div>
                </div>

                <div className="relative">
                  {geoLoading || reverseGeocoding ? (
                    <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground animate-spin" />
                  ) : (
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  )}
                  <Input
                    type="text"
                    placeholder={geoLoading || reverseGeocoding ? "Detecting your location..." : "Your Location / Address"}
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="pl-10 pr-10"
                    maxLength={200}
                    required
                  />
                  {geoLocation && !geoLoading && !reverseGeocoding && (
                    <button
                      type="button"
                      onClick={() => {
                        setReverseGeocoding(true);
                        fetch(
                          `https://nominatim.openstreetmap.org/reverse?lat=${geoLocation.lat}&lon=${geoLocation.lng}&format=json`
                        )
                          .then((res) => res.json())
                          .then((data) => {
                            if (data?.display_name) {
                              setFormData((prev) => ({ ...prev, location: data.display_name }));
                            }
                          })
                          .catch(() => {})
                          .finally(() => setReverseGeocoding(false));
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-primary hover:text-primary/80 transition-colors"
                      title="Use my current location"
                    >
                      <LocateFixed className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <Textarea
                  placeholder="Describe your concern in detail..."
                  value={formData.concern}
                  onChange={(e) => setFormData({ ...formData, concern: e.target.value })}
                  className="min-h-[140px] resize-none"
                  maxLength={1000}
                  required
                />

                {(formData.concern.trim().length >= 6 || isEstimatingPrice || priceEstimateNote) && (
                  <div className="rounded-xl border border-primary/20 bg-gradient-to-r from-primary/10 to-accent/10 p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <IndianRupee className="w-4 h-4 text-primary" />
                      <p className="text-sm font-semibold text-foreground">Estimated Cost</p>
                    </div>

                    {isEstimatingPrice && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="w-4 h-4 animate-spin" />
                      </div>
                    )}

                    {!isEstimatingPrice && priceEstimate && (
                      <p className="text-base font-bold text-primary">
                        Rs. {Math.round(priceEstimate.min)} - Rs. {Math.round(priceEstimate.max)}
                      </p>
                    )}
                  </div>
                )}

                {/* Urgency Level */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Urgency Level</label>
                  <div className="grid grid-cols-3 gap-3">
                    {urgencyOptions.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, urgency: opt.value })}
                        className={`rounded-xl border-2 p-3 text-center transition-all duration-200 ${
                          formData.urgency === opt.value
                            ? opt.value === "high"
                              ? "border-destructive bg-destructive/10 text-destructive"
                              : opt.value === "medium"
                                ? "border-accent bg-accent/10 text-accent-foreground"
                                : "border-primary bg-primary/10 text-primary"
                            : "border-border bg-card hover:border-muted-foreground/30"
                        }`}
                      >
                        <span className="text-sm font-semibold block">{opt.label}</span>
                        <span className="text-xs text-muted-foreground block mt-0.5">{opt.description}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="default"
                  size="lg"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Submit Concern"}
                </Button>
              </form>

              <div className="mt-6 space-y-3">
                {[
                  "Get responses within 30 minutes",
                  "All professionals are verified & background-checked",
                  "Compare quotes before choosing",
                ].map((text) => (
                  <div key={text} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default RaiseConcernPage;


