import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import BackToDashboard from '@/components/BackToDashboard';
import Footer from '@/components/Footer';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { User, Mail, Phone, BadgeCheck, Loader2, Edit2, Save } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useLanguage } from '@/hooks/useLanguage';

const Profile = () => {
  const { user, userRole, isLoading } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [kycStatus, setKycStatus] = useState<boolean>(false);
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) navigate('/auth');
  }, [user, isLoading, navigate]);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      try {
        if (userRole === 'service_provider') {
          const data = await api.getProviderProfile();
          if (data) { setProfile(data); setFullName(data.fullName); setPhone(data.phone); }
        } else {
          const data = await api.getProfile();
          if (data) { setProfile(data); setFullName(data.fullName); setPhone(data.phone || ''); }
        }
        const kyc = await api.getKyc();
        setKycStatus(kyc?.isFullyVerified || false);
      } catch {
        // profile not yet created — ignore
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user, userRole]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      if (userRole === 'service_provider') {
        await api.updateProviderProfile({ fullName, phone });
      } else {
        await api.updateProfile({ fullName, phone });
      }
      toast.success(t('profile.updated'));
      setProfile((p: any) => ({ ...p, fullName, phone }));
      setEditing(false);
    } catch {
      toast.error(t('profile.updateFailed'));
    }
    setSaving(false);
  };

  if (isLoading || loading) return (
    <div className="min-h-screen bg-background"><Header /><div className="flex items-center justify-center pt-32"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div></div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 pt-24 pb-16 max-w-2xl">
        <BackToDashboard />
        <h1 className="text-2xl font-bold text-foreground mb-6">{t('profile.title')}</h1>
        <div className="bg-card rounded-xl border border-border p-6 space-y-6">
          {/* Avatar & Name */}
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16 border-2 border-primary/30">
              <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                {fullName?.charAt(0)?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold text-foreground">{profile?.fullName}</h2>
                {kycStatus && <Badge className="bg-primary text-primary-foreground text-xs"><BadgeCheck className="w-3 h-3 mr-1" />{t('profile.verified')}</Badge>}
              </div>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              <p className="text-xs text-muted-foreground capitalize">{userRole === 'service_provider' ? `${t('profile.serviceProvider')} • ${profile?.serviceType}` : t('profile.user')}</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setEditing(!editing)}>
              <Edit2 className="w-4 h-4 mr-1" /> {editing ? t('profile.cancel') : t('profile.edit')}
            </Button>
          </div>

          {editing ? (
            <div className="space-y-4 pt-4 border-t border-border">
              <div>
                <Label>{t('profile.fullName')}</Label>
                <Input value={fullName} onChange={e => setFullName(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label>{t('profile.phone')}</Label>
                <Input value={phone} onChange={e => setPhone(e.target.value)} className="mt-1" />
              </div>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                {t('profile.saveChanges')}
              </Button>
            </div>
          ) : (
            <div className="space-y-3 pt-4 border-t border-border">
              <div className="flex items-center gap-3"><Mail className="w-4 h-4 text-muted-foreground" /><span className="text-sm">{user?.email}</span></div>
              <div className="flex items-center gap-3"><Phone className="w-4 h-4 text-muted-foreground" /><span className="text-sm">{profile?.phone || t('profile.notProvided')}</span></div>
              {userRole === 'service_provider' && profile && (
                <>
                  <div className="flex items-center gap-3"><span className="text-sm text-muted-foreground">{t('profile.city')}:</span><span className="text-sm">{profile.city}</span></div>
                  <div className="flex items-center gap-3"><span className="text-sm text-muted-foreground">{t('profile.experience')}:</span><span className="text-sm">{profile.experienceYears} years</span></div>
                  <div className="flex items-center gap-3"><span className="text-sm text-muted-foreground">{t('profile.rate')}:</span><span className="text-sm">{profile.hourlyRate || t('profile.notProvided')}</span></div>
                  <div className="flex items-center gap-3"><span className="text-sm text-muted-foreground">{t('profile.rating')}:</span><span className="text-sm">⭐ {profile.rating}/5 ({profile.totalReviews} reviews)</span></div>
                </>
              )}
            </div>
          )}

          {!kycStatus && (
            <div className="bg-accent/10 border border-accent/30 rounded-lg p-3 cursor-pointer hover:bg-accent/15 transition-colors" onClick={() => navigate('/kyc-verification')}>
              <p className="text-sm font-medium text-foreground">🔒 {t('profile.completeKyc')}</p>
              <p className="text-xs text-muted-foreground">{t('profile.completeKycDesc')}</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Profile;
