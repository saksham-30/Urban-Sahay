import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, BadgeCheck, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const categoryMap: Record<string, { label: string; serviceType: string }> = {
  plumber: { label: "Plumbers", serviceType: "Plumbing Issue" },
  electrician: { label: "Electricians", serviceType: "Electrical Problem" },
  cleaner: { label: "Cleaners", serviceType: "Cleaning Service" },
  painter: { label: "Painters", serviceType: "Painting & Renovation" },
  doctor: { label: "Doctors", serviceType: "Medical Emergency" },
  carpenter: { label: "Carpenters", serviceType: "Carpentry Work" },
  mechanic: { label: "Mechanics", serviceType: "Vehicle Repair" },
  salon: { label: "Salon & Spa", serviceType: "Beauty Services" },
  emergency: { label: "Emergency Services", serviceType: "Emergency Services" },
};

const ServiceAvailability = () => {
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const info = categoryMap[category || ""] || { label: "Service", serviceType: "Other" };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
              onClick={() => navigate("/")}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to categories
            </button>

            <div className="bg-card rounded-2xl p-8 shadow-card border border-border text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-primary" />
              </div>

              <h1 className="text-2xl font-bold text-foreground mb-2">{info.label}</h1>

              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-6">
                <BadgeCheck className="w-4 h-4 text-primary" />
                All professionals are verified
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  variant="default"
                  size="lg"
                  onClick={() =>
                    navigate("/provider-results", {
                      state: { serviceType: info.serviceType },
                    })
                  }
                >
                  View {info.label}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => navigate(`/raise-concern/${category}`)}
                >
                  Raise a Concern Instead
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ServiceAvailability;
