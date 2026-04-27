import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Shield, Star, Users, ChevronRight, Loader2, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  getServiceSuggestion,
  inferServiceFromText,
  predictServiceCategory,
  ServiceSuggestion,
} from "@/lib/serviceClassifier";

const HeroSection = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isLoadingSuggestion, setIsLoadingSuggestion] = useState(false);
  const [serviceSuggestion, setServiceSuggestion] = useState<ServiceSuggestion | null>(null);
  const [predictionError, setPredictionError] = useState("");

  const stats = [
    { icon: Users, label: "Verified Pros", value: "10,000+" },
    { icon: Star, label: "Happy Customers", value: "50,000+" },
    { icon: Shield, label: "Service Guarantee", value: "100%" },
  ];

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.1 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedQuery(searchQuery.trim());
    }, 400);

    return () => window.clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const query = debouncedQuery;
    if (!query) {
      setServiceSuggestion(null);
      setPredictionError("");
      setIsLoadingSuggestion(false);
      return;
    }

    if (query.length < 3) {
      setServiceSuggestion(null);
      setPredictionError("");
      return;
    }

    const controller = new AbortController();

    const detectService = async () => {
      setIsLoadingSuggestion(true);
      setPredictionError("");

      try {
        const predictedCategory = await predictServiceCategory(query, controller.signal);
        const suggestion = getServiceSuggestion(predictedCategory) || inferServiceFromText(query);

        if (!suggestion) {
          setServiceSuggestion(null);
          setPredictionError("Unable to detect service, try again");
          return;
        }

        setServiceSuggestion(suggestion);
      } catch (error) {
        if (controller.signal.aborted) return;

        const fallbackSuggestion = inferServiceFromText(query);
        if (fallbackSuggestion) {
          setServiceSuggestion(fallbackSuggestion);
          setPredictionError("");
          return;
        }

        setServiceSuggestion(null);
        setPredictionError("Unable to detect service, try again");
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingSuggestion(false);
        }
      }
    };

    detectService();

    return () => controller.abort();
  }, [debouncedQuery]);

  const handleSearchSubmit = async () => {
    const query = searchQuery.trim();
    if (!query) return;

    if (serviceSuggestion) {
      navigate(`/services/${serviceSuggestion.slug}`);
      return;
    }

    setIsLoadingSuggestion(true);
    setPredictionError("");

    try {
      const predictedCategory = await predictServiceCategory(query);
      const suggestion = getServiceSuggestion(predictedCategory) || inferServiceFromText(query);

      if (!suggestion) {
        setPredictionError("Unable to detect service, try again");
        return;
      }

      setServiceSuggestion(suggestion);
      navigate(`/services/${suggestion.slug}`);
    } catch (error) {
      const fallbackSuggestion = inferServiceFromText(query);
      if (fallbackSuggestion) {
        setServiceSuggestion(fallbackSuggestion);
        navigate(`/services/${fallbackSuggestion.slug}`);
      } else {
        setPredictionError("Unable to detect service, try again");
      }
    } finally {
      setIsLoadingSuggestion(false);
    }
  };

  const handleQuickCategoryClick = (category: string) => {
    const suggestion = getServiceSuggestion(category);
    if (!suggestion) return;
    navigate(`/services/${suggestion.slug}`);
  };

  return (
    <section className="relative min-h-[90vh] flex items-center pt-16 overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 gradient-hero opacity-95" />
      
      {/* Decorative Elements */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-accent/20 rounded-full blur-3xl animate-pulse-soft" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-primary-foreground/10 rounded-full blur-3xl animate-float" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary-foreground/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          className="max-w-3xl mx-auto text-center"
          variants={container}
          initial="hidden"
          animate="visible"
        >
          <motion.span
            variants={item}
            className="inline-block px-4 py-2 rounded-full bg-primary-foreground/20 text-primary-foreground text-sm font-medium mb-6 backdrop-blur-sm border border-primary-foreground/10"
          >
            🏙️ New to the city? We've got you covered!
          </motion.span>
          
          <motion.h1
            variants={item}
            className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-primary-foreground mb-6 leading-tight tracking-tight"
          >
            Find Trusted Local
            <br />
            <span className="relative">
              Service Providers
              <motion.span
                className="absolute -bottom-2 left-0 right-0 h-1 bg-accent/60 rounded-full"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.8, duration: 0.6, ease: "easeOut" }}
              />
            </span>
          </motion.h1>
          
          <motion.p
            variants={item}
            className="text-lg md:text-xl text-primary-foreground/80 mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            Connect with verified plumbers, electricians, doctors, and more in your neighborhood. 
            Raise a concern and get help within hours.
          </motion.p>

          {/* Search Box */}
          <motion.div
            variants={item}
            className="bg-card rounded-2xl shadow-card p-3 md:p-4 border border-border/50"
          >
            <form
              className="flex flex-col md:flex-row gap-3 items-end"
              onSubmit={(e) => {
                e.preventDefault();
                void handleSearchSubmit();
              }}
            >
              <div className="flex-1 relative group w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  type="text"
                  placeholder="What problem are you facing?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 border-0 bg-muted/50 text-sm md:text-base focus:bg-muted/80 transition-colors font-medium"
                />
              </div>
              <Button variant="hero" onClick={handleSearchSubmit} className="h-12 px-6 md:px-10 group w-full md:w-auto" type="button" disabled={isLoadingSuggestion}>
                {isLoadingSuggestion ? (
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <Search className="w-5 h-5 mr-2" />
                )}
                Search
                <ChevronRight className="w-4 h-4 ml-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
              </Button>
            </form>

            {(isLoadingSuggestion || predictionError || serviceSuggestion) && (
              <div className="mt-3 md:mt-4 rounded-xl bg-gradient-to-r from-primary/10 via-accent/15 to-secondary/25 border border-primary/20 p-3 md:p-4">
                {isLoadingSuggestion && (
                  <div className="flex items-center gap-2 text-sm md:text-base text-foreground/80">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    Detecting best service for your issue...
                  </div>
                )}

                {!isLoadingSuggestion && predictionError && (
                  <p className="text-sm md:text-base text-destructive font-medium">{predictionError}</p>
                )}

                {!isLoadingSuggestion && !predictionError && serviceSuggestion && (
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <p className="text-sm md:text-base text-foreground">
                      <span className="inline-flex items-center gap-1.5 text-primary font-semibold">
                        <Sparkles className="w-4 h-4" />
                        Suggested Service:
                      </span>{" "}
                      <span className="font-bold text-primary text-base md:text-lg">
                        {serviceSuggestion.category} {serviceSuggestion.emoji}
                      </span>
                    </p>

                    <Button
                      type="button"
                      className="w-full sm:w-auto"
                      onClick={() => navigate(`/services/${serviceSuggestion.slug}`)}
                    >
                      Go to {serviceSuggestion.category}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </motion.div>

          {/* Quick Categories */}
          <motion.div
            variants={item}
            className="flex flex-wrap justify-center gap-3 mt-6"
          >
            {["Plumber", "Electrician", "Doctor", "Cleaner", "Painter"].map((cat, i) => (
              <motion.button
                key={cat}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleQuickCategoryClick(cat)}
                className="px-4 py-2 rounded-full bg-primary-foreground/20 text-primary-foreground text-sm font-medium hover:bg-primary-foreground/30 transition-colors backdrop-blur-sm border border-primary-foreground/10"
              >
                {cat}
              </motion.button>
            ))}
          </motion.div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.8, ease: "easeOut" }}
          className="grid grid-cols-3 gap-4 md:gap-8 max-w-2xl mx-auto mt-16"
        >
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              className="text-center group"
              whileHover={{ y: -4 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-primary-foreground/15 backdrop-blur-sm flex items-center justify-center mx-auto mb-3 group-hover:bg-primary-foreground/25 transition-colors border border-primary-foreground/10">
                <stat.icon className="w-6 h-6 md:w-7 md:h-7 text-accent" />
              </div>
              <div className="text-2xl md:text-3xl font-bold text-primary-foreground">{stat.value}</div>
              <div className="text-sm text-primary-foreground/70">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
