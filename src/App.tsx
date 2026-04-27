import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { AuthProvider } from "@/hooks/useAuth";
import { AppModeProvider } from "@/hooks/useAppMode";
import Index from "./pages/Index";
import ProviderDashboard from "./pages/ProviderDashboard";
import ProviderProfile from "./pages/ProviderProfile";
import ProviderJobs from "./pages/ProviderJobs";
import Auth from "./pages/Auth";
import ServiceCategories from "./pages/ServiceCategories";
import ServiceAvailability from "./pages/ServiceAvailability";
import RaiseConcernPage from "./pages/RaiseConcernPage";
import ProviderResults from "./pages/ProviderResults";
import KYCVerification from "./pages/KYCVerification";
import Profile from "./pages/Profile";
import MyRequests from "./pages/MyRequests";
import ServiceHistory from "./pages/ServiceHistory";
import MyReviews from "./pages/MyReviews";
import Notifications from "./pages/Notifications";
import SettingsPage from "./pages/SettingsPage";
import Support from "./pages/Support";
import ChatPage from "./pages/ChatPage";
import NotFound from "./pages/NotFound";
import AIChatbot from "./components/AIChatbot";
import SOSButton from "./components/provider-dashboard/SOSButton";

const queryClient = new QueryClient();

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
};

const ConditionalAIChatbot = () => {
  const location = useLocation();
  const providerPages = ["/provider-dashboard", "/provider-profile", "/provider-jobs"];
  if (providerPages.includes(location.pathname)) return null;
  return <AIChatbot />;
};

const ConditionalSOSButton = () => {
  const location = useLocation();
  const providerPages = ["/provider-dashboard", "/provider-profile", "/provider-jobs"];
  if (providerPages.includes(location.pathname)) return null;
  return <SOSButton />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <AppModeProvider>
          <TooltipProvider>
          <Toaster />
          <Sonner />
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/provider-dashboard" element={<ProviderDashboard />} />
            <Route path="/provider-profile" element={<ProviderProfile />} />
            <Route path="/provider-jobs" element={<ProviderJobs />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/services" element={<ServiceCategories />} />
            <Route path="/services/:category" element={<ServiceAvailability />} />
            <Route path="/service-availability/:category" element={<ServiceAvailability />} />
            <Route path="/raise-concern/:category" element={<RaiseConcernPage />} />
            <Route path="/provider-results" element={<ProviderResults />} />
            <Route path="/kyc-verification" element={<KYCVerification />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/my-requests" element={<MyRequests />} />
            <Route path="/service-history" element={<ServiceHistory />} />
            <Route path="/my-reviews" element={<MyReviews />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/support" element={<Support />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <ConditionalAIChatbot />
          <ConditionalSOSButton />
          </TooltipProvider>
        </AppModeProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
