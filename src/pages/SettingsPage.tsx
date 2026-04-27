import BackToDashboard from '@/components/BackToDashboard';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Bell, Moon, Shield, Globe, Trash2, SlidersHorizontal } from 'lucide-react';
import NotificationPreferences from '@/components/NotificationPreferences';

const SettingsPage = () => {
  const { user, isLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => { if (!isLoading && !user) navigate('/auth'); }, [user, isLoading, navigate]);

  const handleDeleteAccount = () => {
    toast.error('Account deletion is not yet available. Contact support for assistance.');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 pt-24 pb-16 max-w-2xl">
        <BackToDashboard />
        <h1 className="text-2xl font-bold text-foreground mb-6">Settings</h1>

        <div className="space-y-6">
          {/* Notifications — Simple Toggles */}
          <div className="bg-card rounded-xl border border-border p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              <h2 className="font-semibold text-foreground">Notifications</h2>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="push-notif" className="text-sm">Push Notifications</Label>
              <Switch id="push-notif" checked={notifications} onCheckedChange={setNotifications} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="email-updates" className="text-sm">Email Updates</Label>
              <Switch id="email-updates" checked={emailUpdates} onCheckedChange={setEmailUpdates} />
            </div>
          </div>

          {/* Detailed Notification Preferences */}
          <div className="bg-card rounded-xl border border-border p-5 space-y-4">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5 text-primary" />
              <h2 className="font-semibold text-foreground">Communication Preferences</h2>
            </div>
            <p className="text-xs text-muted-foreground">Control how you receive updates for each category</p>
            <NotificationPreferences />
          </div>

          {/* Appearance */}
          <div className="bg-card rounded-xl border border-border p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Moon className="w-5 h-5 text-primary" />
              <h2 className="font-semibold text-foreground">Appearance</h2>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="dark-mode" className="text-sm">Dark Mode</Label>
              <Switch id="dark-mode" checked={darkMode} onCheckedChange={(v) => { setDarkMode(v); toast.info('Dark mode coming soon!'); }} />
            </div>
          </div>

          {/* Privacy */}
          <div className="bg-card rounded-xl border border-border p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              <h2 className="font-semibold text-foreground">Privacy & Security</h2>
            </div>
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/kyc-verification')}>
              <Shield className="w-4 h-4 mr-2" /> Manage KYC Verification
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => toast.info('Password change coming soon!')}>
              Change Password
            </Button>
          </div>

          {/* Language */}
          <div className="bg-card rounded-xl border border-border p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary" />
              <h2 className="font-semibold text-foreground">Language</h2>
            </div>
            <p className="text-sm text-muted-foreground">Currently set to <span className="font-medium text-foreground">English</span></p>
          </div>

          {/* Danger zone */}
          <div className="bg-card rounded-xl border border-destructive/30 p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-destructive" />
              <h2 className="font-semibold text-destructive">Danger Zone</h2>
            </div>
            <p className="text-sm text-muted-foreground">Once you delete your account, there is no going back.</p>
            <Button variant="destructive" onClick={handleDeleteAccount}>Delete Account</Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SettingsPage;
