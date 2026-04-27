import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import ServicesSection from "@/components/ServicesSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import RaiseConcernSection from "@/components/RaiseConcernSection";
import FeaturedProvidersSection from "@/components/FeaturedProvidersSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <ServicesSection />
        <FeaturedProvidersSection />
        <HowItWorksSection />
        <RaiseConcernSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
