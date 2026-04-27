import { useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Star, MapPin, IndianRupee, ArrowLeft, BadgeCheck, Loader2, ArrowDownUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LocationMap from "@/components/LocationMap";
import ProviderDetailSheet from "@/components/ProviderDetailSheet";
import { useGeolocation } from "@/hooks/useGeolocation";

interface Provider {
  id: string;
  name: string;
  rating: number;
  reviews: number;
  visitingCharge: string;
  distance: string;
  verified: boolean;
  experience: number;
  lat: number;
  lng: number;
  phone?: string;
  description?: string;
}

const stockProviders: Record<string, Provider[]> = {
  "Plumbing Issue": [
    { id: "p1", name: "Rajesh Patil", rating: 4.8, reviews: 124, visitingCharge: "₹200", distance: "1.2 km", verified: true, experience: 8, lat: 18.5074, lng: 73.8077, description: "Expert in pipe fitting & leak repairs, Kothrud" },
    { id: "p2", name: "Suresh Jadhav", rating: 4.5, reviews: 89, visitingCharge: "₹150", distance: "2.4 km", verified: true, experience: 5, lat: 18.5590, lng: 73.7868, description: "Bathroom & kitchen plumbing, Baner" },
    { id: "p3", name: "Amit Deshmukh", rating: 4.3, reviews: 62, visitingCharge: "₹180", distance: "3.1 km", verified: false, experience: 3, lat: 18.5362, lng: 73.8956, description: "Affordable plumbing, Koregaon Park" },
    { id: "p4", name: "Vikram Kulkarni", rating: 4.6, reviews: 97, visitingCharge: "₹250", distance: "1.8 km", verified: true, experience: 10, lat: 18.5196, lng: 73.8553, description: "Water heater & tank installation, Shivajinagar" },
  ],
  "Electrical Problem": [
    { id: "e1", name: "Deepak Wagh", rating: 4.9, reviews: 210, visitingCharge: "₹250", distance: "0.8 km", verified: true, experience: 12, lat: 18.5308, lng: 73.8474, description: "Wiring & switchboard expert, Deccan" },
    { id: "e2", name: "Manoj Shinde", rating: 4.6, reviews: 105, visitingCharge: "₹200", distance: "1.9 km", verified: true, experience: 7, lat: 18.5913, lng: 73.7389, description: "AC & appliance repair, Hinjewadi" },
    { id: "e3", name: "Sachin More", rating: 4.4, reviews: 48, visitingCharge: "₹180", distance: "3.5 km", verified: true, experience: 4, lat: 18.5679, lng: 73.9143, description: "Home electrician, Viman Nagar" },
    { id: "e4", name: "Ganesh Bhosale", rating: 4.2, reviews: 33, visitingCharge: "₹150", distance: "4.2 km", verified: false, experience: 2, lat: 18.4575, lng: 73.8508, description: "Basic electrical repairs, Sinhagad Road" },
  ],
  "Cleaning Service": [
    { id: "c1", name: "Priya Kamble", rating: 4.7, reviews: 156, visitingCharge: "₹300", distance: "1.0 km", verified: true, experience: 6, lat: 18.5362, lng: 73.8956, description: "Deep cleaning & sanitization, Koregaon Park" },
    { id: "c2", name: "Sonal Pawar", rating: 4.5, reviews: 88, visitingCharge: "₹250", distance: "2.0 km", verified: true, experience: 4, lat: 18.5074, lng: 73.8077, description: "Home & office cleaning, Kothrud" },
    { id: "c3", name: "Meena Gaikwad", rating: 4.3, reviews: 45, visitingCharge: "₹200", distance: "2.8 km", verified: false, experience: 2, lat: 18.5590, lng: 73.7868, description: "Affordable daily cleaning, Baner" },
  ],
  "Painting & Renovation": [
    { id: "pa1", name: "Rahul Deshpande", rating: 4.8, reviews: 130, visitingCharge: "₹350", distance: "1.5 km", verified: true, experience: 10, lat: 18.5196, lng: 73.8553, description: "Interior & exterior painting, Shivajinagar" },
    { id: "pa2", name: "Sanjay Mane", rating: 4.4, reviews: 72, visitingCharge: "₹300", distance: "2.2 km", verified: true, experience: 6, lat: 18.5308, lng: 73.8474, description: "Wall textures & waterproofing, Deccan" },
    { id: "pa3", name: "Ajay Chavan", rating: 4.1, reviews: 38, visitingCharge: "₹250", distance: "3.6 km", verified: false, experience: 3, lat: 18.5913, lng: 73.7389, description: "Budget-friendly painting, Hinjewadi" },
  ],
  "Medical Emergency": [
    { id: "d1", name: "Dr. Anita Joshi", rating: 4.9, reviews: 320, visitingCharge: "₹500", distance: "0.5 km", verified: true, experience: 15, lat: 18.5308, lng: 73.8474, description: "General physician, home visits, Deccan" },
    { id: "d2", name: "Dr. Nitin Kulkarni", rating: 4.7, reviews: 185, visitingCharge: "₹600", distance: "1.3 km", verified: true, experience: 12, lat: 18.5362, lng: 73.8956, description: "Family doctor, Koregaon Park" },
    { id: "d3", name: "Dr. Sneha Bapat", rating: 4.5, reviews: 98, visitingCharge: "₹450", distance: "2.1 km", verified: true, experience: 8, lat: 18.5074, lng: 73.8077, description: "Pediatrician & general care, Kothrud" },
  ],
  "Carpentry Work": [
    { id: "ca1", name: "Ramesh Sawant", rating: 4.6, reviews: 92, visitingCharge: "₹300", distance: "1.4 km", verified: true, experience: 9, lat: 18.5590, lng: 73.7868, description: "Custom furniture & repairs, Baner" },
    { id: "ca2", name: "Tushar Nikam", rating: 4.3, reviews: 55, visitingCharge: "₹250", distance: "2.6 km", verified: true, experience: 5, lat: 18.5679, lng: 73.9143, description: "Modular kitchen specialist, Viman Nagar" },
    { id: "ca3", name: "Vishal Kale", rating: 4.0, reviews: 28, visitingCharge: "₹200", distance: "3.8 km", verified: false, experience: 3, lat: 18.4575, lng: 73.8508, description: "Door & window fitting, Sinhagad Road" },
  ],
  "Vehicle Repair": [
    { id: "m1", name: "Anil Thakur", rating: 4.7, reviews: 145, visitingCharge: "₹300", distance: "1.1 km", verified: true, experience: 11, lat: 18.5196, lng: 73.8553, description: "Two-wheeler & car mechanic, Shivajinagar" },
    { id: "m2", name: "Pramod Yadav", rating: 4.4, reviews: 78, visitingCharge: "₹250", distance: "2.3 km", verified: true, experience: 6, lat: 18.5074, lng: 73.8077, description: "Roadside breakdown assistance, Kothrud" },
    { id: "m3", name: "Ravi Gholap", rating: 4.1, reviews: 40, visitingCharge: "₹200", distance: "3.9 km", verified: false, experience: 3, lat: 18.5913, lng: 73.7389, description: "Bike servicing & repairs, Hinjewadi" },
  ],
  "Beauty Services": [
    { id: "s1", name: "Neha Sharma", rating: 4.8, reviews: 200, visitingCharge: "₹400", distance: "0.9 km", verified: true, experience: 8, lat: 18.5362, lng: 73.8956, description: "Bridal makeup & spa, Koregaon Park" },
    { id: "s2", name: "Kavita Phadke", rating: 4.5, reviews: 110, visitingCharge: "₹350", distance: "1.7 km", verified: true, experience: 5, lat: 18.5590, lng: 73.7868, description: "Hair styling & facials, Baner" },
    { id: "s3", name: "Rina Bhandari", rating: 4.2, reviews: 52, visitingCharge: "₹300", distance: "2.9 km", verified: false, experience: 3, lat: 18.5308, lng: 73.8474, description: "At-home salon services, Deccan" },
  ],
  "Emergency Services": [
    { id: "em1", name: "Quick Rescue Pune", rating: 4.9, reviews: 280, visitingCharge: "₹0", distance: "0.6 km", verified: true, experience: 10, lat: 18.5196, lng: 73.8553, description: "24/7 emergency response, Shivajinagar" },
    { id: "em2", name: "Pune Fire Safety", rating: 4.7, reviews: 150, visitingCharge: "₹0", distance: "1.5 km", verified: true, experience: 15, lat: 18.5308, lng: 73.8474, description: "Fire & flood emergency, Deccan" },
    { id: "em3", name: "SafeHands Ambulance", rating: 4.6, reviews: 95, visitingCharge: "₹500", distance: "2.0 km", verified: true, experience: 7, lat: 18.5074, lng: 73.8077, description: "Ambulance & first-aid, Kothrud" },
  ],
};

const defaultProviders: Provider[] = [
  { id: "def1", name: "Arjun Reddy", rating: 4.7, reviews: 110, visitingCharge: "₹200", distance: "1.5 km", verified: true, experience: 6, lat: 18.5308, lng: 73.8474, description: "Multi-service professional, Deccan" },
  { id: "def2", name: "Priya Nair", rating: 4.4, reviews: 70, visitingCharge: "₹250", distance: "2.8 km", verified: true, experience: 9, lat: 18.5590, lng: 73.7868, description: "Trusted home services, Baner" },
  { id: "def3", name: "Karan Mehta", rating: 4.1, reviews: 35, visitingCharge: "₹150", distance: "3.5 km", verified: false, experience: 2, lat: 18.5074, lng: 73.8077, description: "Affordable handyman, Kothrud" },
];

const ProviderResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const serviceType: string = (location.state as any)?.serviceType || "Other";
  const { location: userLocation, loading: locationLoading } = useGeolocation();
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [sortOrder, setSortOrder] = useState<'low' | 'high'>('low');

  const providers = useMemo(() => {
    const base = stockProviders[serviceType] || defaultProviders;
    const parsePrice = (charge: string) => parseInt(charge.replace(/[^\d]/g, '')) || 0;
    return [...base].sort((a, b) =>
      sortOrder === 'low'
        ? parsePrice(a.visitingCharge) - parsePrice(b.visitingCharge)
        : parsePrice(b.visitingCharge) - parsePrice(a.visitingCharge)
    );
  }, [serviceType, sortOrder]);

  const mapProviders = providers.map((p) => ({
    id: p.id,
    name: p.name,
    lat: p.lat,
    lng: p.lng,
    rating: p.rating,
    verified: p.verified,
  }));

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            <div className="text-center mb-6">
              <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-3">
                {serviceType}
              </span>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                Nearby Service Providers
              </h1>
              <p className="text-muted-foreground">
                {`${providers.length} professionals found near you`}
              </p>
              <div className="mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => setSortOrder(sortOrder === 'low' ? 'high' : 'low')}
                >
                  <ArrowDownUp className="w-4 h-4" />
                  Price: {sortOrder === 'low' ? 'Low to High' : 'High to Low'}
                </Button>
              </div>
            </div>

            {/* Location Map */}
            <div className="mb-6">
              {locationLoading ? (
                <div className="w-full h-[250px] rounded-2xl border border-border bg-card flex items-center justify-center gap-2 text-muted-foreground">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-sm">Fetching your location...</span>
                </div>
              ) : (
                <LocationMap userLocation={userLocation} providers={mapProviders} />
              )}
            </div>

            {providers.length === 0 ? (
              <div className="bg-card rounded-2xl p-8 border border-border text-center">
                <MapPin className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-foreground mb-1">No providers found</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  No {serviceType.toLowerCase()} professionals are available right now.
                </p>
                <Button variant="outline" onClick={() => navigate("/")}>
                  Browse other services
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {providers.map((provider, i) => (
                  <motion.div
                    key={provider.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.1 }}
                    className="bg-card rounded-2xl p-5 shadow-soft border border-border hover:shadow-card transition-shadow duration-300"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-xl flex-shrink-0">
                        {provider.name.charAt(0)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-base font-semibold text-foreground truncate">{provider.name}</h3>
                          {provider.verified && <BadgeCheck className="w-4 h-4 text-primary flex-shrink-0" />}
                        </div>
                        {provider.description && (
                          <p className="text-xs text-muted-foreground mb-1.5 line-clamp-1">{provider.description}</p>
                        )}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 text-accent fill-accent" />
                            {provider.rating} ({provider.reviews})
                          </span>
                          <span className="flex items-center gap-1">
                            <IndianRupee className="w-3.5 h-3.5" />
                            {provider.visitingCharge}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />
                            {provider.distance}
                          </span>
                          <span>{provider.experience} yrs exp</span>
                        </div>
                      </div>

                      <Button
                        variant="default"
                        size="sm"
                        className="flex-shrink-0"
                        onClick={() => setSelectedProvider(provider)}
                      >
                        Select
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </main>
      <Footer />
      <ProviderDetailSheet
        provider={selectedProvider}
        open={!!selectedProvider}
        onOpenChange={(open) => !open && setSelectedProvider(null)}
        serviceType={serviceType}
      />
    </div>
  );
};

export default ProviderResults;
