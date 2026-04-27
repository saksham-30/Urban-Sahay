import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  Wrench,
  Zap,
  SprayCanIcon,
  Paintbrush,
  Stethoscope,
  Home,
  Siren,
  Car,
  Scissors,
  Bug,
  Wind,
  Truck,
  ShowerHead,
  Shirt,
  Flower2,
  UtensilsCrossed,
  Baby,
  Dog,
  Dumbbell,
  BookOpen,
} from "lucide-react";

const categories = [
  { icon: Wrench, label: "Plumber", description: "Pipe repairs, installations & leak fixes", slug: "plumber" },
  { icon: Zap, label: "Electrician", description: "Wiring, repairs & installations", slug: "electrician" },
  { icon: SprayCanIcon, label: "Cleaner", description: "Deep cleaning & sanitization", slug: "cleaner" },
  { icon: Paintbrush, label: "Painter", description: "Interior & exterior painting", slug: "painter" },
  { icon: Stethoscope, label: "Doctor", description: "Home visits & teleconsultations", slug: "doctor" },
  { icon: Home, label: "Carpenter", description: "Furniture repair & custom woodwork", slug: "carpenter" },
  { icon: Car, label: "Mechanic", description: "Vehicle repair & maintenance at home", slug: "mechanic" },
  { icon: Scissors, label: "Salon & Spa", description: "Beauty & grooming at your doorstep", slug: "salon" },
  { icon: Bug, label: "Pest Control", description: "Termite, cockroach & rodent treatment", slug: "pest-control" },
  { icon: Wind, label: "AC & Appliance", description: "AC, washing machine & fridge repair", slug: "appliance-repair" },
  { icon: ShowerHead, label: "Bathroom Renovation", description: "Waterproofing, tiling & fittings", slug: "bathroom-renovation" },
  { icon: Truck, label: "Packers & Movers", description: "Home shifting & relocation services", slug: "packers-movers" },
  { icon: Shirt, label: "Laundry & Ironing", description: "Wash, dry-clean & ironing pickup", slug: "laundry" },
  { icon: Flower2, label: "Gardening", description: "Lawn care, landscaping & plant care", slug: "gardening" },
  { icon: UtensilsCrossed, label: "Cook & Chef", description: "Home-cooked meals & party catering", slug: "cook" },
  { icon: Baby, label: "Babysitter", description: "Trusted childcare & nanny services", slug: "babysitter" },
  { icon: Dog, label: "Pet Care", description: "Pet grooming, walking & vet visits", slug: "pet-care" },
  { icon: Dumbbell, label: "Fitness Trainer", description: "Personal training at home", slug: "fitness" },
  { icon: BookOpen, label: "Home Tutor", description: "Academic tutoring for all ages", slug: "tutor" },
  { icon: Siren, label: "Emergency Services", description: "24/7 urgent help when you need it most", slug: "emergency" },
];

const ServiceCategories = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-secondary text-secondary-foreground text-sm font-medium mb-4">
              Browse Services
            </span>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              What do you need help with?
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Select a category to find verified professionals near you.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 max-w-5xl mx-auto">
            {categories.map((cat, i) => (
              <motion.button
                key={cat.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                onClick={() => navigate(`/raise-concern/${cat.slug}`)}
                className="group flex flex-col items-center text-center bg-card rounded-2xl p-6 shadow-soft hover:shadow-card border border-transparent hover:border-primary/20 transition-all duration-300 cursor-pointer"
              >
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300">
                  <cat.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-base font-semibold text-foreground mb-1">{cat.label}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{cat.description}</p>
              </motion.button>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ServiceCategories;
