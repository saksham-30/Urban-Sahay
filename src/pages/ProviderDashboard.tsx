import { useEffect, useState } from "react";
import { useAppMode } from "@/hooks/useAppMode";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BarChart2, Trophy, History, MessageSquare } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DashboardWelcomeBanner from "@/components/provider-dashboard/DashboardWelcomeBanner";
import IncomingRequestsSection from "@/components/provider-dashboard/IncomingRequestsSection";
import NotificationBell from "@/components/provider-dashboard/NotificationBell";
import DashboardSkeleton from "@/components/provider-dashboard/DashboardSkeleton";
import LiveRequestMap from "@/components/provider-dashboard/LiveRequestMap";
import ProviderChatbot from "@/components/provider-dashboard/ProviderChatbot";
import SOSButton from "@/components/provider-dashboard/SOSButton";

interface ProviderProfile {
  full_name: string;
  service_type: string;
  city: string;
  rating: number | null;
  total_reviews: number | null;
  is_available: boolean | null;
  is_verified: boolean | null;
  experience_years: number | null;
  hourly_rate: string | null;
  description: string | null;
  service_radius: number;
}

type AvailabilityStatus = "online" | "busy" | "offline";

const ProviderDashboard = () => {
  const { user } = useAuth();
  const { setMode } = useAppMode();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [profile, setProfile] = useState<ProviderProfile | null>(null);
  const [availabilityStatus, setAvailabilityStatus] = useState<AvailabilityStatus>("online");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      const { data } = await supabase
        .from("service_providers")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (data) {
        setProfile(data);
        setAvailabilityStatus(data.is_available ? "online" : "offline");
      }
      setLoading(false);
    };
    fetchProfile();
  }, [user]);

  // Scroll to section when navigated with a hash or state.
  // Also watch `loading` so we retry scrolling after the dashboard finishes loading.
  useEffect(() => {
    if (!location) return;
    const stateOpen = (location.state as any)?.openSection;
    const targetHash = stateOpen ? `#${stateOpen}` : location.hash || "";
    if (!targetHash) return;
    const id = targetHash.replace('#', '');

    // Only attempt to scroll once the dashboard has finished loading and the elements exist.
    if (!loading) {
      const el = document.getElementById(id);
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
      }
      return;
    }

    // If still loading, wait for loading to change (effect depends on `loading`) and retry.
    const retry = setTimeout(() => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 120);

    return () => clearTimeout(retry);
  }, [location, loading]);

  const handleAvailabilityToggle = async (status: AvailabilityStatus) => {
    if (!user) return;
    await supabase
      .from("service_providers")
      .update({ is_available: status === "online" })
      .eq("user_id", user.id);
  };

  const handleRadiusChange = async (radius: number) => {
    if (!user || !profile) return;
    setProfile({ ...profile, service_radius: radius });
    await supabase
      .from("service_providers")
      .update({ service_radius: radius })
      .eq("user_id", user.id);
  };

  if (loading) return <DashboardSkeleton />;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5">
      <Header />
      <main className="pt-20 pb-12">
        <motion.div
          className="container mx-auto px-4 max-w-7xl space-y-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Header Section */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-border/20 pb-4 gap-4"
          >
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                {t('provider.title')}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {t('provider.manageDesc')}
              </p>
            </div>
            <div className="flex-shrink-0">
              <NotificationBell />
            </div>
          </motion.div>

          {/* Small Dashboard Quick Nav */}
          <motion.div variants={itemVariants} className="flex items-center gap-2 mt-2">
              <div className="hidden sm:flex items-center gap-2">
              {/* Recent Jobs & Active Chats removed from quick-nav (available via pages) */}
              <Button size="sm" variant="ghost" className="px-3 py-1" onClick={() => { setMode('provider'); navigate('/provider-performance'); }}>
                <BarChart2 className="w-4 h-4 mr-2" />
                {t('provider.performance')}
              </Button>
              <Button size="sm" variant="ghost" className="px-3 py-1" onClick={() => { setMode('provider'); navigate('/provider-achievements'); }}>
                <Trophy className="w-4 h-4 mr-2" />
                {t('provider.achievements')}
              </Button>
              <Button size="sm" variant="ghost" className="px-3 py-1" onClick={() => { setMode('provider'); navigate('/service-history'); }}>
                <History className="w-4 h-4 mr-2" />
                {t('provider.serviceHistory')}
              </Button>
              <Button size="sm" variant="ghost" className="px-3 py-1" onClick={() => { setMode('provider'); navigate('/chat'); }}>
                <MessageSquare className="w-4 h-4 mr-2" />
                {t('provider.activeChats')}
              </Button>
            </div>
            <div className="sm:hidden">
              <Button size="sm" variant="ghost" onClick={() => { setMode('provider'); navigate('/provider-performance'); }}>{t('provider.menu')}</Button>
            </div>
          </motion.div>

          {/* Welcome Banner */}
          <motion.div variants={itemVariants}>
            <DashboardWelcomeBanner
              profile={profile}
              availabilityStatus={availabilityStatus}
              setAvailabilityStatus={setAvailabilityStatus}
              onToggleAvailability={handleAvailabilityToggle}
              onRadiusChange={handleRadiusChange}
            />
          </motion.div>

          {/* KPI Metrics Row */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {/* Years of Experience */}
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
              className="relative overflow-hidden rounded-2xl border border-border/50 shadow-lg bg-gradient-to-br from-blue-500/10 to-blue-500/0 backdrop-blur-sm p-6"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-3xl -mr-8 -mt-8" />
              <div className="relative space-y-2">
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">{t('provider.yearsExperience')}</p>
                <p className="text-3xl md:text-4xl font-bold text-blue-600">{profile?.experience_years || 0}</p>
                <p className="text-xs text-muted-foreground">{profile?.service_type || t('profile.serviceLabel')}</p>
              </div>
            </motion.div>

            {/* Weekly Earnings */}
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
              className="relative overflow-hidden rounded-2xl border border-border/50 shadow-lg bg-gradient-to-br from-emerald-500/10 to-emerald-500/0 backdrop-blur-sm p-6"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-3xl -mr-8 -mt-8" />
              <div className="relative space-y-2">
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">{t('provider.weeklyEarnings')}</p>
                <p className="text-3xl md:text-4xl font-bold text-emerald-600">₹4,250</p>
                <p className="text-xs text-muted-foreground">+12% from last week</p>
              </div>
            </motion.div>

            {/* Current Rating */}
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
              className="relative overflow-hidden rounded-2xl border border-border/50 shadow-lg bg-gradient-to-br from-amber-500/10 to-amber-500/0 backdrop-blur-sm p-6"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-3xl -mr-8 -mt-8" />
              <div className="relative space-y-2">
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">{t('provider.currentRating')}</p>
                <p className="text-3xl md:text-4xl font-bold text-amber-600">{profile?.rating?.toFixed(1) || "4.8"}</p>
                <p className="text-xs text-muted-foreground">{profile?.total_reviews || 0} reviews</p>
              </div>
            </motion.div>

            {/* Service Radius */}
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
              className="relative overflow-hidden rounded-2xl border border-border/50 shadow-lg bg-gradient-to-br from-purple-500/10 to-purple-500/0 backdrop-blur-sm p-6"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-3xl -mr-8 -mt-8" />
              <div className="relative space-y-2">
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">{t('provider.serviceRadius')}</p>
                <p className="text-3xl md:text-4xl font-bold text-purple-600">{profile?.service_radius ?? 10} <span className="text-lg">km</span></p>
                <p className="text-xs text-muted-foreground">{t('provider.coverage')}</p>
              </div>
            </motion.div>
          </motion.div>

          {/* Incoming Requests */}
          <motion.div
            variants={itemVariants}
            className="bg-gradient-to-r from-primary/8 via-primary/4 to-transparent rounded-2xl border border-primary/20 shadow-lg shadow-primary/10 p-0 overflow-hidden hover:border-primary/30 transition-all duration-300"
          >
            <IncomingRequestsSection />
          </motion.div>

          {/* Dashboard summary cards removed: keep incoming requests and live map only */}

          {/* Live Map - Full Width */}
          <motion.div variants={itemVariants}>
            <LiveRequestMap serviceRadius={profile?.service_radius ?? 10} />
          </motion.div>

          {/* Performance Analytics moved to its own page */}

          {/* Achievements moved to its own page */}
        </motion.div>
      </main>
      <Footer />
      <ProviderChatbot />
      <SOSButton
        providerName={profile?.full_name}
        location={profile?.city}
      />
    </div>
  );
};

export default ProviderDashboard;
