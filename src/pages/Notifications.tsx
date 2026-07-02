import BackToDashboard from '@/components/BackToDashboard';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Bell, CheckCircle2, Clock, ShieldAlert, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/hooks/useLanguage';

const notifications = [
  { id: 1, title: 'KYC Verification Pending', message: 'Complete your identity verification to access all services.', type: 'warning', time: '2 hours ago', read: false },
  { id: 2, title: 'Service Request Accepted', message: 'Ramesh Kumar accepted your plumber request.', type: 'success', time: '5 hours ago', read: false },
  { id: 3, title: 'Welcome to UrbanSahay!', message: 'Your account has been created successfully. Explore services near you.', type: 'info', time: '1 day ago', read: true },
];

const iconMap = { warning: ShieldAlert, success: CheckCircle2, info: Info };
const colorMap = { warning: 'text-accent', success: 'text-primary', info: 'text-muted-foreground' };

const Notifications = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState(notifications);
  const { t } = useLanguage();

  useEffect(() => { if (!isLoading && !user) navigate('/auth'); }, [user, isLoading, navigate]);

  const markAllRead = () => setItems(items.map(i => ({ ...i, read: true })));

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 pt-24 pb-16 max-w-2xl">
        <BackToDashboard />
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{t('notifications.title')}</h1>
            <p className="text-muted-foreground text-sm">{t('notifications.subtitle')}</p>
          </div>
          <button onClick={markAllRead} className="text-sm text-primary hover:underline">{t('notifications.markAllRead')}</button>
        </div>
        <div className="space-y-3">
          {items.map(n => {
            const Icon = iconMap[n.type as keyof typeof iconMap];
            return (
              <div key={n.id} className={`bg-card rounded-xl border p-4 flex items-start gap-3 transition-colors ${n.read ? 'border-border' : 'border-primary/30 bg-primary/5'}`}>
                <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${colorMap[n.type as keyof typeof colorMap]}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-foreground">{n.title}</h3>
                    {!n.read && <div className="w-2 h-2 rounded-full bg-primary" />}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><Clock className="w-3 h-3" />{n.time}</p>
                </div>
              </div>
            );
          })}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Notifications;
