import { motion } from "framer-motion";
import { MessageSquare, Search, UserCheck, ThumbsUp } from "lucide-react";
import SectionReveal from "@/components/SectionReveal";

const steps = [
  { icon: MessageSquare, title: "Raise Your Concern", description: "Describe your issue or the service you need. Be as specific as possible for better matches." },
  { icon: Search, title: "Get Matched", description: "Our system finds verified professionals in your area who can solve your problem." },
  { icon: UserCheck, title: "Choose & Connect", description: "Review profiles, ratings, and prices. Pick the best match and connect directly." },
  { icon: ThumbsUp, title: "Get It Done", description: "Service completed! Rate your experience and help others find great professionals." },
];

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <SectionReveal>
          <div className="text-center mb-14">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              How It Works
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Getting Help is Simple
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Four easy steps to connect with the right professional for your needs
            </p>
          </div>
        </SectionReveal>

        <div className="grid md:grid-cols-4 gap-8 relative">
          {/* Connection Line with gradient */}
          <div className="hidden md:block absolute top-16 left-[12%] right-[12%] h-0.5 overflow-hidden">
            <motion.div
              className="h-full w-full bg-gradient-to-r from-primary/20 via-primary to-primary/20"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
          
          {steps.map((step, index) => (
            <SectionReveal key={step.title} delay={index * 0.15}>
              <motion.div
                className="relative flex flex-col items-center text-center group"
                whileHover={{ y: -6 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                {/* Step Icon */}
                <div className="relative z-10 w-16 h-16 rounded-2xl gradient-hero flex items-center justify-center shadow-card mb-6 group-hover:shadow-card-hover transition-shadow duration-300">
                  <step.icon className="w-7 h-7 text-primary-foreground" />
                </div>
                <motion.div
                  className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-3 w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-sm font-bold shadow-soft z-20"
                  whileHover={{ scale: 1.15 }}
                >
                  {index + 1}
                </motion.div>
                <h3 className="text-lg font-semibold text-foreground mb-3 group-hover:text-primary transition-colors">{step.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
              </motion.div>
            </SectionReveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
