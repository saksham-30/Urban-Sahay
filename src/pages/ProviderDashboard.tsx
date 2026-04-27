import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DashboardWelcomeBanner from "@/components/provider-dashboard/DashboardWelcomeBanner";
import DashboardStatsStrip from "@/components/provider-dashboard/DashboardStatsStrip";
import IncomingRequestsSection from "@/components/provider-dashboard/IncomingRequestsSection";
import RecentJobsSection from "@/components/provider-dashboard/RecentJobsSection";
import EarningsChart from "@/components/provider-dashboard/EarningsChart";
import RatingsChart from "@/components/provider-dashboard/RatingsChart";
import QuickActionsPanel from "@/components/provider-dashboard/QuickActionsPanel";
import NotificationBell from "@/components/provider-dashboard/NotificationBell";
import AchievementsPanel from "@/components/provider-dashboard/AchievementsPanel";
import DashboardSkeleton from "@/components/provider-dashboard/DashboardSkeleton";
import LiveRequestMap from "@/components/provider-dashboard/LiveRequestMap";
import ActiveChatsSection from "@/components/provider-dashboard/ActiveChatsSection";
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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20 pb-12">
        <div className="container mx-auto px-4 space-y-6">
          {/* Header row with notification bell */}
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-muted-foreground">Provider Dashboard</h2>
            <NotificationBell />
          </div>

          {/* Welcome Banner */}
          <DashboardWelcomeBanner
            profile={profile}
            availabilityStatus={availabilityStatus}
            setAvailabilityStatus={setAvailabilityStatus}
            onToggleAvailability={handleAvailabilityToggle}
            onRadiusChange={handleRadiusChange}
          />

          {/* Stats Strip */}
          <DashboardStatsStrip rating={profile?.rating ?? null} />

          {/* Incoming Requests - Full Width */}
          <IncomingRequestsSection />

          {/* Recent Jobs + Active Chats - Side by Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <RecentJobsSection />
            <ActiveChatsSection />
          </div>

          {/* Live Map */}
          <LiveRequestMap serviceRadius={profile?.service_radius ?? 10} />

          {/* Analytics Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <EarningsChart />
            <RatingsChart />
          </div>

          {/* Achievements & Milestones */}
          <AchievementsPanel
            completedJobs={98}
            rating={profile?.rating ?? null}
            totalReviews={profile?.total_reviews ?? null}
          />

          {/* Quick Actions */}
          <QuickActionsPanel />
        </div>
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
