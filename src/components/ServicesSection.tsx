import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import SectionReveal from "@/components/SectionReveal";
import { Button } from "@/components/ui/button";
import { 
  Wrench, 
  Zap, 
  Stethoscope, 
  SprayCanIcon, 
  Paintbrush, 
  Home,
  Car,
  Scissors,
  ArrowRight,
  Bug,
  Wind,
  Truck,
  Shirt,
  Flower2,
  UtensilsCrossed,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const services = [
  { icon: Wrench, title: "Plumbers", slug: "plumber", description: "Pipe repairs, installations, and leak fixes", color: "bg-primary/10 text-primary", providers: 450 },
  { icon: Zap, title: "Electricians", slug: "electrician", description: "Wiring, repairs, and electrical installations", color: "bg-accent/10 text-accent", providers: 380 },
  { icon: SprayCanIcon, title: "Cleaners", slug: "cleaner", description: "Deep cleaning, regular cleaning, sanitization", color: "bg-primary/10 text-primary", providers: 560 },
  { icon: Paintbrush, title: "Painters", slug: "painter", description: "Interior, exterior, and decorative painting", color: "bg-accent/10 text-accent", providers: 290 },
  { icon: Stethoscope, title: "Doctors", slug: "doctor", description: "Home visits and teleconsultations", color: "bg-destructive/10 text-destructive", providers: 220 },
  { icon: Home, title: "Carpenters", slug: "carpenter", description: "Furniture repair, custom woodwork", color: "bg-accent/15 text-accent", providers: 185 },
  { icon: Wind, title: "AC & Appliance", slug: "appliance-repair", description: "AC, washing machine & fridge repair", color: "bg-primary/10 text-primary", providers: 410 },
  { icon: Bug, title: "Pest Control", slug: "pest-control", description: "Termite, cockroach & rodent treatment", color: "bg-destructive/10 text-destructive", providers: 175 },
  { icon: Car, title: "Mechanics", slug: "mechanic", description: "Vehicle repairs and maintenance", color: "bg-muted text-muted-foreground", providers: 145 },
  { icon: Scissors, title: "Salon & Spa", slug: "salon", description: "Beauty services at your doorstep", color: "bg-accent/10 text-accent", providers: 320 },
  { icon: Truck, title: "Packers & Movers", slug: "packers-movers", description: "Home shifting & relocation services", color: "bg-primary/10 text-primary", providers: 130 },
  { icon: Shirt, title: "Laundry", slug: "laundry", description: "Wash, dry-clean & ironing pickup", color: "bg-accent/15 text-accent", providers: 240 },
  { icon: Flower2, title: "Gardening", slug: "gardening", description: "Lawn care, landscaping & plant care", color: "bg-primary/10 text-primary", providers: 95 },
  { icon: UtensilsCrossed, title: "Cook & Chef", slug: "cook", description: "Home-cooked meals & party catering", color: "bg-destructive/10 text-destructive", providers: 210 },
];

const ServicesSection = () => {
  const navigate = useNavigate();
  const [showAll, setShowAll] = useState(false);
  const visibleServices = showAll ? services : services.slice(0, 8);

  return (
    <section id="services" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <SectionReveal>
          <div className="text-center mb-14">
            <span className="inline-block px-4 py-1.5 rounded-full bg-secondary text-secondary-foreground text-sm font-medium mb-4">
              Our Services
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Services Tailored for You
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From home repairs to healthcare, find verified professionals for all your needs
            </p>
          </div>
        </SectionReveal>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {visibleServices.map((service, index) => (
            <SectionReveal key={service.title} delay={index * 0.06}>
              <motion.div
                whileHover={{ y: -6, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                onClick={() => navigate(`/service-availability/${service.slug}`)}
                className="group bg-card rounded-2xl p-6 shadow-soft hover:shadow-card-hover cursor-pointer border border-transparent hover:border-primary/20 transition-all duration-300 relative overflow-hidden"
              >
                {/* Subtle gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative z-10">
                  <div className={`w-14 h-14 rounded-xl ${service.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <service.icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">{service.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{service.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-primary">{service.providers}+ providers</span>
                    <ArrowRight className="w-4 h-4 text-primary opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                  </div>
                </div>
              </motion.div>
            </SectionReveal>
          ))}
        </div>

        {services.length > 8 && (
          <div className="text-center mt-8">
            <Button
              variant="outline"
              size="lg"
              onClick={() => setShowAll(!showAll)}
              className="rounded-full gap-2"
            >
              {showAll ? (
                <>Show Less <ChevronUp className="w-4 h-4" /></>
              ) : (
                <>View All {services.length} Services <ChevronDown className="w-4 h-4" /></>
              )}
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default ServicesSection;
