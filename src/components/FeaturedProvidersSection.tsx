import { motion } from "framer-motion";
import { Star, MapPin, Shield, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import SectionReveal from "@/components/SectionReveal";

const providers = [
  {
    id: 1, name: "Rajesh Kumar", service: "Plumber", rating: 4.9, reviews: 234,
    location: "Koramangala, Bangalore", experience: "12 years", verified: true, price: "₹300/hr", avatar: "RK",
  },
  {
    id: 2, name: "Priya Sharma", service: "Electrician", rating: 4.8, reviews: 189,
    location: "HSR Layout, Bangalore", experience: "8 years", verified: true, price: "₹350/hr", avatar: "PS",
  },
  {
    id: 3, name: "Dr. Amit Singh", service: "General Physician", rating: 4.9, reviews: 412,
    location: "Indiranagar, Bangalore", experience: "15 years", verified: true, price: "₹500/visit", avatar: "AS",
  },
  {
    id: 4, name: "Sunita Devi", service: "Home Cleaner", rating: 4.7, reviews: 156,
    location: "Whitefield, Bangalore", experience: "6 years", verified: true, price: "₹250/hr", avatar: "SD",
  },
];

const FeaturedProvidersSection = () => {
  return (
    <section className="py-20 bg-secondary/20">
      <div className="container mx-auto px-4">
        <SectionReveal>
          <div className="text-center mb-14">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              Top Rated
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Featured Professionals
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Highly rated and verified professionals trusted by thousands
            </p>
          </div>
        </SectionReveal>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {providers.map((provider, index) => (
            <SectionReveal key={provider.id} delay={index * 0.1}>
              <motion.div
                whileHover={{ y: -8 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="bg-card rounded-2xl p-6 shadow-soft hover:shadow-card-hover transition-all duration-300 border border-transparent hover:border-primary/20 group relative overflow-hidden"
              >
                {/* Gradient accent line */}
                <div className="absolute top-0 left-0 right-0 h-1 gradient-hero opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <motion.div
                      whileHover={{ rotate: [0, -5, 5, 0] }}
                      transition={{ duration: 0.4 }}
                      className="w-14 h-14 rounded-xl gradient-hero flex items-center justify-center text-primary-foreground font-bold text-lg shadow-soft"
                    >
                      {provider.avatar}
                    </motion.div>
                    <div>
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{provider.name}</h3>
                      <p className="text-sm text-muted-foreground">{provider.service}</p>
                    </div>
                  </div>
                  {provider.verified && (
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Shield className="w-4 h-4 text-primary" />
                    </div>
                  )}
                </div>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center gap-1 bg-accent/10 px-2 py-0.5 rounded-full">
                    <Star className="w-3.5 h-3.5 fill-accent text-accent" />
                    <span className="font-semibold text-sm text-foreground">{provider.rating}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">({provider.reviews} reviews)</span>
                </div>

                {/* Details */}
                <div className="space-y-2 mb-5">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{provider.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4 flex-shrink-0" />
                    <span>{provider.experience} experience</span>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <span className="text-lg font-bold text-primary">{provider.price}</span>
                  <Button variant="outline" size="sm" className="group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all duration-300">
                    Book Now
                    <ArrowRight className="w-3.5 h-3.5 ml-1 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                  </Button>
                </div>
              </motion.div>
            </SectionReveal>
          ))}
        </div>

        <SectionReveal delay={0.4}>
          <div className="text-center mt-10">
            <Button variant="default" size="lg" className="group">
              View All Professionals
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </SectionReveal>
      </div>
    </section>
  );
};

export default FeaturedProvidersSection;
